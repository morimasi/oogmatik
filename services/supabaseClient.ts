import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- DİKKAT: GELİŞTİRME AMAÇLI ANAHTARLAR ---
// .env dosyası ile ilgili yaşanan sorunları çözmek için anahtarlar geçici olarak buraya eklenmiştir.
// Bu yöntemin canlı (production) bir uygulama için GÜVENLİ OLMADIĞINI unutmayın.
// Projenizi Vercel gibi bir platformda yayınlarken bu anahtarları "Environment Variables"
// bölümüne taşımanız ve kodu `import.meta.env.VITE_...` kullanacak şekilde güncellemeniz gerekir.
const supabaseUrl = 'https://peqavnbubldvelitexiq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlcWF2bmJ1YmxkdmVsaXRleGlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNzQwNzksImV4cCI6MjA3OTc1MDA3OX0.VecnYk4POIGZl-ff2lNFwrdnjzjql4QiakMTdlXnxCU';


console.log("Supabase Bağlantısı Başlatılıyor (Hardcoded)...");
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

export const checkDbConnection = async () => {
    try {
        const { error } = await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
        return !error;
    } catch(e) {
        return false;
    }
};

export const keepAlive = async () => {
    try {
        await supabase.from('users').select('id', { count: 'exact', head: true }).limit(1);
        // Also ping the serverless function to keep it warm
        fetch('/api/generate', { method: 'OPTIONS' }).catch(() => {});
    } catch (e) { /* Ignore */ }
};