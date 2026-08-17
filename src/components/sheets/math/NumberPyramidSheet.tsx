
import React from 'react';
import { PedagogicalHeader } from '../common';

export const NumberPyramidSheet = ({ data }: { data: any }) => {
    const contentData = data?.content || data;
    const targetData = Array.isArray(contentData) ? (contentData[0] || {}) : (contentData || {});
    const { pyramids, title, instruction } = targetData;

    if (!pyramids || !Array.isArray(pyramids) || pyramids.length === 0) {
        return (
            <div className="p-8 text-center text-zinc-400 font-['Lexend']">
                <p className="text-sm font-bold">Sayı piramidi verisi bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col font-['Lexend'] min-h-[297mm] p-4 print:p-2 bg-white transition-all duration-300">
            <PedagogicalHeader
                title={title || 'Sayı Piramitleri & Bilişsel İşlem'}
                instruction={instruction || 'Kural: Üstteki kutu = altındaki komşu iki kutunun işlem sonucuna eşittir. Boş kutuları tamamla.'}
                data={targetData}
            />

            {/* PYRAMIDS GRID */}
            <div className="grid grid-cols-2 gap-4 print:gap-2 flex-1 my-2 content-start items-center justify-items-center">
                {pyramids.map((pyr: any, idx: number) => {
                    const rows = pyr.displayRows || pyr.rows || [];
                    const opSymbol = pyr.operation === 'subtraction' ? '−' : pyr.operation === 'multiplication' ? '×' : '+';

                    return (
                        <div
                            key={pyr.id || idx}
                            className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50/30 to-white p-4 print:p-2 flex flex-col items-center justify-between shadow-2xs w-full max-w-[130mm]"
                        >
                            {/* Header Label */}
                            <div className="w-full flex items-center justify-between border-b border-amber-100 pb-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
                                        {idx + 1}
                                    </span>
                                    <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                                        Piramit #{idx + 1} ({pyr.size || rows.length} Katlı)
                                    </span>
                                </div>
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                                    Kural: {opSymbol} İki Komşu Kutuyu Topla/Hesapla
                                </span>
                            </div>

                            {/* Pyramid Blocks */}
                            <div className="flex flex-col items-center gap-1.5 print:gap-1 my-2">
                                {rows.map((row: Array<number | null>, rIdx: number) => (
                                    <div key={rIdx} className="flex items-center gap-1.5 print:gap-1 justify-center">
                                        {row.map((cell: number | null, cIdx: number) => (
                                            <div
                                                key={cIdx}
                                                className={`w-11 h-11 print:w-9 print:h-9 rounded-2xl border-2 flex items-center justify-center font-black text-sm print:text-xs shadow-2xs transition-all ${cell === null
                                                        ? 'border-dashed border-amber-400 bg-amber-50 text-amber-600 font-extrabold animate-pulse'
                                                        : 'border-amber-300 bg-white text-zinc-900'
                                                    }`}
                                            >
                                                {cell === null ? '?' : cell}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            {/* Footer hint */}
                            <div className="w-full mt-3 pt-2 border-t border-dashed border-amber-200 flex justify-between text-[8px] font-bold text-amber-500">
                                <span>• Alt katman komşularını birleştir</span>
                                <span>• Boş kutuyu bul</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CLINICAL FOOTER */}
            <div className="mt-auto pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white">
                <div className="col-span-1 flex flex-col justify-center">
                    <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
                        SAYI PİRAMİTLERİ &<br />MANTIKSAL TOPLAMA
                    </span>
                </div>
                {[
                    { label: 'HEDEF SÜRE', val: '07:00', unit: 'dk' },
                    { label: 'ÇÖZÜLEN', val: '___', unit: 'Piramit' },
                    { label: 'PERFORMANS', val: '___', unit: 'p' },
                ].map((item) => (
                    <div key={item.label} className="bg-white/10 border border-white/10 rounded-lg p-1.5 flex flex-col justify-between">
                        <span className="text-[7px] font-black text-zinc-400 uppercase">{item.label}</span>
                        <div className="flex items-end gap-0.5">
                            <span className="text-xs font-black text-white">{item.val}</span>
                            <span className="text-[6px] font-bold text-zinc-400 mb-0.5">{item.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


