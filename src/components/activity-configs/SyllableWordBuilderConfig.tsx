import React from 'react';
import { GeneratorOptions } from '../../types';

const PremiumToggleGroup = ({ label, selected, onChange, options, hint }: { label: string; selected: string; onChange: (v: string) => void; options: { value: string; label: string }[]; hint?: string }) => (
    <div className="space-y-1">
        <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
            {hint && <span className="text-[8px] text-zinc-400 italic">{hint}</span>}
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            {options.map((opt: { value: string; label: string }) => (
                <button key={opt.value} onClick={() => onChange(opt.value)} className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white dark:bg-zinc-600 shadow-sm text-rose-600 dark:text-rose-300' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>{opt.label}</button>
            ))}
        </div>
    </div>
);

const PremiumNumberPicker = ({ label, value, onChange, options }: { label: string; value: number; onChange: (v: number) => void; options: number[] }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block">{label}</label>
        <div className="flex gap-2">
            {options.map(n => (
                <button 
                    key={n} 
                    onClick={() => onChange(n)}
                    className={`flex-1 py-2 text-xs font-black rounded-xl border-2 transition-all ${value === n ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-rose-300'}`}
                >
                    {n}
                </button>
            ))}
        </div>
    </div>
);

export const SyllableWordBuilderConfig: React.FC<{ options: GeneratorOptions; onChange: (k: keyof GeneratorOptions, v: unknown) => void }> = ({ options, onChange }) => {
    return (
        <div className="space-y-5 animate-in fade-in duration-300">
            {/* Premium Başlık */}
            <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/10 dark:to-pink-900/10 rounded-[1.75rem] border border-rose-100 dark:border-rose-800/20 text-center">
                <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">HECE DEDEKTİFİ PRO</h3>
                <p className="text-[9px] text-zinc-600 mt-1">A4 Premium Kompakt Baskı Düzeni</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <PremiumToggleGroup 
                    label="Konu Alanı" 
                    selected={options.topic || 'animals'} 
                    onChange={(v: string) => onChange('topic', v)} 
                    options={[
                        { value: 'animals', label: 'Hayvanlar' },
                        { value: 'fruits', label: 'Meyveler' },
                        { value: 'school', label: 'Okul' },
                        { value: 'nature', label: 'Doğa' }
                    ]} 
                    hint="Kelime havuzunu belirler"
                />

                <PremiumToggleGroup 
                    label="Hece Yoğunluğu" 
                    selected={options.syllableRange || '2-3'} 
                    onChange={(v: string) => onChange('syllableRange', v)} 
                    options={[
                        { value: '1-2', label: 'Kısa' },
                        { value: '2-3', label: 'Orta' },
                        { value: '3-4', label: 'Uzun' }
                    ]} 
                    hint="Kelime uzunluğunu ayarlar"
                />
            </div>

            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 rounded-[1.75rem] border border-amber-100 dark:border-amber-800/20">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-amber-600 uppercase">Premium A4 Yoğunluğu</label>
                    <i className="fa-solid fa-gauge-high text-amber-500 text-xs"></i>
                </div>
                <PremiumNumberPicker 
                    label="Kelime Adedi" 
                    value={options.itemCount || 6} 
                    onChange={(n: number) => onChange('itemCount', n)} 
                    options={[4, 6, 8, 10]} 
                />
                <p className="text-[8px] text-amber-600 mt-2 text-center">
                    <i className="fa-solid fa-info-circle mr-1"></i> 6 kelime: %90 sayfa doluluğu
                </p>
            </div>

            {/* Premium Gelişmiş Ayarlar */}
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-[1.5rem] border border-zinc-200 dark:border-zinc-700">
                <div className="flex items-center gap-2 mb-3">
                    <i className="fa-solid fa-sliders text-zinc-500 text-xs"></i>
                    <span className="text-[9px] font-black text-zinc-600 uppercase">Gelişmiş Ayarlar</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <PremiumToggleGroup 
                        label="Görsel Boyutu" 
                        selected={(options.imageSize as string) || 'medium'} 
                        onChange={(v: string) => onChange('imageSize', v)} 
                        options={[
                            { value: 'small', label: 'Küçük' },
                            { value: 'medium', label: 'Orta' }
                        ]} 
                    />
                    <PremiumToggleGroup 
                        label="Boşluk Yoğunluğu" 
                        selected={(options.spaceDensity as string) || 'compact'} 
                        onChange={(v: string) => onChange('spaceDensity', v)} 
                        options={[
                            { value: 'compact', label: 'Kompakt' },
                            { value: 'standard', label: 'Standart' }
                        ]} 
                    />
                </div>
            </div>
        </div>
    );
};