import React from 'react';
import { useReadingStore } from '../../../store/useReadingStore';

export const ComponentLibrary = () => {
    const { layout, toggleVisibility } = useReadingStore();

    // Sabit sıra ve ikonlar
    const componentMeta: Record<string, { icon: string; color: string }> = {
        'header': { icon: 'fa-heading', color: 'text-sky-500' },
        'story_block': { icon: 'fa-book-open', color: 'text-amber-500' },
        '5n1k': { icon: 'fa-circle-question', color: 'text-emerald-500' },
        'vocabulary': { icon: 'fa-spell-check', color: 'text-purple-500' },
        'pedagogical_goals': { icon: 'fa-brain', color: 'text-rose-500' },
        'test_questions': { icon: 'fa-list-check', color: 'text-indigo-500' },
        'logic_problem': { icon: 'fa-puzzle-piece', color: 'text-orange-500' },
        'syllable_train': { icon: 'fa-train', color: 'text-cyan-500' },
        'creative_area': { icon: 'fa-palette', color: 'text-pink-500' },
        'note_area': { icon: 'fa-sticky-note', color: 'text-yellow-600' }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Bileşen Yöneticisi
                </h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                    Sayfaya eklenecek bileşenleri aktif/pasif hale getirin.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {[...layout].sort((a,b) => {
                     const order: Record<string, number> = { 'header': 0, 'story_block': 1, '5n1k': 2, 'vocabulary': 3, 'pedagogical_goals': 4, 'test_questions': 5, 'logic_problem': 6, 'syllable_train': 7, 'creative_area': 8, 'note_area': 9 };
                     return (order[a.id] ?? 99) - (order[b.id] ?? 99);
                }).map((item) => (
                    <button
                        key={item.instanceId}
                        onClick={() => toggleVisibility(item.instanceId)}
                        className={`group flex items-center gap-4 p-3 rounded-xl transition-all border-2 text-left relative overflow-hidden ${
                            item.isVisible 
                            ? 'bg-zinc-800/50 border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                            : 'bg-zinc-900 border-zinc-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 hover:border-zinc-700'
                        }`}
                    >
                        {/* Status Indicator */}
                        <div className={`w-1 h-full absolute left-0 top-0 transition-all ${item.isVisible ? 'bg-emerald-500' : 'bg-transparent'}`} />

                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-all ${
                            item.isVisible ? 'bg-emerald-500/10' : 'bg-zinc-800'
                        }`}>
                            <i className={`fa-solid ${componentMeta[item.id]?.icon || 'fa-cube'} ${
                                item.isVisible ? (componentMeta[item.id]?.color || 'text-white') : 'text-zinc-600'
                            }`}></i>
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                            <span className={`text-[11px] font-black uppercase tracking-wider truncate ${
                                item.isVisible ? 'text-white' : 'text-zinc-500'
                            }`}>
                                {item.label}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                {item.isVisible ? 'Aktif' : 'Pasif'}
                            </span>
                        </div>

                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            item.isVisible ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-700'
                        }`}>
                            <i className={`fa-solid ${item.isVisible ? 'fa-check' : 'fa-plus'} text-[10px]`}></i>
                        </div>
                    </button>
                ))}
            </div>

            {layout.length === 0 && (
                <div className="p-8 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                    <i className="fa-solid fa-wand-magic-sparkles text-3xl text-zinc-700"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-tight">
                        Önce bir hikaye<br/>üretmelisiniz
                    </p>
                </div>
            )}
        </div>
    );
};
