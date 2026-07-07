import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot, addDoc, Timestamp, deleteDoc, doc, QuerySnapshot, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebaseClient';
import { useAuthStore } from '../../../store/useAuthStore';
import { ClinicalNote } from './studentDashboardData';
import { logError } from '../../../utils/logger';

interface ClinicalNotesModuleProps {
  studentId: string;
  studentName: string;
}

type NoteCategory = 'all' | 'baseline' | 'progress' | 'goal';

export const ClinicalNotesModule = ({ studentId, studentName }: { studentId: string; studentName: string }) => {
  const { user } = useAuthStore();
  const [allNotes, setAllNotes] = useState<ClinicalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<NoteCategory>('all');
  const [selectedNote, setSelectedNote] = useState<ClinicalNote | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newNote, setNewNote] = useState({ category: 'progress' as ClinicalNote['category'], title: '', content: '', tags: '', priority: 'medium' as ClinicalNote['priority'] });

  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);

    const q = query(collection(db, 'clinical_notes'), where('studentId', '==', studentId));
    const unsub = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
      const notes: ClinicalNote[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const d = doc.data();
        return {
          id: doc.id,
          category: d.category || 'progress',
          date: d.date?.toDate ? d.date.toDate().toISOString() : d.date || new Date().toISOString(),
          title: d.title || '',
          content: d.content || '',
          author: d.author || '',
          tags: Array.isArray(d.tags) ? d.tags : [],
          priority: d.priority || 'medium',
        } as ClinicalNote;
      });
      setAllNotes(notes);
      setLoading(false);
    }, (err: Error) => {
      logError('Klinik notlar dinlenemedi', { error: err.message, context: 'ClinicalNotesModule-onSnapshot' });
      setError('Notlar yüklenemedi: ' + err.message);
      setLoading(false);
    });

    unsubscribeRef.current = unsub;
    return () => { unsub(); };
  }, [studentId]);

  const filtered = activeCategory === 'all'
    ? allNotes
    : allNotes.filter((n: ClinicalNote) => n.category === activeCategory);

  const sorted = [...filtered].sort((a: ClinicalNote, b: ClinicalNote) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const categoryCounts: Record<NoteCategory, number> = {
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
    return <span className={`text-[8px] font-semibold uppercase px-1.5 py-0.5 rounded ${map[priority]}`}>{label[priority]}</span>;
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

  const handleSaveNewNote = async () => {
    if (!newNote.title || !newNote.content) return;
    setSaving(true);
    setError(null);
    try {
      await addDoc(collection(db, 'clinical_notes'), {
        studentId,
        category: newNote.category,
        date: Timestamp.now(),
        title: newNote.title,
        content: newNote.content,
        author: (user as any)?.displayName || user?.email || 'Bilinmeyen',
        tags: newNote.tags ? newNote.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        priority: newNote.priority,
      });
      setShowAddModal(false);
      setNewNote({ category: 'progress', title: '', content: '', tags: '', priority: 'medium' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kayıt hatası';
      logError('Klinik not kaydedilemedi', { error: msg, context: 'ClinicalNotesModule-save' });
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Bu notu silmek istediğinize emin misiniz?')) return;
    try {
      await deleteDoc(doc(db, 'clinical_notes', id));
      if (selectedNote?.id === id) setSelectedNote(null);
    } catch (err: unknown) {
      const msg = 'Not silinemedi: ' + (err instanceof Error ? err.message : String(err));
      logError('Klinik not silinemedi', { error: err instanceof Error ? err.message : String(err), context: 'ClinicalNotesModule-delete' });
      setError(msg);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm tracking-tight text-[var(--text-primary)] uppercase">Klinik Notlar</h3>
          <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-widest mt-0.5">
            {loading ? 'Yükleniyor...' : `${allNotes.length} not kaydı`}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setShowAddModal(true)} className="px-3 py-1.5 bg-[var(--accent-color)] text-white rounded-lg text-[10px] font-medium uppercase hover:opacity-90 transition-all flex items-center gap-1.5">
            <i className="fa-solid fa-plus text-[9px]"></i> Yeni Not
          </button>
          <button onClick={handlePrint} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="Yazdır">
            <i className="fa-solid fa-print text-[9px]"></i>
          </button>
          <button onClick={handleDownload} className="w-7 h-7 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all" title="İndir">
            <i className="fa-solid fa-download text-[9px]"></i>
          </button>
        </div>
      </div>

      <div className="flex bg-[var(--bg-secondary)] p-0.5 rounded-lg">
        {([['all', 'Tümü', 'fa-layer-group'], ['baseline', 'Başlangıç', 'fa-flag-checkered'], ['progress', 'İlerleme', 'fa-chart-line'], ['goal', 'Hedefler', 'fa-bullseye']] as [NoteCategory, string, string][]).map(([key, label, icon]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex-1 py-2 text-[9px] font-semibold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${activeCategory === key ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
          >
            <i className={`fa-solid ${icon} text-[9px]`}></i>
            {label}
            <span className="opacity-50">({categoryCounts[key]})</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-600 font-medium">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-6 w-6 text-[var(--accent-color)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
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
                      <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase">{note.title}</h4>
                      {priorityBadge(note.priority)}
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[9px] text-[var(--text-muted)] font-medium">
                        <i className="fa-solid fa-calendar mr-1"></i>
                        {new Date(note.date).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="text-[9px] text-[var(--text-muted)] font-medium">
                        <i className="fa-solid fa-user mr-1"></i>
                        {note.author}
                      </span>
                      <div className="flex gap-1">
                        {note.tags.slice(0, 2).map((tag, i) => (
                          <span key={i} className="text-[8px] font-medium text-[var(--accent-color)] bg-[var(--accent-muted)] px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-[8px] text-[var(--text-muted)]">+{note.tags.length - 2}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <i className="fa-solid fa-chevron-right text-[var(--text-muted)] text-[10px] mt-1 opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 bg-[var(--bg-paper)]/40 rounded-xl border border-dashed border-[var(--border-color)]">
          <i className="fa-solid fa-notes-medical text-2xl text-[var(--text-muted)] opacity-20 mb-2"></i>
          <p className="text-[var(--text-muted)] font-medium text-[11px] uppercase tracking-widest">Not bulunamadı</p>
        </div>
      )}

      {selectedNote && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-lg border border-[var(--border-color)] max-h-[80vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 ${categoryConfig[selectedNote.category].bg} ${categoryConfig[selectedNote.category].color} rounded-lg flex items-center justify-center`}>
                  <i className={`fa-solid ${categoryConfig[selectedNote.category].icon} text-sm`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase">{selectedNote.title}</h3>
                  <p className="text-[9px] text-[var(--text-muted)]">{new Date(selectedNote.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleDeleteNote(selectedNote.id)} className="w-6 h-6 rounded-full hover:bg-rose-500/10 flex items-center justify-center text-rose-500" title="Sil">
                  <i className="fa-solid fa-trash-can text-[10px]"></i>
                </button>
                <button onClick={() => setSelectedNote(null)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                  <i className="fa-solid fa-times text-[11px]"></i>
                </button>
              </div>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="flex items-center gap-2">
                {priorityBadge(selectedNote.priority)}
                <span className="text-[9px] text-[var(--text-muted)] font-medium">
                  <i className="fa-solid fa-user mr-1"></i>{selectedNote.author}
                </span>
              </div>
              <div className="p-3 bg-[var(--bg-secondary)] rounded-xl">
                <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{selectedNote.content}</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedNote.tags?.map((tag: string, i: number) => (
                  <span key={i} className="px-1.5 py-0.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] text-[8px] rounded uppercase font-medium">#{tag}</span>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
              <button onClick={() => window.print()} className="flex-1 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[10px] font-medium uppercase hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-print text-[10px]"></i> Yazdır
              </button>
              <button onClick={() => {
                const blob = new Blob([JSON.stringify(selectedNote, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const el = document.createElement('a');
                el.href = url;
                el.download = `not_${selectedNote.id}.json`;
                el.click();
                URL.revokeObjectURL(url);
              }} className="flex-1 py-2 bg-[var(--accent-color)] text-white rounded-xl text-[10px] font-medium uppercase hover:opacity-90 transition-all flex items-center justify-center gap-1.5">
                <i className="fa-solid fa-download text-[10px]"></i> İndir
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-paper)] rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border-color)]">
            <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
              <h3 className="font-bold text-sm text-[var(--text-primary)] uppercase">Yeni Klinik Not</h3>
              <button onClick={() => setShowAddModal(false)} className="w-6 h-6 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                <i className="fa-solid fa-times text-[11px]"></i>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase mb-1.5">Kategori</label>
                <div className="flex gap-2">
                  {(['baseline', 'progress', 'goal'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setNewNote(prev => ({ ...prev, category: cat }))}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-medium uppercase transition-all flex items-center justify-center gap-1.5 ${newNote.category === cat ? `${categoryConfig[cat].bg} ${categoryConfig[cat].color} border ${categoryConfig[cat].border}` : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)]'}`}
                    >
                      <i className={`fa-solid ${categoryConfig[cat].icon} text-[9px]`}></i>
                      {categoryConfig[cat].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase mb-1.5">Başlık</label>
                <input
                  type="text"
                  value={newNote.title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[11px] text-[var(--text-primary)] focus:border-[var(--accent-color)] transition-all"
                  placeholder="Not başlığı..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase mb-1.5">İçerik</label>
                <textarea
                  value={newNote.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[11px] text-[var(--text-primary)] focus:border-[var(--accent-color)] h-32 transition-all resize-none"
                  placeholder="Klinik gözlem notları..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase mb-1.5">Öncelik</label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setNewNote(prev => ({ ...prev, priority: p }))}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-medium uppercase transition-all border ${newNote.priority === p ? 'bg-[var(--accent-muted)] border-[var(--accent-color)] text-[var(--accent-color)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                    >
                      {p === 'low' ? 'Düşük' : p === 'medium' ? 'Orta' : 'Yüksek'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-[var(--text-muted)] uppercase mb-1.5">Etiketler (virgülle ayırın)</label>
                <input
                  type="text"
                  value={newNote.tags}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-[11px] text-[var(--text-primary)] focus:border-[var(--accent-color)] transition-all"
                  placeholder="örn: okuma, odaklanma, sosyal..."
                />
              </div>
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-2">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-[var(--text-muted)] font-medium text-[11px] rounded-lg hover:bg-[var(--bg-secondary)] transition-all">İptal</button>
              <button onClick={handleSaveNewNote} disabled={saving || !newNote.title || !newNote.content} className="px-4 py-2 bg-[var(--accent-color)] text-white font-medium text-[11px] rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50">
                {saving ? 'Kaydediliyor...' : <><i className="fa-solid fa-save text-[10px]"></i> Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};