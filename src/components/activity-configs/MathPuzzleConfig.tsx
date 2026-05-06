
import React from 'react';
import { GeneratorOptions } from '../../types';

const CompactSelect = ({ label, value, onChange, options }: any) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 uppercase block tracking-wider">{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-zinc-200">
            {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

const ToggleButton = ({ label, value, onChange }: any) => (
    <button 
        onClick={() => onChange(!value)}
        className={`flex items-center justify-between w-full p-3 rounded-2xl border transition-all ${value ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-zinc-50 border-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700'}`}
    >
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        <div className={`w-8 h-4 rounded-full relative transition-colors ${value ? 'bg-indigo-500' : 'bg-zinc-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-4.5' : 'left-0.5'}`} />
        </div>
    </button>
);

export const MathPuzzleConfig: React.FC<{ options: GeneratorOptions; onChange: (k: any, v: any) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Ana Ayarlar */}
            <div className="grid grid-cols-1 gap-4 p-5 bg-zinc-50/50 dark:bg-zinc-900/20 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800/50">
                <CompactSelect 
                    label="Bulmaca Türü" 
                    value={options.puzzleType || 'visual'} 
                    onChange={(v: string) => onChange('puzzleType', v)}
                    options={[
                        { value: 'visual', label: '🍎 Görsel Denklem (Meyveli/Nesneli)' },
                        { value: 'logic', label: '🧠 Mantık Bilmecesi & Sayı Arama' },
                        { value: 'magic_square', label: '🔮 Sihirli Kare & Piramit' },
                        { value: 'mixed', label: '🌈 Karma (Hepsi Bir Arada)' }
                    ]}
                />
                
                <div className="grid grid-cols-2 gap-3">
                    <CompactSelect 
                        label="İşlem Kurgusu" 
                        value={options.operationType || 'mixed'} 
                        onChange={(v: string) => onChange('operationType', v)}
                        options={[
                            { value: 'add', label: 'Toplama' },
                            { value: 'mixed', label: 'Toplama & Çıkarma' },
                            { value: 'mult', label: 'Çarpma/Bölme' },
                            { value: 'expert', label: 'Dört İşlem (Zor)' }
                        ]}
                    />
                    <CompactSelect 
                        label="Sayı Aralığı" 
                        value={options.numberRange || '1-20'} 
                        onChange={(v: string) => onChange('numberRange', v)}
                        options={[
                            { value: '1-10', label: '1 - 10' },
                            { value: '1-20', label: '1 - 20' },
                            { value: '1-50', label: '1 - 50' },
                            { value: '1-100', label: '1 - 100' }
                        ]}
                    />
                </div>
            </div>

            {/* Premium Özellikler */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] px-2">Premium Modifikatörler</label>
                <div className="grid grid-cols-1 gap-2">
                    <ToggleButton 
                        label="Hikayeleştirilmiş Sorular" 
                        value={options.storyMode ?? true} 
                        onChange={(v: boolean) => onChange('storyMode', v)} 
                    />
                    <ToggleButton 
                        label="Hece Renklendirme (Sorularda)" 
                        value={options.colorfulText ?? false} 
                        onChange={(v: boolean) => onChange('colorfulText', v)} 
                    />
                    <ToggleButton 
                        label="Kompakt A4 Düzeni" 
                        value={options.compactLayout ?? true} 
                        onChange={(v: boolean) => onChange('compactLayout', v)} 
                    />
                </div>
            </div>

            {/* Sayfa Doluluk Oranı */}
            <div className="p-5 bg-indigo-500/5 dark:bg-indigo-400/5 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/30">
                <label className="text-[10px] font-black text-indigo-400 uppercase mb-4 block text-center tracking-widest">
                    Bulmaca Yoğunluğu (Dolu Dolu A4)
                </label>
                <div className="flex gap-2 p-1 bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-100 dark:border-zinc-700">
                    {[2, 4, 6].map(n => (
                        <button 
                            key={n} 
                            onClick={() => onChange('itemCount', n)}
                            className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${options.itemCount === n ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700'}`}
                        >
                            {n} Bulmaca
                        </button>
                    ))}
                </div>
                <p className="text-[9px] text-zinc-400 mt-3 text-center italic font-medium">
                    * {options.itemCount || 2} adet farklı bulmaca tek sayfaya sığdırılır.
                </p>
            </div>
        </div>
    );
};
