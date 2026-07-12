import React, { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CheckCircle, GraduationCap, User, Tag, FileText } from 'lucide-react';
import { Student } from '../../types';
import { useStudentStore } from '../../store/useStudentStore';
import { useToastStore } from '../../store/useToastStore';
import { logError } from '../../utils/logger';

/**
 * Ultra-compact list row with hover preview popup.
 */
export const StudentEffectCard: React.FC<{ student: Student; onClick?: () => void }> = ({ student, onClick }) => {
  const { updateStudent, deleteStudent } = useStudentStore();
  const toast = useToastStore();
  const [isEditOpen, setEditOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number } | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openEdit = (e: React.MouseEvent) => { e.stopPropagation(); setEditOpen(true); };
  const closeEdit = () => setEditOpen(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!student.id) return;
    if (!window.confirm('Bu öğrenciyi silmek istediğinize emin misiniz?')) return;
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

  const showPopup = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (!rowRef.current) return;
    const rect = rowRef.current.getBoundingClientRect();
    // 0.5cm ≈ ~19px sağında başlasın
    setPopupPos({ top: rect.top, left: rect.right + 19 });
  }, []);

  const hidePopup = useCallback(() => {
    hideTimer.current = setTimeout(() => setPopupPos(null), 80);
  }, []);

  const keepPopup = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const diagnosisText = Array.isArray(student.diagnosis)
    ? student.diagnosis.join(', ')
    : (student.diagnosis || '');

  return (
    <>
      <div
        ref={rowRef}
        onClick={onClick}
        onMouseEnter={showPopup}
        onMouseLeave={hidePopup}
        className={`group flex items-center px-2 py-[3px] transition-colors duration-100 relative
          ${onClick ? 'cursor-pointer rounded-md hover:bg-[var(--accent-color)]/10' : ''}
        `}
      >
        {/* İsim */}
        <span className="flex-1 text-[12px] font-medium text-[var(--text-primary)] whitespace-nowrap overflow-hidden leading-5">
          {student.name}
        </span>

        {/* Sınıf */}
        <span className="text-[10px] text-[var(--text-muted)] whitespace-nowrap opacity-50 ml-2 flex-shrink-0">
          {student.grade}
        </span>

        {/* Aksiyon ikonlar — daima görünür üstte (z-10) hover sırasında da */}
        <div className="flex items-center ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-100 flex-shrink-0 z-10">
          <button type="button" onClick={openEdit} title="Düzenle"
            className="p-0.5 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors">
            <Edit size={10} />
          </button>
          <button type="button" onClick={handleDelete} title="Sil"
            className="p-0.5 text-[var(--text-muted)] hover:text-red-500 transition-colors">
            <Trash2 size={10} />
          </button>
        </div>
      </div>

      {/* Hover Popup — Portal */}
      {createPortal(
        <AnimatePresence>
          {popupPos && (
            <motion.div
              onMouseEnter={keepPopup}
              onMouseLeave={hidePopup}
              initial={{ opacity: 0, x: -6, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              style={{ top: popupPos.top, left: popupPos.left, position: 'fixed', zIndex: 9999 }}
              className="w-56 rounded-xl border border-[var(--border-color)]/70 bg-[var(--bg-paper)] shadow-xl backdrop-blur-md p-3 pointer-events-auto"
            >
              {/* Başlık */}
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--accent-color)]/70 to-[var(--accent-color)]/30 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                  {(student.name || '?').split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-tight truncate">{student.name}</p>
                  <p className="text-[10px] text-[var(--accent-color)] opacity-80">{student.grade}</p>
                </div>
              </div>

              {/* Bilgi satırları */}
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <User size={9} className="flex-shrink-0 opacity-60" />
                  <span>{student.age} yaşında</span>
                </div>

                {diagnosisText && (
                  <div className="flex items-start gap-1.5 text-emerald-500/80">
                    <Tag size={9} className="flex-shrink-0 opacity-70 mt-0.5" />
                    <span className="leading-tight">{diagnosisText}</span>
                  </div>
                )}

                {student.notes && (
                  <div className="flex items-start gap-1.5 text-[var(--text-muted)]">
                    <FileText size={9} className="flex-shrink-0 opacity-60 mt-0.5" />
                    <span className="leading-tight line-clamp-2 opacity-70">{student.notes}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={closeEdit}
          >
            <motion.div
              className="bg-[var(--bg-paper)] w-full max-w-lg rounded-2xl p-6 shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
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
                  <label className="block text-sm font-medium mb-1">Tanı / Özel Durum</label>
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
