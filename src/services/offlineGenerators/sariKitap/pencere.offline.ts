import type { PencereConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getMetinByAgeAndDifficulty } from './metinHavuzu';
import { processPencereContent, buildGeneratedContent } from './heceMotoru';

export function generatePencereOffline(config: PencereConfig): SariKitapGeneratedContent {
    const entry = getMetinByAgeAndDifficulty(config.ageGroup, config.difficulty);
    const heceRows = processPencereContent(config, entry.metin);
    return buildGeneratedContent(entry.baslik, entry.metin, heceRows, config);
}
