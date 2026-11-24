import { createClient } from '@supabase/supabase-js';
import supabase from '../config/supabase.js';

// Supabase admin client
const adminSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    }
);


// REGISTER USER
export const registerUser = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            area_id,
            suburb,
            role,
            admin_invitation_code
        } = req.body;

        // Validate required fields
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

        // Validate account type
        if (!['resident', 'admin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid account type.'
            });
        }

        // Verify administrator invitation code
        if (role === 'admin') {
            if (
                !process.env.ADMIN_INVITATION_CODE ||
                admin_invitation_code !== process.env.ADMIN_INVITATION_CODE
            ) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid administrator invitation code.'
                });
            }
        }

        // Check municipality
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

        // Register with Supabase Authentication
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

        if (!data.user) {
            return res.status(400).json({
                success: false,
                message: 'Unable to create your account.'
            });
        }

        // Assign the verified account role in the users table
        const { error: roleError } = await adminSupabase
            .from('users')
            .update({ role })
            .eq('id', data.user.id);

        if (roleError) {
            console.error('Role assignment error:', roleError);

            // Remove the newly created account if role assignment fails
            await adminSupabase.auth.admin.deleteUser(data.user.id);

            return res.status(500).json({
                success: false,
                message: 'Unable to complete account registration. Please try again.'
            });
        }

        return res.status(201).json({
            success: true,
            message: data.session
                ? 'Registration successful.'
                : 'Registration successful. Please verify your email.',
            user: data.user,
            session: data.session,
            role
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


// GET CURRENT LOGGED-IN USER
export const getCurrentUser = async (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'User profile retrieved successfully.',
        user: req.profile
    });
};