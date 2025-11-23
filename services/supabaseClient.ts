
import { createClient } from '@supabase/supabase-js';

// Vite ortam değişkenlerine güvenli erişim sağlayan yardımcı fonksiyon
// Bazı ortamlarda import.meta.env undefined olabilir, bu durumu yakalarız.
const getEnv = (key: string): string | undefined => {
    try {
        // @ts-ignore
        if (import.meta && import.meta.env) {
            // @ts-ignore
            return import.meta.env[key];
        }
        return undefined;
    } catch (e) {
        console.warn("Environment variable access error:", e);
        return undefined;
    }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Bağlantıyı oluştur (Eğer anahtarlar yoksa null döner, uygulama çökmez)
let supabaseInstance = null;

try {
    if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
} catch (error) {
    console.error("Supabase initialization failed:", error);
}

export const supabase = supabaseInstance;

// Yardımcı fonksiyon: Bağlantı kontrolü
export const checkDbConnection = async () => {
    if (!supabase) {
        console.warn("Supabase istemcisi başlatılamadı. .env dosyasını kontrol edin.");
        return false;
    }
    try {
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
            console.warn("DB Bağlantı uyarısı:", error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Veritabanı bağlantı hatası:", e);
        return false;
    }
};