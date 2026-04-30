import React, { useState, useRef, useCallback } from 'react';
import { CollectionItem, WorkbookSettings, StyleSettings, ActivityType, StudentProfile } from '../types';
import Workbook from './Workbook';
import { worksheetService } from '../services/worksheetService';
import { printService } from '../utils/printService';
import { Toolbar } from './Toolbar';
import { useAuthStore } from '../store/useAuthStore';
import { useStudentStore } from '../store/useStudentStore';
import { ActivityImporterModal } from './ActivityImporterModal';
import { generateWithSchema } from '../services/geminiClient.js';
import { motion, AnimatePresence } from 'framer-motion';

import { logInfo, logError, logWarn } from '../utils/logger.js';
interface WorkbookViewProps {
  items: CollectionItem[];
  setItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
  settings: WorkbookSettings;
  setSettings: React.Dispatch<React.SetStateAction<WorkbookSettings>>;
  onBack: () => void;
}

const COLORS = [
  '#4f46e5',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#1f2937',
];

// Memoized Item Component - Compact & Professional
const SortablePageItem = React.memo(
  ({
    item,
    index,
    isDragging,
    onDragStart,
    onDragOver,
    onDragEnd,
    onRemove,
    onEditStyle,
    onDuplicate,
  }: {
    item: CollectionItem;
    index: number;
    isDragging: boolean;
    onDragStart: (idx: number) => void;
    onDragOver: (e: React.DragEvent, idx: number) => void;
    onDragEnd: () => void;
    onRemove: (id: string) => void;
    onEditStyle: (item: CollectionItem) => void;
    onDuplicate: (item: CollectionItem) => void;
  }) => {
    const isDivider = item.itemType === 'divider';

    return (
      <div
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={(e: React.DragEvent) => onDragOver(e, index)}
        onDragEnd={onDragEnd}
        className={`group flex items-center gap-2.5 p-2 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all border ${isDragging ? 'opacity-40 border-dashed scale-95' : 'hover:shadow-md'}`}
        style={isDivider ? { backgroundColor: 'var(--accent-muted)', borderColor: 'var(--accent-muted)' } : { backgroundColor: 'var(--bg-paper)', borderColor: 'var(--border-color)' }}
      >
        <div className="w-5 h-5 flex items-center justify-center shrink-0" style={{ color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-grip-vertical text-[10px]"></i>
        </div>

        {isDivider ? (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}>
            <i className={item.dividerConfig?.icon || 'fa-solid fa-bookmark'}></i>
          </div>
        ) : (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[9px] shrink-0 border" style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
            {index + 1}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-xs font-black truncate tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>
            {isDivider ? item.dividerConfig?.title : item.title}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[8px] font-black uppercase tracking-widest px-1.25 py-0.25 rounded" style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
              {isDivider ? 'Bölüm' : item.activityType}
            </span>
            {item.overrideStyle && !isDivider && (
              <span className="text-[8px] font-black text-amber-500 flex items-center gap-1">
                <i className="fa-solid fa-wand-magic-sparkles text-[7px]"></i> STİL
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDuplicate?.(item)}
            className="w-7 h-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <i className="fa-solid fa-copy text-[10px]"></i>
          </button>
          <button
            onClick={() => onEditStyle?.(item)}
            className="w-7 h-7 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <i className={`fa-solid ${isDivider ? 'fa-pen' : 'fa-wand-magic-sparkles'} text-[10px]`}></i>
          </button>
          <button
            onClick={() => onRemove?.(item.id)}
            className="w-7 h-7 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-colors flex items-center justify-center"
            style={{ color: 'var(--text-muted)' }}
          >
            <i className="fa-solid fa-trash text-[10px]"></i>
          </button>
        </div>
      </div>
    );
  }
);

export const WorkbookView = ({
  items,
  setItems,
  settings,
  setSettings,
  onBack,
}: WorkbookViewProps) => {
  const { user } = useAuthStore();
  const { _activeStudent, students } = useStudentStore();
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'assign'>('content');
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isGeneratingPreface, setIsGeneratingPreface] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');

  // Style Override State (Activity)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = items.find((i: CollectionItem) => i.id === editingItemId);

  // ... (keeping other states same as lines 149-189)
  // Divider Edit State
  const [editingDividerId, setEditingDividerId] = useState<string | null>(null);
  const editingDivider = items.find((i: CollectionItem) => i.id === editingDividerId);

  // Drag & Drop State
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRemoveItem = useCallback(
    (id: string) => {
      if (confirm('Bu sayfayı kitapçıktan çıkarmak istediğinize emin misiniz?')) {
        setItems((prev: CollectionItem[]) => prev.filter((i: CollectionItem) => i.id !== id));
      }
    },
    [setItems]
  );

  const handleDragStart = useCallback((index: number) => {
    setDraggedItemIndex(index);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      setItems((prevItems) => {
        if (draggedItemIndex === null || draggedItemIndex === index) return prevItems;

        const newItems = [...prevItems];
        const draggedItem = newItems[draggedItemIndex];
        newItems.splice(draggedItemIndex, 1);
        newItems.splice(index, 0, draggedItem);
        setDraggedItemIndex(index);
        return newItems;
      });
    },
    [draggedItemIndex, setItems]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedItemIndex(null);
  }, []);

  const handleImportActivities = useCallback(
    (newItems: CollectionItem[]) => {
      setItems((prev: CollectionItem[]) => [...prev, ...newItems]);
    },
    [setItems]
  );

  // ... (rest of methods up to 414 same)
  const handleDuplicateItem = useCallback(
    (item: CollectionItem) => {
      const newItem = {
        ...item,
        id: crypto.randomUUID(),
        title: `${item.title} (Kopyası)`,
      };
      setItems((prev: CollectionItem[]) => [...prev, newItem]);
    },
    [setItems]
  );

  const handleAddDivider = () => {
    const newDivider: CollectionItem = {
      id: crypto.randomUUID(),
      activityType: ActivityType.WORKBOOK, // Placeholder type
      itemType: 'divider',
      title: 'Yeni Bölüm',
      dividerConfig: {
        title: 'BÖLÜM BAŞLIĞI',
        subtitle: 'Konu Açıklaması',
        icon: 'fa-bookmark',
      },
      data: [], // Empty data
      settings: { ...items[0]?.settings }, // inherit some defaults
    };
    setItems((prev: CollectionItem[]) => [...prev, newDivider]);
    setEditingDividerId(newDivider.id);
  };

  const handleClearAll = () => {
    if (confirm('Tüm kitapçık içeriği silinecek. Emin misiniz?')) {
      setItems([]);
    }
  };

  const handleEditItemClick = useCallback((item: CollectionItem) => {
    if (item.itemType === 'divider') {
      setEditingDividerId(item.id);
    } else {
      setEditingItemId(item.id);
    }
  }, []);

  const handleStyleUpdate = (newSettings: StyleSettings) => {
    if (!editingItemId) return;
    setItems((prev: CollectionItem[]) =>
      prev.map((item: CollectionItem) => {
        if (item.id === editingItemId) {
          return { ...item, overrideStyle: newSettings };
        }
        return item;
      })
    );
  };

  const handleDividerUpdate = (field: string, value: string) => {
    if (!editingDividerId) return;
    setItems((prev: CollectionItem[]) =>
      prev.map((item: CollectionItem) => {
        if (item.id === editingDividerId && item.dividerConfig) {
          return {
            ...item,
            title: field === 'title' ? value : item.title,
            dividerConfig: { ...item.dividerConfig, [field]: value },
          };
        }
        return item;
      })
    );
  };

  const handleSave = async () => {
    if (!user) {
      alert('Kaydetmek için lütfen giriş yapın.');
      return;
    }
    if (items.length === 0) {
      alert('Kitapçık boş. Lütfen önce içerik ekleyin.');
      return;
    }

    setIsSaving(true);
    try {
      // Find student ID if assigned
      const assignedStudent = students.find((s: any) => s.name === settings.studentName);
      await worksheetService.saveWorkbook(user.id, settings, items, assignedStudent?.id);
      alert(`"${settings.title}" başarıyla arşivinize kaydedildi.`);
    } catch (error: unknown) {
      logError(error instanceof Error ? error : new Error(String(error)), { context: 'WorkbookView.handleSave' });
      alert('Kaydetme sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = async (action: 'print' | 'download') => {
    setIsPrinting(true);
    try {
      // Allow React to render the loading state before blocking the thread
      await new Promise((resolve) => setTimeout(resolve, 50));
      await printService.generatePdf('.workbook-container', settings.title || 'Kitapcik', {
        action,
      });
    } catch (error: unknown) {
      logError(error instanceof Error ? error : new Error(String(error)), { context: 'WorkbookView.handleAction' });
      alert('Kitapçık oluşturulurken bir hata meydana geldi.');
    } finally {
      setIsPrinting(false);
    }
  };

  const handleGeneratePreface = async () => {
    setIsGeneratingPreface(true);
    try {
      const typesCount: Record<string, number> = {};
      items.forEach((item) => {
        if (item.itemType === 'activity') {
          typesCount[item.activityType] = (typesCount[item.activityType] || 0) + 1;
        }
      });

      const topActivities = Object.entries(typesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map((entry) => entry[0].replace(/_/g, ' '));

      const schema = {
        type: 'OBJECT',
        properties: {
          preface: { type: 'STRING' },
        },
        required: ['preface'],
      };

      const prompt = `
[ROL: KIDEMLİ NÖROPEDAGOJİ UZMANI & DİSLEKSİ TERAPİSTİ]

GÖREV: Aşağıdaki çalışma kitapçığı için profesyonel, klinik derinliği olan ama aileye sıcak gelen bir ÖNSÖZ metni kaleme al.

PARAMETRELER:
- Öğrenci: ${settings.studentName || 'Değerli Öğrencimiz'}
- Okul/Kurum: ${settings.schoolName || 'Özel Gelişim Merkezi'}
- Dönem/Yıl: ${settings.year || 'Mevcut Eğitim Yılı'}
- Odak Alanlar: ${topActivities.join(', ')}

YAZIM STİLİ:
1. GİRİŞ: Çalışmanın amacını ve akademik/bilişsel gelişimin önemini belirt.
2. GELİŞME: Özellikle ${topActivities.slice(0, 2).join(' ve ')} alanlarındaki çalışmaların nöral plastisite üzerindeki etkisine değin.
3. SONUÇ: Aileye destekleri için teşekkür et ve motivasyonel bir kapanış yap.

KRİTİK KURALLAR:
- Maksimum 250 kelime.
- Kısa, anlaşılır cümleler (Disleksi dostu iletişim).
- Profesyonel terminolojiyi (örn: bilişsel esneklik, fonolojik farkındalık) parantez içinde basit açıklamalarıyla kullan.
- Hitabet samimi ve güçlendirici olmalı.

ÇIKTI FORMATI: Sadece JSON nesnesi dönün:
{
  "preface": "yazılan metin"
}
`;

      let prefaceText = '';
      try {
        const result = (await generateWithSchema(prompt, schema)) as { preface?: string };
        prefaceText = result && result.preface ? result.preface : '';
      } catch (aiErr: unknown) {
        logWarn("Gemini preface fallback'a düştü:", aiErr instanceof Error ? aiErr : new Error(String(aiErr)));
      }

      if (!prefaceText) {
        prefaceText = `Bu çalışma kitapçığı, ${settings.studentName || 'öğrencimizin'} bireysel gelişim hedefleri doğrultusunda özel olarak hazırlanmıştır.\n\n`;
        prefaceText += `Kitapçık içeriğinde özellikle şu bilişsel alanlara odaklanılmıştır: ${topActivities.join(', ')}.\n`;
        prefaceText += `Düzenli uygulama ile görsel-uzamsal bellek, dikkat süresi ve akademik becerilerde belirgin bir artış hedeflenmektedir. Çalışmalar sırasında geri bildirim vermeyi ve destekleyici bir ortam sağlamayı unutmayınız.`;
      }
      setSettings((s: any) => ({ ...s, teacherNote: prefaceText, aiPreface: prefaceText }));
    } catch (e: unknown) {
      logError('Preface üretme hatası:', e as Record<string, unknown>);
    } finally {
      setIsGeneratingPreface(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSettings((prev: WorkbookSettings) => ({
          ...prev,
          logoUrl: ev.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStudentAssign = (sid: string) => {
    if (sid === 'anonymous') {
      setSettings((prev: WorkbookSettings) => ({ ...prev, studentName: '' }));
    } else {
      const s = students.find((x: Record<string, unknown>) => x.id === sid);
      if (s) {
        setSettings((prev: Record<string, unknown>) => ({
          ...prev,
          studentName: s.name,
          schoolName: s.learningStyle || (prev as Record<string, unknown>).schoolName,
        }));
      }
    }
  };

  return (
    <div className="h-full flex flex-col relative font-lexend" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Top Toolbar - Compact SaaS Style */}
      <div className="flex justify-between items-center px-5 py-3 backdrop-blur-2xl shadow-sm shrink-0 z-20 border-b border-[var(--border-color)] bg-[var(--surface-glass)]">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="group flex items-center gap-1.5 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[var(--surface-elevated)] group-hover:bg-[var(--accent-muted)] transition-colors">
              <i className="fa-solid fa-arrow-left text-[10px]"></i>
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest">Geri</span>
          </button>

          <div className="h-6 w-px bg-[var(--border-color)] mx-1"></div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20" style={{ background: `linear-gradient(135deg, var(--accent-color), var(--accent-hover))` }}>
              <i className="fa-solid fa-book-open-reader text-lg"></i>
            </div>
            <div>
              <h2 className="text-base font-black leading-none tracking-tight uppercase" style={{ color: 'var(--text-primary)' }}>
                Çalışma Kitapçığı
              </h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-[var(--accent-muted)] text-[var(--accent-color)] border border-[var(--accent-color)]/10">
                  {items.length} SAYFA
                </span>
                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-white/5">
                  {settings.theme}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl flex bg-[var(--surface-elevated)] border border-white/10">
            {['edit', 'preview'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as any)}
                className={`relative px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 z-10 ${mode === viewMode ? 'text-white' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
              >
                <i className={`fa-solid ${mode === 'edit' ? 'fa-pen-ruler' : 'fa-eye'}`}></i>
                {mode === 'edit' ? 'Düzenle' : 'Önizle'}
                {viewMode === mode && (
                  <motion.div layoutId="pill" className="absolute inset-0 rounded-lg shadow-sm -z-10" style={{ backgroundColor: 'var(--accent-color)' }} />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('download')}
              disabled={isPrinting}
              className="w-10 h-10 rounded-xl bg-[var(--bg-paper)] border border-[var(--border-color)] hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-all shadow-sm group"
              title="PDF İndir"
            >
              <i className="fa-solid fa-download text-xs text-[var(--accent-color)] group-hover:scale-110 transition-transform"></i>
            </button>
            <button
              onClick={() => handleAction('print')}
              disabled={isPrinting}
              className="px-4 py-2.5 rounded-xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[9px] uppercase tracking-widest shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
            >
              <i className="fa-solid fa-print"></i> Yazdır
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-black text-[9px] uppercase tracking-widest shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>}
              Kaydet
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'edit' ? (
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar: Controls - SaaS Minimal */}
          <div className="w-72 md:w-80 backdrop-blur-xl flex flex-col z-10 shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-paper)]/80">
            {/* Tabs - Modern Bento */}
            <div className="flex p-2 gap-1.5 border-b border-[var(--border-color)] bg-[var(--bg-inset)]/50">
              {[
                { id: 'content', icon: 'fa-layer-group', label: 'İçerik' },
                { id: 'design', icon: 'fa-paintbrush', label: 'Tasarım' },
                { id: 'assign', icon: 'fa-user-graduate', label: 'Atama' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1.5 ${activeTab === tab.id ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:bg-[var(--bg-secondary)]'}`}
                >
                  <i className={`fa-solid ${tab.icon} text-sm`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content - Minimal & Compact */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
              {activeTab === 'assign' && (
                <div className="space-y-5 animate-in fade-in duration-500">
                  <div className="p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-inset)]/30 backdrop-blur-sm shadow-sm">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 text-[var(--accent-color)]">
                      <div className="w-5 h-5 rounded-lg bg-[var(--accent-color)] text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <i className="fa-solid fa-user-plus text-[9px]"></i>
                      </div>
                      Öğrenci Atama
                    </h4>
                    <select
                      value={students.find((s: any) => s.name === settings.studentName)?.id || 'anonymous'}
                      onChange={(e: any) => handleStudentAssign(e.target.value)}
                      className="w-full p-3 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--accent-muted)] border border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-primary)] transition-all cursor-pointer"
                    >
                      <option value="anonymous">Misafir / Atanmamış</option>
                      {students.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.grade})
                        </option>
                      ))}
                    </select>
                    <p className="text-[9px] mt-3 italic font-medium leading-relaxed opacity-70 text-[var(--text-muted)]">
                      * Öğrenci seçimi kapak bilgilerini otomatik günceller.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <>
                  <div className="space-y-4 p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-inset)]/30">
                    <div>
                      <label className="block text-[9px] font-black uppercase tracking-widest mb-1.5 px-1 text-[var(--text-muted)]">
                        Kitapçık Başlığı
                      </label>
                      <input
                        type="text"
                        value={settings.title}
                        onChange={(e: any) => setSettings((s: any) => ({ ...s, title: e.target.value }))}
                        className="w-full p-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-[var(--accent-muted)] border border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-primary)] transition-all outline-none"
                        placeholder="Örn: Tatil Kitabım"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-black uppercase mb-1.5 px-1 text-[var(--text-muted)]">
                          Öğrenci
                        </label>
                        <input
                          type="text"
                          value={settings.studentName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings((s: WorkbookSettings) => ({ ...s, studentName: e.target.value }))}
                          className="w-full p-2.5 rounded-xl text-xs bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] outline-none"
                          placeholder="Ad Soyad"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase mb-1.5 px-1 text-[var(--text-muted)]">
                          Yıl / Dönem
                        </label>
                        <input
                          type="text"
                          value={settings.year}
                          onChange={(e) => setSettings((s) => ({ ...s, year: e.target.value }))}
                          className="w-full p-2.5 rounded-xl text-xs bg-[var(--bg-paper)] border border-[var(--border-color)] text-[var(--text-primary)] outline-none"
                          placeholder="2024-2025"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[9px] font-black uppercase px-1 text-[var(--text-muted)]">
                          AI Önsöz / Not
                        </label>
                        <button
                          onClick={handleGeneratePreface}
                          disabled={isGeneratingPreface || items.length === 0}
                          className="text-[8px] font-black px-2.5 py-1 rounded-full bg-[var(--accent-muted)] text-[var(--accent-color)] hover:bg-[var(--accent-color)] hover:text-white transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm shadow-indigo-500/5"
                        >
                          {isGeneratingPreface ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                          ÜRET
                        </button>
                      </div>
                      <textarea
                        value={settings.teacherNote}
                        onChange={(e: any) => setSettings((s: any) => ({ ...s, teacherNote: e.target.value }))}
                        className="w-full p-3 rounded-xl text-xs border border-[var(--border-color)] bg-[var(--bg-paper)] text-[var(--text-primary)] h-28 resize-none outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
                        placeholder="Öğrenciye veya veliye bir not bırakın..."
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-color)]">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-[10px] uppercase tracking-widest text-[var(--text-primary)]">
                          Sayfalar ({items.length})
                        </h3>
                        <div className="flex p-0.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                          {['list', 'grid'].map((mode) => (
                            <button
                              key={mode}
                              onClick={() => setLayoutMode(mode as any)}
                              className={`w-6 h-6 rounded flex items-center justify-center transition-all ${layoutMode === mode ? 'bg-[var(--bg-paper)] text-[var(--accent-color)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                              title={mode === 'list' ? 'Liste' : 'Izgara'}
                            >
                              <i className={`fa-solid ${mode === 'list' ? 'fa-list-ul' : 'fa-border-all'} text-[9px]`}></i>
                            </button>
                          ))}
                        </div>
                      </div>
                      <button onClick={handleClearAll} className="text-[9px] font-black text-rose-500 uppercase hover:underline tracking-widest">
                        TEMİZLE
                      </button>
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-2.5">
                      <button
                        onClick={() => setIsImporterOpen(true)}
                        className="group w-full py-3 bg-[var(--accent-color)] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 transition-all hover:translate-y-[-1px] active:scale-[0.98]"
                      >
                        <i className="fa-solid fa-cloud-arrow-down text-xs group-hover:scale-110 transition-transform"></i>
                        KÜTÜPHANEDEN EKLE
                      </button>

                      <button
                        onClick={handleAddDivider}
                        className="w-full py-3 border border-dashed border-[var(--border-color)] rounded-xl font-black text-[9px] uppercase tracking-[0.1em] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-all flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-bookmark opacity-60"></i>
                        BÖLÜM EKLE
                      </button>
                    </div>

                    <div className={`${layoutMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
                      {items.map((item, index) => (
                        <SortablePageItem
                          key={item.id}
                          item={item}
                          index={index}
                          isDragging={draggedItemIndex === index}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDragEnd={handleDragEnd}
                          onRemove={handleRemoveItem}
                          onEditStyle={handleEditItemClick}
                          onDuplicate={handleDuplicateItem}
                        />
                      ))}
                      {items.length === 0 && (
                        <div className="text-center py-6 border border-dashed border-[var(--border-color)] rounded-xl text-[10px] text-[var(--text-muted)] italic">
                          Henüz sayfa eklenmedi.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'design' && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                        Kapak Teması & AI Tasarım
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-[10px] font-black uppercase" style={{ color: 'var(--accent-color)' }}>
                          AI Kapak Üret
                        </span>
                        <div
                          className={`w-8 h-4 rounded-full relative transition-colors`}
                          style={{ backgroundColor: settings.isAiGeneratedCover ? 'var(--accent-color)' : 'var(--text-muted)' }}
                        >
                          <input
                            type="checkbox"
                            checked={settings.isAiGeneratedCover}
                            onChange={(e: any) =>
                              setSettings((s: any) => ({
                                ...s,
                                isAiGeneratedCover: e.target.checked,
                              }))
                            }
                            className="hidden"
                          />
                          <div
                            className={`w-2.5 h-2.5 bg-white rounded-full absolute top-[3px] transition-all ${settings.isAiGeneratedCover ? 'left-[18px]' : 'left-[3px]'}`}
                          ></div>
                        </div>
                      </label>
                    </div>

                    {settings.isAiGeneratedCover && (
                      <div className="mb-4 p-3 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-2" style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--border-color)' }}>
                        <label className="text-[10px] font-bold" style={{ color: 'var(--accent-color)' }}>
                          AI Konsept Promtu (Örn: Uzay temalı öğrenme)
                        </label>
                        <input
                          type="text"
                          value={settings.aiCoverConcept || ''}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSettings((s: WorkbookSettings) => ({
                              ...s,
                              aiCoverConcept: e.target.value,
                            }))
                          }
                          className="w-full p-2.5 rounded-lg text-xs outline-none focus:ring-2"
                          style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                          placeholder="Görsel konseptini tanımlayın..."
                        />
                      </div>
                    )}

                    <div
                      className={`grid grid-cols-2 gap-3 pb-4 ${settings.isAiGeneratedCover ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      {[
                        { id: 'modern', icon: 'fa-clapperboard', label: 'Modern' },
                        { id: 'classic', icon: 'fa-monument', label: 'Klasik' },
                        { id: 'minimal', icon: 'fa-leaf', label: 'Minimalist' },
                        { id: 'academic', icon: 'fa-graduation-cap', label: 'Akademik' },
                        { id: 'artistic', icon: 'fa-palette', label: 'Sanatsal' },
                        { id: 'space', icon: 'fa-shuttle-space', label: 'Uzay' },
                        { id: 'nature', icon: 'fa-tree', label: 'Doğa' },
                        { id: 'cyber', icon: 'fa-microchip', label: 'Cyberpunk' },
                        { id: 'luxury', icon: 'fa-gem', label: 'Premium' },
                        { id: 'playful', icon: 'fa-child-reaching', label: 'Eğlenceli' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() =>
                            setSettings((s: WorkbookSettings) => ({ ...s, theme: t.id as any }))
                          }
                          className="group p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-3 relative overflow-hidden"
                          style={settings.theme === t.id ? { borderColor: 'var(--accent-color)', backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)', boxShadow: 'var(--shadow-premium)' } : { borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-paper)', color: 'var(--text-secondary)' }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                            style={settings.theme === t.id ? { backgroundColor: 'var(--accent-color)', color: '#fff', transform: 'rotate(6deg)' } : { backgroundColor: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
                          >
                            <i className={`fa-solid ${t.icon} text-sm`}></i>
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                          {settings.theme === t.id && (
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                      Vurgu Rengi
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSettings((s) => ({ ...s, accentColor: c }))}
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${settings.accentColor === c ? 'ring-2 ring-offset-2' : 'border-transparent'}`}
                          style={{ backgroundColor: c, ...(settings.accentColor === c ? { borderColor: 'var(--text-primary)', ringColor: 'var(--text-muted)' } : {}) }}
                        >
                          {settings.accentColor === c && (
                            <i className="fa-solid fa-check text-white text-xs"></i>
                          )}
                        </button>
                      ))}
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer" style={{ borderColor: 'var(--border-color)' }}>
                        <input
                          type="color"
                          value={settings.accentColor}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, accentColor: e.target.value }))
                          }
                          className="absolute -top-2 -left-2 w-12 h-12 p-0 border-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                      Okul / Kurum Logosu
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--surface-elevated)', borderColor: 'var(--border-color)' }}>
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} className="w-full h-full object-contain" />
                        ) : (
                          <i className="fa-solid fa-image text-xl" style={{ color: 'var(--text-muted)' }}></i>
                        )}
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-lg text-sm font-bold transition-colors hover:opacity-80"
                        style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        Logo Seç
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      {settings.logoUrl && (
                        <button
                          onClick={() => setSettings((s) => ({ ...s, logoUrl: undefined }))}
                          className="text-red-500 text-sm hover:underline"
                        >
                          Kaldır
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cover Layout */}
                  <div>
                    <label className="block text-xs font-bold uppercase mb-3" style={{ color: 'var(--text-muted)' }}>
                      Kapak Düzeni
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'centered', label: 'Merkezi' },
                        { id: 'left', label: 'Sol' },
                        { id: 'split', label: 'Bölünmüş' },
                        { id: 'hero', label: 'Görsel Odaklı' },
                        { id: 'minimalist', label: 'Minimal' },
                      ].map((layout) => (
                        <button
                          key={layout.id}
                          onClick={() =>
                            setSettings((s) => ({ ...s, coverStyle: layout.id as any }))
                          }
                          className="py-2 px-3 text-[10px] font-black uppercase rounded-xl border-2 transition-all"
                          style={settings.coverStyle === layout.id ? { borderColor: 'var(--accent-color)', backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' } : { borderColor: 'var(--border-color)', backgroundColor: 'var(--surface-elevated)', color: 'var(--text-muted)' }}
                        >
                          {layout.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Premium Typography & Density */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                        Yazı Tipi
                      </label>
                      <select
                        value={settings.fontFamily || 'OpenDyslexic'}
                        onChange={(e) => setSettings((s) => ({ ...s, fontFamily: e.target.value }))}
                        className="w-full p-2.5 rounded-xl text-xs font-bold outline-none"
                        style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        <option value="OpenDyslexic">OpenDyslexic</option>
                        <option value="Inter">Inter (Sade)</option>
                        <option value="Lexend">Lexend</option>
                        <option value="Comic Neue">Comic Neue</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                        Yoğunluk
                      </label>
                      <select
                        value={settings.layoutDensity || 'comfortable'}
                        onChange={(e) =>
                          setSettings((s) => ({ ...s, layoutDensity: e.target.value as any }))
                        }
                        className="w-full p-2.5 rounded-xl text-xs font-bold outline-none"
                        style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      >
                        <option value="compact">Sıkı</option>
                        <option value="comfortable">Rahat</option>
                        <option value="spacious">Geniş</option>
                      </select>
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-3 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        İçindekiler Tablosu
                      </span>
                      <div
                        className="w-10 h-5 rounded-full relative transition-colors"
                        style={{ backgroundColor: settings.showTOC ? 'var(--accent-color)' : 'var(--text-muted)' }}
                      >
                        <input
                          type="checkbox"
                          checked={settings.showTOC}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, showTOC: e.target.checked }))
                          }
                          className="hidden"
                        />
                        <div
                          className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.showTOC ? 'left-6' : 'left-1'}`}
                        ></div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        Sayfa Numaraları
                      </span>
                      <div
                        className="w-10 h-5 rounded-full relative transition-colors"
                        style={{ backgroundColor: settings.showPageNumbers ? 'var(--accent-color)' : 'var(--text-muted)' }}
                      >
                        <input
                          type="checkbox"
                          checked={settings.showPageNumbers}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, showPageNumbers: e.target.checked }))
                          }
                          className="hidden"
                        />
                        <div
                          className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.showPageNumbers ? 'left-6' : 'left-1'}`}
                        ></div>
                      </div>
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        Arka Kapak
                      </span>
                      <div
                        className="w-10 h-5 rounded-full relative transition-colors"
                        style={{ backgroundColor: settings.showBackCover ? 'var(--accent-color)' : 'var(--text-muted)' }}
                      >
                        <input
                          type="checkbox"
                          checked={settings.showBackCover}
                          onChange={(e) =>
                            setSettings((s) => ({ ...s, showBackCover: e.target.checked }))
                          }
                          className="hidden"
                        />
                        <div
                          className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.showBackCover ? 'left-6' : 'left-1'}`}
                        ></div>
                      </div>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between cursor-pointer group">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                          Filigran (Logo)
                        </span>
                        <div
                          className="w-10 h-5 rounded-full relative transition-colors"
                          style={{ backgroundColor: settings.showWatermark ? 'var(--accent-color)' : 'var(--text-muted)' }}
                        >
                          <input
                            type="checkbox"
                            checked={settings.showWatermark}
                            onChange={(e) =>
                              setSettings((s) => ({ ...s, showWatermark: e.target.checked }))
                            }
                            className="hidden"
                          />
                          <div
                            className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.showWatermark ? 'left-6' : 'left-1'}`}
                          ></div>
                        </div>
                      </label>
                      {settings.showWatermark && (
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}>
                          <div className="flex justify-between mb-1">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-secondary)' }}>Opaklık</span>
                            <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                              {Math.round((settings.watermarkOpacity || 0.05) * 100)}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0.01"
                            max="0.2"
                            step="0.01"
                            value={settings.watermarkOpacity || 0.05}
                            onChange={(e) =>
                              setSettings((s) => ({
                                ...s,
                                watermarkOpacity: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                </>
              )}
            </div>
          </div>

          {/* Right: Live Preview */}
          <div className="flex-1 p-8 overflow-auto flex flex-col items-center custom-scrollbar" style={{ backgroundColor: 'var(--bg-inset)' }}>
            <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] origin-top transition-transform duration-300">
              <Workbook items={items} settings={settings} />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-8 flex flex-col items-center custom-scrollbar" style={{ backgroundColor: 'var(--bg-inset)' }}>
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <Workbook items={items} settings={settings} />
          </div>
        </div>
      )}

      {/* Per-Item Style Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
            <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-elevated)' }}>
              <h3 className="font-bold" style={{ color: 'var(--text-primary)' }}>
                Stil Düzenle: {editingItem.title}
              </h3>
              <button
                onClick={() => setEditingItemId(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)', border: '1px solid var(--border-color)' }}>
                <i className="fa-solid fa-circle-info mr-2"></i>
                Burada yapılan değişiklikler sadece bu sayfa için geçerli olacaktır.
              </div>
              <Toolbar
                settings={
                  editingItem.overrideStyle
                    ? { ...editingItem.settings, ...editingItem.overrideStyle }
                    : editingItem.settings
                }
                onSettingsChange={handleStyleUpdate}
                onSave={() => { }}
                onTogglePreview={() => { }}
                isPreviewMode={false}
                isEditMode={false}
                worksheetData={[editingItem.data as any]}
              />
            </div>
            <div className="p-4 flex justify-end gap-3" style={{ borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-elevated)' }}>
              <button
                onClick={() => setEditingItemId(null)}
                className="px-4 py-2 rounded-lg font-bold hover:opacity-80"
                style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                Vazgeç
              </button>
              <button
                onClick={() => setEditingItemId(null)}
                className="px-4 py-2 text-white rounded-lg font-bold hover:opacity-90"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Divider Editor Modal */}
      {editingDivider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
            <div className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: 'var(--accent-color)' }}>
              <h3 className="font-bold">Bölüm Kapağı Düzenle</h3>
              <button
                onClick={() => setEditingDividerId(null)}
                className="text-white/80 hover:text-white"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  Bölüm Başlığı
                </label>
                <input
                  type="text"
                  value={editingDivider.dividerConfig?.title || ''}
                  onChange={(e) => handleDividerUpdate('title', e.target.value)}
                  className="w-full p-3 rounded-xl focus:ring-2 outline-none"
                  style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  Alt Başlık / Açıklama
                </label>
                <input
                  type="text"
                  value={editingDivider.dividerConfig?.subtitle || ''}
                  onChange={(e) => handleDividerUpdate('subtitle', e.target.value)}
                  className="w-full p-3 rounded-xl focus:ring-2 outline-none"
                  style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                  İkon (FontAwesome)
                </label>
                <input
                  type="text"
                  value={editingDivider.dividerConfig?.icon || ''}
                  onChange={(e) => handleDividerUpdate('icon', e.target.value)}
                  className="w-full p-3 rounded-xl focus:ring-2 outline-none"
                  style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  placeholder="fa-solid fa-bookmark"
                />
              </div>
            </div>
            <div className="p-4 flex justify-end" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button
                onClick={() => setEditingDividerId(null)}
                className="px-6 py-2 text-white rounded-lg font-bold hover:opacity-90"
                style={{ backgroundColor: 'var(--accent-color)' }}
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      <ActivityImporterModal
        isOpen={isImporterOpen}
        onClose={() => setIsImporterOpen(false)}
        onImport={handleImportActivities}
      />
    </div>
  );
};
