/**
 * @file src/services/layout/CompactLayoutEngine.ts
 * @description İnfografik Stüdyosu v3 — Kompakt A4 Layout Engine
 * Sprint 2, Gün 1-2: CompactLayoutEngine Core Implementation
 *
 * AMAÇ: A4 kağıt boyutunda maksimum içerik yoğunluğu (80-95%) sağlama
 */

export interface CompactLayoutConfig {
  pageSize: 'A4' | 'Letter' | 'B5';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  contentDensity: number;
  columnCount: number;
  gutterWidth: number;
  typography: {
    baseFontSize: number;
    lineHeight: number;
    headingScale: number;
  };
  gridSystem: {
    enabled: boolean;
    rows: number;
    cols: number;
    cellGap: number;
  };
}

export class CompactLayoutEngine {
  private config: CompactLayoutConfig;
  private readonly PAGE_DIMENSIONS = {
    A4: { width: 210, height: 297 },
    Letter: { width: 215.9, height: 279.4 },
    B5: { width: 176, height: 250 }
  };

  constructor(config: CompactLayoutConfig) {
    this.config = this.validateConfig(config);
  }

  private validateConfig(config: CompactLayoutConfig): CompactLayoutConfig {
    const validated = { ...config };
    if (validated.typography.lineHeight < 1.5) {
      validated.typography.lineHeight = 1.5;
    }
    if (validated.typography.baseFontSize < 9) {
      validated.typography.baseFontSize = 9;
    }
    validated.columnCount = Math.max(1, Math.min(4, validated.columnCount));
    validated.contentDensity = Math.max(0, Math.min(100, validated.contentDensity));
    return validated;
  }

  calculateContentArea(): { width: number; height: number } {
    const pageDim = this.PAGE_DIMENSIONS[this.config.pageSize];
    const { margins } = this.config;
    if (this.config.orientation === 'landscape') {
      return {
        width: pageDim.height - margins.left - margins.right,
        height: pageDim.width - margins.top - margins.bottom
      };
    }
    return {
      width: pageDim.width - margins.left - margins.right,
      height: pageDim.height - margins.top - margins.bottom
    };
  }

  optimizeMargins(): CompactLayoutConfig['margins'] {
    const { contentDensity } = this.config;
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
    const fontSizeMultiplier = 1 - (contentDensity / 100) * 0.15;
    const lineHeightMultiplier = 1 - (contentDensity / 100) * 0.1;
    return {
      baseFontSize: Math.max(9, typography.baseFontSize * fontSizeMultiplier),
      lineHeight: Math.max(1.5, typography.lineHeight * lineHeightMultiplier),
      headingScale: typography.headingScale
    };
  }

  calculateGridLayout(): { cellWidth: number; cellHeight: number } | null {
    if (!this.config.gridSystem.enabled) return null;
    const contentArea = this.calculateContentArea();
    const { rows, cols, cellGap } = this.config.gridSystem;
    const totalHorizontalGap = cellGap * (cols - 1);
    const totalVerticalGap = cellGap * (rows - 1);
    return {
      cellWidth: (contentArea.width - totalHorizontalGap) / cols,
      cellHeight: (contentArea.height - totalVerticalGap) / rows
    };
  }

  getLayoutMetrics() {
    const contentArea = this.calculateContentArea();
    const typography = this.optimizeTypography();
    const margins = this.optimizeMargins();
    const gridLayout = this.calculateGridLayout();
    const pageDim = this.PAGE_DIMENSIONS[this.config.pageSize];
    const totalArea = this.config.orientation === 'landscape' ? pageDim.height * pageDim.width : pageDim.width * pageDim.height;
    const usableArea = contentArea.width * contentArea.height;
    const actualDensity = (usableArea / totalArea) * 100;
    return {
      pageSize: this.config.pageSize,
      orientation: this.config.orientation,
      contentArea,
      margins,
      typography,
      columnWidths: this.calculateColumnWidths(),
      gridLayout,
      actualDensity,
      targetDensity: this.config.contentDensity
    };
  }
}

export const DEFAULT_LAYOUT_CONFIG: CompactLayoutConfig = {
  pageSize: 'A4',
  orientation: 'portrait',
  margins: { top: 15, right: 15, bottom: 15, left: 15 },
  contentDensity: 70,
  columnCount: 2,
  gutterWidth: 5,
  typography: { baseFontSize: 11, lineHeight: 1.5, headingScale: 1.5 },
  gridSystem: { enabled: false, rows: 3, cols: 2, cellGap: 5 }
};
