import { AppError } from '../../utils/AppError';
import { GeneratorOptions, ActivityType } from '../../types';
import { GeneratorMode, IActivityGenerator } from './core/types';
import { GenericActivityGenerator } from './core/GenericActivityGenerator';
import { ACTIVITY_GENERATOR_REGISTRY } from './registry';
import { generateInfographic } from './infographicGenerator';

/**
 * Merkezi Aktivite Servisi (Facade / Factory)
 * Tüm aktivite üretim istekleri bu servis üzerinden geçer.
 * İstemci (UI), hangi jeneratörün (AI/Offline) kullanılacağını bilmek zorunda değildir.
 */
export class ActivityService {

    private static instance: ActivityService;
    private generators: Map<ActivityType, IActivityGenerator<any>>;

    private constructor() {
        this.generators = new Map();
        this.registerGenerators();
    }

    public static getInstance(): ActivityService {
        if (!ActivityService.instance) {
            ActivityService.instance = new ActivityService();
        }
        return ActivityService.instance;
    }

    /**
     * Tüm jeneratörleri registry'den alıp kaydeder.
     */
    private registerGenerators() {
        // Varsayılan mod: AI (Eğer varsa)
        const DEFAULT_MODE = GeneratorMode.AI;

        // 1. Manuel kayıtlı jeneratörleri (registry.ts) işle
        for (const [type, mapping] of Object.entries(ACTIVITY_GENERATOR_REGISTRY)) {
            const activityType = type as ActivityType;

            const generator = new GenericActivityGenerator(
                DEFAULT_MODE,
                mapping.ai,
                mapping.offline
            );

            this.generators.set(activityType, generator);
        }

        // 2. Dinamik kayıt: INFOGRAPHIC_ ile başlayan tüm tipleri otomatik işle
        // Bu sayede registry.ts dosyasına 96 satır eklemek zorunda kalmayız.
        Object.values(ActivityType).forEach((type) => {
            const activityType = type as ActivityType;
            if (activityType.startsWith('INFOGRAPHIC_') && !this.generators.has(activityType)) {
                // İnfografik aktiviteleri için merkezi bir AI yönlendirici oluştur
                const generator = new GenericActivityGenerator(
                    DEFAULT_MODE,
                    async (options) => {
                        // Faz 10 Fix: Placeholder yerine gerçek AI jeneratörünü çağır
                        return await generateInfographic(activityType, options);
                    },
                    undefined
                );
                this.generators.set(activityType, generator);
            }
        });
    }

    /**
     * Belirtilen aktivite türü için içerik üretir.
     */
    public async generate(type: ActivityType, options: GeneratorOptions, _mode?: GeneratorMode): Promise<any> {

        const generator = this.generators.get(type);

        if (!generator) {
            // Eğer generator bulunamadıysa, belki henüz migrate edilmemiştir.
            // Eski yöntemle çalışan bir fallback mekanizması eklenebilir.
            console.warn(`No generator found for activity type: ${type}. Checking legacy mapping...`);
            throw new AppError(`No generator found for activity type: ${type}`, 'INTERNAL_ERROR', 500);
        }

        // Mod değişikliği isteği varsa (örn: kullanıcı offline istedi)
        // GenericActivityGenerator'ın modunu değiştirmemiz gerekebilir.
        // Ancak bu singleton olduğu için diğer istekleri etkileyebilir.
        // Bu yüzden, generate metoduna 'mode' parametresi eklemek daha doğru olur.
        // Şimdilik GenericActivityGenerator, constructor'da aldığı modu kullanıyor.
        // İleride GenericActivityGenerator'ın generate metoduna mode parametresi eklenebilir.

        return await generator.generate(options);
    }
}

// Singleton export
export const activityService = ActivityService.getInstance();
