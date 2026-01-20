
import React from 'react';
import { GeneratorOptions } from '../../types';

/**
 * FIX: Explicitly type ConfigSection as React.FC to handle children properly in React 18
 */
const ConfigSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-700/50 mb-4">
        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">{title}</h4>
        <div className="space-y-4">{children}</div>
    </div>
);

export const MathLogicRiddleConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            <ConfigSection title="Zorluk Derecesi">
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { v: 'Başlangıç', l: '1-20 Arası' },
                        { v: 'Orta', l: '1-100 Arası' },
                        { v: 'Zor', l: '100-500 Arası' },
                        { v: 'Uzman', l: '1-1000 Arası' }
                    ].map(opt => (
                        <button
                            key={opt.v}
                            onClick={() => onChange('difficulty', opt.v)}
                            className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all ${options.difficulty === opt.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {opt.l}
                        </button>
                    ))}
                </div>
            </ConfigSection>

            <ConfigSection title="Soru Mimarisi">
                <div className="space-y-6">
                    {/* Soru Adedi - Maksimum 20 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Soru Adedi</span>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{options.itemCount || 6} Soru</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" max="20" step="1"
                            value={options.itemCount || 6} 
                            onChange={e => onChange('itemCount', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                        <div className="flex justify-between text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">
                            <span>Tekil</span>
                            <span>Standart</span>
                            <span>Maksimum</span>
                        </div>
                    </div>
                    
                    {/* İpucu Derinliği - Maksimum 10 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-zinc-500 uppercase">İpucu Sayısı (Derinlik)</span>
                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{options.gridSize || 3} Katman</span>
                        </div>
                        <input 
                            type="range" 
                            min="2" max="10" step="1"
                            value={options.gridSize || 3} 
                            onChange={e => onChange('gridSize', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                        <div className="flex justify-between text-[8px] text-zinc-400 font-bold uppercase tracking-tighter">
                            <span>Basit (2)</span>
                            <span>Detaylı (6)</span>
                            <span>Dedektif (10)</span>
                        </div>
                    </div>
                </div>
            </ConfigSection>

            <ConfigSection title="Klinik Özellikler">
                <div className="space-y-2">
                    <label className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:bg-white dark:hover:bg-zinc-700 cursor-pointer transition-all">
                        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase">Toplam Kontrolü Ekle</span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${options.showSumTarget !== false ? 'bg-emerald-500' : 'bg-zinc-300'}`} onClick={() => onChange('showSumTarget', options.showSumTarget === false)}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${options.showSumTarget !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                    </label>
                    <label className="flex items-center justify-between p-2 rounded-xl border border-transparent hover:bg-white dark:hover:bg-zinc-700 cursor-pointer transition-all">
                        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300 uppercase">Görsel Destek (Rakamlar)</span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors ${options.showNumbers !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => onChange('showNumbers', options.showNumbers === false)}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${options.showNumbers !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                    </label>
                </div>
            </ConfigSection>
        </div>
    );
};
