# İNFOGRAFİK ETKİNLİK STÜDYOSU v3.5
## ULTRA PREMİUM ÜRETİM PLATFORMU - DERİNLEMESİNE GELİŞTİRME PLANI

**Tarih**: 2026-04-04
**Versiyon**: 3.5 (Ultra Premium Edition)
**Durum**: PLANLAMAYA HAZIR
**Onaylayan Ekip**: 9 Ajan Koordinasyonu (Tam Aktivasyon)

---

## 📋 YÖNETİCİ ÖZETİ - GÜNCELLENMİŞ VİZYON

### Mevcut Durum
İnfografik Stüdyosu v3, **96 farklı infografik aktivite türü** için özelleştirilmiş bir composite worksheet generator olarak çalışmaktadır.

### Yeni Hedef (Ultra Premium)
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

### Stratejik Değer
- ✅ **Profesyonel Kalite**: Matbaa standartlarında çıktı
- ✅ **Maksimum Verimlilik**: A4'e sığan maksimum içerik
- ✅ **Öğretmen Özgürlüğü**: Her detayı kontrol edebilme
- ✅ **Hız + Kalite**: Offline mod (anlık) + AI mod (premium)

---

## 🏗️ MİMARİ TASARIM - KATMAN KATMAN

### KATMAN 1: Çift Modlu Generator Sistemi

#### 1.1. Generator Architecture (Her Aktivite İçin İkiz Sistem)

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

**Örnek: 5W1H Grid Aktivitesi**

```typescript
// services/generators/infographic/5w1h-grid/

// ai-generator.ts
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
  ${questionDepth === 'basic' ? '→ Doğrudan cevap bulunabilen sorular' : ''}
  ${questionDepth === 'intermediate' ? '→ Hafif çıkarım gerektiren sorular' : ''}
  ${questionDepth === 'advanced' ? '→ Derin analiz + çok katmanlı çıkarım' : ''}

- Grid Layout: ${gridLayout}
  ${gridLayout === '2x3' ? '→ 2 satır × 3 sütun (yatay akış)' : ''}
  ${gridLayout === '3x2' ? '→ 3 satır × 2 sütun (dikey akış)' : ''}
  ${gridLayout === '6x1' ? '→ Tek sütun, 6 sıralı kutu (mobil-dostu)' : ''}

- Renk Şeması: ${colorScheme}
  ${colorScheme === 'dyslexia' ? '→ Krem zemin, koyu yeşil/mavi başlık, pastel vurgular' : ''}
  ${colorScheme === 'adhd' ? '→ Yüksek kontrast, parlak border, renkli kategoriler' : ''}

- Görsel Ekleme: ${includeVisuals ? 'HER kutuda ilgili emoji/ikon ekle' : 'Sadece metin'}

ÜRETİM KURALLARI:
1. ${itemCount} adet 5W1H sorusu üret (Who, What, When, Where, Why, How)
2. Her soru ${promptStyle} stilinde olmalı
3. Pedagojik not: Neden bu grid yapısı seçildi, öğrenciye nasıl fayda sağlar?
4. A4 sayfaya KOMPAKT sığdırma: Minimal margin, optimum font size
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
            visualCue: { type: 'STRING' }, // emoji veya ikon kodu
            difficulty: { type: 'STRING', enum: ['basic', 'intermediate', 'advanced'] },
            answerSpace: { type: 'NUMBER' } // Cevap için satır sayısı
          }
        }
      },
      pedagogicalNote: { type: 'STRING' },
      layoutHints: {
        type: 'OBJECT',
        properties: {
          columnCount: { type: 'NUMBER' },
          rowCount: { type: 'NUMBER' },
          cellPadding: { type: 'STRING' }, // '8px', '12px', etc.
          fontSize: { type: 'STRING' } // '11pt', '12pt', etc.
        }
      }
    }
  };

  const result = await generateWithSchema({ prompt, schema });
  return result;
}

// offline-generator.ts
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
      When: ['Bu olay hangi tarihsel dönemde gerçekleşti ve dönemin özellikleri neydi?'],
      Where: ['Mekanın bu olaya etkisi ne olmuştur?'],
      Why: ['Altında yatan asıl neden ve motivasyon neydi?'],
      How: ['Bu sonuca ulaşmak için hangi adımlar izlendi?']
    },
    advanced: {
      Who: ['Farklı karakterlerin perspektifinden bu olay nasıl yorumlanabilir?'],
      What: ['Uzun vadeli sonuçları ve etkileri neler olabilir?'],
      When: ['Bu zamanlamanın stratejik önemi neydi?'],
      Where: ['Coğrafi/kültürel bağlam olaya nasıl şekil verdi?'],
      Why: ['Çoklu sebep-sonuç ilişkilerini analiz ediniz.'],
      How: ['Alternatif yöntemler olsaydı sonuç nasıl değişirdi?']
    }
  };

  const selectedTemplates = templates[questionDepth] || templates.basic;
  const categories = ['Who', 'What', 'When', 'Where', 'Why', 'How'];

  const questions = categories.slice(0, itemCount).map((category, index) => {
    const questionTemplate = selectedTemplates[category][0]
      .replace('[eylem]', topic.toLowerCase())
      .replace('[konu]', topic);

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
    pedagogicalNote: `Bu ${gridLayout} grid yapısı, öğrencinin konuyu yapılandırılmış şekilde analiz etmesini sağlar. ${questionDepth} seviyesi seçildi çünkü...`,
    layoutHints: {
      columnCount: cols,
      rowCount: rows,
      cellPadding: '10px',
      fontSize: '11pt'
    }
  };
}

function getCategoryIcon(category: string): string {
  const icons = {
    Who: '👤', What: '❓', When: '⏰',
    Where: '📍', Why: '🤔', How: '🔧'
  };
  return icons[category] || '•';
}
```

#### 1.2. UltraCustomizationSchema (Her Aktivite İçin)

```typescript
// types/infographic-ultra.ts

export interface UltraCustomizationSchema {
  activityType: ActivityType;

  // Temel parametreler (tüm aktiviteler)
  baseParams: {
    difficulty: { type: 'select'; options: ['Kolay', 'Orta', 'Zor'] };
    itemCount: { type: 'number'; min: number; max: number; step: number };
    ageGroup: { type: 'select'; options: AgeGroup[] };
    profile: { type: 'select'; options: InfographicProfile[] };
  };

  // Ultra-özel parametreler (aktiviteye özel)
  customParams: Record<string, CustomParamDefinition>;

  // Layout ipuçları
  layoutHints: {
    preferredColumns: number;
    minMargin: string;
    maxContentDensity: number; // 0-100
    allowOverflow: boolean;
  };

  // Visual hints
  visualHints: {
    iconSet?: 'emoji' | 'lucide' | 'custom';
    colorPalette?: string[];
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  };
}

export type CustomParamDefinition =
  | { type: 'select'; options: string[]; default: string; label: string }
  | { type: 'number'; min: number; max: number; step: number; default: number; label: string }
  | { type: 'boolean'; default: boolean; label: string }
  | { type: 'color'; default: string; label: string }
  | { type: 'text'; maxLength: number; default: string; label: string };
```

**Örnek: Math Steps Aktivitesi Custom Params**

```typescript
export const MATH_STEPS_CUSTOM_PARAMS: Record<string, CustomParamDefinition> = {
  stepDetailLevel: {
    type: 'select',
    options: ['Minimal', 'Orta', 'Detaylı'],
    default: 'Orta',
    label: 'Adım Detay Seviyesi'
  },
  showVisualAid: {
    type: 'boolean',
    default: true,
    label: 'Görsel Yardımcı Göster (Sayı çizgisi, blok modelleri)'
  },
  includeHints: {
    type: 'boolean',
    default: true,
    label: 'İpuçları Ekle'
  },
  stepBoxStyle: {
    type: 'select',
    options: ['Numaralı', 'Ok Akışı', 'Renkli Kartlar'],
    default: 'Numaralı',
    label: 'Adım Kutu Stili'
  },
  problemComplexity: {
    type: 'select',
    options: ['Tek İşlem', 'İki İşlem', 'Çoklu İşlem'],
    default: 'İki İşlem',
    label: 'Problem Karmaşıklığı'
  },
  numberRange: {
    type: 'number',
    min: 10,
    max: 1000,
    step: 10,
    default: 100,
    label: 'Maksimum Sayı Değeri'
  }
};
```

---

### KATMAN 2: Kompakt A4 Render Motoru

#### 2.1. Minimal Boşluk Algoritması

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
    lineHeight: number;   // multiplier (1.2, 1.4, etc.)
    headingScale: number; // başlık boyut çarpanı
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

  constructor(config: CompactLayoutConfig) {
    this.config = config;
  }

  /**
   * A4 sayfaya sığacak maksimum içerik alanını hesapla
   */
  calculateContentArea(): { width: number; height: number } {
    const { margins } = this.config;
    return {
      width: this.a4Dimensions.width - margins.left - margins.right,
      height: this.a4Dimensions.height - margins.top - margins.bottom
    };
  }

  /**
   * Content density'ye göre margin'leri optimize et
   */
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

  /**
   * Sütun sayısına göre her sütunun genişliğini hesapla
   */
  calculateColumnWidths(): number[] {
    const contentArea = this.calculateContentArea();
    const { columnCount, gutterWidth } = this.config;

    const totalGutterSpace = gutterWidth * (columnCount - 1);
    const availableWidth = contentArea.width - totalGutterSpace;
    const columnWidth = availableWidth / columnCount;

    return Array(columnCount).fill(columnWidth);
  }

  /**
   * Typography ayarlarını content density'ye göre optimize et
   */
  optimizeTypography(): CompactLayoutConfig['typography'] {
    const { contentDensity, typography } = this.config;

    // Yüksek density → küçük font, dar satır aralığı
    const fontSizeMultiplier = 1 - (contentDensity / 100) * 0.15; // max %15 küçültme
    const lineHeightMultiplier = 1 - (contentDensity / 100) * 0.1; // max %10 azaltma

    return {
      baseFontSize: typography.baseFontSize * fontSizeMultiplier,
      lineHeight: typography.lineHeight * lineHeightMultiplier,
      headingScale: typography.headingScale
    };
  }

  /**
   * Grid tabanlı layout hesapla
   */
  calculateGridLayout(itemCount: number): GridCell[] {
    const { gridSystem } = this.config;
    if (!gridSystem.enabled) return [];

    const contentArea = this.calculateContentArea();
    const cellWidth = (contentArea.width - (gridSystem.cols - 1) * gridSystem.cellGap) / gridSystem.cols;
    const cellHeight = (contentArea.height - (gridSystem.rows - 1) * gridSystem.cellGap) / gridSystem.rows;

    const cells: GridCell[] = [];
    for (let i = 0; i < Math.min(itemCount, gridSystem.rows * gridSystem.cols); i++) {
      const row = Math.floor(i / gridSystem.cols);
      const col = i % gridSystem.cols;

      cells.push({
        index: i,
        x: col * (cellWidth + gridSystem.cellGap),
        y: row * (cellHeight + gridSystem.cellGap),
        width: cellWidth,
        height: cellHeight
      });
    }

    return cells;
  }

  /**
   * Content overflow kontrolü
   */
  detectOverflow(content: string, maxHeight: number): boolean {
    // Basit karakter sayısı × satır yüksekliği ile tahmin
    const estimatedLines = content.length / 60; // Ortalama 60 karakter/satır
    const estimatedHeight = estimatedLines * this.config.typography.lineHeight * this.config.typography.baseFontSize;

    return estimatedHeight > maxHeight;
  }

  /**
   * Layout'u JSON export et
   */
  exportLayout(): object {
    return {
      contentArea: this.calculateContentArea(),
      margins: this.optimizeMargins(),
      columns: this.calculateColumnWidths(),
      typography: this.optimizeTypography(),
      grid: this.config.gridSystem.enabled ? this.calculateGridLayout(20) : null
    };
  }
}

interface GridCell {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
```

#### 2.2. Smart Content Fitting

```typescript
// services/layout/contentFitter.ts

export class SmartContentFitter {
  /**
   * Verilen alanı dolduracak optimum font boyutunu bul
   */
  static calculateOptimalFontSize(
    text: string,
    containerWidth: number,
    containerHeight: number,
    minFontSize: number = 8,
    maxFontSize: number = 16
  ): number {
    let fontSize = maxFontSize;

    while (fontSize >= minFontSize) {
      const estimatedHeight = this.estimateTextHeight(text, fontSize, containerWidth);

      if (estimatedHeight <= containerHeight) {
        return fontSize;
      }

      fontSize -= 0.5;
    }

    return minFontSize;
  }

  /**
   * Metin yüksekliğini tahmin et
   */
  private static estimateTextHeight(
    text: string,
    fontSize: number,
    containerWidth: number
  ): number {
    const charsPerLine = Math.floor(containerWidth / (fontSize * 0.6)); // Yaklaşık karakter genişliği
    const lines = Math.ceil(text.length / charsPerLine);
    const lineHeight = fontSize * 1.4; // Standart line-height

    return lines * lineHeight;
  }

  /**
   * Grid içinde item'ları dengeli dağıt
   */
  static distributeItems<T>(
    items: T[],
    gridCols: number,
    gridRows: number
  ): T[][] {
    const grid: T[][] = Array(gridRows).fill(null).map(() => []);
    const maxItemsPerCell = Math.ceil(items.length / (gridCols * gridRows));

    let itemIndex = 0;
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const cellItems: T[] = [];
        for (let i = 0; i < maxItemsPerCell && itemIndex < items.length; i++) {
          cellItems.push(items[itemIndex++]);
        }
        grid[row].push(...cellItems);
      }
    }

    return grid;
  }

  /**
   * Multi-column balancing (sütunları eşit yüksekliğe getir)
   */
  static balanceColumns<T>(
    items: T[],
    columnCount: number,
    getItemHeight: (item: T) => number
  ): T[][] {
    const columns: T[][] = Array(columnCount).fill(null).map(() => []);
    const columnHeights: number[] = Array(columnCount).fill(0);

    // Her item'i en kısa sütuna ekle (greedy algorithm)
    items.forEach(item => {
      const shortestColIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columns[shortestColIndex].push(item);
      columnHeights[shortestColIndex] += getItemHeight(item);
    });

    return columns;
  }
}
```

---

### KATMAN 3: Premium Edit Toolbar

#### 3.1. Toolbar Bileşen Mimarisi

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
          <ToolbarButton
            icon={<Printer size={18} />}
            label="Yazdır"
            onClick={() => onExport('print')}
            variant="primary"
          />
          <ToolbarButton
            icon={<Download size={18} />}
            label="PDF İndir"
            onClick={() => onExport('pdf')}
            variant="primary"
          />
          <ToolbarButton
            icon={<BookOpen size={18} />}
            label="Kitapçığa Ekle"
            onClick={onAddToWorkbook}
            variant="primary"
          />
        </div>

        {/* Layout Controls */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <ToolbarButton
            icon={<Columns size={18} />}
            label="Sütunlar"
            onClick={() => setActivePanel(activePanel === 'columns' ? null : 'columns')}
            active={activePanel === 'columns'}
          />
          <ToolbarButton
            icon={<Grid size={18} />}
            label="Grid"
            onClick={() => setActivePanel(activePanel === 'grid' ? null : 'grid')}
            active={activePanel === 'grid'}
          />
          <ToolbarButton
            icon={<Table size={18} />}
            label="Tablo"
            onClick={() => setActivePanel(activePanel === 'table' ? null : 'table')}
            active={activePanel === 'table'}
          />
          <ToolbarButton
            icon={<Space size={18} />}
            label="Boşluklar"
            onClick={() => setActivePanel(activePanel === 'spacing' ? null : 'spacing')}
            active={activePanel === 'spacing'}
          />
        </div>

        {/* Typography Controls */}
        <div className="flex items-center gap-1 border-r border-white/10 pr-3">
          <ToolbarButton
            icon={<Type size={18} />}
            label="Yazı Tipi"
            onClick={() => setActivePanel(activePanel === 'typography' ? null : 'typography')}
            active={activePanel === 'typography'}
          />
          <ToolbarButton
            icon={<AlignLeft size={18} />}
            label="Hizalama"
            onClick={() => setActivePanel(activePanel === 'alignment' ? null : 'alignment')}
            active={activePanel === 'alignment'}
          />
        </div>

        {/* Visual Controls */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={<PaintBucket size={18} />}
            label="Renkler"
            onClick={() => setActivePanel(activePanel === 'colors' ? null : 'colors')}
            active={activePanel === 'colors'}
          />
        </div>

        {/* Live Preview Toggle */}
        <div className="ml-auto">
          <label className="flex items-center gap-2 text-xs text-white/70">
            <input
              type="checkbox"
              className="rounded"
              defaultChecked
            />
            Canlı Önizleme
          </label>
        </div>
      </div>

      {/* Sub-Panels */}
      {activePanel && (
        <div className="border-t border-white/10 bg-slate-800/50 p-4 animate-in slide-in-from-top-2 duration-200">
          {activePanel === 'columns' && (
            <ColumnsPanel layout={layoutConfig} onChange={updateLayout} />
          )}
          {activePanel === 'grid' && (
            <GridPanel layout={layoutConfig} onChange={updateLayout} />
          )}
          {activePanel === 'spacing' && (
            <SpacingPanel layout={layoutConfig} onChange={updateLayout} />
          )}
          {activePanel === 'typography' && (
            <TypographyPanel layout={layoutConfig} onChange={updateLayout} />
          )}
          {activePanel === 'colors' && (
            <ColorsPanel worksheet={worksheet} />
          )}
        </div>
      )}
    </div>
  );
};

// Toolbar Button Component
const ToolbarButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  variant?: 'default' | 'primary';
}> = ({ icon, label, onClick, active, variant = 'default' }) => {
  const baseClasses = "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all text-[10px]";
  const variantClasses = variant === 'primary'
    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
    : active
      ? "bg-white/20 text-white"
      : "text-white/70 hover:bg-white/10 hover:text-white";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      title={label}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};
```

#### 3.2. Sub-Panel Bileşenleri

```tsx
// components/InfographicStudio/Toolbar/panels/

// ColumnsPanel.tsx
const ColumnsPanel: React.FC<{ layout: LayoutConfig; onChange: (updates: Partial<LayoutConfig>) => void }> = ({ layout, onChange }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <label className="text-xs text-white/70 mb-2 block">Sütun Sayısı</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              onClick={() => onChange({ columns: num })}
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                layout.columns === num
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/50 hover:bg-white/20'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Sütun Aralığı (mm)</label>
        <input
          type="range"
          min={5}
          max={20}
          step={1}
          value={layout.gutterWidth || 10}
          onChange={e => onChange({ gutterWidth: parseInt(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-white/50">{layout.gutterWidth || 10}mm</span>
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">İçerik Yoğunluğu</label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={layout.contentDensity}
          onChange={e => onChange({ contentDensity: parseInt(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-white/50">{layout.contentDensity}%</span>
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Preset</label>
        <select
          className="w-full px-2 py-1 bg-white/10 rounded border border-white/20 text-white text-xs"
          onChange={e => {
            const presets = {
              'compact': { columns: 2, contentDensity: 90, margins: { top: 10, right: 10, bottom: 10, left: 10 } },
              'balanced': { columns: 2, contentDensity: 70, margins: { top: 15, right: 15, bottom: 15, left: 15 } },
              'spacious': { columns: 1, contentDensity: 50, margins: { top: 20, right: 20, bottom: 20, left: 20 } }
            };
            onChange(presets[e.target.value]);
          }}
        >
          <option value="">Özel</option>
          <option value="compact">Kompakt</option>
          <option value="balanced">Dengeli</option>
          <option value="spacious">Geniş</option>
        </select>
      </div>
    </div>
  );
};

// GridPanel.tsx
const GridPanel: React.FC<{ layout: LayoutConfig; onChange: (updates: Partial<LayoutConfig>) => void }> = ({ layout, onChange }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <label className="flex items-center gap-2 text-sm text-white/70 mb-3">
          <input
            type="checkbox"
            checked={layout.gridEnabled}
            onChange={e => onChange({ gridEnabled: e.target.checked })}
            className="rounded"
          />
          Grid Sistemini Aktifleştir
        </label>
      </div>

      {layout.gridEnabled && (
        <>
          <div>
            <label className="text-xs text-white/70 mb-2 block">Satır Sayısı</label>
            <input
              type="number"
              min={1}
              max={6}
              value={layout.gridRows}
              onChange={e => onChange({ gridRows: parseInt(e.target.value) })}
              className="w-full px-2 py-1 bg-white/10 rounded border border-white/20 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 mb-2 block">Sütun Sayısı</label>
            <input
              type="number"
              min={1}
              max={4}
              value={layout.gridCols}
              onChange={e => onChange({ gridCols: parseInt(e.target.value) })}
              className="w-full px-2 py-1 bg-white/10 rounded border border-white/20 text-white text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-white/70 mb-2 block">Hücre Aralığı (mm)</label>
            <input
              type="range"
              min={2}
              max={10}
              step={1}
              value={layout.cellGap || 5}
              onChange={e => onChange({ cellGap: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-white/50">{layout.cellGap || 5}mm</span>
          </div>
        </>
      )}
    </div>
  );
};

// SpacingPanel.tsx
const SpacingPanel: React.FC<{ layout: LayoutConfig; onChange: (updates: Partial<LayoutConfig>) => void }> = ({ layout, onChange }) => {
  return (
    <div className="grid grid-cols-5 gap-4">
      <div>
        <label className="text-xs text-white/70 mb-2 block">Üst Margin</label>
        <input
          type="number"
          min={5}
          max={30}
          step={1}
          value={layout.margins.top}
          onChange={e => onChange({ margins: { ...layout.margins, top: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 bg-white/10 rounded border border-white/20 text-white text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Sağ Margin</label>
        <input
          type="number"
          min={5}
          max={30}
          step={1}
          value={layout.margins.right}
          onChange={e => onChange({ margins: { ...layout.margins, right: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 bg-white/10 rounded border border-white/20 text-white text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Alt Margin</label>
        <input
          type="number"
          min={5}
          max={30}
          step={1}
          value={layout.margins.bottom}
          onChange={e => onChange({ margins: { ...layout.margins, bottom: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 bg-white/10 rounded border border-white/20 text-white text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Sol Margin</label>
        <input
          type="number"
          min={5}
          max={30}
          step={1}
          value={layout.margins.left}
          onChange={e => onChange({ margins: { ...layout.margins, left: parseInt(e.target.value) } })}
          className="w-full px-2 py-1 bg-white/10 rounded border border-white/20 text-white text-sm"
        />
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Preset</label>
        <button
          onClick={() => onChange({ margins: { top: 15, right: 15, bottom: 15, left: 15 } })}
          className="w-full px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs"
        >
          Eşitle (15mm)
        </button>
      </div>
    </div>
  );
};

// TypographyPanel.tsx
const TypographyPanel: React.FC<{ layout: LayoutConfig; onChange: (updates: Partial<LayoutConfig>) => void }> = ({ layout, onChange }) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div>
        <label className="text-xs text-white/70 mb-2 block">Temel Font Boyutu</label>
        <input
          type="range"
          min={8}
          max={14}
          step={0.5}
          value={layout.fontSize}
          onChange={e => onChange({ fontSize: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-white/50">{layout.fontSize}pt</span>
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Satır Aralığı</label>
        <input
          type="range"
          min={1.0}
          max={2.0}
          step={0.1}
          value={layout.lineHeight}
          onChange={e => onChange({ lineHeight: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-white/50">{layout.lineHeight}×</span>
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Font Ailesi</label>
        <select
          value={layout.fontFamily || 'Lexend'}
          onChange={e => onChange({ fontFamily: e.target.value })}
          className="w-full px-2 py-1 bg-white/10 rounded border border-white/20 text-white text-xs"
        >
          <option value="Lexend">Lexend (Disleksi-Dostu)</option>
          <option value="Inter">Inter</option>
          <option value="Open Sans">Open Sans</option>
        </select>
      </div>

      <div>
        <label className="text-xs text-white/70 mb-2 block">Başlık Ölçeği</label>
        <input
          type="range"
          min={1.2}
          max={2.0}
          step={0.1}
          value={layout.headingScale || 1.5}
          onChange={e => onChange({ headingScale: parseFloat(e.target.value) })}
          className="w-full"
        />
        <span className="text-xs text-white/50">{layout.headingScale || 1.5}×</span>
      </div>
    </div>
  );
};
```

---

## 🎨 ZENGIN AI BİLEŞENLERİ

### 1. Görsel Elementler (SVG-Native)

```typescript
// components/InfographicStudio/AI-Components/

// VisualIcon.tsx - AI-generated icons
export const AIVisualIcon: React.FC<{
  category: string;
  style: 'minimal' | 'detailed' | 'gradient'
}> = ({ category, style }) => {
  // AI ile ikon üretimi veya preset library
  const iconLibrary = {
    'Who': <PersonIcon style={style} />,
    'What': <QuestionIcon style={style} />,
    'When': <ClockIcon style={style} />,
    // ... 96 aktivite için özel ikonlar
  };

  return iconLibrary[category] || <DefaultIcon />;
};

// AnimatedBorder.tsx - Dikkat çekici border animasyonları
export const AnimatedBorder: React.FC<{
  children: React.ReactNode;
  animation: 'pulse' | 'gradient-shift' | 'glow';
  color: string;
}> = ({ children, animation, color }) => {
  return (
    <div className={`relative p-4 ${getAnimationClass(animation)}`}>
      <div
        className="absolute inset-0 rounded-lg"
        style={{
          background: `linear-gradient(45deg, ${color}, transparent)`,
          filter: 'blur(8px)',
          opacity: 0.6
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// SmartDiagram.tsx - AI ile akıllı diyagram üretimi
export const SmartDiagram: React.FC<{
  type: 'flowchart' | 'mind-map' | 'venn' | 'fishbone';
  data: any;
  autoLayout: boolean;
}> = ({ type, data, autoLayout }) => {
  // D3.js veya custom SVG renderer ile otomatik layout
  // ...
};
```

### 2. İnteraktif Elementler

```typescript
// InteractiveQuestion.tsx - Doldurunca renk değişen kutular
export const InteractiveQuestion: React.FC<{
  question: string;
  answerSpace: number;
  onFill: (answer: string) => void;
}> = ({ question, answerSpace, onFill }) => {
  const [isFilled, setIsFilled] = useState(false);

  return (
    <div className={`border-2 rounded-lg p-3 transition-all ${
      isFilled ? 'border-green-500 bg-green-50' : 'border-gray-300'
    }`}>
      <p className="font-medium mb-2">{question}</p>
      <textarea
        rows={answerSpace}
        className="w-full p-2 border rounded"
        onBlur={e => {
          setIsFilled(e.target.value.trim().length > 0);
          onFill(e.target.value);
        }}
      />
    </div>
  );
};

// ProgressiveReveal.tsx - Adım adım açılan içerik
export const ProgressiveReveal: React.FC<{
  steps: Array<{ title: string; content: string }>;
  mode: 'manual' | 'auto';
}> = ({ steps, mode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // ...
};
```

---

## 📊 UYGULAMA PLANI - DETAYLI SPRINT'LER

### Sprint 1: Dual Generator Altyapısı (Hafta 1)

**Gün 1-2**: Generator Pair Infrastructure
- [ ] `InfographicGeneratorPair` interface tanımı
- [ ] AI + Offline generator template oluştur
- [ ] 96 aktivite için klasör yapısı hazırla
  ```
  services/generators/infographic/
  ├── 5w1h-grid/
  │   ├── ai-generator.ts
  │   ├── offline-generator.ts
  │   ├── customization-schema.ts
  │   └── index.ts
  ├── math-steps/
  ├── venn-diagram/
  └── ... (93 daha)
  ```

**Gün 3-4**: İlk 10 Aktivite Implementasyonu
- [ ] 5W1H Grid (AI + Offline)
- [ ] Math Steps (AI + Offline)
- [ ] Venn Diagram (AI + Offline)
- [ ] Sequence Timeline (AI + Offline)
- [ ] Concept Map (AI + Offline)
- [ ] Compare Table (AI + Offline)
- [ ] Fishbone Diagram (AI + Offline)
- [ ] Life Cycle (AI + Offline)
- [ ] Story Map (AI + Offline)
- [ ] Word Family (AI + Offline)

**Gün 5**: Test + Doğrulama
- [ ] Generator registry entegrasyonu
- [ ] Mode switching testi (AI ↔ Offline)
- [ ] Custom params doğrulama

**Çıktı**: 10 aktivite tam çalışır, kalan 86'sı için template hazır

---

### Sprint 2: Kompakt Layout Engine (Hafta 2)

**Gün 1-2**: Layout Engine Core
- [ ] `CompactLayoutEngine` sınıfı
- [ ] Content area hesaplamaları
- [ ] Margin optimization algoritması
- [ ] Column width calculator

**Gün 3**: Grid System
- [ ] Grid layout calculator
- [ ] Smart content fitting
- [ ] Overflow detection

**Gün 4**: Typography Optimizer
- [ ] Optimal font size calculator
- [ ] Line height adjuster
- [ ] Density-based scaling

**Gün 5**: Integration Test
- [ ] A4 render testi (tüm 10 aktivite)
- [ ] Content density %50, %70, %90 test
- [ ] PDF export quality check

**Çıktı**: Layout engine production-ready

---

### Sprint 3: Premium Edit Toolbar (Hafta 3)

**Gün 1-2**: Toolbar Infrastructure
- [ ] `PremiumEditToolbar` component
- [ ] Sub-panel system (Columns, Grid, Spacing, Typography)
- [ ] State management (toolbar config)

**Gün 3**: Live Preview
- [ ] Real-time layout update
- [ ] Debounced render (performance)
- [ ] Preview cache

**Gün 4**: Export Hub
- [ ] PDF export with custom layout
- [ ] Print dialog integration
- [ ] Kitapçık (workbook) entegrasyonu
- [ ] PNG export (high-res)

**Gün 5**: Polish + UX
- [ ] Tooltip'ler
- [ ] Keyboard shortcuts (Ctrl+P, Ctrl+S)
- [ ] Preset system (Kompakt, Dengeli, Geniş)

**Çıktı**: Tam özellikli edit toolbar

---

### Sprint 4: Zengin AI Bileşenleri (Hafta 4)

**Gün 1**: Visual Elements
- [ ] AI-generated icon library (96 aktivite için)
- [ ] Animated borders (pulse, glow, gradient-shift)
- [ ] Smart diagrams (D3.js integration)

**Gün 2**: Interactive Elements
- [ ] Interactive question boxes (fill → color change)
- [ ] Progressive reveal components
- [ ] Drag-and-drop answer zones

**Gün 3**: Theme System
- [ ] Color palette generator (AI-powered)
- [ ] Disleksi/DEHB profil renk setleri
- [ ] Theme preview + apply

**Gün 4-5**: Integration + Test
- [ ] Tüm bileşenleri 10 aktiviteye entegre et
- [ ] Visual regression test
- [ ] Accessibility (A11y) test

**Çıktı**: Görsel olarak zengin, interaktif aktiviteler

---

### Sprint 5: Kalan 86 Aktivite (Hafta 5-9)

**Hedef**: Günde 4 aktivite (AI + Offline), 5 haftada 86 aktivite tamamla

**Haftalık Plan**:
- Hafta 5: Kat 2 (Okuduğunu Anlama) - 10 aktivite
- Hafta 6: Kat 3 (Dil ve Okuryazarlık) - 10 aktivite
- Hafta 7: Kat 4-5 (Matematik + Fen) - 18 aktivite
- Hafta 8: Kat 6-7 (Sosyal + Yaratıcı) - 16 aktivite
- Hafta 9: Kat 8-10 (Strateji + SpLD + Klinik) - 32 aktivite

**Paralel İş**: Her sprint'te 2 geliştirici (1 AI, 1 offline) çalışır

---

### Sprint 6: Optimizasyon ve Polish (Hafta 10)

**Gün 1-2**: Performance
- [ ] Lazy loading (kategoriye göre)
- [ ] Generator cache optimization
- [ ] Bundle size reduction

**Gün 3**: User Testing
- [ ] 5 öğretmen ile beta test
- [ ] Feedback toplama
- [ ] UX iyileştirmeleri

**Gün 4**: Documentation
- [ ] Kullanıcı kılavuzu (video + yazılı)
- [ ] Geliştirici dokümantasyonu
- [ ] Pedagoji rehberi (Elif Yıldız onaylı)

**Gün 5**: Production Deploy
- [ ] Final test (E2E)
- [ ] Deploy to production
- [ ] Monitoring setup

**Çıktı**: Platform production'da, 96 aktivite tam çalışır

---

## 🎯 BAŞARI METRİKLERİ (Ultra Premium)

### Teknik
- ✅ **96 AI + 96 Offline Generatör**: Toplam 192 generatör
- ✅ **A4 Content Density**: %80-95 (kompakt mod)
- ✅ **Render Süresi**: <500ms (offline), <3s (AI)
- ✅ **PDF Export Quality**: 300 DPI minimum
- ✅ **Cache Hit Rate**: >85%

### Kullanıcı Deneyimi
- ✅ **Customization Options**: Ortalama 8 parametre/aktivite
- ✅ **Edit Time**: <2 dakika (layout değişikliği için)
- ✅ **User Satisfaction**: >4.7/5
- ✅ **Feature Discovery**: %70+ kullanıcı edit toolbar'ı kullanıyor

### Pedagojik
- ✅ **Content Quality**: AI üretimlerde %95+ pedagogical note kalitesi
- ✅ **Aktivite Çeşitliliği**: 96 farklı şablon, 10 kategori
- ✅ **Öğrenci Engagement**: +30% (öğretmen raporları)

---

## 🔐 GÜVENLİK VE UYUMLULUK (Güncelleme)

### AI Güvenliği (Selin Arslan)
- ✅ **192 Generatör × Prompt Security**: Her generatör için injection koruması
- ✅ **Token Optimizasyonu**: Offline-first stratejisi (maliyet %60 azalma)
- ✅ **Hallucination Reduction**: JSON schema + validation (her generatör)

### Erişilebilirlik (WCAG 2.1 AA)
- ✅ **Edit Toolbar**: Tam klavye navigasyonu
- ✅ **Layout Controls**: Ekran okuyucu uyumlu
- ✅ **Visual Elements**: Alt text + ARIA labels

---

## 📝 SONUÇ

Bu güncellenmiş plan, İnfografik Stüdyosu v3'ü **ultra premium bir üretim platformu** haline getirir:

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

**PLAN DURUMU**: UYGULAMA HAZIR
**SON GÜNCELLEME**: 2026-04-04 (Ultra Premium Edition)
