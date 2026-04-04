# İNFOGRAFİK STÜDYOSU v3 → ENTEGRE AKTİVİTE ÜRETİM PLATFORMU
## DÖNÜŞÜM VE GELİŞTİRME PLANI

**Tarih**: 2026-04-04
**Durum**: PLANLAMA AŞAMASI
**Onaylayan Ekip**: Tüm Ajanlar Aktif (9 Ajan Koordinasyonu)

---

## 📋 YÖNETİCİ ÖZETİ

**Mevcut Durum**: İnfografik Stüdyosu v3, şu anda **96 farklı infografik aktivite türü** için özelleştirilmiş bir "composite worksheet generator" olarak çalışmaktadır. Ancak, ana uygulamanın aktivite üretim mekanizmasından izole bir yapıda durmaktadır.

**Hedef**: İnfografik Stüdyosu'nu, platformun ana sayfasındaki **40+ AI generatör** ve **25 offline generatör** ile aynı hızlı/AI modlu üretim mantığına entegre ederek, tüm aktivite türlerini destekleyen **birleşik bir üretim platformu** haline getirmek.

**Stratejik Değer**:
- ✅ Kullanıcı deneyimi birleştirilir (tek arayüz, tutarlı UX)
- ✅ Kod tekrarı %60 azalır (generator servisleri birleşir)
- ✅ Offline + AI hybrid modlar tüm aktivitelerde kullanılabilir
- ✅ Premium özelliklerin (composite generation, prompt enrichment) tüm sisteme yayılması

---

## 🔍 DERİNLEMESİNE ANALİZ: MEVCUT MİMARİ

### A. İnfografik Stüdyosu v3 Mimarisi

#### 1. **Bileşen Yapısı** (3 Panel Sistemi)
```
InfographicStudio/
├── index.tsx                          # Ana orkestratör
├── panels/
│   ├── LeftPanel/                     # Kategoriler, Aktiviteler, Parametreler
│   │   ├── CategoryTabs.tsx           # 10 kategori sekmesi
│   │   ├── ActivityGrid.tsx           # 96 aktivite kartı
│   │   ├── ParameterPanel.tsx         # Konu, yaş, zorluk, profil
│   │   └── ModeSwitcher.tsx           # Fast/AI/Hybrid
│   ├── CenterPanel/                   # Önizleme + Render
│   │   ├── A4PrintableSheetV2.tsx     # A4 sayfası wrapper
│   │   ├── InfographicPreview.tsx     # Native render motoru
│   │   └── EmptyState.tsx             # Başlangıç durumu
│   └── RightPanel/                    # Pedagojik Notlar + Export
│       ├── PedagogicalNoteCard.tsx    # Elif Yıldız standardı
│       ├── TemplateInfoCard.tsx       # Şablon bilgisi
│       └── ExportActions.tsx          # PDF, Print, Worksheet
├── hooks/
│   ├── useInfographicStudio.ts        # State yönetimi
│   ├── useInfographicGenerate.ts      # AI üretim hook'u
│   └── useInfographicExport.ts        # Export işlemleri
└── constants/
    ├── activityMeta.ts                # 96 aktivite metadata
    ├── categoryConfig.ts              # 10 kategori
    └── templateConfig.ts              # 20 şablon tipi
```

**Güçlü Yönler**:
- ✅ **Widget-based Composition**: Kullanıcı birden fazla aktivite modülü ekleyip tek çalışma kağıdında birleştirebilir
- ✅ **Prompt Enrichment**: AI ile kullanıcı promptunu zenginleştirir (bağlamsal tutarlılık)
- ✅ **Premium Export**: PDF (300 DPI), Print, Worksheet entegrasyonu
- ✅ **Native Renderer**: `NativeInfographicRenderer` ile 6 premium şablon (5W1H, Math Steps, Venn, Fishbone, Cycle, Matrix)

**Zayıf Yönler**:
- ❌ Ana uygulamanın `GeneratorView` ve `ActivityService` ile BAĞLANTISI YOK
- ❌ Offline generatörleri kullanmıyor (sadece AI modu)
- ❌ `services/generators/` altındaki 40+ generatörden izole
- ❌ Zustand store (`useWorksheetStore`, `useStudentStore`) entegrasyonu eksik
- ❌ `api/generate.ts` yerine kendi internal mekanizması var (`premiumCompositeGenerator`)

---

### B. Ana Uygulama Aktivite Üretim Sistemi

#### 1. **GeneratorView.tsx** — Aktivite Üretim Arayüzü
```typescript
// Konumu: src/components/GeneratorView.tsx
// Amaç: Kullanıcının aktivite türü seçip parametre girdiği ana form

interface GeneratorViewProps {
  activity: Activity;
  onGenerate: (options: GeneratorOptions) => void;
  isLoading: boolean;
  studentProfile?: StudentProfile | null;
  activeCurriculumSession?: ActiveCurriculumSession | null;
}

// KULLANICI İŞ AKIŞI:
// 1. Activity seçilir (örn: READING_COMPREHENSION)
// 2. GeneratorView açılır
// 3. Öğrenci, zorluk, sayfa sayısı, konu girilir
// 4. "Üret" butonu → onGenerate(options)
// 5. Backend: api/generate.ts → AI çıktısı → Worksheet render
```

**Entegrasyon Noktaları**:
- ✅ `useStudentStore`: Aktif öğrenci profili
- ✅ `useActivitySettings`: Activity-bazlı parametre state
- ✅ `activeCurriculumSession`: MEB müfredat entegrasyonu (zorluk kilitleme)
- ✅ `getActivityConfigComponent()`: Her aktivite türü için özel config UI

---

#### 2. **services/generators/** — AI Üretim Servisleri

**40+ Generatör Listesi**:
```
readingStudio.ts, mathStudio.ts, creativeStudio.ts
dyslexiaSupport.ts, dyscalculia.ts, visualPerception.ts
memoryAttention.ts, wordGames.ts, algorithm.ts
brainTeasers.ts, patternCompletion.ts, logicProblems.ts
familyTreeMatrix.ts, financialMarket.ts, fiveWOneH.ts
colorfulSyllable.ts, directionalCodeReading.ts
logicErrorHunter.ts, mapInstruction.ts, assessment.ts
clinicalTemplates.ts (BEP), + 20 daha...
```

**Her Generatör Standart Yapı**:
```typescript
export async function generateActivity(options: GeneratorOptions) {
  const { topic, studentAge, difficulty, profile, mode } = options;

  // Mode kontrolü
  if (mode === 'fast') {
    return generateOffline(options); // Deterministik, AI yok
  }

  // AI modu
  const prompt = buildPrompt(options);
  const schema = buildSchema();
  const result = await generateWithSchema({ prompt, schema });

  return {
    items: result.items,
    pedagogicalNote: result.pedagogicalNote, // ZORUNLU
    difficultyLevel: difficulty,
    targetSkills: result.targetSkills,
    ageGroup: studentAge,
    profile
  };
}
```

**Kritik Özellikler**:
- ✅ **Dual Mode**: `mode: 'fast' | 'ai'` parametresi
- ✅ **Pedagojik Not**: Her generatör Elif Yıldız standardına uygun pedagogicalNote üretir
- ✅ **JSON Schema**: Gemini structured output ile tip güvenli
- ✅ **Offline Fallback**: AI başarısız → offline generatör devreye girer

---

#### 3. **services/offlineGenerators/** — Hızlı Mod Generatörleri

**25 Offline Generatör**:
```
dyslexiaSupport.ts, mathStudio.ts, readingComprehension.ts
visualPerception.ts, wordGames.ts, memoryAttention.ts
clockReading.ts, capsuleGame.ts, futoshiki.ts
oddEvenSudoku.ts, magicPyramid.ts, mapDetective.ts
abcConnect.ts, + 12 daha...
```

**Avantajları**:
- ⚡ **Anlık**: AI çağrısı yok, milisaniyeler içinde sonuç
- 💰 **Maliyet Sıfır**: Token harcaması yok
- 🔒 **Deterministik**: Aynı input → aynı output (test edilebilir)

**Örnek**: `clockReading.ts`
```typescript
export function generateClockReading(count: number): ClockActivity[] {
  return Array.from({ length: count }, (_, i) => {
    const hour = randomInt(1, 12);
    const minute = [0, 15, 30, 45][randomInt(0, 3)];
    return {
      question: `Saat kaç?`,
      clockFace: renderClock(hour, minute),
      answer: `${hour}:${minute.toString().padStart(2, '0')}`
    };
  });
}
```

---

#### 4. **api/generate.ts** — Merkezi AI Endpoint

**Endpoint**: `POST /api/generate`

**Sorumluluklar**:
1. ✅ **Rate Limiting**: IP + user bazlı (50 istek/saat)
2. ✅ **Prompt Injection Güvenliği**: `validatePromptSecurity()` (10 katmanlı)
3. ✅ **JSON Onarım Motoru**: 3 katmanlı repair (balanceBraces → truncate → parse)
4. ✅ **CORS Koruması**: Origin whitelisting (wildcard yasak)
5. ✅ **Gemini 2.5 Flash**: Sabit model (`MASTER_MODEL`)

**Kritik Güvenlik Katmanları**:
```typescript
// 1. Input Sanitization
const sanitizedPrompt = sanitizePromptInput(prompt);

// 2. Threat Detection
const securityResult = validatePromptSecurity(sanitizedPrompt, {
  maxLength: 5000,
  threatThreshold: 'high'
});

// 3. Rate Limiting
await rateLimiter.enforceLimit(userId, userTier, 'apiGeneration');

// 4. AI Call with Retry
const result = await retryWithBackoff(() => callGeminiAPI());

// 5. JSON Repair
const parsed = tryRepairJson(result.text);
```

---

## 🎯 DÖNÜŞÜM HEDEFLERİ

### 1. Mimari Birleşme (Unified Architecture)

**Şu Anki Durum**:
```
[ İnfografik Stüdyosu v3 ]  ← İzole, kendi mekanizması
        ❌
[ GeneratorView + ActivityService ]  ← Ana uygulama
```

**Hedef Mimari**:
```
┌─────────────────────────────────────────────────────────┐
│          UNIFIED ACTIVITY GENERATION PLATFORM           │
├─────────────────────────────────────────────────────────┤
│  🎨 GeneratorView (Tek Arayüz)                          │
│     ├─ Temel Mod: Tek aktivite üretimi                  │
│     └─ Kompozit Mod: Multi-widget (eski Infographic)    │
├─────────────────────────────────────────────────────────┤
│  🧠 Activity Service Registry                           │
│     ├─ 40+ AI Generatörler                              │
│     ├─ 25 Offline Generatörler                          │
│     └─ 96 İnfografik Aktivite Tipleri (YENİ)            │
├─────────────────────────────────────────────────────────┤
│  ⚡ Mode Engine                                          │
│     ├─ Fast Mode: Offline generatörler                  │
│     ├─ AI Mode: Gemini 2.5 Flash                        │
│     └─ Hybrid Mode: Offline + AI enrichment             │
├─────────────────────────────────────────────────────────┤
│  🔗 Backend API                                          │
│     └─ api/generate.ts (rate limit, security, JSON fix) │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Özellik Entegrasyonu

#### A. Widget-based Composition → Tüm Aktivitelere

**Şu An**: Sadece İnfografik Stüdyosu'nda widget ekleme özelliği var.

**Hedef**: Kullanıcı herhangi bir aktivite türünde birden fazla "modül" ekleyip tek kağıtta birleştirebilecek.

**Örnek Use Case**:
```
Öğretmen: "5. sınıf matematik - kesirler konusu"
Ekler:
  1. [Görsel Kesir Modeli] (infografik)
  2. [Kesir Problemleri] (mathStudio)
  3. [Kesir Test Soruları] (assessment)

→ Tek A4 çalışma kağıdında tüm modüller render edilir
```

**Teknik Gereksinim**:
- `GeneratorView` içine "Bileşen Ekle" butonu
- `addedWidgets` state tüm aktivite türlerinde geçerli
- `premiumCompositeGenerator` mantığı `ActivityService` içine taşınır

---

#### B. Prompt Enrichment → Global Özellik

**Şu An**: Sadece İnfografik Stüdyosu'nda `enrichPrompt()` fonksiyonu var.

**Hedef**: Tüm AI üretimlerinde kullanıcı "Promptu Zenginleştir" seçeneği görsün.

**Yeni Akış**:
```
Kullanıcı: "ağaçlar" yazar
↓
[Zenginleştir] butonu → AI
↓
Zenginleştirilmiş Prompt:
"Ağaçların yapısı, türleri (iğne yapraklı/geniş yapraklı),
fotosentez süreci, ekosistem içindeki rolü ve çevresel önemi
bağlamında kapsamlı bir içerik oluştur."
```

**Teknik**:
- `enrichPrompt()` → `utils/promptEnrichment.ts` (global utility)
- `GeneratorView` içine "✨ Zenginleştir" butonu

---

#### C. Native Renderer → Tüm Şablon Tiplerinde

**Şu An**: `NativeInfographicRenderer` sadece infografik aktivitelerde kullanılıyor.

**Hedef**: Tüm görsel aktiviteler (örn: mathStudio, visualPerception) bu renderer'ı kullanabilir.

**Örnek**:
```typescript
// mathStudio.ts içinde
return {
  items: [
    { type: 'native_render', template: 'math-steps', data: { steps: [...] } },
    { type: 'native_render', template: 'number-line', data: { numbers: [...] } }
  ]
};
```

**Avantaj**: SVG → PDF export tutarlı, print quality yüksek.

---

### 3. Performans ve UX İyileştirmeleri

#### A. Lazy Loading (Sayfa Yükü Azaltma)

**Sorun**: 96 infografik aktivite metadata'sı başlangıçta yükleniyor.

**Çözüm**:
```typescript
// Kategori seçildiğinde o kategorinin aktivitelerini yükle
const { activities, isLoading } = useLazyActivities(selectedCategory);
```

#### B. Önbellek Mekanizması (Cache)

**Sorun**: Aynı parametrelerle tekrar üretim yapılınca AI'a yeniden gidiyor.

**Çözüm**:
```typescript
// cacheService.ts kullanımı
const cacheKey = hashPrompt(prompt + JSON.stringify(schema));
const cached = await cacheService.get(cacheKey);
if (cached) return cached;

const result = await generateWithSchema({ prompt, schema });
await cacheService.set(cacheKey, result, { ttl: 3600 }); // 1 saat
```

#### C. Hata Yönetimi (Error Recovery)

**Sorun**: AI başarısız → kullanıcı boş sayfa görüyor.

**Çözüm**: Offline fallback
```typescript
try {
  return await generateAI(options);
} catch (error) {
  console.warn('AI failed, falling back to offline:', error);
  return generateOffline(options);
}
```

---

## 🛠️ TEKNİK UYGULAMA PLANI

### Faz 1: Altyapı Hazırlığı (2-3 Gün)

#### 1.1. Activity Type Registry Genişletmesi
```typescript
// types/activity.ts içine 96 yeni tip ekle
export enum ActivityType {
  // Mevcut 40+ aktivite...

  // YENİ: İnfografik Aktiviteleri (Kat 1-10)
  INFOGRAPHIC_CONCEPT_MAP = 'INFOGRAPHIC_CONCEPT_MAP',
  INFOGRAPHIC_COMPARE = 'INFOGRAPHIC_COMPARE',
  INFOGRAPHIC_5W1H_BOARD = 'INFOGRAPHIC_5W1H_BOARD',
  // ... 93 tane daha
}
```

**Doğrulama**:
- ✅ TypeScript derlemesi başarılı
- ✅ `ActivityService.ts` yeni tipleri tanıyor
- ✅ Enum'da duplikasyon yok

---

#### 1.2. Generator Registry Birleşmesi
```typescript
// services/generators/registry.ts

import { INFOGRAPHIC_GENERATORS } from './infographicGenerators';
import { READING_GENERATORS } from './readingGenerators';
import { MATH_GENERATORS } from './mathGenerators';

export const UNIFIED_GENERATOR_REGISTRY = {
  ...READING_GENERATORS,
  ...MATH_GENERATORS,
  ...INFOGRAPHIC_GENERATORS, // 96 yeni generatör
};

export function getGenerator(activityType: ActivityType) {
  return UNIFIED_GENERATOR_REGISTRY[activityType];
}
```

**Doğrulama**:
- ✅ 136+ generatör registry'de
- ✅ Her generatör `generate(options)` fonksiyonu sağlıyor
- ✅ Test: `getGenerator('INFOGRAPHIC_5W1H_BOARD')` çalışıyor

---

#### 1.3. Composite Generator Entegrasyonu
```typescript
// services/generators/compositeGenerator.ts
// (premiumCompositeGenerator.ts mantığını taşı ve genelleştir)

export async function generateComposite(
  widgets: { activityId: ActivityType }[],
  masterPrompt: string,
  mode: 'fast' | 'ai' | 'hybrid',
  params: GeneratorOptions
): Promise<CompositeWorksheet> {

  const sections = [];

  for (const widget of widgets) {
    const generator = getGenerator(widget.activityId);
    if (!generator) continue;

    const result = await generator.generate({
      ...params,
      topic: masterPrompt,
      mode
    });

    sections.push({
      activityType: widget.activityId,
      items: result.items,
      pedagogicalNote: result.pedagogicalNote
    });
  }

  // AI ile bağlamsal tutarlılık kontrolü
  if (mode === 'ai' || mode === 'hybrid') {
    const coherenceCheck = await ensureCoherence(sections, masterPrompt);
    if (coherenceCheck.needsAdjustment) {
      sections = coherenceCheck.adjustedSections;
    }
  }

  return {
    title: `Kompozit Çalışma Kağıdı: ${params.topic}`,
    sections,
    pedagogicalNote: aggregatePedagogicalNotes(sections),
    totalDuration: sections.reduce((sum, s) => sum + (s.duration || 0), 0)
  };
}
```

**Kritik Özellikler**:
- ✅ Mode desteği: fast/ai/hybrid
- ✅ Bağlamsal tutarlılık (AI coherence check)
- ✅ Pedagojik not agregasyonu
- ✅ Tüm widget'lar paralel değil sıralı üretim (bağlam korunur)

---

### Faz 2: Arayüz Birleştirme (3-4 Gün)

#### 2.1. GeneratorView Genişletmesi

**Yeni Özellikler**:
```tsx
// GeneratorView.tsx içine ekle

const [isCompositeMode, setIsCompositeMode] = useState(false);
const [addedWidgets, setAddedWidgets] = useState<AddedWidget[]>([]);

// Kompozit mod aktifse widget grid göster
{isCompositeMode && (
  <div className="mt-4">
    <h4>Ekli Modüller ({addedWidgets.length})</h4>
    <ActivityGrid
      activities={getAllActivities()}
      onAdd={(activityId) => setAddedWidgets([...addedWidgets, { id: nanoid(), activityId }])}
    />
    <WidgetList
      widgets={addedWidgets}
      onRemove={(id) => setAddedWidgets(addedWidgets.filter(w => w.id !== id))}
    />
  </div>
)}

// Üret butonu mantığı
const handleGenerate = () => {
  if (isCompositeMode) {
    onGenerateComposite(addedWidgets, options);
  } else {
    onGenerate(options);
  }
};
```

**UI Tasarım**:
- Toggle: `[ Temel Mod ]` `[ Kompozit Mod ]`
- Kompozit modda: Kategori sekmesi + aktivite kartları grid
- Her kart üzerinde "+" butonu
- Eklenen widget'lar preview listesi (sürükle-sıl sıralama)

---

#### 2.2. ActivityGrid Bileşeni (Yeniden Kullanılabilir)

```tsx
// components/ActivityGrid.tsx

interface ActivityGridProps {
  activities: Activity[];
  selectedCategory?: string;
  onActivityClick: (activity: Activity) => void;
  mode: 'select' | 'add'; // select: aktivite seç, add: widget ekle
}

export const ActivityGrid: React.FC<ActivityGridProps> = ({
  activities,
  selectedCategory,
  onActivityClick,
  mode
}) => {
  const filtered = selectedCategory
    ? activities.filter(a => a.category === selectedCategory)
    : activities;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {filtered.map(activity => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onClick={() => onActivityClick(activity)}
          actionIcon={mode === 'add' ? 'plus' : 'arrow-right'}
        />
      ))}
    </div>
  );
};
```

**Kullanım**:
- İnfografik Stüdyosu'ndaki `ActivityGrid` → bu bileşeni kullanır
- GeneratorView kompozit modda → bu bileşeni kullanır
- Kod tekrarı %40 azalır

---

#### 2.3. Prompt Enrichment UI

```tsx
// GeneratorView.tsx içinde konu inputunun yanına ekle

<div className="relative">
  <textarea
    value={options.topic}
    onChange={(e) => handleChange('topic', e.target.value)}
    placeholder="Konu veya metin giriniz..."
    rows={4}
  />
  <button
    onClick={handleEnrichPrompt}
    disabled={isEnriching}
    className="absolute top-2 right-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs"
  >
    {isEnriching ? '⏳ Zenginleştiriliyor...' : '✨ AI ile Zenginleştir'}
  </button>
</div>

// Hook
const { enrichPrompt, isEnriching } = usePromptEnrichment();

const handleEnrichPrompt = async () => {
  const enriched = await enrichPrompt(options.topic);
  if (enriched) {
    handleChange('topic', enriched);
    show('Prompt başarıyla zenginleştirildi!', 'success');
  }
};
```

---

### Faz 3: Backend Entegrasyon (2-3 Gün)

#### 3.1. api/generate.ts Genişletmesi

**Yeni Request Tipi**:
```typescript
// api/generate.ts içine ekle

interface GenerateRequest {
  mode: 'single' | 'composite';

  // Single mode
  activityType?: ActivityType;

  // Composite mode
  widgets?: { activityId: ActivityType }[];

  // Ortak
  prompt: string;
  schema?: object;
  options: GeneratorOptions;
}
```

**Endpoint Mantığı**:
```typescript
export default async function handler(req, res) {
  const { mode, activityType, widgets, prompt, schema, options } = req.body;

  if (mode === 'composite') {
    // Composite üretim
    const result = await generateComposite(widgets, prompt, options.mode, options);
    return res.json(result);
  }

  // Single aktivite üretim (mevcut mantık)
  const generator = getGenerator(activityType);
  const result = await generator.generate({ ...options, prompt });
  return res.json(result);
}
```

---

#### 3.2. Rate Limiting Ayarlaması

**Sorun**: Composite modda birden fazla AI çağrısı → rate limit aşılabilir.

**Çözüm**:
```typescript
// rateLimiter.ts içinde composite için özel limit

const LIMITS = {
  apiGeneration: { free: 50, premium: 200 },
  compositeGeneration: { free: 10, premium: 50 } // Daha düşük
};

// api/generate.ts içinde
const limitType = mode === 'composite' ? 'compositeGeneration' : 'apiGeneration';
await rateLimiter.enforceLimit(userId, userTier, limitType);
```

---

#### 3.3. Önbellek Entegrasyonu

```typescript
// api/generate.ts içinde cache kontrolü

const cacheKey = `gen:${activityType}:${hashPrompt(prompt)}:${JSON.stringify(options)}`;
const cached = await cacheService.get(cacheKey);
if (cached) {
  console.log('Cache hit:', cacheKey);
  return res.json({ ...cached, _cached: true });
}

const result = await generator.generate({ ...options, prompt });
await cacheService.set(cacheKey, result, { ttl: 3600 });
return res.json(result);
```

**Cache Stratejisi**:
- TTL: 1 saat (AI modu)
- Infinite cache: Offline mod (deterministik)
- Invalidation: Kullanıcı "Yeniden Üret" butonu

---

### Faz 4: Özellik Testleri ve Optimizasyon (2-3 Gün)

#### 4.1. Test Senaryoları

**A. Temel Mod Testi**:
```
1. Kullanıcı "Okuma Anlama" aktivitesi seçer
2. Konu: "Hayvanlar" yazar
3. Zorluk: Orta, Yaş: 8-10, Mod: AI
4. "Üret" → api/generate.ts → Gemini AI → JSON
5. Worksheet render edilir
6. PDF export → başarılı
```

**B. Kompozit Mod Testi**:
```
1. Kullanıcı "Kompozit Mod" aktif eder
2. Ekler: [5W1H Panosu] + [Kelime Ağacı] + [Kesir Gösterimi]
3. Master Prompt: "Ağaçların yapısı ve matematik ilişkisi"
4. "Zenginleştir" → AI prompt'u geliştirir
5. "Üret" → 3 section tek kağıtta
6. Pedagojik not: Tüm section'ların notları birleştirilmiş
```

**C. Hata Yönetimi Testi**:
```
1. AI başarısız simüle et (API key geçersiz)
2. Sistem offline generatöre düşmeli
3. Kullanıcı: "AI başarısız, offline moda geçildi" mesajı görsün
4. Çıktı yine de üretilmeli
```

---

#### 4.2. Performans Optimizasyonu

**A. Lazy Loading**:
```typescript
// Kategori seçildiğinde o kategorinin aktivitelerini yükle
const { data: activities } = useQuery(
  ['activities', selectedCategory],
  () => fetchActivitiesByCategory(selectedCategory),
  { staleTime: 300000 } // 5 dakika
);
```

**B. Paralel Widget Üretimi** (Composite Modda):
```typescript
// compositeGenerator.ts içinde
const sectionPromises = widgets.map(widget =>
  getGenerator(widget.activityId).generate(options)
);

const sections = await Promise.all(sectionPromises); // Paralel
```

**Dikkat**: Bağlamsal tutarlılık gerekiyorsa sıralı üretim yap.

---

#### 4.3. Erişilebilirlik (A11y)

**WCAG 2.1 AA Uyumu**:
- ✅ Klavye navigasyonu: Tab, Enter, Escape
- ✅ ARIA etiketleri: `aria-label`, `aria-describedby`
- ✅ Kontrast oranı: 4.5:1 (metin), 3:1 (UI bileşenleri)
- ✅ Ekran okuyucu: "5W1H Panosu aktivitesi eklendi" gibi bildirimler

```tsx
<button
  onClick={handleAddWidget}
  aria-label={`${activity.title} aktivitesini ekle`}
  aria-describedby={`activity-${activity.id}-desc`}
>
  <PlusIcon />
</button>
<span id={`activity-${activity.id}-desc`} className="sr-only">
  {activity.description}
</span>
```

---

### Faz 5: Dokümantasyon ve Eğitim (1-2 Gün)

#### 5.1. Kullanıcı Dokümantasyonu

**Başlıklar**:
1. **Temel Mod Kullanımı**: Tek aktivite üretimi
2. **Kompozit Mod Kullanımı**: Çoklu modül ekleme
3. **Prompt Zenginleştirme**: AI ile konu geliştirme
4. **Mod Seçimi**: Fast vs AI vs Hybrid
5. **Export Seçenekleri**: PDF, Print, Worksheet

**Format**: Video tutorial (3 dakika) + yazılı kılavuz (Markdown)

---

#### 5.2. Geliştirici Dokümantasyonu

**Başlıklar**:
1. **Yeni Generatör Ekleme**: Template + örnek kod
2. **Activity Type Registry**: Enum güncelleme
3. **Composite Generator API**: Fonksiyon imzaları
4. **Test Yazma**: Vitest + Playwright örnekleri
5. **Performance Best Practices**: Cache, lazy loading

**Format**: Markdown + JSDoc comments

---

#### 5.3. Pedagoji Kılavuzu (Elif Yıldız Onaylı)

**Başlıklar**:
1. **Kompozit Çalışma Kağıdı Tasarımı**: Hangi modüller birlikte kullanılmalı
2. **ZPD Uyumu**: Zorluk kalibrasyonu nasıl yapılır
3. **Disleksi/DEHB Desteği**: Hangi aktivite kombinasyonları önerilir
4. **Pedagojik Not Yorumlama**: Öğretmene rehberlik

**Format**: PDF kılavuz (10 sayfa) + örnekler

---

## 🚀 UYGULAMA ZAMANLAMA

### Sprint 1 (Hafta 1): Altyapı
- **Gün 1-2**: Activity Type Registry + Generator Registry birleşmesi
- **Gün 3-4**: Composite Generator entegrasyonu
- **Gün 5**: Test + doğrulama

**Çıktı**: Backend hazır, 136+ generatör unified registry'de

---

### Sprint 2 (Hafta 2): Frontend
- **Gün 1-2**: GeneratorView kompozit mod eklentisi
- **Gün 3-4**: ActivityGrid bileşeni + UI testleri
- **Gün 5**: Prompt enrichment UI entegrasyonu

**Çıktı**: Kullanıcı kompozit mod kullanabiliyor

---

### Sprint 3 (Hafta 3): Backend API
- **Gün 1-2**: api/generate.ts genişletmesi
- **Gün 3**: Rate limiting + cache entegrasyonu
- **Gün 4-5**: Integration testleri

**Çıktı**: API production-ready

---

### Sprint 4 (Hafta 4): Optimizasyon ve Test
- **Gün 1-2**: Performans optimizasyonu (lazy loading, paralel üretim)
- **Gün 3**: Erişilebilirlik (A11y) testleri
- **Gün 4-5**: End-to-end testler (Playwright)

**Çıktı**: Platform stabil ve optimize

---

### Sprint 5 (Hafta 5): Dokümantasyon ve Launch
- **Gün 1-2**: Kullanıcı + geliştirici dokümantasyonu
- **Gün 3**: Video tutorial kayıt
- **Gün 4**: Pedagoji kılavuzu (Elif Yıldız review)
- **Gün 5**: Beta launch + feedback toplama

**Çıktı**: Platform kullanıcılara açık

---

## 📊 BAŞARI METRİKLERİ

### Teknik Metrikler
- ✅ **Kod Tekrarı Azalması**: %60 (DRY prensibi)
- ✅ **API Yanıt Süresi**: <2 saniye (AI modu), <100ms (offline)
- ✅ **Cache Hit Oranı**: >70% (tekrar eden üretimler)
- ✅ **Hata Oranı**: <1% (offline fallback sayesinde)
- ✅ **Test Coverage**: >85% (Vitest + Playwright)

### Kullanıcı Deneyimi Metrikleri
- ✅ **Aktivite Üretim Süresi**: 30 saniye → 5 saniye (kompozit mod)
- ✅ **Kullanıcı Memnuniyeti**: >4.5/5 (feedback anketleri)
- ✅ **Feature Adoption**: %40+ kullanıcı kompozit mod kullanıyor
- ✅ **Bounce Rate**: <15% (kullanıcılar platformda kalıyor)

### Pedagojik Metrikler (Elif Yıldız + Dr. Ahmet Kaya)
- ✅ **Pedagojik Not Kalitesi**: >90% (AI üretimlerinde)
- ✅ **ZPD Uyumu**: %95 (yaş grubu-zorluk eşleştirmesi)
- ✅ **Öğrenci Başarısı**: +20% (öğretmen raporları)

---

## 🔒 GÜVENLİK VE UYUMLULUK

### 1. KVKK Uyumu
- ✅ Öğrenci adı + tanı + skor aynı görünümde **asla** birlikte gösterilmez
- ✅ Veri şifreleme: AES-256 (veritabanı)
- ✅ Audit log: Tüm öğrenci veri erişimleri kaydedilir

### 2. MEB Uyumu
- ✅ BEP hedefleri SMART formatında
- ✅ Tanı koyucu dil yasak ("disleksisi var" → "disleksi desteğine ihtiyacı var")
- ✅ Müfredat kazanımları 2024-2025 dönemi

### 3. AI Güvenliği (Selin Arslan Standartları)
- ✅ Prompt injection koruması (10 katmanlı)
- ✅ Hallucination azaltma: JSON schema + validation
- ✅ Token maliyet optimizasyonu: <600 token/aktivite
- ✅ Rate limiting: Abuse önleme

---

## 🎓 AJAN ONAYLARI

### Elif Yıldız (Özel Öğrenme Uzmanı)
> **ONAY**: Kompozit mod, öğretmenlerin farklı beceri alanlarını tek kağıtta birleştirmesine izin veriyor. Bu, ZPD'ye uygun, kademeli zorluk artışını destekler. Pedagojik not agregasyonu özellikle kritik — her modülün neden eklendiği net açıklanmalı.

**Koşullar**:
- ✅ Her section için ayrı pedagogicalNote
- ✅ Agregasyon sırasında mantıksal bağlantı kurulmalı
- ✅ Başlangıç aktivitesi mutlaka kolay (confidence building)

---

### Dr. Ahmet Kaya (Özel Eğitim Uzmanı)
> **ONAY**: BEP entegrasyonu korunuyor. Ancak, kompozit modda öğrenci tanı bilgisi görünür olmamalı — sadece öğretmene özel notlarda.

**Koşullar**:
- ✅ Composite worksheet metadata'da tanı bilgisi yok
- ✅ SMART hedefler her section'da opsiyonel referans
- ✅ Klinik şablonlar (clinicalTemplates.ts) kompozit modda kullanılabilir ama izole

---

### Bora Demir (Yazılım Mühendisi)
> **ONAY**: Mimari birleşme mantıklı. Ancak, generator registry'de name collision riski var (örn: `mathStudio` ve `infographic-math-steps` çakışabilir). Unique naming convention zorunlu.

**Koşullar**:
- ✅ `INFOGRAPHIC_` prefix tüm infografik aktivitelerinde
- ✅ Generator registry'de duplikasyon testi (CI/CD)
- ✅ TypeScript strict mode korunur
- ✅ Vitest coverage >85%

---

### Selin Arslan (AI Mühendisi)
> **ONAY**: Prompt enrichment güçlü özellik. Ancak, token maliyeti artabilir (2x çağrı: enrichment + generation). Opsiyonel tutulmalı + cache zorunlu.

**Koşullar**:
- ✅ Enrichment cache TTL: 24 saat
- ✅ Kullanıcı enrichment atlamalı (opt-in, not default)
- ✅ Token kullanım dashboard'a eklenmeli (admin analytics)
- ✅ Gemini 2.5 Flash sabit (değiştirme yasak)

---

## 🔄 ROLLBACK PLANI

**Senaryo**: Kompozit mod production'da ciddi bug → geri dönüş gerekli

**Adımlar**:
1. Feature flag: `ENABLE_COMPOSITE_MODE=false` (env var)
2. GeneratorView eski haline döner (sadece single mode)
3. Database: Composite worksheet'ler "archived" işaretlenir (silinmez)
4. Kullanıcı bildirimi: "Kompozit mod geçici olarak devre dışı"

**Rollback Süresi**: <15 dakika (Vercel env var deployment)

---

## 📝 EK NOTLAR

### 1. Infografik Stüdyosu v3 Geleceği

**Seçenek A**: Tamamen kaldır (full migration)
- ✅ Kod tekrarı sıfır
- ❌ Mevcut kullanıcılar şok olabilir

**Seçenek B**: Legacy mod olarak tut (6 ay)
- ✅ Kullanıcılar geçiş yapabilir
- ✅ Analytics: Hangi modun daha çok kullanıldığı
- ❌ İki arayüz bakım maliyeti

**ÖNERİ**: Seçenek B (6 ay deprecation period)

---

### 2. Mobil Uyumluluk

**Sorun**: Kompozit mod masaüstü odaklı (3 panel layout)

**Çözüm**:
- Mobil: Tek panel (accordion modda)
- Tablet: 2 panel (sol + orta birleşik)
- Masaüstü: 3 panel

**Tasarım**: Responsive breakpoints
```css
@media (max-width: 768px) { /* Mobil */ }
@media (min-width: 769px) and (max-width: 1024px) { /* Tablet */ }
@media (min-width: 1025px) { /* Masaüstü */ }
```

---

### 3. Gelecek Özellikler (Roadmap)

**Q2 2026**:
- AI-powered activity sequencing (otomatik sıralama)
- Collaborative worksheets (öğretmen + öğretmen)
- Real-time preview (AI üretirken önizleme)

**Q3 2026**:
- Voice-to-prompt (sesli komut)
- Multi-language support (İngilizce, Almanca)
- AR integration (artırılmış gerçeklik aktiviteler)

---

## ✅ SONUÇ

Bu plan, İnfografik Stüdyosu v3'ü platformun ana aktivite üretim sistemine entegre ederek:

1. **Kod kalitesini artırır** (DRY, modularity)
2. **Kullanıcı deneyimini birleştirir** (tek arayüz)
3. **Performansı optimize eder** (cache, lazy load, parallel generation)
4. **Güvenliği güçlendirir** (prompt injection, rate limiting)
5. **Pedagojik değeri maksimize eder** (kompozit modda bağlamsal tutarlılık)

**Toplam Süre**: 5 hafta (25 iş günü)
**Ekip**: 4 lider ajan + 5 genel ajan (frontend, backend, QA, designer, DevOps)
**Maliyet**: İşçilik + AI token (~$500 ekstra aylık)
**ROI**: 6 ay içinde +40% kullanıcı artışı (feature adoption)

---

**ONAY BEKLENEN EKIP**:
- ✅ Elif Yıldız (Pedagoji)
- ✅ Dr. Ahmet Kaya (Klinik)
- ✅ Bora Demir (Mühendislik)
- ✅ Selin Arslan (AI)

**PLAN DURUMU**: ONAY BEKLİYOR
**SON GÜNCELLEMEː 2026-04-04**
