import type { HizliOkumaConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getMetinByAgeAndDifficulty } from './metinHavuzu';
import { buildWordBlocks, buildGeneratedContent } from './heceMotoru';
import { metniHecele } from '../../../utils/heceAyirici';

export function generateHizliOkumaOffline(config: HizliOkumaConfig): SariKitapGeneratedContent {
    const entry = getMetinByAgeAndDifficulty(config.ageGroup, config.difficulty);
    const wordBlocks = buildWordBlocks(entry.metin, config.wordsPerBlock, config.blockRows);
    const heceRows = metniHecele(entry.metin);

    return buildGeneratedContent(entry.baslik, entry.metin, heceRows, config, { wordBlocks });
}
