import { BaseGenerator } from './core/BaseGenerator';
import { GeneratorOptions, LogicErrorHunterData } from '../../types';
import { GeneratorMode } from './core/types';

// Mevcut AI fonksiyonunu import ediyoruz
import { generateLogicErrorHunterFromAI as generateAI } from './logicErrorHunter';
// Mevcut Offline fonksiyonunu import ediyoruz
import { generateOfflineLogicErrorHunter as generateOffline } from '../offlineGenerators/logicErrorHunter';

/**
 * Mantık Hatası Avcısı Jeneratörü
 * Strateji Deseni ile AI veya Offline modunu seçer.
 */
export class LogicErrorHunterGenerator extends BaseGenerator<LogicErrorHunterData> {
    
    constructor(private mode: GeneratorMode) {
        super();
    }

    protected async execute(options: GeneratorOptions): Promise<LogicErrorHunterData | LogicErrorHunterData[]> {
        
        if (this.mode === GeneratorMode.AI) {
            console.log('Using AI Strategy for Logic Error Hunter');
            return await generateAI(options);
        } else {
            console.log('Using Offline Strategy for Logic Error Hunter');
            return await generateOffline(options);
        }
    }
}
