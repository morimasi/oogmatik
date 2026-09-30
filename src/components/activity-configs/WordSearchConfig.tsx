
import React from 'react';
import { GeneratorOptions } from '../../types';

export const WordSearchConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    
    const rows = options.gridRows || options.gridSize || 12;
    const cols = options.gridCols || options.gridSize || 12;

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Konu ve İçerik */}
            <div className="p-4 bg-[var(--accent-muted)] dark:bg-[var(--accent-muted)] rounded-[2rem] border border-[var(--border-color)] dark:border-[var(--accent-color)]">
                <label className="text-[10px] font-black text-[var(--accent-color)] uppercase mb-3 block text-center tracking-widest">KELİME HAVUZU</label>
                <div className="space-y-3">
                    <input 
                        type="text" 
                        value={options.topic || ''} 
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Meyveler, Okul, Uzay..."
                        className="w-full p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] border border-[var(--accent-color)] rounded-xl text-sm font-bold outline-none text-center focus:ring-2 focus:ring-[var(--accent-color)]"
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={() => onChange('case', 'upper')}
                            className={`flex-1 py-2 text-[10px] font-black rounded-xl border transition-all ${options.case !== 'lower' ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-[var(--accent-color)]' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                        >
                            BÜYÜK HARF
                        </button>
                        <button 
                            onClick={() => onChange('case', 'lower')}
                            className={`flex-1 py-2 text-[10px] font-black rounded-xl border transition-all ${options.case === 'lower' ? 'bg-[var(--accent-color)] text-[var(--text-primary)] border-[var(--accent-color)]' : 'bg-[var(--bg-paper)] text-[var(--text-muted)] border-[var(--border-color)]'}`}
                        >
                            küçük harf
                        </button>
                    </div>
                </div>
            </div>

            {/* Grid Ayarları */}
            <div className="p-5 bg-[var(--bg-secondary)] bg-[var(--bg-secondary)] rounded-[2.5rem] border border-[var(--border-color)] space-y-4">
                
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1 block">Bulmaca Boyutu</label>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-[var(--text-muted)] uppercase">
                            <span>Satır</span>
                            <span className="text-[var(--accent-color)] font-black">{rows}</span>
                        </div>
                        <input 
                            type="range" min={8} max={20} 
                            value={rows} 
                            onChange={e => onChange('gridRows', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" 
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-[var(--text-muted)] uppercase">
                            <span>Sütun</span>
                            <span className="text-[var(--accent-color)] font-black">{cols}</span>
                        </div>
                        <input 
                            type="range" min={8} max={20} 
                            value={cols} 
                            onChange={e => onChange('gridCols', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" 
                        />
                    </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                    <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Gizlenecek Kelime</label>
                        <span className="text-xs font-black text-[var(--accent-color)] bg-[var(--accent-muted)] px-2 py-0.5 rounded">{options.itemCount || 10}</span>
                    </div>
                    <input 
                        type="range" min={5} max={15} 
                        value={options.itemCount || 10} 
                        onChange={e => onChange('itemCount', parseInt(e.target.value))} 
                        className="w-full h-1.5 bg-[var(--surface-elevated)] bg-[var(--bg-secondary)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]" 
                    />
                </div>

                <div className="p-3 bg-[var(--bg-paper)] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                    <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase mb-2 block">Yönlendirme Zorluğu</label>
                    <div className="grid grid-cols-3 gap-1">
                        {['Başlangıç', 'Orta', 'Zor'].map(lvl => (
                            <button
                                key={lvl}
                                onClick={() => onChange('difficulty', lvl)}
                                className={`py-1.5 text-[9px] font-bold rounded-lg transition-all ${options.difficulty === lvl ? 'bg-[var(--bg-paper)] text-[var(--text-primary)]' : 'bg-[var(--surface-elevated)] text-[var(--text-muted)]'}`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
