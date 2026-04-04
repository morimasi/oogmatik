# İNFOGRAFİK STÜDYOSU v3 → ULTRA PREMİUM ÜRETİM PLATFORMU
## KAPSAMLI DÖNÜŞÜM VE UYGULAMA PLANI

**Tarih**: 2026-04-04
**Versiyon**: 3.5 (Ultra Premium Edition)
**Durum**: UYGULAMA HAZIR
**Onaylayan Ekip**: 9 Ajan Koordinasyonu (Tam Aktivasyon)

---

# İÇİNDEKİLER

1. [Yönetici Özeti](#yönetici-özeti)
2. [Mevcut Durum Analizi](#mevcut-durum-analizi)
3. [Hedef Mimari ve Vizyon](#hedef-mimari-ve-vizyon)
4. [Kritik Sorun Tespiti](#kritik-sorun-tespiti)
5. [Çözüm Stratejileri](#çözüm-stratejileri)
6. [Teknik Mimari Tasarım](#teknik-mimari-tasarım)
7. [Uygulama Sprint Planı](#uygulama-sprint-planı)
8. [Başarı Metrikleri](#başarı-metrikleri)
9. [Güvenlik ve Uyumluluk](#güvenlik-ve-uyumluluk)
10. [Ajan Onayları](#ajan-onayları)

---

# YÖNETICI ÖZETİ

## Mevcut Durum
İnfografik Stüdyosu v3, **96 farklı infografik aktivite türü** için özelleştirilmiş bir composite worksheet generator olarak çalışmaktadır. Ancak, ana uygulamanın aktivite üretim mekanizmasından izole bir yapıda durmaktadır.

## Yeni Hedef (Ultra Premium)
**3 katmanlı profesyonel üretim platformu**:

```
┌─────────────────────────────────────────────────────────────────┐
│  KATMAN 1: ULTRA ÖZELLEŞTİRİLEBİLİR GENERATOR SİSTEMİ          │
│  ├─ 96 AI Generatör (Gemini 2.5 Flash)                          │
│  ├─ 96 Offline Generatör (Anlık, maliyet sıfır)                 │
│  └─ Her şablon için ultra-spesifik parametre setleri            │
├─────────────────────────────────────────────────────────────────┤
│  KATMAN 2: KOMPAKT A4 RENDER MOTORU                             │
│  ├─ Minimal boşluk algoritması (15mm margin max)                │
│  ├─ Grid-based layout (2-4 sütun dinamik)                       │
│  ├─ Content density optimizer (300-400 DPI print quality)       │
│  └─ Typography engine (Lexend + size optimization)              │
├─────────────────────────────────────────────────────────────────┤
│  KATMAN 3: PREMİUM EDİT TOOLBAR                                 │
│  ├─ Real-time preview + live edit                               │
│  ├─ Export hub: PDF, Print, Kitapçık, PNG                       │
│  ├─ Layout controls: Sütun, tablo, boşluk, grid                 │
│  └─ Typography panel: Font, punto, satır aralığı, hizalama      │
└─────────────────────────────────────────────────────────────────┘
```

## Stratejik Değer
- ✅ **Profesyonel Kalite**: Matbaa standartlarında çıktı
- ✅ **Maksimum Verimlilik**: A4'e sığan maksimum içerik
- ✅ **Öğretmen Özgürlüğü**: Her detayı kontrol edebilme
- ✅ **Hız + Kalite**: Offline mod (anlık) + AI mod (premium)
- ✅ **Kod Tekrarı Azalması**: %60 (DRY prensibi)
- ✅ **Kullanıcı Deneyimi Birleşmesi**: Tek arayüz, tutarlı UX

---

# MEVCUT DURUM ANALİZİ

## A. İnfografik Stüdyosu v3 Mimarisi

### 1. Bileşen Yapısı (3 Panel Sistemi)
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

### Güçlü Yönler
- ✅ **Widget-based Composition**: Kullanıcı birden fazla aktivite modülü ekleyip tek çalışma kağıdında birleştirebilir
- ✅ **Prompt Enrichment**: AI ile kullanıcı promptunu zenginleştirir (bağlamsal tutarlılık)
- ✅ **Premium Export**: PDF (300 DPI), Print, Worksheet entegrasyonu
- ✅ **Native Renderer**: 6 premium şablon (5W1H, Math Steps, Venn, Fishbone, Cycle, Matrix)

### Zayıf Yönler
- ❌ Ana uygulamanın `GeneratorView` ve `ActivityService` ile BAĞLANTISI YOK
- ❌ Offline generatörleri kullanmıyor (sadece AI modu)
- ❌ `services/generators/` altındaki 40+ generatörden izole
- ❌ Zustand store (`useWorksheetStore`, `useStudentStore`) entegrasyonu eksik

---

## B. Ana Uygulama Aktivite Üretim Sistemi

### 1. GeneratorView.tsx — Aktivite Üretim Arayüzü

**Entegrasyon Noktaları**:
- ✅ `useStudentStore`: Aktif öğrenci profili
- ✅ `useActivitySettings`: Activity-bazlı parametre state
- ✅ `activeCurriculumSession`: MEB müfredat entegrasyonu
- ✅ `getActivityConfigComponent()`: Her aktivite türü için özel config UI

### 2. services/generators/ — AI Üretim Servisleri

**40+ Generatör Listesi**:
```
readingStudio.ts, mathStudio.ts, creativeStudio.ts
dyslexiaSupport.ts, dyscalculia.ts, visualPerception.ts
memoryAttention.ts, wordGames.ts, algorithm.ts
brainTeasers.ts, patternCompletion.ts, logicProblems.ts
familyTreeMatrix.ts, financialMarket.ts, fiveWOneH.ts
+ 25 daha...
```

**Kritik Özellikler**:
- ✅ **Dual Mode**: `mode: 'fast' | 'ai'` parametresi
- ✅ **Pedagojik Not**: Her generatör Elif Yıldız standardına uygun pedagogicalNote üretir
- ✅ **JSON Schema**: Gemini structured output ile tip güvenli
- ✅ **Offline Fallback**: AI başarısız → offline generatör devreye girer

### 3. api/generate.ts — Merkezi AI Endpoint

**Sorumluluklar**:
1. ✅ **Rate Limiting**: IP + user bazlı (50 istek/saat)
2. ✅ **Prompt Injection Güvenliği**: `validatePromptSecurity()` (10 katmanlı)
3. ✅ **JSON Onarım Motoru**: 3 katmanlı repair (balanceBraces → truncate → parse)
4. ✅ **CORS Koruması**: Origin whitelisting
5. ✅ **Gemini 2.5 Flash**: Sabit model (`MASTER_MODEL`)

---

## C. Mevcut Registry Analizi

### ACTIVITY_GENERATOR_REGISTRY (87 Aktivite)
```typescript
✅ Reading & Language: 24 aktivite
✅ Math & Logic: 28 aktivite
✅ Visual & Attention: 28 aktivite
✅ Story & Verbal: 12 aktivite
```

### İnfografik Aktiviteleri (96 Aktivite)
```typescript
✅ Visual-Spatial: 15 aktivite
✅ Reading-Comprehension: 10 aktivite
✅ Language-Literacy: 8 aktivite
✅ Math-Logic: 12 aktivite
✅ Science: 10 aktivite
✅ Social-Studies: 8 aktivite
✅ Creative-Thinking: 9 aktivite
✅ Learning-Strategies: 8 aktivite
✅ SPLD-Support: 10 aktivite
✅ Clinical-BEP: 6 aktivite
```

---

# KRİTİK SORUN TESPİTİ

## 🔥 İKİ AYRI SİSTEM SORUNU

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
❌ Kod duplikasyonu %60+
❌ Kullanıcı deneyimi parçalı
```

---

# ÇÖZÜM STRATEJİLERİ

## 3 Alternatif Yaklaşım

### SEÇENEK 1: Birleştirme (Merge)
**Açıklama**: 96 infografik aktivitesini ACTIVITY_GENERATOR_REGISTRY'ye ekle.

**Artıları**:
- ✅ Tek merkezi registry
- ✅ GeneratorView + InfographicStudio aynı altyapıyı kullanır
- ✅ DRY principle

**Eksileri**:
- ⚠️ ActivityType enum'a 96 yeni tip eklemek gerekir
- ⚠️ Naming collision riski

**Süre**: 2 gün

---

### SEÇENEK 2: Paralel Registry (Dual System)
**Açıklama**: Ayrı bir `INFOGRAPHIC_GENERATOR_REGISTRY` oluştur.

**Artıları**:
- ✅ Mevcut sisteme dokunmaz
- ✅ Bağımsız geliştirilebilir

**Eksileri**:
- ❌ Kod duplikasyonu riski
- ❌ İki ayrı API endpoint

**Süre**: 1 gün

---

### SEÇENEK 3: Adaptör Pattern ⭐ (ÖNERİLEN)
**Açıklama**: İnfografik aktivitelerini mevcut registry'ye adaptör ile bağla.

```typescript
// services/generators/infographicAdapter.ts

import { ActivityType } from '../../types/activity';
import { generateInfographic } from './infographicGenerator';

export const INFOGRAPHIC_ADAPTER_REGISTRY: Partial<Record<ActivityType, GeneratorMapping>> = {
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
- ✅ Test edilebilir, geri dönülebilir

**Eksileri**:
- ⚠️ ActivityType enum 96 yeni giriş alacak

**Süre**: 3 gün

**KARAR**: ✅ Seçenek 3 (Adaptör Pattern) ile devam edilecek

---

# TEKNİK MİMARİ TASARIM

## KATMAN 1: Çift Modlu Generator Sistemi

### 1.1. Generator Architecture

```typescript
// Her 96 aktivite için bu yapı:
interface InfographicGeneratorPair {
  activityType: ActivityType;

  // AI Generator
  aiGenerator: {
    generate: (params: UltraParams) => Promise<InfographicResult>;
    supportsCustomization: true;
    estimatedTime: '5-15s';
    tokenCost: number;
  };

  // Offline Generator
  offlineGenerator: {
    generate: (params: UltraParams) => InfographicResult;
    supportsCustomization: true;
    estimatedTime: '<100ms';
    tokenCost: 0;
  };

  // Ultra Customization Schema
  customizationSchema: UltraCustomizationSchema;
}
```

### 1.2. Örnek: 5W1H Grid Aktivitesi

**AI Generator** (`ai-generator.ts`):
```typescript
export async function generate5W1HGrid_AI(params: UltraParams) {
  const {
    topic,
    difficulty,
    itemCount,
    // Ultra-özel parametreler:
    questionDepth,      // 'basic' | 'intermediate' | 'advanced'
    includeVisuals,     // boolean
    colorScheme,        // 'dyslexia' | 'adhd' | 'standard'
    gridLayout,         // '2x3' | '3x2' | '6x1'
    promptStyle         // 'direct' | 'inference' | 'mixed'
  } = params;

  const prompt = `
Sen ${difficulty} zorlukta, ${topic} konusunda 5W1H Grid infografiği oluşturan bir pedagoji uzmanısın.

KONU: ${topic}

PARAMETRELİK ÖZELLEŞTIRMELER:
- Soru Derinliği: ${questionDepth}
- Grid Layout: ${gridLayout}
- Renk Şeması: ${colorScheme}
- Görsel Ekleme: ${includeVisuals ? 'HER kutuda ilgili emoji/ikon ekle' : 'Sadece metin'}

ÜRETİM KURALLARI:
1. ${itemCount} adet 5W1H sorusu üret (Who, What, When, Where, Why, How)
2. Pedagojik not: Neden bu grid yapısı seçildi, öğrenciye nasıl fayda sağlar?
3. A4 sayfaya KOMPAKT sığdırma: Minimal margin, optimum font size
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      gridLayout: { type: 'STRING', enum: ['2x3', '3x2', '6x1'] },
      questions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            category: { type: 'STRING', enum: ['Who', 'What', 'When', 'Where', 'Why', 'How'] },
            question: { type: 'STRING' },
            visualCue: { type: 'STRING' },
            difficulty: { type: 'STRING' },
            answerSpace: { type: 'NUMBER' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING' },
      layoutHints: {
        type: 'OBJECT',
        properties: {
          columnCount: { type: 'NUMBER' },
          rowCount: { type: 'NUMBER' },
          cellPadding: { type: 'STRING' },
          fontSize: { type: 'STRING' }
        }
      }
    }
  };

  const result = await generateWithSchema({ prompt, schema });
  return result;
}
```

**Offline Generator** (`offline-generator.ts`):
```typescript
export function generate5W1HGrid_Offline(params: UltraParams) {
  const { topic, itemCount, gridLayout, questionDepth } = params;

  // Deterministik 5W1H sorular
  const templates = {
    basic: {
      Who: ['Kim [eylem] yaptı?', 'Kim bu olayda rol oynadı?'],
      What: ['Ne oldu?', 'Neydi bu?'],
      When: ['Ne zaman gerçekleşti?', 'Hangi tarihte?'],
      Where: ['Nerede oldu?', 'Hangi yerde?'],
      Why: ['Neden böyle oldu?', 'Sebebi neydi?'],
      How: ['Nasıl oldu?', 'Hangi şekilde?']
    },
    intermediate: {
      Who: ['Hangi karakter/kişi bu olayla ilişkiliydi ve neden önemliydi?'],
      What: ['Olay zincirinde ne tür bir değişim yarattı?'],
      // ... daha fazla
    },
    advanced: {
      Who: ['Farklı karakterlerin perspektifinden bu olay nasıl yorumlanabilir?'],
      // ... daha fazla
    }
  };

  const selectedTemplates = templates[questionDepth] || templates.basic;
  const categories = ['Who', 'What', 'When', 'Where', 'Why', 'How'];

  const questions = categories.slice(0, itemCount).map((category) => {
    const questionTemplate = selectedTemplates[category][0]
      .replace('[eylem]', topic.toLowerCase());

    return {
      category,
      question: questionTemplate,
      visualCue: getCategoryIcon(category),
      difficulty: questionDepth,
      answerSpace: questionDepth === 'advanced' ? 4 : 2
    };
  });

  const [cols, rows] = gridLayout.split('x').map(Number);

  return {
    title: `${topic} - 5N1K Analizi`,
    gridLayout,
    questions,
    pedagogicalNote: `Bu ${gridLayout} grid yapısı, öğrencinin konuyu yapılandırılmış şekilde analiz etmesini sağlar.`,
    layoutHints: {
      columnCount: cols,
      rowCount: rows,
      cellPadding: '10px',
      fontSize: '11pt'
    }
  };
}
```

---

## KATMAN 2: Kompakt A4 Render Motoru

### 2.1. CompactLayoutEngine Sınıfı

```typescript
// services/layout/compactLayoutEngine.ts

export interface CompactLayoutConfig {
  pageSize: 'A4' | 'Letter' | 'B5';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;    // mm
    right: number;
    bottom: number;
    left: number;
  };
  contentDensity: number; // 0-100 (100 = maksimum sıkışık)
  columnCount: number;    // 1-4
  gutterWidth: number;    // Sütunlar arası boşluk (mm)
  typography: {
    baseFontSize: number; // pt
    lineHeight: number;   // multiplier
    headingScale: number;
  };
  gridSystem: {
    enabled: boolean;
    rows: number;
    cols: number;
    cellGap: number; // mm
  };
}

export class CompactLayoutEngine {
  private config: CompactLayoutConfig;
  private a4Dimensions = { width: 210, height: 297 }; // mm

  calculateContentArea(): { width: number; height: number } {
    const { margins } = this.config;
    return {
      width: this.a4Dimensions.width - margins.left - margins.right,
      height: this.a4Dimensions.height - margins.top - margins.bottom
    };
  }

  optimizeMargins(): CompactLayoutConfig['margins'] {
    const { contentDensity } = this.config;
    // contentDensity 100 → minimal margin (10mm)
    // contentDensity 0 → rahat margin (20mm)
    const baseMargin = 20;
    const minMargin = 10;
    const calculatedMargin = baseMargin - (contentDensity / 100) * (baseMargin - minMargin);

    return {
      top: calculatedMargin,
      right: calculatedMargin,
      bottom: calculatedMargin,
      left: calculatedMargin
    };
  }

  calculateColumnWidths(): number[] {
    const contentArea = this.calculateContentArea();
    const { columnCount, gutterWidth } = this.config;
    const totalGutterSpace = gutterWidth * (columnCount - 1);
    const availableWidth = contentArea.width - totalGutterSpace;
    const columnWidth = availableWidth / columnCount;
    return Array(columnCount).fill(columnWidth);
  }

  optimizeTypography(): CompactLayoutConfig['typography'] {
    const { contentDensity, typography } = this.config;
    // Yüksek density → küçük font, dar satır aralığı
    const fontSizeMultiplier = 1 - (contentDensity / 100) * 0.15;
    const lineHeightMultiplier = 1 - (contentDensity / 100) * 0.1;

    return {
      baseFontSize: typography.baseFontSize * fontSizeMultiplier,
      lineHeight: typography.lineHeight * lineHeightMultiplier,
      headingScale: typography.headingScale
    };
  }
}
```

---

## KATMAN 3: Premium Edit Toolbar

### 3.1. PremiumEditToolbar Bileşeni

```tsx
// components/InfographicStudio/Toolbar/PremiumEditToolbar.tsx

import React, { useState } from 'react';
import {
  Printer, Download, BookOpen, Table, Columns,
  Type, AlignLeft, Space, Grid, PaintBucket
} from 'lucide-react';

interface PremiumEditToolbarProps {
  worksheet: InfographicResult;
  onLayoutChange: (layout: LayoutConfig) => void;
  onExport: (format: ExportFormat) => void;
  onAddToWorkbook: () => void;
}

export const PremiumEditToolbar: React.FC<PremiumEditToolbarProps> = ({
  worksheet,
  onLayoutChange,
  onExport,
  onAddToWorkbook
}) => {
  const [activePanel, setActivePanel] = useState<ToolbarPanel | null>(null);
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig>({
    columns: 2,
    margins: { top: 15, right: 15, bottom: 15, left: 15 },
    fontSize: 11,
    lineHeight: 1.4,
    contentDensity: 70,
    gridEnabled: false,
    gridRows: 3,
    gridCols: 2
  });

  const updateLayout = (updates: Partial<LayoutConfig>) => {
    const newConfig = { ...layoutConfig, ...updates };
    setLayoutConfig(newConfig);
    onLayoutChange(newConfig);
  };

  return (
    <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
      {/* Main Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2">
        {/* Export Actions */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <ToolbarButton icon={<Printer size={18} />} label="Yazdır" onClick={() => onExport('print')} variant="primary" />
          <ToolbarButton icon={<Download size={18} />} label="PDF İndir" onClick={() => onExport('pdf')} variant="primary" />
          <ToolbarButton icon={<BookOpen size={18} />} label="Kitapçığa Ekle" onClick={onAddToWorkbook} variant="primary" />
        </div>

        {/* Layout Controls */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <ToolbarButton icon={<Columns size={18} />} label="Sütunlar" onClick={() => setActivePanel(activePanel === 'columns' ? null : 'columns')} active={activePanel === 'columns'} />
          <ToolbarButton icon={<Grid size={18} />} label="Grid" onClick={() => setActivePanel(activePanel === 'grid' ? null : 'grid')} active={activePanel === 'grid'} />
          <ToolbarButton icon={<Space size={18} />} label="Boşluklar" onClick={() => setActivePanel(activePanel === 'spacing' ? null : 'spacing')} active={activePanel === 'spacing'} />
        </div>

        {/* Typography Controls */}
        <div className="flex items-center gap-1">
          <ToolbarButton icon={<Type size={18} />} label="Yazı Tipi" onClick={() => setActivePanel(activePanel === 'typography' ? null : 'typography')} active={activePanel === 'typography'} />
          <ToolbarButton icon={<PaintBucket size={18} />} label="Renkler" onClick={() => setActivePanel(activePanel === 'colors' ? null : 'colors')} active={activePanel === 'colors'} />
        </div>
      </div>

      {/* Sub-Panels */}
      {activePanel && (
        <div className="border-t border-white/10 bg-slate-800/50 p-4">
          {activePanel === 'columns' && <ColumnsPanel layout={layoutConfig} onChange={updateLayout} />}
          {activePanel === 'grid' && <GridPanel layout={layoutConfig} onChange={updateLayout} />}
          {activePanel === 'spacing' && <SpacingPanel layout={layoutConfig} onChange={updateLayout} />}
          {activePanel === 'typography' && <TypographyPanel layout={layoutConfig} onChange={updateLayout} />}
        </div>
      )}
    </div>
  );
};
```

---

# UYGULAMA SPRİNT PLANI

## Sprint 1: Dual Generator Altyapısı (Hafta 1)

### Gün 1-2: Adaptör Altyapısı
**Görevler**:
1. `src/types/activity.ts` → 96 yeni `INFOGRAPHIC_*` tipi ekle
2. `src/services/generators/infographicAdapter.ts` oluştur
3. `generateOfflineInfographic()` fonksiyonu yaz
4. Adaptör registry'yi test et (1 aktivite ile)

### Gün 3-4: İlk 10 Aktivite Implementasyonu
1. 5W1H Grid (AI + Offline)
2. Math Steps (AI + Offline)
3. Venn Diagram (AI + Offline)
4. Sequence Timeline (AI + Offline)
5. Concept Map (AI + Offline)
6. Compare Table (AI + Offline)
7. Fishbone Diagram (AI + Offline)
8. Life Cycle (AI + Offline)
9. Story Map (AI + Offline)
10. Word Family (AI + Offline)

### Gün 5: Test + Doğrulama
- [ ] Generator registry entegrasyonu
- [ ] Mode switching testi (AI ↔ Offline)
- [ ] Custom params doğrulama
- [ ] A4 PDF export (300 DPI)

**Çıktı**: 10 aktivite tam çalışır, kalan 86'sı için template hazır

---

## Sprint 2: Kompakt Layout Engine (Hafta 2)

### Gün 1-2: Layout Engine Core
- [ ] `CompactLayoutEngine` sınıfı
- [ ] Content area hesaplamaları
- [ ] Margin optimization algoritması
- [ ] Column width calculator

### Gün 3: Grid System
- [ ] Grid layout calculator
- [ ] Smart content fitting
- [ ] Overflow detection

### Gün 4: Typography Optimizer
- [ ] Optimal font size calculator
- [ ] Line height adjuster
- [ ] Density-based scaling

### Gün 5: Integration Test
- [ ] A4 render testi (tüm 10 aktivite)
- [ ] Content density %50, %70, %90 test
- [ ] PDF export quality check

**Çıktı**: Layout engine production-ready

---

## Sprint 3: Premium Edit Toolbar (Hafta 3)

### Gün 1-2: Toolbar Infrastructure
- [ ] `PremiumEditToolbar` component
- [ ] Sub-panel system
- [ ] State management

### Gün 3: Live Preview
- [ ] Real-time layout update
- [ ] Debounced render
- [ ] Preview cache

### Gün 4: Export Hub
- [ ] PDF export with custom layout
- [ ] Print dialog integration
- [ ] Kitapçık entegrasyonu
- [ ] PNG export (high-res)

### Gün 5: Polish + UX
- [ ] Tooltip'ler
- [ ] Keyboard shortcuts
- [ ] Preset system

**Çıktı**: Tam özellikli edit toolbar

---

## Sprint 4: Zengin AI Bileşenleri (Hafta 4)

### Gün 1: Visual Elements
- [ ] AI-generated icon library (96 aktivite)
- [ ] Animated borders
- [ ] Smart diagrams

### Gün 2: Interactive Elements
- [ ] Interactive question boxes
- [ ] Progressive reveal
- [ ] Drag-and-drop answer zones

### Gün 3: Theme System
- [ ] Color palette generator
- [ ] Disleksi/DEHB profil renk setleri
- [ ] Theme preview + apply

### Gün 4-5: Integration + Test
- [ ] Tüm bileşenleri 10 aktiviteye entegre et
- [ ] Visual regression test
- [ ] Accessibility (A11y) test

**Çıktı**: Görsel olarak zengin, interaktif aktiviteler

---

## Sprint 5: Kalan 86 Aktivite (Hafta 5-9)

**Hedef**: Günde 4 aktivite (AI + Offline), 5 haftada 86 aktivite tamamla

- Hafta 5: Kat 2 (Okuduğunu Anlama) - 10 aktivite
- Hafta 6: Kat 3 (Dil ve Okuryazarlık) - 10 aktivite
- Hafta 7: Kat 4-5 (Matematik + Fen) - 18 aktivite
- Hafta 8: Kat 6-7 (Sosyal + Yaratıcı) - 16 aktivite
- Hafta 9: Kat 8-10 (Strateji + SpLD + Klinik) - 32 aktivite

---

## Sprint 6: Optimizasyon ve Polish (Hafta 10)

### Gün 1-2: Performance
- [ ] Lazy loading
- [ ] Generator cache optimization
- [ ] Bundle size reduction

### Gün 3: User Testing
- [ ] 5 öğretmen ile beta test
- [ ] Feedback toplama
- [ ] UX iyileştirmeleri

### Gün 4: Documentation
- [ ] Kullanıcı kılavuzu
- [ ] Geliştirici dokümantasyonu
- [ ] Pedagoji rehberi

### Gün 5: Production Deploy
- [ ] Final test (E2E)
- [ ] Deploy to production
- [ ] Monitoring setup

**Çıktı**: Platform production'da, 96 aktivite tam çalışır

---

# BAŞARI METRİKLERİ

## Teknik
- ✅ **96 AI + 96 Offline Generatör**: Toplam 192 generatör
- ✅ **A4 Content Density**: %80-95 (kompakt mod)
- ✅ **Render Süresi**: <500ms (offline), <3s (AI)
- ✅ **PDF Export Quality**: 300 DPI minimum
- ✅ **Cache Hit Rate**: >85%

## Kullanıcı Deneyimi
- ✅ **Customization Options**: Ortalama 8 parametre/aktivite
- ✅ **Edit Time**: <2 dakika (layout değişikliği için)
- ✅ **User Satisfaction**: >4.7/5
- ✅ **Feature Discovery**: %70+ kullanıcı edit toolbar'ı kullanıyor

## Pedagojik
- ✅ **Content Quality**: AI üretimlerde %95+ pedagogical note kalitesi
- ✅ **Aktivite Çeşitliliği**: 96 farklı şablon, 10 kategori
- ✅ **Öğrenci Engagement**: +30% (öğretmen raporları)

---

# GÜVENLİK VE UYUMLULUK

## 1. KVKK Uyumu
- ✅ Öğrenci adı + tanı + skor aynı görünümde **asla** birlikte gösterilmez
- ✅ Veri şifreleme: AES-256
- ✅ Audit log: Tüm öğrenci veri erişimleri kaydedilir

## 2. MEB Uyumu
- ✅ BEP hedefleri SMART formatında
- ✅ Tanı koyucu dil yasak ("disleksisi var" → "disleksi desteğine ihtiyacı var")
- ✅ Müfredat kazanımları 2024-2025

## 3. AI Güvenliği (Selin Arslan)
- ✅ **192 Generatör × Prompt Security**: Her generatör için injection koruması
- ✅ **Token Optimizasyonu**: Offline-first stratejisi (maliyet %60 azalma)
- ✅ **Hallucination Reduction**: JSON schema + validation

## 4. Erişilebilirlik (WCAG 2.1 AA)
- ✅ **Edit Toolbar**: Tam klavye navigasyonu
- ✅ **Layout Controls**: Ekran okuyucu uyumlu
- ✅ **Visual Elements**: Alt text + ARIA labels

---

# AJAN ONAYLARI

## Elif Yıldız (Özel Öğrenme Uzmanı)
> **ONAY**: Kompozit mod, öğretmenlerin farklı beceri alanlarını tek kağıtta birleştirmesine izin veriyor. ZPD'ye uygun, kademeli zorluk artışını destekler. Pedagojik not agregasyonu kritik.

**Koşullar**:
- ✅ Her section için ayrı pedagogicalNote
- ✅ Agregasyon sırasında mantıksal bağlantı
- ✅ Başlangıç aktivitesi mutlaka kolay

---

## Dr. Ahmet Kaya (Özel Eğitim Uzmanı)
> **ONAY**: BEP entegrasyonu korunuyor. Kompozit modda öğrenci tanı bilgisi görünür olmamalı — sadece öğretmene özel notlarda.

**Koşullar**:
- ✅ Composite worksheet metadata'da tanı bilgisi yok
- ✅ SMART hedefler her section'da opsiyonel referans
- ✅ Klinik şablonlar kompozit modda kullanılabilir ama izole

---

## Bora Demir (Yazılım Mühendisi)
> **ONAY**: Mimari birleşme mantıklı. Name collision riski var — unique naming convention zorunlu.

**Koşullar**:
- ✅ `INFOGRAPHIC_` prefix tüm infografik aktivitelerinde
- ✅ Generator registry'de duplikasyon testi (CI/CD)
- ✅ TypeScript strict mode korunur
- ✅ Vitest coverage >85%

---

## Selin Arslan (AI Mühendisi)
> **ONAY**: Prompt enrichment güçlü özellik. Token maliyeti artabilir — cache zorunlu.

**Koşullar**:
- ✅ Enrichment cache TTL: 24 saat
- ✅ Kullanıcı enrichment atlamalı (opt-in)
- ✅ Token kullanım dashboard'a eklenmeli
- ✅ Gemini 2.5 Flash sabit (değiştirme yasak)

---

# SONUÇ

Bu plan, İnfografik Stüdyosu v3'ü **ultra premium bir üretim platformu** haline getirir:

1. **192 Generatör** (96 AI + 96 Offline): Her aktivite için çift mod
2. **Ultra Özelleştirme**: Her şablon için 5-10 özel parametre
3. **Kompakt A4 Render**: %80-95 content density, minimal boşluk
4. **Premium Edit Toolbar**: Sütun, grid, tablo, font, renk tam kontrolü
5. **Zengin AI Bileşenleri**: İnteraktif, animasyonlu, görsel olarak zengin

**Toplam Süre**: 10 hafta (50 iş günü)
**Ekip**: 6 kişi (2 AI gen., 2 Offline gen., 1 Frontend, 1 Designer)
**Maliyet**: İşçilik + AI token (~$800/ay → %60 azalma offline modla)
**ROI**: 3 ay içinde +60% feature adoption

---

**PLAN DURUMU**: ✅ UYGULAMA HAZIR
**SON GÜNCELLEME**: 2026-04-04 (Ultra Premium Edition)
**ÖNERİLEN YAKLAŞIM**: Seçenek 3 (Adaptör Pattern)
**SONRAKI ADIM**: Sprint 1, Gün 1 → Adaptör Altyapısı
