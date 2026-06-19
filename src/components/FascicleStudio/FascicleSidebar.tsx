import React from 'react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFascicleStore } from '../../store/useFascicleStore';
import { SortableItem } from './SortableItem';
import { Layers, Plus, FileText } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

export const FascicleSidebar: React.FC = () => {
  const { items, reorderItems, removeItem, addItem } = useFascicleStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      reorderItems(oldIndex, newIndex);
    }
  };

  const handleAddSampleItem = () => {
    addItem({
      id: uuidv4(),
      type: 'worksheet',
      difficulty: 'Orta',
      pageCount: 1,
      order: items.length,
      content: { sample: true },
      pedagogicalNote: 'ZPD adaptasyonu için eklenmiş örnek aktivite.'
    });
  };

  const handleAutoSort = async () => {
    toast.loading('AI Sayfaları pedagojik olarak sıralıyor...', { id: 'ai-sort' });
    try {
       const { fascicleAIEngine } = await import('../../services/fascicleAIEngine');
       const newOrderIds = await fascicleAIEngine.autoSortByDifficulty(items);
       
       newOrderIds.forEach((id, index) => {
          const oldIndex = items.findIndex(i => i.id === id);
          if (oldIndex !== -1 && oldIndex !== index) {
             reorderItems(oldIndex, index);
          }
       });
       toast.success('Pedagojik ZPD sıralaması uygulandı!', { id: 'ai-sort' });
    } catch(err) {
       toast.error('Sıralama başarısız oldu.', { id: 'ai-sort' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center uppercase tracking-wider">
          <Layers size={16} className="mr-2 text-blue-400" />
          Fasikül İçeriği ({items.length})
        </h3>
        <button 
          onClick={handleAddSampleItem}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          title="Parça Ekle"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
            <FileText size={32} className="text-slate-600 mb-3" />
            <p className="text-sm text-slate-400 font-medium">Fasikülünüz boş.</p>
            <p className="text-xs text-slate-500 mt-1">Sınav, rapor veya çalışma kağıtlarını buraya sürükleyebilirsiniz.</p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={items.map(i => i.id)}
              strategy={verticalListSortingStrategy}
            >
              {items.map(item => (
                <SortableItem key={item.id} id={item.id} item={item} onRemove={removeItem} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="p-4 bg-slate-950/50 border-t border-white/5">
         <div className="flex justify-between items-center text-xs text-slate-400">
           <span>Toplam Sayfa:</span>
           <span className="font-bold text-white text-sm">{items.reduce((acc, curr) => acc + curr.pageCount, 0)} sf</span>
         </div>
         <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex flex-col items-start">
            <p className="text-[11px] text-blue-300 mb-2 leading-tight">
              💡 <strong>AI Asistan:</strong> Pedagojik ZPD kurallarına göre (Kolaydan Zora) sıralayabilirsiniz.
            </p>
            <button 
               onClick={handleAutoSort}
               disabled={items.length < 2}
               className="text-xs bg-blue-600 hover:bg-blue-500 text-white py-1 px-3 rounded w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
               AI Pedagojik Diziliş Uygula
            </button>
         </div>
      </div>
    </div>
  );
};
