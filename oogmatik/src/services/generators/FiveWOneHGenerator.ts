import { BaseGenerator } from './core/BaseGenerator';
import { GeneratorOptions, FiveWOneHData } from '../../types';
import { GeneratorMode } from './core/types';

// Mevcut AI fonksiyonunu import ediyoruz (geçici olarak)
import { generateFiveWOneHFromAI as generateAI } from './fiveWOneH';
// Mevcut Offline fonksiyonunu import ediyoruz (geçici olarak)
import { generateOfflineFiveWOneH as generateOffline } from '../offlineGenerators/fiveWOneH';

/**
 * 5N1K Aktivitesi Jeneratörü
 * Strateji Deseni ile AI veya Offline modunu seçer.
 */
export class FiveWOneHGenerator extends BaseGenerator<FiveWOneHData> {
    
    constructor(private mode: GeneratorMode) {
        super();
    }

    protected async execute(options: GeneratorOptions): Promise<FiveWOneHData | FiveWOneHData[]> {
        
        // Mode'a göre uygun stratejiyi seç
        if (this.mode === GeneratorMode.AI) {
            // AI Stratejisi
            console.log('Using AI Strategy for 5N1K');
            // Mevcut AI fonksiyonunu çağır (ileride bu fonksiyonu buraya taşıyabiliriz)
            return await generateAI(options);
        } else {
            // Offline Stratejisi
            console.log('Using Offline Strategy for 5N1K');
            // Mevcut Offline fonksiyonunu çağır (ileride bu fonksiyonu buraya taşıyabiliriz)
            return await generateOffline(options);
        }
    }
}
