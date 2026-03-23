/**
 * POST /api/ocr/analyze
 * Görsel → Blueprint analizi
 *
 * Bu endpoint yüklenen görseli analiz ederek mimari blueprint çıkarır.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ocrService } from '../../services/ocrService.js';
import { validateBase64Image } from '../../utils/imageValidator.js';
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

  try {
    const { image, userId } = req.body as { image: string; userId: string };

    // ─── INPUT VALIDATION ────────────────────────────────────────────────

    if (!image || typeof image !== 'string') {
      throw new ValidationError('Görsel verisi eksik veya geçersiz.', {
        imageType: typeof image,
        hasImage: !!image
      });
    }

    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Kullanıcı ID eksik veya geçersiz.', {
        userIdType: typeof userId,
        hasUserId: !!userId
      });
    }

    // ─── RATE LIMITING ───────────────────────────────────────────────────

    const userTier = (req.headers['x-user-tier'] as string) || 'free';
    try {
      await rateLimiter.enforceLimit(userId, userTier as any, 'ocrScan');
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw error;
    }

    // ─── IMAGE VALIDATION ────────────────────────────────────────────────

    const validation = validateBase64Image(image);
    if (!validation.valid) {
      throw new ValidationError(
        validation.reason || 'Görsel geçersiz.',
        validation.metadata
      );
    }

    // Warnings varsa loglayalım
    if (validation.metadata?.warnings && validation.metadata.warnings.length > 0) {
      console.log('[OCR Analyze] Image warnings:', validation.metadata.warnings);
    }

    // ─── OCR PROCESSING ──────────────────────────────────────────────────

    const result = await ocrService.processImage(image);

    // ─── SUCCESS RESPONSE ────────────────────────────────────────────────

    return sendSuccess(res, {
      ...result,
      imageValidation: {
        sizeInMB: validation.metadata?.sizeInMB,
        warnings: validation.metadata?.warnings
      }
    });

  } catch (error: unknown) {
    // Error handling ve logging
    const appError = toAppError(error);
    logError(appError, {
      endpoint: '/api/ocr/analyze',
      method: req.method,
      userId: (req.body as any)?.userId
    });

    return sendError(res, appError);
  }
}
