import React from 'react';
import { PedagogicalHeader } from '../common';

export const KendokuSheet = ({ data }: { data: any }) => {
    const contentData = data?.content || data;
    const targetData = Array.isArray(contentData) ? (contentData[0] || {}) : (contentData || {});
    const { puzzles, gridSize = 4, title, instruction } = targetData;

    if (!puzzles || !Array.isArray(puzzles) || puzzles.length === 0) {
        return (
            <div className="p-8 text-center text-zinc-400 font-['Lexend']">
                <p className="text-sm font-bold">Kendoku verisi bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col font-['Lexend'] min-h-[297mm] p-4 print:p-2 bg-white transition-all duration-300">
            <PedagogicalHeader
                title={title || 'Kendoku Bulmacaları'}
                instruction={instruction || 'Her satır ve sütunda 1-N arası sayılar birer kez bulunur. Kafeslerdeki işlem sonuçlarına göre boşlukları doldur.'}
                data={targetData}
            />

            {/* PUZZLES GRID */}
            <div className="grid grid-cols-2 gap-4 print:gap-2 flex-1 my-2 content-start items-center justify-items-center">
                {puzzles.map((puz: any, idx: number) => {
                    const size = puz.size || gridSize || 4;
                    const cages = puz.cages || [];

                    // Map cage target/op to top-left cell of cage
                    const cellCageMap: Record<string, { target: number; op: string }> = {};
                    cages.forEach((c: any) => {
                        if (c.cells && c.cells.length > 0) {
                            const key = `${c.cells[0][0]}_${c.cells[0][1]}`;
                            cellCageMap[key] = { target: c.target, op: c.op };
                        }
                    });

                    return (
                        <div
                            key={puz.id || idx}
                            className="rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50/30 to-white p-4 print:p-2 flex flex-col items-center justify-between shadow-2xs w-full max-w-[130mm]"
                        >
                            {/* Header Label */}
                            <div className="w-full flex items-center justify-between border-b border-purple-100 pb-2 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
                                        {idx + 1}
                                    </span>
                                    <span className="text-xs font-black uppercase text-purple-900 tracking-wider">
                                        Kendoku #{idx + 1} ({size}×{size})
                                    </span>
                                </div>
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-100/80 px-2 py-0.5 rounded-md">
                                    Rakamlar: 1-{size}
                                </span>
                            </div>

                            {/* Kendoku Matrix Grid */}
                            <div
                                className="grid gap-1 print:gap-0.5 bg-purple-900/10 p-2 print:p-1 rounded-2xl border-2 border-purple-300"
                                style={{
                                    gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
                                }}
                            >
                                {Array.from({ length: size }).map((_, r) =>
                                    Array.from({ length: size }).map((_, c) => {
                                        const cageInfo = cellCageMap[`${r}_${c}`];
                                        return (
                                            <div
                                                key={`${r}_${c}`}
                                                className="w-12 h-12 print:w-10 print:h-10 border-2 border-purple-400 bg-white rounded-xl relative flex items-center justify-center font-black text-sm text-purple-950 shadow-2xs"
                                            >
                                                {/* Cage Target Label */}
                                                {cageInfo && (
                                                    <span className="absolute top-0.5 left-1 text-[8px] print:text-[7px] font-extrabold text-purple-600 leading-none">
                                                        {cageInfo.target}{cageInfo.op}
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Instructions hint */}
                            <div className="w-full mt-3 pt-2 border-t border-dashed border-purple-200 flex justify-between text-[8px] font-bold text-purple-400">
                                <span>• Satır/Sütun tekrarı yok</span>
                                <span>• Kafes işlemini sağla</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CLINICAL FOOTER */}
            <div className="mt-auto pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white">
                <div className="col-span-1 flex flex-col justify-center">
                    <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
                        KENDOKU &<br />MANTIKSAL AKIL YÜRÜTME
                    </span>
                </div>
                {[
                    { label: 'HEDEF SÜRE', val: '10:00', unit: 'dk' },
                    { label: 'ÇÖZÜLEN', val: '___', unit: 'Bulmaca' },
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
