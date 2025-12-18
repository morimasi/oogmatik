
import React from 'react';
import { 
    StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, MissingPartsData, InteractiveStoryData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, ReadingRuler, StoryHighlighter, QUESTION_TYPES } from './common';
import { EditableElement, EditableText } from '../Editable';

// Print Layout Components (Reused from ReadingStudio for consistency)
const PrintQuestionBlock = ({ title, questions, type }: { title: string, questions: any[], type: string }) => {
    if (!questions || questions.length === 0) return null;
    return (
        <div className="mb-6 break-inside-avoid">
            <h4 className="font-black text-black uppercase text-sm border-b-2 border-black mb-3 pb-1">{title}</h4>
            <div className="space-y-3">
                {questions.map((q, i) => (
                    <div key={i} className="text-sm text-black">
                        {/* 5W1H Colored Badge Logic */}
                        {type === 'open' && q.type && QUESTION_TYPES[q.type] ? (
                            <div className="flex items-start gap-2 mb-2">
                                <span 
                                    className="shrink-0 px-2 py-0.5 rounded text-[10px] font-black uppercase text-white border"
                                    style={{ 
                                        backgroundColor: QUESTION_TYPES[q.type].color,
                                        borderColor: QUESTION_TYPES[q.type].color 
                                    }}
                                >
                                    {QUESTION_TYPES[q.type].label}
                                </span>
                                <p className="font-bold pt-0.5">{q.question}</p>
                            </div>
                        ) : (
                            <p className="font-bold mb-1">{i + 1}. {q.question}</p>
                        )}

                        {type === 'multiple-choice' && (
                            <div className="grid grid-cols-2 gap-2 ml-4">
                                {q.options && q.options.map((opt: string, k: number) => (
                                    <div key={k} className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-black rounded-full"></div>
                                        <span>{opt}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {type === 'open' && (
                            <div 
                                className="border-b-2 border-dashed h-8 w-full ml-1"
                                style={q.type && QUESTION_TYPES[q.type] ? { 
                                    borderColor: QUESTION_TYPES[q.type].color, 
                                    backgroundColor: QUESTION_TYPES[q.type].bg 
                                } : { borderColor: '#d1d5db' }}
                            ></div>
                        )}
                        {type === 'fill' && (
                            <div className="bg-zinc-100 p-2 rounded border border-zinc-200 mt-1 italic text-xs">
                                {q.sentence.replace('_______', '....................')}
                            </div>
                        )}
                        {type === 'true-false' && (
                            <div className="flex gap-4 ml-4 mt-1 font-bold text-xs">
                                <span>( ) Doğru</span>
                                <span>( ) Yanlış</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- 1. STORY COMPREHENSION (ANA ETKİNLİK) ---
export const StoryComprehensionSheet: React.FC<{ data: StoryData | InteractiveStoryData }> = ({ data }) => {
    // Determine if this is legacy data or new Reading Studio data
    const isNewFormat = (data as InteractiveStoryData).fiveW1H !== undefined;
    const iData = data as InteractiveStoryData;

    return (
        <div className="flex flex-col h-full bg-white relative">
            <ReadingRuler />
            <div className="shrink-0 mb-4 flex justify-between items-start border-b-2 border-zinc-100 pb-2">
                <div className="flex-1">
                    <PedagogicalHeader title={data.title} instruction={data.instruction || "Metni dikkatlice oku, bilmediğin kelimeleri incele."} note={data.pedagogicalNote} />
                </div>
                <div className="flex flex-col items-center ml-4 bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Okuma Takibi</span>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex flex-col items-center group cursor-pointer">
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-300 bg-white flex items-center justify-center group-hover:bg-yellow-100 group-hover:border-yellow-400 transition-colors shadow-sm">
                                    <i className="fa-regular fa-star text-zinc-300 group-hover:text-yellow-500"></i>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-6 mb-6 min-h-[300px]">
                <div className="flex-1 bg-white p-6 rounded-2xl border-2 border-zinc-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                    <div className="prose max-w-none font-dyslexic text-lg leading-loose text-zinc-800 text-justify">
                        {isNewFormat ? (
                            <StoryHighlighter 
                                text={data.story || ''} 
                                highlights={
                                    (iData.fiveW1H || []).map(q => ({
                                        text: q.answer,
                                        type: q.type
                                    }))
                                } 
                            />
                        ) : (
                            <EditableText value={data.story} tag="div" />
                        )}
                    </div>
                </div>
                <div className="w-1/3 bg-zinc-50 rounded-2xl border-2 border-zinc-200 overflow-hidden relative group shadow-sm flex-shrink-0 hidden md:block">
                    <ImageDisplay prompt={data.imagePrompt} description={data.title} className="w-full h-full object-cover" />
                </div>
            </div>

            {/* Vocabulary Box */}
            {data.vocabulary && data.vocabulary.length > 0 && (
                <div className="shrink-0 mb-6 bg-amber-50 rounded-2xl border-2 border-amber-100 p-4 border-dashed break-inside-avoid">
                    <h4 className="font-black text-amber-600 uppercase text-xs mb-3 flex items-center gap-2"><i className="fa-solid fa-magnifying-glass"></i> Kelime Dedektifi</h4>
                    <div className="grid grid-cols-3 gap-4">
                        {data.vocabulary.map((v, i) => (
                            <EditableElement key={i} className="bg-white p-3 rounded-xl border border-amber-200 shadow-sm flex flex-col gap-1">
                                <div className="font-bold text-amber-800 text-sm border-b border-amber-100 pb-1 mb-1"><EditableText value={v.word} tag="span" /></div>
                                <div className="text-xs text-zinc-600 leading-snug flex-1"><EditableText value={v.definition} tag="span" /></div>
                            </EditableElement>
                        ))}
                    </div>
                </div>
            )}

            {/* Questions Section */}
            <div className="flex-1 flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-zinc-50 rounded-2xl border-2 border-zinc-200 p-4">
                    <h4 className="font-black text-zinc-400 uppercase text-xs mb-3 flex items-center gap-2"><i className="fa-solid fa-clipboard-question"></i> Sorular</h4>
                    
                    {isNewFormat ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                 <PrintQuestionBlock 
                                    title="Metni Anlama (5N1K)" 
                                    questions={(iData.fiveW1H || []).map(q => ({
                                        question: q.question,
                                        type: q.type 
                                    }))} 
                                    type="open" 
                                 />
                                 <PrintQuestionBlock 
                                    title="Doğru mu Yanlış mı?" 
                                    questions={(iData.trueFalse || []).map(q => ({question: q.question}))} 
                                    type="true-false" 
                                 />
                             </div>
                             <div>
                                 <PrintQuestionBlock 
                                    title="Test Soruları" 
                                    questions={iData.multipleChoice || []} 
                                    type="multiple-choice" 
                                 />
                                 <PrintQuestionBlock 
                                    title="Boşlukları Doldur" 
                                    questions={iData.fillBlanks || []} 
                                    type="fill" 
                                 />
                                 <PrintQuestionBlock 
                                    title="Düşün ve Cevapla" 
                                    questions={iData.logicQuestions || []} 
                                    type="open" 
                                 />
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {((data as StoryData).questions || []).map((q, idx) => (
                                <EditableElement key={idx} className="bg-white border border-zinc-300 rounded-lg p-2.5 shadow-sm">
                                    <div className="flex gap-2 font-bold text-xs text-zinc-800 mb-2">
                                        <span className="bg-black text-white w-4 h-4 flex items-center justify-center rounded-full text-[10px] shrink-0">{idx + 1}</span>
                                        <EditableText value={q.question} tag="span" />
                                    </div>
                                    {q.type === 'multiple-choice' && q.options && (
                                        <div className="grid grid-cols-2 gap-2 pl-6">
                                            {q.options.map((opt, oIdx) => (
                                                <div key={oIdx} className="flex items-center gap-2 cursor-pointer">
                                                    <div className="w-3 h-3 border border-zinc-400 rounded-full"></div>
                                                    <span className="text-[10px] font-medium leading-tight"><EditableText value={opt} tag="span" /></span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {q.type === 'true-false' && (
                                        <div className="flex gap-4 pl-6 mt-1">
                                            <label className="flex items-center gap-1 cursor-pointer"><div className="w-3 h-3 border border-zinc-400 rounded-full"></div> <span className="text-[10px] font-bold text-green-600">DOĞRU</span></label>
                                            <label className="flex items-center gap-1 cursor-pointer"><div className="w-3 h-3 border border-zinc-400 rounded-full"></div> <span className="text-[10px] font-bold text-red-600">YANLIŞ</span></label>
                                        </div>
                                    )}
                                    {q.type === 'open-ended' && (
                                        <div className="mt-1 pl-6 space-y-1"><div className="w-full border-b border-zinc-300 border-dashed h-4"></div><div className="w-full border-b border-zinc-300 border-dashed h-4"></div></div>
                                    )}
                                </EditableElement>
                            ))}
                        </div>
                    )}
                </div>

                {data.creativeTask && (
                    <div className="w-full md:w-1/3 bg-white rounded-2xl border-2 border-indigo-100 p-4 shadow-sm flex flex-col break-inside-avoid">
                        <h4 className="font-black text-indigo-400 uppercase text-xs mb-3 flex items-center gap-2"><i className="fa-solid fa-paintbrush"></i> Yaratıcı Görev</h4>
                        <div className="mb-2 text-xs font-bold text-indigo-900"><EditableText value={data.creativeTask} tag="span" /></div>
                        <div className="flex-1 border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 min-h-[150px] relative group cursor-crosshair">
                            <div className="absolute inset-0 flex items-center justify-center text-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"><i className="fa-solid fa-pencil text-3xl"></i></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 2. STORY CREATION PROMPT (HİKAYE YAZMA) ---
export const StoryCreationPromptSheet: React.FC<{ data: StoryCreationPromptData }> = ({ data }) => (
    <div className="flex flex-col h-full space-y-6">
        <PedagogicalHeader title={data.title} instruction={data.instruction || "İpuçlarını kullanarak kendi hikayeni yaz."} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'KAHRAMAN', val: data.structureHints?.who, icon: 'fa-user', bg: 'bg-blue-50 border-blue-200' },
                { label: 'YER', val: data.structureHints?.where, icon: 'fa-map-pin', bg: 'bg-green-50 border-green-200' },
                { label: 'ZAMAN', val: data.structureHints?.when, icon: 'fa-clock', bg: 'bg-amber-50 border-amber-200' },
                { label: 'OLAY', val: data.structureHints?.problem, icon: 'fa-triangle-exclamation', bg: 'bg-red-50 border-red-200' },
            ].map((h, i) => (
                <EditableElement key={i} className={`${h.bg} border-2 rounded-xl p-3 flex flex-col`}>
                    <div className="flex items-center gap-2 opacity-60 text-[10px] font-black uppercase tracking-widest mb-1">
                        <i className={`fa-solid ${h.icon}`}></i> {h.label}
                    </div>
                    <div className="text-sm font-bold"><EditableText value={h.val} tag="span" /></div>
                </EditableElement>
            ))}
        </div>

        <EditableElement className="bg-zinc-100 p-4 rounded-xl border border-zinc-200">
            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">Anahtar Kelimeler</h4>
            <div className="flex flex-wrap gap-2">
                {(data.keywords || []).map((k, i) => (
                    <span key={i} className="px-3 py-1 bg-white border border-zinc-300 rounded-lg text-sm font-medium shadow-sm"><EditableText value={k} tag="span" /></span>
                ))}
            </div>
        </EditableElement>

        <EditableElement className="flex-1 bg-white border-2 border-zinc-200 rounded-2xl p-8 shadow-inner relative notebook-lines">
            <style>{`.notebook-lines { background-image: linear-gradient(transparent 95%, #e4e4e7 95%); background-size: 100% 2rem; line-height: 2rem; }`}</style>
            <h3 className="text-center font-bold text-xl mb-8 text-zinc-400 font-dyslexic uppercase tracking-widest">HİKAYEM</h3>
            <div className="h-full w-full outline-none font-dyslexic text-lg text-zinc-800" contentEditable suppressContentEditableWarning></div>
        </EditableElement>
    </div>
);

// --- 3. WORDS IN STORY (KELİME ANALİZİ) ---
export const WordsInStorySheet: React.FC<{ data: WordsInStoryData }> = ({ data }) => (
    <div className="flex flex-col h-full space-y-6">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="bg-white p-6 rounded-2xl border-2 border-zinc-100 shadow-sm">
            <div className="prose max-w-none text-base leading-relaxed text-zinc-700 text-justify font-dyslexic">
                <EditableText value={data.story} tag="div" />
            </div>
        </EditableElement>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar">
            {(data.vocabWork || []).map((item, i) => (
                <EditableElement key={i} className="bg-white p-4 rounded-xl border-2 border-zinc-200 shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                        <span className="text-lg font-black text-indigo-600"><EditableText value={item.word} tag="span" /></span>
                        <span className="text-[10px] bg-zinc-100 px-2 py-1 rounded text-zinc-500 uppercase font-bold">Anlamı</span>
                    </div>
                    <p className="text-xs text-zinc-500 italic"><EditableText value={item.contextQuestion} tag="span" /></p>
                    <div className="flex-1 border-2 border-dashed border-zinc-300 bg-zinc-50 rounded-lg min-h-[60px]"></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

// --- 4. STORY ANALYSIS (HİKAYE HARİTASI) ---
export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => (
    <div className="flex flex-col h-full space-y-6">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm italic text-amber-900 max-h-40 overflow-y-auto">
            <EditableText value={data.story} tag="p" />
        </EditableElement>

        <div className="flex-1 relative bg-white rounded-3xl border-2 border-zinc-200 shadow-xl p-8">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center text-white text-center font-bold z-10 shadow-2xl border-4 border-white">
                ANA FİKİR
            </div>
            
            <div className="grid grid-cols-2 h-full gap-16">
                {[
                    { t: 'KARAKTERLER', v: data.storyMap?.characters, c: 'bg-blue-50 border-blue-200 text-blue-800' },
                    { t: 'YER / ZAMAN', v: data.storyMap?.setting, c: 'bg-green-50 border-green-200 text-green-800' },
                    { t: 'SORUN', v: data.storyMap?.problem, c: 'bg-red-50 border-red-200 text-red-800' },
                    { t: 'ÇÖZÜM', v: data.storyMap?.solution, c: 'bg-purple-50 border-purple-200 text-purple-800' }
                ].map((box, i) => (
                    <EditableElement key={i} className={`${box.c} border-2 rounded-2xl p-4 flex flex-col relative`}>
                        <h4 className="font-black text-xs uppercase tracking-widest mb-2 border-b border-black/10 pb-1">{box.t}</h4>
                        <div className="flex-1 font-medium text-sm"><EditableText value={box.v} tag="span" /></div>
                    </EditableElement>
                ))}
            </div>
            
            {/* Connecting Lines (CSS) */}
            <svg className="absolute inset-0 pointer-events-none z-0">
                <line x1="50%" y1="50%" x2="25%" y2="25%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="50%" y1="50%" x2="75%" y2="25%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="50%" y1="50%" x2="25%" y2="75%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="5,5" />
                <line x1="50%" y1="50%" x2="75%" y2="75%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="5,5" />
            </svg>
        </div>
    </div>
);

// --- 5. STORY SEQUENCING (SIRALAMA) ---
export const StorySequencingSheet: React.FC<{ data: StorySequencingData }> = ({ data }) => (
    <div className="flex flex-col h-full space-y-6">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
            {(data.panels || []).map((panel, i) => (
                <EditableElement key={i} className="flex flex-col border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden group">
                    <div className="aspect-video bg-zinc-100 border-b-2 border-black relative">
                         <ImageDisplay prompt={panel.imagePrompt} description={panel.description} className="w-full h-full object-cover" />
                         <div className="absolute top-2 right-2 w-8 h-8 bg-white border-2 border-black rounded-full flex items-center justify-center font-bold text-xl">?</div>
                    </div>
                    <div className="p-4 flex-1 flex items-center justify-center text-center">
                        <p className="font-bold text-sm"><EditableText value={panel.description} tag="span" /></p>
                    </div>
                </EditableElement>
            ))}
        </div>

        <EditableElement className="bg-zinc-100 p-4 rounded-xl border border-zinc-300 text-center">
            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-4">Sıralama Alanı</h4>
            <div className="flex justify-center gap-4">
                {Array.from({length: (data.panels || []).length}).map((_, i) => (
                    <div key={i} className="flex items-center">
                        <div className="w-16 h-16 bg-white border-2 border-dashed border-zinc-400 rounded-xl flex items-center justify-center text-2xl font-bold text-zinc-300">
                            {i + 1}
                        </div>
                        {i < (data.panels || []).length - 1 && <i className="fa-solid fa-arrow-right mx-2 text-zinc-300"></i>}
                    </div>
                ))}
            </div>
        </EditableElement>
    </div>
);

// --- 6. MISSING PARTS (BOŞLUK DOLDURMA) ---
export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => (
    <div className="flex flex-col h-full space-y-6">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 text-center">
            <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4">Kelime Bankası</h4>
            <div className="flex flex-wrap justify-center gap-3">
                {(data.wordBank || []).map((word, i) => (
                    <span key={i} className="px-4 py-2 bg-white border border-indigo-200 rounded-lg shadow-sm font-bold text-indigo-700 cursor-move hover:scale-105 transition-transform"><EditableText value={word} tag="span" /></span>
                ))}
            </div>
        </EditableElement>

        <EditableElement className="flex-1 bg-white p-8 rounded-2xl border-2 border-zinc-200 shadow-sm leading-[3rem] text-xl font-dyslexic text-zinc-800 text-justify">
            {(data.storyWithBlanks || []).map((part, i) => (
                <React.Fragment key={i}>
                    <span><EditableText value={part} tag="span" /></span>
                    {i < (data.storyWithBlanks || []).length - 1 && (
                        <span className="inline-block w-32 border-b-2 border-black mx-2 bg-zinc-100/50"></span>
                    )}
                </React.Fragment>
            ))}
        </EditableElement>
    </div>
);

// Fallbacks for compatibility
export const ProverbFillSheet = MissingPartsSheet as any;
export const ProverbSayingSortSheet = StoryComprehensionSheet as any; 
export const ProverbWordChainSheet = StorySequencingSheet as any; 
export const ProverbSentenceFinderSheet = StorySequencingSheet as any;
export const ProverbSearchSheet = StoryComprehensionSheet as any;
