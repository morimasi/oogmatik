import { useState, useCallback } from 'react';
import { ActivityType } from '../../../types/activity';
import { animationService } from '../../../services/generators/AnimationService';
import { AnimationActivityResult, AnimationProps } from '../../../types/animation';
import { useToastStore } from '../../../store/useToastStore';
import { AppError } from '../../../utils/AppError';

export const useAnimationGenerate = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<AnimationActivityResult | null>(null);
    const { showToast } = useToastStore();

    const generate = useCallback(async (
        activityType: ActivityType,
        topic: string,
        params: any = {}
    ) => {
        if (!topic.trim()) {
            showToast('Lütfen bir konu veya metin giriniz', 'warning');
            return null;
        }

        setIsGenerating(true);
        // setResult(null); // İsteğe bağlı: Mevcut animasyonu temizleme

        try {
            const data = await animationService.generateAnimation(activityType, topic, params);

            if (data) {
                setResult(data);
                showToast('Animasyon başarıyla üretildi!', 'success');
                return data;
            }
            throw new AppError('Üretim başarısız oldu.', 'GENERATE_FAILED', 500);
        } catch (error: any) {
            showToast(error.userMessage || error.message || 'Hata oluştu', 'error');
            return null;
        } finally {
            setIsGenerating(false);
        }
    }, [showToast]);

    return {
        isGenerating,
        result,
        generate,
        setResult
    };
};
