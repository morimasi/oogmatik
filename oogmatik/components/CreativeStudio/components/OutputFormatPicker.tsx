
import React from 'react';
import { OutputFormat } from '../../../types/creativeStudio';

interface OutputFormatPickerProps {
    value: OutputFormat;
    onChange: (format: OutputFormat) => void;
}

const FORMAT_OPTIONS: { id: OutputFormat; label: string; icon: string; description: string }[] = [
    {
        id: 'bento_grid',
        label: 'Bento Grid',
        icon: 'fa-table-cells-large',
        description: 'Modern klinik düzen'
    },
    {
        id: 'classic_page',
        label: 'Klasik Sayfa',
        icon: 'fa-file-lines',
        description: 'Geleneksel çalışma kağıdı'
    },
    {
        id: 'lined_notebook',
        label: 'Çizgili Defter',
        icon: 'fa-grip-lines',
        description: 'Yazma pratiği odaklı'
    },
    {
        id: 'flashcard',
        label: 'Flashcard',
        icon: 'fa-clone',
        description: 'Kesip kullanılabilir kartlar'
    },
    {
        id: 'quiz_card',
        label: 'Quiz Kartı',
        icon: 'fa-clipboard-question',
        description: 'Soru-cevap formatı'
    }
];

export const OutputFormatPicker: React.FC<OutputFormatPickerProps> = ({ value, onChange }) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
                <i className="fa-solid fa-palette text-violet-400 text-xs"></i>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Çıktı Formatı</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
                {FORMAT_OPTIONS.map(opt => (
                    <button
                        key={opt.id}
                        onClick={() => onChange(opt.id)}
                        className={`p-3 rounded-2xl border-2 text-left transition-all flex items-center gap-3 group ${value === opt.id
                                ? 'bg-violet-500/10 border-violet-500/40 shadow-lg'
                                : 'border-white/5 bg-black/20 hover:border-white/20'
                            }`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${value === opt.id ? 'bg-violet-500/20 text-violet-400' : 'bg-zinc-800 text-zinc-500'
                            }`}>
                            <i className={`fa-solid ${opt.icon}`}></i>
                        </div>
                        <div>
                            <p className={`text-xs font-black uppercase ${value === opt.id ? 'text-white' : 'text-zinc-400'
                                }`}>{opt.label}</p>
                            <p className="text-[9px] text-zinc-600 font-bold">{opt.description}</p>
                        </div>
                        {value === opt.id && (
                            <i className="fa-solid fa-circle-check text-violet-400 ml-auto text-sm"></i>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
