import { InfographicGeneratorFn } from './_shared/types';
import { AppError } from '../../../utils/AppError';

// ── KAT.10: KLİNİK & BEP (12 AI ONLY) ─────────────────────────
// ⚠️ Dr. Ahmet Kaya Onayı Zorunlu
// Bu kategoride offline üretim yoktur, tümü yapay zeka tarafından üretilir.

const blockOfflineCall = async () => {
    throw new AppError('Klinik/BEP aktiviteleri offline üretilemez', 'UNAUTHORIZED_MODE', 403);
};

export const generateOfflineInfographicBEPGoalMap: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicBEPGoalMapFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicAssessmentVisual: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicAssessmentVisualFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicProgressReport: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicProgressReportFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicSkillRadar: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicSkillRadarFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicInterventionPlan: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicInterventionPlanFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicLearningProfile: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicLearningProfileFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicParentGuide: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicParentGuideFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicTransitionPlan: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicTransitionPlanFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicStrengthsNeeds: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicStrengthsNeedsFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicAnnualReview: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicAnnualReviewFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicCollaborationMap: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicCollaborationMapFromAI: InfographicGeneratorFn = async () => ({} as any);

export const generateOfflineInfographicAccommodationGuide: InfographicGeneratorFn = blockOfflineCall;
export const generateInfographicAccommodationGuideFromAI: InfographicGeneratorFn = async () => ({} as any);
