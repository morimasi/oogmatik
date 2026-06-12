/**
 * BursaDisleksi Hızlı Okuma AI Engine
 * Gemini 2.5 Flash üzerinden AI içerik üretimi + JSON repair + hece post-processing
 * Sadece AI mod - Benzersiz içerik üretimi
 */
import type { SariKitapConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getPromptBuilder } from './shared';
import { metniHecele, metniKelimele } from '../../../utils/heceAyirici';
import { generateWithSchema } from '../../geminiClient';

interface GenerateOptions {
    config: SariKitapConfig;
    sourcePdfReference?: string;
}

/**
 * AI ile BursaDisleksi Hızlı Okuma içerik üretimi
 * Pipeline: Prompt build → Gemini Client (Client-Side) → Hece post-processing
 * Sadece AI mod - Her seferinde benzersiz içerik
 */
export async function generateSariKitapContent(
    options: GenerateOptions
): Promise<SariKitapGeneratedContent> {
    const { config, sourcePdfReference } = options;

    // Her seferinde benzersiz üretim için yeni bir seed enjekte et
    const updatedConfig = { 
        ...config, 
        isUnique: true,
        seed: Math.random().toString(36).substring(7) + Date.now().toString() 
    };

    const promptBuilder = getPromptBuilder(updatedConfig.type);
    const prompt = promptBuilder(updatedConfig, sourcePdfReference);

    // Define expected schema for JSON repair and type safety
    const schema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            rawText: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            instructions: { type: 'STRING' },
            targetSkills: { type: 'ARRAY', items: { type: 'STRING' } },
            sourceTexts: { type: 'OBJECT' },
            wordBlocks: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
            memoryData: { type: 'OBJECT' }
        },
        required: ['title', 'rawText']
    };

    // Use the robust geminiClient instead of direct fetch
    const aiData = await generateWithSchema(prompt, schema) as any;

    if (!aiData || (!aiData.rawText && !aiData.wordBlocks)) {
        throw new Error('AI yanıtı geçersiz veya boş.');
    }

    // 3. Hece/Kelime post-processing
    const rawText = (aiData.rawText as string) ?? '';
    
    // Nokta ve Köprü kelime bazlı çalışıyorsa metniKelimele kullan
    const useWordLevel = (
        (config.type === 'nokta' && config.dotPlacement === 'kelime') ||
        (config.type === 'kopru' && config.bridgePlacement === 'kelime')
    );
    const heceRows = useWordLevel ? metniKelimele(rawText) : metniHecele(rawText);

    const content: SariKitapGeneratedContent = {
        title: aiData.title ?? 'BursaDisleksi Hızlı Okuma Etkinliği',
        instructions: aiData.instructions ?? '',
        targetSkills: aiData.targetSkills ?? [...config.targetSkills],
        rawText,
        heceRows,
        sourceTexts: aiData.sourceTexts,
        wordBlocks: aiData.wordBlocks,
        memoryData: aiData.memoryData,
        generatedAt: new Date().toISOString(),
        model: 'gemini-2.5-flash',
    };

    return content;
}
