
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, FutoshikiData, NumberPyramidData,
    NumberCapsuleData, OddEvenSudokuData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareFillInData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, MultiplicationWheelData, ShapeNumberPatternData, ShapeCountingData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData,
    BasicOperationsData, RealLifeProblemData
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay, Shape, ShapeDisplay, PedagogicalHeader } from './common';

export const BasicOperationsSheet: React.FC<{ data: BasicOperationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        {/* Updated Grid to 5 Columns for A4 Fit */}
        <div className="grid grid-cols-5 gap-4 mt-4">
            {data.operations.map((op, index) => (
                <div key={index} className="p-3 bg-white dark:bg-zinc-700/50 rounded-lg border-2 border-zinc-300 dark:border-zinc-600 shadow-sm flex flex-col items-end justify-center text-2xl font-mono font-bold break-inside-avoid relative overflow-hidden">
                    {/* Dikey İşlem Formatı */}
                    <div className="tracking-wide mr-2">{op.num1}</div>
                    
                    <div className="flex items-center w-full justify-end gap-2 mr-2">
                        <span className="text-xl absolute left-2 text-zinc-400">{op.operator}</span>
                        <div className="tracking-wide">{op.num2}</div>
                    </div>
                    
                    {op.num3 !== undefined && (
                        <div className="flex items-center w-full justify-end gap-2 mr-2">
                            <div className="tracking-wide">{op.num3}</div>
                        </div>
                    )}
                    
                    {/* İşlem Çizgisi */}
                    <div className="w-full border-b-2 border-zinc-800 dark:border-zinc-200 my-1"></div>
                    
                    {/* Sonuç Alanı */}
                    <div className="h-10 w-full bg-zinc-50 dark:bg-zinc-800/50 rounded border border-dashed border-zinc-300"></div>
                    
                    {/* Kalanlı Bölme Alanı */}
                    {op.remainder !== undefined && (
                        <div className="mt-2 w-full flex justify-between items-center text-xs text-zinc-500 font-sans font-normal border-t pt-1">
                            <span>K:</span>
                            <div className="w-8 h-6 border-b border-zinc-400"></div>
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

export const KendokuSheet: React.FC<{ data: KendokuData }> = ({ data }) => {
    return (
        <div>
             <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
             <div className="flex flex-wrap justify-center gap-8">
                {(data.puzzles || []).map((puzzle, index) => (
                    <CagedGridSvg key={index} size={puzzle.size} cages={puzzle.cages} gridData={puzzle.grid} />
                ))}
            </div>
        </div>
    );
};

export const OddEvenSudokuSheet: React.FC<{ data: OddEvenSudokuData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
            <div className="flex justify-center">
                <div className="grid grid-cols-6 border-4 border-zinc-900 dark:border-zinc-400">
                    {/* Assuming first puzzle for simplicity or mapping all */}
                    {(data.puzzles[0]?.grid || []).map((row, rIndex) => (
                        (row || []).map((cell, cIndex) => {
                            const puzzle = data.puzzles[0];
                            const isConstrained = 'constrainedCells' in puzzle && puzzle.constrainedCells?.some(c => c.row === rIndex && c.col === cIndex);
                            const isShaded = 'shadedCells' in puzzle && puzzle.shadedCells?.some(c => c.row === rIndex && c.col === cIndex);
                            
                            // 2x3 blocks for 6x6
                            const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 5 ? 'border-r-4 border-zinc-900' : 'border-r border-zinc-400';
                            const borderBottom = (rIndex + 1) % 2 === 0 && rIndex !== 5 ? 'border-b-4 border-zinc-900' : 'border-b border-zinc-400';
                            
                            return (
                                <div key={`${rIndex}-${cIndex}`} className={`w-12 h-12 flex items-center justify-center text-2xl font-bold ${borderRight} ${borderBottom} ${isConstrained || isShaded ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-white'}`}>
                                    {cell}
                                </div>
                            )
                        })
                    ))}
                </div>
            </div>
        </div>
    );
};

export const OperationSquareSheet: React.FC<{ data: OperationSquareFillInData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="flex flex-col gap-8 items-center">
             {data.puzzles.map((puzzle, idx) => (
                 <div key={idx} className="flex flex-col items-center gap-4">
                    <GridComponent grid={puzzle.grid} cellClassName="w-14 h-14 text-xl font-bold" />
                    {'numbersToUse' in puzzle && (
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-300">
                            <span className="font-bold mr-2">Kullanılacak Sayılar:</span>
                            {(puzzle as OperationSquareFillInData['puzzles'][0]).numbersToUse.join(', ')}
                        </div>
                    )}
                 </div>
             ))}
        </div>
    </div>
);

export const NumberCapsuleSheet: React.FC<{ data: NumberCapsuleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="relative bg-white dark:bg-zinc-800 p-6 rounded-xl border-2 border-zinc-200">
                    <h4 className="text-center font-bold mb-4">{puzzle.title}</h4>
                    <div className="grid grid-cols-4 gap-2 mx-auto w-max relative">
                        {/* Draw capsules using absolute positioning or clever borders? Let's use svg overlay or simplistic borders */}
                        {(puzzle.grid || []).map((row, r) => 
                            row.map((cell, c) => (
                                <div key={`${r}-${c}`} className="w-12 h-12 border border-zinc-300 flex items-center justify-center text-xl">
                                    {cell}
                                </div>
                            ))
                        )}
                        
                        {/* Overlay Capsules */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {puzzle.capsules.map((cap, i) => {
                                // Very basic visual approximation: connecting cells with lines and label
                                const first = cap.cells[0];
                                const last = cap.cells[cap.cells.length-1];
                                const x1 = first.col * 56 + 24; // 48px + gap
                                const y1 = first.row * 56 + 24;
                                const x2 = last.col * 56 + 24;
                                const y2 = last.row * 56 + 24;
                                return (
                                    <g key={i}>
                                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(99, 102, 241, 0.5)" strokeWidth="20" strokeLinecap="round" />
                                        <text x={(x1+x2)/2} y={(y1+y2)/2} dy="4" textAnchor="middle" className="font-bold fill-white text-xs pointer-events-auto" style={{textShadow: '0 0 2px black'}}>{cap.sum}</text>
                                    </g>
                                )
                            })}
                        </svg>
                    </div>
                    <div className="mt-4 text-center text-sm font-medium bg-indigo-50 p-2 rounded text-indigo-700">{puzzle.numbersToUse}</div>
                </div>
            ))}
        </div>
    </div>
);

export const RomanNumeralStarHuntSheet: React.FC<{ data: RomanNumeralStarHuntData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="flex justify-center">
            <GridComponent grid={data.grid} cellClassName="w-14 h-14" />
        </div>
        <p className="text-center mt-4 font-bold">Toplam Yıldız: {data.starCount} (Her bölge)</p>
    </div>
);

export const RoundingConnectSheet: React.FC<{ data: RoundingConnectData | ArithmeticConnectData }> = ({ data }) => {
    const items = 'numbers' in data ? data.numbers : data.expressions;
    
    return (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r text-emerald-900 text-center font-medium">
            {data.example}
        </div>
        <div className="relative h-[600px] border-2 border-zinc-200 rounded-xl bg-white">
             {items.map((item: any, i: number) => (
                 <div 
                    key={i} 
                    className="absolute w-auto min-w-[3rem] h-12 px-2 rounded-full bg-zinc-100 border-2 border-zinc-800 flex items-center justify-center font-bold shadow-sm"
                    style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                 >
                     {item.text || item.value}
                 </div>
             ))}
        </div>
    </div>
    );
};

export const RomanNumeralMultiplicationSheet: React.FC<{ data: RomanNumeralMultiplicationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="flex justify-center">
                    <table className="border-collapse border-2 border-zinc-800">
                        <tbody>
                            <tr>
                                <td className="w-16 h-16 bg-zinc-200 border border-zinc-400 text-center font-bold text-xl">x</td>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl">{puzzle.col1}</td>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl">{puzzle.col2}</td>
                            </tr>
                            <tr>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl">{puzzle.row1}</td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center text-lg">{puzzle.results.r1c1}</td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center text-lg">{puzzle.results.r1c2}</td>
                            </tr>
                            <tr>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl">{puzzle.row2}</td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center text-lg">{puzzle.results.r2c1}</td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center text-lg">{puzzle.results.r2c2}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    </div>
);

export const MultiplicationWheelSheet: React.FC<{ data: MultiplicationWheelData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="relative w-64 h-64">
                    {/* Outer Circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-300 bg-white flex items-center justify-center">
                        {/* Inner Circle */}
                        <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-indigo-300 flex items-center justify-center z-10">
                            <span className="text-3xl font-bold text-indigo-800">x{puzzle.innerResult}</span>
                        </div>
                        
                        {/* Spokes */}
                        {puzzle.outerNumbers.map((num, i) => {
                            const angle = (i * 360) / 8;
                            return (
                                <React.Fragment key={i}>
                                    <div className="absolute w-full h-0.5 bg-zinc-300" style={{ transform: `rotate(${angle}deg)` }}></div>
                                    <div className="absolute w-10 h-10 bg-zinc-50 rounded-full border border-zinc-300 flex items-center justify-center font-bold"
                                         style={{ 
                                             top: '50%', left: '50%', 
                                             transform: `translate(-50%, -50%) rotate(${angle}deg) translate(80px) rotate(-${angle}deg)` 
                                         }}>
                                        {num}
                                    </div>
                                    {/* Result Placeholder */}
                                    <div className="absolute w-12 h-12 bg-white rounded border-2 border-dashed border-zinc-300"
                                         style={{ 
                                             top: '50%', left: '50%', 
                                             transform: `translate(-50%, -50%) rotate(${angle}deg) translate(130px) rotate(-${angle}deg)` 
                                         }}>
                                    </div>
                                </React.Fragment>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const TargetNumberSheet: React.FC<{ data: TargetNumberData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-300 shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-3xl font-bold mb-4 border-4 border-indigo-200">
                        {puzzle.target}
                    </div>
                    <div className="flex gap-3 mb-4">
                        {puzzle.givenNumbers.map((n, i) => (
                            <div key={i} className="w-10 h-10 rounded bg-zinc-100 border border-zinc-300 flex items-center justify-center font-bold">{n}</div>
                        ))}
                    </div>
                    <div className="w-full h-12 border-b-2 border-dashed border-zinc-400"></div>
                </div>
            ))}
        </div>
    </div>
);

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

export const VisualNumberPatternSheet: React.FC<{ data: VisualNumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="space-y-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-xl border shadow-sm flex items-center justify-between">
                    <div className="flex gap-4">
                        {puzzle.items.map((item, i) => (
                            <div key={i} className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-zinc-300 font-bold text-xl shadow-inner" 
                                 style={{ 
                                     backgroundColor: item.color, 
                                     transform: `scale(${item.size})`,
                                     color: '#fff',
                                     textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                 }}>
                                {item.number}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-arrow-right text-zinc-400 text-2xl"></i>
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-400 flex items-center justify-center text-2xl font-bold bg-zinc-50">?</div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// NEW COMPONENTS

export const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="space-y-6">
            {data.groups.map((group, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-600">
                    <div className="flex flex-wrap justify-around gap-4">
                        {group.words.map((word, wIndex) => (
                            <div key={wIndex} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ThematicOddOneOutSheet: React.FC<{ data: ThematicOddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="mb-4 text-center font-bold text-indigo-600 dark:text-indigo-400">Tema: {data.theme}</div>
        <div className="space-y-6">
            {data.rows.map((row, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-600 flex flex-wrap justify-around gap-4">
                    {row.words.map((word, wIndex) => (
                        <div key={wIndex} className="flex flex-col items-center gap-2 p-2 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                            {word.imagePrompt && <ImageDisplay base64={word.imageBase64} description={word.text} className="w-20 h-20 object-contain" />}
                            <span className="font-medium">{word.text}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const ThematicOddOneOutSentenceSheet: React.FC<{ data: ThematicOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6">
            {data.rows.map((row, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-600">
                    <div className="flex flex-wrap justify-around gap-4 mb-4">
                        {row.words.map((word, wIndex) => (
                            <div key={wIndex} className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg font-medium cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors">
                                {word}
                            </div>
                        ))}
                    </div>
                    <div className="w-full border-t border-dashed border-zinc-300 pt-2">
                        <p className="text-xs text-zinc-400 mb-1">Cümle:</p>
                        <div className="h-8 bg-zinc-50 dark:bg-zinc-900/50 rounded border-b border-zinc-300 dark:border-zinc-600"></div>
                    </div>
                </div>
            ))}
        </div>
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-center text-indigo-800 dark:text-indigo-200 font-medium">
            {data.sentencePrompt}
        </div>
    </div>
);

export const ColumnOddOneOutSentenceSheet: React.FC<{ data: ColumnOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {data.columns.map((col, index) => (
                <div key={index} className="flex flex-col gap-3 p-4 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-600">
                    {col.words.map((word, wIndex) => (
                        <div key={wIndex} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-center font-medium cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                            {word}
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <div className="p-4 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 dark:bg-zinc-800/30">
            <p className="text-center text-zinc-500 mb-4">{data.sentencePrompt}</p>
            <div className="space-y-4">
                {Array.from({length: data.columns.length}).map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <span className="w-6 h-6 rounded-full bg-zinc-200 flex items-center justify-center text-xs font-bold">{i+1}</span>
                        <div className="flex-1 h-8 border-b border-zinc-400"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const PunctuationMazeSheet: React.FC<{ data: PunctuationMazeData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex justify-center mb-6">
            <div className="px-6 py-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-800 dark:text-indigo-200 font-bold text-xl">
                Hedef İşaret: <span className="text-3xl ml-2">{data.punctuationMark}</span>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.rules.map((rule, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 hover:border-indigo-400 cursor-pointer transition-all relative overflow-hidden group">
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full border-2 border-zinc-300 group-hover:border-indigo-500"></div>
                    <p className="font-medium text-zinc-700 dark:text-zinc-200 pr-6">{rule.text}</p>
                </div>
            ))}
        </div>
    </div>
);

export const PunctuationPhoneNumberSheet: React.FC<{ data: PunctuationPhoneNumberData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full space-y-4">
                {data.clues.map((clue, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-700/50 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-600">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">{clue.id}</div>
                        <p className="text-zinc-700 dark:text-zinc-200">{clue.text}</p>
                    </div>
                ))}
            </div>
            <div className="w-full md:w-1/3 bg-zinc-800 p-6 rounded-3xl shadow-xl text-center">
                <div className="bg-white w-full h-16 mb-6 rounded-lg flex items-center justify-center text-3xl font-mono tracking-widest border-4 border-zinc-300">
                    {/* Placeholder for digits */}
                    _______
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                        <div key={n} className="w-14 h-14 rounded-full bg-zinc-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg mx-auto">
                            {n}
                        </div>
                    ))}
                    <div className="w-14 h-14 rounded-full bg-zinc-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg mx-auto col-start-2">
                        0
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const ShapeNumberPatternSheet: React.FC<{ data: ShapeNumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-8">
            {data.patterns.map((pattern, pIndex) => (
                <div key={pIndex} className="flex flex-wrap justify-center gap-8 md:gap-16 p-6 bg-white dark:bg-zinc-700/50 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-600">
                    {pattern.shapes.map((shape, sIndex) => {
                        if (shape.type === 'triangle') {
                            return (
                                <div key={sIndex} className="relative w-32 h-28">
                                    <svg viewBox="0 0 100 86" className="w-full h-full overflow-visible">
                                        <polygon points="50,0 100,86 0,86" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-800 dark:text-zinc-200" />
                                        <circle cx="15" cy="86" r="12" fill="white" stroke="currentColor" className="text-zinc-800 dark:text-zinc-200" />
                                        <text x="15" y="86" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{shape.numbers[0]}</text>
                                        
                                        <circle cx="85" cy="86" r="12" fill="white" stroke="currentColor" className="text-zinc-800 dark:text-zinc-200" />
                                        <text x="85" y="86" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{shape.numbers[1]}</text>
                                        
                                        <circle cx="50" cy="10" r="12" fill="white" stroke="currentColor" className="text-zinc-800 dark:text-zinc-200" />
                                        <text x="50" y="10" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{shape.numbers[2]}</text>
                                    </svg>
                                </div>
                            )
                        }
                        return null;
                    })}
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
