
import React, { useState } from 'react';
import { CollectionItem, WorkbookSettings } from '../types';
import Workbook from './Workbook';

interface WorkbookViewProps {
    items: CollectionItem[];
    setItems: React.Dispatch<React.SetStateAction<CollectionItem[]>>;
    settings: WorkbookSettings;
    setSettings: React.Dispatch<React.SetStateAction<WorkbookSettings>>;
    onBack: () => void;
}

export const WorkbookView: React.FC<WorkbookViewProps> = ({ items, setItems, settings, setSettings, onBack }) => {
    const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

    const handleRemoveItem = (id: string) => {
        if(confirm('Bu sayfayı kitapçıktan çıkarmak istediğinize emin misiniz?')) {
            setItems(prev => prev.filter(i => i.id !== id));
        }
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex >= 0 && targetIndex < newItems.length) {
            [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
            setItems(newItems);
        }
    };

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = settings.title.replace(/ /g, '_') || 'Kitapcik';
        window.print();
        document.title = originalTitle;
    };

    return (
        <div className="h-full flex flex-col bg-[var(--bg-primary)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Çalışma Kitapçığı</h2>
                        <p className="text-sm text-[var(--text-muted)]">{items.length} Sayfa</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="bg-[var(--bg-inset)] p-1 rounded-lg flex items-center">
                        <button 
                            onClick={() => setViewMode('edit')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'edit' ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}
                        >
                            <i className="fa-solid fa-list mr-2"></i>Düzenle
                        </button>
                        <button 
                            onClick={() => setViewMode('preview')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'preview' ? 'bg-[var(--bg-paper)] shadow-sm text-[var(--accent-color)]' : 'text-[var(--text-muted)]'}`}
                        >
                            <i className="fa-solid fa-eye mr-2"></i>Önizle
                        </button>
                    </div>
                    {viewMode === 'preview' && (
                        <button onClick={handlePrint} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-lg flex items-center gap-2">
                            <i className="fa-solid fa-print"></i> Yazdır
                        </button>
                    )}
                </div>
            </div>

            {/* Edit Mode */}
            {viewMode === 'edit' && (
                <div className="flex flex-col md:flex-row gap-8 h-full overflow-hidden">
                    {/* Settings Panel */}
                    <div className="w-full md:w-1/3 overflow-y-auto pr-2">
                        <div className="bg-[var(--bg-paper)] p-6 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-4">
                            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-4 border-b border-[var(--border-color)] pb-2">Kapak Ayarları</h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Kitapçık Başlığı</label>
                                <input type="text" value={settings.title} onChange={e => setSettings({...settings, title: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)]" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Öğrenci Adı</label>
                                <input type="text" value={settings.studentName} onChange={e => setSettings({...settings, studentName: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)]" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Okul / Kurum</label>
                                <input type="text" value={settings.schoolName} onChange={e => setSettings({...settings, schoolName: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)]" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Eğitim Yılı</label>
                                <input type="text" value={settings.year} onChange={e => setSettings({...settings, year: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)]" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Eğitmen Notu</label>
                                <textarea value={settings.teacherNote} onChange={e => setSettings({...settings, teacherNote: e.target.value})} className="w-full p-2 rounded-lg bg-[var(--bg-inset)] border border-[var(--border-color)] text-[var(--text-primary)] h-24 resize-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Kapak Teması</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['modern', 'classic', 'fun', 'minimal'].map(t => (
                                        <button key={t} onClick={() => setSettings({...settings, theme: t as any})} className={`p-2 rounded border text-sm capitalize ${settings.theme === t ? 'bg-[var(--accent-color)] text-black border-transparent' : 'bg-[var(--bg-inset)] text-[var(--text-muted)] border-[var(--border-color)]'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="flex-1 overflow-y-auto bg-[var(--bg-inset)] rounded-2xl p-4 border border-[var(--border-color)]">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] opacity-50">
                                <i className="fa-solid fa-folder-open text-6xl mb-4"></i>
                                <p>Henüz etkinlik eklenmemiş.</p>
                                <p className="text-sm">"Kitapçığa Ekle" butonu ile etkinlik ekleyebilirsiniz.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {items.map((item, index) => (
                                    <div key={item.id} className="bg-[var(--bg-paper)] p-4 rounded-xl shadow-sm border border-[var(--border-color)] flex items-center gap-4 group hover:border-[var(--accent-color)] transition-all">
                                        <div className="w-8 h-8 rounded-full bg-[var(--bg-inset)] flex items-center justify-center font-bold text-[var(--text-muted)] shrink-0">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[var(--text-primary)]">{item.title}</h4>
                                            <p className="text-xs text-[var(--text-muted)]">{item.activityType}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => moveItem(index, 'up')} disabled={index === 0} className="p-2 hover:bg-[var(--bg-inset)] rounded disabled:opacity-30"><i className="fa-solid fa-arrow-up text-[var(--text-secondary)]"></i></button>
                                            <button onClick={() => moveItem(index, 'down')} disabled={index === items.length - 1} className="p-2 hover:bg-[var(--bg-inset)] rounded disabled:opacity-30"><i className="fa-solid fa-arrow-down text-[var(--text-secondary)]"></i></button>
                                            <div className="w-px bg-[var(--border-color)] mx-1"></div>
                                            <button onClick={() => handleRemoveItem(item.id)} className="p-2 hover:bg-rose-900/20 text-rose-500 rounded"><i className="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Preview Mode */}
            {viewMode === 'preview' && (
                <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-900 p-8 flex justify-center">
                    <Workbook items={items} settings={settings} />
                </div>
            )}
        </div>
    );
};
