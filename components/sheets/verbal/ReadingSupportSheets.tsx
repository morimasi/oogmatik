import React from 'react';
import { 
    ReadingFlowData, PhonologicalAwarenessData, SyllableTrainData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, HandwritingPracticeData, LetterDiscriminationData, RapidNamingData, MirrorLettersData, VisualTrackingLineData
} from '../../../types';
import { PedagogicalHeader, HandwritingGuide, TracingText, ImageDisplay, GridComponent } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction="Metni önce heceleyerek, sonra akıcı bir şekilde oku." note={data.pedagogicalNote} />
        <div className="mt-10 p-12 bg-zinc-50 border-4 border-zinc-100 rounded-[3.5rem] shadow-inner flex-1 flex flex-col justify-center">
            {(data.text?.paragraphs || []).map((p, pIdx) => (
                <div key={pIdx} className="mb-8 last:mb-0">
                    {(p.sentences || []).map((s, sIdx) => (
                        <p key={sIdx} className="text-3xl leading-[2.5] font-dyslexic text-zinc-800 text-justify tracking-wide mb-6">
                            {(s.syllables || []).map((syl, sylIdx) => (
                                <span key={sylIdx} className="hover:bg-yellow-100 px-1 rounded transition-colors cursor-help border-b-2 border-zinc-200">{syl.text}</span>
                            ))}
                        </p>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6 mt-8">
            {(data.exercises || []).map((ex, i) => (
                <div key={i} className="p-8 bg-white border-[3px] border-zinc-900 rounded-[2.5rem] flex justify-between items-center group hover:bg-zinc-50 transition-all shadow-sm">
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

export const RapidNamingSheet: React.FC<{ data: RapidNamingData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 gap-8 mt-10 flex-1 content-start">
            {(data.grid || []).map((row, rIdx) => (
                <div key={rIdx} className="flex justify-around items-center p-8 bg-white border-[3px] border-zinc-900 rounded-[3rem] shadow-sm group hover:border-indigo-500 transition-all">
                    {row.items.map((item, iIdx) => (
                        <div key={iIdx} className="flex flex-col items-center group/item">
                            <span className="text-6xl transform group-hover/item:scale-125 transition-transform duration-300">{item.value}</span>
                            {item.label && <span className="text-[10px] text-zinc-400 font-black mt-3 uppercase tracking-widest">{item.label}</span>}
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <div className="mt-8 p-4 bg-zinc-900 text-white rounded-2xl flex justify-between items-center shadow-xl">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">RAN Klinik Analiz</span>
            <div className="flex gap-10">
                <span className="text-[10px] font-bold">Toplam Süre: ............</span>
                <span className="text-[10px] font-bold">Hata: ............</span>
            </div>
        </div>
    </div>
);

export const LetterDiscriminationSheet: React.FC<{ data: LetterDiscriminationData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="mt-6 text-center mb-8">
            <div className="inline-flex gap-4 p-4 bg-zinc-900 rounded-[2rem] border-4 border-white shadow-2xl">
                <span className="text-xs font-black text-indigo-400 self-center mr-2 uppercase tracking-widest">Hedefler:</span>
                {(data.targetLetters || []).map((l, i) => (
                    <span key={i} className="w-12 h-12 rounded-xl bg-white text-zinc-900 flex items-center justify-center font-black text-2xl shadow-inner">{l}</span>
                ))}
            </div>
        </div>
        <div className="flex-1 bg-white border-2 border-zinc-100 rounded-[3rem] p-10 font-mono text-3xl tracking-[0.6em] leading-[4rem] text-center select-none shadow-inner overflow-hidden">
            {(data.rows || []).map((row, i) => (
                <div key={i} className="mb-2 border-b border-zinc-50 pb-1 hover:bg-zinc-50 transition-colors">{row.letters.join('')}</div>
            ))}
        </div>
    </div>
);

export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="mt-6 text-center mb-10">
            <span className="px-12 py-4 bg-rose-600 text-white rounded-[2rem] font-black text-3xl shadow-2xl border-4 border-white ring-8 ring-rose-50 uppercase tracking-widest">AYNA ÇİFTİ: {data.targetPair}</span>
        </div>
        <div className="space-y-6 flex-1 content-start">
            {(data.rows || []).map((row, i) => (
                <div key={i} className="flex justify-around items-center p-8 border-[3px] border-zinc-900 rounded-[3rem] bg-white group hover:shadow-xl transition-all shadow-sm break-inside-avoid">
                    {row.items.map((item, j) => (
                        <div key={j} className="text-6xl font-black text-zinc-900 transition-transform duration-500 group-hover:scale-110" 
                            style={{ transform: `rotate(${item.rotation}deg) ${item.isMirrored ? 'scaleX(-1)' : ''}` }}>
                            {item.letter}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const SyllableTrainSheet: React.FC<{ data: SyllableTrainData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction="Heceleri birleştirerek lokomotifin arkasındaki vagonları tamamla." note={data.pedagogicalNote} />
        <div className="space-y-12 mt-10 flex-1 content-start">
            {(data.trains || []).map((train, i) => (
                <div key={i} className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide break-inside-avoid">
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

export const VisualTrackingLinesSheet: React.FC<{ data: VisualTrackingLineData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2 h-full">
        <PedagogicalHeader title={data.title} instruction="Çizgileri gözünle takip et ve harfleri eşleştir." note={data.pedagogicalNote} />
        <div className="mt-6 flex-1 relative bg-white border-4 border-zinc-900 rounded-[4rem] p-10 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
            <svg viewBox={`0 0 ${data.width} ${data.height}`} className="w-full h-full overflow-visible drop-shadow-sm">
                {(data.paths || []).map((path) => (
                    <g key={path.id}>
                        <path d={path.d} fill="none" stroke={path.color} strokeWidth={path.strokeWidth} strokeLinecap="round" opacity="0.4" className="hover:opacity-100 transition-opacity duration-500 cursor-help" />
                        <circle cx="30" cy={path.id * 60 + 30} r="18" fill="white" stroke={path.color} strokeWidth="3" />
                        <text x="30" y={path.id * 60 + 36} textAnchor="middle" fontSize="14" fontWeight="900" fill={path.color}>{path.startLabel || path.id}</text>
                        <circle cx={data.width - 30} cy={path.id * 50 + 80} r="22" fill="none" stroke="#e5e7eb" strokeDasharray="6 4" strokeWidth="2" />
                    </g>
                ))}
            </svg>
        </div>
    </div>
);

export const BackwardSpellingSheet: React.FC<{ data: BackwardSpellingData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction="Kelimeleri son harfinden başlayarak geriye doğru yaz." note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 flex-1 content-start">
            {(data.items || []).map((item, i) => (
                <EditableElement key={i} className="p-8 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm flex flex-col gap-5 group hover:border-indigo-500 transition-all break-inside-avoid">
                    <p className="text-3xl font-black text-zinc-900 text-center tracking-[0.3em] bg-zinc-50 py-6 rounded-[2rem] border-2 border-zinc-100 group-hover:bg-indigo-50/30 transition-colors">
                        <EditableText value={item.original} tag="span" />
                    </p>
                    <div className="h-14 border-b-4 border-zinc-300 border-dashed text-center flex items-center justify-center text-zinc-200 font-black text-xl uppercase tracking-widest italic">TERSİNE YAZ</div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const CodeReadingSheet: React.FC<{ data: CodeReadingData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction="Sembollerin karşılığı olan harfleri kullanarak şifreli kelimeleri çöz." note={data.pedagogicalNote} />
        <div className="bg-zinc-900 p-8 rounded-[3.5rem] border-4 border-white shadow-2xl mb-12 mt-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12"><i className="fa-solid fa-key text-[8rem]"></i></div>
            <h4 className="text-[11px] font-black uppercase text-indigo-400 mb-6 tracking-[0.4em] flex items-center gap-3"><i className="fa-solid fa-lock-open"></i> ŞİFRE ANAHTARI</h4>
            <div className="flex flex-wrap gap-5 justify-center relative z-10">
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
                <div key={i} className="flex items-center gap-6 p-2 group break-inside-avoid">
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

export const AttentionToQuestionSheet: React.FC<{ data: AttentionToQuestionData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 mt-6 flex flex-col justify-center">
            {data.subType === 'letter-cancellation' && data.grid && (
                <div className="space-y-8">
                    <div className="flex gap-6 justify-center">
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

export const HandwritingPracticeSheet: React.FC<{ data: HandwritingPracticeData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-16 mt-12 flex-1">
            {(data.lines || []).map((line, i) => (
                <div key={i} className="flex gap-8 items-start break-inside-avoid group">
                    <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-2xl shrink-0 group-hover:rotate-6 transition-transform">
                         {line.imagePrompt ? <ImageDisplay prompt={line.imagePrompt} className="w-full h-full object-cover opacity-80" /> : <i className="fa-solid fa-feather-pointed text-white text-3xl"></i>}
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