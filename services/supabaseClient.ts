
import { createClient } from '@supabase/supabase-js';

// Helper to safely access env variables across different environments (Vite/Next/Node)
const getEnv = (key: string): string | undefined => {
    let val: string | undefined;
    // 1. Try Vite import.meta.env
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            val = import.meta.env[key];
        }
    } catch (e) {}

    // 2. Try process.env (Node/Webpack fallback)
    if (!val) {
        try {
            // @ts-ignore
            if (typeof process !== 'undefined' && process.env) {
                // @ts-ignore
                val = process.env[key];
            }
        } catch (e) {}
    }
    return val;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

const isPlaceholder = (val: string | undefined) => {
    if (!val) return true;
    return val.includes('sizin-') || val.includes('your-') || val === 'undefined' || val === 'null';
};

// Initialize connection
let supabaseInstance = null;

if (!supabaseUrl || isPlaceholder(supabaseUrl)) {
    console.warn("⚠️ Supabase URL eksik veya yapılandırılmamış. Uygulama Çevrimdışı/Mock modunda çalışıyor.");
} else if (!supabaseAnonKey || isPlaceholder(supabaseAnonKey)) {
    console.warn("⚠️ Supabase Key eksik veya yapılandırılmamış. Uygulama Çevrimdışı/Mock modunda çalışıyor.");
} else {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
        console.log("✅ Supabase istemcisi oluşturuldu:", supabaseUrl);
    } catch (error) {
        console.error("🛑 Supabase başlatma hatası (Mock moda geçiliyor):", error);
        supabaseInstance = null;
    }
}

export const supabase = supabaseInstance;

// Connection check helper
export const checkDbConnection = async () => {
    if (!supabase) {
        console.log("Mock mode active (no supabase instance)");
        return false; // Mock mode active
    }
    try {
        // Basit bir sorgu ile bağlantıyı test et
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        
        if (error) {
            // RLS policy might deny anonymous read on users, but connection is technically alive if we get a 401/403 from Supabase.
            // However, 'relation "users" does not exist' is a 404-like DB error.
            console.warn("⚠️ Veritabanı bağlantı testi uyarısı:", error.message);
            
            // If error is about permissions, we still are connected.
            // If error is "fetch failed", we are not connected.
            if (error.message.includes("fetch") || error.message.includes("network")) {
                return false;
            }
            return true; // Connected but maybe permission error or table missing
        }
        
        console.log("✅ Veritabanı bağlantısı başarılı.");
        return true;
    } catch (e: any) {
        console.error("🛑 Veritabanı bağlantı hatası (Exception):", e);
        return false;
    }
};
