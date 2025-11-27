import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseExport: SupabaseClient;

try {
    const PROJECT_URL = (import.meta as any).env.VITE_SUPABASE_URL;
    const ANON_KEY = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

    if (!PROJECT_URL || !ANON_KEY) {
        throw new Error("Supabase URL veya Anon Key .env dosyasında bulunamadı.");
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