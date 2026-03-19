// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
<<<<<<< HEAD
=======
    // CORS ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
<<<<<<< HEAD
        const { prompt, provider = 'pollinations', width = 1024, height = 1024 } = req.body;
=======
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { prompt, width = 1024, height = 1024 } = body;
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

<<<<<<< HEAD
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
=======
        const enhancedPrompt = `${prompt}, educational illustration, clean style, high quality, classroom setting, for children, safe`;
        const query = encodeURIComponent(enhancedPrompt);
        
        // Flux modelini kullanarak daha kaliteli görsel üretimi
        const imageUrl = `https://image.pollinations.ai/prompt/${query}?width=${width}&height=${height}&nologo=true&model=flux`;

        console.log('Generating image with prompt:', enhancedPrompt);
        return res.status(200).json({ url: imageUrl });

>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
    } catch (error: any) {
        console.error('Image Generation Error:', error);
        return res.status(500).json({ error: 'Failed to generate image', message: error.message });
    }
}
