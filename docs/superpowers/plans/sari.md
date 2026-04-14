# Sarı Kitap Etkinlik Stüdyosu — Kapsamlı Modüler Uygulama Planı

> **Proje**: Oogmatik EdTech Platformu
> **Modül**: Sarı Kitap Etkinlik Stüdyosu (SariKitapStudio)
> **Sürüm**: v2.0 — Tam Modüler Mimari
> **Tarih**: 2026-04-14
> **Durum**: Onay Bekliyor

---

## 👑 Lider Ajan Değerlendirmeleri

### 🎓 Elif Yıldız — Pedagoji / ZPD Onayı

**Değerlendirme:** ✅ ONAYLI (Koşullu)

> Bu stüdyo, disleksili çocuklarda göz takibi, odaklanma süresi ve seçici dikkat becerilerini
> geliştiren kanıta dayalı yöntemleri (Pencere, Nokta, Köprü) dijitalleştiriyor. Her format
> Orton-Gillingham ve Neurological Impress yaklaşımlarıyla uyumlu.

**Pedagojik koşullar:**
1. İlk etkinlik maddesi **her zaman** kolay olmalı (güven inşası prensibi)
2. Her AI çıktısında `pedagogicalNote` alanı **zorunlu** — öğretmene "neden bu format" açıklaması
3. ZPD uyumu: `AgeGroup` × `Difficulty` kombinasyonu → heceleme karmaşıklığı otomatik ayarlanmalı
4. Lexend font **kesinlikle** değiştirilmemeli — satır aralığı min 1.6, harf aralığı min 0.02em
5. **Çift Metin** formatı sadece `11-13` ve `14+` yaş gruplarına sunulmalı (bilişsel yük kontrolü)
6. **Başarısızlık hissi oluşturan UI yasak** — süre/hız göstergesi yerine "tebrik/teşvik" mesajları
7. Her etkinlik için `targetSkills[]` alanı zorunlu (örn: `['reading_fluency', 'attention_focus']`)

### 🏥 Dr. Ahmet Kaya — Klinik / MEB / KVKK Onayı

**Değerlendirme:** ✅ ONAYLI (Koşullu)

> Klinik olarak bu formatlar MEB 2024-2025 Özel Eğitim Yönetmeliği ile uyumludur.
> Hızlı okumaya geçiş materyalleri BEP hedefleri için referans kaynaktır.

**Klinik koşullar:**
1. **Tanı koyucu dil yasak**: "Bu çocuğun disleksisi var" → "Okuma desteğine ihtiyaç duyan öğrenci"
2. **KVKK**: Öğrenci adı + tanı + performans skoru aynı ekranda/çıktıda birlikte GÖSTERLMEZ
3. **BEP entegrasyonu**: Üretilen etkinlikler SMART formatında BEP hedeflerine bağlanabilmeli
4. **Klinik profil desteği**: Her etkinlik `LearningDisabilityProfile` ('dyslexia' | 'adhd' | 'mixed') ile taglenebilmeli
5. **Pencere formatı**: Epilepsi uyarısı — hızlı pencere açılımı/kapanımı 3Hz'i geçmemeli
6. **İlerleme kaydı**: Firestore'a kaydedilen etkinliklerde `performanceNote` alanı klinik notlar için olmalı
7. **573 KHK uyumu**: Materyaller "destek eğitim materyali" olarak etiketlenmeli, "tanı aracı" olarak değil

### ⚙️ Bora Demir — Mühendislik Onayı

**Değerlendirme:** ⚠️ ONAYLI (Kritik Düzeltmelerle)

> Mevcut plandaki `z.any()` kullanımı projede kesinlikle yasak. Tip sistemi
> discriminated union ile yeniden tasarlanmalı. Her alt modül bağımsız test edilebilir olmalı.

**Mühendislik koşulları:**
1. **`any` tipi kesinlikle yasak** → `unknown` + type guard kullan
2. Mevcut `sariKitap.ts`'deki `z.any()` → tam Zod şemasına dönüştürülecek
3. Her etkinlik tipi **kendi modül dosyasında** (tip, renderer, config panel, prompt builder, test)
4. `AppError` standardı: `{ success, error: { message, code }, timestamp }` — istisnasız
5. Yeni endpoint: `validateCorsAndMethod()` + `rateLimiter.enforceLimit()` + `retryWithBackoff()`
6. `console.log` yasak → `logError()` kullan
7. Her bileşen `React.memo()` ile sarılmalı (re-render optimizasyonu)
8. **ErrorBoundary** her renderer etrafında zorunlu (bir renderer crash'lerse tüm stüdyo ölmemeli)
9. SVG renderer'lar (Köprü, Nokta) A4 export'ta vektörel kalmalı — raster dönüşüm yok

### 🤖 Selin Arslan — AI Mimari Onayı

**Değerlendirme:** ✅ ONAYLI (Koşullu)

> Gemini 2.5 Flash ile hece bazlı metin üretimi yapılabilir ancak hallucination riski
> Türkçe hece kurallarında yüksek. Mutlaka post-processing hece doğrulama motoru gerekir.

**AI koşulları:**
1. **Model**: `gemini-2.5-flash` sabit — değiştirme
2. **Hece doğrulama**: AI çıktısı sonrası Türkçe hece kurallarına göre re-split yapılmalı
3. **Prompt injection koruması**: `sanitizePromptInput()` + max 2000 karakter user input
4. **Token optimizasyonu**: Ortalama üretim ~500 token, batch istenmez (tek metin)
5. **JSON repair**: `tryRepairJson()` engine AI çıktısında aktif olmalı
6. **Hallucination kontrolü**: Üretilen kelimelerin Türkçe sözlük kontrolü (basit whitelist)
7. **Cache**: Aynı config + yaş grubu + zorluk → 15 dakika IndexedDB cache
8. **Fallback**: AI başarısız olursa offline generatör hemen devreye girmeli

---

## 1. Modül Özeti

**Amaç:** PDF kaynaklarındaki (Pencere, Nokta, Köprü, Çift Metin, Bellek) özel okuma
formatlarının dijital ortamda birebir üretilmesi, özelleştirilmesi, A4 baskı-hazır
dışa aktarılması ve çalışma kitapçığına entegrasyonu.

**Kaynak PDF'ler:**
```
src/kaynak/sari/
├── 1. SARI KİTAP PENCERE.pdf     (32 MB)
├── 2. SARI KİTAP NOKTA.pdf       (36 MB)
├── 3. SARI KİTAP KÖPRÜ.pdf       (21 MB)
├── 4. SARI KİTAP ÇİFT METİN.pdf (19 MB)
├── BELLEK DERNEK TOPLU.pdf        (77 MB)
├── HIZLI OKUMAYA GEÇİŞ ÖDEV KİTABI.pdf
└── HIZLI OKUMAYA GEÇİŞ.pdf
```

---

## 2. Tam Modüler Dosya Mimarisi

> Her etkinlik tipi (Pencere, Nokta, Köprü, Çift Metin, Bellek, Hızlı Okuma) kendi tam
> bağımsız modülünde yaşar. Yeni bir etkinlik tipi eklemek = yeni bir klasör eklemek.

```
src/
├── types/
│   └── sariKitap.ts                          ← [MODIFY] Merkezi tip sistemi (genişletilecek)
│
├── store/
│   └── useSariKitapStore.ts                  ← [NEW] Zustand store
│
├── services/
│   ├── generators/
│   │   └── sariKitap/                        ← [NEW] AI generatör modülleri
│   │       ├── index.ts                      ← Barrel export + router
│   │       ├── shared.ts                     ← Ortak system instruction + helpers
│   │       ├── pencere.prompt.ts             ← Pencere prompt builder
│   │       ├── nokta.prompt.ts               ← Nokta prompt builder
│   │       ├── kopru.prompt.ts               ← Köprü prompt builder
│   │       ├── ciftMetin.prompt.ts           ← Çift Metin prompt builder
│   │       ├── bellek.prompt.ts              ← Bellek prompt builder
│   │       └── hizliOkuma.prompt.ts          ← Hızlı Okuma prompt builder
│   │
│   ├── offlineGenerators/
│   │   └── sariKitap/                        ← [NEW] Offline üretici modülleri
│   │       ├── index.ts                      ← Barrel export + router
│   │       ├── heceMotoru.ts                 ← Türkçe hece ayırma motoru (kritik)
│   │       ├── pencere.offline.ts
│   │       ├── nokta.offline.ts
│   │       ├── kopru.offline.ts
│   │       ├── ciftMetin.offline.ts
│   │       ├── bellek.offline.ts
│   │       ├── hizliOkuma.offline.ts
│   │       └── metinHavuzu.ts                ← Hazır Türkçe metin/hikaye havuzu
│   │
│   └── sariKitapService.ts                   ← [NEW] Firestore CRUD + cache entegrasyonu
│
├── components/
│   └── SariKitapStudio/                      ← [NEW] Ana stüdyo bileşenleri
│       ├── index.ts                          ← Barrel export
│       ├── SariKitapStudio.tsx               ← Ana orchestrator (MathStudio pattern)
│       ├── SariKitapStudio.css               ← Stüdyoya özel glassmorphism stilleri
│       ├── constants.ts                      ← Default config'ler, renkler, sabitler
│       │
│       ├── hooks/
│       │   ├── useSariKitapGenerator.ts      ← AI/offline üretim pipeline hook
│       │   ├── useExportActions.ts           ← PDF/PNG export + workbook hook
│       │   └── useHeceProcessor.ts           ← Türkçe hece post-processing hook
│       │
│       ├── shared/                           ← Ortak yardımcı bileşenler
│       │   ├── SariKitapHeader.tsx            ← Header (tip seçim, geri, yazdır, kaydet)
│       │   ├── TypeSelectorPanel.tsx          ← 6 etkinlik tip seçici (icon grid)
│       │   ├── CommonConfigPanel.tsx          ← Ortak ayarlar (yaş, zorluk, profil)
│       │   ├── A4PreviewShell.tsx             ← A4 canlı önizleme container
│       │   ├── QuickModeSelector.tsx          ← Hızlı mod (PDF ref seçici)
│       │   ├── Toast.tsx                      ← Stüdyo-lokal toast
│       │   └── ErrorFallback.tsx              ← Renderer error boundary fallback
│       │
│       ├── modules/                           ← ★ HER ETKİNLİK TİPİ KENDİ MODÜLÜNDE ★
│       │   │
│       │   ├── pencere/                       ← PENCERE (Window) Modülü
│       │   │   ├── index.ts                   ← Barrel export
│       │   │   ├── PencereConfigPanel.tsx      ← Pencere'ye özel config paneli
│       │   │   ├── PencereRenderer.tsx         ← A4 pencere okuma render motoru
│       │   │   ├── pencere.types.ts            ← Pencere'ye özel tipler
│       │   │   ├── pencere.constants.ts        ← Varsayılan pencere parametreleri
│       │   │   └── pencere.utils.ts            ← Pencere metin işleme yardımcıları
│       │   │
│       │   ├── nokta/                         ← NOKTA (Dot) Modülü
│       │   │   ├── index.ts
│       │   │   ├── NoktaConfigPanel.tsx        ← Nokta yoğunluğu, boyut, renk
│       │   │   ├── NoktaRenderer.tsx           ← SVG dot hizalama render motoru
│       │   │   ├── nokta.types.ts
│       │   │   ├── nokta.constants.ts
│       │   │   └── nokta.utils.ts
│       │   │
│       │   ├── kopru/                         ← KÖPRÜ (Bridge) Modülü
│       │   │   ├── index.ts
│       │   │   ├── KopruConfigPanel.tsx        ← Yay yüksekliği, boşluk, stil
│       │   │   ├── KopruRenderer.tsx           ← SVG bezier yay render motoru
│       │   │   ├── kopru.types.ts
│       │   │   ├── kopru.constants.ts
│       │   │   └── kopru.utils.ts              ← Bezier path hesap fonksiyonları
│       │   │
│       │   ├── ciftMetin/                     ← ÇİFT METİN (Interleaved) Modülü
│       │   │   ├── index.ts
│       │   │   ├── CiftMetinConfigPanel.tsx    ← Karışım oranı, renk seçimi
│       │   │   ├── CiftMetinRenderer.tsx       ← Renk kodlu iç içe metin render
│       │   │   ├── ciftMetin.types.ts
│       │   │   ├── ciftMetin.constants.ts
│       │   │   └── ciftMetin.utils.ts          ← İki metin harmanlama algoritmaları
│       │   │
│       │   ├── bellek/                        ← BELLEK (Memory) Modülü
│       │   │   ├── index.ts
│       │   │   ├── BellekConfigPanel.tsx        ← Blok boyutu, süre, tekrar
│       │   │   ├── BellekRenderer.tsx           ← Kelime blok grid render
│       │   │   ├── bellek.types.ts
│       │   │   ├── bellek.constants.ts
│       │   │   └── bellek.utils.ts
│       │   │
│       │   └── hizliOkuma/                    ← HIZLI OKUMA (Speed Reading) Modülü
│       │       ├── index.ts
│       │       ├── HizliOkumaConfigPanel.tsx   ← Hız, ritmik okuma ayarları
│       │       ├── HizliOkumaRenderer.tsx      ← Ritmik/seriyal kelime gösterim
│       │       ├── hizliOkuma.types.ts
│       │       ├── hizliOkuma.constants.ts
│       │       └── hizliOkuma.utils.ts
│       │
│       └── registry.ts                        ← Modül kayıt merkezi (dinamik yükleme)
│
├── utils/
│   └── heceAyirici.ts                        ← [NEW] Türkçe hece ayırma algoritması
│
api/
└── sari-kitap/
    └── generate.ts                           ← [NEW] Vercel Serverless endpoint
│
tests/
├── sariKitap/                                ← [NEW] Test modülleri
│   ├── types.test.ts                         ← Zod şema validation testleri
│   ├── heceMotoru.test.ts                    ← Hece ayırma testleri
│   ├── pencere.test.ts                       ← Pencere offline gen + render testleri
│   ├── nokta.test.ts
│   ├── kopru.test.ts
│   ├── ciftMetin.test.ts
│   ├── bellek.test.ts
│   └── hizliOkuma.test.ts
```

**Toplam: ~55 yeni dosya, 4 mevcut dosya modifikasyonu**

---

## 3. Modüler Yapı Kuralları

### 3.1 Her Modül İçin Standart Dosya Yapısı

Her etkinlik modülü (`modules/pencere/`, `modules/nokta/`, vb.) şu standart dosyaları içerir:

| Dosya | Sorumluluk |
|-------|-----------|
| `index.ts` | Barrel export — modülün public API'sı |
| `XxxConfigPanel.tsx` | Etkinlik tipine özel parametrik ayar paneli |
| `XxxRenderer.tsx` | A4 canlı önizleme + PDF export render motoru |
| `xxx.types.ts` | Etkinlik tipine özel TypeScript interface'leri |
| `xxx.constants.ts` | Varsayılan parametreler, sınır değerler |
| `xxx.utils.ts` | Saf yardımcı fonksiyonlar (test edilebilir) |

### 3.2 Modül Kayıt Merkezi (registry.ts)

```typescript
// registry.ts — Dinamik modül yükleme
import type { SariKitapActivityType } from '../../types/sariKitap';
import type { ComponentType } from 'react';

export interface SariKitapModule {
  type: SariKitapActivityType;
  label: string;
  icon: string;                           // FontAwesome icon class
  color: string;                          // Tailwind bg-xxx renk sınıfı
  description: string;                    // Kısa açıklama
  ageGroupRestriction?: AgeGroup[];       // Elif Yıldız: yaş kısıtlaması
  ConfigPanel: ComponentType<ConfigPanelProps>;
  Renderer: ComponentType<RendererProps>;
  defaultConfig: Record<string, unknown>;
  targetSkills: string[];
  pedagogicalNote: string;                // Statik pedagojik açıklama
}

// Her modül kendini buraya kaydeder
export const MODULE_REGISTRY: Map<SariKitapActivityType, SariKitapModule> = new Map();
```

**Yeni modül eklemek:**
1. `modules/yeniTip/` klasörü oluştur
2. Standart 6 dosyayı yaz
3. `registry.ts`'ye kaydet
4. **Bitti.** Orchestrator otomatik tanır.

---

## 4. Tip Sistemi Detayı — Discriminated Union

### 4.1 Merkezi `sariKitap.ts` Genişletmesi

```typescript
import { z } from 'zod';
import type { AgeGroup, LearningDisabilityProfile } from './creativeStudio';

// ─── Zorluk Seviyeleri (Disleksi spesifik) ───────────────────────
export type SariKitapDifficulty = 'Başlangıç' | 'Orta' | 'İleri' | 'Uzman';

export const SariKitapDifficultySchema = z.enum(['Başlangıç', 'Orta', 'İleri', 'Uzman']);

// ─── 6 Etkinlik Tipi ─────────────────────────────────────────────
export const SariKitapActivityTypeSchema = z.enum([
  'pencere', 'nokta', 'kopru', 'cift_metin', 'hizli_okuma', 'bellek'
]);
export type SariKitapActivityType = z.infer<typeof SariKitapActivityTypeSchema>;

// ─── Temel Hece Verisi ───────────────────────────────────────────
export interface HeceData {
  syllable: string;         // "ör" "man" "da" "ki"
  isHighlighted: boolean;   // Pencere: görünen/gizli
  dotBelow: boolean;        // Nokta: alt nokta var mı
  bridgeNext: boolean;      // Köprü: sonraki heceye yay var mı
}

export interface HeceRow {
  syllables: HeceData[];
  lineIndex: number;
}

// ─── Ortak Config ────────────────────────────────────────────────
export interface SariKitapBaseConfig {
  ageGroup: AgeGroup;
  difficulty: SariKitapDifficulty;
  profile: LearningDisabilityProfile;
  durationMins: number;
  topics: string[];
  learningObjectives: string[];
  targetSkills: string[];
  // Tipografi (Lexend font zorunlu)
  typography: {
    fontSize: number;       // pt — min 14, max 28
    lineHeight: number;     // min 1.6 (Elif Yıldız koşulu)
    letterSpacing: number;  // em — min 0.02
    wordSpacing: number;    // em
  };
}

// ─── Tip-Spesifik Config'ler (Discriminated Union) ───────────────

export interface PencereConfig extends SariKitapBaseConfig {
  type: 'pencere';
  windowSize: 1 | 2 | 3;           // Kaç hece görünsün
  revealSpeed: 'yavaş' | 'orta' | 'hızlı';
  maskOpacity: number;              // 0.3 — 0.9
  maskColor: string;                // #hex
  showSequential: boolean;          // Sıralı mı, rastgele mi
}

export interface NoktaConfig extends SariKitapBaseConfig {
  type: 'nokta';
  dotDensity: 1 | 2 | 3;           // 1=her hece, 2=her 2 hece, 3=her 3
  dotStyle: 'yuvarlak' | 'kare' | 'elips';
  dotSize: number;                  // px — 4-12
  dotColor: string;                 // #hex
  showGuideLine: boolean;           // Hecelerin altındaki ince çizgi
}

export interface KopruConfig extends SariKitapBaseConfig {
  type: 'kopru';
  bridgeHeight: number;             // SVG yay yüksekliği px
  bridgeGap: number;                // Heceler arası boşluk px
  bridgeStyle: 'yay' | 'düz' | 'noktalı';
  bridgeColor: string;              // #hex
  bridgeThickness: number;          // Çizgi kalınlığı px
}

export interface CiftMetinConfig extends SariKitapBaseConfig {
  type: 'cift_metin';
  interleaveMode: 'kelime' | 'satir' | 'paragraf';
  interleaveRatio: number;          // 1=birer, 2=ikişer, vb.
  sourceAColor: string;             // #hex — Hikaye A rengi
  sourceBColor: string;             // #hex — Hikaye B rengi
  sourceAStyle: 'bold' | 'normal' | 'italic';
  sourceBStyle: 'bold' | 'normal' | 'italic';
  showSourceLabels: boolean;        // "Hikaye A" / "Hikaye B" etiketleri
}

export interface BellekConfig extends SariKitapBaseConfig {
  type: 'bellek';
  blockCount: number;               // Kelime bloğu sayısı
  blockSize: 'küçük' | 'orta' | 'büyük';
  gridColumns: 2 | 3 | 4 | 5;
  showNumbers: boolean;             // Blok numaraları
  repetitionCount: number;          // Tekrar sayısı
}

export interface HizliOkumaConfig extends SariKitapBaseConfig {
  type: 'hizli_okuma';
  wordsPerBlock: number;            // Her blokta kaç kelime
  blockRows: number;                // Kaç satır blok
  showTimer: boolean;               // Süre göstergesi
  rhythmicMode: boolean;            // Ritmik okuma modu
}

// ─── Discriminated Union ─────────────────────────────────────────
export type SariKitapConfig =
  | PencereConfig
  | NoktaConfig
  | KopruConfig
  | CiftMetinConfig
  | BellekConfig
  | HizliOkumaConfig;

// ─── AI Çıktı Tipleri ────────────────────────────────────────────

export interface SariKitapGeneratedContent {
  title: string;
  pedagogicalNote: string;         // ZORUNLU — Elif Yıldız koşulu
  instructions: string;            // Öğretmene yönerge
  targetSkills: string[];

  // Ham metin (AI'dan gelen)
  rawText: string;

  // Hece-parslanmış veri (heceMotoru tarafından doldurulur)
  heceRows: HeceRow[];

  // Çift metin için
  sourceTexts?: {
    a: { title: string; text: string };
    b: { title: string; text: string };
  };

  // Bellek/Hızlı okuma için
  wordBlocks?: string[][];

  // Meta
  generatedAt: string;             // ISO timestamp
  model: 'gemini-2.5-flash';
  tokenUsage?: { input: number; output: number };
}

// ─── Firestore Dokümanı ──────────────────────────────────────────
export interface SariKitapDocument {
  id: string;
  userId: string;
  config: SariKitapConfig;
  content: SariKitapGeneratedContent;
  createdAt: string;
  updatedAt: string;
  // KVKK uyumu: studentId ve tanı bilgisi ayrı koleksiyonda
  // studentId BURADA TUTULMAZ
  tags: string[];
  isFavorite: boolean;
  workbookId?: string;             // Hangi kitapçığa eklendi
}

// ─── Zod Şema (z.any() YASAK) ───────────────────────────────────

const SariKitapBaseConfigSchema = z.object({
  ageGroup: z.enum(['5-7', '8-10', '11-13', '14+']),
  difficulty: SariKitapDifficultySchema,
  profile: z.enum(['dyslexia', 'dyscalculia', 'adhd', 'mixed']),
  durationMins: z.number().min(5).max(60),
  topics: z.array(z.string()).min(1).max(5),
  learningObjectives: z.array(z.string()).min(1),
  targetSkills: z.array(z.string()).min(1),
  typography: z.object({
    fontSize: z.number().min(14).max(28),
    lineHeight: z.number().min(1.6).max(3.0),
    letterSpacing: z.number().min(0).max(0.2),
    wordSpacing: z.number().min(0).max(0.5),
  }),
});

export const SariKitapConfigSchema = z.discriminatedUnion('type', [
  SariKitapBaseConfigSchema.extend({
    type: z.literal('pencere'),
    windowSize: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    revealSpeed: z.enum(['yavaş', 'orta', 'hızlı']),
    maskOpacity: z.number().min(0.3).max(0.9),
    maskColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    showSequential: z.boolean(),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('nokta'),
    dotDensity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
    dotStyle: z.enum(['yuvarlak', 'kare', 'elips']),
    dotSize: z.number().min(4).max(12),
    dotColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    showGuideLine: z.boolean(),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('kopru'),
    bridgeHeight: z.number().min(8).max(40),
    bridgeGap: z.number().min(4).max(20),
    bridgeStyle: z.enum(['yay', 'düz', 'noktalı']),
    bridgeColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    bridgeThickness: z.number().min(1).max(4),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('cift_metin'),
    interleaveMode: z.enum(['kelime', 'satir', 'paragraf']),
    interleaveRatio: z.number().min(1).max(5),
    sourceAColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    sourceBColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    sourceAStyle: z.enum(['bold', 'normal', 'italic']),
    sourceBStyle: z.enum(['bold', 'normal', 'italic']),
    showSourceLabels: z.boolean(),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('bellek'),
    blockCount: z.number().min(4).max(30),
    blockSize: z.enum(['küçük', 'orta', 'büyük']),
    gridColumns: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    showNumbers: z.boolean(),
    repetitionCount: z.number().min(1).max(5),
  }),
  SariKitapBaseConfigSchema.extend({
    type: z.literal('hizli_okuma'),
    wordsPerBlock: z.number().min(1).max(5),
    blockRows: z.number().min(3).max(20),
    showTimer: z.boolean(),
    rhythmicMode: z.boolean(),
  }),
]);

export const SariKitapGenerationRequestSchema = z.object({
  config: SariKitapConfigSchema,
  sourcePdfReference: z.string().max(200).optional(),
});
```

---

## 5. Türkçe Hece Ayırma Motoru — `heceAyirici.ts`

> **Selin Arslan uyarısı:** Gemini Türkçe hece ayırma kurallarında hallucinate edebilir.
> Post-processing hece doğrulaması zorunlu.

```typescript
// utils/heceAyirici.ts

/** Türkçe sesli harfler */
const UNLULER = new Set(['a','e','ı','i','o','ö','u','ü','â','î','û']);

/** Türkçe ünsüz harfler */
const UNSUZLER = new Set([
  'b','c','ç','d','f','g','ğ','h','j','k','l','m',
  'n','p','r','s','ş','t','v','y','z'
]);

/**
 * Türkçe fonetik kurallara göre hece ayırma
 * Kurallar:
 * 1. Her hecede en az bir ünlü bulunur
 * 2. İki ünlü arasındaki tek ünsüz, sonraki hecenin başına geçer
 * 3. İki ünlü arasında iki ünsüz varsa, ilki önceki hecede kalır
 * 4. İki ünlü arasında üç ünsüz varsa, ilk ikisi önceki hecede kalır
 */
export function hecelereAyir(kelime: string): string[] {
  // Algoritma implementasyonu...
}

/**
 * Metni cümlelere, kelimelere ve hecelere parse eder
 * AI çıktısının post-processing'i için kullanılır
 */
export function metniHecele(metin: string): HeceRow[] {
  // Satır satır parse → kelime kelime → hece hece
}
```

**Test örnekleri (70+ kelime):**
```
"ağaç"     → ["a", "ğaç"]
"ormanda"  → ["or", "man", "da"]
"karınca"  → ["ka", "rın", "ca"]
"öğretmen" → ["öğ", "ret", "men"]
"çiçek"    → ["çi", "çek"]
"masallarda"→ ["ma", "sal", "lar", "da"]
```

---

## 6. Renderer Detayları (Her Modül)

### 6.1 PencereRenderer (Window Reading)

```
Orijinal metin: "Ağaçtaki küçük kuş öttü."
A4 Render:

    [  Ağaç ] ta ki   [küçük] kuş   [  öt  ] tü .
    ▓▓▓▓▓▓▓  ░░░░░   ▓▓▓▓▓▓ ░░░   ▓▓▓▓▓▓▓  ░░░

    ▓ = Görünen (pencere açık)
    ░ = Maskelenmiş (opacity ile gizli)
```

- **Mekanizma**: CSS `opacity` + `background-color` ile maskeleme
- **Parametreler**: `windowSize` (1-3 hece), `maskOpacity` (0.3-0.9), `maskColor`
- **A4 Export**: Maskeleme bitmap değil, CSS kuralları ile kontrol edilir
- **Erişilebilirlik**: `aria-hidden` mask'lı bölümler için, `role="text"` görünen bölümler

### 6.2 NoktaRenderer (Dot Tracking)

```
    Or   man   da   ki    hay   van   lar

    ●     ●     ●    ●     ●     ●     ●
```

- **Mekanizma**: SVG `<circle>` elementleri, CSS Grid ile pozisyonlama
- **Hiza**: Her hece altında center-aligned nokta (SVG viewBox hesabı)
- **Parametreler**: `dotDensity`, `dotStyle`, `dotSize`, `dotColor`
- **A4 Export**: SVG vektörel kalır (Bora Demir koşulu — raster dönüşüm yok)
- **Erişilebilirlik**: Nokta'lar dekoratif → `aria-hidden="true"`

### 6.3 KopruRenderer (Bridge Reading)

```
    Bir   gün   köy   de    bir   a    dam
     ╰─────╯     ╰─────╯     ╰────╯
```

- **Mekanizma**: SVG `<path>` ile quadratic bezier yay → `M x1,y1 Q cx,cy x2,y2`
- **Hesaplama**: `kopru.utils.ts` → `calculateBridgePath(startX, endX, height)` → SVG d attribute
- **Parametreler**: `bridgeHeight`, `bridgeGap`, `bridgeStyle`, `bridgeColor`, `bridgeThickness`
- **A4 Export**: SVG olarak embedded kalır
- **Erişilebilirlik**: Yaylar dekoratif → `aria-hidden="true"`, metin `role="text"`

### 6.4 CiftMetinRenderer (Interleaved Text)

```
    Cici kuş ağaçta                    ← Mavi, Bold
    Kek hamuru                         ← Turuncu, İtalik
    oturuyordu sabahtan beri           ← Mavi, Bold
    karıştırıldı kasenin içinde        ← Turuncu, İtalik
```

- **Mekanizma**: İki kaynak metni `ciftMetin.utils.ts` → `interleaveTexts()` ile harmanlama
- **Harmanlama**: `kelime` → kelime-kelime araya girer, `satir` → satır-satır, `paragraf` → paragraf-paragraf
- **Renk şeması**: Varsayılan Mavi (#2563eb) / Turuncu (#ea580c) — disleksi dostu yüksek kontrast
- **Parametreler**: `interleaveMode`, `interleaveRatio`, `sourceAColor/BColor`, `sourceAStyle/BStyle`
- **Yaş kısıtlaması**: Elif Yıldız koşulu → sadece `11-13` ve `14+`
- **Erişilebilirlik**: Her hikaye kaynağı `aria-label="Hikaye A"` / `aria-label="Hikaye B"`

### 6.5 BellekRenderer (Memory & Fast Reading)

```
    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  köpek  │  │   kedi  │  │   balık │  │   kuş   │
    └─────────┘  └─────────┘  └─────────┘  └─────────┘
    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
    │  araba  │  │   okul  │  │   kalem │  │   masa  │
    └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

- **Mekanizma**: CSS Grid ile düzenli blok yerleşimi
- **Parametreler**: `blockCount`, `blockSize`, `gridColumns`, `showNumbers`
- **A4 Export**: CSS Grid doğrudan yazdırılır

### 6.6 HizliOkumaRenderer (Speed Reading)

```
    masa     kalem     okul     araba
    defter   kitap     tahta    silgi
    çiçek    ağaç      yaprak   kök
```

- **Mekanizma**: Kelime blokları seriyal gösterim
- **Parametreler**: `wordsPerBlock`, `blockRows`, `rhythmicMode`
- **Ritmik mod**: Her satır farklı arka plan tonu (zebra striping)

---

## 7. API Endpoint Detayı

### `POST /api/sari-kitap/generate`

```typescript
// api/sari-kitap/generate.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateCorsAndMethod } from '../../src/utils/cors.js';
import { SariKitapGenerationRequestSchema } from '../../src/types/sariKitap.js';
import { RateLimiter } from '../../src/services/rateLimiter.js';
import { retryWithBackoff, logError } from '../../src/utils/errorHandler.js';
import { toAppError, ValidationError, InternalServerError } from '../../src/utils/AppError.js';
import { tryRepairJson } from '../../src/utils/jsonRepair.js';
import { validatePromptSecurity, sanitizePromptInput } from '../../src/utils/promptSecurity.js';

const MASTER_MODEL = 'gemini-2.5-flash';
const rateLimiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS + Method validation
  if (!validateCorsAndMethod(req, res, ['POST'])) return;

  try {
    // 2. Body parse + Zod validation (z.any yok!)
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const parseResult = SariKitapGenerationRequestSchema.safeParse(body);
    if (!parseResult.success) {
      throw new ValidationError('Geçersiz konfigürasyon', parseResult.error.flatten());
    }
    const { config, sourcePdfReference } = parseResult.data;

    // 3. Rate Limiting
    const userId = (req.headers['x-user-id'] as string) || 'anonymous';
    const userTier = (req.headers['x-user-tier'] as string) || 'free';
    await rateLimiter.enforceLimit(userId, userTier as 'free'|'pro'|'admin', 'apiGeneration');

    // 4. Prompt builder → tip bazlı seçim
    const promptBuilder = getPromptBuilder(config.type);
    const prompt = promptBuilder(config, sourcePdfReference);

    // 5. Prompt security
    const securityResult = validatePromptSecurity(prompt, {
      maxLength: 5000, blockOnThreat: true, threatThreshold: 'high'
    }, { userId });
    if (!securityResult.isSafe) {
      throw new ValidationError('Güvenlik kontrolü başarısız');
    }

    // 6. Gemini API call
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) throw new InternalServerError('API Key bulunamadı');

    const result = await retryWithBackoff(async () => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }]
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new InternalServerError(`Gemini Hatası: ${err.error?.message || response.statusText}`);
      }
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new InternalServerError('AI yanıtı boş');
      return { text };
    }, { maxRetries: 2 });

    // 7. JSON repair + response
    const parsed = tryRepairJson(result.text);
    return res.status(200).json({
      success: true,
      data: parsed,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    const appError = toAppError(error);
    logError(appError);
    return res.status(appError.httpStatus).json({
      success: false,
      error: { message: appError.userMessage, code: appError.code },
      timestamp: new Date().toISOString(),
    });
  }
}
```

---

## 8. Zustand Store Tasarımı

```typescript
// store/useSariKitapStore.ts
import { create } from 'zustand';
import type { SariKitapConfig, SariKitapActivityType, SariKitapGeneratedContent } from '../types/sariKitap';

interface SariKitapState {
  // ─── Aktif Tip ───
  activeType: SariKitapActivityType;

  // ─── Config (discriminated union) ───
  config: SariKitapConfig;

  // ─── Generation Pipeline ───
  isGenerating: boolean;
  generationMode: 'ai' | 'offline';
  generatedContent: SariKitapGeneratedContent | null;
  error: string | null;

  // ─── Preview ───
  previewScale: number;
  showGrid: boolean;
  isFullscreen: boolean;

  // ─── History (son 10 üretim) ───
  recentGenerations: SariKitapGeneratedContent[];

  // ─── Actions ───
  setActiveType: (type: SariKitapActivityType) => void;
  updateConfig: <K extends keyof SariKitapConfig>(key: K, value: SariKitapConfig[K]) => void;
  replaceConfig: (config: SariKitapConfig) => void;
  setGenerating: (value: boolean) => void;
  setContent: (content: SariKitapGeneratedContent | null) => void;
  setError: (error: string | null) => void;
  setPreviewScale: (scale: number) => void;
  toggleGrid: () => void;
  toggleFullscreen: () => void;
  addToHistory: (content: SariKitapGeneratedContent) => void;
  resetStudio: () => void;
}
```

---

## 9. App.tsx & Sidebar.tsx Entegrasyonu

### App.tsx Değişiklikleri

```diff
+ // Lazy import
+ const SariKitapStudio = lazy(() =>
+   import('./components/SariKitapStudio').then((m) => ({ default: m.SariKitapStudio }))
+ );

  // Sidebar props
  <Sidebar
+   onOpenSariKitapStudio={() => handleOpenStudio('sari-kitap-studio')}
  />

  // View array
  {[
    'curriculum', 'reading-studio', 'math-studio', ...,
+   'sari-kitap-studio',
  ].includes(currentView) && (
    <motion.div>
      <Suspense>
+       {currentView === 'sari-kitap-studio' && (
+         <SariKitapStudio
+           onBack={handleGoBack}
+           onAddToWorkbook={handleAddToWorkbookGeneral}
+         />
+       )}
      </Suspense>
    </motion.div>
  )}
```

### Sidebar.tsx Değişiklikleri

```diff
  interface SidebarProps {
+   onOpenSariKitapStudio?: () => void;
  }

  // studioGroups → "Alan Stüdyoları"
  items: [
    { id: 'reading', ... },
    { id: 'math', ... },
+   {
+     id: 'sari-kitap-studio',
+     label: 'Sarı Kitap Stüdyosu',
+     icon: 'fa-book-bookmark',
+     color: 'bg-yellow-500',
+     onClick: onOpenSariKitapStudio,
+   },
    { id: 'super-turkce', ... },
  ]
```

### core.ts Değişiklikleri

```diff
  export type View =
    | 'premium_studio'
    | 'generator'
    // ... mevcut view'ler
+   | 'sari-kitap-studio'
    | 'students';
```

---

## 10. CSS Mimarisi — Dark Glassmorphism

```css
/* SariKitapStudio.css */

.sari-kitap-studio {
  --sk-primary: #eab308;        /* Sarı — brand renk */
  --sk-primary-muted: rgba(234, 179, 8, 0.1);
  --sk-surface: rgba(24, 24, 27, 0.85);
  --sk-glass-blur: 20px;
  --sk-border: rgba(234, 179, 8, 0.15);
  --sk-border-radius: 2.5rem;   /* Admin UI standardı */
}

.sk-panel {
  background: var(--sk-surface);
  backdrop-filter: blur(var(--sk-glass-blur));
  border: 1px solid var(--sk-border);
  border-radius: var(--sk-border-radius);
}

/* A4 Preview Shell — beyaz kağıt */
.sk-a4-shell {
  width: 210mm;
  height: 297mm;
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  font-family: 'Lexend', sans-serif;
  /* Lexend değiştiremez — Elif Yıldız koşulu */
}

/* Print override — sıfır kenar boşluğu */
@media print {
  .sk-a4-shell {
    box-shadow: none;
    margin: 0;
    padding: 12mm;
  }
}

/* Micro-interactions */
.sk-module-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.sk-module-card:hover {
  transform: scale(1.03);
  border-color: var(--sk-primary);
}
```

---

## 11. Erişilebilirlik (WCAG 2.1 AA)

| Kriter | Uygulama |
|--------|----------|
| **Kontrast** | Metin: min 4.5:1, Büyük metin: min 3:1 |
| **Klavye** | Tüm kontroller Tab ile erişilebilir |
| **Screen reader** | Mask'lı bölümler `aria-hidden`, metin `role="text"` |
| **Odak göstergesi** | `focus-visible` outline — accent renk |
| **Epilepsi güvenliği** | Pencere animasyonu max 3Hz (Dr. Ahmet Kaya koşulu) |
| **Renk bağımsızlığı** | Çift metin'de renk + stil (bold/italic) kombinasyonu |
| **Disleksi dostu** | Lexend font, line-height ≥ 1.6, letter-spacing ≥ 0.02em |

---

## 12. Firestore Şema (KVKK Uyumlu)

```
firestore/
├── sariKitapActivities/          ← Ana koleksiyon
│   └── {documentId}
│       ├── userId: string        ← Sahibi
│       ├── config: object        ← SariKitapConfig
│       ├── content: object       ← SariKitapGeneratedContent
│       ├── tags: string[]
│       ├── isFavorite: boolean
│       ├── workbookId?: string
│       ├── createdAt: timestamp
│       └── updatedAt: timestamp
│
│   ⚠️ KVKK: studentId, studentName, tanı bilgisi
│      BU KOLEKSİYONA KONMAZ
│      Öğrenci bilgisi sadece students/ koleksiyonunda
│      İlişkilendirme: workbook üzerinden
```

---

## 13. Uygulama Fazları (Roadmap)

### Faz 1: Altyapı (Tip Sistemi + Hece Motoru + Store)
- `types/sariKitap.ts` → discriminated union + full Zod şema
- `utils/heceAyirici.ts` → Türkçe hece ayırma motoru
- `store/useSariKitapStore.ts` → Zustand store
- `types/core.ts` → View tipine ekleme
- `tests/sariKitap/types.test.ts` + `heceMotoru.test.ts`

### Faz 2: Offline Generatörler + Metin Havuzu
- `services/offlineGenerators/sariKitap/` → 6 offline üretici
- `services/offlineGenerators/sariKitap/heceMotoru.ts` → Metin parse motoru
- `services/offlineGenerators/sariKitap/metinHavuzu.ts` → Hazır Türkçe metinler
- Her tip için offline test dosyaları

### Faz 3: UI Bileşenleri — Shared + 6 Modül
- `SariKitapStudio/shared/` → Header, TypeSelector, CommonConfig, A4Shell, ErrorFallback
- `SariKitapStudio/modules/pencere/` → Tam Pencere modülü
- `SariKitapStudio/modules/nokta/` → Tam Nokta modülü
- `SariKitapStudio/modules/kopru/` → Tam Köprü modülü
- `SariKitapStudio/modules/ciftMetin/` → Tam Çift Metin modülü
- `SariKitapStudio/modules/bellek/` → Tam Bellek modülü
- `SariKitapStudio/modules/hizliOkuma/` → Tam Hızlı Okuma modülü
- `SariKitapStudio/registry.ts` → Modül kayıt merkezi
- `SariKitapStudio/SariKitapStudio.tsx` → Ana orchestrator
- `SariKitapStudio/SariKitapStudio.css` → Glassmorphism stilleri
- `SariKitapStudio/hooks/` → Generator, Export, HeceProcessor hooks

### Faz 4: AI Endpoint + App Entegrasyonu
- `api/sari-kitap/generate.ts` → Vercel serverless
- `services/generators/sariKitap/` → 6 prompt builder
- `App.tsx` → Lazy import + view rendering
- `Sidebar.tsx` → Navigasyon item ekleme
- `services/sariKitapService.ts` → Firestore CRUD + cache

### Faz 5: Export, Test & Optimizasyon
- PDF/PNG export entegrasyonu (jsPDF + html2canvas)
- Workbook entegrasyonu (handleAddToWorkbook)
- Vitest testleri (her modül için)
- Build + lint doğrulama
- Browser'da 5 tip görsel test
- Mobil responsiveness kontrolü

---

## 14. Doğrulama Planı

### Otomatik Testler
```bash
npm run test:run                    # Vitest — tüm test suite
npm run build                      # TypeScript strict build kontrolü
npm run lint                       # ESLint kuralları
```

### Vitest Test Kapsamı
```
□ Zod şema — 6 config tipi validation
□ Zod şema — invalid data rejection
□ Hece ayırma — 70+ Türkçe kelime
□ Hece ayırma — özel karakterler (â, î, û)
□ Pencere offline gen — çıktı format doğrulama
□ Nokta offline gen — dot alignment hesabı
□ Köprü offline gen — SVG path hesabı
□ Çift Metin offline gen — interleave algoritması
□ Bellek offline gen — grid hesabı
□ Hızlı Okuma offline gen — blok word count
□ pedagogicalNote zorunluluk kontrolü
□ Yaş grubu kısıtlaması (Çift Metin → sadece 11+)
```

### Browser Doğrulama
```
□ 6 etkinlik tipini generate edip A4 preview'de kontrol
□ PDF export indirip yazdırma preview kontrolü
□ Mobil responsive test (scroll + zoom)
□ Dark/Light tema senkronizasyonu
□ Workbook'a ekleme testi
□ Lexend font tüm çıktılarda mevcut mu?
□ SVG (Nokta/Köprü) export'ta vektörel mi?
□ ErrorBoundary — renderer crash testi
```

---

## 15. Önceki Plandaki Düzeltilen Hatalar ve Eksiklikler

| # | Problem | Düzeltme |
|---|---------|----------|
| 1 | `z.any()` kullanımı | Discriminated union Zod şeması ile değiştirildi |
| 2 | Modülerlik eksik — renderer'lar tek dosyada | Her tip kendi `modules/xxx/` klasöründe |
| 3 | Lider ajan değerlendirmesi yoktu | 4 ajan aktif — koşullu onay eklendi |
| 4 | Türkçe hece motoru yoktu | `heceAyirici.ts` + testleri eklendi |
| 5 | KVKK uyumu belirtilmemişti | Firestore şema + studentId ayırma eklendi |
| 6 | Erişilebilirlik (WCAG) atlanmıştı | WCAG 2.1 AA tablosu eklendi |
| 7 | Epilepsi güvenliği yoktu | Pencere animasyonu max 3Hz koşulu |
| 8 | ErrorBoundary stratejisi yoktu | Her renderer ErrorBoundary ile sarılacak |
| 9 | CSS mimarisi yoktu | Dark Glassmorphism CSS detayı eklendi |
| 10| Firestore şeması yoktu | Koleksiyon yapısı detaylandırıldı |
| 11| Çift Metin yaş kısıtlaması yoktu | Sadece 11-13 ve 14+ (Elif Yıldız koşulu) |
| 12| Registry pattern eksikti | Dinamik modül kayıt merkezi eklendi |
| 13| Offline fallback stratejisi yoktu | AI fail → offline generatör devreye girer |
| 14| targetSkills zorunluluğu yoktu | Her etkinlikte targetSkills[] zorunlu |
| 15| BEP entegrasyonu belgenmemişti | SMART format BEP hedef bağlantısı eklendi |
| 16| `Hızlı Okuma` 6. tip olarak atlanmıştı | Ayrı tam modül olarak eklendi |
| 17| SVG export stratejisi yoktu | Vektörel kalma koşulu eklendi (raster yasak) |
| 18| Rate limiting tipleri tanımsızdı | `apiGeneration` LimitKey kullanımı belirtildi |
| 19| Cache stratejisi yoktu | 15 dk IndexedDB cache + config hash |
| 20| Prompt security atlanmıştı | validatePromptSecurity() zorunlu eklendi |
