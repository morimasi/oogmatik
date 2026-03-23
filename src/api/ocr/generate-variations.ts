/**
 * POST /api/ocr/generate-variations
 * Blueprint → Varyasyon üretimi
 *
 * Bu endpoint blueprint'ten farklı verilerle aynı mimari yapıda varyantlar üretir.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateVariations } from '../../services/ocrVariationService.js';
import type { VariationRequest } from '../../services/ocrVariationService.js';
import { AppError, ValidationError, toAppError } from '../../utils/AppError.js';
import { logError } from '../../utils/errorHandler.js';
import { RateLimiter } from '../../services/rateLimiter.js';

const rateLimiter = new RateLimiter();

// ─── RESPONSE HELPERS ────────────────────────────────────────────────────

const sendSuccess = (res: VercelResponse, data: any) => {
  return res.status(200).json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res: VercelResponse, error: AppError) => {
  return res.status(error.httpStatus).json({
    success: false,
    error: {
      message: error.userMessage,
      code: error.code
    },
    timestamp: new Date().toISOString()
  });
};

// ─── CORS SETUP ──────────────────────────────────────────────────────────

const setCorsHeaders = (res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

// ─── REQUEST VALIDATION ──────────────────────────────────────────────────

const validateRequest = (body: any): void => {
  if (!body) {
    throw new ValidationError('İstek gövdesi boş.', { body });
  }

  if (!body.blueprint) {
    throw new ValidationError('Blueprint verisi eksik.', {
      hasBlueprint: !!body.blueprint
    });
  }

  if (!body.count || typeof body.count !== 'number') {
    throw new ValidationError('Varyasyon sayısı eksik veya geçersiz.', {
      count: body.count,
      countType: typeof body.count
    });
  }

  if (body.count < 1 || body.count > 10) {
    throw new ValidationError('Varyasyon sayısı 1-10 arasında olmalıdır.', {
      count: body.count
    });
  }

  if (!body.userId || typeof body.userId !== 'string') {
    throw new ValidationError('Kullanıcı ID eksik veya geçersiz.', {
      userId: body.userId,
      userIdType: typeof body.userId
    });
  }
};

// ─── MAIN HANDLER ────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    const error = new AppError(
      'Sadece POST metodu desteklenir.',
      'METHOD_NOT_ALLOWED',
      405
    );
    return sendError(res, error);
  }

  const startTime = Date.now();

  try {
    // ─── REQUEST VALIDATION ──────────────────────────────────────────────

    validateRequest(req.body);

    const variationRequest = req.body as VariationRequest;
    const { userId, count } = variationRequest;

    // ─── RATE LIMITING ───────────────────────────────────────────────────

    // OCR varyasyon üretimi için GENERATE limiti kullanılır
    // 10 varyasyon = 1 generation olarak sayılır (batch efficiency)
    const userTier = (req.headers['x-user-tier'] as string) || 'free';
    try {
      await rateLimiter.enforceLimit(userId, userTier as any, 'apiGeneration');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw error;
    }

    // ─── VARIATION GENERATION ────────────────────────────────────────────

    console.log(`[OCR Variation] Generating ${count} variations for user ${userId}`);

    const result = await generateVariations(variationRequest);

    const processingTime = Date.now() - startTime;

    // ─── SUCCESS RESPONSE ────────────────────────────────────────────────

    console.log(
      `[OCR Variation] Success: ${result.metadata.successfulCount}/${result.metadata.requestedCount} ` +
      `(quality: ${result.metadata.quality}, time: ${processingTime}ms)`
    );

    return sendSuccess(res, {
      ...result,
      serverProcessingTimeMs: processingTime
    });

  } catch (error: unknown) {
    // Error handling ve logging
    const appError = toAppError(error);
    const processingTime = Date.now() - startTime;

    logError(appError, {
      endpoint: '/api/ocr/generate-variations',
      method: req.method,
      userId: (req.body as any)?.userId,
      count: (req.body as any)?.count,
      processingTimeMs: processingTime
    });

    return sendError(res, appError);
  }
}
