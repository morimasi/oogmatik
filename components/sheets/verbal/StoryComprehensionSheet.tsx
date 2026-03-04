
import React from 'react';
import { InteractiveStoryData } from '../../../types';
import { ImageDisplay, PedagogicalHeader, ReadingRuler, StoryHighlighter, QUESTION_TYPES } from '../common';
import { EditableElement, EditableText } from '../../Editable';

const PrintQuestionBlock = ({ title, questions, type, icon }: { title: string, questions: any[], type: string, icon?: string }) => {
    if (!questions || questions.length === 0) return null;
    return (
        <div className="mb-8 break-inside-avoid">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-zinc-800 pb-1">
                {icon && <i className={`fa-solid ${icon} text-indigo-500`}></i>}
                <h4 className="font-black text-black uppercase text-sm">{title}</h4>
            </div>
            <div className="space-y-4">
                {questions.map((q: any, i: number) => (
                    <div key={i} className="text-sm text-black relative">
                        {type === 'open' && q.type && QUESTION_TYPES[q.type] ? (
                            <div className="flex items-start gap-3">
                                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-sm"
                                    style={{ backgroundColor: QUESTION_TYPES[q.type].color }}>
                                    {QUESTION_TYPES[q.type].label}
                                </span>
                                <div className="flex-1">
                                    <p className="font-bold mb-2">{q.question}</p>
                                    <div className="border-b-2 border-dashed border-zinc-200 h-8 w-full"></div>
                                </div>
                            </div>
                        ) : type === 'true-false' ? (
                            <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100 group transition-all">
                                <p className="font-bold pr-4 flex-1">{i + 1}. {q.question}</p>
                                <div className="flex gap-2">
                                    <div className="flex flex-col items-center gap-0.5">
                                        <div className="w-8 h-8 rounded-lg border-2 border-emerald-500 bg-white flex items-center justify-center font-black text-emerald-500 text-xs shadow-sm">D</div>
                                    </div>
                                    <div className="flex flex-col items-center gap-0.5">
                                        <div className="w-8 h-8 rounded-lg border-2 border-rose-500 bg-white flex items-center justify-center font-black text-rose-500 text-xs shadow-sm">Y</div>
                                    </div>
                                </div>
                            </div>
                        ) : type === 'fill' ? (
                            <div className="p-3 bg-indigo-50/50 rounded-xl border-l-4 border-indigo-400">
                                <p className="leading-loose font-medium italic">
                                    {q.sentence.split('........').map((part: string, idx: number, arr: any[]) => (
                                        <React.Fragment key={idx}>
                                            {part}
                                            {idx < arr.length - 1 && (
                                                <span className="inline-block min-w-[80px] border-b-2 border-dashed border-indigo-400 mx-1 px-2">..........</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="font-bold mb-2">{i + 1}. {q.question}</p>
                                {type === 'multiple-choice' && (
                                    <div className="grid grid-cols-1 gap-2 ml-4">
                                        {(q.options || []).map((opt: string, k: number) => (
                                            <div key={k} className="flex items-center gap-3">
                                                <div className="w-4 h-4 border-2 border-zinc-300 rounded-full"></div>
                                                <span className="font-medium text-zinc-700">{opt}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const StoryComprehensionSheet: React.FC<{ data: InteractiveStoryData }> = ({ data }) => (
    <div className="flex flex-col h-full bg-white relative font-lexend">
        <ReadingRuler />
        <div className="shrink-0 mb-6 flex justify-between items-start border-b-4 border-zinc-900 pb-4">
            <div className="flex-1">
                <PedagogicalHeader title={data.title} instruction={data.instruction || "Hikayeyi en az 3 kez oku."} note={data.pedagogicalNote} />
            </div>
            <div className="flex flex-col items-center ml-6 bg-zinc-900 text-white p-3 rounded-2xl shadow-lg">
                <span className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Okuma Sayısı</span>
                <div className="flex gap-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center cursor-pointer hover:bg-yellow-400 hover:text-black transition-all">
                            <i className="fa-solid fa-star"></i>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mb-10 min-h-[400px]">
            <div className="flex-1 bg-white p-8 rounded-[2rem] border-2 border-zinc-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                <div className="prose max-w-none font-dyslexic text-xl leading-[2.2] text-zinc-800 text-justify">
                    <StoryHighlighter text={data.story} highlights={(data.fiveW1H || []).map(q => ({ text: q.answer, type: q.type }))} />
                </div>
            </div>
            {data.imagePrompt && (
                <div className="w-full md:w-1/3 aspect-square bg-zinc-50 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden shrink-0">
                    <ImageDisplay prompt={data.imagePrompt} description={data.title} className="w-full h-full object-cover" />
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
                <PrintQuestionBlock title="5N 1K Analizi" questions={data.fiveW1H} type="open" icon="fa-magnifying-glass" />
                <PrintQuestionBlock title="Sözlükçe" questions={data.vocabulary?.map(v => ({ question: `${v.word}: ${v.definition}` })) || []} type="list" icon="fa-spell-check" />
            </div>
            <div className="space-y-8">
                <PrintQuestionBlock title="Doğru mu Yanlış mı?" questions={data.trueFalse} type="true-false" icon="fa-check-double" />
                <PrintQuestionBlock title="Anlama Testi" questions={data.multipleChoice} type="multiple-choice" icon="fa-list-ol" />
            </div>
        </div>
    </div>
);
