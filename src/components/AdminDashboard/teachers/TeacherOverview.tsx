import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, TrendingUp, Users, FileText, Award, ArrowRight, Calendar } from 'lucide-react';
import { TeacherDetail, TeacherActivity } from '../../../types/teacher';
import { ACTIVITY_LABELS, ACTIVITY_ICONS, ACTIVITY_COLORS, ACTIVITY_BG_COLORS } from './constants';
import { teacherService } from '../../../services/teacherService';
import { ActivityPreviewModal } from './ActivityPreviewModal';

interface TeacherOverviewProps {
  teacher: TeacherDetail;
}

export const TeacherOverview: React.FC<TeacherOverviewProps> = ({ teacher }) => {
  const t = teacher;
  const [preview, setPreview] = useState<{ type: string; id: string } | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const stats = useMemo(() => [
    { label: 'Öğrenci', value: t.analytics.totalStudents, icon: 'fa-user-graduate', color: 'from-blue-500 to-blue-600', detail: `${t.analytics.activeStudents} aktif` },
    { label: 'Çalışma Kağıdı', value: t.analytics.totalWorksheets, icon: 'fa-file-pen', color: 'from-emerald-500 to-emerald-600', detail: 'toplam üretim' },
    { label: 'Değerlendirme', value: t.analytics.totalAssessments, icon: 'fa-clipboard-check', color: 'from-amber-500 to-amber-600', detail: `ort. %${t.analytics.avgStudentScore}` },
    { label: 'Plan', value: t.analytics.totalPlans, icon: 'fa-graduation-cap', color: 'from-indigo-500 to-indigo-600', detail: 'müfredat planı' },
  ], [t]);

  const handleActivityClick = async (act: TeacherActivity) => {
    if (!act.targetId) return;
    setPreview({ type: act.type, id: act.targetId });
    setPreviewLoading(true);
    const data = await teacherService.getActivityPreview(act.type, act.targetId);
    setPreviewData(data);
    setPreviewLoading(false);
  };

  const maxVal = useMemo(() => Math.max(...t.analytics.dailyActivity.map(d => d.count), 1), [t]);

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-5 shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${stat.icon}`} />
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-3xl font-black text-[var(--text-primary)]">{stat.value}</p>
            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5">{stat.label}</p>
            <p className="text-[8px] font-bold text-[var(--text-muted)]/60 mt-0.5">{stat.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Daily Activity + Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-500" /> Son 7 Gün Aktivite
            </h3>
            <div className="flex items-center gap-1 text-[8px] font-bold text-[var(--text-muted)]">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              {t.analytics.dailyActivity.reduce((s, d) => s + d.count, 0)} toplam
            </div>
          </div>
          <div className="flex items-end gap-2.5 h-32">
            {t.analytics.dailyActivity.map((day) => {
              const height = Math.max((day.count / maxVal) * 100, 5);
              const dayLabel = new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' });
              const isToday = day.date === new Date().toISOString().split('T')[0];
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[8px] font-black text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">{day.count}</span>
                  <div
                    className={`w-full rounded-full overflow-hidden transition-all duration-500 group-hover:scale-y-105 ${isToday ? 'bg-gradient-to-t from-indigo-500 to-purple-500' : 'bg-[var(--bg-secondary)]'}`}
                    style={{ height: '100px', position: 'relative' }}
                  >
                    <div
                      className={`absolute bottom-0 w-full rounded-full transition-all duration-700 ${isToday ? 'bg-white/20' : 'bg-gradient-to-t from-indigo-500/60 to-purple-500/40'}`}
                      style={{ height: `${height}%` }}
                    />
                  </div>
                  <span className={`text-[7px] font-bold uppercase ${isToday ? 'text-indigo-500' : 'text-[var(--text-muted)]'}`}>{dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg">
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Hızlı Bilgiler
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Ort. Öğrenci Puanı', value: `%${t.analytics.avgStudentScore}`, icon: 'fa-star', color: 'text-amber-500' },
              { label: 'Aktif Öğrenci', value: `${t.analytics.activeStudents}/${t.analytics.totalStudents}`, icon: 'fa-user-check', color: 'text-emerald-500' },
              { label: 'Son Aktivite', value: new Date(t.analytics.lastActiveDate).toLocaleDateString('tr-TR'), icon: 'fa-clock', color: 'text-blue-500' },
            ].map(info => (
              <div key={info.label} className="flex items-center gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${info.color.includes('amber') ? 'from-amber-500 to-orange-500' : info.color.includes('emerald') ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-indigo-500'} flex items-center justify-center text-white`}>
                  <i className={`fa-solid ${info.icon} text-xs`} />
                </div>
                <div>
                  <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{info.label}</p>
                  <p className="text-base font-black text-[var(--text-primary)]">{info.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Son Aktiviteler
          </h3>
          {t.recentActivity.length > 8 && (
            <span className="text-[8px] font-bold text-[var(--text-muted)]">+{t.recentActivity.length - 8} daha</span>
          )}
        </div>
        <div className="space-y-2">
          {t.recentActivity.slice(0, 8).map((act) => (
            <div
              key={act.id}
              onClick={() => act.targetId && handleActivityClick(act)}
              className={`flex items-start gap-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] transition-all duration-200 ${act.targetId ? 'cursor-pointer hover:border-[var(--accent-color)]/30 hover:shadow-md hover:translate-x-0.5' : ''} group`}
            >
              <div className={`w-9 h-9 rounded-xl ${ACTIVITY_COLORS[act.type]} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                <i className={`fa-solid ${ACTIVITY_ICONS[act.type]} text-xs`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-[var(--text-primary)]">{ACTIVITY_LABELS[act.type]}</span>
                  {act.targetId && <ArrowRight className="w-2.5 h-2.5 text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] truncate">{act.title}</p>
                <p className="text-[8px] font-bold text-zinc-400">{act.details}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[8px] font-black text-[var(--text-muted)]">{new Date(act.createdAt).toLocaleDateString('tr-TR')}</p>
                <p className="text-[7px] font-bold text-zinc-400">{new Date(act.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {preview && (
        <ActivityPreviewModal
          type={preview.type}
          data={previewData}
          loading={previewLoading}
          onClose={() => { setPreview(null); setPreviewData(null); }}
        />
      )}
    </div>
  );
};
