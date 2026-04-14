import type { BellekConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getMetinByAgeAndDifficulty } from './metinHavuzu';
import { buildWordBlocks, buildGeneratedContent } from './heceMotoru';
import { metniHecele } from '../../../utils/heceAyirici';

export function generateBellekOffline(config: BellekConfig): SariKitapGeneratedContent {
    const entry = getMetinByAgeAndDifficulty(config.ageGroup, config.difficulty);
    const rows = Math.ceil(config.blockCount / config.gridColumns);
    const wordBlocks = buildWordBlocks(entry.metin, config.gridColumns, rows);
    const heceRows = metniHecele(entry.metin);

    return buildGeneratedContent(entry.baslik, entry.metin, heceRows, config, { wordBlocks });
}
