import React from 'react';
import { StoryAnalysisData } from '../../../types';
import { PedagogicalHeader, ReadingRuler } from '../common';

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData; settings?: Record<string, unknown> }> = ({ data, settings }) => {
    const rawData = data as any;
    const resolvedData = rawData?.data || rawData;
    const content = resolvedData?.content || rawData?.content;
    const s = {
        ...(resolvedData?.settings || {}),
        ...(settings || {}),
    } as Record<string, unknown>;

    const compact = (s.compactLayout as boolean) ?? false;
    const showReadingRuler = (s.showReadingRuler as boolean) ?? false;
    const useIcons = (s.useIcons as boolean) ?? true;
    const pedagogicalNote = (resolvedData?.pedagogicalNote as string) || '';

    // Analiz koşulları — settings bazlı
    const includeCharacterAnalysis = (s.includeCharacterAnalysis as boolean) ?? true;
    const includeSettingAnalysis = (s.includeSettingAnalysis as boolean) ?? true;
    const includeConflictResolution = (s.includeConflictResolution as boolean) ?? true;
    const includeMainIdea = (s.includeMainIdea as boolean) ?? true;
    const includeSubThemes = (s.includeSubThemes as boolean) ?? true;
    const showStoryMap = (s.showStoryMap as boolean) ?? true;
    const includeThematicQuestions = (s.includeThematicQuestions as boolean) ?? true;
    const includeInferentialQuestions = (s.includeInferentialQuestions as boolean) ?? true;
    const includeCreativeQuestions = (s.includeCreativeQuestions as boolean) ?? true;
    const includeVocabularyList = (s.includeVocabularyList as boolean) ?? true;

    if (!content || !content.story) {
        return <div className="p-8 text-center text-zinc-400 font-bold">Hikaye Analizi İçeriği Hazırlanıyor...</div>;
    }

    const analysis = content.analysis || {};
    const characters = analysis.characters || [];
    const setting = analysis.setting || { place: '', time: '', description: '' };
    const storyMap = content.storyMap || {};
    const allQuestions: any[] = rawData.questions || resolvedData.questions || content.questions || [];

    // Soruları tipe göre filtrele
    const thematicQuestions = allQuestions.filter((q: any) => q.type === 'thematic' || q.type === 'open-ended');
    const inferenceQuestions = allQuestions.filter((q: any) => q.type === 'inference');
    const creativeQuestions = allQuestions.filter((q: any) => q.type === 'creative');

    const sectionStyle = compact
        ? 'p-2 print:p-1.5 mb-2 print:mb-1'
        : 'p-3 print:p-2 mb-3 print:mb-2';

    return (
        <div className={`flex flex-col bg-white relative font-lexend p-4 print:p-2 min-h-[297mm] ${compact ? 'compact-spacing' : ''}`}>
            {showReadingRuler && <ReadingRuler />}
            <PedagogicalHeader
                title={content.title || 'Hikaye Analizi'}
                instruction={data.instruction || 'Hikayeyi derinlemesine analiz et.'}
            />

            {/* ═══ HİKAYE METNİ ═══ */}
            <div className={`${sectionStyle} bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-800 leading-relaxed text-sm print:text-xs text-justify`}>
                {content.story}
            </div>

            {/* ═══ HİKAYE HARİTASI ═══ */}
            {showStoryMap && (storyMap.giris || storyMap.gelisme || storyMap.doruk || storyMap.cozum || storyMap.sonuc) && (
                <div className={`${sectionStyle} bg-violet-50 rounded-xl border border-violet-200`}>
                    <h4 className="text-[9px] font-black text-violet-700 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        {useIcons && <span>🗺️</span>} Hikaye Haritası
                    </h4>
                    <div className="flex items-center gap-0 w-full">
                        {[
                            { key: 'giris', label: 'Giriş', color: 'bg-blue-100 border-blue-300 text-blue-800' },
                            { key: 'gelisme', label: 'Gelişme', color: 'bg-emerald-100 border-emerald-300 text-emerald-800' },
                            { key: 'doruk', label: 'Doruk', color: 'bg-amber-100 border-amber-300 text-amber-800' },
                            { key: 'cozum', label: 'Çözüm', color: 'bg-orange-100 border-orange-300 text-orange-800' },
                            { key: 'sonuc', label: 'Sonuç', color: 'bg-rose-100 border-rose-300 text-rose-800' },
                        ].map((step, idx) => (
                            <React.Fragment key={step.key}>
                                <div className={`flex-1 ${step.color} border rounded-lg p-2 text-center`}>
                                    <div className="text-[7px] font-black uppercase tracking-wider mb-0.5">{step.label}</div>
                                    <div className="text-[8px] print:text-[7px] font-medium leading-tight italic">
                                        {(storyMap as any)[step.key] || '................'}
                                    </div>
                                </div>
                                {idx < 4 && (
                                    <div className="text-zinc-400 text-sm font-bold px-0.5 flex-shrink-0">→</div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ ANALİZ BÖLÜMLERİ ═══ */}
            <div className={`grid grid-cols-2 gap-2 print:gap-1.5 ${sectionStyle}`}>
                {/* Karakter Analizi */}
                {includeCharacterAnalysis && characters.length > 0 && (
                    <div className="p-2.5 print:p-1.5 bg-rose-50 rounded-lg border border-rose-100">
                        <h4 className="text-[8px] font-black text-rose-600 uppercase mb-1.5 flex items-center gap-1">
                            {useIcons && <span>👤</span>} Karakterler
                        </h4>
                        <div className="space-y-1">
                            {characters.map((c: any, i: number) => (
                                <div key={i} className="flex flex-col">
                                    <span className="text-xs print:text-[10px] font-bold">{c.name}</span>
                                    <span className="text-[8px] print:text-[7px] text-zinc-500 italic">{c.traits?.join(', ')}</span>
                                    {c.description && (
                                        <span className="text-[7px] text-zinc-400 mt-0.5">{c.description}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mekan Analizi */}
                {includeSettingAnalysis && (
                    <div className="p-2.5 print:p-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                        <h4 className="text-[8px] font-black text-indigo-600 uppercase mb-1.5 flex items-center gap-1">
                            {useIcons && <span>📍</span>} Yer & Zaman
                        </h4>
                        <div className="grid grid-cols-2 gap-1.5 print:gap-1 text-xs print:text-[10px]">
                            <div>
                                <span className="block text-[7px] uppercase font-bold text-zinc-400">YER</span>
                                <span className="font-medium text-zinc-300 italic">{setting.place || '................'}</span>
                            </div>
                            <div>
                                <span className="block text-[7px] uppercase font-bold text-zinc-400">ZAMAN</span>
                                <span className="font-medium text-zinc-300 italic">{setting.time || '................'}</span>
                            </div>
                        </div>
                        {setting.description && (
                            <p className="text-[8px] text-zinc-500 mt-1 italic">{setting.description}</p>
                        )}
                    </div>
                )}

                {/* Çatışma ve Çözüm Süreci */}
                {includeConflictResolution && (
                    <div className="p-2.5 print:p-1.5 bg-amber-50 rounded-lg border border-amber-100 col-span-2">
                        <div className="grid grid-cols-2 gap-2.5 print:gap-1.5">
                            <div>
                                <h4 className="text-[8px] font-black text-amber-600 uppercase mb-0.5 flex items-center gap-1">
                                    {useIcons && <span>⚡</span>} Çatışma
                                </h4>
                                <p className="text-xs print:text-[10px] font-medium text-zinc-300 italic leading-tight">
                                    {analysis.conflict || 'Metindeki temel sorun neydi? .......................'}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-[8px] font-black text-emerald-600 uppercase mb-0.5 flex items-center gap-1">
                                    {useIcons && <span>✅</span>} Çözüm
                                </h4>
                                <p className="text-xs print:text-[10px] font-medium text-zinc-300 italic leading-tight">
                                    {analysis.resolution || 'Sorun nasıl çözüldü? .......................'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ═══ ANA FİKİR ═══ */}
            {includeMainIdea && (
                <div className={`${sectionStyle} bg-teal-50 rounded-xl border border-teal-200`}>
                    <h4 className="text-[8px] font-black text-teal-700 uppercase mb-1 flex items-center gap-1">
                        {useIcons && <span>💡</span>} Ana Fikir
                    </h4>
                    <div className="text-xs print:text-[10px] font-medium text-zinc-300 italic leading-tight border-b-2 border-dashed border-teal-200 pb-2">
                        {analysis.mainIdea || 'Bu hikayenin ana fikri/mesajı nedir? ...............................'}
                    </div>
                </div>
            )}

            {/* ═══ ALT TEMALAR ═══ */}
            {includeSubThemes && Array.isArray(analysis.subThemes) && analysis.subThemes.length > 0 && (
                <div className={`${sectionStyle} bg-purple-50 rounded-xl border border-purple-200`}>
                    <h4 className="text-[8px] font-black text-purple-700 uppercase mb-1.5 flex items-center gap-1">
                        {useIcons && <span>🏷️</span>} Alt Temalar
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                        {analysis.subThemes.map((theme: string, i: number) => (
                            <span key={i} className="bg-purple-100 text-purple-700 text-[9px] font-bold px-2.5 py-1 rounded-full border border-purple-200">
                                {theme}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ SÖZLÜKÇE / KELİME LİSTESİ ═══ */}
            {includeVocabularyList && Array.isArray(content.vocabulary) && content.vocabulary.length > 0 && (
                <div className={`${sectionStyle}`}>
                    <h4 className="text-[8px] font-black text-zinc-800 uppercase border-b border-zinc-800 pb-0.5 mb-1 flex items-center gap-1">
                        {useIcons && <span>📖</span>} Sözlükçe
                    </h4>
                    <div className="grid grid-cols-2 gap-1.5 print:gap-1">
                        {content.vocabulary.map((v: any, i: number) => (
                            <div key={i} className="text-xs print:text-[10px]">
                                <span className="font-bold">{v.word}</span>
                                <span className="text-zinc-500 italic ml-1">— {v.definition}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ TEMATİK SORULAR ═══ */}
            {includeThematicQuestions && thematicQuestions.length > 0 && (
                <div className={`${sectionStyle}`}>
                    <h4 className="text-[8px] font-black text-zinc-800 uppercase border-b border-zinc-800 pb-0.5 mb-1.5 flex items-center gap-1">
                        {useIcons && <span>📝</span>} Tematik Sorular
                    </h4>
                    <div className="space-y-2 print:space-y-1.5">
                        {thematicQuestions.map((q: any, i: number) => (
                            <div key={i} className="text-xs print:text-[10px]">
                                <p className="font-bold mb-0.5">{i + 1}. {q.question}</p>
                                <div className="border-b border-dashed border-zinc-200 h-5 w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ ÇIKARIM SORULARI ═══ */}
            {includeInferentialQuestions && inferenceQuestions.length > 0 && (
                <div className={`${sectionStyle}`}>
                    <h4 className="text-[8px] font-black text-indigo-700 uppercase border-b border-indigo-300 pb-0.5 mb-1.5 flex items-center gap-1">
                        {useIcons && <span>🔍</span>} Çıkarım Soruları
                    </h4>
                    <div className="space-y-2 print:space-y-1.5">
                        {inferenceQuestions.map((q: any, i: number) => (
                            <div key={i} className="text-xs print:text-[10px]">
                                <p className="font-bold mb-0.5">{i + 1}. {q.question}</p>
                                <div className="border-b border-dashed border-indigo-200 h-5 w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ YARATICI SORULAR ═══ */}
            {includeCreativeQuestions && creativeQuestions.length > 0 && (
                <div className={`${sectionStyle}`}>
                    <h4 className="text-[8px] font-black text-emerald-700 uppercase border-b border-emerald-300 pb-0.5 mb-1.5 flex items-center gap-1">
                        {useIcons && <span>✨</span>} Yaratıcı Sorular
                    </h4>
                    <div className="space-y-2 print:space-y-1.5">
                        {creativeQuestions.map((q: any, i: number) => (
                            <div key={i} className="text-xs print:text-[10px]">
                                <p className="font-bold mb-0.5">{i + 1}. {q.question}</p>
                                <div className="border-b border-dashed border-emerald-200 h-5 w-full"></div>
                                <div className="border-b border-dashed border-emerald-200 h-5 w-full mt-0.5"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ FOOTER ═══ */}
            <div className="mt-auto pt-2 border-t border-zinc-200 flex justify-between items-center text-[7px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>Hikaye Analizi • Ultra Pro</span>
                <span>{analysis.mainIdea ? `Ana Fikir: ${analysis.mainIdea}` : 'Ana Fikir: ................'}</span>
            </div>

            {/* ═══ ÖĞRETMEN NOTU (PedagogicalNote) ═══ */}
            {pedagogicalNote && (
                <div className="mt-1.5 print:mt-1 p-2 bg-emerald-50/60 rounded-lg border border-emerald-200">
                    <h5 className="text-[7px] font-black text-emerald-700 uppercase tracking-widest mb-0.5">
                        Öğretmen Notu
                    </h5>
                    <p className="text-[8px] print:text-[7px] text-emerald-900/80 italic leading-relaxed">
                        {pedagogicalNote}
                    </p>
                </div>
            )}
        </div>
    );
};
