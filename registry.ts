
import { ActivityType, GeneratorOptions } from './types';
import { ActivityConfigRegistry } from './components/activity-configs';

// Varsayılan Ayarlar Şablonu
const DEFAULT_OPTIONS: GeneratorOptions = {
    mode: 'fast',
    difficulty: 'Orta',
    worksheetCount: 1,
    itemCount: 10,
    gridSize: 10,
    case: 'lower',
    targetPair: '',
    targetFrequency: 'medium',
    distractorStrategy: 'similar'
};

/**
 * Aktiviteye özel ayar bileşenini (Config Component) güvenli bir şekilde getirir.
 * Eğer özel bir ayar dosyası yoksa, undefined döner (GeneratorView varsayılanı kullanır).
 */
export const getActivityConfigComponent = (activityId: ActivityType | string) => {
    // ID'ye göre registry'den bak, yoksa null dön.
    // Bu sayede GeneratorView "DefaultConfig"e düşeceğini bilir.
    return ActivityConfigRegistry[activityId as string];
};

/**
 * Bir aktivite için varsayılan ayarları getirir.
 * İleride her aktivite için özel defaultlar buraya eklenebilir.
 */
export const getDefaultOptionsForActivity = (activityId: ActivityType | string): GeneratorOptions => {
    // Özel mantık eklenebilir:
    // if (activityId === ActivityType.FIND_LETTER_PAIR) return { ...DEFAULT_OPTIONS, itemCount: 1 };
    
    // Şu an için genel varsayılanları döndürüyoruz.
    return { ...DEFAULT_OPTIONS };
};
