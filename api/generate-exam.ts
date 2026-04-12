/**
 * API Endpoint: POST /api/generate-exam
 * Super Türkçe Sınav Stüdyosu - AI Sınav Üretimi
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppError } from '../src/utils/AppError.js';
import { generateExam } from '../src/services/generators/sinavGenerator.js';
import type { SinavAyarlari } from '../src/types/sinav.js';
import { corsMiddleware } from '../src/utils/cors.js';

// Rate limiting helper (inline to avoid import issues)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (
  key: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; resetTime?: number } => {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000
    });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true };
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  if (!corsMiddleware(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Rate limiting
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown';
    const userId = (req.headers['x-user-id'] as string) || clientIp;

    const ipLimit = checkRateLimit(`exam:ip:${clientIp}`, 10, 3600); // 10/saat
    const userLimit = checkRateLimit(`exam:user:${userId}`, 30, 86400); // 30/gün

    if (!ipLimit.allowed) {
      throw new AppError(
        'Saatlik sınav oluşturma limitine ulaştınız. Lütfen daha sonra tekrar deneyin.',
        'RATE_LIMIT_EXCEEDED',
        429,
        { resetTime: ipLimit.resetTime },
        true
      );
    }

    if (!userLimit.allowed) {
      throw new AppError(
        'Günlük sınav oluşturma limitine ulaştınız.',
        'RATE_LIMIT_EXCEEDED',
        429,
        { resetTime: userLimit.resetTime },
        true
      );
    }

    // Validation
    const settings: SinavAyarlari = req.body;

    if (!settings || typeof settings !== 'object') {
      throw new AppError('Geçersiz istek formatı.', 'VALIDATION_ERROR', 400, undefined, false);
    }

    // Sınav oluştur
    const sinav = await generateExam(settings);

    return res.status(200).json({
      success: true,
      data: sinav,
      timestamp: new Date().toISOString()
    });

  } catch (error: unknown) {
    console.error('Exam generation error:', error);

    if (error instanceof AppError) {
      return res.status(error.httpStatus).json({
        success: false,
        error: {
          message: error.userMessage,
          code: error.code
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Sunucu hatası oluştu.',
        code: 'INTERNAL_ERROR'
      },
      timestamp: new Date().toISOString()
    });
  }
}
