
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, FutoshikiData, FutoshikiLengthData, NumberPyramidData, DivisionPyramidData, MultiplicationPyramidData,
    NumberCapsuleData, OddEvenSudokuData, Sudoku6x6ShadedData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareSubtractionData, OperationSquareFillInData, OperationSquareMultDivData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, MultiplicationWheelData, ShapeNumberPatternData, ShapeCountingData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay, Shape, ShapeDisplay, PedagogicalHeader } from './common';

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

export const FutoshikiSheet: React.FC<{ data: FutoshikiData | FutoshikiLengthData }> = ({ data }) => {
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

export const NumberPyramidSheet: React.FC<{ data: NumberPyramidData | DivisionPyramidData | MultiplicationPyramidData }> = ({ data }) => {
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
                                    {row.map((cell, cIndex) => (
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

export const OddEvenSudokuSheet: React.FC<{ data: OddEvenSudokuData | Sudoku6x6ShadedData }> = ({ data }) => {
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

export const OperationSquareSheet: React.FC<{ data: OperationSquareSubtractionData | OperationSquareFillInData | OperationSquareMultDivData }> = ({ data }) => (
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
                                     textShadow: '1px 1px 2px black'
                                 }}>
                                {item.number}
                            </div>
                        ))}
                    </div>
                    <div className="text-4xl text-zinc-300">?</div>
                </div>
            ))}
        </div>
    </div>
);

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
                <h4 className="font-bold mb-2 border-b pb-1">İpuçları</h4>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                    {data.clues.map((clue, i) => <li key={i}>{clue}</li>)}
                </ul>
            </div>
            <div className="flex-1 overflow-x-auto">
                <table className="border-collapse border border-zinc-800 text-xs">
                    <thead>
                        <tr>
                            <th className="border border-zinc-400 p-1 bg-zinc-100"></th>
                            {data.categories.map(cat => 
                                cat.items.map((item, i) => (
                                    <th key={`${cat.title}-${i}`} className="border border-zinc-400 p-1 bg-zinc-50 writing-vertical rotate-180 h-24">{item.name}</th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.people.map((person, pIdx) => (
                            <tr key={pIdx}>
                                <td className="border border-zinc-400 p-2 font-bold bg-zinc-50">{person}</td>
                                {data.categories.flatMap(c => c.items).map((_, cIdx) => (
                                    <td key={cIdx} className="border border-zinc-400 w-8 h-8"></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

export const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction="Farklı olanı bul." note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.groups.map((group, i) => (
                 <div key={i} className="p-4 border rounded flex flex-wrap gap-4 justify-center">
                     {group.words.map(w => <span key={w} className="px-3 py-1 bg-zinc-100 rounded">{w}</span>)}
                 </div>
            ))}
        </div>
    </div>
);

export const ShapeNumberPatternSheet: React.FC<{ data: ShapeNumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="space-y-8">
            {(data.patterns || []).map((pattern, idx) => (
                <div key={idx} className="flex flex-wrap justify-center gap-8 p-4 border-b border-dashed">
                    {pattern.shapes.map((shape, sIdx) => (
                        <div key={sIdx} className="relative w-32 h-28">
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                                <polygon points="50,10 10,90 90,90" fill="none" stroke="black" strokeWidth="2" />
                                <circle cx="10" cy="90" r="12" fill="white" stroke="#ccc" />
                                <text x="10" y="94" textAnchor="middle" fontSize="10" fontWeight="bold">{shape.numbers[0]}</text>
                                
                                <circle cx="90" cy="90" r="12" fill="white" stroke="#ccc" />
                                <text x="90" y="94" textAnchor="middle" fontSize="10" fontWeight="bold">{shape.numbers[1]}</text>
                                
                                <circle cx="50" cy="10" r="12" fill="white" stroke="#ccc" />
                                <text x="50" y="14" textAnchor="middle" fontSize="10" fontWeight="bold">{shape.numbers[2]}</text>
                            </svg>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || (data as any).prompt} note={data.pedagogicalNote} />
        <div className="flex flex-col items-center gap-12">
            {(data.figures || []).map((figure, index) => (
                <div key={index} className="relative border-2 border-zinc-200 p-8 bg-white rounded-xl">
                    <svg width="300" height="300" viewBox="0 0 100 100">
                        {figure.svgPaths.map((path, pIdx) => (
                            <path key={pIdx} d={path.d} fill={path.fill} stroke="black" strokeWidth="0.5" fillOpacity="0.5" />
                        ))}
                    </svg>
                    <div className="mt-4 flex items-center gap-2 justify-center">
                        <span className="font-bold">Toplam Üçgen Sayısı:</span>
                        <div className="w-16 h-8 border-b-2 border-black"></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ThematicOddOneOutSheet: React.FC<{ data: ThematicOddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="space-y-6">
            {data.rows.map((row, i) => (
                <div key={i} className="p-4 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200">
                    <h4 className="text-sm font-bold text-indigo-500 mb-3 text-center uppercase tracking-wider">{data.theme}</h4>
                    <div className="grid grid-cols-4 gap-4">
                        {row.words.map((word, j) => (
                            <div key={j} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer">
                                <ImageDisplay base64={word.imageBase64} description={word.text} className="w-24 h-24" />
                                <span className="font-semibold">{word.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ThematicOddOneOutSentenceSheet: React.FC<{ data: ThematicOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} />
        <div className="space-y-6">
            {data.rows.map((row, i) => (
                <div key={i} className="p-4 border rounded-lg">
                    <div className="flex gap-4 mb-3 justify-center">
                        {row.words.map(w => <span key={w} className="px-3 py-1 bg-zinc-100 rounded border">{w}</span>)}
                    </div>
                    <div className="w-full h-12 border-b-2 border-dotted border-zinc-300"></div>
                </div>
            ))}
        </div>
    </div>
);

export const ColumnOddOneOutSentenceSheet: React.FC<{ data: ColumnOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} />
        <div className="grid grid-cols-4 gap-4 mb-8">
            {data.columns.map((col, i) => (
                <div key={i} className="flex flex-col gap-2 p-2 border rounded bg-zinc-50">
                    {col.words.map(w => <div key={w} className="p-2 bg-white border text-center">{w}</div>)}
                </div>
            ))}
        </div>
        <div className="space-y-4">
            <p className="font-bold">{data.sentencePrompt}</p>
            {Array.from({length: 4}).map((_, i) => <div key={i} className="w-full h-8 border-b border-zinc-300"></div>)}
        </div>
    </div>
);

export const PunctuationMazeSheet: React.FC<{ data: PunctuationMazeData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} />
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border-2 border-dashed border-zinc-300">
            <div className="grid grid-cols-2 gap-4">
                {data.rules.map((rule, i) => (
                    <div key={i} className={`p-4 border rounded-lg ${rule.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        {rule.text}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const PunctuationPhoneNumberSheet: React.FC<{ data: PunctuationPhoneNumberData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 space-y-3">
                {data.clues.map((clue, i) => (
                    <div key={i} className="p-3 bg-zinc-50 border rounded">{clue.text}</div>
                ))}
            </div>
            <div className="w-64 p-4 bg-zinc-800 rounded-xl text-white">
                <div className="mb-4 h-10 bg-zinc-600 rounded flex items-center px-2 font-mono tracking-widest">
                    ___ ___ __ __
                </div>
                <div className="grid grid-cols-3 gap-2 text-center font-bold">
                    {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map(n => (
                        <div key={n} className="p-3 bg-zinc-700 rounded hover:bg-zinc-600">{n}</div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
