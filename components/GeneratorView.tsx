
import React from 'react';
import { Activity, ActivityType, GeneratorOptions, StudentProfile } from '../types';
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
}

// Varsayılan / Yedek Ayarlar (Eğer özel ayar dosyası yoksa veya yüklenemezse)
const DefaultActivityConfig = ({ options, onChange }: any) => (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700 space-y-4 shadow-inner animate-in fade-in">
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase block">Öğe Sayısı</label>
            <input 
                type="number" value={options.itemCount || 10} 
                onChange={e => onChange('itemCount', parseInt(e.target.value))}
                className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500" 
            />
        </div>
        <p className="text-[10px] text-zinc-400 italic">Bu etkinlik standart parametreler kullanıyor.</p>
    </div>
);

export const GeneratorView: React.FC<GeneratorViewProps> = ({ activity, onGenerate, onBack, isLoading, isExpanded = true }) => {
    const { students, activeStudent, setActiveStudent } = useStudent();
    
    // YENİ: Ayarları LocalStorage'dan çeken Hook'u kullan
    const { options, updateOption } = useActivitySettings(activity.id);

    const handleChange = (key: keyof GeneratorOptions, value: any) => {
        updateOption(key, value);
    };

    const handleStudentChange = (id: string) => {
        if (id === 'anonymous') setActiveStudent(null);
        else {
            const student = students.find(s => s.id === id);
            if (student) setActiveStudent(student);
        }
    };

    // YENİ: Registry üzerinden güvenli bileşen seçimi
    const ConfigComponent = getActivityConfigComponent(activity.id) || DefaultActivityConfig;

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700 shadow-xl overflow-hidden w-full transition-all duration-300">
            {/* Header */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 backdrop-blur-sm shrink-0 flex items-center justify-between z-10 h-[60px]">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-500 transition-colors"><i className="fa-solid fa-arrow-left"></i></button>
                    <h3 className="font-bold text-sm dark:text-white truncate max-w-[150px]" title={activity.title}>{activity.title}</h3>
                </div>
                {isLoading && <i className="fa-solid fa-circle-notch fa-spin text-indigo-500"></i>}
            </div>

            <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar min-h-0 transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {/* Global Settings (Öğrenci) */}
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-[1.5rem] border border-amber-100 dark:border-amber-800/30">
                    <h4 className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2"><i className="fa-solid fa-user-graduate"></i> Aktif Öğrenci</h4>
                    <select 
                        value={activeStudent?.id || "anonymous"}
                        onChange={(e) => handleStudentChange(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-700 rounded-xl text-sm font-bold outline-none cursor-pointer"
                    >
                        <option value="anonymous">Misafir / Atanmamış</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                    </select>
                </div>

                {/* Common Params */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Sayfa Sayısı</label>
                        <input type="number" min={1} max={10} value={options.worksheetCount} onChange={e => handleChange('worksheetCount', parseInt(e.target.value))} className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Zorluk Seviyesi</label>
                        <select value={options.difficulty} onChange={e => handleChange('difficulty', e.target.value)} className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 cursor-pointer">
                            {DIFFICULTY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                    </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-700 pt-4 mb-4">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Etkinliğe Özel Ayarlar</h4>
                    <ConfigComponent options={options} onChange={handleChange} />
                </div>
                
                <div className="mt-8 space-y-3 pb-8">
                    <button 
                        onClick={() => onGenerate({ ...options, mode: 'fast' })}
                        disabled={isLoading}
                        className="w-full py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700 disabled:opacity-50 active:scale-95"
                    >
                        <i className="fa-solid fa-bolt"></i> Hızlı Üret (Algoritma)
                    </button>
                    <button 
                        onClick={() => onGenerate({ ...options, mode: 'ai' })}
                        disabled={isLoading}
                        className="w-full px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95"
                    >
                        {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                        AI ile Üret
                    </button>
                </div>
            </div>
        </div>
    );
};
