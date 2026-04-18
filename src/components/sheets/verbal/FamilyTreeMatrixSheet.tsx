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
            <div key={node.id} className={`w-36 h-24 border-2 rounded-2xl flex flex-col items-center justify-center p-2 relative shadow-sm ${bgColor} ${isTarget ? 'border-dashed border-4 border-emerald-400 bg-white' : ''}`}>
                <div className="text-2xl mb-1 opacity-50"><i className={`fa-solid ${Icon}`}></i></div>
                <div className="text-[10px] font-black uppercase opacity-70 mb-1">{node.role}</div>
                {isTarget ? (
                    <div className="w-[80%] border-b-2 border-emerald-400 border-dashed mt-2"></div>
                ) : (
                    <div className="text-sm font-black">{node.name || '???'}</div>
                )}
                {isTarget && <div className="absolute -top-3 -right-3 w-6 h-6 bg-emerald-400 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md"><i className="fa-solid fa-question"></i></div>}
            </div>
        );
    };

    return (
        <div className="w-full h-full  p-8 print:p-2 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
            {/* ETKİNLİK BAŞLIĞI */}
            <div className="flex justify-between items-center border-b-4 border-emerald-400 pb-4 print:pb-1 mb-6 print:mb-2">
                <div>
                    <h1 className="text-4xl font-black text-emerald-900 tracking-tighter uppercase">{data.content?.title || "Soy Ağacı Bulmacası"}</h1>
                    <p className="text-sm font-bold text-emerald-600 mt-1 uppercase tracking-widest">Mantıksal Çıkarım • Zorluk: {data.settings?.difficulty?.toUpperCase() || 'ORTA'}</p>
                </div>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-emerald-100">
                    <i className="fa-solid fa-network-wired"></i>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-6 print:gap-2">

                {data.content?.storyIntro && Object.keys(data.content.storyIntro).length > 0 && typeof data.content.storyIntro === 'string' && (
                    <div className="text-sm font-medium text-zinc-600 bg-zinc-50 p-4 print:p-1 rounded-xl border border-zinc-200 italic">
                        "{data.content.storyIntro}"
                    </div>
                )}

                {/* SVG AĞAÇ ALANI (Çok basite indirgenmiş flex-based ağaç, A4 için güvenli) */}
                <div className="w-full bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-300 p-8 print:p-2 print:p-3 flex flex-col items-center gap-12 print:gap-3 print:gap-4 print:gap-1 relative print:bg-white min-h-[300px] justify-center">

                    {gen0.length > 0 && (
                        <div className="flex gap-16 print:gap-4 relative">
                            {gen0.map(renderNodeBox)}
                            {gen0.length > 1 && <div className="absolute top-1/2 left-32 right-32 border-b-2 border-zinc-300 -z-10"></div>}
                        </div>
                    )}

                    {gen0.length > 0 && gen1.length > 0 && (
                        <div className="w-1 h-12 bg-zinc-300 absolute" style={{ top: gen0.length > 0 ? '135px' : '0' }}></div>
                    )}

                    {gen1.length > 0 && (
                        <div className="flex gap-16 print:gap-4 relative">
                            {gen1.map(renderNodeBox)}
                            {gen1.length > 1 && <div className="absolute top-1/2 left-32 right-32 border-b-2 border-zinc-300 -z-10"></div>}
                        </div>
                    )}

                    {gen1.length > 0 && gen2.length > 0 && (
                        <div className="w-1 h-12 bg-zinc-300 absolute" style={{ top: (gen0.length > 0 ? 135 : 0) + 144 + 'px' }}></div>
                    )}

                    {gen2.length > 0 && (
                        <div className="flex gap-12 print:gap-3 print:gap-4 print:gap-1 relative">
                            {gen2.map(renderNodeBox)}
                        </div>
                    )}

                </div>

                {/* İPUÇLARI ALANI */}
                <div className="w-full mt-4 print:mt-1 bg-white border-2 border-emerald-100 rounded-2xl p-6 print:p-2 shadow-sm mb-4 print:mb-1 page-break-inside-avoid">
                    <h3 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2 mb-4 print:mb-1 border-b border-emerald-50 pb-2">
                        <i className="fa-solid fa-magnifying-glass"></i> Araştırmacı İpuçları
                    </h3>
                    <ul className="space-y-3">
                        {clues.map((clue, idx) => (
                            <li key={idx} className="flex gap-3 items-start text-sm font-bold text-zinc-700">
                                <span className="w-6 h-6 shrink-0 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs mt-0.5">{idx + 1}</span>
                                <span className="pt-0.5 leading-relaxed">{clue}</span>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>

            {/* FOOTER */}
            <div className="pt-4 print:pt-1 mt-auto border-t-2 border-zinc-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <span>Neuro-Oogmatik Özel Eğitim Teknolojileri</span>
                <span>Modül: Soy Ağacı ({data.settings?.familySize === 'extended' ? 'Geniş' : 'Çekirdek'})</span>
            </div>
        </div>
    );
};




