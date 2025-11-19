
import React from 'react';
import { 
    FindTheDifferenceData, WordComparisonData, ShapeMatchingData, FindIdenticalWordData, GridDrawingData, SymbolCipherData, BlockPaintingData, VisualOddOneOutData, SymmetryDrawingData, FindDifferentStringData, DotPaintingData, AbcConnectData, RomanNumeralConnectData, RomanArabicMatchConnectData, WeightConnectData, LengthConnectData, WordConnectData, CoordinateCipherData, ProfessionConnectData, MatchstickSymmetryData, VisualOddOneOutThemedData, PunctuationColoringData, SynonymAntonymColoringData, StarHuntData, ShapeType
} from '../../types';
import { ShapeDisplay, SegmentDisplay, GridComponent, ImageDisplay } from './common';

// Helper for pedagogical note display
const PedagogicalHeader: React.FC<{ title: string; instruction: string; note?: string }> = ({ title, instruction, note }) => (
    <div className="mb-6 text-center">
        <h3 className="text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100">{title}</h3>
        <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 mb-2">{instruction}</p>
        {note && <p className="text-xs text-zinc-500 dark:text-zinc-400 italic border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2 inline-block px-4">Eğitmen Notu: {note}</p>}
    </div>
);

export const FindTheDifferenceSheet: React.FC<{ data: FindTheDifferenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6 max-w-3xl mx-auto">
            {(data.rows || []).map((row, index) => (
                <div key={index} className="flex items-center justify-between p-6 border-2 rounded-xl bg-white dark:bg-zinc-700/50 shadow-sm hover:shadow-md transition-shadow" style={{borderColor: 'var(--worksheet-border-color)'}}>
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

export const ShapeMatchingSheet: React.FC<{ data: ShapeMatchingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex justify-center gap-24 mt-8 relative">
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
                    <div key={index} className="flex flex-col md:flex-row gap-12 items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl">
                        {renderGrid(drawing.lines, true)}
                        <i className="fa-solid fa-arrow-right text-3xl text-zinc-300 hidden md:block"></i>
                        {renderGrid(null, false)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const FindIdenticalWordSheet: React.FC<{ data: FindIdenticalWordData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 gap-6">
            {(data.groups || []).map((group, index) => (
                <div key={index} className="bg-white dark:bg-zinc-700/50 p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center justify-between">
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

export const SymbolCipherSheet: React.FC<{ data: SymbolCipherData }> = ({ data }) => (
    <div>
         <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
         
         {/* Key Table */}
         <div className="mb-8 p-6 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-2 border-zinc-200">
            <h4 className="text-center font-bold mb-4 uppercase tracking-widest text-zinc-500">Şifre Anahtarı</h4>
            <div className="flex flex-wrap justify-center gap-4">
                {(data.cipherKey || []).map((item, i) => (
                    <div key={i} className="flex flex-col items-center bg-white dark:bg-zinc-700 p-2 rounded shadow-sm w-16">
                        <div className="mb-2 transform scale-75"><ShapeDisplay shapes={[item.shape]} /></div>
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
                             <div className="p-2 bg-white border rounded"><ShapeDisplay shapes={[shape]} /></div>
                             <div className="w-12 h-12 border-2 border-zinc-400 rounded bg-zinc-50 dark:bg-zinc-900/50"></div>
                         </div>
                     ))}
                 </div>
             ))}
         </div>
    </div>
);

export const BlockPaintingSheet: React.FC<{ data: BlockPaintingData }> = ({ data }) => {
    const { grid: { rows, cols }, shapes } = data;
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            <div className="flex flex-col md:flex-row gap-12 justify-center items-start">
                <div className="flex-1">
                    <h4 className="font-bold text-center mb-4">Boyama Alanı</h4>
                    <div className="border-2 border-black p-1 inline-block bg-white">
                        <div className={`grid gap-px bg-zinc-200`} style={{gridTemplateColumns: `repeat(${cols}, 30px)`}}>
                            {Array.from({length: rows * cols}).map((_, i) => (
                                <div key={i} className="w-[30px] h-[30px] bg-white border border-zinc-100"></div>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="w-full md:w-1/3">
                    <h4 className="font-bold text-center mb-4">Kullanılacak Bloklar</h4>
                    <div className="space-y-6">
                        {(shapes || []).map((shape, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded shadow-sm border">
                                <div className={`grid gap-0.5`} style={{gridTemplateColumns: `repeat(${(shape.pattern || [[]])[0].length}, 12px)`}}>
                                    {(shape.pattern || []).flat().map((cell, j) => (
                                        <div key={j} className="w-[12px] h-[12px]" style={{backgroundColor: cell ? shape.color : 'transparent'}}></div>
                                    ))}
                                </div>
                                <div className="text-sm font-bold">x {shape.count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
};

// ... (Keep existing simple implementations for others but apply the PedagogicalHeader pattern)
export const WordComparisonSheet: React.FC<{ data: WordComparisonData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 gap-8">
             <div className="border-2 border-zinc-800 p-4 rounded">
                 <h4 className="font-bold text-center mb-4 border-b pb-2">{data.box1Title}</h4>
                 <ul className="columns-2 gap-4 text-sm">
                     {data.wordList1.map(w => <li key={w}>{w}</li>)}
                 </ul>
             </div>
             <div className="border-2 border-zinc-800 p-4 rounded">
                 <h4 className="font-bold text-center mb-4 border-b pb-2">{data.box2Title}</h4>
                 <ul className="columns-2 gap-4 text-sm">
                     {data.wordList2.map(w => <li key={w}>{w}</li>)}
                 </ul>
             </div>
        </div>
    </div>
);

export const VisualOddOneOutSheet: React.FC<{ data: VisualOddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-6">
             {data.rows.map((row, i) => (
                 <div key={i} className="flex justify-around p-4 border rounded-lg bg-white">
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
        <div className="space-y-4 font-mono text-lg">
            {data.rows.map((row, i) => (
                <div key={i} className="flex justify-between p-3 bg-zinc-50 rounded border">
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

export const AbcConnectSheet: React.FC<{ data: AbcConnectData | RomanNumeralConnectData | RomanArabicMatchConnectData | WeightConnectData | LengthConnectData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        {('puzzles' in data ? data.puzzles : [{...data, id: 1, puzzles: []}]).map((puzzle: any, i: number) => (
             <div key={i} className="flex justify-center mb-8">
                <svg width={puzzle.gridDim * 50} height={puzzle.gridDim * 50} className="border-2 border-zinc-800 bg-white">
                    {/* Grid */}
                    {Array.from({length: puzzle.gridDim + 1}).map((_, j) => (
                        <React.Fragment key={j}>
                            <line x1={j*50} y1="0" x2={j*50} y2={puzzle.gridDim*50} stroke="#eee" />
                            <line x1="0" y1={j*50} x2={puzzle.gridDim*50} y2={j*50} stroke="#eee" />
                        </React.Fragment>
                    ))}
                    {/* Points */}
                    {puzzle.points.map((p: any, k: number) => (
                        <g key={k}>
                            <circle cx={p.x * 50 + 25} cy={p.y * 50 + 25} r="20" fill={p.color || '#ddd'} />
                            <text x={p.x * 50 + 25} y={p.y * 50 + 25} textAnchor="middle" dominantBaseline="middle" fontWeight="bold">{p.label || p.letter}</text>
                        </g>
                    ))}
                </svg>
             </div>
        ))}
    </div>
);

// Fallbacks for others to ensure no broken imports, enhanced with header
const createSimpleSheet = (compName: string) => ({ data }: { data: any }) => (
  <div>
      <PedagogicalHeader title={data.title || compName} instruction={data.instruction || data.prompt || ""} note={data.pedagogicalNote} />
      <div className="p-4 text-center text-zinc-500 italic">Görsel içerik oluşturuldu.</div>
  </div>
);

export const WordConnectSheet = createSimpleSheet('Kelime Bağlama');
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
        <div className="grid grid-cols-2 gap-12 max-w-2xl mx-auto relative">
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
         <div className="space-y-6">
             {data.rows.map((row, i) => (
                 <div key={i} className="border p-4 rounded bg-white">
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

