/**
 * @file tests/services/layout/CompactLayoutEngine.test.ts
 * @description CompactLayoutEngine Unit Tests
 *
 * Test Coverage:
 * - Page dimensions (A4, Letter, B5)
 * - Content density optimization
 * - Typography validation (disleksi uyumluluğu)
 * - Margin calculations
 * - Layout metrics
 */

import { describe, it, expect } from 'vitest';
import { CompactLayoutEngine, DEFAULT_LAYOUT_CONFIG } from '../../../src/services/layout/CompactLayoutEngine';
import type { CompactLayoutConfig } from '../../../src/types/infographic';

describe('CompactLayoutEngine', () => {
  describe('Constructor & Validation', () => {
    it('should create engine with default config', () => {
      const engine = new CompactLayoutEngine(DEFAULT_LAYOUT_CONFIG);
      expect(engine).toBeDefined();
    });

    it('should enforce min lineHeight 1.5 (Elif Yıldız disleksi kuralı)', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        typography: {
          baseFontSize: 11,
          lineHeight: 1.2, // Invalid: below 1.5
          headingScale: 1.5,
        },
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      // Validation should auto-correct to 1.5
      expect(metrics.typography.lineHeight).toBeGreaterThanOrEqual(1.5);
    });

    it('should enforce min fontSize 9pt', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        typography: {
          baseFontSize: 6, // Invalid: below 9pt
          lineHeight: 1.5,
          headingScale: 1.5,
        },
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      expect(metrics.typography.baseFontSize).toBeGreaterThanOrEqual(9);
    });

    it('should clamp columnCount to 1-4 range', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        columnCount: 10, // Invalid: max is 4
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      expect(metrics.columnCount).toBeLessThanOrEqual(4);
      expect(metrics.columnCount).toBeGreaterThanOrEqual(1);
    });

    it('should clamp contentDensity to 0-100 range', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        contentDensity: 150, // Invalid: max is 100
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      expect(metrics.contentDensity).toBeLessThanOrEqual(100);
      expect(metrics.contentDensity).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Page Dimensions (ISO 216 + US)', () => {
    it('should calculate A4 portrait dimensions correctly', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        pageSize: 'A4',
        orientation: 'portrait',
      };

      const engine = new CompactLayoutEngine(config);
      const contentArea = engine.calculateContentArea();

      // A4 portrait: 210mm x 297mm
      expect(contentArea.width).toBeLessThan(210);
      expect(contentArea.height).toBeLessThan(297);
      expect(contentArea.width).toBeGreaterThan(0);
      expect(contentArea.height).toBeGreaterThan(0);
    });

    it('should calculate A4 landscape dimensions correctly', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        pageSize: 'A4',
        orientation: 'landscape',
      };

      const engine = new CompactLayoutEngine(config);
      const contentArea = engine.calculateContentArea();

      // A4 landscape: width > height (swapped)
      expect(contentArea.width).toBeGreaterThan(contentArea.height);
    });

    it('should support Letter page size', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        pageSize: 'Letter',
        orientation: 'portrait',
      };

      const engine = new CompactLayoutEngine(config);
      const contentArea = engine.calculateContentArea();

      // Letter: 215.9mm x 279.4mm
      expect(contentArea.width).toBeLessThan(216);
      expect(contentArea.height).toBeLessThan(280);
    });

    it('should support B5 page size', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        pageSize: 'B5',
        orientation: 'portrait',
      };

      const engine = new CompactLayoutEngine(config);
      const contentArea = engine.calculateContentArea();

      // B5: 176mm x 250mm
      expect(contentArea.width).toBeLessThan(176);
      expect(contentArea.height).toBeLessThan(250);
    });
  });

  describe('Content Density Optimization', () => {
    it('should reduce margins at 100% density', () => {
      const lowDensityConfig: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        contentDensity: 0,
      };

      const highDensityConfig: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        contentDensity: 100,
      };

      const lowEngine = new CompactLayoutEngine(lowDensityConfig);
      const highEngine = new CompactLayoutEngine(highDensityConfig);

      const lowMargins = lowEngine.optimizeMargins();
      const highMargins = highEngine.optimizeMargins();

      // Higher density = smaller margins
      expect(highMargins.top).toBeLessThan(lowMargins.top);
      expect(highMargins.left).toBeLessThan(lowMargins.left);
    });

    it('should reduce font size at higher density', () => {
      const lowDensityConfig: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        contentDensity: 0,
      };

      const highDensityConfig: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        contentDensity: 100,
      };

      const lowEngine = new CompactLayoutEngine(lowDensityConfig);
      const highEngine = new CompactLayoutEngine(highDensityConfig);

      const lowTypo = lowEngine.optimizeTypography();
      const highTypo = highEngine.optimizeTypography();

      // Higher density = smaller font (but min 9pt enforced)
      expect(highTypo.baseFontSize).toBeLessThanOrEqual(lowTypo.baseFontSize);
      expect(highTypo.baseFontSize).toBeGreaterThanOrEqual(9);
    });

    it('should maintain min lineHeight 1.5 even at 100% density', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        contentDensity: 100,
      };

      const engine = new CompactLayoutEngine(config);
      const typo = engine.optimizeTypography();

      // Disleksi kuralı: ASLA 1.5'in altına inmez
      expect(typo.lineHeight).toBeGreaterThanOrEqual(1.5);
    });
  });

  describe('Column Layout', () => {
    it('should calculate column widths correctly', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        columnCount: 2,
        gutterWidth: 5,
      };

      const engine = new CompactLayoutEngine(config);
      const contentArea = engine.calculateContentArea();
      const metrics = engine.getLayoutMetrics();

      // Total width = (columnWidth × count) + (gutterWidth × (count - 1))
      const expectedTotalWidth = contentArea.width;
      const actualTotalWidth =
        (metrics.columnWidth || 0) * 2 + metrics.gutterWidth * 1;

      expect(actualTotalWidth).toBeCloseTo(expectedTotalWidth, 1);
    });

    it('should handle single column layout', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        columnCount: 1,
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      // Single column = full content width
      expect(metrics.columnWidth).toBeGreaterThan(0);
    });
  });

  describe('Grid System', () => {
    it('should calculate grid cell dimensions when enabled', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        gridSystem: {
          enabled: true,
          rows: 3,
          cols: 2,
          cellGap: 5,
        },
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      expect(metrics.gridSystem.cellWidth).toBeGreaterThan(0);
      expect(metrics.gridSystem.cellHeight).toBeGreaterThan(0);
    });

    it('should return zero dimensions when grid disabled', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        gridSystem: {
          enabled: false,
          rows: 3,
          cols: 2,
          cellGap: 5,
        },
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      expect(metrics.gridSystem.cellWidth).toBe(0);
      expect(metrics.gridSystem.cellHeight).toBe(0);
    });
  });

  describe('Layout Metrics', () => {
    it('should return comprehensive metrics', () => {
      const engine = new CompactLayoutEngine(DEFAULT_LAYOUT_CONFIG);
      const metrics = engine.getLayoutMetrics();

      expect(metrics).toHaveProperty('contentArea');
      expect(metrics).toHaveProperty('margins');
      expect(metrics).toHaveProperty('typography');
      expect(metrics).toHaveProperty('columnWidth');
      expect(metrics).toHaveProperty('gutterWidth');
      expect(metrics).toHaveProperty('gridSystem');
      expect(metrics).toHaveProperty('actualDensity');
    });

    it('should calculate actual density vs target density', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        contentDensity: 70,
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      // Actual density should be close to target (70%)
      expect(metrics.actualDensity).toBeGreaterThan(60);
      expect(metrics.actualDensity).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero margin configuration', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        margins: { top: 0, right: 0, bottom: 0, left: 0 },
      };

      const engine = new CompactLayoutEngine(config);
      const contentArea = engine.calculateContentArea();

      // Zero margins = full page dimensions
      expect(contentArea.width).toBeGreaterThan(0);
      expect(contentArea.height).toBeGreaterThan(0);
    });

    it('should handle maximum column count (4)', () => {
      const config: CompactLayoutConfig = {
        ...DEFAULT_LAYOUT_CONFIG,
        columnCount: 4,
      };

      const engine = new CompactLayoutEngine(config);
      const metrics = engine.getLayoutMetrics();

      expect(metrics.columnCount).toBe(4);
      expect(metrics.columnWidth).toBeGreaterThan(0);
    });
  });
});
