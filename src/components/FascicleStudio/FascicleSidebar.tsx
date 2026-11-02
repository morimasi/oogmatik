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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useFascicleStore } from '../../store/useFascicleStore';
import { SortableItem } from './SortableItem';
import { Layers, FileText, Image as ImageIcon, Sparkles, ArrowUpDown, BookOpen, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { FascicleCoverSettingsModal } from './FascicleCoverSettingsModal';
import { FascicleActivityPicker } from './FascicleActivityPicker';
import { FascicleTemplatesModal } from './FascicleTemplatesModal';
import { FascicleItem } from '../../types/fascicle';
import { GeneratorOptions } from '../../types/core';
import { logError } from '../../utils/logger';
import { fascicleAIEngine } from '../../services/fascicleAIEngine';
import { getFasciclePageCount } from '../../utils/fascicleContentNormalizer';

export const FascicleSidebar: React.FC = () => {
  const { items, reorderItems, removeItem, setItems, updateItem, metadata } = useFascicleStore();
  const [isCoverSettingsOpen, setIsCoverSettingsOpen] = useState(false);
  const [isActivityPickerOpen, setIsActivityPickerOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);

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
          logError(aiError instanceof Error ? aiError : String(aiError), { context: `Regeneration AI failed for ${item.type}` });
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
      const prevContent = (item.content as Record<string, any>) || {};
      updateItem(item.id, {
        content: {
          data: content,
          title: result?.title || prevContent.title || item.type,
          instruction: result?.instruction || prevContent.instruction || '',
          pedagogicalNote: result?.pedagogicalNote || prevContent.pedagogicalNote || '',
          generatedAt: Date.now()
        },
      });

      toast.success(`${item.type} başarıyla yeniden üretildi!`, { id: `regen-${item.id}` });
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { context: `Regeneration failed for ${item.type}` });
      toast.error(`Yeniden üretim başarısız: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`, { id: `regen-${item.id}` });
    } finally {
      setRegeneratingId(null);
    }
  }, [metadata, updateItem]);

  // AI ile ZPD Kolaydan Zora Akıllı Sıralama
  const handleAutoSort = useCallback(async () => {
    if (items.length < 2) {
      toast('Sıralama için en az 2 etkinlik olmalıdır.');
      return;
    }
    setIsSorting(true);
    const toastId = toast.loading('Pedagojik ZPD analizi yapılıyor (Kolaydan Zora)...');
    try {
      const orderedIds = await fascicleAIEngine.autoSortByDifficulty(items);
      const sortedMap = new Map(items.map(i => [i.id, i]));
      const sortedItems: FascicleItem[] = [];

      orderedIds.forEach((id, idx) => {
        const item = sortedMap.get(id);
        if (item) {
          sortedItems.push({ ...item, order: idx });
        }
      });

      // Eksik kalan varsa sonuna ekle
      items.forEach(item => {
        if (!sortedItems.some(s => s.id === item.id)) {
          sortedItems.push({ ...item, order: sortedItems.length });
        }
      });

      setItems(sortedItems);
      toast.success('Fasikül başarıyla kolaydan zora sıralandı!', { id: toastId });
    } catch (e) {
      toast.error('Akıllı sıralama yapılamadı.', { id: toastId });
    } finally {
      setIsSorting(false);
    }
  }, [items, setItems]);

  // Gerçek A4 sayfa sayısı hesabı (getFasciclePageCount ile)
  const totalActualPages = items.reduce((acc, curr) => acc + getFasciclePageCount(curr), 0);

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)]">
      {/* Üst Başlık & Araçlar */}
      <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center uppercase tracking-wider">
          <Layers size={16} className="mr-2" style={{ color: 'var(--accent-color)' }} />
          Fasikül İçeriği ({items.length})
        </h3>
        <div className="flex items-center gap-1">
          {/* Hazır Uzman Paketleri */}
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="studio-icon-btn p-1.5 rounded-lg text-amber-500 hover:bg-amber-500/10"
            title="Hazır Uzman Fasikül Paketleri"
            aria-label="Hazır Uzman Fasikül Paketleri"
          >
            <BookOpen size={16} />
          </button>

          {/* AI ile Kolaydan Zora Sırala */}
          {items.length >= 2 && (
            <button
              onClick={handleAutoSort}
              disabled={isSorting}
              className="studio-icon-btn p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-50"
              title="AI ile Pedagojik Sırala (Kolaydan Zora ZPD)"
              aria-label="AI ile Pedagojik Sırala"
            >
              {isSorting ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpDown size={16} />}
            </button>
          )}

          {/* Kapak Ayarları */}
          <button
            onClick={() => setIsCoverSettingsOpen(true)}
            className="studio-icon-btn p-1.5 rounded-lg"
            title="Premium Kapak Ayarları"
            aria-label="Premium Kapak Ayarları"
          >
            <ImageIcon size={16} style={{ color: 'var(--accent-color)' }} />
          </button>

          {/* Etkinlik Havuzundan Ekle */}
          <button
            onClick={() => setIsActivityPickerOpen(true)}
            className="studio-icon-btn p-1.5 rounded-lg"
            title="Etkinlik Havuzundan Ekle"
            aria-label="Etkinlik Havuzundan Ekle"
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

      <FascicleTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
      />

      {/* Sürüklenebilir Liste */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-center px-4 border-2 border-dashed border-[var(--border-color)] rounded-[var(--radius-premium)] bg-[var(--bg-paper)]">
            <FileText size={32} className="text-[var(--text-muted)] mb-3 opacity-50" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">Fasikülünüz henüz boş.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-3">Hazır uzman paketlerini yükleyebilir veya tek tek etkinlik seçebilirsiniz.</p>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-[220px]">
              <button
                onClick={() => setIsTemplatesModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-amber-700 bg-amber-100 hover:bg-amber-200"
              >
                <BookOpen size={13} />
                Hazır Paket Yükle
              </button>
              <button
                onClick={() => setIsActivityPickerOpen(true)}
                className="w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-white shadow-sm"
                style={{ background: 'var(--accent-color)' }}
              >
                <Sparkles size={13} />
                Etkinlik Seç
              </button>
            </div>
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

      {/* Alt Bilgi & Aksiyon */}
      <div className="p-4 bg-[var(--bg-secondary)] border-t border-[var(--border-color)]">
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
          <span>Toplam İçerik Sayfası:</span>
          <span className="font-bold text-[var(--text-primary)] text-sm">{totalActualPages} sf</span>
        </div>
        <div className="mt-3 p-3 glass-layer-1 rounded-[var(--radius-premium)] flex flex-col items-start">
          <p className="text-[11px] text-[var(--text-secondary)] mb-2 leading-tight">
            <span style={{ color: 'var(--accent-color)' }}>Nöro-Pedagojik İpucu:</span> Güven inşası için ilk sayfayı her zaman "Kolay" zorlukta tutun.
          </p>
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => setIsTemplatesModalOpen(true)}
              className="font-bold py-1.5 px-2 rounded-lg flex items-center justify-center transition-all text-xs gap-1 border border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
            >
              <BookOpen size={13} className="text-amber-500" />
              Paketler
            </button>
            <button
              onClick={() => setIsActivityPickerOpen(true)}
              className="font-bold py-1.5 px-2 rounded-lg flex items-center justify-center transition-all text-xs gap-1 text-white shadow-sm"
              style={{
                background: 'var(--accent-color)'
              }}
            >
              <Sparkles size={13} />
              Etkinlik Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
