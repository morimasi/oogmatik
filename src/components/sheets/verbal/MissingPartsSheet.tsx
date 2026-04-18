import React from 'react';
import { MissingPartsData } from '../../../types';
import { PedagogicalHeader, ReadingRuler } from '../common';

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => {
    const { content, settings } = data;

    return (
        <div className="flex flex-col h-full bg-white relative font-lexend p-4">
            <ReadingRuler />
            <PedagogicalHeader 
                title={content.title} 
                instruction={data.instruction || "Metindeki boşlukları uygun kelimelerle doldurun."} 
                note={data.pedagogicalNote} 
            />

            {settings?.showWordBank && content.wordBank && content.wordBank.length > 0 && (
                <div className="mb-8 p-6 bg-zinc-900 rounded-[2.5rem] border-4 border-zinc-200 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-20 rotate-12">
                        <i className="fa-solid fa-box-archive text-[60px] text-white"></i>
                    </div>
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <i className="fa-solid fa-key text-emerald-400"></i> Kelime Havuzu
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {content.wordBank.map((word, i) => (
                            <div key={i} className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-bold text-sm transition-all cursor-default">
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-8 flex-1">
                {content.paragraphs.map((p, pIdx) => (
                    <div key={pIdx} className="p-8 bg-zinc-50/50 rounded-[3rem] border border-zinc-100 leading-[3] text-lg text-zinc-800 text-justify relative">
                        <div className="absolute -top-4 -left-2 px-4 py-1.5 bg-zinc-200 text-zinc-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                            Metin Akışı {pIdx + 1}
                        </div>
                        {p.parts.map((part, iIdx) => (
                            <React.Fragment key={iIdx}>
                                {part.isBlank ? (
                                    <span className="relative inline-block mx-1 min-w-[120px] text-zinc-300">
                                        <span className="absolute inset-0 border-b-2 border-zinc-800 border-dashed"></span>
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

            <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <h5 className="text-[10px] font-black text-emerald-600 uppercase mb-2">Hızlı Kontrol</h5>
                    <ul className="text-[9px] text-zinc-500 space-y-1">
                        <li>• Tüm kutudaki kelimeleri kullandın mı?</li>
                        <li>• Cümleler mantıklı geliyor mu?</li>
                        <li>• Yazım kurallarına dikkat ettin mi?</li>
                    </ul>
                </div>
                <div className="p-4 flex items-center justify-center bg-zinc-50 rounded-2xl border border-zinc-100">
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-zinc-400 uppercase mb-1">Öğrenci Puanı</span>
                        <div className="flex gap-1 text-rose-500">
                            {[1, 2, 3, 4, 5].map(i => <i key={i} className="fa-solid fa-heart opacity-20"></i>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
