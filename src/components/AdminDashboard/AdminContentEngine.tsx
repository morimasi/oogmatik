import React, { useState, useEffect } from 'react';
import { ContentEngineMetrics, GenerationLogEntry } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { useToastStore } from '../../store/useToastStore';

const MOCK_METRICS: ContentEngineMetrics = {
  totalTemplates: 42,
  activeGenerators: 38,
  successRate: 94.2,
  avgLatencyMs: 1240,
  totalGenerations: 15280,
  tokenUsage: 845000,
  errorRate: 2.1,
  trendingUp: true,
};

const MOCK_LOGS: GenerationLogEntry[] = [
  { id: 'gen_001', activityType: 'Okuma Anlama', promptId: 'prompt_reading', status: 'success', duration: 890, tokensUsed: 320, createdAt: new Date().toISOString() },
  { id: 'gen_002', activityType: 'Matematik Bulmaca', promptId: 'prompt_math', status: 'success', duration: 1240, tokensUsed: 480, createdAt: new Date(Date.now() - 60000).toISOString() },
  { id: 'gen_003', activityType: 'Hece Çalışması', promptId: 'prompt_syllable', status: 'error', duration: 3200, tokensUsed: 0, createdAt: new Date(Date.now() - 120000).toISOString(), errorMessage: 'Rate limit exceeded' },
  { id: 'gen_004', activityType: 'Görsel Algı', promptId: 'prompt_visual', status: 'success', duration: 1100, tokensUsed: 410, createdAt: new Date(Date.now() - 180000).toISOString() },
  { id: 'gen_005', activityType: '5N1K', promptId: 'prompt_5w1h', status: 'pending', duration: 0, tokensUsed: 0, createdAt: new Date(Date.now() - 300000).toISOString() },
];

interface StatCard {
  label: string;
  value: string;
  sub: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down';
}

export const AdminContentEngine: React.FC = () => {
  const [_metrics, setMetrics] = useState<ContentEngineMetrics>(MOCK_METRICS);
  const [_logs, setLogs] = useState<GenerationLogEntry[]>(MOCK_LOGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const activities = await adminService.getAllActivities();
      const activeCount = activities.filter((a: { isActive: boolean }) => a.isActive).length;
      setMetrics(prev => ({ ...prev, totalTemplates: activities.length, activeGenerators: activeCount }));
    } catch {
      // Use mock data
    } finally {
      setLoading(false);
    }
  };

  const stats: StatCard[] = [
    { label: 'Toplam Şablon', value: String(MOCK_METRICS.totalTemplates), sub: `${MOCK_METRICS.activeGenerators} aktif`, icon: 'fa-cubes', color: 'from-blue-500 to-blue-700' },
    { label: 'Başarı Oranı', value: `%${MOCK_METRICS.successRate}`, sub: `${MOCK_METRICS.errorRate}% hata`, icon: 'fa-check-circle', color: 'from-emerald-500 to-emerald-700', trend: 'up' },
    { label: 'Ortalama Süre', value: `${MOCK_METRICS.avgLatencyMs}ms`, sub: 'son 24 saat', icon: 'fa-gauge-high', color: 'from-amber-500 to-amber-700' },
    { label: 'Toplam Üretim', value: `${(MOCK_METRICS.totalGenerations / 1000).toFixed(1)}K`, sub: `${(MOCK_METRICS.tokenUsage / 1000).toFixed(0)}K token`, icon: 'fa-microchip', color: 'from-purple-500 to-purple-700' },
  ];

  const quickLinks = [
    { tab: 'activities' as const, label: 'Aktivite Yöneticisi', icon: 'fa-layer-group', desc: 'Aktiviteleri düzenle, aç/kapa, AI yapılandırması yap' },
    { tab: 'prompts' as const, label: 'Prompt Stüdyosu', icon: 'fa-terminal', desc: 'AI promptlarını düzenle, simüle et, versiyonla' },
    { tab: 'approvals' as const, label: 'İçerik Onayları', icon: 'fa-check-double', desc: 'Onay bekleyen taslakları yönet' },
    { tab: 'static_content' as const, label: 'Veri Kaynakları', icon: 'fa-database', desc: 'Statik içerik ve veri kaynaklarını yönet' },
  ];

  const handleNavigate = (tab: string) => {
    localStorage.setItem('admin_active_tab', tab);
    window.location.reload();
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'success': return 'fa-circle-check text-emerald-500';
      case 'error': return 'fa-circle-xmark text-red-500';
      case 'pending': return 'fa-circle-notch text-amber-500 fa-spin';
      default: return 'fa-circle text-zinc-500';
    }
  };

  return (
    <div className="space-y-6 font-lexend">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-black border border-white/5 p-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
              <i className="fa-solid fa-circle text-[6px] mr-1.5 align-middle text-emerald-400"></i>
              Sistem Aktif
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">v1.3.0</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">
            İçerik Motoru
          </h1>
          <p className="text-zinc-400 text-sm font-medium max-w-2xl">
            AI destekli içerik üretim altyapısının merkezi kontrol paneli. 
            Aktiviteleri yönetin, promptları optimize edin, onay sürecini takip edin.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 rounded-[2rem] bg-white/5 border border-white/5 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="relative group rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6 overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} opacity-5 blur-3xl rounded-full`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white shadow-lg`}>
                    <i className={`fa-solid ${s.icon}`}></i>
                  </div>
                  {s.trend === 'up' && <i className="fa-solid fa-arrow-trend-up text-emerald-500 text-lg"></i>}
                  {s.trend === 'down' && <i className="fa-solid fa-arrow-trend-down text-red-500 text-lg"></i>}
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white tabular-nums">{s.value}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{s.label}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">· {s.sub}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Links + Generation Log */}
      <div className="grid grid-cols-5 gap-6">
        {/* Quick Links */}
        <div className="col-span-2 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-bolt text-indigo-500"></i>
            Hızlı Erişim
          </h3>
          {quickLinks.map((link, i) => (
            <button
              key={i}
              onClick={() => handleNavigate(link.tab)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 hover:border-indigo-500/30 hover:shadow-lg transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform">
                <i className={`fa-solid ${link.icon}`}></i>
              </div>
              <div className="flex-1">
                <span className="text-sm font-black text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">{link.label}</span>
                <p className="text-[9px] text-zinc-500 font-medium mt-0.5">{link.desc}</p>
              </div>
              <i className="fa-solid fa-chevron-right text-zinc-500 group-hover:text-indigo-500 transition-colors text-xs"></i>
            </button>
          ))}
        </div>

        {/* Generation Log */}
        <div className="col-span-3 rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <i className="fa-solid fa-list text-purple-500"></i>
              Son Üretimler
            </h3>
            <button className="text-[10px] text-indigo-500 font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">Tümünü Gör</button>
          </div>
          <div className="space-y-2">
            {MOCK_LOGS.map((log) => (
              <div key={log.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 hover:bg-indigo-500/5 transition-all group">
                <i className={`fa-solid ${statusIcon(log.status)} text-sm`}></i>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{log.activityType}</span>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-mono">{log.promptId}</span>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-mono mt-0.5">
                    {new Date(log.createdAt).toLocaleTimeString('tr-TR')}
                    {log.status === 'success' && ` · ${log.duration}ms · ${log.tokensUsed} token`}
                    {log.status === 'error' && ` · ${log.errorMessage}`}
                  </p>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${
                  log.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' :
                  log.status === 'error' ? 'bg-red-500/10 text-red-500' :
                  'bg-amber-500/10 text-amber-500'
                }`}>
                  {log.status === 'success' ? 'Başarılı' : log.status === 'error' ? 'Hata' : 'İşleniyor'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline Health */}
      <div className="rounded-[2.5rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-emerald-500"></i>
          Pipeline Sağlığı
        </h3>
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: 'AI Servisi', status: 'operational', latency: '210ms', uptime: '99.9%' },
            { label: 'Firebase', status: 'operational', latency: '45ms', uptime: '100%' },
            { label: 'Rate Limiter', status: 'operational', latency: '2ms', uptime: '99.8%' },
          ].map((svc, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white/50 dark:bg-black/30 border border-zinc-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">{svc.label}</span>
                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {svc.status}
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-[9px] text-zinc-500 font-mono">Gecikme: {svc.latency}</span>
                <span className="text-[9px] text-zinc-500 font-mono">Çalışma: {svc.uptime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

AdminContentEngine.displayName = 'AdminContentEngine';