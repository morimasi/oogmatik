import React, { useState, useCallback, useMemo } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../../constants';
import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { logError, logInfo, logWarn } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { X, Loader2, Sparkles, Search, Layers } from 'lucide-react';
import toast from 'react-hot-toast';

interface FascicleActivityPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FascicleActivityPicker: React.FC<FascicleActivityPickerProps> = ({ isOpen, onClose }) => {
  const { addItem, items, metadata } = useFascicleStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(ACTIVITY_CATEGORIES[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleAddActivity = useCallback(async (type: ActivityType) => {
    setGeneratingId(type);
    const def = ACTIVITIES.find(a => a.id === type);
    const toastId = toast.loading(`${def?.title || type} üretiliyor...`);

    try {
      const module = await import('../../services/generators/registry');
      const mapping = await module.getGeneratorMapping(type);
      if (!mapping) throw new Error(`${type} için generator bulunamadı`);

      const options: GeneratorOptions = {
        mode: 'ai',
        difficulty: metadata.targetAgeGroup === '5-7' ? 'Başlangıç' : metadata.targetAgeGroup === '8-10' ? 'Orta' : 'Zor',
        topic: metadata.title || 'Genel',
        itemCount: 8,
        worksheetCount: 1,
      };

      let result: any;
      if (mapping.ai) {
        try {
          result = await mapping.ai(options);
        } catch (aiError) {
          logWarn(`[Fascicle] AI generator failed for ${type}, trying offline:`, aiError instanceof Error ? { message: aiError.message } : { error: String(aiError) });
          if (mapping.offline) {
            result = await mapping.offline(options);
          } else {
            throw aiError;
          }
        }
      } else if (mapping.offline) {
        result = await mapping.offline(options);
      } else {
        throw new Error(`${type} için hiçbir generator bulunamadı`);
      }

      const content = Array.isArray(result) ? result : [result];
      const title = (result?.title) || def?.title || type;
      const instruction = result?.instruction || def?.description || 'Aşağıdaki yönergeleri takip ederek etkinliği tamamlayınız.';
      const pedagogicalNote = result?.pedagogicalNote || `${def?.title || type} etkinliği, öğrencinin ZPD gelişim basamağında bilişsel becerilerini pekiştirmek için tasarlanmıştır.`;

      addItem({
        id: uuidv4(),
        type,
        difficulty: (options.difficulty as any) || 'Orta',
        pageCount: 1,
        order: items.length,
        content: { 
          data: content, 
          title, 
          instruction,
          pedagogicalNote,
          generatedAt: Date.now() 
        },
      });

      logInfo(`[Fascicle] Activity added: ${type}`);
      toast.success(`${title} fasiküle eklendi!`, { id: toastId });
    } catch (error) {
      logError(error instanceof Error ? error : String(error), { context: `[Fascicle] Failed to generate ${type}` });
      // Hata olsa dahi kullanıcı deneyimini koparmamak için placeholder ekle
      const title = def?.title || type;
      addItem({
        id: uuidv4(),
        type,
        difficulty: 'Orta',
        pageCount: 1,
        order: items.length,
        content: { error: true, title },
      });
      toast.error(`${title} eklenirken hata oluştu; taslak olarak eklendi.`, { id: toastId });
    } finally {
      setGeneratingId(null);
    }
  }, [addItem, items.length, metadata]);

  // Arama ve Filtreleme Mantığı
  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return ACTIVITIES.filter(a =>
        a.id !== ActivityType.FASCICLE &&
        (a.title.toLowerCase().includes(q) ||
         a.description.toLowerCase().includes(q) ||
         a.id.toLowerCase().includes(q))
      );
    }

    const cat = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);
    if (!cat) return [];

    return cat.activities
      .filter(type => type !== ActivityType.FASCICLE)
      .map(type => ACTIVITIES.find(a => a.id === type))
      .filter((a): a is typeof ACTIVITIES[0] => !!a);
  }, [searchQuery, selectedCategory]);

  const activeCategory = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-[var(--radius-premium)] w-full max-w-5xl flex flex-col max-h-[88vh] overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>

        {/* Üst Başlık & Arama Çubuğu */}
        <div className="p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--bg-paper)]/70">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <Layers style={{ color: 'var(--accent-color)' }} size={24} />
              Etkinlik Havuzu
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Tüm stüdyo ve global etkinliklerden dilediğinizi seçin; anında fasiküle dahil edilsin.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Canlı Arama Input */}
            <div className="relative min-w-[240px] md:min-w-[280px]">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Etkinlik ara (örn: Stroop, Hece, Sudoku)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-color)] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              )}
            </div>

            <button onClick={onClose} className="studio-icon-btn p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] transition" aria-label="Kapat">
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sol Kategori Sekmeleri (Arama boşken göster) */}
          {!searchQuery && (
            <div className="w-56 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-y-auto custom-scrollbar p-3 space-y-1">
              {ACTIVITY_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2.5 ${
                    selectedCategory === cat.id
                      ? 'bg-[var(--accent-color)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <i className={`${cat.icon} text-sm`} />
                  <span className="truncate">{cat.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Sağ Etkinlik Kartları Izgarası */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {searchQuery ? `"${searchQuery}" için Sonuçlar (${filteredActivities.length})` : activeCategory?.title}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {searchQuery ? 'Arama kriterinizle eşleşen pedagojik etkinlikler.' : activeCategory?.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map(def => {
                const isGenerating = generatingId === def.id;

                return (
                  <div
                    key={def.id}
                    className="card-glow group p-4 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[var(--radius-premium)] flex flex-col justify-between relative overflow-hidden transition-all hover:border-[var(--accent-muted)] shadow-sm"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                        <i className={`${def.icon || 'fa-solid fa-puzzle-piece'} text-sm`} style={{ color: def.color || 'var(--accent-color)' }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{def.title}</h4>
                        <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5 leading-relaxed">{def.description}</p>
                      </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                      <span
                        className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}
                      >
                        {(def as any).badge || (def as any).category || 'Etkinlik'}
                      </span>
                      <button
                        onClick={() => handleAddActivity(def.id as ActivityType)}
                        disabled={isGenerating}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm text-white disabled:opacity-50"
                        style={{
                          background: 'var(--accent-color)',
                        }}
                      >
                        {isGenerating ? (
                          <><Loader2 size={13} className="animate-spin" /> Üretiliyor...</>
                        ) : (
                          <><Sparkles size={13} /> Fasiküle Ekle</>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredActivities.length === 0 && (
              <div className="text-center py-16 text-[var(--text-muted)]">
                <p className="text-sm font-medium">Aradığınız kriterde etkinlik bulunamadı.</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs font-bold text-[var(--accent-color)] hover:underline"
                >
                  Tüm Kategorileri Göster
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
