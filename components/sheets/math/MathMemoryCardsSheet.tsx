
import React from 'react';
import { MathMemoryCardsData, MathMemoryCard } from '../../../types';
import { PedagogicalHeader, TenFrame, Domino, Base10Visualizer } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const MemoryCardUI: React.FC<{ card: MathMemoryCard, showCheckCode: boolean }> = ({ card, showCheckCode }) => {
    return (
        <EditableElement className="aspect-[3/4] bg-white border-[1px] border-zinc-300 rounded-lg flex flex-col items-center justify-center p-4 relative overflow-hidden group shadow-sm transition-all hover:border-indigo-400 break-inside-avoid">
            {/* Kesim Kılavuzu (İç Çerçeve) */}
            <div className="absolute inset-0 border-[1px] border-dashed border-zinc-100 pointer-events-none"></div>
            
            {/* Kontrol Kodu (Ebeveyn Doğrulama Sistemi) */}
            {showCheckCode && (
                <div className="absolute top-1 left-1.5 text-[7px] font-black text-zinc-200 select-none tracking-tighter opacity-50 group-hover:opacity-100 transition-opacity">
                    REF:{card.pairId.split('-')[0].toUpperCase()}
                </div>
            )}

            <div className="flex-1 flex items-center justify-center w-full transform group-hover:scale-105 transition-transform duration-500">
                {card.type === 'operation' && (
                    <span className="text-2xl font-black text-zinc-900 tracking-tighter text-center leading-none">
                        <EditableText value={card.content.replace('x', '×').replace('/', '÷')} tag="span" />
                    </span>
                )}
                {card.type === 'number' && (
                    <div className="flex flex-col items-center">
                        <span className="text-4xl font-black text-indigo-600 drop-shadow-sm">{card.content}</span>
                        <div className="w-8 h-1.5 bg-indigo-100 rounded-full mt-2"></div>
                    </div>
                )}
                {card.type === 'visual' && (
                    <div className="scale-[0.85] origin-center">
                        {card.visualType === 'ten-frame' && <TenFrame count={card.numValue} />}
                        {card.visualType === 'dice' && <Domino count={card.numValue} />}
                        {card.visualType === 'blocks' && <Base10Visualizer number={card.numValue} />}
                    </div>
                )}
                {card.type === 'text' && (
                    <span className="text-xs font-bold text-center text-zinc-600 uppercase leading-tight italic px-2">
                        <EditableText value={card.content} tag="span" />
                    </span>
                )}
            </div>

            {/* İkonik Alt Köşe Süsü */}
            <div className="absolute bottom-1 right-2 opacity-5 group-hover:opacity-20 transition-opacity">
                <i className={`fa-solid ${card.type === 'operation' ? 'fa-calculator' : 'fa-brain'} text-sm`}></i>
            </div>
        </EditableElement>
    );
};

export const MathMemoryCardsSheet: React.FC<{ data: MathMemoryCardsData }> = ({ data }) => {
    const cardCount = data.cards?.length || 0;
    // Sayfa doluluğuna göre kolon sayısını belirle
    const cols = cardCount > 24 ? 'grid-cols-6' : (cardCount > 12 ? 'grid-cols-4' : 'grid-cols-3');
    
    return (
        <div className="flex flex-col h-full font-lexend p-1 bg-white">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div 
                className={`flex-1 grid ${cols} gap-3 mt-4 content-start`}
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
            <div className="mt-6 p-4 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200 flex justify-between items-center opacity-70 break-inside-avoid shadow-inner">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 shadow-sm">
                        <i className="fa-solid fa-scissors"></i>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Materyal Hazırlama</p>
                        <p className="text-[9px] text-zinc-400 font-medium italic">Kartları dış çerçevelerinden özenle kesin. Daha uzun kullanım için karton üzerine yapıştırabilirsiniz.</p>
                    </div>
                </div>
                <div className="text-right flex flex-col items-end">
                    <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em] mb-1">Bursa Disleksi AI • Hafıza Modülü v2.1</p>
                    <div className="flex gap-2">
                        <div className="w-4 h-1 bg-indigo-500 rounded-full"></div>
                        <div className="w-1.5 h-1 bg-zinc-200 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
