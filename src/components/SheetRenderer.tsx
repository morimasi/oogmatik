// @ts-nocheck
import React, { useState, useCallback, useMemo } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { A4PrintableWrapper } from '../A4Printable/A4PrintableWrapper';
import { InfoGraphicRenderer, OcrRenderer, ExamRenderer } from './sheet-renderers';
import { Modifier } from '@dnd-kit/core';
import {
  ActivityType,
  SingleWorksheetData,
  WorksheetBlock,
  StudentProfile,
  StyleSettings,
  AlgorithmData,
  MathPuzzleData,
  NumberPatternData,
  RealLifeProblemData,
  LogicGridPuzzleData,
  FutoshikiData,
  NumberPyramidData,
  OddOneOutData,
  NumberLogicRiddleData,
  NumberPathLogicData,
  VisualArithmeticData,
  ClockReadingData,
  NumberSenseData,
  MoneyCountingData,
  MathMemoryCardsData,
  SpatialGridData,
  ConceptMatchData,
  EstimationData,
  AbcConnectData,
  OddEvenSudokuData,
  MagicPyramidData,
  NumberCapsuleData,
  WordMemoryData,
  VisualMemoryData,
  CharacterMemoryData,
  ColorWheelMemoryData,
  ImageComprehensionData,
  StroopTestData,
  LetterGridTestData,
  NumberSearchData,
  ChaoticNumberSearchData,
  AttentionDevelopmentData,
  AttentionFocusData,
  FindDuplicateData,
  FindLetterPairData,
  TargetSearchData,
  InteractiveStoryData,
  SyllableMasterLabData,
  ReadingSudokuData,
  ReadingStroopData,
  SynonymAntonymMatchData,
  SyllableWordBuilderData,
  LetterVisualMatchingData,
  FamilyRelationsData,
  FamilyLogicTestData,
  MorphologyMatrixData,
  ReadingPyramidData,
  ReadingFlowData,
  PhonologicalAwarenessData,
  RapidNamingData,
  LetterDiscriminationData,
  MirrorLettersData,
  SyllableTrainData,
  VisualTrackingLineData,
  BackwardSpellingData,
  CodeReadingData,
  AttentionToQuestionData,
  HandwritingPracticeData,
  MapInstructionData,
  FindTheDifferenceData,
  VisualOddOneOutData,
  GridDrawingData,
  SymmetryDrawingData,
  ShapeCountingData,
  DirectionalTrackingData,
  HiddenPasswordGridData,
  WordSearchData,
  AnagramsData,
  CrosswordData,
} from '../types';

import { A4PrintableSheetV2 } from './InfographicStudio/panels/CenterPanel/A4PrintableSheetV2';

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
import {
  WordMemorySheet,
  VisualMemorySheet,
  CharacterMemorySheet,
  ColorWheelSheet,
  ImageComprehensionSheet,
} from './sheets/attention/MemorySheets';
import { StroopTestSheet } from './sheets/attention/StroopTestSheet';
import {
  BurdonTestSheet,
  NumberSearchSheet,
  AttentionDevelopmentSheet,
  ChaoticNumberSearchSheet,
  AttentionFocusSheet,
  FindDuplicateSheet,
  LetterGridTestSheet,
  TargetSearchSheet,
} from './sheets/attention/AttentionSheets';
import { StoryComprehensionSheet } from './sheets/verbal/StoryComprehensionSheet';
import { ReadingFlowSheet } from './sheets/verbal/ReadingFlowSheet';
import {
  PhonologicalAwarenessSheet,
  RapidNamingSheet,
  LetterDiscriminationSheet,
  MirrorLettersSheet,
  SyllableTrainSheet,
  VisualTrackingLinesSheet,
  BackwardSpellingSheet,
  CodeReadingSheet,
  AttentionToQuestionSheet,
  HandwritingPracticeSheet,
} from './sheets/verbal/ReadingSupportSheets';
import {
  AnagramSheet,
  WordSearchSheet,
  HiddenPasswordGridSheet,
  CrosswordSheet,
} from './sheets/verbal/WordGameSheets';
import {
  SyllableMasterLabSheet,
  ReadingSudokuSheet,
  ReadingStroopSheet,
  SynonymAntonymMatchSheet,
  SyllableWordBuilderSheet,
  LetterVisualMatchingSheet,
  FamilyLogicSheet,
  FamilyRelationsSheet,
  FindLetterPairSheet,
  MorphologyMatrixSheet,
  ReadingPyramidSheet,
} from './sheets/verbal/ReadingSheets';
import { FiveWOneHSheet } from './sheets/verbal/FiveWOneHSheet';
import { ColorfulSyllableReadingSheet } from './sheets/verbal/ColorfulSyllableReadingSheet';
import { FamilyTreeMatrixSheet } from './sheets/verbal/FamilyTreeMatrixSheet';
import { KavramHaritasiSheet } from './sheets/verbal/KavramHaritasiSheet';
import { EsAnlamliKelimelerSheet } from './sheets/verbal/EsAnlamliKelimelerSheet';
import { ApartmentLogicSheet } from './sheets/math/ApartmentLogicSheet';
import { FinancialMarketSheet } from './sheets/math/FinancialMarketSheet';
import { DirectionalCodeReadingSheet } from './sheets/visual/DirectionalCodeReadingSheet';
import { MapDetectiveSheet } from './sheets/visual/MapDetectiveSheet';
import { FindTheDifferenceSheet } from './sheets/visual/FindTheDifferenceSheet';
import { VisualOddOneOutSheet } from './sheets/visual/VisualOddOneOutSheet';
import { LogicErrorHunterSheet } from './sheets/verbal/LogicErrorHunterSheet';
import { PatternCompletionSheet } from './sheets/visual/PatternCompletionSheet';
import { GridDrawingSheet } from './sheets/visual/GridDrawingSheet';
import { SymmetryDrawingSheet } from './sheets/visual/SymmetryDrawingSheet';
import { ShapeCountingSheet } from './sheets/visual/ShapeCountingSheet';
import { DirectionalTrackingSheet } from './sheets/visual/DirectionalTrackingSheet';
import { ReadingStudioContentRenderer } from './ReadingStudio/ReadingStudioContentRenderer';
import { VisualInterpretationSheet } from './sheets/visual/VisualInterpretationSheet';
import { BrainTeasersSheet } from './sheets/logic/BrainTeasersSheet';
import { BoxMathSheet } from './sheets/math/BoxMathSheet';
import { PedagogicalHeader, ImageDisplay } from './sheets/common';

import { EditableText } from './Editable';
import { useA4EditorStore } from '../store/useA4EditorStore';

const recursiveSafeText = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.map(recursiveSafeText).join(', ');

    // Priority keys
    const keys = [
      'text',
      'char',
      'value',
      'label',
      'clue',
      'title',
      'word',
      'name',
      'content',
      'data',
      'val',
    ];
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
      return '';
    }
  }
  return String(val);
};

// BOLT OPTIMIZATION: Memoize BlockRenderer to prevent unnecessary re-renders of individual blocks
export const BlockRenderer = React.memo(({ block }: { block: WorksheetBlock }) => {
  const content: any = block.content;
  if (!content) return null;

  const blockStyle = {
    textAlign: (block.style?.textAlign as any) || 'left',
    fontWeight: (block.style?.fontWeight as any) || 'normal',
    fontSize: block.style?.fontSize ? `${block.style.fontSize}px` : undefined,
    backgroundColor: block.style?.backgroundColor || 'transparent',
    borderRadius: block.style?.borderRadius ? `${block.style.borderRadius}px` : undefined,
    color: block.style?.color || 'inherit',
  };

  switch (block.type) {
    case 'header':
      return (
        <h2
          className="block-header text-3xl font-black uppercase text-center mb-4 print:mb-2 border-b-4 border-black pb-2 print:pb-1 break-inside-avoid print:break-inside-avoid"
          style={blockStyle}
        >
          <EditableText value={recursiveSafeText(content.text || content)} tag="span" />
        </h2>
      );

    case 'text':
      return (
        <div
          className="block-text text-lg leading-relaxed mb-4 print:mb-1 font-dyslexic break-inside-avoid print:break-inside-avoid"
          style={blockStyle}
        >
          <EditableText value={recursiveSafeText(content.text || content)} tag="div" />
        </div>
      );

    case 'grid': {
      const cells = content.cells || content.items || content.data || [];
      const cols = content.cols || content.columns || 4;
      return (
        <div className="block-svg-shape flex justify-center mb-4 print:mb-2 break-inside-avoid print:break-inside-avoid">
          <div
            className="block-grid-container grid gap-2 border-4 border-black p-4 print:p-2 bg-zinc-50 rounded-2xl"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {cells.map((cell: any, i: number) => (
              <div
                key={i}
                className="block-grid-cell w-12 h-12 border-2 border-zinc-300 bg-white rounded-lg flex items-center justify-center font-black text-xl"
              >
                <EditableText value={recursiveSafeText(cell)} tag="span" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'table': {
      const headers: string[] = content.headers || content.columns || [];
      const rows: any[][] = content.rows || content.data || content.items || [];
      return (
        <div className="block-table-container overflow-hidden border-4 border-black rounded-2xl mb-4 print:mb-2 bg-white mx-auto max-w-full shadow-sm break-inside-avoid print:break-inside-avoid">
          <table className="w-full border-collapse">
            {headers.length > 0 && (
              <thead className="bg-zinc-100">
                <tr>
                  {headers.map((h: string, i: number) => (
                    <th
                      key={i}
                      className="p-3 text-[10px] font-black uppercase border-r border-black last:border-0"
                    >
                      {recursiveSafeText(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row: any[], i: number) => (
                <tr key={i} className="border-t border-zinc-200">
                  {(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => (
                    <td
                      key={j}
                      className="p-3 text-center font-bold text-sm border-r border-zinc-100 last:border-0"
                    >
                      <EditableText value={recursiveSafeText(cell)} tag="span" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'logic_card':
      return (
        <div className="block-logic-card p-5 print:p-2 border-[3px] border-zinc-900 rounded-[2.5rem] bg-white shadow-sm flex flex-col gap-3 print:gap-1 mb-3 print:mb-1 break-inside-avoid print:break-inside-avoid">
          <div className="logic-text-box bg-zinc-900 text-white p-3 rounded-2xl text-center text-sm font-bold italic mb-1">
            <EditableText value={recursiveSafeText(content.text)} tag="p" />
          </div>
          {content.data && (
            <div className="flex justify-center gap-3">
              {content.data.map((box: string[], bIdx: number) => (
                <div
                  key={bIdx}
                  className="border-2 border-zinc-800 p-2 rounded-xl bg-zinc-50 flex flex-wrap justify-center gap-1 min-w-[60px]"
                >
                  {box.map((num, nIdx) => (
                    <span key={nIdx} className="font-mono font-black text-base">
                      {num}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-around pt-2 border-t-2 border-dashed border-zinc-100">
            {(content.options || []).map((opt: string, oIdx: number) => (
              <div key={oIdx} className="flex flex-col items-center gap-1">
                <div className="logic-option-btn w-9 h-9 rounded-xl border-2 border-zinc-200 flex items-center justify-center font-black text-sm">
                  {opt}
                </div>
                <span className="text-[8px] font-black text-zinc-300 uppercase">
                  {String.fromCharCode(65 + oIdx)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'footer_validation':
      return (
        <div className="block-footer-val mt-4 p-6 bg-zinc-900 text-white rounded-[2.5rem] border-4 border-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 break-inside-avoid print:break-inside-avoid">
          <div className="flex-1">
            <h4 className="text-xl font-black tracking-tight mb-1 uppercase">
              KONTROL VE DOĞRULAMA
            </h4>
            <p className="text-xs text-zinc-400 font-medium leading-relaxed italic">
              <EditableText value={recursiveSafeText(content.text)} tag="span" />
            </p>
          </div>
          <div className="flex items-center gap-5 bg-white/10 p-4 rounded-[1.5rem] border border-white/20">
            <div className="text-center">
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest block mb-1">
                HEDEF
              </span>
              <div className="target-value text-3xl font-black text-amber-400 font-mono">
                {content.targetValue}
              </div>
            </div>
            <div className="w-px h-10 bg-white/20"></div>
            <div className="text-center">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block mb-1">
                CEVABIM
              </span>
              <div className="w-16 h-8 border-b-4 border-dashed border-zinc-700"></div>
            </div>
          </div>
        </div>
      );

    case 'svg_shape':
      return (
        <div className="block-svg-shape flex justify-center mb-4 break-inside-avoid print:break-inside-avoid">
          <div className="svg-container w-32 h-32 p-2 border-2 border-zinc-100 rounded-2xl bg-white shadow-sm">
            <svg viewBox={content.viewBox || '0 0 100 100'} className="w-full h-full text-black">
              {(content.paths || []).map((p: string, i: number) => (
                <path
                  key={i}
                  d={p}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              ))}
            </svg>
          </div>
        </div>
      );

    case 'cloze_test': {
      const rawText = recursiveSafeText(content.text || content);
      const parts = rawText.split(/(\[.*?\])/g);
      return (
        <div
          className="block-cloze p-5 print:p-2 bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-[2rem] mb-4 print:mb-1 relative break-inside-avoid print:break-inside-avoid"
          style={{ lineHeight: '2.4', fontSize: '11px' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-zinc-900 text-white text-[8px] font-black uppercase tracking-widest rounded-full">
              <i className="fa-solid fa-pen-nib mr-1"></i>Boşluk Doldur
            </span>
            {content.blanks && (
              <span className="text-[8px] text-zinc-400 font-bold">
                {content.blanks.length} boşluk
              </span>
            )}
          </div>
          <div className="font-dyslexic text-zinc-800" style={{ lineHeight: '2.4' }}>
            {parts.map((part: string, i: number) =>
              part.startsWith('[') && part.endsWith(']') ? (
                <span key={i} className="inline-flex flex-col items-center mx-1 align-bottom">
                  <span className="cloze-blank inline-block min-w-[80px] border-b-[2px] border-zinc-700 text-transparent select-none text-xs leading-none pb-0.5">
                    {part.slice(1, -1)}
                  </span>
                  <span className="cloze-label text-[6px] text-zinc-300 font-bold tracking-widest">
                    YAZ
                  </span>
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
        <div className="block-categorical mb-4 break-inside-avoid print:break-inside-avoid">
          {unassigned.length > 0 && (
            <div className="block-cat-bank mb-3 p-3 bg-white border-2 border-zinc-100 rounded-xl">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                Sırala →
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unassigned.map((item: any, j: number) => (
                  <span
                    key={j}
                    className="block-cat-item px-2 py-1 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-black text-zinc-700"
                  >
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
                      <div
                        key={j}
                        className="block-cat-item px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
                      >
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
      const CIRCLED = [
        '\u2460',
        '\u2461',
        '\u2462',
        '\u2463',
        '\u2464',
        '\u2465',
        '\u2466',
        '\u2467',
        '\u2468',
        '\u2469',
      ];
      const leftItems: any[] = content.leftColumn || content.left || [];
      const rightItems: any[] = content.rightColumn || content.right || [];
      return (
        <div className="block-match mb-4 print:mb-1 break-inside-avoid print:break-inside-avoid p-4 print:p-2 bg-white border-2 border-zinc-100 rounded-[2rem] shadow-sm">
          <div className="flex gap-3">
            <div className="flex-1 flex flex-col gap-1.5">
              <p className="block-match-label text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">
                Kavram
              </p>
              {leftItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className="block-match-item flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                >
                  <span className="block-match-circled text-indigo-500 font-black flex-shrink-0">
                    {CIRCLED[i] || i + 1}
                  </span>
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
              <p className="block-match-label text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 text-center">
                Eşleşim
              </p>
              {rightItems.map((item: any, i: number) => (
                <div
                  key={i}
                  className="block-match-item flex items-center gap-2 p-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold"
                >
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
        <div className="block-clue-card p-4 bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-[1.5rem] mb-3 flex items-start gap-3 border-l-4 border-l-indigo-500 break-inside-avoid print:break-inside-avoid">
          <div className="clue-icon w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center text-base shadow-sm flex-shrink-0">
            <i className={`fa-solid ${content.icon || 'fa-lightbulb'}`}></i>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.15em] mb-0.5">
              {content.title || 'KLİNİK İPUCU'}
            </h5>
            <p className="text-xs font-bold text-zinc-700 leading-snug italic">
              {content.clue || content.description}
            </p>
          </div>
        </div>
      );

    case 'neuro_marker':
      return (
        <div
          className={`block-neuro my-2 flex ${content.position === 'center' ? 'justify-center' : 'justify-start'}`}
        >
          {content.neuroType === 'tracking' && (
            <div className="flex gap-1.5 items-center opacity-30">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="neuro-dot w-2 h-2 rounded-full bg-zinc-900"></div>
              ))}
              <i className="fa-solid fa-eye text-[9px]"></i>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="neuro-dot w-2 h-2 rounded-full bg-zinc-900"></div>
              ))}
            </div>
          )}
          {content.neuroType === 'saccadic' && (
            <div className="w-full flex justify-between px-6 relative h-10 items-center">
              <div className="absolute inset-x-6 h-0.5 bg-zinc-100 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-zinc-200"></div>
              <div className="w-7 h-10 border-2 border-zinc-900 rounded-full flex items-center justify-center bg-white z-10 shadow-sm relative">
                <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full"></div>
                <div className="absolute -bottom-5 text-[6px] font-black text-zinc-400 uppercase">
                  BAŞLA
                </div>
              </div>
              <div className="w-10 h-5 border-2 border-zinc-300 rounded-lg bg-zinc-50 z-10"></div>
              <div className="w-7 h-10 border-2 border-zinc-900 rounded-full flex items-center justify-center bg-white z-10 shadow-sm relative">
                <div className="w-3.5 h-3.5 border-2 border-zinc-900 rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-zinc-900 rounded-full"></div>
                </div>
                <div className="absolute -bottom-5 text-[6px] font-black text-zinc-400 uppercase">
                  BİTİR
                </div>
              </div>
            </div>
          )}
          {content.neuroType === 'focus' && (
            <div className="flex gap-3 items-center">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="neuro-dot w-3 h-3 rounded-full border-2 border-zinc-900"
                  style={{ opacity: 0.1 * (i * 3) }}
                ></div>
              ))}
              <div className="w-4 h-4 rounded-full bg-zinc-900 opacity-70"></div>
              {[3, 2, 1].map((i) => (
                <div
                  key={i}
                  className="neuro-dot w-3 h-3 rounded-full border-2 border-zinc-900"
                  style={{ opacity: 0.1 * (i * 3) }}
                ></div>
              ))}
            </div>
          )}
        </div>
      );

    case 'image':
      return (
        <div className="block-svg-shape mb-4 flex justify-center break-inside-avoid print:break-inside-avoid">
          <ImageDisplay
            prompt={content.prompt}
            className="w-full h-48 rounded-[2rem] shadow-md border-4 border-white"
          />
        </div>
      );

    default:
      return (
        <div className="p-4 border-2 border-amber-100 bg-amber-50 rounded-2xl text-[9px] font-mono text-amber-700 opacity-50">
          [Bilinmeyen Blok: {block.type}] - Veri: {JSON.stringify(content).slice(0, 50)}...
        </div>
      );
  }
});

const getBlockWeight = (block: WorksheetBlock): number => {
  const type = block.type;
  const content: any = block.content;
  if (!content) return 0;

  switch (type) {
    case 'header':
      return 80;
    case 'text': {
      const text = recursiveSafeText(content.text || content);
      const lines = Math.ceil(text.length / 75);
      return 25 + lines * 28;
    }
    case 'grid': {
      const rows = Math.ceil((content.cells?.length || 0) / (content.cols || 4));
      return 45 + rows * 40;
    }
    case 'table': {
      const rows = (content.rows || content.data || []).length;
      return 50 + rows * 35;
    }
    case 'image':
      return content.height || 300; // Dinamik yükseklik desteği
    case 'cloze_test': {
      const text = recursiveSafeText(content.text || '');
      const lines = Math.ceil(text.length / 70);
      return 70 + lines * 30;
    }
    case 'categorical_sorting':
      return 80 + (content.categories?.length || 0) * 55;
    case 'match_columns': {
      const leftLen = (content.leftColumn || content.left || []).length;
      return 60 + leftLen * 45;
    }
    case 'visual_clue_card':
      return 100;
    case 'neuro_marker':
      return 60;
    case 'logic_card':
      return 160;
    case 'footer_validation':
      return 120;
    case 'svg_shape':
      return content.height || 120;
    default:
      return 85;
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
        {
          ...block,
          content: {
            ...content,
            text: paragraphs.slice(mid).join('\n').trim(),
            isContinuation: true,
          },
        },
      ];
    }
    // Tek paragraf ise cümle bazlı böl
    const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
    if (sentences.length >= 2) {
      const mid = Math.ceil(sentences.length / 2);
      return [
        { ...block, content: { ...content, text: sentences.slice(0, mid).join(' ').trim() } },
        {
          ...block,
          content: {
            ...content,
            text: sentences.slice(mid).join(' ').trim(),
            isContinuation: true,
          },
        },
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
          isContinuation: i > 0,
        },
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
        {
          ...block,
          content: {
            ...content,
            text: sentences.slice(mid).join(' ').trim(),
            isContinuation: true,
          },
        },
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
        {
          ...block,
          content: { ...content, categories: cats.slice(mid), items, isContinuation: true },
        },
      ];
    }
  }

  return [block];
};

const UnifiedContentRenderer = ({
  data,
  activityType,
  studentProfile,
  settings,
}: {
  data: SingleWorksheetData;
  activityType: ActivityType | null;
  studentProfile?: StudentProfile | null;
  settings?: StyleSettings;
}) => {
  const { isEditorOpen, selectedBlockId, setSelectedBlockId, snapToGrid, gridSize } =
    useA4EditorStore();
  const architecture = data.layoutArchitecture;
  const rawBlocks: WorksheetBlock[] = 
    (architecture?.blocks && architecture.blocks.length > 0 ? architecture.blocks : null) || 
    (data.blocks && data.blocks.length > 0 ? data.blocks : null) || 
    (data.puzzles && data.puzzles.length > 0 ? data.puzzles : null) || 
    (data.operations && data.operations.length > 0 ? data.operations : null) || 
    (data.items && data.items.length > 0 ? data.items : null) || 
    (data.problems && data.problems.length > 0 ? data.problems : null) || 
    (data.steps && data.steps.length > 0 ? data.steps : null) || 
    [];
  const cols = architecture?.cols || 1;


  // DnD sensors — editor modunda blok sıralama için
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const snapModifier: Modifier = ({ transform }) => {
    if (!transform || !snapToGrid) return transform;
    return {
      ...transform,
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    };
  };

  // ══════════════════════════════════════════════
  // AKILLI SAYFALAMA — Bölme + Ağırlık Sistemi
  // ══════════════════════════════════════════════
  // ══════════════════════════════════════════════
  // AKILLI SAYFALAMA — Bölme + Ağırlık Sistemi
  // ══════════════════════════════════════════════
  // BOLT OPTIMIZATION: Memoize pagination logic to avoid expensive recalculations on every render
  const pages = useMemo(() => {
    const PAGE_MAX_WEIGHT = 1188; // 297mm * 4 (Milimetrik Standart)
    const STUDENT_INFO_RESERVE = settings?.showStudentInfo ? 80 : 0;
    const HEADER_RESERVE = 180; // PedagogicalHeader için güvenli alan (45mm)
    const FOOTER_RESERVE = 60; // Sayfa altı güvenli alan (15mm)

    // 1. Önce çok büyük blokları böl (Recursive bölme gerekebilir, şimdilik tek seviye)
    let allBlocks: WorksheetBlock[] = [];
    rawBlocks.forEach((block) => {
      const weight = getBlockWeight(block);
      if (weight > PAGE_MAX_WEIGHT - HEADER_RESERVE) {
        allBlocks.push(...splitLargeBlock(block, PAGE_MAX_WEIGHT - HEADER_RESERVE));
      } else {
        allBlocks.push(block);
      }
    });

    // 2. Sayfalara dağıt (Milimetrik Greedy Algoritması)
    const pagesResult: WorksheetBlock[][] = [[]];
    let currentWeight = HEADER_RESERVE + STUDENT_INFO_RESERVE;

    allBlocks.forEach((block: WorksheetBlock) => {
      const weight = getBlockWeight(block);

      // Eğer blok tek başına bir sayfadan büyükse (artık allBlocks splitten geçtiği için bu nadirdir)
      // ya da mevcut sayfaya sığmıyorsa
      if (currentWeight + weight > PAGE_MAX_WEIGHT - FOOTER_RESERVE) {
        // Sığmayan bloğu tekrar bölmeyi dene (Son dakika greedy split)
        const remainingSpace = PAGE_MAX_WEIGHT - FOOTER_RESERVE - currentWeight;

        if (remainingSpace > 150) {
          // En az 37mm yer varsa bölmeye çalış
          const splitResults = splitLargeBlock(block, remainingSpace);
          if (splitResults.length > 1) {
            pagesResult[pagesResult.length - 1].push(splitResults[0]);
            pagesResult.push([splitResults[1]]);
            currentWeight = HEADER_RESERVE + STUDENT_INFO_RESERVE + getBlockWeight(splitResults[1]);
            return;
          }
        }

        // Bölünemiyorsa veya yer çok azsa direkt yeni sayfaya at
        pagesResult.push([block]);
        currentWeight = HEADER_RESERVE + STUDENT_INFO_RESERVE + weight;
      } else {
        pagesResult[pagesResult.length - 1].push(block);
        currentWeight += weight;
      }
    });
    return pagesResult;
  }, [rawBlocks, settings?.showStudentInfo]);

  const renderPage = (pageBlocks: WorksheetBlock[], pageIdx: number) => {
    const isLandscape = settings?.orientation === 'landscape';
    const pageClass = `worksheet-page ultra-print-page print-page group mb-8 shadow-2xl relative bg-white overflow-hidden flex flex-col ${isLandscape ? 'landscape landscape-print' : ''}`;

    return (
      <div
        key={pageIdx}
        data-page-idx={pageIdx}
        className={pageClass}
        style={{
          backgroundColor: 'white',
          color: 'black',
          colorScheme: 'light' as any,
          padding: settings?.margin ? `${settings.margin}mm` : '15mm',
        }}
      >
        {/* Ekranda Sayfa Numarası (Print'te gizli) */}
        <div className="page-indicator-screen no-print">SAYFA {pageIdx + 1}</div>

        {/* Sayfa Üstü Marj (Hassas Simetri Kontrolü) */}
        <div className="print-top-margin h-0" />

        {/* Öğrenci Bilgi Şeridi */}
        {settings?.showStudentInfo && (
          <div className="w-full px-6 py-4 flex justify-between items-end border-b-2 border-zinc-900 mb-6 font-lexend">
            <div className="flex gap-12">
              <div className="flex flex-col">
                <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">
                  Öğrenci Adı Soyadı
                </span>
                <div className="h-6 border-b border-zinc-200 min-w-[180px] font-black text-sm uppercase text-black">
                  {studentProfile?.name || '....................................'}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">
                  Sınıf / Grup
                </span>
                <div className="h-6 border-b border-zinc-200 min-w-[60px] font-black text-sm text-center text-black">
                  {studentProfile?.grade || '........'}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">
                Çalışma Tarihi
              </span>
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

        {/* Z-index Kılavuz Çizgileri / Grid Overlay */}
        {isEditorOpen && snapToGrid && (
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-20 no-print"
            style={{
              backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
          />
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={snapToGrid ? [snapModifier] : undefined}
        >
          <SortableContext
            items={pageBlocks.map((b, idx) => b.id || `block-${idx}`)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className={`print-content-area mt-4 ${cols > 1 ? 'grid' : 'flex flex-col'}`}
              style={
                cols > 1
                  ? { gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '6mm' }
                  : { gap: '6mm' }
              }
            >
              {pageBlocks.map((block, idx) => {
                // EĞER STANDART BLOK DEĞİLSE LEGACY RENDERER TETİKLE
                // Standart blok kriteri: type özelliği olmalı
                const isStandardBlock = !!block.type;

                return (
                  <SortableBlockItem
                    key={block.id || `b-${pageIdx}-${idx}`}
                    block={block}
                    idx={idx}
                    isEditorOpen={isEditorOpen}
                    selectedBlockId={selectedBlockId}
                    setSelectedBlockId={setSelectedBlockId}
                  >
                    {!isStandardBlock ? (
                       <SheetRenderer 
                          activityType={activityType} 
                          data={{ 
                            ...data, 
                            blocks: undefined, 
                            puzzles: [block], 
                            items: [block], 
                            problems: [block], 
                            steps: [block], 
                            operations: [block] 
                          }} 
                          hideWrapper={true} 
                       />
                    ) : (
                      <BlockRenderer block={block} />
                    )}
                  </SortableBlockItem>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>

        {/* Profesyonel Footer — Özelleştirilebilir */}
        {settings?.showFooter !== false && (
          <div className="mt-auto pt-4 border-t-2 border-zinc-900 flex justify-between items-center text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white px-1.5 py-0.5 rounded font-black">AI</span>
              <span>{settings?.footerText || 'Bursa Disleksi AI • Nöro-Mimari Motoru v7.0'}</span>
            </div>
            <span>
              SAYFA {pageIdx + 1} / {pages.length}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="w-full flex flex-col items-center gap-10 no-scrollbar scroll-smooth"
      id="print-container"
      onClick={() => {
        if (isEditorOpen) setSelectedBlockId(null);
      }}
    >
      {pages.map((p, i) => (
        <LazyPage key={i} pageIdx={i} totalPages={pages.length}>
          {renderPage(p, i)}
        </LazyPage>
      ))}
    </div>
  );
};

/** SortableBlockItem: Editor modunda sürüklenebilir blok, normal modda statik */
const SortableBlockItem: React.FC<{
  block: any;
  idx: number;
  isEditorOpen: boolean;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  children?: React.ReactNode;
}> = ({ block, idx, isEditorOpen, selectedBlockId, setSelectedBlockId, children }) => {
  const sortableId = block.id || `block-${idx}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    disabled: !isEditorOpen,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        if (isEditorOpen && block.id) {
          e.stopPropagation();
          setSelectedBlockId(block.id);
        }
      }}
      className={`block-container transition-all duration-200 ${
        isEditorOpen
          ? 'cursor-pointer hover:ring-2 hover:ring-indigo-300 hover:shadow-md relative group/block'
          : ''
      } ${
        isEditorOpen && selectedBlockId === block.id
          ? 'ring-2 ring-indigo-500 shadow-lg bg-indigo-50/10'
          : ''
      }`}
    >
      {isEditorOpen && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/block:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white shadow rounded p-1 z-10 no-print"
          title="Sürükle"
        >
          <i className="fa-solid fa-grip-vertical text-xs text-zinc-400"></i>
        </button>
      )}
      {children || <BlockRenderer block={block} />}
    </div>
  );
};

/** Lazy Page: Viewport dışındaki sayfalar placeholder, girince fade-in animasyonu */
const LazyPage: React.FC<{ children: React.ReactNode; pageIdx: number; totalPages: number }> = ({
  children,
  pageIdx,
  totalPages,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const forceRenderFlag =
    typeof window !== 'undefined' &&
    (window as { __oogmatik_force_render_all_pages__?: boolean })
      .__oogmatik_force_render_all_pages__ === true;
  const [isVisible, setIsVisible] = React.useState(pageIdx < 2 || forceRenderFlag); // İlk 2 sayfa hemen render
  const [hasAnimated, setHasAnimated] = React.useState(pageIdx < 2 || forceRenderFlag);

  React.useEffect(() => {
    if (!forceRenderFlag) return;
    setIsVisible(true);
    setHasAnimated(true);
  }, [forceRenderFlag]);

  React.useEffect(() => {
    const handler = () => {
      setIsVisible(true);
      setHasAnimated(true);
    };
    if (typeof window === 'undefined') return undefined;
    window.addEventListener('oogmatik:render-all-pages', handler);
    return () => window.removeEventListener('oogmatik:render-all-pages', handler);
  }, []);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || isVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px', threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  React.useEffect(() => {
    if (isVisible && !hasAnimated) {
      requestAnimationFrame(() => setHasAnimated(true));
    }
  }, [isVisible, hasAnimated]);

  if (!isVisible) {
    return (
      <div
        ref={ref}
        className="w-[210mm] min-h-[297mm] bg-slate-50 rounded border border-slate-200 flex items-center justify-center mb-8"
      >
        <div className="text-center opacity-40">
          <i className="fa-regular fa-file text-4xl text-slate-300 mb-2 block"></i>
          <span className="text-xs font-bold text-slate-400">
            Sayfa {pageIdx + 1} / {totalPages}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ease-out ${hasAnimated ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-[0.98]'}`}
    >
      {children}
    </div>
  );
};

interface SheetRendererProps {
  activityType: ActivityType | null;
  data: SingleWorksheetData;
  studentProfile?: StudentProfile | null;
  settings?: StyleSettings;
  hideWrapper?: boolean;
}

export const SheetRenderer = React.memo(
  ({ activityType, data, studentProfile, settings, hideWrapper = false }: SheetRendererProps) => {
    if (!data) return null;

    const isLandscape = settings?.orientation === 'landscape';
    const pageClass = `worksheet-page print-page shadow-2xl mb-8 ${isLandscape ? 'landscape' : ''}`;

    // Helper to conditionally wrap
    const withWrapper = (content: React.ReactNode) => {
      if (hideWrapper) return content;
      return <div className={pageClass}>{content}</div>;
    };

    // Özel modül renderları (Story Comprehension vb.)
    if (activityType === ActivityType.STORY_COMPREHENSION && data.layout) {
      return withWrapper(
        <ReadingStudioContentRenderer layout={data.layout} storyData={data.storyData} />
      );
    }

    // Sınav Stüdyosu çıktıları (Daha esnek kontrol)
    if (activityType === ActivityType.SINAV || activityType === ActivityType.MAT_SINAV) {
      const sinav = data as any;
      if (sinav && (sinav.sorular || sinav.baslik)) {
        return withWrapper(
          <ExamRenderer 
            examType={activityType === ActivityType.MAT_SINAV ? "matematik" : "turkce"} 
            data={sinav} 
          />
        );
      }
    }

    if (activityType === ActivityType.VISUAL_INTERPRETATION) {
      return withWrapper(
        <VisualInterpretationSheet data={data as any} settings={settings || ({} as any)} />
      );
    }

    if (activityType === ActivityType.BRAIN_TEASERS) {
      return withWrapper(
        <BrainTeasersSheet data={data as any} settings={settings || ({} as any)} />
      );
    }

    if (activityType === ActivityType.KAVRAM_HARITASI) {
      return withWrapper(<KavramHaritasiSheet data={data as any} />);
    }

    if (activityType === ActivityType.ES_ANLAMLI_KELIMELER) {
      return withWrapper(<EsAnlamliKelimelerSheet data={data as any} />);
    }


    if (activityType && activityType.toString().startsWith('INFOGRAPHIC_')) {
      return withWrapper(<InfoGraphicRenderer data={data} settings={settings} />);
    }

    if (activityType === ActivityType.MATH_STUDIO) {
      return withWrapper(<MathPuzzleSheet data={data as any} settings={settings} />);
    }


    if (activityType === ActivityType.OCR_CONTENT) {
      return withWrapper(
        <OcrRenderer
          data={
            data as unknown as {
              content?: string;
              grafikVeri?: Record<string, unknown>;
              title?: string;
              pedagogicalNote?: string;
              targetSkills?: string[];
              columns?: number;
              estimatedFontSize?: number;
            }
          }
        />
      );
    }

    // Mimari veya Blok yapısı varsa UnifiedRenderer kullan (Klon modülü buradan geçer)

    if (!hideWrapper && (data.layoutArchitecture || (Array.isArray(data.blocks) && data.blocks.some((b: any) => b.type)) || data.puzzles || data.items || data.problems || data.steps || data.operations)) {

      return (
        <UnifiedContentRenderer 
          data={data} 
          activityType={activityType}
          studentProfile={studentProfile} 
          settings={settings} 
        />
      );
    }

    let renderedSheet = null;
    // Geleneksel modül renderları
    switch (activityType) {
      case ActivityType.ALGORITHM_GENERATOR:
        renderedSheet = (
          <AlgorithmSheet data={data as unknown as AlgorithmData} settings={settings} />
        );
        break;
      case ActivityType.MATH_STUDIO:
      case ActivityType.MATH_PUZZLE:
        renderedSheet = (
          <MathPuzzleSheet data={data as unknown as MathPuzzleData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_PATTERN:
        renderedSheet = (
          <NumberPatternSheet data={data as unknown as NumberPatternData} settings={settings} />
        );
        break;
      case ActivityType.REAL_LIFE_MATH_PROBLEMS:
        renderedSheet = (
          <RealLifeMathProblemsSheet
            data={data as unknown as RealLifeProblemData}
            settings={settings}
          />
        );
        break;
      case ActivityType.LOGIC_GRID_PUZZLE:
        renderedSheet = (
          <LogicGridPuzzleSheet data={data as unknown as LogicGridPuzzleData} settings={settings} />
        );
        break;
      case ActivityType.FUTOSHIKI:
        renderedSheet = (
          <FutoshikiSheet data={data as unknown as FutoshikiData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_PYRAMID:
        renderedSheet = (
          <NumberPyramidSheet data={data as unknown as NumberPyramidData} settings={settings} />
        );
        break;
      case ActivityType.ODD_ONE_OUT:
        renderedSheet = (
          <OddOneOutSheet data={data as unknown as OddOneOutData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_LOGIC_RIDDLES:
        renderedSheet = (
          <NumberLogicRiddleSheet
            data={data as unknown as NumberLogicRiddleData}
            settings={settings}
          />
        );
        break;
      case ActivityType.NUMBER_PATH_LOGIC:
        renderedSheet = (
          <NumberPathLogicSheet data={data as unknown as NumberPathLogicData} settings={settings} />
        );
        break;
      case ActivityType.VISUAL_ARITHMETIC:
        renderedSheet = (
          <VisualArithmeticSheet
            data={data as unknown as VisualArithmeticData}
            settings={settings}
          />
        );
        break;
      case ActivityType.CLOCK_READING:
        renderedSheet = (
          <ClockReadingSheet data={data as unknown as ClockReadingData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_SENSE:
        renderedSheet = (
          <NumberSenseSheet data={data as unknown as NumberSenseData} settings={settings} />
        );
        break;
      case ActivityType.MONEY_COUNTING:
        renderedSheet = (
          <MoneyCountingSheet data={data as unknown as MoneyCountingData} settings={settings} />
        );
        break;
      case ActivityType.MATH_MEMORY_CARDS:
        renderedSheet = (
          <MathMemoryCardsSheet data={data as unknown as MathMemoryCardsData} settings={settings} />
        );
        break;
      case ActivityType.SPATIAL_GRID:
        renderedSheet = (
          <SpatialGridSheet data={data as unknown as SpatialGridData} settings={settings} />
        );
        break;
      case ActivityType.CONCEPT_MATCH:
        renderedSheet = (
          <ConceptMatchSheet data={data as unknown as ConceptMatchData} settings={settings} />
        );
        break;
      case ActivityType.ESTIMATION:
        renderedSheet = (
          <EstimationSheet data={data as unknown as EstimationData} settings={settings} />
        );
        break;
      case ActivityType.ABC_CONNECT:
        renderedSheet = (
          <AbcConnectSheet data={data as unknown as AbcConnectData} settings={settings} />
        );
        break;
      case ActivityType.ODD_EVEN_SUDOKU:
        renderedSheet = (
          <OddEvenSudokuSheet data={data as unknown as OddEvenSudokuData} settings={settings} />
        );
        break;
      case ActivityType.MAGIC_PYRAMID:
        renderedSheet = (
          <MagicPyramidSheet data={data as unknown as MagicPyramidData} settings={settings} />
        );
        break;
      case ActivityType.CAPSULE_GAME:
        renderedSheet = (
          <CapsuleGameSheet data={data as unknown as NumberCapsuleData} settings={settings} />
        );
        break;
      case ActivityType.WORD_MEMORY:
        renderedSheet = (
          <WordMemorySheet data={data as unknown as WordMemoryData} settings={settings} />
        );
        break;
      case ActivityType.VISUAL_MEMORY:
        renderedSheet = (
          <VisualMemorySheet data={data as unknown as VisualMemoryData} settings={settings} />
        );
        break;
      case ActivityType.CHARACTER_MEMORY:
        renderedSheet = (
          <CharacterMemorySheet data={data as unknown as CharacterMemoryData} settings={settings} />
        );
        break;
      case ActivityType.COLOR_WHEEL_MEMORY:
        renderedSheet = (
          <ColorWheelSheet data={data as unknown as ColorWheelMemoryData} settings={settings} />
        );
        break;
      case ActivityType.IMAGE_COMPREHENSION:
        renderedSheet = (
          <ImageComprehensionSheet
            data={data as unknown as ImageComprehensionData}
            settings={settings}
          />
        );
        break;
      case ActivityType.STROOP_TEST:
        renderedSheet = (
          <StroopTestSheet data={data as unknown as StroopTestData} settings={settings} />
        );
        break;
      case ActivityType.BURDON_TEST:
        renderedSheet = <BurdonTestSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.LETTER_GRID_TEST:
        renderedSheet = (
          <LetterGridTestSheet data={data as unknown as LetterGridTestData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_SEARCH:
        renderedSheet = (
          <NumberSearchSheet data={data as unknown as NumberSearchData} settings={settings} />
        );
        break;
      case ActivityType.CHAOTIC_NUMBER_SEARCH:
        renderedSheet = (
          <ChaoticNumberSearchSheet
            data={data as unknown as ChaoticNumberSearchData}
            settings={settings}
          />
        );
        break;
      case ActivityType.ATTENTION_DEVELOPMENT:
        renderedSheet = (
          <AttentionDevelopmentSheet
            data={data as unknown as AttentionDevelopmentData}
            settings={settings}
          />
        );
        break;
      case ActivityType.ATTENTION_FOCUS:
        renderedSheet = (
          <AttentionFocusSheet data={data as unknown as AttentionFocusData} settings={settings} />
        );
        break;
      case ActivityType.FIND_DUPLICATE:
        renderedSheet = (
          <FindDuplicateSheet data={data as unknown as FindDuplicateData} settings={settings} />
        );
        break;
      case ActivityType.FIND_LETTER_PAIR:
        renderedSheet = (
          <FindLetterPairSheet data={data as unknown as FindLetterPairData} settings={settings} />
        );
        break;
      case ActivityType.TARGET_SEARCH:
        renderedSheet = (
          <TargetSearchSheet data={data as unknown as TargetSearchData} settings={settings} />
        );
        break;
      case ActivityType.SYLLABLE_MASTER_LAB:
        renderedSheet = (
          <SyllableMasterLabSheet
            data={data as unknown as SyllableMasterLabData}
            settings={settings}
          />
        );
        break;
      case ActivityType.READING_SUDOKU:
        renderedSheet = (
          <ReadingSudokuSheet data={data as unknown as ReadingSudokuData} settings={settings} />
        );
        break;
      case ActivityType.READING_STROOP:
        renderedSheet = (
          <ReadingStroopSheet data={data as unknown as ReadingStroopData} settings={settings} />
        );
        break;
      case ActivityType.SYNONYM_ANTONYM_MATCH:
        renderedSheet = (
          <SynonymAntonymMatchSheet
            data={data as unknown as SynonymAntonymMatchData}
            settings={settings}
          />
        );
        break;
      case ActivityType.SYLLABLE_WORD_BUILDER:
        renderedSheet = (
          <SyllableWordBuilderSheet
            data={data as unknown as SyllableWordBuilderData}
            settings={settings}
          />
        );
        break;
      case ActivityType.LETTER_VISUAL_MATCHING:
        renderedSheet = (
          <LetterVisualMatchingSheet
            data={data as unknown as LetterVisualMatchingData}
            settings={settings}
          />
        );
        break;
      case ActivityType.FAMILY_RELATIONS:
        renderedSheet = (
          <FamilyRelationsSheet data={data as unknown as FamilyRelationsData} settings={settings} />
        );
        break;
      case ActivityType.FAMILY_LOGIC_TEST:
        renderedSheet = (
          <FamilyLogicSheet data={data as unknown as FamilyLogicTestData} settings={settings} />
        );
        break;
      case ActivityType.MORPHOLOGY_MATRIX:
        renderedSheet = (
          <MorphologyMatrixSheet
            data={data as unknown as MorphologyMatrixData}
            settings={settings}
          />
        );
        break;
      case ActivityType.READING_PYRAMID:
        renderedSheet = (
          <ReadingPyramidSheet data={data as unknown as ReadingPyramidData} settings={settings} />
        );
        break;
      case ActivityType.READING_FLOW:
        renderedSheet = (
          <ReadingFlowSheet data={data as unknown as ReadingFlowData} settings={settings} />
        );
        break;
      case ActivityType.PHONOLOGICAL_AWARENESS:
        renderedSheet = (
          <PhonologicalAwarenessSheet
            data={data as unknown as PhonologicalAwarenessData}
            settings={settings}
          />
        );
        break;
      case ActivityType.RAPID_NAMING:
        renderedSheet = (
          <RapidNamingSheet data={data as unknown as RapidNamingData} settings={settings} />
        );
        break;
      case ActivityType.LETTER_DISCRIMINATION:
        renderedSheet = (
          <LetterDiscriminationSheet
            data={data as unknown as LetterDiscriminationData}
            settings={settings}
          />
        );
        break;
      case ActivityType.MIRROR_LETTERS:
        renderedSheet = (
          <MirrorLettersSheet data={data as unknown as MirrorLettersData} settings={settings} />
        );
        break;
      case ActivityType.SYLLABLE_TRAIN:
        renderedSheet = (
          <SyllableTrainSheet data={data as unknown as SyllableTrainData} settings={settings} />
        );
        break;
      case ActivityType.VISUAL_TRACKING_LINES:
        renderedSheet = (
          <VisualTrackingLinesSheet
            data={data as unknown as VisualTrackingLineData}
            settings={settings}
          />
        );
        break;
      case ActivityType.BACKWARD_SPELLING:
        renderedSheet = (
          <BackwardSpellingSheet
            data={data as unknown as BackwardSpellingData}
            settings={settings}
          />
        );
        break;
      case ActivityType.CODE_READING:
        renderedSheet = (
          <CodeReadingSheet data={data as unknown as CodeReadingData} settings={settings} />
        );
        break;
      case ActivityType.ATTENTION_TO_QUESTION:
        renderedSheet = (
          <AttentionToQuestionSheet
            data={data as unknown as AttentionToQuestionData}
            settings={settings}
          />
        );
        break;
      case ActivityType.HANDWRITING_PRACTICE:
        renderedSheet = (
          <HandwritingPracticeSheet
            data={data as unknown as HandwritingPracticeData}
            settings={settings}
          />
        );
        break;
      case ActivityType.MAP_INSTRUCTION:
        renderedSheet = (
          <MapDetectiveSheet data={data as unknown as MapInstructionData} settings={settings} />
        );
        break;
      case ActivityType.FIVE_W_ONE_H:
        renderedSheet = <FiveWOneHSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.COLORFUL_SYLLABLE_READING:
        renderedSheet = <ColorfulSyllableReadingSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.FAMILY_TREE_MATRIX:
        renderedSheet = <FamilyTreeMatrixSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.APARTMENT_LOGIC_PUZZLE:
        renderedSheet = <ApartmentLogicSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.FINANCIAL_MARKET_CALCULATOR:
        renderedSheet = <FinancialMarketSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.DIRECTIONAL_CODE_READING:
        renderedSheet = <DirectionalCodeReadingSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.LOGIC_ERROR_HUNTER:
        renderedSheet = <LogicErrorHunterSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.PATTERN_COMPLETION:
        renderedSheet = <PatternCompletionSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.FIND_THE_DIFFERENCE:
        renderedSheet = (
          <FindTheDifferenceSheet
            data={data as unknown as FindTheDifferenceData}
            settings={settings}
          />
        );
        break;
      case ActivityType.VISUAL_ODD_ONE_OUT:
        renderedSheet = (
          <VisualOddOneOutSheet data={data as unknown as VisualOddOneOutData} settings={settings} />
        );
        break;
      case ActivityType.GRID_DRAWING:
        renderedSheet = (
          <GridDrawingSheet data={data as unknown as GridDrawingData} settings={settings} />
        );
        break;
      case ActivityType.SYMMETRY_DRAWING:
        renderedSheet = (
          <SymmetryDrawingSheet data={data as unknown as SymmetryDrawingData} settings={settings} />
        );
        break;
      case ActivityType.SHAPE_COUNTING:
        renderedSheet = (
          <ShapeCountingSheet data={data as unknown as ShapeCountingData} settings={settings} />
        );
        break;
      case ActivityType.DIRECTIONAL_TRACKING:
        renderedSheet = (
          <DirectionalTrackingSheet
            data={data as unknown as DirectionalTrackingData}
            settings={settings}
          />
        );
        break;
      case ActivityType.HIDDEN_PASSWORD_GRID:
        renderedSheet = (
          <HiddenPasswordGridSheet
            data={data as unknown as HiddenPasswordGridData}
            settings={settings}
          />
        );
        break;
      case ActivityType.WORD_SEARCH:
        renderedSheet = (
          <WordSearchSheet data={data as unknown as WordSearchData} settings={settings} />
        );
        break;
      case ActivityType.INFOGRAPHIC_STUDIO:
        // Delegate to modular renderer to support orientation-aware layout
        return withWrapper(<InfoGraphicRenderer data={data} settings={settings} />);
      case ActivityType.ANAGRAM:
        renderedSheet = <AnagramSheet data={data as unknown as AnagramsData} settings={settings} />;
        break;
      case ActivityType.CROSSWORD:
        renderedSheet = (
          <CrosswordSheet data={data as unknown as CrosswordData} settings={settings} />
        );
        break;
      case ActivityType.BOX_MATH:
        renderedSheet = <BoxMathSheet data={data as any} settings={settings} />;
        break;
      case ActivityType.VISUAL_INTERPRETATION:
        renderedSheet = <VisualInterpretationSheet data={data as any} settings={settings} />;
        break;
      case activityType as any:
        renderedSheet = (
          <UnifiedContentRenderer 
            data={data} 
            activityType={activityType}
            studentProfile={studentProfile} 
            settings={settings} 
          />
        );
        break;
      default:
        renderedSheet = (
          <UnifiedContentRenderer 
            data={data} 
            activityType={activityType}
            studentProfile={studentProfile} 
            settings={settings} 
          />
        );
    }

    return withWrapper(renderedSheet);
  }
);
