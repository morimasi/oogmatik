// Math Studio — Pagination Hook

import { useMemo } from 'react';
import { MathDrillConfig, MathOperation, MathProblem } from '../../../types/math';
import { calculateItemsPerPage, paginateItems } from '../utils';

interface PaginationResult<T> {
    pages: T[][];
    totalPages: number;
    itemsPerPage: number;
}

/**
 * Splits drill operations into A4-sized pages.
 */
export const useDrillPagination = (
    items: MathOperation[],
    config: MathDrillConfig,
    pageMargin: number
): PaginationResult<MathOperation> => {
    return useMemo(() => {
        const perPage = calculateItemsPerPage(config, pageMargin);
        const pages = paginateItems(items, perPage);
        return {
            pages,
            totalPages: pages.length,
            itemsPerPage: perPage,
        };
    }, [items, config.cols, config.fontSize, config.orientation, config.useThirdNumber, config.showTextRepresentation, config.gap, pageMargin]);
};

/**
 * Splits AI problems into A4-sized pages.
 * Estimated: ~3-4 problems per page with solution boxes.
 */
export const useProblemPagination = (
    items: MathProblem[],
    includeSolutionBox: boolean,
    pageMargin: number
): PaginationResult<MathProblem> => {
    return useMemo(() => {
        // Rough estimate: problem text ~40px, solution box ~96px, gap ~24px
        const itemH = includeSolutionBox ? 160 : 80;
        const usableH = 1123 - 52 - 28 - (pageMargin * 2); // A4 - header - footer - margins
        const perPage = Math.max(1, Math.floor(usableH / itemH));
        const pages = paginateItems(items, perPage);
        return {
            pages,
            totalPages: pages.length,
            itemsPerPage: perPage,
        };
    }, [items, includeSolutionBox, pageMargin]);
};
