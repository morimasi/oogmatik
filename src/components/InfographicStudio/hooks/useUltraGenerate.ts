/**
 * @file src/components/InfographicStudio/hooks/useUltraGenerate.ts
 * @description Tek aktivite için UltraCustomizationParams ile üretim hook'u.
 *
 * Selin Arslan: geminiClient.ts zaten kullanımda, bu hook doğrudan
 * InfographicGeneratorPair.aiGenerator / offlineGenerator'ı çağırır.
 * Bora Demir: AppError standardı, any yasak.
 */

import { useState, useCallback } from 'react';
import { ActivityType } from '../../../types/activity';
import { InfographicGeneratorResult, UltraCustomizationParams } from '../../../types/infographic';
import { getInfographicGeneratorPair } from '../../../services/generators/infographic/infographicRegistry';
import { useToastStore } from '../../../store/useToastStore';
import { AppError } from '../../../utils/AppError';
import { InfographicGenMode } from './useInfographicStudio';
import { ActivityParamsState } from '../panels/LeftPanel/UltraActivityParamsPanel';
import { ParameterPanelState } from '../panels/LeftPanel/ParameterPanel';

export const useUltraGenerate = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<InfographicGeneratorResult | null>(null);
  const { show } = useToastStore();

  const generate = useCallback(
    async (
      activityType: ActivityType,
      mode: InfographicGenMode,
      baseParams: ParameterPanelState,
      activityParams: ActivityParamsState
    ) => {
      const pair = getInfographicGeneratorPair(activityType);
      if (!pair) {
        show('Bu aktivite için üretici bulunamadı.', 'error');
        return null;
      }

      if (!baseParams.topic.trim()) {
        show('Lütfen konu veya bağlam giriniz.', 'warning');
        return null;
      }

      setIsGenerating(true);
      setResult(null);

      const ultraParams: UltraCustomizationParams = {
        topic: baseParams.topic,
        ageGroup: baseParams.ageGroup,
        difficulty: baseParams.difficulty,
        profile: baseParams.profile,
        itemCount: (activityParams['itemCount'] as number) ?? 5,
        activityParams: activityParams as Record<string, unknown>,
      };

      try {
        let generated: InfographicGeneratorResult;

        if (mode === 'ai') {
          generated = await pair.aiGenerator(ultraParams);
        } else {
          generated = pair.offlineGenerator(ultraParams);
        }

        setResult(generated);
        show('Çalışma sayfası başarıyla üretildi!', 'success');
        return generated;
      } catch (err: unknown) {
        if (err instanceof AppError) {
          show(err.userMessage, 'error');
        } else if (err instanceof Error) {
          show(err.message, 'error');
        } else {
          show('Üretim sırasında beklenmeyen bir hata oluştu.', 'error');
        }
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [show]
  );

  const reset = useCallback(() => {
    setResult(null);
  }, []);

  return { isGenerating, result, generate, reset };
};
