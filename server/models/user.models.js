import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type:     String,
    required: function () { return this.role === 'student'; },
    trim:     true,
  },

  studentId: {
    type: Number,
    // ── NO unique: true here ─────────────────────────────────────────────────
    // A global unique index means IT:101 and CS:101 would conflict.
    // Uniqueness is enforced per-department via the compound index below:
    //   { studentId: 1, department: 1 }  with sparse: true
    // Admins and superadmins have no studentId (undefined), which sparse ignores.
  },

  department: {
    type:     String,
    enum:     ['IT', 'CS', 'CE', 'ECE', null],
    required: function () { return this.role !== 'superadmin'; },
    default:  null,
  },

  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true,
  },

  password:  { type: String, required: true },

  role: {
    type:     String,
    enum:     ['superadmin', 'admin', 'student'],
    required: true,
  },

  status: {
    type:    String,
    enum:    ['active', 'inactive'],
    default: 'active',
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
  },

}, { timestamps: true });

// ─── COMPOUND INDEX: studentId unique per department ─────────────────────────
// This replaces the old global unique index on studentId alone.
// sparse: true means documents without studentId (admins) are excluded.
userSchema.index({ studentId: 1, department: 1 }, { unique: true, sparse: true });

// ─── AUTO-ASSIGN studentId BEFORE SAVE ───────────────────────────────────────
// This is the authoritative place to assign studentId — doing it in the
// controller is fine for single creates, but having it here as a safety net
// means bulk insertMany and any future code paths are also covered.
//
// The hook only fires on document .save() calls (not insertMany).
// For insertMany we assign the ID in the controller before calling insertMany.
userSchema.pre('save', async function () {
  // ── Auto-assign studentId for new students that don't have one yet ──────
  if (this.role === 'student' && this.isNew && (this.studentId == null)) {
    try {
      const User = mongoose.model('User');
      const last = await User.findOne(
        { role: 'student', department: this.department, studentId: { $ne: null, $exists: true } },
        { studentId: 1 },
        { sort: { studentId: -1 } }   // get the highest existing ID
      ).lean();
      this.studentId = last ? last.studentId + 1 : 101;
    } catch (err) {
      return err;
    }
  }

  // ── Hash password if it was modified ────────────────────────────────────
  if (!this.isModified('password')) return err;
  this.password = await bcrypt.hash(this.password, 12);
 
});

// ─── COMPARE PASSWORD (for login) ─────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;