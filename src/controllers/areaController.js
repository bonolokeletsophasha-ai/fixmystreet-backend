
import supabase from '../config/supabase.js';

export const getAreas = async (req, res) => {
    try {
        const { data: areas, error } = await supabase
            .from('areas')
            .select('id, province, municipality')
            .order('municipality', { ascending: true });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(200).json({
            success: true,
            areas
        });

    } catch (error) {
        console.error('Get areas error:', error);

        return res.status(500).json({
            success: false,
            message: 'Unable to retrieve municipalities.'
        });
    }
};
