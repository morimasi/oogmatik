import React from 'react';
import type { WorksheetData } from '../../types';
import { createBlock } from '../../services/a4EditorService';
import {
  PAGE_TEMPLATES,
  applyPageTemplate,
  sanitizeFileBaseName,
  worksheetToHtml,
} from '../../services/a4StudioService';
import { COMPONENT_DEFINITIONS } from './ComponentLibrary';
import { useA4EditorStore, type A4EditorTab } from '../../store/useA4EditorStore';
import { useToastStore } from '../../store/useToastStore';
import { usePaperSizeStore } from '../../store/usePaperSizeStore';
import { downloadTextFile } from '../../utils/a4ExportUtils';

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: string;
  keywords?: string;
  run: () => void;
}

/**
 * Komut paleti (Ctrl+K) — özellik sayısı arttıkça panelde kaybolmayı önler.
 * Klavye ile tam kullanılabilir: ↑/↓ gez, Enter çalıştır, Esc kapat.
 */
export const CommandPalette = ({
  open,
  onClose,
  worksheetData,
  activityType,
  onOpenTab,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  worksheetData: WorksheetData;
  activityType?: string;
  onOpenTab: (tab: A4EditorTab) => void;
  onSave?: () => void | Promise<void>;
}) => {
  const [query, setQuery] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setQuery('');
    setActiveIndex(0);
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [open]);

  const commands = React.useMemo<Command[]>(() => {
    const store = () => useA4EditorStore.getState();
    const toast = useToastStore.getState();

    const tabCommands: Array<{ tab: A4EditorTab; label: string; icon: string }> = [
      { tab: 'library', label: 'Ekle sekmesi', icon: 'fa-shapes' },
      { tab: 'layers', label: 'Katman sekmesi', icon: 'fa-layer-group' },
      { tab: 'content', label: 'İçerik sekmesi', icon: 'fa-pen-to-square' },
      { tab: 'styling', label: 'Stil sekmesi', icon: 'fa-palette' },
      { tab: 'page', label: 'Sayfa sekmesi', icon: 'fa-file-lines' },
      { tab: 'insights', label: 'Denetim sekmesi', icon: 'fa-shield-heart' },
    ];

    const addCommands: Command[] = COMPONENT_DEFINITIONS.map((definition) => ({
      id: `add-${definition.type}`,
      group: 'Bileşen Ekle',
      label: `${definition.label} ekle`,
      hint: definition.description,
      icon: definition.icon,
      keywords: definition.type,
      run: () => {
        store().addBlock(
          createBlock(definition.type, definition.content),
          store().selectedBlockId ?? null
        );
        toast.success(`${definition.label} eklendi.`);
      },
    }));

    const templateCommands: Command[] = PAGE_TEMPLATES.map((template) => ({
      id: `template-${template.id}`,
      group: 'Sayfa Şablonu',
      label: template.label,
      hint: template.description,
      icon: template.icon,
      run: () => {
        store().applyMutation((data) => applyPageTemplate(data, template.id));
        toast.success(`${template.label} şablonu uygulandı.`);
      },
    }));

    const downloadWord = () => {
      const html = worksheetToHtml(worksheetData, {
        title: worksheetData?.[0]?.title,
        includeAnswers: store().answerKeyMode !== 'off',
      });
      const ok = downloadTextFile(
        html,
        `${sanitizeFileBaseName(worksheetData?.[0]?.title ?? 'bdmind-etkinlik')}.doc`,
        'application/msword;charset=utf-8'
      );
      if (ok) toast.success('Word belgesi indirildi.');
      else toast.error('Dosya oluşturulamadı.');
    };

    const vectorPrint = async () => {
      try {
        document.body.classList.add('a4-vector-print');
        const { forceRenderAllPages, ensurePrintStyle } = await import('../../utils/print/CSSInjector');
        forceRenderAllPages();
        ensurePrintStyle(usePaperSizeStore.getState().paperSize);
        await new Promise((resolve) => window.setTimeout(resolve, 350));
        window.print();
      } catch {
        toast.error('Vektörel yazdırma başlatılamadı.');
      } finally {
        window.setTimeout(() => document.body.classList.remove('a4-vector-print'), 800);
      }
    };

    return [
      ...tabCommands.map((item) => ({
        id: `tab-${item.tab}`,
        group: 'Gezinme',
        label: item.label,
        icon: item.icon,
        keywords: 'sekme panel',
        run: () => onOpenTab(item.tab),
      })),
      ...addCommands,
      ...templateCommands,
      {
        id: 'undo',
        group: 'Düzenleme',
        label: 'Geri al',
        hint: 'Ctrl+Z',
        icon: 'fa-rotate-left',
        run: () => store().undo(),
      },
      {
        id: 'redo',
        group: 'Düzenleme',
        label: 'Yinele',
        hint: 'Ctrl+Shift+Z',
        icon: 'fa-rotate-right',
        run: () => store().redo(),
      },
      {
        id: 'select-all',
        group: 'Düzenleme',
        label: 'Tüm bileşenleri seç',
        hint: 'Ctrl+A',
        icon: 'fa-object-group',
        run: () => {
          const state = store();
          if (!state.bridge) return;
          const data = state.bridge.get();
          const all =
            Array.isArray(data) && data.length
              ? data.flatMap((page) =>
                  (page?.layoutArchitecture?.blocks ?? page?.blocks ?? [])
                    .map((block) => block.id)
                    .filter((id): id is string => typeof id === 'string')
                )
              : [];
          state.selectBlocks(all);
        },
      },
      {
        id: 'clear-selection',
        group: 'Düzenleme',
        label: 'Seçimi bırak',
        hint: 'Esc',
        icon: 'fa-xmark',
        run: () => store().clearSelection(),
      },
      {
        id: 'print-preview',
        group: 'Görünüm',
        label: 'Baskı önizlemesi',
        icon: 'fa-eye',
        run: () => store().setPrintPreview(!store().isPrintPreview),
      },
      {
        id: 'grid',
        group: 'Görünüm',
        label: 'Izgarayı aç/kapat',
        icon: 'fa-border-all',
        run: () => store().setShowGrid(!store().showGrid),
      },
      {
        id: 'safe-area',
        group: 'Görünüm',
        label: 'Güvenli baskı alanını aç/kapat',
        icon: 'fa-vector-square',
        run: () => store().setShowSafeArea(!store().showSafeArea),
      },
      {
        id: 'answer-overlay',
        group: 'Cevap Anahtarı',
        label: 'Cevap rozetlerini göster/gizle',
        icon: 'fa-key',
        run: () =>
          store().setAnswerKeyMode(store().answerKeyMode === 'overlay' ? 'off' : 'overlay'),
      },
      {
        id: 'answer-appendix',
        group: 'Cevap Anahtarı',
        label: 'Cevap anahtarını ayrı sayfaya ekle',
        icon: 'fa-file-circle-plus',
        run: () =>
          store().setAnswerKeyMode(store().answerKeyMode === 'appendix' ? 'off' : 'appendix'),
      },
      {
        id: 'nup',
        group: 'Kağıt Ekonomisi',
        label: 'Yaprak başına 2 sayfa (N-up)',
        icon: 'fa-copy',
        run: () => store().setPrintLayout(store().printLayout === 'nup2' ? 'single' : 'nup2'),
      },
      {
        id: 'cut-lines',
        group: 'Kağıt Ekonomisi',
        label: 'Kesme çizgilerini aç/kapat',
        icon: 'fa-scissors',
        run: () => store().setCutLines(!store().cutLines),
      },
      {
        id: 'vector-print',
        group: 'Çıktı',
        label: 'Vektörel yazdır (metin seçilebilir PDF)',
        hint: 'Tarayıcı baskı motoru',
        icon: 'fa-file-pdf',
        run: () => void vectorPrint(),
      },
      {
        id: 'word',
        group: 'Çıktı',
        label: 'Word belgesi indir (.doc)',
        icon: 'fa-file-word',
        run: downloadWord,
      },
      {
        id: 'save',
        group: 'Çıktı',
        label: 'Arşive kaydet',
        hint: 'Ctrl+S',
        icon: 'fa-floppy-disk',
        run: () => {
          if (!onSave) {
            toast.warning('Bu görünümde kaydetme bağlı değil.');
            return;
          }
          void onSave();
        },
      },
      {
        id: 'insights',
        group: 'Denetim',
        label: 'Üretim denetimini aç',
        hint: 'Okunabilirlik, taşma, sürümler',
        icon: 'fa-shield-heart',
        run: () => onOpenTab('insights'),
      },
    ];
  }, [onOpenTab, onSave, worksheetData]);

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('tr-TR');
    if (!needle) return commands;
    return commands.filter((command) =>
      `${command.group} ${command.label} ${command.hint ?? ''} ${command.keywords ?? ''}`
        .toLocaleLowerCase('tr-TR')
        .includes(needle)
    );
  }, [commands, query]);

  React.useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!open) return null;

  const runCommand = (command?: Command) => {
    if (!command) return;
    onClose();
    command.run();
  };

  return (
    <div
      className="no-print fixed inset-0 z-[90] flex items-start justify-center bg-black/45 px-3 pt-[12vh] backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Komut paleti"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-primary)] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-[var(--border-color)] px-3 py-2.5">
          <i className="fa-solid fa-terminal text-[11px] text-[var(--accent-color)]"></i>
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.preventDefault();
                onClose();
                return;
              }
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((index) => Math.min(index + 1, Math.max(filtered.length - 1, 0)));
                return;
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((index) => Math.max(index - 1, 0));
                return;
              }
              if (event.key === 'Enter') {
                event.preventDefault();
                runCommand(filtered[activeIndex]);
              }
            }}
            placeholder="Komut veya bileşen ara… (ör. tablo, sürüm, cevap)"
            aria-label="Komut ara"
            className="w-full bg-transparent text-[12px] font-semibold outline-none placeholder:text-[var(--text-muted)]"
          />
          <kbd className="rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[8px] font-black text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        <div className="custom-scrollbar max-h-[52vh] overflow-y-auto p-1.5">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-[10px] text-[var(--text-muted)]">
              Eşleşen komut yok. Farklı bir sözcük deneyin.
            </p>
          )}
          {filtered.map((command, index) => (
            <button
              key={command.id}
              type="button"
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => runCommand(command)}
              className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors ${
                index === activeIndex
                  ? 'bg-[var(--accent-muted)] text-[var(--accent-color)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]'
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[9px]">
                <i className={`fa-solid ${command.icon}`}></i>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10px] font-black">{command.label}</span>
                {command.hint && (
                  <span className="block truncate text-[8px] text-[var(--text-muted)]">
                    {command.hint}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {command.group}
              </span>
            </button>
          ))}
        </div>

        <footer className="flex items-center justify-between gap-2 border-t border-[var(--border-color)] bg-[var(--surface-glass)]/40 px-3 py-1.5 text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
          <span>↑ ↓ gez • Enter çalıştır</span>
          <span>{filtered.length} komut</span>
        </footer>
      </div>
    </div>
  );
};
