
import React from 'react';
import { MathMemoryCardsData, MathMemoryCard } from '../../../types';
import { PedagogicalHeader, TenFrame, Domino, Base10Visualizer } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const MemoryCardUI = ({ card, showCheckCode }: { card: MathMemoryCard, showCheckCode: boolean }) => {
    return (
        <EditableElement className="h-full w-full bg-white border-[1px] border-zinc-300 rounded-lg flex flex-col items-center justify-center p-2 relative overflow-hidden group shadow-sm transition-all hover:border-indigo-400 break-inside-avoid">
            {/* Kesim Kılavuzu (İç Çerçeve) */}
            <div className="absolute inset-0 border-[1px] border-dashed border-zinc-100 pointer-events-none"></div>

            {/* Kontrol Kodu (Ebeveyn Doğrulama Sistemi) */}
            {showCheckCode && (
                <div className="absolute top-1 left-1 text-[6px] font-black text-zinc-300 select-none tracking-tighter">
                    REF:{card.pairId.split('-')[0].toUpperCase()}
                </div>
            )}

            <div className="flex-1 flex items-center justify-center w-full transform group-hover:scale-105 transition-transform duration-500">
                {card.type === 'operation' && (
                    <span className="text-xl font-black text-zinc-900 tracking-tighter text-center leading-none">
                        <EditableText value={card.content.replace('x', '×').replace('/', '÷')} tag="span" />
                    </span>
                )}
                {card.type === 'number' && (
                    <div className="flex flex-col items-center">
                        <span className="text-3xl font-black text-indigo-600 drop-shadow-sm">{card.content}</span>
                        <div className="w-6 h-1 bg-indigo-100 rounded-full mt-1"></div>
                    </div>
                )}
                {card.type === 'visual' && (
                    <div className="scale-[0.70] origin-center">
                        {card.visualType === 'ten-frame' && <TenFrame count={card.numValue} />}
                        {card.visualType === 'dice' && <Domino count={card.numValue} />}
                        {card.visualType === 'blocks' && <Base10Visualizer number={card.numValue} />}
                    </div>
                )}
                {card.type === 'text' && (
                    <span className="text-[10px] font-bold text-center text-zinc-600 uppercase leading-tight italic px-1">
                        <EditableText value={card.content} tag="span" />
                    </span>
                )}
            </div>

            {/* İkonik Alt Köşe Süsü */}
            <div className="absolute bottom-1 right-1 opacity-5 group-hover:opacity-20 transition-opacity">
                <i className={`fa-solid ${card.type === 'operation' ? 'fa-calculator' : 'fa-brain'} text-[10px]`}></i>
            </div>
        </EditableElement>
    );
};

export const MathMemoryCardsSheet = ({ data }: { data: MathMemoryCardsData }) => {
    const cardCount = data.cards?.length || 0;
    // Optimize columns for exactly 24 or 32 cards (4 cols is perfect for A4)
    const cols = 'grid-cols-4';
    const rows = cardCount > 24 ? 'grid-rows-8' : 'grid-rows-6';

    return (
        <div className="flex flex-col h-full font-lexend p-2 bg-white">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />

            <div
                className={`flex-1 grid ${cols} ${rows} gap-1.5 mt-2 print:mt-1 content-start`}
            >
                {(data.cards || []).map((card) => (
                    <MemoryCardUI
                        key={card.id}
                        card={card}
                        showCheckCode={data.settings?.showNumbers !== false}
                    />
                ))}
            </div>

            {/* Fiziksel Materyal Talimat Şeridi */}
            <div className="mt-2 print:mt-1 p-2 bg-zinc-50 rounded-xl border-2 border-dashed border-zinc-200 flex justify-between items-center opacity-70 break-inside-avoid shadow-inner shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                        <i className="fa-solid fa-scissors text-xs"></i>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-0.5">Materyal Hazırlama</p>
                        <p className="text-[7px] text-zinc-400 font-medium italic">Kartları dış çerçevelerinden özenle kesin. Eşleştirme oyunu olarak kullanın.</p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-[6px] text-zinc-400 font-bold uppercase tracking-[0.4em] mb-1">Bursa Disleksi EduMind • Hafıza Modülü v3.0</p>
                    <div className="flex gap-1.5">
                        <div className="w-3 h-1 bg-indigo-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-zinc-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};


