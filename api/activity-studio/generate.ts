// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { activityStudioGenerateSchema } from '../../src/utils/schemas.js';
import { RateLimiter } from '../../src/services/rateLimiter.js';
import { toAppError } from '../../src/utils/AppError.js';
import { logError } from '../../src/utils/errorHandler.js';
import { generateActivityStudio } from '../../src/services/activityStudioService.js';

const limiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Sadece POST kabul edilir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const parsed = activityStudioGenerateSchema.safeParse(body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { message: 'Geçersiz istek verisi.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    await limiter.enforceLimit(parsed.data.userId, parsed.data.userTier, 'apiGeneration', 1);
    const result = await generateActivityStudio(parsed.data.goal);

    return res.status(200).json({
      success: true,
      data: result,
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
