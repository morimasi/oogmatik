
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

const CheckboxTile = ({ label, checked, onChange, icon }: any) => (
    <button 
        onClick={() => onChange(!checked)}
        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${checked ? 'bg-indigo-50 border-indigo-600 text-indigo-600 dark:bg-indigo-900/20' : 'bg-white border-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:border-zinc-700'}`}
    >
        <i className={`fa-solid ${icon} text-lg mb-1`}></i>
        <span className="text-[9px] font-black uppercase">{label}</span>
    </button>
);

export const MathMemoryCardsConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    const toggleOp = (op: string) => {
        const current = options.selectedOperations || [];
        const next = current.includes(op) ? current.filter((o:string) => o !== op) : [...current, op];
        onChange('selectedOperations', next.length > 0 ? next : ['add']);
    };

    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Eşleştirme Modu */}
            <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2rem] border border-indigo-100 dark:border-indigo-800/30">
                <label className="text-[10px] font-black text-indigo-600 uppercase mb-3 block text-center">Eşleştirme Mantığı</label>
                <div className="grid grid-cols-1 gap-2">
                    {[
                        {v: 'op-res', l: 'İşlem - Sonuç (Klasik)', icon: 'fa-equals'},
                        {v: 'vis-num', l: 'Görsel Miktar - Rakam', icon: 'fa-eye'},
                        {v: 'eq-eq', l: 'Denk İşlemler (Zor)', icon: 'fa-scale-balanced'}
                    ].map(t => (
                        <button 
                            key={t.v}
                            onClick={() => onChange('variant', t.v)}
                            className={`flex items-center gap-3 p-3 rounded-xl text-[11px] font-black border transition-all ${options.variant === t.v ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}
                        >
                            <i className={`fa-solid ${t.icon}`}></i>
                            {t.l}
                        </button>
                    ))}
                </div>
            </div>

            {/* İşlem Seçimi */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">İşlem Havuzu</label>
                <div className="grid grid-cols-4 gap-2">
                    <CheckboxTile label="Topla" icon="fa-plus" checked={(options.selectedOperations || []).includes('add')} onChange={() => toggleOp('add')} />
                    <CheckboxTile label="Çıkar" icon="fa-minus" checked={(options.selectedOperations || []).includes('sub')} onChange={() => toggleOp('sub')} />
                    <CheckboxTile label="Çarp" icon="fa-xmark" checked={(options.selectedOperations || []).includes('mult')} onChange={() => toggleOp('mult')} />
                    <CheckboxTile label="Böl" icon="fa-divide" checked={(options.selectedOperations || []).includes('div')} onChange={() => toggleOp('div')} />
                </div>
            </div>

            {/* Kart & Görsel Ayarları */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-700 space-y-5 shadow-inner">
                <CompactSlider 
                    label="Kart Sayısı" 
                    value={options.itemCount || 16} 
                    onChange={(v:number) => onChange('itemCount', v)} 
                    min={8} max={32} icon="fa-clone" unit=" Kart"
                />

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Somutlaştırma Stili</label>
                    <div className="grid grid-cols-3 gap-2">
                        {['ten-frame', 'dice', 'blocks'].map(style => (
                            <button 
                                key={style}
                                onClick={() => onChange('visualStyle', style)}
                                className={`py-2 rounded-lg text-[9px] font-black border transition-all ${options.visualStyle === style ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white dark:bg-zinc-700 text-zinc-400 border-zinc-200'}`}
                            >
                                {style.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase">Kontrol Kodlarını Göster</span>
                    <div className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${options.showNumbers !== false ? 'bg-indigo-600' : 'bg-zinc-300'}`} onClick={() => onChange('showNumbers', options.showNumbers === false)}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${options.showNumbers !== false ? 'left-4.5' : 'left-0.5'}`}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
