import { useState, useCallback } from 'react';
import {
  AdStudioSettings,
  AdOutput,
  AdTone,
  AdFormat,
  DEFAULT_SETTINGS,
} from '../types/adStudio';
import { generateAd as generateAdService } from '../services/adGeneratorService';
import { useBrandKit } from './useBrandKit';
import { useAdHistory } from './useAdHistory';

export function useAdGenerator() {
  const [step, setStep] = useState(1);
  const [settings, setSettings] = useState<AdStudioSettings>({ ...DEFAULT_SETTINGS });
  const [output, setOutput] = useState<AdOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { activeBrandKit } = useBrandKit();
  const { addToHistory } = useAdHistory();

  const updateSettings = useCallback(<K extends keyof AdStudioSettings>(key: K, value: AdStudioSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateAdService(settings, activeBrandKit);
      setOutput(result);
      addToHistory(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reklam uretilemedi';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [settings, activeBrandKit, addToHistory]);

  const reset = useCallback(() => {
    setStep(1);
    setSettings({ ...DEFAULT_SETTINGS });
    setOutput(null);
    setError(null);
  }, []);

  const nextStep = useCallback(() => {
    setStep(prev => Math.min(prev + 1, 5));
  }, []);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(prev - 1, 1));
  }, []);

  const updateToneMix = useCallback((tone: AdTone, value: number) => {
    setSettings(prev => {
      const current = { ...prev.toneMix };
      const otherKeys = Object.keys(current).filter(k => k !== tone) as AdTone[];
      const otherTotal = otherKeys.reduce((sum, k) => sum + current[k], 0);
      const clamped = Math.max(0, Math.min(100, value));

      if (otherTotal === 0 && clamped < 100) {
        const perOther = Math.round((100 - clamped) / otherKeys.length);
        otherKeys.forEach(k => { current[k] = perOther; });
        current[tone] = clamped;
        const diff = 100 - Object.values(current).reduce((a, b) => a + b, 0);
        if (diff !== 0 && otherKeys.length > 0) current[otherKeys[0]] += diff;
      } else if (otherTotal > 0) {
        const ratio = (100 - clamped) / otherTotal;
        otherKeys.forEach(k => { current[k] = Math.round(current[k] * ratio); });
        current[tone] = clamped;
        const sum = Object.values(current).reduce((a, b) => a + b, 0);
        if (sum !== 100 && otherKeys.length > 0) {
          current[otherKeys[0]] += (100 - sum);
        }
      } else {
        current[tone] = clamped;
      }

      return { ...prev, toneMix: current };
    });
  }, []);

  return {
    step,
    setStep,
    nextStep,
    prevStep,
    settings,
    updateSettings,
    updateToneMix,
    output,
    isGenerating,
    error,
    setError,
    generate,
    reset,
  };
}
