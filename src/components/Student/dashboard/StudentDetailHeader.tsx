import React from 'react';
import { Student } from '../../../types';
import { useToastStore } from '../../../store/useToastStore';

interface StudentDetailHeaderProps {
  student: Student;
  isActive: boolean;
  onActivate: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const StudentDetailHeader: React.FC<StudentDetailHeaderProps> = ({
  student,
  isActive,
  onActivate,
  onEdit,
  onDelete,
}) => {
  const handleActivateClick = () => {
    onActivate();
    useToastStore.getState().success(`${student.name} başarıyla aktif edildi.`, 2000);
  };

  return (
    <div className="bg-[var(--bg-paper)]/40 backdrop-blur-2xl border-b border-[var(--border-color)]/30 px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 z-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--accent-color)]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>

      {/* Info Left */}
      <div className="flex items-center gap-4 relative z-10 w-full md:w-auto text-left">
        <div className="relative shrink-0">
          <img
            src={student.avatar}
            className="w-12 h-12 rounded-xl border border-[var(--border-color)] shadow-lg bg-[var(--bg-secondary)]"
            alt={student.name}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[var(--accent-color)] rounded-lg flex items-center justify-center text-white border border-[var(--bg-paper)] shadow-lg">
            <i className="fa-solid fa-graduation-cap text-[8px]"></i>
          </div>
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-black text-[var(--text-primary)] tracking-tighter uppercase truncate leading-none mb-1">
            {student.name}
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 opacity-80">
            <span className="text-[7px] font-black uppercase text-[var(--text-muted)] bg-[var(--bg-secondary)]/80 px-2 py-0.5 rounded border border-[var(--border-color)]">
              {student.grade}
            </span>
            {student.diagnosis?.[0] && (
              <span className="text-[7px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10">
                {student.diagnosis[0]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Actions Right */}
      <div className="flex gap-2 relative z-10 w-full md:w-auto">
        <button
          onClick={handleActivateClick}
          className={`flex-1 md:flex-none px-4 py-2 rounded-xl font-black text-[9px] tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 uppercase ${
            isActive
              ? 'bg-emerald-500 text-white shadow-emerald-500/20'
              : 'bg-[var(--accent-color)] text-white shadow-indigo-500/20 hover:scale-105'
          }`}
        >
          <i className={`fa-solid ${isActive ? 'fa-check' : 'fa-play'} text-[8px]`}></i>
          {isActive ? 'AKTİF' : 'AKTİFLEŞTİR'}
        </button>

        <button
          onClick={onEdit}
          title="Öğrenci Bilgilerini Düzenle"
          className="w-8 h-8 bg-[var(--surface-elevated)] border border-[var(--border-color)] hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] rounded-lg transition-all flex items-center justify-center"
        >
          <i className="fa-solid fa-pen text-[10px]"></i>
        </button>

        <button
          onClick={onDelete}
          title="Öğrenciyi Sil"
          className="w-8 h-8 bg-rose-500/5 text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center justify-center transition-all border border-rose-500/10"
        >
          <i className="fa-solid fa-trash-can text-[10px]"></i>
        </button>
      </div>
    </div>
  );
};
