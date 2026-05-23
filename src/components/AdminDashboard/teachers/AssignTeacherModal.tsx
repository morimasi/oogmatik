import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '../../../types';
import { authService } from '../../../services/authService';
import { teacherService } from '../../../services/teacherService';
import { useToastStore } from '../../../store/useToastStore';

interface AssignTeacherModalProps {
  studentId: string;
  studentName: string;
  currentTeacherId?: string;
  assignedTeacherIds?: string[];
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  studentId, studentName, currentTeacherId, assignedTeacherIds, onClose, onAssigned,
}) => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToastStore();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await authService.getAllUsers(0, 500);
        const filtered = res.users.filter((u: User) => u.role === 'teacher' || u.role === 'admin' || u.role === 'superadmin');
        setTeachers(filtered);
      } catch {
        toast.error('Öğretmen listesi alınamadı');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      await teacherService.assignStudentToTeacher(selectedId, studentId);
      toast.success(`"${studentName}" öğrencisi öğretmene atandı`);
      onAssigned();
      onClose();
    } catch (err) {
      toast.error('Atama hatası: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (teacherId: string) => {
    setSubmitting(true);
    try {
      await teacherService.removeStudentFromTeacher(teacherId, studentId);
      toast.success('Atama kaldırıldı');
      onAssigned();
      onClose();
    } catch (err) {
      toast.error('Kaldırma hatası: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={e => e.stopPropagation()}
        className="bg-[var(--bg-paper)] rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-[var(--border-color)] overflow-hidden"
      >
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-wider">Öğretmene Ata</h3>
            <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]"><i className="fa-solid fa-times text-xs"></i></button>
          </div>
          <p className="text-[10px] font-bold text-[var(--text-muted)]">Öğrenci: <span className="text-[var(--text-primary)]">{studentName}</span></p>
        </div>

        <div className="p-4">
          <div className="relative mb-3">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-[10px]"></i>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Öğretmen ara..." className="w-full pl-9 pr-3 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[10px] font-bold outline-none focus:ring-2 focus:ring-[var(--accent-color)]/20"
            />
          </div>

          {/* Mevcut atamalar */}
          {(currentTeacherId || (assignedTeacherIds && assignedTeacherIds.length > 0)) && (
            <div className="mb-3 p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
              <p className="text-[7px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Mevcut Atamalar</p>
              {currentTeacherId && (
                <div className="flex items-center justify-between py-1.5 border-b border-[var(--border-color)] last:border-0">
                  <span className="text-[10px] font-bold text-[var(--text-primary)]">Birincil Öğretmen (ID: {currentTeacherId})</span>
                </div>
              )}
              {assignedTeacherIds?.map(tid => {
                const t = teachers.find(tc => tc.id === tid);
                return (
                  <div key={tid} className="flex items-center justify-between py-1.5 border-b border-[var(--border-color)] last:border-0">
                    <span className="text-[10px] font-bold text-[var(--text-primary)]">{t?.name || tid}</span>
                    <button onClick={() => handleRemove(tid)} className="text-[8px] text-red-500 hover:text-red-600 font-bold uppercase">Çıkar</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Öğretmen listesi */}
          {loading ? (
            <div className="flex justify-center py-8"><i className="fa-solid fa-spinner fa-spin text-xl text-[var(--accent-color)]"></i></div>
          ) : filteredTeachers.length === 0 ? (
            <div className="py-8 text-center text-[10px] font-bold text-[var(--text-muted)]">Eşleşen öğretmen bulunamadı</div>
          ) : (
            <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
              {filteredTeachers.map(t => {
                const isCurrent = currentTeacherId === t.id || assignedTeacherIds?.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${selectedId === t.id ? 'bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30' : 'hover:bg-[var(--bg-secondary)] border border-transparent'} ${isCurrent ? 'opacity-50' : ''}`}
                    disabled={isCurrent}
                  >
                    <img src={t.avatar} alt="" className="w-8 h-8 rounded-xl object-cover border border-[var(--border-color)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-[var(--text-primary)] truncate">{t.name}</p>
                      <p className="text-[8px] font-bold text-[var(--text-muted)] truncate">{t.email}</p>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[7px] font-black uppercase ${t.role === 'superadmin' || t.role === 'admin' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>{t.role}</span>
                    {selectedId === t.id && <i className="fa-solid fa-check-circle text-[var(--accent-color)] text-sm"></i>}
                    {isCurrent && <span className="text-[7px] font-bold text-[var(--text-muted)] uppercase">Atanmış</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border-color)] flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[var(--bg-hover)] transition-all">İptal</button>
          <button
            onClick={handleAssign}
            disabled={!selectedId || submitting}
            className="flex-1 py-2.5 bg-[var(--accent-color)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? <i className="fa-solid fa-spinner fa-spin"></i> : null}
            Öğretmene Ata
          </button>
        </div>
      </motion.div>
    </div>
  );
};
