/**
 * @file src/services/layout/CompactLayoutEngine.ts
 * @description InfographicStudio v3 Ultra Premium — Compact Layout Engine
 *
 * A4 sayfa yerleşimi, margin optimizasyonu, grid hesaplama ve typography
 * ölçeklendirmesi yapar. Disleksi uyumlu minimum satır aralığı (1.5) zorunludur.
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
  public config: CompactLayoutConfig;
  private readonly PAGE_DIMENSIONS: Record<string, { width: number; height: number }> = {
    A4: { width: 210, height: 297 },
    Letter: { width: 215.9, height: 279.4 },
    B5: { width: 176, height: 250 },
  };

  constructor(config: CompactLayoutConfig) {
    this.config = config;
  }

  calculateContentArea(): { width: number; height: number } {
    const pageDim = this.PAGE_DIMENSIONS[this.config.pageSize];
    const isLandscape = this.config.orientation === 'landscape';
    const pageWidth = isLandscape ? pageDim.height : pageDim.width;
    const pageHeight = isLandscape ? pageDim.width : pageDim.height;
    const { margins } = this.config;

    return {
      width: pageWidth - margins.left - margins.right,
      height: pageHeight - margins.top - margins.bottom,
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
      left: calculatedMargin,
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
      baseFontSize: Math.max(9, Math.round(typography.baseFontSize * fontSizeMultiplier * 10) / 10),
      lineHeight: Math.max(1.5, Math.round(typography.lineHeight * lineHeightMultiplier * 10) / 10),
      headingScale: typography.headingScale,
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
      cellHeight: (contentArea.height - totalVerticalGap) / rows,
    };
  }

  exportCSS(): string {
    const contentArea = this.calculateContentArea();
    const typography = this.optimizeTypography();
    const margins = this.optimizeMargins();

    return `
.compact-layout {
    width: ${contentArea.width}mm;
    height: ${contentArea.height}mm;
    margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
    font-family: 'Lexend', sans-serif;
    font-size: ${typography.baseFontSize}pt;
    line-height: ${typography.lineHeight};
}
.compact-layout h1 {
    font-size: ${typography.baseFontSize * typography.headingScale}pt;
}
`;
  }

  exportTailwindClasses(): Record<string, string> {
    const typography = this.optimizeTypography();
    return {
      container: 'font-lexend print:break-inside-avoid',
      heading: `text-[${typography.baseFontSize * typography.headingScale}pt] font-bold`,
      body: `text-[${typography.baseFontSize}pt] leading-[${typography.lineHeight}]`,
      column: `flex-1 px-[${this.config.gutterWidth / 2}mm]`,
    };
  }
}
