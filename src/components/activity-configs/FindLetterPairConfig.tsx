
import React from 'react';
import { GeneratorOptions } from '../../types';
import { CompactToggleGroup, CompactCounter, CompactSlider } from './SharedConfigComponents';

interface ConfigProps {
    options: GeneratorOptions;
    onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const FindLetterPairConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    
    const rows = options.gridRows || options.gridSize || 10;
    const cols = options.gridCols || options.gridSize || 10;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 font-lexend">
            <div className="p-6 bg-[var(--accent-muted)] rounded-[2.5rem] border border-[var(--accent-color)]/10 space-y-5 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                
                <div className="relative z-10">
                    <label className="text-[10px] font-black text-[var(--accent-color)] uppercase tracking-[0.2em] mb-3 block text-center">Hedef Karakter Çifti</label>
                    <input 
                        type="text" maxLength={2} value={options.targetPair || ''} 
                        onChange={e => onChange('targetPair', e.target.value)}
                        placeholder="bd"
                        className="w-full p-5 bg-[var(--bg-paper)] border-2 border-[var(--border-color)] rounded-3xl text-3xl font-black outline-none focus:border-[var(--accent-color)] text-[var(--text-primary)] uppercase text-center tracking-[0.5em] shadow-inner transition-all"
                    />
                </div>
                
                <CompactToggleGroup 
                    label="Harf Tipi" 
                    selected={options.case || 'lower'} 
                    onChange={(v: string) => onChange('case', v)} 
                    options={[{ value: 'lower', label: 'Küçük' }, { value: 'upper', label: 'Büyük' }]} 
                />
            </div>

            <div className="p-6 bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] space-y-6 shadow-sm">
                
                <div className="grid grid-cols-2 gap-6">
                    <CompactSlider 
                        label="Satır" 
                        min={6} 
                        max={16} 
                        value={rows} 
                        onChange={(v: number) => onChange('gridRows', v)} 
                    />
                    <CompactSlider 
                        label="Sütun" 
                        min={6} 
                        max={16} 
                        value={cols} 
                        onChange={(v: number) => onChange('gridCols', v)} 
                    />
                </div>

                <div className="flex justify-between items-center bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border-color)]">
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Tablo Sayısı</span>
                    <div className="w-32">
                         <CompactCounter value={options.itemCount || 1} onChange={(v:number) => onChange('itemCount', v)} min={1} max={4} />
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
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 block">Çeldirici Stratejisi</label>
                    <select 
                        value={options.distractorStrategy || 'similar'} 
                        onChange={e => onChange('distractorStrategy', e.target.value)}
                        className="w-full p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs font-bold outline-none focus:border-[var(--accent-color)] text-[var(--text-primary)] transition-all"
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
