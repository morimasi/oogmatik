import { createClient } from '@supabase/supabase-js';

// Vite ortam değişkenlerine güvenli erişim
const getEnv = () => {
    try {
        // @ts-ignore
        return (import.meta as any).env || {};
    } catch {
        return {};
    }
};

const env = getEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Bağlantıyı oluştur (Eğer anahtarlar yoksa null döner, uygulama çökmez)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Yardımcı fonksiyon: Bağlantı kontrolü
export const checkDbConnection = async () => {
    if (!supabase) return false;
    try {
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error) {
            // Tablo yoksa veya başka bir hata varsa
            console.warn("DB Bağlantı uyarısı:", error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Veritabanı bağlantı hatası:", e);
        return false;
    }
};
