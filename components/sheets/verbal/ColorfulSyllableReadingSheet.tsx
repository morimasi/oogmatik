import React from 'react';
import { ColorfulSyllableReadingData } from '../../../types';

interface Props {
    data: ColorfulSyllableReadingData;
}

export const ColorfulSyllableReadingSheet: React.FC<Props> = ({ data }) => {
    const { colorPalette, wpmTarget, highlightType } = data.settings || {};

    // Uygulanacak renk haritası
    let paletNames = ['text-red-600', 'text-blue-600'];
    if (colorPalette === 'contrast') paletNames = ['text-zinc-900', 'text-zinc-400'];
    if (colorPalette === 'pastel') paletNames = ['text-teal-600', 'text-orange-500'];

    const renderWord = (wordObj: { word: string; parts: string[] }, wIndex: number) => {
        if (!wordObj.parts || wordObj.parts.length === 0) return <span key={wIndex}>{wordObj.word} </span>;

        if (highlightType === 'vowels_only') {
            // Sesli harfleri özel renge (paletin ilk rengi) boyar, sessizleri siyah.
            // Data parts zaten harf harf veya parçalara ayrılmış olabilir. Bazen AI bunu string listesi döner.
            const chars = wordObj.parts.join('');
            return (
                <span key={wIndex} className="mr-3 inline-block">
                    {chars.split('').map((char, cIdx) => {
                        const isVowel = /[aeıioöuüAEIİOÖUÜ]/.test(char);
                        return <span key={cIdx} className={isVowel ? `${paletNames[0]} font-black` : 'text-zinc-800'}>{char}</span>;
                    })}
                </span>
            );
        }

        if (highlightType === 'words') {
            // Sadece kelime kelime farklı renge boyar. (Bir kırmızı kelime, bir mavi kelime)
            return (
                <span key={wIndex} className={`mr-3 inline-block ${paletNames[wIndex % 2]}`}>
                    {wordObj.word}
                </span>
            );
        }

        // Default: 'syllables'
        return (
            <span key={wIndex} className="mr-4 inline-block">
                {wordObj.parts.map((syl, sIdx) => (
                    <span key={sIdx} className={`${paletNames[sIdx % 2]}`}>{syl}</span>
                ))}
            </span>
        );
    };

    return (
        <div className="w-full h-full  p-8 print:p-2 print:p-3 flex flex-col bg-white overflow-hidden text-zinc-900 print:p-0 print:border-none border border-zinc-200">
            {/* ETKİNLİK BAŞLIĞI */}
            <div className="flex justify-between items-center border-b-4 border-rose-400 pb-4 print:pb-1 mb-6 print:mb-2">
                <div>
                    <h1 className="text-4xl font-black text-rose-900 tracking-tighter uppercase">{data.content?.title || "Okuma Egzersizi"}</h1>
                    <p className="text-sm font-bold text-rose-500/70 mt-1 uppercase tracking-widest">{data.settings?.topic} • Renkli Hece Okuma</p>
                </div>
                <div className="text-right flex flex-col gap-2">
                    <div className="px-4 print:px-1 py-2 bg-rose-50 border-2 border-rose-200 rounded-xl">
                        <span className="text-[10px] font-black tracking-widest text-rose-400 block mb-1">HEDEF WPM</span>
                        <span className="text-2xl font-black text-rose-600">{wpmTarget} <span className="text-sm">Kelime / Dk.</span></span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-start mt-4 print:mt-1 px-10 print:px-3">
                {data.content?.paragraphs?.map((paragraph, pIdx) => (
                    <div key={pIdx} className="mb-10 print:mb-3 print:mb-4 print:mb-1 w-full text-justify" style={{ lineHeight: '3' }}>
                        {paragraph.syllabified?.map((wordObj, wIdx) => renderWord(wordObj, wIdx))}
                    </div>
                ))}

                {/* Okuma Paneli / Form Alt Bilgisi */}
                <div className="w-full mt-auto mb-10 print:mb-3 print:mb-4 print:mb-1 p-6 print:p-2 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-3xl flex items-center justify-between page-break-inside-avoid">
                    <div className="flex items-center gap-4 print:gap-1">
                        <div className="w-16 h-16 bg-white border-4 border-zinc-200 rounded-full flex items-center justify-center text-zinc-400">
                            <i className="fa-solid fa-stopwatch text-2xl"></i>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Performans Kaydı</div>
                            <div className="text-lg font-black text-zinc-700">Bitirme Süreniz: ............ sn</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Okunan Kelime Sayısı: ...........</div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Hatalı Kelime: ...........</div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="pt-4 print:pt-1 border-t-2 border-zinc-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-widest">
                <span>Neuro-Oogmatik Özel Eğitim Teknolojileri</span>
                <span>Modül: Renkli Hece • Zorluk: {data.settings?.difficulty.toUpperCase()}</span>
            </div>
        </div>
    );
};



