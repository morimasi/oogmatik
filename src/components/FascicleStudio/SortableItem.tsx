import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { FascicleItem } from '../../types/fascicle';
import { ActivityType } from '../../types/activity';

const formatTitle = (type: string) => {
  if (!type) return 'İsimsiz İçerik';
  
  const titles: Record<string, string> = {
    [ActivityType.SINAV]: 'Türkçe Sınavı',
    [ActivityType.MAT_SINAV]: 'Matematik Sınavı',
    [ActivityType.MATH_STUDIO]: 'Matematik Etkinliği',
    [ActivityType.SUPER_STUDIO]: 'Süper Türkçe',
    [ActivityType.KELIME_CUMLE]: 'Kelime-Cümle Stüdyosu',
    [ActivityType.CURRICULUM]: 'Eğitim Planı',
    [ActivityType.ACTIVITY_STUDIO]: 'Ultra Etkinlik',
    [ActivityType.SARI_KITAP_STUDIO]: 'Sarı Kitap Okuma',
    'worksheet': 'Çalışma Kağıdı',
    'reading': 'Okuma Parçası'
  };

  if (titles[type]) return titles[type];
  
  // Fallback: HECE_PARKURU -> Hece Parkuru
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

interface SortableItemProps {
  id: string;
  item: FascicleItem;
  onRemove: (id: string) => void;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, item, onRemove }) => {
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

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderColor: isDragging ? 'var(--accent-color)' : undefined,
        boxShadow: isDragging ? '0 0 30px var(--accent-muted), 0 4px 16px rgba(0,0,0,0.3)' : undefined
      }}
      className={`relative flex items-center p-3 mb-2 rounded-[var(--radius-premium)] border border-[var(--border-color)] bg-[var(--bg-paper)]/80 shadow-sm
        ${isDragging ? 'opacity-50 z-50 scale-[1.02]' : 'hover:border-[var(--border-color)] hover:bg-[var(--bg-paper)]'}
        transition-all`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] mr-2 rounded hover:bg-[var(--surface-glass)]"
      >
        <GripVertical size={18} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
           <p className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[180px]">
             {(item.content as any)?.title || (item.content as any)?.wizardData?.goal?.topic || formatTitle(item.type)}
           </p>
           <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
             style={{
               backgroundColor: 'var(--accent-muted)',
               color: 'var(--accent-color)'
             }}
           >
             {item.difficulty}
           </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] truncate">
          {item.pedagogicalNote || 'Pedagojik Not Eklenmemiş'}
        </p>
      </div>

      <button 
        onClick={() => onRemove(item.id)}
        className="studio-icon-btn ml-3 p-1.5 rounded-lg"
        title="Sayfayı Çıkar"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
