import { useRef, useState, useCallback } from 'react';
import { captureElementAsDataUrl } from '../services/screenshotCaptureService';
import type { AdStudioTarget } from '../types/adStudio';

export function useScreenshotCapture() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [captured, setCaptured] = useState<Record<string, string>>({});
  const [isCapturing, setIsCapturing] = useState(false);

  const capture = useCallback(async (target: AdStudioTarget): Promise<string | null> => {
    if (!previewRef.current) return null;
    setIsCapturing(true);
    try {
      const dataUrl = await captureElementAsDataUrl(previewRef.current);
      setCaptured(prev => ({ ...prev, [target]: dataUrl }));
      return dataUrl;
    } catch {
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, []);

  return { previewRef, captured, isCapturing, capture };
}
