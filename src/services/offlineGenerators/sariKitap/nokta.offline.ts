import type { NoktaConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { getMetinByAgeAndDifficulty } from './metinHavuzu';
import { processNoktaContent, buildGeneratedContent } from './heceMotoru';

export function generateNoktaOffline(config: NoktaConfig): SariKitapGeneratedContent {
    const entry = getMetinByAgeAndDifficulty(config.ageGroup, config.difficulty);
    const heceRows = processNoktaContent(config, entry.metin);
    return buildGeneratedContent(entry.baslik, entry.metin, heceRows, config);
}
