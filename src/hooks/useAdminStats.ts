import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseClient';
import type { AdminStats, AdminStatTrend, WorksheetAnalyticEntry } from '../types/admin';
import { adminService } from '../services/adminService';
import { ACTIVITIES } from '../constants';
import { logError } from '../utils/logger';

const TREND_DAYS = 14;

interface WorksheetRow {
  createdAt?: string;
  activityType?: string;
  category?: { id?: string; title?: string };
}

export interface CategorySlice {
  title: string;
  count: number;
}

interface UseAdminStatsReturn {
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  productionTrend: AdminStatTrend[];
  worksheetAnalytics: WorksheetAnalyticEntry[];
  categoryBreakdown: CategorySlice[];
  refresh: () => void;
  lastUpdatedAt: string | null;
}

function dayKey(iso: string): string | null {
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return null;
  return new Date(parsed).toISOString().slice(0, 10);
}

function activityTitle(activityType?: string): string {
  if (!activityType) return 'Türü belirtilmemiş';
  const match = ACTIVITIES.find((a) => a.id === activityType);
  return match ? match.title : activityType;
}

/**
 * Gerçek arşiv koleksiyonunu okur. `saved_worksheets` her üretilen çalışma
 * kağıdı için bir doküman içerir (userId, category, activityType, createdAt).
 */
async function loadWorksheetRows(): Promise<WorksheetRow[]> {
  const snapshot = await getDocs(collection(db, 'saved_worksheets'));
  return snapshot.docs.map((docSnapshot) => {
    const data = docSnapshot.data();
    const category = data.category as { id?: string; title?: string } | undefined;
    return {
      createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
      activityType: typeof data.activityType === 'string' ? data.activityType : undefined,
      category,
    };
  });
}

function buildTrend(rows: WorksheetRow[]): AdminStatTrend[] {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    if (!row.createdAt) return;
    const key = dayKey(row.createdAt);
    if (!key) return;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const trend: AdminStatTrend[] = [];
  for (let i = TREND_DAYS - 1; i >= 0; i -= 1) {
    const key = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    trend.push({ date: key, value: counts.get(key) ?? 0, label: key.slice(5) });
  }
  return trend;
}

function buildAnalytics(rows: WorksheetRow[]): WorksheetAnalyticEntry[] {
  const groups = new Map<string, { title: string; count: number; lastAt: string }>();

  rows.forEach((row) => {
    const title = row.category?.title?.trim() || activityTitle(row.activityType);
    const entry = groups.get(title) ?? { title, count: 0, lastAt: '' };
    entry.count += 1;
    if (row.createdAt && row.createdAt > entry.lastAt) entry.lastAt = row.createdAt;
    groups.set(title, entry);
  });

  return [...groups.values()]
    .sort((a, b) => b.count - a.count)
    .map((group, index) => ({
      id: `worksheet-group-${index}`,
      date: group.lastAt ? group.lastAt.slice(0, 10) : '',
      count: group.count,
      templateId: `group-${index}`,
      templateName: group.title,
      useCount: group.count,
      popularityRank: index + 1,
    }));
}

export function useAdminStats(): UseAdminStatsReturn {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productionTrend, setProductionTrend] = useState<AdminStatTrend[]>([]);
  const [worksheetAnalytics, setWorksheetAnalytics] = useState<WorksheetAnalyticEntry[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategorySlice[]>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const [rows, metrics] = await Promise.all([
          loadWorksheetRows(),
          adminService.getAdminMetrics(),
        ]);
        if (cancelled) return;

        const todayKey = new Date().toISOString().slice(0, 10);
        const weekStart = Date.now() - 6 * 86400000;

        const todayCount = rows.filter((row) => row.createdAt && dayKey(row.createdAt) === todayKey).length;
        const weekCount = rows.filter((row) => {
          const parsed = row.createdAt ? Date.parse(row.createdAt) : Number.NaN;
          return !Number.isNaN(parsed) && parsed >= weekStart;
        }).length;

        setStats({
          totalUsers: metrics?.totalUsers ?? 0,
          activeUsers: metrics?.activeUsers ?? 0,
          totalWorksheets: rows.length,
          // "Bugün üretilen" — arşive bugün eklenen çalışma sayısı (gerçek kayıt sayısı)
          exportsToday: todayCount,
          exportsThisWeek: weekCount,
        });

        const analytics = buildAnalytics(rows);
        setProductionTrend(buildTrend(rows));
        setWorksheetAnalytics(analytics);
        setCategoryBreakdown(
          analytics.map((entry) => ({
            title: entry.templateName ?? 'Adsız',
            count: entry.count,
          })),
        );
        setLastUpdatedAt(new Date().toISOString());
      } catch (err: unknown) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        logError('Yönetici analitikleri yüklenemedi', { error: message });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return {
    stats,
    loading,
    error,
    productionTrend,
    worksheetAnalytics,
    categoryBreakdown,
    refresh,
    lastUpdatedAt,
  };
}
