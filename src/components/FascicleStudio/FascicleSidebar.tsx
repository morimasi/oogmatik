import React, { useState } from 'react';
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
import { Layers, Plus, FileText, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { FascicleCoverSettingsModal } from './FascicleCoverSettingsModal';

export const FascicleSidebar: React.FC = () => {
  const { items, reorderItems, removeItem, addItem } = useFascicleStore();
  const [isCoverSettingsOpen, setIsCoverSettingsOpen] = useState(false);

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
       
       const sortedItems = newOrderIds.map(id => items.find(i => i.id === id)).filter(Boolean) as typeof items;
       
       if (sortedItems.length === items.length) {
         useFascicleStore.getState().setItems(sortedItems);
       }
       toast.success('Pedagojik ZPD sıralaması uygulandı!', { id: 'ai-sort' });
    } catch(err) {
       toast.error('Sıralama başarısız oldu.', { id: 'ai-sort' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)]">
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center uppercase tracking-wider">
          <Layers size={16} className="mr-2" style={{ color: 'var(--accent-color)' }} />
          Fasikül İçeriği ({items.length})
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsCoverSettingsOpen(true)}
            className="studio-icon-btn p-1.5 rounded-lg"
            title="Premium Kapak Ayarları"
          >
            <ImageIcon size={16} style={{ color: 'var(--accent-color)' }} />
          </button>
          <button 
            onClick={handleAddSampleItem}
            className="studio-icon-btn p-1.5 rounded-lg"
            title="Parça Ekle"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <FascicleCoverSettingsModal 
        isOpen={isCoverSettingsOpen} 
        onClose={() => setIsCoverSettingsOpen(false)} 
      />

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-premium)] bg-[var(--bg-paper)]">
            <FileText size={32} className="text-[var(--text-muted)] mb-3 opacity-50" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">Fasikülünüz boş.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Sınav, rapor veya çalışma kağıtlarını buraya sürükleyebilirsiniz.</p>
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

      <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
         <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
           <span>Toplam Sayfa:</span>
           <span className="font-bold text-[var(--text-primary)] text-sm">{items.reduce((acc, curr) => acc + curr.pageCount, 0)} sf</span>
         </div>
         <div className="mt-3 p-3 glass-layer-1 rounded-[var(--radius-premium)] flex flex-col items-start">
            <p className="text-[11px] text-[var(--text-secondary)] mb-2 leading-tight">
              <span style={{ color: 'var(--accent-color)' }}>AI Asistan:</span> Pedagojik ZPD kurallarına göre (Kolaydan Zora) sıralayabilirsiniz.
            </p>
            <button 
               onClick={handleAutoSort}
               disabled={items.length < 2}
               className="w-full font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center transition-all text-xs disabled:opacity-50"
               style={{
                 background: 'var(--accent-color)',
                 color: '#ffffff'
               }}
            >
               <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
               Oto ZPD Sırala
            </button>
         </div>
      </div>
    </div>
  );
};
