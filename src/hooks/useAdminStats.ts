import { useState, useEffect, useCallback } from 'react';
import type { AdminStats, AdminStatTrend, WorksheetAnalyticEntry, ExportAnalyticEntry } from '../types/admin';

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  userTrend: AdminStatTrend[];
  exportTrend: AdminStatTrend[];
  worksheetAnalytics: WorksheetAnalyticEntry[];
  exportAnalytics: ExportAnalyticEntry[];
  refresh: () => void;
  lastUpdatedAt: string | null;
}

// Mock data generators
function generateMockStats(): AdminStats {
  return {
    totalUsers: 1240 + Math.floor(Math.random() * 10),
    activeUsers: 87 + Math.floor(Math.random() * 5),
    totalWorksheets: 5832 + Math.floor(Math.random() * 20),
    exportsToday: 124 + Math.floor(Math.random() * 10),
    exportsThisWeek: 892 + Math.floor(Math.random() * 30),
    storageUsedMb: 2340 + Math.floor(Math.random() * 50),
    systemUptime: 99.8,
    errorRatePercent: 0.12,
    avgResponseMs: 142 + Math.floor(Math.random() * 20),
    activeSessionsCount: 23 + Math.floor(Math.random() * 5),
  };
}

function generateTrend(days: number, baseValue: number): AdminStatTrend[] {
  const result: AdminStatTrend[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 86400000);
    result.push({
      date: date.toISOString().slice(0, 10),
      value: Math.max(0, baseValue + Math.floor(Math.random() * 20 - 10)),
    });
  }
  return result;
}

function generateWorksheetAnalytics(): WorksheetAnalyticEntry[] {
  const templates = [
    'Matematik Bulmacaları',
    'Okuma Anlama',
    'Hafıza Egzersizleri',
    'Dil Bilgisi',
    'Görsel Mantık',
    'Dikkat Geliştirme',
  ];
  return templates.map((name, i) => ({
    id: `wa-${i}`,
    date: new Date().toISOString().slice(0, 10),
    count: Math.floor(100 + Math.random() * 50),
    templateId: `tpl-${i + 1}`,
    templateName: name,
    useCount: Math.floor(200 - i * 25 + Math.random() * 20),
    exportCount: Math.floor(100 - i * 12 + Math.random() * 10),
    avgSessionMinutes: 8 + Math.floor(Math.random() * 5),
    popularityRank: i + 1,
  }));
}

function generateExportAnalytics(): ExportAnalyticEntry[] {
  const formats = ['pdf', 'png', 'docx', 'json'];
  const entries: ExportAnalyticEntry[] = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
    formats.forEach((fmt) => {
      entries.push({ id: `exp-${Math.random().toString(36).substring(7)}`, date, format: fmt, count: Math.floor(10 + Math.random() * 40) });
    });
  }
  return entries;
}

export function useAdminStats(): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTrend, setUserTrend] = useState<AdminStatTrend[]>([]);
  const [exportTrend, setExportTrend] = useState<AdminStatTrend[]>([]);
  const [worksheetAnalytics, setWorksheetAnalytics] = useState<WorksheetAnalyticEntry[]>([]);
  const [exportAnalytics, setExportAnalytics] = useState<ExportAnalyticEntry[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    // Simulate API call
    const timer = setTimeout(() => {
      if (cancelled) return;
      try {
        setStats(generateMockStats());
        setUserTrend(generateTrend(30, 1200));
        setExportTrend(generateTrend(30, 120));
        setWorksheetAnalytics(generateWorksheetAnalytics());
        setExportAnalytics(generateExportAnalytics());
        setLastUpdatedAt(new Date().toISOString());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'İstatistikler yüklenemedi');
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return {
    stats,
    loading,
    error,
    userTrend,
    exportTrend,
    worksheetAnalytics,
    exportAnalytics,
    refresh,
    lastUpdatedAt,
  };
}
