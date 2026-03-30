// src/services/generators/infographic/_shared/schemaValidator.ts
import { z } from 'zod';
import { AppError } from '../../../../utils/AppError';
import { BaseInfographicResult } from '../../../../types/infographic';

/**
 * Tüm AI Infographic Generator'lar için zorunlu Zod taban şeması
 * Bu şema, generateWithSchema() çağrılarında kullanılacak ve dönen JSON'ı doğrulayacaktır.
 * ⚠️ DİKKAT: Gemini'yi bu şemaya uymaya zorlar.
 */
export const baseInfographicSchema = z.object({
    pedagogicalNote: z.string().min(50).describe("Öğretmen için pedagojik açıklama. En az 100 kelime olmalı."),
    difficultyLevel: z.enum(['Kolay', 'Orta', 'Zor']).describe("Aktivitenin zorluk derecesi."),
    targetSkills: z.array(z.string()).describe("Geliştirilecek hedef beceriler listesi."),
    ageGroup: z.enum(['5-7', '8-10', '11-13', '14+']).describe("Hedef yaş grubu."),
    profile: z.enum(['dyslexia', 'dyscalculia', 'adhd', 'mixed', 'general']).describe("Özel öğrenme profili."),
});

/**
 * AI Üretim Hatası Durumunda Merkezi Sınıflandırıcı
 */
export function handleSchemaError(error: unknown, context: string): never {
    if (error instanceof z.ZodError) {
        throw new AppError(
            `AI çıktısı şema doğrulamadan geçemedi (${context})`,
            'VALIDATION_ERROR',
            422,
            { zodErrors: error.errors }
        );
    }
    throw new AppError(`AI Üretim Hatası: ${context}`, 'GENERATION_ERROR', 500, error);
}

/**
 * Dinamik olarak kategori bazlı spesifik şemalar genişletilebilir
 */
export function buildActivitySchema<T extends z.ZodRawShape>(specificShape: T) {
    return baseInfographicSchema.extend(specificShape);
}
