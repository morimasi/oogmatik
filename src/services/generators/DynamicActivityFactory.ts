import { lazy } from 'react';
import { ActivityType } from '../../types/activity';
import { GeneratorMapping } from './registry';

// Vite import.meta.glob ile var olan modülleri güvenli bir şekilde haritalandırıyoruz.
// Bu sayede Rollup derleme esnasında olmayan dosyalar için invalid module ID hatası vermez.
const generatorModules = import.meta.glob<{ [key: string]: any }>('../../modules/activities/*/generators.ts');
const offlineModules = import.meta.glob<{ [key: string]: any }>('../../modules/activities/*/offlineGenerators.ts');
const uiModules = import.meta.glob<{ [key: string]: any }>('../../modules/activities/*/ui/WorksheetUI.tsx');

/**
 * DynamicActivityFactory: Otonom üretilen ve statik registry'de olmayan modülleri 
 * runtime'da çözümleyen ve yükleyen fabrika.
 */
export class DynamicActivityFactory {
    /**
     * Bir activityType için jeneratör eşleşmesini dinamik olarak döndürür.
     */
    static async getMapping(type: ActivityType): Promise<GeneratorMapping | null> {
        const slug = type.toLowerCase().replace(/_/g, '-');
        const genKey = `../../modules/activities/${slug}/generators.ts`;
        const offKey = `../../modules/activities/${slug}/offlineGenerators.ts`;

        if (!generatorModules[genKey]) {
            return null;
        }

        try {
            const generators = await generatorModules[genKey]();
            const offline = offlineModules[offKey] ? await offlineModules[offKey]() : null;

            return {
                ai: (options) => generators[`generate${type}FromAI`]?.(options),
                offline: (options) => offline?.[`generateOffline${type}`]?.(options)
            };
        } catch (_e) {
            return null;
        }
    }

    /**
     * UI Bileşenini lazy load ile döndürür.
     */
    static getComponent(type: string) {
        const slug = type.toLowerCase().replace(/_/g, '-');
        const uiKey = `../../modules/activities/${slug}/ui/WorksheetUI.tsx`;

        if (uiModules[uiKey]) {
            return lazy(async () => {
                const m = await uiModules[uiKey]();
                return { default: m.default || m.HarfBaglamaSheet || m.LetterConnectSheet || m };
            });
        }

        return lazy(async () => {
            const Fallback = await import('../../components/SheetRenderer') as any;
            return { default: Fallback.default || Fallback.SheetRenderer || Fallback };
        });
    }
}
