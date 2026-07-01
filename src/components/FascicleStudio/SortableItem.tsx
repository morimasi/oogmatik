import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { FascicleItem } from '../../types/fascicle';
import { useFascicleStore } from '../../store/useFascicleStore';

const formatTitle = (type: string) => {
  if (!type) return 'İsimsiz İçerik';
  return type.split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

interface SortableItemProps {
  id: string;
  item: FascicleItem;
  onRemove: (id: string) => void;
  onRegenerate: (item: FascicleItem) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, item, onRemove, onRegenerate }) => {
  const { expandedItemId, toggleExpandItem } = useFascicleStore();
  const isExpanded = expandedItemId === id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contentData = (item.content as any)?.data;
  const contentTitle = (item.content as any)?.title || (item.content as any)?.wizardData?.goal?.topic || formatTitle(item.type);
  const hasError = (item.content as any)?.error;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: isDragging ? 'var(--accent-color)' : isExpanded ? 'var(--accent-muted)' : undefined,
        boxShadow: isDragging ? '0 0 30px var(--accent-muted), 0 4px 16px rgba(0,0,0,0.3)' : undefined
      }}
      className={`relative flex flex-col mb-2 rounded-[var(--radius-premium)] border border-[var(--border-color)] bg-[var(--bg-paper)]/80 shadow-sm
        ${isDragging ? 'opacity-50 z-50 scale-[1.02]' : 'hover:border-[var(--border-color)]'}
        transition-all`}
    >
      {/* Main row - always visible */}
      <div className="flex items-center p-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] mr-2 rounded hover:bg-[var(--surface-glass)]"
        >
          <GripVertical size={18} />
        </div>

        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => toggleExpandItem(id)}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 min-w-0">
              {isExpanded ? <ChevronDown size={14} className="shrink-0 text-[var(--text-muted)]" /> : <ChevronRight size={14} className="shrink-0 text-[var(--text-muted)]" />}
              <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[160px]">
                {contentTitle}
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ml-2"
              style={{
                backgroundColor: hasError ? 'rgba(239,68,68,0.15)' : 'var(--accent-muted)',
                color: hasError ? '#ef4444' : 'var(--accent-color)'
              }}
            >
              {hasError ? 'Hata' : item.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRegenerate(item); }}
            className="studio-icon-btn p-1.5 rounded-lg text-[var(--text-muted)] hover:text-emerald-400"
            title="Yeniden Üret (Varyasyon)"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="studio-icon-btn p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400"
            title="Fasikülden Kaldır"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expanded content area */}
      {isExpanded && (
        <div className="border-t border-[var(--border-color)] bg-[var(--bg-secondary)]/30 p-3 space-y-2">
          {/* Content preview */}
          <div className="text-xs text-[var(--text-secondary)] space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
            {contentData ? (
              Array.isArray(contentData) ? (
                contentData.slice(0, 3).map((d: any, i: number) => (
                  <div key={i} className="p-2 bg-[var(--bg-paper)] rounded-lg mb-1">
                    <span className="font-semibold text-[var(--text-primary)]">{d.title || d.instruction || `Adım ${i + 1}`}</span>

                  </div>
                ))
              ) : (
                <div className="p-2 bg-[var(--bg-paper)] rounded-lg">
                  <span className="text-[var(--text-muted)]">İçerik önizleme: {typeof contentData === 'string' ? contentData.slice(0, 200) : JSON.stringify(contentData).slice(0, 200)}</span>
                </div>
              )
            ) : (
              <div className="p-2 bg-[var(--bg-paper)] rounded-lg text-[var(--text-muted)]">
                {hasError ? '⚠ Üretim başarısız. Yeniden üretmeyi deneyin.' : 'İçerik yükleniyor...'}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onRegenerate(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-700/30"
            >
              <RefreshCw size={13} />
              Yeniden Üret
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-700/30"
            >
              <Trash2 size={13} />
              Kaldır
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
