
import React from 'react';
import { ActivityLibraryItem } from '../../../services/generators/promptLibrary';

interface SmartTooltipProps {
    item: ActivityLibraryItem | null;
    pos: { x: number; y: number };
}

export const SmartTooltip: React.FC<SmartTooltipProps> = ({ item, pos }) => {
    if (!item) return null;

    return (
        <div 
            className="fixed z-[150] w-80 bg-zinc-900 border border-indigo-500/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 rounded-3xl pointer-events-none animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl"
            style={{ 
                left: Math.min(window.innerWidth - 340, pos.x + 20), 
                top: pos.y - 120 
            }}
        >
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Klinik Analiz</span>
            </div>
            <h5 className="text-white font-bold text-sm mb-2">{item.title}</h5>
            <p className="text-zinc-400 text-xs leading-relaxed mb-4">{item.description}</p>
            <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <p className="text-[9px] font-bold text-zinc-500 uppercase mb-1 italic">Yapay Zeka Mimarisi:</p>
                <p className="text-[10px] text-zinc-300 line-clamp-3 leading-tight opacity-70">"{item.basePrompt}"</p>
            </div>
        </div>
    );
};
