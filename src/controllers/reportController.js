// CREATE A NEW REPORT
export const createReport = async (req, res) => {
    try {
        const {
            title,
            description,
            category_id,
            suburb,
            location,
            priority
        } = req.body;

        // Validate required fields
        if (!title || !description || !category_id) {
            return res.status(400).json({
                success: false,
                message: 'Title, description and category are required.'
            });
        }

        // Ensure the user has an assigned municipality
        if (!req.profile.area_id) {
            return res.status(400).json({
                success: false,
                message: 'Your account does not have an assigned municipality.'
            });
        }

        // Verify that the selected category exists
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

        // Create report using the authenticated user's details
        const { data: report, error } = await req.supabase
            .from('reports')
            .insert({
                title,
                description,
                category_id: category.id,
                area_id: req.profile.area_id,
                suburb: suburb || req.profile.suburb || null,
                location: location || null,
                priority: priority || 'Medium',
                status: 'Pending',
                created_by: req.authUser.id
            })
            .select()
            .single();

        if (error) {
            console.error('Create report error:', error);

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

        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while creating the report.'
        });
    }
};


// GET ALL REPORTS IN THE USER'S MUNICIPALITY
export const getReports = async (req, res) => {
    try {
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

        // Filter by category
        if (category_id) {
            query = query.eq('category_id', category_id);
        }

        // Filter by suburb
        if (suburb) {
            query = query.ilike('suburb', `%${suburb}%`);
        }

        // Filter by status
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