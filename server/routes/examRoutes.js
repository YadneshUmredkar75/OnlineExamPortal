// routes/examRoutes.js
import express from 'express';
import { protect, studentOnly } from '../middleware/auth.js';
import { getStudentExams, getStudentExamById } from '../controllers/examController.js';

const router = express.Router();

router.use(protect, studentOnly);

router.get('/exams',     getStudentExams);
router.get('/exams/:id', getStudentExamById);

export default router;