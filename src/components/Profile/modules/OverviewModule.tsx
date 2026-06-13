import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ProfileData } from '../../../types/profile';
import { Student, SavedWorksheet } from '../../../types';
import { BentoCard } from '../components/shared/BentoCard';
import { StatCard } from '../components/shared/StatCard';
import { LineChart, DataPoint } from '../../LineChart';

interface OverviewModuleProps {
  data: ProfileData;
  activeStudent: Student | null;
  onSelectActivity: (id: string) => void;
  onLoadSaved: (ws: SavedWorksheet) => void;
  onTabChange: (tab: string) => void;
  onShare?: () => void;
}

export const OverviewModule: React.FC<OverviewModuleProps> = ({
  data,
  activeStudent,
  onLoadSaved,
  onTabChange,
  onShare,
}) => {
  const { stats, performanceTrends, worksheets, assessments, loading } = data;
  const [notes, setNotes] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('overview_notes') || '[]'); }
    catch { return []; }
  });
  const [newNote, setNewNote] = useState('');
  const [editingNoteIdx, setEditingNoteIdx] = useState<number | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');

  useEffect(() => {
    localStorage.setItem('overview_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = useCallback(() => {
    if (!newNote.trim()) return;
    setNotes(prev => [...prev, newNote.trim()]);
    setNewNote('');
  }, [newNote]);

  const deleteNote = useCallback((idx: number) => {
    setNotes(prev => prev.filter((_, i) => i !== idx));
  }, []);

  const startEditNote = useCallback((idx: number) => {
    setEditingNoteIdx(idx);
    setEditingNoteText(notes[idx]);
  }, [notes]);

  const saveEditNote = useCallback(() => {
    if (editingNoteIdx === null || !editingNoteText.trim()) return;
    setNotes(prev => prev.map((n, i) => i === editingNoteIdx ? editingNoteText.trim() : n));
    setEditingNoteIdx(null);
    setEditingNoteText('');
  }, [editingNoteIdx, editingNoteText]);

  const studentScore = useMemo(() => {
    if (!activeStudent || assessments.length === 0) return null;
    const sa = assessments.filter((a: Record<string, unknown>) => a.studentName === activeStudent.name);
    if (sa.length === 0) return null;
    return Math.round(sa.reduce((sum: number, a: Record<string, unknown>) => {
      const r = a.report as Record<string, unknown>;
      const s = r?.scores as Record<string, number> | undefined;
      return sum + (s?.attention ?? 0);
    }, 0) / sa.length);
  }, [activeStudent, assessments]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => <div key={i} className="h-28 bg-[var(--bg-secondary)] rounded-3xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Share Button */}
      {onShare && (
        <div className="flex justify-end">
          <button onClick={onShare} className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:border-[var(--accent-color)]/30 transition-all">
            <i className="fa-solid fa-share-nodes" /> Paylaş
          </button>
        </div>
      )}

      {/* KPI Hero */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          value={stats.totalStudents}
          label="Toplam Öğrenci"
          icon="fa-user-graduate"
          color="text-indigo-600"
          trend={{ value: stats.monthlyNewStudents, direction: stats.monthlyNewStudents > 0 ? 'up' : 'stable' }}
        />
        <StatCard
          value={stats.totalMaterials}
          label="Üretilen Materyal"
          icon="fa-file-lines"
          color="text-emerald-500"
          trend={{ value: stats.weeklyProduction, direction: 'up' }}
        />
        <StatCard
          value={stats.totalAssessments}
          label="Değerlendirme"
          icon="fa-clipboard-check"
          color="text-amber-500"
        />
        <StatCard
          value={`%${stats.avgScore}`}
          label="Ort. Başarı"
          icon="fa-chart-simple"
          color="text-purple-600"
        />
      </div>

      {/* Trend + Active Student */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Performance Chart */}
        <BentoCard
          className="md:col-span-8"
          title="Performans Trendi"
          icon="fa-chart-line"
          iconColor="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
        >
          {performanceTrends && performanceTrends.length >= 2 ? (
            <LineChart
              data={performanceTrends as DataPoint[]}
              lines={[{ key: 'score', color: '#6366f1', label: 'Genel Skor' }]}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-28 text-[var(--text-muted)]">
              <i className="fa-solid fa-chart-line text-3xl mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Yeterli veri yok</p>
            </div>
          )}
        </BentoCard>

        {/* Active Student Card */}
        <BentoCard
          className="md:col-span-4"
          title="Son Odak"
          icon="fa-star"
          iconColor="bg-amber-50 dark:bg-amber-900/20 text-amber-500"
        >
          {activeStudent ? (
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/20">
                  {activeStudent.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <h4 className="text-sm font-black text-[var(--text-primary)]">{activeStudent.name}</h4>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{activeStudent.grade}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Gelişim</span>
                  <span className={`text-[10px] font-black ${studentScore !== null ? 'text-emerald-500' : 'text-zinc-400'}`}>
                    {studentScore !== null ? `%${studentScore}` : 'Veri yok'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000" style={{ width: `${studentScore ?? 0}%` }} />
                </div>
              </div>
              <div className="mt-auto">
                <button
                  onClick={() => onTabChange('students')}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <i className="fa-solid fa-arrow-right mr-2" /> Profili Aç
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-[var(--text-muted)] gap-2">
              <i className="fa-solid fa-user-plus text-3xl opacity-20" />
              <span className="text-[10px] font-black uppercase tracking-widest">Öğrenci Seçilmedi</span>
            </div>
          )}
        </BentoCard>
      </div>

      {/* Son Materyaller */}
      <BentoCard title="Son Üretilen Materyaller" icon="fa-clock-rotate-left">
        {worksheets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {worksheets.slice(0, 8).map((ws: SavedWorksheet) => (
              <div
                key={ws.id}
                onClick={() => onLoadSaved(ws)}
                className="flex items-center gap-3 p-3.5 bg-[var(--bg-secondary)] rounded-2xl border border-transparent hover:border-[var(--accent-color)]/30 transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-paper)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-colors shadow-sm text-lg">
                  <i className={ws.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[var(--text-primary)] truncate">{ws.name}</p>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {new Date(ws.createdAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-8 text-[var(--text-muted)]">
            <i className="fa-solid fa-file-circle-plus text-4xl mb-3 opacity-20" />
            <p className="text-[10px] font-black uppercase tracking-widest">Henüz materyal üretilmemiş</p>
          </div>
        )}
      </BentoCard>

      {/* Notlar Widget */}
      <BentoCard title="Özel Notlarım" icon="fa-note-sticky" iconColor="bg-amber-50 dark:bg-amber-900/20 text-amber-500">
        <div className="space-y-3">
          {notes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2 p-3 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] group">
              {editingNoteIdx === idx ? (
                <div className="flex-1 space-y-2">
                  <textarea
                    value={editingNoteText}
                    onChange={(e) => setEditingNoteText(e.target.value)}
                    className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-xs font-bold resize-none outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
                    rows={2}
                  />
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingNoteIdx(null)} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">İptal</button>
                    <button onClick={saveEditNote} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Kaydet</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] whitespace-pre-wrap">{note}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEditNote(idx)} className="w-7 h-7 rounded-lg hover:bg-[var(--bg-paper)] flex items-center justify-center text-zinc-400 hover:text-[var(--accent-color)] transition-all">
                      <i className="fa-solid fa-pen text-[10px]" />
                    </button>
                    <button onClick={() => deleteNote(idx)} className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-all">
                      <i className="fa-solid fa-trash text-[10px]" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addNote(); } }}
              placeholder="Yeni not ekle..."
              className="flex-1 px-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
            />
            <button onClick={addNote} disabled={!newNote.trim()} className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
              <i className="fa-solid fa-plus" />
            </button>
          </div>
        </div>
      </BentoCard>
    </div>
  );
};