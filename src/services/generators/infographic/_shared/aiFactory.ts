import { AppError } from '../../../../utils/AppError';
import { generateCreativeMultimodal } from '../../../geminiClient';
import { handleSchemaError, INFOGRAPHIC_ACTIVITY_SCHEMA } from './schemaValidator';
import { InfographicActivityResult } from '../../../../types/infographic';
import { GenerateParams, InfographicGeneratorFn } from './types';

interface AIFactoryOptions {
    activityName: string;
    category: string;
    description: string;
    syntaxGuide: string;
}

/**
 * Tüm yapay zeka jeneratör modüllerini standart bir prompt ve error handling ile sarmalayan Factory.
 * @param factoryOps Aktivitenin adı, açıklaması ve syntax rehberi.
 * @returns InfographicGeneratorFn async fonsiyonu.
 */
export const createAIGenerator = (factoryOps: AIFactoryOptions): InfographicGeneratorFn => {
    return async (options: any): Promise<InfographicActivityResult> => {
        if (options.mode === 'fast') {
            throw new AppError('Fast mode triggered AI fn', 'ROUTING_ERROR', 500);
        }

        const prompt = `
Oogmatik İnfografik Stüdyosu v3 (Bilişsel Beceri Geliştirme Platformu)
Aktivite: ${factoryOps.activityName}
Kategori: ${factoryOps.category}
Konu: ${options.topic || 'Genel Konu'}
Yaş Grubu: ${options.ageGroup}
Özel Eğitim Profili: ${options.profile}
Zorluk Seviyesi: ${options.difficulty}

Aktivite Açıklaması: ${factoryOps.description}

Lütfen bu konuyu pedagojik olarak çocuğun anlayacağı şekilde, aşağıda belirtilen kesin JSON şemasına uygun bir yanıt oluştur.
- Aktivite için şu InfographicRenderer declarative syntax'ını kullan: ${factoryOps.syntaxGuide}
- "pedagogicalNote" alanında öğretmen için en az 100 kelimelik, çocuğun yaşına ve SpLD profiline (${options.profile}) uygun bir rehberlik notu yaz. Disleksi veya DEHB ise nasıl uygulanmalı mutlaka vurgula.
`;

        try {
            const rawResult = await generateCreativeMultimodal({
                prompt,
                schema: INFOGRAPHIC_ACTIVITY_SCHEMA,
                temperature: 0.7,
                systemInstruction: "Sen Oogmatik platformunun baş pedagojik içerik mimarısın. Çıktıların özel öğrenme güçlükleri olan öğrencileri merkeze almalı."
            });

            const validatedResult = INFOGRAPHIC_ACTIVITY_SCHEMA.parse(rawResult);

            return {
                ...validatedResult,
                category: factoryOps.category,
                generationMode: 'ai',
            } as InfographicActivityResult;

        } catch (error) {
            return handleSchemaError(error, `${factoryOps.activityName} AI Schema Validation Failed`);
        }
    };
};
