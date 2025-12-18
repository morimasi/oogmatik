
import React, { useState, useEffect } from 'react';
import { StaticContentItem } from '../types/admin';
import { adminService } from '../services/adminService';

export const AdminStaticContent: React.FC = () => {
    const [contents, setContents] = useState<StaticContentItem[]>([]);
    const [selectedContent, setSelectedContent] = useState<StaticContentItem | null>(null);
    const [editData, setEditData] = useState<string>(''); // Textarea content
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await adminService.getAllStaticContent();
        setContents(data);
        if (data.length > 0) selectItem(data[0]);
        setLoading(false);
    };

    const selectItem = (item: StaticContentItem) => {
        setSelectedContent(item);
        if (Array.isArray(item.data)) {
            setEditData(item.data.join('\n'));
        } else {
            setEditData(JSON.stringify(item.data, null, 2));
        }
    };

    const handleSave = async () => {
        if (!selectedContent) return;
        setIsSaving(true);
        try {
            let parsedData: any;
            if (selectedContent.type === 'list') {
                parsedData = editData.split('\n').filter(line => line.trim() !== '');
            } else {
                parsedData = JSON.parse(editData);
            }

            const updatedItem = { ...selectedContent, data: parsedData };
            await adminService.saveStaticContent(updatedItem);
            
            // Update local state
            setContents(prev => prev.map(c => c.id === updatedItem.id ? updatedItem : c));
            setSelectedContent(updatedItem);
            alert('İçerik başarıyla güncellendi.');
        } catch (e) {
            alert('Kaydetme hatası: JSON formatını veya veriyi kontrol edin.');
        } finally {
            setIsSaving(false);
        }
    };

    const createNewList = () => {
        const id = prompt("Liste ID'si girin (örn: kelimeler_yeni):");
        if (!id) return;
        const title = prompt("Liste Başlığı girin:");
        
        const newItem: StaticContentItem = {
            id: id.toLowerCase().replace(/\s+/g, '_'),
            title: title || id,
            type: 'list',
            data: [],
            updatedAt: new Date().toISOString()
        };
        
        setContents([...contents, newItem]);
        selectItem(newItem);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            {/* Sidebar */}
            <div className="w-72 bg-zinc-50 dark:bg-black/20 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
                    <h3 className="font-bold text-zinc-700 dark:text-zinc-200">Veri Kaynakları</h3>
                    <button onClick={createNewList} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold"><i className="fa-solid fa-plus"></i> Yeni</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {contents.map(item => (
                        <button
                            key={item.id}
                            onClick={() => selectItem(item)}
                            className={`w-full text-left p-3 text-sm font-medium border-l-4 transition-all ${selectedContent?.id === item.id ? 'border-indigo-500 bg-white dark:bg-zinc-800 text-indigo-600' : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            <div className="truncate">{item.title}</div>
                            <div className="text-[10px] text-zinc-400 font-mono">{item.type === 'list' ? `${item.data.length} öğe` : 'JSON'}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col">
                {selectedContent ? (
                    <>
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                            <div>
                                <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100">{selectedContent.title}</h2>
                                <p className="text-xs text-zinc-500">ID: {selectedContent.id} • Son Güncelleme: {new Date(selectedContent.updatedAt).toLocaleDateString()}</p>
                            </div>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
                            >
                                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                        <div className="flex-1 p-0 relative">
                            <textarea
                                className="w-full h-full p-6 resize-none outline-none font-mono text-sm bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-none"
                                value={editData}
                                onChange={(e) => setEditData(e.target.value)}
                                placeholder={selectedContent.type === 'list' ? "Her satıra bir öğe yazın..." : "{ \"key\": \"value\" }"}
                                spellCheck={false}
                            />
                            {selectedContent.type === 'list' && (
                                <div className="absolute bottom-4 right-4 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded text-xs text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                    {editData.split('\n').filter(l => l.trim()).length} Satır
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-zinc-400">
                        <p>Düzenlemek için sol menüden bir kaynak seçin.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
