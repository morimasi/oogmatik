
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, FutoshikiData, NumberPyramidData, ShapeSudokuData,
    LogicGridPuzzleData, ShapeCountingData, BasicOperationsData, RealLifeProblemData
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay, Shape, ShapeDisplay, PedagogicalHeader } from './common';

export const BasicOperationsSheet: React.FC<{ data: BasicOperationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mt-8">
            {data.operations.map((op, index) => (
                <div key={index} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-300 dark:border-zinc-600 shadow-sm flex flex-col items-end justify-center text-4xl font-mono font-bold break-inside-avoid relative overflow-hidden">
                    {/* Dikey İşlem Formatı */}
                    <div className="tracking-widest mr-2">{op.num1}</div>
                    
                    <div className="flex items-center w-full justify-end gap-3 mr-2">
                        <span className="text-3xl absolute left-4 text-zinc-400">{op.operator}</span>
                        <div className="tracking-widest">{op.num2}</div>
                    </div>
                    
                    {op.num3 !== undefined && (
                        <div className="flex items-center w-full justify-end gap-3 mr-2">
                            <div className="tracking-widest">{op.num3}</div>
                        </div>
                    )}
                    
                    {/* İşlem Çizgisi */}
                    <div className="w-full border-b-4 border-zinc-800 dark:border-zinc-200 my-2"></div>
                    
                    {/* Sonuç Alanı */}
                    <div className="h-14 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded border border-dashed border-zinc-300"></div>
                    
                    {/* Kalanlı Bölme Alanı */}
                    {op.remainder !== undefined && (
                        <div className="mt-3 w-full flex justify-between items-center text-sm text-zinc-500 font-sans font-normal border-t pt-2">
                            <span>Kalan:</span>
                            <div className="w-12 h-8 border-b border-zinc-400"></div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const RealLifeMathProblemsSheet: React.FC<{ data: RealLifeProblemData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="space-y-8 max-w-5xl mx-auto">
            {data.problems.map((problem, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-6 p-6 bg-white dark:bg-zinc-700/50 rounded-2xl border-2 border-indigo-100 dark:border-zinc-600 shadow-sm break-inside-avoid">
                    
                    {/* Soru Alanı */}
                    <div className="flex-1">
                        <div className="flex items-start gap-4 mb-4">
                            <span className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-md">{index + 1}</span>
                            <p className="text-xl font-medium leading-relaxed text-zinc-800 dark:text-zinc-100">{problem.text}</p>
                        </div>
                        
                        {/* Varsa Resim */}
                        <div className="pl-14">
                            {problem.imagePrompt && (
                                <div className="inline-block w-32 h-32 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-600 overflow-hidden shadow-sm">
                                    {problem.imageBase64 ? (
                                        <ImageDisplay base64={problem.imageBase64} description={problem.text} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                            <i className="fa-solid fa-calculator text-3xl"></i>
                                        </div>
                                    )}
                                </div>
                            )}
                            {/* İşlem İpucu */}
                            {problem.operationHint && (
                                <div className="mt-2 inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                    İpucu: {problem.operationHint}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Çözüm Alanı (Kareli Defter Görünümü) */}
                    <div className="w-full md:w-[400px] bg-white border-2 border-zinc-300 dark:border-zinc-500 rounded-xl overflow-hidden flex flex-col shadow-inner">
                        <div className="bg-zinc-100 dark:bg-zinc-800 px-4 py-2 border-b border-zinc-300 dark:border-zinc-600 flex justify-between items-center">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Çözüm Alanı</span>
                            <i className="fa-solid fa-pencil text-zinc-400"></i>
                        </div>
                        
                        {/* CSS Grid Pattern for "Notebook" look */}
                        <div className="flex-1 p-4 relative min-h-[150px]" 
                             style={{
                                 backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                                 backgroundSize: '20px 20px'
                             }}>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border-t-2 border-zinc-300 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-800">
                            <span className="font-bold text-lg">Cevap:</span>
                            <div className="w-32 h-10 border-b-2 border-dotted border-zinc-800 dark:border-zinc-200"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {/* Answer Key (Upside down at bottom) */}
        <div className="mt-16 pt-6 border-t-2 border-zinc-200 dark:border-zinc-700 print:block hidden">
            <p className="text-xs font-bold text-zinc-400 uppercase mb-2 text-center">Cevap Anahtarı</p>
            <div className="flex justify-center gap-6 flex-wrap transform rotate-180 opacity-60">
                {data.problems.map((p, i) => (
                    <div key={i} className="text-xs border border-zinc-300 px-3 py-1 rounded bg-zinc-50">
                        <strong>{i+1}.</strong> {p.solution}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border flex flex-col" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    {(puzzle.objects && puzzle.objects.length > 0) && (
                        <div className="flex justify-center gap-4 mb-4 border-b pb-2">
                            {(puzzle.objects || []).map(obj => (
                                <div key={obj.name} className="flex flex-col items-center text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                    <ImageDisplay base64={obj.imageBase64} description={obj.name} className="w-12 h-12" />
                                    <span>{obj.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="font-semibold text-2xl text-center mb-3 flex-grow">{puzzle.problem}</p>
                    <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 mb-4">{puzzle.question}</p>
                    <div className="flex items-center justify-center mt-auto">
                        <span className="font-bold text-lg">Cevap:</span>
                        <div className="w-24 h-10 ml-2 border-b-2 border-dotted border-zinc-500"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const NumberPatternSheet: React.FC<{ data: NumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Aşağıdaki sayı dizilerindeki kuralı bul ve '?' yerine gelmesi gereken sayıyı yaz."} note={data.pedagogicalNote} />
        <div className="space-y-6">
            {(data.patterns || []).map((pattern, index) => (
                <div key={index} className="flex items-center justify-center gap-4 p-4 bg-white dark:bg-zinc-700/50 rounded-lg shadow-sm">
                    <p className="font-mono text-xl tracking-wider">{pattern.sequence}</p>
                    <div className="w-20 h-10 border-2 border-zinc-300 rounded-md"></div>
                </div>
            ))}
        </div>
    </div>
);

export const FutoshikiSheet: React.FC<{ data: FutoshikiData }> = ({ data }) => {
    const renderFutoshiki = (puzzle: any) => {
        const size = puzzle.size;
        const cellSize = 50;
        const gap = 15; // Space for inequalities
        const totalSize = size * cellSize + (size - 1) * gap;
        const isLengthVariant = 'units' in puzzle;
        
        return (
            <svg width={totalSize + 20} height={totalSize + 20} className="mx-auto">
                {/* Cells */}
                {Array.from({length: size}).map((_, r) => 
                    Array.from({length: size}).map((_, c) => {
                        const x = c * (cellSize + gap) + 10;
                        const y = r * (cellSize + gap) + 10;
                        const val = isLengthVariant ? puzzle.units[r][c] : puzzle.numbers[r][c];
                        return (
                            <g key={`${r}-${c}`}>
                                <rect x={x} y={y} width={cellSize} height={cellSize} className="fill-white stroke-zinc-800" strokeWidth="2" />
                                {val !== null && (
                                    <text x={x + cellSize/2} y={y + cellSize/2 + 5} textAnchor="middle" dominantBaseline="middle" className={isLengthVariant ? "text-xs font-bold" : "text-2xl font-bold"}>{val}</text>
                                )}
                            </g>
                        );
                    })
                )}
                
                {/* Constraints */}
                {(puzzle.constraints || []).map((con: any, i: number) => {
                    const isRow = con.row1 === con.row2;
                    const r = con.row1;
                    const c = Math.min(con.col1, con.col2);
                    
                    if (isRow) {
                        // Horizontal constraint
                        const x = c * (cellSize + gap) + cellSize + 10 + gap/2;
                        const y = r * (cellSize + gap) + 10 + cellSize/2;
                        return <text key={i} x={x} y={y + 5} textAnchor="middle" className="text-xl font-bold fill-zinc-600">{con.symbol}</text>;
                    } else {
                         // Vertical constraint (assuming col1=col2)
                         const cr = Math.min(con.row1, con.row2);
                         const cc = con.col1;
                         const x = cc * (cellSize + gap) + 10 + cellSize/2;
                         const y = cr * (cellSize + gap) + cellSize + 10 + gap/2;
                         // Rotate symbol for vertical? > becomes v, < becomes ^
                         const sym = con.symbol === '>' ? 'v' : '^';
                         return <text key={i} x={x} y={y + 5} textAnchor="middle" className="text-xl font-bold fill-zinc-600">{sym}</text>;
                    }
                })}
            </svg>
        );
    };

    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
            <div className="flex flex-col gap-12">
                {(data.puzzles || []).map((puzzle, index) => (
                    <div key={index}>
                        {renderFutoshiki(puzzle)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const NumberPyramidSheet: React.FC<{ data: NumberPyramidData }> = ({ data }) => {
    return (
        <div>
             <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
                {(data.pyramids || []).map((pyramid: any, index: number) => (
                    <div key={index} className="flex flex-col items-center">
                        <h4 className="font-semibold mb-4">{pyramid.title}</h4>
                        <div className="flex flex-col items-center gap-1">
                            {/* Reverse rows to render top-down if data is bottom-up, or ensure data is top-down. 
                                Offline generator returns top-down visual order. */}
                            {pyramid.rows.map((row: (number|null)[], rIndex: number) => (
                                <div key={rIndex} className="flex gap-1">
                                    {row.map((cell: any, cIndex: any) => (
                                        <div key={cIndex} className="w-12 h-12 flex items-center justify-center border-2 border-zinc-400 rounded-md bg-white shadow-sm text-xl font-semibold relative">
                                            {cell !== null ? cell : ''}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const ShapeSudokuSheet: React.FC<{ data: ShapeSudokuData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="flex flex-col items-center gap-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="flex flex-col items-center gap-4">
                    <div className="grid grid-cols-4 border-4 border-zinc-800">
                        {(puzzle.grid || []).map((row, r) => 
                            row.map((shape, c) => (
                                <div key={`${r}-${c}`} className={`w-16 h-16 flex items-center justify-center border border-zinc-400 ${(c+1)%2===0 && c!==3 ? 'border-r-4 border-zinc-800' : ''} ${(r+1)%2===0 && r!==3 ? 'border-b-4 border-zinc-800' : ''} bg-white`}>
                                    {shape ? <Shape name={shape} className="w-10 h-10" /> : ''}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex gap-4 p-2 bg-zinc-100 rounded-lg">
                        <span className="font-bold text-sm self-center">Kullanılacaklar:</span>
                        {puzzle.shapesToUse.map((s, i) => <Shape key={i} name={s.shape} className="w-8 h-8" />)}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col items-center gap-8">
            {data.figures.map((fig, index) => (
                <div key={index} className="p-6 bg-white rounded-xl shadow-sm border-2 border-zinc-200 flex flex-col items-center">
                    <svg viewBox="0 0 100 100" className="w-64 h-64 mb-6">
                        {fig.svgPaths.map((path, pIndex) => (
                            <path key={pIndex} d={path.d} fill={path.fill} stroke={path.stroke || 'black'} strokeWidth="1" />
                        ))}
                    </svg>
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg w-full">
                        <span className="font-bold text-zinc-600">Toplam {fig.targetShape === 'triangle' ? 'Üçgen' : 'Şekil'} Sayısı:</span>
                        <div className="w-16 h-8 border-b-2 border-zinc-400"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border-l-4 border-amber-400">
                    <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-3 uppercase text-sm tracking-wider">İpuçları</h4>
                    <ul className="space-y-2 text-sm">
                        {data.clues.map((clue, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="font-bold text-amber-600">{i+1}.</span>
                                <span className="text-zinc-700 dark:text-zinc-300">{clue}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                <div className="space-y-4">
                    {data.categories.map((cat, i) => (
                        <div key={i}>
                            <h5 className="font-bold text-xs uppercase text-zinc-400 mb-2">{cat.title}</h5>
                            <div className="flex gap-2 flex-wrap">
                                {cat.items.map((item, j) => (
                                    <div key={j} className="flex items-center gap-1 bg-white dark:bg-zinc-800 px-2 py-1 rounded border shadow-sm text-xs">
                                        {item.imagePrompt && <div className="w-4 h-4 bg-zinc-200 rounded-full overflow-hidden"><ImageDisplay base64={item.imageBase64} className="w-full h-full object-cover" /></div>}
                                        <span>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 overflow-x-auto">
                <table className="border-collapse w-full bg-white dark:bg-zinc-800 text-sm">
                    <thead>
                        <tr>
                            <th className="border p-2 bg-zinc-100 dark:bg-zinc-900"></th>
                            {data.categories.map((cat, i) => 
                                cat.items.map((item, j) => (
                                    <th key={`${i}-${j}`} className="border p-2 bg-zinc-50 dark:bg-zinc-900 min-w-[30px] writing-vertical text-xs rotate-180 h-24">
                                        <span className="block transform rotate-90 whitespace-nowrap">{item.name}</span>
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.people.map((person, pIdx) => (
                            <tr key={pIdx}>
                                <td className="border p-2 font-bold bg-zinc-50 dark:bg-zinc-900">{person}</td>
                                {data.categories.map((cat, i) => 
                                    cat.items.map((item, j) => (
                                        <td key={`${i}-${j}`} className="border p-2 text-center hover:bg-zinc-100 cursor-pointer w-10 h-10"></td>
                                    ))
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
