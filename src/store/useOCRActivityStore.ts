/**
 * OOGMATIK — OCR Etkinlik Store (Zustand)
 *
 * OCR tabanlı etkinlik üretim modülünün merkezi durumu.
 * 3 üretim modu, blueprint sonucu, onay kuyruğu ve
 * kütüphane (savedBlueprints) yönetimi.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

// ─── Blueprint Kütüphane Girişi ───────────────────────────────────────────

export interface BlueprintEntry {
    /** Benzersiz ID (timestamp tabanlı) */
    id: string;
    /** Blueprint başlığı */
    title: string;
    /** OCR analiz sonucu */
    result: OCRResult;
    /** Kategori (detectedType'dan türetilir) */
    category: string;
    /** Kaydetme tarihi (ISO 8601) */
    savedAt: string;
    /** Kullanım sayısı */
    useCount: number;
    /** Öne çıkan görsel thumbnail (opsiyonel, base64 miniature) */
    thumbnail?: string;
}

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
    /** Kaydedilmiş blueprint kütüphanesi (localStorage'da saklanır) */
    savedBlueprints: BlueprintEntry[];

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
    /** Blueprint'i kütüphaneye kaydeder */
    saveBlueprint: (result: OCRResult, thumbnail?: string) => void;
    /** Blueprint'i kütüphaneden siler */
    deleteBlueprint: (id: string) => void;
    /** Blueprint kullanım sayacını artırır */
    incrementBlueprintUse: (id: string) => void;
}

// ─── Initial State ───────────────────────────────────────────────────────

const nonPersistedInitialState = {
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

export const useOCRActivityStore = create<OCRActivityState>()(
    persist(
        (set, get) => ({
            ...nonPersistedInitialState,
            savedBlueprints: [] as BlueprintEntry[],

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

            reset: () => set(nonPersistedInitialState),

            saveBlueprint: (result: OCRResult, thumbnail?: string) => {
                const entry: BlueprintEntry = {
                    id: `bp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
                    title: result.title,
                    result,
                    category: result.detectedType || 'OTHER',
                    savedAt: new Date().toISOString(),
                    useCount: 0,
                    thumbnail,
                };
                // Maksimum 50 blueprint sakla (LRU: en eski silinir)
                const current = get().savedBlueprints;
                const next =
                    current.length >= 50
                        ? [...current.slice(1), entry]
                        : [...current, entry];
                set({ savedBlueprints: next });
            },

            deleteBlueprint: (id: string) => {
                set(state => ({
                    savedBlueprints: state.savedBlueprints.filter(bp => bp.id !== id),
                }));
            },

            incrementBlueprintUse: (id: string) => {
                set(state => ({
                    savedBlueprints: state.savedBlueprints.map(bp =>
                        bp.id === id ? { ...bp, useCount: bp.useCount + 1 } : bp
                    ),
                }));
            },
        }),
        {
            name: 'oogmatik-ocr-blueprints',
            // Sadece kütüphane verisini localStorage'da sakla
            partialize: state => ({ savedBlueprints: state.savedBlueprints }),
        }
    )
);
