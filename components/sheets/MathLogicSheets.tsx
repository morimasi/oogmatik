
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, FutoshikiData, NumberPyramidData,
    NumberCapsuleData, OddEvenSudokuData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, ShapeNumberPatternData, ShapeCountingData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData,
    BasicOperationsData, RealLifeProblemData, ShapeType
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay, Shape, ShapeDisplay, PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

export const BasicOperationsSheet: React.FC<{ data: BasicOperationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        {/* Updated to use dynamic-grid class which maps to toolbar settings */}
        <div className="dynamic-grid mt-4">
            {data.operations.map((op, index) => (
                <EditableElement key={index} className="p-3 bg-zinc-50 border-2 border-zinc-800 rounded-lg shadow-sm flex flex-col items-end justify-center text-xl font-mono font-bold break-inside-avoid relative overflow-hidden">
                    {/* Dikey İşlem Formatı */}
                    <div className="tracking-wide mr-2"><EditableText value={op.num1} tag="span" /></div>
                    
                    <div className="flex items-center w-full justify-end gap-2 mr-2">
                        <span className="text-lg absolute left-2 text-zinc-400"><EditableText value={op.operator} tag="span" /></span>
                        <div className="tracking-wide"><EditableText value={op.num2} tag="span" /></div>
                    </div>
                    
                    {op.num3 !== undefined && (
                        <div className="flex items-center w-full justify-end gap-2 mr-2">
                            <div className="tracking-wide"><EditableText value={op.num3} tag="span" /></div>
                        </div>
                    )}
                    
                    {/* İşlem Çizgisi */}
                    <div className="w-full border-b-2 border-black my-1"></div>
                    
                    {/* Sonuç Alanı */}
                    <div className="h-8 w-full bg-white rounded border border-dashed border-zinc-400"></div>
                    
                    {/* Kalanlı Bölme Alanı */}
                    {op.remainder !== undefined && (
                        <div className="mt-1 w-full flex justify-between items-center text-[10px] text-zinc-500 font-sans font-normal border-t pt-1">
                            <span>K:</span>
                            <div className="w-6 h-4 border-b border-zinc-400"></div>
                        </div>
                    )}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const RealLifeMathProblemsSheet: React.FC<{ data: RealLifeProblemData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {data.problems.map((problem, index) => (
                <EditableElement key={index} className="bg-white rounded-3xl border-2 border-zinc-300 shadow-md break-inside-avoid overflow-hidden">
                    
                    {/* SORU BAŞLIĞI VE METNİ */}
                    <div className="bg-zinc-50 p-6 border-b-2 border-zinc-200 flex gap-6 items-start">
                        <div className="flex-shrink-0 w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-lg transform -rotate-3">
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-zinc-400 text-xs uppercase tracking-widest mb-2">Problem</h4>
                            <div className="text-xl font-medium leading-relaxed text-zinc-800 font-dyslexic">
                                <EditableText value={problem.text} tag="p" />
                            </div>
                        </div>
                        {problem.imagePrompt && (
                            <div className="hidden sm:block w-24 h-24 bg-white rounded-lg border border-zinc-200 p-1 shadow-sm flex-shrink-0">
                                <ImageDisplay base64={problem.imageBase64} description={problem.text} className="w-full h-full object-contain rounded" />
                            </div>
                        )}
                    </div>

                    {/* PROBLEM ÇÖZME STRATEJİSİ ALANI (4'lü Matris) */}
                    <div className="grid grid-cols-2 print:grid-cols-2 divide-x-2 divide-zinc-200 border-b-2 border-zinc-200">
                        
                        {/* ADIM 1: ANLAMA */}
                        <div className="p-4 min-h-[150px]">
                            <div className="flex items-center gap-2 mb-3 text-emerald-600">
                                <i className="fa-solid fa-magnifying-glass-chart text-lg"></i>
                                <h5 className="font-bold text-sm uppercase">1. Problemi Anlama</h5>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-zinc-400 block mb-1">Verilenler:</span>
                                    <div className="w-full border-b border-zinc-300 border-dashed h-6"></div>
                                    <div className="w-full border-b border-zinc-300 border-dashed h-6 mt-2"></div>
                                </div>
                            </div>
                        </div>

                        {/* ADIM 2: PLANLAMA */}
                        <div className="p-4 min-h-[150px]">
                            <div className="flex items-center gap-2 mb-3 text-amber-600">
                                <i className="fa-solid fa-pencil-ruler text-lg"></i>
                                <h5 className="font-bold text-sm uppercase">2. Plan Yapma</h5>
                            </div>
                            <div className="w-full h-24 bg-zinc-50 rounded-lg border border-zinc-200 flex items-center justify-center">
                                <span className="text-xs text-zinc-300 font-medium italic">Şekil veya şema alanı</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 print:grid-cols-2 divide-x-2 divide-zinc-200">
                        
                        {/* ADIM 3: UYGULAMA */}
                        <div className="p-4 min-h-[150px]">
                            <div className="flex items-center gap-2 mb-3 text-indigo-600">
                                <i className="fa-solid fa-calculator text-lg"></i>
                                <h5 className="font-bold text-sm uppercase">3. Planı Uygulama</h5>
                            </div>
                            <div className="w-full h-full min-h-[100px] border border-zinc-100 rounded"></div>
                        </div>

                        {/* ADIM 4: KONTROL */}
                        <div className="p-4 min-h-[150px] bg-zinc-50/50 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3 text-rose-600">
                                    <i className="fa-solid fa-clipboard-check text-lg"></i>
                                    <h5 className="font-bold text-sm uppercase">4. Sonuç</h5>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t-2 border-zinc-200 flex items-center justify-between">
                                <span className="font-black text-lg text-zinc-800">SONUÇ:</span>
                                <div className="w-24 h-10 border-2 border-zinc-800 rounded bg-white"></div>
                            </div>
                        </div>
                    </div>

                </EditableElement>
            ))}
        </div>
    </div>
);

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="p-4 bg-white rounded-lg border-2 flex flex-col break-inside-avoid" style={{borderColor: 'var(--worksheet-border-color)'}}>
                    {(puzzle.objects && puzzle.objects.length > 0) && (
                        <div className="flex justify-center gap-4 mb-4 border-b pb-2">
                            {(puzzle.objects || []).map(obj => (
                                <div key={obj.name} className="flex flex-col items-center text-xs font-semibold text-zinc-600">
                                    <ImageDisplay base64={obj.imageBase64} description={obj.name} className="w-12 h-12" />
                                    <span><EditableText value={obj.name} tag="span" /></span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="font-semibold text-2xl text-center mb-3 flex-grow">
                        <EditableText value={puzzle.problem} tag="p" />
                    </div>
                    <div className="text-sm text-center text-zinc-500 mb-4">
                        <EditableText value={puzzle.question} tag="p" />
                    </div>
                    <div className="flex items-center justify-center mt-auto">
                        <span className="font-bold text-lg">Cevap:</span>
                        <div className="w-24 h-10 ml-2 border-b-2 border-dotted border-zinc-500"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const NumberPatternSheet: React.FC<{ data: NumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || "Aşağıdaki sayı dizilerindeki kuralı bul ve '?' yerine gelmesi gereken sayıyı yaz."} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.patterns || []).map((pattern, index) => (
                <EditableElement key={index} className="flex items-center justify-center gap-4 p-4 bg-zinc-50 rounded-lg shadow-sm border border-zinc-200">
                    <p className="font-mono text-xl tracking-wider"><EditableText value={pattern.sequence} tag="span" /></p>
                    <div className="w-20 h-10 border-2 border-zinc-300 rounded-md bg-white"></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const FutoshikiSheet: React.FC<{ data: FutoshikiData }> = ({ data }) => {
    
    const renderFutoshiki = (puzzle: any) => {
        const size = puzzle.size;
        const cellSize = 50;
        const gap = 15; 
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
                    
                    if (isRow) {
                        const c = Math.min(con.col1, con.col2);
                        const r = con.row1;
                        const x = c * (cellSize + gap) + cellSize + 10 + gap/2;
                        const y = r * (cellSize + gap) + 10 + cellSize/2;
                        return <text key={i} x={x} y={y + 5} textAnchor="middle" className="text-xl font-bold fill-zinc-600">{con.symbol}</text>;
                    } else {
                         const cr = Math.min(con.row1, con.row2);
                         const cc = con.col1;
                         const x = cc * (cellSize + gap) + 10 + cellSize/2;
                         const y = cr * (cellSize + gap) + cellSize + 10 + gap/2;
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
            <div className="dynamic-grid justify-items-center">
                {(data.puzzles || []).map((puzzle, index) => (
                    <EditableElement key={index} className="break-inside-avoid">
                        {renderFutoshiki(puzzle)}
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};

export const NumberPyramidSheet: React.FC<{ data: NumberPyramidData }> = ({ data }) => {
    return (
        <div>
             <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
            <div className="dynamic-grid justify-items-center">
                {(data.pyramids || []).map((pyramid: any, index: number) => (
                    <EditableElement key={index} className="flex flex-col items-center break-inside-avoid">
                        <h4 className="font-semibold mb-4"><EditableText value={pyramid.title} tag="span" /></h4>
                        <div className="flex flex-col items-center gap-1">
                            {pyramid.rows.map((row: (number|null)[], rIndex: number) => (
                                <div key={rIndex} className="flex gap-1">
                                    {row.map((cell: any, cIndex: any) => (
                                        <div key={cIndex} className="w-12 h-12 flex items-center justify-center border-2 border-zinc-400 rounded-md bg-white shadow-sm text-xl font-semibold relative">
                                            {cell !== null ? <EditableText value={cell} tag="span" /> : ''}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};

export const NumberCapsuleSheet: React.FC<{ data: NumberCapsuleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="relative bg-white p-6 rounded-xl border-2 border-zinc-200 break-inside-avoid">
                    <h4 className="text-center font-bold mb-4"><EditableText value={puzzle.title} tag="span" /></h4>
                    <div className="grid grid-cols-4 gap-2 mx-auto w-max relative">
                        {(puzzle.grid || []).map((row, r) => 
                            row.map((cell, c) => (
                                <div key={`${r}-${c}`} className="w-12 h-12 border border-zinc-300 flex items-center justify-center text-xl">
                                    <EditableText value={cell || ''} tag="span" />
                                </div>
                            ))
                        )}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            {puzzle.capsules.map((cap, i) => {
                                const first = cap.cells[0];
                                const last = cap.cells[cap.cells.length-1];
                                const x1 = first.col * 56 + 24; 
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
                    <div className="mt-4 text-center text-sm font-medium bg-indigo-50 p-2 rounded text-indigo-700"><EditableText value={puzzle.numbersToUse} tag="span" /></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const OddEvenSudokuSheet: React.FC<{ data: OddEvenSudokuData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
            <div className="dynamic-grid justify-items-center">
                {(data.puzzles || []).map((puzzle, index) => (
                    <EditableElement key={index} className="flex justify-center break-inside-avoid">
                        <div className="grid grid-cols-6 border-4 border-zinc-900">
                            {(puzzle.grid || []).map((row, rIndex) => (
                                (row || []).map((cell, cIndex) => {
                                    const isConstrained = puzzle.constrainedCells?.some(c => c.row === rIndex && c.col === cIndex);
                                    const isShaded = puzzle.shadedCells?.some(c => c.row === rIndex && c.col === cIndex);
                                    
                                    const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 5 ? 'border-r-4 border-zinc-900' : 'border-r border-zinc-400';
                                    const borderBottom = (rIndex + 1) % 2 === 0 && rIndex !== 5 ? 'border-b-4 border-zinc-900' : 'border-b border-zinc-400';
                                    
                                    return (
                                        <div key={`${rIndex}-${cIndex}`} className={`w-12 h-12 flex items-center justify-center text-2xl font-bold ${borderRight} ${borderBottom} ${isConstrained || isShaded ? 'bg-zinc-300' : 'bg-white'}`}>
                                            <EditableText value={cell || ''} tag="span" />
                                        </div>
                                    )
                                })
                            ))}
                        </div>
                    </EditableElement>
                ))}
            </div>
        </div>
    );
};

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
            <EditableText value={data.example || ''} tag="span" />
        </div>
        <div className="relative h-[600px] border-2 border-zinc-200 rounded-xl bg-white">
             {items.map((item: any, i: number) => (
                 <EditableElement 
                    key={i} 
                    className="absolute w-auto min-w-[3rem] h-12 px-2 rounded-full bg-zinc-100 border-2 border-zinc-800 flex items-center justify-center font-bold shadow-sm"
                    initialPos={{ x: item.x * 500, y: item.y * 500 }} // Hack for absolute positioning conversion attempt, but style handles it
                    // Actually, wrapper handles transform. We need to pass style to wrapper or let wrapper handle it.
                    // The current implementation of EditableElement uses transform: translate(pos.x, pos.y).
                    // The items here are absolutely positioned by `left` and `top`.
                    // We need to wrap them and let the wrapper handle the drag.
                 >
                     {/* The wrapper handles dragging. We need to set initial style. */}
                     <div style={{ position: 'absolute', left: `${item.x * 100}%`, top: `${item.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
                        <EditableText value={item.text || item.value} tag="span" />
                     </div>
                 </EditableElement>
             ))}
        </div>
    </div>
    );
};

export const RomanNumeralMultiplicationSheet: React.FC<{ data: RomanNumeralMultiplicationData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="flex justify-center break-inside-avoid">
                    <table className="border-collapse border-2 border-zinc-800">
                        <tbody>
                            <tr>
                                <td className="w-16 h-16 bg-zinc-200 border border-zinc-400 text-center font-bold text-xl">x</td>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl"><EditableText value={puzzle.col1} tag="span" /></td>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl"><EditableText value={puzzle.col2} tag="span" /></td>
                            </tr>
                            <tr>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl"><EditableText value={puzzle.row1} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center text-lg"><EditableText value={puzzle.results.r1c1 || ''} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center text-lg"><EditableText value={puzzle.results.r1c2 || ''} tag="span" /></td>
                            </tr>
                            <tr>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl"><EditableText value={puzzle.row2} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center text-lg"><EditableText value={puzzle.results.r2c1 || ''} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center text-lg"><EditableText value={puzzle.results.r2c2 || ''} tag="span" /></td>
                            </tr>
                        </tbody>
                    </table>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const KendokuSheet: React.FC<{ data: KendokuData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="dynamic-grid justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="break-inside-avoid">
                    <CagedGridSvg size={puzzle.size} cages={puzzle.cages} gridData={puzzle.grid} />
                </EditableElement>
            ))}
        </div>
    </div>
);

export const OperationSquareSheet: React.FC<{ data: OperationSquareFillInData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="dynamic-grid justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="p-4 bg-white rounded-lg border-2 border-zinc-200 break-inside-avoid">
                    <GridComponent grid={puzzle.grid} cellClassName="w-12 h-12 text-xl font-bold" />
                    <div className="mt-4 text-center p-2 bg-zinc-100 rounded">
                        <span className="font-bold text-sm text-zinc-500 block mb-1">Kullanılacak Sayılar:</span>
                        <div className="flex gap-2 justify-center">
                            {puzzle.numbersToUse.map(n => <span key={n} className="px-2 py-1 bg-white border rounded font-bold">{n}</span>)}
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const MultiplicationWheelSheet: React.FC<{ data: MultiplicationWheelData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="dynamic-grid justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="relative w-64 h-64 break-inside-avoid">
                    {/* Outer Circle */}
                    <div className="absolute inset-0 rounded-full border-4 border-zinc-300 bg-white flex items-center justify-center">
                        {/* Inner Circle */}
                        <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-indigo-300 flex items-center justify-center z-10">
                            <span className="text-3xl font-bold text-indigo-800">x<EditableText value={puzzle.innerResult} tag="span" /></span>
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
                                        <EditableText value={num || ''} tag="span" />
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
                </EditableElement>
            ))}
        </div>
    </div>
);

export const TargetNumberSheet: React.FC<{ data: TargetNumberData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="p-6 bg-white rounded-xl border-2 border-zinc-300 shadow-sm flex flex-col items-center break-inside-avoid">
                    <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-3xl font-bold mb-4 border-4 border-indigo-200">
                        <EditableText value={puzzle.target} tag="span" />
                    </div>
                    <div className="flex gap-3 mb-4">
                        {puzzle.givenNumbers.map((n, i) => (
                            <div key={i} className="w-10 h-10 rounded bg-zinc-100 border border-zinc-300 flex items-center justify-center font-bold"><EditableText value={n} tag="span" /></div>
                        ))}
                    </div>
                    <div className="w-full h-12 border-b-2 border-dashed border-zinc-400"></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ShapeSudokuSheet: React.FC<{ data: ShapeSudokuData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="flex flex-col items-center gap-8">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="flex flex-col items-center gap-4 break-inside-avoid">
                    <div className="grid grid-cols-4 border-4 border-zinc-800">
                        {(puzzle.grid || []).map((row, r) => 
                            row.map((shape, c) => (
                                <div key={`${r}-${c}`} className={`w-16 h-16 flex items-center justify-center border border-zinc-400 ${(c+1)%2===0 && c!==3 ? 'border-r-4 border-zinc-800' : ''} ${(r+1)%2===0 && r!==3 ? 'border-b-4 border-zinc-800' : ''} bg-white`}>
                                    {shape ? <Shape name={shape as ShapeType} className="w-10 h-10" /> : ''}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex gap-4 p-2 bg-zinc-100 rounded-lg">
                        <span className="font-bold text-sm self-center">Kullanılacaklar:</span>
                        {puzzle.shapesToUse.map((s, i) => <Shape key={i} name={s.shape as ShapeType} className="w-8 h-8" />)}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const VisualNumberPatternSheet: React.FC<{ data: VisualNumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="p-4 bg-white rounded-xl border shadow-sm flex items-center justify-between break-inside-avoid">
                    <div className="flex gap-4">
                        {puzzle.items.map((item, i) => (
                            <div key={i} className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-zinc-300 font-bold text-xl shadow-inner" 
                                 style={{ 
                                     backgroundColor: item.color, 
                                     transform: `scale(${item.size})`,
                                     color: '#fff',
                                     textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                                 }}>
                                <EditableText value={item.number} tag="span" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-arrow-right text-zinc-400 text-2xl"></i>
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-400 flex items-center justify-center text-2xl font-bold bg-zinc-50">?</div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

// NEW COMPONENTS

export const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {data.groups.map((group, index) => (
                <EditableElement key={index} className="p-4 bg-white rounded-xl shadow-sm border border-zinc-200 break-inside-avoid">
                    <div className="flex flex-wrap justify-around gap-4">
                        {group.words.map((word, wIndex) => (
                            <div key={wIndex} className="px-4 py-2 bg-zinc-100 rounded-lg font-medium cursor-pointer hover:bg-indigo-100 transition-colors">
                                <EditableText value={word} tag="span" />
                            </div>
                        ))}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ThematicOddOneOutSheet: React.FC<{ data: ThematicOddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="mb-4 text-center font-bold text-indigo-600">Tema: <EditableText value={data.theme} tag="span" /></div>
        <div className="dynamic-grid">
            {data.rows.map((row, index) => (
                <EditableElement key={index} className="p-4 bg-white rounded-xl shadow-sm border border-zinc-200 flex flex-wrap justify-around gap-4 break-inside-avoid">
                    {row.words.map((word, wIndex) => (
                        <div key={wIndex} className="flex flex-col items-center gap-2 p-2 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                            {word.imagePrompt && <ImageDisplay base64={word.imageBase64} description={word.text} className="w-20 h-20 object-contain" />}
                            <span className="font-medium"><EditableText value={word.text} tag="span" /></span>
                        </div>
                    ))}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ThematicOddOneOutSentenceSheet: React.FC<{ data: ThematicOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {data.rows.map((row, index) => (
                <EditableElement key={index} className="p-4 bg-white rounded-xl shadow-sm border border-zinc-200 break-inside-avoid">
                    <div className="flex flex-wrap justify-around gap-4 mb-4">
                        {row.words.map((word, wIndex) => (
                            <div key={wIndex} className="px-4 py-2 bg-zinc-100 rounded-lg font-medium cursor-pointer hover:bg-indigo-100 transition-colors">
                                <EditableText value={word} tag="span" />
                            </div>
                        ))}
                    </div>
                    <div className="w-full border-t border-dashed border-zinc-300 pt-2">
                        <p className="text-xs text-zinc-400 mb-1">Cümle:</p>
                        <div className="h-8 bg-zinc-50 rounded border-b border-zinc-300"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-center text-indigo-800 font-medium break-inside-avoid">
            <EditableText value={data.sentencePrompt} tag="p" />
        </div>
    </div>
);

export const ColumnOddOneOutSentenceSheet: React.FC<{ data: ColumnOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {data.columns.map((col, index) => (
                <EditableElement key={index} className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-zinc-200 break-inside-avoid">
                    {col.words.map((word, wIndex) => (
                        <div key={wIndex} className="p-2 bg-zinc-100 rounded text-center font-medium cursor-pointer hover:bg-rose-100 transition-colors">
                            <EditableText value={word} tag="span" />
                        </div>
                    ))}
                </EditableElement>
            ))}
        </div>
        <div className="p-4 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 break-inside-avoid">
            <p className="text-center text-zinc-500 mb-4"><EditableText value={data.sentencePrompt} tag="span" /></p>
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

// Updated MazeGrid with visual connections and ID display
const MazeGrid = ({ grid, rules }: { grid: number[][], rules: {id: number, text: string, isPath: boolean}[] }) => {
    return (
        <div className="relative p-2 bg-zinc-100 border-2 border-zinc-300 rounded-xl shadow-inner max-w-md mx-auto">
            {/* Start Arrow */}
            <div className="absolute -left-6 top-6 text-green-500 text-2xl animate-bounce-horizontal"><i className="fa-solid fa-arrow-right"></i></div>
            
            {/* Grid */}
            <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`}}>
                {grid.flat().map((cellId, idx) => {
                    const r = Math.floor(idx / grid[0].length);
                    const c = idx % grid[0].length;
                    
                    return (
                        <div key={idx} className="aspect-square bg-white border border-zinc-300 rounded flex items-center justify-center text-lg font-bold text-zinc-700 shadow-sm relative group cursor-pointer hover:bg-indigo-50 hover:border-indigo-300 transition-all">
                            {cellId}
                            {/* Connectors Visual Logic (simplified) - check neighbors in grid if needed */}
                        </div>
                    );
                })}
            </div>
            
            {/* End Arrow */}
            <div className="absolute -right-6 bottom-6 text-red-500 text-2xl animate-bounce-horizontal"><i className="fa-solid fa-arrow-right"></i></div>
        </div>
    );
};

export const PunctuationMazeSheet: React.FC<{ data: PunctuationMazeData }> = ({ data }) => {
    return (
        <div>
            {/* Pass data to header so it can render the SVG if available in imagePrompt */}
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="flex justify-center mb-6">
                <div className="px-6 py-3 bg-indigo-100 rounded-full text-indigo-800 font-bold text-xl border border-indigo-200">
                    Hedef İşaret: <span className="text-4xl ml-2 align-middle">{data.punctuationMark}</span>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Left: The Visual Maze Grid */}
                <div className="w-full md:w-1/2">
                    {data.grid ? (
                        <MazeGrid grid={data.grid} rules={data.rules as any} />
                    ) : (
                        <div className="p-8 text-center bg-zinc-100 rounded">Labirent haritası oluşturulamadı.</div>
                    )}
                </div>

                {/* Right: The Question List */}
                <div className="w-full md:w-1/2">
                    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                        <div className="bg-zinc-50 px-4 py-3 border-b border-zinc-200">
                            <h4 className="font-bold text-zinc-700 uppercase text-sm tracking-wider">Kurallar Listesi</h4>
                        </div>
                        <ul className="divide-y divide-zinc-100 max-h-[500px] overflow-y-auto">
                            {data.rules.map((rule) => (
                                <li key={rule.id} className="p-3 flex gap-3 items-start hover:bg-zinc-50 transition-colors">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mt-0.5">
                                        {rule.id}
                                    </span>
                                    <span className="text-sm text-zinc-600 leading-relaxed"><EditableText value={rule.text} tag="span" /></span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PunctuationPhoneNumberSheet: React.FC<{ data: PunctuationPhoneNumberData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full space-y-4">
                {data.clues.map((clue, index) => (
                    <EditableElement key={index} className="flex items-center gap-4 p-3 bg-white rounded-lg shadow-sm border border-zinc-200">
                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-bold text-zinc-500">{clue.id}</div>
                        <p className="text-zinc-700"><EditableText value={clue.text} tag="span" /></p>
                    </EditableElement>
                ))}
            </div>
            <div className="w-full md:w-1/3 bg-zinc-800 p-6 rounded-3xl shadow-xl text-center break-inside-avoid">
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
        <div className="dynamic-grid space-y-8">
            {data.patterns.map((pattern, pIndex) => (
                <EditableElement key={pIndex} className="flex flex-wrap justify-center gap-8 md:gap-16 p-6 bg-white rounded-xl shadow-sm border border-zinc-200 break-inside-avoid">
                    {pattern.shapes.map((shape, sIndex) => {
                        if (shape.type === 'triangle') {
                            return (
                                <div key={sIndex} className="relative w-32 h-28">
                                    <svg viewBox="0 0 100 86" className="w-full h-full overflow-visible">
                                        <polygon points="50,0 100,86 0,86" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-800" />
                                        <circle cx="15" cy="86" r="12" fill="white" stroke="currentColor" className="text-zinc-800" />
                                        <text x="15" y="86" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{shape.numbers[0]}</text>
                                        
                                        <circle cx="85" cy="86" r="12" fill="white" stroke="currentColor" className="text-zinc-800" />
                                        <text x="85" y="86" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{shape.numbers[1]}</text>
                                        
                                        <circle cx="50" cy="10" r="12" fill="white" stroke="currentColor" className="text-zinc-800" />
                                        <text x="50" y="10" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold">{shape.numbers[2]}</text>
                                    </svg>
                                </div>
                            )
                        }
                        return null;
                    })}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col items-center gap-8">
            {data.figures.map((fig, index) => (
                <EditableElement key={index} className="p-6 bg-white rounded-xl shadow-sm border-2 border-zinc-200 flex flex-col items-center break-inside-avoid">
                    <svg viewBox="0 0 100 100" className="w-64 h-64 mb-6">
                        {fig.svgPaths.map((path, pIndex) => (
                            <path key={pIndex} d={path.d} fill={path.fill} stroke={path.stroke || 'black'} strokeWidth="1" />
                        ))}
                    </svg>
                    <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg w-full">
                        <span className="font-bold text-zinc-600">Toplam {fig.targetShape === 'triangle' ? 'Üçgen' : 'Şekil'} Sayısı:</span>
                        <div className="w-16 h-8 border-b-2 border-zinc-400"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || data.prompt} note={data.pedagogicalNote} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <EditableElement className="bg-amber-50 p-5 rounded-xl border-l-4 border-amber-400">
                    <h4 className="font-bold text-amber-800 mb-3 uppercase text-sm tracking-wider">İpuçları</h4>
                    <ul className="space-y-2 text-sm">
                        {data.clues.map((clue, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="font-bold text-amber-600">{i+1}.</span>
                                <span className="text-zinc-700"><EditableText value={clue} tag="span" /></span>
                            </li>
                        ))}
                    </ul>
                </EditableElement>
                
                <div className="space-y-4">
                    {data.categories.map((cat, i) => (
                        <div key={i}>
                            <h5 className="font-bold text-xs uppercase text-zinc-400 mb-2"><EditableText value={cat.title} tag="span" /></h5>
                            <div className="flex gap-2 flex-wrap">
                                {cat.items.map((item, j) => (
                                    <div key={j} className="flex items-center gap-1 bg-white px-2 py-1 rounded border shadow-sm text-xs">
                                        {item.imagePrompt && <div className="w-4 h-4 bg-zinc-200 rounded-full overflow-hidden"><ImageDisplay base64={item.imageBase64} className="w-full h-full object-cover" /></div>}
                                        <span><EditableText value={item.name} tag="span" /></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 overflow-x-auto">
                <table className="border-collapse w-full bg-white text-sm">
                    <thead>
                        <tr>
                            <th className="border p-2 bg-zinc-100"></th>
                            {data.categories.map((cat, i) => 
                                cat.items.map((item, j) => (
                                    <th key={`${i}-${j}`} className="border p-2 bg-zinc-50 min-w-[30px] writing-vertical text-xs rotate-180 h-24">
                                        <span className="block transform rotate-90 whitespace-nowrap">{item.name}</span>
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.people.map((person, pIdx) => (
                            <tr key={pIdx}>
                                <td className="border p-2 font-bold bg-zinc-50"><EditableText value={person} tag="span" /></td>
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
