import type { WorksheetData, WorksheetBlock } from '../../types';
import {
  blockPreview,
  blockTypeIcon,
  blockTypeLabel,
  flattenBlocks,
} from '../../services/a4EditorService';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { EmptyState, MiniButton, Section } from './controls';

/**
 * Katmanlar paneli — sayfadaki her bileşeni tek tek listeler.
 * Seçim, sıralama, gizleme, kilitleme, çoğaltma ve silme buradan yönetilir.
 */
export const LayersPanel = ({
  worksheetData,
  setEditorTab,
}: {
  worksheetData: WorksheetData;
  setEditorTab: () => void;
}) => {
  const selectedBlockIds = useA4EditorStore((state) => state.selectedBlockIds);
  const setSelectedBlockId = useA4EditorStore((state) => state.setSelectedBlockId);
  const applyBlockAction = useA4EditorStore((state) => state.applyBlockAction);

  const entries = flattenBlocks(worksheetData);
  const pages = Array.isArray(worksheetData) ? worksheetData.length : worksheetData ? 1 : 0;

  if (entries.length === 0) {
    return (
      <EmptyState
        icon="fa-layer-group"
        title="Katman Yok"
        description="Bu etkinlik blok tabanlı bir düzene sahip değil. Sayfa ayarları ve çıktı seçenekleri kullanılabilir; bileşen düzenleme için bloklu etkinlikler gerekir."
      >
        <MiniButton icon="fa-sliders" label="Sayfa Ayarları" title="Sayfa ayarlarına git" onClick={setEditorTab} />
      </EmptyState>
    );
  }

  return (
    <div className="space-y-3 p-3">
      <Section
        title="Sayfa Bileşenleri"
        icon="fa-layer-group"
        description={`${entries.length} bileşen • ${pages} sayfa. Ctrl/Shift ile tıklayarak çoklu seçim yapabilirsiniz.`}
        action={
          <MiniButton
            icon="fa-check-double"
            title="Tüm bileşenleri seç"
            onClick={() =>
              useA4EditorStore
                .getState()
                .selectBlocks(entries.map((entry) => entry.block.id).filter((id): id is string => !!id))
            }
          />
        }
      >
        <ul className="space-y-1.5" role="listbox" aria-label="Sayfa bileşenleri" aria-multiselectable>
          {entries.map((entry) => {
            const block: WorksheetBlock = entry.block;
            const selected = !!block.id && selectedBlockIds.includes(block.id);
            return (
              <li key={block.id ?? `${entry.pageIndex}-${entry.index}`}>
                <div
                  role="option"
                  aria-selected={selected}
                  tabIndex={0}
                  onClick={(event) =>
                    block.id
                      ? setSelectedBlockId(block.id, event.ctrlKey || event.metaKey || event.shiftKey)
                      : undefined
                  }
                  onKeyDown={(event) => {
                    if ((event.key === 'Enter' || event.key === ' ') && block.id) {
                      event.preventDefault();
                      setSelectedBlockId(block.id, event.ctrlKey || event.metaKey || event.shiftKey);
                    }
                  }}
                  className={`group flex cursor-pointer items-center gap-2 rounded-xl border px-2 py-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent-color)] ${
                    selected
                      ? 'border-[var(--accent-color)] bg-[var(--accent-muted)]'
                      : 'border-[var(--border-color)] bg-[var(--bg-paper)] hover:border-[var(--accent-color)]'
                  } ${block.hidden ? 'opacity-55' : ''}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-secondary)] text-[9px] text-[var(--text-secondary)]">
                    <i className={`fa-solid ${blockTypeIcon(block.type)}`}></i>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1">
                      <span className="truncate text-[10px] font-black text-[var(--text-primary)]">
                        {blockTypeLabel(block.type)}
                      </span>
                      <span className="shrink-0 rounded bg-[var(--bg-secondary)] px-1 text-[8px] font-bold text-[var(--text-muted)]">
                        S{entry.pageIndex + 1}
                      </span>
                      {block.hidden && (
                        <i className="fa-solid fa-eye-slash text-[8px] text-[var(--text-muted)]" title="Gizli"></i>
                      )}
                      {block.locked && (
                        <i className="fa-solid fa-lock text-[8px] text-[var(--text-muted)]" title="Kilitli"></i>
                      )}
                    </span>
                    <span className="block truncate text-[9px] text-[var(--text-muted)]">
                      {blockPreview(block) || 'İçerik yok'}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <RowAction
                      icon="fa-arrow-up"
                      title="Yukarı taşı"
                      onClick={() => block.id && applyBlockAction('move-up', [block.id])}
                      disabled={entry.index === 0}
                    />
                    <RowAction
                      icon="fa-arrow-down"
                      title="Aşağı taşı"
                      onClick={() => block.id && applyBlockAction('move-down', [block.id])}
                      disabled={entry.index >= entries.filter((item) => item.pageIndex === entry.pageIndex).length - 1}
                    />
                    <RowAction
                      icon={block.hidden ? 'fa-eye' : 'fa-eye-slash'}
                      title={block.hidden ? 'Göster' : 'Gizle'}
                      onClick={() => block.id && applyBlockAction(block.hidden ? 'show' : 'hide', [block.id])}
                    />
                    <RowAction
                      icon={block.locked ? 'fa-lock-open' : 'fa-lock'}
                      title={block.locked ? 'Kilidi aç' : 'Kilitle'}
                      onClick={() => block.id && applyBlockAction(block.locked ? 'unlock' : 'lock', [block.id])}
                    />
                    <RowAction
                      icon="fa-clone"
                      title="Çoğalt"
                      onClick={() => block.id && applyBlockAction('duplicate', [block.id])}
                    />
                    <RowAction
                      icon="fa-trash-can"
                      title="Sil"
                      danger
                      onClick={() => block.id && applyBlockAction('delete', [block.id])}
                    />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </Section>

      {selectedBlockIds.length > 1 && (
        <Section title={`Toplu İşlem (${selectedBlockIds.length})`} icon="fa-object-group">
          <div className="flex flex-wrap gap-1.5">
            <MiniButton icon="fa-clone" label="Çoğalt" title="Seçili bileşenleri çoğalt" onClick={() => applyBlockAction('duplicate', selectedBlockIds)} />
            <MiniButton icon="fa-eye-slash" label="Gizle" title="Seçili bileşenleri gizle" onClick={() => applyBlockAction('hide', selectedBlockIds)} />
            <MiniButton icon="fa-eye" label="Göster" title="Seçili bileşenleri göster" onClick={() => applyBlockAction('show', selectedBlockIds)} />
            <MiniButton icon="fa-lock" label="Kilitle" title="Seçili bileşenleri kilitle" onClick={() => applyBlockAction('lock', selectedBlockIds)} />
            <MiniButton icon="fa-lock-open" label="Aç" title="Seçili bileşenlerin kilidini aç" onClick={() => applyBlockAction('unlock', selectedBlockIds)} />
            <MiniButton icon="fa-eraser" label="Stili Sıfırla" title="Seçili bileşenlerin stilini sıfırla" onClick={() => applyBlockAction('reset-style', selectedBlockIds)} />
            <MiniButton icon="fa-trash-can" label="Sil" title="Seçili bileşenleri sil" danger onClick={() => applyBlockAction('delete', selectedBlockIds)} />
          </div>
        </Section>
      )}

      <p className="px-1 text-[9px] leading-relaxed text-[var(--text-muted)]">
        <i className="fa-solid fa-circle-info mr-1"></i>
        Akış (flow) düzeni korunur: bileşenler sayfa taşmasını engellemek için sıralı yerleşir,
        serbest konumlandırma (x/y) yazdırma bütünlüğü için kullanılmaz. Sıralamayı sayfa üzerinde
        sürükleyerek de değiştirebilirsiniz.
      </p>
    </div>
  );
};

const RowAction = ({
  icon,
  title,
  onClick,
  disabled,
  danger,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className={`flex h-6 w-6 items-center justify-center rounded-md border border-transparent text-[9px] transition-colors disabled:opacity-25 ${
      danger
        ? 'text-[var(--text-muted)] hover:border-red-400 hover:text-red-500'
        : 'text-[var(--text-muted)] hover:border-[var(--border-color)] hover:text-[var(--accent-color)]'
    }`}
  >
    <i className={`fa-solid ${icon}`}></i>
  </button>
);
