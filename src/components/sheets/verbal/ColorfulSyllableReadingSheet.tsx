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
        <div className="w-full h-full p-2 print:p-1.5 flex flex-col bg-white overflow-hidden text-zinc-900">
            <div className="flex justify-between items-center border-b border-rose-400 pb-1.5 print:pb-1 mb-2 print:mb-1">
                <div>
                    <h1 className="text-lg print:text-base font-black text-rose-900 tracking-tighter uppercase">{data.content?.title || "Okuma Egzersizi"}</h1>
                    <p className="text-[9px] print:text-[8px] font-bold text-rose-500/70 uppercase tracking-widest">{data.settings?.topic} • Renkli Hece</p>
                </div>
                <div className="text-right">
                    <div className="px-2 print:px-1 py-1 bg-rose-50 border border-rose-200 rounded-lg">
                        <span className="text-[6px] font-black tracking-widest text-rose-400 block">HEDEF WPM</span>
                        <span className="text-sm font-black text-rose-600">{wpmTarget} <span className="text-[9px]">K/Dk</span></span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start mt-1.5 print:mt-1 px-2 print:px-1">
                {data.content?.paragraphs?.map((paragraph: any, pIdx: number) => (
                    <div key={pIdx} className="mb-2 print:mb-1 w-full text-justify" style={{ lineHeight: paragraph.syllabified?.length > 10 ? '1.9' : '2.5' }}>
                        {paragraph.syllabified?.map((wordObj: any, wIdx: number) => renderWord(wordObj, wIdx))}
                    </div>
                ))}
            </div>

            <div className="w-full mt-auto mb-1.5 print:mb-1 p-1.5 print:p-1 bg-zinc-50 border border-dashed border-zinc-300 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-zinc-400">
                        <i className="fa-solid fa-stopwatch text-sm"></i>
                    </div>
                    <div>
                        <div className="text-[7px] font-black text-zinc-400 uppercase">Bitirme Süreniz: ............ sn</div>
                    </div>
                </div>
                <div className="text-[6px] font-black text-zinc-400 uppercase">Kelime: ........... Hata: ...........</div>
            </div>

            <div className="pt-1.5 print:pt-0.5 border-t border-zinc-200 flex justify-between items-center text-[6px] font-black text-slate-400 uppercase">
                <span>Neuro-bdmind</span>
                <span>Renkli Hece • {data.settings?.difficulty?.toUpperCase() || 'ORTA'}</span>
            </div>
        </div>
    );
};
