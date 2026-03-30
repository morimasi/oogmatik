import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';

// ── KAT.9: SPLD DESTEK YAPILARI (10 OFFLINE, 10 AI) ─────────────────────────

export const generateOfflineInfographicDyslexiaReading: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicDyslexiaReadingFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Disleksi Okuma Rehberi', category: 'spld-support',
    description: 'B/D, P/Q gibi karıştırılan harfleri ayırt etme stratejilerini görselleştir.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineInfographicDysgraphiaWriting: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicDysgraphiaWritingFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Disgrafi Yazma Kılavuzu', category: 'spld-support',
    description: 'Harflerin doğru yazım yönlerini (stroke order) büyük ve aralıklı göster.', syntaxGuide: '<sequence-steps></sequence-steps>'
});

export const generateOfflineInfographicDyscalculiaMath: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicDyscalculiaMathFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Diskalkuli Matematik Ağı', category: 'spld-support',
    description: 'Sayı sembolleri ile nicelik (miktar) ilişkisini somutlaştır (örn. 3 = üç nokta).', syntaxGuide: '<concept-map></concept-map>'
});

export const generateOfflineInfographicADHDFocus: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicADHDFocusFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'DEHB Odak Panosu', category: 'spld-support',
    description: 'Görevleri "Şimdi Yap", "Sonra Yap" şeklinde küçük ve yönetilebilir parçalara böl.', syntaxGuide: '<matrix-grid></matrix-grid>'
});

export const generateOfflineInfographicExecutiveFunction: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicExecutiveFunctionFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Yürütücü İşlev Şeması', category: 'spld-support',
    description: 'Başlama, planlama, organize olma ve bitirme döngüsünü akış şemasında çiz.', syntaxGuide: '<flow-graph></flow-graph>'
});

export const generateOfflineInfographicSensoryIntegration: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicSensoryIntegrationFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Duyusal Bütünleme', category: 'spld-support',
    description: 'Farklı duyulara (görme, işitme, dokunma) hitap eden öğrenme stratejilerini birleştir.', syntaxGuide: '<venn-diagram></venn-diagram>'
});

export const generateOfflineInfographicAnxietyRelief: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicAnxietyReliefFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Sınav Kaygısı Çözüm Ağı', category: 'spld-support',
    description: 'Kaygı anında yapılabilecek nefes ve rahatlama egzersizlerini adım adım listele.', syntaxGuide: '<sequence-steps></sequence-steps>'
});

export const generateOfflineInfographicSocialSkills: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicSocialSkillsFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Sosyal Beceri Tablosu', category: 'spld-support',
    description: 'İletişimde olumlu ve olumsuz kelimeleri/davranışları karşılaştır.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineInfographicRoutineBuilder: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicRoutineBuilderFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Rutin Oluşturucu', category: 'spld-support',
    description: 'Sabah, okul ve akşam rutinlerini döngüsel bir çizelgede göster.', syntaxGuide: '<cycle-loop></cycle-loop>'
});

export const generateOfflineInfographicBehaviorTracker: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicBehaviorTrackerFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Davranış Takip Matrisi', category: 'spld-support',
    description: 'İstenen davranışların pekiştirilmesi için yıldız tablosu formatı hazırla.', syntaxGuide: '<matrix-grid></matrix-grid>'
});
