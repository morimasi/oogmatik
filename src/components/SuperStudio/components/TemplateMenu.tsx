import React from 'react';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';

const TEMPLATES = [
    { id: 'okuma-anlama', title: 'Okuma Anlama & Yorumlama', icon: '📖' },
    { id: 'mantik-muhakeme', title: 'Mantık Muhakeme & Paragraf', icon: '🧠' },
    { id: 'dil-bilgisi', title: 'Dil Bilgisi ve Anlatımı', icon: '📝' },
    { id: 'yazim-kurallari', title: 'Yazım Kuralları ve Noktalama', icon: '✏️' },
    { id: 'soz-varligi', title: 'Deyimler, Atasözleri', icon: '🗣️' },
    { id: 'hece-ses', title: 'Hece ve Ses Olayları', icon: '🔊' },
];

export const TemplateMenu: React.FC = () => {
    const { selectedTemplates, toggleTemplate } = useSuperStudioStore();

    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-sm relative w-full">
            <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center">
                <span className="w-1.5 h-5 bg-indigo-500 rounded-full mr-2"></span>
                Şablon Ekle (Çoklu Seçim)
            </h2>

            <div className="grid grid-cols-1 gap-2">
                {TEMPLATES.map(tpl => {
                    const isSelected = selectedTemplates.includes(tpl.id);
                    return (
                        <button
                            key={tpl.id}
                            onClick={() => toggleTemplate(tpl.id)}
                            className={`flex items-center text-left w-full px-3 py-2.5 rounded-lg border transition-all duration-200 ${isSelected
                                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-300'
                                : 'bg-slate-900/50 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                                }`}
                        >
                            <span className="mr-3 text-lg">{tpl.icon}</span>
                            <span className="flex-1 font-medium text-sm">{tpl.title}</span>
                            <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'
                                }`}>
                                {isSelected && <span className="text-white text-[10px]">✓</span>}
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
