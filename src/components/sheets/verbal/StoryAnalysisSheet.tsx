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
        <div className={`flex flex-col h-full bg-white relative font-lexend ${compact ? 'p-1.5 text-[11px]' : 'p-2'}`}>
            <ReadingRuler />
            <PedagogicalHeader 
                title={content.title || 'Hikaye Analizi'} 
                instruction={data.instruction || 'Hikayeyi derinlemesine analiz et.'} 
                note={data.pedagogicalNote} 
            />

            {/* Hikaye Metni */}
            <div className={`${compact ? 'p-3 mb-3' : 'p-4 mb-4'} bg-zinc-50 rounded-2xl border border-zinc-200 text-zinc-800 leading-relaxed ${compact ? 'text-sm' : 'text-base'} text-justify`}>
                {content.story}
            </div>

            {/* Analiz Bölümleri */}
            <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-3'} mb-4`}>
                {/* Karakterler */}
                {characters.length > 0 && (
                    <div className={`${compact ? 'p-2' : 'p-3'} bg-rose-50 rounded-xl border border-rose-100`}>
                        <h4 className={`${compact ? 'text-[9px]' : 'text-xs'} font-black text-rose-600 uppercase mb-2`}>
                             Karakterler
                        </h4>
                        <div className="space-y-1">
                            {characters.map((c, i) => (
                                <div key={i} className="flex flex-col">
                                    <span className={`${compact ? 'text-[10px]' : 'text-sm'} font-bold`}>{c.name}</span>
                                    <span className={`${compact ? 'text-[8px]' : 'text-[10px]'} text-zinc-500 italic`}>{c.traits?.join(', ')}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Yer ve Zaman - BOŞ */}
                <div className={`${compact ? 'p-2' : 'p-3'} bg-indigo-50 rounded-xl border border-indigo-100`}>
                    <h4 className={`${compact ? 'text-[9px]' : 'text-xs'} font-black text-indigo-600 uppercase mb-2`}>
                        📍 Yer ve Zaman
                    </h4>
                    <div className={`grid ${compact ? 'grid-cols-2 gap-1' : 'grid-cols-2 gap-2'} ${compact ? 'text-[10px]' : 'text-sm'}`}>
                        <div>
                            <span className={`block ${compact ? 'text-[7px]' : 'text-[10px]'} uppercase font-bold text-zinc-400`}>YER</span>
                            <span className="font-medium text-zinc-300 italic">{setting.place || '....................'}</span>
                        </div>
                        <div>
                            <span className={`block ${compact ? 'text-[7px]' : 'text-[10px]'} uppercase font-bold text-zinc-400`}>ZAMAN</span>
                            <span className="font-medium text-zinc-300 italic">{setting.time || '....................'}</span>
                        </div>
                    </div>
                </div>

                {/* Çatışma ve Çözüm - BOŞ */}
                <div className={`${compact ? 'p-2' : 'p-3'} bg-amber-50 rounded-xl border border-amber-100 col-span-2`}>
                    <div className={`grid ${compact ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-4'}`}>
                        <div>
                            <h4 className={`${compact ? 'text-[9px]' : 'text-xs'} font-black text-amber-600 uppercase mb-1`}> Çatışma</h4>
                            <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-medium text-zinc-300 italic leading-tight`}>
                                {analysis.conflict || 'Metindeki temel sorun nedir?'}
                            </p>
                        </div>
                        <div>
                            <h4 className={`${compact ? 'text-[9px]' : 'text-xs'} font-black text-emerald-600 uppercase mb-1`}>✅ Çözüm</h4>
                            <p className={`${compact ? 'text-[10px]' : 'text-sm'} font-medium text-zinc-300 italic leading-tight`}>
                                {analysis.resolution || 'Bu sorun nasıl çözüldü?'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sorular */}
            {questions.length > 0 && (
                <div className="space-y-2">
                    <h4 className={`${compact ? 'text-[9px]' : 'text-xs'} font-black text-zinc-800 uppercase border-b-2 border-zinc-800 pb-1`}>Analitik Sorular</h4>
                    <div className={`${compact ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-1 gap-3'}`}>
                        {questions.map((q, i) => (
                            <div key={i} className={`${compact ? 'text-[10px]' : 'text-sm'}`}>
                                <p className="font-bold mb-1">{i + 1}. {q.question}</p>
                                <div className={`border-b-2 border-dashed border-zinc-200 ${compact ? 'h-6' : 'h-8'} w-full mt-1`}></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className={`mt-auto pt-2 border-t border-zinc-100 flex justify-between items-center ${compact ? 'text-[6px]' : 'text-[10px]'} font-bold text-zinc-400 uppercase tracking-widest`}>
                <span>Hikaye Analizi • Ultra Pro</span>
                <span>{analysis.mainIdea ? `Ana Fikir: ${analysis.mainIdea}` : 'Ana Fikir: ....................'}</span>
            </div>
        </div>
    );
};
