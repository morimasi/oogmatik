
import React, { useState, useRef, useCallback } from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import Workbook from './Workbook';
import { worksheetService } from '../services/worksheetService';
import { useAuth } from '../context/AuthContext';
import { printService } from '../utils/printService';

interface WorkbookViewProps {
    items: CollectionItem[];
    setItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
    settings: WorkbookSettings;
    setSettings: React.Dispatch<React.SetStateAction<WorkbookSettings>>;
    onBack: () => void;
}

const COLORS = ['#4f46e5', '#ef4444', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#1f2937'];

// Memoized Item Component to prevent re-renders of the entire list on drag
const SortablePageItem = React.memo(({ 
    item, 
    index, 
    isDragging, 
    onDragStart, 
    onDragOver, 
    onDragEnd, 
    onRemove 
}: { 
    item: CollectionItem, 
    index: number, 
    isDragging: boolean,
    onDragStart: (idx: number) => void,
    onDragOver: (e: React.DragEvent, idx: number) => void,
    onDragEnd: () => void,
    onRemove: (id: string) => void
}) => {
    return (
        <div 
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={(e) => onDragOver(e, index)}
            onDragEnd={onDragEnd}
            className={`group flex items-center gap-3 p-3 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded-xl shadow-sm cursor-grab active:cursor-grabbing hover:border-indigo-400 transition-all ${isDragging ? 'opacity-50 border-dashed border-indigo-500' : ''}`}
        >
            <div className="w-6 h-6 flex items-center justify-center text-zinc-400">
                <i className="fa-solid fa-grip-vertical"></i>
            </div>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 text-xs shrink-0">
                {index + 1}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100 truncate">{item.title}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.activityType}</p>
            </div>
            <button onClick={() => onRemove(item.id)} className="text-zinc-300 hover:text-red-500 p-2 transition-colors">
                <i className="fa-solid fa-trash"></i>
            </button>
        </div>
    );
});

export const WorkbookView: React.FC<WorkbookViewProps> = ({ items, setItems, settings, setSettings, onBack }) => {
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');
    const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
    const [isSaving, setIsSaving] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    
    // Drag & Drop State
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleRemoveItem = useCallback((id: string) => {
        if(confirm('Bu sayfayı kitapçıktan çıkarmak istediğinize emin misiniz?')) {
            setItems(prev => prev.filter(i => i.id !== id));
        }
    }, [setItems]);

    // HTML5 Drag & Drop Handlers (Memoized)
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
            await worksheetService.saveWorkbook(user.id, settings, items);
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
        // Using new PDF Engine: Pass data object instead of selector string
        setTimeout(async () => {
            try {
                await printService.generatePdf(
                    { items, settings }, // Structured Data
                    settings.title || 'Kitapcik', 
                    { action }
                );
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

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900">
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
                            <button 
                                onClick={() => setActiveTab('content')}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'content' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                            >
                                <i className="fa-solid fa-layer-group"></i> İçerik
                            </button>
                            <button 
                                onClick={() => setActiveTab('design')}
                                className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'design' ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                            >
                                <i className="fa-solid fa-paintbrush"></i> Tasarım
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                            
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
                                            <span className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded">Sürükleyip Sıralayın</span>
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
                                    {/* Cover Style */}
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
                    <div className="flex-1 bg-zinc-100 dark:bg-zinc-950 p-8 overflow-auto flex justify-center custom-scrollbar">
                        <div className="scale-[0.6] sm:scale-[0.7] md:scale-[0.8] origin-top transition-transform duration-300" style={{ contentVisibility: 'auto' }}>
                            <Workbook items={items} settings={settings} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-auto bg-zinc-200 dark:bg-zinc-950 p-8 flex justify-center custom-scrollbar">
                     <div style={{ contentVisibility: 'auto' }}>
                        <Workbook items={items} settings={settings} />
                     </div>
                </div>
            )}
        </div>
    );
};
