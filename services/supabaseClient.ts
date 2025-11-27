// FIX: Removed vite/client reference as it was causing a type error and was not being used in this file.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- KESİN ÇÖZÜM: API ANAHTARLARI ---
// .env dosyasından okuma sorunları nedeniyle anahtarlar doğrudan koda eklenmiştir.
// DİKKAT: Bu yöntem geliştirme ortamı için uygundur. Projenizi canlıya alırken (Vercel, Netlify vb.)
// bu anahtarları koddan silip platformun "Environment Variables" bölümüne eklemeniz GÜVENLİK açısından KRİTİKTİR.
// Detaylar için README.md dosyasını inceleyin.
const supabaseUrl = "https://peqavnbubldvelitexiq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcWF2bmJ1YmxkdmVsaXRleGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzQwNzksImV4cCI6MjA3OTc1MDA3OX0.VecnYk4POIGZl-ff2lNFwrdnjzjql4QiakMTdlXnxCU";

let supabase: SupabaseClient;
let supabaseInitializationError: string | null = null;

if (supabaseUrl && supabaseAnonKey) {
    console.log("✅ Supabase anahtarları bulundu, istemci başlatılıyor.");
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });
} else {
    supabaseInitializationError = "Supabase URL veya Anon Key bulunamadı.";
    console.error(`❌ ${supabaseInitializationError}`);
    
    // Create a dummy client that will fail on requests but allows the app to load.
    supabase = {
        from: () => {
            const error = { message: 'Supabase başlatılamadı.', details: '', hint: '', code: '' };
            return {
                select: async () => ({ error, data: null }),
                insert: async () => ({ error, data: null }),
                update: async () => ({ error, data: null }),
                delete: async () => ({ error, data: null }),
                rpc: async () => ({ error, data: null })
            } as any;
        },
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getSession: async () => ({ data: { session: null }, error: { message: 'Supabase not initialized' } as any }),
            signInWithPassword: async () => ({ error: { message: 'Supabase not initialized' } as any }),
            signUp: async () => ({ error: { message: 'Supabase not initialized' } as any }),
            signOut: async () => ({ error: null }),
        }
    } as any;
}

export { supabase, supabaseInitializationError };


export const checkDbConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return false;
    try {
        const { error } = await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
        return !error;
    } catch(e) {
        return false;
    }
};

export const keepAlive = async () => {
    if (!supabaseUrl || !supabaseAnonKey) return;
    try {
        await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
        fetch('/api/generate', { method: 'OPTIONS' }).catch(() => {});
        fetch('/api/keep-alive', { method: 'GET' }).catch(() => {});
    } catch (e) { /* Ignore */ }
};