# Design Spec: Ultra Professional Clock & Money Activities

**Date**: 2026-05-06
**Status**: Draft
**Topic**: Upgrading Clock Reading and Money Counting modules for A4 optimization and professional visuals.

## 1. Goal
Upgrade the Clock Reading and Money Counting activity modules to:
- Be "Ultra Professional" (enhanced visuals).
- Support "Rich Combinations" (precision, varied item counts).
- Fit perfectly into an A4 page (compact, minimal space waste).

## 2. Proposed Changes

### 2.1 Clock Reading Activity
- **Generator (`clockReading.ts`)**:
    - Update `precision` to support: `1-min`, `5-min`, `15-min`, `30-min`, `hour`.
    - Support `itemCount` up to 15.
    - Improved Turkish verbal representation (e.g., "beşe on var", "altıyı çeyrek geçiyor").
- **Renderer (`ClockReadingSheet.tsx`)**:
    - Grid layout: 3 columns x 5 rows for 15 items.
    - Compact design: Reduced margins, smaller clock size (`w-28 h-28`).
    - Enhanced `AnalogClock`: Add support for numbers and tick marks in the SVG.
- **Common Component (`common.tsx`)**:
    - Update `AnalogClock` to render numbers (1-12) and ticks (every 5 mins).

### 2.2 Money Counting Activity
- **Generator (`financialMath.ts`)**:
    - Support `itemCount` up to 8.
    - Distractors: Better range and logic for distractors.
- **Renderer (`MoneyCountingSheet.tsx`)**:
    - **Ultra Visuals**: `MoneyIcon` with Lira-specific colors and high-fidelity CSS.
        - 200 TL: Violet
        - 100 TL: Blue
        - 50 TL: Orange
        - 20 TL: Green
        - 10 TL: Red
        - 5 TL: Indigo/Grey
    - Wallet Grid: 2 columns x 4 rows.
    - Compact styling for labels and options.

## 3. Expert Consultation (Simulated)
- **Pedagoji (Elif Yıldız)**: 15 clocks is dense but manageable with Lexend and clear borders. Precision should match difficulty.
- **Mühendislik (Bora Demir)**: TypeScript strict, remove `any`. AppError for any failures (though these are offline generators).

## 4. Verification Plan
- **Tests**: Vitest for generators ensuring correct counts and precision.
- **Visuals**: Check A4 layout in print preview.

## 5. Next Steps
1. Update `src/components/sheets/common.tsx` (AnalogClock).
2. Update `src/services/offlineGenerators/clockReading.ts`.
3. Update `src/components/sheets/math/ClockReadingSheet.tsx`.
4. Update `src/services/offlineGenerators/financialMath.ts`.
5. Update `src/components/sheets/math/MoneyCountingSheet.tsx`.
