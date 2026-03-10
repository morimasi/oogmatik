import { GeneratorOptions, ActivityType } from '../../types';
import { GeneratorMode, IActivityGenerator } from './core/types';
import { FiveWOneHGenerator } from './FiveWOneHGenerator';
import { LogicErrorHunterGenerator } from './LogicErrorHunterGenerator';

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
     * Tüm jeneratörleri burada kayıt ederiz.
     * İleride burası dinamik olarak (plugin sistemi gibi) da çalışabilir.
     */
    private registerGenerators() {
        // Varsayılan olarak OFFLINE modunu kullanıyoruz.
        // Bunu bir config dosyasından veya UI'dan gelen bir parametreden de alabiliriz.
        // Şimdilik hibrit bir yaklaşım: Bazı aktiviteler AI, bazıları Offline olabilir.
        
        // 5N1K Jeneratörü (Varsayılan: AI)
        this.generators.set(ActivityType.FIVE_W_ONE_H, new FiveWOneHGenerator(GeneratorMode.AI));
        
        // Logic Error Hunter Jeneratörü (Varsayılan: AI)
        this.generators.set(ActivityType.LOGIC_ERROR_HUNTER, new LogicErrorHunterGenerator(GeneratorMode.AI));
    }

    /**
     * Belirtilen aktivite türü için içerik üretir.
     */
    public async generate(type: ActivityType, options: GeneratorOptions, mode?: GeneratorMode): Promise<any> {
        
        // Eğer özel bir mod (AI/Offline) istenmişse, geçici bir jeneratör oluşturabiliriz
        // Veya mevcut jeneratörün modunu değiştirebiliriz.
        // Şimdilik basit tutalım: Kayıtlı jeneratörü kullan.

        const generator = this.generators.get(type);
        
        if (!generator) {
            throw new Error(`No generator found for activity type: ${type}`);
        }

        // Eğer mod parametresi geldiyse, jeneratörün modunu geçici olarak değiştirebiliriz
        // Ancak şu anki yapıda jeneratörler stateless değil.
        // İleride burayı daha dinamik yapabiliriz.

        return await generator.generate(options);
    }
}

// Singleton export
export const activityService = ActivityService.getInstance();
