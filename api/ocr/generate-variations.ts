/**
 * POST /api/ocr/generate-variations
 * OCR blueprint'inden çalışma kâğıdı varyasyonları üretir
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateVariations } from '../../src/services/ocrVariationService.js';
import type { VariantGenerationConfig, VariationRequest } from '../../src/services/ocrVariationService.js';
import type { OCRResult } from '../../src/types.js';
import { corsMiddleware } from '../../src/utils/cors.js';
import { RateLimiter } from '../../src/services/rateLimiter.js';
import { RateLimitError } from '../../src/utils/AppError.js';

const rateLimiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  if (!corsMiddleware(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Yalnızca POST metodu desteklenmektedir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    // Rate Limiting
    const userId = (req.headers['x-user-id'] as string) || 'anonymous';
    const userTier = (req.headers['x-user-tier'] as string) || 'free';
    try {
      await rateLimiter.enforceLimit(userId, userTier as 'free' | 'pro' | 'admin', 'ocrScan');
    } catch (error) {
      if (error instanceof RateLimitError) {
        return res.status(429).json({
          success: false,
          error: { message: error.userMessage, code: error.code },
          timestamp: new Date().toISOString(),
        });
      }
      throw error;
    }

    const { blueprint, count, userId: requestUserId, config } = req.body as {
      blueprint: OCRResult;
      count: number;
      userId: string;
      config?: VariantGenerationConfig;
    };

    // Validasyon
    if (!blueprint) {
      return res.status(400).json({
        success: false,
        error: { message: 'blueprint alanı zorunludur.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    if (!requestUserId) {
      return res.status(400).json({
        success: false,
        error: { message: 'userId alanı zorunludur.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    const parsedCount = Number(count);
    if (!count || parsedCount < 1 || parsedCount > 10) {
      return res.status(400).json({
        success: false,
        error: { message: 'count 1 ile 10 arasında olmalıdır.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    const request: VariationRequest = {
      blueprint,
      count: parsedCount,
      userId: requestUserId,
      ...(config && { config }),
    };

    const result = await generateVariations(request);

    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const error = err as { message?: string; code?: string; httpStatus?: number };
    const status = typeof error.httpStatus === 'number' ? error.httpStatus : 500;
    const message = error.message ?? 'Varyasyon üretimi sırasında bir hata oluştu.';
    const code = error.code ?? 'INTERNAL_SERVER_ERROR';

    return res.status(status).json({
      success: false,
      error: { message, code },
      timestamp: new Date().toISOString(),
    });
  }
}
