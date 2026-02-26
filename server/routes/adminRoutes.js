import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { createStudent } from '../controllers/adminController.js';

const router = express.Router();

router.post('/create-student', protect, adminOnly, createStudent);

export default router;