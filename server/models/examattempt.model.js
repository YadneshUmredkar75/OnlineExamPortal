// models/examAttempt.model.js
// Tracks each student's exam submission — one attempt per student per exam.
// Admin can reset (reschedule) by deleting the attempt.

import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId:    { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: Number, min: 0, max: 3, default: null }, // null = unanswered
}, { _id: false });

const examAttemptSchema = new mongoose.Schema({

  exam: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'Exam',
    required: true,
  },

  student: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },

  department: {
    type:     String,
    enum:     ['IT', 'CS', 'CE', 'ECE'],
    required: true,
  },

  // Snapshot of answers at submission time
  answers: {
    type:    [answerSchema],
    default: [],
  },

  // Scoring (computed at submission)
  score:           { type: Number, default: 0 },
  totalMarks:      { type: Number, default: 0 },
  marksPerQuestion:{ type: Number, default: 1 },
  correctCount:    { type: Number, default: 0 },
  wrongCount:      { type: Number, default: 0 },
  unansweredCount: { type: Number, default: 0 },
  percentage:      { type: Number, default: 0 },

  // Status
  status: {
    type:    String,
    enum:    ['submitted', 'terminated', 'rescheduled'],
    default: 'submitted',
  },

  // If terminated — reason
  terminationReason: { type: String, default: null },

  // Admin reschedule log
  rescheduledAt: { type: Date, default: null },
  rescheduledBy: {
    type:    mongoose.Schema.Types.ObjectId,
    ref:     'User',
    default: null,
  },
  rescheduledNote: { type: String, default: null },

  submittedAt: { type: Date, default: Date.now },

}, { timestamps: true });

// ── One attempt per student per exam ──────────────────────────────────────────
// If admin reschedules, the attempt document is DELETED so a fresh attempt is allowed.
examAttemptSchema.index({ exam: 1, student: 1 }, { unique: true });
examAttemptSchema.index({ student: 1, submittedAt: -1 });
examAttemptSchema.index({ exam: 1, department: 1 });

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);
export default ExamAttempt;