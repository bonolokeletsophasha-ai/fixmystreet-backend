import { randomUUID } from 'crypto';
import { createClient } from '@supabase/supabase-js';

// GET PUBLIC REPORTS
export const getPublicReports = async (req, res) => {
    try {
        const publicSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );

        const { suburb } = req.query;

        let query = publicSupabase
            .from('reports')
            .select(`
                id,
                title,
                description,
                category_id,
                suburb,
                location,
                priority,
                status,
                image_url,
                created_at,
                categories (
                    id,
                    name
                )
            `)
            .order('created_at', { ascending: false });

        if (suburb) {
            query = query.ilike('suburb', `%${suburb}%`);
        }

        const { data: reports, error } = await query;

        if (error) {
            console.error('Public reports error:', error);

            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });

    } catch (error) {
        console.error('Public reports error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve public reports.'
        });
    }
};


// CREATE A NEW REPORT
export const createReport = async (req, res) => {
    let uploadedImagePath = null;

    try {
        const {
            title,
            description,
            category_id,
            suburb,
            location,
            priority
        } = req.body;

        if (!title || !description || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Title, description and category are required.'
            });
        }

        if (!req.profile.area_id) {
            return res.status(400).json({
                success: false,
                message: 'Your account does not have an assigned municipality.'
            });
        }

        const allowedPriorities = ['Low', 'Medium', 'High'];

        if (priority && !allowedPriorities.includes(priority)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid priority. Use Low, Medium or High.'
            });
        }

        // Validate category
        const { data: category, error: categoryError } =
            await req.supabase
                .from('categories')
                .select('id, name')
                .eq('id', category_id)
                .single();

        if (categoryError || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid report category.'
            });
        }

        // Upload image if one was provided
        let imageUrl = null;

        if (req.file) {
            const allowedMimeTypes = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'image/webp': 'webp'
            };

            const extension = allowedMimeTypes[req.file.mimetype];

            if (!extension) {
                return res.status(400).json({
                    success: false,
                    message: 'Only JPEG, PNG and WebP images are allowed.'
                });
            }

            const fileName = `${randomUUID()}.${extension}`;

            uploadedImagePath = `${req.authUser.id}/${fileName}`;

            const { error: uploadError } = await req.supabase
                .storage
                .from('report-images')
                .upload(uploadedImagePath, req.file.buffer, {
                    contentType: req.file.mimetype,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error('Image upload error:', uploadError);

                return res.status(400).json({
                    success: false,
                    message: `Image upload failed: ${uploadError.message}`
                });
            }

            const { data: publicUrlData } = req.supabase
                .storage
                .from('report-images')
                .getPublicUrl(uploadedImagePath);

            imageUrl = publicUrlData.publicUrl;
        }

        // Save report details and image URL
        const { data: report, error } = await req.supabase
            .from('reports')
            .insert({
                title: title.trim(),
                description: description.trim(),
                category_id: category.id,
                area_id: req.profile.area_id,
                suburb: suburb || req.profile.suburb || null,
                location: location || null,
                priority: priority || 'Medium',
                status: 'Pending',
                created_by: req.authUser.id,
                image_url: imageUrl
            })
            .select()
            .single();

        if (error) {
            console.error('Create report error:', error);

            // Remove uploaded image if report creation fails
            if (uploadedImagePath) {
                await req.supabase
                    .storage
                    .from('report-images')
                    .remove([uploadedImagePath]);
            }

            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Infrastructure report submitted successfully.',
            report
        });

    } catch (error) {
        console.error('Create report error:', error);

        // Clean up uploaded image if something goes wrong
        if (uploadedImagePath) {
            await req.supabase
                .storage
                .from('report-images')
                .remove([uploadedImagePath]);
        }

        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while creating the report.'
        });
    }
};


// GET ALL REPORTS IN THE USER'S MUNICIPALITY
export const getReports = async (req, res) => {
    try {
        if (!req.profile.area_id) {
            return res.status(400).json({
                success: false,
                message: 'Your account does not have an assigned municipality.'
            });
        }

        const { category_id, suburb, status } = req.query;

        let query = req.supabase
            .from('reports')
            .select(`
                *,
                categories (
                    id,
                    name
                )
            `)
            .eq('area_id', req.profile.area_id)
            .order('created_at', { ascending: false });

        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        if (suburb) {
            query = query.ilike('suburb', `%${suburb}%`);
        }

        if (status) {
            const allowedStatuses = [
                'Pending',
                'In Progress',
                'Resolved'
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report status.'
                });
            }

            query = query.eq('status', status);
        }

        const { data: reports, error } = await query;

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            count: reports.length,
            reports
        });

    } catch (error) {
        console.error('Get reports error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve reports.'
        });
    }
};


// GET ONE REPORT
export const getReportById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: report, error } = await req.supabase
            .from('reports')
            .select(`
                *,
                categories (
                    id,
                    name
                )
            `)
            .eq('id', id)
            .eq('area_id', req.profile.area_id)
            .single();

        if (error || !report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found in your municipality.'
            });
        }

        return res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Get report error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve the report.'
        });
    }
};


// EDIT REPORT DETAILS (ADMIN ONLY)
export const updateReport = async (req, res) => {
    try {
        if (req.profile.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can edit reports.'
            });
        }

        const { id } = req.params;

        const {
            title,
            description,
            category_id,
            suburb,
            location,
            priority
        } = req.body;

        const updates = {};

        if (title !== undefined) {
            if (typeof title !== 'string' || !title.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Report title cannot be empty.'
                });
            }

            updates.title = title.trim();
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || !description.trim()) {
                return res.status(400).json({
                    success: false,
                    message: 'Report description cannot be empty.'
                });
            }

            updates.description = description.trim();
        }

        if (category_id !== undefined) {
            const { data: category, error: categoryError } =
                await req.supabase
                    .from('categories')
                    .select('id')
                    .eq('id', category_id)
                    .single();

            if (categoryError || !category) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a valid report category.'
                });
            }

            updates.category_id = category.id;
        }

        if (suburb !== undefined) {
            updates.suburb = suburb;
        }

        if (location !== undefined) {
            updates.location = location;
        }

        if (priority !== undefined) {
            const allowedPriorities = ['Low', 'Medium', 'High'];

            if (!allowedPriorities.includes(priority)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid priority. Use Low, Medium or High.'
                });
            }

            updates.priority = priority;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one field to update.'
            });
        }

        const { data: report, error } = await req.supabase
            .from('reports')
            .update(updates)
            .eq('id', id)
            .eq('area_id', req.profile.area_id)
            .select()
            .single();

        if (error || !report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or could not be updated.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Report updated successfully.',
            report
        });

    } catch (error) {
        console.error('Update report error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to update report.'
        });
    }
};


// UPDATE REPORT STATUS (ADMIN ONLY)
export const updateReportStatus = async (req, res) => {
    try {
        if (req.profile.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can update report statuses.'
            });
        }

        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            'Pending',
            'In Progress',
            'Resolved'
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid report status.'
            });
        }

        const { data: report, error } = await req.supabase
            .from('reports')
            .update({ status })
            .eq('id', id)
            .eq('area_id', req.profile.area_id)
            .select()
            .single();

        if (error || !report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or could not be updated.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Report status updated successfully.',
            report
        });

    } catch (error) {
        console.error('Update status error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to update report status.'
        });
    }
};


// DELETE REPORT (ADMIN ONLY)
export const deleteReport = async (req, res) => {
    try {
        if (req.profile.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only administrators can delete reports.'
            });
        }

        const { id } = req.params;

        const { data: report, error } = await req.supabase
            .from('reports')
            .delete()
            .eq('id', id)
            .eq('area_id', req.profile.area_id)
            .select()
            .single();

        if (error || !report) {
            return res.status(404).json({
                success: false,
                message: 'Report not found or could not be deleted.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Report deleted successfully.'
        });

    } catch (error) {
        console.error('Delete report error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to delete report.'
        });
    }
};