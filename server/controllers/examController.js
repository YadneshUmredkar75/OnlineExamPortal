// controllers/examController.js
import { body, validationResult } from 'express-validator';
import Exam from '../models/exam.model.js';
import User from '../models/user.models.js';

const firstError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: errors.array()[0].msg });
    return false;
  }
  return true;
};

const getAdminDept = async (req, res) => {
  const admin = await User.findById(req.user._id || req.user.id).select('department role').lean();
  if (!admin)            { res.status(401).json({ message: 'Admin not found' }); return null; }
  if (!admin.department) { res.status(400).json({ message: 'Admin has no department assigned' }); return null; }
  return admin.department;
};

// ── Shape helpers ──────────────────────────────────────────────────────────────
const computeStatus = (exam) => {
  const now = new Date();
  if (now < exam.startTime) return 'upcoming';
  if (now >= exam.startTime && now <= exam.endTime) return 'active';
  return 'completed';
};

const shapeExam = (exam) => ({
  _id:              exam._id,
  subject:          exam.subject,
  duration:         exam.duration,
  startTime:        exam.startTime,
  endTime:          exam.endTime,
  department:       exam.department,
  status:           computeStatus(exam),
  questionCount:    exam.questions?.length ?? 0,
  marksPerQuestion: exam.marksPerQuestion ?? 1,
  totalMarks:       (exam.questions?.length ?? 0) * (exam.marksPerQuestion ?? 1),
  createdAt:        exam.createdAt,
  createdBy:        exam.createdBy,
});

const shapeExamFull = (exam) => ({
  ...shapeExam(exam),
  questions: exam.questions.map((q) => ({
    _id:           q._id,
    text:          q.text,
    options:       q.options,
    correctAnswer: q.correctAnswer,
  })),
});

// =============================================================================
// GET /api/admin/exams
// =============================================================================
export const getExams = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;
    const exams = await Exam.find({ department: adminDept }).sort({ startTime: -1 }).lean();
    res.status(200).json({ exams: exams.map(shapeExam), total: exams.length });
  } catch (err) {
    console.error('getExams:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
// GET /api/admin/exams/:id
// =============================================================================
export const getExamById = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;
    const exam = await Exam.findOne({ _id: req.params.id, department: adminDept });
    if (!exam) return res.status(404).json({ message: 'Exam not found or not in your department' });
    res.status(200).json({ exam: shapeExamFull(exam) });
  } catch (err) {
    console.error('getExamById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
// POST /api/admin/exams   — marksPerQuestion set at creation, cannot be changed
// =============================================================================
export const createExam = [
  body('subject').trim().notEmpty().withMessage('Subject name is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive number of minutes'),
  body('startTime').notEmpty().isISO8601().withMessage('Valid start time is required'),
  body('endTime').notEmpty().isISO8601().withMessage('Valid end time is required'),
  body('marksPerQuestion')
    .isInt({ min: 1, max: 10 })
    .withMessage('Marks per question must be between 1 and 10'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),
  body('questions.*.text').if(body('questions').exists()).trim().notEmpty().withMessage('Each question must have text'),
  body('questions.*.options').if(body('questions').exists()).isArray({ min: 4, max: 4 }).withMessage('Each question must have exactly 4 options'),
  body('questions.*.correctAnswer').if(body('questions').exists()).isInt({ min: 0, max: 3 }).withMessage('Correct answer must be 0–3'),

  async (req, res) => {
    if (!firstError(req, res)) return;
    try {
      const adminDept = await getAdminDept(req, res);
      if (!adminDept) return;

      const { subject, duration, startTime, endTime, marksPerQuestion, questions = [] } = req.body;

      if (new Date(endTime) <= new Date(startTime))
        return res.status(400).json({ message: 'End time must be after start time' });

      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.text?.trim())
          return res.status(400).json({ message: `Question ${i+1}: text is required` });
        if (!Array.isArray(q.options) || q.options.length !== 4)
          return res.status(400).json({ message: `Question ${i+1}: must have exactly 4 options` });
        if (q.options.some(o => !String(o).trim()))
          return res.status(400).json({ message: `Question ${i+1}: all options must be non-empty` });
        if (q.correctAnswer == null || q.correctAnswer < 0 || q.correctAnswer > 3)
          return res.status(400).json({ message: `Question ${i+1}: correctAnswer must be 0–3` });
      }

      const exam = await Exam.create({
        subject:          subject.trim(),
        duration:         Number(duration),
        startTime:        new Date(startTime),
        endTime:          new Date(endTime),
        department:       adminDept,
        createdBy:        req.user._id || req.user.id,
        marksPerQuestion: Number(marksPerQuestion),  // ← saved once, never updated
        questions:        questions.map(q => ({
          text:          q.text.trim(),
          options:       q.options.map(o => String(o).trim()),
          correctAnswer: Number(q.correctAnswer),
        })),
      });

      res.status(201).json({
        message: `Exam "${exam.subject}" created successfully`,
        exam:    shapeExamFull(exam),
      });
    } catch (err) {
      console.error('createExam:', err);
      if (err.name === 'ValidationError') {
        const msg = Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({ message: msg });
      }
      res.status(500).json({ message: 'Server error' });
    }
  },
];

// =============================================================================
// PUT /api/admin/exams/:id   — marksPerQuestion NOT updatable after creation
// =============================================================================
export const updateExam = [
  body('subject').optional().trim().notEmpty().withMessage('Subject cannot be empty'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be positive'),
  body('startTime').optional().isISO8601().withMessage('Invalid start time'),
  body('endTime').optional().isISO8601().withMessage('Invalid end time'),
  body('questions').optional().isArray().withMessage('Questions must be an array'),

  async (req, res) => {
    if (!firstError(req, res)) return;
    try {
      const adminDept = await getAdminDept(req, res);
      if (!adminDept) return;

      const exam = await Exam.findOne({ _id: req.params.id, department: adminDept });
      if (!exam) return res.status(404).json({ message: 'Exam not found or not in your department' });

      const { subject, duration, startTime, endTime, questions } = req.body;

      if (subject)   exam.subject   = subject.trim();
      if (duration)  exam.duration  = Number(duration);
      if (startTime) exam.startTime = new Date(startTime);
      if (endTime)   exam.endTime   = new Date(endTime);

      // marksPerQuestion intentionally excluded — cannot be changed after creation

      if (exam.endTime <= exam.startTime)
        return res.status(400).json({ message: 'End time must be after start time' });

      if (Array.isArray(questions)) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          if (!q.text?.trim())
            return res.status(400).json({ message: `Question ${i+1}: text is required` });
          if (!Array.isArray(q.options) || q.options.length !== 4)
            return res.status(400).json({ message: `Question ${i+1}: must have exactly 4 options` });
          if (q.options.some(o => !String(o).trim()))
            return res.status(400).json({ message: `Question ${i+1}: all options must be non-empty` });
          if (q.correctAnswer == null || q.correctAnswer < 0 || q.correctAnswer > 3)
            return res.status(400).json({ message: `Question ${i+1}: correctAnswer must be 0–3` });
        }
        exam.questions = questions.map(q => ({
          text:          q.text.trim(),
          options:       q.options.map(o => String(o).trim()),
          correctAnswer: Number(q.correctAnswer),
        }));
      }

      await exam.save();
      res.status(200).json({ message: 'Exam updated successfully', exam: shapeExamFull(exam) });
    } catch (err) {
      console.error('updateExam:', err);
      if (err.name === 'ValidationError') {
        const msg = Object.values(err.errors).map(e => e.message).join(', ');
        return res.status(400).json({ message: msg });
      }
      res.status(500).json({ message: 'Server error' });
    }
  },
];

// =============================================================================
// DELETE /api/admin/exams/:id
// =============================================================================
export const deleteExam = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;
    const exam = await Exam.findOneAndDelete({ _id: req.params.id, department: adminDept });
    if (!exam) return res.status(404).json({ message: 'Exam not found or not in your department' });
    res.status(200).json({ message: `Exam "${exam.subject}" deleted successfully`, _id: exam._id });
  } catch (err) {
    console.error('deleteExam:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
// GET /api/student/exams
// =============================================================================
export const getStudentExams = async (req, res) => {
  try {
    const student = await User.findById(req.user._id || req.user.id).select('department role').lean();
    if (!student || student.role !== 'student')
      return res.status(403).json({ message: 'Access denied' });

    const exams = await Exam.find({ department: student.department }).sort({ startTime: -1 }).lean();
    res.status(200).json({ exams: exams.map(shapeExam), total: exams.length });
  } catch (err) {
    console.error('getStudentExams:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// =============================================================================
// GET /api/student/exams/:id  — correctAnswer stripped
// =============================================================================
export const getStudentExamById = async (req, res) => {
  try {
    const student = await User.findById(req.user._id || req.user.id).select('department role').lean();
    if (!student || student.role !== 'student')
      return res.status(403).json({ message: 'Access denied' });

    const exam = await Exam.findOne({ _id: req.params.id, department: student.department });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const now = new Date();
    if (now < exam.startTime) return res.status(403).json({ message: 'This exam has not started yet' });
    if (now > exam.endTime)   return res.status(403).json({ message: 'This exam has already ended' });

    res.status(200).json({
      exam: {
        _id:              exam._id,
        subject:          exam.subject,
        duration:         exam.duration,
        startTime:        exam.startTime,
        endTime:          exam.endTime,
        marksPerQuestion: exam.marksPerQuestion,
        totalMarks:       exam.questions.length * exam.marksPerQuestion,
        questions:        exam.questions.map(q => ({
          _id:     q._id,
          text:    q.text,
          options: q.options,
          // correctAnswer intentionally omitted
        })),
      },
    });
  } catch (err) {
    console.error('getStudentExamById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};