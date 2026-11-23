import express from 'express';

import {
    getCategories,
    getProvinces,
    getMunicipalities
} from '../controllers/referenceController.js';

const router = express.Router();

// GET ALL CATEGORIES
router.get('/categories', getCategories);

// GET ALL PROVINCES
router.get('/provinces', getProvinces);

// GET ALL MUNICIPALITIES
router.get('/municipalities', getMunicipalities);

export default router;