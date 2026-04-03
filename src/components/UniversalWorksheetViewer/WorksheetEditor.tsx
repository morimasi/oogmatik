import React, { useCallback, useRef } from 'react';
import styles from './UniversalWorksheetViewer.module.css';
import type { WorksheetContent, WorksheetContentBlock, WorksheetContentBlockType } from './types/worksheet';

interface WorksheetEditorProps {
  content: WorksheetContent;
  selectedBlockId: string | null;
  onUpdateContent: (content: WorksheetContent, description?: string) => void;
  onAddBlock: (block: Omit<WorksheetContentBlock, 'id'>) => void;
  onUpdateBlock: (id: string, patch: Partial<WorksheetContentBlock>) => void;
  onRemoveBlock: (id: string) => void;
  onMoveBlock: (id: string, direction: 'up' | 'down') => void;
  onSelectBlock: (id: string | null) => void;
}

const BLOCK_TYPE_LABELS: Record<WorksheetContentBlockType, string> = {
  text: 'Metin',
  heading: 'Başlık',
  math: 'Matematik',
  image: 'Görsel',
  table: 'Tablo',
  list: 'Liste',
  divider: 'Ayırıcı',
  blank: 'Boşluk',
};

function BlockToolbar({
  block,
  isFirst,
  isLast,
  onUpdate,
  onRemove,
  onMove,
}: {
  block: WorksheetContentBlock;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (patch: Partial<WorksheetContentBlock>) => void;
  onRemove: () => void;
  onMove: (dir: 'up' | 'down') => void;
}) {
  return (
    <div className={styles.blockToolbar} role="toolbar" aria-label="Blok araçları">
      <button
        className={styles.blockToolbarBtn}
        onClick={() => onMove('up')}
        disabled={isFirst}
        aria-label="Yukarı taşı"
        title="Yukarı taşı"
      >
        ↑
      </button>
      <button
        className={styles.blockToolbarBtn}
        onClick={() => onMove('down')}
        disabled={isLast}
        aria-label="Aşağı taşı"
        title="Aşağı taşı"
      >
        ↓
      </button>
      {block.type === 'heading' && (
        <select
          className={styles.blockToolbarSelect}
          value={block.headingLevel ?? 2}
          onChange={(e) => onUpdate({ headingLevel: parseInt(e.target.value) as 1 | 2 | 3 })}
          aria-label="Başlık seviyesi"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
        </select>
      )}
      <button
        className={`${styles.blockToolbarBtn} ${styles.blockToolbarBtnDanger}`}
        onClick={onRemove}
        aria-label="Bloğu sil"
        title="Sil"
      >
        ✕
      </button>
    </div>
  );
}

function TextBlock({
  block,
  isSelected,
  onUpdate,
  onSelect,
}: {
  block: WorksheetContentBlock;
  isSelected: boolean;
  onUpdate: (patch: Partial<WorksheetContentBlock>) => void;
  onSelect: () => void;
}) {
  return (
    <div
      className={`${styles.block} ${isSelected ? styles.blockSelected : ''}`}
      onClick={onSelect}
    >
      <textarea
        className={styles.blockTextarea}
        value={block.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder="Metin girin..."
        rows={3}
        aria-label="Metin bloğu"
      />
    </div>
  );
}

function HeadingBlock({
  block,
  isSelected,
  onUpdate,
  onSelect,
}: {
  block: WorksheetContentBlock;
  isSelected: boolean;
  onUpdate: (patch: Partial<WorksheetContentBlock>) => void;
  onSelect: () => void;
}) {
  const level = block.headingLevel ?? 2;
  return (
    <div
      className={`${styles.block} ${isSelected ? styles.blockSelected : ''}`}
      onClick={onSelect}
    >
      <input
        className={`${styles.blockHeadingInput} ${styles[`heading${level}`]}`}
        value={block.content}
        onChange={(e) => onUpdate({ content: e.target.value })}
        placeholder={`Başlık H${level}...`}
        aria-label={`H${level} başlık`}
      />
    </div>
  );
}

function MathBlock({
  block,
  isSelected,
  onUpdate,
  onSelect,
}: {
  block: WorksheetContentBlock;
  isSelected: boolean;
  onUpdate: (patch: Partial<WorksheetContentBlock>) => void;
  onSelect: () => void;
}) {
  return (
    <div
      className={`${styles.block} ${isSelected ? styles.blockSelected : ''}`}
      onClick={onSelect}
    >
      <label className={styles.blockLabel}>LaTeX:</label>
      <input
        className={styles.blockMathInput}
        value={block.mathRaw ?? block.content}
        onChange={(e) => onUpdate({ mathRaw: e.target.value, content: e.target.value })}
        placeholder="Örn: x^2 + y^2 = r^2"
        aria-label="LaTeX matematik girişi"
      />
      <div className={styles.blockMathPreview} aria-label="Matematik önizleme">
        <code>{block.mathRaw ?? block.content}</code>
      </div>
    </div>
  );
}

function ListBlock({
  block,
  isSelected,
  onUpdate,
  onSelect,
}: {
  block: WorksheetContentBlock;
  isSelected: boolean;
  onUpdate: (patch: Partial<WorksheetContentBlock>) => void;
  onSelect: () => void;
}) {
  const items = block.listItems ?? [''];

  const updateItem = (idx: number, value: string) => {
    const newItems = [...items];
    newItems[idx] = value;
    onUpdate({ listItems: newItems });
  };

  const addItem = () => onUpdate({ listItems: [...items, ''] });
  const removeItem = (idx: number) =>
    onUpdate({ listItems: items.filter((_, i) => i !== idx) });

  return (
    <div
      className={`${styles.block} ${isSelected ? styles.blockSelected : ''}`}
      onClick={onSelect}
    >
      {items.map((item, idx) => (
        <div key={idx} className={styles.listItemRow}>
          <span className={styles.listBullet}>•</span>
          <input
            className={styles.listItemInput}
            value={item}
            onChange={(e) => updateItem(idx, e.target.value)}
            placeholder="Liste öğesi..."
            aria-label={`Liste öğesi ${idx + 1}`}
          />
          <button
            className={styles.listItemRemove}
            onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
            aria-label="Öğeyi kaldır"
          >
            ✕
          </button>
        </div>
      ))}
      <button className={styles.addListItemBtn} onClick={(e) => { e.stopPropagation(); addItem(); }}>
        + Öğe Ekle
      </button>
    </div>
  );
}

export const WorksheetEditor: React.FC<WorksheetEditorProps> = React.memo(({
  content,
  selectedBlockId,
  onAddBlock,
  onUpdateBlock,
  onRemoveBlock,
  onMoveBlock,
  onSelectBlock,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleAddBlock = useCallback((type: WorksheetContentBlockType) => {
    const defaults: Partial<WorksheetContentBlock> = {};
    if (type === 'heading') defaults.headingLevel = 2;
    if (type === 'list') defaults.listItems = [''];
    onAddBlock({ type, content: '', ...defaults });
  }, [onAddBlock]);

  const renderBlock = (block: WorksheetContentBlock, idx: number) => {
    const isSelected = selectedBlockId === block.id;
    const isFirst = idx === 0;
    const isLast = idx === content.blocks.length - 1;

    const commonProps = {
      block,
      isSelected,
      onUpdate: (patch: Partial<WorksheetContentBlock>) => onUpdateBlock(block.id, patch),
      onSelect: () => onSelectBlock(block.id),
    };

    return (
      <div key={block.id} className={styles.blockWrapper}>
        {isSelected && (
          <BlockToolbar
            block={block}
            isFirst={isFirst}
            isLast={isLast}
            onUpdate={(patch) => onUpdateBlock(block.id, patch)}
            onRemove={() => onRemoveBlock(block.id)}
            onMove={(dir) => onMoveBlock(block.id, dir)}
          />
        )}
        {block.type === 'text' && <TextBlock {...commonProps} />}
        {block.type === 'heading' && <HeadingBlock {...commonProps} />}
        {block.type === 'math' && <MathBlock {...commonProps} />}
        {block.type === 'list' && <ListBlock {...commonProps} />}
        {block.type === 'divider' && (
          <div
            className={`${styles.block} ${isSelected ? styles.blockSelected : ''}`}
            onClick={() => onSelectBlock(block.id)}
          >
            <hr className={styles.dividerBlock} aria-label="Ayırıcı" />
          </div>
        )}
        {block.type === 'image' && (
          <div
            className={`${styles.block} ${isSelected ? styles.blockSelected : ''}`}
            onClick={() => onSelectBlock(block.id)}
          >
            {block.imageUrl ? (
              <img src={block.imageUrl} alt={block.content || 'Görsel'} className={styles.imageBlock} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <span>🖼️ Görsel URL'si</span>
                <input
                  className={styles.imageUrlInput}
                  value={block.content}
                  onChange={(e) => onUpdateBlock(block.id, { content: e.target.value, imageUrl: e.target.value })}
                  placeholder="https://..."
                  aria-label="Görsel URL"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={styles.worksheetEditor}
      role="region"
      aria-label="Çalışma kağıdı düzenleyici"
      onClick={(e) => {
        if (e.target === containerRef.current) onSelectBlock(null);
      }}
    >
      <div className={styles.blocksContainer}>
        {content.blocks.map((block, idx) => renderBlock(block, idx))}
      </div>

      <div className={styles.addBlockBar} role="toolbar" aria-label="Blok ekle">
        <span className={styles.addBlockLabel}>+ Blok Ekle:</span>
        {(Object.keys(BLOCK_TYPE_LABELS) as WorksheetContentBlockType[]).map((type) => (
          <button
            key={type}
            className={styles.addBlockBtn}
            onClick={() => handleAddBlock(type)}
            aria-label={`${BLOCK_TYPE_LABELS[type]} bloğu ekle`}
          >
            {BLOCK_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
});

WorksheetEditor.displayName = 'WorksheetEditor';
