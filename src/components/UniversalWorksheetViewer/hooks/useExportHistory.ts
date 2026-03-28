import { useState, useCallback, useEffect } from 'react';
import type { ExportHistoryEntry, ExportFormat, _ExportSettings } from '../types/worksheet';

const STORAGE_KEY = 'uwv_export_history';
const MAX_HISTORY_ENTRIES = 100;

interface ExportStats {
  total: number;
  byFormat: Record<ExportFormat, number>;
  lastExportAt: string | null;
}

interface UseExportHistoryReturn {
  history: ExportHistoryEntry[];
  stats: ExportStats;
  addEntry: (entry: Omit<ExportHistoryEntry, 'id' | 'exportedAt'>) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  clearOlderThan: (days: number) => void;
  getByWorksheet: (worksheetId: string) => ExportHistoryEntry[];
  getByFormat: (format: ExportFormat) => ExportHistoryEntry[];
}

function generateId(): string {
  return `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadHistory(): ExportHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExportHistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(history: ExportHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // localStorage may be full – silently ignore
  }
}

export function useExportHistory(): UseExportHistoryReturn {
  const [history, setHistory] = useState<ExportHistoryEntry[]>(() => loadHistory());

  // Persist on every change
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const addEntry = useCallback((entry: Omit<ExportHistoryEntry, 'id' | 'exportedAt'>) => {
    const newEntry: ExportHistoryEntry = {
      ...entry,
      id: generateId(),
      exportedAt: new Date().toISOString(),
    };
    setHistory((prev) => {
      const updated = [newEntry, ...prev];
      // Keep under max limit
      return updated.slice(0, MAX_HISTORY_ENTRIES);
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const clearOlderThan = useCallback((days: number) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    setHistory((prev) => prev.filter((e) => new Date(e.exportedAt).getTime() > cutoff));
  }, []);

  const getByWorksheet = useCallback(
    (worksheetId: string) => history.filter((e) => e.worksheetId === worksheetId),
    [history],
  );

  const getByFormat = useCallback(
    (format: ExportFormat) => history.filter((e) => e.format === format),
    [history],
  );

  const stats: ExportStats = {
    total: history.length,
    byFormat: {
      pdf: history.filter((e) => e.format === 'pdf').length,
      png: history.filter((e) => e.format === 'png').length,
      docx: history.filter((e) => e.format === 'docx').length,
      json: history.filter((e) => e.format === 'json').length,
    },
    lastExportAt: history.length > 0 ? history[0].exportedAt : null,
  };

  return {
    history,
    stats,
    addEntry,
    removeEntry,
    clearHistory,
    clearOlderThan,
    getByWorksheet,
    getByFormat,
  };
}

export type { UseExportHistoryReturn, ExportStats };
