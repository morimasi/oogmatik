
import React from 'react';
import { NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, VisualMathType } from '../../types';
import { PedagogicalHeader, ImageDisplay, Shape } from './common';
import { EditableElement, EditableText } from '../Editable';

const TenFrame: React.FC<{ count: number; className?: string }> = ({ count, className = "" }) => {
    const validCount = Math.min(20, Math.max(0, count || 0));
    const renderFrame = (fill: number) => (
        <div className={`grid grid-cols-5 grid-rows-2 gap-1 p-1 bg-white border-2 border-black w-[120px] h-[52px] ${className}`}>
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="border border-zinc-300 flex items-center justify-center relative">
                    {i < fill && <EditableElement><div className="w-3/4 h-3/4 bg-black rounded-full shadow-sm"></div></EditableElement>}
                </div>
            ))}
        </div>
    );
    return (
        <div className="flex flex-col gap-2">
            {renderFrame(Math.min(10, validCount))}
            {validCount > 10 && renderFrame(validCount - 10)}
        </div>
    );
};

const Domino: React.FC<{ count: number }> = ({ count }) => {
    const dots = Array.from({length: 9}).map(() => false);
    const c = Math.min(9, Math.max(0, count || 0));
    if(c === 1) dots[4] = true;
    else if(c === 2) { dots[0]=true; dots[8]=true; }
    else if(c === 3) { dots[0]=true; dots[4]=true; dots[8]=true; }
    else if(c === 4) { dots[0]=true; dots[2]=true; dots[6]=true; dots[8]=true; }
    else if(c === 5) { dots[0]=true; dots[2]=true; dots[4]=true; dots[6]=true; dots[8]=true; }
    else if(c === 6) { dots[0]=true; dots[2]=true; dots[3]=true; dots[5]=true; dots[6]=true; dots[8]=true; }
    else if(c > 6) { for(let i=0; i<c; i++) dots[i] = true; }
    if (count > 9) return <div className="w-12 h-20 border-2 border-black rounded-lg bg-white flex items-center justify-center text-2xl font-bold shadow-sm">{count}</div>;
    return (
        <div className="w-12 h-12 border-2 border-black rounded-lg bg-white grid grid-cols-3 grid-rows-3 p-1 gap-0.5 shadow-sm">
            {dots.map((isActive, i) => (
                <div key={i} className="flex items-center justify-center">{isActive && <div className="w-2 h-2 bg-black rounded-full"></div>}</div>
            ))}
        </div>
    );
};

const NumberBond: React.FC<{ whole: number | string; part1: number | string; part2: number | string | null; isAddition: boolean }> = ({ whole, part1, part2, isAddition }) => (
    <EditableElement>
    <svg width="160" height="140" viewBox="0 0 160 140" className="overflow-visible">
        <line x1="80" y1="40" x2="40" y2="100" stroke="black" strokeWidth="2" />
        <line x1="80" y1="40" x2="120" y2="100" stroke="black" strokeWidth="2" />
        <circle cx="80" cy="30" r="25" fill={isAddition ? "#fff" : "#e0e7ff"} stroke="black" strokeWidth="2" />
        <text x="80" y="30" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold"><EditableText value={isAddition ? '?' : whole} tag="span" /></text>
        <circle cx="40" cy="110" r="25" fill="white" stroke="black" strokeWidth="2" />
        <text x="40" y="110" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold"><EditableText value={part1} tag="span" /></text>
        <circle cx="120" cy="110" r="25" fill={!isAddition && part2 === null ? "#e0e7ff" : "white"} stroke="black" strokeWidth="2" />
        <text x="120" y="110" dominantBaseline="middle" textAnchor="middle" className="text-xl font-bold"><EditableText value={part2 !== null ? part2 : '?'} tag="span" /></text>
    </svg>
    </EditableElement>
);

const FractionBar: React.FC<{ num: number; den: number }> = ({ num, den }) => (
    <div className="w-full h-12 border-2 border-black rounded flex overflow-hidden bg-white shadow-sm">
        {Array.from({ length: den > 0 ? den : 1 }).map((_, i) => (
            <div key={i} className={`flex-1 border-r border-black last:border-r-0 ${i < Math.max(0, num) ? 'bg-indigo-400' : ''}`}></div>
        ))}
    </div>
);

const FractionPie: React.FC<{ num: number; den: number }> = ({ num, den }) => { /* ... implementation ... */ return <svg/>; };
const DecimalGrid: React.FC<{ num: number; den: number }> = ({ num, den }) => { /* ... implementation ... */ return <div/>; };
const EstimationJar: React.FC<{ count: number }> = ({ count }) => { /* ... implementation ... */ return <div/>; };
const CubeStack: React.FC<{ counts: number[][] }> = ({ counts }) => { /* ... implementation ... */ return <svg/>; };

export const NumberSenseSheet: React.FC<{ data: NumberSenseData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {data.exercises.map((ex, idx) => (
                <EditableElement key={idx} className="p-6 bg-white rounded-xl shadow-sm border-2 border-zinc-200 break-inside-avoid">
                    {ex.type === 'missing' && ex.visualType === 'number-line-advanced' && (
                        <div className="flex items-center justify-between relative h-16 px-8">
                            <div className="absolute left-0 right-0 top-1/2 h-1 bg-black -z-10"></div>
                            {ex.values.map((val, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 relative">
                                    <div className="w-0.5 h-4 bg-black"></div>
                                    <div className="w-10 h-10 border-2 border-indigo-600 bg-white rounded flex items-center justify-center font-bold text-indigo-600">{val === ex.target ? '?' : <EditableText value={val} tag="span" />}</div>
                                </div>
                            ))}
                        </div>
                    )}
                    {ex.type === 'comparison' && ex.visualType === 'ten-frame' && (
                        <div className="flex items-center justify-around">
                            <div className="flex flex-col items-center gap-2"><TenFrame count={ex.values[0]} /><div className="w-10 h-10 border-2 border-dashed rounded"></div></div>
                            <div className="flex flex-col gap-2"><div className="w-12 h-12 rounded-full border-2 text-2xl font-bold flex items-center justify-center">{'>'}</div><div className="w-12 h-12 rounded-full border-2 text-2xl font-bold flex items-center justify-center">{'<'}</div></div>
                            <div className="flex flex-col items-center gap-2"><TenFrame count={ex.values[1]} /><div className="w-10 h-10 border-2 border-dashed rounded"></div></div>
                        </div>
                    )}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const VisualArithmeticSheet: React.FC<{ data: VisualArithmeticData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {data.problems.map((prob, idx) => (
                <EditableElement key={idx} className="p-6 bg-white rounded-xl border-2 border-zinc-200 shadow-sm flex flex-col items-center gap-4 break-inside-avoid">
                    <div className="flex items-center gap-4">
                        {prob.visualType === 'ten-frame' && <TenFrame count={prob.num1} />}
                        {prob.visualType === 'dice' && <Domino count={prob.num1} />}
                        {(prob.visualType === 'objects' || prob.visualType === 'group') && <div className="flex flex-wrap gap-1 w-24 justify-center">{Array.from({length: prob.num1}).map((_,i) => <EditableElement key={i}><div className="w-4 h-4 bg-indigo-500 rounded-full"></div></EditableElement>)}</div>}
                        {prob.visualType === 'number-bond' && <NumberBond whole={prob.operator === '+' ? prob.answer : prob.num1} part1={prob.operator === '+' ? prob.num1 : prob.num2} part2={prob.operator === '+' ? prob.num2 : prob.answer} isAddition={prob.operator === '+'} />}
                        
                        {prob.visualType !== 'number-bond' && prob.operator !== 'group' && <span className="text-3xl font-bold text-zinc-400">{prob.operator}</span>}
                        
                        {prob.visualType !== 'number-bond' && prob.operator !== 'group' && (
                            <>
                                {prob.visualType === 'ten-frame' && <TenFrame count={prob.num2} />}
                                {prob.visualType === 'dice' && <Domino count={prob.num2} />}
                                {prob.visualType === 'objects' && <div className="flex flex-wrap gap-1 w-24 justify-center">{Array.from({length: prob.num2}).map((_,i) => <EditableElement key={i}><div className="w-4 h-4 bg-rose-500 rounded-full"></div></EditableElement>)}</div>}
                            </>
                        )}
                    </div>
                    {prob.visualType !== 'number-bond' && (
                        <div className="flex items-center gap-2 text-2xl font-bold font-mono">
                            <span><EditableText value={prob.num1} tag="span" /></span>
                            <span>{prob.operator}</span>
                            <span><EditableText value={prob.num2} tag="span" /></span>
                            <span>=</span>
                            <div className="w-16 h-10 border-2 border-zinc-400 rounded bg-white"></div>
                        </div>
                    )}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid justify-items-center">
            {data.tasks.map((task, idx) => (
                <EditableElement key={idx} className="w-full flex flex-col items-center break-inside-avoid">
                    {task.type === 'count-cubes' && data.cubeData && <div className="p-8"><CubeStack counts={data.cubeData} /></div>}
                    {task.type === 'copy' && <div className="flex gap-8"><div className="grid gap-1 p-1 bg-zinc-800" style={{gridTemplateColumns: `repeat(${data.gridSize}, 40px)`}}>{(task.grid || []).flat().map((cell, i) => <div key={i} className={`w-10 h-10 ${cell === 'filled' ? 'bg-indigo-500' : 'bg-white'}`}></div>)}</div><div className="grid gap-1 p-1 bg-zinc-300" style={{gridTemplateColumns: `repeat(${data.gridSize}, 40px)`}}>{Array.from({length: data.gridSize*data.gridSize}).map((_,i) => <div key={i} className="w-10 h-10 bg-white"></div>)}</div></div>}
                    {task.type === 'path' && <div className="grid gap-0.5 bg-zinc-400 border-2" style={{gridTemplateColumns: `repeat(${data.gridSize}, 50px)`}}>{(task.grid || []).flat().map((cell, i) => <div key={i} className="w-[50px] h-[50px] bg-white flex items-center justify-center font-bold">{cell==='S' && 'BAŞLA'}{cell==='E' && 'BİTİŞ'}</div>)}</div>}
                    <div className="mt-4 p-2 bg-indigo-50 text-center rounded text-indigo-800 text-sm font-medium">{task.instruction}</div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ConceptMatchSheet: React.FC<{ data: ConceptMatchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {data.pairs.map((pair, idx) => (
                <EditableElement key={idx} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm break-inside-avoid">
                    <div className="flex-1 flex justify-center">{pair.imagePrompt1?.startsWith('PIE') ? <FractionPie num={parseInt(pair.item1.split(':')[1])} den={parseInt(pair.item1.split(':')[2])} /> : <span className="text-3xl font-bold">{pair.item1}</span>}</div>
                    <div className="w-16 h-0.5 border-t-2 border-dashed border-zinc-400"></div>
                    <div className="flex-1 flex justify-center"><span className="text-xl font-medium">{pair.item2}</span></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {data.items.map((item, idx) => (
                <EditableElement key={idx} className="flex flex-col items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border-2 break-inside-avoid">
                    <EstimationJar count={item.count} />
                    <div className="flex justify-center gap-4">
                        {item.options.map((opt, i) => <button key={i} className="w-16 h-16 rounded-full border-2 hover:bg-indigo-50 font-bold text-xl">{opt}</button>)}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);