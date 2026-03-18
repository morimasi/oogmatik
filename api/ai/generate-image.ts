// @ts-ignore
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { prompt, width = 1024, height = 1024 } = body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const enhancedPrompt = `${prompt}, educational illustration, clean style, high quality, classroom setting, for children, safe`;
        const query = encodeURIComponent(enhancedPrompt);
        
        // Flux modelini kullanarak daha kaliteli görsel üretimi
        const imageUrl = `https://image.pollinations.ai/prompt/${query}?width=${width}&height=${height}&nologo=true&model=flux`;

        console.log('Generating image with prompt:', enhancedPrompt);
        return res.status(200).json({ url: imageUrl });

    } catch (error: any) {
        console.error('Image Generation Error:', error);
        return res.status(500).json({ error: 'Failed to generate image', message: error.message });
    }
}
