import express from 'express';

import {
    createReport,
    getReports,
    getReportById,
    updateReportStatus,
    deleteReport
} from '../controllers/reportController.js';

import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All report routes require authentication
router.use(authMiddleware);

// Create a report
router.post('/', createReport);

// Retrieve all reports in the user's municipality
router.get('/', getReports);

// Retrieve one report
router.get('/:id', getReportById);

// Update report status (admin only)
router.patch('/:id/status', updateReportStatus);

// Delete report (admin only)
router.delete('/:id', deleteReport);

export default router;