// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { prompt, provider = 'pollinations', width = 1024, height = 1024 } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Pedagojik görsel optimizasyonu
        const enhancedPrompt = `${prompt}, educational illustration, clean style, high contrast, minimalist, white background, for children, safe for elementary school`;

        if (provider === 'pollinations') {
            const seed = Math.floor(Math.random() * 1000000);
            const query = encodeURIComponent(enhancedPrompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${query}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

            return res.status(200).json({
                url: imageUrl,
                provider: 'pollinations',
                metadata: { seed, enhancedPrompt }
            });
        }

        // TODO: Imagen 3 veya Stability.ai entegrasyonu (API KEY gerektirir)
        // if (provider === 'imagen') { ... }

        return res.status(400).json({ error: 'Invalid provider' });
    } catch (error: any) {
        console.error('Image Generation Error:', error);
        return res.status(500).json({ error: 'Failed to generate image', message: error.message });
    }
}
