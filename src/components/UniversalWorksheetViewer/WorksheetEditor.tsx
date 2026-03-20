import React, { useCallback, useRef, KeyboardEvent } from 'react';
import type { WorksheetContent, WorksheetBlock, TextBlock, BlankBlock } from './types/worksheet';
import type { UseWorksheetStateReturn } from './types/worksheet';
import styles from './UniversalWorksheetViewer.module.css';

interface WorksheetEditorProps {
  worksheetState: UseWorksheetStateReturn;
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

// ── Block Editor Components ───────────────────────────────────────────────────

interface TextBlockEditorProps {
  block: TextBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<TextBlock>) => void;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function TextBlockEditor({ block, isSelected, onUpdate, onSelect, onDelete, onMoveUp, onMoveDown }: TextBlockEditorProps) {
  const Tag = block.type === 'heading' ? (`h${block.level ?? 1}` as 'h1' | 'h2' | 'h3') : 'p';

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Delete' && e.ctrlKey) { e.preventDefault(); onDelete(); }
    if (e.key === 'ArrowUp' && e.altKey) { e.preventDefault(); onMoveUp(); }
    if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); onMoveDown(); }
  };

  return (
    <div
      className={`${styles.editorBlock} ${isSelected ? styles.editorBlockSelected : ''}`}
      onClick={onSelect}
      role="group"
      aria-label={block.type === 'heading' ? `Başlık bloğu` : 'Metin bloğu'}
    >
      {isSelected && (
        <div className={styles.blockToolbar} role="toolbar" aria-label="Blok araçları">
          <button
            className={styles.blockToolbarBtn}
            onClick={(e) => { e.stopPropagation(); onUpdate({ bold: !block.bold }); }}
            aria-label="Kalın"
            aria-pressed={block.bold}
            title="Kalın (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            className={styles.blockToolbarBtn}
            onClick={(e) => { e.stopPropagation(); onUpdate({ italic: !block.italic }); }}
            aria-label="İtalik"
            aria-pressed={block.italic}
            title="İtalik (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            className={styles.blockToolbarBtn}
            onClick={(e) => { e.stopPropagation(); onUpdate({ underline: !block.underline }); }}
            aria-label="Altı Çizili"
            aria-pressed={block.underline}
            title="Altı Çizili (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <span className={styles.blockToolbarSep} />
          <button
            className={styles.blockToolbarBtn}
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            aria-label="Yukarı Taşı"
            title="Yukarı Taşı (Alt+↑)"
          >↑</button>
          <button
            className={styles.blockToolbarBtn}
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            aria-label="Aşağı Taşı"
            title="Aşağı Taşı (Alt+↓)"
          >↓</button>
          <span className={styles.blockToolbarSep} />
          <button
            className={`${styles.blockToolbarBtn} ${styles.blockToolbarBtnDanger}`}
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            aria-label="Bloğu Sil"
            title="Sil (Ctrl+Delete)"
          >✕</button>
        </div>
      )}
      <Tag
        contentEditable
        suppressContentEditableWarning
        className={styles.editableText}
        style={{
          fontWeight: block.bold ? 'bold' : undefined,
          fontStyle: block.italic ? 'italic' : undefined,
          textDecoration: block.underline ? 'underline' : undefined,
        }}
        onBlur={(e) => onUpdate({ content: e.currentTarget.textContent ?? '' })}
        onKeyDown={handleKeyDown}
        aria-label={block.type === 'heading' ? 'Başlık metni' : 'İçerik metni'}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
}

interface BlankBlockEditorProps {
  block: BlankBlock;
  isSelected: boolean;
  onUpdate: (updates: Partial<BlankBlock>) => void;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function BlankBlockEditor({ block, isSelected, onUpdate, onSelect, onDelete, onMoveUp, onMoveDown }: BlankBlockEditorProps) {
  return (
    <div
      className={`${styles.editorBlock} ${isSelected ? styles.editorBlockSelected : ''}`}
      onClick={onSelect}
      role="group"
      aria-label="Boş alan bloğu"
    >
      {isSelected && (
        <div className={styles.blockToolbar} role="toolbar" aria-label="Blok araçları">
          <label className={styles.blockToolbarLabel}>
            Satır sayısı:
            <input
              type="number"
              min={1}
              max={20}
              value={block.lines}
              onChange={(e) => onUpdate({ lines: parseInt(e.target.value, 10) || 1 })}
              className={styles.blockToolbarInput}
              aria-label="Satır sayısı"
            />
          </label>
          <label className={styles.blockToolbarLabel}>
            Etiket:
            <input
              type="text"
              value={block.label ?? ''}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className={styles.blockToolbarInput}
              aria-label="Alan etiketi"
            />
          </label>
          <span className={styles.blockToolbarSep} />
          <button className={styles.blockToolbarBtn} onClick={(e) => { e.stopPropagation(); onMoveUp(); }} aria-label="Yukarı Taşı">↑</button>
          <button className={styles.blockToolbarBtn} onClick={(e) => { e.stopPropagation(); onMoveDown(); }} aria-label="Aşağı Taşı">↓</button>
          <span className={styles.blockToolbarSep} />
          <button className={`${styles.blockToolbarBtn} ${styles.blockToolbarBtnDanger}`} onClick={(e) => { e.stopPropagation(); onDelete(); }} aria-label="Sil">✕</button>
        </div>
      )}
      {block.label && <span className={styles.blankLabel}>{block.label}</span>}
      <div className={styles.blankLines}>
        {Array.from({ length: block.lines }).map((_, i) => (
          <div key={i} className={styles.blankLine} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}

// ── Add Block Toolbar ─────────────────────────────────────────────────────────

interface AddBlockToolbarProps {
  onAdd: (block: WorksheetBlock) => void;
}

function AddBlockToolbar({ onAdd }: AddBlockToolbarProps) {
  const addText = () => onAdd({ id: makeId(), type: 'text', content: 'Yeni metin bloğu...' });
  const addHeading = () => onAdd({ id: makeId(), type: 'heading', content: 'Yeni Başlık', level: 2 });
  const addBlank = () => onAdd({ id: makeId(), type: 'blank', lines: 4, label: '' });
  const addDivider = () => onAdd({ id: makeId(), type: 'divider' });

  return (
    <div className={styles.addBlockToolbar} role="toolbar" aria-label="Blok ekle">
      <span className={styles.addBlockLabel}>Blok Ekle:</span>
      <button className={styles.addBlockBtn} onClick={addHeading} aria-label="Başlık ekle" title="Başlık ekle">
        <span aria-hidden="true">H</span> Başlık
      </button>
      <button className={styles.addBlockBtn} onClick={addText} aria-label="Metin ekle" title="Metin ekle">
        <span aria-hidden="true">¶</span> Metin
      </button>
      <button className={styles.addBlockBtn} onClick={addBlank} aria-label="Boş alan ekle" title="Boş alan ekle">
        <span aria-hidden="true">_</span> Boş Alan
      </button>
      <button className={styles.addBlockBtn} onClick={addDivider} aria-label="Ayırıcı ekle" title="Ayırıcı ekle">
        <span aria-hidden="true">—</span> Ayırıcı
      </button>
    </div>
  );
}

// ── Main WorksheetEditor ──────────────────────────────────────────────────────

export function WorksheetEditor({ worksheetState }: WorksheetEditorProps) {
  const { state, addBlock, updateBlock, removeBlock, moveBlock, selectBlock, updateContent } = worksheetState;
  const { document: doc, selectedBlockId } = state;
  const { content } = doc;
  const editorRef = useRef<HTMLDivElement>(null);

  const handleBlockUpdate = useCallback(
    (id: string, updates: Partial<WorksheetBlock>) => {
      updateBlock(id, updates);
    },
    [updateBlock],
  );

  const renderBlock = (block: WorksheetBlock) => {
    const isSelected = selectedBlockId === block.id;
    const commonProps = {
      isSelected,
      onSelect: () => selectBlock(block.id),
      onDelete: () => removeBlock(block.id),
      onMoveUp: () => moveBlock(block.id, 'up'),
      onMoveDown: () => moveBlock(block.id, 'down'),
    };

    switch (block.type) {
      case 'text':
      case 'heading':
        return (
          <TextBlockEditor
            key={block.id}
            block={block}
            onUpdate={(u) => handleBlockUpdate(block.id, u)}
            {...commonProps}
          />
        );
      case 'blank':
        return (
          <BlankBlockEditor
            key={block.id}
            block={block}
            onUpdate={(u) => handleBlockUpdate(block.id, u)}
            {...commonProps}
          />
        );
      case 'divider':
        return (
          <div
            key={block.id}
            className={`${styles.editorBlock} ${styles.dividerBlock} ${isSelected ? styles.editorBlockSelected : ''}`}
            onClick={() => selectBlock(block.id)}
            role="separator"
            aria-label="Ayırıcı"
          >
            <hr className={styles.dividerLine} />
            {isSelected && (
              <div className={styles.blockToolbar}>
                <button
                  className={`${styles.blockToolbarBtn} ${styles.blockToolbarBtnDanger}`}
                  onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
                  aria-label="Ayırıcıyı Sil"
                >✕</button>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className={styles.editorPane} aria-label="Çalışma sayfası editörü">
      <header className={styles.editorHeader}>
        <div className={styles.editorMetaRow}>
          <input
            type="text"
            className={styles.titleInput}
            value={doc.meta.title}
            onChange={(e) => {
              const updated = { ...doc, meta: { ...doc.meta, title: e.target.value } };
              worksheetState.setDocument(updated);
            }}
            placeholder="Çalışma sayfası başlığı..."
            aria-label="Başlık"
          />
        </div>
        <div className={styles.editorMetaRow}>
          <input
            type="text"
            className={styles.metaInput}
            value={doc.meta.subject}
            onChange={(e) => {
              const updated = { ...doc, meta: { ...doc.meta, subject: e.target.value } };
              worksheetState.setDocument(updated);
            }}
            placeholder="Ders..."
            aria-label="Ders"
          />
          <input
            type="text"
            className={styles.metaInput}
            value={doc.meta.grade}
            onChange={(e) => {
              const updated = { ...doc, meta: { ...doc.meta, grade: e.target.value } };
              worksheetState.setDocument(updated);
            }}
            placeholder="Sınıf..."
            aria-label="Sınıf"
          />
        </div>
        <textarea
          className={styles.instructionInput}
          value={content.instructionText}
          onChange={(e) => updateContent({ instructionText: e.target.value })}
          placeholder="Talimat metni..."
          rows={2}
          aria-label="Talimat"
        />
      </header>

      <div
        ref={editorRef}
        className={styles.blocksContainer}
        role="list"
        aria-label="İçerik blokları"
        onClick={(e) => {
          if (e.target === editorRef.current) selectBlock(null);
        }}
      >
        {content.blocks.length === 0 ? (
          <div className={styles.emptyEditor} role="status">
            Başlamak için aşağıdan bir blok ekleyin.
          </div>
        ) : (
          content.blocks.map((block) => (
            <div key={block.id} role="listitem">
              {renderBlock(block)}
            </div>
          ))
        )}
      </div>

      <AddBlockToolbar onAdd={addBlock} />

      {state.isDirty && (
        <div className={styles.dirtyIndicator} role="status" aria-live="polite">
          {state.isSaving ? 'Kaydediliyor...' : 'Kaydedilmemiş değişiklikler'}
        </div>
      )}
      {state.lastSavedAt && !state.isDirty && (
        <div className={styles.savedIndicator} role="status" aria-live="polite">
          Son kaydedilme: {new Date(state.lastSavedAt).toLocaleTimeString('tr-TR')}
        </div>
      )}
    </section>
  );
}
