import { BaseGenerator } from './BaseGenerator';
import { GeneratorOptions } from '../../../types';
import { GeneratorMode } from './types';

/**
 * Genel Aktivite Jeneratörü
 * Her aktivite için ayrı bir sınıf oluşturmak yerine, bu sınıfı kullanarak
 * dinamik olarak AI ve Offline fonksiyonlarını enjekte edebiliriz.
 */
export class GenericActivityGenerator<T> extends BaseGenerator<T> {
    
    constructor(
        private mode: GeneratorMode,
        private aiFunction?: (options: GeneratorOptions) => Promise<T | T[]>,
        private offlineFunction?: (options: GeneratorOptions) => Promise<T | T[]>
    ) {
        super();
    }

    protected async execute(options: GeneratorOptions): Promise<T | T[]> {
        
        if (this.mode === GeneratorMode.AI) {
            if (!this.aiFunction) {
                // Eğer AI fonksiyonu yoksa ve mod AI ise, offline'a düş (fallback)
                // veya hata fırlat. Şimdilik offline'a düşmeyi tercih edelim.
                console.warn(`[GenericGenerator] AI function not provided, falling back to Offline.`);
                if (this.offlineFunction) return await this.offlineFunction(options);
                throw new Error(`[GenericGenerator] No generation function available.`);
            }
            return await this.aiFunction(options);
        } else {
            if (!this.offlineFunction) {
                // Eğer Offline fonksiyonu yoksa ve mod Offline ise, AI'ya düş (fallback)
                console.warn(`[GenericGenerator] Offline function not provided, falling back to AI.`);
                if (this.aiFunction) return await this.aiFunction(options);
                throw new Error(`[GenericGenerator] No generation function available.`);
            }
            return await this.offlineFunction(options);
        }
    }
}
