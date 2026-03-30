import { InfographicGeneratorFn } from './_shared/types';
import { createAIGenerator } from './_shared/aiFactory';
import { AppError } from '../../../utils/AppError';

// ── KAT.10: KLİNİK & BEP ŞABLONLARI (0 OFFLINE, 12 AI ONLY) ─────────────────────────

// Offline Bloklayıcı Helper
const ensureClinicalAIOnly: InfographicGeneratorFn = async (options) => {
    throw new AppError('Clinical/BEP activities REQUIRE Dr. Ahmet Kaya authorization and AI Mode.', 'UNAUTHORIZED_MODE', 403);
};

export const generateOfflineClinicalBEPGoalMap: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalBEPGoalMapFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'BEP Hedef Haritası', category: 'clinical-bep',
    description: 'BEP hedeflerini parçalara bölerek gelişimsel hiyerarşisini kur.', syntaxGuide: '<concept-map></concept-map>'
});

export const generateOfflineClinicalIEPProgress: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalIEPProgressFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'BEP İlerleme Takip', category: 'clinical-bep',
    description: 'Öğrencinin BEP hedeflerindeki ilerlemesini zamana yayarak göster.', syntaxGuide: '<timeline-view></timeline-view>'
});

export const generateOfflineClinicalObservationMatrix: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalObservationMatrixFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Klinik Gözlem Matrisi', category: 'clinical-bep',
    description: 'Anekdot gözlem boyutlarını ve tetikleyicileri (ABC model) matrise işle.', syntaxGuide: '<matrix-grid></matrix-grid>'
});

export const generateOfflineClinicalCognitiveProfile: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalCognitiveProfileFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Bilişsel Beceriler Profili', category: 'clinical-bep',
    description: 'Öğrencinin WISC-IV/PASS vb. alanlarındaki güçlü/zayıf yönlerini karşılaştır.', syntaxGuide: '<compare-chart></compare-chart>'
});

export const generateOfflineClinicalBehaviorIntervention: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalBehaviorInterventionFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Davranış Müdahale Planı', category: 'clinical-bep',
    description: 'Problemli davranış, neden, önleyici strateji ve pekiştireç akışını modelled.', syntaxGuide: '<flow-graph></flow-graph>'
});

export const generateOfflineClinicalSensoryDiet: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalSensoryDietFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Duyusal Diyet Tablosu', category: 'clinical-bep',
    description: 'Duyusal entegrasyon için gün içindeki duyusal girdi ihtiyaçlarını düzenle.', syntaxGuide: '<cycle-loop></cycle-loop>'
});

export const generateOfflineClinicalParentGuidance: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalParentGuidanceFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Veli Ev İçi Rehber', category: 'clinical-bep',
    description: 'Velilerin evde uygulayabileceği yapılandırılmış etkinlik ve yönergeleri ağlaştır.', syntaxGuide: '<mind-map></mind-map>'
});

export const generateOfflineClinicalAccommodationList: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalAccommodationListFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Sınıf İçi Uyarlamalar', category: 'clinical-bep',
    description: 'Akademik talep ile öğrencinin ihtiyacına uygun sınıf içi esneklikleri (accommodation) diz.', syntaxGuide: '<sequence-steps></sequence-steps>'
});

export const generateOfflineClinicalTransitionPlan: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalTransitionPlanFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Geçiş (Transition) Planı', category: 'clinical-bep',
    description: 'Okul öncesinden ilkokula veya ortaokula geçişteki bireysel adımları sırala.', syntaxGuide: '<reading-flow></reading-flow>'
});

export const generateOfflineClinicalSpeechTherapyTarget: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalSpeechTherapyTargetFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Dil Terapisi Hedefleri', category: 'clinical-bep',
    description: 'Artikülasyon veya alıcı/ifade edici dil hedeflerini kategorize et.', syntaxGuide: '<cluster-map></cluster-map>'
});

export const generateOfflineClinicalMotorSkills: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalMotorSkillsFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Motor Beceri Gelişimi', category: 'clinical-bep',
    description: 'İnce ve kaba motor beceri gelişim rotasını kesişimleriyle Venn şemasında tasarla.', syntaxGuide: '<venn-diagram></venn-diagram>'
});

export const generateOfflineClinicalEvaluationSummary: InfographicGeneratorFn = ensureClinicalAIOnly;
export const generateClinicalEvaluationSummaryFromAI: InfographicGeneratorFn = createAIGenerator({
    activityName: 'Değerlendirme Özeti', category: 'clinical-bep',
    description: 'Psikiyatrik ve eğitsel değerlendirme kararlarını sebep-sonuç bağlamında formüle et.', syntaxGuide: '<cause-effect></cause-effect>'
});
