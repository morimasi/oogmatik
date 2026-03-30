// src/services/generators/infographic/visual-spatial.ts
import { generateWithSchema } from '../../geminiClient';
import { retryWithBackoff } from '../../../utils/errorHandler';
import { AppError } from '../../../utils/AppError';
import { GeneratorOptions } from '../../../types/core';
import {
    InfographicActivityResult,
} from '../../../types/infographic';
import { VISUAL_SPATIAL_PEDAGOGICAL_NOTES } from './_shared/pedagogicalNotes';
import { GenerateParams, InfographicGeneratorFn } from './_shared/types';

// ── KAT.1: GÖRSEL & MEKANSAL (10 OFFLINE, 10 AI) ───────────────────────────

/**
 * 1. INFOGRAPHIC_CONCEPT_MAP (Kavram Haritası)
 */
export const generateOfflineInfographicConceptMap: InfographicGeneratorFn = async (options) => {
    if (options.mode === 'ai') throw new AppError('AI mode triggered offline fn', 'ROUTING_ERROR', 500);

    // TODO: Fast mod (Offline kurallı) üretimi Faz 2 detaylarında
    return {
        title: options.topic || 'Kavram Haritası',
        syntax: '<concept-map></concept-map>',
        templateType: 'hierarchy-structure',
        activityContent: { hierarchy: { label: 'Merkez' } },
        pedagogicalNote: VISUAL_SPATIAL_PEDAGOGICAL_NOTES.getConceptMapNote('general', '8-10'),
        difficultyLevel: 'Orta',
        targetSkills: ['Görsel Algı', 'Hiyerarşik Düşünme'],
        ageGroup: '8-10',
        profile: 'general',
        category: 'visual-spatial',
        generationMode: 'fast',
        estimatedDuration: 10
    };
};

export const generateInfographicConceptMapFromAI: InfographicGeneratorFn = async (options) => {
    // TODO: Faz 3'te AI Prompt ve z.Schema ile doldurulacak.
    return {} as InfographicActivityResult;
};

// ... Diğer 9 Aktivite imzaları (COMPARE, VISUAL_LOGIC, VENN_DIAGRAM, vb.)

// Şimdilik stub olarak tüm imzaları dolduruyoruz (Faz 2 & 3'te içleri kodlanacak)
export const generateOfflineInfographicCompare: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicCompareFromAI: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicVisualLogic: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicVisualLogicFromAI: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicVennDiagram: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicVennDiagramFromAI: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicMindMap: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicMindMapFromAI: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicFlowchart: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicFlowchartFromAI: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicMatrixAnalysis: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicMatrixAnalysisFromAI: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicCauseEffect: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicCauseEffectFromAI: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicFishbone: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicFishboneFromAI: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicClusterMap: InfographicGeneratorFn = async (options) => ({} as any);
export const generateInfographicClusterMapFromAI: InfographicGeneratorFn = async (options) => ({} as any);
