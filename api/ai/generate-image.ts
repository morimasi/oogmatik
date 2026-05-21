// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Buffer } from 'buffer';
import { corsMiddleware } from '../../src/utils/cors.js';

import { logInfo, logError, logWarn } from '../../src/utils/logger.js';
// Hugging Face API Ayarları
const HF_API_URL = 'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Validation
    if (!corsMiddleware(req, res)) return;

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { prompt, provider = 'pollinations', width = 1024, height = 1024 } = body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // 1. ADIM: HUGGING FACE INFERENCE API (Ana Motor)
        // Vercel Environment Variables'dan HF_API_KEY çekiyoruz. 
        // Eğer girilmemişse otomatik olarak ücretsiz ve sınırsız olan Pollinations fallback'e geçecek.
        const hfToken = process.env.HF_API_KEY;

        if (hfToken) {
            logInfo('Hugging Face aktif. Model: FLUX.1-schnell');

            // Disleksi dostu görsel yapısı
            const hfPrompt = `A high quality educational children's book illustration of: ${prompt}. Clean lines, bright pastel colors, solid white background, highly legible, simple, easy to understand, no confusing patterns.`;

            const response = await fetch(HF_API_URL, {
                headers: {
                    Authorization: `Bearer ${hfToken}`,
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    inputs: hfPrompt,
                    parameters: {
                        guidance_scale: 3.5,
                        num_inference_steps: 4,
                    }
                }),
            });

            if (response.ok) {
                const imageBuffer = await response.arrayBuffer();
                const base64Image = Buffer.from(imageBuffer).toString('base64');
                const dataUrl = `data:image/jpeg;base64,${base64Image}`;

                return res.status(200).json({
                    url: dataUrl,
                    provider: 'huggingface'
                });
            } else {
                const errorText = await response.text();
                logWarn('Hugging Face Hatası, Fallback(Pollinations) kullanılıyor', { status: response.status, errorText });
                // Hata alırsak (örn: model uykuda - 503), akışı durdurmuyor, fallback'e (Pollinations) geçiyoruz!
            }
        }

        // 2. ADIM: POLLINATIONS.AI (Fallback / Ücretsiz Motor)
        logInfo('Pollinations.ai Fallback kullanılıyor.');
        const enhancedPrompt = `${prompt}, educational illustration, clean style, high contrast, minimalist, white background, for children, safe for elementary school`;
        const query = encodeURIComponent(enhancedPrompt);
        // Doğrudan URL yerine resim üreten Flux URL'sini oluşturuyoruz
        const imageUrl = `https://image.pollinations.ai/prompt/${query}?width=${width}&height=${height}&nologo=true&model=flux`;

        return res.status(200).json({
            url: imageUrl,
            provider: 'pollinations',
            metadata: { enhancedPrompt }
        });

    } catch (error: any) {
        logError('Image Generation Error', { error });
        return res.status(500).json({ error: 'Failed to generate image', message: error.message });
    }
}
