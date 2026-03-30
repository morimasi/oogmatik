import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';

// ── KAT.5: FEN BİLİMLERİ (8 OFFLINE, 8 AI) ─────────────────────────

export const generateOfflineInfographicLifeCycle: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicLifeCycleFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Yaşam Döngüsü', category: 'science',
    description: 'Canlıların veya doğal süreçlerin evrelerini dairesel olarak sırala.', syntaxGuide: '<cycle-loop></cycle-loop>'
});

export const generateOfflineInfographicFoodChain: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicFoodChainFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Besin Zinciri', category: 'science',
    description: 'Enerji aktarımını üreticiden tüketiciye doğru hiyerarşik veya akış şeklinde çiz.', syntaxGuide: '<sequence-steps></sequence-steps>'
});

export const generateOfflineInfographicScientificMethod: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicScientificMethodFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Bilimsel Yöntem', category: 'science',
    description: 'Deneyin gözlem, hipotez, veri ve sonuç adımlarını ilişkilendir.', syntaxGuide: '<flow-graph></flow-graph>'
});

export const generateOfflineInfographicCellDiagram: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicCellDiagramFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Hücre Modeli', category: 'science',
    description: 'Hücre organellerini ve görevlerini şematize et.', syntaxGuide: '<concept-map></concept-map>'
});

export const generateOfflineInfographicEcosystemWeb: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicEcosystemWebFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Besin Ağı', category: 'science',
    description: 'Bir ekosistem içindeki çoklu beslenme ilişkilerini bağlantılarla göster.', syntaxGuide: '<cluster-map></cluster-map>'
});

export const generateOfflineInfographicStatesMatter: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicStatesMatterFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Maddenin Halleri', category: 'science',
    description: 'Hal değişimlerini ısı alma/verme ilişkisiyle çapraz incele.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineInfographicSolarSystem: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicSolarSystemFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Güneş Sistemi', category: 'science',
    description: 'Gezegenlerin sırasını ve belirgin özelliklerini konumlarıyla modelle.', syntaxGuide: '<timeline-view></timeline-view>'
});

export const generateOfflineInfographicHumanBody: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicHumanBodyFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Vücut Sistemleri', category: 'science',
    description: 'İnsan vücudundaki sistemleri ve ana organları gruplandır.', syntaxGuide: '<matrix-grid></matrix-grid>'
});
