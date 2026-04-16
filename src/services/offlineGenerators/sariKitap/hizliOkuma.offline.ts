import type { HizliOkumaConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getMetinByAgeAndDifficulty } from './metinHavuzu';
import { buildWordBlocks, buildGeneratedContent } from './heceMotoru';
import { metniHecele } from '../../../utils/heceAyirici';

/**
 * Hızlı Okuma Offline — A4 sayfasını tamamen dolduracak kelime blokları üretir.
 * autoFill modunda metin yetersizse birden fazla metin birleştirilir.
 */
export function generateHizliOkumaOffline(config: HizliOkumaConfig): SariKitapGeneratedContent {
    const targetRows = config.autoFill ? Math.max(config.blockRows, 35) : config.blockRows;
    const targetWordCount = targetRows * config.wordsPerBlock;

    // Metin toplama — tek metin yetmezse birden fazla metin birleştir
    let combinedText = '';
    const usedTitles: string[] = [];
    let attempts = 0;

    while (combinedText.split(/\s+/).filter(w => w.length > 0).length < targetWordCount && attempts < 10) {
        const entry = getMetinByAgeAndDifficulty(config.ageGroup, config.difficulty);
        if (!usedTitles.includes(entry.baslik)) {
            combinedText += (combinedText ? ' ' : '') + entry.metin;
            usedTitles.push(entry.baslik);
        }
        attempts++;
    }

    // Kelime bloklarını oluştur
    const wordBlocks = buildWordBlocks(combinedText, config.wordsPerBlock, targetRows);
    const heceRows = metniHecele(combinedText);

    const title = usedTitles.length > 1
        ? `Hızlı Okuma — ${usedTitles[0]} ve diğerleri`
        : `Hızlı Okuma — ${usedTitles[0] ?? 'Metin'}`;

    return buildGeneratedContent(title, combinedText, heceRows, config, { wordBlocks });
}
