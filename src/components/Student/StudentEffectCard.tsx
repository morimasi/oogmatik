import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CheckCircle } from 'lucide-react';
import { Student } from '../../types';
import { useStudentStore } from '../../store/useStudentStore';
import { useToastStore } from '../../store/useToastStore';
import { logError } from '../../utils/logger';

/**
 * Compact premium list-row card for a student.
 * Glassmorphism row with avatar initials, inline info, hover-reveal action icons.
 */
export const StudentEffectCard: React.FC<{ student: Student; onClick?: () => void }> = ({ student, onClick }) => {
  const { updateStudent, deleteStudent } = useStudentStore();
  const toast = useToastStore();
  const [isEditOpen, setEditOpen] = useState(false);

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditOpen(true);
  };
  const closeEdit = () => setEditOpen(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!student.id) return;
    if (!window.confirm('Bu öğrenciyi ve tüm verilerini silmek istediğinize emin misiniz?')) return;
    try {
      await deleteStudent(student.id);
      toast.success('Öğrenci silindi', 2000);
    } catch (e) {
      logError('Student delete failed', { error: e });
      toast.error('Silme hatası', 3000);
    }
  };

  const handleFinish = async (values: any) => {
    try {
      await updateStudent(student.id, values);
      toast.success('Öğrenci güncellendi', 2000);
      closeEdit();
    } catch (e) {
      logError('Student update failed', { error: e });
      toast.error('Güncelleme hatası', 3000);
    }
  };

  const diagnosisText = Array.isArray(student.diagnosis)
    ? student.diagnosis.join(', ')
    : (student.diagnosis || '');

  const initials = (student.name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <div
        onClick={onClick}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-xl border transition-all duration-200
          bg-[var(--bg-paper)]/20 backdrop-blur-sm border-[var(--border-color)]/60
          ${onClick ? 'cursor-pointer hover:bg-[var(--accent-color)]/10 hover:border-[var(--accent-color)]/40' : ''}
        `}
      >
        {/* Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-color)]/70 to-[var(--accent-color)]/30 flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight">
              {student.name}
            </span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] whitespace-nowrap">
              {student.grade}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[var(--text-muted)]">{student.age} yaş</span>
            {diagnosisText && (
              <>
                <span className="text-[var(--text-muted)] opacity-40 text-[10px]">•</span>
                <span className="text-[11px] text-emerald-500/80 truncate">{diagnosisText}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions — sadece hover'da görünür */}
        <div className="flex-shrink-0 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={openEdit}
            title="Düzenle"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 transition-all"
          >
            <Edit size={13} />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            title="Sil"
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeEdit}
          >
            <motion.div
              className="bg-[var(--bg-paper)] w-full max-w-lg rounded-2xl p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4">Öğrenci Düzenle</h3>
              <form onSubmit={e => { e.preventDefault(); handleFinish(Object.fromEntries(new FormData(e.currentTarget))); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad Soyad</label>
                  <input name="name" defaultValue={student.name} required className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yaş</label>
                  <input type="number" name="age" defaultValue={student.age} min={1} max={30} required className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sınıf</label>
                  <select name="grade" defaultValue={student.grade} className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded">
                    {['Okul Öncesi', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf', 'Lise Hazırlık', '9. Sınıf'].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tanı / Özel Durum (virgüllerle ayrılmış)</label>
                  <input name="diagnosis" defaultValue={diagnosisText} placeholder="Disleksi, DEHB" className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Notlar</label>
                  <textarea name="notes" defaultValue={student.notes} rows={3} className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded" />
                </div>
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={closeEdit} className="px-4 py-2 bg-gray-500 text-white rounded">İptal</button>
                  <button type="submit" className="px-4 py-2 bg-[var(--accent-color)] text-white rounded flex items-center gap-2">
                    <CheckCircle size={14} /> Kaydet
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
