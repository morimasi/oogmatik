
import React from 'react';
import { GeneratorOptions } from '../../types';

// Ortak kullanılan küçük bileşenler
const CompactToggleGroup = ({ label, selected, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: any) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

const CompactCounter = ({ label, value, onChange, min, max, icon }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{icon && <i className={`fa-solid ${icon} mr-1`}></i>}{label}</label>
        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1">
            <button onClick={() => onChange(Math.max(min, value - 1))} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-colors" disabled={value <= min}><i className="fa-solid fa-minus text-[10px]"></i></button>
            <span className="flex-1 text-center text-xs font-bold dark:text-zinc-200">{value}</span>
            <button onClick={() => onChange(Math.min(max, value + 1))} className="w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-indigo-600 transition-colors" disabled={value >= max}><i className="fa-solid fa-plus text-[10px]"></i></button>
        </div>
    </div>
);

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const FindLetterPairConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    
    const rows = options.gridRows || options.gridSize || 10;
    const cols = options.gridCols || options.gridSize || 10;

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 block text-center">Hedef Çift</label>
                    <input 
                        type="text" maxLength={2} value={options.targetPair || ''} 
                        onChange={e => onChange('targetPair', e.target.value)}
                        placeholder="Örn: bd, pq..."
                        className="w-full p-4 bg-white dark:bg-zinc-800 border-2 border-indigo-100 dark:border-zinc-700 rounded-2xl text-2xl font-black outline-none focus:border-indigo-500 dark:text-zinc-100 uppercase text-center tracking-[0.5em] shadow-inner"
                    />
                </div>
                <CompactToggleGroup 
                    label="Harf Tipi" 
                    selected={options.case || 'lower'} 
                    onChange={(v: string) => onChange('case', v)} 
                    options={[{ value: 'lower', label: 'küçük' }, { value: 'upper', label: 'BÜYÜK' }]} 
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                
                {/* Grid Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase">
                            <span>Satır</span>
                            <span className="text-indigo-600 font-black">{rows}</span>
                        </div>
                        <input 
                            type="range" min={6} max={16} 
                            value={rows} 
                            onChange={e => onChange('gridRows', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 uppercase">
                            <span>Sütun</span>
                            <span className="text-indigo-600 font-black">{cols}</span>
                        </div>
                        <input 
                            type="range" min={6} max={16} 
                            value={cols} 
                            onChange={e => onChange('gridCols', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Tablo Adedi</span>
                    <div className="w-32">
                         <CompactCounter label="" value={options.itemCount || 1} onChange={(v:number) => onChange('itemCount', v)} min={1} max={4} />
                    </div>
                </div>
                
                <CompactToggleGroup 
                    label="Hedef Yoğunluğu" 
                    selected={options.targetFrequency || 'medium'} 
                    onChange={(v: string) => onChange('targetFrequency', v)} 
                    options={[
                        { value: 'low', label: 'Seyrek' }, 
                        { value: 'medium', label: 'Orta' },
                        { value: 'high', label: 'Yoğun' }
                    ]} 
                />
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">Çeldirici Stratejisi</label>
                    <select 
                        value={options.distractorStrategy || 'similar'} 
                        onChange={e => onChange('distractorStrategy', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 dark:text-zinc-200"
                    >
                        <option value="random">Rastgele Harfler</option>
                        <option value="similar">Görsel Benzerler (b-p-q-d)</option>
                        <option value="mirror">Klinik Ayna Karakterler</option>
                    </select>
                </div>
            </div>
        </div>
    );
};
