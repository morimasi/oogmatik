import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, ArrowRight, TrendingUp, TrendingDown, Minus, Filter, Award, BookOpen, BarChart3, Eye } from 'lucide-react';
import { TeacherDetail, TeacherStudentSummary } from '../../../types/teacher';
import { teacherService } from '../../../services/teacherService';
import { useToastStore } from '../../../store/useToastStore';
import { AssignTeacherModal } from './AssignTeacherModal';

interface TeacherStudentsProps {
  teacher: TeacherDetail;
}

export const TeacherStudents: React.FC<TeacherStudentsProps> = ({ teacher }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'assessments'>('score');
  const [selectedStudent, setSelectedStudent] = useState<Record<string, unknown> | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [assignTarget, setAssignTarget] = useState<Record<string, unknown> | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allStudents, setAllStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [assignSubmitting, setAssignSubmitting] = useState(false);
  const toast = useToastStore();

  const openAssignModal = async () => {
    setShowAssignModal(true);
    setSelectedIds(new Set());
    try {
      const list = await teacherService.getAllStudents();
      setAllStudents(list.map(s => ({ id: s.id, name: s.name })));
    } catch {
      toast.error('Öğrenci listesi alınamadı');
    }
  };

  const handleAssignSelected = async () => {
    if (selectedIds.size === 0) return;
    setAssignSubmitting(true);
    try {
      await teacherService.assignStudentsToTeacher(teacher.user.id, Array.from(selectedIds));
      toast.success(`${selectedIds.size} öğrenci "${teacher.user.name}" öğretmenine atandı`);
      setShowAssignModal(false);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error('Atama hatası: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...teacher.students];
    if (searchQuery) {
      list = list.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    list.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'assessments') return b.assessmentCount - a.assessmentCount;
      return b.avgScore - a.avgScore;
    });
    return list;
  }, [teacher.students, searchQuery, sortBy]);

  const handleStudentClick = useCallback(async (studentId: string) => {
    setStudentLoading(true);
    const data = await teacherService.getStudentPreview(studentId);
    setSelectedStudent(data);
    setStudentLoading(false);
  }, []);

  const scoreDistribution = useMemo(() => {
    const dist = { low: 0, medium: 0, high: 0 };
    teacher.students.forEach(s => {
      if (s.avgScore >= 70) dist.high++;
      else if (s.avgScore >= 40) dist.medium++;
      else dist.low++;
    });
    return dist;
  }, [teacher]);

  return (
    <div className="space-y-5">
      {/* Stats Header */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-4 shadow-lg">
          <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Toplam</p>
          <p className="text-2xl font-black text-[var(--text-primary)]">{teacher.students.length}</p>
        </div>
        <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-emerald-200 dark:border-emerald-800 p-4 shadow-lg">
          <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Yüksek (%70+)</p>
          <p className="text-2xl font-black text-emerald-500">{scoreDistribution.high}</p>
        </div>
        <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-amber-200 dark:border-amber-800 p-4 shadow-lg">
          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Orta (%40-70)</p>
          <p className="text-2xl font-black text-amber-500">{scoreDistribution.medium}</p>
        </div>
        <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-rose-200 dark:border-rose-800 p-4 shadow-lg">
          <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-1">Düşük (%40-)</p>
          <p className="text-2xl font-black text-rose-500">{scoreDistribution.low}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--text-muted)]" />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Öğrenci ara..." className="w-full pl-9 pr-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20" />
        </div>
        <button onClick={openAssignModal} className="flex items-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20">
          <i className="fa-solid fa-user-plus"></i> Öğrenci Ata
        </button>
        <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
          {([{ key: 'score', label: 'Puana Göre' }, { key: 'name', label: 'İsme Göre' }, { key: 'assessments', label: 'Değerlendirme' }] as const).map(opt => (
            <button key={opt.key} onClick={() => setSortBy(opt.key)} className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${sortBy === opt.key ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>{opt.label}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
          <button onClick={() => setViewMode('grid')} className={`px-2.5 py-1 rounded-lg text-[8px] font-black transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)]'}`}><i className="fa-solid fa-grid-2" /></button>
          <button onClick={() => setViewMode('table')} className={`px-2.5 py-1 rounded-lg text-[8px] font-black transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)]'}`}><i className="fa-solid fa-table" /></button>
        </div>
      </div>

      {/* Student Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Award className="w-12 h-12 text-zinc-300 mb-4" />
          <p className="text-sm font-bold text-[var(--text-muted)]">Eşleşen öğrenci bulunamadı.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, idx) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => handleStudentClick(s.id)}
              className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] p-5 shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-black shadow-lg group-hover:scale-110 transition-transform">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[var(--text-primary)]">{s.name}</h4>
                    <p className="text-[9px] font-bold text-[var(--text-muted)]">{s.grade || 'Sınıf belirtilmemiş'} · {s.age} yaş</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--accent-color)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-[var(--bg-secondary)] rounded-xl p-2.5 text-center border border-[var(--border-color)]">
                  <p className="text-lg font-black text-indigo-500">{s.assessmentCount}</p>
                  <p className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">Değ.</p>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-xl p-2.5 text-center border border-[var(--border-color)]">
                  <p className={`text-lg font-black ${s.avgScore >= 70 ? 'text-emerald-500' : s.avgScore >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>%{s.avgScore}</p>
                  <p className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">Puan</p>
                </div>
                <div className="bg-[var(--bg-secondary)] rounded-xl p-2.5 text-center border border-[var(--border-color)]">
                  {s.avgScore >= 70 ? <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" /> : s.avgScore >= 40 ? <Minus className="w-4 h-4 text-amber-500 mx-auto" /> : <TrendingDown className="w-4 h-4 text-rose-500 mx-auto" />}
                  <p className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest">{s.avgScore >= 70 ? 'İyi' : s.avgScore >= 40 ? 'Orta' : 'Düşük'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                <span className={`px-2 py-0.5 rounded text-[7px] font-black ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-500'}`}>{s.status === 'active' ? 'Aktif' : 'Pasif'}</span>
                {s.lastActivity && (
                  <span className="text-[7px] font-bold text-zinc-400">{new Date(s.lastActivity).toLocaleDateString('tr-TR')}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--bg-paper)] rounded-[2rem] border border-[var(--border-color)] overflow-hidden shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="text-left p-3 pl-5">Öğrenci</th>
                <th className="text-left p-3">Sınıf</th>
                <th className="text-center p-3">Değerlendirme</th>
                <th className="text-center p-3">Ort. Puan</th>
                <th className="text-center p-3">Durum</th>
                <th className="text-center p-3 pr-5">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="p-3 pl-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[8px] font-black">{s.name.charAt(0)}</div>
                      <span className="text-[10px] font-bold text-[var(--text-primary)]">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-[10px] font-bold text-[var(--text-muted)]">{s.grade || '-'}</td>
                  <td className="p-3 text-center"><span className="px-2 py-0.5 bg-[var(--bg-secondary)] rounded text-[9px] font-black text-[var(--text-primary)]">{s.assessmentCount}</span></td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-black ${s.avgScore >= 70 ? 'text-emerald-500' : s.avgScore >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>%{s.avgScore}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[7px] font-black ${s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>{s.status === 'active' ? 'Aktif' : 'Pasif'}</span>
                  </td>
                  <td className="p-3 pr-5 text-center">
                    <button onClick={() => handleStudentClick(s.id)} className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[8px] font-black hover:scale-105 transition-all inline-flex items-center gap-1">
                      <Eye className="w-2.5 h-2.5" /> İncele
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Student Preview Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200" onClick={() => setSelectedStudent(null)}>
          <div className="bg-[var(--bg-paper)] dark:bg-zinc-800 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-[var(--border-color)] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-700 px-6 py-5">
              {studentLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                    {(selectedStudent.name as string || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">{selectedStudent.name as string}</h3>
                    <p className="text-blue-200 text-[10px] font-bold">{selectedStudent.grade as string || 'Sınıf belirtilmemiş'} · {selectedStudent.age as number || '-'} yaş</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'E-posta', value: selectedStudent.email as string, icon: 'fa-envelope' },
                { label: 'Öğretmen ID', value: selectedStudent.teacherId as string, icon: 'fa-chalkboard-user' },
                { label: 'Oluşturulma', value: selectedStudent.createdAt ? new Date(selectedStudent.createdAt as string).toLocaleDateString('tr-TR') : '-', icon: 'fa-calendar-plus' },
              ].map(info => (
                <div key={info.label} className="flex items-center gap-2.5 text-[10px]">
                  <i className={`fa-solid ${info.icon} w-4 text-center text-[var(--text-muted)]`} />
                  <span className="font-bold text-[var(--text-muted)]">{info.label}:</span>
                  <span className="font-black text-[var(--text-primary)] truncate">{info.value || '-'}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[var(--border-color)] p-4 flex gap-2 justify-end">
              <button onClick={() => setAssignTarget(selectedStudent)} className="px-4 py-2.5 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-all flex items-center gap-1.5">
                <i className="fa-solid fa-user-plus"></i> Öğretmene Ata
              </button>
              <button onClick={() => setSelectedStudent(null)} className="px-5 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all">Kapat</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Student to This Teacher Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowAssignModal(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()} className="bg-[var(--bg-paper)] rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-[var(--border-color)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Öğrenci Ata</h3>
                <button onClick={() => setShowAssignModal(false)} className="w-7 h-7 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]"><i className="fa-solid fa-times text-xs"></i></button>
              </div>
              <p className="text-[10px] font-bold text-[var(--text-muted)]">Öğretmen: <span className="text-[var(--text-primary)]">{teacher.user.name}</span></p>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto custom-scrollbar space-y-1">
              {allStudents.length === 0 ? (
                <div className="py-8 text-center text-[10px] font-bold text-[var(--text-muted)]">Yükleniyor...</div>
              ) : (
                allStudents.map(s => {
                  const isAssigned = teacher.students.some(ts => ts.id === s.id);
                  const isChecked = selectedIds.has(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        if (isAssigned) return;
                        const next = new Set(selectedIds);
                        if (isChecked) next.delete(s.id); else next.add(s.id);
                        setSelectedIds(next);
                      }}
                      disabled={isAssigned}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${isChecked ? 'bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30' : 'hover:bg-[var(--bg-secondary)] border border-transparent'} ${isAssigned ? 'opacity-40' : ''}`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'border-[var(--border-color)]'}`}>
                        {isChecked && <i className="fa-solid fa-check text-white text-[8px]"></i>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black text-[var(--text-primary)] truncate">{s.name}</p>
                      </div>
                      {isAssigned && <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">Zaten Atanmış</span>}
                    </button>
                  );
                })
              )}
            </div>
            <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
              <button onClick={() => setShowAssignModal(false)} className="flex-1 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all">İptal</button>
              <button onClick={handleAssignSelected} disabled={selectedIds.size === 0 || assignSubmitting} className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {assignSubmitting ? <i className="fa-solid fa-spinner fa-spin"></i> : null}
                {selectedIds.size} Öğrenciyi Ata
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Assign Teacher Modal (from student detail) */}
      {assignTarget && (
        <AssignTeacherModal
          studentId={(assignTarget.id as string) || ''}
          studentName={(assignTarget.name as string) || 'Öğrenci'}
          currentTeacherId={assignTarget.teacherId as string}
          assignedTeacherIds={assignTarget.assignedTeachers as string[]}
          onClose={() => { setAssignTarget(null); setSelectedStudent(null); }}
          onAssigned={() => { setAssignTarget(null); setSelectedStudent(null); }}
        />
      )}
    </div>
  );
};
