import React from 'react';
import type { Editor } from '@tiptap/react';
import { FileText, Layers, PenLine, Save } from 'lucide-react';
import { RichTextBlock } from './components/RichTextBlock';
import { VectorCanvas } from './components/VectorCanvas';
import { TopToolbar } from './components/TopToolbar';
import { LayersAndPropertiesPanel } from './components/LayersAndPropertiesPanel';
import { CollaborationBar } from './components/CollaborationBar';
import { LiveCursorsOverlay } from './components/LiveCursorsOverlay';
import { useEditorHistory, useEditorShortcuts } from './hooks/useEditorHistory';
import { useHybridCollaboration } from './hooks/useHybridCollaboration';
import {
  captureElementToPng,
  exportDataUrlToPdf,
  exportDocumentToDocx,
  exportElementToPng,
  exportElementsToPdf,
  exportHybridJson,
  parseHybridDocumentJson,
} from './utils/exportEngine';
import {
  A4_HEIGHT,
  A4_WIDTH,
  WHITEBOARD_HEIGHT,
  WHITEBOARD_WIDTH,
  createEmptyDocument,
  createEmptyPage,
  type CanvasSnapshot,
  type HybridDocumentSchema,
  type HybridPage,
  type LayerInfo,
  type VectorCanvasHandle,
  type VectorTool,
} from './types/editor.types';

export interface HybridCollaborationOptions {
  /** 4–12 karakterlik oda kodu; paylaşan kişi üretir, katılanlar aynı kodu girer. */
  roomId: string;
  userId: string;
  displayName: string;
}

export interface HybridEditorProps {
  initialDocument?: HybridDocumentSchema;
  onDocumentChange?: (document: HybridDocumentSchema) => void;
  onSave?: (document: HybridDocumentSchema) => void | Promise<void>;
  title?: string;
  className?: string;
  height?: number | string;
  /** Verilirse editör gerçek zamanlı odaya bağlanır (canlı imleç + belge senkronu). */
  collaboration?: HybridCollaborationOptions;
  onCollaborationLeave?: () => void;
  onCopyRoomLink?: (roomId: string) => void;
}

type Notice = { kind: 'success' | 'error' | 'info'; message: string } | null;

const TOOL_KEYS: Record<string, VectorTool> = {
  v: 'select',
  p: 'pencil',
  r: 'rect',
  o: 'ellipse',
  t: 'triangle',
  y: 'star',
  l: 'line',
  a: 'arrow',
  m: 'text',
  n: 'sticky',
};

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    !!target.closest('.ProseMirror'));

/**
 * Hibrit Belge ve Vektör Editörü.
 *
 * Üç çalışma yüzeyi tek çatı altında:
 * 1. A4 belge — Tiptap akan metni + sayfa üzerine bindirilen Fabric vektör katmanı
 * 2. Sınırsız tahta — pan/zoom, şekiller, yapışkan notlar, oklar
 * 3. Her iki yüzeyde FreeHand çizim, katman yönetimi, akıllı hizalama
 *
 * Tüm durum tek bir `HybridDocumentSchema` içinde tutulur; geri alma, JSON
 * içe/dışa aktarma ve PDF/PNG/DOCX çıktıları bu şemadan beslenir.
 */
export const HybridEditor = ({
  initialDocument,
  onDocumentChange,
  onSave,
  title,
  className = '',
  height = 760,
  collaboration,
  onCollaborationLeave,
  onCopyRoomLink,
}: HybridEditorProps) => {
  const initial = React.useMemo<HybridDocumentSchema>(
    () => initialDocument ?? createEmptyDocument(title ?? 'Yeni Hibrit Belge'),
    // Kasıtlı olarak yalnızca ilk bağlanışta okunur; içe aktarma `reset` ile yapılır.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const history = useEditorHistory<HybridDocumentSchema>(initial, 50);
  const doc = history.present;
  const docRef = React.useRef(doc);
  docRef.current = doc;

  const [editor, setEditor] = React.useState<Editor | null>(null);
  const [tool, setTool] = React.useState<VectorTool>('select');
  const [zoom, setZoom] = React.useState(1);
  const [layers, setLayers] = React.useState<LayerInfo[]>([]);
  const [selectedLayerIds, setSelectedLayerIds] = React.useState<string[]>([]);
  const [layersOpen, setLayersOpen] = React.useState(true);
  const [vectorEditing, setVectorEditing] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [notice, setNotice] = React.useState<Notice>(null);

  const pageHandles = React.useRef(new Map<string, VectorCanvasHandle | null>());
  const whiteboardHandle = React.useRef<VectorCanvasHandle | null>(null);
  const pageElements = React.useRef(new Map<string, HTMLDivElement>());

  const activePage: HybridPage =
    doc.pages.find((page) => page.id === doc.activePageId) ?? doc.pages[0];
  const isWhiteboard = doc.mode === 'whiteboard';
  const surfaceId: string | null = isWhiteboard ? null : activePage.id;

  const replaceDocument = history.replace;
  const applyRemoteDocument = React.useCallback(
    (remote: HybridDocumentSchema) => {
      // Uzak içerik geri alma yığınına yazılmaz: Ctrl+Z yerel çalışmayı geri alır.
      replaceDocument(remote);
    },
    [replaceDocument]
  );

  const collaborationEnabled = !!collaboration?.roomId;
  const collab = useHybridCollaboration({
    enabled: collaborationEnabled,
    roomId: collaboration?.roomId ?? '',
    userId: collaboration?.userId ?? '',
    displayName: collaboration?.displayName ?? '',
    document: doc,
    onRemoteDocument: applyRemoteDocument,
  });
  const { publishCursor, publishSelection } = collab;

  React.useEffect(() => {
    onDocumentChange?.(doc);
  }, [doc, onDocumentChange]);

  /* Yüzey değişince imleç sıfırlanır; eski sayfada asılı kalmaz. */
  React.useEffect(() => {
    if (!collaborationEnabled) return;
    publishCursor(null, surfaceId);
    publishSelection([], surfaceId);
  }, [surfaceId, collaborationEnabled, publishCursor, publishSelection]);

  React.useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const notify = React.useCallback((result: { ok: boolean; message: string }) => {
    setNotice({ kind: result.ok ? 'success' : 'error', message: result.message });
  }, []);

  const commitDoc = React.useCallback(
    (updater: (current: HybridDocumentSchema) => HybridDocumentSchema, coalesceKey?: string) => {
      const current = docRef.current;
      const next = updater(current);
      if (next === current) return;
      history.commit(
        { ...next, updatedAt: new Date().toISOString() },
        coalesceKey ? { coalesceKey } : undefined
      );
    },
    [history]
  );

  const updateActivePage = React.useCallback(
    (
      updater: (page: HybridPage) => HybridPage,
      coalesceKey?: string
    ) => {
      commitDoc(
        (current) => ({
          ...current,
          pages: current.pages.map((page) =>
            page.id === current.activePageId ? updater(page) : page
          ),
        }),
        coalesceKey
      );
    },
    [commitDoc]
  );

  const activeHandle = React.useCallback((): VectorCanvasHandle | null => {
    if (docRef.current.mode === 'whiteboard') return whiteboardHandle.current;
    const activeId = docRef.current.activePageId;
    return pageHandles.current.get(activeId) ?? null;
  }, []);

  const handleUndo = React.useCallback(() => history.undo(), [history]);
  const handleRedo = React.useCallback(() => history.redo(), [history]);

  useEditorShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDelete: () => activeHandle()?.deleteSelection(),
    onDuplicate: () => activeHandle()?.duplicateSelection(),
  });

  React.useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key === 'Escape') {
        activeHandle()?.clearSelection();
        setTool('select');
        return;
      }
      const nudge: Record<string, [number, number]> = {
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
      };
      const delta = nudge[event.key];
      if (delta) {
        const step = event.shiftKey ? 10 : 1;
        const handle = activeHandle();
        if (handle) {
          event.preventDefault();
          handle.nudgeSelection(delta[0] * step, delta[1] * step);
        }
        return;
      }
      const nextTool = TOOL_KEYS[event.key.toLowerCase()];
      if (!nextTool) return;
      event.preventDefault();
      setTool(nextTool);
      if (nextTool !== 'select') setVectorEditing(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeHandle]);

  /* ------------------------------ Sayfa işlemleri ----------------------------- */
  const addPage = () => {
    const page = createEmptyPage(docRef.current.pages.length);
    commitDoc((current) => ({
      ...current,
      pages: [...current.pages, page],
      activePageId: page.id,
    }));
    setSelectedLayerIds([]);
    setLayers([]);
    setEditor(null);
  };

  const deletePage = () => {
    const current = docRef.current;
    if (current.pages.length <= 1) {
      setNotice({ kind: 'info', message: 'Son sayfa silinemez.' });
      return;
    }
    const remaining = current.pages.filter((page) => page.id !== current.activePageId);
    commitDoc((existing) => ({
      ...existing,
      pages: remaining,
      activePageId: remaining[remaining.length - 1].id,
    }));
    setSelectedLayerIds([]);
    setLayers([]);
    setEditor(null);
  };

  const selectPage = (pageId: string) => {
    commitDoc((current) => ({ ...current, activePageId: pageId }));
    setSelectedLayerIds([]);
    setLayers([]);
    setEditor(null);
  };

  /* --------------------------- İçerik senkronizasyonu -------------------------- */
  const handlePageDocChange = React.useCallback(
    (pageId: string, nextDoc: NonNullable<HybridPage['doc']>) => {
      commitDoc(
        (current) => ({
          ...current,
          pages: current.pages.map((page) =>
            page.id === pageId ? { ...page, doc: nextDoc } : page
          ),
        }),
        `doc:${pageId}`
      );
    },
    [commitDoc]
  );

  const handleCanvasSnapshot = React.useCallback(
    (pageId: string, snapshot: CanvasSnapshot) => {
      commitDoc(
        (current) => ({
          ...current,
          pages: current.pages.map((page) =>
            page.id === pageId ? { ...page, canvas: snapshot } : page
          ),
        }),
        `canvas:${pageId}`
      );
    },
    [commitDoc]
  );

  const handleWhiteboardSnapshot = React.useCallback(
    (snapshot: CanvasSnapshot) => {
      commitDoc(
        (current) => ({ ...current, whiteboard: { canvas: snapshot } }),
        'canvas:whiteboard'
      );
    },
    [commitDoc]
  );

  /* --------------------------------- Çıktılar -------------------------------- */
  const collectPageDataUrls = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const page of docRef.current.pages) {
      const element = pageElements.current.get(page.id);
      if (!element) {
        urls.push('');
        continue;
      }
      try {
        urls.push(await captureElementToPng(element));
      } catch {
        urls.push('');
      }
    }
    return urls;
  };

  const handleExportPdf = async () => {
    setBusy(true);
    try {
      if (isWhiteboard) {
        const dataUrl = whiteboardHandle.current?.exportPng({ multiplier: 2 });
        if (!dataUrl) {
          setNotice({ kind: 'error', message: 'Tahtada dışa aktarılacak nesne yok.' });
          return;
        }
        notify(exportDataUrlToPdf(dataUrl, docRef.current.title, 'landscape'));
        return;
      }
      const elements = docRef.current.pages
        .map((page) => pageElements.current.get(page.id))
        .filter((element): element is HTMLDivElement => !!element);
      if (!elements.length) {
        setNotice({ kind: 'error', message: 'PDF için sayfa bulunamadı.' });
        return;
      }
      notify(await exportElementsToPdf(elements, docRef.current.title));
    } finally {
      setBusy(false);
    }
  };

  const handleExportPng = async () => {
    setBusy(true);
    try {
      if (isWhiteboard) {
        const dataUrl = whiteboardHandle.current?.exportPng({ multiplier: 2 });
        if (!dataUrl) {
          setNotice({ kind: 'error', message: 'Tahtada dışa aktarılacak nesne yok.' });
          return;
        }
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${docRef.current.title || 'hibrit-tahta'}.png`;
        link.rel = 'noopener';
        link.click();
        setNotice({ kind: 'success', message: 'PNG indirildi.' });
        return;
      }
      const element = pageElements.current.get(activePage.id);
      if (!element) {
        setNotice({ kind: 'error', message: 'Aktif sayfa bulunamadı.' });
        return;
      }
      notify(
        await exportElementToPng(element, `${docRef.current.title}-${activePage.name}`)
      );
    } finally {
      setBusy(false);
    }
  };

  const handleExportDocx = async () => {
    setBusy(true);
    try {
      const images = await collectPageDataUrls();
      notify(await exportDocumentToDocx(docRef.current, images, docRef.current.title));
    } finally {
      setBusy(false);
    }
  };

  const handleExportJson = () => {
    notify(exportHybridJson(docRef.current, docRef.current.title));
  };

  const handleInsertVectorImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setNotice({ kind: 'error', message: 'Yalnızca görsel dosyaları eklenebilir.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const handle = activeHandle();
      if (!dataUrl || !handle) {
        setNotice({ kind: 'error', message: 'Görsel eklenemedi.' });
        return;
      }
      handle.addImage(dataUrl);
      setVectorEditing(true);
      setNotice({ kind: 'success', message: 'Görsel vektör katmanına eklendi.' });
    };
    reader.onerror = () => setNotice({ kind: 'error', message: 'Dosya okunamadı.' });
    reader.readAsDataURL(file);
  };

  const handleImportJson = async (file: File) => {
    try {
      const raw = await file.text();
      const result = parseHybridDocumentJson(raw);
      if (!result.ok) {
        setNotice({ kind: 'error', message: result.error });
        return;
      }
      history.reset(result.doc);
      setSelectedLayerIds([]);
      setLayers([]);
      setEditor(null);
      setNotice({ kind: 'success', message: 'Belge içe aktarıldı.' });
    } catch {
      setNotice({ kind: 'error', message: 'Dosya okunamadı.' });
    }
  };

  const handleSave = () => {
    if (!onSave) {
      setNotice({ kind: 'info', message: 'Kaydetme bağlı değil; JSON dışa aktarabilirsiniz.' });
      return;
    }
    void Promise.resolve(onSave(docRef.current)).then(() =>
      setNotice({ kind: 'success', message: 'Belge kaydedildi.' })
    );
  };

  /* ------------------------------- Katman olayları ----------------------------- */
  const handleLayersChange = (pageId: string | null, nextLayers: LayerInfo[]) => {
    if (pageId === null) {
      if (docRef.current.mode === 'whiteboard') setLayers(nextLayers);
      return;
    }
    if (pageId === docRef.current.activePageId) setLayers(nextLayers);
  };

  const handleSelectionChange = (pageId: string | null, ids: string[]) => {
    publishSelection(ids, pageId);
    if (pageId === null) {
      if (docRef.current.mode === 'whiteboard') setSelectedLayerIds(ids);
      return;
    }
    if (pageId === docRef.current.activePageId) setSelectedLayerIds(ids);
  };

  const selectLayer = (id: string, additive = false) => {
    const next = additive
      ? selectedLayerIds.includes(id)
        ? selectedLayerIds.filter((item) => item !== id)
        : [...selectedLayerIds, id]
      : [id];
    setSelectedLayerIds(next);
    activeHandle()?.selectByIds(next);
  };

  const changeMode = (mode: 'document' | 'whiteboard') => {
    commitDoc((current) => ({ ...current, mode }));
    setEditor(null);
    setSelectedLayerIds([]);
    setLayers([]);
    setZoom(1);
    setTool('select');
    setVectorEditing(false);
  };

  const pageScale = zoom;

  return (
    <div
      className={`hybrid-editor relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] ${className}`}
      style={{ height }}
      aria-label="Hibrit belge ve vektör editörü"
    >
      <TopToolbar
        mode={doc.mode}
        onModeChange={changeMode}
        editor={editor}
        pages={doc.pages.map((page) => ({ id: page.id, name: page.name }))}
        activePageId={activePage.id}
        onSelectPage={selectPage}
        onAddPage={addPage}
        onDeletePage={deletePage}
        margins={activePage.margins}
        onMarginsChange={(margins) =>
          updateActivePage((page) => ({ ...page, margins }), `margins:${activePage.id}`)
        }
        tool={tool}
        onToolChange={(nextTool) => {
          setTool(nextTool);
          if (nextTool !== 'select') setVectorEditing(true);
        }}
        vectorStyle={doc.vectorStyle}
        onVectorStyleChange={(patch) =>
          commitDoc(
            (current) => ({
              ...current,
              vectorStyle: { ...current.vectorStyle, ...patch },
            }),
            'vector-style'
          )
        }
        zoom={zoom}
        onZoomChange={setZoom}
        canUndo={history.canUndo}
        canRedo={history.canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        layersOpen={layersOpen}
        onToggleLayers={() => setLayersOpen((value) => !value)}
        isBusy={busy}
        onExportPdf={() => void handleExportPdf()}
        onExportPng={() => void handleExportPng()}
        onExportDocx={() => void handleExportDocx()}
        onExportJson={handleExportJson}
        onImportJson={(file) => void handleImportJson(file)}
        onInsertVectorImage={handleInsertVectorImage}
      />

      {collaborationEnabled && collaboration && (
        <CollaborationBar
          roomCode={collaboration.roomId}
          status={collab.status}
          peers={collab.peers}
          message={collab.message}
          selfColor={collab.selfColor}
          onLeave={() => onCollaborationLeave?.()}
          onCopyLink={() => onCopyRoomLink?.(collaboration.roomId)}
        />
      )}

      <div className="relative flex min-h-0 flex-1">
        <div className="custom-scrollbar relative flex-1 overflow-auto bg-[var(--bg-secondary)] p-6">
          <div className="pointer-events-none sticky top-0 z-30 mb-3 flex justify-center">
            <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)]/95 p-1 shadow-lg backdrop-blur">
              <button
                type="button"
                onClick={() => {
                  setVectorEditing(false);
                  setTool('select');
                }}
                aria-pressed={!vectorEditing}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                  !vectorEditing
                    ? 'bg-[var(--accent-color)] text-[var(--bg-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
                }`}
                title="Metni düzenle — vektör katmanı tıklamaları kapanır"
              >
                <FileText size={12} /> Metin
              </button>
              <button
                type="button"
                onClick={() => setVectorEditing(true)}
                aria-pressed={vectorEditing}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider ${
                  vectorEditing
                    ? 'bg-[var(--accent-color)] text-[var(--bg-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
                }`}
                title="Çizim katmanını etkinleştir — şekil, kalem, metin kutusu"
              >
                <PenLine size={12} /> Çizim
              </button>
              <span className="mx-1 h-4 w-px bg-[var(--border-color)]" />
              <button
                type="button"
                onClick={() => setLayersOpen((value) => !value)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
                title="Katman panelini aç/kapat"
              >
                <Layers size={12} /> {layers.length}
              </button>
              {onSave && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--accent-color)] hover:bg-[var(--accent-muted)]"
                >
                  <Save size={12} /> Kaydet
                </button>
              )}
            </div>
          </div>

          {isWhiteboard ? (
            <div className="flex min-h-full items-start justify-center">
              <div
                className="relative shrink-0 rounded-xl border border-[var(--border-color)] bg-white shadow-2xl"
                style={{
                  width: doc.whiteboard.canvas.width || WHITEBOARD_WIDTH,
                  height: doc.whiteboard.canvas.height || WHITEBOARD_HEIGHT,
                  overflow: 'hidden',
                }}
              >
                <VectorCanvas
                  ref={(handle) => {
                    whiteboardHandle.current = handle;
                  }}
                  mode="whiteboard"
                  width={doc.whiteboard.canvas.width || WHITEBOARD_WIDTH}
                  height={doc.whiteboard.canvas.height || WHITEBOARD_HEIGHT}
                  zoom={pageScale}
                  tool={tool}
                  style={doc.vectorStyle}
                  snapshot={doc.whiteboard.canvas}
                  onSnapshotChange={handleWhiteboardSnapshot}
                  onLayersChange={(nextLayers) => handleLayersChange(null, nextLayers)}
                  onSelectionChange={(ids) => handleSelectionChange(null, ids)}
                  onZoomChange={(nextZoom) => setZoom(nextZoom)}
                  onToolConsumed={() => setTool('select')}
                  onPointerActivity={(point) => publishCursor(point, null)}
                />
                <LiveCursorsOverlay
                  peers={collab.peers}
                  surfaceId={null}
                  layers={layers}
                  showSelection={false}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-8">
              {doc.pages.map((page, index) => {
                const isActive = page.id === activePage.id;
                return (
                  <div
                    key={page.id}
                    className="relative shrink-0"
                    style={{
                      width: A4_WIDTH * pageScale,
                      height: A4_HEIGHT * pageScale,
                    }}
                  >
                    <div
                      ref={(element) => {
                        if (element) pageElements.current.set(page.id, element);
                        else pageElements.current.delete(page.id);
                      }}
                      className={`hybrid-page relative overflow-hidden bg-white text-black shadow-2xl ${
                        isActive ? 'ring-2 ring-[var(--accent-color)]/60' : ''
                      }`}
                      style={{
                        width: A4_WIDTH,
                        height: A4_HEIGHT,
                        transform: `scale(${pageScale})`,
                        transformOrigin: 'top left',
                        fontFamily: 'Lexend, sans-serif',
                      }}
                      data-page-index={index}
                    >
                      <div
                        className="absolute inset-0 z-0"
                        style={{
                          pointerEvents: isActive && vectorEditing ? 'auto' : 'none',
                        }}
                      >
                        <VectorCanvas
                          ref={(handle) => {
                            pageHandles.current.set(page.id, handle);
                          }}
                          mode="document"
                          width={A4_WIDTH}
                          height={A4_HEIGHT}
                          zoom={1}
                          tool={isActive ? tool : 'select'}
                          style={doc.vectorStyle}
                          snapshot={page.canvas}
                          onSnapshotChange={(snapshot) => handleCanvasSnapshot(page.id, snapshot)}
                          onLayersChange={(nextLayers) => handleLayersChange(page.id, nextLayers)}
                          onSelectionChange={(ids) => handleSelectionChange(page.id, ids)}
                          onZoomChange={() => undefined}
                          onToolConsumed={() => setTool('select')}
                          onPointerActivity={(point) => publishCursor(point, page.id)}
                        />
                      </div>

                      <div
                        className="absolute inset-0 z-10"
                        style={{
                          paddingTop: page.margins.top,
                          paddingRight: page.margins.right,
                          paddingBottom: page.margins.bottom,
                          paddingLeft: page.margins.left,
                          pointerEvents: isActive && !vectorEditing ? 'auto' : 'none',
                        }}
                      >
                        <RichTextBlock
                          content={page.doc}
                          editable={isActive && !vectorEditing}
                          onChange={(nextDoc) => handlePageDocChange(page.id, nextDoc)}
                          onReady={isActive ? setEditor : undefined}
                          ariaLabel={`${page.name} belge metni`}
                        />
                      </div>

                      <LiveCursorsOverlay
                        peers={collab.peers}
                        surfaceId={page.id}
                        layers={isActive ? layers : []}
                        showSelection={isActive}
                      />

                      <span className="pointer-events-none absolute bottom-2 right-3 z-20 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        {index + 1} / {doc.pages.length}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {layersOpen && (
          <LayersAndPropertiesPanel
            layers={layers}
            selectedIds={selectedLayerIds}
            mode={doc.mode}
            onSelect={selectLayer}
            onReorder={(action) => activeHandle()?.reorder(action)}
            onToggleLock={() => activeHandle()?.toggleLock()}
            onToggleVisible={() => activeHandle()?.toggleVisible()}
            onGroup={() => activeHandle()?.groupSelection()}
            onUngroup={() => activeHandle()?.ungroupSelection()}
            onDuplicate={() => activeHandle()?.duplicateSelection()}
            onDelete={() => activeHandle()?.deleteSelection()}
            onChange={(patch) => activeHandle()?.updateSelection(patch)}
            onClose={() => setLayersOpen(false)}
          />
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--border-color)] bg-[var(--bg-paper)] px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        <span>
          {isWhiteboard
            ? `Sınırsız tahta • ${layers.length} katman`
            : `${activePage.name} • ${doc.pages.length} sayfa • ${layers.length} katman`}
        </span>
        <span className="flex items-center gap-3">
          <span>Ctrl+Z geri • Ctrl+Y yinele • Ctrl+D çoğalt • Del sil • Ok tuşları kaydır</span>
          <span>Space+sürükle pan • Ctrl+tekerlek zoom</span>
          <span>%{Math.round(zoom * 100)}</span>
        </span>
      </footer>

      {notice && (
        <div
          role="status"
          aria-live="polite"
          className={`absolute bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-3 py-2 text-[10px] font-bold shadow-2xl ${
            notice.kind === 'error'
              ? 'border-rose-400/40 bg-rose-500/10 text-rose-500'
              : notice.kind === 'success'
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-600'
                : 'border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-secondary)]'
          }`}
        >
          {notice.message}
        </div>
      )}
    </div>
  );
};

/** Editörü herhangi bir sayfaya gömmek için hazır örnek sarmalayıcı. */
export const HybridEditorExample = () => (
  <div className="mx-auto w-full max-w-6xl p-4">
    <header className="mb-3">
      <h1 className="text-lg font-black text-[var(--text-primary)]">Hibrit Belge Editörü</h1>
      <p className="text-[11px] text-[var(--text-muted)]">
        Word + FreeHand + sınırsız tahta. Veri kaydetmek için <code>onDocumentChange</code> veya{' '}
        <code>onSave</code> bağlayın.
      </p>
    </header>
    <HybridEditor height={820} />
  </div>
);

export default HybridEditor;
