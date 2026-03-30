import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';

// ── KAT.2: OKUDUĞUNU ANLAMA (10 OFFLINE, 10 AI) ─────────────────────────

export const generateOfflineInfographic5W1HBoard: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographic5W1HFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: '5N1K Panosu', category: 'reading-comprehension',
    description: 'Metnin temel ögelerini 5N1K sorularıyla çözümle.', syntaxGuide: '<5w1h-board></5w1h-board>'
});

export const generateOfflineInfographicReadingFlow: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicReadingFlowFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Okuma Akışı', category: 'reading-comprehension',
    description: 'Metnin giriş, gelişme, sonuç bölümlerini görselleştir.', syntaxGuide: '<reading-flow></reading-flow>'
});

export const generateOfflineInfographicSequence: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicSequenceFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Olay Örgüsü', category: 'reading-comprehension',
    description: 'Olayları kronolojik sıraya diz.', syntaxGuide: '<sequence-steps></sequence-steps>'
});

export const generateOfflineInfographicStoryMap: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicStoryMapFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Hikaye Haritası', category: 'reading-comprehension',
    description: 'Ana karakter, mekan, zaman ve problemi haritalandır.', syntaxGuide: '<story-map></story-map>'
});

export const generateOfflineInfographicCharacterAnalysis: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicCharacterAnalysisFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Karakter Analizi', category: 'reading-comprehension',
    description: 'Karakterin fiziksel ve içsel özelliklerini incele.', syntaxGuide: '<character-profile></character-profile>'
});

export const generateOfflineInfographicInferenceChain: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicInferenceChainFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Çıkarım Zinciri', category: 'reading-comprehension',
    description: 'Metindeki ipuçlarından yola çıkarak mantıklı çıkarımlar yap.', syntaxGuide: '<inference-chain></inference-chain>'
});

export const generateOfflineInfographicSummaryPyramid: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicSummaryPyramidFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Özet Piramidi', category: 'reading-comprehension',
    description: 'En temel bilgiden en detaya doğru özet çıkar.', syntaxGuide: '<summary-pyramid></summary-pyramid>'
});

export const generateOfflineInfographicPredictionBoard: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicPredictionBoardFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Tahmin Panosu', category: 'reading-comprehension',
    description: 'Okuma öncesi, sırası ve sonrasında tahminlerde bulun.', syntaxGuide: '<prediction-board></prediction-board>'
});

export const generateOfflineInfographicCompareTexts: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicCompareTextsFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Metin Karşılaştırma', category: 'reading-comprehension',
    description: 'Farklı metinlerin ortak ve ayrılan yönlerini listele.', syntaxGuide: '<text-compare></text-compare>'
});

export const generateOfflineInfographicThemeWeb: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicThemeWebFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Ana Fikir Ağı', category: 'reading-comprehension',
    description: 'Ana fikri destekleyen yardımcı düşünceleri ağ şeklinde sun.', syntaxGuide: '<theme-web></theme-web>'
});
