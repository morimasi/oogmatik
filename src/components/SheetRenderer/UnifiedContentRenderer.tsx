import React, { useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  Modifier,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  ActivityType,
  SingleWorksheetData,
  WorksheetBlock,
  StudentProfile,
  StyleSettings,
} from '../../types';
import { recursiveSafeText } from '../../utils/textUtils';
import { BlockRenderer } from './BlockRenderer';
import { PedagogicalHeader } from '../sheets/common';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { getPageBlocks, reorderBlocks } from '../../services/a4EditorService';
import { buildAnswerKeyPage } from '../../services/a4StudioService';
import { SortableBlockItem } from './SortableBlockItem';
import { A4EditorOverlays, resolveFontSizePx, StudentInfoStrip } from './A4PageShell';

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
      return content.height || 300;
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

const splitLargeBlock = (block: WorksheetBlock, maxWeight: number): WorksheetBlock[] => {
  const content: any = block.content;
  const weight = getBlockWeight(block);
  if (weight <= maxWeight) return [block];

  // 1. TEXT BLOKLARI (Paragraf ve Cümle bazlı)
  if (block.type === 'text') {
    const text = recursiveSafeText(content.text || content || '');
    const paragraphs = text.split(/\n+/);
    if (paragraphs.length > 1) {
      const pWeights = paragraphs.map((p) => Math.ceil(p.length / 75) * 28);
      let acc = 25;
      let splitIdx = 0;
      for (let i = 0; i < pWeights.length; i++) {
        if (acc + pWeights[i] > maxWeight && i > 0) {
          splitIdx = i;
          break;
        }
        acc += pWeights[i];
      }
      if (splitIdx > 0 && splitIdx < paragraphs.length) {
        return [
          { ...block, content: { ...content, text: paragraphs.slice(0, splitIdx).join('\n').trim() } },
          {
            ...block,
            content: {
              ...content,
              text: paragraphs.slice(splitIdx).join('\n').trim(),
              isContinuation: true,
            },
          },
        ];
      }
    }
    const sentences = text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [text];
    if (sentences.length >= 2) {
      const sWeights = sentences.map((s) => Math.ceil(s.length / 75) * 28);
      let acc = 25;
      let splitIdx = 0;
      for (let i = 0; i < sWeights.length; i++) {
        if (acc + sWeights[i] > maxWeight && i > 0) {
          splitIdx = i;
          break;
        }
        acc += sWeights[i];
      }
      if (splitIdx > 0 && splitIdx < sentences.length) {
        return [
          { ...block, content: { ...content, text: sentences.slice(0, splitIdx).join(' ').trim() } },
          {
            ...block,
            content: {
              ...content,
              text: sentences.slice(splitIdx).join(' ').trim(),
              isContinuation: true,
            },
          },
        ];
      }
    }
  }

  // 2. GRID BLOKLARI (Satır Bütünlüğü ile Hücre Bölme)
  if (block.type === 'grid') {
    const cells: any[] = content.cells || content.items || content.data || [];
    const cols = Math.max(1, content.cols || content.columns || 4);
    const rowHeight = 44;
    const headerHeight = 45;
    const maxRows = Math.max(1, Math.floor((maxWeight - headerHeight) / rowHeight));
    const cellsPerPart = maxRows * cols;
    if (cells.length > cellsPerPart && cellsPerPart >= cols) {
      return [
        {
          ...block,
          content: {
            ...content,
            cells: cells.slice(0, cellsPerPart),
          },
        },
        {
          ...block,
          content: {
            ...content,
            cells: cells.slice(cellsPerPart),
            isContinuation: true,
          },
        },
      ];
    }
  }

  // 3. TABLE BLOKLARI (Satır Bazlı Bölme, Başlık Tekrarı)
  if (block.type === 'table') {
    const rowKey = Array.isArray(content.rows) ? 'rows' : Array.isArray(content.data) ? 'data' : null;
    if (rowKey) {
      const rows: any[] = content[rowKey];
      const maxRows = Math.max(1, Math.floor((maxWeight - 55) / 36));
      if (rows.length > maxRows && maxRows >= 1) {
        return [
          {
            ...block,
            content: {
              ...content,
              [rowKey]: rows.slice(0, maxRows),
            },
          },
          {
            ...block,
            content: {
              ...content,
              [rowKey]: rows.slice(maxRows),
              isContinuation: true,
            },
          },
        ];
      }
    }
  }

  // 4. MATCH COLUMNS (Eşleştirme Çiftlerini Bölme)
  if (block.type === 'match_columns') {
    const left: any[] = content.leftColumn || content.left || [];
    const right: any[] = content.rightColumn || content.right || [];
    const chunkSize = Math.max(1, Math.floor((maxWeight - 50) / 45));
    if (left.length > chunkSize && chunkSize >= 1) {
      return [
        {
          ...block,
          content: {
            ...content,
            leftColumn: left.slice(0, chunkSize),
            left: left.slice(0, chunkSize),
            rightColumn: right.slice(0, chunkSize),
            right: right.slice(0, chunkSize),
          },
        },
        {
          ...block,
          content: {
            ...content,
            leftColumn: left.slice(chunkSize),
            left: left.slice(chunkSize),
            rightColumn: right.slice(chunkSize),
            right: right.slice(chunkSize),
            isContinuation: true,
          },
        },
      ];
    }
  }

  // 5. CLOZE TEST
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

  // 6. CATEGORICAL SORTING
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

  // 7. SORU / PEKİŞTİRME LİSTELERİ (questions, items, exercises)
  const listKey = Array.isArray(content.questions)
    ? 'questions'
    : Array.isArray(content.items)
      ? 'items'
      : Array.isArray(content.exercises)
        ? 'exercises'
        : null;

  if (listKey && Array.isArray(content[listKey]) && content[listKey].length > 1) {
    const items: any[] = content[listKey];
    const itemWeight = Math.max(50, Math.floor(weight / items.length));
    const maxItems = Math.max(1, Math.floor((maxWeight - 40) / itemWeight));
    if (items.length > maxItems && maxItems >= 1) {
      return [
        {
          ...block,
          content: {
            ...content,
            [listKey]: items.slice(0, maxItems),
          },
        },
        {
          ...block,
          content: {
            ...content,
            [listKey]: items.slice(maxItems),
            isContinuation: true,
          },
        },
      ];
    }
  }

  return [block];
};

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
  const [isVisible, setIsVisible] = React.useState(pageIdx < 2 || forceRenderFlag);
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

export const UnifiedContentRenderer = ({
  data,
  activityType,
  studentProfile,
  settings,
  renderNonStandardBlock,
  hideWrapper,
}: {
  data: SingleWorksheetData;
  activityType: ActivityType | null;
  studentProfile?: StudentProfile | null;
  settings?: StyleSettings;
  renderNonStandardBlock?: (block: any) => React.ReactNode;
  hideWrapper?: boolean;
}) => {
  const {
    isEditorOpen,
    selectedBlockId,
    setSelectedBlockId,
    snapToGrid,
    gridSize,
    showGrid,
    showRulers,
    showSafeArea,
    isPrintPreview,
    applyMutation,
    answerKeyMode,
    printLayout,
    cutLines,
    setDiagnostics,
  } = useA4EditorStore();

  const rootRef = React.useRef<HTMLDivElement>(null);

  // Baskı yardımcıları (N-up, kesme çizgileri) gövde sınıflarıyla CSS'e bağlanır.
  React.useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const body = document.body;
    body.classList.toggle('a4-nup-2', printLayout === 'nup2');
    body.classList.toggle('a4-cut-lines', cutLines);
    return () => {
      body.classList.remove('a4-nup-2');
      body.classList.remove('a4-cut-lines');
    };
  }, [printLayout, cutLines]);

  const editorChrome = isEditorOpen && !isPrintPreview;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const unwrappedData = Array.isArray(data) ? data[0] : data;
  if (!unwrappedData) return null;

  const activeData = (unwrappedData as any)?.data || unwrappedData;
  if (!activeData || typeof activeData !== 'object' || Array.isArray(activeData)) return null;

  const isValidData = true;

  const architecture = activeData?.layoutArchitecture;
  const rawBlocksRaw = activeData?.blocks ||
       activeData?.puzzles ||
       activeData?.operations ||
       activeData?.items ||
       activeData?.problems ||
       activeData?.steps;
  const rawBlocks: WorksheetBlock[] = Array.isArray(rawBlocksRaw) ? rawBlocksRaw : [];
  const cols = (architecture?.cols && architecture.cols > 1) ? architecture.cols : (settings?.columns || 1);

  const snapModifier: Modifier = ({ transform }) => {
    if (!transform || !snapToGrid) return transform;
    return {
      ...transform,
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    };
  };

  const pages = useMemo(() => {
    const isLandscape = settings?.orientation === 'landscape';
    const scaleFactor = settings?.contentScale || 1;

    const PAGE_MAX_WEIGHT = (isLandscape ? 840 : 1188) / scaleFactor;

    const STUDENT_INFO_RESERVE = settings?.showStudentInfo ? 120 : 0;
    const HEADER_RESERVE = 150;
    const FOOTER_RESERVE = 60;

    const visibleBlocks = rawBlocks.filter(
      (block) => !block.hidden || (isEditorOpen && !isPrintPreview)
    );

    const allBlocks: WorksheetBlock[] = [];
    visibleBlocks.forEach((block) => {
      const weight = getBlockWeight(block);
      if (weight > PAGE_MAX_WEIGHT - HEADER_RESERVE) {
        allBlocks.push(...splitLargeBlock(block, PAGE_MAX_WEIGHT - HEADER_RESERVE));
      } else {
        allBlocks.push(block);
      }
    });

    const pagesResult: WorksheetBlock[][] = [[]];
    let currentWeight = HEADER_RESERVE + STUDENT_INFO_RESERVE;
    const CONTINUATION_HEADER_RESERVE = 45;

    allBlocks.forEach((block: WorksheetBlock) => {
      const weight = getBlockWeight(block);
      const pageLimit = PAGE_MAX_WEIGHT - FOOTER_RESERVE;

      if (currentWeight + weight > pageLimit) {
        const remainingSpace = pageLimit - currentWeight;

        // 1. Önce bloğu kalan alana akıllıca bölmeyi dene (satır, soru, eşleştirme, cümle bazlı)
        if (remainingSpace >= 90) {
          const splitResults = splitLargeBlock(block, remainingSpace);
          if (splitResults.length > 1 && getBlockWeight(splitResults[0]) <= remainingSpace + 35) {
            pagesResult[pagesResult.length - 1].push(splitResults[0]);
            pagesResult.push([splitResults[1]]);
            currentWeight = CONTINUATION_HEADER_RESERVE + getBlockWeight(splitResults[1]);
            return;
          }

          // 2. Eğer blok kesilemeyecek / bölünemeyecek bir bileşen ise:
          // Sayfada anlamlı boşluk varsa ve aşırı taşmıyorsa (%35'e kadar),
          // bloğu yeni sayfaya fırlatıp birinci sayfayı bomboş bırakmak YERİNE
          // sayfaya zarifçe ölçekleyerek (scale-to-fit) o sayfaya sığdır!
          if (remainingSpace >= 110 && weight <= remainingSpace * 1.35) {
            const fitScale = Math.max(0.72, Math.min(0.96, Number((remainingSpace / weight).toFixed(2))));
            const fittedBlock: WorksheetBlock = {
              ...block,
              style: {
                ...(block.style || {}),
                transform: `scale(${fitScale})`,
                transformOrigin: 'top center',
                marginBottom: 2,
              },
            };
            pagesResult[pagesResult.length - 1].push(fittedBlock);
            currentWeight += remainingSpace;
            return;
          }
        }

        // 3. Bölünemiyor ve sığmıyorsa: Temiz yeni sayfaya başla
        pagesResult.push([block]);
        currentWeight = CONTINUATION_HEADER_RESERVE + weight;
      } else {
        pagesResult[pagesResult.length - 1].push(block);
        currentWeight += weight;
      }
    });
    if (answerKeyMode === 'appendix') {
      const answerPage = buildAnswerKeyPage(
        Array.isArray(data) ? data : data ? ([data] as SingleWorksheetData[]) : []
      );
      if (answerPage) {
        const answerBlocks = getPageBlocks(answerPage);
        if (answerBlocks.length) pagesResult.push(answerBlocks);
      }
    }

    return pagesResult;
  }, [
    rawBlocks,
    settings?.showStudentInfo,
    settings?.orientation,
    settings?.contentScale,
    isEditorOpen,
    isPrintPreview,
    answerKeyMode,
    data,
  ]);

  // Gerçek ölçüm: bölünen bileşenler ve tek sayfaya sığmayan yükseklikler.
  React.useEffect(() => {
    const counts = new Map<string, number>();
    pages.flat().forEach((block) => {
      if (block.id) counts.set(block.id, (counts.get(block.id) ?? 0) + 1);
    });
    const splitBlockIds = [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id)
      .sort();

    const overflow = new Set<string>();
    const root = rootRef.current;
    if (root) {
      const isLandscape = settings?.orientation === 'landscape';
      const pageHeightMm = isLandscape ? 210 : 297;
      const marginMm = settings?.margin ?? 5;
      const capaCityPx = pageHeightMm * 3.7795 - marginMm * 2 * 3.7795 - 90;
      root.querySelectorAll<HTMLElement>('[data-page-idx]').forEach((pageEl) => {
        const blockEls = Array.from(pageEl.querySelectorAll<HTMLElement>('[data-block-id]'));
        let total = 0;
        blockEls.forEach((el) => {
          const height = el.offsetHeight;
          total += height;
          if (height > capaCityPx * 0.92 && el.dataset.blockId) overflow.add(el.dataset.blockId);
        });
        if (total > capaCityPx * 1.05) {
          const tallest = [...blockEls].sort((a, b) => b.offsetHeight - a.offsetHeight)[0];
          if (tallest?.dataset.blockId) overflow.add(tallest.dataset.blockId);
        }
      });
    }

    setDiagnostics({
      splitBlockIds,
      overflowBlockIds: [...overflow].sort(),
      measuredPages: pages.length,
    });
  }, [pages, settings?.orientation, settings?.margin, setDiagnostics]);

  if (!data || !isValidData) return null;

  const renderPage = (pageBlocks: WorksheetBlock[], pageIdx: number) => {
    const isLandscape = settings?.orientation === 'landscape';
    const textureClass = settings?.paperTexture && settings.paperTexture !== 'none'
      ? `paper-texture-${settings.paperTexture}`
      : '';
    const pageClass = hideWrapper ? `w-full flex-1 min-h-0 flex flex-col relative ${textureClass}` : `worksheet-page ultra-print-page print-page group mb-8 shadow-2xl relative bg-white flex flex-col ${isLandscape ? 'landscape landscape-print' : ''} ${textureClass}`;

    return (
      <div
        key={pageIdx}
        data-page-idx={pageIdx}
        className={pageClass}
        style={{
          backgroundColor: hideWrapper ? 'transparent' : 'white',
          color: 'black',
          colorScheme: 'light' as const,
          boxSizing: 'border-box',
          padding: hideWrapper
            ? '0'
            : (settings?.compact
              ? (isLandscape ? '5mm 8mm' : '5mm')
              : (settings?.margin ? `${settings.margin}mm` : '5mm')),
          width: hideWrapper ? '100%' : (isLandscape ? '297mm' : '210mm'),
          minHeight: hideWrapper ? 'auto' : (isLandscape ? '210mm' : '297mm'),
          fontFamily: settings?.fontFamily || 'Lexend, sans-serif',
          fontSize:
            settings?.fontSize === 'büyük'
              ? '1.25rem'
              : settings?.fontSize === 'küçük'
                ? '0.875rem'
                : '1rem',
          lineHeight: settings?.lineHeight ? String(settings.lineHeight) : '1.6',
          '--worksheet-border-color': settings?.borderColor || '#000',
          '--worksheet-font-size': `${settings?.fontSize === 'büyük' ? 20 : settings?.fontSize === 'küçük' ? 14 : 16}px`,
          '--worksheet-font-family': settings?.fontFamily || 'Lexend, sans-serif',
          '--worksheet-line-height': settings?.lineHeight ?? 1.6,
          '--worksheet-letter-spacing': `${settings?.letterSpacing ?? 0}px`,
          '--worksheet-word-spacing': `${settings?.wordSpacing ?? 0}px`,
          '--worksheet-paragraph-spacing': `${settings?.paragraphSpacing ?? 20}px`,
          '--worksheet-gutter': `${settings?.gutter ?? 20}px`,
        } as unknown as React.CSSProperties}
      >
        {!hideWrapper && <div className="page-indicator-screen no-print" style={{ zIndex: 100 }}>SAYFA {pageIdx + 1}</div>}

        <div
          className="w-full flex-1 flex flex-col relative print:overflow-visible"
          style={{
            zoom: settings?.contentScale ?? 1,
            width: '100%',
            maxWidth: '100%'
          }}
        >
          <div className="print-top-margin h-0" />

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
            data={data}
          />

          {editorChrome && (showGrid || snapToGrid) && (
            <div
              className="absolute inset-0 pointer-events-none z-0 opacity-20 no-print"
              style={{
                backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
                backgroundSize: `${gridSize}px ${gridSize}px`,
              }}
            />
          )}

          {editorChrome && showSafeArea && (
            <div
              className="pointer-events-none absolute inset-[4mm] z-0 rounded-sm border border-dashed border-emerald-500/30 no-print"
              aria-hidden="true"
            />
          )}

          {editorChrome && showRulers && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 no-print"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to bottom, rgba(99,102,241,0.45) 0 1px, transparent 1px 10mm), repeating-linear-gradient(to bottom, rgba(99,102,241,0.9) 0 1px, transparent 1px 50mm)',
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 no-print"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(to right, rgba(99,102,241,0.45) 0 1px, transparent 1px 10mm), repeating-linear-gradient(to right, rgba(99,102,241,0.9) 0 1px, transparent 1px 50mm)',
                }}
              />
            </>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={snapToGrid ? [snapModifier] : undefined}
            onDragEnd={(event: DragEndEvent) => {
              const { active, over } = event;
              if (!over || active.id === over.id) return;
              applyMutation((current) =>
                reorderBlocks(current, String(active.id), String(over.id))
              );
            }}
          >
            <SortableContext
              items={pageBlocks.map((b, idx) => b.id || `block-${idx}`)}
              strategy={verticalListSortingStrategy}
            >
              <div
                className={`print-content-area mt-2 print:mt-1 ${cols > 1 ? 'grid' : 'flex flex-col'}`}
                style={
                  cols > 1
                    ? {
                      gridTemplateColumns: `repeat(${cols}, 1fr)`,
                      gap: 'var(--worksheet-gutter, 10px)'
                    }
                    : { gap: 'var(--worksheet-gutter, 10px)' }
                }
              >
                {pageBlocks.filter((block) => !block.hidden || editorChrome).map((block, idx) => {
                  const isStandardBlock = !!block.type;

                  return (
                    <SortableBlockItem
                      key={block.id || `b-${pageIdx}-${idx}`}
                      block={block}
                      idx={idx}
                      isEditorOpen={editorChrome}
                      selectedBlockId={selectedBlockId}
                      setSelectedBlockId={setSelectedBlockId}
                    >
                      {!isStandardBlock && renderNonStandardBlock ? (
                        renderNonStandardBlock(block)
                      ) : (
                        <BlockRenderer block={block} />
                      )}
                    </SortableBlockItem>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          {settings?.showFooter !== false && !hideWrapper && (
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
      ref={rootRef}
      className={hideWrapper ? "w-full flex-1 flex flex-col" : "w-full flex flex-col items-center gap-10 no-scrollbar scroll-smooth"}
      id={hideWrapper ? undefined : "print-container"}
      onClick={() => {
        if (editorChrome) setSelectedBlockId(null);
      }}
    >
      {pages.length === 0 ? (
        <div className={hideWrapper ? "p-8 text-center text-gray-500" : "worksheet-page p-8 text-center text-gray-500"}>
          <p>İçerik bulunamadı. Lütfen farklı bir aktivite seçin.</p>
        </div>
      ) : (
        pages.filter(p => p && p.length > 0).map((p, i) => (
          hideWrapper ? (
            <React.Fragment key={i}>
              {renderPage(p, i)}
            </React.Fragment>
          ) : (
            <LazyPage key={i} pageIdx={i} totalPages={pages.filter(p => p && p.length > 0).length}>
              {renderPage(p, i)}
            </LazyPage>
          )
        ))
      )}
    </div>
  );
};
