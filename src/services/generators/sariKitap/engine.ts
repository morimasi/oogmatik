/**
 * Sarı Kitap AI Engine
 * Gemini 2.5 Flash üzerinden AI içerik üretimi + JSON repair + hece post-processing
 * AI fail → offline fallback devreye girer
 */
import type { SariKitapConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getPromptBuilder } from './shared';
import { metniHecele } from '../../../utils/heceAyirici';
import { generateOffline } from '../../offlineGenerators/sariKitap';
import { sariKitapCacheService } from '../../sariKitapService';

interface GenerateOptions {
    config: SariKitapConfig;
    sourcePdfReference?: string;
    useCache?: boolean;
}

/**
 * AI ile Sarı Kitap içerik üretimi
 * Pipeline: Cache check → Prompt build → Gemini API → JSON repair → Hece post-processing → Cache set
 * Fallback: AI başarısız → offline üretici
 */
export async function generateSariKitapContent(
    options: GenerateOptions
): Promise<SariKitapGeneratedContent> {
    const { config, sourcePdfReference, useCache = true } = options;

    // 1. Cache kontrolü
    if (useCache) {
        try {
            const cached = await sariKitapCacheService.getCached(config);
            if (cached) return cached;
        } catch {
            // Cache hatası sessiz geçilir
        }
    }

    // 2. AI üretim denemesi
    try {
        const promptBuilder = getPromptBuilder(config.type);
        const prompt = promptBuilder(config, sourcePdfReference);

        const response = await fetch('/api/sari-kitap/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config, sourcePdfReference }),
        });

        if (!response.ok) {
            throw new Error(`API hatası: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success || !result.data) {
            throw new Error(result.error?.message ?? 'AI yanıtı geçersiz');
        }

        const aiData = result.data as Record<string, unknown>;

        // 3. Hece post-processing
        const rawText = (aiData.rawText as string) ?? '';
        const heceRows = metniHecele(rawText);

        const content: SariKitapGeneratedContent = {
            title: (aiData.title as string) ?? 'Sarı Kitap Etkinliği',
            pedagogicalNote: (aiData.pedagogicalNote as string) ?? '',
            instructions: (aiData.instructions as string) ?? '',
            targetSkills: (aiData.targetSkills as string[]) ?? [...config.targetSkills],
            rawText,
            heceRows,
            sourceTexts: aiData.sourceTexts as SariKitapGeneratedContent['sourceTexts'],
            wordBlocks: aiData.wordBlocks as string[][],
            generatedAt: new Date().toISOString(),
            model: 'gemini-2.5-flash',
        };

        // 4. Cache kaydet
        if (useCache) {
            sariKitapCacheService.setCache(config, content).catch(() => { });
        }

        return content;
    } catch {
        // 5. AI fallback → offline üretici
        return generateOffline(config);
    }
}
