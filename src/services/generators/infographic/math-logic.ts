import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';

// ── KAT.4: MATEMATİK & MANTIK (10 OFFLINE, 10 AI) ─────────────────────────

export const generateOfflineInfographicMathSteps: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicMathStepsFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Matematik Adımları', category: 'math-logic',
    description: 'Problemin çözüm adımlarını sırasıyla göster.', syntaxGuide: '<sequence-steps></sequence-steps>'
});

export const generateOfflineInfographicNumberLine: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicNumberLineFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Sayı Doğrusu', category: 'math-logic',
    description: 'Sayılar, kesirler veya ondalık gösterimleri doğru üzerinde görselleştir.', syntaxGuide: '<timeline-view></timeline-view>'
});

export const generateOfflineInfographicFractionVisual: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicFractionVisualFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Kesir Gösterimi', category: 'math-logic',
    description: 'Bütün, yarım, çeyrek gibi kesir kavramlarını parça-bütün ilişkisiyle sun.', syntaxGuide: '<fraction-chart></fraction-chart>'
});

export const generateOfflineInfographicMultiplicationMap: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicMultiplicationMapFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Çarpım Haritası', category: 'math-logic',
    description: 'Çarpma işleminin mantığını ritmik sayma ve tekrarlı toplama ile haritala.', syntaxGuide: '<concept-map></concept-map>'
});

export const generateOfflineInfographicGeometryExplorer: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicGeometryExplorerFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Geometri Kaşifi', category: 'math-logic',
    description: 'Geometrik cisimlerin köşe, ayrıt ve yüz özelliklerini analiz et.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineInfographicDataChart: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicDataChartFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Veri Tablosu', category: 'math-logic',
    description: 'Sıklık tablosu veya çetele tablosu verilerini grafikleştir.', syntaxGuide: '<matrix-grid></matrix-grid>'
});

export const generateOfflineInfographicAlgebraBalance: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicAlgebraBalanceFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Eşitlik Terazisi', category: 'math-logic',
    description: 'Cebirsel ifadelerde denge durumunu terazi modeliyle açıkla.', syntaxGuide: '<balance-scale></balance-scale>'
});

export const generateOfflineInfographicMeasurementGuide: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicMeasurementGuideFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Ölçü Rehberi', category: 'math-logic',
    description: 'Uzunluk, kütle veya sıvı ölçü birimlerini birbirine dönüştür.', syntaxGuide: '<flow-graph></flow-graph>'
});

export const generateOfflineInfographicPatternRule: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicPatternRuleFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Örüntü Kuralı', category: 'math-logic',
    description: 'Sayı veya şekil örüntülerinin genişleme kuralını bul.', syntaxGuide: '<visual-logic></visual-logic>'
});

export const generateOfflineInfographicWordProblemMap: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicWordProblemMapFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Problem Haritası', category: 'math-logic',
    description: 'Verilenler, istenenler ve çözüm stratejisi şekline problemi yapılandır.', syntaxGuide: '<story-map></story-map>'
});
