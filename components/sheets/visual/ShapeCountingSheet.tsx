
import React from 'react';
import { ShapeCountingData } from '../../../types';
import { PedagogicalHeader, Shape } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => {
    const items = data.searchField || [];
    const target = data.settings?.targetShape || 'triangle';
    
    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black p-1 overflow-hidden select-none">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* Görev Efsanesi (Legend) */}
            <div className="mb-6 flex justify-center">
                <div className="bg-zinc-900 text-white px-8 py-4 rounded-[2rem] shadow-xl flex items-center gap-6 border-4 border-white ring-2 ring-zinc-100">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Hedef Nesne</span>
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-zinc-900 shadow-inner">
                            <Shape name={target as any} className="w-8 h-8" />
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/20"></div>
                    <div className="text-left">
                        <h4 className="text-xl font-black leading-none mb-1 uppercase">NESNE AVI</h4>
                        <p className="text-[10px] text-zinc-400 font-bold tracking-tight">Sahadaki tüm <span className="text-amber-400">{target}</span> şekillerini bul.</p>
                    </div>
                </div>
            </div>

            {/* Arama Sahası */}
            <div className="flex-1 relative bg-zinc-50/50 rounded-[3rem] border-2 border-zinc-200 shadow-inner overflow-hidden mb-6 group">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
                
                <div className="absolute inset-4">
                    {items.map((item, idx) => (
                        <div 
                            key={item.id || idx}
                            className="absolute transition-transform hover:scale-125 cursor-help"
                            style={{ 
                                left: `${item.x}%`, 
                                top: `${item.y}%`, 
                                transform: `rotate(${item.rotation || 0}deg)`,
                                width: `${item.size || 40}px`,
                                height: `${item.size || 40}px`,
                                color: item.color || '#000'
                            }}
                        >
                            <Shape name={item.type as any} className="w-full h-full drop-shadow-sm" />
                            {/* Klinik İşaretleme Kutusu (Print-only support) */}
                            <div className="absolute -inset-1 border border-zinc-200/50 rounded-full opacity-0 group-hover:opacity-100"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cevap ve Kontrol Alanı */}
            <div className="mt-auto grid grid-cols-3 gap-6 items-end border-t border-zinc-100 pt-6 px-6">
                <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Uzman Gözlemi</span>
                    <div className="h-12 border-b-2 border-dashed border-zinc-200"></div>
                </div>

                <div className="flex flex-col items-center">
                    <EditableElement className="bg-zinc-900 text-white p-4 rounded-[2rem] shadow-2xl flex items-center justify-between gap-6 w-full max-w-[200px] border-4 border-white">
                        <span className="text-[10px] font-black uppercase tracking-widest ml-2">TOPLAM:</span>
                        <div className="w-14 h-10 bg-white rounded-xl flex items-center justify-center font-black text-2xl text-zinc-900 shadow-inner">
                            <EditableText value="" tag="span" placeholder="?" />
                        </div>
                    </EditableElement>
                </div>

                <div className="text-right">
                    <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.4em] mb-1">Bursa Disleksi AI • Görsel Tarama</p>
                    <div className="flex gap-3 justify-end text-zinc-300">
                         <i className="fa-solid fa-eye"></i>
                         <i className="fa-solid fa-microchip"></i>
                    </div>
                </div>
            </div>

            {/* Gizli Cevap Anahtarı (Ters Yazı) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-10 transition-opacity rotate-180 text-[10px] font-black select-none pointer-events-none">
                DOĞRU SAYI: {data.correctCount}
            </div>
        </div>
    );
};
