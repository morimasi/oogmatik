import { AgentOrchestrator } from './activityStudio/AgentOrchestrator.js';
import { generateWithSchema } from './geminiClient.js';
import { ValidationError } from '../utils/AppError.js';
import type { OrchestratorResult, StudioGoalConfig } from '../types/activityStudio.js';

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

  return result;
}
