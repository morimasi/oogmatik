
import React from 'react';
import { 
    StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData, MissingPartsData, InteractiveStoryData, ReadingStroopData, SynonymAntonymMatchData, ReadingSudokuData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, ReadingRuler, StoryHighlighter, QUESTION_TYPES } from '../common';
import { EditableElement, EditableText } from '../Editable';

const PrintQuestionBlock = ({ title, questions, type, icon }: { title: string, questions: any[], type: string, icon?: string }) => {
    if (!questions || questions.length === 0) return null;
    return (
        <div className="mb-8 break-inside-avoid">
            <div className="flex items-center gap-2 mb-4 border-b-2 border-zinc-800 pb-1">
                {icon && <i className={`fa-solid ${icon} text-indigo-500`}></i>}
                <h4 className="font-black text-black uppercase text-sm">{title}</h4>
            </div>
            <div className="space-y-4">
                {questions.map((q, i) => (
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
                                        <span className="text-[8px] font-bold text-zinc-400">DOĞRU</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-0.5">
                                        <div className="w-8 h-8 rounded-lg border-2 border-rose-500 bg-white flex items-center justify-center font-black text-rose-500 text-xs shadow-sm">Y</div>
                                        <span className="text-[8px] font-bold text-zinc-400">YANLIŞ</span>
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
                                                <span className="inline-block min-w-[80px] border-b-2 border-dashed border-indigo-400 mx-1 px-2 text-transparent select-none bg-indigo-100/50 rounded-t">..........</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </p>
                            </div>
                        ) : type === 'logic' ? (
                            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-amber-700">
                                    <i className="fa-solid fa-lightbulb"></i>
                                    <span className="text-[10px] font-black uppercase">Mantık Muhakeme</span>
                                </div>
                                <p className="font-bold mb-3">{q.question}</p>
                                <div className="space-y-2">
                                    <div className="h-6 border-b border-amber-200"></div>
                                    <div className="h-6 border-b border-amber-200"></div>
                                </div>
                                {q.hint && <p className="mt-3 text-[10px] text-amber-600/70 italic"><i className="fa-solid fa-info-circle"></i> İpucu: {q.hint}</p>}
                            </div>
                        ) : (
                            <div>
                                <p className="font-bold mb-2">{i + 1}. {q.question}</p>
                                {type === 'multiple-choice' && (
                                    <div className="grid grid-cols-1 gap-2 ml-4">
                                        {q.options.map((opt: string, k: number) => (
                                            <div key={k} className="flex items-center gap-3 group">
                                                <div className="w-5 h-5 border-2 border-zinc-300 rounded-full group-hover:border-indigo-500 transition-colors"></div>
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

export const ReadingSudokuSheet: React.FC<{ data: ReadingSudokuData }> = ({ data }) => {
    const size = data.settings.size || 4;
    const isBig = size > 4;

    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black relative">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex flex-col md:flex-row gap-10 items-center justify-center mt-10 flex-1">
                {/* Sudoku Tablosu */}
                <div className={`border-[4px] border-black bg-black shadow-xl rounded-lg overflow-hidden`}>
                    <table className="border-collapse bg-white">
                        <tbody>
                            {data.grid.map((row, rIdx) => (
                                <tr key={rIdx}>
                                    {row.map((cell, cIdx) => {
                                        const isRightEdge = (cIdx + 1) % (size === 4 ? 2 : 3) === 0 && cIdx !== size - 1;
                                        const isBottomEdge = (rIdx + 1) % (size === 9 ? 3 : 2) === 0 && rIdx !== size - 1;
                                        
                                        return (
                                            <td 
                                                key={cIdx} 
                                                className={`
                                                    border border-zinc-300 text-center relative
                                                    ${isBig ? 'w-12 h-12 text-sm' : 'w-20 h-20 text-2xl'}
                                                    ${isRightEdge ? 'border-r-[4px] border-r-black' : ''}
                                                    ${isBottomEdge ? 'border-b-[4px] border-b-black' : ''}
                                                `}
                                                style={{ fontFamily: data.settings.fontFamily }}
                                            >
                                                {cell ? (
                                                    <span className="font-black text-zinc-900 drop-shadow-sm">
                                                        <EditableText value={cell} tag="span" />
                                                    </span>
                                                ) : (
                                                    <div className="absolute inset-0 bg-zinc-50/30 flex items-center justify-center opacity-20">
                                                        <i className="fa-solid fa-pen-nib text-xs"></i>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Sembol Bankası (Kes-Yapıştır veya Referans İçin) */}
                <div className="w-full md:w-48 space-y-6">
                    <div className="p-4 bg-zinc-900 text-white rounded-3xl shadow-lg border-2 border-white">
                        <h5 className="text-[10px] font-black uppercase tracking-widest mb-4 text-indigo-400 text-center">SEMBOL HAVUZU</h5>
                        <div className={`grid ${size === 4 ? 'grid-cols-2' : 'grid-cols-3'} gap-3`}>
                            {data.symbols.map((sym, idx) => (
                                <div key={idx} className="aspect-square bg-white rounded-xl flex items-center justify-center border-2 border-zinc-700 shadow-inner group transition-transform hover:scale-110">
                                    {sym.imagePrompt ? (
                                        <div className="w-full h-full p-1"><ImageDisplay prompt={sym.imagePrompt} className="w-full h-full" /></div>
                                    ) : (
                                        <span className="text-zinc-900 font-black text-base">{sym.value}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="p-4 border-2 border-dashed border-zinc-200 rounded-2xl bg-zinc-50/50">
                        <p className="text-[9px] font-bold text-zinc-400 text-center leading-tight">
                            İPUCU: Her satırda ve sütunda tüm semboller sadece bir kez bulunmalı.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8 flex justify-between items-center text-[7px] font-black text-zinc-300 uppercase tracking-[0.4em]">
                <span>Bursa Disleksi AI • Bilişsel Mantık Laboratuvarı</span>
                <div className="flex gap-4">
                     <i className="fa-solid fa-puzzle-piece"></i>
                     <i className="fa-solid fa-brain"></i>
                </div>
            </div>
        </div>
    );
};

export const SynonymAntonymMatchSheet: React.FC<{ data: SynonymAntonymMatchData }> = ({ data }) => {
    const shuffledTargets = [...data.pairs].sort(() => Math.random() - 0.5);

    return (
        <div className="flex flex-col h-full bg-white font-lexend text-black relative">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            {/* Eşleştirme Alanı */}
            <div className="grid grid-cols-2 gap-x-20 gap-y-6 mt-6 pb-8 border-b-2 border-zinc-100">
                <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4">KELİMELER</h5>
                    {data.pairs.map((pair, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 border-2 border-zinc-800 rounded-2xl bg-zinc-50 relative group">
                            <span className="font-black text-lg uppercase"><EditableText value={pair.source} tag="span" /></span>
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-800 bg-white absolute -right-2 top-1/2 -translate-y-1/2 group-hover:bg-indigo-500 transition-colors"></div>
                        </div>
                    ))}
                </div>
                <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4">ANLAMLAR</h5>
                    {shuffledTargets.map((pair, idx) => (
                        <div key={idx} className="flex items-center justify-start p-3 border-2 border-zinc-200 border-dashed rounded-2xl bg-white relative group hover:border-emerald-500 transition-all">
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-200 bg-white absolute -left-2 top-1/2 -translate-y-1/2 group-hover:bg-emerald-500 group-hover:border-emerald-500 transition-colors"></div>
                            <span className="font-bold text-lg uppercase ml-4 text-zinc-500 group-hover:text-zinc-900"><EditableText value={pair.target} tag="span" /></span>
                            <span className="ml-auto text-[8px] font-black text-zinc-300 uppercase">{pair.type === 'synonym' ? 'Eş' : 'Zıt'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cümle Tamamlama Alanı */}
            <div className="mt-8 space-y-6">
                <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">BAĞLAMDA KULLANIM</h5>
                {data.sentences.map((sent, idx) => (
                    <EditableElement key={idx} className="p-4 bg-indigo-50/30 border-l-4 border-indigo-500 rounded-r-2xl">
                         <p className="text-lg leading-relaxed italic text-zinc-800">
                             {sent.text.split('_______').map((part, i, arr) => (
                                 <React.Fragment key={i}>
                                     {part}
                                     {i < arr.length - 1 && (
                                         <span className="inline-block min-w-[120px] border-b-2 border-dashed border-indigo-400 mx-1 px-2 text-transparent select-none bg-white/50 rounded-t">..........</span>
                                     )}
                                 </React.Fragment>
                             ))}
                         </p>
                         <div className="mt-2 flex items-center gap-2">
                             <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded uppercase">
                                 {sent.type === 'synonym' ? 'Eş Anlam' : 'Zıt Anlam'}
                             </span>
                             <span className="text-[10px] text-zinc-400">Hedef: {sent.word}</span>
                         </div>
                    </EditableElement>
                ))}
            </div>

            <div className="mt-auto pt-8 flex justify-between items-center text-[7px] font-black text-zinc-300 uppercase tracking-[0.4em]">
                <span>Bursa Disleksi AI • Semantik İlişkilendirme Atölyesi</span>
                <div className="flex gap-4">
                     <i className="fa-solid fa-spell-check"></i>
                     <i className="fa-solid fa-brain"></i>
                </div>
            </div>
        </div>
    );
};

export const ReadingStroopSheet: React.FC<{ data: ReadingStroopData }> = ({ data }) => {
    const { cols, fontSize } = data.settings;

    return (
        <div className="flex flex-col h-full w-full bg-white font-lexend text-black relative">
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div 
                className="flex-1 w-full grid gap-y-12 gap-x-4 mt-8 content-start"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
                {(data.grid || []).map((item, idx) => (
                    <EditableElement key={idx} className="flex justify-center items-center">
                        <span 
                            className="font-black tracking-widest uppercase text-center"
                            style={{ color: item.color, fontSize: `${fontSize}px` }}
                        >
                            <EditableText value={item.text} tag="span" />
                        </span>
                    </EditableElement>
                ))}
            </div>

            {data.evaluationBox && (
                <div className="mt-auto pt-8 border-t-4 border-zinc-900 break-inside-avoid">
                    <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="p-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">SÜRE</h5>
                            <div className="h-8 border-b border-zinc-300 border-dashed"></div>
                        </div>
                        <div className="p-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">HATA SAYISI</h5>
                            <div className="h-8 border-b border-zinc-300 border-dashed"></div>
                        </div>
                        <div className="p-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl">
                            <h5 className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">DÜZELTME</h5>
                            <div className="h-8 border-b border-zinc-300 border-dashed"></div>
                        </div>
                        <div className="p-3 bg-indigo-600 text-white border-2 border-indigo-700 rounded-xl shadow-lg">
                            <h5 className="text-[10px] font-black opacity-80 uppercase mb-2 tracking-widest">PUAN</h5>
                            <div className="h-8 border-b border-indigo-400 border-dashed"></div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-black text-zinc-300 uppercase tracking-[0.4em]">
                        <span>Bursa Disleksi AI • Bilişsel Performans Analizi</span>
                        <span>Uzman Gözlemi Gerekir</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export const StoryComprehensionSheet: React.FC<{ data: InteractiveStoryData }> = ({ data }) => {
    return (
        <div className="flex flex-col h-full bg-white relative">
            <ReadingRuler />
            <div className="shrink-0 mb-6 flex justify-between items-start border-b-4 border-zinc-900 pb-4">
                <div className="flex-1">
                    <PedagogicalHeader title={data.title} instruction={data.instruction || "Hikayeyi en az 3 kez oku."} note={data.pedagogicalNote} />
                </div>
                <div className="flex flex-col items-center ml-6 bg-zinc-900 text-white p-3 rounded-2xl shadow-lg">
                    <span className="text-[9px] font-black uppercase tracking-widest mb-2 opacity-60">Takipçi</span>
                    <div className="flex gap-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center cursor-pointer hover:bg-yellow-400 hover:text-black hover:border-black transition-all">
                                <i className="fa-solid fa-star"></i>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-8 mb-10 min-h-[400px]">
                <div className="flex-1 bg-white p-8 rounded-[2rem] border-2 border-zinc-100 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
                    <div className="prose max-w-none font-dyslexic text-xl leading-[2.2] text-zinc-800 text-justify">
                        <StoryHighlighter text={data.story} highlights={(data.fiveW1H || []).map(q => ({ text: q.answer, type: q.type }))} />
                    </div>
                </div>
                {data.imagePrompt && (
                    <div className="w-1/3 bg-zinc-50 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden relative group shrink-0 hidden md:block">
                        <ImageDisplay prompt={data.imagePrompt} description={data.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 group-hover:opacity-0 transition-opacity"></div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-8">
                    <PrintQuestionBlock title="5N 1K Analizi" questions={data.fiveW1H} type="open" icon="fa-magnifying-glass" />
                    <PrintQuestionBlock title="Kelime Avı (Sözlükçe)" questions={data.vocabulary?.map(v => ({ question: `${v.word}: ${v.definition}` })) || []} type="list" icon="fa-spell-check" />
                    <PrintQuestionBlock title="Yaratıcı Görev" questions={data.creativeTask ? [{ question: data.creativeTask }] : []} type="logic" icon="fa-paintbrush" />
                </div>
                <div className="space-y-8">
                    <PrintQuestionBlock title="Doğru mu Yanlış mı?" questions={data.trueFalse} type="true-false" icon="fa-check-double" />
                    <PrintQuestionBlock title="Boşlukları Doldur" questions={data.fillBlanks} type="fill" icon="fa-pen-clip" />
                    <PrintQuestionBlock title="Test Soruları" questions={data.multipleChoice} type="multiple-choice" icon="fa-list-ol" />
                    <PrintQuestionBlock title="Mantık & Çıkarım" questions={[...(data.inferenceQuestions || []), ...(data.logicQuestions || [])]} type="logic" icon="fa-brain" />
                </div>
            </div>
        </div>
    );
};

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => (
    <div className="space-y-6">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="p-6 bg-amber-50 rounded-2xl border-2 border-amber-200 italic font-dyslexic text-lg leading-relaxed shadow-inner">
            <EditableText value={data.story} tag="div" />
        </div>
        <div className="grid grid-cols-2 gap-4 h-[400px]">
            {/* Fix: Added explicit type casting to resolve 'unknown' type errors */}
            {Object.entries(data.storyMap || {}).map(([key, value]: [string, any], i) => (
                <div key={i} className="p-5 border-2 border-zinc-200 rounded-3xl bg-white shadow-sm flex flex-col">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">{key}</span>
                    <p className="font-bold text-zinc-700 flex-1"><EditableText value={value} tag="span" /></p>
                    <div className="h-px bg-zinc-100 mt-2"></div>
                </div>
            ))}
        </div>
    </div>
);

export const StoryCreationPromptSheet: React.FC<{ data: StoryCreationPromptData }> = ({ data }) => (
    <div className="space-y-8">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="p-8 bg-indigo-50 rounded-[2.5rem] border-2 border-indigo-100 shadow-inner">
            <h4 className="text-xs font-black uppercase text-indigo-400 mb-4 tracking-widest">Hikaye Başlangıcı / İpucu</h4>
            <p className="text-xl font-bold leading-relaxed font-dyslexic text-zinc-800"><EditableText value={data.prompt} tag="span" /></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <h4 className="font-black text-sm uppercase border-b-2 border-zinc-800 pb-1">Anahtar Kelimeler</h4>
                <div className="flex flex-wrap gap-3">
                    {(data.keywords || []).map((word, i) => (
                        <span key={i} className="px-4 py-2 bg-white border-2 border-zinc-800 rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <EditableText value={word} tag="span" />
                        </span>
                    ))}
                </div>
            </div>
            
            <div className="space-y-4">
                <h4 className="font-black text-sm uppercase border-b-2 border-zinc-800 pb-1">Kurgu Taslağı</h4>
                <div className="space-y-4">
                    {/* Fix: Added explicit type casting to resolve 'unknown' type errors */}
                    {Object.entries(data.structureHints || {}).map(([key, value]: [string, any], i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="w-20 text-[10px] font-black uppercase text-zinc-400">{key}</span>
                            <div className="flex-1 border-b-2 border-zinc-200 py-1 font-bold italic text-zinc-600">
                                <EditableText value={value} tag="span" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        <div className="mt-12">
            <h4 className="font-black text-sm uppercase mb-4">Senin Hikayen</h4>
            <div className="h-[400px] border-2 border-zinc-200 rounded-3xl bg-white p-8 relative shadow-sm">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: 'linear-gradient(transparent 95%, #000 95%)', backgroundSize: '100% 2rem'}}></div>
                <p className="text-xs text-zinc-300 font-bold uppercase absolute bottom-4 right-8">Yazma Alanı</p>
            </div>
        </div>
    </div>
);

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => (
    <div className="space-y-8">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="bg-zinc-100 p-6 rounded-3xl border-2 border-dashed border-zinc-300 text-center">
             <div className="flex flex-wrap justify-center gap-3">
                 {(data.wordBank || []).map((w, i) => (
                     <span key={i} className="px-4 py-2 bg-white border-2 border-zinc-800 rounded-xl font-bold shadow-sm">{w}</span>
                 ))}
             </div>
        </div>
        <div className="p-10 bg-white border-2 border-zinc-100 rounded-[3rem] shadow-xl text-2xl leading-[2.5] font-dyslexic text-zinc-800">
             {(data.storyWithBlanks || []).map((part, i) => (
                 <React.Fragment key={i}>
                     {part}
                     {i < (data.storyWithBlanks || []).length - 1 && (
                         <span className="inline-block w-40 border-b-4 border-zinc-800 mx-2 bg-zinc-50 rounded-t h-8"></span>
                     )}
                 </React.Fragment>
             ))}
        </div>
    </div>
);
