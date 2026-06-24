import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockRenderer } from './BlockRenderer';

export const SortableBlockItem: React.FC<{
  block: any;
  idx: number;
  isEditorOpen: boolean;
  selectedBlockId: string | null;
  setSelectedBlockId: (id: string | null) => void;
  children?: React.ReactNode;
}> = ({ block, idx, isEditorOpen, selectedBlockId, setSelectedBlockId, children }) => {
  const sortableId = block.id || `block-${idx}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    disabled: !isEditorOpen,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        if (isEditorOpen && block.id) {
          e.stopPropagation();
          setSelectedBlockId(block.id);
        }
      }}
      className={`block-container transition-all duration-200 ${isEditorOpen
        ? 'cursor-pointer hover:ring-2 hover:ring-indigo-300 hover:shadow-md relative group/block'
        : ''
        } ${isEditorOpen && selectedBlockId === block.id
          ? 'ring-2 ring-indigo-500 shadow-lg bg-indigo-50/10'
          : ''
        }`}
    >
      {isEditorOpen && (
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover/block:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-white shadow rounded p-1 z-10 no-print"
          title="Sürükle"
        >
          <i className="fa-solid fa-grip-vertical text-xs text-zinc-400"></i>
        </button>
      )}
      {children || <BlockRenderer block={block} />}
    </div>
  );
};
