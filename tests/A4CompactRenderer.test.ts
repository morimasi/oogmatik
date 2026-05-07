import { describe, it, expect } from 'vitest';
import {
  calculateA4Dimensions,
  LAYOUT_PRESETS,
  A4_SIZES,
  getTailwindGridClass,
} from '../src/services/compactA4LayoutService';

describe('A4CompactRenderer — Layout Calculations', () => {
  describe('calculateA4Dimensions', () => {
    it('calculates correct dimensions for 4-item layout', () => {
      const config = {
        ...LAYOUT_PRESETS.compact4,
        pageWidth: 210,
        pageHeight: 297,
      };

      const dims = calculateA4Dimensions(config);

      expect(dims.cols).toBe(2);
      expect(dims.rows).toBe(2);
      expect(dims.itemWidth).toBeGreaterThan(0);
      expect(dims.itemHeight).toBeGreaterThan(0);
    });

    it('calculates correct dimensions for 6-item layout', () => {
      const config = {
        ...LAYOUT_PRESETS.compact6,
        pageWidth: 210,
        pageHeight: 297,
      };

      const dims = calculateA4Dimensions(config);

      expect(dims.cols).toBe(2);
      expect(dims.rows).toBe(3);
    });

    it('calculates correct dimensions for 8-item layout', () => {
      const config = {
        ...LAYOUT_PRESETS.compact8,
        pageWidth: 210,
        pageHeight: 297,
      };

      const dims = calculateA4Dimensions(config);

      expect(dims.cols).toBe(2);
      expect(dims.rows).toBe(4);
    });

    it('respects margins in calculations', () => {
      const config = {
        itemsPerPage: 4 as const,
        pageWidth: 210,
        pageHeight: 297,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
        gapBetweenItems: 10,
      };

      const dims = calculateA4Dimensions(config);
      const expectedContentWidth = 210 - 20 - 20;

      expect(dims.contentWidth).toBe(expectedContentWidth);
    });

    it('handles different paper sizes', () => {
      const letterConfig = {
        ...LAYOUT_PRESETS.compact4,
        pageWidth: A4_SIZES.LETTER.width,
        pageHeight: A4_SIZES.LETTER.height,
      };

      const dims = calculateA4Dimensions(letterConfig);
      expect(dims.contentWidth).toBeGreaterThan(0);
    });
  });

  describe('LAYOUT_PRESETS', () => {
    it('has correct itemsPerPage values', () => {
      expect(LAYOUT_PRESETS.compact4.itemsPerPage).toBe(4);
      expect(LAYOUT_PRESETS.compact6.itemsPerPage).toBe(6);
      expect(LAYOUT_PRESETS.compact8.itemsPerPage).toBe(8);
    });

    it('has decreasing margins for denser layouts', () => {
      // More items = smaller margins to fit more content
      expect(LAYOUT_PRESETS.compact8.marginTop).toBeLessThanOrEqual(
        LAYOUT_PRESETS.compact4.marginTop
      );
    });
  });

  describe('A4_SIZES', () => {
    it('has standard paper sizes', () => {
      expect(A4_SIZES.A4.width).toBe(210);
      expect(A4_SIZES.A4.height).toBe(297);
      expect(A4_SIZES.LETTER.width).toBe(215.9);
      expect(A4_SIZES.B5.width).toBe(176);
    });
  });

  describe('getTailwindGridClass', () => {
    it('returns grid-cols-2 for all layouts', () => {
      expect(getTailwindGridClass(4)).toBe('grid-cols-2');
      expect(getTailwindGridClass(6)).toBe('grid-cols-2');
      expect(getTailwindGridClass(8)).toBe('grid-cols-2');
    });
  });

  describe('Integration: Full workflow', () => {
    it('calculates printable dimensions for all presets', () => {
      const presets = [LAYOUT_PRESETS.compact4, LAYOUT_PRESETS.compact6, LAYOUT_PRESETS.compact8];
      
      for (const preset of presets) {
        const config = {
          ...preset,
          pageWidth: 210,
          pageHeight: 297,
        };

        const dims = calculateA4Dimensions(config);

        // Verify all dimensions are positive
        expect(dims.itemWidth).toBeGreaterThan(0);
        expect(dims.itemHeight).toBeGreaterThan(0);
        expect(dims.contentWidth).toBeGreaterThan(0);
        expect(dims.contentHeight).toBeGreaterThan(0);
      }
    });

    it('ensures 8-item layout has smaller items than 4-item', () => {
      const config4 = { ...LAYOUT_PRESETS.compact4, pageWidth: 210, pageHeight: 297 };
      const config8 = { ...LAYOUT_PRESETS.compact8, pageWidth: 210, pageHeight: 297 };

      const dims4 = calculateA4Dimensions(config4);
      const dims8 = calculateA4Dimensions(config8);

      // 8-item layout should have smaller individual items
      expect(dims8.itemHeight).toBeLessThan(dims4.itemHeight);
    });
  });
});
