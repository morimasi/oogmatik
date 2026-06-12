import { useCallback } from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';
import { generateSariKitapContent } from '../../../services/generators/sariKitap/engine';

export function useSariKitapGenerator() {
    const {
        config,
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
            // AI-only unique content generation
            const content = await generateSariKitapContent({
                config
            });
            
            setContent(content);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Üretim sırasında hata oluştu';
            setError(message);
        } finally {
            setGenerating(false);
        }
    }, [config, isGenerating, setGenerating, setContent, setError]);

    return { generate, isGenerating };
}
