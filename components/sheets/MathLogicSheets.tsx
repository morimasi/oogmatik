
import React from 'react';
import { 
    MathPuzzleData, NumberPatternData, OddOneOutData, FutoshikiData, NumberPyramidData,
    NumberCapsuleData, OddEvenSudokuData, RomanNumeralStarHuntData, RoundingConnectData, ArithmeticConnectData, RomanNumeralMultiplicationData,
    KendokuData, OperationSquareFillInData, MultiplicationWheelData, TargetNumberData, ShapeSudokuData, VisualNumberPatternData,
    LogicGridPuzzleData, ShapeNumberPatternData, ShapeCountingData, ThematicOddOneOutData, ThematicOddOneOutSentenceData, ColumnOddOneOutSentenceData, PunctuationMazeData, PunctuationPhoneNumberData,
    BasicOperationsData, RealLifeProblemData
} from '../../types';
import { CagedGridSvg, GridComponent, ImageDisplay, Shape, PedagogicalHeader } from './common';
import { EditableElement, EditableText } from '../Editable';

export const BasicOperationsSheet: React.FC<{ data: BasicOperationsData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="dynamic-grid mt-2">
            {(data?.operations || []).map((op, index) => (
                <EditableElement key={index} className="flex flex-col items-end text-xl font-mono font-bold break-inside-avoid p-4 border border-zinc-200 rounded-lg item-card">
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
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data?.problems || []).map((problem, index) => (
                <EditableElement key={index} className="border-b-2 border-black pb-4 break-inside-avoid item-card flex flex-col gap-2">
                    <div className="flex gap-3 mb-2">
                        <span className="font-bold text-lg">{index + 1}.</span>
                        <div className="text-base font-medium flex-1 text-justify"><EditableText value={problem?.text} tag="p" /></div>
                    </div>
                    <div className="flex gap-4 mt-2" style={{flexDirection: 'var(--item-direction)' as any}}>
                        <div className="flex-1 h-24 border border-zinc-300 rounded p-1 text-xs text-zinc-400">Çözüm Alanı</div>
                        <div className="flex-1 h-24 border border-zinc-300 rounded p-1 text-xs text-zinc-400">Sonuç</div>
                    </div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const MathPuzzleSheet: React.FC<{ data: MathPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data?.puzzles || []).map((puzzle, index) => (
                <EditableElement key={index} className="border border-zinc-300 p-3 rounded flex flex-col gap-2 break-inside-avoid item-card">
                    {(puzzle?.objects && puzzle.objects.length > 0) && (
                        <div className="flex justify-center gap-4 text-xs font-bold flex-wrap">
                            {puzzle.objects.map((obj, i) => <span key={i}><EditableText value={obj?.name} tag="span" /></span>)}
                        </div>
                    )}
                    <div className="font-bold text-xl text-center"><EditableText value={puzzle?.problem} tag="span" /></div>
                    <div className="text-sm text-center italic text-zinc-600"><EditableText value={puzzle?.question} tag="span" /></div>
                    <div className="w-16 h-8 border-b border-black mx-auto mt-2 text-center"><EditableText value="" tag="span" /></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const NumberPatternSheet: React.FC<{ data: NumberPatternData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="dynamic-grid">
            {(data?.patterns || []).map((pattern, index) => (
                <EditableElement key={index} className="flex items-center gap-4 py-2 border-b border-zinc-200 break-inside-avoid item-card">
                    <span className="font-bold w-6">{index+1}.</span>
                    <p className="font-mono text-lg tracking-widest flex-1 text-center"><EditableText value={pattern?.sequence} tag="span" /></p>
                    <div className="w-16 h-8 border border-zinc-400 rounded text-center"><EditableText value="" tag="span" /></div>
                </EditableElement>
            ))}
        </div>
    </div>
);

export const LogicGridPuzzleSheet: React.FC<{ data: LogicGridPuzzleData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} />
        <div className="flex flex-col gap-4">
            <EditableElement className="text-sm border p-2 bg-zinc-50">
                <ul className="list-disc list-inside space-y-1">
                    {(data?.clues || []).map((clue, i) => <li key={i}><EditableText value={clue} tag="span" /></li>)}
                </ul>
            </EditableElement>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-black text-xs">
                    <thead>
                        <tr>
                            <th className="border border-black bg-zinc-100"></th>
                            {(data?.categories || []).flatMap(c => (c?.items || []).map(i => (
                                <th key={i?.name} className="border border-black p-1 vertical-text h-20 w-8"><span className="writing-vertical"><EditableText value={i?.name} tag="span" /></span></th>
                            )))}
                        </tr>
                    </thead>
                    <tbody>
                        {(data?.people || []).map((person, i) => (
                            <tr key={i}>
                                <td className="border border-black p-1 font-bold"><EditableText value={person} tag="span" /></td>
                                {data?.categories?.flatMap(c => (c?.items || []).map(item => (
                                    <td key={item?.name} className="border border-black"></td>
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
    <div className="dynamic-grid">
        {(items || []).map((item: any, i: number) => (
            <EditableElement key={i} className="border-b pb-2 flex justify-between items-center break-inside-avoid item-card">
                <div className="font-bold"><EditableText value={`${title} ${i+1}`} tag="span" /></div>
                <div className="w-32 h-8 border border-zinc-300"></div>
            </EditableElement>
        ))}
    </div>
);

export const FutoshikiSheet = ({ data }: { data: FutoshikiData }) => (
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} />
        <div className="dynamic-grid mt-4">
            {(data?.puzzles || []).map((p, i) => (
                <div key={i} className="border border-black aspect-square flex items-center justify-center relative item-card">
                    <div className="grid gap-0" style={{gridTemplateColumns: `repeat(${p?.size || 4}, 1fr)`}}>
                         {Array.from({length: (p?.size || 4) * (p?.size || 4)}).map((_, k) => (
                             <div key={k} className="w-8 h-8 border border-zinc-300 flex items-center justify-center">
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
     <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} />
        <div className="dynamic-grid mt-4">
            {(data?.pyramids || []).map((p, i) => (
                <div key={i} className="flex flex-col items-center gap-1 break-inside-avoid item-card">
                     {(p?.rows || []).map((row, r) => (
                         <div key={r} className="flex gap-1">
                             {(row || []).map((cell, c) => (
                                 <div key={c} className="w-8 h-8 border border-black flex items-center justify-center text-sm font-bold">
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
    <div>
        <PedagogicalHeader title={data?.title} instruction={data?.instruction} />
        <div className="dynamic-grid">
            {(data?.groups || []).map((g, i) => (
                <EditableElement key={i} className="border border-zinc-300 p-2 rounded text-sm flex gap-2 justify-center flex-wrap item-card">
                    {(g?.words || []).map((w, j) => <span key={j} className="px-2 border border-zinc-200"><EditableText value={w} tag="span" /></span>)}
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
