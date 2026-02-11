
import React, { useState } from 'react';
import { ActivityLibraryItem } from '../../services/generators/promptLibrary';

interface LibraryPaneProps {
    items: ActivityLibraryItem[];
    onSelect: (item: ActivityLibraryItem) => void;
    onAddCustom: () => void;
    onHover: (item: ActivityLibraryItem | null, pos: {x: number, y: number}) => void;
}

export const LibraryPane: React.FC<LibraryPaneProps> = ({ items, onSelect, onAddCustom, onHover }) => {
    const [search, setSearch] = useState("");

    const filtered = items.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.methodology.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-zinc-900/50 rounded-[3rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div className="relative w-full md:w-96">
                    <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"></i>
                    <input 
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Kuram veya metot ara..."
                        className="w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-indigo-500"
                    />
                </div>
                <button 
                    onClick={onAddCustom}
                    className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black uppercase flex items-center gap-2 transition-all shadow-lg"
                >
                    <i className="fa-solid fa-plus-circle"></i> KENDİ METODUNU EKLE
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                {filtered.map(item => (
                    <div 
                        key={item.id} 
                        onClick={() => onSelect(item)}
                        onMouseMove={(e) => onHover(item, { x: e.clientX, y: e.clientY })}
                        onMouseLeave={() => onHover(null, { x: 0, y: 0 })}
                        className="group p-6 bg-white/5 border border-white/5 rounded-[2.5rem] hover:border-indigo-500/50 hover:bg-white/10 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">{item.methodology}</span>
                                <i className="fa-solid fa-arrow-right text-zinc-700 group-hover:text-indigo-500 transition-colors"></i>
                            </div>
                            <h4 className="font-black text-xl text-zinc-100 mb-2 leading-tight">{item.title}</h4>
                            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2">{item.description}</p>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="col-span-full py-20 text-center text-zinc-600 font-bold italic">
                        Arama kriterlerine uygun metodoloji bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
};
