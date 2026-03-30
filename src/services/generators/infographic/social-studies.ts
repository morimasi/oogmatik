import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';

// ── KAT.6: SOSYAL BİLGİLER & TARİH (8 OFFLINE, 8 AI) ─────────────────────────

export const generateOfflineInfographicHistoricalTimeline: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicHistoricalTimelineFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Tarih Şeridi', category: 'social-studies',
    description: 'Tarihi olayları kronolojik bir çizgi üzerinde açıkla.', syntaxGuide: '<timeline-view></timeline-view>'
});

export const generateOfflineInfographicMapExplorer: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicMapExplorerFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Harita Kaşifi', category: 'social-studies',
    description: 'Coğrafi bölgelerin veya tarihi mekanların mekansal analizini yap.', syntaxGuide: '<cluster-map></cluster-map>'
});

export const generateOfflineInfographicCultureCompare: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicCultureCompareFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Kültür Karşılaştırması', category: 'social-studies',
    description: 'Farklı medeniyet veya bölgelerin yaşayış tarzlarını kıyasla.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineInfographicGovernmentChart: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicGovernmentChartFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Yönetim Şeması', category: 'social-studies',
    description: 'Devlet organları ve kuvvetler ayrılığı ilkesini hiyerarşik göster.', syntaxGuide: '<concept-map></concept-map>'
});

export const generateOfflineInfographicEconomicFlow: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicEconomicFlowFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Ekonomi Akışı', category: 'social-studies',
    description: 'Üretim, dağıtım ve tüketim döngüsünü akış olarak tasarla.', syntaxGuide: '<flow-graph></flow-graph>'
});

export const generateOfflineInfographicBiographyBoard: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicBiographyBoardFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Biyografi Panosu', category: 'social-studies',
    description: 'Tarihi bir şahsiyetin hayatındaki önemli dönüm noktalarını özetle.', syntaxGuide: '<character-profile></character-profile>'
});

export const generateOfflineInfographicEventAnalysis: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicEventAnalysisFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Olay Analizi', category: 'social-studies',
    description: 'Tarihi bir olayın nedenlerini ve sonuçlarını etki diyagramında göster.', syntaxGuide: '<cause-effect></cause-effect>'
});

export const generateOfflineInfographicGeographyProfile: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicGeographyProfileFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Coğrafya Profili', category: 'social-studies',
    description: 'Bir bölgenin iklim, yeryüzü şekli ve nüfus yapısını analiz et.', syntaxGuide: '<matrix-grid></matrix-grid>'
});
