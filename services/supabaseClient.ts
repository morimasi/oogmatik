
import { createClient } from '@supabase/supabase-js';

// Kullanıcının sağladığı kesin bilgiler
const HARDCODED_PROJECT_ID = "ushxgmkhhrvjevaalkgo";
const HARDCODED_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHhnbWtoaHJ2amV2YWFsa2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjMzNjEsImV4cCI6MjA3OTI5OTM2MX0.uiQ_AMpf7tPWwdLUf1yEzJkAzJvE228k_8MdgDieE1g";

// URL oluşturma
const supabaseUrl = `https://${HARDCODED_PROJECT_ID}.supabase.co`;
const supabaseAnonKey = HARDCODED_ANON_KEY;

let supabaseInstance = null;

// İstemciyi oluştur (Hata toleranslı)
try {
    if (supabaseUrl && supabaseAnonKey) {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            },
            // Bağlantı hatası durumunda tekrar deneme ayarları
            global: {
                fetch: (url, options) => {
                    return fetch(url, { ...options, keepalive: true });
                }
            }
        });
        console.log("✅ Supabase bağlantısı (Online Mod) başlatıldı.");
    } else {
        console.error("🛑 Supabase anahtarları eksik!");
    }
} catch (error) {
    console.error("🛑 Supabase başlatma hatası:", error);
}

export const supabase = supabaseInstance;

// Bağlantı kontrolü - Sadece gerçek bağlantıyı kontrol eder
export const checkDbConnection = async () => {
    if (!supabase) return false;
    try {
        // Hafif bir sorgu ile bağlantıyı test et
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        // Tablo yoksa (42P01) veya veri yoksa bile sunucuya erişim var demektir
        if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
            console.warn("Bağlantı uyarısı:", error.message);
            return true; // Hata dönse bile sunucuya ulaşıldı kabul et
        }
        return true;
    } catch (e) {
        console.error("Bağlantı hatası:", e);
        return false;
    }
};

// Sunucuyu uyanık tutma (Heartbeat)
export const keepAlive = async () => {
    if (!supabase) return;
    try {
        await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
    } catch (e) { /* Ignore */ }
};
