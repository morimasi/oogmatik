
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
                            <EditableElement className="hidden sm:block w-24 h-24 bg-white rounded-lg border border-zinc-200 p-1 shadow-sm flex-shrink-0">
                                <ImageDisplay base64={problem.imageBase64} description={problem.text} className="w-full h-full object-contain rounded" />
                            </EditableElement>
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
                    initialPos={{ x: item.x * 500, y: item.y * 500 }} 
                    style={{ left: `${item.x * 100}%`, top: `${item.y * 100}%`, transform: 'translate(-50%, -50%)' }}
                 >
                     <EditableText value={item.text || item.value} tag="span" />
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
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center font-bold text-xl text-indigo-600"><EditableText value={puzzle.results.r1c1 || ''} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center font-bold text-xl text-indigo-600"><EditableText value={puzzle.results.r1c2 || ''} tag="span" /></td>
                            </tr>
                            <tr>
                                <td className="w-16 h-16 bg-zinc-100 border border-zinc-400 text-center font-bold text-xl"><EditableText value={puzzle.row2} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center font-bold text-xl text-indigo-600"><EditableText value={puzzle.results.r2c1 || ''} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-zinc-400 text-center font-bold text-xl text-indigo-600"><EditableText value={puzzle.results.r2c2 || ''} tag="span" /></td>
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
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
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
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="flex flex-col items-center break-inside-avoid p-4 bg-white rounded-xl border">
                    <div className="grid grid-cols-5 gap-2 text-2xl font-bold items-center justify-items-center mb-4">
                        {(puzzle.grid || []).map((row, r) => 
                            row.map((cell, c) => (
                                <div key={`${r}-${c}`} className={`w-12 h-12 flex items-center justify-center ${cell === null ? 'bg-white border-2 border-zinc-300 rounded' : (['+','-','×','÷','='].includes(cell || '') ? 'text-zinc-400' : 'bg-zinc-100 rounded')}`}>
                                    {cell === null ? '' : cell}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex gap-4 p-2 bg-indigo-50 rounded">
                        <span className="text-sm font-bold text-indigo-800 self-center">Kullanılacak Sayılar:</span>
                        {(puzzle.numbersToUse || []).map((n, i) => (
                            <span key={i} className="w-8 h-8 flex items-center justify-center bg-white rounded border border-indigo-200 font-bold">{n}</span>
                        ))}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const MultiplicationWheelSheet: React.FC<{ data: MultiplicationWheelData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="relative w-64 h-64 flex items-center justify-center break-inside-avoid">
                    {/* Wheel SVG */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#333" strokeWidth="2" />
                        <circle cx="50" cy="50" r="15" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="text-sm font-bold">{puzzle.innerResult}</text>
                        {/* Spokes */}
                        {Array.from({length: 8}).map((_, i) => {
                            const angle = i * 45 * Math.PI / 180;
                            const x1 = 50 + 15 * Math.cos(angle);
                            const y1 = 50 + 15 * Math.sin(angle);
                            const x2 = 50 + 40 * Math.cos(angle);
                            const y2 = 50 + 40 * Math.sin(angle);
                            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#ccc" strokeWidth="1" />
                        })}
                        {/* Outer Numbers */}
                        {puzzle.outerNumbers.map((n, i) => {
                            const angle = i * 45 * Math.PI / 180;
                            const x = 50 + 28 * Math.cos(angle);
                            const y = 50 + 28 * Math.sin(angle);
                            return (
                                <g key={i}>
                                    <circle cx={x} cy={y} r="6" fill="white" stroke="#666" strokeWidth="1" />
                                    <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-bold">{n !== null ? n : '?'}</text>
                                </g>
                            )
                        })}
                    </svg>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const TargetNumberSheet: React.FC<{ data: TargetNumberData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="flex flex-col items-center gap-4 p-4 border rounded-xl bg-white break-inside-avoid">
                    <div className="w-20 h-20 rounded-full bg-rose-500 text-white flex items-center justify-center text-3xl font-black shadow-lg border-4 border-rose-200">
                        <EditableText value={puzzle.target} tag="span" />
                    </div>
                    <div className="flex gap-2">
                        {puzzle.givenNumbers.map((n, i) => (
                            <div key={i} className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center font-bold text-xl border border-zinc-300">
                                <EditableText value={n} tag="span" />
                            </div>
                        ))}
                    </div>
                    <div className="w-full h-12 border-b-2 border-dashed border-zinc-300"></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ShapeSudokuSheet: React.FC<{ data: ShapeSudokuData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid justify-items-center">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="flex flex-col items-center gap-4 break-inside-avoid">
                    <div className="grid grid-cols-4 border-4 border-zinc-800 bg-zinc-800 gap-0.5">
                        {(puzzle.grid || []).map((row, r) => 
                            row.map((cell, c) => (
                                <div key={`${r}-${c}`} className="w-12 h-12 bg-white flex items-center justify-center">
                                    {cell && <ShapeDisplay shapes={[cell as any]} />}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex gap-4 p-2 bg-zinc-50 rounded border">
                        {puzzle.shapesToUse.map((s, i) => <ShapeDisplay key={i} shapes={[s.shape as any]} />)}
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const VisualNumberPatternSheet: React.FC<{ data: VisualNumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="p-4 border rounded-xl bg-white shadow-sm break-inside-avoid">
                    <div className="flex items-center gap-4 mb-4 justify-center">
                        {puzzle.items.map((item, i) => (
                            <div key={i} 
                                className="rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                                style={{
                                    width: `${30 * item.size}px`, 
                                    height: `${30 * item.size}px`, 
                                    backgroundColor: item.color,
                                    fontSize: `${10 * item.size}px`
                                }}
                            >
                                {item.number}
                            </div>
                        ))}
                        <div className="w-12 h-12 border-2 border-dashed border-zinc-300 rounded-full flex items-center justify-center text-zinc-400 text-xl font-bold">?</div>
                    </div>
                    <p className="text-center text-xs text-zinc-400 italic">Kural: {puzzle.rule}</p>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="flex flex-col gap-6">
            <EditableElement className="bg-white p-4 rounded-xl border shadow-sm">
                <table className="border-collapse w-full text-sm">
                    <thead>
                        <tr>
                            <th className="border p-2"></th>
                            {data.categories.map((cat, i) => (
                                <th key={i} colSpan={cat.items.length} className="border p-2 bg-zinc-100">{cat.title}</th>
                            ))}
                        </tr>
                        <tr>
                            <th className="border p-2"></th>
                            {data.categories.map(cat => cat.items.map((item, i) => (
                                <th key={`${cat.title}-${i}`} className="border p-2 rotate-180" style={{writingMode: 'vertical-rl'}}>{item.name}</th>
                            )))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.people.map((person, r) => (
                            <tr key={r}>
                                <td className="border p-2 font-bold bg-zinc-50">{person}</td>
                                {data.categories.flatMap(cat => cat.items.map((_, c) => (
                                    <td key={`${r}-${c}`} className="border p-2 w-8 h-8 text-center text-zinc-300 hover:bg-zinc-50 cursor-pointer"></td>
                                )))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </EditableElement>
            <EditableElement className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h4 className="font-bold text-indigo-800 mb-2">İpuçları</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-zinc-700">
                    {data.clues.map((clue, i) => <li key={i}><EditableText value={clue} tag="span" /></li>)}
                </ul>
            </EditableElement>
        </div>
    </div>
);

export const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.groups || []).map((group, index) => (
                <EditableElement key={index} className="flex justify-around p-4 border rounded-xl bg-white shadow-sm break-inside-avoid">
                    {group.words.map((word, i) => (
                        <div key={i} className="px-3 py-2 bg-zinc-100 rounded hover:bg-indigo-100 cursor-pointer"><EditableText value={word} tag="span" /></div>
                    ))}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ThematicOddOneOutSheet: React.FC<{ data: ThematicOddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.rows || []).map((row, index) => (
                <EditableElement key={index} className="flex flex-col gap-2 p-4 border rounded-xl bg-white shadow-sm break-inside-avoid">
                    <div className="flex justify-around items-center">
                        {row.words.map((w, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-75">
                                {w.imagePrompt && <div className="w-16 h-16 border rounded bg-zinc-50"><ImageDisplay description={w.text} /></div>}
                                <span className="font-bold text-sm"><EditableText value={w.text} tag="span" /></span>
                            </div>
                        ))}
                    </div>
                </EditableElement>
            ))}
        </div>
        <EditableElement className="mt-6 p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
            <p className="text-sm font-bold text-indigo-700 mb-2">{data.sentencePrompt}</p>
            <div className="h-20 border-b-2 border-dotted border-indigo-300 bg-white"></div>
        </EditableElement>
    </div>
);

export const ThematicOddOneOutSentenceSheet: React.FC<{ data: ThematicOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="space-y-4">
            {(data.rows || []).map((row, index) => (
                <EditableElement key={index} className="flex items-center gap-4 p-3 border-b break-inside-avoid">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-xs">{index + 1}</div>
                    <div className="flex-1 flex gap-3 flex-wrap">
                        {row.words.map((w, i) => <span key={i} className="px-2 py-1 border rounded bg-white">{w}</span>)}
                    </div>
                    <div className="flex-1 h-8 border-b-2 border-dotted border-zinc-400"></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ColumnOddOneOutSentenceSheet: React.FC<{ data: ColumnOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {(data.columns || []).map((col, index) => (
                <EditableElement key={index} className="border-2 rounded-xl p-3 bg-white">
                    <ul className="space-y-2 text-center">
                        {col.words.map((w, i) => <li key={i} className="py-1 border-b border-dashed">{w}</li>)}
                    </ul>
                </EditableElement>
            ))}
        </div>
        <EditableElement className="p-4 bg-zinc-50 border rounded-lg">
            <p className="text-sm font-bold mb-2">{data.sentencePrompt}</p>
            <div className="space-y-2">
                <div className="h-8 border-b border-zinc-300"></div>
                <div className="h-8 border-b border-zinc-300"></div>
            </div>
        </EditableElement>
    </div>
);

export const PunctuationMazeSheet: React.FC<{ data: PunctuationMazeData }> = ({ data }) => {
    // Generate simple maze grid if data.grid is present
    const gridSize = data.grid ? data.grid.length : 5;
    
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 bg-white p-2 rounded-xl border-4 border-zinc-800 shadow-lg">
                    {/* Maze Grid */}
                    <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${gridSize}, 1fr)`}}>
                        {data.grid && data.grid.flat().map((cellId, i) => {
                            // In offline generator, grid contains cell IDs.
                            // We don't have isPath info directly on grid array in PunctuationMazeData definition,
                            // but we have rules list which maps ID -> Text/IsCorrect.
                            const rule = data.rules.find(r => r.id === cellId);
                            return (
                                <div key={i} className="aspect-square bg-zinc-100 border border-zinc-300 flex items-center justify-center p-1 text-center text-xs relative">
                                    <span className="absolute top-0.5 left-1 text-[8px] text-zinc-400 font-bold">{cellId}</span>
                                    {rule?.text}
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                <div className="w-full md:w-1/3">
                    <EditableElement className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                        <h4 className="font-bold text-amber-800 mb-2">Görev:</h4>
                        <p className="text-sm mb-4">{data.prompt}</p>
                        <div className="flex items-center gap-2 text-4xl font-bold justify-center text-amber-600 bg-white p-4 rounded-lg shadow-sm">
                            {data.punctuationMark}
                        </div>
                    </EditableElement>
                </div>
            </div>
        </div>
    );
};

export const PunctuationPhoneNumberSheet: React.FC<{ data: PunctuationPhoneNumberData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                {(data.clues || []).map((clue, i) => (
                    <EditableElement key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border shadow-sm">
                        <span className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center text-xs font-bold">{clue.id}</span>
                        <p className="text-sm font-medium">{clue.text}</p>
                    </EditableElement>
                ))}
            </div>
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-100 rounded-3xl border-4 border-zinc-800">
                {/* Phone Keypad Visual */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    {[1,2,3,4,5,6,7,8,9].map(n => <div key={n} className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm border border-zinc-300">{n}</div>)}
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm border border-zinc-300">*</div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm border border-zinc-300">0</div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-xl shadow-sm border border-zinc-300">#</div>
                </div>
                <div className="w-full bg-white h-16 rounded-xl border-2 border-zinc-300 flex items-center justify-center px-4">
                    <div className="flex gap-2">
                        {Array.from({length: data.clues.length}).map((_, i) => <div key={i} className="w-8 h-10 border-b-2 border-black"></div>)}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export const ShapeNumberPatternSheet: React.FC<{ data: ShapeNumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data.patterns || []).map((pattern, index) => (
                <EditableElement key={index} className="flex gap-8 justify-center p-6 bg-white border rounded-xl shadow-sm break-inside-avoid">
                    {pattern.shapes.map((s, i) => (
                        <div key={i} className="relative w-24 h-24 flex items-center justify-center">
                            {/* Simple triangle visualization for numbers */}
                            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
                                <polygon points="50,10 90,90 10,90" fill="none" stroke="black" strokeWidth="2" />
                            </svg>
                            {/* Positions: Top, Left, Right */}
                            <span className="absolute top-4 left-1/2 -translate-x-1/2 font-bold bg-white px-1">{s.numbers[2]}</span>
                            <span className="absolute bottom-2 left-2 font-bold bg-white px-1">{s.numbers[0]}</span>
                            <span className="absolute bottom-2 right-2 font-bold bg-white px-1">{s.numbers[1]}</span>
                        </div>
                    ))}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const ShapeCountingSheet: React.FC<{ data: ShapeCountingData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid justify-items-center">
            {(data.figures || []).map((fig, index) => (
                <EditableElement key={index} className="flex flex-col items-center gap-4 break-inside-avoid">
                    <svg viewBox="0 0 100 100" className="w-64 h-64 border bg-white">
                        {fig.svgPaths.map((p, i) => (
                            <path key={i} d={p.d} fill={p.fill} stroke={p.stroke || "black"} strokeWidth="1" />
                        ))}
                    </svg>
                    <div className="flex items-center gap-2">
                        <span>Toplam {fig.targetShape}:</span>
                        <div className="w-16 h-8 border-b-2 border-black"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);
