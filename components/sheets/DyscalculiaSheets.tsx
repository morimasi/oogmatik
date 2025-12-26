
import React from 'react';
import { NumberSenseData, VisualArithmeticData, SpatialGridData, ConceptMatchData, EstimationData, VisualMathType, ClockReadingData, MoneyCountingData, MathMemoryCardsData } from '../../types';
import { PedagogicalHeader, TenFrame, Domino, NumberBond, FractionVisual, AnalogClock, NumberLine, Shape, Base10Visualizer } from './common';
import { EditableElement, EditableText } from '../Editable';

// --- 3D Cubes (Isometric) - Keeping here as it's specific to spatial ---
const CubeStack: React.FC<{ counts: number[][] }> = ({ counts }) => {
    if (!counts || !Array.isArray(counts) || counts.length === 0) return null;
    const dim = counts.length;
    const size = 30; 
    
    const drawCube = (gx: number, gy: number, gz: number) => {
        const isoX = (gx - gy) * size;
        const isoY = (gx + gy) * (size * 0.5) - (gz * size * 0.8);
        const top = `M 0 0 L ${size} ${size*0.5} L 0 ${size} L ${-size} ${size*0.5} Z`;
        const left = `M ${-size} ${size*0.5} L 0 ${size} L 0 ${size*2} L ${-size} ${size*1.5} Z`;
        const right = `M 0 ${size} L ${size} ${size*0.5} L ${size} ${size*1.5} L 0 ${size*2} Z`;
        return (
            <g transform={`translate(${isoX + 150}, ${isoY + 100})`}>
                <path d={left} fill="#9ca3af" stroke="black" strokeWidth="1" />
                <path d={right} fill="#d1d5db" stroke="black" strokeWidth="1" />
                <path d={top} fill="#f3f4f6" stroke="black" strokeWidth="1" />
            </g>
        );
    };

    const cubesToRender = [];
    for (let x = 0; x < dim; x++) {
        for (let y = 0; y < dim; y++) {
            const h = counts[x][y] || 0;
            for (let z = 0; z < h; z++) cubesToRender.push({x, y, z});
        }
    }
    cubesToRender.sort((a, b) => (a.x + a.y) - (b.x + b.y) || a.z - b.z);

    return (
        <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
            {cubesToRender.map((c, i) => (
                <React.Fragment key={i}>{drawCube(c.x, c.y, c.z)}</React.Fragment>
            ))}
        </svg>
    );
};

// --- MONEY ICON HELPER ---
const MoneyIcon: React.FC<{ value: number, type: 'coin' | 'note' }> = ({ value, type }) => {
    if (type === 'coin') {
        return (
            <div className="w-12 h-12 rounded-full bg-amber-400 border-4 border-amber-600 flex items-center justify-center font-bold text-amber-900 shadow-sm relative">
                {value}
                <span className="absolute bottom-1 text-[8px]">TL</span>
            </div>
        );
    }
    return (
        <div className="w-20 h-10 bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center font-bold text-emerald-800 rounded relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,_#059669_1px,_transparent_1px)] bg-[length:10px_10px]"></div>
            {value} TL
        </div>
    );
};

// --- COMPONENTS ---

export const VisualArithmeticSheet: React.FC<{ data: VisualArithmeticData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="dynamic-grid">
            {(data.problems || []).map((prob, idx) => {
                const visual = prob.visualType || 'objects';
                return (
                    <div key={idx} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200 shadow-sm flex flex-col items-center gap-4 break-inside-avoid">
                        <div className="flex items-center gap-4">
                            {visual === 'ten-frame' && <TenFrame count={prob.num1} />}
                            {visual === 'dice' && <Domino count={prob.num1} />}
                            {visual === 'blocks' && <Base10Visualizer number={prob.num1} className="scale-75 origin-center" />}
                            {(visual === 'objects' || visual === 'mixed') && (
                                <div className="flex flex-wrap gap-1 w-24 justify-center">
                                    {Array.from({length: Math.min(20, prob.num1)}).map((_,i) => <div key={i} className="w-4 h-4 bg-indigo-500 rounded-full"></div>)}
                                </div>
                            )}
                            {visual === 'number-bond' && (
                                <NumberBond 
                                    whole={prob.operator === '+' ? prob.answer : prob.num1} 
                                    part1={prob.operator === '+' ? prob.num1 : prob.num2} 
                                    part2={prob.operator === '+' ? prob.num2 : prob.answer} 
                                    isAddition={prob.operator === '+'} 
                                />
                            )}

                            {visual !== 'number-bond' && prob.operator !== 'group' && (
                                <span className="text-3xl font-bold text-zinc-400"><EditableText value={prob.operator} tag="span" /></span>
                            )}

                            {visual !== 'number-bond' && prob.operator !== 'group' && (
                                <>
                                    {visual === 'ten-frame' && <TenFrame count={prob.num2} />}
                                    {visual === 'dice' && <Domino count={prob.num2} />}
                                    {visual === 'blocks' && <Base10Visualizer number={prob.num2} className="scale-75 origin-center" />}
                                    {(visual === 'objects' || visual === 'mixed') && (
                                        <div className="flex flex-wrap gap-1 w-24 justify-center">
                                            {Array.from({length: Math.min(20, prob.num2)}).map((_,i) => <div key={i} className="w-4 h-4 bg-rose-500 rounded-full"></div>)}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {visual !== 'number-bond' && (
                            <div className="flex items-center gap-2 text-2xl font-bold font-mono">
                                {prob.operator === 'group' ? (
                                    <>
                                        <span><EditableText value={prob.num1} tag="span" /> grup</span>
                                        <span>x</span>
                                        <span><EditableText value={prob.num2} tag="span" /></span>
                                        <span>=</span>
                                        <div className="w-16 h-10 border-2 border-zinc-400 rounded bg-white text-center"><EditableText value="" tag="span" /></div>
                                    </>
                                ) : (
                                    <>
                                        <span><EditableText value={prob.num1} tag="span" /></span>
                                        <span><EditableText value={prob.operator} tag="span" /></span>
                                        <span><EditableText value={prob.num2} tag="span" /></span>
                                        <span>=</span>
                                        <div className="w-16 h-10 border-2 border-zinc-400 rounded bg-white text-center"><EditableText value="" tag="span" /></div>
                                    </>
                                )}
                            </div>
                        )}
                        
                        {prob.operator === 'group' && visual !== 'number-bond' && (
                            <div className="flex gap-4 mt-2">
                                {Array.from({length: prob.num1}).map((_, gIdx) => (
                                    <div key={gIdx} className="p-2 border-2 border-dashed border-zinc-300 rounded-lg">
                                        <div className="grid grid-cols-2 gap-1">
                                            {Array.from({length: prob.num2}).map((_, i) => (
                                                <div key={i} className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
);

export const ClockReadingSheet: React.FC<{ data: ClockReadingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {(data.clocks || []).map((clock, idx) => (
                <div key={idx} className="p-6 bg-white border-2 border-zinc-100 rounded-2xl flex flex-col items-center gap-4 break-inside-avoid shadow-sm">
                    <AnalogClock hour={clock.hour} minute={clock.minute} className="w-40 h-40" />
                    <div className="w-full mt-4">
                        {clock.options ? (
                            <div className="grid grid-cols-2 gap-2">
                                {clock.options.map((opt, i) => (
                                    <div key={i} className="p-2 border rounded text-center font-bold hover:bg-indigo-50 cursor-pointer">
                                        <EditableText value={opt} tag="span" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-16 h-10 border-2 border-zinc-300 rounded flex items-center justify-center text-xl font-mono bg-zinc-50">...</div>
                                <span className="font-bold">:</span>
                                <div className="w-16 h-10 border-2 border-zinc-300 rounded flex items-center justify-center text-xl font-mono bg-zinc-50">...</div>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MoneyCountingSheet: React.FC<{ data: MoneyCountingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="space-y-12">
            {(data.puzzles || []).map((puzzle, idx) => (
                <div key={idx} className="p-6 bg-white border-2 border-zinc-100 rounded-3xl flex flex-col gap-6 break-inside-avoid">
                    <div className="flex flex-wrap gap-4 items-center justify-center p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                        {puzzle.notes?.map((n, ni) => Array.from({length: n.count}).map((_, i) => <MoneyIcon key={`n-${ni}-${i}`} value={n.value} type="note" />))}
                        {puzzle.coins?.map((c, ci) => Array.from({length: c.count}).map((_, i) => <MoneyIcon key={`c-${ci}-${i}`} value={c.value} type="coin" />))}
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <p className="font-bold text-zinc-700">{puzzle.question}</p>
                        <div className="flex gap-4">
                            {puzzle.options.map((opt, i) => (
                                <div key={i} className="px-6 py-2 border-2 border-zinc-200 rounded-full font-bold text-lg hover:border-indigo-500 hover:bg-indigo-50 cursor-pointer transition-all">
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
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="grid grid-cols-4 gap-4 mt-8">
            {(shuffle((data.pairs || []).flatMap((p, i) => [
                { id: `a-${i}`, content: p.card1 },
                { id: `b-${i}`, content: p.card2 }
            ])) as any[]).map((card) => (
                <div key={card.id} className="aspect-[3/4] bg-white border-2 border-zinc-200 rounded-xl flex flex-col items-center justify-center p-2 shadow-sm hover:border-indigo-400 transition-colors">
                    {card.content.type === 'operation' && <span className="text-xl font-bold font-mono text-indigo-700">{card.content.value}</span>}
                    {card.content.type === 'number' && <span className="text-3xl font-black text-zinc-800">{card.content.value}</span>}
                    {card.content.type === 'visual' && card.content.visualType === 'ten-frame' && <TenFrame count={card.content.num || 0} className="scale-75" />}
                    {card.content.type === 'visual' && card.content.visualType === 'dice' && <Domino count={card.content.num || 0} />}
                    {card.content.type === 'visual' && card.content.visualType === 'blocks' && <Base10Visualizer number={card.content.num || 0} className="scale-50" />}
                </div>
            ))}
        </div>
    </div>
);

function shuffle<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

export const NumberSenseSheet: React.FC<{ data: NumberSenseData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {(data.exercises || []).map((ex, idx) => {
                if (ex.type === 'missing' && ex.visualType === 'number-line-advanced') {
                    const start = ex.values[0];
                    const end = ex.values[ex.values.length-1];
                    const step = ex.step || 1;
                    return (
                        <div key={idx} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl shadow-sm border-2 border-zinc-200 break-inside-avoid">
                            <NumberLine start={start} end={end} step={step} missing={[ex.target]} />
                        </div>
                    )
                }
                
                if (ex.type === 'comparison' && ex.visualType === 'ten-frame') {
                    return (
                        <div key={idx} className="flex items-center justify-around p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 break-inside-avoid">
                            <div className="flex flex-col items-center gap-2">
                                <TenFrame count={ex.values[0]} />
                                <div className="w-10 h-10 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center"><EditableText value="" tag="span" /></div>
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-300 flex items-center justify-center text-xl font-bold text-zinc-400">{'>'}</div>
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-300 flex items-center justify-center text-xl font-bold text-zinc-400">{'='}</div>
                                <div className="w-8 h-8 rounded-full border-2 border-zinc-300 flex items-center justify-center text-xl font-bold text-zinc-400">{'<'}</div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <TenFrame count={ex.values[1]} />
                                <div className="w-10 h-10 border-2 border-dashed border-zinc-300 rounded flex items-center justify-center"><EditableText value="" tag="span" /></div>
                            </div>
                        </div>
                    )
                }
                
                if (ex.type === 'ordering') {
                    return (
                         <div key={idx} className="p-6 bg-white border-2 rounded-xl text-center">
                             <p className="font-bold mb-4">Bu nesnelerin sayısı kaçtır?</p>
                             <div className="flex flex-wrap gap-2 justify-center mb-4">
                                {Array.from({length: ex.target}).map((_,k) => <div key={k} className="w-6 h-6 bg-indigo-500 rounded-full"></div>)}
                             </div>
                             <div className="w-16 h-10 border-2 border-black mx-auto rounded"><EditableText value="" tag="span" /></div>
                         </div>
                    );
                }
                
                return null;
            })}
        </div>
    </div>
);

export const SpatialGridSheet: React.FC<{ data: SpatialGridData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="dynamic-grid justify-items-center">
            {(data.tasks || []).map((task, idx) => (
                <div key={idx} className="w-full flex flex-col items-center break-inside-avoid">
                    {task.type === 'count-cubes' && data.cubeData && (
                        <div className="p-8 bg-white border-2 border-zinc-200 rounded-xl shadow-lg">
                            <CubeStack counts={data.cubeData} />
                            <div className="mt-6 flex items-center justify-center gap-4">
                                <span className="font-bold text-lg">Toplam Küp Sayısı:</span>
                                <div className="w-20 h-10 border-2 border-zinc-400 rounded bg-zinc-50 text-center"><EditableText value="" tag="span" /></div>
                            </div>
                        </div>
                    )}

                    {task.type === 'copy' && (
                        <div className="flex gap-8 md:gap-16">
                            <div>
                                <p className="text-center font-bold mb-2 text-zinc-500">Örnek</p>
                                <div className="grid gap-1 bg-zinc-800 p-1" style={{gridTemplateColumns: `repeat(${data.gridSize}, 40px)`}}>
                                    {(task.grid || []).flat().map((cell, i) => (
                                        <div key={i} className={`w-10 h-10 ${cell === 'filled' ? 'bg-indigo-500' : 'bg-white'} border border-zinc-700`}></div>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="text-center font-bold mb-2 text-zinc-500">Senin Çizimin</p>
                                <div className="grid gap-1 bg-zinc-300 p-1" style={{gridTemplateColumns: `repeat(${data.gridSize}, 40px)`}}>
                                    {Array.from({length: data.gridSize * data.gridSize}).map((_, i) => (
                                        <div key={i} className="w-10 h-10 bg-white border border-zinc-400"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const ConceptMatchSheet: React.FC<{ data: ConceptMatchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        <div className="dynamic-grid max-w-4xl mx-auto">
            {(data.pairs || []).map((pair, idx) => {
                const safeItem1 = String(pair.item1 || '');
                const isVisualCode = safeItem1.includes(':') && ['PIE','BAR','GRID','CLOCK','MONEY','SHAPE'].some(k => safeItem1.startsWith(k));
                
                let visualComponent = null;
                if (isVisualCode) {
                    const parts = safeItem1.split(':');
                    const type = parts[0];
                    if (type === 'PIE') visualComponent = <FractionVisual num={parseInt(parts[1])} den={parseInt(parts[2])} />;
                    if (type === 'CLOCK') visualComponent = <AnalogClock hour={parseInt(parts[1])} minute={parseInt(parts[2])} className="w-20 h-20" />;
                    if (type === 'SHAPE') visualComponent = <Shape name={parts[1] as any} className="w-16 h-16" />;
                }

                return (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-700/50 rounded-xl border shadow-sm break-inside-avoid">
                        <div className="flex-1 flex justify-center">
                            {visualComponent ? visualComponent : (
                                <span className="text-3xl font-bold text-zinc-800 dark:text-zinc-200"><EditableText value={pair.item1} tag="span" /></span>
                            )}
                        </div>
                        <div className="w-16 flex items-center justify-center">
                            <div className="w-full h-0.5 border-t-2 border-dashed border-zinc-400"></div>
                        </div>
                        <div className="flex-1 flex justify-center">
                            <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-300 min-w-[80px] text-center">
                                <span className="text-xl font-medium text-zinc-600 dark:text-zinc-400"><EditableText value={pair.item2} tag="span" /></span>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
);

export const EstimationSheet: React.FC<{ data: EstimationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {(data.items || []).map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-6 p-6 bg-white dark:bg-zinc-700/50 rounded-2xl shadow-sm border-2 border-zinc-200 break-inside-avoid">
                    <div className="w-48 h-48 border-4 border-zinc-300 rounded-full bg-white relative overflow-hidden shadow-inner flex items-center justify-center">
                        <div className="absolute inset-0 flex flex-wrap content-center justify-center gap-2 p-4">
                            {Array.from({length: item.count}).map((_, i) => (
                                <div key={i} className="w-3 h-3 bg-indigo-500 rounded-full shadow-sm"></div>
                            ))}
                        </div>
                    </div>
                    <div className="w-full">
                        <p className="text-center font-bold mb-4 text-zinc-500">Tahminin hangisi?</p>
                        <div className="flex justify-center gap-4">
                            {item.options.map((opt, i) => (
                                <div key={i} className="w-16 h-16 rounded-full border-2 border-indigo-200 hover:bg-indigo-50 font-bold text-xl text-indigo-700 transition-colors flex items-center justify-center cursor-pointer">
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
