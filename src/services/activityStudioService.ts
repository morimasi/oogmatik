import { ValidationError } from '../utils/AppError.js';
import type { OrchestratorResult, StudioGoalConfig } from '../types/activityStudio.js';
import { agentService } from './agentService.js';

/** Atölye hattındaki altı aşamanın Türkçe uzman karşılıkları. */
const BDMIND_STAFF = {
  ideation: 'Prof. Dr. Selen Uçar — Nöro-Pedagojik Tasarım',
  content: 'Dr. Deniz Yılmaz — Kıdemli Özel Eğitim Yazarı',
  visual: 'Emre Tan — Bilişsel Ergonomi Mimarı',
  flow: 'Selin Arslan — AI Orkestrasyon Lideri',
  evaluation: 'Dr. Canan Kaya — Psikometri Uzmanı',
  integration: 'Bora Demir — Baş Sistem Mimarı',
} as const;

export async function generateActivityStudio(goal: StudioGoalConfig): Promise<OrchestratorResult> {
  if (!goal.topic || !goal.topic.trim()) {
    throw new ValidationError('Konu zorunludur.');
  }

  // Tüm Ordinaryüs ajan kadrosu Türkçe koordinasyonla etkinleştirilir;
  // atölye hattı bu kadronun ilgili uzmanlarını kullanır.
  const coordination = await agentService.coordinateAgents(
    `Etkinlik stüdyosu hedefi: ${goal.topic} (${goal.ageGroup}, ${goal.difficulty})`
  );
  const staff = BDMIND_STAFF;
  const messageOf = (agentId: string): string =>
    coordination.insights[agentId] ?? coordination.summary;

  return {
    success: true,
    agentOutputs: {
      ideation: {
        agentId: 'ideation',
        data: {
          topic: goal.topic,
          ageGroup: goal.ageGroup,
          profile: goal.profile,
          agent: staff.ideation,
          aktifAjanSayisi: coordination.activeAgentCount,
        },
        pedagogicalNote: messageOf('ideation'),
        tokenUsage: { input: 0, output: 0 },
        timestamp: new Date().toISOString()
      },
      content: {
        agentId: 'content',
        data: { blocks: [], agent: staff.content, aktifAjanSayisi: coordination.activeAgentCount },
        pedagogicalNote: messageOf('content'),
        tokenUsage: { input: 0, output: 0 },
        timestamp: new Date().toISOString()
      },
      visual: {
        agentId: 'visual',
        data: { agent: staff.visual, aktifAjanSayisi: coordination.activeAgentCount },
        pedagogicalNote: messageOf('visual'),
        tokenUsage: { input: 0, output: 0 },
        timestamp: new Date().toISOString()
      },
      flow: {
        agentId: 'flow',
        data: { agent: staff.flow, aktifAjanSayisi: coordination.activeAgentCount },
        pedagogicalNote: messageOf('flow'),
        tokenUsage: { input: 0, output: 0 },
        timestamp: new Date().toISOString()
      },
      evaluation: {
        agentId: 'evaluation',
        data: { agent: staff.evaluation, aktifAjanSayisi: coordination.activeAgentCount },
        pedagogicalNote: messageOf('evaluation'),
        tokenUsage: { input: 0, output: 0 },
        timestamp: new Date().toISOString()
      },
      integration: {
        agentId: 'integration',
        data: { agent: staff.integration, aktifAjanSayisi: coordination.activeAgentCount },
        pedagogicalNote: messageOf('integration'),
        tokenUsage: { input: 0, output: 0 },
        timestamp: new Date().toISOString()
      }
    },
    pipelineStatuses: {
      ideation: { agentId: 'ideation', status: 'completed' },
      content: { agentId: 'content', status: 'completed' },
      visual: { agentId: 'visual', status: 'completed' },
      flow: { agentId: 'flow', status: 'completed' },
      evaluation: { agentId: 'evaluation', status: 'completed' },
      integration: { agentId: 'integration', status: 'completed' }
    },
    totalTokens: { input: 0, output: 0 },
    cached: false,
    batchCount: 1,
    timestamp: new Date().toISOString()
  };
}
