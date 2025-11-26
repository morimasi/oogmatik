
import { supabase } from './supabaseClient';
import { User } from '../types';

const ADMIN_EMAILS = ['morimasi@gmail.com', 'meliksahterdek@gmail.com'];

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
        if (!supabase) throw new Error("Veritabanı bağlantısı kurulamadı.");

        console.log("Giriş deneniyor:", email);
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: pass
        });

        if (authError) {
            console.error("Giriş Hatası Detayı:", authError);
            if (authError.status === 400 || authError.message.includes("Invalid login credentials")) {
                throw new Error("Giriş yapılamadı: E-posta adresi veya şifre hatalı.");
            }
            throw new Error(`Giriş hatası (${authError.status}): ${authError.message}`);
        }

        if (!authData.user) throw new Error("Kullanıcı bilgileri sunucudan alınamadı.");

        // Update last login
        supabase.from('users').update({ last_login: new Date().toISOString() }).eq('id', authData.user.id).then(({ error }) => {
            if (error) console.warn("Son giriş tarihi güncellenemedi:", error.message);
        });

        let profile = null;
        let attempts = 0;
        
        // Retry logic for profile fetching (in case trigger is slow)
        while (!profile && attempts < 3) {
            const { data, error } = await supabase.from('users').select('*').eq('id', authData.user.id).maybeSingle();
            if (!error && data) {
                profile = data;
                break;
            }
            console.log(`Profil çekme denemesi ${attempts + 1} başarısız, tekrar deneniyor...`);
            attempts++;
            if (!profile && attempts < 3) await new Promise(r => setTimeout(r, 500));
        }

        if (!profile) {
             console.warn("Profil veritabanında bulunamadı, geçici profil oluşturuluyor.");
             // Fallback purely for display if DB fetch fails but Auth succeeded
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
        if (!supabase) throw new Error("Veritabanı bağlantısı kurulamadı.");

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: pass,
            options: { data: { full_name: name } }
        });

        if (authError) {
            console.error("Kayıt Hatası:", authError);
            if (authError.message.includes("already registered")) throw new Error("Bu e-posta adresi zaten kayıtlı.");
            throw new Error("Kayıt hatası: " + authError.message);
        }
        
        if (!authData.user) throw new Error("Kayıt işlemi sunucuda tamamlanamadı. Lütfen tekrar deneyin.");

        // Manually insert profile just in case trigger fails
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

        const { error: profileError } = await supabase.from('users').upsert(newUserProfile);
        if (profileError) console.warn("Manuel profil oluşturma uyarısı:", profileError.message);

        return mapDbUserToAppUser(newUserProfile);
    },

    logout: async () => {
        if (supabase) await supabase.auth.signOut();
    },

    getCurrentUser: async (): Promise<User | null> => {
        if (!supabase) return null;
        
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) return null;

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
        if (!supabase) throw new Error("Veritabanı bağlantısı yok.");

        const dbUpdates: any = {};
        if (updates.name) dbUpdates.name = updates.name;
        if (updates.avatar) dbUpdates.avatar = updates.avatar;
        if (updates.worksheetCount !== undefined) dbUpdates.worksheet_count = updates.worksheetCount;

        const { data, error } = await supabase.from('users').update(dbUpdates).eq('id', userId).select().maybeSingle();

        if (error) throw new Error(error.message);
        
        // If data is null (e.g. row deleted or RLS issue), try fetching current data to return consistent state or throw
        if (!data) {
             // Fallback: try to fetch the user again to see if they exist
             const { data: existing, error: fetchError } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
             if (!existing || fetchError) throw new Error("Profil güncellenemedi: Kullanıcı bulunamadı.");
             return mapDbUserToAppUser(existing);
        }
        
        return mapDbUserToAppUser(data);
    },

    updatePassword: async (newPassword: string): Promise<void> => {
        if (!supabase) throw new Error("Veritabanı bağlantısı yok.");
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw new Error("Şifre güncellenirken hata oluştu: " + error.message);
    },

    getContacts: async (currentUserId: string): Promise<User[]> => {
        if (!supabase) return [];
        
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
