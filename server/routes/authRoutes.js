// routes/authRoutes.js
import express from 'express';
import {
  registerSuperAdmin,
  loginAdmin,
  loginStudent,
  loginGeneral   // optional
} from '../controllers/authController.js';

const router = express.Router();

// Super Admin (only once)
router.post('/register-superadmin', registerSuperAdmin);

// Role-specific logins (recommended for production apps)
router.post('/admin/login', loginAdmin);
router.post('/student/login', loginStudent);

// Optional: General login endpoint (useful during development)
router.post('/login', loginGeneral);

export default router;