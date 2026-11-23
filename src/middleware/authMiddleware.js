import { createClient } from '@supabase/supabase-js';

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please log in.'
            });
        }

        const token = authHeader.split(' ')[1];

        // Create a Supabase client using the user's token
        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                },
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );

        // Verify the access token
        const { data, error } = await userSupabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired authentication token.'
            });
        }

        // Retrieve the user's profile
        const { data: profile, error: profileError } = await userSupabase
            .from('users')
            .select('id, full_name, email, role, area_id, suburb')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile) {
            return res.status(403).json({
                success: false,
                message: 'User profile could not be found.'
            });
        }

        // Attach authenticated information to the request
        req.authUser = data.user;
        req.profile = profile;
        req.supabase = userSupabase;

        next();

    } catch (error) {
        console.error('Authentication error:', error);

        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

export default authMiddleware;