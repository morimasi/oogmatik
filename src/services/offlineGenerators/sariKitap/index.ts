export { getMetinByAgeAndDifficulty, getCiftMetinCifti } from './metinHavuzu';
export type { CiftMetinCifti } from './metinHavuzu';
export {
    processPencereContent,
    processNoktaContent,
    processKopruContent,
    buildWordBlocks,
    interleaveTexts,
    buildGeneratedContent,
} from './heceMotoru';
export { generatePencereOffline } from './pencere.offline';
export { generateNoktaOffline } from './nokta.offline';
export { generateKopruOffline } from './kopru.offline';
export { generateCiftMetinOffline } from './ciftMetin.offline';
export { generateBellekOffline } from './bellek.offline';
export { generateHizliOkumaOffline } from './hizliOkuma.offline';

import type { SariKitapConfig, SariKitapGeneratedContent } from '../../../types/sariKitap';
import { generatePencereOffline } from './pencere.offline';
import { generateNoktaOffline } from './nokta.offline';
import { generateKopruOffline } from './kopru.offline';
import { generateCiftMetinOffline } from './ciftMetin.offline';
import { generateBellekOffline } from './bellek.offline';
import { generateHizliOkumaOffline } from './hizliOkuma.offline';

/**
 * Offline üretim router — config.type'a göre uygun üreticiyi çağırır
 * AI başarısız olduğunda fallback olarak kullanılır
 */
export function generateOffline(config: SariKitapConfig): SariKitapGeneratedContent {
    switch (config.type) {
        case 'pencere':
            return generatePencereOffline(config);
        case 'nokta':
            return generateNoktaOffline(config);
        case 'kopru':
            return generateKopruOffline(config);
        case 'cift_metin':
            return generateCiftMetinOffline(config);
        case 'bellek':
            return generateBellekOffline(config);
        case 'hizli_okuma':
            return generateHizliOkumaOffline(config);
    }
}
