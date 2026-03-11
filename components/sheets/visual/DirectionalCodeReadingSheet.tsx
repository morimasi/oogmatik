import React from 'react';
import { DirectionalCodeReadingData } from '../../../types/visual';

interface Props {
    data: DirectionalCodeReadingData;
}

export const DirectionalCodeReadingSheet: React.FC<Props> = ({ data }) => {
    const cipherType = data.settings?.cipherType || 'arrows';
    const gridSize = data.settings?.gridSize || 6;
    const gridRows = data.content?.grid || [];
    const instructions = data.content?.instructions || [];

    const getInstructionString = (count: number, dir: string) => {
        if (cipherType === 'arrows') {
            const arrMap: Record<string, string> = { up: '↑', down: '↓', right: '→', left: '←' };
            return `${count}${arrMap[dir] || ''}`;
        }
        if (cipherType === 'letters') {
            const letterMap: Record<string, string> = { up: 'Y', down: 'A', right: 'S', left: 'L' };
            return `${count}${letterMap[dir] || ''}`;
        }
        if (cipherType === 'colors') {
            const colorMap: Record<string, string> = { up: 'Mavi', down: 'Sarı', right: 'Kırmızı', left: 'Yeşil' };
            return `${colorMap[dir]} ${count}`;
        }
        return `${count} ${dir}`;
    };

    return (
        <div className="w-full h-full print:h-0 p-8 print:p-2 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
            {/* ETKİNLİK BAŞLIĞI */}
            <div className="flex justify-between items-center border-b-4 border-indigo-500 pb-4 print:pb-1 mb-6 print:mb-2">
                <div>
                    <h1 className="text-4xl font-black text-indigo-900 tracking-tighter uppercase">{data.content?.title || "Gizli Rota"}</h1>
                    <p className="text-sm font-bold text-indigo-600 mt-1 uppercase tracking-widest">{data.content?.storyIntro || "Kodları takip et, hedefe ulaş."}</p>
                </div>
                <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-indigo-100">
                    <i className="fa-solid fa-map-location-dot"></i>
                </div>
            </div>

            <div className="flex-1 flex gap-8 print:gap-2 print:gap-3 print:p-3 items-start page-break-inside-avoid">

                {/* YÖN GÖSTERGESİ PUSULASI */}
                <div className="absolute top-8 print:p-3 left-1/2 -translate-x-1/2 rotate-0 opacity-10 pointer-events-none z-0">
                    <i className="fa-regular fa-compass text-[20rem]"></i>
                </div>

                {/* GRID (LABİRENT) 2D MATRİS */}
                <div className="relative w-[60%] aspect-square bg-slate-50 border-4 border-indigo-900 rounded-3xl p-4 print:p-1 shadow-sm page-break-inside-avoid flex items-center justify-center z-10">

                    <div
                        className="grid gap-[2px] w-full h-full print:h-0"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                            gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`
                        }}
                    >
                        {gridRows.map((row, y) => (
                            row.map((cell, x) => {
                                let cellStyle = "bg-white border-2 border-slate-200 rounded text-xl flex items-center justify-center";
                                let content = null;

                                if (cell.type === 'start') {
                                    cellStyle = "bg-indigo-100 border-2 border-indigo-500 rounded text-indigo-600 text-3xl flex items-center justify-center relative";
                                    content = <i className={cell.icon || "fa-solid fa-rocket"}></i>;
                                } else if (cell.type === 'target') {
                                    cellStyle = "bg-emerald-100 border-2 border-emerald-500 rounded text-emerald-600 text-3xl flex items-center justify-center relative";
                                    content = <i className={cell.icon || "fa-solid fa-flag-checkered"}></i>;
                                } else if (cell.type === 'obstacle') {
                                    cellStyle = "bg-slate-800 border-2 border-slate-900 rounded flex items-center justify-center bg-[linear-gradient(45deg,_#1e293b_25%,_#334155_25%,_#334155_50%,_#1e293b_50%,_#1e293b_75%,_#334155_75%,_#334155_100%)] bg-[length:10px_10px]";
                                } else if (cell.type === 'path') {
                                    // Yalnızca eğitmen kopyası için path renklendirme (opsiyonel gösterim, çocuk için genelde kapalı)
                                    cellStyle = "bg-white border-2 border-slate-200 rounded";
                                }

                                return (
                                    <div key={`${y}-${x}`} className={cellStyle + " shadow-sm transition-transform hover:scale-105"}>
                                        {content}
                                    </div>
                                );
                            })
                        ))}
                    </div>

                    {/* X/Y Koordinat Yardımcıları (Opsiyonel) */}
                    <div className="absolute top-1 left-4 right-4 flex justify-between px-[3%] text-[9px] font-black text-indigo-300 opacity-50 uppercase pointer-events-none">
                        <span>X: 0</span>
                        <span>X: {gridSize - 1}</span>
                    </div>
                </div>

                {/* KOD (INSTRUCTION) BLOGU */}
                <div className="w-[40%] bg-white border-[3px] border-zinc-900 rounded-[2rem] p-6 print:p-2 shadow-[8px_8px_0px_#1e1b4b] overflow-hidden relative page-break-inside-avoid h-full print:h-0 z-10 flex flex-col">
                    <div className="flex justify-between items-center mb-6 print:mb-2 border-b-2 border-zinc-200 pb-3">
                        <span className="text-sm font-black text-zinc-800 uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded">Rotalama Kodları</span>
                        <i className="fa-solid fa-terminal text-zinc-400"></i>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                        {instructions.map((inst, idx) => (
                            <div key={idx} className="flex border-2 border-indigo-100 rounded-xl overflow-hidden shadow-sm group">
                                <div className="w-10 bg-indigo-50 text-indigo-400 font-black flex items-center justify-center text-xs border-r-2 border-indigo-100">
                                    {inst.step}.
                                </div>
                                <div className="flex-1 bg-white p-3 flex items-center text-indigo-900 font-black text-lg font-mono tracking-widest pl-4 relative">
                                    {getInstructionString(inst.count, inst.direction)}
                                    {/* Çocukların adım attıkça işaretleyebileceği küçük check box alanı */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded border-2 border-indigo-200 opacity-30 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* LEHÇE/ANAHTAR */}
                    {cipherType === 'letters' && (
                        <div className="mt-4 print:mt-1 pt-4 print:pt-1 border-t-2 border-dashed border-zinc-200 translate-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-500 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                                <span><strong className="text-zinc-800">Y:</strong> Yukarı</span>
                                <span><strong className="text-zinc-800">A:</strong> Aşağı</span>
                                <span><strong className="text-zinc-800">S:</strong> Sağ</span>
                                <span><strong className="text-zinc-800">L:</strong> Sol</span>
                            </div>
                        </div>
                    )}
                    {cipherType === 'colors' && (
                        <div className="mt-4 print:mt-1 pt-4 print:pt-1 border-t-2 border-dashed border-zinc-200 translate-y-2">
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-zinc-500 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                                <span className="text-blue-600 font-black">MAVİ: Yukarı</span>
                                <span className="text-yellow-600 font-black">SARI: Aşağı</span>
                                <span className="text-red-600 font-black">KIRMIZI: Sağ</span>
                                <span className="text-emerald-600 font-black">YEŞİL: Sol</span>
                            </div>
                        </div>
                    )}

                </div>
            </div >

            {/* FOOTER */}
            < div className="pt-4 print:pt-1 mt-auto border-t-2 border-zinc-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest" >
                <span>Neuro-Oogmatik Özel Eğitim Teknolojileri</span>
                <span>Modül: Şifreli Algoritma • Izgara: {gridSize}x{gridSize} • Adım: {instructions.length}</span>
            </div >
        </div >
    );
};



