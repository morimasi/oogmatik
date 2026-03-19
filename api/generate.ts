// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  AppError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  toAppError,
<<<<<<< HEAD
} from '../utils/AppError.js';
import { validateGenerateActivityRequest } from '../utils/schemas.js';
import { RateLimiter } from '../services/rateLimiter.js';
import { retryWithBackoff, logError } from '../utils/errorHandler.js';
=======
} from '../src/utils/AppError.js';
import { validateGenerateActivityRequest } from '../src/utils/schemas.js';
import { RateLimiter } from '../src/services/rateLimiter.js';
import { retryWithBackoff, logError } from '../src/utils/errorHandler.js';
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

// Fallback types for non-Vercel environments
export type VercelRequest = any;
export type VercelResponse = any;

<<<<<<< HEAD
const MASTER_MODEL = 'gemini-2.5-flash';

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun (Oogmatik) kıdemli eğitim mimarı ve pedagoji uzmanısın. [MINIMAL_DEPLOY: 2024_03_18_v4]
=======
const MASTER_MODEL = 'gemini-1.5-flash-latest';

const SYSTEM_INSTRUCTION = `
Sen, Bursa Disleksi AI platformunun (Oogmatik) kıdemli eğitim mimarı ve pedagoji uzmanısın. [Build: 20260318-v2]
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
MİSYON: 4-8. sınıf seviyesinde, MEB 2024-2025 müfredatıyla %100 uyumlu, LGS/PISA standartlarında "Premium" içerik üretmek.
PEDAGOJİK DNA:
1. Disleksi hassasiyeti: Cümleler net, yönergeler adım adım ve görselleştirilebilir olmalı.
2. Analitik Derinlik: Sadece bilgi sorma; öğrenciye çıkarım yaptır, veriyi yorumlat (LGS Mantığı).
3. Scaffolding: Zor konularda soru başında mutlaka kısa hatırlatıcı kurallar (bilgi notları) sağla.
KURAL: Yanıtın SADECE geçerli bir JSON olmalıdır. Üretimden önce içeriğin pedagojik güvenliğini ve müfredat kazanımını 10 katmanlı bir süzgeçten geçir.
`;

const rateLimiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return handleError(res, new AppError('Sadece POST kabul edilir.', 'METHOD_NOT_ALLOWED', 405));
  }

  try {
    const { prompt, schema, image, mimeType, userId, systemInstruction, model } = req.body;

    // 1. Validation
    try {
      validateGenerateActivityRequest({ prompt, schema, image, mimeType });
    } catch (error) {
      return handleError(res, toAppError(error));
    }

    // 2. Rate Limiting
    const actualUserId = userId || (req.headers['x-user-id'] as string) || 'anonymous';
    const userTier = (req.headers['x-user-tier'] as string) || 'free';
    try {
      await rateLimiter.enforceLimit(actualUserId, userTier as any, 'apiGeneration');
    } catch (error) {
      if (error instanceof RateLimitError) return handleError(res, error);
      throw error;
    }

    // 3. API Key
    const apiKey =
      process.env.VITE_GEMINI_API_KEY || process.env.VITE_GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) {
      throw new InternalServerError('API Key bulunamadı (Sunucu Yapılandırma Hatası).');
    }

    // 4. AI Call with Direct REST API (No SDK)
    const result = await retryWithBackoff(
      async () => {
<<<<<<< HEAD
        let selectedModel = model || MASTER_MODEL;
        // Eski önbelleklenmiş verilerden gelebilecek kullanım dışı modelleri engelle
        if (selectedModel.includes('gemini-2.0') || selectedModel.includes('gemini-1.5') || selectedModel.includes('gemini-3')) {
          selectedModel = MASTER_MODEL;
        }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`;
=======
        // ALWAYS use MASTER_MODEL regardless of what client sends to ensure compatibility
        const selectedModel = MASTER_MODEL;
        const url = `https://generativelanguage.googleapis.com/v1/models/${selectedModel}:generateContent?key=${apiKey}`;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

        const contents = [
          {
            role: 'user',
            parts: [] as any[],
          },
        ];

        // Image support
        if (image) {
          contents[0].parts.push({
<<<<<<< HEAD
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
=======
            inline_data: {
              mime_type: mimeType || 'image/jpeg',
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
              data: image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, ''),
            },
          });
        }

<<<<<<< HEAD
        // Insert system instruction into the user prompt to maintain AI behavior
        const combinedPrompt = `[SİSTEM TALİMATI BAŞLANGICI]\n${systemInstruction || SYSTEM_INSTRUCTION}\n[SİSTEM TALİMATI BİTİŞİ]\n\n[KULLANICI İSTEĞİ]:\n${prompt}`;

        // Text prompt
        contents[0].parts.push({ text: combinedPrompt });

        // CRITICAL: We remove generationConfig and systemInstruction COMPLETELY 
        // to ensure NO SNAKE_CASE fields are ever sent to Google API from this proxy.
        // Google will use the prompt-embedded instructions.
        const requestBody: any = {
          contents
=======
        // Text prompt
        contents[0].parts.push({ text: prompt });

        const requestBody = {
          contents,
          system_instruction: {
            parts: [{ text: systemInstruction || SYSTEM_INSTRUCTION }],
          },
          generation_config: {
            response_mime_type: 'application/json',
            response_schema: schema,
            temperature: 0.1,
            max_output_tokens: 12000,
          },
          safety_settings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          ],
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
<<<<<<< HEAD
          const errJson = await response.json().catch(() => ({}));
=======
          const errJson: any = await response.json().catch(() => ({}));
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
          throw new InternalServerError(
            `Gemini API Hatası: ${errJson.error?.message || response.statusText}`
          );
        }

<<<<<<< HEAD
        const data = await response.json();
=======
        const data: any = await response.json();
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
          throw new InternalServerError('AI yanıtı boş dönderdi.');
        }

        return { text };
      },
      { maxRetries: 2 }
    );

    // 5. Success
<<<<<<< HEAD
    res.setHeader('X-Oogmatik-Deploy', '2024-03-18-v4-MINIMAL');
=======
    res.setHeader('X-Oogmatik-Model', MASTER_MODEL);
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    return res.status(200).json(JSON.parse(result.text));
  } catch (error: any) {
    return handleError(res, toAppError(error));
  }
}

function handleError(res: VercelResponse, error: AppError) {
  logError(error);
  return res.status(error.httpStatus).json({
    error: { message: error.userMessage, code: error.code },
  });
}
