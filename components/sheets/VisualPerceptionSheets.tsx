import React from 'react';
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, RomanNumeralConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, WordConnectData, CoordinateCipherData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeType
} from '../../types';
import { ShapeDisplay, SegmentDisplay, GridComponent, ImageDisplay } from './common';

export const FindTheDifferenceSheet: React.FC<{ data: FindTheDifferenceData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Her satırda diğerlerinden farklı olan kelimeyi bulup işaretleyin.</p>
        <div className="space-y-4 max-w-2xl mx-auto">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-around p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    {(row.items || []).map((item, itemIndex) => (
                         <div key={itemIndex} className="flex items-center gap-2">
                             <div className="w-6 h-6 border-2 border-zinc-400 rounded-full shrink-0"></div>
                             <span className="text-lg capitalize">{item}</span>
                         </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const WordComparisonSheet: React.FC<{ data: WordComparisonData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Her iki kutucukta da bulunmayan kelimeleri aşağıdaki boş alana yazın.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="p-4 border-4 border-dashed border-sky-300 rounded-lg">
                <h4 className="text-lg font-bold mb-2 text-center text-sky-700 dark:text-sky-300">{data.box1Title}</h4>
                <ul className="space-y-1 text-center">
                    {(data.wordList1 || []).map((word, i) => <li key={i} className="capitalize">{word}</li>)}
                </ul>
            </div>
            <div className="p-4 border-4 border-dashed border-rose-300 rounded-lg">
                <h4 className="text-lg font-bold mb-2 text-center text-rose-700 dark:text-rose-300">{data.box2Title}</h4>
                <ul className="space-y-1 text-center">
                     {(data.wordList2 || []).map((word, i) => <li key={i} className="capitalize">{word}</li>)}
                </ul>
            </div>
        </div>
        <div>
             <h4 className="font-semibold mb-2">Farklı Kelimeler:</h4>
             <div className="w-full h-40 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-md p-2" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}></div>
        </div>
    </div>
);

export const ShapeMatchingSheet: React.FC<{ data: ShapeMatchingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Soldaki şekil gruplarını sağdaki eşleriyle eşleştirin.</p>
        <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-x-16 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                    {(data.leftColumn || []).map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-2 border-2 border-blue-300 rounded-lg bg-blue-50 dark:bg-zinc-700/50">
                            <span className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white font-bold rounded-full">{item.id}</span>
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                    ))}
                </div>
                {/* Right Column */}
                <div className="space-y-4">
                    {(data.rightColumn || []).map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-2 border-2 border-red-300 rounded-lg bg-red-50 dark:bg-zinc-700/50">
                            <span className="flex items-center justify-center w-8 h-8 bg-red-500 text-white font-bold rounded-full">{item.id}</span>
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const FindIdenticalWordSheet: React.FC<{ data: FindIdenticalWordData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki her grupta birbirinin aynısı olan kelime çiftini bulup işaretleyin.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(data.groups || []).map((group, index) => (
                <div key={index} className="flex items-center p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                    <div className="w-6 h-6 border-2 border-zinc-400 rounded-full mr-4 shrink-0"></div>
                    <div className="flex flex-col">
                        <span className="text-lg">{group.words?.[0]}</span>
                        <span className="text-lg">{group.words?.[1]}</span>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const GridDrawingSheet: React.FC<{ data: GridDrawingData }> = ({ data }) => {
    const gridDim = data.gridDim;
    const cellSize = 40;
    const totalSize = gridDim * cellSize;

    const renderGrid = (lines: [number, number][][] | null) => (
        <svg width={totalSize} height={totalSize} className="bg-amber-50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-600">
            {/* Grid lines */}
            {Array.from({ length: gridDim + 1 }).map((_, i) => (
                <g key={i}>
                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
                </g>
            ))}
            {/* Pattern lines */}
            {(lines || []).map((line, index) => (
                <line
                    key={index}
                    x1={line[0][0] * cellSize}
                    y1={line[0][1] * cellSize}
                    x2={line[1][0] * cellSize}
                    y2={line[1][1] * cellSize}
                    className="stroke-red-500"
                    strokeWidth="3"
                    strokeLinecap="round"
                />
            ))}
        </svg>
    );

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Soldaki görsellerin aynısını sağ taraftaki alana çizin.</p>
            <div className="space-y-8">
                {(data.drawings || []).map((drawing, index) => (
                    <div key={index} className="grid grid-cols-2 gap-8 items-center justify-items-center">
                        {renderGrid(drawing.lines)}
                        {renderGrid(null)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SymbolCipherSheet: React.FC<{ data: SymbolCipherData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki anahtarı kullanarak şekillerle yazılmış kelimeleri çözün.</p>
        {/* Key */}
        <div className="flex justify-center items-center gap-4 flex-wrap p-4 bg-amber-100 dark:bg-zinc-700/50 rounded-lg mb-8 border-2 border-dashed border-amber-400">
            {(data.cipherKey || []).map(keyItem => (
                <div key={keyItem.letter} className="flex items-center gap-2">
                    <ShapeDisplay shapes={[keyItem.shape]} />
                    <span className="font-bold text-xl">=</span>
                    <span className="font-bold text-xl">{keyItem.letter.toUpperCase()}</span>
                </div>
            ))}
        </div>
        {/* Words to solve */}
        <div className="space-y-6 max-w-lg mx-auto">
            {(data.wordsToSolve || []).map((word, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="flex-1 p-2 rounded-lg bg-white dark:bg-zinc-700/50">
                        <ShapeDisplay shapes={word.shapeSequence} />
                    </div>
                    <i className="fa-solid fa-arrow-right text-2xl text-zinc-400"></i>
                    <div className="flex-1 flex justify-center gap-1">
                        {Array.from({ length: word.wordLength }).map((_, i) => (
                            <div key={i} className="w-10 h-12 border-b-2 border-zinc-500"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const BlockPaintingSheet: React.FC<{ data: BlockPaintingData }> = ({ data }) => {
    const { grid: { rows, cols }, shapes } = data;
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center mb-6">{data.prompt}</p>
            <div className="flex gap-8 justify-center">
                <div>
                    <h4 className="font-semibold text-center mb-2">Desen</h4>
                    <div className={`grid gap-px bg-zinc-300 dark:bg-zinc-600`} style={{gridTemplateColumns: `repeat(${cols}, 25px)`}}>
                        {Array.from({length: rows * cols}).map((_, i) => (
                            <div key={i} className="w-[25px] h-[25px] bg-white dark:bg-zinc-800"></div>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-center mb-2">Bloklar</h4>
                    <div className="space-y-4">
                        {(shapes || []).map((shape, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className={`grid gap-px`} style={{gridTemplateColumns: `repeat(${(shape.pattern || [[]])[0].length}, 15px)`}}>
                                    {(shape.pattern || []).flat().map((cell, j) => (
                                        <div key={j} className="w-[15px] h-[15px]" style={{backgroundColor: cell ? shape.color : 'transparent'}}></div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

export const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-6">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-around p-4 border rounded-lg bg-white dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    {(row.items || []).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex flex-col items-center gap-2">
                            <SegmentDisplay segments={item.segments} />
                            <div className="w-6 h-6 border-2 border-zinc-400 rounded-full"></div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => {
    const { gridDim, dots, axis } = data;
    const cellSize = 30;
    const totalSize = gridDim * cellSize;

    const renderGrid = (dotsToDraw: { x: number; y: number }[] | null) => (
        <svg width={totalSize} height={totalSize} className="bg-white dark:bg-zinc-700/50 border border-zinc-300 dark:border-zinc-600">
            {/* Grid lines */}
            {Array.from({ length: gridDim + 1 }).map((_, i) => (
                <g key={i}>
                    <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-200 dark:stroke-zinc-500" strokeWidth="0.5" />
                    <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-200 dark:stroke-zinc-500" strokeWidth="0.5" />
                </g>
            ))}
            {/* Symmetry axis */}
            <line
                x1={axis === 'vertical' ? totalSize / 2 : 0}
                y1={axis === 'vertical' ? 0 : totalSize / 2}
                x2={axis === 'vertical' ? totalSize / 2 : totalSize}
                y2={axis === 'vertical' ? totalSize : totalSize / 2}
                className="stroke-red-500"
                strokeWidth="2"
                strokeDasharray="4"
            />
            {/* Dots */}
            {(dotsToDraw || []).map((dot, index) => (
                <circle key={index} cx={dot.x * cellSize + cellSize / 2} cy={dot.y * cellSize + cellSize / 2} r="5" className="fill-blue-500" />
            ))}
        </svg>
    );

    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-items-center">
                {renderGrid(dots)}
                {renderGrid(null)}
            </div>
        </div>
    );
};

export const FindDifferentStringSheet: React.FC<{ data: FindDifferentStringData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="space-y-4">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-around p-3 bg-white dark:bg-zinc-700/50 rounded-lg border" style={{ borderColor: 'var(--worksheet-border-color)' }}>
                    {(row.items || []).map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-2">
                            <span className="font-mono text-lg">{item}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const DotPaintingSheet: React.FC<{ data: DotPaintingData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-2">{data.prompt1}</p>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt2}</p>
        <div className="flex justify-center">
            <svg viewBox={data.svgViewBox} className="w-full max-w-lg border rounded-lg" style={{ borderColor: 'var(--worksheet-border-color)' }}>
                {(data.gridPaths || []).map((path, index) => (
                    <path key={`grid-${index}`} d={path} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="0.5" />
                ))}
                {(data.dots || []).map((dot, index) => (
                    <circle key={`dot-${index}`} cx={dot.cx} cy={dot.cy} r="1.5" style={{ fill: dot.color }} />
                ))}
            </svg>
        </div>
    </div>
);

export const AbcConnectSheet: React.FC<{ data: AbcConnectData | RomanNumeralConnectData | RomanArabicMatchConnectData | WeightConnectData | LengthConnectData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{'prompt' in data ? data.prompt : ''}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
            {('puzzles' in data && data.puzzles ? data.puzzles : [{...data, id:1}]).map(puzzle => {
                const cellSize = 40;
                const totalSize = puzzle.gridDim * cellSize;
                return (
                    <svg key={'id' in puzzle ? puzzle.id : 1} width={totalSize} height={totalSize} className="bg-white dark:bg-zinc-700/50 border border-zinc-300 dark:border-zinc-600">
                        {Array.from({ length: puzzle.gridDim + 1 }).map((_, i) => (
                            <g key={i}>
                                <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-200 dark:stroke-zinc-500" strokeWidth="0.5" />
                                <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-200 dark:stroke-zinc-500" strokeWidth="0.5" />
                            </g>
                        ))}
                        {(puzzle.points || []).map((p, i) => {
                            // FIX: Refactored the map function to use a block body and cast the iterated item 'p' to a wider type.
                            // This helps TypeScript resolve the complex union of point types which was being inferred as 'never', causing an error on property access.
                            const point = p as { x: number; y: number; letter?: string; label?: string };
                            const label = point.letter || point.label;
                            return (
                                <text key={i} x={point.x * cellSize + cellSize / 2} y={point.y * cellSize + cellSize / 2} textAnchor="middle" dominantBaseline="middle" className="font-bold text-sm fill-current">{label}</text>
                            )
                        })}
                    </svg>
                )
            })}
        </div>
    </div>
);

export const WordConnectSheet: React.FC<{ data: WordConnectData }> = ({ data }) => {
    const cellSize = 60;
    const totalSize = data.gridDim * cellSize;
    return (
        <div>
            <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
            <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
            <div className="flex justify-center">
                 <svg width={totalSize} height={totalSize} className="bg-white dark:bg-zinc-700/50 border border-zinc-300 dark:border-zinc-600 rounded-lg">
                    {(data.points || []).map((p, i) => (
                         <text key={i} x={p.x * cellSize + cellSize / 2} y={p.y * cellSize + cellSize / 2} textAnchor="middle" dominantBaseline="middle" className="font-semibold text-sm fill-current">{p.word}</text>
                    ))}
                </svg>
            </div>
        </div>
    )
};

export const CoordinateCipherSheet: React.FC<{ data: CoordinateCipherData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">Aşağıdaki kelimeleri bulmacada bulun. Sonra, şifre kutucuklarında verilen koordinatlardaki harfleri birleştirerek gizemli kelimeyi çözün.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white dark:bg-zinc-700/30 p-2 rounded-lg shadow-inner">
                <table className="table-fixed w-full">
                    <thead>
                        <tr>
                            <th className="w-6 h-6"></th>
                            {(data.grid?.[0] || []).map((_, colIndex) => (
                                <th key={colIndex} className="font-mono text-center">{colIndex + 1}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data.grid || []).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                            <th className="font-mono text-center">{String.fromCharCode(65 + rowIndex)}</th>
                            {(row || []).map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-zinc-300 dark:border-zinc-600 text-center font-mono text-lg w-8 h-8" style={{borderColor: 'var(--worksheet-border-color)', borderWidth: 'var(--worksheet-border-width)'}}>
                                {cell.toUpperCase()}
                            </td>
                            ))}
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div>
                <h4 className="font-bold mb-2 text-indigo-600 dark:text-indigo-400">Aranacak Kelimeler:</h4>
                <ul className="list-disc list-inside space-y-1">
                {(data.wordsToFind || []).map((word, index) => (
                    <li key={index} className="capitalize">{word}</li>
                ))}
                </ul>
            </div>
        </div>

        <div className="mt-8">
            <h4 className="font-bold mb-4 text-center text-xl">ŞİFRE</h4>
            <div className="flex justify-center flex-wrap gap-3">
                {(data.cipherCoordinates || []).map((coord, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="w-12 h-12 border-b-2 border-zinc-500"></div>
                        <div className="px-2 py-1 bg-zinc-200 dark:bg-zinc-600 text-xs font-mono rounded-b-md">{coord}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const ProfessionConnectSheet: React.FC<{ data: ProfessionConnectData }> = ({ data }) => (
    <div>
        {/* Placeholder implementation */}
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const MatchstickSymmetrySheet: React.FC<{ data: MatchstickSymmetryData }> = ({ data }) => (
    <div>
        {/* Placeholder implementation */}
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const VisualOddOneOutThemedSheet: React.FC<{ data: VisualOddOneOutThemedData }> = ({ data }) => (
    <div>
        {/* Placeholder implementation */}
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
    </div>
);

export const PunctuationColoringSheet: React.FC<{ data: PunctuationColoringData }> = ({ data }) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center mb-8">
            <div className="w-80 h-80 border-2 rounded-lg flex items-center justify-center" style={{borderColor: 'var(--worksheet-border-color)'}}>
                <i className="fa-solid fa-paint-brush fa-5x text-zinc-300 dark:text-zinc-600"></i>
            </div>
        </div>
        <div className="space-y-4">
            {(data.sentences || []).map((sentence, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-white dark:bg-zinc-700/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full" style={{backgroundColor: sentence.color}}></div>
                    <p className="flex-1 text-lg">{sentence.text}</p>
                    <div className="w-8 h-8 border-2 border-zinc-400 rounded-lg"></div>
                </div>
            ))}
        </div>
    </div>
);

export const SynonymAntonymColoringSheet: React.FC<{data: SynonymAntonymColoringData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <div className="flex justify-center mb-8">
            <div className="relative w-80 h-80 border-2 rounded-lg flex items-center justify-center bg-zinc-50 dark:bg-zinc-700/50" style={{borderColor: 'var(--worksheet-border-color)'}}>
                <i className="fa-solid fa-tree fa-6x text-zinc-300 dark:text-zinc-600"></i>
                {(data.wordsOnImage || []).map(item => (
                    <span key={item.word} className="absolute p-2 bg-white/50 dark:bg-zinc-800/50 rounded" style={{left: `${item.x}%`, top: `${item.y}%`}}>{item.word}</span>
                ))}
            </div>
        </div>
         <div className="grid grid-cols-2 gap-4">
            {(data.colorKey || []).map((key, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white dark:bg-zinc-700/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full" style={{backgroundColor: key.color}}></div>
                    <p>{key.text}</p>
                </div>
            ))}
        </div>
    </div>
);

export const StarHuntSheet: React.FC<{data: StarHuntData}> = ({data}) => (
    <div>
        <h3 className="text-2xl font-bold mb-4 text-center">{data.title}</h3>
        <p className="text-center text-zinc-600 dark:text-zinc-400 mb-6">{data.prompt}</p>
        <GridComponent grid={data.grid} />
    </div>
)
