
import { createClient } from '@supabase/supabase-js';

// Vite ortam değişkenlerine güvenli erişim sağlayan yardımcı fonksiyon
const getEnv = (key: string): string | undefined => {
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            return import.meta.env[key];
        }
        return undefined;
    } catch (e) {
        return undefined;
    }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Bağlantıyı oluştur (Eğer anahtarlar yoksa null döner, uygulama çökmez)
let supabaseInstance = null;

try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });
    }
} catch (error) {
    console.info("Supabase başlatılamadı (Çevrimdışı mod).");
}

export const supabase = supabaseInstance;

// Yardımcı fonksiyon: Bağlantı kontrolü
export const checkDbConnection = async () => {
    if (!supabase) {
        return false;
    }
    try {
        // Sessiz kontrol
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        return !error;
    } catch (e) {
        return false;
    }
};
