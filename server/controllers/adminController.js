import { body, validationResult } from 'express-validator';
import User from '../models/user.models.js';
// Create Student
export const createStudent = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('department').isIn(['IT', 'CSE', 'CE', 'ECE']).withMessage('Invalid department'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, department, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      user = new User({
        fullName,
        department,
        email,
        password,
        role: 'student',
        createdBy: req.user._id, // Admin's ID
      });
      await user.save();

      // Return student ID (Mongo _id) and password (in production, send via secure channel)
      res.status(201).json({
        message: 'Student created',
        student: { id: user._id, fullName, email, department, password }, // Password in plain for demo
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];