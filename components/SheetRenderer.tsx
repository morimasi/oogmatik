
import React from 'react';
import {
    ActivityType, SingleWorksheetData, WorksheetBlock, StudentProfile, StyleSettings,
    AlgorithmData, MathPuzzleData, NumberPatternData, RealLifeProblemData, LogicGridPuzzleData, FutoshikiData, NumberPyramidData, OddOneOutData, NumberLogicRiddleData, NumberPathLogicData, VisualArithmeticData, ClockReadingData, NumberSenseData, MoneyCountingData, MathMemoryCardsData, SpatialGridData, ConceptMatchData, EstimationData, AbcConnectData, OddEvenSudokuData, MagicPyramidData, NumberCapsuleData,
    WordMemoryData, VisualMemoryData, CharacterMemoryData, ColorWheelMemoryData, ImageComprehensionData, StroopTestData, LetterGridTestData, NumberSearchData, ChaoticNumberSearchData, AttentionDevelopmentData, AttentionFocusData, FindDuplicateData, FindLetterPairData, TargetSearchData,
    InteractiveStoryData, SyllableMasterLabData, ReadingSudokuData, ReadingStroopData, SynonymAntonymMatchData, SyllableWordBuilderData, LetterVisualMatchingData, FamilyRelationsData, FamilyLogicTestData, MorphologyMatrixData, ReadingPyramidData, ReadingFlowData, PhonologicalAwarenessData, RapidNamingData, LetterDiscriminationData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, HandwritingPracticeData,
    MapInstructionData, FindTheDifferenceData, VisualOddOneOutData, GridDrawingData, SymmetryDrawingData, ShapeCountingData, DirectionalTrackingData, HiddenPasswordGridData, WordSearchData, AnagramsData, CrosswordData
} from '../types';

import { MathPuzzleSheet } from './sheets/math/MathPuzzleSheet';
import { NumberPatternSheet } from './sheets/math/NumberPatternSheet';
import { RealLifeMathProblemsSheet } from './sheets/math/RealLifeMathProblemsSheet';
import { LogicGridPuzzleSheet } from './sheets/math/LogicGridPuzzleSheet';
import { FutoshikiSheet } from './sheets/math/FutoshikiSheet';
import { NumberPyramidSheet } from './sheets/math/NumberPyramidSheet';
import { OddOneOutSheet } from './sheets/math/OddOneOutSheet';
import { AlgorithmSheet } from './sheets/logic/AlgorithmSheet';
import { NumberLogicRiddleSheet } from './sheets/math/NumberLogicRiddleSheet';
import { NumberPathLogicSheet } from './sheets/math/NumberPathLogicSheet';
import { VisualArithmeticSheet } from './sheets/math/VisualArithmeticSheet';
import { ClockReadingSheet } from './sheets/math/ClockReadingSheet';
import { NumberSenseSheet } from './sheets/math/NumberSenseSheet';
import { MoneyCountingSheet } from './sheets/math/MoneyCountingSheet';
import { MathMemoryCardsSheet } from './sheets/math/MathMemoryCardsSheet';
import { SpatialGridSheet } from './sheets/math/SpatialGridSheet';
import { ConceptMatchSheet } from './sheets/math/ConceptMatchSheet';
import { EstimationSheet } from './sheets/math/EstimationSheet';
import { AbcConnectSheet } from './sheets/math/AbcConnectSheet';
import { OddEvenSudokuSheet } from './sheets/math/OddEvenSudokuSheet';
import { MagicPyramidSheet } from './sheets/math/MagicPyramidSheet';
import { CapsuleGameSheet } from './sheets/math/CapsuleGameSheet';
import { WordMemorySheet, VisualMemorySheet, CharacterMemorySheet, ColorWheelSheet, ImageComprehensionSheet } from './sheets/attention/MemorySheets';
import { StroopTestSheet } from './sheets/attention/StroopTestSheet';
import { BurdonTestSheet, NumberSearchSheet, AttentionDevelopmentSheet, ChaoticNumberSearchSheet, AttentionFocusSheet, FindDuplicateSheet, LetterGridTestSheet, TargetSearchSheet } from './sheets/attention/AttentionSheets';
import { StoryComprehensionSheet } from './sheets/verbal/StoryComprehensionSheet';
import { ReadingFlowSheet } from './sheets/verbal/ReadingFlowSheet';
import { PhonologicalAwarenessSheet, RapidNamingSheet, LetterDiscriminationSheet, MirrorLettersSheet, SyllableTrainSheet, VisualTrackingLinesSheet, BackwardSpellingSheet, CodeReadingSheet, AttentionToQuestionSheet, HandwritingPracticeSheet } from './sheets/verbal/ReadingSupportSheets';
import { AnagramSheet, WordSearchSheet, HiddenPasswordGridSheet, CrosswordSheet } from './sheets/verbal/WordGameSheets';
import { SyllableMasterLabSheet, ReadingSudokuSheet, ReadingStroopSheet, SynonymAntonymMatchSheet, SyllableWordBuilderSheet, LetterVisualMatchingSheet, FamilyLogicSheet, FamilyRelationsSheet, FindLetterPairSheet, MorphologyMatrixSheet, ReadingPyramidSheet } from './sheets/verbal/ReadingSheets';
import { MapDetectiveSheet } from './sheets/visual/MapDetectiveSheet';
import { FindTheDifferenceSheet } from './sheets/visual/FindTheDifferenceSheet';
import { VisualOddOneOutSheet } from './sheets/visual/VisualOddOneOutSheet';
import { GridDrawingSheet } from './sheets/visual/GridDrawingSheet';
import { SymmetryDrawingSheet } from './sheets/visual/SymmetryDrawingSheet';
import { ShapeCountingSheet } from './sheets/visual/ShapeCountingSheet';
import { DirectionalTrackingSheet } from './sheets/visual/DirectionalTrackingSheet';
import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';
import { PedagogicalHeader, ImageDisplay } from './sheets/common';
import { EditableText } from './Editable';

const recursiveSafeText = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
        if (Array.isArray(val)) return val.map(recursiveSafeText).join(", ");

        // Priority keys
        const keys = ['text', 'char', 'value', 'label', 'clue', 'title', 'word', 'name', 'content', 'data', 'val'];
        for (const key of keys) {
            if (val[key] !== undefined && val[key] !== null) return recursiveSafeText(val[key]);
        }

        // If no priority keys, try any string property
        for (const key in val) {
            if (typeof val[key] === 'string') return val[key];
        }

        try {
            return JSON.stringify(val);
        } catch (e) {
            return "";
        }
    }
    return String(val);
};

export const BlockRenderer = ({ block, key }: { block: WorksheetBlock, key?: any }) => {
    const content: any = block.content;
    if (!content) return null;

    const blockStyle = {
        textAlign: block.style?.textAlign as any || 'left',
        fontWeight: block.style?.fontWeight as any || 'normal',
        fontSize: block.style?.fontSize ? `${block.style.fontSize}px` : undefined,
        backgroundColor: block.style?.backgroundColor || 'transparent',
        borderRadius: block.style?.borderRadius ? `${block.style.borderRadius}px` : undefined,
        color: block.style?.color || 'inherit'
    };

    switch (block.type) {
        case 'header':
            return <h2 className="block-header text-3xl font-black uppercase text-center mb-4 border-b-4 border-black pb-2" style={blockStyle}><EditableText value={recursiveSafeText(content.text || content)} tag="span" /></h2>;

        case 'text':
            return <div className="block-text text-lg leading-relaxed mb-4 font-dyslexic" style={blockStyle}><EditableText value={recursiveSafeText(content.text || content)} tag="div" /></div>;

        case 'grid': {
            const cells = content.cells || content.items || content.data || [];
            const cols = content.cols || content.columns || 4;
            return (
                <div className="block-svg-shape flex justify-center mb-4">
                    <div className="block-grid-container grid gap-2 border-4 border-black p-4 bg-zinc-50 rounded-2xl" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                        {cells.map((cell: any, i: number) => (
                            <div key={i} className="block-grid-cell w-12 h-12 border-2 border-zinc-300 bg-white rounded-lg flex items-center justify-center font-black text-xl"><EditableText value={recursiveSafeText(cell)} tag="span" /></div>
                        ))}
                    </div>
                </div>
            );
        }

        case 'table': {
            const headers: string[] = content.headers || content.columns || [];
            const rows: any[][] = content.rows || content.data || content.items || [];
            return (
                <div className="block-table-container overflow-hidden border-4 border-black rounded-2xl mb-4 bg-white mx-auto max-w-full shadow-sm">
                    <table className="w-full border-collapse">
                        {headers.length > 0 && (
                            <thead className="bg-zinc-100">
                                <tr>{headers.map((h: string, i: number) => <th key={i} className="p-3 text-[10px] font-black uppercase border-r border-black last:border-0">{recursiveSafeText(h)}</th>)}</tr>
                            </thead>
                        )}
                        <tbody>
                            {rows.map((row: any[], i: number) => (
                                <tr key={i} className="border-t border-zinc-200">
                                    {(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => <td key={j} className="p-3 text-center font-bold text-sm border-r border-zinc-100 last:border-0"><EditableText value={recursiveSafeText(cell)} tag="span" /></td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        case 'logic_card':
            return (
                <div className="block-logic-card p-5 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm flex flex-col gap-3 mb-3 break-inside-avoid">
                    <div className="logic-text-box bg-zinc-900 text-white p-3 rounded-2xl text-center text-sm font-bold italic mb-1">
                        <EditableText value={recursiveSafeText(content.text)} tag="p" />
                    </div>
                    {content.data && (
                        <div className="flex justify-center gap-3">
                            {content.data.map((box: string[], bIdx: number) => (
                                <div key={bIdx} className="border-2 border-zinc-800 p-2 rounded-xl bg-zinc-50 flex flex-wrap justify-center gap-1 min-w-[60px]">
                                    {box.map((num, nIdx) => <span key={nIdx} className="font-mono font-black text-base">{num}</span>)}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-around pt-2 border-t-2 border-dashed border-zinc-100">
                        {(content.options || []).map((opt: string, oIdx: number) => (
                            <div key={oIdx} className="flex flex-col items-center gap-1">
                                <div className="logic-option-btn w-9 h-9 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-sm">{opt}</div>
                                <span className="text-[8px] font-black text-zinc-300 uppercase">{String.fromCharCode(65 + oIdx)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'footer_validation':
            return (
                <div className="block-footer-val mt-4 p-6 bg-zinc-900 text-white rounded-[2.5rem] border-4 border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 break-inside-avoid">
                    <div className="flex-1">
                        <h4 className="text-xl font-black tracking-tight mb-1 uppercase">KONTROL VE DOĞRULAMA</h4>
                        <p className="text-xs text-zinc-400 font-medium leading-relaxed italic"><EditableText value={recursiveSafeText(content.text)} tag="span" /></p>
                    </div>
                    <div className="flex items-center gap-5 bg-white/10 p-4 rounded-[1.5rem] border border-white/20">
                        <div className="text-center">
                            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">HEDEF</span>
                            <div className="target-value text-3xl font-black text-amber-400 font-mono">{content.targetValue}</div>
                        </div>
                        <div className="w-px h-10 bg-white/20"></div>
                        <div className="text-center">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">CEVABIM</span>
                            <div className="w-16 h-8 border-b-4 border-dashed border-zinc-700"></div>
                        </div>
                    </div>
                </div>
            );

        case 'svg_shape':
            return (
                <div className="block-svg-shape flex justify-center mb-4">
                    <div className="svg-container w-32 h-32 p-2 border-2 border-zinc-100 rounded-2xl bg-white shadow-sm">
                        <svg viewBox={content.viewBox || "0 0 100 100"} className="w-full h-full text-black">
                            {(content.paths || []).map((p: string, i: number) => <path key={i} d={p} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />)}
                        </svg>
                    </div>
                </div>
            );

        case 'cloze_test': {
            const rawText = recursiveSafeText(content.text || content);
            const parts = rawText.split(/(\[.*?\])/g);
            return (
                <div className="block-cloze p-5 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-[2rem] mb-4 relative break-inside-avoid" style={{ lineHeight: '2.4', fontSize: '11px' }}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
                            <i className="fa-solid fa-pen-nib mr-1"></i>Boşluk Doldur
                        </span>
                        {content.blanks && (
                            <span className="text-[8px] text-zinc-400 font-bold">{content.blanks.length} boşluk</span>
                        )}
                    </div>
                    <div className="font-dyslexic text-zinc-800" style={{ lineHeight: '2.4' }}>
                        {parts.map((part: string, i: number) =>
                            part.startsWith('[') && part.endsWith(']') ? (
                                <span key={i} className="inline-flex flex-col items-center mx-1 align-bottom">
                                    <span className="cloze-blank inline-block min-w-[80px] border-b-[2px] border-zinc-700 text-transparent select-none text-xs leading-none pb-0.5">
                                        {part.slice(1, -1)}
                                    </span>
                                    <span className="cloze-label text-[6px] text-zinc-300 font-bold tracking-widest">YAZ</span>
                                </span>
                            ) : (
                                <EditableText key={i} value={part} tag="span" />
                            )
                        )}
                    </div>
                </div>
            );
        }

        case 'categorical_sorting': {
            const cats: string[] = content.categories || [];
            const items: any[] = content.items || [];
            const unassigned = items.filter((it: any) => !it.category);
            const colCount = Math.min(cats.length || 2, 4);
            return (
                <div className="block-categorical mb-4 break-inside-avoid">
                    {unassigned.length > 0 && (
                        <div className="block-cat-bank mb-3 p-3 bg-white border-2 border-zinc-100 rounded-xl">
                            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-2">Sırala →</p>
                            <div className="flex flex-wrap gap-1.5">
                                {unassigned.map((item: any, j: number) => (
                                    <span key={j} className="block-cat-item px-2 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-black text-zinc-700">
                                        {recursiveSafeText(item.label || item)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${colCount}, 1fr)` }}>
                        {cats.map((cat: string, i: number) => {
                            const catItems = items.filter((item: any) => item.category === cat);
                            return (
                                <div key={i} className="flex flex-col gap-1.5">
                                    <div className="block-cat-header bg-zinc-900 text-white p-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-center">
                                        {cat}
                                    </div>
                                    <div className="block-cat-body flex-1 min-h-[80px] border-2 border-zinc-200 border-dashed rounded-xl p-2 flex flex-col gap-1 bg-white/50">
                                        {catItems.map((item: any, j: number) => (
                                            <div key={j} className="block-cat-item px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-zinc-300 flex-shrink-0"></div>
                                                {recursiveSafeText(item.label || item)}
                                            </div>
                                        ))}
                                        {catItems.length === 0 && (
                                            <div className="flex-1 flex items-center justify-center">
                                                <p className="text-[8px] text-zinc-300 font-bold">Boş Bırak</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        case 'match_columns': {
            const CIRCLED = ['\u2460', '\u2461', '\u2462', '\u2463', '\u2464', '\u2465', '\u2466', '\u2467', '\u2468', '\u2469'];
            const leftItems: any[] = content.leftColumn || content.left || [];
            const rightItems: any[] = content.rightColumn || content.right || [];
            return (
                <div className="block-match mb-4 break-inside-avoid p-4 bg-white border-2 border-zinc-100 rounded-[2rem] shadow-sm">
                    <div className="flex gap-3">
                        <div className="flex-1 flex flex-col gap-1.5">
                            <p className="block-match-label text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Kavram</p>
                            {leftItems.map((item: any, i: number) => (
                                <div key={i} className="block-match-item flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold">
                                    <span className="block-match-circled text-indigo-500 font-black flex-shrink-0">{CIRCLED[i] || (i + 1)}</span>
                                    <span className="flex-1">{recursiveSafeText(item.text || item)}</span>
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-400 bg-white flex-shrink-0"></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col items-center w-6 pt-6">
                            {leftItems.map((_: any, i: number) => (
                                <div key={i} className="flex-1 flex items-center">
                                    <div className="w-5 border-t border-dashed border-zinc-200"></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex-1 flex flex-col gap-1.5">
                            <p className="block-match-label text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">Eşleşim</p>
                            {rightItems.map((item: any, i: number) => (
                                <div key={i} className="block-match-item flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold">
                                    <div className="w-2.5 h-2.5 rounded-full border-2 border-zinc-400 bg-white flex-shrink-0"></div>
                                    <span className="flex-1">{recursiveSafeText(item.text || item)}</span>
                                    <span className="w-5 border-b border-zinc-400 inline-block flex-shrink-0"></span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        case 'visual_clue_card':
            return (
                <div className="block-clue-card p-4 bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-[1.5rem] mb-3 flex items-start gap-3 border-l-4 border-l-indigo-500 break-inside-avoid">
                    <div className="clue-icon w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-base shadow-sm flex-shrink-0">
                        <i className={`fa-solid ${content.icon || 'fa-lightbulb'}`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h5 className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.15em] mb-0.5">{content.title || 'KLİNİK İPUCU'}</h5>
                        <p className="text-xs font-bold text-zinc-700 leading-snug italic">{content.clue || content.description}</p>
                    </div>
                </div>
            );

        case 'neuro_marker':
            return (
                <div className={`block-neuro my-2 flex ${content.position === 'center' ? 'justify-center' : 'justify-start'}`}>
                    {content.neuroType === 'tracking' && (
                        <div className="flex gap-1.5 items-center opacity-30">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="neuro-dot w-2 h-2 rounded-full bg-zinc-900"></div>)}
                            <i className="fa-solid fa-eye text-[9px]"></i>
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="neuro-dot w-2 h-2 rounded-full bg-zinc-900"></div>)}
                        </div>
                    )}
                    {content.neuroType === 'saccadic' && (
                        <div className="w-full flex justify-between px-6 relative h-10 items-center">
                            <div className="absolute inset-x-6 h-0.5 bg-zinc-100 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-zinc-200"></div>
                            <div className="w-7 h-10 border-2 border-zinc-900 rounded-full flex items-center justify-center bg-white z-10 shadow-sm relative">
                                <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full"></div>
                                <div className="absolute -bottom-5 text-[6px] font-black text-zinc-400 uppercase">BAŞLA</div>
                            </div>
                            <div className="w-10 h-5 border-2 border-zinc-300 rounded-lg bg-zinc-50 z-10"></div>
                            <div className="w-7 h-10 border-2 border-zinc-900 rounded-full flex items-center justify-center bg-white z-10 shadow-sm relative">
                                <div className="w-3.5 h-3.5 border-2 border-zinc-900 rounded-full flex items-center justify-center">
                                    <div className="w-1 h-1 bg-zinc-900 rounded-full"></div>
                                </div>
                                <div className="absolute -bottom-5 text-[6px] font-black text-zinc-400 uppercase">BİTİR</div>
                            </div>
                        </div>
                    )}
                    {content.neuroType === 'focus' && (
                        <div className="flex gap-3 items-center">
                            {[1, 2, 3].map(i => <div key={i} className="neuro-dot w-3 h-3 rounded-full border-2 border-zinc-900" style={{ opacity: 0.1 * (i * 3) }}></div>)}
                            <div className="w-4 h-4 rounded-full bg-zinc-900 opacity-70"></div>
                            {[3, 2, 1].map(i => <div key={i} className="neuro-dot w-3 h-3 rounded-full border-2 border-zinc-900" style={{ opacity: 0.1 * (i * 3) }}></div>)}
                        </div>
                    )}
                </div>
            );

        case 'image':
            return <div className="block-svg-shape mb-4 flex justify-center"><ImageDisplay prompt={content.prompt} className="w-full h-48 rounded-[2rem] shadow-md border-4 border-white" /></div>;

        default:
            return (
                <div className="p-4 border-2 border-amber-100 bg-amber-50 rounded-2xl text-[9px] font-mono text-amber-700 opacity-50">
                    [Bilinmeyen Blok: {block.type}] - Veri: {JSON.stringify(content).slice(0, 50)}...
                </div>
            );
    }
};

const getBlockWeight = (block: WorksheetBlock): number => {
    const type = block.type;
    const content: any = block.content;
    if (!content) return 0;

    switch (type) {
        case 'header': return 40;
        case 'text': {
            const text = recursiveSafeText(content.text || content);
            // Her satır ~80 karakter varsayımıyla (11pt font, 15mm padding)
            const lines = Math.ceil(text.length / 85);
            return 15 + (lines * 22);
        }
        case 'grid': {
            const rows = Math.ceil((content.cells?.length || 0) / (content.cols || 4));
            return 35 + (rows * 32);
        }
        case 'table': {
            const rows = (content.rows || content.data || []).length;
            return 40 + (rows * 28);
        }
        case 'image': return content.height || 260; // Dinamik yükseklik desteği
        case 'cloze_test': {
            const text = recursiveSafeText(content.text || '');
            const lines = Math.ceil(text.length / 80);
            return 60 + (lines * 24);
        }
        case 'categorical_sorting': return 60 + (content.categories?.length || 0) * 45;
        case 'match_columns': {
            const leftLen = (content.leftColumn || content.left || []).length;
            return 50 + leftLen * 35;
        }
        case 'visual_clue_card': return 80;
        case 'neuro_marker': return 45;
        case 'logic_card': return 140;
        case 'footer_validation': return 100;
        case 'svg_shape': return content.height || 100;
        default: return 60;
    }
};

// ════════════════════════════════════════════
// SPLIT LARGE BLOCK — Sayfa sınırında profesyonel bölme
// ════════════════════════════════════════════
const splitLargeBlock = (block: WorksheetBlock, maxWeight: number): WorksheetBlock[] => {
    const content: any = block.content;
    const weight = getBlockWeight(block);
    if (weight <= maxWeight) return [block];

    // TEXT BLOKLARINI CÜMLE/PARAGRAF BAZLI BÖL
    if (block.type === 'text') {
        const text = recursiveSafeText(content.text || '');
        // Nokta sonrası veya yeni satır sonrası böl
        const paragraphs = text.split(/\n+/);
        if (paragraphs.length > 1) {
            const mid = Math.ceil(paragraphs.length / 2);
            return [
                { ...block, content: { ...content, text: paragraphs.slice(0, mid).join('\n').trim() } },
                { ...block, content: { ...content, text: paragraphs.slice(mid).join('\n').trim(), isContinuation: true } }
            ];
        }
        // Tek paragraf ise cümle bazlı böl
        const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
        if (sentences.length >= 2) {
            const mid = Math.ceil(sentences.length / 2);
            return [
                { ...block, content: { ...content, text: sentences.slice(0, mid).join(' ').trim() } },
                { ...block, content: { ...content, text: sentences.slice(mid).join(' ').trim(), isContinuation: true } }
            ];
        }
    }

    if (block.type === 'match_columns') {
        const left: any[] = content.leftColumn || content.left || [];
        const right: any[] = content.rightColumn || content.right || [];
        const chunkSize = Math.max(1, Math.floor((maxWeight - 50) / 35));
        const chunks: WorksheetBlock[] = [];
        for (let i = 0; i < left.length; i += chunkSize) {
            chunks.push({
                ...block,
                content: {
                    ...content,
                    leftColumn: left.slice(i, i + chunkSize),
                    left: left.slice(i, i + chunkSize),
                    rightColumn: right.slice(i, i + chunkSize),
                    right: right.slice(i, i + chunkSize),
                    isContinuation: i > 0
                }
            });
        }
        return chunks;
    }

    if (block.type === 'cloze_test') {
        const text = recursiveSafeText(content.text || '');
        const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
        if (sentences.length >= 2) {
            const mid = Math.ceil(sentences.length / 2);
            return [
                { ...block, content: { ...content, text: sentences.slice(0, mid).join(' ').trim() } },
                { ...block, content: { ...content, text: sentences.slice(mid).join(' ').trim(), isContinuation: true } }
            ];
        }
    }

    if (block.type === 'categorical_sorting') {
        const cats: string[] = content.categories || [];
        const items: any[] = content.items || [];
        if (cats.length > 2) {
            const mid = Math.ceil(cats.length / 2);
            return [
                { ...block, content: { ...content, categories: cats.slice(0, mid), items } },
                { ...block, content: { ...content, categories: cats.slice(mid), items, isContinuation: true } }
            ];
        }
    }

    return [block];
};

const UnifiedContentRenderer = ({ data, studentProfile, settings }: { data: SingleWorksheetData, studentProfile?: StudentProfile | null, settings?: StyleSettings }) => {
    const architecture = data.layoutArchitecture;
    const rawBlocks: WorksheetBlock[] = architecture?.blocks || data.blocks || [];
    const cols = architecture?.cols || 1;

    // ══════════════════════════════════════════════
    // AKILLI SAYFALAMA — Bölme + Ağırlık Sistemi
    // ══════════════════════════════════════════════
    // ══════════════════════════════════════════════
    // AKILLI SAYFALAMA — Bölme + Ağırlık Sistemi
    // ══════════════════════════════════════════════
    const PAGE_MAX_WEIGHT = 920; // Devam sayfalarındaki boşluk marjı için kapasite %12 daraltıldı
    const HEADER_RESERVE = 120; // Başlık alanı payı artırıldı

    // 1. Önce çok büyük blokları böl (Recursive bölme gerekebilir, şimdilik tek seviye)
    let allBlocks: WorksheetBlock[] = [];
    rawBlocks.forEach(block => {
        const weight = getBlockWeight(block);
        if (weight > PAGE_MAX_WEIGHT - HEADER_RESERVE) {
            allBlocks.push(...splitLargeBlock(block, PAGE_MAX_WEIGHT - HEADER_RESERVE));
        } else {
            allBlocks.push(block);
        }
    });

    // 2. Sayfalara dağıt
    const pages: WorksheetBlock[][] = [[]];
    let currentWeight = HEADER_RESERVE;

    allBlocks.forEach((block: WorksheetBlock) => {
        const weight = getBlockWeight(block);
        // Eğer block mevcut sayfaya sığmıyorsa ve sayfa boş değilse yeni sayfaya geç
        if (currentWeight + weight > PAGE_MAX_WEIGHT && pages[pages.length - 1].length > 0) {
            pages.push([block]);
            currentWeight = HEADER_RESERVE + weight;
        } else {
            pages[pages.length - 1].push(block);
            currentWeight += weight;
        }
    });

    const renderPage = (pageBlocks: WorksheetBlock[], pageIdx: number) => (
        <div key={pageIdx} className={`worksheet-page ultra-print-page print-page group mb-8 shadow-2xl relative bg-white overflow-hidden`}>
            {/* Sayfa Üstü Güvenli Alan (Sadece continuation için) */}
            {pageIdx > 0 && <div className="print-spacer" />}

            {/* Öğrenci Bilgi Şeridi */}
            {settings?.showStudentInfo && (
                <div className="w-full px-6 py-4 flex justify-between items-end border-b-2 border-zinc-900 mb-6 font-lexend">
                    <div className="flex gap-12">
                        <div className="flex flex-col">
                            <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">Öğrenci Adı Soyadı</span>
                            <div className="h-6 border-b border-zinc-200 min-w-[180px] font-black text-sm uppercase text-black">
                                {studentProfile?.name || "...................................."}
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">Sınıf / Grup</span>
                            <div className="h-6 border-b border-zinc-200 min-w-[60px] font-black text-sm text-center text-black">
                                {studentProfile?.grade || "........"}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">Çalışma Tarihi</span>
                        <div className="h-6 border-b border-zinc-200 min-w-[80px] font-black text-sm text-right text-black">
                            {new Date().toLocaleDateString('tr-TR')}
                        </div>
                    </div>
                </div>
            )}

            <PedagogicalHeader
                title={pageIdx === 0 ? data.title : `${data.title} (Dvm.)`}
                instruction={pageIdx === 0 ? data.instruction : 'Lütfen çalışmaya devam edin.'}
                note={pageIdx === 0 ? data.pedagogicalNote : ''}
                data={data}
            />

            <div
                className={`print-content-area flex-1 mt-4 ${cols > 1 ? 'grid' : 'flex flex-col'}`}
                style={cols > 1 ? { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '6mm' } : { gap: '6mm' }}
            >
                {pageBlocks.map((block, idx) => (
                    <div key={idx} className="block-container">
                        <BlockRenderer block={block} />
                    </div>
                ))}
            </div>

            {/* Profesyonel Footer */}
            <div className="mt-auto pt-4 border-t-2 border-zinc-900 flex justify-between items-center text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400">
                <div className="flex items-center gap-2">
                    <span className="bg-black text-white px-1.5 py-0.5 rounded font-black">AI</span>
                    <span>Bursa Disleksi AI • Nöro-Mimari Motoru v7.0</span>
                </div>
                <span>SAYFA {pageIdx + 1} / {pages.length}</span>
            </div>
        </div>
    );

    return (
        <div className="w-full flex flex-col items-center gap-10 no-scrollbar" id="print-container">
            {pages.map((p, i) => renderPage(p, i))}
        </div>
    );
};

interface SheetRendererProps {
    activityType: ActivityType | null;
    data: SingleWorksheetData;
    studentProfile?: StudentProfile | null;
    settings?: StyleSettings;
}

export const SheetRenderer = React.memo(({ activityType, data, studentProfile, settings }: SheetRendererProps) => {
    if (!data) return null;

    // Mimari veya Blok yapısı varsa UnifiedRenderer kullan (Klon modülü buradan geçer)
    if (data.layoutArchitecture || data.blocks) {
        return <UnifiedContentRenderer data={data} studentProfile={studentProfile} settings={settings} />;
    }

    // Özel modül renderları (Story Comprehension vb.)
    if (activityType === ActivityType.STORY_COMPREHENSION && data.layout) {
        return <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />;
    }

    // Geleneksel modül renderları
    switch (activityType) {
        case ActivityType.ALGORITHM_GENERATOR: return <AlgorithmSheet data={data as unknown as AlgorithmData} />;
        case ActivityType.MATH_PUZZLE: return <MathPuzzleSheet data={data as unknown as MathPuzzleData} />;
        case ActivityType.NUMBER_PATTERN: return <NumberPatternSheet data={data as unknown as NumberPatternData} />;
        case ActivityType.REAL_LIFE_MATH_PROBLEMS: return <RealLifeMathProblemsSheet data={data as unknown as RealLifeProblemData} />;
        case ActivityType.LOGIC_GRID_PUZZLE: return <LogicGridPuzzleSheet data={data as unknown as LogicGridPuzzleData} />;
        case ActivityType.FUTOSHIKI: return <FutoshikiSheet data={data as unknown as FutoshikiData} />;
        case ActivityType.NUMBER_PYRAMID: return <NumberPyramidSheet data={data as unknown as NumberPyramidData} />;
        case ActivityType.ODD_ONE_OUT: return <OddOneOutSheet data={data as unknown as OddOneOutData} />;
        case ActivityType.NUMBER_LOGIC_RIDDLES: return <NumberLogicRiddleSheet data={data as unknown as NumberLogicRiddleData} />;
        case ActivityType.NUMBER_PATH_LOGIC: return <NumberPathLogicSheet data={data as unknown as NumberPathLogicData} />;
        case ActivityType.VISUAL_ARITHMETIC: return <VisualArithmeticSheet data={data as unknown as VisualArithmeticData} />;
        case ActivityType.CLOCK_READING: return <ClockReadingSheet data={data as unknown as ClockReadingData} />;
        case ActivityType.NUMBER_SENSE: return <NumberSenseSheet data={data as unknown as NumberSenseData} />;
        case ActivityType.MONEY_COUNTING: return <MoneyCountingSheet data={data as unknown as MoneyCountingData} />;
        case ActivityType.MATH_MEMORY_CARDS: return <MathMemoryCardsSheet data={data as unknown as MathMemoryCardsData} />;
        case ActivityType.SPATIAL_GRID: return <SpatialGridSheet data={data as unknown as SpatialGridData} />;
        case ActivityType.CONCEPT_MATCH: return <ConceptMatchSheet data={data as unknown as ConceptMatchData} />;
        case ActivityType.ESTIMATION: return <EstimationSheet data={data as unknown as EstimationData} />;
        case ActivityType.ABC_CONNECT: return <AbcConnectSheet data={data as unknown as AbcConnectData} />;
        case ActivityType.ODD_EVEN_SUDOKU: return <OddEvenSudokuSheet data={data as unknown as OddEvenSudokuData} />;
        case ActivityType.MAGIC_PYRAMID: return <MagicPyramidSheet data={data as unknown as MagicPyramidData} />;
        case ActivityType.CAPSULE_GAME: return <CapsuleGameSheet data={data as unknown as NumberCapsuleData} />;
        case ActivityType.WORD_MEMORY: return <WordMemorySheet data={data as unknown as WordMemoryData} />;
        case ActivityType.VISUAL_MEMORY: return <VisualMemorySheet data={data as unknown as VisualMemoryData} />;
        case ActivityType.CHARACTER_MEMORY: return <CharacterMemorySheet data={data as unknown as CharacterMemoryData} />;
        case ActivityType.COLOR_WHEEL_MEMORY: return <ColorWheelSheet data={data as unknown as ColorWheelMemoryData} />;
        case ActivityType.IMAGE_COMPREHRENSION: return <ImageComprehensionSheet data={data as unknown as ImageComprehensionData} />;
        case ActivityType.STROOP_TEST: return <StroopTestSheet data={data as unknown as StroopTestData} />;
        case ActivityType.BURDON_TEST: return <BurdonTestSheet data={data as unknown as LetterGridTestData} />;
        case ActivityType.NUMBER_SEARCH: return <NumberSearchSheet data={data as unknown as NumberSearchData} />;
        case ActivityType.CHAOTIC_NUMBER_SEARCH: return <ChaoticNumberSearchSheet data={data as unknown as ChaoticNumberSearchData} />;
        case ActivityType.ATTENTION_DEVELOPMENT: return <AttentionDevelopmentSheet data={data as unknown as AttentionDevelopmentData} />;
        case ActivityType.ATTENTION_FOCUS: return <AttentionFocusSheet data={data as unknown as AttentionFocusData} />;
        case ActivityType.FIND_IDENTICAL_WORD: return <FindDuplicateSheet data={data as unknown as FindDuplicateData} />;
        case ActivityType.LETTER_GRID_TEST: return <LetterGridTestSheet data={data as unknown as LetterGridTestData} />;
        case ActivityType.FIND_LETTER_PAIR: return <FindLetterPairSheet data={data as unknown as FindLetterPairData} />;
        case ActivityType.TARGET_SEARCH: return <TargetSearchSheet data={data as unknown as TargetSearchData} />;
        case ActivityType.STORY_COMPREHENSION: return <StoryComprehensionSheet data={data as unknown as InteractiveStoryData} />;
        case ActivityType.SYLLABLE_MASTER_LAB: return <SyllableMasterLabSheet data={data as unknown as SyllableMasterLabData} />;
        case ActivityType.READING_SUDOKU: return <ReadingSudokuSheet data={data as unknown as ReadingSudokuData} />;
        case ActivityType.READING_STROOP: return <ReadingStroopSheet data={data as unknown as ReadingStroopData} />;
        case ActivityType.SYNONYM_ANTONYM_MATCH: return <SynonymAntonymMatchSheet data={data as unknown as SynonymAntonymMatchData} />;
        case ActivityType.SYLLABLE_WORD_BUILDER: return <SyllableWordBuilderSheet data={data as unknown as SyllableWordBuilderData} />;
        case ActivityType.LETTER_VISUAL_MATCHING: return <LetterVisualMatchingSheet data={data as unknown as LetterVisualMatchingData} />;
        case ActivityType.FAMILY_RELATIONS: return <FamilyRelationsSheet data={data as unknown as FamilyRelationsData} />;
        case ActivityType.FAMILY_LOGIC_TEST: return <FamilyLogicSheet data={data as unknown as FamilyLogicTestData} />;
        case ActivityType.MORPHOLOGY_MATRIX: return <MorphologyMatrixSheet data={data as unknown as MorphologyMatrixData} />;
        case ActivityType.READING_PYRAMID: return <ReadingPyramidSheet data={data as unknown as ReadingPyramidData} />;
        case ActivityType.READING_FLOW: return <ReadingFlowSheet data={data as unknown as ReadingFlowData} />;
        case ActivityType.PHONOLOGICAL_AWARENESS: return <PhonologicalAwarenessSheet data={data as unknown as PhonologicalAwarenessData} />;
        case ActivityType.RAPID_NAMING: return <RapidNamingSheet data={data as unknown as RapidNamingData} />;
        case ActivityType.LETTER_DISCRIMINATION: return <LetterDiscriminationSheet data={data as unknown as LetterDiscriminationData} />;
        case ActivityType.MIRROR_LETTERS: return <MirrorLettersSheet data={data as unknown as MirrorLettersData} />;
        case ActivityType.SYLLABLE_TRAIN: return <SyllableTrainSheet data={data as unknown as SyllableTrainData} />;
        case ActivityType.VISUAL_TRACKING_LINES: return <VisualTrackingLinesSheet data={data as unknown as VisualTrackingLineData} />;
        case ActivityType.BACKWARD_SPELLING: return <BackwardSpellingSheet data={data as unknown as BackwardSpellingData} />;
        case ActivityType.CODE_READING: return <CodeReadingSheet data={data as unknown as CodeReadingData} />;
        case ActivityType.ATTENTION_TO_QUESTION: return <AttentionToQuestionSheet data={data as unknown as AttentionToQuestionData} />;
        case ActivityType.HANDWRITING_PRACTICE: return <HandwritingPracticeSheet data={data as unknown as HandwritingPracticeData} />;
        case ActivityType.MAP_INSTRUCTION: return <MapDetectiveSheet data={data as unknown as MapInstructionData} />;
        case ActivityType.FIND_THE_DIFFERENCE: return <FindTheDifferenceSheet data={data as unknown as FindTheDifferenceData} />;
        case ActivityType.VISUAL_ODD_ONE_OUT: return <VisualOddOneOutSheet data={data as unknown as VisualOddOneOutData} />;
        case ActivityType.GRID_DRAWING: return <GridDrawingSheet data={data as unknown as GridDrawingData} />;
        case ActivityType.SYMMETRY_DRAWING: return <SymmetryDrawingSheet data={data as unknown as SymmetryDrawingData} />;
        case ActivityType.SHAPE_COUNTING: return <ShapeCountingSheet data={data as unknown as ShapeCountingData} />;
        case ActivityType.DIRECTIONAL_TRACKING: return <DirectionalTrackingSheet data={data as unknown as DirectionalTrackingData} />;
        case ActivityType.HIDDEN_PASSWORD_GRID: return <HiddenPasswordGridSheet data={data as unknown as HiddenPasswordGridData} />;
        case ActivityType.WORD_SEARCH: return <WordSearchSheet data={data as unknown as WordSearchData} />;
        case ActivityType.ANAGRAM: return <AnagramSheet data={data as unknown as AnagramsData} />;
        case ActivityType.CROSSWORD: return <CrosswordSheet data={data as unknown as CrosswordData} />;
        default: return <UnifiedContentRenderer data={data} studentProfile={studentProfile} settings={settings} />;
    }
});
