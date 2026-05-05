import { AppError } from '../../utils/AppError';
import { GeneratorOptions, ActivityType } from '../../types';
import { GeneratorMode, IActivityGenerator } from './core/types';
import { GenericActivityGenerator } from './core/GenericActivityGenerator';
import { ACTIVITY_GENERATOR_REGISTRY } from './registry';
import { generateInfographic } from './infographicGenerator';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
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
        Object.values(ActivityType).forEach((type) => {
            const activityType = type as ActivityType;
            if (activityType.startsWith('INFOGRAPHIC_') && !this.generators.has(activityType)) {
                
                const generator = new GenericActivityGenerator<any>(
                    DEFAULT_MODE,
                    async (options) => {
                        const count = options.worksheetCount || 1;
                        if (count > 1) {
                            const results = [];
                            for (let i = 0; i < count; i++) {
                                results.push(await generateInfographic(activityType, options));
                            }
                            return results;
                        }
                        return await generateInfographic(activityType, options);
                    },
                    async (options) => {
                        const count = options.worksheetCount || 1;
                        if (count > 1) {
                            const results = [];
                            for (let i = 0; i < count; i++) {
                                const { generateOfflineInfographic } = await import('../offlineGenerators/infographic');
                                results.push(await generateOfflineInfographic(activityType, options));
                            }
                            return results;
                        }
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
            logWarn(`No generator found for activity type: ${type}. Attempting fallback...`);
            
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
            logWarn(`Using fallback generator for activity type: ${type}`);
        }

        // Eğer spesifik bir mod parametresi gelmişse options'ı güncelle
        if (_mode) {
            options.mode = _mode === GeneratorMode.AI ? 'ai' : 'fast';
        }

        // [v5 BATCH PROCESSING] 
        // Eğer AI modu aktifse ve itemCount > 10 ise, 5'erli paketler halinde üret
        const activeMode = options.mode || 'ai';
        const itemCount = options.itemCount || 10;

        let safeData: any[] = [];

        if (activeMode === 'ai' && itemCount > 10) {
            logInfo(`[ActivityService] Large batch detected (${itemCount}). Processing in sub-batches...`);
            const BATCH_SIZE = 5;
            const batches = Math.ceil(itemCount / BATCH_SIZE);
            
            for (let i = 0; i < batches; i++) {
                const subItemCount = Math.min(BATCH_SIZE, itemCount - (i * BATCH_SIZE));
                const subOptions = { ...options, itemCount: subItemCount };
                
                logInfo(`[ActivityService] Batch ${i + 1}/${batches} starting (${subItemCount} items)...`);
                const subData = await generator.generate(subOptions);
                
                if (Array.isArray(subData)) {
                    safeData = [...safeData, ...subData];
                } else if (subData) {
                    safeData.push(subData);
                }
            }
        } else {
            // Normal üretim (tek seferde)
            const data = await generator.generate(options);
            safeData = data ? (Array.isArray(data) ? data : [data]) : [];
        }

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
