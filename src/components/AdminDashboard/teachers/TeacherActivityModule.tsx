import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Filter, Calendar, ArrowUpRight, Download, Search, RefreshCw } from 'lucide-react';
import { TeacherDetail, TeacherActivity, TeacherActivityType } from '../../../types/teacher';
import { ACTIVITY_LABELS, ACTIVITY_ICONS, ACTIVITY_COLORS, ACTIVITY_BORDER_COLORS, ACTIVITY_BG_COLORS } from './constants';
import { teacherService } from '../../../services/teacherService';
import { ActivityPreviewModal } from './ActivityPreviewModal';

interface TeacherActivityModuleProps {
  teacher: TeacherDetail;
}

export const TeacherActivityModule: React.FC<TeacherActivityModuleProps> = ({ teacher }) => {
  const [typeFilter, setTypeFilter] = useState<TeacherActivityType | 'all'>('all');
  const [dateRange, setDateRange] = useState<'all' | '7' | '30' | '90'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [preview, setPreview] = useState<{ type: string; id: string } | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, unknown> | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    teacher.recentActivity.forEach(a => {
      counts[a.type] = (counts[a.type] || 0) + 1;
    });
    return counts;
  }, [teacher.recentActivity]);

  const filtered = useMemo(() => {
    let list = [...teacher.recentActivity];
    if (typeFilter !== 'all') list = list.filter(a => a.type === typeFilter);
    if (dateRange !== 'all') {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(dateRange));
      list = list.filter(a => new Date(a.createdAt) >= cutoff);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a => a.title.toLowerCase().includes(q) || a.details.toLowerCase().includes(q) || ACTIVITY_LABELS[a.type]?.toLowerCase().includes(q));
    }
    return list;
  }, [teacher.recentActivity, typeFilter, dateRange, searchQuery]);

  const handleActivityClick = async (act: TeacherActivity) => {
    if (!act.targetId) return;
    setPreview({ type: act.type, id: act.targetId });
    setPreviewLoading(true);
    const data = await teacherService.getActivityPreview(act.type, act.targetId);
    setPreviewData(data);
    setPreviewLoading(false);
  };

  const exportLog = () => {
    const csv = [['Tarih', 'Saat', 'Tür', 'Başlık', 'Detay'].join(',')];
    filtered.forEach(a => {
      csv.push([new Date(a.createdAt).toLocaleDateString('tr-TR'), new Date(a.createdAt).toLocaleTimeString('tr-TR'), ACTIVITY_LABELS[a.type] || a.type, `"${a.title}"`, `"${a.details}"`].join(','));
    });
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `aktivite_gecmisi_${teacher.user.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-5">
      {/* Type Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { key: 'all' as const, label: 'Tümü', icon: 'fa-list' },
          ...(Object.entries(ACTIVITY_LABELS) as [TeacherActivityType, string][]).map(([key, label]) => ({ key, label, icon: ACTIVITY_ICONS[key] })),
        ].map(t => {
          const count = t.key === 'all' ? teacher.recentActivity.length : typeCounts[t.key] || 0;
          return (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shrink-0 ${typeFilter === t.key ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-color)]'}`}
            >
              <i className={`fa-solid ${t.icon} text-[9px]`} /> {t.label}
              <span className="ml-0.5 opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Aktivite ara..." className="w-full pl-9 pr-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20" />
        </div>
        <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
          {([
            { key: 'all' as const, label: 'Tüm Zamanlar' },
            { key: '7' as const, label: '7 Gün' },
            { key: '30' as const, label: '30 Gün' },
            { key: '90' as const, label: '90 Gün' },
          ]).map(opt => (
            <button key={opt.key} onClick={() => setDateRange(opt.key)} className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${dateRange === opt.key ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>{opt.label}</button>
          ))}
        </div>
        <button onClick={exportLog} className="px-3 py-2 bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-xl border border-[var(--border-color)] transition-all">
          <Download className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Timeline */}
      <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.15em] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Aktivite Zaman Çizelgesi
            <span className="text-[9px] font-bold text-[var(--text-muted)] normal-case">({filtered.length} kayıt)</span>
          </h3>
        </div>
        <div className="space-y-1 max-h-[650px] overflow-y-auto custom-scrollbar pr-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-8 h-8 text-zinc-300 mb-2" />
              <p className="text-[10px] font-bold text-[var(--text-muted)]">Bu filtreyle eşleşen aktivite bulunamadı.</p>
            </div>
          ) : (
            filtered.map((act, idx) => (
              <motion.div
                key={`${act.id}-${idx}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                onClick={() => act.targetId && handleActivityClick(act)}
                className={`relative flex items-start gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] transition-all duration-200 ${act.targetId ? 'cursor-pointer hover:border-[var(--accent-color)]/30 hover:shadow-md' : ''} group border-l-4 ${ACTIVITY_BORDER_COLORS[act.type] || 'border-l-zinc-400'}`}
              >
                <div className={`w-10 h-10 rounded-xl ${ACTIVITY_COLORS[act.type]} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                  <i className={`fa-solid ${ACTIVITY_ICONS[act.type]} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-black text-[var(--text-primary)]">{act.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${ACTIVITY_COLORS[act.type]} text-white`}>{ACTIVITY_LABELS[act.type]}</span>
                    {act.targetId && <ArrowUpRight className="w-3 h-3 text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />}
                  </div>
                  {act.details && <p className="text-[9px] font-bold text-[var(--text-muted)]">{act.details}</p>}
                  {act.metadata && Object.keys(act.metadata).length > 0 && (
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {Object.entries(act.metadata).slice(0, 3).map(([k, v]) => (
                        <span key={k} className="px-1.5 py-0.5 bg-[var(--bg-paper)] rounded text-[7px] font-bold text-zinc-400 border border-[var(--border-color)]">{k}: {String(v)}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[9px] font-black text-[var(--text-primary)]">{new Date(act.createdAt).toLocaleDateString('tr-TR')}</p>
                  <p className="text-[7px] font-bold text-zinc-400">{new Date(act.createdAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </motion.div>
            ))
          )}
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
