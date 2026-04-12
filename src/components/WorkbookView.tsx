import React, { useState, useRef, useCallback } from 'react';
import { CollectionItem, WorkbookSettings, StyleSettings, ActivityType, StudentProfile } from '../types';
import Workbook from './Workbook';
import { worksheetService } from '../services/worksheetService';
import { printService } from '../utils/printService';
import { Toolbar } from './Toolbar';
import { useAuthStore } from '../store/useAuthStore';
import { useStudentStore } from '../store/useStudentStore';
import { ActivityImporterModal } from './ActivityImporterModal';
import { evaluateContent, generateWithSchema } from '../services/geminiClient.js';
import { motion, AnimatePresence } from 'framer-motion';

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

// Memoized Item Component
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
        className={`group flex items-center gap-3 p-3 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'opacity-50 border-dashed' : ''}`}
        style={isDivider ? { backgroundColor: 'var(--accent-muted)', border: '1px solid var(--accent-muted)' } : { backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}
      >
        <div className="w-6 h-6 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-grip-vertical"></i>
        </div>

        {isDivider ? (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}>
            <i className={item.dividerConfig?.icon || 'fa-solid fa-bookmark'}></i>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0" style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
            {index + 1}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {isDivider ? item.dividerConfig?.title : item.title}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md" style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-muted)' }}>
              {isDivider ? 'Bölüm Kapağı' : item.activityType}
            </span>
            {item.overrideStyle && !isDivider && (
              <span className="text-[9px] font-black bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <i className="fa-solid fa-wand-magic-sparkles text-[8px]"></i> Özel Stil
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onDuplicate(item)}
            className="p-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title="Kopyala"
          >
            <i className="fa-solid fa-copy"></i>
          </button>
          <button
            onClick={() => onEditStyle(item)}
            className="p-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
            title={isDivider ? 'Bölüm Düzenle' : 'Stil Düzenle'}
          >
            <i className={`fa-solid ${isDivider ? 'fa-pen' : 'fa-wand-magic-sparkles'}`}></i>
          </button>
          <button
            onClick={() => onRemove(item.id)}
            className="p-2 transition-colors hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
            title="Sil"
          >
            <i className="fa-solid fa-trash"></i>
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [layoutMode, setLayoutMode] = useState<'list' | 'grid'>('list');

  // Style Override State (Activity)
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const editingItem = items.find((i: CollectionItem) => i.id === editingItemId);

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
    } catch (error) {
      console.error('Save failed:', error);
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
    } catch (error) {
      console.error('Kitapçık oluşturma hatası:', error);
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
      } catch (aiErr) {
        console.warn("Gemini preface fallback'a düştü:", aiErr);
      }

      if (!prefaceText) {
        let fallback = `Bu çalışma kitapçığı, ${settings.studentName || 'öğrencimizin'} bireysel gelişim hedefleri doğrultusunda özel olarak hazırlanmıştır.\n\n`;
        fallback += `Kitapçık içeriğinde özellikle şu bilişsel alanlara odaklanılmıştır: ${topActivities.join(', ')}.\n`;
        fallback += `Düzenli uygulama ile görsel-uzamsal bellek, dikkat süresi ve akademik becerilerde belirgin bir artış hedeflenmektedir. Çalışmalar sırasında geri bildirim vermeyi ve destekleyici bir ortam sağlamayı unutmayınız.`;
        prefaceText = fallback;
      }

      setSettings((s: any) => ({ ...s, teacherNote: prefaceText, aiPreface: prefaceText }));
    } catch (e: any) {
      console.error('AI Error:', e);
    } finally {
      setIsGeneratingPreface(false);
    }
  };

  const handleAnalyzeWorkbook = async () => {
    if (items.length === 0) {
      alert('Önce kitapçığa en az bir sayfa ekleyin.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const compactItems = items.map((item, index) => ({
        index: index + 1,
        id: item.id,
        type: item.itemType,
        activityType: item.activityType,
        title: item.itemType === 'divider' ? item.dividerConfig?.title : item.title,
        pedagogicalNote: (item as any).data?.[0]?.pedagogicalNote || undefined,
      }));

      const payload = {
        workbookTitle: settings.title,
        studentName: settings.studentName,
        schoolName: settings.schoolName,
        year: settings.year,
        activitySummary: compactItems,
      };

      const result = await evaluateContent(payload);
      if (!result) {
        alert('AI analizi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.');
        return;
      }
      setAnalysisResult(result);
    } catch (e) {
      console.error('Workbook AI analizi hatası:', e);
      alert('AI analizi sırasında bir hata oluştu.');
    } finally {
      setIsAnalyzing(false);
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
      const s = students.find((x: any) => x.id === sid);
      if (s) {
        setSettings((prev: any) => ({
          ...prev,
          studentName: s.name,
          schoolName: s.learningStyle || (prev as any).schoolName,
        }));
      }
    }
  };

  return (
    <div className="h-full flex flex-col relative font-['Lexend']" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Top Toolbar - Premium Glassmorphism */}
      <div className="flex justify-between items-center px-8 py-5 backdrop-blur-xl shadow-sm shrink-0 z-20" style={{ backgroundColor: 'var(--surface-glass)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 transition-all duration-300 hover:opacity-80"
            style={{ color: 'var(--text-secondary)' }}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--surface-elevated)' }}>
              <i className="fa-solid fa-arrow-left text-xs"></i>
            </div>
            <span className="text-sm font-bold tracking-tight">Geri Dön</span>
          </button>

          <div className="h-8 w-px mx-2" style={{ backgroundColor: 'var(--border-color)' }}></div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, var(--accent-color), var(--accent-hover))` }}>
              <i className="fa-solid fa-book-open-reader text-2xl"></i>
            </div>
            <div>
              <h2 className="text-xl font-black leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Çalışma Kitapçığı
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}>
                  {items.length} Sayfa
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}>
                  {settings.theme} MODU
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-1.5 rounded-2xl flex relative" style={{ backgroundColor: 'var(--surface-elevated)' }}>
            <button
              onClick={() => setViewMode('edit')}
              className={`relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 z-10`}
              style={{ color: viewMode === 'edit' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <i className="fa-solid fa-pen-ruler"></i> Düzenle
              {viewMode === 'edit' && (
                <motion.div layoutId="pill" className="absolute inset-0 rounded-xl shadow-md -z-10" style={{ backgroundColor: 'var(--accent-color)' }} />
              )}
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={`relative px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 z-10`}
              style={{ color: viewMode === 'preview' ? 'var(--text-primary)' : 'var(--text-muted)' }}
            >
              <i className="fa-solid fa-eye"></i> Önizle
              {viewMode === 'preview' && (
                <motion.div layoutId="pill" className="absolute inset-0 rounded-xl shadow-md -z-10" style={{ backgroundColor: 'var(--accent-color)' }} />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 ml-2">
            <button
              onClick={() => handleAction('download')}
              disabled={isPrinting}
              className="px-5 py-3 font-bold rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 active:scale-95"
              style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              <i className="fa-solid fa-download" style={{ color: 'var(--accent-color)' }}></i> PDF
            </button>
            <button
              onClick={() => handleAction('print')}
              disabled={isPrinting}
              className="px-5 py-3 font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
              style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              <i className="fa-solid fa-print"></i> Yazdır
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 transition-all active:scale-95 hover:opacity-90"
              style={{ backgroundColor: 'var(--accent-color)' }}
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
          {/* Left Sidebar: Controls - Glassmorphism */}
          <div className="w-80 md:w-96 backdrop-blur-xl flex flex-col z-10 shrink-0" style={{ backgroundColor: 'var(--bg-paper)', borderRight: '1px solid var(--border-color)' }}>
            {/* Tabs */}
            <div className="flex p-2 gap-1" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-inset)' }}>
              {[
                { id: 'content', icon: 'fa-layer-group', label: 'İçerik' },
                { id: 'design', icon: 'fa-paintbrush', label: 'Tasarım' },
                { id: 'assign', icon: 'fa-user-graduate', label: 'Atama' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex flex-col items-center justify-center gap-1.5 ${activeTab !== tab.id ? 'opacity-70 hover:opacity-100' : ''}`}
                  style={activeTab === tab.id ? { backgroundColor: 'var(--accent-color)', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' } : { color: 'var(--text-secondary)' }}
                >
                  <i className={`fa-solid ${tab.icon} text-sm`}></i>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {activeTab === 'assign' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <div className="p-5 rounded-[2rem]" style={{ background: `linear-gradient(135deg, var(--accent-muted), var(--bg-paper))`, border: '1px solid var(--border-color)' }}>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                      <div className="w-6 h-6 rounded-lg text-white flex items-center justify-center shadow-md" style={{ backgroundColor: 'var(--accent-color)' }}>
                        <i className="fa-solid fa-user-plus text-[10px]"></i>
                      </div>
                      Öğrenci Atama
                    </h4>
                    <select
                      value={
                        students.find((s: any) => s.name === settings.studentName)?.id ||
                        'anonymous'
                      }
                      onChange={(e: any) => handleStudentAssign(e.target.value)}
                      className="w-full p-4 rounded-2xl text-sm font-bold outline-none focus:ring-4 transition-all appearance-none cursor-pointer"
                      style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-muted)' } as React.CSSProperties}
                    >
                      <option value="anonymous">Misafir / Atanmamış</option>
                      {students.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.grade})
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] mt-4 italic font-medium leading-relaxed opacity-80 backdrop-blur-sm" style={{ color: 'var(--text-muted)' }}>
                      * Bir öğrenci seçtiğinizde kapak ve sayfa künyeleri otomatik olarak kişiselleştirilir.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'content' && (
                <>
                  <div className="space-y-6 p-5 rounded-[2rem]" style={{ backgroundColor: 'var(--surface-glass)', border: '1px solid var(--border-color)' }}>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest mb-3 px-1" style={{ color: 'var(--text-muted)' }}>
                        Kitapçık Başlığı
                      </label>
                      <input
                        type="text"
                        value={settings.title}
                        onChange={(e: any) =>
                          setSettings((s: any) => ({ ...s, title: e.target.value }))
                        }
                        className="w-full p-4 rounded-2xl text-sm font-bold focus:ring-4 outline-none transition-all"
                        style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-muted)' } as React.CSSProperties}
                        placeholder="Örn: Tatil Kitabım"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                          Öğrenci
                        </label>
                        <input
                          type="text"
                          value={settings.studentName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSettings((s: WorkbookSettings) => ({ ...s, studentName: e.target.value }))
                          }
                          className="w-full p-3 rounded-xl text-sm focus:ring-2 outline-none"
                          style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                          placeholder="Ad Soyad"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase mb-2" style={{ color: 'var(--text-muted)' }}>
                          Yıl / Dönem
                        </label>
                        <input
                          type="text"
                          value={settings.year}
                          onChange={(e) => setSettings((s) => ({ ...s, year: e.target.value }))}
                          className="w-full p-3 rounded-xl text-sm focus:ring-2 outline-none"
                          style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                          placeholder="2024-2025"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>
                          Eğitmen Notu / Önsöz
                        </label>
                        <button
                          onClick={handleGeneratePreface}
                          disabled={isGeneratingPreface || items.length === 0}
                          className="text-[10px] font-black px-3 py-1 rounded-full transition-colors disabled:opacity-50"
                          style={{ backgroundColor: 'var(--accent-muted)', color: 'var(--accent-color)' }}
                        >
                          {isGeneratingPreface ? (
                            <i className="fa-solid fa-circle-notch fa-spin mr-1"></i>
                          ) : (
                            <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>
                          )}
                          AI İLE ÜRET
                        </button>
                      </div>
                      <textarea
                        value={settings.teacherNote}
                        onChange={(e: any) =>
                          setSettings((s: any) => ({ ...s, teacherNote: e.target.value }))
                        }
                        className="w-full p-3 rounded-xl text-sm focus:ring-2 outline-none h-32 resize-none"
                        style={{ backgroundColor: 'var(--bg-inset)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties}
                        placeholder="Öğrenciye veya veliye bir not bırakın..."
                      />
                    </div>
                  </div>

                  <div className="pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                          Sayfalar ({items.length})
                        </h3>
                        <div className="flex p-0.5 rounded-lg" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-color)' }}>
                          <button
                            onClick={() => setLayoutMode('list')}
                            className="w-6 h-6 rounded flex items-center justify-center transition-all"
                            style={layoutMode === 'list' ? { backgroundColor: 'var(--bg-paper)', color: 'var(--accent-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: 'var(--text-muted)' }}
                            title="Liste Görünümü"
                          >
                            <i className="fa-solid fa-list text-[10px]"></i>
                          </button>
                          <button
                            onClick={() => setLayoutMode('grid')}
                            className="w-6 h-6 rounded flex items-center justify-center transition-all"
                            style={layoutMode === 'grid' ? { backgroundColor: 'var(--bg-paper)', color: 'var(--accent-color)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: 'var(--text-muted)' }}
                            title="Izgara Görünümü"
                          >
                            <i className="fa-solid fa-border-all text-[10px]"></i>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handleClearAll}
                        className="text-xs text-red-500 hover:underline font-bold"
                      >
                        Tümünü Sil
                      </button>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-3">
                      <button
                        onClick={() => setIsImporterOpen(true)}
                        className="group w-full py-4 text-white rounded-[1.25rem] font-black text-sm flex items-center justify-center gap-3 shadow-lg transition-all active:scale-[0.98] hover:opacity-90"
                        style={{ background: `linear-gradient(135deg, var(--accent-color), var(--accent-hover))` }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <i className="fa-solid fa-cloud-arrow-down text-sm"></i>
                        </div>
                        KÜTÜPHANEDEN EKLE
                      </button>

                      <button
                        onClick={handleAddDivider}
                        className="w-full py-3.5 border-2 border-dashed rounded-[1.25rem] font-bold text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] hover:opacity-80"
                        style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-paper)', color: 'var(--text-secondary)' }}
                      >
                        <i className="fa-solid fa-bookmark opacity-60"></i>
                        YENİ BÖLÜM KAPAĞI
                      </button>
                    </div>

                    <div
                      className={`${layoutMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}
                    >
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
                        <div className="text-center py-8 border-2 border-dashed rounded-xl text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
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

                  {/* AI Pedagojik Analiz */}
                  <div className="mt-6 space-y-3 pt-4 border-t border-dashed" style={{ borderColor: 'var(--accent-muted)' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>
                          <i className="fa-solid fa-brain"></i> AI Pedagojik Analiz
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                          Kitapçığın disleksi dostu tasarım ilkelerine uygunluğunu puanlar ve
                          öneriler sunar.
                        </p>
                      </div>
                      <button
                        onClick={handleAnalyzeWorkbook}
                        disabled={isAnalyzing || items.length === 0}
                        className="px-3 py-1.5 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ backgroundColor: 'var(--accent-color)' }}
                      >
                        {isAnalyzing ? (
                          <>
                            <i className="fa-solid fa-circle-notch fa-spin"></i>
                            Analiz ediliyor...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-microscope"></i>
                            Analiz Et
                          </>
                        )}
                      </button>
                    </div>

                    {analysisResult && (
                      <div className="p-3 rounded-xl space-y-2 text-xs" style={{ backgroundColor: 'var(--accent-muted)', border: '1px solid var(--border-color)' }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ backgroundColor: 'var(--accent-color)' }}>
                              SKOR: {analysisResult.score ?? '--'}/100
                            </span>
                            <span className="text-[11px] font-bold" style={{ color: 'var(--text-primary)' }}>
                              {analysisResult.verdict || 'Değerlendirme'}
                            </span>
                          </div>
                        </div>
                        {Array.isArray(analysisResult.analysis) &&
                          analysisResult.analysis.length > 0 && (
                            <ul className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                              {analysisResult.analysis.map((item: any, idx: number) => (
                                <li key={idx} className="flex gap-2">
                                  <span
                                    className={`mt-0.5 text-[10px] ${item.type === 'success'
                                      ? 'text-emerald-500'
                                      : item.type === 'warning'
                                        ? 'text-amber-500'
                                        : 'text-red-500'
                                      }`}
                                  >
                                    <i className="fa-solid fa-circle"></i>
                                  </span>
                                  <div>
                                    <p className="text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                                      {item.message}
                                    </p>
                                    {item.suggestion && (
                                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                        Öneri: {item.suggestion}
                                      </p>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                      </div>
                    )}
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
