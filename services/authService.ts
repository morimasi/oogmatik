
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
        if (!supabase) throw new Error("Veritabanı bağlantısı kurulamadı. Lütfen internet bağlantınızı kontrol edin.");

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        });

        if (authError) {
            console.error("Auth Error:", authError);
            // Supabase 400 Bad Request genellikle "Invalid login credentials" döner
            if (authError.status === 400 || authError.message.includes("Invalid login credentials")) {
                throw new Error("Giriş yapılamadı: E-posta adresi veya şifre hatalı.");
            }
            if (authError.message.includes("Email not confirmed")) {
                throw new Error("E-posta adresi doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.");
            }
            throw new Error("Giriş hatası: " + (authError.message || "Bilinmeyen bir hata oluştu."));
        }

        if (!authData.user) throw new Error("Kullanıcı bilgileri alınamadı.");

        // Update last login
        await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', authData.user.id);

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle(); // Use maybeSingle to avoid error if profile doesn't exist yet

        if (profileError) {
            console.error("Profile Load Error:", profileError);
            // Fallback if profile fails to load but auth succeeded (rare edge case)
            return {
                id: authData.user.id,
                email: authData.user.email || '',
                name: authData.user.user_metadata?.full_name || email.split('@')[0],
                role: 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                worksheetCount: 0,
                status: 'active',
                subscriptionPlan: 'free'
            };
        }
        
        if (profile && profile.status === 'suspended') {
            await supabase.auth.signOut();
            throw new Error('Hesabınız askıya alınmıştır. Lütfen yönetici ile iletişime geçin.');
        }

        // If profile doesn't exist yet (e.g. manual auth entry), return basic user
        if (!profile) {
             return {
                id: authData.user.id,
                email: authData.user.email || '',
                name: email.split('@')[0],
                role: 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                worksheetCount: 0,
                status: 'active',
                subscriptionPlan: 'free'
            };
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

        if (authError) {
            if (authError.message.includes("already registered")) {
                throw new Error("Bu e-posta adresi zaten kayıtlı.");
            }
            throw new Error("Kayıt hatası: " + authError.message);
        }
        
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
            .maybeSingle();

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
        await supabase.from('users').delete().eq('id', userId);
    },

    toggleUserStatus: async (userId: string, currentStatus: string) => {
        if (!supabase) return;
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await supabase.from('users').update({ status: newStatus }).eq('id', userId);
    }
};
