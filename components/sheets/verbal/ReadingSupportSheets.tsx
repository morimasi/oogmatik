import React from 'react';
import {
    ReadingFlowData, PhonologicalAwarenessData, SyllableTrainData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, HandwritingPracticeData, LetterDiscriminationData, RapidNamingData, MirrorLettersData, VisualTrackingLineData
} from '../../../types';
import { PedagogicalHeader, HandwritingGuide, TracingText, ImageDisplay, GridComponent } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ReadingFlowSheet = ({ data }: { data: ReadingFlowData }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction="Metni önce heceleyerek, sonra akıcı bir şekilde oku." note={data.pedagogicalNote} />
        <div className="mt-10 print:mt-3 p-12 print:p-3 print:p-4 print:p-1 bg-zinc-50 border-4 border-zinc-100 rounded-[3.5rem] shadow-inner flex-1 flex flex-col justify-center">
            {(data.text?.paragraphs || []).map((p, pIdx) => (
                <div key={pIdx} className="mb-8 print:mb-2 last:mb-0">
                    {(p.sentences || []).map((s, sIdx) => (
                        <p key={sIdx} className="text-3xl leading-[2.5] font-dyslexic text-zinc-800 text-justify tracking-wide mb-6 print:mb-2">
                            {(s.syllables || []).map((syl: { text: string }, sylIdx: number) => (
                                <span key={sylIdx} className="hover:bg-yellow-100 px-1 rounded transition-colors cursor-help border-b-2 border-zinc-200">{syl.text}</span>
                            ))}
                        </p>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const PhonologicalAwarenessSheet = ({ data }: { data: PhonologicalAwarenessData }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6 mt-8 print:mt-2">
            {(data.exercises || []).map((ex, i) => (
                <div key={i} className="p-8 print:p-2 print:p-3 bg-white border-[3px] border-zinc-900 rounded-[2.5rem] flex justify-between items-center group hover:bg-zinc-50 transition-all shadow-sm">
                    <div className="flex-1">
                        <p className="text-2xl font-black text-zinc-800 tracking-tight leading-none mb-3"><EditableText value={ex.question} tag="span" /></p>
                        <span className="text-xs font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">Kaynak: {ex.word}</span>
                    </div>
                    <div className="w-64 h-16 border-b-4 border-zinc-300 border-dotted bg-zinc-100/30 rounded-t-2xl"></div>
                </div>
            ))}
        </div>
    </div>
);

export const RapidNamingSheet = ({ data }: { data: RapidNamingData }) => {
    const settings = data.settings;
    const isRows = settings?.layout === 'rows';

    return (
        <div className="flex flex-col h-full  bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data.title || "HIZLI İSİMLENDİRME (RAN)"}
                instruction={data.instruction || "Öğeleri soldan sağa, mümkün olduğunca hızlı ve hatasız bir şekilde isimlendirin."}
                note={data.pedagogicalNote}
            />

            <div className={`mt-8 print:mt-2 flex-1 content-start ${isRows ? 'flex flex-col gap-6 print:gap-2' : 'grid grid-cols-1 gap-4 print:gap-1'}`}>
                {(data.grid || []).map((row, rIdx) => (
                    <div key={rIdx} className="flex justify-around items-center p-6 print:p-2 bg-zinc-50 border-2 border-zinc-100 rounded-[2.5rem] shadow-sm group hover:border-indigo-200 hover:bg-white transition-all">
                        {row.items.map((item, iIdx) => (
                            <div key={iIdx} className="flex flex-col items-center group/item cursor-pointer">
                                <div className="w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-zinc-100 group-hover/item:scale-110 group-hover/item:border-indigo-500 transition-all duration-300">
                                    <span className={`font-black text-zinc-900 ${item.value.length > 2 ? 'text-2xl' : 'text-4xl'}`}>
                                        <EditableText value={item.value} tag="span" />
                                    </span>
                                </div>
                                {item.label && (
                                    <span className="text-[8px] text-zinc-400 font-black mt-2 uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Klinik Hız Analiz Paneli */}
            <div className="mt-6 print:mt-2 p-6 print:p-2 bg-zinc-900 text-white rounded-[2.5rem] border-4 border-white shadow-2xl flex justify-between items-center mx-1">
                <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1">
                    <div className="flex flex-col">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">Hedef Hız (Öğe/Dakika)</span>
                        <span className="text-sm font-black italic">{data.clinicalMeta?.targetSpeed || '--'} bpm</span>
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-10">
                        <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">Gerekli Süre</span>
                        <span className="text-sm font-black">......... sn / ......... sn</span>
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-10">
                        <span className="text-[7px] font-black text-rose-400 uppercase tracking-widest mb-1">Hata Payı</span>
                        <span className="text-sm font-black">/ 50</span>
                    </div>
                </div>
                <div className="text-[8px] font-bold text-zinc-500 text-right opacity-60">
                    RAN HIZ PROTOKOLÜ v5.1
                </div>
            </div>
        </div>
    );
};

export const LetterDiscriminationSheet = ({ data }: { data: LetterDiscriminationData }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="mt-6 print:mt-2 text-center mb-8 print:mb-2">
            <div className="inline-flex gap-4 print:gap-1 p-4 print:p-1 bg-zinc-900 rounded-[2rem] border-4 border-white shadow-2xl">
                <span className="text-xs font-black text-indigo-400 self-center mr-2 uppercase tracking-widest">Hedefler:</span>
                {(data.targetLetters || []).map((l, i) => (
                    <span key={i} className="w-12 h-12 rounded-xl bg-white text-zinc-900 flex items-center justify-center font-black text-2xl shadow-inner">{l}</span>
                ))}
            </div>
        </div>
        <div className="flex-1 bg-white border-2 border-zinc-100 rounded-[3rem] p-10 print:p-3 print:p-4 print:p-1 font-mono text-3xl tracking-[0.6em] leading-[4rem] text-center select-none shadow-inner overflow-hidden">
            {(data.rows || []).map((row, i) => (
                <div key={i} className="mb-2 border-b border-zinc-50 pb-1 hover:bg-zinc-50 transition-colors">{row.letters.join('')}</div>
            ))}
        </div>
    </div>
);

export const MirrorLettersSheet = ({ data }: { data: MirrorLettersData }) => {
    const settings = data.settings;
    const isCompact = settings?.layout === 'compact';

    return (
        <div className="flex flex-col h-full  bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data.title || "AYNA HARFLER AYRIŞTIRMA"}
                instruction={data.instruction || `Hedef harf çiftini (${data.targetPair}) dikkatlice inceleyin ve farklı olanları işaretleyin.`}
                note={data.pedagogicalNote}
            />

            <div className="mt-8 print:mt-2 text-center mb-10 print:mb-3 print:mb-4 print:mb-1">
                <div className="inline-flex flex-col items-center p-6 print:p-2 bg-rose-600 text-white rounded-[2.5rem] shadow-2xl border-4 border-white ring-8 ring-rose-50 transform hover:-rotate-1 transition-transform">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-80">KRİTİK AYNA ÇİFTİ</span>
                    <span className="text-5xl font-black tracking-widest">{data.targetPair}</span>
                </div>
            </div>

            <div className={`space-y-4 flex-1 content-start ${isCompact ? 'grid grid-cols-2 gap-4 print:gap-1 space-y-0' : ''}`}>
                {(data.rows || []).map((row, i) => (
                    <div key={i} className="flex justify-around items-center p-8 print:p-2 print:p-3 border-2 border-zinc-100 rounded-[3rem] bg-zinc-50/50 group hover:bg-white hover:border-rose-200 transition-all shadow-sm break-inside-avoid relative">
                        <div className="absolute top-4 left-6 text-[8px] font-black text-zinc-300 uppercase tracking-widest">SET {i + 1}</div>
                        {row.items.map((item, j) => (
                            <div key={j} className="flex flex-col items-center gap-3">
                                <div
                                    className="text-6xl font-black text-zinc-900 transition-all duration-500 group-hover:scale-110 cursor-pointer select-none drop-shadow-sm"
                                    style={{ transform: `rotate(${item.rotation}deg) ${item.isMirrored ? 'scaleX(-1)' : ''}` }}
                                >
                                    {item.letter}
                                </div>
                                <div className="w-6 h-6 rounded-full border-2 border-zinc-200 flex items-center justify-center group-hover:border-rose-300">
                                    <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-rose-50"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Klinik Ayrıştırma Paneli */}
            {settings?.showClinicalNotes && data.clinicalMeta && (
                <div className="mt-6 print:mt-2 p-6 print:p-2 bg-zinc-900 text-white rounded-[2.5rem] border-4 border-white shadow-2xl flex justify-between items-center mx-1">
                    <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-rose-400 uppercase tracking-widest mb-1">Reversal Olasılığı</span>
                            <span className="text-sm font-black text-white">%{Math.round(data.clinicalMeta.reversalProbability * 100)}</span>
                        </div>
                        <div className="flex flex-col border-l border-white/10 pl-10">
                            <span className="text-[7px] font-black text-rose-400 uppercase tracking-widest mb-1">Ayrıştırma Karmaşıklığı</span>
                            <span className="text-sm font-black text-white">{data.clinicalMeta.discriminationComplexity}/10</span>
                        </div>
                    </div>
                    <div className="text-[8px] font-bold text-zinc-500 text-right opacity-60">
                        VİZÜEL AYRIŞTIRMA PROTOKOLÜ v2.0
                    </div>
                </div>
            )}
        </div>
    );
};

export const SyllableTrainSheet = ({ data }: { data: SyllableTrainData }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction="Heceleri birleştirerek lokomotifin arkasındaki vagonları tamamla." note={data.pedagogicalNote} />
        <div className="space-y-12 mt-10 print:mt-3 flex-1 content-start">
            {(data.trains || []).map((train, i) => (
                <div key={i} className="flex items-center gap-3 overflow-x-auto pb-6 print:pb-2 scrollbar-hide break-inside-avoid">
                    <div className="w-24 h-20 bg-zinc-900 rounded-l-[2rem] rounded-r-xl flex items-center justify-center text-white text-3xl shrink-0 shadow-2xl border-r-8 border-indigo-500">
                        <i className="fa-solid fa-train-subway"></i>
                    </div>
                    {train.syllables.map((syl, j) => (
                        <div key={j} className="flex items-center gap-2 shrink-0">
                            <div className="w-24 h-20 bg-white border-[3px] border-zinc-900 rounded-2xl flex items-center justify-center font-black text-2xl shadow-md group hover:border-indigo-500 transition-colors">
                                <EditableText value={syl} tag="span" />
                            </div>
                            {j < train.syllables.length - 1 && <div className="w-8 h-2 bg-zinc-300 rounded-full"></div>}
                        </div>
                    ))}
                    <div className="w-16 h-20 border-2 border-dashed border-zinc-200 rounded-r-2xl shrink-0 flex items-center justify-center text-zinc-200 font-bold text-xs uppercase">BİTİŞ</div>
                </div>
            ))}
        </div>
    </div>
);

export const VisualTrackingLinesSheet = ({ data }: { data: VisualTrackingLineData }) => {
    const settings = data.settings;

    return (
        <div className="flex flex-col h-full  bg-white font-sans text-black overflow-visible professional-worksheet">
            <PedagogicalHeader
                title={data.title || "GÖRSEL İZLEME MATRİSİ"}
                instruction={data.instruction || "Çizgileri gözünüzle takip edin ve başlangıçtaki harf/sayı ile bitişteki kutucuğu eşleştirin."}
                note={data.pedagogicalNote}
            />

            <div className="mt-8 print:mt-2 flex-1 relative bg-zinc-50 border-4 border-zinc-100 rounded-[4rem] p-10 print:p-3 print:p-4 print:p-1 shadow-inner group overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '40px 40px' }}></div>

                <svg viewBox={`0 0 ${data.width} ${data.height}`} className="w-full h-full  overflow-visible drop-shadow-md">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {(data.paths || []).map((path) => (
                        <g key={path.id} className="group/path">
                            <path
                                d={path.d}
                                fill="none"
                                stroke={path.color}
                                strokeWidth={path.strokeWidth}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity="0.3"
                                className="group-hover/path:opacity-100 transition-opacity duration-500 cursor-pointer"
                                filter="url(#glow)"
                            />

                            {/* Start Node */}
                            <circle cx="35" cy={path.yStart} r="22" fill="white" stroke={path.color} strokeWidth="4" className="shadow-lg" />
                            <text x="35" y={path.yStart + 6} textAnchor="middle" fontSize="18" fontWeight="900" fill="black">{path.startLabel || path.id}</text>

                            {/* End Node Area */}
                            <rect
                                x={data.width - 65}
                                y={path.yEnd - 25}
                                width="50"
                                height="50"
                                rx="12"
                                fill="white"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                                strokeDasharray="6 4"
                                className="group-hover/path:border-indigo-500 transition-colors"
                            />
                        </g>
                    ))}
                </svg>
            </div>

            {/* Klinik Göz Takip Analiz Paneli */}
            {settings?.showClinicalNotes && data.clinicalMeta && (
                <div className="mt-6 print:mt-2 p-6 print:p-2 bg-zinc-900 text-white rounded-[2.5rem] border-4 border-white shadow-2xl flex justify-between items-center mx-1">
                    <div className="flex gap-10 print:gap-3 print:gap-4 print:gap-1 print:p-4 print:p-1">
                        <div className="flex flex-col">
                            <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">Perseptüal Yük</span>
                            <span className="text-sm font-black text-white">{data.clinicalMeta.perceptualLoad}/100</span>
                        </div>
                        <div className="flex flex-col border-l border-white/10 pl-10">
                            <span className="text-[7px] font-black text-indigo-400 uppercase tracking-widest mb-1">Görsel Tarama Verimi</span>
                            <span className="text-sm font-black text-white">%{Math.round(data.clinicalMeta.visualSearchEfficiency * 100)}</span>
                        </div>
                    </div>
                    <div className="text-[8px] font-bold text-zinc-500 text-right opacity-60">
                        OKÜLOMOTOR TAKİP PROTOKOLÜ v4.0
                    </div>
                </div>
            )}
        </div>
    );
};

export const BackwardSpellingSheet = ({ data }: { data: BackwardSpellingData }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction="Kelimeleri son harfinden başlayarak geriye doğru yaz." note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-2 print:gap-3 print:p-3 mt-10 print:mt-3 flex-1 content-start">
            {(data.items || []).map((item, i) => (
                <EditableElement key={i} className="p-8 print:p-2 print:p-3 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm flex flex-col gap-5 print:gap-1 group hover:border-indigo-500 transition-all break-inside-avoid">
                    <p className="text-3xl font-black text-zinc-900 text-center tracking-[0.3em] bg-zinc-50 py-6 print:py-2 rounded-[2rem] border-2 border-zinc-100 group-hover:bg-indigo-50/30 transition-colors">
                        <EditableText value={item.original} tag="span" />
                    </p>
                    <div className="h-14 border-b-4 border-zinc-300 border-dashed text-center flex items-center justify-center text-zinc-200 font-black text-xl uppercase tracking-widest italic">TERSİNE YAZ</div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const CodeReadingSheet = ({ data }: { data: CodeReadingData }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction="Sembollerin karşılığı olan harfleri kullanarak şifreli kelimeleri çöz." note={data.pedagogicalNote} />
        <div className="bg-zinc-900 p-8 print:p-2 print:p-3 rounded-[3.5rem] border-4 border-white shadow-2xl mb-12 print:mb-3 mt-6 print:mt-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 print:p-1 opacity-5 rotate-12"><i className="fa-solid fa-key text-[8rem]"></i></div>
            <h4 className="text-[11px] font-black uppercase text-indigo-400 mb-6 print:mb-2 tracking-[0.4em] flex items-center gap-3"><i className="fa-solid fa-lock-open"></i> ŞİFRE ANAHTARI</h4>
            <div className="flex flex-wrap gap-5 print:gap-1 justify-center relative z-10">
                {(data.keyMap || []).map((m, i) => (
                    <div key={i} className="flex flex-col items-center p-3 bg-white border-2 border-zinc-800 rounded-2xl shadow-xl min-w-[70px] transform hover:scale-110 transition-transform">
                        <span className="text-4xl mb-2" style={{ color: m.color }}>{m.symbol}</span>
                        <div className="w-full h-0.5 bg-zinc-100 mb-2"></div>
                        <span className="font-black text-2xl text-zinc-900 uppercase">{m.value}</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="space-y-10 flex-1 content-start">
            {(data.codesToSolve || []).map((code, i) => (
                <div key={i} className="flex items-center gap-6 print:gap-2 p-2 group break-inside-avoid">
                    <div className="flex gap-3">
                        {code.sequence.map((sym, j) => (
                            <div key={j} className="w-16 h-16 border-[3px] border-zinc-900 rounded-2xl flex items-center justify-center text-3xl bg-white shadow-lg group-hover:scale-105 transition-transform">{sym}</div>
                        ))}
                    </div>
                    <i className="fa-solid fa-arrow-right-long text-zinc-300 text-2xl"></i>
                    <div className="flex-1 h-16 border-b-4 border-zinc-900 border-dashed bg-zinc-50/50 rounded-t-2xl"></div>
                </div>
            ))}
        </div>
    </div>
);

export const AttentionToQuestionSheet = ({ data }: { data: AttentionToQuestionData }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 mt-6 print:mt-2 flex flex-col justify-center">
            {data.subType === 'letter-cancellation' && data.grid && (
                <div className="space-y-8">
                    <div className="flex gap-6 print:gap-2 justify-center">
                        <span className="text-xs font-black text-zinc-400 self-center uppercase tracking-widest">İptal Edilecekler:</span>
                        {data.targetChars?.map((c, i) => <span key={i} className="w-12 h-12 bg-rose-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-xl border-4 border-white">{c}</span>)}
                    </div>
                    <div className="border-[6px] border-zinc-900 rounded-[3.5rem] overflow-hidden shadow-2xl bg-white p-2">
                        <GridComponent grid={data.grid} cellClassName="w-12 h-12 text-2xl font-black font-mono border-zinc-100" />
                    </div>
                </div>
            )}
        </div>
    </div>
);

export const HandwritingPracticeSheet = ({ data }: { data: HandwritingPracticeData }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-16 mt-12 print:mt-3 flex-1">
            {(data.lines || []).map((line, i) => (
                <div key={i} className="flex gap-8 print:gap-2 print:gap-3 print:p-3 items-start break-inside-avoid group">
                    <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl shrink-0 group-hover:rotate-6 transition-transform">
                        {line.imagePrompt ? <ImageDisplay prompt={line.imagePrompt} className="w-full h-full  object-cover opacity-80" /> : <i className="fa-solid fa-feather-pointed text-white text-3xl"></i>}
                    </div>
                    <div className="flex-1 space-y-8">
                        <HandwritingGuide height={100}>
                            {line.type === 'trace' ? <TracingText text={line.text} fontSize="56px" /> : <span className="text-5xl font-handwriting opacity-80 pl-4">{line.text}</span>}
                        </HandwritingGuide>
                        <div className="opacity-20"><HandwritingGuide height={100} /></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);



