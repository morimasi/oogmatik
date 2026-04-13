// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { activityStudioDraftSchema } from '../../src/utils/schemas.js';

interface DraftRecord {
  id: string;
  userId: string;
  name: string;
  payload: Record<string, unknown>;
  updatedAt: string;
}

const draftStore = new Map<string, DraftRecord>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (req.method === 'GET') {
    const userId = typeof req.query.userId === 'string' ? req.query.userId : '';
    const drafts = Array.from(draftStore.values()).filter((item) => item.userId === userId);
    return res.status(200).json({ success: true, data: drafts, timestamp: new Date().toISOString() });
  }

  if (req.method === 'POST') {
    const parsed = activityStudioDraftSchema.safeParse(body);
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
    const parsed = activityStudioDraftSchema.safeParse(body);
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
