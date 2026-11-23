
export const getCategories = async (req, res) => {
    try {
        const { data: categories, error } = await req.supabase
            .from('categories')
            .select('id, name')
            .order('name', { ascending: true });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve report categories.'
        });
    }
};
