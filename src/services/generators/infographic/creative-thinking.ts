import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';

// ── KAT.7: YARATICI DÜŞÜNME (8 OFFLINE, 8 AI) ─────────────────────────

export const generateOfflineInfographicBrainstorming: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicBrainstormingFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Beyin Fırtınası', category: 'creative-thinking',
    description: 'Bir konu etrafında özgür fikirler üret.', syntaxGuide: '<mind-map></mind-map>'
});

export const generateOfflineInfographicScamper: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicScamperFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'SCAMPER Tekniği', category: 'creative-thinking',
    description: 'Bir nesneyi değiştirmek veya geliştirmek için 7 farklı yönerge kullan.', syntaxGuide: '<matrix-grid></matrix-grid>'
});

export const generateOfflineInfographicDesignThinking: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicDesignThinkingFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Tasarım Odaklı Düşünme', category: 'creative-thinking',
    description: 'Empati, tanımlama, fikir üretme ve prototipleme adımlarını içeren bir süreç tasarla.', syntaxGuide: '<flow-graph></flow-graph>'
});

export const generateOfflineInfographicAlternativeEnds: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicAlternativeEndsFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Alternatif Sonlar', category: 'creative-thinking',
    description: 'Bir hikaye veya olayın farklı şekillerde nasıl bitebileceğini çiz.', syntaxGuide: '<concept-map></concept-map>'
});

export const generateOfflineInfographicInventionPlan: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicInventionPlanFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'İcat Planı', category: 'creative-thinking',
    description: 'Yeni bir icat tasarlayıp özelliklerini ve amacını açıkla.', syntaxGuide: '<character-profile></character-profile>'
});

export const generateOfflineInfographicAssociations: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicAssociationsFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Kavramsal Çağrışım', category: 'creative-thinking',
    description: 'Bir kelimenin akla getirdiği diğer kavramları görselleştir.', syntaxGuide: '<cluster-map></cluster-map>'
});

export const generateOfflineInfographicRolePlayScenario: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicRolePlayScenarioFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Rol Oynama Senaryosu', category: 'creative-thinking',
    description: 'Farklı karakterlerin bakış açılarından bir durum incele.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineInfographicFutureVision: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicFutureVisionFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Gelecek Vizyonu', category: 'creative-thinking',
    description: 'Gelecekte dünyayı veya belirli bir teknolojiyi nasıl hayal ettiğini planla.', syntaxGuide: '<timeline-view></timeline-view>'
});
