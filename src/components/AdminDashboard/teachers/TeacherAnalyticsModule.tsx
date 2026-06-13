import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, PieChart, Calendar, Activity, Target, Download } from 'lucide-react';
import { TeacherDetail, TeacherActivityType } from '../../../types/teacher';
import { ACTIVITY_LABELS, ACTIVITY_ICONS, ACTIVITY_COLORS, MONTH_NAMES } from './constants';

interface TeacherAnalyticsModuleProps {
  teacher: TeacherDetail;
}

export const TeacherAnalyticsModule: React.FC<TeacherAnalyticsModuleProps> = ({ teacher }) => {
  const [trendMetric, setTrendMetric] = useState<'all' | 'worksheets' | 'assessments' | 'plans'>('all');

  const activityTypeData = useMemo(() => {
    return (Object.entries(teacher.analytics.activityByType) as [TeacherActivityType, number][])
      .filter(([_, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [teacher]);

  const total = useMemo(() => activityTypeData.reduce((s, [_, v]) => s + v, 0), [activityTypeData]);

  const monthlyFiltered = useMemo(() => {
    if (trendMetric === 'all') return teacher.analytics.monthlyTrend;
    return teacher.analytics.monthlyTrend.map(m => ({
      month: m.month,
      worksheets: trendMetric === 'worksheets' ? m.worksheets : 0,
      assessments: trendMetric === 'assessments' ? m.assessments : 0,
      plans: trendMetric === 'plans' ? m.plans : 0,
    }));
  }, [teacher.analytics.monthlyTrend, trendMetric]);

  const monthlyMax = useMemo(() => Math.max(...monthlyFiltered.map(m => m.worksheets + m.assessments + m.plans), 1), [monthlyFiltered]);

  const exportReport = () => {
    const lines = [`Öğretmen Analiz Raporu - ${teacher.user.name}`, `Tarih: ${new Date().toLocaleDateString('tr-TR')}`, ''];
    lines.push('=== Aktivite Dağılımı ===');
    activityTypeData.forEach(([type, count]) => {
      lines.push(`${ACTIVITY_LABELS[type] || type}: ${count}`);
    });
    lines.push('');
    lines.push('=== Aylık Trend ===');
    lines.push('Ay, Çalışma Kağıdı, Değerlendirme, Plan');
    teacher.analytics.monthlyTrend.forEach(m => {
      const monthName = MONTH_NAMES[parseInt(m.month.split('-')[1]) - 1] || m.month;
      lines.push(`${monthName}, ${m.worksheets}, ${m.assessments}, ${m.plans}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analiz_raporu_${teacher.user.name}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-5">
      {/* Activity Distribution */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {activityTypeData.map(([type, count], idx) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-5 shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-9 h-9 rounded-xl ${ACTIVITY_COLORS[type]} flex items-center justify-center text-white shadow-lg`}>
                  <i className={`fa-solid ${ACTIVITY_ICONS[type]} text-sm`} />
                </div>
              </div>
              <p className="text-2xl font-black text-[var(--text-primary)]">{count}</p>
              <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{ACTIVITY_LABELS[type]}</p>
              <div className="mt-2 h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${ACTIVITY_COLORS[type]}`} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-[8px] font-bold text-zinc-400 mt-1">%{pct}</p>
            </motion.div>
          );
        })}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: activityTypeData.length * 0.08 }}
          className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2rem] p-5 shadow-lg"
        >
          <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mb-1">Toplam</p>
          <p className="text-3xl font-black text-white">{total}</p>
          <p className="text-[9px] font-black text-white/70 uppercase tracking-widest mt-1">Tüm Aktiviteler</p>
        </motion.div>
      </div>

      {/* Monthly Trend Chart */}
      <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" /> Aylık Üretim Trendi
          </h3>
          <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-0.5 border border-[var(--border-color)]">
            {([
              { key: 'all' as const, label: 'Tümü' },
              { key: 'worksheets' as const, label: 'ÇK' },
              { key: 'assessments' as const, label: 'Dğrl.' },
              { key: 'plans' as const, label: 'Plan' },
            ]).map(opt => (
              <button key={opt.key} onClick={() => setTrendMetric(opt.key)} className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${trendMetric === opt.key ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>{opt.label}</button>
            ))}
          </div>
        </div>
        <div className="flex items-end gap-3 h-44">
          {monthlyFiltered.map((m, idx) => {
            const val = m.worksheets + m.assessments + m.plans;
            const height = Math.max((val / monthlyMax) * 100, 4);
            const monthName = MONTH_NAMES[parseInt(m.month.split('-')[1]) - 1] || m.month;
            const shortName = monthName.substring(0, 3);
            return (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5 group">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[8px] font-black text-[var(--text-primary)] bg-[var(--bg-secondary)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">{val}</div>
                <div className="w-full relative rounded-lg overflow-hidden" style={{ height: '120px', background: 'var(--bg-secondary)' }}>
                  {trendMetric === 'all' ? (
                    <div className="absolute bottom-0 w-full flex flex-col-reverse transition-all duration-500">
                      {m.worksheets > 0 && <div className="w-full bg-blue-500 transition-all duration-500" style={{ height: `${(m.worksheets / monthlyMax) * 100}%` }} />}
                      {m.assessments > 0 && <div className="w-full bg-amber-500 transition-all duration-500" style={{ height: `${(m.assessments / monthlyMax) * 100}%` }} />}
                      {m.plans > 0 && <div className="w-full bg-indigo-500 transition-all duration-500" style={{ height: `${(m.plans / monthlyMax) * 100}%` }} />}
                    </div>
                  ) : (
                    <div className="absolute bottom-0 w-full transition-all duration-500" style={{ height: `${height}%`, background: trendMetric === 'worksheets' ? 'linear-gradient(to top, #3b82f6, #60a5fa)' : trendMetric === 'assessments' ? 'linear-gradient(to top, #f59e0b, #fbbf24)' : 'linear-gradient(to top, #6366f1, #818cf8)' }} />
                  )}
                </div>
                <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">{shortName}</span>
              </div>
            );
          })}
        </div>
        {trendMetric === 'all' && (
          <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500" /><span className="text-[8px] font-bold text-zinc-400">Çalışma Kağıdı</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-500" /><span className="text-[8px] font-bold text-zinc-400">Değerlendirme</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-indigo-500" /><span className="text-[8px] font-bold text-zinc-400">Plan</span></div>
          </div>
        )}
      </div>

      {/* Performance & Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg">
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
            <Target className="w-3.5 h-3.5 text-indigo-500" /> Performans Özeti
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Ortalama Öğrenci Puanı', value: `%${teacher.analytics.avgStudentScore}`, sub: `${teacher.analytics.totalAssessments} değerlendirme üzerinden`, trend: teacher.analytics.avgStudentScore >= 50 ? 'up' : 'down' },
              { label: 'Aktif Öğrenci Oranı', value: `${Math.round((teacher.analytics.activeStudents / Math.max(teacher.analytics.totalStudents, 1)) * 100)}%`, sub: `${teacher.analytics.activeStudents}/${teacher.analytics.totalStudents}`, trend: teacher.analytics.activeStudents / Math.max(teacher.analytics.totalStudents, 1) >= 0.5 ? 'up' : 'down' },
              { label: 'Aylık Ortalama Üretim', value: `${Math.round(teacher.analytics.monthlyTrend.reduce((s, m) => s + m.worksheets + m.assessments + m.plans, 0) / Math.max(teacher.analytics.monthlyTrend.length, 1))}`, sub: 'son 6 ay', trend: 'up' },
            ].map(item => (
              <div key={item.label} className="p-3.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">{item.label}</p>
                  {item.trend === 'up' ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-rose-500" />}
                </div>
                <p className="text-xl font-black text-[var(--text-primary)]">{item.value}</p>
                <p className="text-[8px] font-bold text-zinc-400">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg">
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
            <Calendar className="w-3.5 h-3.5 text-amber-500" /> Aktivite Detayları
          </h3>
          <div className="space-y-3">
            {activityTypeData.map(([type, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={type}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <i className={`fa-solid ${ACTIVITY_ICONS[type]} text-[8px]`} /> {ACTIVITY_LABELS[type]}
                    </span>
                    <span className="text-[10px] font-black text-[var(--text-primary)]">{count} <span className="text-[8px] text-zinc-400 font-bold">(%{pct})</span></span>
                  </div>
                  <div className="h-2 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${ACTIVITY_COLORS[type]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trend Table */}
      <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden shadow-lg">
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Aylık Dağılım Tablosu
          </h3>
          <button onClick={exportReport} className="px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-xl text-[8px] font-black uppercase tracking-widest border border-[var(--border-color)] transition-all inline-flex items-center gap-1.5">
            <Download className="w-3 h-3" /> Raporu Dışa Aktar
          </button>
        </div>
        <div className="overflow-x-auto pb-2">
          <table className="w-full">
            <thead>
              <tr className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="text-left p-3 pl-6">Ay</th>
                <th className="text-center p-3">Çalışma Kağıdı</th>
                <th className="text-center p-3">Değerlendirme</th>
                <th className="text-center p-3">Plan</th>
                <th className="text-center p-3 pr-6">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {teacher.analytics.monthlyTrend.map((m) => {
                const monthName = MONTH_NAMES[parseInt(m.month.split('-')[1]) - 1] || m.month;
                const total = m.worksheets + m.assessments + m.plans;
                const prevTotal = teacher.analytics.monthlyTrend[
                  Math.max(0, teacher.analytics.monthlyTrend.findIndex(x => x.month === m.month) - 1)
                ];
                const change = prevTotal ? total - (prevTotal.worksheets + prevTotal.assessments + prevTotal.plans) : 0;
                return (
                  <tr key={m.month} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                    <td className="p-3 pl-6 text-[10px] font-bold text-[var(--text-primary)]">{monthName}</td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded text-[9px] font-black">{m.worksheets}</span></td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded text-[9px] font-black">{m.assessments}</span></td>
                    <td className="p-3 text-center"><span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-[9px] font-black">{m.plans}</span></td>
                    <td className="p-3 pr-6 text-center">
                      <span className="text-[10px] font-black text-[var(--text-primary)]">{total}</span>
                      {change !== 0 && (
                        <span className={`ml-1.5 text-[8px] font-black ${change > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {change > 0 ? '↑' : '↓'} {Math.abs(change)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
