
import React, { useState, useRef, useCallback } from 'react';
import { CollectionItem, WorkbookSettings, StyleSettings, ActivityType } from '../types';
import Workbook from './Workbook';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';
import { printService } from '../utils/printService';
import { Toolbar } from './Toolbar'; 
import { useStudent } from '../context/StudentContext';

interface WorkbookViewProps {
    items: CollectionItem[];
    setItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
    settings: WorkbookSettings;
    setSettings: React.Dispatch<React.SetStateAction<WorkbookSettings>>;
    onBack: () => void;
}

const COLORS = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#1f2937'];

// Memoized Item Component
const SortablePageItem = React.memo(({ 
    item, 
    index, 
    isDragging, 
    onDragStart, 
    onDragOver, 
    onDragEnd, 
    onRemove,
    onEditStyle,
    onDuplicate
}: { 
    item: CollectionItem, 
    index: number, 
    isDragging: boolean,
    onDragStart: (idx: number) => void,
    onDragOver: (e: React.DragEvent, idx: number) => void,
    onDragEnd: () => void,
    onRemove: (id: string) => void,
    onEditStyle: (item: CollectionItem) => void,
    onDuplicate: (item: CollectionItem) => void
}) => {
    const isDivider = item.itemType === 'divider';

    return (
        <div 
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            className={`group flex items-center gap-3 p-3 border rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 transition-all ${isDragging ? 'opacity-50 border-dashed border-indigo-500' : ''} ${isDivider ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-600'}`}
        >
            <div className="w-6 h-6 flex items-center justify-center text-zinc-400">
                <i className="fa-solid fa-grip-vertical"></i>
            </div>
            
            {isDivider ? (
                <div className="w-8 h-8 rounded-lg bg-indigo-200 dark:bg-indigo-700 flex items-center justify-center font-bold text-indigo-800 dark:text-indigo-200 text-xs shrink-0">
                    <i className={item.dividerConfig?.icon || 'fa-solid fa-bookmark'}></i>
                </div>
            ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-600 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-300 text-xs shrink-0">
                    {index + 1}
                </div>
            )}

            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">
                    {isDivider ? item.dividerConfig?.title : item.title}
                </p>
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {isDivider ? 'Bölüm Kapağı' : item.activityType}
                    </p>
                    {item.overrideStyle && !isDivider && <span className="text-[8px] bg-amber-100 text-amber-700 px-1 rounded">Özel Stil</span>}
                </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onDuplicate(item)} className="text-zinc-400 hover:text-green-500 p-2 transition-colors" title="Kopyala">
                    <i className="fa-solid fa-copy"></i>
                </button>
                <button onClick={() => onEditStyle(item)} className="text-zinc-400 hover:text-indigo-500 p-2 transition-colors" title={isDivider ? "Bölüm Düzenle" : "Stil Düzenle"}>
                    <i className={`fa-solid ${isDivider ? 'fa-pen' : 'fa-wand-magic-sparkles'}`}></i>
                </button>
                <button onClick={() => onRemove(item.id)} className="text-zinc-300 hover:text-red-500 p-2 transition-colors" title="Sil">
                    <i className="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    );
});

export const WorkbookView: React.FC<WorkbookViewProps> = ({ items, setItems, settings, setSettings, onBack }) => {
    const { user } = useAuth();
    const { students } = useStudent();
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'assign'>('content');
    const [isSaving, setIsSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // Style Override State (Activity)
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const editingItem = items.find(i => i.id === editingItemId);

    // Divider Edit State
    const [editingDividerId, setEditingDividerId] = useState<string | null>(null);
    const editingDivider = items.find(i => i.id === editingDividerId);

    // Drag & Drop State
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRemoveItem = useCallback((id: string) => {
        if(confirm('Bu sayfayı kitapçıktan çıkarmak istediğinize emin misiniz?')) {
            setItems(prev => prev.filter(i => i.id !== id));
        }
    }, [setItems]);

    const handleDragStart = useCallback((index: number) => {
        setDraggedItemIndex(index);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        setItems(prevItems => {
            if (draggedItemIndex === null || draggedItemIndex === index) return prevItems;
            
            const newItems = [...prevItems];
            const draggedItem = newItems[draggedItemIndex];
            newItems.splice(draggedItemIndex, 1);
            newItems.splice(index, 0, draggedItem);
            setDraggedItemIndex(index); 
            return newItems;
        });
    }, [draggedItemIndex, setItems]);

    const handleDragEnd = useCallback(() => {
        setDraggedItemIndex(null);
    }, []);

    const handleDuplicateItem = useCallback((item: CollectionItem) => {
        const newItem = {
            ...item,
            id: crypto.randomUUID(),
            title: `${item.title} (Kopyası)`
        };
        setItems(prev => [...prev, newItem]);
    }, [setItems]);

    const handleAddDivider = () => {
        const newDivider: CollectionItem = {
            id: crypto.randomUUID(),
            activityType: ActivityType.WORKBOOK, // Placeholder type
            itemType: 'divider',
            title: 'Yeni Bölüm',
            dividerConfig: {
                title: 'BÖLÜM BAŞLIĞI',
                subtitle: 'Konu Açıklaması',
                icon: 'fa-bookmark'
            },
            data: [], // Empty data
            settings: { ...items[0]?.settings } // inherit some defaults
        };
        setItems(prev => [...prev, newDivider]);
        setEditingDividerId(newDivider.id);
    };

    const handleClearAll = () => {
        if (confirm("Tüm kitapçık içeriği silinecek. Emin misiniz?")) {
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
        setItems(prev => prev.map(item => {
            if (item.id === editingItemId) {
                return { ...item, overrideStyle: newSettings };
            }
            return item;
        }));
    };

    const handleDividerUpdate = (field: string, value: string) => {
        if (!editingDividerId) return;
        setItems(prev => prev.map(item => {
            if (item.id === editingDividerId && item.dividerConfig) {
                return {
                    ...item,
                    title: field === 'title' ? value : item.title,
                    dividerConfig: { ...item.dividerConfig, [field]: value }
                };
            }
            return item;
        }));
    };

    const handleSave = async () => {
        if (!user) {
            alert("Kaydetmek için lütfen giriş yapın.");
            return;
        }
        if (items.length === 0) {
            alert("Kitapçık boş. Lütfen önce içerik ekleyin.");
            return;
        }

        setIsSaving(true);
        try {
            // Find student ID if assigned
            const assignedStudent = students.find(s => s.name === settings.studentName);
            await worksheetService.saveWorkbook(user.id, settings, items, assignedStudent?.id);
            alert(`"${settings.title}" başarıyla arşivinize kaydedildi.`);
        } catch (error) {
            console.error("Save failed:", error);
            alert("Kaydetme sırasında bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAction = async (action: 'print' | 'download') => {
        setIsPrinting(true);
        setTimeout(async () => {
            try {
                await printService.generatePdf('.workbook-container .worksheet-page', settings.title || 'Kitapcik', { action });
            } catch (error) {
                console.error("Kitapçık oluşturma hatası:", error);
                alert("Kitapçık oluşturulurken bir hata meydana geldi.");
            } finally {
                setIsPrinting(false);
            }
        }, 100);
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setSettings(prev => ({ ...prev, logoUrl: ev.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStudentAssign = (sid: string) => {
        if (sid === 'anonymous') {
            setSettings(prev => ({ ...prev, studentName: '' }));
        } else {
            const s = students.find(x => x.id === sid);
            if (s) {
                setSettings(prev => ({ ...prev, studentName: s.name, schoolName: s.learningStyle || prev.schoolName }));
            }
        }
    };

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 relative">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors flex items-center gap-2 text-sm font-bold">
                        <i className="fa-solid fa-arrow-left"></i> Geri
                    </button>
                    <div className="h-6 w-px bg-zinc-300 dark:bg-zinc-600"></div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <i className="fa-solid fa-book-open-reader text-xl"></i>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">Çalışma Kitapçığı</h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{items.length} Sayfa • {settings.theme.toUpperCase()} Tema</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="bg-zinc-100 dark:bg-zinc-700 p-1 rounded-lg flex">
                        <button 
                            onClick={() => setViewMode('edit')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'edit' ? 'bg-white dark:bg-zinc-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'}`}
                        >
                            <i className="fa-solid fa-pen-ruler"></i> Düzenle
                        </button>
                        <button 
                            onClick={() => setViewMode('preview')}
                            className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'preview' ? 'bg-white dark:bg-zinc-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-800'}`}
                        >
                            <i className="fa-solid fa-eye"></i> Önizle
                        </button>
                    </div>
                    {viewMode === 'preview' && (
                        <>
                            <button 
                                onClick={() => handleAction('download')}
                                disabled={isPrinting}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                                PDF İndir
                            </button>
                            <button 
                                onClick={() => handleAction('print')}
                                disabled={isPrinting}
                                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-900 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                <i className="fa-solid fa-print"></i> Yazdır
                            </button>
                            <button 
                                onClick={handleSave} 
                                disabled={isSaving}
                                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <i className="fa-solid fa-spinner fa-spin"></i> : <i className="fa-solid fa-save"></i>} 
                                Kaydet
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            {viewMode === 'edit' ? (
                <div className="flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Controls */}
                    <div className="w-80 md:w-96 bg-white dark:bg-zinc-800 border-r border-zinc-200 dark:border-zinc-700 flex flex-col z-10 shrink-0">
                        {/* Tabs */}
                        <div className="flex border-b border-zinc-200 dark:border-zinc-700">
                            {[
                                { id: 'content', icon: 'fa-layer-group', label: 'İçerik' },
                                { id: 'design', icon: 'fa-paintbrush', label: 'Tasarım' },
                                { id: 'assign', icon: 'fa-user-graduate', label: 'Atama' }
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-4 text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === tab.id ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                                >
                                    <i className={`fa-solid ${tab.icon}`}></i> {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            
                            {activeTab === 'assign' && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30">
                                        <h4 className="text-xs font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <i className="fa-solid fa-user-plus"></i> Öğrenci Atama
                                        </h4>
                                        <select 
                                            value={students.find(s => s.name === settings.studentName)?.id || 'anonymous'}
                                            onChange={(e) => handleStudentAssign(e.target.value)}
                                            className="w-full p-3 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-700 rounded-xl text-sm font-bold outline-none focus:ring-2 ring-amber-500/20"
                                        >
                                            <option value="anonymous">Misafir / Atanmamış</option>
                                            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.grade})</option>)}
                                        </select>
                                        <p className="text-[10px] text-amber-500 mt-2 italic font-medium leading-tight">
                                            * Bir öğrenci seçtiğinizde kapak ve sayfa künyeleri otomatik güncellenir.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'content' && (
                                <>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Kitapçık Başlığı</label>
                                            <input type="text" value={settings.title} onChange={e => setSettings(s => ({...s, title: e.target.value}))} className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Örn: Tatil Kitabım" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Öğrenci</label>
                                                <input type="text" value={settings.studentName} onChange={e => setSettings(s => ({...s, studentName: e.target.value}))} className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Ad Soyad" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Yıl / Dönem</label>
                                                <input type="text" value={settings.year} onChange={e => setSettings(s => ({...s, year: e.target.value}))} className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="2024-2025" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Eğitmen Notu</label>
                                            <textarea value={settings.teacherNote} onChange={e => setSettings(s => ({...s, teacherNote: e.target.value}))} className="w-full p-3 bg-zinc-50 dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none" placeholder="Öğrenciye bir not bırakın..." />
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-zinc-200 dark:border-zinc-700">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-zinc-700 dark:text-zinc-200 text-sm">Sayfalar ({items.length})</h3>
                                            <button onClick={handleClearAll} className="text-xs text-red-500 hover:underline">Hepsini Sil</button>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <button 
                                                onClick={handleAddDivider}
                                                className="w-full py-2 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                                            >
                                                <i className="fa-solid fa-bookmark"></i> Bölüm Kapağı Ekle
                                            </button>
                                        </div>

                                        <div className="space-y-2">
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
                                                <div className="text-center py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-400 text-sm">
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
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Kapak Teması</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['modern', 'classic', 'fun', 'minimal', 'academic', 'artistic', 'space', 'nature', 'geometric'].map(t => (
                                                <button 
                                                    key={t} 
                                                    onClick={() => setSettings(s => ({...s, theme: t as any}))}
                                                    className={`p-3 rounded-xl border-2 text-sm font-bold capitalize transition-all text-left flex items-center gap-2 ${settings.theme === t ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-700 text-zinc-600 hover:border-zinc-300'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full ${settings.theme === t ? 'bg-indigo-500' : 'bg-zinc-300'}`}></div>
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Accent Color */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Vurgu Rengi</label>
                                        <div className="flex flex-wrap gap-3">
                                            {COLORS.map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => setSettings(s => ({...s, accentColor: c}))}
                                                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform hover:scale-110 ${settings.accentColor === c ? 'border-zinc-900 dark:border-white ring-2 ring-offset-2 ring-zinc-300' : 'border-transparent'}`}
                                                    style={{ backgroundColor: c }}
                                                >
                                                    {settings.accentColor === c && <i className="fa-solid fa-check text-white text-xs"></i>}
                                                </button>
                                            ))}
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-zinc-200 cursor-pointer">
                                                <input type="color" value={settings.accentColor} onChange={e => setSettings(s => ({...s, accentColor: e.target.value}))} className="absolute -top-2 -left-2 w-12 h-12 p-0 border-0 cursor-pointer" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Logo Upload */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Okul / Kurum Logosu</label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-700 rounded-xl border-2 border-dashed border-zinc-300 flex items-center justify-center overflow-hidden">
                                                {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-contain" /> : <i className="fa-solid fa-image text-zinc-300 text-xl"></i>}
                                            </div>
                                            <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm font-bold hover:bg-zinc-50 transition-colors">
                                                Logo Seç
                                            </button>
                                            <input type="file" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
                                            {settings.logoUrl && <button onClick={() => setSettings(s => ({...s, logoUrl: undefined}))} className="text-red-500 text-sm hover:underline">Kaldır</button>}
                                        </div>
                                    </div>

                                    {/* Cover Layout */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">Kapak Düzeni</label>
                                        <div className="flex bg-zinc-100 dark:bg-zinc-700 p-1 rounded-lg">
                                            {['centered', 'left', 'split'].map(layout => (
                                                <button
                                                    key={layout}
                                                    onClick={() => setSettings(s => ({...s, coverStyle: layout as any}))}
                                                    className={`flex-1 py-2 text-xs font-bold uppercase rounded-md transition-all ${settings.coverStyle === layout ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                                                >
                                                    {layout}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">İçindekiler Tablosu</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showTOC ? 'bg-green-500' : 'bg-zinc-300'}`}>
                                                <input type="checkbox" checked={settings.showTOC} onChange={e => setSettings(s => ({...s, showTOC: e.target.checked}))} className="hidden" />
                                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.showTOC ? 'left-6' : 'left-1'}`}></div>
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Sayfa Numaraları</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showPageNumbers ? 'bg-green-500' : 'bg-zinc-300'}`}>
                                                <input type="checkbox" checked={settings.showPageNumbers} onChange={e => setSettings(s => ({...s, showPageNumbers: e.target.checked}))} className="hidden" />
                                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.showPageNumbers ? 'left-6' : 'left-1'}`}></div>
                                            </div>
                                        </label>
                                        <label className="flex items-center justify-between cursor-pointer group">
                                            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Arka Kapak</span>
                                            <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showBackCover ? 'bg-green-500' : 'bg-zinc-300'}`}>
                                                <input type="checkbox" checked={settings.showBackCover} onChange={e => setSettings(s => ({...s, showBackCover: e.target.checked}))} className="hidden" />
                                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.showBackCover ? 'left-6' : 'left-1'}`}></div>
                                            </div>
                                        </label>
                                        <div className="space-y-2">
                                            <label className="flex items-center justify-between cursor-pointer group">
                                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Filigran (Logo)</span>
                                                <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.showWatermark ? 'bg-green-500' : 'bg-zinc-300'}`}>
                                                    <input type="checkbox" checked={settings.showWatermark} onChange={e => setSettings(s => ({...s, showWatermark: e.target.checked}))} className="hidden" />
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${settings.showWatermark ? 'left-6' : 'left-1'}`}></div>
                                                </div>
                                            </label>
                                            {settings.showWatermark && (
                                                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-xs font-bold text-zinc-500">Opaklık</span>
                                                        <span className="text-xs font-mono text-zinc-500">{Math.round((settings.watermarkOpacity || 0.05) * 100)}%</span>
                                                    </div>
                                                    <input 
                                                        type="range" 
                                                        min="0.01" max="0.2" step="0.01" 
                                                        value={settings.watermarkOpacity || 0.05} 
                                                        onChange={(e) => setSettings(s => ({...s, watermarkOpacity: parseFloat(e.target.value)}))}
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
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 p-8 overflow-auto flex flex-col items-center custom-scrollbar">
                        <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.9] origin-top transition-transform duration-300">
                            <Workbook items={items} settings={settings} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-auto bg-zinc-200 dark:bg-zinc-950 p-8 flex flex-col items-center custom-scrollbar">
                     <div className="animate-in fade-in zoom-in-95 duration-500">
                        <Workbook items={items} settings={settings} />
                     </div>
                </div>
            )}

            {/* Per-Item Style Editor Modal */}
            {editingItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                            <h3 className="font-bold text-zinc-800 dark:text-zinc-100">
                                Stil Düzenle: {editingItem.title}
                            </h3>
                            <button onClick={() => setEditingItemId(null)} className="w-8 h-8 rounded-full hover:bg-zinc-200 flex items-center justify-center text-zinc-500">
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-100">
                                <i className="fa-solid fa-circle-info mr-2"></i>
                                Burada yapılan değişiklikler sadece bu sayfa için geçerli olacaktır.
                            </div>
                            <Toolbar 
                                settings={editingItem.overrideStyle ? { ...editingItem.settings, ...editingItem.overrideStyle } : editingItem.settings}
                                onSettingsChange={handleStyleUpdate}
                                onSave={() => {}} 
                                onTogglePreview={() => {}} 
                                isPreviewMode={false}
                                isEditMode={false}
                                worksheetData={[editingItem.data]}
                            />
                        </div>
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end gap-3 bg-zinc-50 dark:bg-zinc-900">
                            <button onClick={() => setEditingItemId(null)} className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg font-bold">Vazgeç</button>
                            <button onClick={() => setEditingItemId(null)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">Tamam</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Divider Editor Modal */}
            {editingDivider && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-700 w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 bg-indigo-600 text-white flex justify-between items-center">
                            <h3 className="font-bold">Bölüm Kapağı Düzenle</h3>
                            <button onClick={() => setEditingDividerId(null)} className="text-white/80 hover:text-white"><i className="fa-solid fa-times"></i></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Bölüm Başlığı</label>
                                <input 
                                    type="text" 
                                    value={editingDivider.dividerConfig?.title || ''} 
                                    onChange={(e) => handleDividerUpdate('title', e.target.value)} 
                                    className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Alt Başlık / Açıklama</label>
                                <input 
                                    type="text" 
                                    value={editingDivider.dividerConfig?.subtitle || ''} 
                                    onChange={(e) => handleDividerUpdate('subtitle', e.target.value)} 
                                    className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">İkon (FontAwesome)</label>
                                <input 
                                    type="text" 
                                    value={editingDivider.dividerConfig?.icon || ''} 
                                    onChange={(e) => handleDividerUpdate('icon', e.target.value)} 
                                    className="w-full p-3 border rounded-xl bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="fa-solid fa-bookmark"
                                />
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
                            <button onClick={() => setEditingDividerId(null)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold">Kaydet</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
