import React from 'react';
import { ApartmentLogicData } from '../../../types';
import { PedagogicalHeader } from '../common';

interface Props {
    data: ApartmentLogicData;
}

export const ApartmentLogicSheet: React.FC<Props> = ({ data }) => {
    const puzzles = data.puzzles && data.puzzles.length > 0
        ? data.puzzles
        : [{
            id: 'puzzle_main',
            buildingName: data.content?.title || "Zebra Apartmanı",
            buildingTheme: data.settings?.buildingTheme || 'modern',
            floorsCount: data.settings?.apartmentFloors || 3,
            roomsPerFloor: data.settings?.apartmentRoomsPerFloor || 3,
            variableTypes: data.content?.variableTypes || ['İsim', 'Özellik'],
            residents: data.content?.residents || [],
            clues: data.content?.clues || []
        }];

    const themeStyles: Record<string, { bg: string; roofColor: string; wallBg: string; border: string; accentBadge: string; text: string }> = {
        modern: {
            bg: 'bg-sky-50/40',
            roofColor: 'border-b-sky-800',
            wallBg: 'bg-sky-900/5 border-sky-300',
            border: 'border-sky-200',
            accentBadge: 'bg-sky-600 text-white',
            text: 'text-sky-950'
        },
        classic: {
            bg: 'bg-orange-50/40',
            roofColor: 'border-b-orange-900',
            wallBg: 'bg-orange-900/5 border-orange-300',
            border: 'border-orange-200',
            accentBadge: 'bg-orange-700 text-white',
            text: 'text-orange-950'
        },
        colorful: {
            bg: 'bg-emerald-50/40',
            roofColor: 'border-b-emerald-800',
            wallBg: 'bg-emerald-900/5 border-emerald-300',
            border: 'border-emerald-200',
            accentBadge: 'bg-emerald-600 text-white',
            text: 'text-emerald-950'
        },
        vintage: {
            bg: 'bg-amber-50/30',
            roofColor: 'border-b-stone-800',
            wallBg: 'bg-stone-900/5 border-stone-300',
            border: 'border-stone-200',
            accentBadge: 'bg-stone-700 text-white',
            text: 'text-stone-950'
        }
    };

    const isMultiPuzzle = puzzles.length > 1;

    return (
        <div className="w-full flex flex-col bg-white font-['Lexend'] min-h-[297mm] p-4 print:p-2 transition-all duration-300">
            <PedagogicalHeader title={data.title} instruction={data.instruction} data={data} />

            {/* Puzzles Grid (A4 Full Coverage) */}
            <div className={`flex-1 grid ${isMultiPuzzle ? 'grid-cols-1 md:grid-cols-2 print:grid-cols-2' : 'grid-cols-1'} gap-6 print:gap-3 my-2 items-stretch`}>
                {puzzles.map((puzzle, pIdx) => {
                    const floors = puzzle.floorsCount;
                    const roomsPerFloor = puzzle.roomsPerFloor;
                    const varTypes = puzzle.variableTypes;
                    const totalRooms = floors * roomsPerFloor;
                    const theme = themeStyles[puzzle.buildingTheme || 'modern'] || themeStyles.modern;

                    const floorHeights = Array.from({ length: floors }).map((_, i) => floors - i);
                    const roomIndices = Array.from({ length: roomsPerFloor }).map((_, i) => i + 1);

                    return (
                        <div key={puzzle.id || pIdx} className={`flex flex-col rounded-3xl p-4 print:p-2 border-2 ${theme.border} ${theme.bg} shadow-sm justify-between relative`}>

                            {/* Building Title & Header */}
                            <div className="flex items-center justify-between border-b pb-2 mb-3 border-zinc-200/40">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${theme.accentBadge}`}>
                                        Bina #{pIdx + 1}
                                    </span>
                                    <h2 className={`text-base font-black ${theme.text} uppercase tracking-tight`}>{puzzle.buildingName}</h2>
                                </div>
                                <span className="text-[9px] font-bold opacity-60">{floors} Kat • {totalRooms} Daire</span>
                            </div>

                            {/* SVG APARTMAN GÖRSELLEŞTİRMESİ */}
                            <div className="w-full flex flex-col items-center relative my-auto">
                                {/* Çatı Çizimi */}
                                <div className="w-[70%] h-8 flex justify-center items-end opacity-80 relative top-1">
                                    <div className={`w-0 h-0 border-l-[100px] border-l-transparent border-r-[100px] border-r-transparent border-b-[30px] ${theme.roofColor}`}></div>
                                </div>

                                <div className={`${theme.wallBg} border-2 p-3 print:p-1 rounded-2xl shadow-inner w-full flex justify-center`}>
                                    <div className="flex flex-col gap-2">
                                        {floorHeights.map((floorNum) => (
                                            <div key={`floor-${floorNum}`} className="flex items-center gap-2">
                                                {/* Kat Göstergesi */}
                                                <div className="w-8 h-16 bg-white/80 border border-zinc-200 rounded-lg flex items-center justify-center shrink-0">
                                                    <span className="font-black text-zinc-700 -rotate-90 text-[9px] tracking-wider block w-max">{floorNum}. KAT</span>
                                                </div>

                                                {/* Daireler Grid'i */}
                                                <div className="flex gap-2">
                                                    {roomIndices.map(roomNum => (
                                                        <div key={`room-${floorNum}-${roomNum}`} className="w-24 h-20 bg-white border border-zinc-300 rounded-xl flex flex-col items-center p-1.5 shadow-xs relative justify-between">
                                                            <div className="text-[8px] font-black tracking-wider text-zinc-400 w-full text-center border-b border-zinc-100 pb-0.5">
                                                                D{roomNum}
                                                            </div>

                                                            {/* Pencere / Balkon İllüstrasyonu */}
                                                            <div className="w-10 h-5 border-b-[3px] border-b-amber-400 border-x border-x-amber-200 grid grid-cols-2 my-auto">
                                                                <div className="border-r border-amber-200 bg-sky-100/60"></div>
                                                                <div className="bg-sky-100/60"></div>
                                                            </div>

                                                            {/* Çözüm Çizgileri */}
                                                            <div className="w-full flex flex-col gap-0.5">
                                                                {varTypes.map((vt, vIdx) => (
                                                                    <div key={vIdx} className="w-full h-3 border-b border-zinc-200 flex items-center text-[7px] text-zinc-400 px-0.5">
                                                                        <span className="opacity-40">{vt[0]}:</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* TABLO VE İPUÇLARI YANA YANA VEYA ALT ALTA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 pt-2 border-t border-zinc-200/40">
                                {/* Çetere Tablosu */}
                                <div className="bg-white border border-zinc-200 rounded-xl p-2 shadow-2xs">
                                    <div className="text-[9px] font-black text-zinc-700 uppercase mb-1 border-b pb-1 flex justify-between">
                                        <span>Not Tablosu</span>
                                        <span className="text-[7px] text-zinc-400">Not Alın</span>
                                    </div>
                                    <table className="w-full text-left text-[8px] text-zinc-600">
                                        <thead>
                                            <tr className="border-b border-zinc-200 text-zinc-400">
                                                <th className="py-0.5 w-6 border-r border-zinc-100">D#</th>
                                                {varTypes.map(vt => <th key={vt} className="py-0.5 px-1 border-r border-zinc-100 font-bold">{vt}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Array.from({ length: totalRooms }).map((_, i) => (
                                                <tr key={i} className="border-b border-zinc-100">
                                                    <td className="py-1 border-r border-zinc-100 text-center font-bold">{i + 1}</td>
                                                    {varTypes.map((__, vIdx) => <td key={vIdx} className="py-1 px-1 border-r border-zinc-100"></td>)}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* İpuçları Kartı */}
                                <div className="bg-white/80 border border-zinc-200 rounded-xl p-2.5 shadow-2xs">
                                    <div className="text-[9px] font-black text-zinc-800 uppercase tracking-wider mb-1.5 flex items-center gap-1 border-b pb-1">
                                        <i className="fa-solid fa-list-check text-amber-500"></i> Komşu İpuçları
                                    </div>
                                    <ul className="space-y-1">
                                        {puzzle.clues.map((clue, cIdx) => (
                                            <li key={cIdx} className="flex gap-1.5 items-start text-[8px] font-bold text-zinc-700 leading-tight">
                                                <span className="w-3.5 h-3.5 shrink-0 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-[7px] font-black">{cIdx + 1}</span>
                                                <span className="pt-0.5">{clue}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* CLINICAL FOOTER */}
            <div className="mt-auto pt-2 grid grid-cols-4 gap-2 px-3 pb-3 rounded-2xl bg-zinc-900 text-white">
                <div className="col-span-1 flex flex-col justify-center">
                    <span className="text-[8px] font-black uppercase leading-tight text-zinc-400">
                        UZAMSAL MANTIK &<br />ANALİTİK ÇIKARIM
                    </span>
                </div>
                {[
                    { label: 'HEDEF SÜRE', val: '12:00', unit: 'dk' },
                    { label: 'ÇÖZÜLENDİ', val: '___', unit: 'Daire' },
                    { label: 'BAŞARI PUANI', val: '___', unit: 'p' },
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



