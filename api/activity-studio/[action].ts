// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  activityStudioApprovalSchema,
  activityStudioDraftSchema,
  activityStudioExportSchema,
  activityStudioGenerateSchema,
} from '../../src/utils/schemas.js';
import { RateLimiter } from '../../src/services/rateLimiter.js';
import { toAppError } from '../../src/utils/AppError.js';
import { logError } from '../../src/utils/errorHandler.js';
import { corsMiddleware } from '../../src/utils/cors.js';
import { generateActivityStudio } from '../../src/services/activityStudioService.js';
import type { StudioGoalConfig } from '../../src/types/activityStudio.js';

interface ApprovalRecord {
  activityId: string;
  reviewerId: string;
  action: 'approve' | 'revise' | 'reject';
  note: string;
  timestamp: string;
}

interface DraftRecord {
  id: string;
  userId: string;
  name: string;
  payload: Record<string, unknown>;
  updatedAt: string;
}

const limiter = new RateLimiter();
const approvalStore = new Map<string, ApprovalRecord>();
const draftStore = new Map<string, DraftRecord>();

function parseBody(req: VercelRequest): unknown {
  return typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
}

function toInternalLevel(level: number): StudioGoalConfig['internalLevel'] {
  if (!Number.isInteger(level) || level < 1 || level > 10) {
    return 1;
  }

  return level as StudioGoalConfig['internalLevel'];
}

function toStudioGoal(input: ReturnType<typeof activityStudioGenerateSchema.parse>['goal']): StudioGoalConfig {
  return {
    ...input,
    internalLevel: toInternalLevel(input.internalLevel),
  };
}

async function handleGenerate(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Sadece POST kabul edilir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  const parsed = activityStudioGenerateSchema.safeParse(parseBody(req));

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: 'Geçersiz istek verisi.', code: 'VALIDATION_ERROR' },
      timestamp: new Date().toISOString(),
    });
  }

  await limiter.enforceLimit(parsed.data.userId, parsed.data.userTier, 'apiGeneration', 1);
  const result = await generateActivityStudio(toStudioGoal(parsed.data.goal));

  return res.status(200).json({
    success: true,
    data: result,
    timestamp: new Date().toISOString(),
  });
}

async function handleApprove(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Sadece POST kabul edilir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  const parsed = activityStudioApprovalSchema.safeParse(parseBody(req));

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: 'Geçersiz onay isteği.', code: 'VALIDATION_ERROR' },
      timestamp: new Date().toISOString(),
    });
  }

  const record: ApprovalRecord = {
    ...parsed.data,
    timestamp: new Date().toISOString(),
  };

  approvalStore.set(parsed.data.activityId, record);

  return res.status(200).json({
    success: true,
    data: record,
    timestamp: new Date().toISOString(),
  });
}

async function handleDraft(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : '';
    const drafts = Array.from(draftStore.values()).filter((item) => item.userId === userId);
    return res.status(200).json({ success: true, data: drafts, timestamp: new Date().toISOString() });
  }

  if (req.method === 'POST') {
    const parsed = activityStudioDraftSchema.safeParse(parseBody(req));
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Geçersiz taslak verisi.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    const id = parsed.data.id ?? `draft_${Date.now()}`;
    const record: DraftRecord = {
      id,
      userId: parsed.data.userId,
      name: parsed.data.name,
      payload: parsed.data.payload,
      updatedAt: new Date().toISOString(),
    };

    draftStore.set(id, record);
    return res.status(200).json({ success: true, data: record, timestamp: new Date().toISOString() });
  }

  if (req.method === 'PUT') {
    const parsed = activityStudioDraftSchema.safeParse(parseBody(req));
    if (!parsed.success || !parsed.data.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Güncelleme için id zorunludur.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    const existing = draftStore.get(parsed.data.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Taslak bulunamadı.', code: 'NOT_FOUND' },
        timestamp: new Date().toISOString(),
      });
    }

    const updated: DraftRecord = {
      ...existing,
      name: parsed.data.name,
      payload: parsed.data.payload,
      updatedAt: new Date().toISOString(),
    };

    draftStore.set(parsed.data.id, updated);
    return res.status(200).json({ success: true, data: updated, timestamp: new Date().toISOString() });
  }

  return res.status(405).json({
    success: false,
    error: { message: 'Desteklenmeyen metod.', code: 'METHOD_NOT_ALLOWED' },
    timestamp: new Date().toISOString(),
  });
}

async function handleExport(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Sadece POST kabul edilir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  const parsed = activityStudioExportSchema.safeParse(parseBody(req));

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: { message: 'Geçersiz export isteği.', code: 'VALIDATION_ERROR' },
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      activityId: parsed.data.activityId,
      format: parsed.data.format,
      quality: parsed.data.quality ?? 'standard',
      exportToken: `exp_${Date.now()}`,
      status: 'ready',
    },
    timestamp: new Date().toISOString(),
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (!corsMiddleware(req, res)) {
      return;
    }

    const action = typeof req.query.action === 'string' ? req.query.action : '';

    if (action === 'generate') {
      return await handleGenerate(req, res);
    }

    if (action === 'approve') {
      return await handleApprove(req, res);
    }

    if (action === 'draft') {
      return await handleDraft(req, res);
    }

    if (action === 'export') {
      return await handleExport(req, res);
    }

    return res.status(404).json({
      success: false,
      error: { message: 'Geçersiz action parametresi.', code: 'NOT_FOUND' },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const appError = toAppError(error);
    logError(appError);

    return res.status(appError.httpStatus).json({
      success: false,
      error: { message: appError.userMessage, code: appError.code },
      timestamp: new Date().toISOString(),
    });
  }
}