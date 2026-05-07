import { useCallback } from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';
import { generatePencereFromAI } from '../../../services/generators/sariKitap/pencere.js';
import { generateNoktaFromAI } from '../../../services/generators/sariKitap/nokta.js';
import { generateKopruFromAI } from '../../../services/generators/sariKitap/kopru.js';
import { generateCiftMetinFromAI } from '../../../services/generators/sariKitap/ciftMetin.js';
import { generateBellekFromAI } from '../../../services/generators/sariKitap/bellek.js';
import { generateOffline } from '../../../services/offlineGenerators/sariKitap';

const AI_GENERATORS: Record<string, Function> = {
    'pencere': generatePencereFromAI,
    'nokta': generateNoktaFromAI,
    'köprü': generateKopruFromAI,
    'çiftMetin': generateCiftMetinFromAI,
    'bellek': generateBellekFromAI,
};

export function useSariKitapGenerator() {
    const {
        config,
        generationMode,
        isGenerating,
        setGenerating,
        setContent,
        setError,
    } = useSariKitapStore();

    const generate = useCallback(async () => {
        if (isGenerating) return;

        setGenerating(true);
        setError(null);

        try {
            if (generationMode === 'offline') {
                const content = generateOffline(config);
                setContent(content);
            } else {
                // Direct AI generation for sari kitap modules
                const generator = AI_GENERATORS[config.module] || generatePencereFromAI;
                const content = await generator(config);
                setContent(content);
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Üretim sırasında hata oluştu';
            setError(message);

            // AI fail → offline fallback otomatik
            if (generationMode === 'ai') {
                try {
                    const fallback = generateOffline(config);
                    setContent(fallback);
                    setError(null);
                } catch {
                    setError('Çevrimdışı üretim de başarısız oldu.');
                }
            }
        } finally {
            setGenerating(false);
        }
    }, [config, generationMode, isGenerating, setGenerating, setContent, setError]);

    return { generate, isGenerating };
}
