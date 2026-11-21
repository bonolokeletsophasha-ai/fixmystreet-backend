import supabase from '../config/supabase.js';

// REGISTER USER
export const registerUser = async (req, res) => {
    try {
        const { full_name, email, password, area_id, suburb } = req.body;

        if (!full_name || !email || !password || !area_id) {
            return res.status(400).json({
                success: false,
                message: 'Full name, email, password and municipality are required.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters.'
            });
        }

        // Confirm that the selected municipality exists
        const { data: area, error: areaError } = await supabase
            .from('areas')
            .select('id, province, municipality')
            .eq('id', area_id)
            .single();

        if (areaError || !area) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid municipality.'
            });
        }

        // Register through Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name,
                    area_id: area.id,
                    suburb: suburb || null
                }
            }
        });

        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        return res.status(201).json({
            success: true,
            message: data.session
                ? 'Registration successful.'
                : 'Registration successful. Please verify your email.',
            user: data.user,
            session: data.session
        });

    } catch (error) {
        console.error('Registration error:', error);

        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred during registration.'
        });
    }
};


// LOGIN USER
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Create a Supabase client scoped to this user's access token
        const { createClient } = await import('@supabase/supabase-js');

        const userSupabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: {
                        Authorization: `Bearer ${data.session.access_token}`
                    }
                },
                auth: {
                    persistSession: false,
                    autoRefreshToken: false
                }
            }
        );

        // Retrieve the user's database profile
        const { data: profile, error: profileError } = await userSupabase
            .from('users')
            .select('id, full_name, email, role, area_id, suburb')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile) {
            return res.status(403).json({
                success: false,
                message: 'User profile not found. Please contact an administrator.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            user: profile,
            session: data.session
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred during login.'
        });
    }
};