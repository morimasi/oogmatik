import React, { useState, useCallback } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { ACTIVITY_CATEGORIES, ACTIVITIES } from '../../constants';
import { ActivityType } from '../../types/activity';
import { ActivityCategory, GeneratorOptions } from '../../types/core';
import { logError, logInfo } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';
import { X, Loader2, Sparkles, Plus } from 'lucide-react';

interface FascicleActivityPickerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FascicleActivityPicker: React.FC<FascicleActivityPickerProps> = ({ isOpen, onClose }) => {
  const { addItem, items, metadata } = useFascicleStore();
  const [selectedCategory, setSelectedCategory] = useState<string>(ACTIVITY_CATEGORIES[0]?.id || '');
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const handleAddActivity = useCallback(async (type: ActivityType) => {
    setGeneratingId(type);
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
          logWarn(`AI generator failed for ${type}, trying offline:`, aiError);
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
      const title = (result?.title) || ACTIVITIES.find(a => a.id === type)?.title || type;
      const pedagogicalNote = result?.pedagogicalNote || `ZPD uyumlu ${metadata.targetAgeGroup} yaş grubu için ${title} etkinliği.`;

      addItem({
        id: uuidv4(),
        type,
        difficulty: (options.difficulty as any) || 'Orta',
        pageCount: 1,
        order: items.length,
        content: { data: content, title, generatedAt: Date.now() },
        pedagogicalNote,
      });

      logInfo(`[Fascicle] Activity added: ${type}`);
    } catch (error) {
      logError(`[Fascicle] Failed to generate ${type}:`, error);
      // Add a placeholder item even on failure
      addItem({
        id: uuidv4(),
        type,
        difficulty: 'Orta',
        pageCount: 1,
        order: items.length,
        content: { error: true, title: ACTIVITIES.find(a => a.id === type)?.title || type },
        pedagogicalNote: 'İçerik üretilemedi. Tekrar deneyin.',
      });
    } finally {
      setGeneratingId(null);
    }
  }, [addItem, items.length, metadata]);

  const category = ACTIVITY_CATEGORIES.find(c => c.id === selectedCategory);
  const activities = category?.activities.filter(type => {
    const def = ACTIVITIES.find(a => a.id === type);
    return def && type !== ActivityType.FASCICLE;
  }) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="rounded-[var(--radius-premium)] w-full max-w-5xl flex flex-col max-h-[85vh] overflow-hidden" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>

        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-paper)]/50">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Etkinlik Havuzu</h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Tüm stüdyo ve global etkinliklerden seçim yapın. Seçilen etkinlik otomatik üretilip fasiküle eklenecek.
            </p>
          </div>
          <button onClick={onClose} className="studio-icon-btn p-2 rounded-xl">
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Category Tabs (Left) */}
          <div className="w-56 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]/50 overflow-y-auto custom-scrollbar p-3 space-y-1">
            {ACTIVITY_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[var(--accent-color)] text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-paper)] hover:text-[var(--text-primary)]'
                }`}
              >
                <i className={`${cat.icon} text-sm`} />
                <span className="truncate">{cat.title}</span>
              </button>
            ))}
          </div>

          {/* Activity Grid (Right) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            {category && (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">{category.title}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{category.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activities.map(type => {
                    const def = ACTIVITIES.find(a => a.id === type);
                    if (!def) return null;
                    const isGenerating = generatingId === type;

                    return (
                      <div
                        key={type}
                        className="card-glow group p-4 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[var(--radius-premium)] flex flex-col relative overflow-hidden transition-all hover:border-[var(--accent-muted)]"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[var(--bg-secondary)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <i className={`${def.icon || 'fa-solid fa-puzzle-piece'} text-sm`} style={{ color: def.color || 'var(--accent-color)' }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-[var(--text-primary)] truncate">{def.title}</h4>
                            <p className="text-xs text-[var(--text-muted)] line-clamp-2 mt-0.5">{def.description}</p>
                          </div>
                        </div>

                        <div className="mt-auto pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}>
                            {category.title}
                          </span>
                          <button
                            onClick={() => handleAddActivity(type)}
                            disabled={isGenerating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                            style={{
                              background: 'var(--accent-color)',
                              color: '#ffffff'
                            }}
                          >
                            {isGenerating ? (
                              <><Loader2 size={14} className="animate-spin" /> Üretiliyor...</>
                            ) : (
                              <><Sparkles size={14} /> Fasiküle Ekle</>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {activities.length === 0 && (
                  <div className="text-center py-16 text-[var(--text-muted)]">
                    <p className="text-lg font-medium">Bu kategoride etkinlik bulunamadı</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function logWarn(message: string, error?: any) {
  logError(`[Fascicle] ${message}`, error);
}
