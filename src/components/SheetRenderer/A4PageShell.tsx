import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { SingleWorksheetData, StudentProfile, StyleSettings, WorksheetBlock } from '../../types';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { reorderBlocks } from '../../services/a4EditorService';
import { SortableBlockItem } from './SortableBlockItem';
import { BlockRenderer } from './BlockRenderer';

export const resolveFontSizePx = (fontSize?: number | string): number => {
  if (typeof fontSize === 'number' && Number.isFinite(fontSize) && fontSize > 0) {
    return fontSize;
  }
  if (fontSize === 'küçük') return 14;
  if (fontSize === 'büyük') return 20;
  return 16;
};

export const StudentInfoStrip: React.FC<{ studentProfile?: StudentProfile | null }> = ({
  studentProfile,
}) => (
  <div className="w-full px-6 py-3 flex justify-between items-end border-b-2 border-zinc-900 mb-4 font-lexend">
    <div className="flex gap-10">
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
);

export const A4EditorOverlays: React.FC<{
  editorChrome: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showSafeArea: boolean;
  showRulers: boolean;
  safeMarginMm: number;
}> = ({
  editorChrome,
  showGrid,
  snapToGrid,
  gridSize,
  showSafeArea,
  showRulers,
  safeMarginMm,
}) => {
  if (!editorChrome) return null;
  return (
    <>
      {(showGrid || snapToGrid) && (
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-20 no-print"
          style={{
            backgroundImage:
              'linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)',
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}

      {showSafeArea && (
        <div
          className="pointer-events-none absolute z-0 rounded-sm border border-dashed border-emerald-500/40 no-print"
          style={{ inset: `${safeMarginMm}mm` }}
          aria-hidden="true"
        />
      )}

      {showRulers && (
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
    </>
  );
};

/**
 * Legacy/özel şablonlu sayfalara A4 Tasarımcısı ile eklenen ekstra blokları
 * sürükle-bırak, seçim, stil ve yerinde düzenleme ile render eder.
 */
export const ExtraBlocksZone: React.FC<{ blocks: WorksheetBlock[] }> = ({ blocks }) => {
  const {
    isEditorOpen,
    isPrintPreview,
    selectedBlockId,
    setSelectedBlockId,
    snapToGrid,
    gridSize,
    applyMutation,
  } = useA4EditorStore();

  const editorChrome = isEditorOpen && !isPrintPreview;
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const visibleBlocks = blocks.filter((b) => !b.hidden || editorChrome);
  if (!visibleBlocks.length) return null;

  const snapModifier: Modifier = ({ transform }) => {
    if (!transform || !snapToGrid) return transform;
    return {
      ...transform,
      x: Math.round(transform.x / gridSize) * gridSize,
      y: Math.round(transform.y / gridSize) * gridSize,
    };
  };

  return (
    <div className="mt-4 pt-3 border-t border-dashed border-zinc-200/80">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={snapToGrid ? [snapModifier] : undefined}
        onDragEnd={(event: DragEndEvent) => {
          const { active, over } = event;
          if (!over || active.id === over.id) return;
          applyMutation((current) => reorderBlocks(current, String(active.id), String(over.id)));
        }}
      >
        <SortableContext
          items={visibleBlocks.map((b, idx) => b.id || `extra-${idx}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col" style={{ gap: 'var(--worksheet-gutter, 20px)' }}>
            {visibleBlocks.map((block, idx) => (
              <SortableBlockItem
                key={block.id || `extra-${idx}`}
                block={block}
                idx={idx}
                isEditorOpen={editorChrome}
                selectedBlockId={selectedBlockId}
                setSelectedBlockId={setSelectedBlockId}
              >
                <BlockRenderer block={block} />
              </SortableBlockItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

/**
 * Tüm legacy ve özel şablonlu sayfalar için birleşik A4 sayfa kabuğu.
 * PagePanel, StyleSettings ve A4EditorStore görüntüleme yardımcılarını
 * tek noktadan canlı olarak uygular.
 */
export const A4PageShell: React.FC<{
  children: React.ReactNode;
  settings?: StyleSettings;
  studentProfile?: StudentProfile | null;
  pageData?: SingleWorksheetData;
  pageIdx?: number;
  totalPages?: number;
}> = ({ children, settings, studentProfile, pageData, pageIdx = 0, totalPages = 1 }) => {
  const {
    isEditorOpen,
    isPrintPreview,
    showGrid,
    snapToGrid,
    gridSize,
    showRulers,
    showSafeArea,
    setSelectedBlockId,
  } = useA4EditorStore();

  const editorChrome = isEditorOpen && !isPrintPreview;
  const isLandscape = settings?.orientation === 'landscape';
  const textureClass =
    settings?.paperTexture && settings.paperTexture !== 'none'
      ? `paper-texture-${settings.paperTexture}`
      : '';
  const fontSizePx = resolveFontSizePx(settings?.fontSize);
  const cols = Math.max(1, settings?.columns ?? 1);
  const extraBlocks = Array.isArray((pageData as Record<string, unknown> | undefined)?.extraBlocks)
    ? ((pageData as Record<string, unknown>).extraBlocks as WorksheetBlock[])
    : [];

  return (
    <div
      data-a4-styled="true"
      data-show-title={settings?.showTitle !== false ? 'true' : 'false'}
      data-show-instruction={settings?.showInstruction !== false ? 'true' : 'false'}
      data-show-clues={settings?.showClues !== false ? 'true' : 'false'}
      data-show-answers={settings?.showAnswers ? 'true' : 'false'}
      onClick={() => {
        if (editorChrome) setSelectedBlockId(null);
      }}
      className={`worksheet-page ultra-print-page print-page group mb-8 shadow-2xl relative bg-white flex flex-col ${
        isLandscape ? 'landscape landscape-print' : ''
      } ${textureClass}`}
      style={
        {
          color: 'black',
          colorScheme: 'light',
          boxSizing: 'border-box',
          padding: settings?.compact
            ? isLandscape
              ? '5mm 8mm'
              : '5mm'
            : `${settings?.margin ?? 5}mm`,
          width: isLandscape ? '297mm' : '210mm',
          minHeight: isLandscape ? '210mm' : '297mm',
          fontFamily: settings?.fontFamily || 'Lexend, sans-serif',
          fontSize: `${fontSizePx}px`,
          lineHeight: String(settings?.lineHeight ?? 1.6),
          '--worksheet-border-color': settings?.borderColor || '#000',
          '--worksheet-border-width': `${settings?.borderWidth ?? 2}px`,
          '--worksheet-font-size': `${fontSizePx}px`,
          '--worksheet-font-family': settings?.fontFamily || 'Lexend, sans-serif',
          '--worksheet-line-height': settings?.lineHeight ?? 1.6,
          '--worksheet-letter-spacing': `${settings?.letterSpacing ?? 0}px`,
          '--worksheet-word-spacing': `${settings?.wordSpacing ?? 0}px`,
          '--worksheet-paragraph-spacing': `${settings?.paragraphSpacing ?? 20}px`,
          '--worksheet-gutter': `${settings?.gutter ?? 20}px`,
          '--grid-columns': `repeat(${cols}, minmax(0, 1fr))`,
        } as unknown as React.CSSProperties
      }
    >
      <A4EditorOverlays
        editorChrome={editorChrome}
        showGrid={showGrid}
        snapToGrid={snapToGrid}
        gridSize={gridSize}
        showSafeArea={showSafeArea}
        showRulers={showRulers}
        safeMarginMm={settings?.safeMarginMm ?? 12}
      />

      <div
        className="w-full flex-1 flex flex-col relative print:overflow-visible z-[1]"
        style={{
          zoom: settings?.contentScale ?? 1,
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {settings?.showStudentInfo && <StudentInfoStrip studentProfile={studentProfile} />}

        <div className="flex-1 flex flex-col">{children}</div>

        {extraBlocks.length > 0 && <ExtraBlocksZone blocks={extraBlocks} />}

        {settings?.showFooter !== false && (
          <div className="mt-auto pt-4 border-t-2 border-zinc-900 flex justify-between items-center text-[7px] font-black uppercase tracking-[0.4em] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="bg-black text-white px-1.5 py-0.5 rounded font-black">AI</span>
              <span>{settings?.footerText || 'Bursa Disleksi EduMind • Nöro-Mimari Motoru v7.0'}</span>
            </div>
            <span>
              SAYFA {pageIdx + 1} / {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
