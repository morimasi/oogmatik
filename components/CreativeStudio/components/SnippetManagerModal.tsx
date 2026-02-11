
import React, { useState, useMemo } from 'react';
import { AISnippet, PROFESSIONAL_SNIPPETS } from '../../../services/generators/snippetLibrary';

interface SnippetManagerModalProps {
    onClose: () => void;
    onSelect: (snippet: AISnippet) => void;
    customSnippets: AISnippet[];
    onSaveCustom: (snippet: AISnippet) => void;
    onDeleteCustom: (id: string) => void;
}

export const SnippetManagerModal: React.FC<SnippetManagerModalProps> = ({ 
    onClose, onSelect, customSnippets, onSaveCustom, onDeleteCustom 
}) => {
    const [search, setSearch] = useState("");
    const [activeTab, setActiveTab] = useState<'library' | 'custom'>('library');
    const [isCreating, setIsCreating] = useState(false);
    const [newSnip, setNewSnip] = useState<Partial<AISnippet>>({ category: 'Custom', icon: 'fa-terminal' });

    const allItems = useMemo(() => [...PROFESSIONAL_SNIPPETS, ...customSnippets], [customSnippets]);
    
    const filtered = allItems.filter(item => {
        const matchesSearch = item.label.toLowerCase().includes(search.toLowerCase()) || 
                             item.description.toLowerCase().includes(search.toLowerCase());
        const matchesTab = activeTab === 'library' ? item.category !== 'Custom' : item.category === 'Custom';
        return matchesSearch && matchesTab;
    });

    const handleCreate = () => {
        if (!newSnip.label || !newSnip.value) return alert("Başlık ve Talimat boş bırakılamaz.");
        const finalSnip: AISnippet = {
            id: `custom-${Date.now()}`,
            category: 'Custom',
            label: newSnip.label,
            description: newSnip.description || 'Kullanıcı tanımlı işlev.',
            value: newSnip.value,
            icon: newSnip.icon || 'fa-terminal'
        };
        onSaveCustom(finalSnip);
        setIsCreating(false);
        setNewSnip({ category: 'Custom', icon: 'fa-terminal' });
        setActiveTab('custom');
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-zinc-900 border border-white/10 w-full max-w-4xl h-[80vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden">
                
                {/* HEADER */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <i className="fa-solid fa-wand-sparkles text-xl"></i>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white tracking-tight">AI İşlev Kütüphanesi</h3>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Gelişmiş Direktif Yönetimi</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><i className="fa-solid fa-times text-2xl"></i></button>
                </div>

                {/* SEARCH & TABS */}
                <div className="px-8 py-4 bg-black/10 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center shrink-0">
                    <div className="relative flex-1">
                        <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                        <input 
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="İşlev, kategori veya talimat ara..."
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="flex bg-zinc-800 p-1 rounded-2xl">
                        <button onClick={() => setActiveTab('library')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'library' ? 'bg-white text-black' : 'text-zinc-500'}`}>SİSTEM</button>
                        <button onClick={() => setActiveTab('custom')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'custom' ? 'bg-white text-black' : 'text-zinc-500'}`}>ÖZEL ({customSnippets.length})</button>
                    </div>
                    <button onClick={() => setIsCreating(true)} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase shadow-lg transition-all flex items-center gap-2">
                        <i className="fa-solid fa-plus-circle"></i> YENİ OLUŞTUR
                    </button>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {isCreating ? (
                        <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom-4">
                            <h4 className="text-xl font-black text-white mb-8 border-b border-white/5 pb-4">Yeni AI Makrosu Tanımla</h4>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">İşlev Başlığı</label>
                                    <input type="text" value={newSnip.label || ""} onChange={e => setNewSnip({...newSnip, label: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500" placeholder="Örn: Renkli Heceleme" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Kategori</label>
                                    <select value={newSnip.category} onChange={e => setNewSnip({...newSnip, category: e.target.value as any})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none">
                                        <option value="Custom">Özel</option>
                                        <option value="Clinical">Klinik</option>
                                        <option value="Linguistic">Dilbilim</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Kısa Açıklama</label>
                                <input type="text" value={newSnip.description || ""} onChange={e => setNewSnip({...newSnip, description: e.target.value})} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-indigo-500" placeholder="Bu işlev neyi amaçlıyor?" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 block">AI TALİMATI (PROMPT FRAGMENT)</label>
                                <textarea value={newSnip.value || ""} onChange={e => setNewSnip({...newSnip, value: e.target.value})} className="w-full h-40 p-4 bg-black/40 border border-white/10 rounded-2xl text-zinc-200 font-mono text-sm outline-none focus:border-indigo-500" placeholder="Yapay zekaya tam olarak ne yapması gerektiğini anlatın..." />
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button onClick={() => setIsCreating(false)} className="flex-1 py-4 text-zinc-500 font-black uppercase text-[10px] hover:text-white">Vazgeç</button>
                                <button onClick={handleCreate} className="flex-1 py-4 bg-indigo-600 text-white font-black uppercase text-[10px] rounded-2xl shadow-xl">KAYDET VE EKLE</button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(item => (
                                <div key={item.id} className="group p-6 bg-white/5 border border-white/5 rounded-[2rem] hover:border-indigo-500/50 hover:bg-white/10 transition-all flex flex-col relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 transition-colors shadow-inner">
                                            <i className={`fa-solid ${item.icon}`}></i>
                                        </div>
                                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest bg-black/20 px-2 py-1 rounded-md">{item.category}</span>
                                    </div>
                                    <h5 className="text-white font-black text-sm mb-2">{item.label}</h5>
                                    <p className="text-zinc-500 text-[10px] leading-relaxed mb-6 line-clamp-2">{item.description}</p>
                                    
                                    <div className="mt-auto flex gap-2">
                                        <button 
                                            onClick={() => onSelect(item)}
                                            className="flex-1 py-2.5 bg-white text-black font-black text-[9px] uppercase rounded-xl hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
                                        >
                                            KULLAN
                                        </button>
                                        {item.category === 'Custom' && (
                                            <button 
                                                onClick={() => onDeleteCustom(item.id)}
                                                className="w-10 h-10 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
