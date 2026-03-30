import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';

// ── KAT.8: ÖĞRENME STRATEJİLERİ (8 OFFLINE, 8 AI) ─────────────────────────

export const generateOfflineInfographicGoalSetting: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicGoalSettingFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Hedef Belirleme', category: 'learning-strategies',
    description: 'Kısa ve uzun vadeli eğitim/öğrenim hedeflerini adım adım yapılandır.', syntaxGuide: '<sequence-steps></sequence-steps>'
});

export const generateOfflineInfographicTimeManagement: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicTimeManagementFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Zaman Yönetimi', category: 'learning-strategies',
    description: 'Günlük veya haftalık çalışma planını çizelgede göster.', syntaxGuide: '<timeline-view></timeline-view>'
});

export const generateOfflineInfographicStudyPlan: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicStudyPlanFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Çalışma Planı', category: 'learning-strategies',
    description: 'Bir konuyu öğrenmek için kullanılabilecek stratejileri matris olarak planla.', syntaxGuide: '<matrix-grid></matrix-grid>'
});

export const generateOfflineInfographicEmotionGauge: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicEmotionGaugeFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Duygu Termometresi', category: 'learning-strategies',
    description: 'Ders çalışırken veya okurken hissedilen duygu durumlarını derecelendir.', syntaxGuide: '<balance-scale></balance-scale>'
});

export const generateOfflineInfographicSelfReflection: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicSelfReflectionFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Öz Değerlendirme', category: 'learning-strategies',
    description: 'Güçlü yönlerin ve geliştirilmesi gereken yönlerin analizi.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineInfographicMotivationBoard: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicMotivationBoardFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Motivasyon Panosu', category: 'learning-strategies',
    description: 'Öğrenciyi hedefine ulaşması için teşvik edecek ilham kaynaklarını kümele.', syntaxGuide: '<cluster-map></cluster-map>'
});

export const generateOfflineInfographicNoteTaking: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicNoteTakingFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Görsel Not Alma', category: 'learning-strategies',
    description: 'Karışık bir metni Cornell veya zihin haritası gibi yöntemlerle özetle.', syntaxGuide: '<concept-map></concept-map>'
});

export const generateOfflineInfographicTestPreparation: InfographicGeneratorFn = async () => ({} as any);
export const generateInfographicTestPreparationFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Sınava Hazırlık', category: 'learning-strategies',
    description: 'Sınav öncesi gözden geçirilmesi gereken stratejileri kontrol listesi olarak hazırla.', syntaxGuide: '<flow-graph></flow-graph>'
});
