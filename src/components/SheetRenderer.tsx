// @ts-nocheck
import React, { useState, useCallback, useMemo, lazy } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { A4PrintableWrapper } from '../A4Printable/A4PrintableWrapper';

const HarfBaglamaSheet = lazy(() => import('../modules/activities/harf-baglama/ui/WorksheetUI').then(m => ({ default: m.HarfBaglamaSheet })));
const LetterConnectSheet = lazy(() => import('../modules/activities/letter-connect/ui/WorksheetUI').then(m => ({ default: m.LetterConnectSheet })));

// AUTONOM_LAZY_IMPORTS_START
// AUTONOM_LAZY_IMPORTS_END


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
  Sentence5W1HData,
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
import { StoryAnalysisSheet } from './sheets/verbal/StoryAnalysisSheet';
import { StorySequencingSheet } from './sheets/verbal/StorySequencingSheet';
import { AdvancedMissingPartsSheet } from './sheets/verbal/AdvancedMissingPartsSheet';
import { ShortAnswerSheet } from './sheets/verbal/ShortAnswerSheet';
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
import { SentenceFiveWOneHSheet } from './sheets/verbal/SentenceFiveWOneHSheet';
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
import { QueueOrderingSheet } from './sheet-renderers/QueueOrderingSheet';
import { ExamRenderer } from './sheet-renderers/ExamRenderer';
import { MathStudioRenderer } from './sheet-renderers/MathStudioRenderer';
import { SuperStudioRenderer } from './sheet-renderers/SuperStudioRenderer';
import { KelimeCumleRenderer } from './sheet-renderers/KelimeCumleRenderer';
import { SariKitapRenderer } from './sheet-renderers/SariKitapRenderer';
import { InfographicRenderer } from './sheet-renderers/InfographicRenderer';
import { PedagogicalHeader, ImageDisplay } from './sheets/common';

import { EditableText } from './Editable';
import { recursiveSafeText } from '../utils/textUtils';
import { BlockRenderer } from './SheetRenderer/BlockRenderer';

import { useA4EditorStore } from '../store/useA4EditorStore';



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

  if (!data) return null;

  // Robust unwrapping
  const unwrappedData = Array.isArray(data) ? data[0] : data;
  const activeData = (unwrappedData as unknown as any)?.data || unwrappedData;

  if (!activeData || typeof activeData !== 'object' || Array.isArray(activeData)) return null;

  const architecture = activeData?.layoutArchitecture;
  const rawBlocks: WorksheetBlock[] =
    (architecture?.blocks && architecture.blocks.length > 0 ? architecture.blocks : []) ||
    (activeData?.blocks && activeData.blocks.length > 0 ? activeData.blocks : []) ||
    (activeData?.puzzles && activeData.puzzles.length > 0 ? activeData.puzzles : []) ||
    (activeData?.operations && activeData.operations.length > 0 ? activeData.operations : []) ||
    (activeData?.items && activeData.items.length > 0 ? activeData.items : []) ||
    (activeData?.problems && activeData.problems.length > 0 ? activeData.problems : []) ||
    (activeData?.steps && activeData.steps.length > 0 ? activeData.steps : []) ||
    [];
  const cols = (architecture?.cols && architecture.cols > 1) ? architecture.cols : (settings?.columns || 1);


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
  // BOLT OPTIMIZATION: Memoize pagination logic to avoid expensive recalculations on every render
  const pages = useMemo(() => {
    const isLandscape = settings?.orientation === 'landscape';
    const scaleFactor = settings?.contentScale || 1;

    // Milimetrik Standart (Dikey: 297mm -> 1188 birim, Yatay: 210mm -> 840 birim)
    // Ölçek çarpanı: İçerik büyüdükçe kapasiteyi daraltıyoruz.
    const PAGE_MAX_WEIGHT = (isLandscape ? 840 : 1188) / scaleFactor;

    const STUDENT_INFO_RESERVE = settings?.showStudentInfo ? 120 : 0;
    const HEADER_RESERVE = 150; // Başlık ve yönerge approx
    const FOOTER_RESERVE = 60; // Sayfa altı güvenli alan

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
    const textureClass = settings?.paperTexture && settings.paperTexture !== 'none'
      ? `paper-texture-${settings.paperTexture}`
      : '';
    const pageClass = `worksheet-page ultra-print-page print-page group mb-8 shadow-2xl relative bg-white flex flex-col ${isLandscape ? 'landscape landscape-print' : ''} ${textureClass}`;

    return (
      <div
        key={pageIdx}
        data-page-idx={pageIdx}
        className={pageClass}
        style={{
          backgroundColor: 'white',
          color: 'black',
          colorScheme: 'light' as unknown as any,
          boxSizing: 'border-box',
          padding: settings?.compact
            ? (isLandscape ? '5mm 8mm' : '5mm')
            : (settings?.margin ? `${settings.margin}mm` : '5mm'),
          width: isLandscape ? '297mm' : '210mm',
          minHeight: isLandscape ? '210mm' : '297mm',
          fontFamily: settings?.fontFamily || 'Lexend, sans-serif',
          fontSize: settings?.fontSize === 'büyük' ? '1.25rem' : settings?.fontSize === 'küçük' ? '0.875rem' : '1rem',
          lineHeight: settings?.lineSpacing === 'geniş' ? '2' : settings?.lineSpacing === 'dar' ? '1.25' : '1.6',
          '--worksheet-border-color': settings?.borderColor || '#000',
        } as unknown as React.CSSProperties}
      >
        {/* Ekranda Sayfa Numarası (Print'te gizli) */}
        <div className="page-indicator-screen no-print" style={{ zIndex: 100 }}>SAYFA {pageIdx + 1}</div>

        <div
          className="w-full flex-1 flex flex-col relative print:overflow-visible"
          style={{
            zoom: settings?.contentScale ?? 1,
            width: '100%',
            maxWidth: '100%'
          }}
        >
          {/* Sayfa Üstü Marj (Hassas unknown as Simetri Kontrolü) */}
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
            title={pageIdx === 0 ? (data?.title || '') : `${data?.title || ''} (Dvm.)`}
            instruction={pageIdx === 0 ? data?.instruction : 'Lütfen çalışmaya devam edin.'}
            note={pageIdx === 0 ? data?.pedagogicalNote : ''}
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
                    ? {
                      gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      gap: 'var(--worksheet-gutter, 20px)'
                    }
                    : { gap: 'var(--worksheet-gutter, 20px)' }
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
                <span>{settings?.footerText || 'Bursa Disleksi EduMind • Nöro-Mimari Motoru v7.0'}</span>
              </div>
              <span>
                SAYFA {pageIdx + 1} / {pages.length}
              </span>
            </div>
          )}
        </div>
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
      {pages.length === 0 ? (
        <div className="worksheet-page p-8 text-center text-gray-500">
          <p>İçerik bulunamadı. Lütfen farklı bir aktivite seçin.</p>
        </div>
      ) : (
        pages.filter(p => p && p.length > 0).map((p, i) => (
          <LazyPage key={i} pageIdx={i} totalPages={pages.filter(p => p && p.length > 0).length}>
            {renderPage(p, i)}
          </LazyPage>
        ))
      )}
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
      className={`block-container transition-all duration-200 ${isEditorOpen
        ? 'cursor-pointer hover:ring-2 hover:ring-indigo-300 hover:shadow-md relative group/block'
        : ''
        } ${isEditorOpen && selectedBlockId === block.id
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
    (window as { __bdmind_force_render_all_pages__?: boolean })
      .__bdmind_force_render_all_pages__ === true;
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
    window.addEventListener('bdmind:render-all-pages', handler);
    return () => window.removeEventListener('bdmind:render-all-pages', handler);
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

    // Robust unwrapping: Take first element if array, then check for .data envelope
    const unwrappedData = Array.isArray(data) ? data[0] : data;
    // Extract actual content if wrapped in a .data property 
    const activeData = (unwrappedData as unknown as any)?.data || unwrappedData;

    // Defensive guard: activeData must be a non-null object
    if (!activeData || typeof activeData !== 'object') return null;

    // SINAV/MAT_SINAV guard: data may arrive as [exam] wrapper
    const unwrapExam = (val: unknown): unknown => {
      if (!val) return val;
      if (Array.isArray(val)) {
        const first = (val as unknown[])[0];
        if (first && typeof first === 'object' && !Array.isArray(first) && ('sorular' in first || 'baslik' in first)) return first;
        return val;
      }
      return val;
    };

    const resolvedData = unwrapExam(activeData);

    const isLandscape = settings?.orientation === 'landscape';
    const pageClass = `worksheet-page print-page shadow-2xl mb-8 ${isLandscape ? 'landscape' : ''}`;

    // Helper to conditionally wrap
    const withWrapper = (content: React.ReactNode) => {
      if (hideWrapper) return content;
      return <div className={pageClass}>{content}</div>;
    };

    // Special module renders
    if (activityType === ActivityType.STORY_COMPREHENSION && resolvedData && typeof resolvedData === 'object' && !Array.isArray(resolvedData) && (resolvedData as Record<string, unknown>).layout) {
      return withWrapper(
        <ReadingStudioContentRenderer layout={(resolvedData as Record<string, unknown>).layout as never} storyData={(resolvedData as Record<string, unknown>).storyData as never} />
      );
    }

    if (activityType === ActivityType.PREMIUM_STUDIO && resolvedData && typeof resolvedData === 'object' && !Array.isArray(resolvedData) && (resolvedData as Record<string, unknown>).layout) {
      return withWrapper(
        <ReadingStudioContentRenderer layout={(resolvedData as Record<string, unknown>).layout as never} storyData={(resolvedData as Record<string, unknown>).storyData as never} />
      );
    }

    if (activityType === ActivityType.MATH_STUDIO && resolvedData) {
      return withWrapper(<MathStudioRenderer data={resolvedData as unknown as any} settings={settings} />);
    }

    if (activityType === ActivityType.SUPER_STUDIO && resolvedData) {
      return withWrapper(<SuperStudioRenderer data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.SARI_KITAP_STUDIO && resolvedData) {
      return withWrapper(<SariKitapRenderer data={resolvedData as unknown as any} />);
    }

    // Sınav Stüdyosu çıktıları (Daha esnek kontrol)
    if (activityType === ActivityType.SINAV || activityType === ActivityType.MAT_SINAV) {
      const sinav = resolvedData as unknown as any;
      if (sinav && (sinav.sorular || sinav.baslik)) {
        return withWrapper(
          <ExamRenderer
            examType={activityType === ActivityType.MAT_SINAV ? "matematik" : "turkce"}
            data={sinav}
            settings={settings}
          />
        );
      }
    }

    if (activityType === ActivityType.KELIME_CUMLE && resolvedData) {
      return withWrapper(<KelimeCumleRenderer data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.VISUAL_INTERPRETATION) {
      return withWrapper(
        <VisualInterpretationSheet data={resolvedData as unknown as any} settings={settings || ({} as unknown as any)} />
      );
    }

    if (activityType === ActivityType.BRAIN_TEASERS) {
      return withWrapper(
        <BrainTeasersSheet data={resolvedData as unknown as any} settings={settings || ({} as unknown as any)} />
      );
    }

    if (activityType === ActivityType.KAVRAM_HARITASI) {
      return withWrapper(<KavramHaritasiSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.ES_ANLAMLI_KELIMELER) {
      return withWrapper(<EsAnlamliKelimelerSheet data={resolvedData as unknown as any} />);
    }

    if (activityType === ActivityType.INFOGRAPHIC_SHORT_ANSWER) {
      return withWrapper(<ShortAnswerSheet data={(resolvedData as Record<string, unknown>).content || resolvedData} settings={settings as unknown as any} />);
    }

    if (activityType === ActivityType.INFOGRAPHIC_STUDIO && resolvedData) {
      return withWrapper(<InfographicRenderer data={resolvedData as unknown as any} settings={settings} />);
    }


    if (activityType === ActivityType.OCR_CONTENT) {
      return withWrapper(
        <OcrRenderer
          data={
            {
              content: (data as Record<string, unknown>)?.content as string | undefined,
              grafikVeri: (data as Record<string, unknown>)?.grafikVeri as Record<string, unknown> | undefined,
              title: (data as Record<string, unknown>)?.title as string | undefined,
              pedagogicalNote: (data as Record<string, unknown>)?.pedagogicalNote as string | undefined,
              targetSkills: (data as Record<string, unknown>)?.targetSkills as string[] | undefined,
              columns: (data as Record<string, unknown>)?.columns as number | undefined,
              estimatedFontSize: (data as Record<string, unknown>)?.estimatedFontSize as number | undefined,
            } as {
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

    // Global data check — Sadece data'nın geçerli bir obje olduğunu kontrol et.
    const isDataEmpty = !data || typeof data !== 'object' || Object.keys(data).length === 0;

    if (isDataEmpty) {
      return withWrapper(
        <div className="p-10 text-center text-gray-500 bg-white rounded-3xl shadow-sm min-h-[600px] flex flex-col items-center justify-center font-['Lexend']">
          <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <i className="fa-solid fa-wand-magic-sparkles text-4xl text-indigo-300"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">İçerik Bulunamadı</h3>
          <p className="max-w-xs text-sm text-gray-400 leading-relaxed italic">
            Yapay zeka içeriği hazırlarken bir sorun oluşmuş olabilir veya henüz içerik üretilmedi.
          </p>
          <div className="mt-8 px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
            Farklı Bir Seçenek Deneyin
          </div>
        </div>
      );
    }

    // Mimari veya Blok yapısı varsa UnifiedRenderer kullan (Klon modülü buradan geçer)
    const isModernLayout = data?.layoutArchitecture || (Array.isArray(data?.blocks) && data.blocks.some((b: any) => b?.type));

    if (!hideWrapper && isModernLayout) {
      return (
        <UnifiedContentRenderer
          data={data}
          activityType={activityType}
          studentProfile={studentProfile}
          settings={settings}
        />
      );
    }

    // Data'nın geçerli bir obje olduğundan emin ol
    if (!data || typeof data !== 'object') return null;

    let renderedSheet = null;
    // Geleneksel modül renderları
    switch (activityType) {
      case ActivityType.ALGORITHM_GENERATOR:
        renderedSheet = (
          <AlgorithmSheet data={data as unknown as unknown as unknown as unknown as AlgorithmData} settings={settings} />
        );
        break;
      case ActivityType.MATH_STUDIO:
      case ActivityType.MATH_PUZZLE:
        renderedSheet = (
          <MathPuzzleSheet data={data as unknown as unknown as unknown as unknown as MathPuzzleData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_PATTERN:
        renderedSheet = (
          <NumberPatternSheet data={data as unknown as unknown as unknown as unknown as NumberPatternData} settings={settings} />
        );
        break;
      case ActivityType.REAL_LIFE_MATH_PROBLEMS:
        renderedSheet = (
          <RealLifeMathProblemsSheet
            data={data as unknown as unknown as unknown as unknown as RealLifeProblemData}
            settings={settings}
          />
        );
        break;
      case ActivityType.LOGIC_GRID_PUZZLE:
        renderedSheet = (
          <LogicGridPuzzleSheet data={data as unknown as unknown as unknown as unknown as LogicGridPuzzleData} settings={settings} />
        );
        break;
      case ActivityType.FUTOSHIKI:
        renderedSheet = (
          <FutoshikiSheet data={data as unknown as unknown as unknown as unknown as FutoshikiData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_PYRAMID:
        renderedSheet = (
          <NumberPyramidSheet data={data as unknown as unknown as unknown as unknown as NumberPyramidData} settings={settings} />
        );
        break;
      case ActivityType.ODD_ONE_OUT:
        renderedSheet = (
          <OddOneOutSheet data={data as unknown as unknown as unknown as unknown as OddOneOutData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_LOGIC_RIDDLES:
        renderedSheet = (
          <NumberLogicRiddleSheet
            data={data as unknown as unknown as unknown as unknown as NumberLogicRiddleData}
            settings={settings}
          />
        );
        break;
      case ActivityType.NUMBER_PATH_LOGIC:
        renderedSheet = (
          <NumberPathLogicSheet data={data as unknown as unknown as unknown as unknown as NumberPathLogicData} settings={settings} />
        );
        break;
      case ActivityType.VISUAL_ARITHMETIC:
        renderedSheet = (
          <VisualArithmeticSheet
            data={data as unknown as unknown as unknown as unknown as VisualArithmeticData}
            settings={settings}
          />
        );
        break;
      case ActivityType.CLOCK_READING:
        renderedSheet = (
          <ClockReadingSheet data={data as unknown as unknown as unknown as unknown as ClockReadingData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_SENSE:
        renderedSheet = (
          <NumberSenseSheet data={data as unknown as unknown as unknown as unknown as NumberSenseData} settings={settings} />
        );
        break;
      case ActivityType.MONEY_COUNTING:
        renderedSheet = (
          <MoneyCountingSheet data={data as unknown as unknown as unknown as unknown as MoneyCountingData} settings={settings} />
        );
        break;
      case ActivityType.MATH_MEMORY_CARDS:
        renderedSheet = (
          <MathMemoryCardsSheet data={data as unknown as unknown as unknown as unknown as MathMemoryCardsData} settings={settings} />
        );
        break;
      case ActivityType.SPATIAL_GRID:
        renderedSheet = (
          <SpatialGridSheet data={data as unknown as unknown as unknown as unknown as SpatialGridData} settings={settings} />
        );
        break;
      case ActivityType.CONCEPT_MATCH:
        renderedSheet = (
          <ConceptMatchSheet data={data as unknown as unknown as unknown as unknown as ConceptMatchData} settings={settings} />
        );
        break;
      case ActivityType.ESTIMATION:
        renderedSheet = (
          <EstimationSheet data={data as unknown as unknown as unknown as unknown as EstimationData} settings={settings} />
        );
        break;
      case ActivityType.ABC_CONNECT:
        renderedSheet = (
          <AbcConnectSheet data={data as unknown as unknown as unknown as unknown as AbcConnectData} settings={settings} />
        );
        break;
      case ActivityType.ODD_EVEN_SUDOKU:
        renderedSheet = (
          <OddEvenSudokuSheet data={data as unknown as unknown as unknown as unknown as OddEvenSudokuData} settings={settings} />
        );
        break;
      case ActivityType.MAGIC_PYRAMID:
        renderedSheet = (
          <MagicPyramidSheet data={data as unknown as unknown as unknown as unknown as MagicPyramidData} settings={settings} />
        );
        break;
      case ActivityType.CAPSULE_GAME:
        renderedSheet = (
          <CapsuleGameSheet data={data as unknown as unknown as unknown as unknown as NumberCapsuleData} settings={settings} />
        );
        break;
      case ActivityType.WORD_MEMORY:
        renderedSheet = (
          <WordMemorySheet data={data as unknown as unknown as unknown as unknown as WordMemoryData} settings={settings} />
        );
        break;
      case ActivityType.VISUAL_MEMORY:
        renderedSheet = (
          <VisualMemorySheet data={data as unknown as unknown as unknown as unknown as VisualMemoryData} settings={settings} />
        );
        break;
      case ActivityType.CHARACTER_MEMORY:
        renderedSheet = (
          <CharacterMemorySheet data={data as unknown as unknown as unknown as unknown as CharacterMemoryData} settings={settings} />
        );
        break;
      case ActivityType.COLOR_WHEEL_MEMORY:
        renderedSheet = (
          <ColorWheelSheet data={data as unknown as unknown as unknown as unknown as ColorWheelMemoryData} settings={settings} />
        );
        break;
      case ActivityType.IMAGE_COMPREHENSION:
        renderedSheet = (
          <ImageComprehensionSheet
            data={data as unknown as unknown as unknown as unknown as ImageComprehensionData}
            settings={settings}
          />
        );
        break;
      case ActivityType.STROOP_TEST:
        renderedSheet = (
          <StroopTestSheet data={data as unknown as unknown as unknown as unknown as StroopTestData} settings={settings} />
        );
        break;
      case ActivityType.BURDON_TEST:
        renderedSheet = <BurdonTestSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.LETTER_GRID_TEST:
        renderedSheet = (
          <LetterGridTestSheet data={data as unknown as unknown as unknown as unknown as LetterGridTestData} settings={settings} />
        );
        break;
      case ActivityType.NUMBER_SEARCH:
        renderedSheet = (
          <NumberSearchSheet data={data as unknown as unknown as unknown as unknown as NumberSearchData} settings={settings} />
        );
        break;
      case ActivityType.CHAOTIC_NUMBER_SEARCH:
        renderedSheet = (
          <ChaoticNumberSearchSheet
            data={data as unknown as unknown as unknown as unknown as ChaoticNumberSearchData}
            settings={settings}
          />
        );
        break;
      case ActivityType.ATTENTION_DEVELOPMENT:
        renderedSheet = (
          <AttentionDevelopmentSheet
            data={data as unknown as unknown as unknown as unknown as AttentionDevelopmentData}
            settings={settings}
          />
        );
        break;
      case ActivityType.ATTENTION_FOCUS:
        renderedSheet = (
          <AttentionFocusSheet data={data as unknown as unknown as unknown as unknown as AttentionFocusData} settings={settings} />
        );
        break;
      case ActivityType.FIND_DUPLICATE:
        renderedSheet = (
          <FindDuplicateSheet data={data as unknown as unknown as unknown as unknown as FindDuplicateData} settings={settings} />
        );
        break;
      case ActivityType.FIND_LETTER_PAIR:
        renderedSheet = (
          <FindLetterPairSheet data={data as unknown as unknown as unknown as unknown as FindLetterPairData} settings={settings} />
        );
        break;
      case ActivityType.TARGET_SEARCH:
        renderedSheet = (
          <TargetSearchSheet data={data as unknown as unknown as unknown as unknown as TargetSearchData} settings={settings} />
        );
        break;
      case ActivityType.SYLLABLE_MASTER_LAB:
        renderedSheet = (
          <SyllableMasterLabSheet
            data={data as unknown as unknown as unknown as unknown as SyllableMasterLabData}
            settings={settings}
          />
        );
        break;
      case ActivityType.READING_SUDOKU:
        renderedSheet = (
          <ReadingSudokuSheet data={data as unknown as unknown as unknown as unknown as ReadingSudokuData} settings={settings} />
        );
        break;
      case ActivityType.READING_STROOP:
        renderedSheet = (
          <ReadingStroopSheet data={data as unknown as unknown as unknown as unknown as ReadingStroopData} settings={settings} />
        );
        break;
      case ActivityType.SYNONYM_ANTONYM_MATCH:
        renderedSheet = (
          <SynonymAntonymMatchSheet
            data={data as unknown as unknown as unknown as unknown as SynonymAntonymMatchData}
            settings={settings}
          />
        );
        break;
      case ActivityType.SYLLABLE_WORD_BUILDER:
        renderedSheet = (
          <SyllableWordBuilderSheet
            data={data as unknown as unknown as unknown as unknown as SyllableWordBuilderData}
            settings={settings}
          />
        );
        break;
      case ActivityType.LETTER_VISUAL_MATCHING:
        renderedSheet = (
          <LetterVisualMatchingSheet
            data={data as unknown as unknown as unknown as unknown as LetterVisualMatchingData}
            settings={settings}
          />
        );
        break;
      case ActivityType.FAMILY_RELATIONS:
        renderedSheet = (
          <FamilyRelationsSheet data={data as unknown as unknown as unknown as unknown as FamilyRelationsData} settings={settings} />
        );
        break;
      case ActivityType.FAMILY_LOGIC_TEST:
        renderedSheet = (
          <FamilyLogicSheet data={data as unknown as unknown as unknown as unknown as FamilyLogicTestData} settings={settings} />
        );
        break;
      case ActivityType.MORPHOLOGY_MATRIX:
        renderedSheet = (
          <MorphologyMatrixSheet
            data={data as unknown as unknown as unknown as unknown as MorphologyMatrixData}
            settings={settings}
          />
        );
        break;
      case ActivityType.READING_PYRAMID:
        renderedSheet = (
          <ReadingPyramidSheet data={data as unknown as unknown as unknown as unknown as ReadingPyramidData} settings={settings} />
        );
        break;
      case ActivityType.READING_FLOW:
        renderedSheet = (
          <ReadingFlowSheet data={data as unknown as unknown as unknown as unknown as ReadingFlowData} settings={settings} />
        );
        break;
      case ActivityType.PHONOLOGICAL_AWARENESS:
        renderedSheet = (
          <PhonologicalAwarenessSheet
            data={data as unknown as unknown as unknown as unknown as PhonologicalAwarenessData}
            settings={settings}
          />
        );
        break;
      case ActivityType.RAPID_NAMING:
        renderedSheet = (
          <RapidNamingSheet data={data as unknown as unknown as unknown as unknown as RapidNamingData} settings={settings} />
        );
        break;
      case ActivityType.LETTER_DISCRIMINATION:
        renderedSheet = (
          <LetterDiscriminationSheet
            data={data as unknown as unknown as unknown as unknown as LetterDiscriminationData}
            settings={settings}
          />
        );
        break;
      case ActivityType.MIRROR_LETTERS:
        renderedSheet = (
          <MirrorLettersSheet data={data as unknown as unknown as unknown as unknown as MirrorLettersData} settings={settings} />
        );
        break;
      case ActivityType.SYLLABLE_TRAIN:
        renderedSheet = (
          <SyllableTrainSheet data={data as unknown as unknown as unknown as unknown as SyllableTrainData} settings={settings} />
        );
        break;
      case ActivityType.VISUAL_TRACKING_LINES:
        renderedSheet = (
          <VisualTrackingLinesSheet
            data={data as unknown as unknown as unknown as unknown as VisualTrackingLineData}
            settings={settings}
          />
        );
        break;
      case ActivityType.BACKWARD_SPELLING:
        renderedSheet = (
          <BackwardSpellingSheet
            data={data as unknown as unknown as unknown as unknown as BackwardSpellingData}
            settings={settings}
          />
        );
        break;
      case ActivityType.CODE_READING:
        renderedSheet = (
          <CodeReadingSheet data={data as unknown as unknown as unknown as unknown as CodeReadingData} settings={settings} />
        );
        break;
      case ActivityType.ATTENTION_TO_QUESTION:
        renderedSheet = (
          <AttentionToQuestionSheet
            data={data as unknown as unknown as unknown as unknown as AttentionToQuestionData}
            settings={settings}
          />
        );
        break;
      case ActivityType.HANDWRITING_PRACTICE:
        renderedSheet = (
          <HandwritingPracticeSheet
            data={data as unknown as unknown as unknown as unknown as HandwritingPracticeData}
            settings={settings}
          />
        );
        break;
      case ActivityType.MAP_INSTRUCTION:
        renderedSheet = (
          <MapDetectiveSheet data={data as unknown as unknown as unknown as unknown as MapInstructionData} settings={settings} />
        );
        break;
      case ActivityType.FIVE_W_ONE_H:
        renderedSheet = <FiveWOneHSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.SENTENCE_5W1H:
        renderedSheet = <SentenceFiveWOneHSheet data={data as unknown as any} />;
        break;
      case ActivityType.STORY_ANALYSIS:
        renderedSheet = <StoryAnalysisSheet data={data as unknown as unknown as unknown as unknown as StoryAnalysisData} />;
        break;
      case ActivityType.STORY_SEQUENCING:
        renderedSheet = <StorySequencingSheet data={data as unknown as unknown as unknown as unknown as StorySequencingData} />;
        break;
      case ActivityType.MISSING_PARTS:
        renderedSheet = <AdvancedMissingPartsSheet data={data as unknown as unknown as unknown as unknown as MissingPartsData} />;
        break;
      case ActivityType.INFOGRAPHIC_SHORT_ANSWER:
        renderedSheet = <ShortAnswerSheet data={data.content || data} settings={settings} />;
        break;
      case ActivityType.COLORFUL_SYLLABLE_READING:
        renderedSheet = <ColorfulSyllableReadingSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.FAMILY_TREE_MATRIX:
        renderedSheet = <FamilyTreeMatrixSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.APARTMENT_LOGIC_PUZZLE:
        renderedSheet = <ApartmentLogicSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.FINANCIAL_MARKET_CALCULATOR:
        renderedSheet = <FinancialMarketSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.DIRECTIONAL_CODE_READING:
        renderedSheet = <DirectionalCodeReadingSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.LOGIC_ERROR_HUNTER:
        renderedSheet = <LogicErrorHunterSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.PATTERN_COMPLETION:
        renderedSheet = <PatternCompletionSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.FIND_THE_DIFFERENCE:
        renderedSheet = (
          <FindTheDifferenceSheet
            data={data as unknown as unknown as unknown as unknown as FindTheDifferenceData}
            settings={settings}
          />
        );
        break;
      case ActivityType.VISUAL_ODD_ONE_OUT:
        renderedSheet = (
          <VisualOddOneOutSheet data={data as unknown as unknown as unknown as unknown as VisualOddOneOutData} settings={settings} />
        );
        break;
      case ActivityType.GRID_DRAWING:
        renderedSheet = (
          <GridDrawingSheet data={data as unknown as unknown as unknown as unknown as GridDrawingData} settings={settings} />
        );
        break;
      case ActivityType.SYMMETRY_DRAWING:
        renderedSheet = (
          <SymmetryDrawingSheet data={data as unknown as unknown as unknown as unknown as SymmetryDrawingData} settings={settings} />
        );
        break;
      case ActivityType.SHAPE_COUNTING:
        renderedSheet = (
          <ShapeCountingSheet data={data as unknown as unknown as unknown as unknown as ShapeCountingData} settings={settings} />
        );
        break;
      case ActivityType.DIRECTIONAL_TRACKING:
        renderedSheet = (
          <DirectionalTrackingSheet
            data={data as unknown as unknown as unknown as unknown as DirectionalTrackingData}
            settings={settings}
          />
        );
        break;
      case ActivityType.HIDDEN_PASSWORD_GRID:
        renderedSheet = (
          <HiddenPasswordGridSheet
            data={data as unknown as unknown as unknown as unknown as HiddenPasswordGridData}
            settings={settings}
          />
        );
        break;
      case ActivityType.WORD_SEARCH:
        renderedSheet = (
          <WordSearchSheet data={data as unknown as unknown as unknown as unknown as WordSearchData} settings={settings} />
        );
        break;
      case ActivityType.INFOGRAPHIC_STUDIO:
      // Delegate to modular renderer to support orientation-aware layout

      case ActivityType.ANAGRAM:
        renderedSheet = <AnagramSheet data={data as unknown as unknown as unknown as unknown as AnagramsData} settings={settings} />;
        break;
      case ActivityType.CROSSWORD:
        renderedSheet = (
          <CrosswordSheet data={data as unknown as unknown as unknown as unknown as CrosswordData} settings={settings} />
        );
        break;
      case ActivityType.BOX_MATH:
        renderedSheet = <BoxMathSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.QUEUE_ORDERING:
        renderedSheet = <QueueOrderingSheet data={data as unknown as any} settings={settings} />;
        break;
      case ActivityType.VISUAL_INTERPRETATION:
        renderedSheet = <VisualInterpretationSheet data={data as unknown as any} settings={settings} />;
        break;
      case activityType as unknown as any:
        renderedSheet = (
          <UnifiedContentRenderer
            data={data}
            activityType={activityType}
            studentProfile={studentProfile}
            settings={settings}
          />
        );
        break;
      case ActivityType.LETTER_CONNECT:
        return <LetterConnectSheet data={data} />;
      case ActivityType.HARF_BAGLAMA:
        return <HarfBaglamaSheet data={data} />;

      // AUTONOM_CASES_START
      // AUTONOM_CASES_END

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
