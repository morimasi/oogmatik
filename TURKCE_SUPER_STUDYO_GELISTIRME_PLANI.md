# Oogmatik Türkçe Süper Stüdyo - Premium Geliştirme ve Mimari Planı (V1.5 - Oogmatik'in Kalbi & Ultra Entegrasyon)

Bu doküman, **Oogmatik Türkçe Süper Stüdyo** projesinin uçtan uca, yüksek ölçeklenebilir, disleksi dostu ve MEB müfredatına tam uyumlu bir şekilde geliştirilmesi için hazırlanmış **Premium Seviye Teknik ve Pedagojik Mimari Planıdır**. 

Bu plan, zaman içinde güncellenecek ve kodlama aşamasına geçildiğinde bir "Kuzey Yıldızı" (North Star) görevi görecektir.

---

## 1. Oogmatik Ekosistemindeki Yeri: "Uygulamanın Kalbi"

Türkçe Süper Stüdyo, Oogmatik uygulamasından bağımsız bir eklenti değil; aksine uygulamanın **en güçlü, en çok vakit geçirilen ve diğer tüm modülleri besleyen ana motoru (Core Component)** olarak konumlandırılmıştır.

### 1.1. Ana Uygulama ile Ultra Premium Entegrasyonlar
*   **Giriş Kapısı (Entry Point):** Ana uygulamanın "Stüdyolar" sekmesinde, diğer modüllerin (Görsel & Mekansal, Matematik vb.) yanında **"Taçlı / Premium"** bir kart olarak yer alır. Tıklandığında uygulama dışına çıkıyormuş hissi verilmeden, akıcı bir sayfa geçişi (Shared Layout Animation) ile "Dev Süper Stüdyo" evrenine girilir.
*   **Profil ve Avatar Senkronizasyonu:** Öğrencinin Oogmatik ana uygulamasındaki avatarı, seviyesi ve kazandığı rozetler Süper Stüdyo'da doğrudan görünür ve kullanılır.
*   **Oogmatik Ödül Sistemi (Gamification):** Süper Stüdyo'da çözülen her metin, ana uygulamanın global puan tablosuna (Leaderboard) ve "Oogmatik Jetonları" sistemine doğrudan etki eder.
*   **Veli/Öğretmen Paneli Bağlantısı:** Süper Stüdyo'nun ürettiği tüm AI destekli okuma hızı, hata analizi ve gelişim raporları, Oogmatik'in mevcut Veli/Öğretmen Dashboard'una anlık (Real-time) olarak akar.
*   **Çapraz Modül Etkileşimi:** Süper Stüdyo'da "Mantık" becerisi gelişen bir öğrencinin verisi, Oogmatik'in "Matematik & Mantık" stüdyosundaki zorluk seviyesini otomatik olarak ayarlar (Global Adaptif Öğrenme).

---

## 2. Sistem Mimarisi ve Teknoloji Yığını (Tech Stack)

Proje, modern web standartlarına uygun, yüksek performanslı ve erişilebilir (a11y) bir altyapı üzerine inşa edilecektir. Aynı zamanda Oogmatik ana uygulaması (Mobil/Web) ile tam entegre çalışacak şekilde tasarlanmıştır.

### 1.1. Çekirdek Teknolojiler
*   **Core Framework:** Next.js 14+ (App Router) - SEO, SSR/SSG desteği, Edge rendering ve hızlı sayfa yüklemeleri için.
*   **Dil:** TypeScript (Strict Mode) - Tip güvenliği, polimorfik veri modelleri ve hatasız geliştirme deneyimi.
*   **Paket Yöneticisi:** pnpm veya bun (Hızlı kurulum ve monorepo uyumluluğu için).
*   **PWA & Native Entegrasyon:** Capacitor veya React Native WebView (Mobil uygulama ile çift yönlü iletişim köprüsü - `postMessage` API).

### 1.2. State Management (Durum Yönetimi)
*   **Global State (İstemci):** Zustand (Oturum yönetimi, kullanıcı tercihleri, tema, disleksi ayarları).
*   **Server State (Sunucu):** React Query (TanStack Query) v5 (Veri çekme, önbellekleme, optimistik güncellemeler, offline destek).
*   **Form Yönetimi:** React Hook Form + Zod (Performanslı ve tip güvenli form validasyonları).

### 1.3. Stilleme & UI (Kullanıcı Arayüzü)
*   **CSS Framework:** Tailwind CSS v3/v4 (Özelleştirilmiş disleksi dostu konfigürasyon, CSS değişkenleri ile dinamik tema).
*   **Animasyon:** Framer Motion (Akıcı, bilişsel yükü artırmayan mikro-animasyonlar, sayfa geçişleri).
*   **Erişilebilir Bileşenler:** Radix UI Primitives (Erişilebilir, klavye dostu, WAI-ARIA uyumlu temel bileşenler).
*   **İkonografi:** Lucide React veya Phosphor Icons (Sade, anlaşılır, çocuk dostu ikonlar).

### 1.4. Araçlar, Entegrasyonlar ve AI (Premium Özellikler)
*   **Yapay Zeka (AI) Çekirdeği:** OpenAI API (GPT-4o) veya Anthropic Claude 3.5 Sonnet (Metin analizi, dinamik soru üretimi, anında geri bildirim ve adaptif zorluk için).
*   **Ses İşleme (AI):** Whisper API (Dikte ve sesli okuma analizi için Speech-to-Text) ve ElevenLabs / Azure TTS (Doğal ve duygulu Text-to-Speech).
*   **PDF Üretimi & Yazdırma:** `@react-pdf/renderer` (Çalışma Kağıdı Stüdyosu için sunucu/istemci tarafı PDF render ve doğrudan yazdırma).
*   **Ekran Görüntüsü Alma:** `html2canvas` veya `dom-to-image` (Öğrencinin başarısını veya öğretmenin hazırladığı soruyu anında PNG/JPEG olarak kaydetmesi).
*   **Paylaşım (Web Share API):** Native paylaşım menüsü entegrasyonu (WhatsApp, Email, Sistem panosu).
*   **Sürükle-Bırak (Drag & Drop):** `@dnd-kit/core` (Erişilebilir, performanslı ve mobil uyumlu sürükle-bırak etkileşimleri).
*   **Veritabanı & Backend:** Supabase (PostgreSQL + Row Level Security) veya mevcut Oogmatik backend'i (REST/GraphQL).
*   **Analitik:** PostHog veya özel Telemetry servisi (Öğrenci etkileşimlerini, hata oranlarını ve süreleri takip etmek için).

---

## 2. Veri Modelleri ve JSON Şemaları (Soru Motoru Çekirdeği)

Sistem, tek bir metinden sınırsız soru üretebilen **Polimorfik JSON** mimarisine dayanır. Bu yapı, veritabanında esnek depolama ve frontend'de dinamik render sağlar.

### 2.1. `Text` (Metin) Şeması
```typescript
interface TextPassage {
  id: string;
  title: string;
  content: string; // Markdown veya zengin metin (Rich Text) formatında
  metadata: {
    gradeLevel: 1 | 2 | 3 | 4;
    difficulty: 'KOLAY' | 'ORTA' | 'ZOR';
    theme: 'DOGA' | 'BILIM' | 'SOCIETY' | 'HIKAYE' | 'FABL';
    wordCount: number;
    readabilityScore: number; // Flesch-Kincaid veya benzeri bir okunabilirlik skoru
    estimatedReadingTimeMs: number; // Tahmini okuma süresi
  };
  learningOutcomes: string[]; // MEB Kazanım kodları (Örn: T.1.3.4)
  assets?: {
    audioUrl?: string; // Sesli okuma için
    imageUrl?: string; // Görsel destek için
  };
}
```

### 2.2. `Question` (Soru) Şeması (Polimorfik)
```typescript
type QuestionType = 'MCQ' | 'OPEN_ENDED' | 'TRUE_FALSE' | 'FILL_BLANK' | 'DRAG_DROP' | 'LOGIC_MATCH' | 'SPELLING_CORRECT';

interface BaseQuestion {
  id: string;
  textId: string; // Bağlı olduğu metin
  type: QuestionType;
  instruction: string; // "Aşağıdaki soruyu metne göre cevaplayınız."
  difficulty: 'KOLAY' | 'ORTA' | 'ZOR';
  targetSkill: 'ANA_FIKIR' | 'SEBEP_SONUC' | 'SOZ_VARLIGI' | 'YAZIM_NOKTALAMA' | 'MANTIK';
  learningOutcomes: string[]; // MEB Kazanım kodları
  feedback: {
    correct: string; // Doğru cevap geri bildirimi
    incorrect: string; // Yanlış cevap geri bildirimi (İpucu niteliğinde)
  };
}

// Çoktan Seçmeli Soru Örneği
interface MCQQuestion extends BaseQuestion {
  type: 'MCQ';
  options: { id: string; text: string; isCorrect: boolean; imageUrl?: string }[];
}

// Sürükle Bırak (Sıralama) Soru Örneği
interface DragDropQuestion extends BaseQuestion {
  type: 'DRAG_DROP';
  items: { id: string; content: string; correctOrder: number }[];
}

// Boşluk Doldurma Soru Örneği
interface FillBlankQuestion extends BaseQuestion {
  type: 'FILL_BLANK';
  template: string; // Örn: "Ali {blank_1} gitti ve {blank_2} aldı."
  blanks: { id: string; correctValue: string; acceptedValues?: string[] }[];
  wordBank?: string[]; // Opsiyonel kelime havuzu
}
```

### 2.3. `Session` (Oturum ve Analitik) Şeması
```typescript
interface LearningSession {
  sessionId: string;
  userId: string;
  moduleType: 'TEXT_STUDIO' | 'LOGIC_STUDIO' | 'SPELLING_STUDIO';
  startTime: Date;
  endTime: Date | null;
  interactions: {
    questionId: string;
    timeSpentMs: number;
    attempts: number;
    isCorrect: boolean;
    givenAnswer: any;
    hintsUsed: number; // Kullanılan ipucu sayısı
  }[];
  telemetry: {
    frustrationClicks: number; // Çok hızlı tıklama/hata tespiti
    idleTimeMs: number; // Ekranda boş bekleme süresi
    readingRulerUsed: boolean; // Satır izleme şeridi kullanıldı mı?
  };
  score: number; // Oturum sonu puanı
}
```

---

## 4. Disleksi Dostu UI/UX ve Premium Tasarım Sistemi (Design System)

Tasarım sistemi, bilişsel yükü en aza indirmek ve okuma güçlüğü çeken öğrencilere maksimum destek sağlamak üzere kurgulanmıştır. Bu ayarlar kullanıcı bazlı olarak özelleştirilebilir olacaktır.

### 4.1. Premium Arayüz (UI) Vizyonu
*   **Cam Efekti (Glassmorphism):** Arka planda çok hafif, göz yormayan, bulanıklaştırılmış (blur) organik şekiller ve ön planda net, yüksek kontrastlı kartlar.
*   **Mikro-Etkileşimler (Micro-interactions):** Butonlara tıklandığında veya doğru cevap verildiğinde, ekranda konfeti patlaması yerine, daha sakin ama tatmin edici "sıvı" (liquid) veya "yumuşak sıçrama" (soft bounce) animasyonları.
*   **Derinlik ve Gölgelendirme (Neumorphism/Soft UI):** Öğelerin tıklanabilir olduğunu hissettiren, ancak gözü yormayan çok yumuşak iç ve dış gölgeler.
*   **Odak Modu (Zen Mode):** Öğrenci soru çözerken, ekrandaki tüm gereksiz menülerin, puanların ve butonların yavaşça silikleşerek (fade out) sadece soruya odaklanılmasını sağlayan özel bir arayüz durumu.

### 4.2. Tipografi (Typography)
*   **Font Ailesi:** Birincil olarak `OpenDyslexic`, `Lexend`, `Atkinson Hyperlegible` veya `Comic Sans MS` (Kullanıcı tercihine bağlı değiştirilebilir).
*   **Satır Aralığı (Line Height):** Minimum `1.5` (Tercihen `1.75` veya `2.0`).
*   **Harf Aralığı (Letter Spacing):** Standarttan `%10-20` daha geniş.
*   **Kelime Aralığı (Word Spacing):** Standarttan `%10` daha geniş.
*   **Paragraf Aralığı:** Paragraflar arası belirgin boşluklar (margin-bottom: `2rem`).
*   **Hizalama:** Sadece sola hizalı (Justify KESİNLİKLE kullanılmayacak).

### 4.3. Renk Paleti ve Kontrast (WCAG AAA Uyumlu)
*   **Arka Plan:** Saf beyaz (`#FFFFFF`) **kullanılmayacak**. Göz yormayan kırık beyaz, pastel sarı, açık mavi veya krem tonları (`#FAFAFA`, `#FFFDF0`, `#F0F8FF`).
*   **Metin Rengi:** Saf siyah (`#000000`) yerine koyu gri/lacivert (`#1F2937`, `#0F172A`).
*   **Vurgular:** Bilgiyi iletmek için sadece renk kullanılmayacak; renk + ikon + kalınlık kombinasyonu kullanılacak.
*   **Tema Seçenekleri:** "Sıcak Tema" (Krem/Kahve), "Soğuk Tema" (Açık Mavi/Lacivert), "Yüksek Kontrast".

### 4.4. Etkileşim ve Odak (Interaction & Focus)
*   **Satır İzleme Şeridi (Reading Ruler):** İmlecin veya parmağın bulunduğu satırı hafifçe vurgulayan, diğer satırları hafifçe soluklaştıran opsiyonel bir okuma aracı.
*   **Büyük Tıklama Alanları:** Butonlar ve seçenekler için minimum `48x48px` dokunma alanı.
*   **Hata Toleransı:** Yanlış cevaplarda kırmızı çarpı yerine, cesaretlendirici "Tekrar Dene" animasyonları ve ipuçları (Scaffolding).
*   **Bilişsel Yük Kontrolü:** Ekranda aynı anda sadece tek bir soru veya tek bir odak noktası gösterilecek.

---

## 5. Modül Geliştirme Stratejisi (Atomic Design)

Bileşenler "Atomic Design" prensibiyle geliştirilecektir.

1.  **Atoms (Atomlar):** `Button`, `TagChip`, `Icon`, `Typography`, `ProgressBar`, `Checkbox`, `Radio`.
2.  **Molecules (Moleküller):** `OptionItem` (Seçenek + Checkbox), `TimerDisplay`, `ReadingRuler`, `HintButton`.
3.  **Organisms (Organizmalar):** `QuestionContainer` (Soru metni + Seçenekler + Kontrol Butonu), `TextPassage` (Metin + Vurgulama araçları), `DragDropList`.
4.  **Templates (Şablonlar):** `StudioLayout` (Sol menü, üst bar, ana içerik alanı), `QuizLayout`.
5.  **Pages (Sayfalar):** Metin & Paragraf Stüdyosu Ana Ekranı, Soru Çözüm Oturumu, Öğretmen Dashboard'u.

---

## 6. Stüdyo Detayları ve Özellikleri (AI Destekli)

### 6.1. Metin & Paragraf Stüdyosu
*   **Özellikler:** Metin okuma, anlama, ana fikir bulma.
*   **Araçlar:** Metin içi kelime vurgulama (Highlight), sözlük entegrasyonu (kelimeye tıklayınca anlamı çıkması).
*   **AI Bileşenleri:** 
    *   **Akıllı Sözlük:** Kelimenin sadece sözlük anlamını değil, *o metindeki bağlamına uygun* anlamını AI ile açıklama.
    *   **Sesli Okuma Asistanı (TTS):** Metni disleksi dostu bir hızda, heceleyerek veya kelime kelime vurgulayarak okuyan AI seslendirmesi.
*   **Aksiyonlar:** Metni favorilere ekleme, metin analizini (okuma hızı vb.) veli/öğretmen ile paylaşma.

### 5.2. Mantık & Muhakeme Stüdyosu
*   **Özellikler:** Neden-sonuç ilişkisi, olay sıralama, mantıksızlık bulma.
*   **Tema:** "Her şey ters ise..." (Görsel olarak ters dönmüş objeler, doğru cevaplandıkça düzelir).
*   **AI Bileşenleri:**
    *   **Sokratik İpucu Motoru:** Öğrenci yanlış yaptığında doğrudan doğru cevabı vermek yerine, AI'ın öğrenciyi düşündürecek küçük ipuçları (scaffolding) üretmesi.
*   **Aksiyonlar:** Çözülen mantık bulmacasının ekran görüntüsünü alma ve "Başarı Kartı" olarak galeriye kaydetme.

### 5.3. Yazım & Noktalama Stüdyosu
*   **Özellikler:** Hatalı metni düzeltme, eksik noktalama işaretlerini sürükle-bırak ile yerleştirme.
*   **Araçlar:** Inline text editor (Sadece belirli kelimelerin değiştirilmesine izin veren özel editör).
*   **AI Bileşenleri:**
    *   **Dikte (Speech-to-Text):** Öğrencinin sesli okuduğu veya söylediği cümleyi AI'ın dinleyip, yazım hatalarını anında analiz etmesi ve görsel geri bildirim vermesi.
*   **Aksiyonlar:** Düzeltilmiş metni "Kendi Kitapçığıma Ekle" butonu ile öğrencinin kişisel arşivine gönderme.

### 5.4. Söz Varlığı & Kelime Oyunları
*   **Özellikler:** Eş/zıt anlam, gerçek/mecaz anlam, deyimler.
*   **Oyunlar:** Hafıza kartları (Flip card), kelime avı, hızlı eşleştirme.
*   **AI Bileşenleri:**
    *   **Dinamik Kelime Üretici:** Öğrencinin zorlandığı kelime tiplerini (örn: soyut kelimeler) tespit edip, AI'ın anında o kelimelerle ilgili yeni mini oyunlar/cümleler üretmesi (Adaptif Zorluk).
*   **Aksiyonlar:** Öğrenilen yeni kelimeleri "Kelime Kumbarası"na (Arşiv) kaydetme ve haftalık kelime listesi olarak yazdırma.

### 5.5. Soru Tipleri Fabrikası (Öğretmen/Admin Paneli)
*   **Özellikler:** Yeni metin ekleme, JSON şemasına uygun soru üretme arayüzü, öğrenciye ödev atama.
*   **AI Bileşenleri:**
    *   **Sihirli Soru Üretici (Magic Generator):** Öğretmen bir metin yapıştırdığında, AI'ın saniyeler içinde o metne uygun 5 farklı zorlukta çoktan seçmeli, doğru/yanlış ve boşluk doldurma sorusu üretmesi.
    *   **Metin Sadeleştirici:** Öğretmenin girdiği zor bir metni, AI'ın 1. veya 2. sınıf disleksili bir öğrencinin anlayabileceği seviyeye (Flesch-Kincaid skorunu düşürerek) otomatik uyarlaması.
*   **Aksiyonlar:** 
    *   Oluşturulan soru setini Oogmatik havuzunda diğer öğretmenlerle **paylaşma**.
    *   Soru setini taslak olarak **kaydetme** ve daha sonra düzenleme.
    *   Soru setini doğrudan sınıftaki akıllı tahtaya **yansıtma** (Cast API).

### 5.6. Çalışma Kağıdı Stüdyosu (PDF/Print/Arşiv)
*   **Özellikler:** Seçilen metin ve soruların Oogmatik antetli kağıdı formatında, disleksi dostu fontlarla PDF olarak indirilmesi.
*   **AI Bileşenleri:**
    *   **Kişiselleştirilmiş Fasikül:** AI'ın öğrencinin son 1 haftadaki analitik verilerini inceleyip, tam olarak eksik olduğu konulardan (örn: sadece virgül kullanımı ve zıt anlamlı kelimeler) oluşan özel bir PDF çalışma kağıdı derlemesi.
*   **Aksiyonlar:**
    *   **Yazdırma (Print):** Tarayıcının veya mobil cihazın native yazdırma diyaloğunu tetikleme.
    *   **Arşivleme:** Oluşturulan çalışma kağıdını öğretmenin "Geçmiş Çalışmalarım" arşivine kaydetme.
    *   **Kitapçığa Ekleme:** Birden fazla çalışma kağıdını birleştirip tek bir "Fasikül/Kitapçık" haline getirme ve toplu PDF alma.
    *   **Paylaşma:** Çalışma kağıdı linkini veya PDF dosyasını WhatsApp/Email üzerinden velilere gönderme.

---

## 7. Uygulama İçi İletişim ve Native Köprü (Bridge)

Süper Stüdyo, Oogmatik ana uygulaması (iOS/Android) içinde bir WebView veya iframe olarak çalışacaksa, aşağıdaki `postMessage` köprüleri (bridge) kurularak **tam entegrasyon** sağlanacaktır:

*   `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'UPDATE_OOGMATIK_SCORE', payload: { points: 50, badge: 'HIZLI_OKUYUCU' } }))` (Ana uygulamanın puanını güncelleme).
*   `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SYNC_AVATAR_DATA' }))` (Ana uygulamadan öğrencinin güncel avatarını çekme).
*   `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SAVE_TO_GALLERY', payload: base64Image }))`
*   `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SHARE_CONTENT', payload: { title, text, url } }))`
*   `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HAPTIC_FEEDBACK', payload: 'SUCCESS' }))` (Doğru cevapta cihazın titremesi).
*   `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'START_VOICE_RECOGNITION' }))` (Native mikrofonu tetikleyip AI dikte modülüne ses verisi gönderme).
*   `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NAVIGATE_BACK_TO_MAIN_APP' }))` (Süper Stüdyo'dan çıkıp ana uygulamanın ana menüsüne dönme).

---

## 7. Fazlandırılmış Geliştirme Yol Haritası (Roadmap)

### Faz 1: Çekirdek Altyapı ve Tasarım Sistemi (Hafta 1-2)
*   [ ] Next.js, TypeScript, Tailwind CSS, Zustand kurulumu.
*   [ ] Disleksi dostu tema motorunun (Theme Provider) yazılması (Font, renk, satır aralığı değiştiricileri).
*   [ ] Temel UI bileşenlerinin (Atomlar ve Moleküller) Radix UI tabanlı geliştirilmesi.
*   [ ] JSON veri şemalarının (Zod ile) validasyon kurallarının yazılması.
*   [ ] **Native Bridge (Köprü) Kurulumu:** Mobil uygulama ile haberleşecek `postMessage` altyapısının hazırlanması.

### Faz 2: Soru Motoru ve Metin Stüdyosu MVP (Hafta 3-4)
*   [ ] `TextPassage` bileşeninin geliştirilmesi (Satır izleme şeridi ve kelime vurgulama özellikleri ile).
*   [ ] Polimorfik soru bileşenlerinin (`MCQ`, `OpenEnded`, `TrueFalse`) kodlanması.
*   [ ] Zustand ile `SessionSlice` oluşturularak öğrenci cevaplarının ve sürelerin state'te tutulması.
*   [ ] İlk 10 metin ve bağlı sorularının sisteme mock data olarak girilmesi.
*   [ ] **Aksiyonlar:** Metni favorilere ekleme ve okuma analizini paylaşma butonlarının entegrasyonu.

### Faz 3: Mantık, Yazım ve Söz Varlığı Stüdyoları (Hafta 5-6)
*   [ ] Sürükle-bırak (Drag & Drop) altyapısının (`@dnd-kit/core` ile) kurulması.
*   [ ] Mantıksızlık bulma ("Her şey ters ise" teması) ekranlarının animasyonlu tasarımı.
*   [ ] Kelime eşleştirme (Flip card) ve boşluk doldurma oyunlarının geliştirilmesi.
*   [ ] Yazım ve noktalama için Inline Text Editor bileşeninin kodlanması.
*   [ ] **Aksiyonlar:** Ekran görüntüsü alma (`html2canvas`), "Başarı Kartı" oluşturma ve galeriye kaydetme.

### Faz 4: Çalışma Kağıdı Stüdyosu ve Öğretmen Paneli (Hafta 7-8)
*   [ ] `@react-pdf/renderer` entegrasyonu.
*   [ ] Seçilen metin ve soruların dinamik olarak PDF formatına dönüştürülmesi.
*   [ ] Öğretmenlerin soru filtreleme ve paket oluşturma ekranlarının (Soru Fabrikası UI) kodlanması.
*   [ ] **Aksiyonlar:** Yazdırma (Print), Arşivleme, "Kitapçığa Ekleme" (Fasikül oluşturma) ve WhatsApp/Email ile paylaşma özelliklerinin kodlanması.

### Faz 5: Analitik, Optimizasyon ve Pilot Test (Hafta 9-10)
*   [ ] Öğrenci performans verilerinin (Telemetry) backend'e gönderilmesi.
*   [ ] Erişilebilirlik (a11y) testleri (Lighthouse, ekran okuyucu testleri).
*   [ ] Bursa'daki uzmanlar ve öğrencilerle pilot testlerin yapılması ve geri bildirimlere göre UI revizyonları.

---

## 8. Gelecek Vizyonu (V2 Özellikleri)
*   **Sesli Okuma (Text-to-Speech):** Metinlerin ve soruların doğal bir sesle okunması (Web Speech API veya Azure TTS).
*   **Sesli Yanıt (Speech-to-Text):** Dikte modülü için öğrencinin sesini metne çeviren yapay zeka entegrasyonu.
*   **Adaptif Zorluk (AI):** Öğrenci üst üste hata yaptığında sistemin otomatik olarak daha kolay sorulara veya ipuçlarına geçiş yapması.
*   **Göz Takibi (Eye Tracking):** İleri seviye disleksi analizi için (Tablet/Webcam üzerinden) okuma sırasındaki göz hareketlerinin analizi.
