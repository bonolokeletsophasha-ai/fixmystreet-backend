
import express from 'express';

import { getCategories } from '../controllers/categoryController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();


router.use(authMiddleware);

router.get('/', getCategories);

export default router;
