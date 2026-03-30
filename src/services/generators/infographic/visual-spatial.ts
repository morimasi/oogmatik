// src/services/generators/infographic/visual-spatial.ts
import { generateCreativeMultimodal } from '../../geminiClient';
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

import { createAIGenerator } from './_shared/aiFactory';

export const generateInfographicConceptMapFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Kavram Haritası',
    category: 'visual-spatial',
    description: 'Ana konu ve alt kavramların hiyerarşik bağlarını kur.',
    syntaxGuide: '<concept-map></concept-map> ve "hierarchy" key ile ağaç yapısı kur.',
});

export const generateInfographicCompareFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Karşılaştırma Tablosu',
    category: 'visual-spatial',
    description: 'İki kavramın benzer ve farklı yönlerini analiz et.',
    syntaxGuide: '<compare-chart></compare-chart> ve "features" dictionary.',
});

export const generateInfographicVisualLogicFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Görsel Mantık',
    category: 'visual-spatial',
    description: 'Mantıksal sıralama veya desen kurallarını buldurmaya yönelik bir etkinlik.',
    syntaxGuide: '<visual-logic></visual-logic> ve "sequence" array.',
});

export const generateInfographicVennDiagramFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Venn Şeması',
    category: 'visual-spatial',
    description: 'İki konunun ortak kümelerini (kesişimlerini) oluştur.',
    syntaxGuide: '<venn-diagram></venn-diagram> "setA", "setB", "intersection" kurgula.',
});

export const generateInfographicMindMapFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Zihin Haritası',
    category: 'visual-spatial',
    description: 'Serbest çağrışımlı bir merkezden dağılan yaratıcı kollar.',
    syntaxGuide: '<mind-map></mind-map> "nodes" array of objects.',
});

export const generateInfographicFlowchartFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Akış Şeması',
    category: 'visual-spatial',
    description: 'Adım adım süreçleri ve karar dallarını (evet/hayır) oluştur.',
    syntaxGuide: '<flow-graph></flow-graph> "steps" flowchart formatında.',
});

export const generateInfographicMatrixAnalysisFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Matris Analizi',
    category: 'visual-spatial',
    description: 'Dikey ve yatay eksende bilgiyi çapraz analiz et.',
    syntaxGuide: '<matrix-grid></matrix-grid> "rows" ve "columns" dizisi.',
});

export const generateInfographicCauseEffectFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Sebep Sonuç İlişkisi',
    category: 'visual-spatial',
    description: 'Bir olayın birden fazla nedenini ve yol açtığı sonuçları birbirine bağla.',
    syntaxGuide: '<cause-effect></cause-effect> "causes" ve "effects" dizisi.',
});

export const generateInfographicFishboneFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Balık Kılçığı',
    category: 'visual-spatial',
    description: 'Bir problemi ana öğelerine (makine, metod, insan, çevre vb.) böl.',
    syntaxGuide: '<fishbone-diagram></fishbone-diagram> "problem" ve "causes" kategorileri.',
});

export const generateInfographicClusterMapFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Kümeleme Haritası',
    category: 'visual-spatial',
    description: 'Birbiriyle ilişkili, hiyerarşik olmayan bilgi kümeleri yarat.',
    syntaxGuide: '<cluster-map></cluster-map> "clusters" objesi.',
});

// ... Diğer 9 Aktivite imzaları (COMPARE, VISUAL_LOGIC, VENN_DIAGRAM, vb.)

// Şimdilik stub olarak tüm imzaları dolduruyoruz (Faz 2 & 3'te içleri kodlanacak)
export const generateOfflineInfographicCompare: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicVisualLogic: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicVennDiagram: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicMindMap: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicFlowchart: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicMatrixAnalysis: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicCauseEffect: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicFishbone: InfographicGeneratorFn = async (options) => ({} as any);

export const generateOfflineInfographicClusterMap: InfographicGeneratorFn = async (options) => ({} as any);
