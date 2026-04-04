# İNFOGRAFİK STÜDYOSU v3.5 — UYGULAMA YOL HARİTASI
## ULTRA PREMİUM EDİSYON: BAŞLANGIÇ KONTROLÜ

**Tarih**: 2026-04-04
**Versiyon**: Implementation Roadmap v1.0
**Referans**: [inografikv3-detayli.md](./inografikv3-detayli.md)
**Durum**: 🚀 SPRINT 1 HAZIR

---

## 📊 MEVCUT DURUM ANALİZİ

### ✅ HALİHAZIRDA MEVCUT OLANLAR

#### 1. Tip Sistemi (src/types/infographic.ts)
```typescript
✅ BaseInfographicResult
✅ InfographicActivityResult
✅ InfographicActivityTemplate (20 template)
✅ InfographicCategory (10 kategori)
✅ InfographicActivityContent (12 content type)
✅ InfographicActivityMeta
```

#### 2. Servisler
```typescript
✅ src/services/infographicService.ts
   → generateInfographicSyntax() (AI-powered)
   → getDemoSyntax() (offline demo)

✅ src/services/generators/infographicGenerator.ts
   → generateInfographic() (merkezi AI motor)
   → _inferCategory() helper

✅ src/services/generators/registry.ts
   → 87 aktivite için AI + Offline generator mappings
   → ACTIVITY_GENERATOR_REGISTRY
```

#### 3. Bileşenler (src/components/InfographicStudio/)
```typescript
✅ index.tsx — 3 panelli ana yapı
✅ panels/LeftPanel/ — ActivityGrid, CategoryTabs, ParameterPanel
✅ panels/CenterPanel/ — A4PrintableSheetV2, InfographicPreview
✅ panels/RightPanel/ — ExportActions, TemplateInfoCard
✅ hooks/useInfographicGenerate — generate(), enrichPrompt()
✅ constants/activityMeta.ts — 96 aktivite metadata
```

---

## 🎯 PROJENİN HEDEFİ (Hatırlatma)

### Mevcut Durum → Hedef Durum

| Özellik | Mevcut (v3.0) | Hedef (v3.5) |
|---------|---------------|--------------|
| **Generatör Sayısı** | 1 AI (genel) | 96 AI + 96 Offline = 192 |
| **Özelleştirme** | 4 temel parametre | Aktivite başına 5-10 ultra-özel |
| **Layout Sistemi** | Manuel | CompactLayoutEngine (algoritma) |
| **Edit Toolbar** | Yok | Premium 6-panelli toolbar |
| **Content Density** | ~60% | %80-95 (kompakt mod) |
| **Rich Components** | Minimal | AI-driven icons, animations |

---

## 🚨 KRİTİK FARK: REGISTRY GAP ANALİZİ

### Mevcut Registry (src/services/generators/registry.ts)

**87 Aktivite Tanımlı**:
- ✅ Reading & Language: 24 aktivite
- ✅ Math & Logic: 28 aktivite
- ✅ Visual & Attention: 28 aktivite
- ✅ Story & Verbal: 12 aktivite

**Eksik/Placeholder**: 9 aktivite (OCR_CONTENT, WORKBOOK, vb.)

### İnfografik Aktiviteleri (constants/activityMeta.ts)

**96 INFOGRAPHIC_ Prefixli Aktivite**:
- Kategori 1 (Visual-Spatial): 15 aktivite
- Kategori 2 (Reading-Comprehension): 10 aktivite
- Kategori 3 (Language-Literacy): 8 aktivite
- Kategori 4 (Math-Logic): 12 aktivite
- Kategori 5 (Science): 10 aktivite
- Kategori 6 (Social-Studies): 8 aktivite
- Kategori 7 (Creative-Thinking): 9 aktivite
- Kategori 8 (Learning-Strategies): 8 aktivite
- Kategori 9 (SPLD-Support): 10 aktivite
- Kategori 10 (Clinical-BEP): 6 aktivite

### 🔥 SORUN: İKİ AYRI SİSTEM

```
┌─────────────────────────────────────────────────┐
│  SİSTEM A: ACTIVITY_GENERATOR_REGISTRY          │
│  ├─ 87 aktivite (AI + Offline)                  │
│  └─ GeneratorView ile kullanılıyor              │
├─────────────────────────────────────────────────┤
│  SİSTEM B: INFOGRAPHIC ACTIVITIES               │
│  ├─ 96 aktivite (metadata only)                 │
│  ├─ InfographicStudio'da listeleniyor           │
│  └─ Generatörleri YOK — sadece 1 genel AI var   │
└─────────────────────────────────────────────────┘

❌ İki sistem birbirine entegre değil!
```

---

## ✅ ÇÖZÜM STRATEJİSİ: 3 YOL SEÇENEĞİ

### SEÇENEK 1: Birleştirme (Merge)
**Açıklama**: 96 infografik aktivitesini ACTIVITY_GENERATOR_REGISTRY'ye ekle.

**Artıları**:
- ✅ Tek merkezi registry
- ✅ GeneratorView + InfographicStudio aynı altyapıyı kullanır
- ✅ DRY principle

**Eksileri**:
- ⚠️ ActivityType enum'a 96 yeni tip eklemek gerekir
- ⚠️ Naming collision riski (INFOGRAPHIC_ prefix vs normal)

**Süre**: 2 gün (tip tanımları + registry güncellemesi)

---

### SEÇENEK 2: Paralel Registry (Dual System)
**Açıklama**: Ayrı bir `INFOGRAPHIC_GENERATOR_REGISTRY` oluştur.

**Artıları**:
- ✅ Mevcut sisteme dokunmaz
- ✅ İnfografik-özel tip sistemi korunur
- ✅ Bağımsız geliştirilebilir

**Eksileri**:
- ❌ Kod duplikasyonu riski
- ❌ İki ayrı API endpoint gerekebilir

**Süre**: 1 gün (yeni registry + routing)

---

### SEÇENEK 3: Adaptör Pattern (Recommended ⭐)
**Açıklama**: İnfografik aktivitelerini mevcut registry'ye adaptör ile bağla.

```typescript
// services/generators/infographicAdapter.ts

import { ActivityType } from '../../types/activity';
import { InfographicActivityMeta } from '../constants/activityMeta';
import { generateInfographic } from './infographicGenerator';

export const INFOGRAPHIC_ADAPTER_REGISTRY: Partial<Record<ActivityType, GeneratorMapping>> = {
  // 96 infografik aktivitesini ActivityType'a map et
  [ActivityType.INFOGRAPHIC_5W1H_GRID]: {
    ai: (options) => generateInfographic('INFOGRAPHIC_5W1H_GRID', options),
    offline: (options) => generateOfflineInfographic('5w1h-grid', options)
  },
  // ... 95 daha
};

// Merkezi registry'ye merge
Object.assign(ACTIVITY_GENERATOR_REGISTRY, INFOGRAPHIC_ADAPTER_REGISTRY);
```

**Artıları**:
- ✅ Mevcut registry'yi genişletir (extend)
- ✅ İnfografik generatörünü wrapper olarak kullanır
- ✅ Kademeli implementasyon (10'ar 10'ar eklenebilir)

**Eksileri**:
- ⚠️ ActivityType enum 96 yeni giriş alacak (büyük dosya)

**Süre**: 3 gün (adaptör yazılımı + test)

---

## 🏗️ SEÇENEK 3 (ADAPTÖR) İLE SPRINT 1 PLANI

### Hafta 1: Altyapı + İlk 10 Aktivite

#### Gün 1-2: Adaptör Altyapısı
**Görevler**:
1. `src/types/activity.ts` → 96 yeni `INFOGRAPHIC_*` tipi ekle
2. `src/services/generators/infographicAdapter.ts` oluştur
3. `generateOfflineInfographic()` fonksiyonu yaz (template sistemi)
4. Adaptör registry'yi test et (1 aktivite ile)

**Çıktı**:
```typescript
// types/activity.ts güncellemesi
export enum ActivityType {
  // ... mevcut tipler

  // 🆕 INFOGRAPHIC ACTIVITIES
  INFOGRAPHIC_5W1H_GRID = 'INFOGRAPHIC_5W1H_GRID',
  INFOGRAPHIC_MATH_STEPS = 'INFOGRAPHIC_MATH_STEPS',
  INFOGRAPHIC_VENN_DIAGRAM = 'INFOGRAPHIC_VENN_DIAGRAM',
  // ... 93 daha
}
```

#### Gün 3-4: İlk 10 Aktivite
**Implementasyon**:
1. **5W1H Grid**: AI + Offline generator yazılımı
2. **Math Steps**: Custom params (stepDetailLevel, visualAid, etc.)
3. **Venn Diagram**: 2-3 circle support + color schemes
4. **Sequence Timeline**: Date formatting + event icons
5. **Concept Map**: Hierarchical layout + auto-positioning
6. **Compare Table**: 2-column + highlight differences
7. **Fishbone Diagram**: Cause-effect branches + color coding
8. **Life Cycle**: Circular layout + stage transitions
9. **Story Map**: Character + setting + plot structure
10. **Word Family**: Root word + derivatives + visual tree

**Her aktivite için**:
- `services/generators/infographic/[activity-name]/`
  - `ai-generator.ts` (Gemini prompt + schema)
  - `offline-generator.ts` (deterministic logic)
  - `customization-schema.ts` (UltraCustomizationSchema)
  - `index.ts` (exports)

#### Gün 5: Test + Doğrulama
**Test Senaryoları**:
- [ ] GeneratorView'dan infografik aktivitesi seçme
- [ ] AI mod ile üretim (5-15s)
- [ ] Offline mod ile üretim (<100ms)
- [ ] Custom params değiştirilince farklı çıktı
- [ ] A4 PDF export (300 DPI)

**Başarı Kriterleri**:
- ✅ 10 aktivite hem AI hem offline çalışıyor
- ✅ Registry'de doğru şekilde listelenmiş
- ✅ API endpoint (`/api/generate`) infografik aktiviteleri kabul ediyor
- ✅ PDF kalitesi matbaa standardında

---

## 📋 HAFTA 2-10 HİZLI ÖZETİ

| Sprint | Hafta | Görev | Çıktı |
|--------|-------|-------|-------|
| 2 | 2 | CompactLayoutEngine | A4 minimal margin + grid system |
| 3 | 3 | PremiumEditToolbar | 6 panelli toolbar + live preview |
| 4 | 4 | Zengin AI Bileşenleri | Icons, animations, themes |
| 5 | 5-9 | Kalan 86 aktivite | 192 generatör tamamlandı |
| 6 | 10 | Optimizasyon + Deploy | Production-ready |

---

## 🚀 SONRAKİ ADIM: KARAR NOKTASI

**3 Seçenekten birini onaylayın**:

1️⃣ **Birleştirme (Merge)**: 2 gün sürer, tek registry
2️⃣ **Paralel Registry**: 1 gün sürer, iki ayrı sistem
3️⃣ **Adaptör Pattern** ⭐: 3 gün sürer, kademeli implementasyon

**Önerilen**: **Seçenek 3 (Adaptör)** → Esnek, kademeli, test edilebilir

---

## 📝 UYGULAMAYA GEÇİŞ ÖNCESİ CHECKLIST

Sprint 1'e başlamadan önce:

### Pedagojik Onay
- [ ] Elif Yıldız (ozel-ogrenme-uzmani) → İlk 10 aktivitenin pedagojik uygunluğunu kontrol et
- [ ] Her aktivite için `pedagogicalNote` min 100 kelime garantisi

### Teknik Hazırlık
- [ ] Bora Demir (yazilim-muhendisi) → TypeScript strict mode uyumlu mu?
- [ ] `any` tipi yasak → `unknown` + type guard kullanılacak
- [ ] `AppError` standardı korunacak

### AI Kalite Kontrolü
- [ ] Selin Arslan (ai-muhendisi) → 10 aktivite için prompt template'leri gözden geçir
- [ ] Gemini 2.5 Flash model sabit (`MASTER_MODEL`)
- [ ] Token maliyeti tahmini (10 aktivite × 500 token/request × $0.002)

### Klinik Uyumluluk
- [ ] Dr. Ahmet Kaya (ozel-egitim-uzmani) → BEP + MEB uyumluluğu
- [ ] Tanı koyucu dil yasak: "disleksisi var" değil → "disleksi desteğine ihtiyacı var"

---

## 🎯 BAŞARI METRİKLERİ (Sprint 1)

| Metrik | Hedef | Ölçüm Yöntemi |
|--------|-------|---------------|
| **Generatör Sayısı** | 10 AI + 10 Offline | Registry'de kayıtlı mı? |
| **Render Süresi** | <500ms offline, <5s AI | Performance profiling |
| **Custom Params** | Ortalama 6 param/aktivite | Schema dosyaları |
| **Test Coverage** | >80% | Vitest sonuçları |
| **pedagogicalNote** | 100% dolu, min 100 kelime | Manual review |

---

## 📌 ÖNEMLİ NOTLAR

### Kod Standartları (Bora Demir)
```typescript
// ✅ DOĞRU
interface CustomParamDefinition {
  type: 'select' | 'number' | 'boolean';
  default: string | number | boolean;
}

// ❌ YANLIŞ
const config: any = { ... };  // any yasak!
```

### Pedagojik Standartlar (Elif Yıldız)
- Her aktivitede **ZPD uyumu** (yaş grubu × zorluk)
- İlk madde mutlaka kolay (güven inşası)
- `pedagogicalNote`: "Neden bu format? Hangi beceriyi destekler? MEB bağlantısı nedir?"

### AI Standartları (Selin Arslan)
- Gemini 2.5 Flash (`gemini-2.5-flash`) — değiştirme yasak
- JSON Schema ile structured output (hallucination önleme)
- Prompt injection protection (user input sanitize)

### Klinik Standartlar (Dr. Ahmet Kaya)
- KVKK: Öğrenci adı + tanı + skor birlikte görünmez
- BEP hedefleri SMART formatında (Specific, Measurable, Achievable, Relevant, Time-bound)

---

## 🏁 BİTİŞ KOŞULLARI (Sprint 1)

Sprint 1 başarılı sayılır, eğer:

1. ✅ 10 aktivite hem AI hem offline üretim yapıyor
2. ✅ Tüm aktiviteler `ACTIVITY_GENERATOR_REGISTRY`'de
3. ✅ GeneratorView'dan infografik aktivitesi seçilebiliyor
4. ✅ Custom params UI'da düzenlenebiliyor
5. ✅ A4 PDF export 300 DPI kalitede
6. ✅ 4 lider uzman (Elif, Dr. Ahmet, Bora, Selin) onayı alındı
7. ✅ Vitest testleri geçiyor (%80+ coverage)
8. ✅ Production'a deploy edilebilir durum

---

**DURUM**: 🚦 KARAR BEKLİYOR
**SONRAKI**: Seçenek 3 (Adaptör) onaylanırsa → **SPRINT 1, GÜN 1** başlasın

**Not**: Bu belge, [inografikv3-detayli.md](./inografikv3-detayli.md) planının **uygulamaya geçiş hazırlığı**dır.
Detaylı teknik spesifikasyonlar ana planda mevcuttur.
