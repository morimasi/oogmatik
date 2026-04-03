/**
 * POST /api/ocr/:action
 *
 * Dynamic OCR router — tek fonksiyon, Vercel Hobby plan 12-limit uyumu.
 *
 * Desteklenen aksiyonlar:
 *   analyze              — Görsel → Blueprint analizi
 *   clone-exact          — Mod 3: Birebir klonlama + içerik yenileme
 *   generate-from-prompt — Mod 2: Prompt'tan sıfırdan etkinlik üretimi
 *   generate-variations  — Blueprint → Varyasyon üretimi
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ocrService } from '../../src/services/ocrService.js';
import { validateBase64Image } from '../../src/utils/imageValidator.js';
import { exactCloneService } from '../../src/services/exactCloneService.js';
import { activityApprovalService } from '../../src/services/activityApprovalService.js';
import { promptActivityService } from '../../src/services/promptActivityService.js';
import { generateVariations } from '../../src/services/ocrVariationService.js';
import { AppError, ValidationError, toAppError } from '../../src/utils/AppError.js';
import { logError } from '../../src/utils/errorHandler.js';
import { RateLimiter } from '../../src/services/rateLimiter.js';
import type { UserTier } from '../../src/services/rateLimiter.js';
import type { ExactCloneRequest } from '../../src/types/ocr-activity.js';
import type { PromptGenerationRequest } from '../../src/types/ocr-activity.js';
import type { VariationRequest } from '../../src/services/ocrVariationService.js';

const rateLimiter = new RateLimiter();

// ─── RESPONSE HELPERS ────────────────────────────────────────────────────

const sendSuccess = (res: VercelResponse, data: unknown) => {
  return res.status(200).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};

const sendError = (res: VercelResponse, error: AppError) => {
  return res.status(error.httpStatus).json({
    success: false,
    error: {
      message: error.userMessage,
      code: error.code,
    },
    timestamp: new Date().toISOString(),
  });
};

// ─── MAIN HANDLER ────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Sadece POST metodu desteklenir.', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  const action = req.query.action as string;

  switch (action) {
    case 'analyze':
      return handleAnalyze(req, res);
    case 'clone-exact':
      return handleCloneExact(req, res);
    case 'generate-from-prompt':
      return handleGenerateFromPrompt(req, res);
    case 'generate-variations':
      return handleGenerateVariations(req, res);
    default:
      return res.status(404).json({
        success: false,
        error: { message: `Bilinmeyen OCR aksiyonu: ${action}`, code: 'NOT_FOUND' },
        timestamp: new Date().toISOString(),
      });
  }
}

// ─── ANALYZE ─────────────────────────────────────────────────────────────

async function handleAnalyze(req: VercelRequest, res: VercelResponse) {
  try {
    const { image, userId } = req.body as { image: string; userId: string };

    if (!image || typeof image !== 'string') {
      throw new ValidationError('Görsel verisi eksik veya geçersiz.', {
        imageType: typeof image,
        hasImage: !!image,
      });
    }

    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('Kullanıcı ID eksik veya geçersiz.', {
        userIdType: typeof userId,
        hasUserId: !!userId,
      });
    }

    const userTier = ((req.headers['x-user-tier'] as string) || 'free') as UserTier;
    await rateLimiter.enforceLimit(userId, userTier, 'ocrScan');

    const validation = validateBase64Image(image);
    if (!validation.valid) {
      throw new ValidationError(validation.reason || 'Görsel geçersiz.', validation.metadata);
    }

    const result = await ocrService.processImage(image);

    return sendSuccess(res, {
      ...result,
      imageValidation: {
        sizeInMB: validation.metadata?.sizeInMB,
        warnings: validation.metadata?.warnings,
      },
    });
  } catch (error: unknown) {
    const appError = toAppError(error);
    logError(appError, {
      endpoint: '/api/ocr/analyze',
      method: req.method,
      userId: (req.body as Record<string, unknown>)?.userId,
    });
    return sendError(res, appError);
  }
}

// ─── CLONE EXACT ─────────────────────────────────────────────────────────

async function handleCloneExact(req: VercelRequest, res: VercelResponse) {
  try {
    const { image, cloneMode, preserveStyle, targetProfile, ageGroup, difficulty, userId } =
      req.body as ExactCloneRequest & { userId: string };

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        success: false,
        error: { message: 'Görsel verisi eksik veya geçersiz.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Kullanıcı ID eksik.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    const validCloneModes = ['minor_variation', 'full_content_refresh'];
    if (!validCloneModes.includes(cloneMode)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Geçersiz klonlama modu.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    const template = await exactCloneService.cloneWithNewContent({
      image,
      cloneMode,
      preserveStyle: preserveStyle ?? true,
      targetProfile,
      ageGroup,
      difficulty,
    });

    const draft = await activityApprovalService.submitForReview(template, userId);

    return res.status(200).json({
      success: true,
      data: { template, draft },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata.';
    logError(toAppError(error), { endpoint: '/api/ocr/clone-exact', method: req.method });
    return res.status(500).json({
      success: false,
      error: { message, code: 'INTERNAL_ERROR' },
      timestamp: new Date().toISOString(),
    });
  }
}

// ─── GENERATE FROM PROMPT ─────────────────────────────────────────────────

async function handleGenerateFromPrompt(req: VercelRequest, res: VercelResponse) {
  try {
    const {
      prompt,
      gradeLevel,
      subject,
      difficulty,
      questionTypes,
      questionCount,
      estimatedDuration,
      includeAnswerKey,
      includeImages,
      mode,
      userId,
      profile,
    } = req.body as PromptGenerationRequest & { userId: string };

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: { message: 'Prompt en az 5 karakter olmalıdır.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Kullanıcı ID eksik.', code: 'VALIDATION_ERROR' },
        timestamp: new Date().toISOString(),
      });
    }

    let template;

    if (mode === 'fast') {
      template = await promptActivityService.quickGenerate(prompt, gradeLevel || 4);
    } else {
      template = await promptActivityService.generateFromPrompt({
        prompt,
        gradeLevel: gradeLevel || 4,
        subject: subject || 'Genel',
        difficulty: difficulty || 'Orta',
        questionTypes: questionTypes || ['fill_in_the_blank', 'multiple_choice'],
        questionCount: questionCount ?? 10,
        estimatedDuration: estimatedDuration ?? 20,
        includeAnswerKey: includeAnswerKey ?? true,
        includeImages: includeImages ?? false,
        mode: 'advanced',
        profile,
      });
    }

    const draft = await activityApprovalService.submitForReview(template, userId);

    return res.status(200).json({
      success: true,
      data: { template, draft },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata.';
    logError(toAppError(error), { endpoint: '/api/ocr/generate-from-prompt', method: req.method });
    return res.status(500).json({
      success: false,
      error: { message, code: 'INTERNAL_ERROR' },
      timestamp: new Date().toISOString(),
    });
  }
}

// ─── GENERATE VARIATIONS ─────────────────────────────────────────────────

async function handleGenerateVariations(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();

  try {
    const body = req.body as unknown;

    if (!body || typeof body !== 'object') {
      throw new ValidationError('İstek gövdesi boş.', { body });
    }

    const b = body as Record<string, unknown>;

    if (!b.blueprint) {
      throw new ValidationError('Blueprint verisi eksik.', { hasBlueprint: false });
    }

    if (!b.count || typeof b.count !== 'number') {
      throw new ValidationError('Varyasyon sayısı eksik veya geçersiz.', {
        count: b.count,
        countType: typeof b.count,
      });
    }

    if ((b.count as number) < 1 || (b.count as number) > 10) {
      throw new ValidationError('Varyasyon sayısı 1-10 arasında olmalıdır.', { count: b.count });
    }

    if (!b.userId || typeof b.userId !== 'string') {
      throw new ValidationError('Kullanıcı ID eksik veya geçersiz.', {
        userId: b.userId,
        userIdType: typeof b.userId,
      });
    }

    const variationRequest = req.body as VariationRequest;
    const { userId } = variationRequest;

    const userTier = ((req.headers['x-user-tier'] as string) || 'free') as UserTier;
    await rateLimiter.enforceLimit(userId, userTier, 'apiGeneration');

    const result = await generateVariations(variationRequest);
    const processingTime = Date.now() - startTime;

    return sendSuccess(res, { ...result, serverProcessingTimeMs: processingTime });
  } catch (error: unknown) {
    const appError = toAppError(error);
    const processingTime = Date.now() - startTime;
    logError(appError, {
      endpoint: '/api/ocr/generate-variations',
      method: req.method,
      userId: (req.body as Record<string, unknown>)?.userId,
      processingTimeMs: processingTime,
    });
    return sendError(res, appError);
  }
}
