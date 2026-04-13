// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { activityStudioExportSchema } from '../../src/utils/schemas.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Sadece POST kabul edilir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const parsed = activityStudioExportSchema.safeParse(body);

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
