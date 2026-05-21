import { motion } from 'framer-motion';
import { Users, AlertCircle, TrendingUp, Clock, Plus, Eye } from 'lucide-react';
import { useScreeningAssessment } from '../hooks/useScreeningAssessment';
import { ScreeningStatsCard } from '../components/shared/ScreeningStatsCard';
import { RiskBadge } from '../components/shared/RiskBadge';
import type { ScreeningResult } from '../../../types/screening';

export const DashboardPanel: React.FC = () => {
  const {
    filteredData,
    screeningData,
    setActiveView,
    setCurrentScreening,
    getScoreColor,
  } = useScreeningAssessment();

  const highRisk = screeningData.filter((s: ScreeningResult) => s.riskLevel === 'high').length;
  const avgScore = screeningData.length
    ? Math.round(screeningData.reduce((s: number, r: ScreeningResult) => s + r.overallScore, 0) / screeningData.length)
    : 0;
  const pendingCount = screeningData.filter((s: ScreeningResult) => s.status === 'pending').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <ScreeningStatsCard
          icon={Users}
          value={screeningData.length}
          label="Toplam Tarama"
          sublabel="Tüm Zamanlar"
          color="text-blue-500"
          iconBg="bg-blue-500/10"
        />
        <ScreeningStatsCard
          icon={AlertCircle}
          value={highRisk}
          label="Yüksek Risk"
          sublabel="Müdahale Gerekli"
          color="text-rose-500"
          iconBg="bg-rose-500/10"
        />
        <ScreeningStatsCard
          icon={TrendingUp}
          value={`%${avgScore}`}
          label="Ortalama Skor"
          sublabel="Genel Başarı"
          color="text-emerald-500"
          iconBg="bg-emerald-500/10"
        />
        <ScreeningStatsCard
          icon={Clock}
          value={pendingCount}
          label="Bekleyen"
          sublabel="Değerlendirme"
          color="text-purple-500"
          iconBg="bg-purple-500/10"
        />
      </div>

      <div className="bg-[var(--bg-paper)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
          <h3 className="text-base font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
            Son Taramalar
          </h3>
          <button
            onClick={() => setActiveView('new-screening')}
            className="px-4 py-2 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Yeni Tarama
          </button>
        </div>
        <div className="divide-y divide-[var(--border-color)]">
          {filteredData.slice(0, 5).map((item: ScreeningResult, i: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-4 hover:bg-[var(--surface-glass)] transition-colors cursor-pointer"
              onClick={() => {
                setCurrentScreening(item);
                setActiveView('result-detail');
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 bg-[var(--bg-secondary)] rounded-lg flex items-center justify-center border border-[var(--border-color)] shrink-0">
                    <Users className="w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-[var(--text-primary)] truncate">{item.studentName}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {item.age} yaş · {item.grade}. sınıf
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`text-base font-black ${getScoreColor(item.overallScore)}`}>
                      %{item.overallScore}
                    </p>
                    <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                      {new Date(item.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <RiskBadge level={item.riskLevel} />
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] border border-[var(--border-color)] flex items-center justify-center transition-all">
                    <Eye className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredData.length === 0 && (
            <div className="p-8 text-center text-sm text-[var(--text-muted)] font-medium">
              Henüz tarama kaydı bulunmuyor.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
