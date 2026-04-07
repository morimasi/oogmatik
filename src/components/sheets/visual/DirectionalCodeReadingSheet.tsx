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
    const legend = CIPHER_LEGEND[cipherType] || CIPHER_LEGEND.arrows;
    const cols = puzzles.length > 1 ? 'grid-cols-2' : 'grid-cols-1';

    return (
        <div className="w-full h-full p-4 print:p-2 flex flex-col bg-white overflow-hidden text-zinc-900 font-['Lexend'] gap-3 print:gap-2">
            {/* HEADER */}
            <PedagogicalHeader
                title={data.content?.title || 'ALGORİTMİK ROTA ANALİZİ'}
                instruction={data.content?.storyIntro || 'Kodları takip et, engellere takılmadan hedefe ulaş.'}
            />

            {/* LEGEND BAR */}
            <div className="flex items-center gap-2 flex-wrap bg-zinc-900 rounded-xl px-4 py-2 print:py-1">
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider mr-2">{legend.label}:</span>
                {legend.symbols.map((s) => (
                    <div key={s.dir} className="flex items-center gap-1 bg-zinc-800 rounded-lg px-2 py-0.5">
                        <span className="text-white font-black text-sm">{s.sym}</span>
                        <span className="text-zinc-400 text-[9px]">= {s.dir}</span>
                    </div>
                ))}
                <div className="ml-auto flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-sm"></div><span className="text-[9px] text-zinc-400">Başlangıç</span>
                    <div className="w-3 h-3 bg-emerald-500 rounded-sm ml-2"></div><span className="text-[9px] text-zinc-400">Hedef</span>
                    <div className="w-3 h-3 bg-zinc-700 rounded-sm ml-2"></div><span className="text-[9px] text-zinc-400">Engel</span>
                </div>
            </div>

            {/* PUZZLE CARDS */}
            <div className={`grid ${cols} gap-3 print:gap-2 flex-1 overflow-hidden`}>
                {puzzles.map((puzzle: Record<string, unknown>, pIdx: number) => {
                    const grid = (puzzle.grid as unknown[][]) || [];
                    const instructions = (puzzle.instructions as Record<string, unknown>[]) || [];
                    const displayInstructions = instructions.slice(0, 8);
                    const extra = instructions.length - 8;

                    return (
                        <EditableElement key={pIdx} className="relative flex gap-3 print:gap-2 bg-zinc-50 rounded-2xl p-3 print:p-2 border border-zinc-200 break-inside-avoid">
                            {/* Badge */}
                            <div className="absolute -top-2 -left-2 w-7 h-7 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xs shadow z-10">
                                {pIdx + 1}
                            </div>

                            {/* GRID */}
                            <div className="flex items-start justify-center shrink-0">
                                <div
                                    className="grid gap-px bg-zinc-300 border-2 border-zinc-800 rounded-xl overflow-hidden shadow"
                                    style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
                                >
                                    {grid.map((row: unknown, y: number) =>
                                        (Array.isArray(row) ? row : []).map((cell: unknown, x: number) => {
                                            const c = cell as Record<string, unknown>;
                                            const isStart = c.type === 'start';
                                            const isTarget = c.type === 'target';
                                            const isObstacle = c.type === 'obstacle';
                                            let bg = 'bg-white';
                                            if (isStart) bg = 'bg-indigo-100 border border-indigo-400';
                                            if (isTarget) bg = 'bg-emerald-100 border border-emerald-400';
                                            if (isObstacle) bg = 'bg-zinc-800';
                                            return (
                                                <div
                                                    key={`${y}-${x}`}
                                                    className={`w-8 h-8 print:w-6 print:h-6 ${bg} flex items-center justify-center text-sm print:text-xs font-black`}
                                                >
                                                    {isStart && <span className="text-indigo-600">▲</span>}
                                                    {isTarget && <span className="text-emerald-600">★</span>}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* INSTRUCTIONS */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-wider mb-2 print:mb-1">{String(puzzle.title || `Görev ${pIdx + 1}`)}</h3>
                                    <div className="flex flex-col gap-1 print:gap-0.5">
                                        {displayInstructions.map((inst, iIdx) => (
                                            <div key={iIdx} className="flex items-center gap-2 text-xs font-bold">
                                                <span className="w-4 h-4 bg-zinc-200 rounded text-[9px] flex items-center justify-center font-black shrink-0">{iIdx + 1}</span>
                                                <span className="font-mono text-indigo-700 font-black">{getInstructionLabel(inst as { count: number; direction: string; label?: string }, cipherType)}</span>
                                                {(inst as Record<string, unknown>).label && (
                                                    <span className="text-zinc-400 text-[9px]">{String((inst as Record<string, unknown>).label)}</span>
                                                )}
                                            </div>
                                        ))}
                                        {extra > 0 && (
                                            <div className="text-[9px] text-zinc-400 font-bold">... +{extra} adım daha</div>
                                        )}
                                    </div>
                                </div>

                                {/* Answer box */}
                                <div className="mt-2 print:mt-1">
                                    <div className="text-[8px] font-black text-zinc-400 uppercase tracking-wider mb-1">HEDEFE ULAŞILDI MI?</div>
                                    <div className="flex gap-2">
                                        <div className="h-6 w-12 border-b-2 border-zinc-400 flex items-center justify-center text-[8px] text-zinc-300">Evet</div>
                                        <div className="h-6 w-12 border-b-2 border-zinc-400 flex items-center justify-center text-[8px] text-zinc-300">Hayır</div>
                                    </div>
                                </div>
                            </div>
                        </EditableElement>
                    );
                })}
            </div>
        </div>
    );
};




