// routes/adminRoutes.js
// Mount: app.use('/api/admin', adminRoutes)
import express from 'express';
import {
  getStudents,
  createStudent,
  bulkAddStudents,
  updateStudent,
  deleteStudent,
  changeStudentPassword,
} from '../controllers/adminController.js';
import {
  getExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} from '../controllers/examController.js';
import {
  getExamAttempts,
  rescheduleAttempt,
} from '../controllers/examattemptcontroller.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, adminOnly);

// ── Students ──────────────────────────────────────────────────────────────────
router.get   ('/students',              getStudents);
router.post  ('/create-student',        createStudent);
router.post  ('/students/bulk',         bulkAddStudents);
router.put   ('/students/:id',          updateStudent);
router.delete('/students/:id',          deleteStudent);
router.patch ('/students/:id/password', changeStudentPassword);

// ── Exams ─────────────────────────────────────────────────────────────────────
router.get   ('/exams',     getExams);
router.post  ('/exams',     createExam);
router.get   ('/exams/:id', getExamById);
router.put   ('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);

// ── Exam Attempts (admin view + reschedule) ───────────────────────────────────
// IMPORTANT: /exams/:id/attempts must come AFTER /exams/:id
// GET    /api/admin/exams/:id/attempts                              — view all student attempts
// DELETE /api/admin/exams/:examId/attempts/:studentId/reschedule   — reset student attempt
router.get   ('/exams/:id/attempts',                           getExamAttempts);
router.delete('/exams/:examId/attempts/:studentId/reschedule', rescheduleAttempt);

export default router;