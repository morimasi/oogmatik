// Math Studio — Utility Functions

import { A4_HEIGHT_PX, HEADER_HEIGHT, FOOTER_HEIGHT } from './constants';
import { MathDrillConfig } from '../../types/math';

/**
 * Converts a number to its Turkish text representation.
 * Supports numbers 0-999.
 */
export const numberToTurkish = (num: number): string => {
  if (num === 0) return 'Sıfır';
  const ones = ['', 'Bir', 'İki', 'Üç', 'Dört', 'Beş', 'Altı', 'Yedi', 'Sekiz', 'Dokuz'];
  const tens = ['', 'On', 'Yirmi', 'Otuz', 'Kırk', 'Elli', 'Altmış', 'Yetmiş', 'Seksen', 'Doksan'];

  const convertGroup = (n: number) => {
    let str = '';
    const h = Math.floor(n / 100);
    const t = Math.floor((n % 100) / 10);
    const o = n % 10;

    if (h === 1) str += 'Yüz ';
    else if (h > 1) str += ones[h] + ' Yüz ';

    if (t > 0) str += tens[t] + ' ';
    if (o > 0) str += ones[o] + ' ';
    return str.trim();
  };

  if (num < 1000) return convertGroup(num);
  return num.toString();
};

/**
 * Estimates the pixel height of a single drill item for a SPECIFIC operation.
 * This is the core calculation for A4 page-fit accuracy.
 */
const estimateItemHeightForOp = (op: string, config: MathDrillConfig): number => {
  const fs = config.fontSize;

  if (config.orientation === 'horizontal') {
    return fs * 2.2 + 20;
  }

  // Vertical layout
  let lineCount = 4.0; // num1, symbol+num2, separator line, answer box

  if (op === 'div') {
    // Turkish classic division layout: dividend | divisor, quotient below, steps
    lineCount = 7.0;
    if (config.digit2 >= 2) lineCount += 2.0; // Multi-digit divisor needs more steps
  } else if (op === 'mult') {
    if (config.digit2 >= 2) {
      lineCount += 3.5; // Multi-digit multiplication: intermediate steps
    } else {
      lineCount += 1.5; // Single-digit: just result line
    }
  } else if (op === 'add' || op === 'sub') {
    if (config.useThirdNumber) {
      lineCount += 1.5; // Extra operand line
    }
  }

  if (config.useThirdNumber && op !== 'div') {
    lineCount += 1.0;
  }

  const textExtra = config.showTextRepresentation ? 16 : 0;
  const paddingExtra = 24; // Premium card padding
  return fs * lineCount + textExtra + paddingExtra;
};

/**
 * Estimates the pixel height of an AI problem based on config.
 */
const estimateProblemHeight = (config: any): number => {
  const fs = config.fontSize || 18;
  const styleWeights = { simple: 1.0, story: 2.2, logic: 3.5 };
  const complexityWeights = { '1-step': 1.0, '2-step': 1.5, 'multi-step': 2.2 };

  const baseLineHeight = styleWeights[config.problemStyle as keyof typeof styleWeights] || 1.5;
  const complexityMultiplier = complexityWeights[config.complexity as keyof typeof complexityWeights] || 1.0;

  let height = fs * 1.5 * (baseLineHeight * complexityMultiplier + 2); // Text block
  if (config.includeSolutionBox) height += 120;
  if (config.generateImages) height += 100;

  return height + 32; // padding
};

/**
 * Estimates the pixel height of a single drill item based on config.
 * For mixed operations, calculates weighted average across all selected ops.
 */
export const estimateItemHeight = (config: any): number => {
  // If it is a problem config (has problemStyle)
  if ('problemStyle' in config) {
    return estimateProblemHeight(config);
  }

  const ops = config.selectedOperations?.filter((o: string) => o !== 'mixed') || [];

  if (ops.length === 0) {
    return estimateItemHeightForOp('add', config);
  }

  if (ops.length === 1) {
    return estimateItemHeightForOp(ops[0], config);
  }

  const totalHeight = ops.reduce((sum: number, op: string) => sum + estimateItemHeightForOp(op, config), 0);
  return totalHeight / ops.length;
};

/**
 * Calculates the maximum number of items that fit on a single A4 page.
 */
export const calculateItemsPerPage = (config: any, pageMargin: number): number => {
  const usableHeight = A4_HEIGHT_PX - HEADER_HEIGHT - FOOTER_HEIGHT - pageMargin * 2;
  const itemH = estimateItemHeight(config);
  const gapY = config.gap || (('problemStyle' in config) ? 24 : 12);

  const rows = Math.floor(usableHeight / (itemH + gapY));
  const cols = config.cols || 1;

  const totalItems = Math.max(1, rows * cols);
  return Math.max(1, Math.floor(totalItems * 0.95));
};

/**
 * Splits an array into pages of given size.
 */
export const paginateItems = <T>(items: T[], perPage: number): T[][] => {
  if (perPage <= 0) return [items];
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += perPage) {
    pages.push(items.slice(i, i + perPage));
  }
  return pages.length > 0 ? pages : [[]];
};

/**
 * Clamps a number between min and max.
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
