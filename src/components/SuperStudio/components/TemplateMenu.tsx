import React from 'react';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { SUPER_STUDIO_REGISTRY } from '../templates/registry';

export const TemplateMenu: React.FC = () => {
    const { selectedTemplates, toggleTemplate } = useSuperStudioStore();

    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-sm relative w-full">
            <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center">
                <span className="w-1.5 h-5 bg-accent rounded-full mr-2"></span>
                Şablon Ekle (Çoklu Seçim)
            </h2>

            <div className="grid grid-cols-1 gap-2">
                {SUPER_STUDIO_REGISTRY.map(tpl => {
                    const isSelected = selectedTemplates.includes(tpl.id);
                    return (
                        <button
                            key={tpl.id}
                            onClick={() => toggleTemplate(tpl.id)}
                            className={`flex items-center text-left w-full px-3 py-2.5 rounded-lg border transition-all duration-200 ${isSelected
                                ? 'bg-accent/10 border-accent/40 text-accent/90'
                                : 'bg-slate-900/50 border-slate-700/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
                                }`}
                        >
                            <span className="mr-3 text-lg">
                                <i className={`fa-solid ${tpl.icon}`}></i>
                            </span>
                            <div className="flex-1 flex flex-col">
                                <span className="font-medium text-sm">{tpl.title}</span>
                                <span className="text-[10px] text-slate-500 leading-tight">{tpl.description}</span>
                            </div>
                            <div className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border ${isSelected ? 'bg-accent border-accent' : 'border-slate-600'
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
