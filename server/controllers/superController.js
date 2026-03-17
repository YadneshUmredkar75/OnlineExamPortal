// controllers/superAdminController.js
import { body, param, validationResult } from 'express-validator';
import User from '../models/user.models.js';

// ─── HELPER: send first validation error as a clean message ──────────────────
const validate = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return the first error message so the frontend axios interceptor
    // can surface it directly in the toast
    res.status(400).json({ message: errors.array()[0].msg });
    return false;
  }
  return true;
};

// ─── GET ALL ADMINS ───────────────────────────────────────────────────────────
// GET /api/superadmin/admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })
      .select('-password')
      .lean();                           // plain JS objects — faster than Mongoose docs

    const shaped = admins.map((a) => ({
      _id:        a._id,
      // Frontend shows email username if no name stored
      name:       a.email,
      email:      a.email,
      department: a.department || '',
      students:   a.students   || 0,
      exams:      a.exams      || 0,
      status:     a.status     || 'active',
      lastActive: a.lastActive || 'N/A',
      joinDate:   a.createdAt
        ? new Date(a.createdAt).toISOString().split('T')[0]
        : '',
    }));

    res.status(200).json({ admins: shaped });
  } catch (error) {
    console.error('getAllAdmins:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ─── CREATE ADMIN ─────────────────────────────────────────────────────────────
// POST /api/superadmin/create-admin
// Body: { department, email, password }
export const createAdmin = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('department')
    .notEmpty()
    .withMessage('Department is required')
    .isIn(['IT', 'CS', 'CE', 'ECE'])
    .withMessage(`Department must be one of: IT, CS, CE, ECE`),

  async (req, res) => {
    if (!validate(req, res)) return;

    const { department, email, password } = req.body;

    try {
      // Prevent duplicate email
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists' });
      }

      // Enforce one admin per department — core business rule
      const deptAdmin = await User.findOne({ role: 'admin', department });
      if (deptAdmin) {
        return res.status(400).json({
          message: `An admin for the ${department} department already exists (${deptAdmin.email})`,
        });
      }

      const user = new User({
        email:      email.toLowerCase().trim(),
        password,                          // hashed by pre-save hook in User model
        department,
        role:       'admin',
        status:     'active',
        createdBy:  req.user._id,          // set by protect middleware
      });

      await user.save();

      // Return the shaped object the frontend expects
      res.status(201).json({
        message: 'Admin created successfully',
        admin: {
          _id:        user._id,
          name:       user.email,
          email:      user.email,
          department: user.department,
          status:     user.status,
          students:   0,
          exams:      0,
          lastActive: 'Just now',
          joinDate:   new Date().toISOString().split('T')[0],
        },
        // Also expose as top-level "user" so Home.jsx can read department on login
        user: {
          _id:        user._id,
          email:      user.email,
          department: user.department,
          role:       user.role,
        },
      });
    } catch (error) {
      console.error('createAdmin:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
];

// ─── UPDATE ADMIN ─────────────────────────────────────────────────────────────
// PUT /api/superadmin/admins/:id
// Body: { department?, email?, password? }
export const updateAdmin = [
  param('id')
    .isMongoId()
    .withMessage('Invalid admin ID'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address'),

  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('department')
    .optional()
    .isIn(['IT', 'CS', 'CE', 'ECE'])
    .withMessage(`Department must be one of: IT, CS, CE, ECE`),

  async (req, res) => {
    if (!validate(req, res)) return;

    const { id } = req.params;
    const { department, email, password } = req.body;

    try {
      const admin = await User.findOne({ _id: id, role: 'admin' });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      // If email is changing, make sure it is not taken by another account
      if (email && email.toLowerCase().trim() !== admin.email) {
        const taken = await User.findOne({ email: email.toLowerCase().trim() });
        if (taken) {
          return res.status(400).json({ message: 'This email is already in use' });
        }
        admin.email = email.toLowerCase().trim();
      }

      // Only update fields that were actually sent
      if (department) admin.department = department;

      // Password re-hash is handled by the User model pre-save hook
      if (password)   admin.password   = password;

      await admin.save();

      res.status(200).json({
        message: 'Admin updated successfully',
        admin: {
          _id:        admin._id,
          name:       admin.email,
          email:      admin.email,
          department: admin.department,
          status:     admin.status,
          students:   admin.students   || 0,
          exams:      admin.exams      || 0,
          lastActive: admin.lastActive || 'N/A',
          joinDate:   admin.createdAt
            ? new Date(admin.createdAt).toISOString().split('T')[0]
            : '',
        },
      });
    } catch (error) {
      console.error('updateAdmin:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
];

// ─── DELETE ADMIN ─────────────────────────────────────────────────────────────
// DELETE /api/superadmin/admins/:id
export const deleteAdmin = [
  param('id')
    .isMongoId()
    .withMessage('Invalid admin ID'),

  async (req, res) => {
    if (!validate(req, res)) return;

    const { id } = req.params;

    try {
      // Superadmin cannot delete their own account
      if (id === req.user._id.toString()) {
        return res.status(403).json({ message: 'You cannot delete your own account' });
      }

      const admin = await User.findOneAndDelete({ _id: id, role: 'admin' });
      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      res.status(200).json({ message: 'Admin deleted successfully', id });
    } catch (error) {
      console.error('deleteAdmin:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
];

// ─── TOGGLE ADMIN STATUS ──────────────────────────────────────────────────────
// PATCH /api/superadmin/admins/:id/status
// Body: { status: 'active' | 'inactive' }
export const toggleAdminStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid admin ID'),

  body('status')
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),

  async (req, res) => {
    if (!validate(req, res)) return;

    const { id }     = req.params;
    const { status } = req.body;

    try {
      const admin = await User.findOneAndUpdate(
        { _id: id, role: 'admin' },
        { status },
        { new: true, select: '_id status' }   // only return what the frontend needs
      );

      if (!admin) {
        return res.status(404).json({ message: 'Admin not found' });
      }

      res.status(200).json({
        message: `Admin is now ${status}`,
        admin:   { _id: admin._id, status: admin.status },
      });
    } catch (error) {
      console.error('toggleAdminStatus:', error);
      res.status(500).json({ message: 'Server error' });
    }
  },
];