
import React from 'react';
import { GeneratorOptions } from '../../types';

export const VisualPerceptionConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-violet-50/50 dark:bg-violet-900/10 rounded-[2rem] border border-violet-100 dark:border-violet-800/30">
                <label className="text-[10px] font-black text-violet-600 uppercase mb-3 block text-center">Analiz Tipi</label>
                <select
                    value={options.visualType || 'geometric'}
                    onChange={e => onChange('visualType', e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-violet-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none"
                >
                    <option value="geometric">Geometrik Şekiller</option>
                    <option value="abstract">Soyut Desenler</option>
                    <option value="character">Harf ve Rakamlar</option>
                </select>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-6">
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                        <span><i className="fa-solid fa-brain mr-1"></i> Bilişsel Yük</span>
                        <span className="bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full text-[9px]">{options.cognitiveLoad || 5} / 10</span>
                    </div>
                    <input
                        type="range" min="1" max="10"
                        value={options.cognitiveLoad || 5}
                        onChange={e => onChange('cognitiveLoad', parseInt(e.target.value))}
                        className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        <span>Çeldirici Hassasiyeti</span>
                        <span className="text-violet-600 font-black">{options.distractionLevel?.toUpperCase() || 'MEDIUM'}</span>
                    </div>
                    <div className="flex gap-1.5">
                        {['low', 'medium', 'high', 'extreme'].map(level => (
                            <button
                                key={level}
                                onClick={() => onChange('distractionLevel', level)}
                                className={`flex-1 h-3 rounded-full transition-all border-2 ${options.distractionLevel === level ? 'bg-violet-600 border-violet-600 scale-y-110 shadow-lg shadow-violet-200' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={options.includeClinicalNotes}
                                onChange={e => onChange('includeClinicalNotes', e.target.checked)}
                                className="sr-only"
                            />
                            <div className={`w-10 h-5 rounded-full transition-colors ${options.includeClinicalNotes ? 'bg-indigo-600' : 'bg-zinc-300'}`}></div>
                            <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${options.includeClinicalNotes ? 'translate-x-5' : ''}`}></div>
                        </div>
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:text-zinc-700 transition-colors">Klinik Metrikleri Göster</span>
                    </label>
                </div>
            </div>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30 flex items-center gap-3">
                <i className="fa-solid fa-circle-info text-amber-500"></i>
                <p className="text-[9px] font-bold text-amber-700 leading-tight uppercase">Ultra Modern üretim modu aktif. AI, disleksi profiline özel çeldiriciler üretecektir.</p>
            </div>
        </div>
    );
};
