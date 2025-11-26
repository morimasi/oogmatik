
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
        // console.log("✅ Supabase bağlantısı başlatıldı.");
    } catch (error) {
        console.error("🛑 Supabase başlatma hatası (Mock moda geçiliyor):", error);
        supabaseInstance = null;
    }
}

export const supabase = supabaseInstance;

// Connection check helper
export const checkDbConnection = async () => {
    if (!supabase) {
        return false; // Mock mode active
    }
    try {
        // Basit bir sorgu ile bağlantıyı test et
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        if (error) {
            console.warn("⚠️ Veritabanı hatası (Mock moda geçilebilir):", error.message);
            return false;
        }
        return true;
    } catch (e) {
        console.error("🛑 Veritabanı bağlantı hatası:", e);
        return false;
    }
};
