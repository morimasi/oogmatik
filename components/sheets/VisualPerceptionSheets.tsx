
import React from 'react';
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, RomanNumeralConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, WordConnectData, CoordinateCipherData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeType, ShapeCountingData,
    GeneratorOptions
} from '../../types';
// FIX: Import PedagogicalHeader from common module
import { ShapeDisplay, SegmentDisplay, GridComponent, ImageDisplay, PedagogicalHeader } from './common';
import { CONNECT_COLORS } from '../../services/offlineGenerators/helpers';

// FIX: Remove local definition of PedagogicalHeader to use the imported one.

export const FindTheDifferenceSheet: React.FC<{ data: FindTheDifferenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid max-w-3xl mx-auto">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-between p-6 border-2 rounded-xl bg-white dark:bg-zinc-700/50 shadow-sm hover:shadow-md transition-shadow break-inside-avoid" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    <div className="w-8 h-8 flex items-center justify-center bg-zinc-200 dark:bg-zinc-600 rounded-full font-bold mr-4">{index + 1}</div>
                    <div className="flex-1 flex justify-around">
                        {(row.items || []).map((item, itemIndex) => (
                            <div key={itemIndex} className="px-4 py-2 border border-dashed border-zinc-300 rounded cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                                <span className="text-2xl font-mono tracking-wider">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const WordComparisonSheet: React.FC<{ data: WordComparisonData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        {/* ADDED print:flex-row to force side-by-side printing */}
        <div className="flex flex-col md:flex-row print:flex-row gap-8 justify-center items-start">
            <div className="flex-1 bg-white dark:bg-zinc-700/50 p-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 shadow-sm w-full">
                <h4 className="font-bold text-center mb-4 text-indigo-600 dark:text-indigo-400 border-b pb-2">{data.box1Title}</h4>
                <ul className="space-y-2 text-center">
                    {(data.wordList1 || []).map((word, i) => (
                        <li key={i} className="font-medium text-lg">{word}</li>
                    ))}
                </ul>
            </div>
            
            <div className="hidden md:flex print:flex flex-col justify-center self-center text-zinc-300">
                <i className="fa-solid fa-right-left text-4xl"></i>
            </div>

            <div className="flex-1 bg-white dark:bg-zinc-700/50 p-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-600 shadow-sm w-full">
                <h4 className="font-bold text-center mb-4 text-rose-600 dark:text-rose-400 border-b pb-2">{data.box2Title}</h4>
                <ul className="space-y-2 text-center">
                    {(data.wordList2 || []).map((word, i) => (
                        <li key={i} className="font-medium text-lg">{word}</li>
                    ))}
                </ul>
            </div>
        </div>
        
        <div className="mt-8 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
            <p className="text-zinc-500 mb-2">Farklı olan kelimeleri buraya yazın:</p>
            <div className="flex gap-4 justify-center flex-wrap">
                {Array.from({length: Math.max(3, (data.correctDifferences || []).length)}).map((_, i) => (
                    <div key={i} className="w-32 h-10 border-b-2 border-zinc-400"></div>
                ))}
            </div>
        </div>
    </div>
);

export const ShapeMatchingSheet: React.FC<{ data: ShapeMatchingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        {/* ADDED print:gap-16 to maintain spacing */}
        <div className="flex justify-center gap-24 mt-8 relative print:gap-16">
             {/* Connector Lines Placeholder (Visual only, printed lines are drawn by user) */}
            <div className="absolute inset-0 flex justify-center items-center opacity-10 pointer-events-none">
                <svg className="w-full h-full"><line x1="30%" y1="10%" x2="70%" y2="90%" stroke="black" strokeWidth="2" strokeDasharray="5,5" /></svg>
            </div>

            <div className="space-y-8">
                {(data.leftColumn || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-bold">{item.id}</span>
                        <div className="p-4 border-2 border-indigo-200 rounded-lg bg-white shadow-sm w-32 h-32 flex items-center justify-center">
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                        <div className="w-4 h-4 bg-indigo-500 rounded-full"></div>
                    </div>
                ))}
            </div>
            <div className="space-y-8">
                {(data.rightColumn || []).map((item, i) => (
                    <div key={i} className="flex items-center gap-4 flex-row-reverse">
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-rose-100 text-rose-800 font-bold">{item.id}</span>
                        <div className="p-4 border-2 border-rose-200 rounded-lg bg-white shadow-sm w-32 h-32 flex items-center justify-center">
                            <ShapeDisplay shapes={item.shapes} />
                        </div>
                         <div className="w-4 h-4 bg-rose-500 rounded-full"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const FindIdenticalWordSheet: React.FC<{ data: FindIdenticalWordData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.groups || []).map((group, index) => (
                <div key={index} className="bg-white dark:bg-zinc-700/50 p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between break-inside-avoid">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded text-xl font-bold tracking-wider min-w-[100px] text-center">
                        {group.words[0]}
                    </div>
                    <div className="flex-1 flex justify-around px-8">
                        {/* Shuffle distractors and the correct answer for display */}
                        {[...group.distractors, group.words[1]].sort().map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2 cursor-pointer">
                                <div className="w-6 h-6 border-2 border-zinc-300 rounded-full"></div>
                                <span className="text-lg font-mono">{option}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const GridDrawingSheet: React.FC<{ data: GridDrawingData }> = ({ data }) => {
    const gridDim = data.gridDim;
    const cellSize = 30;
    const totalSize = gridDim * cellSize;

    const renderGrid = (lines: [number, number][][] | null, isTarget: boolean) => (
        <div className="flex flex-col items-center">
            <span className="mb-2 font-semibold text-zinc-500">{isTarget ? "Örnek" : "Senin Çizimin"}</span>
            <svg width={totalSize} height={totalSize} className={`bg-white dark:bg-zinc-800 border-2 ${isTarget ? 'border-indigo-400' : 'border-zinc-300'}`}>
                {/* Grid */}
                {Array.from({ length: gridDim + 1 }).map((_, i) => (
                    <g key={i}>
                        <line x1={i * cellSize} y1="0" x2={i * cellSize} y2={totalSize} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
                        <line x1="0" y1={i * cellSize} x2={totalSize} y2={i * cellSize} className="stroke-zinc-200 dark:stroke-zinc-600" strokeWidth="1" />
                    </g>
                ))}
                {/* Lines */}
                {(lines || []).map((line, index) => (
                    <line
                        key={index}
                        x1={line[0][0] * cellSize} y1={line[0][1] * cellSize}
                        x2={line[1][0] * cellSize} y2={line[1][1] * cellSize}
                        className="stroke-indigo-600 dark:stroke-indigo-400"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />
                ))}
                {/* Dots at intersections */}
                {Array.from({ length: (gridDim + 1) * (gridDim + 1) }).map((_, i) => {
                     const r = Math.floor(i / (gridDim + 1));
                     const c = i % (gridDim + 1);
                     return <circle key={i} cx={c*cellSize} cy={r*cellSize} r="2" className="fill-zinc-300" />
                })}
            </svg>
        </div>
    );

    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className="space-y-12">
                {(data.drawings || []).map((drawing, index) => (
                    // ADDED print:flex-row
                    <div key={index} className="flex flex-col md:flex-row print:flex-row gap-12 items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl break-inside-avoid">
                        {renderGrid(drawing.lines, true)}
                        <i className="fa-solid fa-arrow-right text-3xl text-zinc-300 hidden md:block print:block"></i>
                        {renderGrid(null, false)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const SymbolCipherSheet: React.FC<{ data: SymbolCipherData }> = ({ data }) => (
    <div>
         <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
         
         {/* Key Table */}
         <div className="mb-8 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-2 border-zinc-200">
            <h4 className="text-center font-bold mb-4 uppercase tracking-widest text-zinc-500">Şifre Anahtarı</h4>
            <div className="flex flex-wrap justify-center gap-4">
                {(data.cipherKey || []).map((item, i) => (
                    <div key={i} className="flex flex-col items-center bg-white dark:bg-zinc-700 p-2 rounded shadow-sm w-16">
                        {/* FIX: Cast string to ShapeType */}
                        <div className="mb-2 transform scale-75"><ShapeDisplay shapes={[item.shape as ShapeType]} /></div>
                        <span className="font-bold text-xl border-t w-full text-center pt-1">{item.letter.toUpperCase()}</span>
                    </div>
                ))}
            </div>
         </div>

         {/* Puzzles */}
         <div className="space-y-6">
             {(data.wordsToSolve || []).map((puzzle, index) => (
                 <div key={index} className="flex flex-wrap justify-center gap-2 p-4 border-b border-dashed border-zinc-300">
                     {puzzle.shapeSequence.map((shape, sIdx) => (
                         <div key={sIdx} className="flex flex-col items-center gap-2">
                             {/* FIX: Cast string to ShapeType */}
                             <div className="p-2 bg-white border rounded"><ShapeDisplay shapes={[shape as ShapeType]} /></div>
                             <div className="w-12 h-12 border-2 border-zinc-400 rounded bg-zinc-50 dark:bg-zinc-900/50"></div>
                         </div>
                     ))}
                 </div>
             ))}
         </div>
    </div>
);

export const BlockPaintingSheet: React.FC<{ data: BlockPaintingData }> = ({ data }) => {
    const { grid: { rows, cols }, targetPattern, shapes } = data;
    const activeColor = shapes[0]?.color || '#3B82F6';

    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            {/* ADDED print:flex-row */}
            <div className="flex flex-col md:flex-row print:flex-row gap-12 justify-center items-center break-inside-avoid">
                
                {/* Target Pattern (Left Side) */}
                <div className="flex flex-col items-center">
                    <h4 className="font-bold text-center mb-4 text-zinc-600 uppercase tracking-widest text-sm">Örnek Desen</h4>
                    <div className="border-4 border-zinc-800 p-1 bg-white inline-block shadow-lg">
                        <div className={`grid gap-px bg-zinc-300`} style={{gridTemplateColumns: `repeat(${cols}, 20px)`}}>
                            {(targetPattern || []).flat().map((cell, i) => (
                                <div key={i} className="w-[20px] h-[20px]" style={{backgroundColor: cell ? activeColor : 'white'}}></div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="text-zinc-300 hidden md:block print:block">
                    <i className="fa-solid fa-arrow-right text-4xl"></i>
                </div>
                
                {/* Empty Grid (Right Side) */}
                <div className="flex flex-col items-center">
                    <h4 className="font-bold text-center mb-4 text-zinc-600 uppercase tracking-widest text-sm">Boyama Alanı</h4>
                    <div className="border-4 border-zinc-800 p-1 bg-white inline-block shadow-lg">
                        <div className={`grid gap-px bg-zinc-300`} style={{gridTemplateColumns: `repeat(${cols}, 30px)`}}>
                            {Array.from({length: rows * cols}).map((_, i) => (
                                <div key={i} className="w-[30px] h-[30px] bg-white hover:bg-indigo-50 cursor-pointer"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-zinc-500">
                <p>İpucu: Kareleri sayarak boyayın.</p>
            </div>
        </div>
    )
};

export const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
             {data.rows.map((row, i) => (
                 <div key={i} className="flex justify-around p-4 border rounded-lg bg-white break-inside-avoid">
                     {row.items.map((item, j) => (
                         <div key={j} className="flex flex-col gap-2 items-center cursor-pointer hover:bg-zinc-50 p-2 rounded">
                             <SegmentDisplay segments={item.segments} />
                             <div className="w-4 h-4 border rounded-full"></div>
                         </div>
                     ))}
                 </div>
             ))}
        </div>
    </div>
);

export const SymmetryDrawingSheet: React.FC<{ data: SymmetryDrawingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
         <div className="flex justify-center">
            <svg width={data.gridDim * 30} height={data.gridDim * 30} className="border border-zinc-400 bg-white">
                {/* Grid */}
                {Array.from({length: data.gridDim + 1}).map((_, i) => (
                    <React.Fragment key={i}>
                        <line x1={i*30} y1="0" x2={i*30} y2={data.gridDim*30} stroke="#e4e4e7" />
                        <line x1="0" y1={i*30} x2={data.gridDim*30} y2={i*30} stroke="#e4e4e7" />
                    </React.Fragment>
                ))}
                {/* Axis */}
                <line x1={data.gridDim*15} y1="0" x2={data.gridDim*15} y2={data.gridDim*30} stroke="red" strokeWidth="2" strokeDasharray="5,5" />
                
                {/* Dots */}
                {data.dots.map((dot, i) => (
                    <circle key={i} cx={dot.x * 30 + 15} cy={dot.y * 30 + 15} r="4" fill={dot.color || 'black'} />
                ))}
            </svg>
         </div>
    </div>
);

export const FindDifferentStringSheet: React.FC<{ data: FindDifferentStringData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid font-mono text-lg">
            {data.rows.map((row, i) => (
                <div key={i} className="flex justify-between p-3 bg-zinc-50 rounded border break-inside-avoid">
                    {row.items.map((item, j) => (
                        <span key={j} className="cursor-pointer hover:text-indigo-600 hover:font-bold transition-all">{item}</span>
                    ))}
                </div>
            ))}
        </div>
    </div>
);

export const DotPaintingSheet: React.FC<{ data: DotPaintingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex justify-center">
            <svg viewBox="0 0 100 100" className="w-full max-w-lg border bg-white">
                {/* Grid dots */}
                {Array.from({length: 100}).map((_, i) => {
                    const x = (i % 10) * 10 + 5;
                    const y = Math.floor(i / 10) * 10 + 5;
                    return <circle key={i} cx={x} cy={y} r="0.5" fill="#ccc" />
                })}
                {/* Target Dots */}
                {data.dots.map((dot, i) => (
                    <circle key={i} cx={dot.cx} cy={dot.cy} r="1.5" fill={dot.color} />
                ))}
            </svg>
        </div>
        <div className="mt-4 p-4 border rounded text-center">
            <h4 className="font-bold">{data.prompt1}</h4>
            <p>{data.prompt2}</p>
        </div>
    </div>
);

export const AbcConnectSheet: React.FC<{ data: AbcConnectData | RomanNumeralConnectData | RomanArabicMatchConnectData | WeightConnectData | LengthConnectData }> = ({ data }) => {
    // Only process the first puzzle for display in single sheet mode, or map all. Usually just 1.
    const puzzles = 'puzzles' in data ? data.puzzles : (data as any).numbers ? [{gridDim: 10, points: (data as any).numbers}] : (data as any).expressions ? [{gridDim: 10, points: (data as any).expressions}] : [{ id: 1, gridDim: (data as any).gridDim || 6, points: (data as any).points || [] }];
    
    return (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Çiftleri birleştirin."} note={data.pedagogicalNote} />
        {puzzles.map((puzzle: any, i: number) => (
             <div key={i} className="flex flex-col items-center mb-8">
                {/* Professional Grid Visual */}
                <div className="relative bg-white border-2 border-zinc-800 dark:border-zinc-500 shadow-lg rounded-lg overflow-hidden" 
                     style={{ width: '100%', maxWidth: '600px', aspectRatio: '1/1' }}>
                     
                    <svg viewBox={`0 0 ${puzzle.gridDim * 50} ${puzzle.gridDim * 50}`} className="w-full h-full">
                         {/* Grid Lines */}
                         <defs>
                             <pattern id={`grid-${i}`} width="50" height="50" patternUnits="userSpaceOnUse">
                                 <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                             </pattern>
                         </defs>
                         <rect width="100%" height="100%" fill={`url(#grid-${i})`} />
                         
                         {/* Points */}
                         {puzzle.points.map((p: any, k: number) => {
                             // Dynamic Color Assignment if not present
                             const color = p.color || (p.group !== undefined ? CONNECT_COLORS[p.group % CONNECT_COLORS.length] : CONNECT_COLORS[p.pairId % CONNECT_COLORS.length]) || '#3B82F6';
                             const isImage = p.imagePrompt && p.imagePrompt.length > 0;
                             
                             return (
                                <g key={k} transform={`translate(${p.x * 50 + 25}, ${p.y * 50 + 25})`}>
                                    {/* Outer Glow/Border */}
                                    <circle r="22" fill={color} opacity="0.2" />
                                    <circle r="18" fill="white" stroke={color} strokeWidth="2.5" />
                                    
                                    {/* Content */}
                                    {isImage ? (
                                        // Centered Text/Emoji for Image Prompts (Offline Mode mostly uses emoji text)
                                        <text 
                                            y="2" 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            fontSize="18"
                                            fill="#333"
                                        >
                                            {p.imagePrompt} 
                                        </text>
                                    ) : (
                                        <text 
                                            y="1" 
                                            textAnchor="middle" 
                                            dominantBaseline="middle" 
                                            fontSize={String(p.label || p.text || p.value).length > 2 ? "10" : "16"} 
                                            fontWeight="bold" 
                                            fill="#333"
                                            fontFamily="monospace"
                                        >
                                            {p.label || p.text || p.value}
                                        </text>
                                    )}
                                </g>
                             );
                         })}
                    </svg>
                </div>
             </div>
        ))}
    </div>
    );
};

// Enhanced WordConnectSheet with professional cards
export const WordConnectSheet: React.FC<{ data: WordConnectData }> = ({ data }) => {
    // Separate points into Left and Right columns
    const leftPoints = (data.points || []).filter(p => p.x === 0).sort((a, b) => a.y - b.y);
    const rightPoints = (data.points || []).filter(p => p.x === 1).sort((a, b) => a.y - b.y);

    return (
        <div>
            {/* FIX: Pass 'data' prop to PedagogicalHeader */}
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="flex justify-between items-stretch gap-12 mt-8 relative max-w-4xl mx-auto print:gap-8">
                {/* Visual Connection Guide (Dotted Line in Center) */}
                <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                    <div className="h-full border-r-2 border-dashed border-zinc-200"></div>
                </div>

                {/* Left Column */}
                <div className="flex-1 space-y-6">
                    {leftPoints.map((point, i) => (
                        <div key={i} className="flex items-center group relative h-20">
                            {/* Card Content */}
                            <div className="flex-1 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-3 flex items-center shadow-sm hover:border-indigo-400 hover:shadow-md transition-all">
                                {point.imagePrompt && (
                                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-700 rounded-lg flex items-center justify-center mr-4 text-2xl">
                                        <ImageDisplay base64={point.imagePrompt.length > 50 ? point.imagePrompt : undefined} description={point.word} className="w-full h-full object-contain" />
                                        {/* Fallback for short emoji prompts handled by ImageDisplay internally or here */}
                                        {point.imagePrompt.length <= 50 && point.imagePrompt}
                                    </div>
                                )}
                                <span className="font-bold text-lg text-zinc-700 dark:text-zinc-200">{point.word}</span>
                            </div>
                            
                            {/* Connection Point (Right side of Left Col) */}
                            <div className="w-6 h-6 bg-white border-4 border-zinc-300 rounded-full absolute -right-3 z-10 group-hover:border-indigo-500 transition-colors"></div>
                        </div>
                    ))}
                </div>

                {/* Right Column */}
                <div className="flex-1 space-y-6">
                    {rightPoints.map((point, i) => (
                        <div key={i} className="flex items-center group relative h-20">
                            {/* Connection Point (Left side of Right Col) */}
                            <div className="w-6 h-6 bg-white border-4 border-zinc-300 rounded-full absolute -left-3 z-10 group-hover:border-indigo-500 transition-colors"></div>

                            {/* Card Content */}
                            <div className="flex-1 bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-3 flex items-center flex-row-reverse shadow-sm hover:border-indigo-400 hover:shadow-md transition-all ml-4">
                                {point.imagePrompt && (
                                    <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-700 rounded-lg flex items-center justify-center ml-4 text-2xl">
                                        <ImageDisplay base64={point.imagePrompt.length > 50 ? point.imagePrompt : undefined} description={point.word} className="w-full h-full object-contain" />
                                        {point.imagePrompt.length <= 50 && point.imagePrompt}
                                    </div>
                                )}
                                <span className="font-bold text-lg text-zinc-700 dark:text-zinc-200">{point.word}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Fallbacks for others to ensure no broken imports, enhanced with header
const createSimpleSheet = (compName: string) => ({ data }: { data: any }) => (
  <div>
      <PedagogicalHeader title={data.title || compName} instruction={data.instruction || data.prompt || ""} note={data.pedagogicalNote} />
      <div className="p-4 text-center text-zinc-500 italic">Görsel içerik oluşturuldu.</div>
  </div>
);

export const CoordinateCipherSheet: React.FC<{ data: CoordinateCipherData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex justify-center">
            <table className="border-collapse border border-zinc-400 bg-white">
                <tbody>
                    {data.grid.map((row, i) => (
                        <tr key={i}>
                            <td className="border border-zinc-300 p-2 font-bold bg-zinc-100 text-xs text-center">{String.fromCharCode(65+i)}</td>
                            {row.map((cell, j) => (
                                <td key={j} className="border border-zinc-300 w-10 h-10 text-center font-mono text-lg">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td></td>
                        {data.grid[0].map((_, j) => <td key={j} className="text-center text-xs font-bold p-1">{j+1}</td>)}
                    </tr>
                </tfoot>
            </table>
        </div>
        <div className="mt-8 flex flex-wrap gap-2 justify-center">
            {data.cipherCoordinates.map((coord, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="w-10 h-10 border-b-2 border-black mb-1"></div>
                    <span className="text-sm font-bold text-zinc-500">{coord}</span>
                </div>
            ))}
        </div>
    </div>
);

export const ProfessionConnectSheet: React.FC<{ data: ProfessionConnectData }> = ({ data }) => (
     <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        {/* ADDED print:grid-cols-2 print:gap-8 */}
        <div className="grid grid-cols-2 gap-12 max-w-2xl mx-auto relative print:grid-cols-2 print:gap-8">
            {/* Left side */}
            <div className="space-y-8">
                {data.points.filter(p => p.x === 0).map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 border rounded bg-white relative">
                        <span>{p.label}</span>
                        <div className="w-3 h-3 bg-black rounded-full absolute -right-1.5"></div>
                    </div>
                ))}
            </div>
            {/* Right side */}
            <div className="space-y-8">
                 {data.points.filter(p => p.x > 0).map((p, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 border rounded bg-white relative justify-end">
                        <div className="w-3 h-3 bg-black rounded-full absolute -left-1.5"></div>
                        <span>{p.imageDescription}</span> 
                        {/* In a real scenario, imageBase64 would be used here */}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const MatchstickSymmetrySheet: React.FC<{ data: MatchstickSymmetryData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex justify-center">
            <svg width="300" height="300" className="border bg-zinc-50">
                <line x1="150" y1="0" x2="150" y2="300" stroke="red" strokeDasharray="5,5" />
                {data.puzzles[0].lines.map((l, i) => (
                    <line key={i} x1={l.x1 * 50} y1={l.y1 * 50} x2={l.x2 * 50} y2={l.y2 * 50} stroke={l.color || "black"} strokeWidth="4" strokeLinecap="round" />
                ))}
            </svg>
        </div>
    </div>
);

export const VisualOddOneOutThemedSheet: React.FC<{ data: VisualOddOneOutThemedData }> = ({ data }) => (
    <div>
         <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
         <div className="dynamic-grid">
             {data.rows.map((row, i) => (
                 <div key={i} className="border p-4 rounded bg-white break-inside-avoid">
                     <h4 className="text-sm text-zinc-400 mb-2">{row.theme}</h4>
                     <div className="flex justify-around">
                         {row.items.map((item, j) => (
                             <div key={j} className="w-24 h-24 border-2 border-dashed flex items-center justify-center text-center text-xs p-2">
                                 {item.imageBase64 ? <ImageDisplay base64={item.imageBase64} className="w-full h-full" /> : item.description}
                             </div>
                         ))}
                     </div>
                 </div>
             ))}
         </div>
    </div>
);
export const PunctuationColoringSheet = createSimpleSheet('Noktalama Boyama');
export const SynonymAntonymColoringSheet = createSimpleSheet('Eş/Zıt Anlam Boyama');
export const StarHuntSheet: React.FC<{ data: StarHuntData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex justify-center">
            <GridComponent grid={data.grid} cellClassName="w-12 h-12" />
        </div>
        <p className="text-center mt-4">Toplam Yıldız Hedefi: {data.targetCount}</p>
    </div>
);

export const RomanNumeralConnectSheet = AbcConnectSheet;
