import React from 'react';
import { StoryAnalysisData } from '../../../types';
import { PedagogicalHeader, ReadingRuler, ImageDisplay } from '../common';

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData; settings?: Record<string, unknown> }> = ({ data, settings }) => {
    const content = data.content;
    const compact = (settings?.compactLayout as boolean) ?? false;

    if (!content) {
        return <div className="p-8 text-center text-zinc-400">İçerik yüklenemedi.</div>;
    }

    const analysis = content.analysis || {};
    const characters = analysis.characters || [];
    const setting = analysis.setting || { place: '', time: '', description: '' };
    const questions = data.questions || [];

    return (
        <div className={`flex flex-col h-full bg-white relative font-lexend p-3 print:p-2 min-h-[297mm]`}>
            <ReadingRuler />
            <PedagogicalHeader 
                title={content.title || 'Hikaye Analizi'} 
                instruction={data.instruction || 'Hikayeyi derinlemesine analiz et.'} 
            />

            {/* Hikaye Metni */}
            <div className={`p-2.5 print:p-1.5 mb-3 print:mb-1.5 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-800 leading-relaxed text-sm print:text-xs text-justify`}>
                {content.story}
            </div>

            {/* Analiz Bölümleri */}
            <div className={`grid grid-cols-2 gap-2.5 print:gap-1.5 mb-3 print:mb-1.5`}>
                {/* Karakterler */}
                {characters.length > 0 && (
                    <div className={`p-2.5 print:p-1.5 bg-rose-50 rounded-lg border border-rose-100`}>
                        <h4 className={`text-[8px] font-black text-rose-600 uppercase mb-1.5`}>
                             Karakterler
                        </h4>
                        <div className="space-y-0.5">
                            {characters.map((c, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className={`text-xs print:text-[10px] font-bold`}>{c.name}</span>
                                    <span className={`text-[8px] print:text-[7px] text-zinc-500 italic`}>{c.traits?.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Yer ve Zaman */}
                <div className={`p-2.5 print:p-1.5 bg-indigo-50 rounded-lg border border-indigo-100`}>
                    <h4 className={`text-[8px] font-black text-indigo-600 uppercase mb-1.5`}>
                        📍 Yer & Zaman
                    </h4>
                    <div className={`grid grid-cols-2 gap-1.5 print:gap-1 text-xs print:text-[10px]`}>
                        <div>
                            <span className={`block text-[7px] uppercase font-bold text-zinc-400`}>YER</span>
                            <span className="font-medium text-zinc-300 italic">{setting.place || '................'}</span>
                        </div>
                        <div>
                            <span className={`block text-[7px] uppercase font-bold text-zinc-400`}>ZAMAN</span>
                            <span className="font-medium text-zinc-300 italic">{setting.time || '................'}</span>
                        </div>
                    </div>
                </div>

                {/* Çatışma ve Çözüm */}
                <div className={`p-2.5 print:p-1.5 bg-amber-50 rounded-lg border border-amber-100 col-span-2`}>
                    <div className={`grid grid-cols-2 gap-2.5 print:gap-1.5`}>
                        <div>
                            <h4 className={`text-[8px] font-black text-amber-600 uppercase mb-0.5`}> Çatışma</h4>
                            <p className={`text-xs print:text-[10px] font-medium text-zinc-300 italic leading-tight`}>
                                {analysis.conflict || 'Metindeki temel sorun?'}
                            </p>
                        </div>
                        <div>
                            <h4 className={`text-[8px] font-black text-emerald-600 uppercase mb-0.5`}>✅ Çözüm</h4>
                            <p className={`text-xs print:text-[10px] font-medium text-zinc-300 italic leading-tight`}>
                                {analysis.resolution || 'Sorun nasıl çözüldü?'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sorular */}
            {questions.length > 0 && (
                <div className="space-y-1.5">
                    <h4 className={`text-[8px] font-black text-zinc-800 uppercase border-b border-zinc-800 pb-0.5`}>Analitik Sorular</h4>
                    <div className={`grid grid-cols-2 gap-1.5 print:gap-1`}>
                        {questions.map((q, i) => (
                            <div key={i} className={`text-xs print:text-[10px]`}>
                                <p className="font-bold mb-0.5">{i + 1}. {q.question}</p>
                                <div className={`border-b border-dashed border-zinc-200 h-5 w-full mt-0.5`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className={`mt-auto pt-2 border-t border-zinc-200 flex justify-between items-center text-[7px] font-bold text-zinc-400 uppercase tracking-widest`}>
                <span>Hikaye Analizi • Ultra Pro</span>
                <span>{analysis.mainIdea ? `Ana Fikir: ${analysis.mainIdea}` : 'Ana Fikir: ................'}</span>
            </div>
        </div>
    );
};
