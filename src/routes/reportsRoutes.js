import express from 'express';

import {
    createReport,
    getReports,
    getPublicReports,
    getReportById,
    updateReport,
    updateReportStatus,
    deleteReport
} from '../controllers/reportController.js';

import authMiddleware from '../middleware/authMiddleware.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route: visitors can explore reports without logging in
router.get('/public', getPublicReports);

// All remaining report routes require authentication
router.use(authMiddleware);

// Residents and admins can submit reports
router.post('/', upload.single('image'), createReport);

// Authenticated users can retrieve reports in their municipality
router.get('/', getReports);
router.get('/:id', getReportById);

// Admin-only actions
router.patch('/:id', adminMiddleware, updateReport);
router.patch('/:id/status', adminMiddleware, updateReportStatus);
router.delete('/:id', adminMiddleware, deleteReport);

export default router;