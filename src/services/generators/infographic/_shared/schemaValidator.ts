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
            { zodErrors: (error as any).errors }
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

/**
 * AI Üretimi için Kullanılacak Ana Şema (Faz 3 entegrasyonu)
 * Bu şema, `geminiClient` içindeki `generateWithSchema` fonksiyonuna geçirilecek standart tiptir.
 */
export const INFOGRAPHIC_ACTIVITY_SCHEMA = z.object({
    title: z.string().describe("Aktivitenin başlığı"),
    syntax: z.string().describe("InfographicRenderer için declarative syntax (örn: <concept-map>...</)"),
    templateType: z.string().describe("Kullanılacak UI şablonu (örn: sequence-steps, activity-venn)"),
    estimatedDuration: z.number().describe("Tahmini tamamlama süresi (dakika)"),
    mebKazanim: z.string().optional().describe("Eğer uygunsa MEB kazanım kodu"),
    spldNote: z.string().optional().describe("Varsa SpLD-özel ekstra pedagojik not"),
    // activityContent dinamik olarak kategoriye özgü genişletilir
    activityContent: z.record(z.string(), z.any()).describe("Aktivite içerik objesi (sorular, adımlar vb.)"),
}).merge(baseInfographicSchema);
