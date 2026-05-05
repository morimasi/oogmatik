// Math Studio — Drill Generator Hook

import { useState, useEffect, useCallback } from 'react';
import { MathDrillConfig, MathOperation } from '../../../types/math';
import { generateMathDrillSet } from '../../../services/offlineGenerators/mathStudio';
import { calculateItemsPerPage } from '../utils';
import { DEFAULT_DRILL_CONFIG } from '../constants';

export const useDrillGenerator = (pageMargin: number) => {
    const [drillConfig, setDrillConfig] = useState<MathDrillConfig>({ ...DEFAULT_DRILL_CONFIG });
    const [generatedDrills, setGeneratedDrills] = useState<MathOperation[]>([]);

    // Generate drills whenever config changes
    useEffect(() => {
        let targetCount = drillConfig.count;

        // Auto-fill: calculate max items for single page
        if (drillConfig.autoFillPage) {
            targetCount = calculateItemsPerPage(drillConfig, pageMargin);
        }

        const items = generateMathDrillSet(
            targetCount,
            drillConfig.selectedOperations as any,
            {
                digit1: drillConfig.digit1,
                digit2: drillConfig.digit2,
                digit3: drillConfig.digit3,
                allowCarry: drillConfig.allowCarry,
                allowBorrow: drillConfig.allowBorrow,
                allowRemainder: drillConfig.allowRemainder,
                allowNegative: drillConfig.allowNegative,
                useThirdNumber: drillConfig.useThirdNumber,
            }
        );
        setGeneratedDrills(items);
    }, [
        drillConfig.selectedOperations, drillConfig.digit1, drillConfig.digit2, drillConfig.digit3,
        drillConfig.count, drillConfig.allowCarry, drillConfig.allowBorrow, drillConfig.allowRemainder,
        drillConfig.allowNegative, drillConfig.useThirdNumber, drillConfig.autoFillPage,
        drillConfig.fontSize, drillConfig.orientation, drillConfig.cols, drillConfig.gap, pageMargin,
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
        // Force re-generate by toggling a hidden counter
        setDrillConfig(prev => ({ ...prev, count: prev.count }));
        // Trick: we need to actually change a dependency. Let's change count slightly and back.
        setDrillConfig(prev => {
            const items = generateMathDrillSet(
                prev.autoFillPage ? calculateItemsPerPage(prev, pageMargin) : prev.count,
                prev.selectedOperations as any,
                {
                    digit1: prev.digit1,
                    digit2: prev.digit2,
                    digit3: prev.digit3,
                    allowCarry: prev.allowCarry,
                    allowBorrow: prev.allowBorrow,
                    allowRemainder: prev.allowRemainder,
                    allowNegative: prev.allowNegative,
                    useThirdNumber: prev.useThirdNumber,
                }
            );
            setGeneratedDrills(items);
            return prev;
        });
    }, [pageMargin]);

    return {
        drillConfig,
        setDrillConfig,
        generatedDrills,
        toggleDrillOp,
        regenerate,
    };
};
