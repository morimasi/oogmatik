import { useState, useCallback } from 'react';
import { useToastStore } from '../../../store/useToastStore';
import { AppError } from '../../../utils/AppError';
import { InfographicGenMode } from './useInfographicStudio';
import { generateCompositeWorksheet } from '../../../services/generators/premiumCompositeGenerator';
import { CompositeWorksheet } from '../../../types/worksheet';

export const useInfographicGenerate = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<CompositeWorksheet | null>(null);
    const { show } = useToastStore(); 

    const generate = useCallback(async (
        widgets: { id: string; activityId: string }[],
        mode: InfographicGenMode,
        topic: string,
        params: Record<string, any> = {}
    ) => {
        if (!topic.trim()) {
            show('Lütfen bir konu veya metin giriniz', 'warning');
            return null;
        }
        if (widgets.length === 0) {
            show('Lütfen en az bir bileşen ekleyin', 'warning');
            return null;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const worksheet = await generateCompositeWorksheet({
                topic,
                studentAge: params.studentAge || '8-10',
                difficulty: params.difficulty || 'Orta',
                profile: params.profile,
                mode,
                widgets
            });

            if (worksheet) {
                setResult(worksheet);
                show('Çalışma kağıdı başarıyla üretildi!', 'success');
                return worksheet;
            } else {
                throw new AppError('Üretim sırasında bir hata oluştu', 'GENERATE_FAILED', 500);
            }
        } catch (error: unknown) {
            if (error instanceof AppError) {
                show(error.userMessage, 'error');
            } else if (error instanceof Error) {
                show(error.message, 'error');
            } else {
                show('Beklenmeyen bir hata oluştu', 'error');
            }
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [show]);

    const clearResult = useCallback(() => {
        setResult(null);
    }, []);

    return {
        isGenerating,
        result,
        generate,
        clearResult,
    };
};