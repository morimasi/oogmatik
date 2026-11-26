import React from 'react';
import type { Editor } from '@tiptap/react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowLeftRight,
  ArrowRight,
  Bold,
  ChevronDown,
  Circle,
  Columns3,
  Copy,
  Download,
  Eraser,
  FileCode2,
  FileImage,
  FileJson,
  ImagePlus,
  FileText,
  Grid,
  Italic,
  LayoutTemplate,
  List,
  ListOrdered,
  Maximize2,
  Minus,
  MousePointer2,
  PanelRight,
  Pencil,
  Plus,
  Printer,
  Redo2,
  RotateCcw,
  Rows3,
  Shapes,
  Square,
  Star,
  StickyNote,
  Strikethrough,
  Table as TableIcon,
  Trash2,
  Triangle,
  Type,
  Underline,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type {
  BackgroundPattern,
  EditorMode,
  PageMargins,
  VectorStyle,
  VectorTool,
} from '../types/editor.types';
import { MAX_ZOOM, MIN_ZOOM } from '../types/editor.types';
import { VECTOR_STAMPS, type VectorStamp } from '../utils/vectorStamps';
import { HYBRID_TEMPLATES, type HybridTemplate } from '../utils/documentTemplates';

const MODES: Array<{ id: EditorMode; label: string; icon: React.ReactNode }> = [
  { id: 'document', label: 'A4 Belge', icon: <FileText size={14} /> },
  { id: 'whiteboard', label: 'Sınırsız Tahta', icon: <Maximize2 size={14} /> },
];

const FONT_FAMILIES = [
  { value: 'Lexend, sans-serif', label: 'Lexend (disleksi standardı)' },
  { value: 'Atkinson Hyperlegible, Verdana, sans-serif', label: 'Atkinson / Verdana' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Courier New, monospace', label: 'Courier New' },
];

const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 40];

const DRAW_TOOLS: Array<{ id: VectorTool; label: string; icon: React.ReactNode }> = [
  { id: 'select', label: 'Seç (V)', icon: <MousePointer2 size={14} /> },
  { id: 'pencil', label: 'Serbest kalem (P)', icon: <Pencil size={14} /> },
  { id: 'rect', label: 'Dikdörtgen (R)', icon: <Square size={14} /> },
  { id: 'ellipse', label: 'Daire / Elips (O)', icon: <Circle size={14} /> },
  { id: 'triangle', label: 'Üçgen (T)', icon: <Triangle size={14} /> },
  { id: 'star', label: 'Yıldız (Y)', icon: <Star size={14} /> },
  { id: 'line', label: 'Düz çizgi (L)', icon: <Minus size={14} /> },
  { id: 'arrow', label: 'Tek yönlü ok (A)', icon: <ArrowRight size={14} /> },
  { id: 'arrow-double', label: 'Çift yönlü ok (Shift+A)', icon: <ArrowLeftRight size={14} /> },
  { id: 'text', label: 'Metin kutusu (M)', icon: <Type size={14} /> },
  { id: 'sticky', label: 'Yapışkan not (N)', icon: <StickyNote size={14} /> },
];

const ToolButton = ({
  label,
  active,
  disabled,
  onClick,
  children,
  tone = 'default',
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  tone?: 'default' | 'accent' | 'danger';
}) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    disabled={disabled}
    onClick={onClick}
    className={`flex h-8 min-w-8 items-center justify-center gap-1 rounded-lg px-2 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
      active
        ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm'
        : tone === 'accent'
          ? 'bg-[var(--accent-muted)] text-[var(--accent-color)] hover:opacity-80'
          : tone === 'danger'
            ? 'text-[var(--text-secondary)] hover:bg-rose-500/10 hover:text-rose-500'
            : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <span className="mx-1 h-6 w-px shrink-0 bg-[var(--border-color)]" aria-hidden />;

const Group = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div
    role="group"
    aria-label={label}
    className="flex shrink-0 items-center gap-0.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-glass)]/60 p-1"
  >
    {children}
  </div>
);

export interface TopToolbarProps {
  mode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
  documentTitle: string;
  onDocumentTitleChange: (title: string) => void;
  editor: Editor | null;
  pages: Array<{ id: string; name: string }>;
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDuplicatePage: () => void;
  onDeletePage: () => void;
  margins: PageMargins;
  onMarginsChange: (margins: PageMargins) => void;
  background: BackgroundPattern;
  onBackgroundChange: (pattern: BackgroundPattern) => void;
  tool: VectorTool;
  onToolChange: (tool: VectorTool) => void;
  vectorStyle: VectorStyle;
  onVectorStyleChange: (patch: Partial<VectorStyle>) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetViewport?: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  layersOpen: boolean;
  onToggleLayers: () => void;
  isBusy?: boolean;
  onExportPdf: () => void;
  onExportPng: () => void;
  onExportDocx: () => void;
  onExportSvg: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onImportSvg: (file: File) => void;
  onInsertVectorImage?: (file: File) => void;
  onInsertStamp: (stamp: VectorStamp) => void;
  onApplyTemplate: (template: HybridTemplate) => void;
  onPrint?: () => void;
}

/**
 * Hibrit editörün üst barı: mod geçişi, Word biçimlendirme, FreeHand araçları,
 * sayfa yönetimi, zoom ve dışa aktarma menüsü.
 */
export const TopToolbar = ({
  mode,
  onModeChange,
  documentTitle,
  onDocumentTitleChange,
  editor,
  pages,
  activePageId,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  margins,
  onMarginsChange,
  background,
  onBackgroundChange,
  tool,
  onToolChange,
  vectorStyle,
  onVectorStyleChange,
  zoom,
  onZoomChange,
  onResetViewport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  layersOpen,
  onToggleLayers,
  isBusy = false,
  onExportPdf,
  onExportPng,
  onExportDocx,
  onExportSvg,
  onExportJson,
  onImportJson,
  onImportSvg,
  onInsertVectorImage,
  onInsertStamp,
  onApplyTemplate,
  onPrint,
}: TopToolbarProps) => {
  const [exportOpen, setExportOpen] = React.useState(false);
  const [templatesOpen, setTemplatesOpen] = React.useState(false);
  const [stampsOpen, setStampsOpen] = React.useState(false);
  const [, forceRender] = React.useState(0);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const vectorImageInputRef = React.useRef<HTMLInputElement>(null);
  const jsonInputRef = React.useRef<HTMLInputElement>(null);
  const svgInputRef = React.useRef<HTMLInputElement>(null);
  const [showMargins, setShowMargins] = React.useState(false);

  React.useEffect(() => {
    if (!editor) return undefined;
    const refresh = () => forceRender((value) => value + 1);
    editor.on('transaction', refresh);
    editor.on('selectionUpdate', refresh);
    return () => {
      editor.off('transaction', refresh);
      editor.off('selectionUpdate', refresh);
    };
  }, [editor]);

  const wordDisabled = !editor || mode !== 'document';

  const headingValue = (() => {
    if (!editor) return 'p';
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'p';
  })();

  const currentFontFamily =
    (editor?.getAttributes('textStyle').fontFamily as string | undefined) ?? FONT_FAMILIES[0].value;
  const currentFontSize = (() => {
    const raw = editor?.getAttributes('textStyle').fontSize as string | undefined;
    const parsed = raw ? Number.parseFloat(raw) : NaN;
    return Number.isFinite(parsed) ? Math.round(parsed) : 16;
  })();

  const applyHeading = (value: string) => {
    if (!editor) return;
    const chain = editor.chain().focus();
    if (value === 'p') chain.setParagraph().run();
    else if (value === 'h1') chain.toggleHeading({ level: 1 }).run();
    else if (value === 'h2') chain.toggleHeading({ level: 2 }).run();
    else chain.toggleHeading({ level: 3 }).run();
  };

  const insertImage = (file: File) => {
    if (!editor) return;
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === 'string' ? reader.result : '';
      if (src) editor.chain().focus().setImage({ src }).run();
    };
    reader.readAsDataURL(file);
  };

  const tableActive = !!editor?.isActive('table');

  return (
    <div className="relative z-30 border-b border-[var(--border-color)] bg-[var(--bg-paper)]/95 backdrop-blur-md">
      <div className="flex flex-wrap items-center gap-1.5 px-2 py-2">
        <Group label="Çalışma modu">
          {MODES.map((entry) => (
            <ToolButton
              key={entry.id}
              label={entry.label}
              active={mode === entry.id}
              onClick={() => onModeChange(entry.id)}
            >
              {entry.icon}
              <span className="hidden sm:inline">{entry.label}</span>
            </ToolButton>
          ))}
        </Group>

        <Group label="Belge başlığı">
          <input
            type="text"
            value={documentTitle}
            onChange={(event) => onDocumentTitleChange(event.target.value)}
            maxLength={80}
            aria-label="Belge başlığı"
            placeholder="Belge başlığı"
            className="h-8 w-36 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
          />
        </Group>

        <Group label="Geçmiş">
          <ToolButton label="Geri al (Ctrl+Z)" disabled={!canUndo} onClick={onUndo}>
            <Undo2 size={14} />
          </ToolButton>
          <ToolButton label="Yinele (Ctrl+Y)" disabled={!canRedo} onClick={onRedo}>
            <Redo2 size={14} />
          </ToolButton>
        </Group>

        {mode === 'document' && (
          <Group label="Sayfalar">
            <select
              value={activePageId}
              onChange={(event) => onSelectPage(event.target.value)}
              aria-label="Etkin sayfa"
              className="h-8 max-w-[130px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 text-[11px] font-bold text-[var(--text-primary)] outline-none"
            >
              {pages.map((page, index) => (
                <option key={page.id} value={page.id}>
                  {index + 1}. {page.name}
                </option>
              ))}
            </select>
            <ToolButton label="Yeni sayfa ekle" onClick={onAddPage}>
              <Plus size={14} />
            </ToolButton>
            <ToolButton label="Sayfayı çoğalt" onClick={onDuplicatePage}>
              <Copy size={13} />
            </ToolButton>
            <ToolButton
              label="Etkin sayfayı sil"
              tone="danger"
              disabled={pages.length <= 1}
              onClick={onDeletePage}
            >
              <Trash2 size={14} />
            </ToolButton>
            <button
              type="button"
              onClick={() => setShowMargins((value) => !value)}
              title="Kenar boşlukları"
              aria-expanded={showMargins}
              className="flex h-8 items-center gap-1 rounded-lg px-2 text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
            >
              <Rows3 size={13} /> Kenar
            </button>
          </Group>
        )}

        <Group label="Kağıt deseni">
          <Grid size={13} className="ml-1 text-[var(--text-muted)]" />
          <select
            value={background}
            onChange={(event) => onBackgroundChange(event.target.value as BackgroundPattern)}
            aria-label="Kağıt deseni"
            className="h-8 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-1.5 text-[10px] font-bold text-[var(--text-primary)] outline-none"
          >
            <option value="blank">Düz</option>
            <option value="lined">Çizgili</option>
            <option value="grid">Kareli</option>
            <option value="dots">Noktalı</option>
          </select>
        </Group>

        <Group label="Yakınlaştırma">
          <ToolButton
            label="Uzaklaştır"
            disabled={zoom <= MIN_ZOOM}
            onClick={() => onZoomChange(Math.max(MIN_ZOOM, Math.round((zoom - 0.1) * 100) / 100))}
          >
            <ZoomOut size={14} />
          </ToolButton>
          <button
            type="button"
            onClick={() => onZoomChange(1)}
            title="Gerçek boyut (%100)"
            className="h-8 min-w-[48px] rounded-lg px-1 text-[10px] font-black text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
          >
            %{Math.round(zoom * 100)}
          </button>
          <ToolButton
            label="Yakınlaştır"
            disabled={zoom >= MAX_ZOOM}
            onClick={() => onZoomChange(Math.min(MAX_ZOOM, Math.round((zoom + 0.1) * 100) / 100))}
          >
            <ZoomIn size={14} />
          </ToolButton>
          {mode === 'whiteboard' && onResetViewport && (
            <ToolButton label="Tahta görünümünü sıfırla" onClick={onResetViewport}>
              <RotateCcw size={13} />
            </ToolButton>
          )}
        </Group>

        <div className="relative">
          <button
            type="button"
            onClick={() => setTemplatesOpen((value) => !value)}
            aria-haspopup="menu"
            aria-expanded={templatesOpen}
            className="flex h-8 items-center gap-1 rounded-xl border border-[var(--border-color)] bg-[var(--surface-glass)]/60 px-2.5 text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] hover:border-[var(--accent-color)] hover:text-[var(--accent-color)]"
          >
            <LayoutTemplate size={13} /> Şablonlar
          </button>
          {templatesOpen && (
            <>
              <button
                type="button"
                aria-label="Şablon menüsünü kapat"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setTemplatesOpen(false)}
              />
              <div
                role="menu"
                className="absolute left-0 top-full z-40 mt-2 w-72 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-1.5 shadow-2xl"
              >
                {HYBRID_TEMPLATES.map((tpl) => (
                  <ExportItem
                    key={tpl.id}
                    icon={<LayoutTemplate size={14} />}
                    label={tpl.title}
                    hint={tpl.description}
                    onClick={() => {
                      setTemplatesOpen(false);
                      onApplyTemplate(tpl);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <ToolButton
            label={layersOpen ? 'Katman panelini kapat' : 'Katman panelini aç'}
            active={layersOpen}
            onClick={onToggleLayers}
          >
            <PanelRight size={14} />
          </ToolButton>

          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((value) => !value)}
              disabled={isBusy}
              aria-haspopup="menu"
              aria-expanded={exportOpen}
              className="flex h-8 items-center gap-1.5 rounded-xl bg-[var(--accent-color)] px-3 text-[10px] font-black uppercase tracking-wider text-[var(--bg-primary)] disabled:opacity-50"
            >
              <Download size={14} />
              {isBusy ? 'Hazırlanıyor…' : 'Dışa Aktar'}
              <ChevronDown size={12} />
            </button>
            {exportOpen && (
              <>
                <button
                  type="button"
                  aria-label="Menüyü kapat"
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setExportOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute right-0 top-full z-40 mt-2 w-60 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-1.5 shadow-2xl"
                >
                  <ExportItem
                    icon={<FileText size={14} />}
                    label="PDF (300 DPI)"
                    hint={mode === 'document' ? `${pages.length} sayfa` : 'Görünüm'}
                    onClick={() => {
                      setExportOpen(false);
                      onExportPdf();
                    }}
                  />
                  <ExportItem
                    icon={<FileImage size={14} />}
                    label="PNG görsel"
                    hint="Yüksek çözünürlük"
                    onClick={() => {
                      setExportOpen(false);
                      onExportPng();
                    }}
                  />
                  <ExportItem
                    icon={<FileText size={14} />}
                    label="Word (.docx)"
                    hint="Metin + vektör"
                    onClick={() => {
                      setExportOpen(false);
                      onExportDocx();
                    }}
                  />
                  <ExportItem
                    icon={<FileCode2 size={14} />}
                    label="SVG Vektör (.svg)"
                    hint="Ölçeklenebilir çizim"
                    onClick={() => {
                      setExportOpen(false);
                      onExportSvg();
                    }}
                  />
                  {onPrint && (
                    <ExportItem
                      icon={<Printer size={14} />}
                      label="Yazdır"
                      hint="Tarayıcı baskı önizleme"
                      onClick={() => {
                        setExportOpen(false);
                        onPrint();
                      }}
                    />
                  )}
                  <div className="my-1 h-px bg-[var(--border-color)]" />
                  <ExportItem
                    icon={<FileCode2 size={14} />}
                    label="SVG içe aktar"
                    hint="Düzenlenebilir vektör"
                    onClick={() => {
                      setExportOpen(false);
                      svgInputRef.current?.click();
                    }}
                  />
                  <ExportItem
                    icon={<FileJson size={14} />}
                    label="JSON dışa aktar"
                    hint="Birleşik şema"
                    onClick={() => {
                      setExportOpen(false);
                      onExportJson();
                    }}
                  />
                  <ExportItem
                    icon={<FileJson size={14} />}
                    label="JSON içe aktar"
                    hint="Geri yükle"
                    onClick={() => {
                      setExportOpen(false);
                      jsonInputRef.current?.click();
                    }}
                  />
                </div>
              </>
            )}
          </div>

          <input
            ref={jsonInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="JSON belgesi içe aktar"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportJson(file);
              event.target.value = '';
            }}
          />
          <input
            ref={svgInputRef}
            type="file"
            accept="image/svg+xml,.svg"
            className="hidden"
            aria-label="SVG vektör içe aktar"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImportSvg(file);
              event.target.value = '';
            }}
          />
        </div>
      </div>

      {showMargins && mode === 'document' && (
        <div className="flex flex-wrap items-center gap-2 border-t border-[var(--border-color)] px-2 py-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            Kenar boşluğu (px)
          </span>
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <label key={side} className="flex items-center gap-1 text-[9px] font-bold text-[var(--text-secondary)]">
              {side === 'top' ? 'Üst' : side === 'right' ? 'Sağ' : side === 'bottom' ? 'Alt' : 'Sol'}
              <input
                type="number"
                min={0}
                max={160}
                value={margins[side]}
                onChange={(event) =>
                  onMarginsChange({
                    ...margins,
                    [side]: Math.max(0, Math.min(160, Number(event.target.value) || 0)),
                  })
                }
                className="h-7 w-16 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-1.5 text-[10px] font-bold text-[var(--text-primary)] outline-none"
              />
            </label>
          ))}
        </div>
      )}

      {mode === 'document' && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-color)] px-2 py-1.5">
          <Group label="Metin biçimi">
            <select
              value={headingValue}
              disabled={wordDisabled}
              aria-label="Paragraf stili"
              onChange={(event) => applyHeading(event.target.value)}
              className="h-8 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-1.5 text-[10px] font-bold text-[var(--text-primary)] outline-none disabled:opacity-40"
            >
              <option value="p">Paragraf</option>
              <option value="h1">Başlık 1</option>
              <option value="h2">Başlık 2</option>
              <option value="h3">Başlık 3</option>
            </select>
            <select
              value={currentFontFamily}
              disabled={wordDisabled}
              aria-label="Yazı tipi"
              onChange={(event) =>
                editor?.chain().focus().setFontFamily(event.target.value).run()
              }
              className="h-8 max-w-[130px] rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-1.5 text-[10px] font-bold text-[var(--text-primary)] outline-none disabled:opacity-40"
            >
              {FONT_FAMILIES.map((font) => (
                <option key={font.value} value={font.value}>
                  {font.label}
                </option>
              ))}
            </select>
            <select
              value={currentFontSize}
              disabled={wordDisabled}
              aria-label="Punto"
              onChange={(event) =>
                editor?.chain().focus().setFontSize(`${event.target.value}px`).run()
              }
              className="h-8 w-14 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-1 text-[10px] font-bold text-[var(--text-primary)] outline-none disabled:opacity-40"
            >
              {FONT_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Group>

          <Group label="Vurgu">
            <ToolButton
              label="Kalın (Ctrl+B)"
              active={editor?.isActive('bold')}
              disabled={wordDisabled}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold size={14} />
            </ToolButton>
            <ToolButton
              label="İtalik (Ctrl+I)"
              active={editor?.isActive('italic')}
              disabled={wordDisabled}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic size={14} />
            </ToolButton>
            <ToolButton
              label="Altı çizili (Ctrl+U)"
              active={editor?.isActive('underline')}
              disabled={wordDisabled}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <Underline size={14} />
            </ToolButton>
            <ToolButton
              label="Üstü çizili"
              active={editor?.isActive('strike')}
              disabled={wordDisabled}
              onClick={() => editor?.chain().focus().toggleStrike().run()}
            >
              <Strikethrough size={14} />
            </ToolButton>
            <label
              className="flex h-8 w-9 cursor-pointer items-center justify-center rounded-lg hover:bg-[var(--surface-elevated)]"
              title="Metin rengi"
            >
              <span className="text-[11px] font-black text-[var(--text-secondary)]">A</span>
              <input
                type="color"
                disabled={wordDisabled}
                aria-label="Metin rengi"
                value={(editor?.getAttributes('textStyle').color as string | undefined) ?? '#0f172a'}
                onChange={(event) => editor?.chain().focus().setColor(event.target.value).run()}
                className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
            <label
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg hover:bg-[var(--surface-elevated)]"
              title="Vurgu rengi"
            >
              <span className="text-[11px] font-black text-amber-500">▮</span>
              <input
                type="color"
                disabled={wordDisabled}
                aria-label="Vurgu rengi"
                defaultValue="#fde68a"
                onChange={(event) =>
                  editor?.chain().focus().setBackgroundColor(event.target.value).run()
                }
                className="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
          </Group>

          <Group label="Hizalama">
            {(
              [
                { value: 'left', icon: <AlignLeft size={14} />, label: 'Sola yasla' },
                { value: 'center', icon: <AlignCenter size={14} />, label: 'Ortala' },
                { value: 'right', icon: <AlignRight size={14} />, label: 'Sağa yasla' },
                { value: 'justify', icon: <AlignJustify size={14} />, label: 'İki yana yasla' },
              ] as const
            ).map((entry) => (
              <ToolButton
                key={entry.value}
                label={entry.label}
                active={editor?.isActive({ textAlign: entry.value })}
                disabled={wordDisabled}
                onClick={() => editor?.chain().focus().setTextAlign(entry.value).run()}
              >
                {entry.icon}
              </ToolButton>
            ))}
          </Group>

          <Group label="Listeler ve tablo">
            <ToolButton
              label="Madde listesi"
              active={editor?.isActive('bulletList')}
              disabled={wordDisabled}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
            >
              <List size={14} />
            </ToolButton>
            <ToolButton
              label="Numaralı liste"
              active={editor?.isActive('orderedList')}
              disabled={wordDisabled}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered size={14} />
            </ToolButton>
            <ToolButton
              label="3×3 tablo ekle"
              disabled={wordDisabled}
              onClick={() =>
                editor
                  ?.chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run()
              }
            >
              <TableIcon size={14} />
            </ToolButton>
            <ToolButton
              label="Görsel ekle"
              disabled={wordDisabled}
              onClick={() => imageInputRef.current?.click()}
            >
              <FileImage size={14} />
            </ToolButton>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Görsel seç"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) insertImage(file);
                event.target.value = '';
              }}
            />
          </Group>

          {tableActive && (
            <Group label="Tablo düzenleme">
              <ToolButton
                label="Satır ekle"
                onClick={() => editor?.chain().focus().addRowAfter().run()}
              >
                <Rows3 size={13} />
                <Plus size={10} />
              </ToolButton>
              <ToolButton
                label="Sütun ekle"
                onClick={() => editor?.chain().focus().addColumnAfter().run()}
              >
                <Columns3 size={13} />
                <Plus size={10} />
              </ToolButton>
              <ToolButton
                label="Satırı sil"
                tone="danger"
                onClick={() => editor?.chain().focus().deleteRow().run()}
              >
                <Rows3 size={13} />
                <Minus size={10} />
              </ToolButton>
              <ToolButton
                label="Sütunu sil"
                tone="danger"
                onClick={() => editor?.chain().focus().deleteColumn().run()}
              >
                <Columns3 size={13} />
                <Minus size={10} />
              </ToolButton>
              <ToolButton
                label="Tabloyu sil"
                tone="danger"
                onClick={() => editor?.chain().focus().deleteTable().run()}
              >
                <Trash2 size={13} />
              </ToolButton>
            </Group>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-color)] px-2 py-1.5">
        <Group label="Vektör araçları">
          {DRAW_TOOLS.map((entry) => (
            <ToolButton
              key={entry.id}
              label={entry.label}
              active={tool === entry.id}
              onClick={() => onToolChange(entry.id)}
            >
              {entry.icon}
            </ToolButton>
          ))}
          <ToolButton
            label="Seçimi temizle"
            onClick={() => {
              onToolChange('select');
            }}
          >
            <Eraser size={14} />
          </ToolButton>
          <div className="relative">
            <ToolButton
              label="Pedagojik vektör damgaları"
              active={stampsOpen}
              onClick={() => setStampsOpen((value) => !value)}
            >
              <Shapes size={14} />
              <span className="hidden xl:inline text-[10px]">Damgalar</span>
            </ToolButton>
            {stampsOpen && (
              <>
                <button
                  type="button"
                  aria-label="Damga menüsünü kapat"
                  className="fixed inset-0 z-30 cursor-default"
                  onClick={() => setStampsOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute left-0 top-full z-40 mt-2 grid w-64 grid-cols-1 gap-0.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-1.5 shadow-2xl"
                >
                  {VECTOR_STAMPS.map((stamp) => (
                    <ExportItem
                      key={stamp.id}
                      icon={<Shapes size={13} />}
                      label={stamp.label}
                      hint={stamp.category}
                      onClick={() => {
                        setStampsOpen(false);
                        onInsertStamp(stamp);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          {onInsertVectorImage && (
            <ToolButton
              label="Vektör katmanına görsel ekle"
              onClick={() => vectorImageInputRef.current?.click()}
            >
              <ImagePlus size={14} />
            </ToolButton>
          )}
          {onInsertVectorImage && (
            <input
              ref={vectorImageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="Vektör katmanı için görsel seç"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onInsertVectorImage(file);
                event.target.value = '';
              }}
            />
          )}
        </Group>

        <Group label="Çizim stili">
          <label className="flex items-center gap-1 px-1 text-[9px] font-bold text-[var(--text-muted)]">
            Çizgi
            <input
              type="color"
              aria-label="Çizgi rengi"
              value={vectorStyle.stroke}
              onChange={(event) => onVectorStyleChange({ stroke: event.target.value })}
              className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <label className="flex items-center gap-1 px-1 text-[9px] font-bold text-[var(--text-muted)]">
            Dolgu
            <input
              type="color"
              aria-label="Dolgu rengi"
              value={vectorStyle.fill.startsWith('#') ? vectorStyle.fill : '#4f46e5'}
              onChange={(event) => onVectorStyleChange({ fill: event.target.value })}
              className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
            />
          </label>
          <label className="flex items-center gap-1 px-1 text-[9px] font-bold text-[var(--text-muted)]">
            Kalınlık
            <input
              type="range"
              min={1}
              max={16}
              value={vectorStyle.strokeWidth}
              aria-label="Çizgi kalınlığı"
              onChange={(event) =>
                onVectorStyleChange({ strokeWidth: Number(event.target.value) })
              }
              className="h-1 w-16 accent-[var(--accent-color)]"
            />
            <span className="w-4 text-[9px] font-black text-[var(--text-primary)]">
              {vectorStyle.strokeWidth}
            </span>
          </label>
          <label className="flex items-center gap-1 px-1 text-[9px] font-bold text-[var(--text-muted)]">
            Opaklık
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={vectorStyle.opacity}
              aria-label="Opaklık"
              onChange={(event) => onVectorStyleChange({ opacity: Number(event.target.value) })}
              className="h-1 w-14 accent-[var(--accent-color)]"
            />
          </label>
          <label className="flex items-center gap-1 px-1 text-[9px] font-bold text-[var(--text-muted)]">
            Punto
            <input
              type="number"
              min={8}
              max={96}
              value={vectorStyle.fontSize}
              aria-label="Vektör metin puntosu"
              onChange={(event) =>
                onVectorStyleChange({ fontSize: Math.max(8, Math.min(96, Number(event.target.value) || 16)) })
              }
              className="h-7 w-12 rounded-md border border-[var(--border-color)] bg-[var(--bg-secondary)] px-1 text-[10px] font-bold text-[var(--text-primary)] outline-none"
            />
          </label>
        </Group>
      </div>
    </div>
  );
};

const ExportItem = ({
  icon,
  label,
  hint,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)]"
  >
    <span className="text-[var(--accent-color)]">{icon}</span>
    <span className="min-w-0 flex-1">
      <span className="block text-[10px] font-black">{label}</span>
      {hint && <span className="block text-[8px] text-[var(--text-muted)]">{hint}</span>}
    </span>
  </button>
);

export default TopToolbar;
