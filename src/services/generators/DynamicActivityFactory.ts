import { lazy } from 'react';
import { ActivityType } from '../../types/activity';
import { GeneratorMapping } from './registry';

/**
 * DynamicActivityFactory: Otonom üretilen ve statik registry'de olmayan modülleri 
 * runtime'da çözümleyen ve yükleyen fabrika.
 * 
 * Phase 4 mimarisinin en esnek parçasıdır.
 */
export class DynamicActivityFactory {
    /**
     * Bir activityType için jeneratör eşleşmesini dinamik olarak döndürür.
     */
    static async getMapping(type: ActivityType): Promise<GeneratorMapping | null> {
        const slug = type.toLowerCase().replace(/_/g, '-');

        try {
            // Dinamik import ile deneme yapıyoruz (Vite/Rollup lazy load)
            const generators = await import(`../modules/activities/${slug}/generators`);
            const offline = await import(`../modules/activities/${slug}/offlineGenerators`);

            return {
                ai: (options) => generators[`generate${type}FromAI`](options),
                offline: (options) => offline[`generateOffline${type}`](options)
            };
        } catch (_e) {
            // Eğer dosya fiziksel olarak yoksa null döner, registry fallback'e düşer.
            return null;
        }
    }

    /**
     * UI Bileşenini lazy load ile döndürür.
     */
    static getComponent(type: string) {
        const slug = type.toLowerCase().replace(/_/g, '-');
        return lazy(async () => {
            try {
                const m = await import(`../../modules/activities/${slug}/ui/WorksheetUI`);
                return { default: m.default };
            } catch (e) {
                // Fallback UI or Error view
                const Fallback = await import('../../components/SheetRenderer');
                return { default: (Fallback as unknown as any).default || Fallback };
            }
        });
    }
}
