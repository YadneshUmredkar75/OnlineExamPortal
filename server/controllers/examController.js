// controllers/examController.js
import { body, validationResult } from 'express-validator';
import Exam from '../models/exam.model.js';
import User from '../models/user.models.js';
import ExamAttempt from '../models/examattempt.model.js';

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
// controllers/examController.js (add this import at the top)


// =============================================================================
// POST /api/student/exams/:id/submit
// =============================================================================
// controllers/examController.js → Replace submitExam with this improved version

export const submitExam = async (req, res) => {
  try {
    const student = await User.findById(req.user._id || req.user.id)
      .select('department role _id')
      .lean();

    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const exam = await Exam.findOne({ 
      _id: req.params.id, 
      department: student.department 
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    const now = new Date();
    if (now < exam.startTime) return res.status(403).json({ message: 'Exam has not started yet' });
    if (now > exam.endTime) return res.status(403).json({ message: 'Exam has already ended' });

    let { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    if (answers.length !== exam.questions.length) {
      return res.status(400).json({ 
        message: `Expected ${exam.questions.length} answers, got ${answers.length}` 
      });
    }

    // Handle two possible input formats:
    // 1. Array of numbers: [2, 1, -1, ...]  ← what your old frontend sent
    // 2. Array of objects: [{questionId, userAnswer}, ...]  ← new correct format
    const formattedAnswers = answers.map((item, index) => {
      let userAnswer;

      if (typeof item === 'number') {
        // Old simple array format
        userAnswer = item;
      } else if (item && typeof item === 'object') {
        // New object format
        userAnswer = item.userAnswer ?? item.selectedOption ?? -1;
      } else {
        userAnswer = -1;
      }

      // Final validation
      if (userAnswer !== -1 && (userAnswer < 0 || userAnswer > 3)) {
        userAnswer = -1;
      }

      return {
        questionId: exam.questions[index]._id,
        userAnswer: userAnswer,
        isCorrect: false,
        marksObtained: 0
      };
    });

    // Now calculate score
    let score = 0;
    const results = formattedAnswers.map((ans, index) => {
      const question = exam.questions[index];
      const isCorrect = ans.userAnswer === question.correctAnswer;
      const marksObtained = isCorrect ? exam.marksPerQuestion : 0;

      if (isCorrect) score += exam.marksPerQuestion;

      return {
        ...ans,
        isCorrect,
        marksObtained
      };
    });

    const totalMarks = exam.questions.length * exam.marksPerQuestion;
    const percentage = parseFloat(((score / totalMarks) * 100).toFixed(2));

    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    // Save attempt
    let attempt = await ExamAttempt.findOne({
      examId: exam._id,
      studentId: student._id
    });

    if (attempt) {
      attempt.answers = results;
      attempt.score = score;
      attempt.totalMarks = totalMarks;
      attempt.percentage = percentage;
      attempt.grade = grade;
      attempt.status = 'completed';
      attempt.submittedAt = new Date();
      await attempt.save();
    } else {
      attempt = await ExamAttempt.create({
        examId: exam._id,
        studentId: student._id,
        answers: results,
        score,
        totalMarks,
        percentage,
        grade,
        status: 'completed',
        submittedAt: new Date(),
        startedAt: new Date()
      });
    }

    res.status(200).json({
      message: 'Exam submitted successfully',
      result: {
        score,
        totalMarks,
        percentage,
        grade,
        submittedAt: attempt.submittedAt
      }
    });

  } catch (err) {
    console.error('submitExam error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: Object.values(err.errors).map(e => e.message).join(', ') 
      });
    }
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
// controllers/examController.js
// =============================================================================
// GET /api/student/exams/:id/attempt-status
// =============================================================================
export const getAttemptStatus = async (req, res) => {
  try {
    const student = await User.findById(req.user._id || req.user.id).select('_id').lean();
    if (!student) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const attempt = await ExamAttempt.findOne({
      examId: req.params.id,
      studentId: student._id,
      status: 'completed'
    });

    if (!attempt) {
      return res.status(200).json({ attempted: false });
    }

    res.status(200).json({
      attempted: true,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      grade: attempt.grade,
      submittedAt: attempt.submittedAt
    });
  } catch (err) {
    console.error('getAttemptStatus:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// controllers/examController.js
// =============================================================================
// GET /api/student/results
// =============================================================================
// controllers/examController.js
// =============================================================================
// GET /api/student/results
// =============================================================================
export const getStudentResults = async (req, res) => {
  try {
    const student = await User.findById(req.user._id || req.user.id).select('_id department role').lean();
    if (!student || student.role !== 'student') {
      return res.status(403).json({ message: 'Access denied. Student only.' });
    }

    const results = await ExamAttempt.find({ 
      studentId: student._id, 
      status: 'completed' 
    })
    .populate('examId', 'subject department startTime endTime duration marksPerQuestion')
    .sort({ submittedAt: -1 })
    .lean();

    // Format the results for frontend
    const formattedResults = results.map(result => {
      // Calculate correct and wrong counts
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;
      
      if (result.answers && Array.isArray(result.answers)) {
        result.answers.forEach(answer => {
          if (answer.isCorrect) correctCount++;
          else if (answer.userAnswer === -1) skippedCount++;
          else if (answer.userAnswer !== undefined && answer.userAnswer !== -1) wrongCount++;
        });
      }

      return {
        _id: result._id,
        examId: result.examId._id,
        subject: result.examId?.subject || 'Unknown Subject',
        department: result.examId?.department,
        startTime: result.examId?.startTime,
        endTime: result.examId?.endTime,
        duration: result.examId?.duration,
        marksPerQuestion: result.examId?.marksPerQuestion || 1,
        score: result.score,
        totalMarks: result.totalMarks,
        percentage: result.percentage,
        grade: result.grade,
        correctCount: correctCount,
        wrongCount: wrongCount,
        skippedCount: skippedCount,
        submittedAt: result.submittedAt,
        answers: result.answers // Optional: include if you want to show detailed answers
      };
    });

    res.status(200).json({ 
      results: formattedResults, 
      total: formattedResults.length 
    });
  } catch (err) {
    console.error('getStudentResults:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
// controllers/examController.js

// controllers/examController.js

// =============================================================================
// GET /api/admin/results - Get all student results for admin's department
// =============================================================================
export const getAdminResults = async (req, res) => {
  try {
    // Get admin's department
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;

    // Get all exams in admin's department
    const exams = await Exam.find({ department: adminDept })
      .select('_id subject department')
      .lean();

    const examIds = exams.map(exam => exam._id);

    // Get all attempts for these exams and properly populate student data
    const attempts = await ExamAttempt.find({
      examId: { $in: examIds },
      status: 'completed'
    })
    .populate({
      path: 'examId',
      select: 'subject department duration marksPerQuestion startTime endTime'
    })
    .populate({
      path: 'studentId',
      select: 'fullName email rollNumber studentId department' // Use fullName instead of name
    })
    .sort({ submittedAt: -1 })
    .lean();

    // Format results with proper null checks
    const formattedResults = attempts.map(attempt => {
      // Calculate statistics
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;
      
      if (attempt.answers && Array.isArray(attempt.answers)) {
        attempt.answers.forEach(answer => {
          if (answer.isCorrect) correctCount++;
          else if (answer.userAnswer === -1) skippedCount++;
          else if (answer.userAnswer !== undefined && answer.userAnswer !== -1) wrongCount++;
        });
      }

      // Get student name from fullName field
      const studentName = attempt.studentId?.fullName || 'Unknown Student';
      // Get roll number from rollNumber field or generate from studentId
      const rollNumber = attempt.studentId?.rollNumber || 
                        (attempt.studentId?.studentId ? `${attempt.studentId?.department || ''}${attempt.studentId?.studentId}` : 'N/A');

      return {
        _id: attempt._id,
        exam: {
          _id: attempt.examId?._id || 'N/A',
          subject: attempt.examId?.subject || 'Unknown Subject',
          department: attempt.examId?.department || 'N/A',
          duration: attempt.examId?.duration || 0,
          marksPerQuestion: attempt.examId?.marksPerQuestion || 1,
          startTime: attempt.examId?.startTime,
          endTime: attempt.examId?.endTime
        },
        student: {
          _id: attempt.studentId?._id || 'N/A',
          name: studentName,
          fullName: studentName,
          email: attempt.studentId?.email || 'N/A',
          rollNumber: rollNumber,
          studentId: attempt.studentId?.studentId || 'N/A',
          department: attempt.studentId?.department || 'N/A'
        },
        score: attempt.score || 0,
        totalMarks: attempt.totalMarks || 0,
        percentage: attempt.percentage || 0,
        grade: attempt.grade || 'F',
        correctCount: correctCount,
        wrongCount: wrongCount,
        skippedCount: skippedCount,
        submittedAt: attempt.submittedAt,
        startedAt: attempt.startedAt
      };
    });

    // Calculate summary statistics
    const totalStudents = new Set(formattedResults.map(r => r.student._id)).size;
    const totalExams = new Set(formattedResults.map(r => r.exam._id)).size;
    const averageScore = formattedResults.length > 0
      ? Math.round(formattedResults.reduce((sum, r) => sum + r.percentage, 0) / formattedResults.length)
      : 0;
    const passCount = formattedResults.filter(r => r.percentage >= 40).length;
    const failCount = formattedResults.filter(r => r.percentage < 40).length;
    const highestScore = formattedResults.length > 0 
      ? Math.max(...formattedResults.map(r => r.percentage)) 
      : 0;
    const lowestScore = formattedResults.length > 0 
      ? Math.min(...formattedResults.map(r => r.percentage)) 
      : 0;

    res.status(200).json({
      success: true,
      summary: {
        totalResults: formattedResults.length,
        totalStudents,
        totalExams,
        averageScore,
        passCount,
        failCount,
        passRate: formattedResults.length > 0 ? Math.round((passCount / formattedResults.length) * 100) : 0,
        highestScore,
        lowestScore
      },
      results: formattedResults
    });
  } catch (err) {
    console.error('getAdminResults:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// =============================================================================
// GET /api/admin/results/exam/:examId - Get results for specific exam
// =============================================================================
export const getExamResults = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;

    const { examId } = req.params;

    // Verify exam belongs to admin's department
    const exam = await Exam.findOne({ _id: examId, department: adminDept });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or not in your department' });
    }

    // Get all attempts for this exam with proper population
    const attempts = await ExamAttempt.find({
      examId: examId,
      status: 'completed'
    })
    .populate({
      path: 'studentId',
      select: 'fullName email rollNumber studentId department'
    })
    .sort({ percentage: -1 })
    .lean();

    // Format results
    const formattedResults = attempts.map(attempt => {
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;
      
      if (attempt.answers && Array.isArray(attempt.answers)) {
        attempt.answers.forEach(answer => {
          if (answer.isCorrect) correctCount++;
          else if (answer.userAnswer === -1) skippedCount++;
          else if (answer.userAnswer !== undefined && answer.userAnswer !== -1) wrongCount++;
        });
      }

      const studentName = attempt.studentId?.fullName || 'Unknown Student';
      const rollNumber = attempt.studentId?.rollNumber || 
                        (attempt.studentId?.studentId ? `${attempt.studentId?.department || ''}${attempt.studentId?.studentId}` : 'N/A');

      return {
        _id: attempt._id,
        student: {
          _id: attempt.studentId?._id || 'N/A',
          name: studentName,
          fullName: studentName,
          email: attempt.studentId?.email || 'N/A',
          rollNumber: rollNumber,
          studentId: attempt.studentId?.studentId || 'N/A'
        },
        score: attempt.score || 0,
        totalMarks: attempt.totalMarks || 0,
        percentage: attempt.percentage || 0,
        grade: attempt.grade || 'F',
        correctCount: correctCount,
        wrongCount: wrongCount,
        skippedCount: skippedCount,
        submittedAt: attempt.submittedAt
      };
    });

    // Calculate exam statistics
    const totalStudents = formattedResults.length;
    const averageScore = totalStudents > 0
      ? Math.round(formattedResults.reduce((sum, r) => sum + r.percentage, 0) / totalStudents)
      : 0;
    const passCount = formattedResults.filter(r => r.percentage >= 40).length;
    const highestScore = totalStudents > 0 ? Math.max(...formattedResults.map(r => r.percentage)) : 0;
    const lowestScore = totalStudents > 0 ? Math.min(...formattedResults.map(r => r.percentage)) : 0;

    res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        subject: exam.subject,
        department: exam.department,
        duration: exam.duration,
        marksPerQuestion: exam.marksPerQuestion,
        totalQuestions: exam.questions.length,
        totalMarks: exam.questions.length * exam.marksPerQuestion,
        startTime: exam.startTime,
        endTime: exam.endTime
      },
      summary: {
        totalStudents,
        averageScore,
        passCount,
        failCount: totalStudents - passCount,
        passRate: totalStudents > 0 ? Math.round((passCount / totalStudents) * 100) : 0,
        highestScore,
        lowestScore
      },
      results: formattedResults
    });
  } catch (err) {
    console.error('getExamResults:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// =============================================================================
// GET /api/admin/results/student/:studentId - Get results for specific student
// =============================================================================
export const getStudentResultsByAdmin = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;

    const { studentId } = req.params;

    // Verify student exists and belongs to admin's department
    const student = await User.findOne({ 
      _id: studentId, 
      role: 'student',
      department: adminDept 
    }).select('fullName email rollNumber studentId department');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found or not in your department' });
    }

    // Get all attempts for this student
    const attempts = await ExamAttempt.find({
      studentId: studentId,
      status: 'completed'
    })
    .populate('examId', 'subject department duration marksPerQuestion startTime endTime')
    .sort({ submittedAt: -1 })
    .lean();

    // Format results
    const formattedResults = attempts.map(attempt => {
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;
      
      if (attempt.answers && Array.isArray(attempt.answers)) {
        attempt.answers.forEach(answer => {
          if (answer.isCorrect) correctCount++;
          else if (answer.userAnswer === -1) skippedCount++;
          else if (answer.userAnswer !== undefined && answer.userAnswer !== -1) wrongCount++;
        });
      }

      return {
        _id: attempt._id,
        exam: {
          _id: attempt.examId._id,
          subject: attempt.examId.subject,
          department: attempt.examId.department,
          duration: attempt.examId.duration,
          marksPerQuestion: attempt.examId.marksPerQuestion,
          startTime: attempt.examId.startTime,
          endTime: attempt.examId.endTime
        },
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        grade: attempt.grade,
        correctCount: correctCount,
        wrongCount: wrongCount,
        skippedCount: skippedCount,
        submittedAt: attempt.submittedAt
      };
    });

    // Calculate student statistics
    const totalExams = formattedResults.length;
    const averagePercentage = totalExams > 0
      ? Math.round(formattedResults.reduce((sum, r) => sum + r.percentage, 0) / totalExams)
      : 0;
    const bestScore = totalExams > 0 ? Math.max(...formattedResults.map(r => r.percentage)) : 0;
    const rollNumber = student.rollNumber || `${student.department}${student.studentId}`;

    res.status(200).json({
      success: true,
      student: {
        _id: student._id,
        name: student.fullName,
        fullName: student.fullName,
        email: student.email,
        rollNumber: rollNumber,
        studentId: student.studentId,
        department: student.department
      },
      summary: {
        totalExams,
        averagePercentage,
        bestScore,
        passedExams: formattedResults.filter(r => r.percentage >= 40).length,
        failedExams: formattedResults.filter(r => r.percentage < 40).length
      },
      results: formattedResults
    });
  } catch (err) {
    console.error('getStudentResultsByAdmin:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// =============================================================================
// GET /api/admin/results/export/:examId - Export results as CSV
// =============================================================================
export const exportExamResults = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;

    const { examId } = req.params;

    // Verify exam belongs to admin's department
    const exam = await Exam.findOne({ _id: examId, department: adminDept });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or not in your department' });
    }

    // Get all attempts for this exam
    const attempts = await ExamAttempt.find({
      examId: examId,
      status: 'completed'
    })
    .populate('studentId', 'name email rollNumber')
    .sort({ percentage: -1 })
    .lean();

    // Create CSV content
    const csvRows = [];
    
    // Add headers
    csvRows.push([
      'Roll Number',
      'Student Name',
      'Email',
      'Score',
      'Total Marks',
      'Percentage',
      'Grade',
      'Correct Answers',
      'Wrong Answers',
      'Skipped Questions',
      'Submitted At'
    ].join(','));

    // Add data rows
    for (const attempt of attempts) {
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;
      
      if (attempt.answers && Array.isArray(attempt.answers)) {
        attempt.answers.forEach(answer => {
          if (answer.isCorrect) correctCount++;
          else if (answer.userAnswer === -1) skippedCount++;
          else if (answer.userAnswer !== undefined && answer.userAnswer !== -1) wrongCount++;
        });
      }

      csvRows.push([
        `"${attempt.studentId.rollNumber || 'N/A'}"`,
        `"${attempt.studentId.name}"`,
        `"${attempt.studentId.email}"`,
        attempt.score,
        attempt.totalMarks,
        attempt.percentage,
        attempt.grade,
        correctCount,
        wrongCount,
        skippedCount,
        new Date(attempt.submittedAt).toLocaleString()
      ].join(','));
    }

    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=exam_${exam.subject}_results_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('exportExamResults:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
// controllers/examController.js


// =============================================================================
// GET /api/admin/exams/:examId/attendees/export - Export attendees list as CSV
// =============================================================================
export const exportExamAttendees = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;

    const { examId } = req.params;

    // Verify exam belongs to admin's department
    const exam = await Exam.findOne({ _id: examId, department: adminDept });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or not in your department' });
    }

    // Get all students in the department
    const allStudents = await User.find({ 
      role: 'student', 
      department: adminDept,
      status: 'active'
    }).select('fullName email rollNumber studentId department');

    // Get all attempts for this exam
    const attempts = await ExamAttempt.find({
      examId: examId,
      status: 'completed'
    }).select('studentId score percentage grade submittedAt');

    // Create a map of student IDs who attempted the exam
    const attemptMap = new Map();
    attempts.forEach(a => {
      attemptMap.set(a.studentId.toString(), a);
    });

    // Create CSV content
    const csvRows = [];
    
    // Add headers
    csvRows.push([
      'Roll Number',
      'Student Name',
      'Email',
      'Department',
      'Status',
      'Score',
      'Total Marks',
      'Percentage',
      'Grade',
      'Submitted At'
    ].join(','));

    // Add data rows for all students
    for (const student of allStudents) {
      const attempt = attemptMap.get(student._id.toString());
      const status = attempt ? 'Attended' : 'Not Attended';
      const score = attempt ? attempt.score : 0;
      const totalMarks = exam.questions.length * exam.marksPerQuestion;
      const percentage = attempt ? attempt.percentage : 0;
      const grade = attempt ? attempt.grade : 'N/A';
      const submittedAt = attempt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A';
      const rollNumber = student.rollNumber || `${student.department}${student.studentId}`;

      csvRows.push([
        `"${rollNumber}"`,
        `"${student.fullName}"`,
        `"${student.email}"`,
        `"${student.department}"`,
        status,
        score,
        totalMarks,
        percentage,
        grade,
        submittedAt
      ].join(','));
    }

    const csvContent = csvRows.join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=exam_${exam.subject}_attendees_${Date.now()}.csv`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('exportExamAttendees:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
// =============================================================================
// GET /api/admin/exams/:examId/attendees
// Get all students who attended + who did not attend a specific exam
// =============================================================================
export const getExamAttendees = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;

    const { examId } = req.params;

    if (!examId || examId === 'undefined' || examId === 'null') {
      return res.status(400).json({ message: 'Invalid exam ID' });
    }

    const exam = await Exam.findOne({ _id: examId, department: adminDept });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or not in your department' });
    }

    const allStudents = await User.find({ 
      role: 'student', 
      department: adminDept 
    }).select('fullName email rollNumber studentId department').lean();

    const attempts = await ExamAttempt.find({
      examId: examId,
      status: 'completed'
    }).select('studentId score totalMarks percentage grade submittedAt correctCount wrongCount skippedCount')
      .lean();

    const attemptMap = new Map();
    attempts.forEach(a => attemptMap.set(a.studentId.toString(), a));

    const attendedStudents = [];
    const notAttendedStudents = [];

    for (const student of allStudents) {
      const attempt = attemptMap.get(student._id.toString());
      const studentData = {
        _id: student._id,
        fullName: student.fullName || 'Unknown Student',
        email: student.email || 'N/A',
        rollNumber: student.rollNumber || `${student.department || 'CS'}${student.studentId || ''}`,
        studentId: student.studentId || 'N/A',
        department: student.department
      };

      if (attempt) {
        attendedStudents.push({
          ...studentData,
          status: 'attended',
          score: attempt.score || 0,
          totalMarks: attempt.totalMarks || (exam.questions?.length * (exam.marksPerQuestion || 1)),
          percentage: attempt.percentage || 0,
          grade: attempt.grade || 'F',
          correctCount: attempt.correctCount || 0,
          wrongCount: attempt.wrongCount || 0,
          skippedCount: attempt.skippedCount || 0,
          submittedAt: attempt.submittedAt
        });
      } else {
        notAttendedStudents.push({
          ...studentData,
          status: 'not_attended',
          score: 0,
          totalMarks: exam.questions?.length * (exam.marksPerQuestion || 1) || 0,
          percentage: 0,
          grade: 'N/A',
          correctCount: 0,
          wrongCount: 0,
          skippedCount: 0,
          submittedAt: null
        });
      }
    }

    const totalStudents = allStudents.length;
    const attendedCount = attendedStudents.length;
    const notAttendedCount = notAttendedStudents.length;
    const attendanceRate = totalStudents > 0 ? ((attendedCount / totalStudents) * 100).toFixed(2) : 0;
    const averageScore = attendedCount > 0 
      ? (attendedStudents.reduce((sum, s) => sum + s.percentage, 0) / attendedCount).toFixed(2) 
      : 0;
    const passCount = attendedStudents.filter(s => s.percentage >= 40).length;

    res.status(200).json({
      success: true,
      exam: {
        _id: exam._id,
        subject: exam.subject,
        department: exam.department,
        duration: exam.duration,
        totalQuestions: exam.questions?.length || 0,
        totalMarks: exam.questions?.length * (exam.marksPerQuestion || 1),
        startTime: exam.startTime,
        endTime: exam.endTime
      },
      summary: {
        totalStudents,
        attendedCount,
        notAttendedCount,
        attendanceRate: parseFloat(attendanceRate),
        averageScore: parseFloat(averageScore),
        passCount,
        passRate: attendedCount > 0 ? ((passCount / attendedCount) * 100).toFixed(2) : 0
      },
      attendedStudents: attendedStudents.sort((a, b) => b.percentage - a.percentage),
      notAttendedStudents
    });

  } catch (err) {
    console.error('getExamAttendees error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// =============================================================================
// DELETE /api/admin/exams/:examId/attempts/:studentId/reschedule
// Reset student's attempt so they can retake the exam
// =============================================================================
export const resetExamAttempt = async (req, res) => {
  try {
    const adminDept = await getAdminDept(req, res);
    if (!adminDept) return;

    const { examId, studentId } = req.params;

    const exam = await Exam.findOne({ _id: examId, department: adminDept });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or not in your department' });
    }

    const student = await User.findOne({ 
      _id: studentId, 
      role: 'student',
      department: adminDept 
    });

    if (!student) {
      return res.status(404).json({ message: 'Student not found or not in your department' });
    }

    const deletedAttempt = await ExamAttempt.findOneAndDelete({
      examId: examId,
      studentId: studentId
    });

    if (!deletedAttempt) {
      return res.status(404).json({ message: 'No attempt found for this student on this exam' });
    }

    res.status(200).json({
      success: true,
      message: `Exam attempt has been reset successfully for ${student.fullName || 'the student'}. They can now retake the exam.`,
      deletedAttemptId: deletedAttempt._id
    });

  } catch (err) {
    console.error('resetExamAttempt error:', err);
    res.status(500).json({ message: 'Server error while resetting attempt: ' + err.message });
  }
};