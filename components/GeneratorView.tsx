// @ts-nocheck
import React, { useState, useEffect, useCallback, memo } from 'react';
import { Activity, ActivityType, GeneratorOptions, StudentProfile, ActiveCurriculumSession } from '../types';
import { DIFFICULTY_OPTIONS } from '../constants';
import { useStudent } from '../context/StudentContext';
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
    <div className="p-4 bg-[var(--surface-glass)] rounded-2xl border border-[var(--border-color)] space-y-4 shadow-inner animate-in fade-in">
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Öğe Sayısı</label>
            <input
                type="number" value={options.itemCount || 10}
                onChange={e => onChange('itemCount', parseInt(e.target.value))}
                className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
            />
        </div>
        <p className="text-[10px] text-[var(--text-muted)] italic">Bu etkinlik standart parametreler kullanıyor.</p>
    </div>
);

export const GeneratorView: React.FC<GeneratorViewProps> = ({
    activity,
    onGenerate,
    onBack,
    isLoading,
    isExpanded = true,
    activeCurriculumSession
}) => {
    const { students, activeStudent, setActiveStudent } = useStudent();

    // activity null/undefined kontrolü
    if (!activity) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[var(--bg-primary)]">
                <i className="fa-solid fa-circle-notch fa-spin text-2xl text-[var(--accent-color)] mb-4"></i>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Etkinlik Verileri Yükleniyor...</p>
            </div>
        );
    }

    const { options, updateOption } = useActivitySettings(activity.id);

    // MÜFREDAT SEANSI AKTİFSE PARAMETRELERİ OTOMATİK AYARLA
    useEffect(() => {
        if (activeCurriculumSession) {
            // Müfredat zorluk seviyesini eşleştir
            const diffMap: Record<string, any> = {
                'Easy': 'Başlangıç',
                'Medium': 'Orta',
                'Hard': 'Zor'
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
            const student = students.find(s => s.id === id);
            if (student) setActiveStudent(student);
        }
    };

    const ConfigComponent = getActivityConfigComponent(activity.id) || DefaultActivityConfig;

    return (
        <div className="flex flex-col h-full bg-[var(--bg-paper)] border-r border-[var(--border-color)] shadow-xl overflow-hidden w-full transition-all duration-300">
            {/* Header */}
            <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] backdrop-blur-sm shrink-0 flex items-center justify-between z-10 h-[60px]">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded-full hover:bg-[var(--surface-glass)] flex items-center justify-center text-[var(--text-secondary)] transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <h3 className="font-bold text-sm text-[var(--text-primary)] truncate max-w-[150px]" title={activity.title}>{activity.title}</h3>
                </div>
                {isLoading && <i className="fa-solid fa-circle-notch fa-spin text-[var(--accent-color)]"></i>}
            </div>

            <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

                {/* Curriculum Session Alert */}
                {activeCurriculumSession && (
                    <div className="mb-6 p-4 bg-indigo-600 rounded-2xl text-white shadow-lg animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <i className="fa-solid fa-calendar-check text-indigo-200"></i>
                            <span className="text-[10px] font-black uppercase tracking-widest">Planlı Aktivite Aktif</span>
                        </div>
                        <p className="text-xs font-bold leading-snug">
                            {activeCurriculumSession.studentName} için {activeCurriculumSession.day}. gün hedefi doğrultusunda üretim yapılacaktır.
                        </p>
                        <div className="mt-2 text-[9px] opacity-70 bg-black/20 p-2 rounded-lg italic">
                            Zorluk ve Konu otomatik kilitlenmiştir.
                        </div>
                    </div>
                )}

                {/* Global Settings (Öğrenci) */}
                <div className={`mb-6 p-4 rounded-[1.5rem] border ${activeCurriculumSession ? 'bg-[var(--surface-glass)] border-[var(--border-color)] opacity-70' : 'bg-[var(--accent-muted)] border-[var(--accent-color)]/20'}`}>
                    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 ${activeCurriculumSession ? 'text-[var(--text-muted)]' : 'text-[var(--accent-color)]'}`}><i className="fa-solid fa-user-graduate"></i> Aktif Öğrenci</h4>
                    <select
                        disabled={!!activeCurriculumSession}
                        value={activeStudent?.id || "anonymous"}
                        onChange={(e) => handleStudentChange(e.target.value)}
                        className="w-full p-2.5 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-sm font-bold text-[var(--text-primary)] outline-none cursor-pointer disabled:cursor-not-allowed"
                    >
                        <option value="anonymous">Misafir / Atanmamış</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                    </select>
                </div>

                {/* Common Params */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Sayfa Sayısı</label>
                        <input type="number" min={1} max={10} value={options.worksheetCount} onChange={e => handleChange('worksheetCount', parseInt(e.target.value))} className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Zorluk Seviyesi</label>
                        <select
                            disabled={!!activeCurriculumSession}
                            value={options.difficulty}
                            onChange={e => handleChange('difficulty', e.target.value)}
                            className="w-full p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] cursor-pointer disabled:opacity-50"
                        >
                            {DIFFICULTY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-4 mb-4">
                    <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-4">Etkinliğe Özel Ayarlar</h4>
                    <ConfigComponent options={options} onChange={handleChange} />
                </div>

                <div className="mt-8 space-y-3 pb-8">
                    <button
                        onClick={() => onGenerate({ ...options, mode: 'fast' })}
                        disabled={isLoading}
                        className="w-full py-3 bg-[var(--surface-glass)] hover:bg-[var(--accent-muted)] text-[var(--text-secondary)] hover:text-[var(--accent-color)] rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-[var(--border-color)] disabled:opacity-50 active:scale-95"
                    >
                        <i className="fa-solid fa-bolt"></i> Hızlı Üret (Algoritma)
                    </button>
                    <button
                        onClick={() => onGenerate({ ...options, mode: 'ai' })}
                        disabled={isLoading}
                        className="w-full px-4 py-3.5 bg-[var(--accent-color)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] rounded-xl font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                    >
                        {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        {activeCurriculumSession ? 'Plandaki Hedefe Göre Üret' : 'AI ile Üret'}
                    </button>
                </div>
            </div>
        </div>
    );
};
