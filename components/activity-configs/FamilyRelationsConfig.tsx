
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactSlider = ({ label, value, onChange, min, max, icon, unit = '' }: any) => (
    <div className="space-y-1">
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase">
            <span className="flex items-center gap-1">{icon && <i className={`fa-solid ${icon}`}></i>}{label}</span>
            <span className="text-indigo-600 font-black">{value}{unit}</span>
        </div>
        <input type="range" min={min} max={max} value={value} onChange={e => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
    </div>
);

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

export const FamilyRelationsConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                <CompactToggleGroup 
                    label="İlişki Kapsamı" 
                    selected={options.difficulty || 'Orta'} 
                    onChange={(v: string) => onChange('difficulty', v)} 
                    options={[
                        { value: 'Başlangıç', label: 'Çekirdek' },
                        { value: 'Orta', label: 'Geniş' },
                        { value: 'Zor', label: 'Karmaşık' }
                    ]} 
                />
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <CompactSlider 
                    label="Soru Sayısı" 
                    value={options.itemCount || 8} 
                    onChange={(v:number) => onChange('itemCount', v)} 
                    min={4} max={12} icon="fa-list-ol" 
                />

                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">Alt Bölüm Düzeni</label>
                    <select 
                        value={options.variant || 'categorize'} 
                        onChange={e => onChange('variant', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 dark:text-zinc-200"
                    >
                        <option value="categorize">Anne/Baba Tarafı Gruplama</option>
                        <option value="matching">Sadece Tanım Eşleştirme</option>
                        <option value="writing">Açık Uçlu Yazma</option>
                    </select>
                </div>

                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Görsel İpucu</span>
                    <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${options.showImage !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => onChange('showImage', options.showImage === false)}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${options.showImage !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
