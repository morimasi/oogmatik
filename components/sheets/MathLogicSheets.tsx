
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData, ShapeNumberPatternData, ShapeCountingData, FutoshikiData, FutoshikiLengthData, NumberPyramidData, DivisionPyramidData, MultiplicationPyramidData, NumberCapsuleData, OddEvenSudokuData, Sudoku6x6ShadedData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData, KendokuData, OperationSquareSubtractionData, OperationSquareFillInData, OperationSquareMultDivData, TargetNumberData, MultiplicationWheelData, ShapeSudokuData, VisualNumberPatternData, LogicGridPuzzleData, ShapeType
} from '../../types';
import { GridComponent, CagedGridSvg, ImageDisplay } from './common';

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
  <div>
    <h3 className="text-xl font-bold mb-6 text-center">{data.title}</h3>
    <div className="space-y-8">
      {(data.puzzles || []).map((puzzle, index) => (
        <div key={index} className="flex flex-col md:flex-row items-center gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
           <span className="text-2xl font-bold text-indigo-500">{index + 1}.</span>
           <div className="flex-1">
             <p className="text-lg font-mono">{puzzle.problem}</p>
             <p className="text-md text-zinc-600 dark:text-zinc-400 mt-1">{puzzle.question}</p>
           </div>
           <div className="flex items-center gap-2">
                <span className="font-semibold">Cevap:</span>
                <div className="w-24 h-10 border-b-2 border-zinc-400"></div>
           </div>
        </div>
      ))}
    </div>
  </div>
);

export const NumberPatternSheet: React.FC<{ data: NumberPatternData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-6 text-center">{data.title}</h3>
        <div className="space-y-6 max-w-lg mx-auto">
            {(data.patterns || []).map((p, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <span className="text-lg font-bold text-violet-500">{index + 1}.</span>
                    <p className="flex-1 text-xl font-mono tracking-wider text-center">{p.sequence}</p>
                    <div className="w-20 h-10 border-b-2 border-zinc-400"></div>
                </div>
            ))}
        </div>
    </div>
);

export const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki her grupta, anlamsal olarak diğerlerinden farklı olan kelimeyi bulup işaretleyin.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.groups || []).map((group, index) => (
                <div key={index} className="p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="space-y-3">
                        {(group.words || []).map((word, wordIndex) => (
                            <div key={wordIndex} className="flex items-center">
                                <div className="w-6 h-6 border-2 border-zinc-400 rounded-full mr-4"></div>
                                <span className="text-lg capitalize">{word}</span>
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
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-2">{data.prompt}</p>
        <p className="text-center font-semibold text-indigo-600 dark:text-indigo-400 mb-6">Tema: {data.theme}</p>
         <div className="space-y-4">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex flex-wrap items-center justify-around p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{ borderColor: 'var(--worksheet-border-color)' }}>
                    {(row.words || []).map((word, wordIndex) => (
                        <div key={wordIndex} className="flex items-center gap-2 m-2">
                             <div className="w-5 h-5 border-2 border-zinc-400 rounded-full shrink-0"></div>
                             <span className="text-lg capitalize">{word}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <p className="text-center italic mt-6">{data.sentencePrompt}</p>
        <div className="h-10 mt-2 border-b-2 border-dotted border-zinc-400"></div>
    </div>
);

export const ThematicOddOneOutSentenceSheet: React.FC<{ data: ThematicOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="space-y-4">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex flex-wrap items-center justify-around p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{ borderColor: 'var(--worksheet-border-color)' }}>
                    {(row.words || []).map((word, wordIndex) => (
                        <div key={wordIndex} className="flex items-center gap-2 m-2">
                             <div className="w-5 h-5 border-2 border-zinc-400 rounded-full shrink-0"></div>
                             <span className="text-lg capitalize">{word}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
        <p className="text-center italic mt-6">{data.sentencePrompt}</p>
        <div className="h-20 mt-2 border-2 border-dashed rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
    </div>
);

export const ColumnOddOneOutSentenceSheet: React.FC<{ data: ColumnOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-4 gap-4 mb-6">
            {(data.columns || []).map((col, i) => (
                <div key={i} className="p-2 border rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    {(col.words || []).map((word, j) => <p key={j} className="text-center p-1">{word}</p>)}
                </div>
            ))}
        </div>
        <p className="text-center italic mt-6">{data.sentencePrompt}</p>
        <div className="h-20 mt-2 border-2 border-dashed rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}></div>
    </div>
);

export const PunctuationMazeSheet: React.FC<{ data: PunctuationMazeData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="flex justify-center mb-8">
            <div className="w-80 h-80 border-2 rounded-lg flex items-center justify-center" style={{borderColor: 'var(--worksheet-border-color)'}}>
                <i className="fa-solid fa-mouse fa-5x text-zinc-300 dark:text-zinc-600"></i>
                 <p className="absolute text-5xl font-bold text-zinc-400">{data.punctuationMark}</p>
            </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(data.rules || []).map(rule => (
                <div key={rule.id} className="p-3 bg-zinc-100 dark:bg-zinc-700/50 rounded-lg text-sm border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                   <strong>{rule.id}.</strong> {rule.text}
                </div>
            ))}
        </div>
    </div>
);

export const PunctuationPhoneNumberSheet: React.FC<{data: PunctuationPhoneNumberData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="p-4 bg-zinc-100 dark:bg-zinc-700 rounded-lg mb-8">
            <p className="font-semibold text-center">{data.instruction}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {(data.clues || []).map(clue => <p key={clue.id}><strong>{clue.id}.</strong> {clue.text}</p>)}
            </div>
        </div>
        <div className="flex justify-center items-center gap-2">
            <p className="font-bold text-lg">05</p>
            {Array.from({length: 9}).map((_, i) => <div key={i} className="w-10 h-12 border-b-2 border-zinc-500"></div>)}
        </div>
     </div>
);

export const ShapeNumberPatternSheet: React.FC<{ data: ShapeNumberPatternData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">Aşağıdaki şekillerde sayılar belirli bir kurala göre yerleştirilmiştir. Bu kuralı bularak soru işareti (?) olan yere hangi sayının gelmesi gerektiğini bulun.</p>
        <div className="space-y-12">
            {(data.patterns || []).map((pattern, index) => (
                <div key={index} className="flex flex-col sm:flex-row items-center justify-center gap-8">
                    {(pattern.shapes || []).map((shape, shapeIndex) => (
                        <div key={shapeIndex} className="relative w-40 h-40">
                            <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="50,5 95,95 5,95" />
                            </svg>
                            {(shape.numbers || []).length === 4 ? ( // 3 corners + center
                                <>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl">{shape.numbers[0]}</span>
                                    <span className="absolute bottom-4 left-4 font-bold text-xl">{shape.numbers[1]}</span>
                                    <span className="absolute bottom-4 right-4 font-bold text-xl">{shape.numbers[2]}</span>
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-2xl text-indigo-600 dark:text-indigo-400">{shape.numbers[3]}</span>
                                </>
                            ) : ( // 3 corners
                                <>
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-xl">{(shape.numbers || [])[0]}</span>
                                    <span className="absolute bottom-4 left-4 font-bold text-xl">{(shape.numbers || [])[1]}</span>
                                    <span className="absolute bottom-4 right-4 font-bold text-xl">{(shape.numbers || [])[2]}</span>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-8 flex flex-col items-center">
            {(data.figures || []).map((figure, index) => (
                <div key={index} className="flex flex-col items-center">
                    <svg viewBox="0 0 100 100" className="w-64 h-64 border rounded-md" style={{borderColor: 'var(--worksheet-border-color)'}}>
                        {(figure.svgPaths || []).map((path, pathIndex) => (
                            <path key={pathIndex} d={path.d} fill={path.fill} stroke="var(--worksheet-border-color)" strokeWidth="0.5" />
                        ))}
                    </svg>
                </div>
            ))}
             <div className="mt-4 flex items-center gap-4">
                <h4 className="font-bold text-xl">Toplam Üçgen Sayısı:</h4>
                <div className="w-24 h-16 border-2 border-zinc-400 rounded-lg"></div>
            </div>
        </div>
    </div>
);

export const FutoshikiSheet: React.FC<{ data: FutoshikiData | FutoshikiLengthData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => {
                const cellSize = 50;
                const gap = 20;
                const totalSize = puzzle.size * cellSize + (puzzle.size - 1) * gap;
                // Cast numbers to ensure flat() works as expected on the union
                const numbers = ('units' in puzzle ? puzzle.units : puzzle.numbers) as (string | number | null)[][];

                return (
                    <div key={index} className="flex justify-center">
                        <svg width={totalSize} height={totalSize}>
                            {/* Cells */}
                            {(numbers || []).flat().map((num, i) => {
                                const row = Math.floor(i / puzzle.size);
                                const col = i % puzzle.size;
                                return (
                                    <g key={`cell-${row}-${col}`}>
                                        <rect x={col * (cellSize + gap)} y={row * (cellSize + gap)} width={cellSize} height={cellSize}
                                            className="fill-white dark:fill-zinc-700 stroke-zinc-400 dark:stroke-zinc-500" strokeWidth="2" />
                                        <text x={col * (cellSize + gap) + cellSize / 2} y={row * (cellSize + gap) + cellSize / 2}
                                            textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold fill-current">
                                            {num}
                                        </text>
                                    </g>
                                )
                            })}
                            {/* Constraints */}
                            {(puzzle.constraints || []).map((c, i) => {
                                const isHorizontal = c.row1 === c.row2;
                                const x = isHorizontal ? c.col1 * (cellSize + gap) + cellSize + gap / 2 : c.col1 * (cellSize + gap) + cellSize / 2;
                                const y = isHorizontal ? c.row1 * (cellSize + gap) + cellSize / 2 : c.row1 * (cellSize + gap) + cellSize + gap / 2;
                                return (
                                    <text key={`c-${i}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-red-500">
                                        {c.symbol}
                                    </text>
                                )
                            })}
                        </svg>
                    </div>
                );
            })}
        </div>
    </div>
);

export const NumberPyramidSheet: React.FC<{ data: NumberPyramidData | DivisionPyramidData | MultiplicationPyramidData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 justify-items-center">
            {(data.pyramids || []).map((pyramid, index) => (
                <div key={index}>
                    {'title' in pyramid && <h4 className="font-bold text-center mb-2">{pyramid.title}</h4>}
                    <div className="flex flex-col items-center gap-1">
                        {(pyramid.rows || []).map((row, rIndex) => (
                            <div key={rIndex} className="flex gap-1">
                                {(row || []).map((cell, cIndex) => (
                                    <div key={cIndex} className="w-12 h-12 flex items-center justify-center border-2 rounded-md bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
                                        {cell !== null ? <span className="text-lg font-bold">{cell}</span> : ''}
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

export const NumberCapsuleSheet: React.FC<{ data: NumberCapsuleData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        {(data.puzzles || []).map((puzzle, index) => (
             <div key={index}>
                <h4 className="font-semibold text-center mb-2">{puzzle.title} (Kullanılacak sayılar: {puzzle.numbersToUse})</h4>
                <CagedGridSvg 
                    size={puzzle.grid.length}
                    cages={puzzle.capsules.map(cap => ({ cells: cap.cells, target: cap.sum }))}
                    gridData={puzzle.grid}
                />
             </div>
        ))}
    </div>
);

export const OddEvenSudokuSheet: React.FC<{ data: OddEvenSudokuData | Sudoku6x6ShadedData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 gap-8 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                 <div key={index} className="w-96">
                    <div className="grid grid-cols-6 border-2 border-zinc-900 dark:border-zinc-500">
                        {(puzzle.grid || []).flat().map((cell, i) => {
                            const row = Math.floor(i / 6);
                            const col = i % 6;
                            const isConstrained = ('constrainedCells' in puzzle ? puzzle.constrainedCells : puzzle.shadedCells).some(c => c.row === row && c.col === col);
                            const borderRight = (col === 2) ? 'border-r-2 border-zinc-900 dark:border-zinc-500' : '';
                            const borderBottom = (row === 1 || row === 3) ? 'border-b-2 border-zinc-900 dark:border-zinc-500' : '';
                            return(
                                <div key={i} className={`w-16 h-16 flex items-center justify-center border text-2xl font-bold ${isConstrained ? 'bg-zinc-200 dark:bg-zinc-600' : 'bg-white dark:bg-zinc-700'} ${borderRight} ${borderBottom}`} style={{borderColor: 'var(--worksheet-border-color)'}}>
                                    {cell as React.ReactNode}
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const RomanNumeralStarHuntSheet: React.FC<{data: RomanNumeralStarHuntData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <GridComponent grid={data.grid} cellClassName="w-12 h-12" />
        <p className="text-center font-bold mt-4">Toplam Yıldız Sayısı: {data.starCount}</p>
    </div>
)

export const RoundingConnectSheet: React.FC<{data: RoundingConnectData | ArithmeticConnectData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <p className="text-center font-semibold text-indigo-500 mb-6">{data.example}</p>
        <div className="relative w-full h-[400px] border-2 border-dashed rounded-lg p-4" style={{borderColor: 'var(--worksheet-border-color)'}}>
            {('numbers' in data ? data.numbers : data.expressions).map((item, index) => {
                // FIX: Cast `item` to a wider type to help TypeScript correctly infer properties from the union type.
                const typedItem = item as { text?: string; value: number; x: number; y: number };
                return (
                    <div key={index} className="absolute p-2 bg-amber-100 dark:bg-amber-800/50 rounded-lg" style={{left: `${typedItem.x}%`, top: `${typedItem.y}%`}}>
                        {typedItem.text ?? typedItem.value}
                    </div>
                );
            })}
        </div>
    </div>
);

export const RomanNumeralMultiplicationSheet: React.FC<{data: RomanNumeralMultiplicationData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
         <div className="grid grid-cols-2 gap-8 justify-items-center">
            {(data.puzzles || []).map((p, i) => (
                <div key={i} className="grid grid-cols-3 w-48 text-center text-lg font-bold">
                    <div className="w-16 h-16 flex items-center justify-center text-red-500"><i className="fa-solid fa-times"></i></div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 rounded-t-lg">{p.col1}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 rounded-t-lg">{p.col2}</div>

                    <div className="w-16 h-16 flex items-center justify-center border-2 rounded-l-lg">{p.row1}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 bg-zinc-100 dark:bg-zinc-700/50">{p.results.r1c1}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 bg-zinc-100 dark:bg-zinc-700/50">{p.results.r1c2}</div>

                    <div className="w-16 h-16 flex items-center justify-center border-2 rounded-l-lg">{p.row2}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 bg-zinc-100 dark:bg-zinc-700/50">{p.results.r2c1}</div>
                    <div className="w-16 h-16 flex items-center justify-center border-2 bg-zinc-100 dark:bg-zinc-700/50">{p.results.r2c2}</div>
                </div>
            ))}
        </div>
    </div>
)

export const KendokuSheet: React.FC<{ data: KendokuData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        {(data.puzzles || []).map((puzzle, index) => (
             <div key={index}>
                <CagedGridSvg 
                    size={puzzle.size}
                    cages={puzzle.cages}
                    gridData={puzzle.grid}
                />
             </div>
        ))}
    </div>
)

export const OperationSquareSheet: React.FC<{data: OperationSquareSubtractionData | OperationSquareFillInData | OperationSquareMultDivData}> = ({data}) => {
    // FIX: Refactored the component to use a type-guarded variable to resolve a complex TypeScript inference issue where 'numbersToUse' was being treated as 'unknown'.
    const isFillInPuzzle = 'puzzles' in data && !!data.puzzles?.[0] && 'numbersToUse' in (data as any).puzzles[0];
    const fillInPuzzleData = isFillInPuzzle ? (data as OperationSquareFillInData) : null;

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
                {(data.puzzles || []).map((puzzle, index) => (
                    <div key={index} className="p-2 bg-white dark:bg-zinc-700/50 rounded-lg shadow-inner">
                        {/* FIX: Cast `puzzle` to a type with a grid property to avoid type errors on union types. */}
                        <GridComponent grid={(puzzle as {grid: (string | null)[][]}).grid} cellClassName="w-12 h-12" />
                    </div>
                ))}
            </div>
            {fillInPuzzleData && fillInPuzzleData.puzzles[0].numbersToUse && (
                <div className="mt-4 text-center">
                    <h4 className="font-semibold">Kullanılacak Sayılar:</h4>
                    <p>{fillInPuzzleData.puzzles[0].numbersToUse.join(', ')}</p>
                </div>
            )}
        </div>
    );
};

export const TargetNumberSheet: React.FC<{ data: TargetNumberData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-4">
            {(data.puzzles || []).map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="text-center">
                        <p className="font-bold text-lg">Hedef</p>
                        <div className="w-16 h-16 flex items-center justify-center bg-red-500 text-white font-bold text-2xl rounded-full">{p.target}</div>
                    </div>
                    <div className="flex-1 flex gap-2 justify-center">
                        {(p.givenNumbers || []).map((n, j) => <div key={j} className="w-12 h-12 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 font-bold text-xl rounded-md">{n}</div>)}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const MultiplicationWheelSheet: React.FC<{ data: MultiplicationWheelData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="relative w-48 h-48">
                    {/* Outer numbers */}
                    {(puzzle.outerNumbers || []).map((num, i) => {
                        const angle = i * (360 / (puzzle.outerNumbers || []).length) - 90;
                        const x = 50 + 40 * Math.cos(angle * Math.PI / 180);
                        const y = 50 + 40 * Math.sin(angle * Math.PI / 180);
                        return (
                            <div key={i} className="absolute w-10 h-10 border-2 rounded-full flex items-center justify-center bg-white dark:bg-zinc-700"
                                style={{ top: `calc(${y}% - 20px)`, left: `calc(${x}% - 20px)`}}>
                                {num}
                            </div>
                        );
                    })}
                    {/* Center number */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-amber-200 dark:bg-amber-800 rounded-full flex items-center justify-center font-bold text-xl border-2 border-amber-400">
                        {puzzle.innerResult}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ShapeSudokuSheet: React.FC<{ data: ShapeSudokuData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 gap-8 justify-items-center">
            {/* ... implementation for ShapeSudoku ... */}
        </div>
    </div>
);

export const VisualNumberPatternSheet: React.FC<{ data: VisualNumberPatternData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="p-4 border rounded-lg" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="flex justify-center items-center gap-4 mb-4">
                        {(puzzle.items || []).map((item, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="rounded-full flex items-center justify-center font-bold text-white"
                                    style={{ backgroundColor: item.color, width: `${item.size * 2}rem`, height: `${item.size * 2}rem` }}>
                                    {item.number}
                                </div>
                            </div>
                        ))}
                        <div className="w-12 h-12 border-2 border-dashed rounded-full flex items-center justify-center font-bold">?</div>
                    </div>
                    <p className="text-center text-sm italic">Kural: {puzzle.rule}</p>
                </div>
            ))}
        </div>
    </div>
);

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h4 className="font-bold mb-2">İpuçları</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    {(data.clues || []).map((clue, i) => <li key={i}>{clue}</li>)}
                </ul>
            </div>
            <div>
                {/* Simplified grid display */}
                <table className="w-full border-collapse border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                     <thead>
                        <tr className="bg-zinc-100 dark:bg-zinc-700">
                            <th className="border p-2" style={{borderColor: 'var(--worksheet-border-color)'}}></th>
                            {(data.categories?.[0]?.items || []).map(item => <th key={item.name} className="border p-1 text-xs" style={{borderColor: 'var(--worksheet-border-color)'}}>{item.name}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {(data.people || []).map(person => (
                            <tr key={person}>
                                <th className="border p-2 text-left text-sm" style={{borderColor: 'var(--worksheet-border-color)'}}>{person}</th>
                                {Array.from({length: (data.categories?.[0]?.items || []).length}).map((_, i) => (
                                    <td key={i} className="border text-center" style={{borderColor: 'var(--worksheet-border-color)'}}>
                                        <div className="w-8 h-8"></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);
