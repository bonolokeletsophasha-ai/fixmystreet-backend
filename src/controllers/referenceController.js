import supabase from '../config/supabase.js';

// GET ALL REPORT CATEGORIES
export const getCategories = async (req, res) => {
    try {
        const { data: categories, error } = await supabase
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
            count: categories.length,
            categories
        });

    } catch (error) {
        console.error('Get categories error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve categories.'
        });
    }
};


// GET ALL PROVINCES
export const getProvinces = async (req, res) => {
    try {
        const { data: areas, error } = await supabase
            .from('areas')
            .select('province')
            .order('province', { ascending: true });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        const provinces = [
            ...new Set(areas.map(area => area.province))
        ];

        return res.status(200).json({
            success: true,
            count: provinces.length,
            provinces
        });

    } catch (error) {
        console.error('Get provinces error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve provinces.'
        });
    }
};


// GET MUNICIPALITIES, OPTIONALLY FILTERED BY PROVINCE
export const getMunicipalities = async (req, res) => {
    try {
        const { province } = req.query;

        let query = supabase
            .from('areas')
            .select('id, province, municipality')
            .order('municipality', { ascending: true });

        if (province) {
            query = query.eq('province', province);
        }

        const { data: municipalities, error } = await query;

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            count: municipalities.length,
            municipalities
        });

    } catch (error) {
        console.error('Get municipalities error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve municipalities.'
        });
    }
};