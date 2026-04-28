import { AppError } from '../../../utils/AppError';
import { BaseGenerator } from './BaseGenerator';
import { GeneratorOptions } from '../../../types';
import { GeneratorMode } from './types';

import { logInfo, logError, logWarn } from '../../../utils/logger.js';
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
        // Öncelik: options.mode (UI'dan gelen dinamik seçim), Fallback: this.mode (Varsayılan)
        const activeMode = (options.mode === 'ai' ? GeneratorMode.AI : 
                           options.mode === 'fast' ? GeneratorMode.OFFLINE : 
                           this.mode);
        
        if (activeMode === GeneratorMode.AI) {
            if (!this.aiFunction) {
                // Eğer AI fonksiyonu yoksa ve mod AI ise, offline'a düş (fallback)
                logWarn(`[GenericGenerator] AI function not provided, falling back to Offline.`);
                if (this.offlineFunction) return await this.offlineFunction(options);
                throw new AppError(`[GenericGenerator] No generation function available.`, 'INTERNAL_ERROR', 500);
            }
            return await this.aiFunction(options);
        } else {
            if (!this.offlineFunction) {
                // Eğer Offline fonksiyonu yoksa ve mod Offline ise, AI'ya düş (fallback)
                logWarn(`[GenericGenerator] Offline function not provided, falling back to AI.`);
                if (this.aiFunction) return await this.aiFunction(options);
                throw new AppError(`[GenericGenerator] No generation function available.`, 'INTERNAL_ERROR', 500);
            }
            return await this.offlineFunction(options);
        }
    }
}
