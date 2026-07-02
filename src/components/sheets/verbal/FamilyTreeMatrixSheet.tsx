import React from 'react';
import { FamilyTreeMatrixData, FamilyTreeNode } from '../../../types';

interface Props {
    data: FamilyTreeMatrixData;
}

export const FamilyTreeMatrixSheet: React.FC<Props> = ({ data }) => {
    const nodes = data.content?.nodes || [];
    const clues = data.content?.clues || [];

    // Basit bir Ağaç Render Layout'u (Generation bazlı gruplama)
    // 0: Dedeler/Nineler, 1: Anne/Baba, 2: Çocuklar
    const gen0 = nodes.filter(n => n.generation === 0);
    const gen1 = nodes.filter(n => n.generation === 1);
    const gen2 = nodes.filter(n => n.generation === 2);

    // Düğüm Render Fonksiyonu
    const renderNodeBox = (node: FamilyTreeNode) => {
        const isTarget = node.isHidden;
        const Icon = node.gender === 'M' ? 'fa-user-tie' : 'fa-user-nurse';
        const bgColor = node.gender === 'M' ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-pink-50 border-pink-200 text-pink-700';

        return (
            <div key={node.id} className={`w-28 h-18 border rounded-xl flex flex-col items-center justify-center p-1.5 relative shadow-sm ${bgColor} ${isTarget ? 'border-dashed border-2 border-emerald-400 bg-white' : ''}`}>
                <div className="text-lg mb-0.5 opacity-50"><i className={`fa-solid ${Icon}`}></i></div>
                <div className="text-[8px] font-black uppercase opacity-70 mb-0.5">{node.role}</div>
                {isTarget ? (
                    <div className="w-[75%] border-b border-emerald-400 border-dashed mt-1"></div>
                ) : (
                    <div className="text-xs font-black">{node.name || '???'}</div>
                )}
                {isTarget && <div className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-emerald-400 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-sm"><i className="fa-solid fa-question"></i></div>}
            </div>
        );
    };

    return (
        <div className="w-full h-full p-3 print:p-2 flex flex-col bg-white overflow-hidden text-zinc-900 min-h-[297mm]">
            {/* ETKİNLİK BAŞLIĞI */}
            <div className="flex justify-between items-center border-b border-emerald-400 pb-2 print:pb-0.5 mb-4 print:mb-1.5">
                <div>
                    <h1 className="text-2xl print:text-lg font-black text-emerald-900 tracking-tighter uppercase">{data.content?.title || "Soy Ağacı Bulmacası"}</h1>
                    <p className="text-xs print:text-[10px] font-bold text-emerald-600 mt-0.5 uppercase tracking-widest">Mantıksal Çıkarım • Zorluk: {data.settings?.difficulty?.toUpperCase() || 'ORTA'}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-400 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-emerald-100">
                    <i className="fa-solid fa-network-wired"></i>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 print:gap-1.5">

                {data.content?.storyIntro && Object.keys(data.content.storyIntro).length > 0 && typeof data.content.storyIntro === 'string' && (
                    <div className="text-xs print:text-[10px] font-medium text-zinc-600 bg-zinc-50 p-3 print:p-1.5 rounded-lg border border-zinc-200 italic">
                        "{data.content.storyIntro}"
                    </div>
                )}

                {/* SVG AĞAÇ ALANI (Çok basite indirgenmiş flex-based ağaç, A4 için güvenli) */}
                <div className="w-full bg-zinc-50 rounded-xl border border-dashed border-zinc-300 p-4 print:p-2 flex flex-col items-center gap-6 print:gap-2 relative print:bg-white min-h-[250px] justify-center">

                    {gen0.length > 0 && (
                        <div className="flex gap-8 print:gap-3 relative">
                            {gen0.map(renderNodeBox)}
                            {gen0.length > 1 && <div className="absolute top-1/2 left-16 right-16 border-b border-zinc-300 -z-10"></div>}
                        </div>
                    )}

                    {gen0.length > 0 && gen1.length > 0 && (
                        <div className="w-0.5 h-8 bg-zinc-300 absolute" style={{ top: gen0.length > 0 ? '100px' : '0' }}></div>
                    )}

                    {gen1.length > 0 && (
                        <div className="flex gap-8 print:gap-3 relative">
                            {gen1.map(renderNodeBox)}
                            {gen1.length > 1 && <div className="absolute top-1/2 left-16 right-16 border-b border-zinc-300 -z-10"></div>}
                        </div>
                    )}

                    {gen1.length > 0 && gen2.length > 0 && (
                        <div className="w-0.5 h-8 bg-zinc-300 absolute" style={{ top: (gen0.length > 0 ? 100 : 0) + 100 + 'px' }}></div>
                    )}

                    {gen2.length > 0 && (
                        <div className="flex gap-6 print:gap-2 relative">
                            {gen2.map(renderNodeBox)}
                        </div>
                    )}

                </div>

                {/* İPUÇLARI ALANI */}
                <div className="w-full mt-3 print:mt-0.5 bg-white border border-emerald-100 rounded-xl p-4 print:p-1.5 shadow-sm mb-3 print:mb-1 page-break-inside-avoid">
                    <h3 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5 mb-2 print:mb-0.5 border-b border-emerald-50 pb-1">
                        <i className="fa-solid fa-magnifying-glass text-xs"></i> Araştırmacı İpuçları
                    </h3>
                    <ul className="space-y-2">
                        {clues.map((clue, idx) => (
                            <li key={idx} className="flex gap-2 items-start text-xs print:text-[10px] font-bold text-zinc-700">
                                <span className="w-5 h-5 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-[10px] mt-0.5">{idx + 1}</span>
                                <span className="pt-0.5 leading-relaxed">{clue}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>

            {/* FOOTER */}
            <div className="pt-2 print:pt-0.5 mt-auto border-t border-zinc-200 flex justify-between items-center text-[7px] font-black text-slate-400 uppercase tracking-widest">
                <span>Neuro-bdmind Özel Eğitim Teknolojileri</span>
                <span>Modül: Soy Ağacı ({data.settings?.familySize === 'extended' ? 'Geniş' : 'Çekirdek'})</span>
            </div>
        </div>
    );
};




