import React from 'react';
import { MissingPartsData } from '../../../types';
import { PedagogicalHeader, ReadingRuler } from '../common';

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => {
    const { content, settings } = data;

    return (
        <div className="flex flex-col bg-white font-['Lexend'] text-zinc-900 relative overflow-hidden professional-worksheet print:w-[210mm] print:h-[297mm] px-[12mm] py-[15mm]">
            {/* Premium Gradient Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-600 via-indigo-600 to-emerald-600 opacity-100"></div>
            
            <PedagogicalHeader 
                title={content.title || "EKSİK PARÇALARI TAMAMLA"} 
                instruction={data.instruction || "Metindeki boşlukları uygun kelimelerle doldurun."} 
            />

            {settings?.showWordBank && content.wordBank && (
                <div className="mb-3 print:mb-1.5 p-2.5 print:p-1.5 bg-zinc-900 rounded-xl border border-zinc-200 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-1.5 opacity-15 rotate-12">
                        <i className="fa-solid fa-box-archive text-[30px] text-white"></i>
                    </div>
                    <h4 className="text-[7px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                        <i className="fa-solid fa-key text-emerald-400 text-xs"></i> Kelime Havuzu
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {(content.wordBank.words || content.wordBank || []).map((word: string, i: number) => (
                            <div key={i} className="px-2.5 py-0.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white font-bold text-[8px] transition-all cursor-default">
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="space-y-3 print:space-y-1.5 flex-1">
                {(content.paragraphs || []).map((p, pIdx) => (
                    <div key={pIdx} className="p-3 print:p-1.5 bg-zinc-50/50 rounded-xl border border-zinc-100 leading-[1.8] text-sm print:text-[9px] text-zinc-800 text-justify relative">
                        <div className="absolute -top-2.5 -left-1 px-2.5 py-0.5 bg-zinc-200 text-zinc-500 rounded-full text-[6.5px] font-black uppercase tracking-widest">
                            Metin {pIdx + 1}
                        </div>
                        {(p.parts || []).map((part, iIdx) => (
                            <React.Fragment key={iIdx}>
                                {part.isBlank ? (
                                    <span className="relative inline-block mx-0.5 min-w-[60px] print:min-w-[45px] text-zinc-300">
                                        <span className="absolute inset-0 border-b border-zinc-800 border-dashed"></span>
                                        <span className="opacity-0">HIDEWRD</span>
                                    </span>
                                ) : (
                                    <span>{part.text}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-2.5 print:gap-1 pt-1.5 border-t border-zinc-200">
                <div className="p-2.5 print:p-1 bg-emerald-50 rounded-xl border border-emerald-100">
                    <h5 className="text-[7px] font-black text-emerald-600 uppercase mb-1">Hızlı Kontrol</h5>
                    <ul className="text-[6.5px] text-zinc-500 space-y-0.3">
                        <li>• Tüm kelimeleri kullandın mı?</li>
                        <li>• Mantıklı geliyor mu?</li>
                        <li>• Yazım kurallarına dikkat ettin mi?</li>
                    </ul>
                </div>
                <div className="p-2.5 print:p-1 flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-100">
                    <div className="flex flex-col items-center">
                        <span className="text-[6.5px] font-black text-zinc-400 uppercase mb-0.5">Öğrenci</span>
                        <div className="flex gap-0.3 text-rose-500">
                            {[1,2,3,4,5].map(i => <i key={i} className="fa-solid fa-heart opacity-20 text-[10px]"></i>)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
