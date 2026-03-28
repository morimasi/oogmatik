// @ts-nocheck
import React, { _useState, useEffect, _useCallback, _memo } from 'react';
import {
  Activity,
  _ActivityType,
  GeneratorOptions,
  StudentProfile,
  ActiveCurriculumSession,
} from '../types';
import { DIFFICULTY_OPTIONS } from '../constants';
import { useStudentStore } from '../store/useStudentStore';
import { useActivitySettings } from '../hooks/useActivitySettings';
import { getActivityConfigComponent } from '../registry';

interface GeneratorViewProps {
  activity: Activity;
  onGenerate: (options: GeneratorOptions) => void;
  onBack: () => void;
  isLoading: boolean;
  isExpanded?: boolean;
  onOpenStudentModal?: () => void;
  studentProfile?: StudentProfile | null;
  activeCurriculumSession?: ActiveCurriculumSession | null;
}

const DefaultActivityConfig = ({ options, onChange }: any) => (
  <div className="p-3 bg-[var(--surface-glass)] rounded-xl border border-[var(--border-color)] space-y-3 shadow-inner animate-in fade-in">
    <div className="space-y-1">
      <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block">
        Öğe Sayısı
      </label>
      <input
        type="number"
        value={options.itemCount || 10}
        onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
        className="w-full p-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
      />
    </div>
    <p className="text-[9px] text-[var(--text-muted)] italic leading-tight">
      Bu etkinlik standart parametreler kullanıyor.
    </p>
  </div>
);

export const GeneratorView: React.FC<GeneratorViewProps> = ({
  activity,
  onGenerate,
  onBack,
  isLoading,
  isExpanded = true,
  activeCurriculumSession,
}) => {
  const { students, activeStudent, setActiveStudent } = useStudentStore();

  // activity null/undefined kontrolü
  if (!activity) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-primary)]">
        <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[var(--accent-color)] mb-4"></i>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
          Etkinlik Verileri Yükleniyor...
        </p>
      </div>
    );
  }

  const { options, updateOption } = useActivitySettings(activity.id);

  // MÜFREDAT SEANSI AKTİFSE PARAMETRELERİ OTOMATİK AYARLA
  useEffect(() => {
    if (activeCurriculumSession) {
      // Müfredat zorluk seviyesini eşleştir
      const diffMap: Record<string, any> = {
        Easy: 'Başlangıç',
        Medium: 'Orta',
        Hard: 'Zor',
      };
      updateOption('difficulty', diffMap[activeCurriculumSession.difficulty] || 'Orta');

      // Eğer spesifik bir konu/hedef varsa topic olarak ata
      if (activeCurriculumSession.goal) {
        updateOption('topic', activeCurriculumSession.goal);
      }
    }
  }, [activeCurriculumSession]);

  const handleChange = (key: keyof GeneratorOptions, value: any) => {
    if (activeCurriculumSession && (key === 'difficulty' || key === 'topic')) return; // Müfredat modunda kilitli
    updateOption(key, value);
  };

  const handleStudentChange = (id: string) => {
    if (activeCurriculumSession) return; // Müfredat modunda kilitli
    if (id === 'anonymous') setActiveStudent(null);
    else {
      const student = students.find((s) => s.id === id);
      if (student) setActiveStudent(student);
    }
  };

  const ConfigComponent = getActivityConfigComponent(activity.id) || DefaultActivityConfig;

  return (
    <div className="flex flex-col h-full bg-[var(--bg-paper)] border-r border-[var(--border-color)] shadow-xl overflow-hidden w-full transition-all duration-300">
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] backdrop-blur-sm shrink-0 flex items-center justify-between z-10 h-[50px]">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="w-7 h-7 rounded-full hover:bg-[var(--surface-glass)] flex items-center justify-center text-[var(--text-secondary)] transition-colors text-xs"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <h3
            className="font-bold text-[13px] text-[var(--text-primary)] truncate max-w-[160px]"
            title={activity.title}
          >
            {activity.title}
          </h3>
        </div>
        {isLoading && (
          <i className="fa-solid fa-circle-notch fa-spin text-[var(--accent-color)] text-xs"></i>
        )}
      </div>

      <div
        className={`flex-1 overflow-y-auto p-3 custom-scrollbar min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Curriculum Session Alert */}
        {activeCurriculumSession && (
          <div className="mb-3 p-3 bg-indigo-600 rounded-xl text-white shadow-md animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-indigo-200 text-sm"></i>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Planlı Aktivite
                </span>
              </div>
              <span className="text-[9px] bg-black/20 px-1.5 py-0.5 rounded font-bold">
                {activeCurriculumSession.day}. Gün
              </span>
            </div>
            <p className="text-[10px] font-bold leading-tight">
              {activeCurriculumSession.studentName} için {activeCurriculumSession.difficulty}{' '}
              zorlukta hedef kilitli.
            </p>
          </div>
        )}

        {/* Temel Ayarlar Blok */}
        <div
          className={`mb-4 p-3 rounded-xl border ${activeCurriculumSession ? 'bg-[var(--surface-glass)] border-[var(--border-color)] opacity-70' : 'bg-[var(--accent-muted)] border-[var(--accent-color)]/20'}`}
        >
          <h4
            className={`text-[9px] font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5 ${activeCurriculumSession ? 'text-[var(--text-muted)]' : 'text-[var(--accent-color)]'}`}
          >
            <i className="fa-solid fa-sliders"></i> Temel Ayarlar
          </h4>
          <div className="space-y-2.5">
            <div>
              <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                Öğrenci
              </label>
              <select
                disabled={!!activeCurriculumSession}
                value={activeStudent?.id || 'anonymous'}
                onChange={(e) => handleStudentChange(e.target.value)}
                className="w-full p-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="anonymous">Misafir / Atanmamış</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.grade})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                  Sayfa
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={options.worksheetCount}
                  onChange={(e) => handleChange('worksheetCount', parseInt(e.target.value))}
                  className="w-full p-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                  Zorluk
                </label>
                <select
                  disabled={!!activeCurriculumSession}
                  value={options.difficulty}
                  onChange={(e) => handleChange('difficulty', e.target.value)}
                  className="w-full p-1.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] cursor-pointer disabled:opacity-50"
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <h4 className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-wrench"></i> Özel Ayarlar
          </h4>
          <ConfigComponent options={options} onChange={handleChange} />
        </div>
      </div>

      {/* Sabit Alt Butonlar */}
      <div
        className={`p-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] shrink-0 z-10 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="space-y-2">
          <button
            onClick={() => onGenerate({ ...options, mode: 'fast' })}
            disabled={isLoading}
            className="w-full py-2 bg-[var(--surface-glass)] hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] rounded-lg font-bold text-[11px] transition-all flex items-center justify-center gap-2 border border-[var(--border-color)] disabled:opacity-50 active:scale-95"
          >
            <i className="fa-solid fa-bolt"></i> Hızlı Üret (Algoritma)
          </button>
          <button
            onClick={() => onGenerate({ ...options, mode: 'ai' })}
            disabled={isLoading}
            className="w-full py-2.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] rounded-lg font-black text-[11px] shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
          >
            {isLoading ? (
              <i className="fa-solid fa-circle-notch fa-spin"></i>
            ) : (
              <i className="fa-solid fa-wand-magic-sparkles"></i>
            )}
            {activeCurriculumSession ? 'Plandaki Hedefe Göre Üret' : 'AI ile Üret'}
          </button>
        </div>
      </div>
    </div>
  );
};
