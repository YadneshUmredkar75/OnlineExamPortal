import { body, validationResult } from 'express-validator';
import multer from 'multer';
import XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import User from '../models/user.models.js';
// Create Student
export const createStudent = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('department').isIn(['IT', 'CSE', 'CE', 'ECE']).withMessage('Invalid department'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, department, email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: 'User already exists' });

      user = new User({
        fullName,
        department,
        email,
        password,
        role: 'student',
        createdBy: req.user._id, // Admin's ID
      });
      await user.save();

      // Return student ID (Mongo _id) and password (in production, send via secure channel)
      res.status(201).json({
        message: 'Student created',
        student: { id: user._id, fullName, email, department, password }, // Password in plain for demo
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
];


// controllers/adminController.js


// Multer config → memory storage (we parse in memory, no disk needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls)$/)) {
      return cb(new Error('Only .xlsx and .xls files allowed!'));
    }
    cb(null, true);
  },
});

// ────────────────────────────────────────────────
// Bulk Upload Students via Excel
// ────────────────────────────────────────────────
export const bulkAddStudents = [
  upload.single('excelFile'), // field name must match frontend formData.append('excelFile', file)

  // Optional: extra validation
  body('department').optional().isIn([
    'Computer Science','IT','Mechanical','Civil','Electronics','Electrical','Chemical','Biotechnology'
  ]),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No Excel file uploaded' });
      }

      // Parse Excel
      const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

      if (rawData.length < 2) {
        return res.status(400).json({ success: false, message: 'Excel file is empty or has no data rows' });
      }

      // Normalize headers (case-insensitive, remove spaces)
      const headers = rawData[0].map(h => 
        String(h || '').trim().toLowerCase().replace(/\s+/g, '')
      );

      const nameIdx  = headers.findIndex(h => ['name', 'fullname', 'studentname'].includes(h));
      const idIdx    = headers.findIndex(h => ['studentid', 'id', 'rollno', 'rollnumber'].includes(h));
      const emailIdx = headers.findIndex(h => h.includes('email'));
      const passIdx  = headers.findIndex(h => h.includes('password') || h.includes('pass'));
      const deptIdx  = headers.findIndex(h => ['department', 'dept', 'branch'].includes(h));

      if (nameIdx === -1 || idIdx === -1 || emailIdx === -1) {
        return res.status(400).json({
          success: false,
          message: 'Missing required columns: Name, StudentID/ID/RollNo, Email',
        });
      }

      const adminDepartment = req.user.department; // from JWT / protect middleware
      const createdBy = req.user._id;

      const studentsToAdd = [];
      const errors = [];

      for (let i = 1; i < rawData.length; i++) {
        const row = rawData[i];
        const name  = String(row[nameIdx]  || '').trim();
        const sid   = String(row[idIdx]    || '').trim().toUpperCase();
        const email = String(row[emailIdx] || '').trim().toLowerCase();
        const pass  = passIdx !== -1 ? String(row[passIdx] || '').trim() : '';
        let dept    = deptIdx !== -1 ? String(row[deptIdx] || '').trim() : '';

        if (!name || !sid || !email) continue; // skip invalid rows

        // Department fallback
        dept = dept || adminDepartment;

        // Basic validation
        if (!/^[A-Z0-9]{4,10}$/.test(sid)) {
          errors.push(`Row ${i+1}: Invalid Student ID format (${sid})`);
          continue;
        }

        if (!email.includes('@')) {
          errors.push(`Row ${i+1}: Invalid email (${email})`);
          continue;
        }

        // You can add more checks (department valid, password strength...)

        studentsToAdd.push({
          fullName: name,
          studentId: sid,
          email,
          password: pass || 'Student@123', // default password → CHANGE IN PROD!
          department: dept,
          createdBy,
        });
      }

      if (studentsToAdd.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid student records found in Excel',
          errors,
        });
      }

      // Hash passwords
      for (const s of studentsToAdd) {
        s.password = await bcrypt.hash(s.password, 12);
      }

      // Bulk insert with ordered: false → continues on error
      const result = await Student.insertMany(studentsToAdd, { ordered: false });

      res.status(201).json({
        success: true,
        message: `Successfully added ${result.length} student(s)`,
        insertedCount: result.length,
        failedCount: studentsToAdd.length - result.length,
        errors: errors.length > 0 ? errors : undefined,
      });

    } catch (err) {
      console.error('Bulk student upload error:', err);

      if (err.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Duplicate studentId or email found',
          error: err.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to process bulk upload',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
      });
    }
  },
];