import { AgentOrchestrator } from './activityStudio/AgentOrchestrator';
import { generateWithSchema } from './geminiClient';
import { AppError, ValidationError } from '../utils/AppError';
import type { OrchestratorResult, StudioGoalConfig } from '../types/activityStudio';
import { validatePedagogicRules } from '../components/ActivityStudio/validation/pedagogicValidator';
import { runClinicalValidation } from '../components/ActivityStudio/validation/clinicalValidator';

export async function generateActivityStudio(goal: StudioGoalConfig): Promise<OrchestratorResult> {
  if (!goal.topic.trim()) {
    throw new ValidationError('Konu zorunludur.');
  }

  const orchestrator = new AgentOrchestrator({}, {
    runModel: async (prompt: string) => {
      return await generateWithSchema(prompt, {
        type: 'OBJECT',
        properties: {
          blocks: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                type: { type: 'STRING' },
                content: { type: 'STRING' },

                videoUrl: { type: 'STRING' },
                imageUrl: { type: 'STRING' }
              },
              required: ['type', 'content']
            }
          }
        },
        required: ['blocks']
      });
    }
  });

  const result = await orchestrator.orchestrate(goal);


  const pedagogic = validatePedagogicRules({
    ageGroup: goal.ageGroup,
    difficulty: goal.difficulty,
    targetSkills: goal.targetSkills,
    itemDifficulties: ['Kolay', 'Kolay', goal.difficulty],
  });

  if (!pedagogic.valid) {
    throw new AppError(`Pedagojik dogrulama basarisiz: ${pedagogic.errors.join(' | ')}`, 'VALIDATION_ERROR', 400);
  }



  return result;
}
