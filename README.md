# 🧠 Bursa Disleksi AI - Özel Eğitim İçerik Platformu

**Bursa Disleksi AI**, öğrenme güçlüğü (disleksi, diskalkuli) ve dikkat eksikliği yaşayan bireyler için kişiselleştirilmiş eğitim materyalleri üreten, yapay zeka destekli kapsamlı bir web platformudur.

Eğitmenler ve ebeveynler için tasarlanan bu uygulama, **Google Gemini AI** teknolojisini kullanarak saniyeler içinde sonsuz sayıda, özgün ve pedagojik temelli çalışma kağıtları oluşturur. Ayrıca öğrencilerin gelişimini takip etmek için detaylı bir **Değerlendirme Modülü** sunar.

---

## 🚀 Özellikler

### 🎨 İçerik Üretimi
*   **100+ Farklı Etkinlik Türü:** Kelime bulmacaları, dikkat testleri, görsel algı oyunları, matematik problemleri, hece çalışmaları, harita takibi ve mantık bulmacaları.
*   **Çift Modlu Üretim:**
    *   **✨ AI Modu:** Google Gemini kullanarak her seferinde benzersiz, yaratıcı ve bağlamsal içerikler üretir.
    *   **⚡ Hızlı Mod (Çevrimdışı):** İnternet kotası harcamadan veya API limitlerine takılmadan, yerel algoritmalarla anında içerik üretir.
*   **Akıllı Görselleştirme:** Etkinlikler için otomatik görsel betimlemeler, SVG çizimleri ve emoji desteği.

### 📊 Değerlendirme ve Analiz
*   **Bilişsel Değerlendirme Modülü:** Öğrencilerin okuma, matematik, dikkat, görsel algı ve bellek becerilerini test eden interaktif batarya.
*   **AI Raporlama:** Test sonuçlarına ve eğitmen gözlemlerine dayanarak detaylı gelişim raporları, risk analizi ve kişiselleştirilmiş yol haritaları oluşturur.
*   **Radar Grafikleri:** Öğrencinin güçlü ve zayıf yönlerini görselleştirir.

### ♿ Erişilebilirlik ve UX
*   **Özel Fontlar:** OpenDyslexic, Lexend, Inter, Comic Neue gibi okuma dostu yazı tipleri.
*   **Okuma Araçları:** Satır takibini kolaylaştıran dijital okuma cetveli ve hece renklendirme.
*   **Arayüz Özelleştirme:** Renk temaları (Pastel, Koyu, Kontrast, Sepya vb.), yazı boyutu ve harf aralığı ayarları.
*   **Yazdırılabilir Format:** Tüm etkinlikler A4 kağıt düzenine uygun (Print-friendly) çıktı verir.

### 🤝 Sosyal ve Yönetim
*   **Paylaşım:** Hazırlanan etkinlikleri ve raporları sistemdeki diğer kullanıcılarla (eğitmen/veli) paylaşma.
*   **Mesajlaşma:** Kullanıcılar arası dahili mesajlaşma sistemi.
*   **Yönetici Paneli:** Kullanıcı yönetimi, istatistikler ve geri bildirim takibi (`morimasi@gmail.com` varsayılan admin).
*   **Oyunlaştırma:** Seviye (Level) ve XP sistemi.

---

## 🛠️ Teknoloji Yığını

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API (`@google/genai` SDK) - Models: `gemini-2.5-flash`, `gemini-3-pro-preview`
*   **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime)
*   **Deployment:** Vercel (Serverless Functions for API proxy)

---

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

### 1. Ön Hazırlıklar
*   **Node.js:** v18 veya üzeri.
*   **Supabase Hesabı:** Bir proje oluşturun ve URL/Anon Key'i alın.
*   **Google AI Studio API Key:** Gemini modellerine erişim için bir API anahtarı alın.

### 2. Projeyi Klonlayın
```bash
git clone https://github.com/kullaniciadi/bursa-disleksi-ai.git
cd bursa-disleksi-ai
```

### 3. Bağımlılıkları Yükleyin
```bash
npm install
```

### 4. Çevresel Değişkenleri Ayarlayın
Kök dizinde `.env` dosyası oluşturun ve aşağıdaki anahtarları ekleyin:

```env
# Client-side (Vite - Supabase Bağlantısı)
VITE_SUPABASE_URL=https://sizin-proje-id.supabase.co
VITE_SUPABASE_ANON_KEY=sizin-supabase-anon-key

# Server-side (Vercel / Local API - Google Gemini)
# Not: Bu anahtar sadece 'api/generate.ts' sunucu fonksiyonunda kullanılır, client'a sızmaz.
API_KEY=sizin_google_gemini_api_key
```

### 5. Uygulamayı Başlatın
```bash
npm run dev
```
Tarayıcınızda `http://localhost:5173` adresine gidin.

---

## 🗄️ Veritabanı Kurulumu (Supabase SQL)

Uygulamanın tam fonksiyonel çalışması için (giriş yapma, kaydetme, paylaşma, istatistikler vb.) Supabase projenizdeki **SQL Editor** bölümünde aşağıdaki kodun **tamamını** çalıştırın. Bu betik, var olan tüm veritabanı yapılandırmasını silip yeniden oluşturduğu için tekrar tekrar hatasız çalıştırılabilir.

```sql
-- MEVCUT TABLOLARI, POLİTİKALARI, FONKSİYONLARI VE TETİKLEYİCİLERİ GÜVENLİ BİR ŞEKİLDE SİLME
-- Bu blok, kurulumu tekrar tekrar hatasız yapmanızı sağlar.

-- Önce Tetikleyiciyi ve Fonksiyonunu Kaldır (Bunlar tablolara doğrudan bağlı değil)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.increment_worksheet_count(uuid);

-- Sonra Tabloları ve BAĞLI OLAN HER ŞEYİ (Politikalar dahil) Kaldır
DROP TABLE IF EXISTS public.activity_stats CASCADE;
DROP TABLE IF EXISTS public.feedbacks CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.saved_assessments CASCADE;
DROP TABLE IF EXISTS public.saved_worksheets CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- YENİ KURULUM
-- UUID eklentisini aktifleştir
create extension if not exists "uuid-ossp";

-- 1. KULLANICI PROFİLLERİ TABLOSU
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  role text default 'user',
  avatar text,
  created_at timestamptz default now(),
  last_login timestamptz,
  worksheet_count int default 0,
  status text default 'active',
  subscription_plan text default 'free'
);

-- 2. KAYDEDİLEN ETKİNLİKLER TABLOSU
create table public.saved_worksheets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  activity_type text not null,
  worksheet_data jsonb not null,
  icon text,
  category_id text,
  category_title text,
  created_at timestamptz default now(),
  shared_by uuid references public.users(id),
  shared_by_name text,
  shared_with uuid references public.users(id)
);

-- 3. DEĞERLENDİRME RAPORLARI TABLOSU
create table public.saved_assessments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  student_name text not null,
  gender text,
  age int,
  grade text,
  report jsonb not null,
  created_at timestamptz default now(),
  shared_by uuid references public.users(id),
  shared_by_name text,
  shared_with uuid references public.users(id)
);

-- 4. MESAJLAR TABLOSU
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.users(id) on delete cascade not null,
  receiver_id uuid references public.users(id) on delete cascade not null,
  sender_name text,
  content text not null,
  timestamp timestamptz default now(),
  is_read boolean default false,
  related_feedback_id uuid
);

-- 5. GERİ BİLDİRİMLER TABLOSU
create table public.feedbacks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  user_name text,
  user_email text,
  activity_type text,
  activity_title text,
  rating int,
  message text,
  timestamp timestamptz default now(),
  status text default 'new',
  admin_reply text
);

-- 6. İSTATİSTİKLER TABLOSU
create table public.activity_stats (
  activity_id text primary key,
  title text,
  generation_count int default 0,
  last_generated timestamptz default now(),
  avg_completion_time float default 10
);

-- GÜVENLİK POLİTİKALARI (RLS)
-- Users
alter table public.users enable row level security;
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

-- Worksheets
alter table public.saved_worksheets enable row level security;
create policy "Users can view own or shared worksheets" on public.saved_worksheets for select using (auth.uid() = user_id or auth.uid() = shared_with);
create policy "Users can insert worksheets" on public.saved_worksheets for insert with check (auth.uid() = user_id or auth.uid() = shared_by);
create policy "Users can delete own or shared worksheets" on public.saved_worksheets for delete using (auth.uid() = user_id or auth.uid() = shared_with);

-- Assessments
alter table public.saved_assessments enable row level security;
create policy "Users can view own or shared assessments" on public.saved_assessments for select using (auth.uid() = user_id or auth.uid() = shared_with);
create policy "Users can insert assessments" on public.saved_assessments for insert with check (auth.uid() = user_id or auth.uid() = shared_by);
create policy "Users can delete shared assessments they received" on public.saved_assessments for delete using (auth.uid() = shared_with);

-- Messages
alter table public.messages enable row level security;
create policy "Users can see messages sent to or from them" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Users can update read status of received messages" on public.messages for update using (auth.uid() = receiver_id);

-- Feedbacks
alter table public.feedbacks enable row level security;
create policy "Anyone can insert feedback" on public.feedbacks for insert with check (true);
create policy "Only admins can view feedbacks" on public.feedbacks for select using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
create policy "Only admins can update feedbacks" on public.feedbacks for update using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- Stats
alter table public.activity_stats enable row level security;
create policy "Public stats are viewable by everyone." on public.activity_stats for select using (true);
create policy "Authenticated users can insert stats" on public.activity_stats for insert with check (auth.role() = 'authenticated');
create policy "Authenticated users can update stats" on public.activity_stats for update using (auth.role() = 'authenticated');

-- FONKSİYONLAR VE TETİKLEYİCİLER

-- Yeni kullanıcı kaydolduğunda public.users tablosuna otomatik profil oluşturan ve admin atayan fonksiyon
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  if new.email IN ('morimasi@gmail.com', 'meliksahterdek@gmail.com') then
    user_role := 'admin';
  else
    user_role := 'user';
  end if;
  
  insert into public.users (id, email, name, role, avatar)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    user_role,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || (new.raw_user_meta_data->>'full_name')
  );
  return new;
end;
$$ language plpgsql security definer;

-- auth.users tablosuna yeni kayıt eklendiğinde handle_new_user fonksiyonunu çalıştıran tetikleyici
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Kullanıcının etkinlik sayısını güvenli artıran fonksiyon
create or replace function increment_worksheet_count(user_id uuid)
returns void as $$
begin
  update public.users
  set worksheet_count = worksheet_count + 1
  where id = user_id;
end;
$$ language plpgsql security definer;
```

---

## ⚡ Performans Optimizasyonu (İndeksleme)

Uygulamanın veritabanı sorgularının hızlı çalışması, özellikle kullanıcı sayısı arttıkça kritik öneme sahiptir. Supabase'deki yavaş sorguları ve RLS (Satır Seviyesi Güvenlik) politikalarından kaynaklanabilecek gecikmeleri önlemek için aşağıdaki SQL komutlarını Supabase projenizdeki **SQL Editor**'e yapıştırıp çalıştırmanız **önemle tavsiye edilir**.

Bu komutlar, sıkça sorgulanan sütunlara indeksler ekleyerek veritabanının verilere çok daha hızlı erişmesini sağlar. Komutlar `IF NOT EXISTS` içerdiği için güvenle birden çok kez çalıştırılabilir.

```sql
-- Sıkça sorgulanan sütunlar için indeksler oluşturma
CREATE INDEX CONCURRENTLY IF NOT EXISTS users_role_idx ON public.users (role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS saved_worksheets_user_id_idx ON public.saved_worksheets (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS saved_worksheets_shared_with_idx ON public.saved_worksheets (shared_with);
CREATE INDEX CONCURRENTLY IF NOT EXISTS saved_assessments_user_id_idx ON public.saved_assessments (user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS saved_assessments_shared_with_idx ON public.saved_assessments (shared_with);
CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_sender_id_idx ON public.messages (sender_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS messages_receiver_id_idx ON public.messages (receiver_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS feedbacks_status_idx ON public.feedbacks (status);
```

---

## 🌐 Sunucuyu Uyanık Tutma (Keep-Alive)

Supabase'in ücretsiz planında, veritabanı bir süre kullanılmadığında "uyku moduna" geçebilir. Bu durum, uygulamaya uzun bir aradan sonra ilk giren kullanıcının yavaşlık veya zaman aşımı hatası yaşamasına neden olabilir.

Bu sorunu çözmek için sisteme harici bir servisle tetiklenebilecek bir "keep-alive" API adresi eklenmiştir. Bu adres düzenli olarak ziyaret edildiğinde veritabanı bağlantısı sürekli aktif kalır.

### Kurulum (cron-job.org ile)

1.  **Üye Olun:** [cron-job.org](https://cron-job.org/) sitesine gidin ve ücretsiz bir hesap oluşturun.
2.  **Cronjob Oluşturun:** Panelde "Create Cronjob" butonuna tıklayın.
    *   **Title:** `Bursa Disleksi Keep-Alive` gibi bir başlık girin.
    *   **URL:** `https://sizin-vercel-adresiniz.vercel.app/api/keep-alive` adresini girin. (`sizin-vercel-adresiniz` kısmını kendi dağıtım adresinizle değiştirin).
    *   **Schedule:** "Every 15 minutes" (Her 15 dakikada bir) seçeneğini işaretleyin. Bu, sunucunun uykuya geçmesini engellemek için yeterlidir.
3.  **Kaydedin:** "Create" butonuna basarak görevi oluşturun.

Bu kadar! Artık harici servis, uygulamanızı her 15 dakikada bir ziyaret ederek veritabanını sürekli aktif tutacaktır.

---

## 📦 Dağıtım (Deployment)

Bu proje Vercel üzerinde çalışmak üzere optimize edilmiştir (API routes için).

1.  Projeyi GitHub'a pushlayın.
2.  Vercel'de yeni bir proje oluşturun ve GitHub reponuzu bağlayın.
3.  Vercel proje ayarlarında **Environment Variables** kısmına `.env` dosyasındaki değerleri ekleyin (`API_KEY`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4.  Deploy!

---

## 🧩 Yeni Eklenen Etkinlikler

Son güncelleme ile aşağıdaki etkinlikler sisteme dahil edilmiştir:

*   **Akrabalık İlişkileri Eşleştirme:** Kelime Oyunları kategorisinde.
*   **Mantıksal Çıkarım Bulmacaları:** Okuma & Anlama kategorisinde.
*   **Kutulu Sayı Analizi:** Matematik & Mantık kategorisinde.
*   **Harita ve Yönerge Takibi:** Dikkat & Hafıza kategorisinde.