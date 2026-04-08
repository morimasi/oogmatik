import React from 'react';
import { DirectionalCodeReadingData } from '../../../types/visual';
import { PedagogicalHeader } from '../common';
import { EditableElement } from '../../Editable';

interface Props {
    data: DirectionalCodeReadingData;
}

const CIPHER_LEGEND: Record<string, { label: string; symbols: { dir: string; sym: string }[] }> = {
    arrows: {
        label: 'Ok Şifresi',
        symbols: [
            { dir: 'Yukarı', sym: '↑' },
            { dir: 'Aşağı', sym: '↓' },
            { dir: 'Sağa', sym: '→' },
            { dir: 'Sola', sym: '←' },
        ],
    },
    letters: {
        label: 'Harf Şifresi',
        symbols: [
            { dir: 'Yukarı', sym: 'Y' },
            { dir: 'Aşağı', sym: 'A' },
            { dir: 'Sağa', sym: 'S' },
            { dir: 'Sola', sym: 'L' },
        ],
    },
    colors: {
        label: 'Renk Şifresi',
        symbols: [
            { dir: 'Yukarı', sym: 'MAV' },
            { dir: 'Aşağı', sym: 'SAR' },
            { dir: 'Sağa', sym: 'KIR' },
            { dir: 'Sola', sym: 'YEŞ' },
        ],
    },
};

const getInstructionLabel = (inst: { count: number; direction: string; label?: string }, cipherType: string): string => {
    if (inst.label) return inst.label;
    const legend = CIPHER_LEGEND[cipherType];
    if (!legend) return `${inst.count} ${inst.direction}`;
    const dir = (inst.direction ?? '').toLowerCase();
    if (!dir) return `${inst.count}`;
    const sym = legend.symbols.find(s => dir.startsWith(s.dir.toLowerCase().slice(0, 3)));
    return sym ? `${inst.count}${sym.sym}` : `${inst.count} ${inst.direction}`;
};

export const DirectionalCodeReadingSheet: React.FC<Props> = ({ data }) => {
    const puzzles = data.content?.puzzles || [];
    const gridSize = data.settings?.gridSize || 6;
    const cipherType = data.settings?.cipherType || 'arrows';
    const aestheticMode = (data.settings as any)?.aestheticMode || 'standard';
    const isPremium = aestheticMode === 'premium' || aestheticMode === 'glassmorphism';
    const legend = CIPHER_LEGEND[cipherType] || CIPHER_LEGEND.arrows;
    const cols = puzzles.length > 1 ? 'grid-cols-2' : 'grid-cols-1';

    return (
        <div className={`
            w-full min-h-full p-6 print:p-2 flex flex-col gap-4 print:gap-2 font-['Lexend'] text-zinc-900 overflow-visible
            ${isPremium ? 'bg-slate-50/30' : 'bg-white'}
        `}>
            {/* HEADER */}
            <PedagogicalHeader
                title={data.content?.title || 'ALGORİTMİK ROTA ANALİZİ'}
                instruction={data.content?.storyIntro || 'Kodları takip et, engelle takılmadan hedefe ulaş.'}
            />

            {/* PUZZLE CARDS */}
            <div className={`grid ${cols} gap-6 print:gap-2 flex-1 items-start`}>
                {puzzles.map((puzzle: any, pIdx: number) => {
                    const grid = puzzle.grid || [];
                    const instructions = puzzle.instructions || [];
                    
                    return (
                        <EditableElement 
                            key={pIdx} 
                            className={`
                                relative flex flex-col gap-4 p-5 print:p-2 border-[1.5px] transition-all duration-300 group break-inside-avoid
                                ${isPremium 
                                    ? 'bg-white/80 backdrop-blur-sm border-zinc-200 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-indigo-400' 
                                    : 'bg-zinc-50 border-zinc-100 rounded-[2rem]'}
                            `}
                        >
                            {/* Badge */}
                            <div className={`
                                absolute -top-3 left-10 px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest z-10 shadow-md border-2 border-white
                                ${isPremium ? 'bg-zinc-950 text-white' : 'bg-indigo-600 text-white'}
                            `}>
                                GÖREV {pIdx + 1}
                            </div>

                            {/* 1. ROTA ALGORİTMASI (ÜSTTE - YATAY) */}
                            <div className="bg-zinc-950 rounded-2xl p-4 print:p-1.5 border-2 border-white shadow-lg relative overflow-hidden group/algo">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-12 -mt-12"></div>
                                <h5 className="text-[9px] font-black text-amber-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]"></div>
                                    ROTA ALGORİTMASI
                                </h5>
                                <div className="flex flex-wrap gap-2">
                                    {instructions.map((inst: any, iIdx: number) => (
                                        <div key={iIdx} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1 hover:bg-white/10 transition-colors">
                                            <span className="w-5 h-5 bg-zinc-800 text-white rounded-lg text-[9px] flex items-center justify-center font-black shrink-0 border border-white/20">
                                                {iIdx + 1}
                                            </span>
                                            <span className="text-xs font-black text-white group-hover:text-amber-400 transition-colors">
                                                {getInstructionLabel(inst, cipherType)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 2. GRID VE BAŞLIK (ORTA) */}
                            <div className="flex flex-row gap-6 print:gap-2 items-center justify-center">
                                <div className="p-3 bg-white rounded-2xl border-2 border-zinc-100 shadow-inner ring-4 ring-zinc-50/50">
                                    <div
                                        className="grid gap-px bg-zinc-300 border-[2px] border-zinc-950 rounded-xl overflow-hidden shadow-xl"
                                        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                                    >
                                        {grid.map((row: any, y: number) =>
                                            row.map((cell: any, x: number) => {
                                                const isStart = cell.type === 'start';
                                                const isTarget = cell.type === 'target';
                                                const isObstacle = cell.type === 'obstacle';
                                                
                                                let bg = 'bg-white';
                                                if (isStart) bg = 'bg-indigo-50/50';
                                                if (isTarget) bg = 'bg-emerald-50/50';
                                                if (isObstacle) bg = 'bg-zinc-900';
                                                
                                                return (
                                                    <div
                                                        key={`${y}-${x}`}
                                                        className={`w-9 h-9 print:w-7 print:h-7 ${bg} flex items-center justify-center transition-colors relative`}
                                                    >
                                                        {isStart && (
                                                            <div className="absolute inset-1 border-[1.5px] border-indigo-400 rounded flex items-center justify-center bg-indigo-50/30">
                                                                <div className="w-1 h-1 bg-indigo-500 rounded-full animate-ping"></div>
                                                            </div>
                                                        )}
                                                        {isTarget && (
                                                            <span className="text-emerald-500 text-lg print:text-base drop-shadow-[0_0_5px_#10b981]">★</span>
                                                        )}
                                                        {isObstacle && (
                                                            <div className="w-3 h-3 bg-white/10 rounded-sm rotate-45"></div>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex flex-col">
                                        <h3 className="text-[10px] font-black text-zinc-800 uppercase tracking-widest leading-tight">{String(puzzle.title || `Labirent Protokolü`)}</h3>
                                        <span className="text-[8px] text-zinc-400 font-bold uppercase">Sektör: {puzzle.id}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200">
                                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">GÜVENLİ ROTA</span>
                                    </div>
                                </div>
                            </div>

                            {/* 3. DURUM ANALİZİ (ALTTA - YATAY) */}
                            <div className="p-4 bg-white rounded-2xl border-2 border-zinc-100 ring-4 ring-zinc-50/50">
                                <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <i className="fa-solid fa-satellite-dish text-[8px]"></i>
                                    HEDEF DURUM ANALİZİ
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 h-9 border-2 border-zinc-200 rounded-lg flex items-center justify-center text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:border-emerald-400 hover:text-emerald-500 transition-all cursor-pointer bg-zinc-50/50">
                                        ULAŞILDI
                                    </div>
                                    <div className="flex-1 h-9 border-2 border-zinc-200 rounded-lg flex items-center justify-center text-[9px] font-black text-zinc-400 uppercase tracking-widest hover:border-rose-400 hover:text-rose-500 transition-all cursor-pointer bg-zinc-50/50">
                                        SAPMA
                                    </div>
                                </div>
                            </div>
                        </EditableElement>
                    );
                })}
            </div>
            
            {/* LEGEND BAR (FOOTER) */}
            <div className={`
                flex items-center gap-6 flex-wrap rounded-3xl px-6 py-3 print:py-1 shadow-2xl border-4 border-white ring-8 ring-zinc-50/20
                ${isPremium ? 'bg-zinc-950 border-indigo-500/20' : 'bg-zinc-900'}
            `}>
                <div className="flex flex-col border-r border-white/10 pr-6">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{legend.label}</span>
                    <span className="text-[8px] text-zinc-500 font-bold">KODLAMA ANAHTARI</span>
                </div>
                <div className="flex gap-4 flex-wrap">
                    {legend.symbols.map((s) => (
                        <div key={s.dir} className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl px-4 py-1.5 transition-transform hover:scale-105">
                            <span className="text-amber-400 font-black text-xl drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]">{s.sym}</span>
                            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-tighter">= {s.dir}</span>
                        </div>
                    ))}
                </div>
                <div className="ml-auto hidden sm:flex items-center gap-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm shadow-[0_0_8px_#6366f1]"></div>
                        BAŞLANGIÇ
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-sm shadow-[0_0_8px_#10b981]"></div>
                        HEDEF
                    </div>
                </div>
            </div>

            {/* FOOTER METRICS */}
            <div className={`
                mt-2 pt-4 grid grid-cols-4 gap-4 px-8 pb-4 rounded-t-[2.5rem] shadow-xl
                ${isPremium ? 'bg-zinc-900 text-white' : 'bg-indigo-950 text-white'}
            `}>
                <div className="col-span-1 flex flex-col justify-center">
                    <span className="text-[11px] font-black uppercase tracking-tight text-white">STRATEJİK <br />PLANLAMA ANALİTİĞİ</span>
                </div>
                {[
                    { label: 'BİLİŞSEL YÜK', val: '0.85', unit: 'idx' },
                    { label: 'SÜRE', val: '--:--', unit: 'dk' },
                    { label: 'HATA P.', val: '0', unit: 'pts' }
                ].map(metric => (
                    <div key={metric.label} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col justify-between">
                        <span className="text-[8px] font-black text-zinc-500 uppercase">{metric.label}</span>
                        <div className="flex items-end gap-1">
                            <span className="text-lg font-black text-white">{metric.val}</span>
                            <span className="text-[7px] font-bold text-zinc-500 mb-1">{metric.unit}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};




