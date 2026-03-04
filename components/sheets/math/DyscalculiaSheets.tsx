import React from 'react';
import { 
    VisualArithmeticData, ClockReadingData, NumberSenseData, SpatialGridData, ConceptMatchData, EstimationData, MathMemoryCardsData, MathMemoryCard, MoneyCountingData
} from '../../../types';
import { 
    PedagogicalHeader, TenFrame, Domino, NumberBond, AnalogClock, NumberLine, Base10Visualizer, CubeStack, FractionVisual, Shape
} from '../common';
import { EditableElement, EditableText } from '../../Editable';

const MoneyIcon: React.FC<{ value: number, type: 'coin' | 'note' }> = ({ value, type }) => (
    <div className={`flex items-center justify-center font-bold shadow-sm relative ${type === 'coin' ? 'w-14 h-14 rounded-full bg-amber-400 border-4 border-amber-600 text-amber-900' : 'w-24 h-12 bg-emerald-100 border-2 border-emerald-600 text-emerald-800 rounded'}`}>
        {value} {type === 'coin' ? '' : 'TL'}
        {type === 'coin' && <span className="absolute bottom-1.5 text-[8px] font-black uppercase">TL</span>}
    </div>
);

const MemoryCardUI: React.FC<{ card: MathMemoryCard }> = ({ card }) => (
    <EditableElement className="aspect-[3/4] bg-white border-2 border-zinc-200 rounded-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden group shadow-sm hover:border-indigo-500 transition-all break-inside-avoid">
        <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-zinc-50 pointer-events-none"></div>
        <div className="flex-1 flex items-center justify-center w-full">
            {card.type === 'operation' && <span className="text-3xl font-black text-zinc-800 tracking-tighter text-center leading-tight">{card.content}</span>}
            {card.type === 'number' && <span className="text-5xl font-black text-indigo-600 drop-shadow-sm">{card.content}</span>}
            {card.type === 'visual' && (
                <div className="scale-90 origin-center">
                    {card.visualType === 'ten-frame' && <TenFrame count={card.numValue} />}
                    {card.visualType === 'dice' && <Domino count={card.numValue} />}
                    {card.visualType === 'blocks' && <Base10Visualizer number={card.numValue} />}
                </div>
            )}
            {card.type === 'text' && <span className="text-sm font-black text-center text-zinc-600 uppercase leading-snug italic"><EditableText value={card.content} tag="span" /></span>}
        </div>
    </EditableElement>
);

export const VisualArithmeticSheet: React.FC<{ data: VisualArithmeticData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 content-start flex-1">
            {(data.problems || []).map((prob, i) => (
                <div key={i} className="p-8 border-[3px] border-zinc-900 rounded-[3rem] bg-white shadow-sm flex flex-col gap-6 break-inside-avoid group hover:border-indigo-500 transition-all">
                    <div className="flex items-center justify-around">
                        {prob.visualType === 'ten-frame' && <TenFrame count={prob.num1} />}
                        {prob.visualType === 'dice' && <Domino count={prob.num1} />}
                        {prob.visualType === 'blocks' && <Base10Visualizer number={prob.num1} className="scale-75" />}
                        <span className="text-4xl font-black text-zinc-300">{prob.operator}</span>
                        {prob.visualType === 'ten-frame' && <TenFrame count={prob.num2} />}
                        {prob.visualType === 'dice' && <Domino count={prob.num2} />}
                        {prob.visualType === 'blocks' && <Base10Visualizer number={prob.num2} className="scale-75" />}
                    </div>
                    <div className="h-16 w-full border-2 border-zinc-200 border-dashed rounded-2xl bg-zinc-50/50 flex items-center justify-center text-zinc-200 font-black text-2xl uppercase tracking-widest italic">Çözüm Alanı</div>
                </div>
            ))}
        </div>
    </div>
);

export const ClockReadingSheet: React.FC<{ data: ClockReadingData }> = ({ data }) => (
    <div className="flex flex-col h-full font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mt-8 flex-1 content-start">
            {(data.clocks || []).map((clock, i) => (
                <div key={i} className="flex flex-col items-center gap-6 p-6 border-2 border-zinc-100 rounded-[2.5rem] bg-white hover:shadow-xl transition-all break-inside-avoid group">
                    <div className="relative group-hover:scale-110 transition-transform duration-500">
                         <AnalogClock hour={clock.hour} minute={clock.minute} showNumbers={data.settings?.showNumbers} showTicks={data.settings?.showTicks} showHands={data.settings?.showHands} className="w-40 h-40 drop-shadow-lg" />
                         <div className="absolute -top-3 -left-3 w-8 h-8 bg-zinc-900 text-white rounded-xl flex items-center justify-center font-black text-xs border-2 border-white shadow-lg">{i+1}</div>
                    </div>
                    <div className="w-full space-y-3">
                        {clock.problemText && <p className="text-xs font-bold text-zinc-500 text-center leading-tight italic px-2">{clock.problemText}</p>}
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-14 h-10 border-2 border-zinc-800 rounded-lg bg-zinc-50 flex items-center justify-center text-xl font-mono font-black shadow-inner">?</div>
                            <span className="font-black text-xl">:</span>
                            <div className="w-14 h-10 border-2 border-zinc-800 rounded-lg bg-zinc-50 flex items-center justify-center text-xl font-mono font-black shadow-inner">?</div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const NumberSenseSheet: React.FC<{ data: NumberSenseData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2 bg-white">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-12 mt-10">
            {(data.exercises || []).map((ex, i) => (
                <div key={i} className="p-10 border-[3px] border-zinc-900 rounded-[3rem] break-inside-avoid group">
                    {ex.type === 'missing' && <NumberLine start={ex.values[0]} end={ex.values[ex.values.length-1]} step={ex.step || 1} missing={[ex.target]} />}
                    {ex.type === 'comparison' && (
                        <div className="flex items-center justify-around py-4">
                            {ex.visualType === 'ten-frame' ? <TenFrame count={ex.values[0]} /> : <Base10Visualizer number={ex.values[0]} className="scale-75" />}
                            <div className="w-16 h-16 rounded-2xl border-4 border-indigo-600 flex items-center justify-center text-indigo-600 font-black text-4xl shadow-xl bg-white rotate-3">?</div>
                            {ex.visualType === 'ten-frame' ? <TenFrame count={ex.values[1]} /> : <Base10Visualizer number={ex.values[1]} className="scale-75" />}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const MoneyCountingSheet: React.FC<{ data: MoneyCountingData }> = ({ data }) => (
    <div className="flex flex-col font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-10 mt-8 flex-1 content-start">
            {(data.puzzles || []).map((puzzle, idx) => (
                <div key={idx} className="p-8 bg-white border-[3px] border-zinc-900 rounded-[3rem] flex flex-col gap-8 break-inside-avoid shadow-sm group hover:border-indigo-500 transition-all">
                    <div className="flex flex-wrap gap-6 items-center justify-center p-6 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-200 shadow-inner">
                        {puzzle.notes?.map((n, ni) => Array.from({length: n.count}).map((_, i) => <MoneyIcon key={`n-${ni}-${i}`} value={n.value} type="note" />))}
                        {puzzle.coins?.map((c, ci) => Array.from({length: c.count}).map((_, i) => <MoneyIcon key={`c-${ci}-${i}`} value={c.value} type="coin" />))}
                    </div>
                    <div className="flex flex-col items-center gap-6">
                        <p className="text-xl font-black text-zinc-800 text-center"><EditableText value={puzzle.question} tag="span" /></p>
                        <div className="flex gap-4">
                            {puzzle.options.map((opt, i) => (
                                <div key={i} className="px-8 py-3 border-[3px] border-zinc-900 rounded-2xl font-black text-2xl hover:bg-zinc-900 hover:text-white transition-all cursor-pointer shadow-md">
                                    <EditableText value={opt} tag="span" /> TL
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MathMemoryCardsSheet: React.FC<{ data: MathMemoryCardsData }> = ({ data }) => (
    <div className="flex flex-col h-full font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex-1 grid grid-cols-4 gap-4 mt-8 content-start">
            {(data.cards || []).map((card) => <MemoryCardUI key={card.id} card={card} />)}
        </div>
        <div className="mt-10 p-5 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 flex justify-between items-center opacity-60">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-200 flex items-center justify-center text-sm"><i className="fa-solid fa-scissors"></i></div>
                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest leading-tight">Noktalı çizgilerden <br/>özenle kesin.</p>
            </div>
            <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Hafıza Atölyesi v3.5</p>
        </div>
    </div>
);

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 gap-12 mt-10 justify-items-center">
            {(data.tasks || []).map((task, idx) => (
                <div key={idx} className="w-full flex flex-col items-center break-inside-avoid">
                    {task.type === 'count-cubes' && data.cubeData && (
                        <div className="p-10 bg-white border-[3px] border-zinc-900 rounded-[3rem] shadow-xl">
                            <CubeStack counts={data.cubeData} />
                            <div className="mt-10 flex items-center justify-center gap-6">
                                <span className="font-black text-xl text-zinc-700">Toplam Küp:</span>
                                <div className="w-24 h-14 border-4 border-zinc-400 rounded-2xl bg-zinc-50 text-center flex items-center justify-center text-2xl font-black italic text-zinc-200">?</div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const ConceptMatchSheet: React.FC<{ data: ConceptMatchData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6 mt-10 max-w-4xl mx-auto">
            {(data.pairs || []).map((pair, idx) => (
                <div key={idx} className="flex items-center justify-between p-6 bg-white rounded-3xl border-[3px] border-zinc-900 shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                    <div className="flex-1 text-center font-black text-3xl text-zinc-800"><EditableText value={pair.item1} tag="span" /></div>
                    <div className="w-24 flex items-center justify-center px-4"><div className="w-full h-1 border-t-4 border-dotted border-zinc-200"></div></div>
                    <div className="flex-1 flex justify-center">
                        <div className="w-32 h-16 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl flex items-center justify-center text-xl font-bold text-zinc-300">?</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div className="font-lexend p-2">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {(data.items || []).map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-8 p-10 bg-white border-[3px] border-zinc-900 rounded-[3rem] shadow-sm break-inside-avoid group hover:border-indigo-500 transition-all">
                    <div className="w-56 h-56 border-[6px] border-zinc-100 rounded-full bg-zinc-50 relative overflow-hidden shadow-inner flex items-center justify-center">
                        <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-3 p-6">
                            {Array.from({length: item.count}).map((_, i) => <div key={i} className="w-4 h-4 bg-indigo-500 rounded-full shadow-md transform hover:scale-125 transition-transform"></div>)}
                        </div>
                    </div>
                    <div className="w-full text-center">
                        <p className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-6">Tahminin Hangisi?</p>
                        <div className="flex justify-center gap-4">
                            {item.options.map((opt, i) => (
                                <div key={i} className="w-16 h-16 rounded-2xl border-[3px] border-zinc-900 hover:bg-zinc-900 hover:text-white font-black text-2xl text-zinc-900 transition-all flex items-center justify-center cursor-pointer shadow-md">
                                    <EditableText value={opt} tag="span" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);