// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { activityStudioApprovalSchema } from '../../src/utils/schemas.js';

interface ApprovalRecord {
  activityId: string;
  reviewerId: string;
  action: 'approve' | 'revise' | 'reject';
  note: string;
  timestamp: string;
}

const store = new Map<string, ApprovalRecord>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Sadece POST kabul edilir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const parsed = activityStudioApprovalSchema.safeParse(body);

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

  store.set(parsed.data.activityId, record);

  return res.status(200).json({
    success: true,
    data: record,
    timestamp: new Date().toISOString(),
  });
}
