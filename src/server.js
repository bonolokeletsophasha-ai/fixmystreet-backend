import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import areaRoutes from './routes/areaRoutes.js';
import supabase from './config/supabase.js';
import authRoutes from './routes/authRoutes.js';
import reportRoutes from './routes/reportsRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import referenceRoutes from './routes/referenceRoutes.js';

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the FixMyStreet API!',
        version: '1.0.0'
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'FixMyStreet backend is running.',
        supabaseConfigured: Boolean(supabase)
    });
});

// Area routes
app.use('/api/areas', areaRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Infrastructure report routes
app.use('/api/reports', reportRoutes);

// Category routes
app.use('/api/categories', categoryRoutes);

// Province and municipality reference routes
app.use('/api', referenceRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`FixMyStreet server running on port ${PORT}`);
});