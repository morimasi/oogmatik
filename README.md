# 🧠 Bursa Disleksi AI - Özel Eğitim İçerik Platformu

**Bursa Disleksi AI**, disleksi (okuma güçlüğü), diskalkuli (matematik öğrenme güçlüğü) ve dikkat eksikliği yaşayan bireyler için kişiselleştirilmiş eğitim materyalleri üreten, yapay zeka destekli web tabanlı bir platformdur.

Eğitmenler ve ebeveynler için tasarlanan bu uygulama, Google Gemini AI teknolojisini kullanarak saniyeler içinde sonsuz sayıda, özgün ve pedagojik temelli çalışma kağıtları oluşturur.

---

## 🚀 Özellikler

### 🎨 İçerik Üretimi
*   **50+ Farklı Etkinlik Türü:** Kelime bulmacaları, dikkat testleri, görsel algı oyunları, matematik problemleri, hece çalışmaları ve daha fazlası.
*   **Çift Modlu Üretim:**
    *   **✨ AI Modu:** Google Gemini kullanarak yaratıcı, bağlamsal ve görsel açıdan zengin içerikler üretir.
    *   **⚡ Hızlı Mod (Çevrimdışı):** İnternet kotası harcamadan veya API limitlerine takılmadan, yerel algoritmalarla anında içerik üretir.
*   **Görsel Destek:** Etkinlikler için otomatik görsel betimlemeler ve emoji/ikon desteği.

### 📊 Değerlendirme ve Analiz
*   **Bilişsel Değerlendirme Modülü:** Öğrencilerin okuma, matematik, dikkat, görsel algı ve bellek becerilerini test eden interaktif batarya.
*   **AI Raporlama:** Test sonuçlarına ve eğitmen gözlemlerine dayanarak detaylı gelişim raporları ve kişiselleştirilmiş yol haritaları oluşturur.
*   **Radar Grafikleri:** Öğrencinin güçlü ve zayıf yönlerini görselleştirir.

### ♿ Erişilebilirlik ve UX
*   **Özel Fontlar:** OpenDyslexic, Lexend gibi okuma dostu yazı tipleri.
*   **Okuma Cetveli:** Satır takibini kolaylaştıran dijital cetvel aracı.
*   **Arayüz Özelleştirme:** Renk temaları (Pastel, Koyu, Kontrast vb.), yazı boyutu, doygunluk ve harf aralığı ayarları.
*   **Yazdırılabilir Format:** Tüm etkinlikler A4 kağıt düzenine uygun (Print-friendly) çıktı verir.

### 🤝 Sosyal ve Yönetim
*   **Paylaşım:** Hazırlanan etkinlikleri ve raporları diğer kullanıcılarla (eğitmen/veli) paylaşma.
*   **Mesajlaşma:** Kullanıcılar arası dahili mesajlaşma sistemi.
*   **Yönetici Paneli:** Kullanıcı yönetimi, istatistikler ve geri bildirim takibi.
*   **Oyunlaştırma:** Seviye (Level) ve XP sistemi ile eğitmen motivasyonu.

---

## 🛠️ Teknoloji Yığını

*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **AI:** Google Gemini API (`@google/genai` SDK)
*   **Backend / Database:** Supabase (PostgreSQL, Auth, Realtime)
*   **Deployment:** Vercel (Serverless Functions for API proxy)

---

## ⚙️ Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin:

1.  **Projeyi Klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/bursa-disleksi-ai.git
    cd bursa-disleksi-ai
    ```

2.  **Bağımlılıkları Yükleyin:**
    ```bash
    npm install
    ```

3.  **Çevresel Değişkenleri Ayarlayın:**
    Kök dizinde `.env` dosyası oluşturun ve aşağıdaki anahtarları ekleyin:

    ```env
    # Client-side (Vite - Supabase Bağlantısı)
    VITE_SUPABASE_URL=https://sizin-proje-id.supabase.co
    VITE_SUPABASE_ANON_KEY=sizin-supabase-anon-key

    # Server-side (Vercel / Local API - Google Gemini)
    # Not: 'api/generate.ts' dosyasında kullanılır.
    API_KEY=sizin_google_gemini_api_key
    ```

4.  **Uygulamayı Başlatın:**
    ```bash
    npm run dev
    ```

---

## 🗄️ Veritabanı Kurulumu (Supabase SQL)

Uygulamanın tam fonksiyonel çalışması için (giriş yapma, kaydetme, paylaşma vb.) Supabase projenizdeki **SQL Editor** bölümünde aşağıdaki kodları sırasıyla çalıştırarak tabloları ve fonksiyonları oluşturun.

### 1. Tabloları ve Güvenlik Politikalarını (RLS) Oluşturma

```sql
-- UUID eklentisini aktifleştir
create extension if not exists "uuid-ossp";

-- 1. KULLANICI PROFİLLERİ TABLOSU
-- Auth sistemindeki kullanıcılar buraya senkronize edilir veya manuel eklenir.
create table public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  name text,
  role text default 'user', -- 'admin' veya 'user'
  avatar text,
  created_at timestamptz default now(),
  last_login timestamptz,
  worksheet_count int default 0,
  status text default 'active', -- 'active', 'suspended'
  subscription_plan text default 'free'
);

-- RLS (Güvenlik) Politikaları
alter table public.users enable row level security;
create policy "Public profiles are viewable by everyone." on public.users for select using (true);
create policy "Users can insert their own profile." on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile." on public.users for update using (auth.uid() = id);

-- 2. KAYDEDİLEN ETKİNLİKLER TABLOSU
create table public.saved_worksheets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  name text not null,
  activity_type text not null,
  worksheet_data jsonb not null, -- Etkinlik verisi JSON formatında saklanır
  icon text,
  category_id text,
  category_title text,
  created_at timestamptz default now(),
  shared_by uuid references public.users(id), -- Eğer paylaşılmışsa gönderen ID
  shared_by_name text,
  shared_with uuid references public.users(id) -- Eğer paylaşılmışsa alıcı ID
);

alter table public.saved_worksheets enable row level security;
create policy "Users can view own or shared worksheets" on public.saved_worksheets for select using (auth.uid() = user_id or auth.uid() = shared_with);
create policy "Users can insert worksheets" on public.saved_worksheets for insert with check (auth.uid() = user_id or auth.uid() = shared_by);
create policy "Users can delete own worksheets" on public.saved_worksheets for delete using (auth.uid() = user_id);

-- 3. DEĞERLENDİRME RAPORLARI TABLOSU
create table public.saved_assessments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  student_name text not null,
  gender text,
  age int,
  grade text,
  report jsonb not null, -- Rapor verisi JSON formatında saklanır
  created_at timestamptz default now(),
  shared_by uuid references public.users(id),
  shared_by_name text,
  shared_with uuid references public.users(id)
);

alter table public.saved_assessments enable row level security;
create policy "Users can view own or shared assessments" on public.saved_assessments for select using (auth.uid() = user_id or auth.uid() = shared_with);
create policy "Users can insert assessments" on public.saved_assessments for insert with check (auth.uid() = user_id or auth.uid() = shared_by);

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

alter table public.messages enable row level security;
create policy "Users can see messages sent to or from them" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Users can update read status of received messages" on public.messages for update using (auth.uid() = receiver_id);

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
  status text default 'new', -- 'new', 'read', 'replied'
  admin_reply text
);

alter table public.feedbacks enable row level security;
create policy "Anyone can insert feedback" on public.feedbacks for insert with check (true);
create policy "Only admins can view feedbacks" on public.feedbacks for select using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));
create policy "Only admins can update feedbacks" on public.feedbacks for update using (exists (select 1 from public.users where id = auth.uid() and role = 'admin'));

-- 6. İSTATİSTİKLER TABLOSU
create table public.activity_stats (
  activity_id text primary key,
  title text,
  generation_count int default 0,
  last_generated timestamptz default now(),
  avg_completion_time float default 0
);

alter table public.activity_stats enable row level security;
create policy "Public stats read" on public.activity_stats for select using (true);
create policy "Public stats update" on public.activity_stats for insert with check (true);
create policy "Public stats update existing" on public.activity_stats for update using (true);
```

### 2. RPC Fonksiyonları (Stored Procedures)

Etkinlik oluşturulduğunda kullanıcının XP/Sayaç değerini artırmak için gerekli fonksiyon:

```sql
-- Kullanıcının worksheet_count değerini güvenli bir şekilde 1 artıran fonksiyon
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

## 📚 Kullanım İpuçları

1.  **Admin Yetkisi:** `services/authService.ts` dosyasında `morimasi@gmail.com` e-posta adresi varsayılan **Admin** olarak tanımlanmıştır. Kendi e-posta adresinizle değiştirebilir veya veritabanında `users` tablosundaki `role` sütununu `admin` olarak güncelleyebilirsiniz.
2.  **Yazdırma:** Etkinlik oluşturulduktan sonra araç çubuğundaki "Yazdır" veya "İndir" butonunu kullanın. Tarayıcı yazdırma ayarlarında **"Arka plan grafiklerini yazdır" (Background graphics)** seçeneğinin işaretli olduğundan emin olun.
3.  **Hızlı Mod vs AI:** İnternet bağlantısı yavaşsa veya API kotası dolduysa, kenar çubuğunda "Hızlı (Çevrimdışı)" modunu seçerek anında içerik üretebilirsiniz.

---

## 📄 Lisans

Bu proje özel eğitim amaçlı geliştirilmiştir. Ticari kullanım için iletişime geçiniz.
