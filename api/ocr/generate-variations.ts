/**
 * POST /api/ocr/generate-variations
 * OCR blueprint'inden çalışma kâğıdı varyasyonları üretir
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateVariations } from '../../src/services/ocrVariationService.js';
import type { VariantGenerationConfig, VariationRequest } from '../../src/services/ocrVariationService.js';
import type { OCRResult } from '../../src/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Inline CORS — subdirectory API'lerinde import yasak
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Yalnızca POST metodu desteklenmektedir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const { blueprint, count, userId, config } = req.body as {
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

    if (!userId) {
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
      userId,
      ...(config !== undefined && { config }),
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
