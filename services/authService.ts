
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

        // Update last login silently
        supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', authData.user.id).then(() => {});

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

        // Create public user profile manually
        const newUserProfile = {
            id: authData.user.id,
            email: email,
            name: name,
            role: email === 'morimasi@gmail.com' ? 'admin' : 'user',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            status: 'active',
            subscription_plan: 'free',
            worksheet_count: 0
        };

        const { data: profile, error: dbError } = await supabase
            .from('users')
            .upsert(newUserProfile)
            .select()
            .single();

        if (dbError) console.error("Profile creation warning:", dbError);

        return mapDbUserToAppUser(profile || newUserProfile);
    },

    logout: async () => {
        if (!supabase) return;
        await supabase.auth.signOut().catch(() => {});
    },

    getCurrentUser: async (): Promise<User | null> => {
        if (!supabase) return null;
        
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !session?.user) return null;

            // Use maybeSingle to avoid 406 error if profile is missing
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

            if (profileError || !profile) return null;
            return mapDbUserToAppUser(profile);
        } catch (e) {
            // Suppress network errors
            return null;
        }
    },

    updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
        if (!supabase) throw new Error("Veritabanı bağlantısı yok.");

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
        
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .neq('id', currentUserId)
                .eq('status', 'active')
                .limit(50);

            if (error) return [];
            return data.map(mapDbUserToAppUser);
        } catch (e) { return []; }
    },

    getAllUsers: async (): Promise<User[]> => {
        if (!supabase) return [];
        try {
            const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
            if (error) return [];
            return data.map(mapDbUserToAppUser);
        } catch (e) { return []; }
    },

    deleteUser: async (userId: string): Promise<void> => {
        if (!supabase) return;
        try {
            await supabase.from('users').delete().eq('id', userId);
        } catch (e) {}
    },

    toggleUserStatus: async (userId: string, currentStatus: string) => {
        if (!supabase) return;
        try {
            const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
            await supabase.from('users').update({ status: newStatus }).eq('id', userId);
        } catch (e) {}
    }
};
