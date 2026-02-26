// controllers/authController.js
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/user.models.js';  // ← make sure path & export match!

// Helper: generate JWT
const generateToken = (user) => {
  const payload = { 
    id: user._id.toString(),   // ← FIXED: always use _id
    role: user.role 
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// ────────────────────────────────────────────────
// Register Super Admin (only once)
// ────────────────────────────────────────────────
export const registerSuperAdmin = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email format'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),
  
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Optional: prevent multiple superadmins (uncomment if desired)
      // const existingSuper = await User.findOne({ role: 'superadmin' });
      // if (existingSuper) {
      //   return res.status(403).json({ success: false, message: 'Superadmin account already exists' });
      // }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }

      const user = new User({
        email,
        password,
        role: 'superadmin',
        // department is not set → schema should allow it for superadmin
      });

      await user.save();

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'Superadmin created successfully',
        token,
        user: {
          id: user._id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('SUPERADMIN REGISTER ERROR:', {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'), // first 3 lines only
        code: error.code,
      });

      return res.status(500).json({
        success: false,
        message: 'Failed to create superadmin',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
];

// ────────────────────────────────────────────────
// Reusable login logic
// ────────────────────────────────────────────────
const loginUser = async (email, password, allowedRoles, res) => {
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: `This login portal is only for ${allowedRoles.join(' or ')}.`
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName || null,
        department: user.department || null
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error.message, error.stack?.split('\n')[0]);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ────────────────────────────────────────────────
// Admin Login
// ────────────────────────────────────────────────
export const loginAdmin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    await loginUser(req.body.email, req.body.password, ['admin'], res);
  }
];

// ────────────────────────────────────────────────
// Student Login
// ────────────────────────────────────────────────
export const loginStudent = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    await loginUser(req.body.email, req.body.password, ['student'], res);
  }
];

// ────────────────────────────────────────────────
// General Login (optional – for testing or superadmin)
// ────────────────────────────────────────────────
export const loginGeneral = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    await loginUser(req.body.email, req.body.password, ['superadmin', 'admin', 'student'], res);
  }
];