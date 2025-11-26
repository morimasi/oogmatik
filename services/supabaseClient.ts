
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
        // console.log("✅ Supabase istemcisi oluşturuldu."); 
    } catch (error) {
        console.error("🛑 Supabase başlatma hatası (Mock moda geçiliyor):", error);
        supabaseInstance = null;
    }
}

export const supabase = supabaseInstance;

// Connection check helper
export const checkDbConnection = async () => {
    if (!supabase) {
        console.log("ℹ️ Mock mode active (No Supabase keys found).");
        return false; // Mock mode active
    }
    try {
        // Basit bir sorgu ile bağlantıyı test et
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        
        if (error) {
            // RLS policy might deny anonymous read on users, but connection is technically alive if we get a 401/403.
            // However, 'relation "users" does not exist' is a 404-like DB error meaning SQL script wasn't run.
            // '42P01' is table missing.
            console.warn("⚠️ Veritabanı bağlantı uyarısı:", error.message, error.code);
            
            // If error is connection related
            if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("connection")) {
                console.error("🛑 Sunucuya erişilemiyor.");
                return false;
            }
            
            if (error.code === '42P01') {
                console.warn("⚠️ Tablolar bulunamadı. Lütfen SQL kurulumunu yapın.");
            }

            return true; // Connected to Supabase, even if table access denied or missing
        }
        
        console.log("✅ Veritabanı bağlantısı başarılı ve tablolar hazır.");
        return true;
    } catch (e: any) {
        console.error("🛑 Veritabanı bağlantı hatası (Exception):", e);
        return false;
    }
};
