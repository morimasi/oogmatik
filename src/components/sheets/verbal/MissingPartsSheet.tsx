import React from 'react';
import { MissingPartsData } from '../../../types';
import { PedagogicalHeader, ReadingRuler } from '../common';

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => {
    const { content, settings } = data;

    return (
        <div className="flex flex-col h-full bg-white relative font-lexend p-3 print:p-2 min-h-[297mm]">
            <ReadingRuler />
            <PedagogicalHeader 
                title={content.title} 
                instruction={data.instruction || "Metindeki boşlukları uygun kelimelerle doldurun."} 
            />

            {settings?.showWordBank && content.wordBank && content.wordBank.words.length > 0 && (
                <div className="mb-4 print:mb-2 p-3 print:p-2 bg-zinc-900 rounded-xl border border-zinc-200 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-15 rotate-12">
                        <i className="fa-solid fa-box-archive text-[35px] text-white"></i>
                    </div>
                    <h4 className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
                        <i className="fa-solid fa-key text-emerald-400 text-xs"></i> Kelime Havuzu
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {content.wordBank.words.map((word: string, i: number) => (
                            <div key={i} className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold text-xs transition-all cursor-default">
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-4 print:space-y-2 flex-1">
                {content.paragraphs.map((p, pIdx) => (
                    <div key={pIdx} className="p-4 print:p-2 bg-zinc-50/50 rounded-xl border border-zinc-100 leading-[2.2] text-sm print:text-xs text-zinc-800 text-justify relative">
                        <div className="absolute -top-3 -left-1 px-3 py-0.5 bg-zinc-200 text-zinc-500 rounded-full text-[7px] font-black uppercase tracking-widest">
                            Metin Akışı {pIdx + 1}
                        </div>
                        {p.parts.map((part, iIdx) => (
                            <React.Fragment key={iIdx}>
                                {part.isBlank ? (
                                    <span className="relative inline-block mx-1 min-w-[80px] print:min-w-[60px] text-zinc-300">
                                        <span className="absolute inset-0 border-b border-zinc-800 border-dashed"></span>
                                        <span className="opacity-0">HIDDENKW</span>
                                    </span>
                                ) : (
                                    <span>{part.text}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 print:gap-1.5 pt-2 border-t border-zinc-200">
                <div className="p-3 print:p-2 bg-emerald-50 rounded-xl border border-emerald-100">
                    <h5 className="text-[8px] font-black text-emerald-600 uppercase mb-1.5">Hızlı Kontrol</h5>
                    <ul className="text-[7px] text-zinc-500 space-y-0.5">
                        <li>• Tüm kutudaki kelimeleri kullandın mı?</li>
                        <li>• Cümleler mantıklı geliyor mu?</li>
                        <li>• Yazım kurallarına dikkat ettin mi?</li>
                    </ul>
                </div>
                <div className="p-3 print:p-2 flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black text-zinc-400 uppercase mb-1">Öğrenci Puanı</span>
                        <div className="flex gap-0.5 text-rose-500">
                            {[1,2,3,4,5].map(i => <i key={i} className="fa-solid fa-heart opacity-20 text-xs"></i>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
