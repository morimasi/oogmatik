# Oogmatik Türkçe Süper Stüdyo - Premium Geliştirme ve Mimari Planı (V2.1 - Kusursuz Revizyon)

Bu doküman, **Oogmatik Türkçe Süper Stüdyo** projesinin uçtan uca, yüksek ölçeklenebilir, disleksi dostu ve MEB müfredatına tam uyumlu bir şekilde geliştirilmesi için hazırlanmış **Premium Seviye Teknik ve Pedagojik Mimari Planıdır**.

Bu plan, zaman içinde güncellenecek ve kodlama aşamasına geçildiğinde bir "Kuzey Yıldızı" (North Star) görevi görecektir. V2.1 revizyonu ile birlikte hata toleransı, maliyet yönetimi, güvenlik ve test altyapıları kusursuzlaştırılmıştır.

---

## 1. Oogmatik Ekosistemindeki Yeri: "Organik Süper Modül"

Türkçe Süper Stüdyo, Oogmatik uygulamasının **"Fiziksel Materyal Üretim Merkezi"**dir. Bu modülün temel amacı, öğrenciyi ekrana hapsetmek değil; ona özel, disleksi dostu, pedagojik olarak yapılandırılmış **fiziksel çalışma kağıtları ve fasikülleri** saniyeler içinde üretmektir.

### 1.1. Uygulama İçi Kusursuz Bütünlük (Seamless Integration)

- **Giriş Kapısı (Entry Point):** Oogmatik'in "Stüdyolar" sekmesinde, diğer modüllerin yanında **"Taçlı / Premium"** bir kart olarak yer alır. Tıklandığında, kullanıcı farklı bir uygulamaya geçtiğini hissetmez; Oogmatik'in kendi içindeki devasa bir "Türkçe Evrenine" akıcı bir animasyonla (Shared Layout) geçiş yapar.
- **Tekil Kimlik (Single Source of Truth):** Öğrencinin Oogmatik'teki avatarı, seviyesi, kazandığı rozetler ve "Oogmatik Jetonları" Süper Stüdyo'da doğrudan geçerlidir. Ayrı bir profil veya puan sistemi yoktur; her şey Oogmatik'in global veritabanına (Zustand/Supabase) bağlıdır.
- **Global Raporlama:** Süper Stüdyo'nun ürettiği tüm AI destekli okuma hızı, hata analizi ve gelişim raporları, Oogmatik'in mevcut Veli/Öğretmen Dashboard'unun "Türkçe" sekmesi altında organik olarak listelenir.
- **Çapraz Modül Etkileşimi:** Süper Stüdyo'da "Mantık" becerisi gelişen bir öğrencinin verisi, Oogmatik'in "Matematik & Mantık" stüdyosundaki zorluk seviyesini otomatik olarak ayarlar (Global Adaptif Öğrenme).

---

## 2. Modüler Proje Altyapısı ve Klasör Mimarisi (Feature-Sliced Design)

Süper Stüdyo, Oogmatik'in mevcut Next.js (App Router) mimarisi içine, yüksek ölçeklenebilirlik ve bakım kolaylığı sağlayan **Feature-Sliced Design (FSD)** veya benzeri bir modüler yaklaşımla entegre edilecektir.

### 2.1. Önerilen Klasör Yapısı (Directory Structure)

```text
src/
├── app/
│   └── (studios)/
│       └── turkce-super-studyo/      # Süper Stüdyo'nun ana giriş noktası (Entry Point)
│           ├── layout.tsx            # Stüdyo özel layout (Zen Mode, Global Timer vb.)
│           ├── page.tsx              # Stüdyo ana karşılama ekranı
│           ├── metin-paragraf/       # Alt stüdyo rotaları
│           ├── mantik-muhakeme/
│           └── yazim-noktalama/
├── modules/
│   └── turkce-super-studyo/          # Süper Stüdyo'nun tüm iş mantığı ve bileşenleri
│       ├── components/               # Sadece bu modüle özel UI bileşenleri
│       │   ├── atoms/                # (Örn: ReadingRuler, DyslexicText)
│       │   ├── molecules/            # (Örn: QuestionOption, HintButton)
│       │   └── organisms/            # (Örn: QuestionEngine, TextPassage)
│       ├── hooks/                    # Modüle özel custom hook'lar (Örn: useReadingSpeed)
│       ├── store/                    # Zustand slice'ları (Örn: useTurkceSessionStore)
│       ├── types/                    # Polimorfik JSON şemaları ve TypeScript interfaceleri
│       ├── utils/                    # Yardımcı fonksiyonlar (Örn: calculateFleschKincaid)
│       └── ai/                       # OpenAI/Whisper entegrasyon servisleri
└── shared/                           # Oogmatik'in genel bileşenleri (Süper Stüdyo da bunları kullanır)
    ├── ui/                           # Global butonlar, modallar
    └── store/                        # Global kullanıcı, tema ve disleksi ayarları
```

### 2.2. Mimari Prensipler

- **İzolasyon:** `modules/turkce-super-studyo` klasörü kendi içinde bağımsız çalışabilmeli, ancak `shared` klasöründeki global Oogmatik bileşenlerini tüketebilmelidir.
- **Lazy Loading:** Performansı artırmak için, özellikle AI bileşenleri (TTS, STT) ve PDF üretici (`@react-pdf/renderer`) sadece ihtiyaç duyulduğunda dinamik olarak yüklenecektir (`next/dynamic`).
- **Ultra Özelleştirilebilirlik:** Her bileşen, `shared/store` içindeki disleksi ayarlarını (font boyutu, satır aralığı, renk teması) dinleyecek ve anında tepki verecektir.

---

## 3. Sistem Mimarisi ve Teknoloji Yığını (Tech Stack)

Proje, Oogmatik'in mevcut modern web standartlarına uygun, yüksek performanslı ve erişilebilir (a11y) altyapısı üzerine inşa edilecektir.

### 3.1. Çekirdek Teknolojiler

- **Core Framework:** Next.js 14+ (App Router) - Oogmatik'in mevcut mimarisiyle tam uyumlu.
- **Dil:** TypeScript (Strict Mode) - Tip güvenliği, polimorfik veri modelleri ve hatasız geliştirme deneyimi.
- **Paket Yöneticisi:** pnpm veya bun (Hızlı kurulum ve monorepo uyumluluğu için).

### 3.2. State Management (Durum Yönetimi)

- **Global State (İstemci):** Zustand (Oogmatik'in global oturum yönetimi, kullanıcı tercihleri, tema, disleksi ayarları ile paylaşımlı).
- **Server State (Sunucu):** React Query (TanStack Query) v5 (Veri çekme, önbellekleme, optimistik güncellemeler).
- **Form Yönetimi:** React Hook Form + Zod (Performanslı ve tip güvenli form validasyonları).

### 3.3. Stilleme & UI (Kullanıcı Arayüzü)

- **CSS Framework:** Tailwind CSS v3/v4 (Oogmatik'in mevcut disleksi dostu konfigürasyonu ile entegre).
- **Animasyon:** Framer Motion (Akıcı, bilişsel yükü artırmayan mikro-animasyonlar, sayfa geçişleri).
- **Erişilebilir Bileşenler:** Radix UI Primitives (Erişilebilir, klavye dostu, WAI-ARIA uyumlu temel bileşenler).
- **İkonografi:** Lucide React veya Phosphor Icons (Oogmatik'in genel tasarım diliyle uyumlu).

### 3.4. Araçlar, Entegrasyonlar ve AI (Premium Özellikler)

- **Yapay Zeka (AI) Çekirdeği:** OpenAI API (GPT-4o) veya Anthropic Claude 3.5 Sonnet (Metin analizi, dinamik soru üretimi, anında geri bildirim ve adaptif zorluk için).
- **Ses İşleme (AI):** Whisper API (Dikte ve sesli okuma analizi için Speech-to-Text) ve ElevenLabs / Azure TTS (Doğal ve duygulu Text-to-Speech).
- **PDF Üretimi & Yazdırma:** `@react-pdf/renderer` (Çalışma Kağıdı Stüdyosu için sunucu/istemci tarafı PDF render ve doğrudan yazdırma).
- **Ekran Görüntüsü Alma:** `html2canvas` veya `dom-to-image` (Öğrencinin başarısını anında PNG/JPEG olarak kaydetmesi).
- **Paylaşım (Web Share API):** Native paylaşım menüsü entegrasyonu (WhatsApp, Email, Sistem panosu).
- **Sürükle-Bırak (Drag & Drop):** `@dnd-kit/core` (Erişilebilir, performanslı ve mobil uyumlu sürükle-bırak etkileşimleri).
- **Veritabanı & Backend:** Oogmatik'in mevcut backend'i (Supabase/PostgreSQL veya REST/GraphQL) ile doğrudan entegrasyon.
- **Analitik:** PostHog veya özel Telemetry servisi (Öğrenci etkileşimlerini, hata oranlarını ve süreleri takip etmek için).

### 3.5. Hata Yönetimi, Önbellekleme ve Resilience (Dayanıklılık)

- **Çevrimdışı (Offline) Destek & State Persistence:** Zustand `persist` middleware kullanılarak öğrencinin anlık oturumu `localStorage` veya `IndexedDB`'ye kaydedilir. Öğrenci yanlışlıkla sekmeyi kapatsa veya internet kopsa bile, geri döndüğünde tam kaldığı sorudan devam edebilir.
- **AI Fallback (Graceful Degradation):** OpenAI veya Claude API'lerinin çökmesi veya zaman aşımına uğraması durumunda sistem kilitlenmez. Otomatik olarak "AI Modu"ndan çıkarak veritabanındaki önceden üretilmiş statik soruları (Hızlı Mod) devreye sokar.
- **Medya Önbellekleme (CDN Caching):** TTS ile üretilen ses dosyaları veya AI ile üretilen piktogramlar anlık olarak Supabase Storage (veya AWS S3) üzerine kaydedilir ve CDN üzerinden sunulur. Aynı metin veya kelime tekrar istendiğinde API'ye gitmek yerine önbellekten (cache) anında çekilir.

### 3.6. FinOps ve AI Maliyet Yönetimi

- **Semantic Caching (Anlamsal Önbellekleme):** Öğretmenler benzer metinler için soru üretmek istediğinde (örn: Redis + Vektör DB eşleşmesi ile), eğer %95 benzer bir metin için daha önce soru üretilmişse, AI'a istek atmak yerine mevcut havuzdaki sorular getirilir.
- **Token Bütçelendirmesi:** API maliyetlerini kontrol altında tutmak için öğretmen/okul bazlı günlük/aylık Token limitleri (Rate Limiting) uygulanır.

### 3.7. Gizlilik ve Veri Güvenliği (KVKK / COPPA Uyumluluğu)

- **Ephemeral Audio Processing (Geçici Ses İşleme):** Dikte modülünde (Whisper API) çocukların ses kayıtları **kesinlikle sunucularda saklanmaz (Store edilmez)**. Ses verisi sadece stream (akış) olarak işlenir, metne çevrildikten hemen sonra bellekten kalıcı olarak silinir. Bu kural, çocukların dijital mahremiyeti (COPPA ve KVKK) için katı bir mimari prensiptir.

---

## 4. İkili Üretim Motoru (Dual-Engine Architecture): Hızlı vs AI Mod

Süper Stüdyo, profesyonel kullanım senaryolarına göre iki farklı üretim modu sunar. Bu modlar, hem verimlilik hem de pedagojik derinlik arasında dinamik bir denge sağlar.

### 4.1. Hızlı Mod (Fast Mode - Hızlı Kağıt Üretimi)

- **Çalışma Prensibi:** Mevcut şablonları ve önbelleğe alınmış soruları kullanarak milisaniyeler içinde PDF oluşturur.
- **Kullanım:** Standart günlük ödevler, hızlı tekrar kağıtları.
- **Avantajı:** Sıfır API maliyeti, anında yanıt süresi.

### 4.2. AI Mod (AI Mode - Kişiselleştirilmiş Premium Fasiküller)

- **Çalışma Prensibi:** Öğrencinin bireysel gelişim verisini analiz eder ve o günkü ihtiyacına özel "Sıfırdan Metin ve Soru" tasarlayarak PDF'e döker.
- **Kullanım:** Bireysel Eğitim Planı (BEP) destekli özel çalışma fasikülleri.
- **Avantajı:** Maksimum kişiselleştirme, adaptif zorluk.

---

## 5. PDF Üretim Motoru ve Bileşen Kütüphanesi (@react-pdf/renderer)

Çalışma kağıtları basit birer PDF değil, disleksi dostu standartlara (Dyslexia Friendly Style Guide) %100 uyumlu, yüksek kaliteli "Grafik Tasarım" ürünleridir.

### 5.1. PDF Atomları (Temel Bileşenler)

- **`DyslexicPage`:** Standart A4 çerçevesi, kırık beyaz arka plan (Cream/Pastel Yellow), sayfa numaraları ve Oogmatik logolu antet.
- **`GuidedText`:** Satır aralığı (Line-height) ve harf aralığı (Tracking) ayarlanabilir disleksi fontu bloğu.
- **`SyllableBox`:** Kelimeyi hecelerine bölen ve her heceyi farklı renkle (Kırmızı/Mavi) veya alt çizgiyle ayıran özel render bileşeni.
- **`WritingLine`:** Düz çizgi yerine disleksili çocuklar için "Zemin - Boy - Kuyruk" (Ground-Sky-Root) çizgileri içeren yazma alanları.
- **`IconSupport`:** Metin yanına otomatik yerleşen, anlamı pekiştiren piktogramlar.

### 5.2. PDF Molekülleri (Yapısal Bileşenler)

- **`QuestionBlock`:** Soru kökü, seçenekler (yatay/dikey) ve öğrencinin cevabı işaretlemesi için büyük dokunmatik/kalem kutucukları.
- **`LogicGrid`:** Mantık bulmacaları için otomatik oluşturulan X/O tabloları.
- **`VocabularyMap`:** Kelime ilişkilerini gösteren zihin haritaları (Spider maps).
- **`CutOutStation`:** Sayfanın altında/yanında yer alan, kesilip eşleştirilebilecek küçük "Flash Card" alanları.

---

## 6. Alt Stüdyo Detayları ve Derin Özelleştirmeler (Fabrika Ayarları)

Her stüdyo, öğretmenin "Üret" demeden önce ayarlayabileceği mikro-parametreler sunar.

### 6.1. Metin & Paragraf Stüdyosu

- **Özellikler:** Kişiselleştirilmiş metin üretimi ve anlama soruları.
- **Özelleştirmeler:**
  - **Okuma Rehberi Modu:** Cümlelerin başına "Okuma Takip Noktaları" (Dots) ekleme.
  - **Alt Sözlük:** Zor kelimelerin kağıdın en altında görsel/yazılı açıklaması (Glossary).
  - **Heceleme Tipi:** Renkli heceleme veya altı çizili heceleme seçimi.

### 6.2. Mantık & Muhakeme Stüdyosu

- **Özellikler:** Neden-sonuç, olay sıralama ve görsel mantık bulmacaları.
- **Özelleştirmeler:**
  - **Görsel İpucu Yoğunluğu:** Bulmacanın yanına eklenecek piktogram miktarı (Düşük/Yüksek).
  - **Çözüm Alanı:** Adım adım yönlendirmeli (Guided hint boxes) çözüm kutuları.

### 6.3. Yazım & Noktalama Stüdyosu

- **Özellikler:** Hatalı metin düzeltme ve noktalama yerleştirme antrenmanları.
- **Özelleştirmeler:**
  - **Yazma Hattı:** Disleksi dostu "Kılavuz Çizgili" veya "Geniş Aralıklı" satır seçimi.
  - **İşaret Menüsü:** Noktalama işaretlerinin sayfa kenarında "çıkartma/kes-yapıştır" formatında sunulması.

### 6.4. Söz Varlığı & Kelime Fabrikası

- **Özellikler:** Eş/Zıt anlam, deyimler ve kelime oyunları.
- **Özelleştirmeler:**
  - **Kart Boyutu:** Kesilebilir hafıza kartları için A7 veya Kare format seçimi.
  - **Görsel Destek:** Soyut kelimeler için AI tarafından üretilen görsel piktogramlar.

---

## 7. Veri Modelleri ve JSON Şemaları (Soru Motoru Çekirdeği)

Sistem, tek bir metinden sınırsız soru üretebilen **Polimorfik JSON** mimarisine dayanır. Bu yapı, veritabanında esnek depolama ve frontend'de dinamik render sağlar.

### 7.1. `Text` (Metin) Şeması

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
    audioUrl?: string; // Sesli okuma için (CDN Cache linki)
    imageUrl?: string; // Görsel destek için
  };
}
```

### 7.2. `Question` (Soru) Şeması (Polimorfik)

```typescript
type QuestionType =
  | 'MCQ'
  | 'OPEN_ENDED'
  | 'TRUE_FALSE'
  | 'FILL_BLANK'
  | 'DRAG_DROP'
  | 'LOGIC_MATCH'
  | 'SPELLING_CORRECT';

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

### 7.3. `Session` (Oturum ve Analitik) Şeması

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

## 8. Disleksi Dostu UI/UX ve Premium Tasarım Sistemi (Design System)

Tasarım sistemi, bilişsel yükü en aza indirmek ve okuma güçlüğü çeken öğrencilere maksimum destek sağlamak üzere kurgulanmıştır. Bu ayarlar kullanıcı bazlı olarak özelleştirilebilir olacaktır.

### 8.1. Premium Arayüz (UI) Vizyonu

- **Cam Efekti (Glassmorphism):** Arka planda çok hafif, göz yormayan, bulanıklaştırılmış (blur) organik şekiller ve ön planda net, yüksek kontrastlı kartlar.
- **Mikro-Etkileşimler (Micro-interactions):** Butonlara tıklandığında veya doğru cevap verildiğinde, ekranda konfeti patlaması yerine, daha sakin ama tatmin edici "sıvı" (liquid) veya "yumuşak sıçrama" (soft bounce) animasyonları.
- **Derinlik ve Gölgelendirme (Neumorphism/Soft UI):** Öğelerin tıklanabilir olduğunu hissettiren, ancak gözü yormayan çok yumuşak iç ve dış gölgeler.
- **Odak Modu (Zen Mode):** Öğrenci soru çözerken, ekrandaki tüm gereksiz menülerin, puanların ve butonların yavaşça silikleşerek (fade out) sadece soruya odaklanılmasını sağlayan özel bir arayüz durumu.

### 8.2. Tipografi (Typography)

- **Font Ailesi:** Birincil olarak `OpenDyslexic`, `Lexend`, `Atkinson Hyperlegible` veya `Comic Sans MS` (Kullanıcı tercihine bağlı değiştirilebilir).
- **Satır Aralığı (Line Height):** Minimum `1.5` (Tercihen `1.75` veya `2.0`).
- **Harf Aralığı (Letter Spacing):** Standarttan `%10-20` daha geniş.
- **Kelime Aralığı (Word Spacing):** Standarttan `%10` daha geniş.
- **Paragraf Aralığı:** Paragraflar arası belirgin boşluklar (margin-bottom: `2rem`).
- **Hizalama:** Sadece sola hizalı (Justify KESİNLİKLE kullanılmayacak).

### 8.3. Renk Paleti ve Kontrast (WCAG AAA Uyumlu)

- **Arka Plan:** Saf beyaz (`#FFFFFF`) **kullanılmayacak**. Göz yormayan kırık beyaz, pastel sarı, açık mavi veya krem tonları (`#FAFAFA`, `#FFFDF0`, `#F0F8FF`).
- **Metin Rengi:** Saf siyah (`#000000`) yerine koyu gri/lacivert (`#1F2937`, `#0F172A`).
- **Vurgular:** Bilgiyi iletmek için sadece renk kullanılmayacak; renk + ikon + kalınlık kombinasyonu kullanılacak.
- **Tema Seçenekleri:** "Sıcak Tema" (Krem/Kahve), "Soğuk Tema" (Açık Mavi/Lacivert), "Yüksek Kontrast".

### 8.4. Etkileşim ve Odak (Interaction & Focus)

- **Satır İzleme Şeridi (Reading Ruler):** İmlecin veya parmağın bulunduğu satırı hafifçe vurgulayan, diğer satırları hafifçe soluklaştıran opsiyonel bir okuma aracı.
- **Büyük Tıklama Alanları:** Butonlar ve seçenekler için minimum `48x48px` dokunma alanı.

---

## 9. Modül Geliştirme Stratejisi (Atomic Design)

Bileşenler "Atomic Design" prensibiyle geliştirilecektir.

1.  **Atoms (Atomlar):** `Button`, `TagChip`, `Icon`, `Typography`, `ProgressBar`, `Checkbox`, `Radio`.
2.  **Molecules (Moleküller):** `OptionItem` (Seçenek + Checkbox), `TimerDisplay`, `ReadingRuler`, `HintButton`.
3.  **Organisms (Organizmalar):** `QuestionContainer` (Soru metni + Seçenekler + Kontrol Butonu), `TextPassage` (Metin + Vurgulama araçları), `DragDropList`.
4.  **Templates (Şablonlar):** `StudioLayout` (Sol menü, üst bar, ana içerik alanı), `QuizLayout`.
5.  **Pages (Sayfalar):** Metin & Paragraf Stüdyosu Ana Ekranı, Soru Çözüm Oturumu, Öğretmen Dashboard'u.

---

## 10. Stüdyo Detayları ve Özellikleri (AI Destekli)

### 10.1. Metin & Paragraf Stüdyosu

- **Özellikler:** Metin okuma, anlama, ana fikir bulma.
- **Araçlar:** Metin içi kelime vurgulama (Highlight), sözlük entegrasyonu (kelimeye tıklayınca anlamı çıkması).
- **AI Bileşenleri:**
  - **Akıllı Sözlük:** Kelimenin sadece sözlük anlamını değil, _o metindeki bağlamına uygun_ anlamını AI ile açıklama.
  - **Sesli Okuma Asistanı (TTS):** Metni disleksi dostu bir hızda, heceleyerek veya kelime kelime vurgulayarak okuyan AI seslendirmesi.
- **Aksiyonlar:** Metni favorilere ekleme, metin analizini (okuma hızı vb.) veli/öğretmen ile paylaşma.

### 10.2. Mantık & Muhakeme Stüdyosu

- **Özellikler:** Neden-sonuç ilişkisi, olay sıralama, mantıksızlık bulma.
- **Tema:** "Her şey ters ise..." (Görsel olarak ters dönmüş objeler, doğru cevaplandıkça düzelir).
- **AI Bileşenleri:**
  - **Sokratik İpucu Motoru:** Öğrenci yanlış yaptığında doğrudan doğru cevabı vermek yerine, AI'ın öğrenciyi düşündürecek küçük ipuçları (scaffolding) üretmesi.
- **Aksiyonlar:** Çözülen mantık bulmacasının ekran görüntüsünü alma ve "Başarı Kartı" olarak galeriye kaydetme.

### 10.3. Yazım & Noktalama Stüdyosu

- **Özellikler:** Hatalı metni düzeltme, eksik noktalama işaretlerini sürükle-bırak ile yerleştirme.
- **Araçlar:** Inline text editor (Sadece belirli kelimelerin değiştirilmesine izin veren özel editör).
- **AI Bileşenleri:**
  - **Dikte (Speech-to-Text):** Öğrencinin sesli okuduğu veya söylediği cümleyi AI'ın dinleyip, yazım hatalarını anında analiz etmesi ve görsel geri bildirim vermesi.
- **Aksiyonlar:** Düzeltilmiş metni "Kendi Kitapçığıma Ekle" butonu ile öğrencinin kişisel arşivine gönderme.

### 10.4. Söz Varlığı & Kelime Oyunları

- **Özellikler:** Eş/zıt anlam, gerçek/mecaz anlam, deyimler.
- **Oyunlar:** Hafıza kartları (Flip card), kelime avı, hızlı eşleştirme.
- **AI Bileşenleri:**
  - **Dinamik Kelime Üretici:** Öğrencinin zorlandığı kelime tiplerini (örn: soyut kelimeler) tespit edip, AI'ın anında o kelimelerle ilgili yeni mini oyunlar/cümleler üretmesi (Adaptif Zorluk).
- **Aksiyonlar:** Öğrenilen yeni kelimeleri "Kelime Kumbarası"na (Arşiv) kaydetme ve haftalık kelime listesi olarak yazdırma.

### 10.5. Soru Tipleri Fabrikası (Öğretmen/Admin Paneli)

- **Özellikler:** Yeni metin ekleme, JSON şemasına uygun soru üretme arayüzü, öğrenciye ödev atama.
- **AI Bileşenleri:**
  - **Sihirli Soru Üretici (Magic Generator):** Öğretmen bir metin yapıştırdığında, AI'ın saniyeler içinde o metne uygun 5 farklı zorlukta çoktan seçmeli, doğru/yanlış ve boşluk doldurma sorusu üretmesi.
  - **Metin Sadeleştirici:** Öğretmenin girdiği zor bir metni, AI'ın 1. veya 2. sınıf disleksili bir öğrencinin anlayabileceği seviyeye (Flesch-Kincaid skorunu düşürerek) otomatik uyarlaması.
- **Aksiyonlar:**
  - Oluşturulan soru setini Oogmatik havuzunda diğer öğretmenlerle **paylaşma**.
  - Soru setini taslak olarak **kaydetme** ve daha sonra düzenleme.
  - Soru setini doğrudan sınıftaki akıllı tahtaya **yansıtma** (Cast API).

### 10.6. Çalışma Kağıdı Stüdyosu (PDF/Print/Arşiv)

- **Özellikler:** Seçilen metin ve soruların Oogmatik antetli kağıdı formatında, disleksi dostu fontlarla PDF olarak indirilmesi.
- **AI Bileşenleri:**
  - **Kişiselleştirilmiş Fasikül:** AI'ın öğrencinin son 1 haftadaki analitik verilerini inceleyip, tam olarak eksik olduğu konulardan (örn: sadece virgül kullanımı ve zıt anlamlı kelimeler) oluşan özel bir PDF çalışma kağıdı derlemesi.
- **Aksiyonlar:**
  - **Yazdırma (Print):** Tarayıcının veya mobil cihazın native yazdırma diyaloğunu tetikleme.
  - **Arşivleme:** Oluşturulan çalışma kağıdını öğretmenin "Geçmiş Çalışmalarım" arşivine kaydetme.
  - **Kitapçığa Ekleme:** Birden fazla çalışma kağıdını birleştirip tek bir "Fasikül/Kitapçık" haline getirme ve toplu PDF alma.
  - **Paylaşma:** Çalışma kağıdı linkini veya PDF dosyasını WhatsApp/Email üzerinden velilere gönderme.

---

## 11. Uygulama İçi İletişim ve Native Köprü (Bridge)

Süper Stüdyo, Oogmatik ana uygulaması (iOS/Android) içinde bir WebView veya iframe olarak çalışacaksa, aşağıdaki `postMessage` köprüleri (bridge) kurularak **tam entegrasyon** sağlanacaktır:

- `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'UPDATE_OOGMATIK_SCORE', payload: { points: 50, badge: 'HIZLI_OKUYUCU' } }))`
- `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SYNC_AVATAR_DATA' }))`
- `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SAVE_TO_GALLERY', payload: base64Image }))`
- `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SHARE_CONTENT', payload: { title, text, url } }))`
- `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'HAPTIC_FEEDBACK', payload: 'SUCCESS' }))`
- `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'START_VOICE_RECOGNITION' }))`
- `window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'NAVIGATE_BACK_TO_MAIN_APP' }))`

---

## 12. Fazlandırılmış Geliştirme Yol Haritası ve Task Yönetimi (Roadmap)

Bu bölüm, projenin kodlama aşamasında takip edilecek **kesin task listesini** içerir. Her bir task, "Ultra Premium" kalite standartlarına ve Test-Driven Development (TDD) süreçlerine göre tamamlanacaktır.

### Faz 1: Modüler Altyapı, Çekirdek Kurulum ve Test (Hafta 1-2)

- [ ] **Task 1.1:** Oogmatik projesi içinde `modules/turkce-super-studyo` klasör yapısının (Feature-Sliced Design) oluşturulması.
- [ ] **Task 1.2:** `shared/store` içindeki global disleksi ayarlarını dinleyen ve Süper Stüdyo'ya uygulayan `ThemeProvider` entegrasyonu.
- [ ] **Task 1.3:** Polimorfik JSON veri şemalarının (`Text`, `Question`, `Session`) TypeScript interfacelerinin ve Zod validasyon kurallarının yazılması.
- [ ] **Task 1.4:** Süper Stüdyo Giriş Paneli (PDF Yazdırma Merkezi) UI tasarımının yapılması.
- [ ] **Task 1.5:** PDF Render Motoru (`@react-pdf/renderer`) için disleksi dostu Global Layout şablonlarının oluşturulması.
- [ ] **Task 1.6:** **(QA)** Zod şemaları ve core logic için Vitest/Jest Unit Test altyapısının kurulması ve ilk veri testlerinin yazılması.

### Faz 2: Ortak UI Bileşenleri ve Metin Stüdyosu MVP (Hafta 3-4)

- [ ] **Task 2.1:** Temel Atom ve Molekül bileşenlerinin (Radix UI tabanlı) geliştirilmesi (`ReadingRuler`, `DyslexicText`, `HintButton`).
- [ ] **Task 2.2:** `TextPassage` bileşeninin geliştirilmesi (Satır izleme şeridi, kelime vurgulama ve AI Akıllı Sözlük entegrasyonu ile).
- [ ] **Task 2.3:** Polimorfik soru bileşenlerinin (`MCQ`, `OpenEnded`, `TrueFalse`, `FillBlank`) kodlanması.
- [ ] **Task 2.4:** Zustand ile `useTurkceSessionStore` oluşturularak öğrenci cevaplarının state'te tutulması (ve `persist` ile local depolamaya bağlanması).
- [ ] **Task 2.5:** **(QA)** Kritik etkileşim bileşenleri (Satır izleme, butonlar) için UI ve Erişilebilirlik (a11y) testlerinin yazılması.

### Faz 3: Mantık, Yazım ve Söz Varlığı Stüdyoları (Hafta 5-6)

- [ ] **Task 3.1:** Sürükle-bırak (Drag & Drop) altyapısının (`@dnd-kit/core` ile) kurulması ve "Olay Sıralama" bileşeninin yazılması.
- [ ] **Task 3.2:** Mantıksızlık bulma ("Her şey ters ise" teması) ekranlarının Framer Motion ile animasyonlu tasarımı.
- [ ] **Task 3.3:** Yazım ve noktalama için "Inline Text Editor" bileşeninin kodlanması.
- [ ] **Task 3.4:** Kelime eşleştirme (Flip card) ve boşluk doldurma oyunlarının geliştirilmesi.

### Faz 4: AI Entegrasyonları ve Soru Fabrikası (Hafta 7-8)

- [ ] **Task 4.1:** OpenAI/Claude API entegrasyonu ile "Sihirli Soru Üretici" servisinin yazılması ve **Semantic Caching** entegrasyonu.
- [ ] **Task 4.2:** "Metin Sadeleştirici" AI servisinin kodlanması (Flesch-Kincaid algoritması bazlı kontrol ile).
- [ ] **Task 4.3:** Whisper API entegrasyonu ile "Dikte" modülünün yazılması (**Sıkı KVKK Kuralı:** Ephemeral stream processing).
- [ ] **Task 4.4:** ElevenLabs / Azure TTS entegrasyonu ile "Sesli Okuma Asistanı"nın geliştirilmesi (Üretilen seslerin CDN'e cache'lenmesi).
- [ ] **Task 4.5:** Öğretmenlerin soru filtreleme, metin ekleme ve AI Token/Bütçe kısıtlamalarının (Rate Limiting) UI'a yansıtılması.
- [ ] **Task 4.6:** AI Modu için çok aşamalı "İpucu Fabrikası" (Scaffolding) entegrasyonu.
- [ ] **Task 4.7:** Öğrencinin tepki sürelerini ve hata sıklığını ölçerek otomatik olarak "Hızlı Mod" sadeliğine düşüren Fallback (Graceful Degradation) sistemi.

### Faz 5: Çalışma Kağıdı Stüdyosu ve Global Entegrasyon (Hafta 9-10)

- [ ] **Task 5.1:** `@react-pdf/renderer` entegrasyonu ve "Kişiselleştirilmiş Fasikül" PDF şablonlarının oluşturulması.
- [ ] **Task 5.2:** AI destekli "Fasikül Derleyici"nin yazılması.
- [ ] **Task 5.3:** Süper Stüdyo puanlarının ve rozetlerinin Oogmatik'in global Leaderboard'una bağlanması.
- [ ] **Task 5.4:** Öğrenci performans verilerinin (Telemetry) Oogmatik Dashboard'una Real-time aktarılması.
- [ ] **Task 5.5:** Çalışma kağıdı linkini veya PDF dosyasını paylaşma (Web Share API) entegrasyonu.

### Faz 6: Optimizasyon, Güvenlik ve Canlıya Alma (Hafta 11-12)

- [ ] **Task 6.1:** Performans Optimizasyonu: AI bileşenleri (TTS, STT) ve PDF üretici gibi paketlerin `next/dynamic` ile Lazy Load edilmesi.
- [ ] **Task 6.2:** Uçtan Uca (E2E) Testler: Tüm stüdyo akışının Cypress veya Playwright ile test edilmesi.
- [ ] **Task 6.3:** Güvenlik Denetimi: Rate Limiting kurallarının ve KVKK veri akışının son kontrolü.
- [ ] **Task 6.4:** Pilot testlerin yapılması, Telemetry verilerinin incelenmesi ve UI/UX revizyonlarının tamamlanması.

---

## 13. Gelecek Vizyonu (V3 Özellikleri)

- **Göz Takibi (Eye Tracking) Analizi:** İleri seviye disleksi teşhisi ve metin adaptasyonu için, tablet veya bilgisayar kamerası üzerinden öğrencinin okuma sırasındaki göz sıçramalarını (saccades) analiz eden özel algoritma entegrasyonu.
- **Artırılmış Gerçeklik (AR) Çalışma Kağıtları:** Çıktısı alınan PDF fasiküllerin Oogmatik mobil uygulaması ile okutulduğunda, kağıt üzerindeki piktogramların veya hayvanların 3 boyutlu canlanması (AR Bridge).
- **EEG Odak Bandı Entegrasyonu:** Dikkat eksikliği odaklı (DEHB + Disleksi) öğrenciler için, piyasadaki odak tespit bantlarından alınan biyometrik verilerle metnin zorluğunu milisaniyeler içinde ekranda değiştiren Nöro-Adaptif okuma modu.
- **Çoklu Oyuncu (Co-op) Okuma Odaları:** İki öğrencinin aynı metni, farklı cihazlardan senkronize olarak birbirlerine sesli okuduğu, AI'ın her iki tarafın okuma hızını ölçüp dengelediği "Dijital Kütüphane" modülü.
