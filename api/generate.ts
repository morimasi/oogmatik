// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';
import {
  AppError,
  ValidationError,
  RateLimitError,
  TimeoutError,
  InternalServerError,
  toAppError,
} from '../utils/AppError';
import { validateGenerateActivityRequest } from '../utils/schemas';
import { RateLimiter } from '../services/rateLimiter';
import { retryWithBackoff, logError } from '../utils/errorHandler';

// Fallback types for non-Vercel environments
export type VercelRequest = any;
export type VercelResponse = any;

const MASTER_MODEL = 'gemini-2.0-flash';

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun yapay zeka motorusun.
MODEL: Gemini 3 Flash (High-Speed & Cost-Efficient).
Görevin: Klinik hassasiyetle eğitim materyali üretmek.
KURAL: Yanıtın SADECE geçerli bir JSON olmalıdır. Üretimden önce mimari DNA'yı ve pedagojik hedefleri derinlemesine düşün.
`;

// Rate limiter instance (in-memory for Vercel Functions)
// Note: For production, use Redis for distributed rate limiting
const rateLimiter = new RateLimiter();

/**
 * Enhanced API endpoint with validation, rate limiting, and error handling
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return handleError(
      res,
      new AppError('Bu endpoint sadece POST isteklerini kabul eder.', 'METHOD_NOT_ALLOWED', 405)
    );
  }

  try {
    // Extract request body
    const { prompt, schema, image, mimeType, useSearch, userId, systemInstruction, model } =
      req.body;

    // ===== 1. INPUT VALIDATION =====
    try {
      validateGenerateActivityRequest({ prompt, schema, image, mimeType, useSearch });
    } catch (error) {
      const appError = toAppError(error);
      return handleError(res, appError);
    }

    // ===== 2. RATE LIMITING =====
    const userTier = (req.headers['x-user-tier'] as string) || 'free';
    const actualUserId = userId || (req.headers['x-user-id'] as string) || 'anonymous';

    try {
      await rateLimiter.enforceLimit(
        actualUserId,
        userTier as 'free' | 'pro' | 'admin',
        'apiGeneration'
      );
    } catch (error) {
      if (error instanceof RateLimitError) {
        res.setHeader('Retry-After', '60');
        return handleError(res, error);
      }
      throw error;
    }

    // ===== 3. AUTHENTICATE API KEY =====
    // Vercel dashboard'da tanımlanan her iki varyasyonu da kontrol et
    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.VITE_GOOGLE_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      const error = new InternalServerError(
        'Sunucu konfigürasyonu eksik (API Key bulunamadı). Lütfen Vercel dashboard üzerinden VITE_GEMINI_API_KEY tanımlayın.'
      );
      logError(error, { context: 'API Configuration Missing' });
      return handleError(res, error);
    }

    // ===== 4. CALL AI WITH RETRY LOGIC =====
    const selectedModel = model || MASTER_MODEL;
    const selectedInstruction = systemInstruction || SYSTEM_INSTRUCTION;

    const result = await retryWithBackoff(
      async () =>
        callGeminiAPI(
          apiKey,
          prompt,
          schema,
          image,
          mimeType,
          useSearch,
          selectedInstruction,
          selectedModel
        ),
      {
        maxRetries: 3,
        initialDelay: 1000,
        shouldRetry: (err: any) => {
          const appErr = toAppError(err);
          return appErr.isRetryable;
        },
      }
    );

    // ===== 5. VALIDATE AI RESPONSE =====
    if (!result || !result.text) {
      throw new InternalServerError('Yapay zeka yanıt üretemedi.');
    }

    let cleanedText = result.text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    cleanedText = cleanedText
      .replace(/^```json[\s\S]*?\n/, '')
      .replace(/^```\s*/m, '')
      .replace(/```\s*$/m, '')
      .trim();

    const firstBrace = cleanedText.indexOf('{');
    const firstBracket = cleanedText.indexOf('[');
    let startIndex = -1;
    if (firstBrace !== -1 && firstBracket !== -1) startIndex = Math.min(firstBrace, firstBracket);
    else if (firstBrace !== -1) startIndex = firstBrace;
    else if (firstBracket !== -1) startIndex = firstBracket;
    if (startIndex > 0) cleanedText = cleanedText.substring(startIndex);

    let parsedData;
    try {
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      // Fallback for missing closing braces/brackets if simple parse fails
      // It will be sent as a string if we really can't parse it, but let's try our best to send JSON
      // If we can't parse, we'll just send the string and let the client throw or handle
      throw new InternalServerError(
        'Yapay zeka geçerli bir JSON döndürmedi: ' + cleanedText.substring(0, 100)
      );
    }

    // ===== 6. SEND SUCCESSFUL RESPONSE =====
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    return res.status(200).json(parsedData);
  } catch (error: any) {
    const appError = toAppError(error);
    logError(appError, {
      context: 'API Handler Unhandled Error',
      path: req.url,
      method: req.method,
    });
    return handleError(res, appError);
  }
}

/**
 * Call Gemini API with full configuration
 */
async function callGeminiAPI(
  apiKey: string,
  prompt: string,
  schema: Record<string, any>,
  image: string | undefined,
  mimeType: string | undefined,
  useSearch: boolean,
  systemInstruction?: string,
  model?: string
): Promise<any> {
  try {
    const ai = new GoogleGenAI({ apiKey });

    const config: any = {
      systemInstruction: systemInstruction || SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: schema,
      temperature: 0.1,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
        },
      ],
      maxOutputTokens: 12000,
      thinkingConfig: { thinkingBudget: 4000 },
    };

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    let parts: any[] = [];

    // Add image if provided
    if (image) {
      if (!mimeType || !['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(mimeType)) {
        throw new ValidationError('Geçersiz resim formatı. JPEG, PNG, GIF veya WebP kullanınız.');
      }

      parts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''),
        },
      });
    }

    parts.push({ text: prompt });

    const result = await Promise.race([
      ai.models.generateContent({
        model: model || MASTER_MODEL,
        contents: { parts },
        config: config,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new TimeoutError('AI Yanıt', 60000)), 60000)
      ),
    ]);

    return result;
  } catch (error: any) {
    // Handle specific Gemini API errors
    if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new AppError(
        'API kullanım limitine ulaşıldı. Lütfen daha sonra tekrar deneyiniz.',
        'API_QUOTA_EXCEEDED',
        429,
        undefined,
        true
      );
    }
    throw error;
  }
}

/**
 * Standardized error response handler
 */
function handleError(res: VercelResponse, error: AppError | Error): VercelResponse {
  const appError = error instanceof AppError ? error : toAppError(error);

  // Log error for monitoring
  logError(appError, { context: 'API Response Error' });

  // Send error response
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  return res.status(appError.httpStatus).json({
    error: {
      message: appError.userMessage,
      code: appError.code,
      retryable: appError.isRetryable,
      timestamp: new Date().toISOString(),
    },
  });
}
