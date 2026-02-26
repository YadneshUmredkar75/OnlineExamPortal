// controllers/superAdminController.js
import { body, validationResult } from 'express-validator';
import User from '../models/user.models.js';

// Create Admin
export const createAdmin = [
  body('department').isIn(['IT', 'CSE', 'CE', 'ECE']).withMessage('Invalid department'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { department, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      user = new User({
        department,
        email,
        password,
        role: 'admin',
        createdBy: req.user._id, // Super admin's ID
      });
      await user.save();

      // Return admin ID (Mongo _id) and password (in production, send via secure channel, but as per query)
      res.status(201).json({
        message: 'Admin created',
        admin: { id: user._id, email: user.email, department: user.department, password }, // Password in plain for demo
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];