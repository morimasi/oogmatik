
import { supabase } from './supabaseClient';
import { User } from '../types';

// Map DB columns to App User type
const mapDbUserToAppUser = (dbUser: any): User => ({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name || dbUser.email.split('@')[0],
    // 'morimasi@gmail.com' hesabına otomatik admin yetkisi ver
    role: dbUser.email === 'morimasi@gmail.com' ? 'admin' : (dbUser.role || 'user'),
    avatar: dbUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser.email}`,
    createdAt: dbUser.created_at,
    lastLogin: dbUser.last_login,
    worksheetCount: dbUser.worksheet_count || 0,
    status: dbUser.status || 'active',
    subscriptionPlan: dbUser.subscription_plan || 'free'
});

export const authService = {
    login: async (email: string, pass: string): Promise<User> => {
        if (!supabase) throw new Error("Veritabanı bağlantısı yok.");

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("Kullanıcı bulunamadı.");

        // Update last login
        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', authData.user.id);

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw new Error("Kullanıcı profili yüklenemedi.");
        
        if (profile.status === 'suspended') {
            await supabase.auth.signOut();
            throw new Error('Hesabınız askıya alınmıştır.');
        }

        return mapDbUserToAppUser(profile);
    },

    register: async (email: string, pass: string, name: string): Promise<User> => {
        if (!supabase) throw new Error("Veritabanı bağlantısı yok.");

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: pass,
            options: {
                data: { full_name: name }
            }
        });

        if (authError) throw new Error(authError.message);
        if (!authData.user) throw new Error("Kayıt oluşturulamadı.");

        // Create public user profile manually (if trigger fails or adds latency)
        const newUserProfile = {
            id: authData.user.id,
            email: email,
            name: name,
            role: 'user',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            status: 'active',
            subscription_plan: 'free',
            worksheet_count: 0
        };

        // Upsert to handle potential trigger race conditions
        const { data: profile, error: dbError } = await supabase
            .from('users')
            .upsert(newUserProfile)
            .select()
            .single();

        if (dbError) console.error("Profile creation error:", dbError);

        return mapDbUserToAppUser(profile || newUserProfile);
    },

    logout: async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
    },

    getCurrentUser: async (): Promise<User | null> => {
        if (!supabase) return null;
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

        if (!profile) return null;
        return mapDbUserToAppUser(profile);
    },

    updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
        if (!supabase) throw new Error("Veritabanı bağlantısı yok.");

        // Convert camelCase to snake_case for DB
        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.avatar) dbUpdates.avatar = updates.avatar;
        if (updates.worksheetCount !== undefined) dbUpdates.worksheet_count = updates.worksheetCount;

        const { data, error } = await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return mapDbUserToAppUser(data);
    },

    getContacts: async (currentUserId: string): Promise<User[]> => {
        if (!supabase) return [];
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .neq('id', currentUserId)
            .eq('status', 'active')
            .limit(50); // Limit for performance

        if (error) return [];
        return data.map(mapDbUserToAppUser);
    },

    // --- ADMIN METHODS ---
    getAllUsers: async (): Promise<User[]> => {
        if (!supabase) return [];
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) return [];
        return data.map(mapDbUserToAppUser);
    },

    deleteUser: async (userId: string): Promise<void> => {
        if (!supabase) return;
        // Note: In Supabase, deleting from auth.users requires service role key usually.
        // Here we perform a soft delete or delete from public.users if RLS allows.
        // For this demo, we delete from public table. Real app should use Edge Function for full delete.
        await supabase.from('users').delete().eq('id', userId);
    },

    toggleUserStatus: async (userId: string, currentStatus: string) => {
        if (!supabase) return;
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await supabase.from('users').update({ status: newStatus }).eq('id', userId);
    }
};
