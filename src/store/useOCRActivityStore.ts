/**
 * OOGMATIK — OCR Etkinlik Store (Zustand)
 *
 * OCR tabanlı etkinlik üretim modülünün merkezi durumu.
 * 3 üretim modu, blueprint sonucu ve onay kuyruğu yönetimi.
 */

import { create } from 'zustand';
import type { ActivityTemplate, ProductionMode, ApprovalStatus } from '../types/ocr-activity';
import type { OCRResult } from '../types/core';
import type { ActivityDraft } from '../types/admin';

// ─── İşleme Fazları ──────────────────────────────────────────────────────

export type ProcessingPhase =
    | 'idle'
    | 'uploading'
    | 'analyzing'
    | 'generating'
    | 'previewing'
    | 'submitting';

// ─── Store Arayüzü ──────────────────────────────────────────────────────

interface OCRActivityState {
    /** Aktif üretim modu */
    activeMode: ProductionMode;
    /** Üretilen/görüntülenen şablon */
    currentTemplate: ActivityTemplate | null;
    /** OCR blueprint analiz sonucu (Mod 1 & 3) */
    blueprintResult: OCRResult | null;
    /** İşleme durumu */
    isProcessing: boolean;
    /** İşleme fazı */
    processingPhase: ProcessingPhase;
    /** Hata mesajı */
    error: string | null;
    /** Onay bekleyen taslaklar */
    pendingApprovals: ActivityDraft[];
    /** Son kullanılan prompt (Mod 2) */
    lastPrompt: string;

    // ── Actions ──
    setMode: (mode: ProductionMode) => void;
    setTemplate: (template: ActivityTemplate | null) => void;
    setBlueprintResult: (result: OCRResult | null) => void;
    startProcessing: (phase: ProcessingPhase) => void;
    stopProcessing: () => void;
    setError: (error: string | null) => void;
    setPendingApprovals: (drafts: ActivityDraft[]) => void;
    setLastPrompt: (prompt: string) => void;
    reset: () => void;
}

// ─── Initial State ───────────────────────────────────────────────────────

const initialState = {
    activeMode: 'architecture_clone' as ProductionMode,
    currentTemplate: null as ActivityTemplate | null,
    blueprintResult: null as OCRResult | null,
    isProcessing: false,
    processingPhase: 'idle' as ProcessingPhase,
    error: null as string | null,
    pendingApprovals: [] as ActivityDraft[],
    lastPrompt: '',
};

// ─── Store ───────────────────────────────────────────────────────────────

export const useOCRActivityStore = create<OCRActivityState>((set) => ({
    ...initialState,

    setMode: (mode: ProductionMode) =>
        set({ activeMode: mode, error: null }),

    setTemplate: (template: ActivityTemplate | null) =>
        set({ currentTemplate: template }),

    setBlueprintResult: (result: OCRResult | null) =>
        set({ blueprintResult: result }),

    startProcessing: (phase: ProcessingPhase) =>
        set({ isProcessing: true, processingPhase: phase, error: null }),

    stopProcessing: () =>
        set({ isProcessing: false, processingPhase: 'idle' }),

    setError: (error: string | null) =>
        set({ error, isProcessing: false, processingPhase: 'idle' }),

    setPendingApprovals: (drafts: ActivityDraft[]) =>
        set({ pendingApprovals: drafts }),

    setLastPrompt: (prompt: string) =>
        set({ lastPrompt: prompt }),

    reset: () => set(initialState),
}));
