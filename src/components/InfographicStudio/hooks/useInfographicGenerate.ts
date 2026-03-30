import { useState, useCallback } from 'react';
import { ActivityType } from '../../../types/activity';
import { activityService } from '../../../services/generators/ActivityService';
import { InfographicActivityResult } from '../../../types/infographic';
import { useToastStore } from '../../../store/useToastStore';
import { AppError } from '../../../utils/AppError';
import { InfographicGenMode } from './useInfographicStudio';

export const useInfographicGenerate = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<InfographicActivityResult | null>(null);
    const { showToast } = useToastStore();

    const generate = useCallback(async (
        activityType: ActivityType,
        mode: InfographicGenMode,
        topic: string,
        params: Record<string, any> = {}
    ) => {
        if (!topic.trim()) {
            showToast('Lütfen bir konu veya metin giriniz', 'warning');
            return null;
        }

        setIsGenerating(true);
        setResult(null);

        try {
            const response = await activityService.generate(activityType, {
                topic,
                studentAge: params.studentAge || '8-10',
                difficulty: params.difficulty || 'Orta',
                profile: params.profile,
                mode,
                count: params.count || 3,
                // Infographic'e özel ek parametreleri doğrudan pass edilebilir
                customConfig: params.customConfig
            });

            if (response.success && response.data) {
                setResult(response.data as InfographicActivityResult);
                showToast('İnfografik başarıyla üretildi!', 'success');
                return response.data;
            } else {
                throw new AppError(
                    response.error?.message || 'Üretim sırasında bir hata oluştu',
                    response.error?.code || 'GENERATE_FAILED',
                    500
                );
            }
        } catch (error: unknown) {
            if (error instanceof AppError) {
                showToast(error.userMessage, 'error');
            } else if (error instanceof Error) {
                showToast(error.message, 'error');
            } else {
                showToast('Beklenmeyen bir hata oluştu', 'error');
            }
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [showToast]);

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
