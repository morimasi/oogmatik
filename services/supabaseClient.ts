import { createClient } from '@supabase/supabase-js';

// Vite ortam değişkenlerine güvenli erişim
const getEnv = (key: string): string | undefined => {
    try {
        // @ts-ignore
        return import.meta.env[key];
    } catch {
        return undefined;
    }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Bağlantıyı oluştur (Eğer anahtarlar yoksa null döner, uygulama çökmez)
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

// Yardımcı fonksiyon: Bağlantı kontrolü
export const checkDbConnection = async () => {
    if (!supabase) {
        console.warn("Supabase istemcisi başlatılamadı. .env dosyasını kontrol edin.");
        return false;
    }
    try {
        // Basit bir sorgu ile bağlantıyı test et
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
