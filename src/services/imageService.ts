import { AppError } from '../utils/AppError';
import { logError } from '../utils/logger.js';

export interface ImageGenerationOptions {
    prompt: string;
    provider?: 'pollinations' | 'imagen' | 'stability';
    width?: number;
    height?: number;
}

export interface ImageGenerationResponse {
    url: string;
    provider: string;
    metadata?: Record<string, unknown>;
}

class ImageService {
    private cache: Map<string, string> = new Map();

    async generateImage(options: ImageGenerationOptions): Promise<string> {
        const cacheKey = `${options.provider || 'default'}-${options.prompt}-${options.width}x${options.height}`;

        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
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
                throw new AppError(
                    'Görsel üretilemedi. Etkinlik görselsiz olarak kullanılabilir.',
                    'IMAGE_GENERATION_FAILED',
                    response.status
                );
            }

            const data = (await response.json()) as ImageGenerationResponse;
            if (!data || typeof data.url !== 'string' || data.url.length === 0) {
                throw new AppError('Görsel üretilemedi.', 'IMAGE_GENERATION_FAILED', 500);
            }

            this.cache.set(cacheKey, data.url);
            return data.url;
        } catch (error) {
            // Dış servise doğrudan bağlanmıyoruz: tarayıcıdan yapılan istekler 402/hotlink hatası veriyordu.
            // Hatayı yukarı taşıyoruz; ImageDisplay zarif SVG yer tutucusuna düşer.
            logError(error instanceof Error ? error : String(error));
            if (error instanceof AppError) throw error;
            throw new AppError('Görsel üretilemedi. Etkinlik görselsiz olarak kullanılabilir.', 'IMAGE_GENERATION_FAILED', 503);
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
