import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { createStudent,bulkAddStudents } from '../controllers/adminController.js';

const router = express.Router();

router.post('/create-student', protect, adminOnly, createStudent);
router.post('/students/bulk', bulkAddStudents);

export default router;