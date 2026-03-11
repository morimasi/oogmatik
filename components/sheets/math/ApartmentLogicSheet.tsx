import React from 'react';
import { ApartmentLogicData } from '../../../types';

interface Props {
    data: ApartmentLogicData;
}

export const ApartmentLogicSheet: React.FC<Props> = ({ data }) => {
    const floors = data.settings?.apartmentFloors || 2;
    const roomsPerFloor = data.settings?.apartmentRoomsPerFloor || 3;
    const clues = data.content?.clues || [];
    const varTypes = data.content?.variableTypes || ['İsim', 'Özellik'];
    const totalRooms = floors * roomsPerFloor;

    // Dinamik grid ve kat dizilimi SVG/CSS mimarisi
    const floorHeights = Array.from({ length: floors }).map((_, i) => floors - i); // Yukarıdan aşağı (3, 2, 1. kat vb)
    const roomIndices = Array.from({ length: roomsPerFloor }).map((_, i) => i + 1); // 1, 2, 3.. daire

    return (
        <div className="w-full h-full p-8 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
            {/* ETKİNLİK BAŞLIĞI */}
            <div className="flex justify-between items-center border-b-4 border-orange-400 pb-4 mb-6">
                <div>
                    <h1 className="text-4xl font-black text-orange-900 tracking-tighter uppercase">{data.content?.title || "Zebra Apartmanı"}</h1>
                    <p className="text-sm font-bold text-orange-600 mt-1 uppercase tracking-widest">Uzamsal Mantık • Zorluk: {data.settings?.difficulty.toUpperCase()}</p>
                </div>
                <div className="w-16 h-16 bg-orange-50 text-orange-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-orange-100">
                    <i className="fa-solid fa-building"></i>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6">

                {/* SVG APARTMAN GÖRSELLEŞTİRMESİ */}
                <div className="w-full bg-orange-50/50 rounded-t-[3rem] rounded-b-xl border-4 border-orange-100 p-8 print:p-3 flex flex-col items-center relative print:bg-white min-h-[300px]">
                    {/* Çatı Çizimi */}
                    <div className="w-[80%] h-12 flex justify-center items-end opacity-20 relative top-2">
                        <div className="w-0 h-0 border-l-[150px] border-l-transparent border-r-[150px] border-r-transparent border-b-[50px] border-b-orange-900"></div>
                    </div>

                    <div className="bg-orange-900/5 border-2 border-orange-900/20 p-4 rounded-xl shadow-inner">
                        <div className="flex flex-col gap-3">
                            {floorHeights.map((floorNum) => (
                                <div key={`floor-${floorNum}`} className="flex items-center gap-4">
                                    {/* Kat Göstergesi */}
                                    <div className="w-12 h-24 bg-orange-100 border border-orange-200 rounded-l-xl flex items-center justify-center -ml-8">
                                        <span className="font-black text-orange-800 -rotate-90 text-xs tracking-widest block w-max">{floorNum}. KAT</span>
                                    </div>

                                    {/* Daireler Grid'i */}
                                    <div className="flex gap-2">
                                        {roomIndices.map(roomNum => (
                                            <div key={`room-${floorNum}-${roomNum}`} className="w-32 h-28 bg-white border-2 border-orange-200 rounded-lg flex flex-col items-center p-2 shadow-sm relative">
                                                <div className="text-[10px] font-black tracking-widest text-orange-300 w-full text-center border-b border-orange-50 pb-1 mb-2">DAİRE {roomNum}</div>

                                                {/* Pencere / Balkon İllüstrasyonu */}
                                                <div className="w-16 h-8 border-b-[4px] border-b-orange-300 border-x-2 border-x-orange-200 grid grid-cols-2 mt-auto mb-1">
                                                    <div className="border-r-2 border-orange-200 bg-sky-50"></div>
                                                    <div className="bg-sky-50"></div>
                                                </div>

                                                {/* Çözüm Boşlukları (Sadece Variable sayısı kadar çizgi) */}
                                                <div className="w-full h-8 mt-2 flex flex-col gap-1 px-1">
                                                    {varTypes.map((_, vIdx) => (
                                                        <div key={vIdx} className="w-full h-4 border-b border-zinc-300/50"></div>
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

                {/* CEVAP TABLOSU / LEJANT */}
                <div className="w-full flex gap-4">
                    <div className="flex-1 bg-white border-2 border-zinc-200 rounded-2xl p-4 shadow-sm page-break-inside-avoid">
                        <h3 className="text-sm font-black text-zinc-800 uppercase tracking-widest mb-3 border-b border-zinc-100 pb-2 flex justify-between">
                            <span>Araştırma Tablosu</span>
                            <span className="text-[10px] text-zinc-400">Not Almak İçin Kullanabilirsin</span>
                        </h3>
                        {/* Çetere Tablosu */}
                        <table className="w-full text-left text-xs text-zinc-600">
                            <thead>
                                <tr className="border-b-2 border-zinc-200 capitalize text-zinc-400">
                                    <th className="py-2 w-14 border-r border-zinc-200">Daire</th>
                                    {varTypes.map(vt => <th key={vt} className="py-2 px-2 border-r border-zinc-200 font-bold">{vt}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: totalRooms }).map((_, i) => (
                                    <tr key={i} className="border-b border-zinc-100">
                                        <td className="py-3 border-r border-zinc-100 text-center font-bold">{i + 1}</td>
                                        {varTypes.map((__, vIdx) => <td key={vIdx} className="py-3 px-2 border-r border-zinc-100"></td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* İPUÇLARI */}
                    <div className="w-[60%] bg-zinc-50 border-2 border-orange-100 rounded-2xl p-6 shadow-sm page-break-inside-avoid">
                        <h3 className="text-sm font-black text-orange-800 uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-orange-50 pb-2">
                            <i className="fa-solid fa-list-check"></i> Komşu İpuçları
                        </h3>
                        <ul className="space-y-3">
                            {clues.map((clue, idx) => (
                                <li key={idx} className="flex gap-3 items-start text-xs font-bold text-zinc-700">
                                    <span className="w-5 h-5 shrink-0 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-[10px] mt-0.5">{idx + 1}</span>
                                    <span className="pt-0.5 leading-relaxed">{clue}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div className="pt-4 mt-auto border-t-2 border-zinc-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <span>Neuro-Oogmatik Özel Eğitim Teknolojileri</span>
                <span>Modül: Apartman Mantığı • Kat: {floors} • Daire: {totalRooms}</span>
            </div>
        </div>
    );
};

