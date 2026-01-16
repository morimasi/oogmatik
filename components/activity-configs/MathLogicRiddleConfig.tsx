
import React from 'react';
import { GeneratorOptions } from '../../types';

export const MathLogicRiddleConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30 space-y-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-amber-600 uppercase block">Mantık Modeli</label>
                    <select 
                        value={options.logicModel || 'identity'} 
                        onChange={e => onChange('logicModel', e.target.value)}
                        className="w-full p-3 bg-white dark:bg-zinc-800 border border-amber-200 dark:border-amber-700 rounded-xl text-xs font-bold"
                    >
                        <option value="identity">Sayı Kimliği (Basamak Odaklı)</option>
                        <option value="exclusion">Eleme Mantığı (Şu Değildir)</option>
                        <option value="sequence">Dizi/Örüntü İlişkisi</option>
                        <option value="cryptarithmetic">Şifreleme (Sembol-Sayı)</option>
                    </select>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
                    <span>İpucu Sayısı (Derinlik)</span>
                    <span className="text-amber-600 font-black">{options.gridSize || 3}</span>
                </div>
                <input type="range" min={2} max={5} value={options.gridSize || 3} onChange={e => onChange('gridSize', parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none accent-amber-500" />
                
                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Toplam Kontrolü</span>
                    <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${options.showSumTarget !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => onChange('showSumTarget', options.showSumTarget === false)}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${options.showSumTarget !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
