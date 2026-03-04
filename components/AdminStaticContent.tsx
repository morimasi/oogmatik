
import React, { useState, useEffect } from 'react';
import { StaticContentItem, ContentSnapshot } from '../types/admin';
import { adminService } from '../services/adminService';

export const AdminStaticContent = () => {
    const [contents, setContents] = useState<StaticContentItem[]>([]);
    const [selectedContent, setSelectedContent] = useState<StaticContentItem | null>(null);
    const [editData, setEditData] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [showHistory, setShowHistory] = useState<boolean>(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllStaticContent();
            setContents(data);
            if (data.length > 0) selectItem(data[0]);
        } finally { setLoading(false); }
    };

    const selectItem = (item: StaticContentItem) => {
        setSelectedContent(item);
        if (Array.isArray(item.data)) {
            setEditData(item.data.join('\n'));
        } else {
            setEditData(JSON.stringify(item.data, null, 2));
        }
    };

    const handleSave = async (note?: string) => {
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
            await adminService.saveStaticContent(updatedItem, note || 'Manuel güncelleme');

            // Reload to get fresh history
            const freshData = await adminService.getAllStaticContent();
            setContents(freshData);
            const freshItem = freshData.find(d => d.id === updatedItem.id);
            if (freshItem) setSelectedContent(freshItem);

            alert('Versiyon başarıyla kaydedildi.');
        } catch (e) {
            alert('Hata: Veri formatını kontrol edin.');
        } finally { setIsSaving(false); }
    };

    const handleRestore = (snapshot: ContentSnapshot) => {
        if (!confirm("Bu versiyonu editöre geri yüklemek istediğinize emin misiniz? (Kaydetmeniz gerekecektir)")) return;
        if (Array.isArray(snapshot.data)) {
            setEditData(snapshot.data.join('\n'));
        } else {
            setEditData(JSON.stringify(snapshot.data, null, 2));
        }
        setShowHistory(false);
    };

    const handleExport = () => {
        if (!selectedContent) return;
        const blob = new Blob([editData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedContent.id}_backup.json`;
        a.click();
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            setEditData(content);
        };
        reader.readAsText(file);
    };

    return (
        <div className="h-[calc(100vh-140px)] flex bg-[#0d0d0e] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl font-lexend relative">
            {/* Sidebar: Resources */}
            <div className="w-80 bg-black/40 border-r border-white/5 flex flex-col">
                <div className="p-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
                    <h3 className="font-black text-xl text-white mb-1 uppercase tracking-tighter">VERİ KAYNAKLARI</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Statik Konfigürasyon</p>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 custom-scrollbar-minimal">
                    {contents.map(item => (
                        <button
                            key={item.id}
                            onClick={() => selectItem(item)}
                            className={`w-full text-left p-5 rounded-[1.5rem] transition-all duration-300 group ${selectedContent?.id === item.id ? 'bg-white dark:bg-zinc-800 shadow-xl border-l-[6px] border-indigo-500' : 'hover:bg-white/5 border-l-[6px] border-transparent opacity-60'}`}
                        >
                            <div className={`text-sm font-black uppercase tracking-tight truncate ${selectedContent?.id === item.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>{item.title}</div>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[8px] font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-widest">{item.type}</span>
                                <span className="text-[9px] font-bold text-zinc-500 italic">{new Date(item.updatedAt).toLocaleDateString()}</span>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="p-6 border-t border-white/5">
                    <label className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all border border-white/5">
                        <i className="fa-solid fa-file-import"></i> İçe Aktar
                        <input type="file" className="hidden" onChange={handleImport} accept=".json,.txt" />
                    </label>
                </div>
            </div>

            {/* Main Editor */}
            <div className="flex-1 flex flex-col bg-zinc-950/40 relative">
                {selectedContent ? (
                    <>
                        {/* Toolbar */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-2xl px-12">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                                    <i className={`fa-solid ${selectedContent.type === 'list' ? 'fa-list-check' : 'fa-code'}`}></i>
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{selectedContent.title}</h2>
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="text-indigo-400">ID: {selectedContent.id}</span>
                                        <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                                        <span>SON SÜRÜM: {new Date(selectedContent.updatedAt).toLocaleString()}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setShowHistory(!showHistory)} className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg transition-all ${showHistory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'}`}>
                                    <i className="fa-solid fa-clock-rotate-left"></i>
                                </button>
                                <button onClick={handleExport} className="w-14 h-14 bg-white/5 text-zinc-400 hover:text-white rounded-2xl flex items-center justify-center text-lg border border-white/5 transition-all">
                                    <i className="fa-solid fa-download"></i>
                                </button>
                                <button
                                    onClick={() => handleSave()}
                                    disabled={isSaving}
                                    className="px-12 h-14 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                                >
                                    {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-shield-check"></i>}
                                    VERSİYON KAYDET
                                </button>
                            </div>
                        </div>

                        {/* Text Editor Area */}
                        <div className="flex-1 py-12 px-12 relative flex flex-col font-mono text-xs">
                            <div className="flex-1 bg-black/60 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-full h-8 bg-white/5 flex items-center px-6 gap-2 border-b border-white/5">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                                    <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                                    <div className="ml-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{selectedContent.id}.{selectedContent.type === 'list' ? 'txt' : 'json'}</div>
                                </div>
                                <textarea
                                    className="w-full h-full p-12 pt-16 resize-none outline-none bg-transparent text-emerald-500/80 selection:bg-indigo-500/30 line-height-relaxed custom-scrollbar-minimal"
                                    value={editData}
                                    onChange={(e) => setEditData(e.target.value)}
                                    placeholder={selectedContent.type === 'list' ? "// Her satıra bir veri ekleyin" : "{ \"data\": [] }"}
                                    spellCheck={false}
                                />
                                <div className="absolute bottom-8 right-8 px-4 py-2 bg-black/80 rounded-xl border border-white/10 text-[10px] font-black text-zinc-500 tracking-widest">
                                    {selectedContent.type === 'list' ? `${editData.split('\n').filter(l => l.trim()).length} SATIR` : `${editData.length} KARAKTER`}
                                </div>
                            </div>
                        </div>

                        {/* Version History Drawer */}
                        {showHistory && (
                            <div className="absolute top-0 right-0 w-[400px] h-full bg-black/90 backdrop-blur-3xl border-l border-white/10 z-20 animate-in slide-in-from-right duration-500 flex flex-col shadow-2xl">
                                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                                    <h4 className="font-black text-white uppercase tracking-tighter">VERSİYON GEÇMİŞİ</h4>
                                    <button onClick={() => setShowHistory(false)} className="text-zinc-500 hover:text-white"><i className="fa-solid fa-xmark text-xl"></i></button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar-minimal">
                                    {selectedContent.history?.length ? selectedContent.history.map((snap, i) => (
                                        <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/50 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-40">v{selectedContent.history!.length - i}</span>
                                                <span className="text-[9px] font-bold text-zinc-500">{new Date(snap.updatedAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-[11px] font-bold text-zinc-400 mb-4 italic">"{snap.note || 'Otomatik yedek'}"</p>
                                            <button
                                                onClick={() => handleRestore(snap)}
                                                className="w-full py-2 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
                                            >
                                                YÜKLE
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="text-center py-24 opacity-20">
                                            <i className="fa-solid fa-history text-4xl mb-4"></i>
                                            <p className="text-[10px] font-black uppercase tracking-widest">Geçmiş bulunamadı</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-24">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl text-white/10 mb-8 border border-white/5">
                            <i className="fa-solid fa-database"></i>
                        </div>
                        <h4 className="text-xl font-black text-white uppercase tracking-tighter opacity-20">DATA ENGINE</h4>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-2">Düzenlemek için kaynak seçin</p>
                    </div>
                )}
            </div>
        </div>
    );
};
