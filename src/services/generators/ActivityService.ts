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
    private defaultMode: GeneratorMode = GeneratorMode.AI; // Varsayılan mod

    private constructor() {
        this.generators = new Map();
        this.defaultMode = GeneratorMode.AI;
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
                
                // [FAZ 10] Hem AI hem de Offline motorunu dinamik olarak bağla
                const generator = new GenericActivityGenerator<any>(
                    DEFAULT_MODE,
                    async (options) => {
                        // AI Üretim Motoru (Gemini 2.5 Flash)
                        return await generateInfographic(activityType, options);
                    },
                    async (options) => {
                        // [NEW] Çevrimdışı (Hızlı) Üretim Motoru
                        const { generateOfflineInfographic } = await import('../offlineGenerators/infographic');
                        return await generateOfflineInfographic(activityType, options);
                    }
                );
                this.generators.set(activityType, generator);
            }
        });
    }

    /**
     * Belirtilen aktivite türü için içerik üretir.
     */
    public async generate(type: ActivityType, options: GeneratorOptions, _mode?: GeneratorMode): Promise<any> {
        // Önce jeneratörü ara
        let generator = this.generators.get(type);

        // Jeneratör bulunamadıysa, fallback mekanizmasını dene
        if (!generator) {
            console.warn(`No generator found for activity type: ${type}. Attempting fallback...`);
            
            // Bilinmeyen tipler için GenericActivityGenerator ile fallback dene
            const fallbackMode = _mode ?? this.defaultMode;
            const fallbackGenerator = new GenericActivityGenerator(
                fallbackMode,
                async () => {
                    throw new AppError(
                        `No AI generator implemented for activity type: ${type}. Please add it to the registry.`,
                        'NOT_FOUND',
                        404
                    );
                },
                async () => {
                    throw new AppError(
                        `No offline generator implemented for activity type: ${type}. Please add it to the registry.`,
                        'NOT_FOUND',
                        404
                    );
                }
            );
            
            generator = fallbackGenerator;
            console.warn(`Using fallback generator for activity type: ${type}`);
        }

        // Eğer spesifik bir mod parametresi gelmişse options'ı güncelle
        if (_mode) {
            options.mode = _mode === GeneratorMode.AI ? 'ai' : 'fast';
        }

        // Alt jeneratörden ham veriyi al
        const data = await generator.generate(options);

        // GÜVENLİK: data undefined/null ise boş array'e dönüştür
        const safeData = data ?? [];

        // UI'ın (özellikle useInfographicGenerate hook'unun) beklediği ApiResponse formatında sarmala
        return {
            success: true,
            data: safeData,
            timestamp: new Date().toISOString()
        };
    }
}

// Singleton export
export const activityService = ActivityService.getInstance();
