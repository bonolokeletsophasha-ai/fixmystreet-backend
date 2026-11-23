
import express from 'express';

import {
    createReport,
    getReports,
    getReportById,
    updateReport,
    updateReportStatus,
    deleteReport
} from '../controllers/reportController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

// All report routes require authentication
router.use(authMiddleware);

// Residents and admins
router.post('/', createReport);
router.get('/', getReports);
router.get('/:id', getReportById);

// Admin-only actions
router.put('/:id', adminMiddleware, updateReport);
router.patch('/:id/status', adminMiddleware, updateReportStatus);
router.delete('/:id', adminMiddleware, deleteReport);

export default router;
