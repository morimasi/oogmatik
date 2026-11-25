import React from 'react';
import type { StyleSettings, WorksheetBlock, WorksheetData } from '../../types';
import { blockTypeLabel, flattenBlocks } from '../../services/a4EditorService';
import { useA4EditorStore, type A4EditorTab } from '../../store/useA4EditorStore';
import { ComponentLibrary } from './ComponentLibrary';
import { ContentPanel } from './ContentPanel';
import { LayersPanel } from './LayersPanel';
import { PagePanel } from './PagePanel';
import { StylePanel } from './StylePanel';
import { InsightsPanel } from './InsightsPanel';
import { CommandPalette } from './CommandPalette';
import { MiniButton } from './controls';

const DRAFT_KEY = 'bdmind.a4draft.v1';
const DRAFT_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

interface DraftPayload {
  ts: number;
  data: WorksheetData;
}

const TABS: Array<{ id: A4EditorTab; label: string; icon: string; hint: string }> = [
  { id: 'library', label: 'Ekle', icon: 'fa-shapes', hint: 'Bileşen kütüphanesi' },
  { id: 'layers', label: 'Katman', icon: 'fa-layer-group', hint: 'Tüm bileşenleri yönet' },
  { id: 'content', label: 'İçerik', icon: 'fa-pen-to-square', hint: 'Seçili bileşenin içeriği' },
  { id: 'styling', label: 'Stil', icon: 'fa-palette', hint: 'Tipografi, renk ve kutu' },
  { id: 'page', label: 'Sayfa', icon: 'fa-file-lines', hint: 'A4 sayfa geneli ayarlar' },
  { id: 'insights', label: 'Denetim', icon: 'fa-shield-heart', hint: 'Kalite, taşma, sürüm, çıktı' },
];

export const A4EditorPanel = ({
  worksheetData,
  styleSettings,
  onStyleChange,
  onSave,
  activityType,
}: {
  worksheetData: WorksheetData;
  styleSettings?: StyleSettings;
  onStyleChange?: (settings: StyleSettings) => void;
  onSave?: () => void | Promise<void>;
  activityType?: string;
}) => {
  const {
    isEditorOpen,
    setEditorOpen,
    editorTab,
    setEditorTab,
    selectedBlockId,
    selectedBlockIds,
    clearSelection,
    undo,
    redo,
    history,
    future,
    dirty,
    lastSavedAt,
    isPrintPreview,
    setPrintPreview,
    markSaved,
    commandPaletteOpen,
    setCommandPaletteOpen,
    diagnostics,
    editingBlockId,
  } = useA4EditorStore();

  const [draft, setDraft] = React.useState<DraftPayload | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const applyMutation = useA4EditorStore((state) => state.applyMutation);

  const entries = React.useMemo(() => flattenBlocks(worksheetData), [worksheetData]);
  const pages = React.useMemo(
    () => (Array.isArray(worksheetData) ? worksheetData : worksheetData ? [worksheetData] : []),
    [worksheetData]
  );
  const blockPages = pages.filter((page) => page.layoutArchitecture || page.blocks);

  const selectedBlock = React.useMemo<WorksheetBlock | undefined>(() => {
    if (!selectedBlockId) return undefined;
    return entries.find((entry) => entry.block.id === selectedBlockId)?.block;
  }, [entries, selectedBlockId]);

  const draftKey = `${DRAFT_KEY}:${activityType ?? 'genel'}`;

  const handleSave = React.useCallback(async () => {
    if (!onSave || isSaving) return;
    setIsSaving(true);
    try {
      await onSave();
      markSaved();
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        /* storage kapalı olabilir */
      }
      setDraft(null);
    } finally {
      setIsSaving(false);
    }
  }, [draftKey, isSaving, markSaved, onSave]);

  // Taslak okuma: panel açıldığında son otomatik taslağı öner.
  React.useEffect(() => {
    if (!isEditorOpen) return;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) {
        setDraft(null);
        return;
      }
      const parsed = JSON.parse(raw) as DraftPayload;
      if (!parsed?.data || Date.now() - parsed.ts > DRAFT_MAX_AGE_MS) {
        setDraft(null);
        return;
      }
      setDraft(parsed);
    } catch {
      setDraft(null);
    }
  }, [draftKey, isEditorOpen]);

  // Otomatik taslak yazımı: veri kaybını önler, kaydetmeyi zorunlu kılmaz.
  React.useEffect(() => {
    if (!isEditorOpen || !worksheetData) return;
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({ ts: Date.now(), data: worksheetData } satisfies DraftPayload)
        );
      } catch {
        /* kota dolu olabilir */
      }
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [draftKey, isEditorOpen, worksheetData]);

  // Klavye kısayolları: yalnızca panel açıkken ve metin alanı dışında.
  React.useEffect(() => {
    if (!isEditorOpen) return;
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
      const mod = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (mod && key === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(!useA4EditorStore.getState().commandPaletteOpen);
        return;
      }
      if (mod && key === 's') {
        event.preventDefault();
        void handleSave();
        return;
      }
      if (isTyping || editingBlockId) return;

      if (mod && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && key === 'y') {
        event.preventDefault();
        redo();
        return;
      }
      if (mod && key === 'd' && selectedBlockIds.length) {
        event.preventDefault();
        useA4EditorStore.getState().applyBlockAction('duplicate', selectedBlockIds);
        return;
      }
      if (mod && key === 'p') {
        event.preventDefault();
        setPrintPreview(!useA4EditorStore.getState().isPrintPreview);
        return;
      }
      if (mod && key === 'a') {
        event.preventDefault();
        const ids = entries
          .map((entry) => entry.block.id)
          .filter((id): id is string => typeof id === 'string');
        useA4EditorStore.getState().selectBlocks(ids);
        return;
      }
      if (key === 'escape') {
        if (isPrintPreview) setPrintPreview(false);
        else clearSelection();
        return;
      }
      if ((key === 'delete' || key === 'backspace') && selectedBlockIds.length) {
        event.preventDefault();
        useA4EditorStore.getState().applyBlockAction('delete', selectedBlockIds);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    clearSelection,
    editingBlockId,
    entries,
    handleSave,
    isEditorOpen,
    isPrintPreview,
    redo,
    selectedBlockIds,
    setCommandPaletteOpen,
    setPrintPreview,
    undo,
  ]);

  if (!isEditorOpen) return null;

  const restoreDraft = () => {
    if (!draft?.data) return;
    applyMutation(() => draft.data);
    setDraft(null);
  };

  const dismissDraft = () => {
    setDraft(null);
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      /* yoksay */
    }
  };

  const savedLabel = dirty
    ? 'Kaydedilmedi'
    : lastSavedAt
      ? 'Kaydedildi'
      : 'Değişiklik yok';

  return (
    <aside
      className="no-print relative z-40 flex h-full w-[min(92vw,352px)] shrink-0 flex-col border-l border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-primary)] shadow-[-14px_0_40px_rgba(0,0,0,0.18)] animate-in slide-in-from-right duration-300 xl:w-[368px] max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-50 max-lg:h-[72vh] max-lg:w-full max-lg:rounded-t-3xl max-lg:border-l-0 max-lg:border-t max-lg:shadow-[0_-18px_50px_rgba(0,0,0,0.28)]"
      aria-label="A4 tasarımcısı paneli"
    >
      <div className="mx-auto mt-1.5 hidden h-1 w-10 shrink-0 rounded-full bg-[var(--border-color)] max-lg:block" aria-hidden="true" />
      {/* ÜST BAŞLIK */}
      <header className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] bg-[var(--surface-glass)]/50 px-3 py-2.5 backdrop-blur-md">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-muted)] text-[var(--accent-color)]">
            <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-[11px] font-black uppercase tracking-[0.16em] text-[var(--text-primary)]">
              A4 Tasarımcısı
            </h2>
            <p className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  dirty ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              ></span>
              {savedLabel}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <MiniButton
            icon="fa-terminal"
            title="Komut paleti (Ctrl+K)"
            onClick={() => setCommandPaletteOpen(true)}
          />
          <MiniButton
            icon="fa-rotate-left"
            title="Geri al (Ctrl+Z)"
            onClick={() => undo()}
            disabled={history.length === 0}
          />
          <MiniButton
            icon="fa-rotate-right"
            title="Yinele (Ctrl+Shift+Z)"
            onClick={() => redo()}
            disabled={future.length === 0}
          />
          <MiniButton
            icon="fa-floppy-disk"
            title="Kaydet (Ctrl+S)"
            onClick={() => void handleSave()}
            disabled={!onSave || isSaving}
            active={dirty}
          />
          <MiniButton
            icon="fa-xmark"
            title="A4 tasarımcısını kapat (Esc)"
            onClick={() => {
              setEditorOpen(false);
              clearSelection();
            }}
          />
        </div>
      </header>

      {/* SEKMELER */}
      <nav
        className="grid grid-cols-6 border-b border-[var(--border-color)] bg-[var(--bg-paper)]"
        role="tablist"
        aria-label="A4 tasarımcısı sekmeleri"
      >
        {TABS.map((tab) => {
          const active = editorTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              title={tab.hint}
              onClick={() => setEditorTab(tab.id)}
              className={`flex flex-col items-center gap-1 border-b-2 px-1 py-2 text-[8px] font-black uppercase tracking-wider transition-colors ${
                active
                  ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--accent-color)]'
                  : 'border-transparent text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-secondary)]'
              }`}
            >
              <i className={`fa-solid ${tab.icon} text-[11px]`}></i>
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* SEÇİM / BASKI ÖNİZLEME ŞERİDİ */}
      {isPrintPreview ? (
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] bg-[var(--accent-muted)] px-3 py-1.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)]">
            <i className="fa-solid fa-print mr-1"></i> Baskı önizleme
          </span>
          <MiniButton
            icon="fa-pen-ruler"
            label="Düzenlemeye Dön"
            title="Düzenleme görünümüne dön"
            onClick={() => setPrintPreview(false)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 border-b border-[var(--border-color)] bg-[var(--surface-glass)]/30 px-3 py-1.5">
          <div className="min-w-0">
            <p className="truncate text-[9px] font-bold text-[var(--text-secondary)]">
              {selectedBlock
                ? `${blockTypeLabel(selectedBlock.type)}${
                    selectedBlockIds.length > 1 ? ` +${selectedBlockIds.length - 1}` : ''
                  }`
                : `${entries.length} bileşen • ${blockPages.length || pages.length} sayfa`}
            </p>
            <p className="truncate text-[8px] text-[var(--text-muted)]">
              {selectedBlock
                ? selectedBlock.locked
                  ? 'Kilitli — sürüklenemez'
                  : 'Sayfada seçili • çift tıkla: yerinde düzenle'
                : diagnostics.overflowBlockIds.length || diagnostics.splitBlockIds.length
                  ? `${diagnostics.splitBlockIds.length} bölünme • ${diagnostics.overflowBlockIds.length} taşma`
                  : 'Düzenlemek için bir bileşene tıklayın'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {selectedBlockIds.length > 0 && (
              <MiniButton icon="fa-xmark" label="Seçimi Bırak" title="Seçimi temizle" onClick={clearSelection} />
            )}
            <MiniButton
              icon="fa-eye"
              title="Baskı önizlemesi (düzenleme çerçeveleri gizlenir)"
              onClick={() => setPrintPreview(true)}
            />
          </div>
        </div>
      )}

      {/* TASLAK UYARISI */}
      {draft && (
        <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2">
          <i className="fa-solid fa-clock-rotate-left mt-0.5 text-[10px] text-amber-500"></i>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold text-amber-600 dark:text-amber-400">
              Otomatik taslak bulundu
            </p>
            <p className="text-[8px] text-[var(--text-muted)]">
              {new Date(draft.ts).toLocaleString('tr-TR')} • bu oturumda kaydedilmedi
            </p>
            <div className="mt-1 flex gap-1.5">
              <MiniButton icon="fa-upload" label="Geri Yükle" title="Taslağı geri yükle" onClick={restoreDraft} />
              <MiniButton icon="fa-xmark" label="Yoksay" title="Taslağı sil" onClick={dismissDraft} />
            </div>
          </div>
        </div>
      )}

      {/* İÇERİK */}
      <div className="custom-scrollbar flex-1 overflow-y-auto bg-[var(--bg-primary)]/40">
        {editorTab === 'library' && (
          <ComponentLibrary
            canAddBlocks={blockPages.length > 0}
            afterId={selectedBlockId}
            onOpenLayers={() => setEditorTab('layers')}
            onOpenPage={() => setEditorTab('page')}
          />
        )}
        {editorTab === 'layers' && (
          <LayersPanel worksheetData={worksheetData} setEditorTab={() => setEditorTab('page')} />
        )}
        {editorTab === 'content' && (
          <ContentPanel selectedBlock={selectedBlock} selectedCount={Math.max(1, selectedBlockIds.length)} />
        )}
        {editorTab === 'styling' && (
          <StylePanel
            selectedBlock={selectedBlock}
            selectedIds={selectedBlockIds}
            worksheetData={worksheetData}
          />
        )}
        {editorTab === 'page' && (
          <PagePanel
            worksheetData={worksheetData}
            styleSettings={
              styleSettings ??
              ({ orientation: 'portrait', margin: 5, columns: 1 } as unknown as StyleSettings)
            }
            onStyleChange={onStyleChange}
          />
        )}
        {editorTab === 'insights' && (
          <InsightsPanel
            worksheetData={worksheetData}
            styleSettings={
              styleSettings ??
              ({ orientation: 'portrait', margin: 5, columns: 1 } as unknown as StyleSettings)
            }
            onStyleChange={onStyleChange}
            activityType={activityType}
          />
        )}
      </div>

      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        worksheetData={worksheetData}
        activityType={activityType}
        onOpenTab={setEditorTab}
        onSave={onSave}
      />

      {/* ALT KISAYOL ŞERİDİ */}
      <footer className="flex items-center justify-between gap-2 border-t border-[var(--border-color)] bg-[var(--surface-glass)]/40 px-3 py-1.5 text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        <span>Ctrl+K komut</span>
        <span>Ctrl+S kaydet</span>
        <span>Ctrl+Z geri al</span>
      </footer>
    </aside>
  );
};
