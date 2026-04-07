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
  getAdminResults,
  getExamResults,
  getStudentResultsByAdmin,
  exportExamResults,
  getExamAttendees,        // Add this
  exportExamAttendees,
  resetExamAttempt
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
// Results management routes
router.get('/results', getAdminResults);
router.get('/results/exam/:examId', getExamResults);
router.get('/results/student/:studentId', getStudentResultsByAdmin);
router.get('/results/export/:examId', exportExamResults);
// NEW: Exam attendees routes
router.get('/exams/:examId/attendees', getExamAttendees);
router.get('/exams/:examId/attendees/export', exportExamAttendees);
// Inside your admin-protected router
router.delete('/exams/:examId/attempts/:studentId/reschedule', resetExamAttempt);
// ── Exam Attempts (admin view + reschedule) ───────────────────────────────────
// IMPORTANT: /exams/:id/attempts must come AFTER /exams/:id
// GET    /api/admin/exams/:id/attempts                              — view all student attempts
// DELETE /api/admin/exams/:examId/attempts/:studentId/reschedule   — reset student attempt
router.get   ('/exams/:id/attempts',                           getExamAttempts);
router.delete('/exams/:examId/attempts/:studentId/reschedule', rescheduleAttempt);

export default router;