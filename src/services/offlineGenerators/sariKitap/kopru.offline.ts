import type { KopruConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getMetinByAgeAndDifficulty } from './metinHavuzu';
import { processKopruContent, buildGeneratedContent } from './heceMotoru';

export function generateKopruOffline(config: KopruConfig): SariKitapGeneratedContent {
    const entry = getMetinByAgeAndDifficulty(config.ageGroup, config.difficulty);
    const heceRows = processKopruContent(config, entry.metin);
    return buildGeneratedContent(entry.baslik, entry.metin, heceRows, config);
}
