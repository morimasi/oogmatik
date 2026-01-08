import React from 'react';
import { 
    StroopTestData, LetterGridTestData, NumberSearchData, ChaoticNumberSearchData, AttentionDevelopmentData, AttentionFocusData, FindDuplicateData, FindLetterPairData, TargetSearchData
} from '../../../types';
import { PedagogicalHeader, ImageDisplay } from '../common';
import { EditableElement, EditableText } from '../../Editable';

export const StroopTestSheet: React.FC<{ data: StroopTestData }> = ({ data }) => (
    <div className="flex flex-col h-full font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 grid grid-cols-4 gap-y-10 gap-x-4 items-center content-start mt-8">
            {(data.items || []).map((item, i) => (
                <div key={i} className="flex justify-center">
                    <span className="text-3xl font-black tracking-widest uppercase text-center" style={{ color: item.color }}>
                        <EditableText value={item.text} tag="span" />
                    </span>
                </div>
            ))}
        </div>
        <div className="mt-auto pt-8 border-t-4 border-zinc-900 grid grid-cols-4 gap-4">
            {['SÜRE', 'HATA', 'DÜZELTME', 'PUAN'].map(l => (
                <div key={l} className="p-3 bg-zinc-50 border-2 border-zinc-200 rounded-xl">
                    <h5 className="text-[9px] font-black text-zinc-400 uppercase mb-2">{l}</h5>
                    <div className="h-6 border-b border-zinc-300 border-dashed"></div>
                </div>
            ))}
        </div>
    </div>
);

export const BurdonTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div className="h-full flex flex-col font-lexend p-2">
        <PedagogicalHeader title="BURDON DİKKAT TESTİ" instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 bg-white border-2 border-zinc-100 rounded-3xl p-8 font-mono text-xl leading-[3rem] tracking-[0.5em] text-justify select-none shadow-inner mt-4">
            {(data.grid || []).map((row, i) => (
                <div key={i} className="flex items-center border-b border-zinc-50 pb-1">
                    <span className="w-10 text-[10px] font-black text-zinc-300 pr-2 border-r mr-4">{i+1}</span>
                    <div className="flex-1 text-center font-bold text-zinc-800">{row.join('')}</div>
                </div>
            ))}
        </div>
    </div>
);

export const ChaoticNumberSearchSheet: React.FC<{ data: ChaoticNumberSearchData }> = ({ data }) => (
    <div className="relative h-full flex flex-col w-full font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex-1 relative border-4 border-zinc-900 rounded-[3rem] overflow-hidden bg-white min-h-[600px] shadow-2xl mt-4">
            <div className="absolute top-0 left-0 w-full bg-zinc-900 text-white p-3 flex justify-center gap-4 flex-wrap z-10 border-b-4 border-black">
                <span className="font-bold text-xs self-center uppercase tracking-widest">Aranacak Sayılar:</span>
                <div className="flex gap-3 items-center">
                    <span className="font-black text-xl bg-white text-zinc-900 px-3 py-0.5 rounded-lg">{data.range?.start || 1}</span>
                    <i className="fa-solid fa-arrow-right-long text-zinc-500"></i>
                    <span className="font-black text-xl bg-white text-zinc-900 px-3 py-0.5 rounded-lg">{data.range?.end || 40}</span>
                </div>
            </div>
            <div className="absolute inset-0 top-16 p-8">
                {(data.numbers || []).map((num, i) => (
                    <EditableElement key={i} className="absolute flex items-center justify-center font-black select-none leading-none hover:text-indigo-600 transition-colors"
                        style={{ left: `${num.x}%`, top: `${num.y}%`, transform: `rotate(${num.rotation}deg) scale(${num.size})`, color: 'black', fontSize: '1.4rem', zIndex: Math.floor(Math.random() * 20) }}>
                        {num.value}
                    </EditableElement>
                ))}
            </div>
        </div>
        <div className="mt-8 flex justify-center gap-10 break-inside-avoid">
            {['BAŞLAMA', 'BİTİŞ'].map(l => (
                <div key={l} className="p-5 bg-white border-2 border-zinc-200 rounded-2xl text-center shadow-sm w-44">
                    <p className="font-black text-zinc-400 uppercase text-[10px] mb-3 tracking-widest">{l}</p>
                    <div className="h-6 border-b-2 border-zinc-100 border-dashed"></div>
                </div>
            ))}
        </div>
    </div>
);

export const NumberSearchSheet: React.FC<{ data: NumberSearchData }> = ({ data }) => (
    <div className="h-full flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 flex flex-wrap gap-4 justify-center p-10 border-4 border-zinc-900 rounded-[3rem] bg-white shadow-xl mt-6">
            {(data.numbers || []).map((n, i) => (
                <div key={i} className="w-12 h-12 flex items-center justify-center border-2 border-zinc-100 rounded-xl font-black text-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-default">
                    {n}
                </div>
            ))}
        </div>
    </div>
);

export const FindDuplicateSheet: React.FC<{ data: FindDuplicateData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-4 mt-6">
            {(data.rows || []).map((row, i) => (
                <EditableElement key={i} className="flex justify-between items-center p-4 border-2 border-zinc-900 rounded-2xl bg-white shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                    <span className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center font-black text-xs mr-4 group-hover:bg-indigo-600">{i+1}</span>
                    <div className="flex-1 flex justify-between font-mono text-xl tracking-[0.5em] font-black text-zinc-800">
                        {row.map((char, j) => <span key={j} className="hover:text-indigo-600 transition-colors">{char}</span>)}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const LetterGridTestSheet: React.FC<{ data: LetterGridTestData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="bg-white border-[3px] border-zinc-900 p-8 rounded-[2.5rem] shadow-sm mt-6">
            <div className="font-mono text-lg leading-[3rem] tracking-[0.8em] text-center select-none text-zinc-900">
                {(data.grid || []).map((row, i) => (
                    <div key={i} className="mb-2 border-b border-zinc-50 pb-1">{row.join('')}</div>
                ))}
            </div>
        </div>
    </div>
);

export const FindLetterPairSheet: React.FC<{ data: FindLetterPairData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="mt-8 text-center mb-6">
            <span className="px-10 py-3 bg-zinc-900 text-white rounded-2xl font-black text-2xl shadow-xl border-4 border-white ring-4 ring-zinc-50">HEDEF: {data.targetPair}</span>
        </div>
        <div className="bg-white border-[3px] border-zinc-900 p-4 rounded-[2.5rem] grid gap-1 shadow-sm" style={{gridTemplateColumns: `repeat(${data.grid?.length || 10}, 1fr)`}}>
            {(data.grid || []).flat().map((char, i) => (
                <div key={i} className="aspect-square flex items-center justify-center border border-zinc-100 text-lg font-black text-zinc-800 hover:bg-zinc-50 transition-colors">{char}</div>
            ))}
        </div>
    </div>
);

export const TargetSearchSheet: React.FC<{ data: TargetSearchData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="bg-white border-[3px] border-zinc-900 p-10 rounded-[3rem] text-zinc-900 font-mono text-2xl tracking-[1em] text-center leading-[3.5rem] shadow-sm mt-6">
            {(data.grid || []).map((row, i) => (
                <div key={i} className="hover:bg-zinc-50 transition-colors">{row.join('')}</div>
            ))}
        </div>
        <div className="mt-8 flex justify-center gap-6">
            <div className="flex items-center gap-4 bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-lg border-2 border-white">
                <span className="font-black text-xs uppercase tracking-widest opacity-60">Hedef:</span>
                <span className="font-black text-3xl">{data.target}</span>
            </div>
        </div>
    </div>
);

export const AttentionDevelopmentSheet: React.FC<{ data: AttentionDevelopmentData }> = ({ data }) => (
    <div className="space-y-8 font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {(data.puzzles || []).map((p, i) => (
                <div key={i} className="bg-white border-[3px] border-zinc-900 rounded-[2.5rem] p-8 shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                    <div className="bg-zinc-900 text-white p-5 rounded-2xl mb-8 font-bold text-center italic shadow-inner">
                        <EditableText value={p.riddle} tag="p" />
                    </div>
                    <div className="flex justify-center gap-6 mb-8 items-center">
                        {p.boxes.map((b, bi) => (
                            <div key={bi} className="border-2 border-zinc-200 p-4 rounded-2xl min-w-[100px] text-center bg-zinc-50 group-hover:bg-white transition-colors">
                                {b.label && <span className="text-[10px] font-black block mb-2 text-indigo-500 uppercase tracking-widest">{b.label}</span>}
                                <span className="font-mono font-black text-2xl text-zinc-800">{b.numbers.join(', ')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-around border-t pt-6">
                        {p.options.map((o, oi) => (
                            <div key={oi} className="flex flex-col items-center gap-2 cursor-pointer group/opt">
                                <div className="w-10 h-10 rounded-2xl border-2 border-zinc-200 flex items-center justify-center font-black text-zinc-400 group-hover/opt:border-indigo-500 group-hover/opt:text-indigo-600 transition-all">{String.fromCharCode(65+oi)}</div>
                                <span className="font-black text-zinc-700">{o}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const AttentionFocusSheet: React.FC<{ data: AttentionFocusData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {(data.puzzles || []).map((puzzle, i) => (
                <div key={i} className="bg-white border-[3px] border-zinc-900 rounded-[2.5rem] p-8 shadow-sm break-inside-avoid flex flex-col group hover:border-indigo-500 transition-all">
                    <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-2xl mb-8 text-center shadow-inner">
                        <p className="text-xl font-bold text-amber-900 font-dyslexic italic"><EditableText value={puzzle.riddle} tag="span" /></p>
                    </div>
                    <div className="flex gap-4 justify-center mb-8 flex-1 items-stretch">
                        {puzzle.boxes.map((box, bIdx) => (
                            <div key={bIdx} className="border-2 border-zinc-800 p-4 min-w-[120px] text-center bg-zinc-50 rounded-2xl group-hover:bg-white transition-colors">
                                {box.title && <div className="text-[10px] text-indigo-500 mb-3 uppercase tracking-[0.2em] font-black border-b pb-2">{box.title}</div>}
                                <ul className="space-y-2 text-lg font-black text-zinc-800">
                                    {box.items.map((item, nIdx) => <li key={nIdx}><EditableText value={item} tag="span" /></li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-6 flex flex-wrap justify-center gap-4">
                        {puzzle.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-3 bg-zinc-100 px-4 py-2 rounded-2xl border-2 border-transparent hover:border-indigo-400 hover:bg-white transition-all cursor-pointer group/choice">
                                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-xs group-hover/choice:bg-indigo-600">{String.fromCharCode(65 + oIdx)}</div>
                                <span className="font-black text-sm text-zinc-700">{opt}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);