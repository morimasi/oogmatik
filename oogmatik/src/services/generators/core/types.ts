import { GeneratorOptions } from '../../../types';

/**
 * Ortak Jeneratör Arayüzü
 */
export interface IActivityGenerator<T> {
    generate(options: GeneratorOptions): Promise<T | T[]>;
}

/**
 * Jeneratör Modları
 */
export enum GeneratorMode {
    AI = 'AI',           // Gemini / Online
    OFFLINE = 'OFFLINE'  // Kural Tabanlı / Offline
}

/**
 * Jeneratör Konfigürasyonu
 */
export interface GeneratorConfig {
    mode: GeneratorMode;
    // Gelecekte buraya model ismi, temperature gibi ayarlar eklenebilir
}
