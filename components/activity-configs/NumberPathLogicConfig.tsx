
import React from 'react';
import { GeneratorOptions } from '../../types';

export const NumberPathLogicConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-3 block text-center tracking-widest">Zincir Uzunluğu</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        {v: 2, l: 'Kısa (2 Adım)'},
                        {v: 3, l: 'Orta (3 Adım)'},
                        {v: 4, l: 'Uzun (4 Adım)'},
                        {v: 5, l: 'Zincir (5+)'}
                    ].map(t => (
                        <button 
                            key={t.v}
                            onClick={() => onChange('codeLength', t.v)}
                            className={`py-2 px-1 rounded-xl text-[9px] font-black border transition-all ${options.codeLength === t.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block">İşlem Çeşitliliği</label>
                    <select 
                        value={options.difficulty} 
                        onChange={e => onChange('difficulty', e.target.value)}
                        className="w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500"
                    >
                        <option value="Başlangıç">Sadece Toplama/Çıkarma (1-10)</option>
                        <option value="Orta">Dört İşlem Karışık (1-20)</option>
                        <option value="Zor">Büyük Sayılar (1-50)</option>
                        <option value="Uzman">Eksik Başlangıç Sayısı</option>
                    </select>
                </div>
                
                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Soru Sayısı</span>
                    <div className="flex gap-2">
                        {[6, 8, 10].map(n => (
                            <button key={n} onClick={() => onChange('itemCount', n)} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-colors ${options.itemCount === n ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                {n}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
