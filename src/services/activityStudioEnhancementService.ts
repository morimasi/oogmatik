import { AppError, ValidationError } from '@/utils/AppError';
import { getLibraryActivityById } from './activityStudioLibraryService';
import { generateActivityStudio } from './activityStudioService';
import type { AgentOutput, OrchestratorResult, StudioGoalConfig } from '@/types/activityStudio';

export interface EnhancementRequest {
  activityId: string;
  topic: string;
  profile: StudioGoalConfig['profile'];
  ageGroup: StudioGoalConfig['ageGroup'];
  difficulty: StudioGoalConfig['difficulty'];
}

export interface EnhancedActivityOutput {
  libraryItemId: string;
  originalTitle: string;
  enhancedTopic: string;
  orchestratorResult: OrchestratorResult;
  pedagogicalNote: string;
  timestamp: string;
}

export async function enhanceLibraryActivity(request: EnhancementRequest): Promise<EnhancedActivityOutput> {
  const libraryItem = getLibraryActivityById(request.activityId);

  if (!libraryItem) {
    throw new ValidationError(`Etkinlik bulunamadı: ${request.activityId}`);
  }

  if (request.topic.trim().length < 3) {
    throw new ValidationError('Konu en az 3 karakter olmalidir.');
  }

  const goal: StudioGoalConfig = {
    ageGroup: request.ageGroup,
    profile: request.profile,
    difficulty: request.difficulty,
    internalLevel: 2,
    activityType: libraryItem.activityType,
    topic: request.topic.trim(),
    targetSkills: libraryItem.targetSkills,
    gradeLevel: libraryItem.suggestedGradeRange.min,
    duration: libraryItem.suggestedDuration,
    format: libraryItem.formats[0],
    participantRange: { min: 1, max: 8 },
  };

  let orchestratorResult: OrchestratorResult;

  try {
    orchestratorResult = await generateActivityStudio(goal);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError('AI gelistirme islemi basarisiz oldu.', 'AI_ENHANCEMENT_FAILED', 500, { original: err }, true);
  }

  const integrationOutput: AgentOutput = orchestratorResult.agentOutputs.integration;

  return {
    libraryItemId: libraryItem.id,
    originalTitle: libraryItem.title,
    enhancedTopic: request.topic,
    orchestratorResult,
    pedagogicalNote: integrationOutput.pedagogicalNote,
    timestamp: new Date().toISOString(),
  };
}
