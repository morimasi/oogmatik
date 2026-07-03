import React from 'react';
import { MissingPartsData } from '../../../types';
import { PedagogicalHeader, ReadingRuler } from '../common';

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => {
    const { content } = data;
    const settings = data.settings;
    const isTwoCol = settings?.columnLayout === 'two-column';
    const fontSizeMap: Record<string, string> = { small: 'text-xs', medium: 'text-sm', large: 'text-base' };
    const fontSizeClass = fontSizeMap[settings?.fontSize || 'medium'] || 'text-sm';

    return (
        <div className="flex flex-col bg-white font-['Lexend'] text-zinc-900 relative overflow-hidden professional-worksheet h-full print:w-[210mm] print:h-[297mm] px-[8mm] py-[10mm]">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-600 via-indigo-600 to-emerald-600 opacity-100"></div>
            
            <PedagogicalHeader 
                title={content.title || "EKSİK PARÇALARI TAMAMLA"} 
                instruction={data.instruction || "Metindeki boşlukları uygun kelimelerle doldurun."} 
            />

            {settings?.showWordBank && content.wordBank && (
                <div className="mb-1.5 print:mb-1 p-1.5 print:p-1 bg-zinc-900 rounded-lg relative overflow-hidden">
                    <h4 className="text-[6px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                        <i className="fa-solid fa-key text-emerald-400 text-[10px]"></i> Kelime Havuzu
                    </h4>
                    <div className="flex flex-wrap gap-1">
                        {(content.wordBank.words || []).map((word: string, i: number) => (
                            <div key={i} className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-white font-bold text-[7px]">
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={`space-y-1.5 print:space-y-1 flex-1 ${isTwoCol ? 'columns-2 gap-3' : ''}`}>
                {(content.paragraphs || []).map((p, pIdx) => (
                    <div key={pIdx} className={`p-1.5 print:p-1 bg-zinc-50/50 rounded-lg border border-zinc-100 leading-[1.7] ${fontSizeClass} text-zinc-800 text-justify relative ${isTwoCol ? 'break-inside-avoid-column' : ''}`}>
                        <div className="absolute -top-2 -left-0.5 px-1.5 py-0.5 bg-zinc-200 text-zinc-500 rounded-full text-[5.5px] font-black uppercase tracking-widest">
                            Metin {pIdx + 1}
                        </div>
                        {(p.parts || []).map((part, iIdx) => (
                            <React.Fragment key={iIdx}>
                                {part.isBlank ? (
                                    <span className="relative inline-block mx-0.5 min-w-[45px] print:min-w-[35px] text-zinc-300">
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

            <div className="mt-auto grid grid-cols-2 gap-1.5 print:gap-1 pt-1 border-t border-zinc-200">
                <div className="p-1.5 print:p-1 bg-emerald-50 rounded-lg border border-emerald-100">
                    <h5 className="text-[6px] font-black text-emerald-600 uppercase mb-0.5">Hızlı Kontrol</h5>
                    <ul className="text-[5.5px] text-zinc-500 space-y-0.2">
                        <li>• Tüm kelimeleri kullandın mı?</li>
                        <li>• Mantıklı geliyor mu?</li>
                        <li>• Yazım kurallarına dikkat ettin mi?</li>
                    </ul>
                </div>
                <div className="p-1.5 print:p-1 flex items-center justify-center bg-zinc-50 rounded-lg border border-zinc-100">
                    <div className="flex flex-col items-center">
                        <span className="text-[5.5px] font-black text-zinc-400 uppercase mb-0.5">Öğrenci</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
