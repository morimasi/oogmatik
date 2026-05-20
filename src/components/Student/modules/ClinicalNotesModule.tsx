import React, { useState } from 'react';
import { ClinicalNote } from './studentDashboardData';

interface ClinicalNotesModuleProps {
  studentId: string;
  studentName: string;
}

type NoteCategory = 'all' | 'baseline' | 'progress' | 'goal';

export const ClinicalNotesModule: React.FC<ClinicalNotesModuleProps> = ({
  studentId,
  studentName,
}) => {
  const allNotes: ClinicalNote[] = []; // Şimdilik boş liste, gerçek veri servisi eklendiğinde buradan dolacak.
  const [activeCategory, setActiveCategory] = useState<NoteCategory>('all');
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({ category: 'progress' as ClinicalNote['category'], title: '', content: '', tags: '' });

  const filtered = activeCategory === 'all'
    ? allNotes
    : allNotes.filter((n: ClinicalNote) => n.category === activeCategory);

  const sorted = [...filtered].sort((a: ClinicalNote, b: ClinicalNote) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categoryCounts = {
    all: allNotes.length,
    baseline: allNotes.filter((n: ClinicalNote) => n.category === 'baseline').length,
    progress: allNotes.filter((n: ClinicalNote) => n.category === 'progress').length,
    goal: allNotes.filter((n: ClinicalNote) => n.category === 'goal').length,
  };

  const categoryConfig: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
    baseline: { label: 'Başlangıç', icon: 'fa-flag-checkered', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    progress: { label: 'İlerleme', icon: 'fa-chart-line', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    goal: { label: 'Hedefler', icon: 'fa-bullseye', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  };

  const priorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      high: 'bg-rose-500/10 text-rose-500',
      medium: 'bg-amber-500/10 text-amber-500',
      low: 'bg-emerald-500/10 text-emerald-500',
    };
    const label: Record<string, string> = { high: 'Yüksek', medium: 'Orta', low: 'Düşük' };
    return <span className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded ${map[priority]}`}>{label[priority]}</span>;
  };

  const handlePrint = () => { window.print(); };

  const handleDownload = () => {
    const data = sorted.map(n => ({
      id: n.id,
      category: n.category,
      date: n.date,
      title: n.title,
      content: n.content,
      author: n.author,
      tags: n.tags,
      priority: n.priority,
    }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = 'klinik_notlar.json';
    el.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveNewNote = () => {
    if (newNote.title && newNote.content) {
      setShowAddModal(false);
      setNewNote({ category: 'progress', title: '', content: '', tags: '' });
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-black text-xs tracking-tighter text-[var(--text-primary)] uppercase">Klinik Notlar</h3>
          <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {allNotes.length} not kaydı
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setShowAddModal(true)} className="px-3 py-1.5 bg-[var(--accent-color)] text-white rounded-lg text-[8px] font-bold uppercase hover:opacity-90 transition-all flex items-center gap-1.5">
            <i className="fa-solid fa-plus text-[7px]"></i> Yeni Not
          </button>
          <button onClick={handlePrint} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Yazdır">
            <i className="fa-solid fa-print text-[9px]"></i>
          </button>
          <button onClick={handleDownload} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="İndir">
            <i className="fa-solid fa-download text-[9px]"></i>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-[var(--bg-secondary)] p-0.5 rounded-lg">
        {([['all', 'Tümü', 'fa-layer-group'], ['baseline', 'Başlangıç', 'fa-flag-checkered'], ['progress', 'İlerleme', 'fa-chart-line'], ['goal', 'Hedefler', 'fa-bullseye']] as [NoteCategory, string, string][]).map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex-1 py-2 text-[7px] font-black uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${activeCategory === key ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
          >
            <i className={`fa-solid ${icon} text-[7px]`}></i>
            {label}
            <span className="opacity-50">({categoryCounts[key]})</span>
          </button>
        ))}
      </div>

      {/* Notes Timeline */}
      <div className="space-y-3">
        {sorted.map(note => {
          const config = categoryConfig[note.category];
          return (
            <div
              key={note.id}
              className={`bg-[var(--bg-paper)] border rounded-xl p-3 transition-all hover:shadow-md cursor-pointer group ${config.border} hover:border-[var(--accent-color)]/30`}
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 ${config.bg} ${config.color} rounded-lg flex items-center justify-center shrink-0`}>
                  <i className={`fa-solid ${config.icon} text-sm`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4 className="font-black text-[10px] text-[var(--text-primary)] uppercase">{note.title}</h4>
                    {priorityBadge(note.priority)}
                  </div>
                  <p className="text-[8px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{note.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[7px] text-[var(--text-muted)] font-bold">
                      <i className="fa-solid fa-calendar mr-1"></i>
                      {new Date(note.date).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="text-[7px] text-[var(--text-muted)] font-bold">
                      <i className="fa-solid fa-user mr-1"></i>
                      {note.author}
                    </span>
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-[6px] font-bold text-[var(--accent-color)] bg-[var(--accent-muted)] px-1.5 py-0.5 rounded">{tag}</span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-[6px] text-[var(--text-muted)]">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                </div>
                <i className="fa-solid fa-chevron-right text-[var(--text-muted)] text-[8px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-paper)]/40 rounded-xl border border-dashed border-[var(--border-color)]">
          <i className="fa-solid fa-notes-medical text-2xl text-[var(--text-muted)] opacity-20 mb-2"></i>
          <p className="text-[var(--text-muted)] font-bold text-[9px] uppercase tracking-widest">Not bulunamadı</p>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--border-color)] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 ${categoryConfig[selectedNote.category].bg} ${categoryConfig[selectedNote.category].color} rounded-lg flex items-center justify-center`}>
                  <i className={`fa-solid ${categoryConfig[selectedNote.category].icon} text-sm`}></i>
                </div>
                <div>
                  <h3 className="font-black text-xs text-[var(--text-primary)] uppercase">{selectedNote.title}</h3>
                  <p className="text-[7px] text-[var(--text-muted)]">{new Date(selectedNote.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <button onClick={() => setSelectedNote(null)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[9px]"></i>
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2">
                {priorityBadge(selectedNote.priority)}
                <span className="text-[7px] text-[var(--text-muted)] font-bold">
                  <i className="fa-solid fa-user mr-1"></i>{selectedNote.author}
                </span>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <p className="text-[9px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{selectedNote.content}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedNote.tags.map((tag, i) => (
                  <span key={i} className="text-[7px] font-bold text-[var(--accent-color)] bg-[var(--accent-muted)] px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
              <button onClick={() => window.print()} className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[8px] font-bold uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-print text-[8px]"></i> Yazdır
              </button>
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(selectedNote, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const el = document.createElement('a');
                el.href = url;
                el.download = `not_${selectedNote.id}.json`;
                el.click();
                URL.revokeObjectURL(url);
              }} className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded-xl text-[8px] font-bold uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-download text-[8px]"></i> İndir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border-color)]">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="font-black text-xs text-[var(--text-primary)] uppercase">Yeni Klinik Not</h3>
              <button onClick={() => setShowAddModal(false)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[9px]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">Kategori</label>
                <div className="flex gap-2">
                  {(['baseline', 'progress', 'goal'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewNote(prev => ({ ...prev, category: cat }))}
                      className={`flex-1 py-2 rounded-lg text-[8px] font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${newNote.category === cat ? `${categoryConfig[cat].bg} ${categoryConfig[cat].color} border ${categoryConfig[cat].border}` : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]'}`}
                    >
                      <i className={`fa-solid ${categoryConfig[cat].icon} text-[7px]`}></i>
                      {categoryConfig[cat].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">Başlık</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={e => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 text-[var(--text-primary)]"
                  placeholder="Not başlığı..."
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">İçerik</label>
                <textarea
                  value={newNote.content}
                  onChange={e => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 text-[var(--text-primary)] h-32 resize-none"
                  placeholder="Klinik gözlem notları..."
                />
              </div>
              <div>
                <label className="block text-[8px] font-bold text-[var(--text-muted)] uppercase mb-1.5">Etiketler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={newNote.tags}
                  onChange={e => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[9px] outline-none focus:ring-1 focus:ring-[var(--accent-color)]/50 text-[var(--text-primary)]"
                  placeholder="ilerleme, fonolojik, dikkat..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-[var(--text-muted)] font-bold text-[9px] rounded-lg hover:bg-[var(--bg-secondary)] transition-all">İptal</button>
              <button onClick={handleSaveNewNote} className="px-4 py-2 bg-[var(--accent-color)] text-white font-bold text-[9px] rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5">
                <i className="fa-solid fa-save text-[8px]"></i> Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
