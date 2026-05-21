/**
 * Sarı Kitap AI İçerik Üretim Endpoint'i
 * POST /api/sari-kitap/generate
 * 
 * Pipeline: CORS → Rate Limit → Zod Validation → Gemini 2.5 Flash → JSON Repair → Response
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MASTER_MODEL = 'gemini-2.5-flash';

// ─── CORS Headers ────────────────────────────────────────────────
function setCorsHeaders(res: VercelResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Consider restricting this later
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

import { RateLimiter } from '../../src/services/rateLimiter.js';
const rateLimiter = new RateLimiter();


// ─── JSON Repair ────────────────────────────────────────────────
function repairJSON(raw: string): string {
    let cleaned = raw.trim();
    // Remove markdown code fences
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    // Balance braces
    const opens = (cleaned.match(/{/g) ?? []).length;
    const closes = (cleaned.match(/}/g) ?? []).length;
    if (opens > closes) {
        cleaned += '}'.repeat(opens - closes);
    }
    return cleaned;
}

// ─── Validate Config (basic, not using zod here to keep API lightweight) ──
function validateConfig(body: Record<string, unknown>): { valid: boolean; error?: string } {
    if (!body.config || typeof body.config !== 'object') {
        return { valid: false, error: 'config alanı zorunludur' };
    }
    const config = body.config as Record<string, unknown>;
    const validTypes = ['pencere', 'nokta', 'kopru', 'cift_metin', 'bellek', 'hizli_okuma'];
    if (!validTypes.includes(config.type as string)) {
        return { valid: false, error: `Geçersiz tip: ${config.type}` };
    }
    return { valid: true };
}

// ─── Prompt Security Check ──────────────────────────────────────
function validatePromptSecurity(text: string): boolean {
    const blockedPatterns = [
        /ignore\s+(all\s+)?previous\s+instructions/i,
        /system\s+prompt/i,
        /forget\s+everything/i,
        /you\s+are\s+now/i,
        /act\s+as\s+(?:if|a)\s/i,
    ];
    return !blockedPatterns.some((p) => p.test(text));
}

// ─── Build Gemini Prompt ────────────────────────────────────────
function buildPrompt(config: Record<string, unknown>): string {
    const type = config.type as string;
    const ageGroup = config.ageGroup ?? '8-10';
    const difficulty = config.difficulty ?? 'Orta';
    const topics = (config.topics as string[])?.join(', ') ?? 'Doğa';

    return `Sen bir özel eğitim materyali üreticisisin. Sarı Kitap formatında "${type}" tipinde bir okuma etkinliği oluştur.

Hedef Kitle: ${ageGroup} yaş grubu
Zorluk: ${difficulty}
Konular: ${topics}

Yanıtını JSON formatında döndür:
{
  "title": "Etkinlik başlığı",
  "rawText": "Tam metin içeriği",
  "pedagogicalNote": "Öğretmene yönelik pedagojik açıklama",
  "instructions": "Öğrenciye yönelik talimat",
  "targetSkills": ["beceri1", "beceri2"]
}

Kurallar:
- Metin yaş grubuna uygun olmalı
- Türkçe dil bilgisi kurallarına uymalı
- Disleksi desteğine uygun, kısa cümleler kullan
- pedagogicalNote MUTLAKA olmalı
- rawText en az 3 paragraf olmalı`;
}

// ─── Main Handler ───────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
    setCorsHeaders(res);

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ success: false, error: { message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' } });
        return;
    }

    // Rate limit check
    const body = req.body as Record<string, unknown> | null;
    const userId = body?.userId ? String(body.userId) : 'anonymous';

    const rateLimitResult = await rateLimiter.checkLimit(userId, 'free', 'apiGeneration');
    if (!rateLimitResult.allowed) {
        res.status(429).json({
            success: false,
            error: { 
                message: `Hız sınırı aşıldı. Lütfen ${Math.ceil(rateLimitResult.resetAfterMs / 1000)} saniye bekleyin.`, 
                code: 'RATE_LIMIT_EXCEEDED' 
            },
            timestamp: new Date().toISOString(),
        });
        return;
    }

    try {
        if (!body) {
            res.status(400).json({
                success: false,
                error: { message: 'Boş istek kabul edilemez.', code: 'BAD_REQUEST' },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Validate config
        const validation = validateConfig(body);
        if (!validation.valid) {
            res.status(400).json({
                success: false,
                error: { message: validation.error, code: 'VALIDATION_ERROR' },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const config = body.config as Record<string, unknown>;

        // Security check
        const prompt = buildPrompt(config);
        if (!validatePromptSecurity(prompt)) {
            res.status(400).json({
                success: false,
                error: { message: 'Güvenlik doğrulaması başarısız.', code: 'SECURITY_VIOLATION' },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        // Call Gemini API
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            res.status(500).json({
                success: false,
                error: { message: 'API anahtarı yapılandırılmamış.', code: 'CONFIG_ERROR' },
                timestamp: new Date().toISOString(),
            });
            return;
        }

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.9,
                        maxOutputTokens: 4096,
                        responseMimeType: 'application/json',
                    },
                }),
            }
        );

        if (!geminiResponse.ok) {
            const errorText = await geminiResponse.text();
            throw new Error(`Gemini API hatası: ${geminiResponse.status} — ${errorText.slice(0, 200)}`);
        }

        const geminiData = await geminiResponse.json();
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        if (!rawText) {
            throw new Error('Gemini boş yanıt döndü.');
        }

        // Repair and parse JSON
        const repairedJSON = repairJSON(rawText);
        const parsed = JSON.parse(repairedJSON);

        res.status(200).json({
            success: true,
            data: parsed,
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata oluştu';
        res.status(500).json({
            success: false,
            error: { message, code: 'GENERATION_ERROR' },
            timestamp: new Date().toISOString(),
        });
    }
}
