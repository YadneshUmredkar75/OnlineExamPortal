import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: function() { return this.role === 'student'; } },
  department: {
    type: String,
    enum: ['IT', 'CSE', 'CE', 'ECE', null],
    required: function() { return this.role !== 'superadmin'; },
    default: null,
  },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['superadmin', 'admin', 'student'], required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // For tracking who created admins/students
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
 
});

// Compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;