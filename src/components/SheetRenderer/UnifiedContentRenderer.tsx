import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, Modifier } from '@dnd-kit/core';
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
import { SortableBlockItem } from './SortableBlockItem';

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

  if (block.type === 'text') {
    const text = recursiveSafeText(content.text || '');
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
}: {
  data: SingleWorksheetData;
  activityType: ActivityType | null;
  studentProfile?: StudentProfile | null;
  settings?: StyleSettings;
  renderNonStandardBlock?: (block: any) => React.ReactNode;
}) => {
  const { isEditorOpen, selectedBlockId, setSelectedBlockId, snapToGrid, gridSize } =
    useA4EditorStore();

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

    let allBlocks: WorksheetBlock[] = [];
    rawBlocks.forEach((block) => {
      const weight = getBlockWeight(block);
      if (weight > PAGE_MAX_WEIGHT - HEADER_RESERVE) {
        allBlocks.push(...splitLargeBlock(block, PAGE_MAX_WEIGHT - HEADER_RESERVE));
      } else {
        allBlocks.push(block);
      }
    });

    const pagesResult: WorksheetBlock[][] = [[]];
    let currentWeight = HEADER_RESERVE + STUDENT_INFO_RESERVE;

    allBlocks.forEach((block: WorksheetBlock) => {
      const weight = getBlockWeight(block);

      if (currentWeight + weight > PAGE_MAX_WEIGHT - FOOTER_RESERVE) {
        const remainingSpace = PAGE_MAX_WEIGHT - FOOTER_RESERVE - currentWeight;

        if (remainingSpace > 150) {
          const splitResults = splitLargeBlock(block, remainingSpace);
          if (splitResults.length > 1) {
            pagesResult[pagesResult.length - 1].push(splitResults[0]);
            pagesResult.push([splitResults[1]]);
            currentWeight = HEADER_RESERVE + STUDENT_INFO_RESERVE + getBlockWeight(splitResults[1]);
            return;
          }
        }

        pagesResult.push([block]);
        currentWeight = HEADER_RESERVE + STUDENT_INFO_RESERVE + weight;
      } else {
        pagesResult[pagesResult.length - 1].push(block);
        currentWeight += weight;
      }
    });
    return pagesResult;
  }, [rawBlocks, settings?.showStudentInfo]);

  if (!data || !isValidData) return null;

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
          colorScheme: 'light' as const,
          boxSizing: 'border-box',
          padding: settings?.compact
            ? (isLandscape ? '5mm 8mm' : '5mm')
            : (settings?.margin ? `${settings.margin}mm` : '5mm'),
          width: isLandscape ? '297mm' : '210mm',
          minHeight: isLandscape ? '210mm' : '297mm',
          fontFamily: settings?.fontFamily || 'Lexend, sans-serif',
          fontSize: settings?.fontSize === 'büyük' ? '1.25rem' : settings?.fontSize === 'küçük' ? '0.875rem' : '1rem',
          lineHeight: (settings as any)?.lineSpacing === 'geniş' ? '2' : (settings as any)?.lineSpacing === 'dar' ? '1.25' : '1.6',
          '--worksheet-border-color': settings?.borderColor || '#000',
        } as unknown as React.CSSProperties}
      >
        <div className="page-indicator-screen no-print" style={{ zIndex: 100 }}>SAYFA {pageIdx + 1}</div>

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
            note={pageIdx === 0 ? data?.pedagogicalNote : ''}
            data={data}
          />

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
