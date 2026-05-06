
import React from 'react';
import { GeneratorOptions } from '../../types';

export const ClockReadingConfig = ({ options, onChange }: { options: GeneratorOptions; onChange: (k: string, v: any) => void }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30">
                <label className="text-[10px] font-black text-amber-600 uppercase mb-3 block text-center">Çalışma Tipi</label>
                <div className="space-y-2">
                    {[
                        { v: 'analog-to-digital', l: 'Analog -> Dijital' },
                        { v: 'digital-to-analog', l: 'Dijital -> Çizim' },
                        { v: 'verbal-match', l: 'Sözel Eşleştirme' }
                    ].map(t => (
                        <button
                            key={t.v}
                            onClick={() => onChange('variant', t.v)}
                            className={`w-full py-2.5 rounded-xl text-xs font-black border transition-all ${options.variant === t.v ? 'bg-amber-500 text-white border-amber-500 shadow-lg' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-3 block text-center">Hassasiyet (Zorluk)</label>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { v: '30-min', l: '30 Dakika' },
                        { v: '15-min', l: '15 Dakika' },
                        { v: '5-min', l: '5 Dakika' },
                        { v: '1-min', l: '1 Dakika' }
                    ].map(t => (
                        <button
                            key={t.v}
                            onClick={() => onChange('precision', t.v)}
                            className={`w-full py-2 rounded-xl text-[10px] font-black border transition-all ${((options as any).precision || '15-min') === t.v ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-[2rem] border border-emerald-100 dark:border-emerald-800/30">
                <label className="text-[10px] font-black text-emerald-600 uppercase mb-3 block text-center">Saat Sayısı (Sayfa İçi)</label>
                <div className="flex gap-2">
                    {[12, 16].map(count => (
                        <button
                            key={count}
                            onClick={() => onChange('itemCount', count)}
                            className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${(options.itemCount || 12) === count ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm' : 'bg-white dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            {count} Saat
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-3">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Kadran Detayları</h4>
                {[
                    { k: 'showNumbers', l: 'Rakamları Göster' },
                    { k: 'showTicks', l: 'Dakika Çizgileri' },
                    { k: 'is24Hour', l: '24 Saat Formatı' }
                ].map(item => (
                    <div key={item.k} className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">{item.l}</span>
                        <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${((options as any)[item.k] !== false) ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => onChange(item.k, (options as any)[item.k] === false)}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${((options as any)[item.k] !== false) ? 'left-4.5' : 'left-0.5'}`}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
