// Math Studio — Export Actions Hook (Save, Share, Print)

import { useState, useCallback } from 'react';
import { printService } from '../../../utils/printService';
import { worksheetService } from '../../../services/worksheetService';
import { MathMode, MathDrillConfig, MathProblemConfig, MathPageConfig, MathOperation, MathProblem } from '../../../types/math';
import { ActivityType } from '../../../types';

interface ExportDeps {
    userId?: string;
    userName?: string;
    mode: MathMode;
    drillConfig: MathDrillConfig;
    problemConfig: MathProblemConfig;
    pageConfig: MathPageConfig;
    generatedDrills: MathOperation[];
    generatedProblems: MathProblem[];
    onAddToWorkbook?: (data: any) => void;
}

export const useExportActions = (deps: ExportDeps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const getExportData = useCallback(() => {
        return {
            mode: deps.mode,
            config: deps.mode === 'drill' ? deps.drillConfig : deps.problemConfig,
            pageConfig: deps.pageConfig,
            items: deps.mode === 'drill' ? deps.generatedDrills : deps.generatedProblems,
            isMathStudio: true,
            title: deps.pageConfig.title,
            instruction: "Aşağıdaki matematik problemlerini çözün.",
        };
    }, [deps.mode, deps.drillConfig, deps.problemConfig, deps.pageConfig, deps.generatedDrills, deps.generatedProblems]);

    const handleSave = useCallback(async (studentId?: string): Promise<{ success: boolean; error?: string }> => {
        if (!deps.userId) return { success: false, error: "Kaydetmek için giriş yapmalısınız." };
        setIsSaving(true);
        try {
            const data = getExportData();
            const sid = studentId === 'anonymous' ? undefined : studentId;
            await worksheetService.saveWorksheet(
                deps.userId,
                deps.pageConfig.title,
                'MATH_STUDIO' as ActivityType,
                [data],
                'fa-solid fa-calculator',
                { id: 'math-logic', title: 'Matematik' },
                undefined,
                undefined,
                sid
            );
            return { success: true };
        } catch (e) {
            console.error(e);
            return { success: false, error: "Kaydetme hatası." };
        } finally {
            setIsSaving(false);
        }
    }, [deps.userId, deps.pageConfig.title, getExportData]);

    const handleShare = useCallback(async (receiverId: string): Promise<{ success: boolean; error?: string }> => {
        if (!deps.userId) return { success: false, error: "Paylaşmak için giriş yapmalısınız." };
        try {
            const data = getExportData();
            const mockSavedWorksheet: any = {
                name: deps.pageConfig.title,
                activityType: 'MATH_STUDIO',
                worksheetData: [data],
                icon: 'fa-solid fa-calculator',
                category: { id: 'math-logic', title: 'Matematik' },
            };
            await worksheetService.shareWorksheet(mockSavedWorksheet, deps.userId, deps.userName || '', receiverId);
            return { success: true };
        } catch (_e) {
            return { success: false, error: "Paylaşım hatası." };
        }
    }, [deps.userId, deps.userName, deps.pageConfig.title, getExportData]);

    const handlePrint = useCallback(async (action: 'print' | 'download') => {
        setIsPrinting(true);
        try {
            // Allow React to render the loading state before blocking the thread
            await new Promise(resolve => setTimeout(resolve, 50));
            await printService.generatePdf('#math-canvas-container .math-canvas-page', deps.pageConfig.title, { action });
        } catch (e) {
            console.error(e);
        } finally {
            setIsPrinting(false);
        }
    }, [deps.pageConfig.title]);

    const handleAddToWorkbook = useCallback(() => {
        if (deps.onAddToWorkbook) {
            deps.onAddToWorkbook(getExportData());
        }
    }, [deps.onAddToWorkbook, getExportData]);

    return {
        isSaving,
        isPrinting,
        getExportData,
        handleSave,
        handleShare,
        handlePrint,
        handleAddToWorkbook,
    };
};
