import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { WorksheetBlock } from '../../types';
import { blockTypeLabel } from '../../services/a4EditorService';
import { blockAnswer, inlineTextTarget } from '../../services/a4StudioService';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { BlockRenderer } from './BlockRenderer';

/**
 * A4 düzenindeki tek bir bileşenin sarmalayıcısı.
 * - Düzenleme modunda seçim, sürükleme ve hızlı işlemler (çoğalt/gizle/kilitle/sil)
 * - Bileşen stilini (boşluk, kenarlık, arka plan, saydamlık, yazı rengi) uygular
 * - Gizlenen bileşen baskıda hiç render edilmez, düzenlemede soluk gösterilir
 */
export const SortableBlockItem: React.FC<{
  block: WorksheetBlock;
  idx: number;
  isEditorOpen: boolean;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  children?: React.ReactNode;
}> = ({ block, idx, isEditorOpen, setSelectedBlockId, children }) => {
  const isSelected = useA4EditorStore(
    (state) =>
      !!block.id && (state.selectedBlockIds.includes(block.id) || state.selectedBlockId === block.id)
  );
  const toggleBlockSelection = useA4EditorStore((state) => state.toggleBlockSelection);
  const applyBlockAction = useA4EditorStore((state) => state.applyBlockAction);
  const isPrintPreview = useA4EditorStore((state) => state.isPrintPreview);
  const editingBlockId = useA4EditorStore((state) => state.editingBlockId);
  const setEditingBlockId = useA4EditorStore((state) => state.setEditingBlockId);
  const updateBlockContent = useA4EditorStore((state) => state.updateBlockContent);
  const answerKeyMode = useA4EditorStore((state) => state.answerKeyMode);
  const isSplit = useA4EditorStore((state) =>
    !!block.id && state.diagnostics.splitBlockIds.includes(block.id)
  );
  const isOverflowing = useA4EditorStore((state) =>
    !!block.id && state.diagnostics.overflowBlockIds.includes(block.id)
  );

  const textTarget = React.useMemo(() => inlineTextTarget(block), [block]);
  const isEditing = !!block.id && editingBlockId === block.id && !!textTarget;
  const [draft, setDraft] = React.useState(textTarget?.value ?? '');
  const answer = React.useMemo(() => blockAnswer(block), [block]);

  React.useEffect(() => {
    if (isEditing) setDraft(textTarget?.value ?? '');
  }, [isEditing, textTarget?.value]);

  const commitInlineEdit = React.useCallback(() => {
    if (!block.id || !textTarget) return;
    if (draft !== textTarget.value) {
      updateBlockContent(block.id, { [textTarget.key]: draft }, `inline:${block.id}`);
    }
    setEditingBlockId(null);
  }, [block.id, draft, setEditingBlockId, textTarget, updateBlockContent]);

  const sortableId = block.id || `block-${idx}`;
  const locked = block.locked === true;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    disabled: !isEditorOpen || isPrintPreview || locked,
  });

  if (block.hidden && !isEditorOpen) return null;
  if (block.hidden && isEditorOpen && isPrintPreview) return null;

  const style = block.style ?? {};
  const wrapperStyle: React.CSSProperties & Record<string, string | number | undefined> = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : (style.opacity ?? (block.hidden ? 0.4 : 1)),
    zIndex: isDragging ? 50 : undefined,
    backgroundColor: style.backgroundColor,
    borderRadius: style.borderRadius ? `${style.borderRadius}px` : undefined,
    borderWidth: style.borderWidth ? `${style.borderWidth}px` : undefined,
    borderStyle: style.borderWidth ? 'solid' : undefined,
    borderColor: style.borderWidth ? (style.borderColor ?? '#000000') : undefined,
    padding: style.padding ? `${style.padding}px` : undefined,
    marginTop: style.marginTop ? `${style.marginTop}px` : undefined,
    marginBottom: style.marginBottom ? `${style.marginBottom}px` : undefined,
    // Yerleşimdeki `.worksheet-page *` renk kilidini aşmak için CSS değişkeni kullanılır.
    '--block-text-color': style.color,
  };

  const editorChrome = isEditorOpen && !isPrintPreview;

  return (
    <div
      ref={setNodeRef}
      style={wrapperStyle}
      data-block-id={block.id}
      data-block-type={block.type}
      onClick={(event) => {
        if (!editorChrome || !block.id) return;
        event.stopPropagation();
        if (event.ctrlKey || event.metaKey || event.shiftKey) toggleBlockSelection(block.id);
        else setSelectedBlockId(block.id);
      }}
      onDoubleClick={(event) => {
        if (!editorChrome || !block.id || locked || !textTarget) return;
        event.stopPropagation();
        setSelectedBlockId(block.id);
        setEditingBlockId(block.id);
      }}
      className={`block-container group/block relative transition-shadow duration-150 ${
        editorChrome
          ? `cursor-pointer outline outline-1 outline-offset-2 ${
              isSelected
                ? 'outline-2 outline-[var(--accent-color)] bg-[var(--accent-muted)]'
                : 'outline-transparent hover:outline-[var(--accent-color)]'
            }`
          : ''
      }`}
    >
      {editorChrome && (
        <>
          <span
            className={`no-print pointer-events-none absolute -top-2 left-0 z-20 rounded-t-md px-1.5 py-0.5 text-[6px] font-black uppercase tracking-widest text-white transition-opacity ${
              isSelected ? 'bg-indigo-600 opacity-100' : 'bg-slate-500 opacity-0'
            } group-hover/block:opacity-100`}
          >
            {blockTypeLabel(block.type)}
            {locked && <i className="fa-solid fa-lock ml-1"></i>}
          </span>

          <div className="no-print absolute -top-3 right-0 z-20 flex items-center gap-0.5 rounded-lg border border-zinc-200 bg-white/95 px-0.5 py-0.5 opacity-0 shadow-sm backdrop-blur transition-opacity group-hover/block:opacity-100 max-lg:opacity-100">
            <button
              type="button"
              {...attributes}
              {...listeners}
              disabled={locked}
              title={locked ? 'Bileşen kilitli — önce kilidi açın' : 'Sürükleyerek sırala'}
              aria-label="Bileşeni sürükle"
              className={`flex h-5 w-5 items-center justify-center rounded text-[8px] max-lg:h-7 max-lg:w-7 ${
                locked
                  ? 'cursor-not-allowed text-zinc-300'
                  : 'cursor-grab text-zinc-500 hover:bg-zinc-100 active:cursor-grabbing'
              }`}
            >
              <i className="fa-solid fa-grip-vertical"></i>
            </button>
            <ChromeButton
              icon="fa-arrow-up"
              title="Yukarı taşı"
              onClick={() => block.id && applyBlockAction('move-up', [block.id])}
            />
            <ChromeButton
              icon="fa-arrow-down"
              title="Aşağı taşı"
              onClick={() => block.id && applyBlockAction('move-down', [block.id])}
            />
            <ChromeButton
              icon="fa-clone"
              title="Çoğalt (Ctrl+D)"
              onClick={() => block.id && applyBlockAction('duplicate', [block.id])}
            />
            <ChromeButton
              icon={block.hidden ? 'fa-eye' : 'fa-eye-slash'}
              title={block.hidden ? 'Göster' : 'Gizle (baskıda da gizlenir)'}
              onClick={() => block.id && applyBlockAction(block.hidden ? 'show' : 'hide', [block.id])}
            />
            <ChromeButton
              icon={locked ? 'fa-lock-open' : 'fa-lock'}
              title={locked ? 'Kilidi aç' : 'Kilitle'}
              onClick={() => block.id && applyBlockAction(locked ? 'unlock' : 'lock', [block.id])}
            />
            <ChromeButton
              icon="fa-trash-can"
              title="Sil"
              danger
              onClick={() => block.id && applyBlockAction('delete', [block.id])}
            />
          </div>

          {locked && (
            <span className="no-print pointer-events-none absolute bottom-1 right-1 z-10 rounded bg-white/80 px-1 text-[6px] font-black uppercase tracking-widest text-zinc-400">
              kilitli
            </span>
          )}

          {isSplit && (
            <span
              className="no-print pointer-events-none absolute -top-2 right-0 z-20 rounded bg-amber-500 px-1.5 py-0.5 text-[6px] font-black uppercase tracking-widest text-white"
              title="Bu bileşen iki A4 sayfasına bölünüyor; parçalar aynı anda vurgulanır."
            >
              <i className="fa-solid fa-scissors mr-1"></i>bölünmüş
            </span>
          )}

          {isOverflowing && (
            <span
              className="no-print pointer-events-none absolute -bottom-2 left-0 z-20 rounded bg-rose-500 px-1.5 py-0.5 text-[6px] font-black uppercase tracking-widest text-white"
              title="Ölçülen yükseklik tek A4 sayfasını aşıyor. Denetim sekmesinden küçültün veya bölün."
            >
              <i className="fa-solid fa-arrow-up-from-bracket mr-1"></i>taşıyor
            </span>
          )}

          {block.reviewComment && !block.reviewResolved && (
            <span
              className="no-print pointer-events-none absolute right-1 bottom-1 z-20 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent-color)] text-[7px] text-[var(--bg-primary)]"
              title={block.reviewComment}
            >
              <i className="fa-solid fa-comment"></i>
            </span>
          )}

          {answerKeyMode === 'overlay' && answer && (
            <span className="answer-key-overlay no-print pointer-events-none absolute right-0 bottom-full z-20 mb-1 max-w-[240px] truncate rounded-md border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0.5 text-[6px] font-black uppercase tracking-widest text-emerald-600">
              <i className="fa-solid fa-key mr-1"></i>
              {answer}
            </span>
          )}
        </>
      )}

      {isEditing && textTarget ? (
        <div className="no-print relative z-30 rounded-xl border-2 border-[var(--accent-color)] bg-[var(--bg-paper)] p-1 shadow-lg">
          <textarea
            autoFocus
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commitInlineEdit}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === 'Escape') {
                event.preventDefault();
                setEditingBlockId(null);
              }
              if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                commitInlineEdit();
              }
            }}
            rows={Math.min(10, Math.max(2, draft.split('\n').length + 1))}
            aria-label={textTarget.label}
            className="w-full resize-y bg-transparent px-1.5 py-1 font-[inherit] text-[inherit] leading-[inherit] text-[var(--text-primary)] outline-none"
            style={{ fontFamily: 'inherit' }}
          />
          <div className="flex items-center justify-between gap-2 border-t border-[var(--border-color)] px-1.5 pt-1 text-[7px] font-black uppercase tracking-widest text-[var(--text-muted)]">
            <span>{textTarget.label} • Ctrl+Enter bitir</span>
            <span className="flex gap-1">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={commitInlineEdit}
                className="rounded bg-[var(--accent-color)] px-1.5 py-0.5 text-[7px] font-black text-[var(--bg-primary)]"
              >
                Uygula
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setEditingBlockId(null)}
                className="rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[7px] font-black"
              >
                Vazgeç
              </button>
            </span>
          </div>
        </div>
      ) : block.hidden && editorChrome ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-100/60 py-6 text-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
            <i className="fa-solid fa-eye-slash mr-1"></i> Gizli bileşen — önizleme ve baskıda görünmez
          </p>
        </div>
      ) : (
        children || <BlockRenderer block={block} />
      )}
    </div>
  );
};

const ChromeButton = ({
  icon,
  title,
  onClick,
  danger,
}: {
  icon: string;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={(event) => {
      event.stopPropagation();
      onClick();
    }}
    className={`flex h-5 w-5 items-center justify-center rounded text-[8px] max-lg:h-7 max-lg:w-7 ${
      danger ? 'text-zinc-500 hover:bg-red-50 hover:text-red-500' : 'text-zinc-500 hover:bg-zinc-100'
    }`}
  >
    <i className={`fa-solid ${icon}`}></i>
  </button>
);
