// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';
import { corsMiddleware } from '../../src/utils/cors.js';
import { RateLimiter } from '../../src/services/rateLimiter.js';
import { RateLimitError } from '../../src/utils/AppError.js';
import { logInfo, logError, logWarn } from '../../src/utils/logger.js';

const rateLimiter = new RateLimiter();

// Görsel üretimi soğuk başlangıçta 10 sn'yi aşabildiği için fonksiyon süresi uzatılır.
export const maxDuration = 60;

const GEMINI_IMAGE_MODELS = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'] as const;
// Hugging Face eski `api-inference` host'u kapatıldı; güncel host router.huggingface.co.
const HF_CHAT_URL = 'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell';
const POLLINATIONS_HOST = 'https://image.pollinations.ai/prompt';

const REQUEST_TIMEOUT_MS = 45_000;
const MAX_PROMPT_LENGTH = 900;

interface ReferenceImage {
    data: string;
    mimeType: string;
}

interface GenerateImageBody {
    prompt?: unknown;
    width?: unknown;
    height?: unknown;
    imageBase64?: unknown;
    imageMimeType?: unknown;
}

const toPositiveInt = (value: unknown, fallback: number, min: number, max: number): number => {
    const num = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(num)) return fallback;
    return Math.min(Math.max(Math.round(num), min), max);
};

const buildPedagogicalPrompt = (prompt: string): string =>
    `A high quality educational children's book illustration of: ${prompt}. ` +
    'Clean lines, bright pastel colors, solid white background, highly legible, simple, ' +
    'easy to understand, minimal visual noise, safe for elementary school, no text in image.';

/** Gemini generateContent yanıtından base64 görseli tip güvenli biçimde çıkarır. */
const extractInlineImage = (payload: unknown): ReferenceImage | null => {
    if (!payload || typeof payload !== 'object') return null;
    const candidates = (payload as { candidates?: unknown }).candidates;
    if (!Array.isArray(candidates)) return null;

    for (const candidate of candidates) {
        if (!candidate || typeof candidate !== 'object') continue;
        const content = (candidate as { content?: unknown }).content;
        if (!content || typeof content !== 'object') continue;
        const parts = (content as { parts?: unknown }).parts;
        if (!Array.isArray(parts)) continue;

        for (const part of parts) {
            if (!part || typeof part !== 'object') continue;
            const inline = (part as { inlineData?: unknown }).inlineData;
            if (!inline || typeof inline !== 'object') continue;
            const data = (inline as { data?: unknown }).data;
            const mimeType = (inline as { mimeType?: unknown }).mimeType;
            if (typeof data === 'string' && data.length > 0) {
                return { data, mimeType: typeof mimeType === 'string' ? mimeType : 'image/png' };
            }
        }
    }
    return null;
};

/** 1. Tercih: Gemini görsel modeli (projede GEMINI_API_KEY zaten tanımlı). */
const generateWithGemini = async (
    prompt: string,
    apiKey: string,
    reference?: ReferenceImage
): Promise<string | null> => {
    for (const model of GEMINI_IMAGE_MODELS) {
        try {
            const parts: Record<string, unknown>[] = [{ text: prompt }];
            if (reference) {
                parts.push({ inlineData: { mimeType: reference.mimeType, data: reference.data } });
            }

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey,
                    },
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts }],
                        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
                    }),
                    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                logWarn('Gemini görsel modeli yanıt vermedi', { model, status: response.status, errorText: errorText.slice(0, 300) });
                continue;
            }

            const image = extractInlineImage(await response.json());
            if (image) {
                logInfo('Görsel Gemini ile üretildi', { model });
                return `data:${image.mimeType};base64,${image.data}`;
            }
            logWarn('Gemini yanıtında görsel bulunamadı', { model });
        } catch (error) {
            logWarn('Gemini görsel isteği başarısız', { model, error: error instanceof Error ? error.message : String(error) });
        }
    }
    return null;
};

/** 2. Tercih: Hugging Face FLUX (HF_API_KEY varsa). */
const generateWithHuggingFace = async (prompt: string, token: string): Promise<string | null> => {
    try {
        const response = await fetch(HF_CHAT_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: { guidance_scale: 3.5, num_inference_steps: 4 },
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logWarn('Hugging Face görsel isteği başarısız', { status: response.status, errorText: errorText.slice(0, 300) });
            return null;
        }

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength === 0) return null;
        logInfo('Görsel Hugging Face ile üretildi');
        return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
    } catch (error) {
        logWarn('Hugging Face görsel isteği çöküşü', { error: error instanceof Error ? error.message : String(error) });
        return null;
    }
};

/** 3. Tercih: Pollinations — tarayıcıya değil sunucuya çekilir, base64 olarak döner. */
const generateWithPollinations = async (prompt: string, width: number, height: number): Promise<string | null> => {
    const token = process.env.POLLINATIONS_TOKEN;
    const seed = Math.abs(prompt.split('').reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 1_000_000, 7));
    const query = new URLSearchParams({
        width: String(width),
        height: String(height),
        seed: String(seed),
        nologo: 'true',
        model: 'flux',
    });
    if (token) query.set('token', token);

    try {
        const response = await fetch(`${POLLINATIONS_HOST}/${encodeURIComponent(prompt)}?${query.toString()}`, {
            method: 'GET',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (!response.ok) {
            logWarn('Pollinations görsel isteği başarısız', { status: response.status });
            return null;
        }

        const contentType = response.headers.get('content-type') || 'image/jpeg';
        if (!contentType.startsWith('image/')) {
            logWarn('Pollinations görsel dışı yanıt döndü', { contentType });
            return null;
        }

        const buffer = await response.arrayBuffer();
        if (buffer.byteLength === 0) return null;
        logInfo('Görsel Pollinations ile üretildi');
        return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;
    } catch (error) {
        logWarn('Pollinations görsel isteği çöküşü', { error: error instanceof Error ? error.message : String(error) });
        return null;
    }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!corsMiddleware(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const userId = (req.headers['x-user-id'] as string) || 'anonymous';
        const userTier = (req.headers['x-user-tier'] as string) || 'free';
        try {
            await rateLimiter.enforceLimit(userId, userTier as 'free' | 'pro' | 'admin', 'ocrScan');
        } catch (error) {
            if (error instanceof RateLimitError) {
                return res.status(429).json({ error: { message: error.userMessage, code: error.code } });
            }
            logWarn('Rate limiter exception bypassed in generate-image', { error });
        }

        let body: GenerateImageBody = {};
        try {
            const parsed: unknown = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                body = parsed as GenerateImageBody;
            }
        } catch {
            body = {};
        }

        const rawPrompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
        if (!rawPrompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const width = toPositiveInt(body.width, 1024, 256, 1536);
        const height = toPositiveInt(body.height, 1024, 256, 1536);
        const prompt = buildPedagogicalPrompt(rawPrompt.slice(0, MAX_PROMPT_LENGTH));

        const reference: ReferenceImage | undefined =
            typeof body.imageBase64 === 'string' && body.imageBase64.length > 0
                ? {
                      data: body.imageBase64,
                      mimeType: typeof body.imageMimeType === 'string' ? body.imageMimeType : 'image/png',
                  }
                : undefined;

        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
        const hfToken = process.env.HF_API_KEY;

        const geminiResult = geminiKey ? await generateWithGemini(prompt, geminiKey, reference) : null;
        if (geminiResult) {
            return res.status(200).json({ url: geminiResult, provider: 'gemini' });
        }

        const hfResult = hfToken ? await generateWithHuggingFace(prompt, hfToken) : null;
        if (hfResult) {
            return res.status(200).json({ url: hfResult, provider: 'huggingface' });
        }

        const pollinationsResult = await generateWithPollinations(prompt, width, height);
        if (pollinationsResult) {
            return res.status(200).json({ url: pollinationsResult, provider: 'pollinations' });
        }

        logError('Tüm görsel sağlayıcıları başarısız oldu', { userId });
        return res.status(503).json({
            error: {
                message: 'Görsel şu anda üretilemedi. Etkinlik görselsiz olarak kullanılabilir.',
                code: 'IMAGE_GENERATION_UNAVAILABLE',
            },
        });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
        logError('Image Generation Error', { error: errorMessage });
        return res.status(500).json({ error: 'Failed to generate image', message: errorMessage });
    }
}
