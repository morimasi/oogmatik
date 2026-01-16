
import React from 'react';
import { GeneratorOptions } from '../../types';

export const StoryStudioConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30 space-y-4">
                <div>
                    <label className="text-[10px] font-black text-indigo-600 uppercase mb-2 block tracking-widest">Hikaye Teması</label>
                    <input 
                        type="text" value={options.topic || ''} 
                        onChange={e => onChange('topic', e.target.value)}
                        placeholder="Örn: Uzay Maceraları, Çiftlik..."
                        className="w-full p-3 bg-white dark:bg-zinc-800 border border-indigo-200 rounded-xl text-sm font-bold outline-none"
                    />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <select value={options.genre || 'Macera'} onChange={e => onChange('genre', e.target.value)} className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 rounded-lg text-[10px] font-bold">
                        <option>Macera</option><option>Masal</option><option>Fabl</option><option>Bilim Kurgu</option>
                    </select>
                    <select value={options.tone || 'Eğlenceli'} onChange={e => onChange('tone', e.target.value)} className="p-2 bg-white dark:bg-zinc-800 border border-zinc-200 rounded-lg text-[10px] font-bold">
                        <option>Eğlenceli</option><option>Öğretici</option><option>Gizemli</option>
                    </select>
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-3">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Dahil Edilecekler</h4>
                {[
                    {k: 'include5N1K', l: '5N 1K Analizi'},
                    {k: 'focusVocabulary', l: 'Sözlükçe (Kritik Kelimeler)'},
                    {k: 'includeCreativeTask', l: 'Yaratıcı Çizim/Yazma Görevi'}
                ].map(item => (
                    <div key={item.k} className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">{item.l}</span>
                        <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${options[item.k] !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => onChange(item.k as any, options[item.k] === false)}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${options[item.k] !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
