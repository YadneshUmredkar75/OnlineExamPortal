// index.js (main server file)
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superRoutes.js'
import adminRoutes from './routes/adminRoutes.js';
import studentRoutes from './routes/studentRoutes.js'
import studentExamRoutes from './routes/examRoutes.js'
import examAttemptroutes from './routes/examattemptroutes.js'
dotenv.config();
const app = express();
// ✅ Allow frontend connection
app.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true,
  })
);


app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/student', studentExamRoutes);
app.use('/api', examAttemptroutes)

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));