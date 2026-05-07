/**
 * OOGMATIK — Compact A4 Layout Service
 * Calculations for 4/6/8 puzzle per A4 page rendering
 * Print-ready, responsive, disleksia-compatible
 */

export interface A4LayoutConfig {
  itemsPerPage: 4 | 6 | 8;  // "4" = 2x2, "6" = 2x3, "8" = 2x4
  pageWidth: number;        // mm
  pageHeight: number;       // mm
  marginTop: number;        // mm
  marginBottom: number;     // mm
  marginLeft: number;       // mm
  marginRight: number;      // mm
  gapBetweenItems: number;  // mm
}

export interface A4Dimensions {
  contentWidth: number;     // mm (available for items)
  contentHeight: number;    // mm
  itemWidth: number;        // mm
  itemHeight: number;       // mm
  cols: number;
  rows: number;
}

/**
 * Calculate dimensions for A4 page with given layout config
 */
export function calculateA4Dimensions(config: A4LayoutConfig): A4Dimensions {
  const contentWidth = config.pageWidth - config.marginLeft - config.marginRight;
  const contentHeight = config.pageHeight - config.marginTop - config.marginBottom;

  let cols: number, rows: number;

  switch (config.itemsPerPage) {
    case 4:
      cols = 2;
      rows = 2;
      break;
    case 6:
      cols = 2;
      rows = 3;
      break;
    case 8:
      cols = 2;
      rows = 4;
      break;
    default:
      cols = 2;
      rows = 2;
  }

  const totalGapWidth = (cols - 1) * config.gapBetweenItems;
  const itemWidth = (contentWidth - totalGapWidth) / cols;

  const totalGapHeight = (rows - 1) * config.gapBetweenItems;
  const itemHeight = (contentHeight - totalGapHeight) / rows;

  return {
    contentWidth,
    contentHeight,
    itemWidth,
    itemHeight,
    cols,
    rows,
  };
}

/**
 * Standard A4 paper sizes (mm)
 */
export const A4_SIZES = {
  A4: { width: 210, height: 297 },
  LETTER: { width: 215.9, height: 279.4 },
  B5: { width: 176, height: 250 },
} as const;

/**
 * Default layout presets
 */
export const LAYOUT_PRESETS = {
  compact4: {
    itemsPerPage: 4,
    marginTop: 15,
    marginBottom: 15,
    marginLeft: 15,
    marginRight: 15,
    gapBetweenItems: 8,
  } as const,
  compact6: {
    itemsPerPage: 6,
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 12,
    marginRight: 12,
    gapBetweenItems: 6,
  } as const,
  compact8: {
    itemsPerPage: 8,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    gapBetweenItems: 5,
  } as const,
} as const;

/**
 * Get Tailwind grid class for layout
 */
export function getTailwindGridClass(itemsPerPage: 4 | 6 | 8): string {
  switch (itemsPerPage) {
    case 4:
      return 'grid-cols-2';
    case 6:
      return 'grid-cols-2'; // 2x3
    case 8:
      return 'grid-cols-2'; // 2x4
    default:
      return 'grid-cols-2';
  }
}

/**
 * Get minimum recommended font size based on age group and learning disability profile
 * Based on special education guidelines
 */
export function getMinFontPT(
  ageGroup: string,
  profile: string
): number {
  // Base font sizes by age group
  const baseFont: Record<string, number> = {
    '4-6': 14,   // Preschool - largest fonts
    '6-8': 13,   // Early elementary
    '8-10': 12,  // Mid elementary
    '10-12': 11, // Upper elementary
    '12+': 11,   // Middle/high school
  };

  // Adjustments for learning disabilities
  const profileAdjustment: Record<string, number> = {
    'dyslexia': 2,      // +2pt for dyslexia
    'dyscalculia': 1,   // +1pt for dyscalculia
    'adhd': 1,          // +1pt for ADHD
    'visual': 3,        // +3pt for visual processing issues
    'auditory': 1,      // +1pt for auditory processing
    'mixed': 2,         // +2pt for mixed profiles
  };

  const base = baseFont[ageGroup] ?? 12;
  const adjustment = profileAdjustment[profile] ?? 0;

  return base + adjustment;
}
