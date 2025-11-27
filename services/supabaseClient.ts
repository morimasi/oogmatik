import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseExport: SupabaseClient;

// --- GÜVENLİK UYARISI ---
// API anahtarları güvenlik nedeniyle doğrudan koda yazılmamalıdır.
// Bu yöntem, geliştirme kolaylığı için geçici olarak uygulanmıştır.
// Projeyi canlıya almadan önce bu anahtarları .env dosyası gibi güvenli bir ortama taşıyın.
const PROJECT_URL = "https://peqavnbubldvelitexiq.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcWF2bmJ1YmxkdmVsaXRleGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzQwNzksImV4cCI6MjA3OTc1MDA3OX0.VecnYk4POIGZl-ff2lNFwrdnjzjql4QiakMTdlXnxCU";

try {
    if (!PROJECT_URL || !ANON_KEY) {
        throw new Error("Supabase URL veya Anon Key doğrudan koda eklenmemiş.");
    }

    console.log("Supabase Bağlantısı Başlatılıyor...");
    supabaseExport = createClient(PROJECT_URL, ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        }
    });

} catch (e: any) {
    console.error("Supabase başlatılamadı:", e.message);
    console.warn("Uygulama veritabanı özellikleri olmadan (çevrimdışı modda) çalışacak.");
    
    // Create a dummy client to prevent the app from crashing.
    const dummyClient = {
        from: (table: string) => ({
            select: async () => ({ data: [], error: { message: `Supabase yapılandırılmadı: ${table} tablosundan veri çekilemedi.` } }),
            insert: async () => ({ error: { message: 'Supabase yapılandırılmadı' } }),
            update: async () => ({ error: { message: 'Supabase yapılandırılmadı' } }),
            delete: async () => ({ error: { message: 'Supabase yapılandırılmadı' } }),
            upsert: async () => ({ error: { message: 'Supabase yapılandırılmadı' } }),
            rpc: async () => ({ error: { message: 'Supabase yapılandırılmadı' } }),
        }),
        auth: {
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            getSession: async () => ({ data: { session: null }, error: null }),
            signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase yapılandırılmadı' } }),
            signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Supabase yapılandırılmadı' } }),
            signOut: async () => ({ error: null }),
            updateUser: async () => ({ data: { user: null }, error: { message: 'Supabase yapılandırılmadı' } }),
        },
        channel: () => ({
            on: () => ({
                subscribe: () => ({ unsubscribe: () => {} })
            }),
            subscribe: () => ({ unsubscribe: () => {} })
        }),
        removeChannel: () => {}
    };
    supabaseExport = dummyClient as any;
}

export const supabase = supabaseExport;

export const checkDbConnection = async () => {
    // If we are using the dummy client, this will fail gracefully.
    if (typeof supabase.from !== 'function') return false;
    try {
        const { error } = await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
        return !error;
    } catch(e) {
        return false;
    }
};

export const keepAlive = async () => {
    if (typeof supabase.from !== 'function') return;
    try {
        await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
        fetch('/api/generate', { method: 'OPTIONS' }).catch(() => {});
    } catch (e) { /* Ignore */ }
};