import { motion } from 'framer-motion';
import { useScreeningAnalytics } from '../hooks/useScreeningAnalytics';
import { CATEGORY_LABELS } from '../../../data/screeningQuestions';
import type { EvaluationCategory } from '../../../types/screening';

const RISK_COLOR_MAP: Record<string, { text: string; bg: string }> = {
  emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500' },
  amber:   { text: 'text-amber-500',   bg: 'bg-amber-500' },
  rose:    { text: 'text-rose-500',    bg: 'bg-rose-500' },
};

export const AnalyticsPanel: React.FC = () => {
  const { analytics, categoryChartData, riskDistributionData, monthlyTrendData, hasData } =
    useScreeningAnalytics();

  if (!hasData || !analytics) {
    return (
      <div className="flex items-center justify-center h-64 text-[var(--text-muted)] text-sm font-medium">
        Analiz için yeterli veri bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)]"
        >
          <h3 className="text-sm font-black italic uppercase tracking-tighter text-[var(--text-primary)] mb-5">
            Risk Dağılımı
          </h3>
          <div className="space-y-4">
            {riskDistributionData.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {item.name}
                  </span>
                  <span className={`text-xs font-black ${RISK_COLOR_MAP[item.color]?.text ?? 'text-zinc-500'}`}>
                    {item.value} (%{item.percentage})
                  </span>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${RISK_COLOR_MAP[item.color]?.bg ?? 'bg-zinc-500'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)]"
        >
          <h3 className="text-sm font-black italic uppercase tracking-tighter text-[var(--text-primary)] mb-5">
            Bilişsel Alan Ortalamaları
          </h3>
          <div className="space-y-4">
            {(Object.keys(analytics.categoryAverages) as EvaluationCategory[]).map((cat) => {
              const score = analytics.categoryAverages[cat];
              const isLow = score < 50;
              const isMid = score >= 50 && score < 70;
              const barColor = isLow ? 'bg-rose-500' : isMid ? 'bg-amber-500' : 'bg-emerald-500';
              const textColor = isLow ? 'text-rose-500' : isMid ? 'text-amber-500' : 'text-emerald-500';
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                    <span className={`text-xs font-black ${textColor}`}>%{score}</span>
                  </div>
                  <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                      className={`h-full rounded-full ${barColor}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)]"
      >
        <h3 className="text-sm font-black italic uppercase tracking-tighter text-[var(--text-primary)] mb-5">
          Aylık Trend
        </h3>
        {monthlyTrendData.length > 0 ? (
          <div className="space-y-3">
            {monthlyTrendData.map((m, i) => (
              <div key={m.month} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    {m.month}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-[var(--text-muted)]">{m.count} tarama</span>
                    <span className="text-xs font-black text-[var(--text-primary)]">%{m.avgScore}</span>
                  </div>
                </div>
                <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.avgScore}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[var(--accent-color)] to-purple-500"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--text-muted)] font-medium text-center py-4">
            Aylık veri bulunmuyor.
          </p>
        )}
      </motion.div>
    </div>
  );
};
