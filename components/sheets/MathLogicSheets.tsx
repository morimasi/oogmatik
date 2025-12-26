
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, FutoshikiData, NumberPyramidData,
    NumberCapsuleData, OddEvenSudokuData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, ShapeNumberPatternData, ShapeCountingData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData,
    BasicOperationsData, RealLifeProblemData
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay, PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

export const BasicOperationsSheet: React.FC<{ data: BasicOperationsData }> = ({ data }) => (
    <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="dynamic-grid mt-2">
            {(data?.operations || []).map((op, index) => (
                <EditableElement key={index} className="flex flex-col items-end text-xl font-mono font-bold break-inside-avoid p-4 border border-zinc-200 rounded-lg item-card bg-white shadow-sm justify-center">
                    <div className="mr-2"><EditableText value={op?.num1} tag="span" /></div>
                    <div className="flex items-center w-full justify-end gap-1 mr-2 relative">
                        <span className="absolute left-0 text-lg"><EditableText value={op?.operator} tag="span" /></span>
                        <div><EditableText value={op?.num2} tag="span" /></div>
                    </div>
                    {op?.num3 !== undefined && <div className="mr-2"><EditableText value={op?.num3} tag="span" /></div>}
                    <div className="w-full border-b-2 border-black my-1"></div>
                    <div className="h-8 w-full border border-dashed border-zinc-400 text-center text-zinc-400"><EditableText value="" tag="span" placeholder="?" /></div>
                </EditableElement>
            ))}
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

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
    <div className="flex flex-col">
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
        <div className="dynamic-grid">
            {(data?.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="border-2 border-zinc-200 p-6 rounded-3xl flex flex-col gap-4 break-inside-avoid item-card justify-center bg-white shadow-sm">
                    {(puzzle?.objects && puzzle.objects.length > 0) && (
                        <div className="flex justify-center gap-6 text-xs font-bold flex-wrap mb-4">
                            {puzzle.objects.map((obj, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-16 h-16 mb-2">
                                        <ImageDisplay base64={obj.imageBase64} prompt={obj.imagePrompt} description={obj.name} className="w-full h-full object-contain" />
                                    </div>
                                    <span className="bg-zinc-100 px-2 py-0.5 rounded-full"><EditableText value={obj?.name} tag="span" /></span>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="font-black text-2xl text-center bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-inner"><EditableText value={puzzle?.problem} tag="span" /></div>
                    <div className="text-sm text-center italic text-zinc-500 font-medium"><EditableText value={puzzle?.question} tag="span" /></div>
                    <div className="w-24 h-12 border-b-4 border-indigo-600 mx-auto mt-4 text-center text-2xl font-black text-indigo-600 flex items-center justify-center bg-indigo-50/30 rounded-t-lg"><EditableText value="" tag="span" /></div>
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
