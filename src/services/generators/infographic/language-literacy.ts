import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';

// ── KAT.3: OKUMA & DİL (10 OFFLINE, 10 AI) ─────────────────────────

export const generateOfflineInfographicSyllableMap: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicSyllableMapFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Hece Haritası', category: 'language-literacy',
    description: 'Kelimeyi hecelerine ayırarak görsel bir harita çıkar.', syntaxGuide: '<syllable-map></syllable-map>'
});

export const generateOfflineInfographicVocabTree: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicVocabTreeFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Kelime Ağacı', category: 'language-literacy',
    description: 'Kök kelimeden türeyen yeni kelimeleri ve anlam bağlarını ağaç yapısında sun.', syntaxGuide: '<vocab-tree></vocab-tree>'
});

export const generateOfflineInfographicTimelineEvent: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicTimelineEventFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Zaman Çizelgesi', category: 'language-literacy',
    description: 'Zamana bağlı gelişen olayları çizelgede göster.', syntaxGuide: '<timeline-view></timeline-view>'
});

export const generateOfflineInfographicWordFamily: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicWordFamilyFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Kelime Ailesi', category: 'language-literacy',
    description: 'Aynı anlama veya köke sahip sözcükleri bir araya topla.', syntaxGuide: '<cluster-map></cluster-map>'
});

export const generateOfflineInfographicPrefixSuffix: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicPrefixSuffixFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Ek-Kök İncelemesi', category: 'language-literacy',
    description: 'Kelimenin köküne gelen yapım ve çekim eklerini morfolojik olarak haritala.', syntaxGuide: '<prefix-suffix-board></prefix-suffix-board>'
});

export const generateOfflineInfographicSentenceBuilder: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicSentenceBuilderFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Cümle Mimarı', category: 'language-literacy',
    description: 'Cümlenin ögelerini yapısına göre birleştir.', syntaxGuide: '<sentence-builder></sentence-builder>'
});

export const generateOfflineInfographicAntonymSynonym: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicAntonymSynonymFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Zıt ve Eş Anlam', category: 'language-literacy',
    description: 'Kelimenin zıt ve eş anlamlarını karşılaştırmalı göster.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineInfographicWordOrigin: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicWordOriginFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Kelime Kökeni', category: 'language-literacy',
    description: 'Kelimenin tarihsel gelişimini incele.', syntaxGuide: '<reading-flow></reading-flow>'
});

export const generateOfflineInfographicCompoundWord: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicCompoundWordFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Birleşik Kelime', category: 'language-literacy',
    description: 'İki farklı kelimenin birleşerek oluşturduğu yeni anlamları yarat.', syntaxGuide: '<venn-diagram></venn-diagram>'
});

export const generateOfflineInfographicGenreChart: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicGenreChartFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Metin Türleri', category: 'language-literacy',
    description: 'Metin türlerinin belirgin özelliklerini açıkla.', syntaxGuide: '<concept-map></concept-map>'
});
