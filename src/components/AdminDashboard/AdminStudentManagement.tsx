import React, { useState, useEffect, useMemo } from 'react';
import { Search, Award, RefreshCw } from 'lucide-react';
import { Student } from '../../types';
import { teacherService } from '../../services/teacherService';
import { useToastStore } from '../../store/useToastStore';
import { AssignTeacherModal } from './teachers/AssignTeacherModal';

export const AdminStudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assignTarget, setAssignTarget] = useState<Student | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const toast = useToastStore();

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await teacherService.getAllStudents();
      setStudents(data);
    } catch {
      toast.error('Öğrenci listesi alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStudents(); }, []);

  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q) ||
      (s.teacherId?.toLowerCase() || '').includes(q)
    );
  }, [students, search]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">Öğrenci Yönetimi</h2>
          <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-[9px] font-black shadow-md shadow-blue-500/20">{students.length} Öğrenci</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-[var(--bg-secondary)] rounded-xl p-1 border border-[var(--border-color)]">
            <button onClick={() => setViewMode('grid')} className={`px-2.5 py-1 rounded-lg text-[8px] font-black transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)]'}`}><i className="fa-solid fa-grid-2" /></button>
            <button onClick={() => setViewMode('table')} className={`px-2.5 py-1 rounded-lg text-[8px] font-black transition-all ${viewMode === 'table' ? 'bg-indigo-600 text-white shadow-md' : 'text-[var(--text-muted)]'}`}><i className="fa-solid fa-table" /></button>
          </div>
          <button onClick={loadStudents} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:text-[var(--accent-color)] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-[var(--border-color)]">
            <RefreshCw className="w-3.5 h-3.5" /> Yenile
          </button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Öğrenci adı, sınıf veya öğretmen ID ile ara..." className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20" />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 bg-[var(--bg-secondary)] rounded-[2.5rem] animate-pulse border border-[var(--border-color)]" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
            <Award className="w-10 h-10 text-blue-400 opacity-50" />
          </div>
          <h3 className="text-xl font-black text-[var(--text-primary)] mb-2">{search ? 'Eşleşen Öğrenci Bulunamadı' : 'Henüz Öğrenci Yok'}</h3>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s, idx) => (
            <div key={s.id} className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 group">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white text-lg font-black shadow-lg">{s.name.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black truncate">{s.name}</h3>
                    <p className="text-[9px] text-blue-200 font-bold">{s.grade || '-'} · {s.age} yaş</p>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-[9px]">
                  <i className="fa-solid fa-chalkboard-user w-4 text-center text-[var(--text-muted)]" />
                  <span className="font-bold text-[var(--text-muted)]">Birincil Öğretmen:</span>
                  <span className="font-black text-[var(--text-primary)] truncate">{s.teacherId || '-'}</span>
                </div>
                {s.assignedTeachers && s.assignedTeachers.length > 0 && (
                  <div className="flex items-center gap-2 text-[9px]">
                    <i className="fa-solid fa-users w-4 text-center text-[var(--text-muted)]" />
                    <span className="font-bold text-[var(--text-muted)]">Atanan Öğretmenler:</span>
                    <span className="font-black text-[var(--text-primary)]">{s.assignedTeachers.length}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[9px]">
                  <i className="fa-solid fa-calendar w-4 text-center text-[var(--text-muted)]" />
                  <span className="font-bold text-[var(--text-muted)]">Oluşturulma:</span>
                  <span className="font-black text-[var(--text-primary)]">{s.createdAt ? new Date(s.createdAt).toLocaleDateString('tr-TR') : '-'}</span>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {s.diagnosis?.slice(0, 2).map(d => (
                    <span key={d} className="px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded text-[7px] font-black">{d}</span>
                  ))}
                  {(s.diagnosis?.length || 0) > 2 && <span className="text-[7px] font-bold text-[var(--text-muted)] self-center">+{s.diagnosis!.length - 2}</span>}
                </div>
              </div>
              <div className="px-4 pb-4">
                <button onClick={() => setAssignTarget(s)} className="w-full py-2 bg-[var(--bg-secondary)] hover:bg-[var(--accent-color)] hover:text-white text-[var(--text-secondary)] rounded-xl text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 border border-[var(--border-color)]">
                  <i className="fa-solid fa-user-plus text-[8px]"></i> Öğretmene Ata
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] overflow-hidden shadow-lg">
          <table className="w-full">
            <thead>
              <tr className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
                <th className="text-left p-3 pl-5">Öğrenci</th>
                <th className="text-left p-3">Sınıf</th>
                <th className="text-left p-3">Birincil Öğretmen</th>
                <th className="text-center p-3">Atanan Öğrt.</th>
                <th className="text-center p-3 pr-5">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--bg-secondary)]/50 transition-colors">
                  <td className="p-3 pl-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[8px] font-black">{s.name.charAt(0)}</div>
                      <span className="text-[10px] font-bold text-[var(--text-primary)]">{s.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-[10px] font-bold text-[var(--text-muted)]">{s.grade || '-'}</td>
                  <td className="p-3 text-[10px] font-bold text-[var(--text-muted)] max-w-[120px] truncate">{s.teacherId || '-'}</td>
                  <td className="p-3 text-center"><span className="px-2 py-0.5 bg-[var(--bg-secondary)] rounded text-[9px] font-black text-[var(--text-primary)]">{(s.assignedTeachers?.length || 0)}</span></td>
                  <td className="p-3 pr-5 text-center">
                    <button onClick={() => setAssignTarget(s)} className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[8px] font-black hover:scale-105 transition-all inline-flex items-center gap-1">
                      <i className="fa-solid fa-user-plus" /> Ata
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {assignTarget && (
        <AssignTeacherModal
          studentId={assignTarget.id}
          studentName={assignTarget.name}
          currentTeacherId={assignTarget.teacherId}
          assignedTeacherIds={assignTarget.assignedTeachers}
          onClose={() => setAssignTarget(null)}
          onAssigned={loadStudents}
        />
      )}
    </div>
  );
};
