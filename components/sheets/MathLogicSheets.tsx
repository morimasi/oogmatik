
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, FutoshikiData, FutoshikiLengthData, NumberPyramidData, DivisionPyramidData, MultiplicationPyramidData,
    NumberCapsuleData, OddEvenSudokuData, Sudoku6x6ShadedData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareSubtractionData, OperationSquareFillInData, OperationSquareMultDivData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, MultiplicationWheelData, ShapeNumberPatternData, ShapeCountingData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay } from './common';
import { PedagogicalHeader } from './common';

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.puzzles || []).map((puzzle, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <p className="font-semibold text-lg text-center mb-3">{puzzle.problem}</p>
                    <p className="text-sm text-center text-zinc-500 dark:text-zinc-400 mb-4">{puzzle.question}</p>
                    <div className="flex items-center justify-center">
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
        
        return (
            <svg width={totalSize + 20} height={totalSize + 20} className="mx-auto">
                {/* Cells */}
                {Array.from({length: size}).map((_, r) => 
                    Array.from({length: size}).map((_, c) => {
                        const x = c * (cellSize + gap) + 10;
                        const y = r * (cellSize + gap) + 10;
                        const val = puzzle.numbers[r][c];
                        return (
                            <g key={`${r}-${c}`}>
                                <rect x={x} y={y} width={cellSize} height={cellSize} className="fill-white stroke-zinc-800" strokeWidth="2" />
                                {val !== null && (
                                    <text x={x + cellSize/2} y={y + cellSize/2 + 5} textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold">{val}</text>
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
        <div className="flex justify-center">
             <GridComponent grid={data.puzzles[0].grid} cellClassName="w-16 h-16 text-2xl" />
        </div>
    </div>
);

// Placeholder fallbacks for other components, applying the header pattern
const createSimpleMathSheet = (name: string) => ({ data }: { data: any }) => (
  <div>
      <PedagogicalHeader title={data.title || name} instruction={data.instruction || data.prompt || ""} note={data.pedagogicalNote} />
      <div className="p-4 text-center text-zinc-500 italic">İçerik oluşturuldu.</div>
  </div>
);

export const NumberCapsuleSheet = createSimpleMathSheet('Kapsül Oyunu');
export const RomanNumeralStarHuntSheet: React.FC<{ data: RomanNumeralStarHuntData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <GridComponent grid={data.grid} />
    </div>
);
export const RoundingConnectSheet = createSimpleMathSheet('Yuvarlama Bağlamaca');
export const RomanNumeralMultiplicationSheet = createSimpleMathSheet('Romen Rakamı Çarpma');
export const TargetNumberSheet = createSimpleMathSheet('Hedef Sayı');
export const ShapeSudokuSheet = createSimpleMathSheet('Şekilli Sudoku');
export const VisualNumberPatternSheet = createSimpleMathSheet('Görsel Sayı Örüntüsü');
export const LogicGridPuzzleSheet = createSimpleMathSheet('Mantık Karesi');
export const MultiplicationWheelSheet = createSimpleMathSheet('Çarpım Çarkı');
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
export const ShapeNumberPatternSheet = createSimpleMathSheet('Şekilli Sayı Örüntüsü');
export const ShapeCountingSheet = createSimpleMathSheet('Şekil Sayma');
export const ThematicOddOneOutSheet = createSimpleMathSheet('Tematik Farkı Bul');
export const ThematicOddOneOutSentenceSheet = createSimpleMathSheet('Tematik Cümle');
export const ColumnOddOneOutSentenceSheet = createSimpleMathSheet('Sütun Farkı Cümle');
export const PunctuationMazeSheet = createSimpleMathSheet('Noktalama Labirenti');
export const PunctuationPhoneNumberSheet = createSimpleMathSheet('Noktalama Telefonu');
