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
 * Estimates the pixel height of a single drill item based on config.
 * For mixed operations, calculates weighted average across all selected ops.
 */
export const estimateItemHeight = (config: MathDrillConfig): number => {
  const ops = config.selectedOperations.filter(o => o !== 'mixed');

  if (ops.length === 0) {
    // Fallback: treat as add
    return estimateItemHeightForOp('add', config);
  }

  if (ops.length === 1) {
    return estimateItemHeightForOp(ops[0], config);
  }

  // Mixed operations: average height across all selected ops
  const totalHeight = ops.reduce((sum, op) => sum + estimateItemHeightForOp(op, config), 0);
  return totalHeight / ops.length;
};

/**
 * Calculates the maximum number of drill items that fit on a single A4 page.
 * Uses a 5% safety margin to prevent overflow.
 */
export const calculateItemsPerPage = (config: MathDrillConfig, pageMargin: number): number => {
  const usableHeight = A4_HEIGHT_PX - HEADER_HEIGHT - FOOTER_HEIGHT - pageMargin * 2;
  const itemH = estimateItemHeight(config);
  const gapY = config.gap || 12;

  // Rows: how many items fit vertically
  const rows = Math.floor(usableHeight / (itemH + gapY));

  // Columns: use configured value (user controls this)
  const cols = Math.max(1, Math.min(8, config.cols));

  const totalItems = Math.max(1, rows * cols);

  // Apply 5% safety margin to prevent edge-case overflow
  const safeItems = Math.max(1, Math.floor(totalItems * 0.95));

  return safeItems;
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
