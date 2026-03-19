import React from 'react';
import { DirectionalCodeReadingData } from '../../../types/visual';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

interface Props {
    data: DirectionalCodeReadingData;
}

export const DirectionalCodeReadingSheet: React.FC<Props> = ({ data }) => {
    const puzzles = data.content?.puzzles || [];
    const gridSize = data.settings?.gridSize || 6;

    const getInstructionString = (count: number, dir: string, cipherType: string) => {
        if (cipherType === 'arrows') {
            const arrMap: Record<string, string> = { up: '↑', down: '↓', right: '→', left: '←' };
            return `${count}${arrMap[dir] || ''}`;
        }
        if (cipherType === 'letters') {
            const letterMap: Record<string, string> = { up: 'Y', down: 'A', right: 'S', left: 'L' };
            return `${count}${letterMap[dir] || ''}`;
        }
        if (cipherType === 'colors') {
            const colorMap: Record<string, string> = { up: 'MAVİ', down: 'SARI', right: 'KIRMIZI', left: 'YEŞİL' };
            return `${colorMap[dir]} ${count}`;
        }
        return `${count} ${dir}`;
    };

    return (
        <div className="w-full h-full p-10 print:p-4 flex flex-col bg-white overflow-hidden text-zinc-900 font-['Lexend']">
            <PedagogicalHeader
                title={data.content?.title || "ALGORİTMİK ROTA ANALİZİ"}
                instruction={data.content?.storyIntro || "Kodları takip et, engellere takılmadan hedefe ulaş."}
            />

            <div className="flex-1 mt-10 grid grid-cols-1 gap-12 print:gap-8">
                {puzzles.map((puzzle: any, pIdx: number) => (
                    <EditableElement key={puzzle.id || pIdx} className="relative group flex gap-10 print:gap-6 bg-zinc-50/50 p-8 rounded-[3rem] border-2 border-zinc-100 break-inside-avoid shadow-sm transition-all hover:shadow-xl">
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2 border-white z-20">
                            {pIdx + 1}
                        </div>

                        {/* LEFT: GRID AREA */}
                        <div className="w-[55%] relative flex items-center justify-center">
                            <div className="bg-white border-[3px] border-zinc-900 rounded-[2.5rem] p-6 print:p-3 shadow-2xl relative z-10 w-full aspect-square overflow-hidden">
                                <div
                                    className="grid gap-1 w-full h-full"
                                    style={{
                                        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                                        gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                                    }}
                                >
                                    {puzzle.grid.map((row: any[], y: number) => (
                                        row.map((cell: any, x: number) => {
                                            let cellStyle = "bg-white border-2 border-zinc-100 rounded-xl flex items-center justify-center relative";
                                            let content = null;

                                            if (cell.type === 'start') {
                                                cellStyle = "bg-indigo-50 border-2 border-indigo-500 rounded-xl text-indigo-600 flex items-center justify-center relative shadow-inner z-10";
                                                content = <i className={cell.icon || "fa-solid fa-rocket animate-pulse"}></i>;
                                            } else if (cell.type === 'target') {
                                                cellStyle = "bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-600 flex items-center justify-center relative z-10";
                                                content = <i className={cell.icon || "fa-solid fa-flag-checkered"}></i>;
                                            } else if (cell.type === 'obstacle') {
                                                cellStyle = "bg-zinc-800 border-2 border-zinc-900 rounded-xl flex items-center justify-center bg-[repeating-linear-gradient(45deg,_#27272a_0px,_#27272a_5px,_#3f3f46_5px,_#3f3f46_10px)] opacity-90";
                                            }

                                            return (
                                                <div key={`${y}-${x}`} className={`${cellStyle} text-xl print:text-lg`}>
                                                    {content}
                                                </div>
                                            );
                                        })
                                    ))}
                                </div>
                            </div>
                            {/* Decorative Compass Background */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none scale-125">
                                <i className="fa-regular fa-compass text-[30rem]"></i>
                            </div>
                        </div>

                        {/* RIGHT: INSTRUCTIONS AREA */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="bg-white border-[3px] border-zinc-900 rounded-[2.5rem] p-8 print:p-4 shadow-[8px_8px_0px_#1e1b4b] h-full flex flex-col">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-zinc-100">
                                    <div>
                                        <h3 className="text-xs font-black text-zinc-900 uppercase tracking-tighter">{puzzle.title}</h3>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Rota Protokolü</p>
                                    </div>
                                    <i className="fa-solid fa-terminal text-indigo-500"></i>
                                </div>

                                <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                                    {puzzle.instructions.map((inst: any, iIdx: number) => (
                                        <div key={iIdx} className="flex border-2 border-zinc-100 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-200 transition-colors bg-zinc-50/30 group/inst">
                                            <div className="w-10 bg-zinc-100 text-zinc-400 font-black flex items-center justify-center text-[10px] border-r-2 border-zinc-100">
                                                {iIdx + 1}
                                            </div>
                                            <div className="flex-1 p-3 flex items-center text-zinc-900 font-black text-xl tracking-widest pl-6 relative">
                                                {getInstructionString(inst.count, inst.direction, data.settings?.cipherType || 'arrows')}
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg border-2 border-zinc-200 bg-white shadow-inner opacity-40 group-hover/inst:opacity-100 transition-opacity"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Şifre Anahtarı (Zor Modlar İçin) */}
                                {(data.settings?.cipherType === 'letters' || data.settings?.cipherType === 'colors') && (
                                    <div className="mt-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 text-[9px] font-black grid grid-cols-2 gap-2 uppercase tracking-widest text-zinc-400 italic">
                                        {data.settings.cipherType === 'letters' ? (
                                            <><span>Y: Yuk</span><span>A: Aşm</span><span>S: Sağ</span><span>L: Sol</span></>
                                        ) : (
                                            <><span className="text-blue-500">M: Yuk</span><span className="text-yellow-500">S: Aşm</span><span className="text-red-500">K: Sağ</span><span className="text-emerald-500">Y: Sol</span></>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </EditableElement>
                ))}
            </div>

            {/* CLINICAL EVALUATION FOOTER */}
            <div className="mt-10 pt-8 border-t-[3px] border-zinc-100 grid grid-cols-4 gap-6 px-4">
                <div className="col-span-1">
                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] mb-1 block">Clinic Pro</span>
                    <span className="text-sm font-black text-zinc-800 uppercase leading-none">Algoritmik <br />Değerlendirme</span>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-4 border-2 border-zinc-100 flex flex-col justify-between h-16">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Süre</span>
                    <div className="flex items-end gap-1"><span className="text-lg font-black leading-none">__:__</span><span className="text-[7px] font-bold text-zinc-400 mb-0.5 whitespace-nowrap">Dakika</span></div>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-4 border-2 border-zinc-100 flex flex-col justify-between h-16">
                    <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest leading-none">Hata</span>
                    <div className="flex-1 w-full border-b-2 border-zinc-200 mt-2"></div>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-4 border-2 border-zinc-100 flex items-center justify-center">
                    <div className="flex gap-1.5 opacity-30">
                        {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-4 rounded-full border-2 border-zinc-400"></div>)}
                    </div>
                </div>
            </div>
        </div>
    );
};




