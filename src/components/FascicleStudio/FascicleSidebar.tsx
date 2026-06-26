import React, { useState, useCallback } from 'react';
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
import { Layers, Plus, FileText, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';
import { FascicleCoverSettingsModal } from './FascicleCoverSettingsModal';
import { FascicleActivityPicker } from './FascicleActivityPicker';
import { FascicleItem } from '../../types/fascicle';
import { GeneratorOptions } from '../../types/core';
import { logError } from '../../utils/logger';

export const FascicleSidebar: React.FC = () => {
  const { items, reorderItems, removeItem, addItem, updateItem, metadata } = useFascicleStore();
  const [isCoverSettingsOpen, setIsCoverSettingsOpen] = useState(false);
  const [isActivityPickerOpen, setIsActivityPickerOpen] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

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

  const handleRegenerate = useCallback(async (item: FascicleItem) => {
    setRegeneratingId(item.id);
    toast.loading(`${item.type} yeniden üretiliyor...`, { id: `regen-${item.id}` });
    try {
      const module = await import('../../services/generators/registry');
      const mapping = await module.getGeneratorMapping(item.type as any);
      if (!mapping) throw new Error(`${item.type} için generator bulunamadı`);

      const options: GeneratorOptions = {
        mode: 'ai',
        difficulty: item.difficulty === 'Kolay' ? 'Başlangıç' : item.difficulty === 'Zor' ? 'Zor' : 'Orta',
        topic: metadata.title || 'Genel',
        variant: `v${Date.now()}`,
        itemCount: 8,
      };

      let result: any;
      if (mapping.ai) {
        try {
          result = await mapping.ai(options);
        } catch (aiError) {
          logError(`Regeneration AI failed for ${item.type}:`, aiError);
          if (mapping.offline) {
            result = await mapping.offline(options);
          } else {
            throw aiError;
          }
        }
      } else if (mapping.offline) {
        result = await mapping.offline(options);
      } else {
        throw new Error(`${item.type} için generator bulunamadı`);
      }

      const content = Array.isArray(result) ? result : [result];
      updateItem(item.id, {
        content: { data: content, title: result?.title || '', generatedAt: Date.now() },
        pedagogicalNote: result?.pedagogicalNote || item.pedagogicalNote,
      });

      toast.success(`${item.type} başarıyla yeniden üretildi!`, { id: `regen-${item.id}` });
    } catch (error) {
      logError(`Regeneration failed for ${item.type}:`, error);
      toast.error(`Yeniden üretim başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, { id: `regen-${item.id}` });
    } finally {
      setRegeneratingId(null);
    }
  }, [metadata, updateItem]);

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
            onClick={() => setIsActivityPickerOpen(true)}
            className="studio-icon-btn p-1.5 rounded-lg"
            title="Etkinlik Havuzundan Ekle"
            style={{ color: 'var(--accent-color)' }}
          >
            <Sparkles size={16} />
          </button>
        </div>
      </div>

      <FascicleCoverSettingsModal
        isOpen={isCoverSettingsOpen}
        onClose={() => setIsCoverSettingsOpen(false)}
      />

      <FascicleActivityPicker
        isOpen={isActivityPickerOpen}
        onClose={() => setIsActivityPickerOpen(false)}
      />

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4 border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-premium)] bg-[var(--bg-paper)]">
            <FileText size={32} className="text-[var(--text-muted)] mb-3 opacity-50" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">Fasikülünüz boş.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Etkinlik havuzundan aktivite seçin veya sürükleyin.</p>
            <button
              onClick={() => setIsActivityPickerOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all"
              style={{ background: 'var(--accent-color)', color: '#ffffff' }}
            >
              <Sparkles size={14} />
              Etkinlik Ekle
            </button>
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
                <SortableItem
                  key={item.id}
                  id={item.id}
                  item={item}
                  onRemove={removeItem}
                  onRegenerate={handleRegenerate}
                />
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
              <span style={{ color: 'var(--accent-color)' }}>AI Asistan:</span> Etkinlik havuzundan seçim yapın, içerik otomatik üretilip eklenecek.
            </p>
            <button
               onClick={() => setIsActivityPickerOpen(true)}
               className="w-full font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center transition-all text-xs gap-2"
               style={{
                 background: 'var(--accent-color)',
                 color: '#ffffff'
               }}
            >
               <Sparkles size={14} />
               Etkinlik Ekle & Üret
            </button>
         </div>
      </div>
    </div>
  );
};
