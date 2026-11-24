import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AdminTab, DynamicActivity, PromptTemplate, ActivityDraft } from '../../types/admin';
import { ActivityStats } from '../../types';
import { adminService } from '../../services/adminService';
import { statsService } from '../../services/statsService';
import { ACTIVITIES, ACTIVITY_CATEGORIES } from '../../constants';
import { useToastStore } from '../../store/useToastStore';

interface AdminContentEngineProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

interface StatCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  accent: string;
  trend?: 'up' | 'down';
}

interface ServiceHealthItem {
  label: string;
  status: 'operational' | 'degraded';
  metric: string;
  detail: string;
}

export const AdminContentEngine: React.FC<AdminContentEngineProps> = ({ onNavigateTab }) => {
  const toast = useToastStore();
  const [activities, setActivities] = useState<DynamicActivity[]>([]);
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [drafts, setDrafts] = useState<ActivityDraft[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats[]>([]);
  const [adminMetrics, setAdminMetrics] = useState<{
    totalUsers: number;
    activeUsers: number;
    totalWorksheets: number;
    exportsToday: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchLatencyMs, setFetchLatencyMs] = useState<number>(0);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [logSearch, setLogSearch] = useState('');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const [actsRes, promptsRes, draftsRes, statsRes, metricsRes] = await Promise.allSettled([
        adminService.getAllActivities(),
        adminService.getAllPrompts(),
        adminService.getAllDrafts(),
        statsService.getAllStats(),
        adminService.getAdminMetrics(),
      ]);

      if (actsRes.status === 'fulfilled') setActivities(actsRes.value);
      if (promptsRes.status === 'fulfilled') setPrompts(promptsRes.value);
      if (draftsRes.status === 'fulfilled') setDrafts(draftsRes.value);
      if (statsRes.status === 'fulfilled') setActivityStats(statsRes.value);
      if (metricsRes.status === 'fulfilled' && metricsRes.value) {
        setAdminMetrics({
          totalUsers: metricsRes.value.totalUsers,
          activeUsers: metricsRes.value.activeUsers,
          totalWorksheets: metricsRes.value.totalWorksheets,
          exportsToday: metricsRes.value.exportsToday,
        });
      }
      setFetchLatencyMs(Math.round(performance.now() - start));
      setLastSyncedAt(new Date().toLocaleTimeString('tr-TR'));
    } catch {
      toast.error('İçerik motoru verileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const computedMetrics = useMemo(() => {
    const totalCatalog = ACTIVITIES.length;
    const dynamicCount = activities.length;
    const activeGenerators = dynamicCount > 0 ? activities.filter((a) => a.isActive).length : totalCatalog;
    const aiOnlyCount = activities.filter((a) => a.engineConfig?.mode === 'ai_only').length;
    const hybridCount = activities.filter((a) => a.engineConfig?.mode === 'hybrid').length;
    const totalGenerations = activityStats.reduce((sum, s) => sum + (s.generationCount || 0), 0);
    const promptCoverage = totalCatalog > 0 ? Math.min(100, Math.round((prompts.length / totalCatalog) * 100)) : 0;

    return {
      totalCatalog,
      dynamicCount,
      activeGenerators,
      aiOnlyCount,
      hybridCount,
      promptCount: prompts.length,
      promptCoverage,
      pendingDrafts: drafts.length,
      totalGenerations,
    };
  }, [activities, prompts, drafts, activityStats]);

  const sortedStats = useMemo(() => {
    const q = logSearch.trim().toLowerCase();
    return [...activityStats]
      .filter((s) => !q || (s.title || s.activityId).toLowerCase().includes(q) || s.activityId.toLowerCase().includes(q))
      .sort((a, b) => new Date(b.lastGenerated || 0).getTime() - new Date(a.lastGenerated || 0).getTime());
  }, [activityStats, logSearch]);

  const statsCards: StatCard[] = [
    {
      label: 'Katalog & Dinamik',
      value: `${computedMetrics.dynamicCount || computedMetrics.totalCatalog}`,
      sub: `${computedMetrics.activeGenerators} aktif · ${computedMetrics.totalCatalog} sabit`,
      icon: 'fa-cubes',
      accent: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Prompt Kapsamı',
      value: `${computedMetrics.promptCount}`,
      sub: `%${computedMetrics.promptCoverage} katalog kapsamı`,
      icon: 'fa-terminal',
      accent: 'from-amber-500 to-orange-600',
      trend: computedMetrics.promptCount > 0 ? 'up' : undefined,
    },
    {
      label: 'Toplam Üretim',
      value: computedMetrics.totalGenerations.toLocaleString('tr-TR'),
      sub: `${adminMetrics?.totalWorksheets ?? 0} kayıtlı çalışma`,
      icon: 'fa-microchip',
      accent: 'from-emerald-500 to-teal-600',
      trend: computedMetrics.totalGenerations > 0 ? 'up' : undefined,
    },
    {
      label: 'OCR & Taslak Havuzu',
      value: `${computedMetrics.pendingDrafts}`,
      sub: `${fetchLatencyMs}ms yanıt süresi`,
      icon: 'fa-camera-rotate',
      accent: 'from-purple-500 to-fuchsia-600',
    },
  ];

  const quickLinks: Array<{ tab: AdminTab; label: string; icon: string; desc: string; badge?: string }> = [
    {
      tab: 'activities',
      label: 'Aktivite Yöneticisi',
      icon: 'fa-layer-group',
      desc: 'Aktiviteleri düzenle, aç/kapa, pedagojik beceri ve AI modu ata',
      badge: `${computedMetrics.activeGenerators} aktif`,
    },
    {
      tab: 'prompts',
      label: 'Prompt Stüdyosu',
      icon: 'fa-terminal',
      desc: 'AI promptlarını düzenle, canlı simüle et, stress test ve versiyonla',
      badge: `${computedMetrics.promptCount} DNA`,
    },
    {
      tab: 'drafts',
      label: 'OCR Taslakları',
      icon: 'fa-camera-rotate',
      desc: 'Vision OCR ile taranan çalışma kağıtlarını onayla ve yayınla',
      badge: computedMetrics.pendingDrafts > 0 ? `${computedMetrics.pendingDrafts} bekleyen` : undefined,
    },
    {
      tab: 'static_content',
      label: 'Veri Kaynakları (CMS)',
      icon: 'fa-database',
      desc: 'Statik içerik havuzunu, snapshot versiyonlarını ve JSON verilerini yönet',
    },
  ];

  const pipelineHealth: ServiceHealthItem[] = [
    {
      label: 'Firestore Senkronu',
      status: fetchLatencyMs > 0 && fetchLatencyMs < 4000 ? 'operational' : 'degraded',
      metric: `${fetchLatencyMs}ms`,
      detail: lastSyncedAt ? `Son: ${lastSyncedAt}` : 'Bekleniyor',
    },
    {
      label: 'Aktif Üretici Oranı',
      status: computedMetrics.activeGenerators > 0 ? 'operational' : 'degraded',
      metric: `${computedMetrics.activeGenerators}/${computedMetrics.dynamicCount || computedMetrics.totalCatalog}`,
      detail: `${computedMetrics.aiOnlyCount} AI · ${computedMetrics.hybridCount} Hibrit`,
    },
    {
      label: 'Kullanıcı & Paylaşım',
      status: 'operational',
      metric: `${adminMetrics?.activeUsers ?? 0}/${adminMetrics?.totalUsers ?? 0} aktif`,
      detail: `Bugün ~${adminMetrics?.exportsToday ?? 0} dışa aktarım`,
    },
  ];

  const handleNavigate = (tab: AdminTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
      return;
    }
    localStorage.setItem('admin_active_tab', tab);
    toast.info('Sekme güncellendi');
  };

  const handleExportReport = () => {
    const report = {
      exportedAt: new Date().toISOString(),
      metrics: computedMetrics,
      adminMetrics,
      fetchLatencyMs,
      topActivities: sortedStats.slice(0, 20),
      categories: ACTIVITY_CATEGORIES.map((cat) => ({
        id: cat.id,
        title: cat.title,
        catalogCount: cat.activities.length,
        dynamicCount: activities.filter((a) => a.category === cat.id).length,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icerik_motoru_raporu_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('İçerik motoru raporu JSON olarak indirildi.');
  };

  return (
    <div className="space-y-6 font-lexend">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 md:p-10 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent-color)] opacity-10 blur-[120px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Canlı Telemetri Aktif
              </span>
              {lastSyncedAt && (
                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                  Senkron: {lastSyncedAt}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] uppercase tracking-tighter mb-2">
              İçerik Motoru
            </h1>
            <p className="text-[var(--text-secondary)] text-sm font-medium max-w-2xl">
              AI ve offline üretim altyapısının merkezi kontrol paneli. Gerçek zamanlı katalog sağlığı,
              prompt kapsamı ve aktivite istatistiklerini tek merkezden yönetin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-color)] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <i className={`fa-solid fa-rotate ${loading ? 'fa-spin' : ''}`} />
              Yenile
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2.5 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-[var(--accent-color)] text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <i className="fa-solid fa-file-export" />
              JSON Rapor
            </button>
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 rounded-xl bg-[var(--accent-color)] text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg hover:opacity-90 transition-all"
            >
              <i className="fa-solid fa-print" />
              Yazdır
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((s, i) => (
            <div
              key={i}
              className="relative group rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 overflow-hidden hover:border-[var(--accent-color)] transition-all duration-300 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.accent} flex items-center justify-center text-white shadow-md`}>
                  <i className={`fa-solid ${s.icon}`} />
                </div>
                {s.trend === 'up' && <i className="fa-solid fa-arrow-trend-up text-emerald-500 text-lg" />}
              </div>
              <h3 className="text-2xl font-black text-[var(--text-primary)] tabular-nums">{s.value}</h3>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">{s.label}</span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">· {s.sub}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links + Real Activity Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-2 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-4 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-[var(--accent-color)]" />
            Stüdyo Geçişleri
          </h3>
          {quickLinks.map((link) => (
            <button
              key={link.tab}
              onClick={() => handleNavigate(link.tab)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)] hover:shadow-md transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-muted)] flex items-center justify-center text-[var(--accent-color)] group-hover:scale-110 transition-transform shrink-0">
                <i className={`fa-solid ${link.icon}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight truncate">
                    {link.label}
                  </span>
                  {link.badge && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-muted)] text-[var(--accent-color)] shrink-0">
                      {link.badge}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-medium mt-0.5 line-clamp-1">{link.desc}</p>
              </div>
              <i className="fa-solid fa-chevron-right text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors text-xs" />
            </button>
          ))}
        </div>

        {/* Real Activity Production Log */}
        <div className="lg:col-span-3 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-purple-500" />
              Aktivite Üretim Kayıtları ({sortedStats.length})
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Aktivite filtrele..."
                className="px-3 py-1.5 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
              />
              {sortedStats.length > 5 && (
                <button
                  onClick={() => setShowAllLogs((v) => !v)}
                  className="text-[10px] text-[var(--accent-color)] font-black uppercase tracking-widest hover:opacity-80 transition-opacity"
                >
                  {showAllLogs ? 'Daralt' : `Tümü (${sortedStats.length})`}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2 flex-1">
            {sortedStats.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[var(--bg-paper)] border border-dashed border-[var(--border-color)] text-center">
                <i className="fa-solid fa-wave-square text-2xl text-[var(--text-muted)] mb-2 block opacity-50" />
                <p className="text-xs font-bold text-[var(--text-secondary)]">Henüz üretim kaydı bulunamadı</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  Öğretmenler çalışma kağıdı ürettikçe `activity_stats` verileri burada canlı listelenir.
                </p>
              </div>
            ) : (
              sortedStats.slice(0, showAllLogs ? sortedStats.length : 5).map((stat) => (
                <div
                  key={stat.activityId}
                  className="flex items-center gap-4 p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-circle-check text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text-primary)] truncate">
                        {stat.title || stat.activityId}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] font-mono">
                        {stat.activityId}
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                      Son üretim: {stat.lastGenerated ? new Date(stat.lastGenerated).toLocaleString('tr-TR') : '—'}
                      {stat.avgCompletionTime ? ` · ~${stat.avgCompletionTime} dk` : ''}
                    </p>
                  </div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[var(--accent-muted)] text-[var(--accent-color)] tabular-nums shrink-0">
                    {stat.generationCount} üretim
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category Coverage + Pipeline Health */}
      <div className="rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-emerald-500" />
            Sistem & Kategori Sağlığı (Canlı)
          </h3>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {ACTIVITY_CATEGORIES.length} Ana Kategori · {ACTIVITIES.length} Yerleşik Modül
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pipelineHealth.map((svc, i) => (
            <div key={i} className="p-5 rounded-2xl bg-[var(--bg-paper)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-tight">{svc.label}</span>
                <span
                  className={`flex items-center gap-1.5 text-[10px] font-black uppercase ${
                    svc.status === 'operational' ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${svc.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {svc.status === 'operational' ? 'Aktif' : 'Yavaş'}
                </span>
              </div>
              <div className="text-lg font-black text-[var(--text-primary)] tabular-nums">{svc.metric}</div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1">{svc.detail}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
          {ACTIVITY_CATEGORIES.map((cat) => {
            const dynCount = activities.filter((a) => a.category === cat.id).length;
            return (
              <div key={cat.id} className="p-3 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)]">
                <div className="flex items-center gap-2 mb-1">
                  <i className={`${cat.icon} text-[var(--accent-color)] text-xs`} />
                  <span className="text-[10px] font-black text-[var(--text-primary)] truncate">{cat.title}</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-mono">
                  {cat.activities.length} katalog · {dynCount} dinamik
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

AdminContentEngine.displayName = 'AdminContentEngine';
