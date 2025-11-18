import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData,
    ShapeNumberPatternData, ShapeCountingData, FutoshikiData, FutoshikiLengthData, NumberPyramidData, DivisionPyramidData, MultiplicationPyramidData,
    NumberCapsuleData, OddEvenSudokuData, Sudoku6x6ShadedData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareSubtractionData, OperationSquareFillInData, OperationSquareMultDivData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, MultiplicationWheelData
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay } from './common';

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
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
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki sayı dizilerindeki kuralı bulun ve "?" ile gösterilen yere gelmesi gereken sayıyı yazın.</p>
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

export const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki her grupta, anlamsal olarak diğerlerinden farklı olan kelimeyi bulup işaretleyin.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.groups || []).map((group, index) => (
                <div key={index} className="p-4 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="grid grid-cols-2 gap-4">
                        {(group.words || []).map((word, wordIndex) => (
                            <div key={wordIndex} className="flex items-center">
                                <div className="w-5 h-5 border-2 border-zinc-400 rounded-full mr-3"></div>
                                <label className="text-lg capitalize">{word}</label>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const ShapeNumberPatternSheet: React.FC<{ data: ShapeNumberPatternData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Şekillerin içindeki sayılar arasındaki kuralı bulun ve soru işaretli yere gelmesi gereken sayıyı yazın.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {(data.patterns || []).map((pattern, index) => (
                 <div key={index} className="flex items-center gap-4">
                    {(pattern.shapes || []).map((shape, sIndex) => (
                        <div key={sIndex} className="relative w-24 h-24">
                           <svg viewBox="0 0 100 100" className="w-full h-full">
                                <polygon points="50,5 95,95 5,95" className="fill-amber-100 dark:fill-amber-900/50 stroke-amber-400" strokeWidth="2" />
                                <text x="50" y="35" textAnchor="middle" className="font-bold text-lg fill-current">{shape.numbers[0]}</text>
                                <text x="25" y="80" textAnchor="middle" className="font-bold text-lg fill-current">{shape.numbers[1]}</text>
                                <text x="75" y="80" textAnchor="middle" className="font-bold text-lg fill-current">{shape.numbers[2]}</text>
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
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center mb-6">
            <svg viewBox="0 0 200 200" className="w-80 h-80 bg-white dark:bg-zinc-700/30 p-2 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)'}}>
                {(data.figures?.[0]?.svgPaths || []).map((path, i) => <path key={i} d={path.d} style={{fill: path.fill}} className="stroke-zinc-800 dark:stroke-zinc-100" strokeWidth="0.5" />)}
            </svg>
        </div>
        <div className="flex justify-center items-center gap-4">
            <h4 className="font-bold text-xl">Toplam Üçgen Sayısı:</h4>
            <div className="w-24 h-16 border-2 border-zinc-400 rounded-lg"></div>
        </div>
    </div>
);

export const FutoshikiSheet: React.FC<{ data: FutoshikiData | FutoshikiLengthData }> = ({ data }) => {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            {/* Implementation for Futoshiki grid display */}
        </div>
    );
};

export const NumberPyramidSheet: React.FC<{ data: NumberPyramidData | DivisionPyramidData | MultiplicationPyramidData }> = ({ data }) => {
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            {/* Implementation for Number Pyramid display */}
        </div>
    );
};

export const NumberCapsuleSheet: React.FC<{ data: NumberCapsuleData }> = ({ data }) => {
     return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        </div>
    );
};

export const OddEvenSudokuSheet: React.FC<{ data: OddEvenSudokuData | Sudoku6x6ShadedData }> = ({ data }) => {
    const puzzle = data.puzzles?.[0];
    if (!puzzle) return null;
    // FIX: Removed incorrect type cast. `puzzle` is an element of the `puzzles` array, not the `OddEvenSudokuData` object itself.
    // The `grid` property exists on both possible types within the `puzzle` union type.
    const grid = puzzle.grid;
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            <div className="flex justify-center">
                <div className="grid grid-cols-6 border-2 border-zinc-900 dark:border-zinc-400">
                    {(grid || []).map((row, rIndex) => (
                        (row || []).map((cell, cIndex) => {
                            const isConstrained = 'constrainedCells' in puzzle && puzzle.constrainedCells?.some(c => c.row === rIndex && c.col === cIndex);
                            const isShaded = 'shadedCells' in puzzle && puzzle.shadedCells?.some(c => c.row === rIndex && c.col === cIndex);
                            const borderRight = (cIndex === 1 || cIndex === 3) ? 'border-r-2 border-zinc-600 dark:border-zinc-400' : 'border-r';
                            const borderBottom = (rIndex === 2) ? 'border-b-2 border-zinc-600 dark:border-zinc-400' : 'border-b';
                            return (
                                <div key={`${rIndex}-${cIndex}`} className={`w-12 h-12 flex items-center justify-center text-2xl font-bold border-zinc-300 dark:border-zinc-600 ${borderRight} ${borderBottom} ${isConstrained || isShaded ? 'bg-zinc-200 dark:bg-zinc-600' : ''}`}>
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

export const RomanNumeralStarHuntSheet: React.FC<{ data: RomanNumeralStarHuntData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <GridComponent grid={data.grid} />
    </div>
);

export const RoundingConnectSheet: React.FC<{ data: RoundingConnectData | ArithmeticConnectData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const RomanNumeralMultiplicationSheet: React.FC<{ data: RomanNumeralMultiplicationData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const KendokuSheet: React.FC<{ data: KendokuData }> = ({ data }) => {
    const puzzle = data.puzzles?.[0];
    if (!puzzle) return null;
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            <CagedGridSvg size={puzzle.size} cages={puzzle.cages} gridData={puzzle.grid} />
        </div>
    );
};

export const OperationSquareSheet: React.FC<{ data: OperationSquareSubtractionData | OperationSquareFillInData | OperationSquareMultDivData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        {/* Simplified grid display */}
        <GridComponent grid={data.puzzles[0].grid} />
    </div>
);

export const TargetNumberSheet: React.FC<{ data: TargetNumberData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const ShapeSudokuSheet: React.FC<{ data: ShapeSudokuData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const VisualNumberPatternSheet: React.FC<{ data: VisualNumberPatternData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="grid grid-cols-2 gap-8">
            <div>
                <h4 className="font-bold mb-2">İpuçları</h4>
                <ul className="list-decimal list-inside space-y-2">
                    {(data.clues || []).map((clue, i) => <li key={i}>{clue}</li>)}
                </ul>
            </div>
            <div>
                {(data.categories || []).map(cat => (
                    <div key={cat.title} className="mb-4">
                         <h4 className="font-bold">{cat.title}</h4>
                         <div className="flex gap-2">
                            {(cat.items || []).map(item => (
                                <ImageDisplay key={item.name} description={item.name} base64={item.imageBase64} className="w-20 h-20" />
                            ))}
                         </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const MultiplicationWheelSheet: React.FC<{ data: MultiplicationWheelData }> = ({ data }) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const ThematicOddOneOutSheet: React.FC<{data: ThematicOddOneOutData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
)

export const ThematicOddOneOutSentenceSheet: React.FC<{data: ThematicOddOneOutSentenceData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
)
export const ColumnOddOneOutSentenceSheet: React.FC<{data: ColumnOddOneOutSentenceData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
)

export const PunctuationMazeSheet: React.FC<{data: PunctuationMazeData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
)

export const PunctuationPhoneNumberSheet: React.FC<{data: PunctuationPhoneNumberData}> = ({data}) => (
     <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
)
