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
      style={style}
      className={`relative flex items-center p-3 mb-2 rounded-xl border border-white/10 bg-slate-800/80 backdrop-blur-sm shadow-sm
        ${isDragging ? 'opacity-50 z-50 shadow-xl border-blue-500/50 scale-[1.02]' : 'hover:border-white/20 hover:bg-slate-800'}
        transition-colors`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-1.5 text-slate-500 hover:text-slate-300 mr-2 rounded hover:bg-white/5"
      >
        <GripVertical size={18} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
           <p className="text-sm font-medium text-white truncate max-w-[180px]">
             {(item.content as any)?.title || (item.content as any)?.wizardData?.goal?.topic || formatTitle(item.type)}
           </p>
           <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
             {item.difficulty}
           </span>
        </div>
        <p className="text-xs text-slate-400 truncate">
          {item.pedagogicalNote || 'Pedagojik Not Eklenmemiş'}
        </p>
      </div>

      <button 
        onClick={() => onRemove(item.id)}
        className="ml-3 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
        title="Sayfayı Çıkar"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};
