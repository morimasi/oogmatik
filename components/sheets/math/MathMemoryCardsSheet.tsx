
import React from 'react';
import { MathMemoryCardsData, MathMemoryCard } from '../../../types';
import { PedagogicalHeader, TenFrame, Domino, Base10Visualizer } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const MemoryCardUI: React.FC<{ card: MathMemoryCard }> = ({ card }) => (
    <EditableElement className="aspect-[3/4] bg-white border-2 border-zinc-200 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden group shadow-sm hover:border-indigo-500 transition-all break-inside-avoid">
        <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-zinc-50 pointer-events-none"></div>
        <div className="flex-1 flex items-center justify-center w-full">
            {card.type === 'operation' && <span className="text-3xl font-black text-zinc-800 tracking-tighter text-center leading-tight">{card.content}</span>}
            {card.type === 'number' && <span className="text-5xl font-black text-indigo-600 drop-shadow-sm">{card.content}</span>}
            {card.type === 'visual' && (
                <div className="scale-90 origin-center">
                    {card.visualType === 'ten-frame' && <TenFrame count={card.numValue} />}
                    {card.visualType === 'dice' && <Domino count={card.numValue} />}
                    {card.visualType === 'blocks' && <Base10Visualizer number={card.numValue} />}
                </div>
            )}
            {card.type === 'text' && <span className="text-sm font-black text-center text-zinc-600 uppercase leading-snug italic"><EditableText value={card.content} tag="span" /></span>}
        </div>
    </EditableElement>
);

export const MathMemoryCardsSheet: React.FC<{ data: MathMemoryCardsData }> = ({ data }) => {
    const cols = data.settings?.gridCols || 4;
    return (
        <div className="flex flex-col h-full font-lexend p-2">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className="flex-1 grid gap-4 mt-8 content-start" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {(data.cards || []).map((card) => <MemoryCardUI key={card.id} card={card} />)}
            </div>
            <div className="mt-10 p-5 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 flex justify-between items-center opacity-60">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-sm"><i className="fa-solid fa-scissors"></i></div>
                    <p className="text-xs font-black text-zinc-500 uppercase tracking-widest leading-tight">Noktalı çizgilerden <br/>özenle kesin.</p>
                </div>
                <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Hafıza Atölyesi v3.5</p>
            </div>
        </div>
    );
};
