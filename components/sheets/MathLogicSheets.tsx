
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

const BORDER_CLASS = "border-2 border-black bg-white text-black";

export const BasicOperationsSheet: React.FC<{ data: BasicOperationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid mt-4">
            {data.operations.map((op, index) => (
                <EditableElement key={index} className={`p-3 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col items-end justify-center text-xl font-mono font-bold break-inside-avoid relative overflow-hidden ${BORDER_CLASS}`}>
                    <div className="tracking-wide mr-2"><EditableText value={op.num1} tag="span" /></div>
                    
                    <div className="flex items-center w-full justify-end gap-2 mr-2">
                        <span className="text-lg absolute left-2"><EditableText value={op.operator} tag="span" /></span>
                        <div className="tracking-wide"><EditableText value={op.num2} tag="span" /></div>
                    </div>
                    
                    {op.num3 !== undefined && (
                        <div className="flex items-center w-full justify-end gap-2 mr-2">
                            <div className="tracking-wide"><EditableText value={op.num3} tag="span" /></div>
                        </div>
                    )}
                    
                    <div className="w-full border-b-2 border-black my-1"></div>
                    
                    <div className="h-8 w-full bg-white rounded border-2 border-dashed border-zinc-300"></div>
                    
                    {op.remainder !== undefined && (
                        <div className="mt-1 w-full flex justify-between items-center text-[10px] text-zinc-500 font-sans font-normal border-t border-black pt-1">
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
                <EditableElement key={index} className={`rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] break-inside-avoid overflow-hidden ${BORDER_CLASS}`}>
                    
                    <div className="p-6 border-b-2 border-black flex gap-6 items-start bg-white">
                        <div className="flex-shrink-0 w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-lg transform -rotate-3">
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-black text-xs uppercase tracking-widest mb-2 border-b-2 border-black inline-block pb-1">Problem</h4>
                            <div className="text-xl font-bold leading-relaxed font-dyslexic">
                                <EditableText value={problem.text} tag="p" />
                            </div>
                        </div>
                        {problem.imagePrompt && (
                            <EditableElement className="hidden sm:block w-24 h-24 bg-white rounded-lg border-2 border-black p-1 shadow-sm flex-shrink-0">
                                <ImageDisplay base64={problem.imageBase64} description={problem.text} className="w-full h-full object-contain rounded" />
                            </EditableElement>
                        )}
                    </div>

                    <div className="grid grid-cols-2 divide-x-2 divide-black border-b-2 border-black">
                        <div className="p-4 min-h-[150px]">
                            <div className="flex items-center gap-2 mb-3">
                                <i className="fa-solid fa-magnifying-glass-chart text-lg"></i>
                                <h5 className="font-bold text-sm uppercase">1. Problemi Anlama</h5>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-xs font-bold text-zinc-500 block mb-1">Verilenler:</span>
                                    <div className="w-full border-b-2 border-black border-dotted h-6"></div>
                                    <div className="w-full border-b-2 border-black border-dotted h-6 mt-2"></div>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 min-h-[150px]">
                            <div className="flex items-center gap-2 mb-3">
                                <i className="fa-solid fa-pencil-ruler text-lg"></i>
                                <h5 className="font-bold text-sm uppercase">2. Plan Yapma</h5>
                            </div>
                            <div className="w-full h-24 bg-white rounded-lg border-2 border-zinc-300 border-dashed flex items-center justify-center">
                                <span className="text-xs text-zinc-400 font-medium italic">Şekil veya şema alanı</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x-2 divide-black">
                        <div className="p-4 min-h-[150px]">
                            <div className="flex items-center gap-2 mb-3">
                                <i className="fa-solid fa-calculator text-lg"></i>
                                <h5 className="font-bold text-sm uppercase">3. Planı Uygulama</h5>
                            </div>
                            <div className="w-full h-full min-h-[100px] border border-zinc-200 rounded"></div>
                        </div>

                        <div className="p-4 min-h-[150px] bg-white flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <i className="fa-solid fa-clipboard-check text-lg"></i>
                                    <h5 className="font-bold text-sm uppercase">4. Sonuç</h5>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t-2 border-black flex items-center justify-between">
                                <span className="font-black text-lg">SONUÇ:</span>
                                <div className="w-24 h-10 border-2 border-black rounded bg-white"></div>
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
                <EditableElement key={index} className={`p-4 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex flex-col break-inside-avoid ${BORDER_CLASS}`}>
                    {(puzzle.objects && puzzle.objects.length > 0) && (
                        <div className="flex justify-center gap-4 mb-4 border-b-2 border-black pb-2">
                            {(puzzle.objects || []).map(obj => (
                                <div key={obj.name} className="flex flex-col items-center text-xs font-semibold">
                                    <ImageDisplay base64={obj.imageBase64} description={obj.name} className="w-12 h-12" />
                                    <span><EditableText value={obj.name} tag="span" /></span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="font-bold text-2xl text-center mb-3 flex-grow">
                        <EditableText value={puzzle.problem} tag="p" />
                    </div>
                    <div className="text-sm text-center text-zinc-600 mb-4 font-bold">
                        <EditableText value={puzzle.question} tag="p" />
                    </div>
                    <div className="flex items-center justify-center mt-auto">
                        <span className="font-black text-lg">Cevap:</span>
                        <div className="w-24 h-10 ml-2 border-b-2 border-black border-dashed"></div>
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
                <EditableElement key={index} className={`flex items-center justify-center gap-4 p-4 rounded-lg shadow-sm ${BORDER_CLASS}`}>
                    <p className="font-mono text-xl tracking-wider font-bold"><EditableText value={pattern.sequence} tag="span" /></p>
                    <div className="w-20 h-10 border-2 border-black rounded-md bg-white"></div>
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
                                <rect x={x} y={y} width={cellSize} height={cellSize} className="fill-white stroke-black" strokeWidth="2" />
                                {val !== null && (
                                    <text x={x + cellSize/2} y={y + cellSize/2 + 5} textAnchor="middle" dominantBaseline="middle" className={isLengthVariant ? "text-xs font-bold fill-black" : "text-2xl font-bold fill-black"}>{val}</text>
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
                        return <text key={i} x={x} y={y + 5} textAnchor="middle" className="text-xl font-bold fill-black">{con.symbol}</text>;
                    } else {
                         const cr = Math.min(con.row1, con.row2);
                         const cc = con.col1;
                         const x = cc * (cellSize + gap) + 10 + cellSize/2;
                         const y = cr * (cellSize + gap) + cellSize + 10 + gap/2;
                         const sym = con.symbol === '>' ? 'v' : '^'; // Visual rotation for vertical
                         return <text key={i} x={x} y={y + 5} textAnchor="middle" className="text-xl font-bold fill-black">{sym}</text>;
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
                        <h4 className="font-semibold mb-4 text-black"><EditableText value={pyramid.title} tag="span" /></h4>
                        <div className="flex flex-col items-center gap-1">
                            {pyramid.rows.map((row: (number|null)[], rIndex: number) => (
                                <div key={rIndex} className="flex gap-1">
                                    {row.map((cell: any, cIndex: any) => (
                                        <div key={cIndex} className={`w-12 h-12 flex items-center justify-center rounded-md shadow-sm text-xl font-bold ${BORDER_CLASS}`}>
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
                <EditableElement key={index} className={`relative p-6 rounded-xl break-inside-avoid ${BORDER_CLASS}`}>
                    <h4 className="text-center font-bold mb-4"><EditableText value={puzzle.title} tag="span" /></h4>
                    <div className="grid grid-cols-4 gap-2 mx-auto w-max relative">
                        {(puzzle.grid || []).map((row, r) => 
                            row.map((cell, c) => (
                                <div key={`${r}-${c}`} className="w-12 h-12 border border-black flex items-center justify-center text-xl font-bold">
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
                                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0, 0, 0, 0.2)" strokeWidth="20" strokeLinecap="round" />
                                        <text x={(x1+x2)/2} y={(y1+y2)/2} dy="4" textAnchor="middle" className="font-bold fill-black text-xs pointer-events-auto bg-white">{cap.sum}</text>
                                    </g>
                                )
                            })}
                        </svg>
                    </div>
                    <div className="mt-4 text-center text-sm font-bold bg-white border border-black p-2 rounded"><EditableText value={puzzle.numbersToUse} tag="span" /></div>
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
                        <div className="grid grid-cols-6 border-4 border-black">
                            {(puzzle.grid || []).map((row, rIndex) => (
                                (row || []).map((cell, cIndex) => {
                                    const isConstrained = puzzle.constrainedCells?.some(c => c.row === rIndex && c.col === cIndex);
                                    const isShaded = puzzle.shadedCells?.some(c => c.row === rIndex && c.col === cIndex);
                                    
                                    const borderRight = (cIndex + 1) % 3 === 0 && cIndex !== 5 ? 'border-r-4 border-black' : 'border-r border-black';
                                    const borderBottom = (rIndex + 1) % 2 === 0 && rIndex !== 5 ? 'border-b-4 border-black' : 'border-b border-black';
                                    
                                    return (
                                        <div key={`${rIndex}-${cIndex}`} className={`w-12 h-12 flex items-center justify-center text-2xl font-bold text-black ${borderRight} ${borderBottom} ${isConstrained || isShaded ? 'bg-zinc-200' : 'bg-white'}`}>
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
        <div className="flex justify-center text-black">
            <GridComponent grid={data.grid} cellClassName="w-14 h-14 font-bold border-black" />
        </div>
        <p className="text-center mt-4 font-bold text-black">Toplam Yıldız: {data.starCount} (Her bölge)</p>
    </div>
);

export const RoundingConnectSheet: React.FC<{ data: RoundingConnectData | ArithmeticConnectData }> = ({ data }) => {
    const items = 'numbers' in data ? data.numbers : data.expressions;
    
    return (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className={`mb-6 p-4 rounded-lg text-center font-bold ${BORDER_CLASS}`}>
            <EditableText value={data.example || ''} tag="span" />
        </div>
        <div className={`relative h-[600px] rounded-xl ${BORDER_CLASS}`}>
             {items.map((item: any, i: number) => (
                 <EditableElement 
                    key={i} 
                    className="absolute w-auto min-w-[3rem] h-12 px-2 rounded-full bg-white border-2 border-black flex items-center justify-center font-bold shadow-sm text-black"
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
                    <table className="border-collapse border-4 border-black text-black">
                        <tbody>
                            <tr>
                                <td className="w-16 h-16 bg-zinc-100 border border-black text-center font-bold text-xl">x</td>
                                <td className="w-16 h-16 bg-white border border-black text-center font-bold text-xl"><EditableText value={puzzle.col1} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-black text-center font-bold text-xl"><EditableText value={puzzle.col2} tag="span" /></td>
                            </tr>
                            <tr>
                                <td className="w-16 h-16 bg-white border border-black text-center font-bold text-xl"><EditableText value={puzzle.row1} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-black text-center text-lg"><EditableText value={puzzle.results.r1c1 || ''} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-black text-center text-lg"><EditableText value={puzzle.results.r1c2 || ''} tag="span" /></td>
                            </tr>
                            <tr>
                                <td className="w-16 h-16 bg-white border border-black text-center font-bold text-xl"><EditableText value={puzzle.row2} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-black text-center text-lg"><EditableText value={puzzle.results.r2c1 || ''} tag="span" /></td>
                                <td className="w-16 h-16 bg-white border border-black text-center text-lg"><EditableText value={puzzle.results.r2c2 || ''} tag="span" /></td>
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
                <EditableElement key={index} className={`p-4 rounded-lg break-inside-avoid ${BORDER_CLASS}`}>
                    <GridComponent grid={puzzle.grid} cellClassName="w-12 h-12 text-xl font-bold border-black" />
                    <div className="mt-4 text-center p-2 bg-white border border-black rounded">
                        <span className="font-bold text-sm text-black block mb-1">Kullanılacak Sayılar:</span>
                        <div className="flex gap-2 justify-center">
                            {puzzle.numbersToUse.map(n => <span key={n} className="px-2 py-1 bg-white border border-black rounded font-bold">{n}</span>)}
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
                    <div className="absolute inset-0 rounded-full border-4 border-black bg-white flex items-center justify-center">
                        {/* Inner Circle */}
                        <div className="w-24 h-24 rounded-full bg-white border-4 border-black flex items-center justify-center z-10">
                            <span className="text-3xl font-black text-black">x<EditableText value={puzzle.innerResult} tag="span" /></span>
                        </div>
                        
                        {/* Spokes */}
                        {puzzle.outerNumbers.map((num, i) => {
                            const angle = (i * 360) / 8;
                            return (
                                <React.Fragment key={i}>
                                    <div className="absolute w-full h-0.5 bg-black" style={{ transform: `rotate(${angle}deg)` }}></div>
                                    <div className="absolute w-10 h-10 bg-white rounded-full border-2 border-black flex items-center justify-center font-bold text-black"
                                         style={{ 
                                             top: '50%', left: '50%', 
                                             transform: `translate(-50%, -50%) rotate(${angle}deg) translate(80px) rotate(-${angle}deg)` 
                                         }}>
                                        <EditableText value={num || ''} tag="span" />
                                    </div>
                                    {/* Result Placeholder */}
                                    <div className="absolute w-12 h-12 bg-white rounded border-2 border-dashed border-black"
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
                <EditableElement key={index} className={`p-6 rounded-xl shadow-sm flex flex-col items-center break-inside-avoid ${BORDER_CLASS}`}>
                    <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold mb-4 border-4 border-white shadow-[0_0_0_2px_black]">
                        <EditableText value={puzzle.target} tag="span" />
                    </div>
                    <div className="flex gap-3 mb-4">
                        {puzzle.givenNumbers.map((n, i) => (
                            <div key={i} className="w-10 h-10 rounded bg-white border-2 border-black flex items-center justify-center font-bold text-black"><EditableText value={n} tag="span" /></div>
                        ))}
                    </div>
                    <div className="w-full h-12 border-b-2 border-dashed border-black"></div>
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
                    <div className="grid grid-cols-4 border-4 border-black">
                        {(puzzle.grid || []).map((row, r) => 
                            row.map((shape, c) => (
                                <div key={`${r}-${c}`} className={`w-16 h-16 flex items-center justify-center border border-black ${(c+1)%2===0 && c!==3 ? 'border-r-4 border-black' : ''} ${(r+1)%2===0 && r!==3 ? 'border-b-4 border-black' : ''} bg-white text-black`}>
                                    {shape ? <Shape name={shape as ShapeType} className="w-10 h-10 text-black" /> : ''}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="flex gap-4 p-2 bg-white border border-black rounded-lg">
                        <span className="font-bold text-sm self-center text-black">Kullanılacaklar:</span>
                        {puzzle.shapesToUse.map((s, i) => <Shape key={i} name={s.shape as ShapeType} className="w-8 h-8 text-black" />)}
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
                <EditableElement key={index} className={`p-4 rounded-xl shadow-sm flex items-center justify-between break-inside-avoid ${BORDER_CLASS}`}>
                    <div className="flex gap-4">
                        {puzzle.items.map((item, i) => (
                            <div key={i} className="flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 border-black font-bold text-xl bg-white text-black" 
                                 style={{ 
                                     transform: `scale(${item.size})`
                                 }}>
                                <EditableText value={item.number} tag="span" />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-arrow-right text-black text-2xl"></i>
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-black flex items-center justify-center text-2xl font-bold bg-white text-black">?</div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const OddOneOutSheet: React.FC<{ data: OddOneOutData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction || ""} note={data.pedagogicalNote} />
        <div className="dynamic-grid">
            {data.groups.map((group, index) => (
                <EditableElement key={index} className={`p-4 rounded-xl shadow-sm break-inside-avoid ${BORDER_CLASS}`}>
                    <div className="flex flex-wrap justify-around gap-4">
                        {group.words.map((word, wIndex) => (
                            <div key={wIndex} className="px-4 py-2 bg-white border border-black rounded-lg font-bold cursor-pointer hover:bg-zinc-200 transition-colors text-black">
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
        <div className="mb-4 text-center font-black text-black uppercase">Tema: <EditableText value={data.theme} tag="span" /></div>
        <div className="dynamic-grid">
            {data.rows.map((row, index) => (
                <EditableElement key={index} className={`p-4 rounded-xl shadow-sm flex flex-wrap justify-around gap-4 break-inside-avoid ${BORDER_CLASS}`}>
                    {row.words.map((word, wIndex) => (
                        <div key={wIndex} className="flex flex-col items-center gap-2 p-2 border border-black rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                            {word.imagePrompt && <ImageDisplay base64={word.imageBase64} description={word.text} className="w-20 h-20 object-contain" />}
                            <span className="font-bold text-black"><EditableText value={word.text} tag="span" /></span>
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
                <EditableElement key={index} className={`p-4 rounded-xl shadow-sm break-inside-avoid ${BORDER_CLASS}`}>
                    <div className="flex flex-wrap justify-around gap-4 mb-4">
                        {row.words.map((word, wIndex) => (
                            <div key={wIndex} className="px-4 py-2 bg-white border border-black rounded-lg font-bold cursor-pointer hover:bg-zinc-200 transition-colors text-black">
                                <EditableText value={word} tag="span" />
                            </div>
                        ))}
                    </div>
                    <div className="w-full border-t-2 border-dashed border-black pt-2">
                        <p className="text-xs text-black font-bold mb-1">Cümle:</p>
                        <div className="h-8 bg-white rounded border-b-2 border-black"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
        <div className={`mt-6 p-4 rounded-lg text-center font-bold break-inside-avoid ${BORDER_CLASS}`}>
            <EditableText value={data.sentencePrompt} tag="p" />
        </div>
    </div>
);

export const ColumnOddOneOutSentenceSheet: React.FC<{ data: ColumnOddOneOutSentenceData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {data.columns.map((col, index) => (
                <EditableElement key={index} className={`flex flex-col gap-3 p-4 rounded-xl break-inside-avoid ${BORDER_CLASS}`}>
                    {col.words.map((word, wIndex) => (
                        <div key={wIndex} className="p-2 bg-white border border-black rounded text-center font-bold cursor-pointer hover:bg-zinc-100 transition-colors text-black">
                            <EditableText value={word} tag="span" />
                        </div>
                    ))}
                </EditableElement>
            ))}
        </div>
        <div className={`p-4 border-2 border-dashed border-black rounded-xl bg-white break-inside-avoid`}>
            <p className="text-center text-black font-bold mb-4"><EditableText value={data.sentencePrompt} tag="span" /></p>
            <div className="space-y-4">
                {Array.from({length: data.columns.length}).map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                        <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">{i+1}</span>
                        <div className="flex-1 h-8 border-b-2 border-black"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const MazeGrid = ({ grid, rules }: { grid: number[][], rules: {id: number, text: string, isPath: boolean}[] }) => {
    if (!grid || grid.length === 0 || !grid[0]) return null;
    return (
        <EditableElement className={`relative p-2 rounded-xl shadow-inner max-w-md mx-auto ${BORDER_CLASS}`}>
            <div className="absolute -left-6 top-6 text-black text-2xl font-bold">Giriş-{'>'}</div>
            
            <div className="grid gap-1" style={{gridTemplateColumns: `repeat(${grid[0].length}, 1fr)`}}>
                {grid.flat().map((cellId, idx) => {
                    return (
                        <div key={idx} className="aspect-square bg-white border-2 border-black rounded flex items-center justify-center text-lg font-bold text-black shadow-sm relative group cursor-pointer hover:bg-zinc-200 transition-all">
                            {cellId}
                        </div>
                    );
                })}
            </div>
            
            <div className="absolute -right-6 bottom-6 text-black text-2xl font-bold">-{'>'}Çıkış</div>
        </EditableElement>
    );
};

export const PunctuationMazeSheet: React.FC<{ data: PunctuationMazeData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            
            <div className="flex justify-center mb-6">
                <div className={`px-6 py-3 rounded-full font-bold text-xl ${BORDER_CLASS}`}>
                    Hedef İşaret: <span className="text-4xl ml-2 align-middle">{data.punctuationMark}</span>
                </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/2">
                    {data.grid ? (
                        <MazeGrid grid={data.grid} rules={data.rules as any} />
                    ) : (
                        <div className="p-8 text-center bg-zinc-100 rounded">Labirent haritası oluşturulamadı.</div>
                    )}
                </div>

                <div className="w-full md:w-1/2">
                    <EditableElement className={`rounded-xl shadow-sm overflow-hidden ${BORDER_CLASS}`}>
                        <div className="bg-white px-4 py-3 border-b-2 border-black">
                            <h4 className="font-bold text-black uppercase text-sm tracking-wider">Kurallar Listesi</h4>
                        </div>
                        <ul className="divide-y-2 divide-black max-h-[500px] overflow-y-auto">
                            {data.rules.map((rule) => (
                                <li key={rule.id} className="p-3 flex gap-3 items-start hover:bg-zinc-50 transition-colors">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center mt-0.5">
                                        {rule.id}
                                    </span>
                                    <span className="text-sm text-black font-bold leading-relaxed"><EditableText value={rule.text} tag="span" /></span>
                                </li>
                            ))}
                        </ul>
                    </EditableElement>
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
                    <EditableElement key={index} className={`flex items-center gap-4 p-3 rounded-lg shadow-sm ${BORDER_CLASS}`}>
                        <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold">{clue.id}</div>
                        <p className="text-black font-bold"><EditableText value={clue.text} tag="span" /></p>
                    </EditableElement>
                ))}
            </div>
            <EditableElement className={`w-full md:w-1/3 p-6 rounded-3xl shadow-xl text-center break-inside-avoid border-4 border-black bg-white`}>
                <div className="bg-white w-full h-16 mb-6 rounded-lg flex items-center justify-center text-3xl font-mono tracking-widest border-4 border-black text-black">
                    _______
                </div>
                <div className="grid grid-cols-3 gap-4">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                        <div key={n} className="w-14 h-14 rounded-full bg-white border-2 border-black text-black flex items-center justify-center text-2xl font-bold shadow-lg mx-auto">
                            {n}
                        </div>
                    ))}
                    <div className="w-14 h-14 rounded-full bg-white border-2 border-black text-black flex items-center justify-center text-2xl font-bold shadow-lg mx-auto col-start-2">
                        0
                    </div>
                </div>
            </EditableElement>
        </div>
    </div>
);

export const ShapeNumberPatternSheet: React.FC<{ data: ShapeNumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} />
        <div className="dynamic-grid space-y-8">
            {data.patterns.map((pattern, pIndex) => (
                <EditableElement key={pIndex} className={`flex flex-wrap justify-center gap-8 md:gap-16 p-6 rounded-xl shadow-sm break-inside-avoid ${BORDER_CLASS}`}>
                    {pattern.shapes.map((shape, sIndex) => {
                        if (shape.type === 'triangle') {
                            return (
                                <div key={sIndex} className="relative w-32 h-28">
                                    <svg viewBox="0 0 100 86" className="w-full h-full overflow-visible">
                                        <polygon points="50,0 100,86 0,86" fill="none" stroke="black" strokeWidth="3" />
                                        <circle cx="15" cy="86" r="12" fill="white" stroke="black" strokeWidth="2" />
                                        <text x="15" y="86" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold fill-black">{shape.numbers[0]}</text>
                                        
                                        <circle cx="85" cy="86" r="12" fill="white" stroke="black" strokeWidth="2" />
                                        <text x="85" y="86" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold fill-black">{shape.numbers[1]}</text>
                                        
                                        <circle cx="50" cy="10" r="12" fill="white" stroke="black" strokeWidth="2" />
                                        <text x="50" y="10" dominantBaseline="central" textAnchor="middle" className="text-xs font-bold fill-black">{shape.numbers[2]}</text>
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
                <EditableElement key={index} className={`p-6 rounded-xl shadow-sm flex flex-col items-center break-inside-avoid ${BORDER_CLASS}`}>
                    <svg viewBox="0 0 100 100" className="w-64 h-64 mb-6">
                        {fig.svgPaths.map((path, pIndex) => (
                            <path key={pIndex} d={path.d} fill={path.fill} stroke={path.stroke || 'black'} strokeWidth="1" />
                        ))}
                    </svg>
                    <div className="flex items-center gap-4 p-4 bg-white border-2 border-black rounded-lg w-full">
                        <span className="font-bold text-black">Toplam {fig.targetShape === 'triangle' ? 'Üçgen' : 'Şekil'} Sayısı:</span>
                        <div className="w-16 h-8 border-b-2 border-black"></div>
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
                <EditableElement className="bg-white p-5 rounded-xl border-4 border-black">
                    <h4 className="font-bold text-black mb-3 uppercase text-sm tracking-wider border-b-2 border-black pb-1">İpuçları</h4>
                    <ul className="space-y-2 text-sm">
                        {data.clues.map((clue, i) => (
                            <li key={i} className="flex gap-2">
                                <span className="font-bold text-black">{i+1}.</span>
                                <span className="text-black font-bold"><EditableText value={clue} tag="span" /></span>
                            </li>
                        ))}
                    </ul>
                </EditableElement>
                
                <div className="space-y-4">
                    {data.categories.map((cat, i) => (
                        <EditableElement key={i}>
                            <h5 className="font-bold text-xs uppercase text-black mb-2"><EditableText value={cat.title} tag="span" /></h5>
                            <div className="flex gap-2 flex-wrap">
                                {cat.items.map((item, j) => (
                                    <div key={j} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-black shadow-sm text-xs font-bold text-black">
                                        {item.imagePrompt && <div className="w-4 h-4 bg-zinc-200 rounded-full overflow-hidden"><ImageDisplay base64={item.imageBase64} className="w-full h-full object-cover" /></div>}
                                        <span><EditableText value={item.name} tag="span" /></span>
                                    </div>
                                ))}
                            </div>
                        </EditableElement>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-2 overflow-x-auto">
                <EditableElement>
                <table className="border-collapse w-full bg-white text-sm border-2 border-black">
                    <thead>
                        <tr>
                            <th className="border-2 border-black p-2 bg-white"></th>
                            {data.categories.map((cat, i) => 
                                cat.items.map((item, j) => (
                                    <th key={`${i}-${j}`} className="border-2 border-black p-2 bg-white min-w-[30px] writing-vertical text-xs rotate-180 h-24">
                                        <span className="block transform rotate-90 whitespace-nowrap text-black font-bold">{item.name}</span>
                                    </th>
                                ))
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.people.map((person, pIdx) => (
                            <tr key={pIdx}>
                                <td className="border-2 border-black p-2 font-bold bg-white text-black"><EditableText value={person} tag="span" /></td>
                                {data.categories.map((cat, i) => 
                                    cat.items.map((item, j) => (
                                        <td key={`${i}-${j}`} className="border-2 border-black p-2 text-center hover:bg-zinc-200 cursor-pointer w-10 h-10"></td>
                                    ))
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
                </EditableElement>
            </div>
        </div>
    </div>
);
