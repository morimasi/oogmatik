import { useState, useEffect, useCallback } from 'react';
import { AdOutput } from '../types/adStudio';

const STORAGE_KEY = 'oogmatik_ad_history';

function loadHistory(): AdOutput[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AdOutput[];
  } catch { /* ignore */ }
  return [];
}

function saveHistory(history: AdOutput[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useAdHistory() {
  const [history, setHistory] = useState<AdOutput[]>(loadHistory);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addToHistory = useCallback((output: AdOutput) => {
    setHistory(prev => [output, ...prev].slice(0, 100));
  }, []);

  const deleteFromHistory = useCallback((id: string) => {
    setHistory(prev => prev.filter(a => a.id !== id));
  }, []);

  const getVersion = useCallback((id: string): number => {
    const ad = history.find(a => a.id === id);
    return ad ? ad.version : 0;
  }, [history]);

  const compareVersions = useCallback((idA: string, idB: string) => {
    const a = history.find(h => h.id === idA);
    const b = history.find(h => h.id === idB);
    if (!a || !b) return null;
    return {
      a,
      b,
      differences: {
        scenes: a.scenes.length !== b.scenes.length,
        script: a.script !== b.script,
        socialCopy: a.socialCopy !== b.socialCopy,
        tone: a.tone !== b.tone,
        target: a.target !== b.target,
      },
    };
  }, [history]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const archiveAd = useCallback((id: string) => {
    setHistory(prev => prev.map(a => a.id === id ? { ...a, status: 'archived' as const } : a));
  }, []);

  const favoriteAd = useCallback((id: string) => {
    setHistory(prev => {
      const idx = prev.findIndex(a => a.id === id);
      if (idx === -1) return prev;
      const item = prev[idx];
      const rest = prev.filter((_, i) => i !== idx);
      return [item, ...rest];
    });
  }, []);

  return {
    history,
    addToHistory,
    deleteFromHistory,
    getVersion,
    compareVersions,
    clearHistory,
    archiveAd,
    favoriteAd,
  };
}
