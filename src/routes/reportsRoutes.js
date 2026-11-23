
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
<<<<<<< HEAD:src/routes/reportsRoutes.js
=======

// Retrieve all reports
>>>>>>> main:src/routes/reportRoutes.js
router.get('/', getReports);
router.get('/:id', getReportById);

<<<<<<< HEAD:src/routes/reportsRoutes.js
// Admin-only actions
router.put('/:id', adminMiddleware, updateReport);
router.patch('/:id/status', adminMiddleware, updateReportStatus);
router.delete('/:id', adminMiddleware, deleteReport);
=======
// Edit report details (admin only)
router.patch('/:id', updateReport);

// Update report status (admin only)
router.patch('/:id/status', updateReportStatus);
>>>>>>> main:src/routes/reportRoutes.js

export default router;
