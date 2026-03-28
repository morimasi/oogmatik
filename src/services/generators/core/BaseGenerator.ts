import { logger } from '../../../utils/logger';
import { GeneratorOptions } from '../../../types';
import { IActivityGenerator } from './types';

/**
 * Soyut Temel Jeneratör Sınıfı
 * Tüm jeneratörler bu sınıftan türetilmelidir.
 * Hata yönetimi ve ortak loglama işlerini üstlenir.
 */
export abstract class BaseGenerator<T> implements IActivityGenerator<T> {
    
    /**
     * Alt sınıfların uygulaması gereken asıl mantık
     */
    protected abstract execute(options: GeneratorOptions): Promise<T | T[]>;

    /**
     * Dış dünyadan çağrılan ana metod.
     * execute() metodunu sarar ve hata yönetimini sağlar.
     */
    public async generate(options: GeneratorOptions): Promise<T | T[]> {
        try {
            logger.info(`[${this.constructor.name}] Generating with options:`, options);
            
            // Alt sınıfın mantığını çalıştır
            const result = await this.execute(options);
            
            // Eğer result bir dizi değilse, bunu diziye çevirebiliriz (isteğe bağlı)
            // Ancak şimdilik olduğu gibi bırakıyoruz.
            
            return result;
        } catch (error) {
            console.error(`[${this.constructor.name}] Generation Failed:`, error);
            
            // Hatayı fırlatarak çağıranın (UI'ın) haberdar olmasını sağla
            // Ancak burada hatayı özelleştirip (CustomError) fırlatmak daha iyi olabilir.
            throw error;
        }
    }
}
