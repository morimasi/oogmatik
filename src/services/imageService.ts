import { AppError } from '../utils/AppError';
import { logInfo, logError, logWarn } from '../utils/logger.js';
export interface ImageGenerationOptions {
    prompt: string;
    provider?: 'pollinations' | 'imagen' | 'stability';
    width?: number;
    height?: number;
}

export interface ImageGenerationResponse {
    url: string;
    provider: string;
    metadata?: any;
}

class ImageService {
    private cache: Map<string, string> = new Map();

    async generateImage(options: ImageGenerationOptions): Promise<string> {
        const cacheKey = `${options.provider || 'default'}-${options.prompt}-${options.width}x${options.height}`;

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        try {
            const response = await fetch('/api/ai/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(options),
            });

            if (!response.ok) {
                throw new AppError('Görsel üretilemedi', 'INTERNAL_ERROR', 500);
            }

            const data: ImageGenerationResponse = await response.json();
            this.cache.set(cacheKey, data.url);
            return data.url;
        } catch (error) {
            logError('ImageService Error:', error);
            // Fallback to direct Pollinations URL if API fails
            const seed = Math.floor(Math.random() * 1000000);
            const query = encodeURIComponent(options.prompt);
            return `https://image.pollinations.ai/prompt/${query}?width=${options.width || 1024}&height=${options.height || 1024}&nologo=true&seed=${seed}`;
        }
    }

    // Özel pedagojik prompt temizleyici
    sanitizePrompt(prompt: string): string {
        return prompt
            .replace(/[^\w\s\u00C0-\u017F]/gi, '') // Özel karakterleri temizle
            .trim();
    }
}

export const imageService = new ImageService();
