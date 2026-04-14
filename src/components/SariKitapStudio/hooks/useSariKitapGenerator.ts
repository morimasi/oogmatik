import { useCallback } from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';
import { generateSariKitapContent } from '../../../services/generators/sariKitap';
import { generateOffline } from '../../../services/offlineGenerators/sariKitap';

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
                const content = await generateSariKitapContent({ config });
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
