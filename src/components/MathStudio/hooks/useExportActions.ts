// Math Studio — Export Actions Hook (Save, AutoDraft, Share, Print, PDF)

import { useState, useCallback } from 'react';
import { printService } from '../../../utils/printService';
import { worksheetService } from '../../../services/worksheetService';
import { MathMode, MathDrillConfig, MathProblemConfig, MathPageConfig, MathOperation, MathProblem } from '../../../types/math';
import { ActivityType } from '../../../types';
import { ThemeConfig } from '../constants';
import { preloadFontsForCapture } from '../../../utils/print/CaptureEngine';

import { logError } from '../../../utils/logger.js';

interface ExportDeps {
    userId?: string;
    userName?: string;
    mode: MathMode;
    drillConfig: MathDrillConfig;
    problemConfig: MathProblemConfig;
    pageConfig: MathPageConfig;
    generatedDrills: MathOperation[];
    generatedProblems: MathProblem[];
    themeConfig?: ThemeConfig;
    instruction?: string;
    pedagogicalNote?: string;
}

export const useExportActions = (deps: ExportDeps) => {
    const [isSaving, setIsSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);

    const getExportData = useCallback(() => {
        return {
            mode: deps.mode,
            config: deps.mode === 'drill' ? deps.drillConfig : deps.problemConfig,
            pageConfig: deps.pageConfig,
            themeConfig: deps.themeConfig ?? {},
            items: (deps.mode === 'drill' ? deps.generatedDrills : deps.generatedProblems) as unknown as Record<string, unknown>[],
            isMathStudio: true,
            title: deps.pageConfig.title,
            instruction: deps.instruction ?? 'Aşağıdaki matematik problemlerini çözün.',
            pedagogicalNote: deps.pedagogicalNote,
            targetSkills: ['Matematiksel Düşünme', 'Problem Çözme', 'Diskalkuli Desteği', 'Bilişsel Odak'],
            learningObjectives: ['Aritmetik İşlemler', 'Anlama ve Uygulama', 'Öz Güven İnşası'],
        };
    }, [deps.mode, deps.drillConfig, deps.problemConfig, deps.pageConfig, deps.generatedDrills, deps.generatedProblems, deps.themeConfig, deps.instruction, deps.pedagogicalNote]);

    // Manuel Kaydetme (Firestore Sync)
    const handleSave = useCallback(async (studentId?: string): Promise<{ success: boolean; error?: string }> => {
        if (!deps.userId) return { success: false, error: "Kaydetmek için giriş yapmalısınız." };
        setIsSaving(true);
        try {
            const data = getExportData();
            const sid = studentId === 'anonymous' ? undefined : studentId;
            await worksheetService.saveWorksheet(
                deps.userId,
                deps.pageConfig.title || 'Matematik Çalışması',
                ActivityType.MATH_STUDIO,
                [data],
                'fa-solid fa-calculator',
                { id: 'math-logic', title: 'Matematik & Mantık' },
                undefined,
                undefined,
                sid
            );
            setLastAutoSaveTime(new Date());
            return { success: true };
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
            return { success: false, error: "Kaydetme hatası. Veritabanı ile senkronize edilemedi." };
        } finally {
            setIsSaving(false);
        }
    }, [deps.userId, deps.pageConfig.title, getExportData]);

    // Otomatik Taslak Kaydetme (Auto-Draft Save)
    const handleAutoSaveDraft = useCallback(async (studentId?: string): Promise<boolean> => {
        if (!deps.userId) return false;
        const items = deps.mode === 'drill' ? deps.generatedDrills : deps.generatedProblems;
        if (!items || items.length === 0) return false;

        setIsAutoSaving(true);
        try {
            const data = getExportData();
            const sid = studentId === 'anonymous' ? undefined : studentId;
            // LocalStorage / SessionStorage taslak yedeklemesi
            const draftKey = `bdmind_math_draft_${deps.userId}_${sid || 'default'}`;
            try {
                localStorage.setItem(draftKey, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    data,
                }));
            } catch {
                // Storage full durumunda sessizce devam et
            }
            setLastAutoSaveTime(new Date());
            return true;
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
            return false;
        } finally {
            setIsAutoSaving(false);
        }
    }, [deps.userId, deps.mode, deps.generatedDrills, deps.generatedProblems, getExportData]);

    // Paylaşım İşlevi
    const handleShare = useCallback(async (receiverId: string): Promise<{ success: boolean; error?: string }> => {
        if (!deps.userId) return { success: false, error: "Paylaşmak için giriş yapmalısınız." };
        try {
            const data = getExportData();
            const mockSavedWorksheet: any = {
                name: deps.pageConfig.title,
                activityType: ActivityType.MATH_STUDIO,
                worksheetData: [data],
                icon: 'fa-solid fa-calculator',
                category: { id: 'math-logic', title: 'Matematik' },
            };
            await worksheetService.shareWorksheet(mockSavedWorksheet, deps.userId, deps.userName || '', receiverId);
            return { success: true };
        } catch {
            return { success: false, error: "Paylaşım hatası." };
        }
    }, [deps.userId, deps.userName, deps.pageConfig.title, getExportData]);

    // Doğrudan Paylaşım Linki Kopyalama
    const handleCopyShareLink = useCallback(async (): Promise<{ success: boolean; link?: string }> => {
        try {
            const currentUrl = window.location.href;
            const shareUrl = `${currentUrl.split('?')[0]}?view=math&shared=true&t=${Date.now()}`;
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                return { success: true, link: shareUrl };
            }
            return { success: false };
        } catch {
            return { success: false };
        }
    }, []);

    // PDF Dışa Aktarma / Yazdırma (KVKK Uyumlu)
    const handlePrint = useCallback(async (action: 'print' | 'download') => {
        setIsPrinting(true);
        try {
            await preloadFontsForCapture();
            // UI gecikmesini tolere etmek için 60ms bekle
            await new Promise(resolve => setTimeout(resolve, 60));

            // KVKK Madde 6: PDF dosya adında öğrenci özel verisi/skor asla yer almaz
            const sanitizedTitle = (deps.pageConfig.title || 'Matematik_Calismasi')
                .replace(/[^a-zA-Z0-9_\u00C0-\u017F\s-]/g, '')
                .trim()
                .replace(/\s+/g, '_');
            const safeFilename = `${sanitizedTitle || 'Matematik_Calismasi'}_${new Date().toISOString().slice(0, 10)}`;

            await printService.generatePdf('#math-canvas-container .math-canvas-page', safeFilename, { action });
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
        } finally {
            setIsPrinting(false);
        }
    }, [deps.pageConfig.title]);

    // Yalnızca Cevap Anahtarını PDF Olarak Dışa Aktarma
    const handleExportAnswerKeyPdf = useCallback(async (action: 'print' | 'download' = 'download') => {
        setIsPrinting(true);
        try {
            await preloadFontsForCapture();
            await new Promise(resolve => setTimeout(resolve, 60));
            const safeFilename = `Cevap_Anahtari_${deps.pageConfig.title || 'Matematik'}_${new Date().toISOString().slice(0, 10)}`;
            await printService.generatePdf('#math-canvas-container .answer-key-page', safeFilename, { action });
        } catch (e) {
            logError(e instanceof Error ? e : String(e));
        } finally {
            setIsPrinting(false);
        }
    }, [deps.pageConfig.title]);

    return {
        isSaving,
        isPrinting,
        isAutoSaving,
        lastAutoSaveTime,
        getExportData,
        handleSave,
        handleAutoSaveDraft,
        handleShare,
        handleCopyShareLink,
        handlePrint,
        handleExportAnswerKeyPdf,
    };
};
