
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, FutoshikiData, NumberPyramidData,
    NumberCapsuleData, OddEvenSudokuData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, ShapeNumberPatternData, ShapeCountingData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData,
    RealLifeProblemData
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay, PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

// Fix: Typed as React.FC to resolve the 'key' property error when used in map loops
const EquationRow: React.FC<{ eq: any, objects: any[], fontSize?: string }> = ({ eq, objects, fontSize = "text-xl" }) => {
    return (
        <div className="flex items-center justify-center gap-4 py-3 border-b border-zinc-50 last:border-0 group-hover:bg-zinc-50/50 transition-colors rounded-xl">
            <div className="flex items-center gap-2">
                {eq.leftSide.map((item: any, i: number) => {
                    const obj = objects.find(o => o.name === item.objectName);
                    return (
                        <React.Fragment key={i}>
                            {i > 0 && <span className="text-zinc-400 font-bold">+</span>}
                            <div className="flex items-center gap-1">
                                {item.multiplier > 1 && <span className="text-sm font-black text-indigo-600 bg-indigo-50 px-1.5 rounded">{item.multiplier}x</span>}
                                <div className="w-12 h-12 flex items-center justify-center">
                                    <ImageDisplay prompt={obj?.imagePrompt} description={obj?.name} className="w-full h-full object-contain" />
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            <span className="text-2xl font-black text-zinc-900">=</span>
            <div className={`font-mono font-black ${fontSize} bg-zinc-900 text-white px-4 py-1.5 rounded-2xl shadow-lg`}>
                {eq.rightSide}
            </div>
        </div>
    );
};

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
    <div className="flex flex-col h-full font-lexend text-black bg-white">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 flex-1 content-start">
            {(data?.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="flex flex-col border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden group hover:shadow-xl transition-all duration-500 break-inside-avoid">
                    {/* Header Label */}
                    <div className="bg-zinc-900 px-6 py-3 flex justify-between items-center text-white">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">GİZEMLİ DENKLEM #{index + 1}</span>
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                    </div>

                    <div className="p-8 flex-1 flex flex-col gap-4">
                        {/* Legend Area (Optional Hint) */}
                        <div className="flex justify-center gap-6 mb-4">
                            {puzzle.objects.map((obj, i) => (
                                <div key={i} className="flex flex-col items-center group/obj">
                                    <div className="w-10 h-10 mb-1 opacity-40 group-hover/obj:opacity-100 transition-opacity">
                                        <ImageDisplay prompt={obj.imagePrompt} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-[8px] font-black text-zinc-300 uppercase tracking-tighter">{obj.name}</span>
                                </div>
                            ))}
                        </div>

                        {/* Equation System */}
                        <div className="space-y-2">
                            {puzzle.equations.map((eq, eIdx) => (
                                <EquationRow key={eIdx} eq={eq} objects={puzzle.objects} />
                            ))}
                        </div>

                        {/* Final Challenge Box */}
                        <div className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border-2 border-indigo-100 flex flex-col items-center gap-4 relative overflow-hidden group/final">
                            <div className="absolute top-0 right-0 p-2 opacity-5 rotate-12"><i className="fa-solid fa-question text-6xl text-indigo-900"></i></div>
                            <p className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none">Hedef İşlem</p>
                            <div className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                                <EditableText value={puzzle.finalQuestion} tag="span" />
                                <span className="text-indigo-600">=</span>
                                <div className="w-20 h-12 border-b-4 border-indigo-600 bg-white rounded-t-xl shadow-inner flex items-center justify-center text-3xl text-transparent">
                                    {puzzle.answer}
                                </div>
                            </div>
                        </div>
                    </div>
                </EditableElement>
            ))}
        </div>

        {/* Professional Footer Stamp */}
        <div className="mt-auto pt-8 flex justify-between items-center px-10 opacity-30 border-t border-zinc-100">
            <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Metodoloji</span>
                <span className="text-[10px] font-bold text-zinc-800">CRA (Somut-Temsili-Soyut)</span>
            </div>
            <div className="flex items-center gap-4">
                 <i className="fa-solid fa-brain-circuit text-xl text-indigo-500"></i>
                 <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-[0.5em]">Bursa Disleksi AI • Bilişsel Matematik Laboratuvarı</p>
            </div>
        </div>
    </div>
);

export const RealLifeMathProblemsSheet: React.FC<{ data: RealLifeProblemData }> = ({ data }) => (
    <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="space-y-10">
            {(data?.problems || []).map((problem, index) => (
                <EditableElement key={index} className="border-b-2 border-black pb-8 break-inside-avoid item-card flex flex-col gap-2">
                    <div className="flex gap-4 mb-4">
                        <span className="font-black text-2xl text-indigo-600">{index + 1}.</span>
                        <div className="flex-1">
                             <div className="text-lg font-medium text-justify mb-4"><EditableText value={problem?.text} tag="p" /></div>
                             {problem.imagePrompt && (
                                 <div className="w-full h-48 bg-zinc-50 rounded-2xl border border-zinc-200 mb-4 overflow-hidden">
                                     <ImageDisplay prompt={problem.imagePrompt} description={problem.text.substring(0,20)} className="w-full h-full object-contain mix-blend-multiply" />
                                 </div>
                             )}
                        </div>
                    </div>
                    <div className="flex gap-6 mt-2">
                        <div className="flex-1 h-32 border-2 border-zinc-200 border-dashed rounded-xl p-3 text-xs font-bold text-zinc-300 uppercase tracking-widest">Çözüm Alanı</div>
                        <div className="w-48 h-32 border-2 border-zinc-200 border-dashed rounded-xl p-3 text-xs font-bold text-zinc-300 uppercase tracking-widest text-center">Sonuç</div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const NumberPatternSheet: React.FC<{ data: NumberPatternData }> = ({ data }) => (
    <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="space-y-4 mt-4">
            {(data?.patterns || []).map((pattern, index) => (
                <EditableElement key={index} className="flex items-center gap-6 p-6 border-2 border-zinc-100 bg-white rounded-2xl break-inside-avoid shadow-sm hover:border-indigo-200 transition-colors">
                    <span className="font-black text-xl text-zinc-300 w-8">{index+1}.</span>
                    <p className="font-mono text-2xl tracking-[0.3em] font-black flex-1 text-center text-zinc-800"><EditableText value={pattern?.sequence} tag="span" /></p>
                    <div className="w-24 h-14 border-4 border-indigo-500 rounded-xl bg-indigo-50 flex items-center justify-center shadow-inner"><EditableText value="" tag="span" /></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
    <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="flex flex-col gap-8">
            <EditableElement className="text-base border-4 border-zinc-800 p-6 bg-zinc-50 rounded-3xl shadow-inner">
                <h4 className="font-black text-xs uppercase tracking-widest text-indigo-600 mb-4 flex items-center gap-2"><i className="fa-solid fa-lightbulb"></i> İpuçlarını Takip Et</h4>
                <ul className="space-y-3">
                    {(data?.clues || []).map((clue, i) => (
                        <li key={i} className="flex gap-3 text-zinc-700 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0"></span>
                            <EditableText value={clue} tag="span" />
                        </li>
                    ))}
                </ul>
            </EditableElement>
            
            <div className="overflow-x-auto p-1">
                <table className="w-full border-collapse border-4 border-zinc-800 text-xs bg-white shadow-xl rounded-2xl">
                    <thead>
                        <tr>
                            <th className="border-2 border-zinc-800 bg-zinc-100 p-4"></th>
                            {(data?.categories || []).flatMap(c => (c?.items || []).map(i => (
                                <th key={i?.name} className="border-2 border-zinc-800 p-2 vertical-text h-32 w-12 relative bg-zinc-50">
                                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                                        {i.imagePrompt && <div className="w-8 h-8 mb-2 opacity-40"><ImageDisplay prompt={i.imagePrompt} description={i.name} className="w-full h-full object-contain" /></div>}
                                        <span className="writing-vertical font-black uppercase text-zinc-600 tracking-tighter"><EditableText value={i?.name} tag="span" /></span>
                                    </div>
                                </th>
                            )))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data?.people || []).map((person, i) => (
                            <tr key={i}>
                                <td className="border-2 border-zinc-800 p-4 font-black bg-zinc-100 uppercase text-zinc-700"><EditableText value={person} tag="span" /></td>
                                {data?.categories?.flatMap(c => (c?.items || []).map(item => (
                                    <td key={item?.name} className="border-2 border-zinc-800 h-12 hover:bg-indigo-50 cursor-pointer transition-colors relative group">
                                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 text-indigo-200">
                                             <i className="fa-solid fa-xmark text-xl"></i>
                                         </div>
                                    </td>
                                )))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const SimpleVisualList = ({ items, title }: any) => (
    <div className="space-y-4">
        {(items || []).map((item: any, i: number) => (
            <EditableElement key={i} className="border-2 border-zinc-100 bg-white rounded-2xl p-4 flex justify-between items-center break-inside-avoid item-card h-20 shadow-sm">
                <div className="font-black text-indigo-600 flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-xs">{i+1}</span>
                    <EditableText value={`${title} ${i+1}`} tag="span" />
                </div>
                <div className="w-48 h-10 border-b-4 border-dashed border-zinc-200"></div>
            </EditableElement>
        ))}
    </div>
);

export const FutoshikiSheet = ({ data }: { data: FutoshikiData }) => (
    <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
        <div className="dynamic-grid mt-6">
            {(data?.puzzles || []).map((p, i) => (
                <div key={i} className="border-4 border-zinc-800 aspect-square flex items-center justify-center relative item-card p-6 bg-white shadow-lg rounded-[2.5rem] break-inside-avoid">
                    <div className="grid gap-2" style={{gridTemplateColumns: `repeat(${p?.size || 4}, 1fr)`}}>
                         {Array.from({length: (p?.size || 4) * (p?.size || 4)}).map((_, k) => (
                             <div key={k} className="w-14 h-14 border-2 border-zinc-200 bg-zinc-50 rounded-xl flex items-center justify-center text-2xl font-black text-zinc-800">
                                 <EditableText value="" tag="span" />
                             </div>
                         ))}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const NumberPyramidSheet = ({ data }: { data: NumberPyramidData }) => (
     <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
        <div className="dynamic-grid mt-10">
            {(data?.pyramids || []).map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-2 break-inside-avoid item-card justify-center py-8">
                     {(p?.rows || []).map((row, r) => (
                         <div key={r} className="flex gap-2">
                             {(row || []).map((cell, c) => (
                                 <div key={c} className="w-14 h-14 border-4 border-zinc-800 flex items-center justify-center text-xl font-black bg-white shadow-lg rounded-2xl">
                                     <EditableText value={cell || ''} tag="span" />
                                 </div>
                             ))}
                         </div>
                     ))}
                </div>
            ))}
        </div>
    </div>
);

export const OddOneOutSheet = ({ data }: { data: OddOneOutData }) => (
    <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} data={data} />
        <div className="space-y-4">
            {(data?.groups || []).map((g, i) => (
                <EditableElement key={i} className="border-2 border-zinc-100 p-6 rounded-2xl text-xl flex gap-6 justify-center flex-wrap item-card items-center bg-white shadow-sm break-inside-avoid">
                    <span className="font-black text-zinc-300 w-6">{i+1}.</span>
                    {(g?.words || []).map((w, j) => (
                        <div key={j} className="px-6 py-2 border-2 border-zinc-100 bg-zinc-50 rounded-xl font-black text-zinc-700 hover:border-indigo-400 cursor-pointer transition-all">
                            <EditableText value={w} tag="span" />
                        </div>
                    ))}
                </EditableElement>
            ))}
        </div>
    </div>
);

export const NumberCapsuleSheet = SimpleVisualList;
export const OddEvenSudokuSheet = FutoshikiSheet;
export const RomanNumeralStarHuntSheet = SimpleVisualList;
export const RoundingConnectSheet = SimpleVisualList;
export const RomanNumeralMultiplicationSheet = SimpleVisualList;
export const KendokuSheet = FutoshikiSheet;
export const MultiplicationWheelSheet = SimpleVisualList;
export const TargetNumberSheet = SimpleVisualList;
export const ShapeSudokuSheet = FutoshikiSheet;
export const VisualNumberPatternSheet = SimpleVisualList;
export const ShapeNumberPatternSheet = SimpleVisualList;
export const ShapeCountingSheet = SimpleVisualList;
export const ThematicOddOneOutSheet = OddOneOutSheet;
export const ThematicOddOneOutSentenceSheet = OddOneOutSheet;
export const ColumnOddOneOutSentenceSheet = OddOneOutSheet;
export const PunctuationMazeSheet = SimpleVisualList;
export const PunctuationPhoneNumberSheet = SimpleVisualList;
export const RomanNumeralConnectSheet = SimpleVisualList;
export const ArithmeticConnectSheet = SimpleVisualList;
export const OperationSquareSheet = SimpleVisualList;
export const RomanArabicMatchConnectSheet = SimpleVisualList;
