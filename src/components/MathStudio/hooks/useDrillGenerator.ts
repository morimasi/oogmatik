// Math Studio — Drill Generator Hook
// Auto-fills A4 page on every config change. Never overflows to page 2.

import { useState, useEffect, useCallback, useRef } from 'react';
import { MathDrillConfig, MathOperation } from '../../../types/math';
import { generateMathDrillSet } from '../../../services/offlineGenerators/mathStudio';
import { calculateItemsPerPage } from '../utils';
import { DEFAULT_DRILL_CONFIG } from '../constants';

export const useDrillGenerator = (pageMargin: number) => {
    const [drillConfig, setDrillConfig] = useState<MathDrillConfig>({ ...DEFAULT_DRILL_CONFIG });
    const [generatedDrills, setGeneratedDrills] = useState<MathOperation[]>([]);
    const generationCounter = useRef(0);

    // Generate drills whenever config changes — ALWAYS auto-fill A4 page
    useEffect(() => {
        // Force autoFillPage ON — user cannot turn it off
        const effectiveConfig = { ...drillConfig, autoFillPage: true };

        // Calculate exact items that fit on one A4 page
        const targetCount = calculateItemsPerPage(effectiveConfig, pageMargin);

        const items = generateMathDrillSet(
            targetCount,
            effectiveConfig.selectedOperations as string[],
            {
                digit1: effectiveConfig.digit1,
                digit2: effectiveConfig.digit2,
                digit3: effectiveConfig.digit3,
                allowCarry: effectiveConfig.allowCarry,
                allowBorrow: effectiveConfig.allowBorrow,
                allowRemainder: effectiveConfig.allowRemainder,
                allowNegative: effectiveConfig.allowNegative,
                useThirdNumber: effectiveConfig.useThirdNumber,
            }
        );
        setGeneratedDrills(items);
    }, [
        drillConfig.selectedOperations, drillConfig.digit1, drillConfig.digit2, drillConfig.digit3,
        drillConfig.allowCarry, drillConfig.allowBorrow, drillConfig.allowRemainder,
        drillConfig.allowNegative, drillConfig.useThirdNumber,
        drillConfig.fontSize, drillConfig.orientation, drillConfig.cols, drillConfig.gap,
        drillConfig.showTextRepresentation, pageMargin, generationCounter.current,
    ]);

    const toggleDrillOp = useCallback((op: string) => {
        setDrillConfig(prev => {
            const current = prev.selectedOperations;
            const newOps = current.includes(op) ? current.filter(o => o !== op) : [...current, op];
            if (newOps.length === 0) return prev;
            return { ...prev, selectedOperations: newOps };
        });
    }, []);

    const regenerate = useCallback(() => {
        generationCounter.current += 1;
    }, []);

    return {
        drillConfig,
        setDrillConfig,
        generatedDrills,
        toggleDrillOp,
        regenerate,
    };
};
