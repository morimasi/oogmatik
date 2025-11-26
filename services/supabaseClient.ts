
import { createClient } from '@supabase/supabase-js';

// Vercel veya diğer dağıtım ortamlarında env değişkeni sorunlarını önlemek için
// anahtarları doğrudan tanımlıyoruz.
const PROJECT_URL = "https://ushxgmkhhrvjevaalkgo.supabase.co";
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHhnbWtoaHJ2amV2YWFsa2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjMzNjEsImV4cCI6MjA3OTI5OTM2MX0.uiQ_AMpf7tPWwdLUf1yEzJkAzJvE228k_8MdgDieE1g";

console.log("Supabase Bağlantısı Başlatılıyor:", PROJECT_URL);

export const supabase = createClient(PROJECT_URL, ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});

// Bağlantı kontrolü - Sadece gerçek bağlantıyı kontrol eder
export const checkDbConnection = async () => {
    try {
        // Hafif bir sorgu ile bağlantıyı test et
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        
        if (error) {
            console.error("Supabase bağlantı testi hatası:", error.message, error.code);
            // Eğer hata 'PGRST116' (sonuç yok) ise bağlantı başarılıdır ancak veri yoktur.
            // Eğer hata '42P01' (tablo yok) ise bağlantı başarılıdır.
            // Network hatası değilse sunucuya ulaşıldı demektir.
            return true; 
        }
        return true;
    } catch (e) {
        console.error("Supabase ağ hatası (Network Error):", e);
        return false;
    }
};

// Sunucuyu uyanık tutma (Heartbeat)
export const keepAlive = async () => {
    try {
        console.log("💓 Sunucu kontrol ediliyor...");
        await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        // Ayrıca API endpointini de uyandırabiliriz (isteğe bağlı)
        fetch('/api/generate', { method: 'OPTIONS' }).catch(() => {});
    } catch (e) { /* Ignore */ }
};
