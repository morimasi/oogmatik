import React from 'react';
import { useReadingStore } from '../../../store/useReadingStore';

export const ComponentLibrary = () => {
    const { layout, toggleVisibility, setLayout, recalculateLayout } = useReadingStore();

    // Sabit ikonlar ve renkler
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

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newLayout = [...layout];
        const temp = newLayout[index];
        newLayout[index] = newLayout[index - 1];
        newLayout[index - 1] = temp;
        setLayout(newLayout);
        recalculateLayout();
    };

    const moveDown = (index: number) => {
        if (index === layout.length - 1) return;
        const newLayout = [...layout];
        const temp = newLayout[index];
        newLayout[index] = newLayout[index + 1];
        newLayout[index + 1] = temp;
        setLayout(newLayout);
        recalculateLayout();
    };
    // Reorder layout based on drag source and target instanceIds
    const reorderLayout = (sourceId: string, targetId: string) => {
        const sourceIdx = layout.findIndex((i) => i.instanceId === sourceId);
        const targetIdx = layout.findIndex((i) => i.instanceId === targetId);
        if (sourceIdx === -1 || targetIdx === -1) return;
        const newLayout = [...layout];
        const [moved] = newLayout.splice(sourceIdx, 1);
        newLayout.splice(targetIdx, 0, moved);
        setLayout(newLayout);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.dataTransfer.setData('text/plain', id);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.preventDefault();
        const sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== id) {
            reorderLayout(sourceId, id);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                    Bileşen Yöneticisi & Sıralama
                </h3>
                <p className="text-[10px] text-zinc-500 leading-relaxed font-bold">
                    Bileşenleri açıp kapatın veya yön oklarıyla sayfa sıralamasını değiştirin.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
                {layout.map((item, index) => (
                    <div
                        key={item.instanceId}
                        draggable
                        onDragStart={(e) => handleDragStart(e, item.instanceId)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, item.instanceId)}
                        className={`group flex items-center gap-3 p-2.5 rounded-xl transition-all border-2 relative overflow-hidden ${item.isVisible
                            ? 'bg-zinc-800/50 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                            : 'bg-zinc-900 border-zinc-800 opacity-60 hover:opacity-100 hover:border-zinc-700'
                            }`}
                    >
                        {/* Status Indicator */}
                        <div className={`w-1 h-full absolute left-0 top-0 transition-all ${item.isVisible ? 'bg-emerald-500' : 'bg-transparent'}`} />

                        {/* Drag & Move Handles */}
                        <div className="flex flex-col gap-0.5 z-10 pl-1">
                            <button
                                disabled={index === 0}
                                onClick={() => moveUp(index)}
                                title="Yukarı Taşı"
                                className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-emerald-600 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-up text-[8px]"></i>
                            </button>
                            <button
                                disabled={index === layout.length - 1}
                                onClick={() => moveDown(index)}
                                title="Aşağı Taşı"
                                className="w-5 h-5 rounded flex items-center justify-center bg-zinc-800 hover:bg-emerald-600 text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:bg-zinc-800 disabled:hover:text-zinc-400 transition-colors"
                            >
                                <i className="fa-solid fa-chevron-down text-[8px]"></i>
                            </button>
                        </div>

                        {/* Icon */}
                        <div
                            onClick={() => toggleVisibility(item.instanceId)}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-base transition-all cursor-pointer ${item.isVisible ? 'bg-emerald-500/10' : 'bg-zinc-800'
                                }`}
                        >
                            <i className={`fa-solid ${componentMeta[item.id]?.icon || 'fa-cube'} ${item.isVisible ? (componentMeta[item.id]?.color || 'text-white') : 'text-zinc-600'
                                }`}></i>
                        </div>

                        {/* Text / Label */}
                        <div
                            onClick={() => toggleVisibility(item.instanceId)}
                            className="flex-1 flex flex-col min-w-0 cursor-pointer"
                        >
                            <span className={`text-[11px] font-black uppercase tracking-wider truncate ${item.isVisible ? 'text-white' : 'text-zinc-500'
                                }`}>
                                {item.label}
                            </span>
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
                                {item.isVisible ? `Sıra #${index + 1} - Aktif` : `Sıra #${index + 1} - Pasif`}
                            </span>
                        </div>

                        {/* Visibility Check Button */}
                        <button
                            onClick={() => toggleVisibility(item.instanceId)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${item.isVisible ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-700'
                                }`}
                        >
                            <i className={`fa-solid ${item.isVisible ? 'fa-check' : 'fa-plus'} text-[10px]`}></i>
                        </button>
                    </div>
                ))}
            </div>

            {layout.length === 0 && (
                <div className="p-8 border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
                    <i className="fa-solid fa-wand-magic-sparkles text-3xl text-zinc-700"></i>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600 leading-tight">
                        Önce bir hikaye<br />üretmelisiniz
                    </p>
                </div>
            )}
        </div>
    );
};
