
import { createClient } from '@supabase/supabase-js';

// Vite ortamı için standart çevre değişkeni okuma
// Tip tanımları eksik olduğunda hata vermemesi için 'as any' kullanıyoruz.
// Eğer .env dosyasında veya Vercel ayarlarında tanımlı değilse, aşağıda verilen sabit değerleri kullanır.

const HARDCODED_PROJECT_REF = "ushxgmkhhrvjevaalkgo";
const HARDCODED_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHhnbWtoaHJ2amV2YWFsa2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjMzNjEsImV4cCI6MjA3OTI5OTM2MX0.uiQ_AMpf7tPWwdLUf1yEzJkAzJvE228k_8MdgDieE1g";

// URL ve Key'i temizle (boşlukları sil)
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = (envUrl || `https://${HARDCODED_PROJECT_REF}.supabase.co`).trim();
const supabaseAnonKey = (envKey || HARDCODED_ANON_KEY).trim();

let supabaseInstance = null;

// Anahtarlar varsa istemciyi oluştur.
if (supabaseUrl && supabaseAnonKey) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: true, // Oturumu sakla
                autoRefreshToken: true, // Token'ı otomatik yenile
                detectSessionInUrl: true // URL'deki tokenları algıla (şifre sıfırlama vb. için)
            }
        });
        // console.log("✅ Supabase istemcisi başlatıldı.");
    } catch (error) {
        console.error("🛑 Supabase başlatma hatası:", error);
        supabaseInstance = null;
    }
} else {
    console.error("🛑 KRİTİK HATA: Supabase URL veya Key bulunamadı!");
}

export const supabase = supabaseInstance;

// Bağlantı kontrolü
export const checkDbConnection = async () => {
    if (!supabase) {
        console.error("🛑 Supabase istemcisi yok. Bağlantı kurulamadı.");
        return false;
    }
    try {
        // Basit bir health check: Kullanıcı sayısını almayı dene
        // Bu sorgu hafiftir ve bağlantının canlı olup olmadığını gösterir.
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        
        if (error) {
            // Tablo yoksa veya yetki hatası varsa bile sunucuya ulaşıldı demektir.
            // PGRST hataları (4xx, 5xx) bağlantının var olduğunu gösterir.
            if (error.code === 'PGRST116') {
               // Veri bulunamadı hatası bağlantının çalıştığını gösterir
               return true;
            }
            if (error.code === '42P01') {
                console.warn("⚠️ Bağlantı başarılı ancak tablolar eksik (SQL'i çalıştırın).");
                return true;
            }
            console.warn("⚠️ Bağlantı uyarısı (ancak sunucuya erişildi):", error.message);
            return true; 
        }
        
        return true;
    } catch (e: any) {
        console.error("🛑 Veritabanı bağlantı istisnası:", e);
        return false;
    }
};

// Sunucuyu uyanık tutma (Heartbeat / Keep Alive)
export const keepAlive = async () => {
    if (!supabase) return;
    try {
        // 1. Supabase Veritabanı Sinyali (Hafif sorgu)
        // Sunucunun "pause" moduna geçmesini engeller
        await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        
        // 2. Vercel API Sinyali (Cold Start Önleme)
        // Fonksiyonu uyandırmak için hafif bir istek (Cevap beklenmez)
        fetch('/api/generate', { method: 'OPTIONS' }).catch(() => {});
        
        // console.debug("Heartbeat signal sent.");
    } catch (error) {
        // Hataları yut, kullanıcıya yansıtma. Amaç sadece trafik yaratmak.
    }
};
