
import { createClient } from '@supabase/supabase-js';

// Vite ortamı için standart çevre değişkeni okuma
// Tip tanımları eksik olduğunda hata vermemesi için 'as any' kullanıyoruz.
// Eğer .env dosyasında veya Vercel ayarlarında tanımlı değilse, aşağıda verilen sabit değerleri kullanır.

const HARDCODED_PROJECT_REF = "ushxgmkhhrvjevaalkgo";
const HARDCODED_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHhnbWtoaHJ2amV2YWFsa2dvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MjMzNjEsImV4cCI6MjA3OTI5OTM2MX0.uiQ_AMpf7tPWwdLUf1yEzJkAzJvE228k_8MdgDieE1g";

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || `https://${HARDCODED_PROJECT_REF}.supabase.co`;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || HARDCODED_ANON_KEY;

let supabaseInstance = null;

// Anahtarlar varsa istemciyi oluştur.
if (supabaseUrl && supabaseAnonKey) {
    try {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
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
        const { error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
        
        if (error) {
            // Tablo yoksa veya yetki hatası varsa bile sunucuya ulaşıldı demektir.
            // PGRST hataları (4xx, 5xx) bağlantının var olduğunu gösterir.
            if (error.code === '42P01') {
                console.warn("⚠️ Bağlantı başarılı ancak tablolar eksik (SQL'i çalıştırın).");
            } else {
                console.warn("⚠️ Bağlantı uyarısı:", error.message);
            }
            return true; 
        }
        
        return true;
    } catch (e: any) {
        console.error("🛑 Veritabanı bağlantı istisnası:", e);
        return false;
    }
};
