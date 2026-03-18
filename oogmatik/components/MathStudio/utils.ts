// Math Studio — Utility Functions

import { A4_HEIGHT_PX, HEADER_HEIGHT, FOOTER_HEIGHT } from './constants';
import { MathDrillConfig } from '../../types/math';

/**
 * Converts a number to its Turkish text representation.
 * Supports numbers 0-999.
 */
export const numberToTurkish = (num: number): string => {
    if (num === 0) return "Sıfır";
    const ones = ["", "Bir", "İki", "Üç", "Dört", "Beş", "Altı", "Yedi", "Sekiz", "Dokuz"];
    const tens = ["", "On", "Yirmi", "Otuz", "Kırk", "Elli", "Altmış", "Yetmiş", "Seksen", "Doksan"];

    const convertGroup = (n: number) => {
        let str = "";
        const h = Math.floor(n / 100);
        const t = Math.floor((n % 100) / 10);
        const o = n % 10;

        if (h === 1) str += "Yüz ";
        else if (h > 1) str += ones[h] + " Yüz ";

        if (t > 0) str += tens[t] + " ";
        if (o > 0) str += ones[o] + " ";
        return str.trim();
    };

    if (num < 1000) return convertGroup(num);
    return num.toString();
};

/**
 * Estimates the pixel height of a single drill item based on config.
 */
export const estimateItemHeight = (config: MathDrillConfig): number => {
    if (config.orientation === 'vertical') {
        const lineCount = config.useThirdNumber ? 4.5 : 3.2;
        const textExtra = config.showTextRepresentation ? 12 : 0;
        return (config.fontSize * lineCount) + textExtra + 8;
    }
    return (config.fontSize * 1.5) + 8;
};

/**
 * Calculates max items that fit on a single A4 page.
 */
export const calculateItemsPerPage = (config: MathDrillConfig, pageMargin: number): number => {
    const usableHeight = A4_HEIGHT_PX - HEADER_HEIGHT - FOOTER_HEIGHT - (pageMargin * 2);
    const itemH = estimateItemHeight(config);
    const gapY = config.gap || 8;
    const rows = Math.floor(usableHeight / (itemH + gapY));
    const safeCols = config.orientation === 'vertical' && config.fontSize > 30
        ? Math.min(3, config.cols)
        : config.cols;
    return Math.max(1, rows * safeCols);
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
