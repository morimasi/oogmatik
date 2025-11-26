
import { supabase } from './supabaseClient';
import { User } from '../types';

const ADMIN_EMAILS = ['morimasi@gmail.com', 'meliksahterdek@gmail.com'];
const MOCK_SESSION_KEY = 'mock_session_user';

// Map DB columns to App User type
const mapDbUserToAppUser = (dbUser: any): User => ({
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name || dbUser.email?.split('@')[0] || 'Kullanıcı',
    role: ADMIN_EMAILS.includes(dbUser.email) ? 'admin' : (dbUser.role || 'user'),
    avatar: dbUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dbUser.email}`,
    createdAt: dbUser.created_at || new Date().toISOString(),
    lastLogin: dbUser.last_login || new Date().toISOString(),
    worksheetCount: dbUser.worksheet_count || 0,
    status: dbUser.status || 'active',
    subscriptionPlan: dbUser.subscription_plan || 'free'
});

export const authService = {
    login: async (email: string, pass: string): Promise<User> => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
            console.warn("Supabase not connected. Using Mock Login.");
            await new Promise(r => setTimeout(r, 500)); // Simulate network
            
            // Simple mock user generation
            const mockUser: User = {
                id: 'mock-' + Math.random().toString(36).substring(2, 9),
                email: email,
                name: email.split('@')[0],
                role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                worksheetCount: 5,
                status: 'active',
                subscriptionPlan: 'free'
            };
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser));
            return mockUser;
        }
        // ---------------------

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        });

        if (authError) {
            console.error("Auth Error:", authError);
            if (authError.status === 400 || authError.message.includes("Invalid login credentials")) {
                throw new Error("Giriş yapılamadı: E-posta adresi veya şifre hatalı.");
            }
            if (authError.message.includes("Failed to fetch") || authError.message.includes("Network request failed")) {
                throw new Error("Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin.");
            }
            throw new Error("Giriş hatası: " + (authError.message || "Bilinmeyen bir hata oluştu."));
        }

        if (!authData.user) throw new Error("Kullanıcı bilgileri alınamadı.");

        // Update last login
        supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', authData.user.id).then(({ error }) => {
            if (error) console.warn("Last login update warning:", error.message);
        });

        let profile = null;
        let attempts = 0;
        
        while (!profile && attempts < 3) {
            const { data, error } = await supabase.from('users').select('*').eq('id', authData.user.id).maybeSingle();
            if (!error && data) {
                profile = data;
                break;
            }
            attempts++;
            if (!profile && attempts < 3) await new Promise(r => setTimeout(r, 200));
        }

        if (!profile) {
             const fallbackProfile = {
                id: authData.user.id,
                email: authData.user.email || '',
                name: email.split('@')[0],
                role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                worksheet_count: 0,
                status: 'active',
                subscription_plan: 'free'
            };
            return mapDbUserToAppUser(fallbackProfile);
        }
        
        if (profile.status === 'suspended') {
            await supabase.auth.signOut();
            throw new Error('Hesabınız askıya alınmıştır. Lütfen yönetici ile iletişime geçin.');
        }

        return mapDbUserToAppUser(profile);
    },

    register: async (email: string, pass: string, name: string): Promise<User> => {
        // --- MOCK FALLBACK ---
        if (!supabase) {
            console.warn("Supabase not connected. Using Mock Register.");
            await new Promise(r => setTimeout(r, 500));
            
            const mockUser: User = {
                id: 'mock-' + Math.random().toString(36).substring(2, 9),
                email: email,
                name: name,
                role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                worksheetCount: 0,
                status: 'active',
                subscriptionPlan: 'free'
            };
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockUser));
            return mockUser;
        }
        // ---------------------

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: pass,
            options: { data: { full_name: name } }
        });

        if (authError) {
            if (authError.message.includes("already registered")) throw new Error("Bu e-posta adresi zaten kayıtlı.");
            throw new Error("Kayıt hatası: " + authError.message);
        }
        
        if (!authData.user) throw new Error("Kayıt oluşturulamadı. Lütfen tekrar deneyin.");

        const newUserProfile = {
            id: authData.user.id,
            email: email,
            name: name,
            role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user',
            created_at: new Date().toISOString(),
            last_login: new Date().toISOString(),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            status: 'active',
            subscription_plan: 'free',
            worksheet_count: 0
        };

        supabase.from('users').upsert(newUserProfile).then(({ error }) => {
            if (error) console.warn("Manual profile creation warning:", error.message);
        });

        return mapDbUserToAppUser(newUserProfile);
    },

    logout: async () => {
        if (!supabase) {
            localStorage.removeItem(MOCK_SESSION_KEY);
            return;
        }
        await supabase.auth.signOut();
    },

    getCurrentUser: async (): Promise<User | null> => {
        if (!supabase) {
            const stored = localStorage.getItem(MOCK_SESSION_KEY);
            return stored ? JSON.parse(stored) : null;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data: profile } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();

        if (!profile) {
             return {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'Kullanıcı',
                role: ADMIN_EMAILS.includes(session.user.email || '') ? 'admin' : 'user',
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.email}`,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                worksheetCount: 0,
                status: 'active',
                subscriptionPlan: 'free'
            };
        }
        return mapDbUserToAppUser(profile);
    },

    updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
        if (!supabase) {
            const stored = localStorage.getItem(MOCK_SESSION_KEY);
            if (stored) {
                const current = JSON.parse(stored);
                const updated = { ...current, ...updates };
                localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(updated));
                return updated;
            }
            throw new Error("Kullanıcı bulunamadı (Mock).");
        }

        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.avatar) dbUpdates.avatar = updates.avatar;
        if (updates.worksheetCount !== undefined) dbUpdates.worksheet_count = updates.worksheetCount;

        const { data, error } = await supabase.from('users').update(dbUpdates).eq('id', userId).select().single();

        if (error) throw new Error(error.message);
        return mapDbUserToAppUser(data);
    },

    updatePassword: async (newPassword: string): Promise<void> => {
        if (!supabase) {
            console.log("Mock password update success");
            return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error("Şifre güncellenirken hata oluştu: " + error.message);
    },

    getContacts: async (currentUserId: string): Promise<User[]> => {
        if (!supabase) {
            // Return some mock users for demo
            return [
                { id: 'mock-1', name: 'Ali Yılmaz', email: 'ali@test.com', role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ali', createdAt: '', lastLogin: '', worksheetCount: 5, status: 'active', subscriptionPlan: 'free' },
                { id: 'mock-2', name: 'Ayşe Demir', email: 'ayse@test.com', role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse', createdAt: '', lastLogin: '', worksheetCount: 12, status: 'active', subscriptionPlan: 'pro' }
            ];
        }
        
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .neq('id', currentUserId)
            .eq('status', 'active')
            .limit(50); 

        if (error) return [];
        return data.map(mapDbUserToAppUser);
    },

    getAllUsers: async (): Promise<User[]> => {
        if (!supabase) {
            // Return mock users list for admin panel
             return [
                { id: 'mock-1', name: 'Ali Yılmaz', email: 'ali@test.com', role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ali', createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), worksheetCount: 5, status: 'active', subscriptionPlan: 'free' },
                { id: 'mock-2', name: 'Ayşe Demir', email: 'ayse@test.com', role: 'user', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayse', createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), worksheetCount: 12, status: 'active', subscriptionPlan: 'pro' },
                { id: 'mock-3', name: 'Admin User', email: 'morimasi@gmail.com', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', createdAt: new Date().toISOString(), lastLogin: new Date().toISOString(), worksheetCount: 99, status: 'active', subscriptionPlan: 'enterprise' }
            ];
        }
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) return [];
        return data.map(mapDbUserToAppUser);
    },

    deleteUser: async (userId: string): Promise<void> => {
        if (!supabase) return; // Mock delete does nothing
        await supabase.from('users').delete().eq('id', userId);
    },

    toggleUserStatus: async (userId: string, currentStatus: string) => {
        if (!supabase) return; // Mock toggle does nothing
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        await supabase.from('users').update({ status: newStatus }).eq('id', userId);
    }
};
