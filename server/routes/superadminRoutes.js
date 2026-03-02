// routes/superAdminRoutes.js
import express from 'express';
import { protect, superAdminOnly } from '../middleware/auth.js';
import { createAdmin } from '../controllers/superadminController.js';

const router = express.Router();

router.post('/create-admin', protect, superAdminOnly, createAdmin);

export default router;