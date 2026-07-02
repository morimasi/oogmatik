import React from 'react';
import { ColorfulSyllableReadingData } from '../../../types';

interface Props {
    data: ColorfulSyllableReadingData;
}

export const ColorfulSyllableReadingSheet = ({ data }: Props) => {
    const { colorPalette, wpmTarget, highlightType } = data.settings || {};

    // Uygulanacak renk haritası
    let paletNames = ['text-red-600', 'text-blue-600'];
    if (colorPalette === 'contrast') paletNames = ['text-zinc-900', 'text-zinc-400'];
    if (colorPalette === 'pastel') paletNames = ['text-teal-600', 'text-orange-500'];

    const renderWord = (wordObj: { word: string; parts: string[] }, wIndex: number) => {
        if (!wordObj.parts || wordObj.parts.length === 0) return <span key={wIndex}>{wordObj.word} </span>;

        if (highlightType === 'vowels_only') {
            const chars = wordObj.parts.join('');
            return (
                <span key={wIndex} className="mr-3 inline-block">
                    {chars.split('').map((char: string, cIdx: number) => {
                        const isVowel = /[aeıioöuüAEIİOÖUÜ]/.test(char);
                        return <span key={cIdx} className={isVowel ? `${paletNames[0]} font-black` : 'text-zinc-800'}>{char}</span>;
                    })}
                </span>
            );
        }

        if (highlightType === 'words') {
            return (
                <span key={wIndex} className={`mr-3 inline-block ${paletNames[wIndex % 2]}`}>
                    {wordObj.word}
                </span>
            );
        }

        // Default: 'syllables'
        return (
            <span key={wIndex} className="mr-4 inline-block">
                {wordObj.parts.map((syl: string, sIdx: number) => (
                    <span key={sIdx} className={`${paletNames[sIdx % 2]}`}>{syl}</span>
                ))}
            </span>
        );
    };

    return (
        <div className="w-full h-full p-3 print:p-2 flex flex-col bg-white overflow-hidden text-zinc-900 min-h-[297mm]">
            {/* ETKİNLİK BAŞLIĞI */}
            <div className="flex justify-between items-center border-b border-rose-400 pb-2 print:pb-0.5 mb-4 print:mb-1.5">
                <div>
                    <h1 className="text-2xl print:text-lg font-black text-rose-900 tracking-tighter uppercase">{data.content?.title || "Okuma Egzersizi"}</h1>
                    <p className="text-xs print:text-[10px] font-bold text-rose-500/70 mt-0.5 uppercase tracking-widest">{data.settings?.topic} • Renkli Hece Okuma</p>
                </div>
                <div className="text-right flex flex-col gap-1.5">
                    <div className="px-3 print:px-1 py-1.5 bg-rose-50 border border-rose-200 rounded-lg">
                        <span className="text-[7px] font-black tracking-widest text-rose-400 block mb-0.5">HEDEF WPM</span>
                        <span className="text-lg font-black text-rose-600">{wpmTarget} <span className="text-xs">Kelime/Dk.</span></span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start mt-3 print:mt-1 px-4 print:px-2">
                {data.content?.paragraphs?.map((paragraph: any, pIdx: number) => (
                    <div key={pIdx} className="mb-6 print:mb-2 w-full text-justify" style={{ lineHeight: '2.5' }}>
                        {paragraph.syllabified?.map((wordObj: any, wIdx: number) => renderWord(wordObj, wIdx))}
                    </div>
                ))}
            </div>

            {/* Okuma Paneli / Form Alt Bilgisi */}
            <div className="w-full mt-auto mb-4 print:mb-1.5 p-3 print:p-1.5 bg-zinc-50 border border-dashed border-zinc-300 rounded-xl flex items-center justify-between page-break-inside-avoid">
                <div className="flex items-center gap-3 print:gap-1">
                    <div className="w-10 h-10 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400">
                        <i className="fa-solid fa-stopwatch text-base"></i>
                    </div>
                    <div>
                        <div className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Performans Kaydı</div>
                        <div className="text-sm font-black text-zinc-700">Bitirme Süreniz: ............ sn</div>
                    </div>
                </div>

                <div className="flex flex-col gap-1.5 items-end">
                    <div className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Okunan Kelime Sayısı: ...........</div>
                    <div className="text-[7px] font-black text-zinc-400 uppercase tracking-widest">Hatalı Kelime: ...........</div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="pt-2 print:pt-0.5 border-t border-zinc-200 flex justify-between items-center text-[7px] font-black text-slate-400 uppercase tracking-widest">
                <span>Neuro-bdmind Özel Eğitim Teknolojileri</span>
                <span>Modül: Renkli Hece • Zorluk: {data.settings?.difficulty?.toUpperCase() || 'ORTA'}</span>
            </div>
        </div>
    );
};
