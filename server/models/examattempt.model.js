// models/examAttempt.model.js
import mongoose from 'mongoose';

const examAttemptSchema = new mongoose.Schema({
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam ID is required']
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student ID is required']
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userAnswer: {
      type: Number,
      required: true,
      validate: {
        validator: function(value) {
          return value === -1 || (value >= 0 && value <= 3);
        },
        message: 'Answer must be -1 (skipped) or between 0-3'
      }
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    marksObtained: {
      type: Number,
      default: 0
    }
  }],
  score: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  totalMarks: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    required: true,
    uppercase: true,
    enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'F']
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
    required: true
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one attempt per exam per student
examAttemptSchema.index({ examId: 1, studentId: 1 }, { unique: true });

// Pre-save middleware to calculate grade if not provided
examAttemptSchema.pre('save', function() {
  if (!this.grade && this.percentage !== undefined) {
    const percentage = this.percentage;
    if (percentage >= 90) this.grade = 'A+';
    else if (percentage >= 80) this.grade = 'A';
    else if (percentage >= 70) this.grade = 'B+';
    else if (percentage >= 60) this.grade = 'B';
    else if (percentage >= 50) this.grade = 'C';
    else if (percentage >= 40) this.grade = 'D';
    else this.grade = 'F';
  }
  
});

const ExamAttempt = mongoose.model('ExamAttempt', examAttemptSchema);
export default ExamAttempt;