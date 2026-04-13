import { generateActivityStudio } from '@/services/activityStudioService';
import { useActivityStudioStore } from '@/store/useActivityStudioStore';

export function useAgentOrchestration() {
  const { wizardData, setGenerating, setError } = useActivityStudioStore();

  const generate = async () => {
    if (!wizardData.goal) {
      setError('Hedef bilgisi olmadan AI uretimi baslatilamaz.');
      return null;
    }

    try {
      setGenerating(true);
      setError(null);
      return await generateActivityStudio(wizardData.goal);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI orkestrasyonu basarisiz.';
      setError(message);
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return { generate };
}
