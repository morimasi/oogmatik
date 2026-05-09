import React from 'react';
import { GeneratorOptions } from '../../types';

interface ToggleOption {
    value: any;
    label: string;
}

interface ToggleGroupProps {
    label: string;
    selected: any;
    onChange: (val: any) => void;
    options: ToggleOption[];
}

const CompactToggleGroup = ({ label, selected, onChange, options }: ToggleGroupProps) => (
    <div className="space-y-1 mt-4">
        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase block">{label}</label>
        <div className="flex bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)]">
            {options.map((opt) => (
                <button 
                    key={opt.value} 
                    onClick={() => onChange(opt.value)} 
                    className={`flex-1 py-1.5 text-[10px] font-black rounded-md transition-all ${selected === opt.value ? 'bg-[var(--bg-paper)] shadow-md text-[var(--accent-color)] border border-[var(--border-color)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-glass)]'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

interface ConfigProps {
    options: any;
    onChange: (key: any, value: any) => void;
}

export const QueueOrderingConfig = ({ options, onChange }: ConfigProps) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Lokasyon ve Tema */}
            <div className="p-4 bg-[var(--surface-glass)] rounded-[2rem] border border-[var(--border-color)]">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase block">Senaryo Mekanı</label>
                        <select
                            value={options.locationType || 'school'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('locationType', e.target.value)}
                            className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)]"
                        >
                            <option value="school">Okul / Kantin</option>
                            <option value="bus">Otobüs / Durak</option>
                            <option value="market">Market / Kasa</option>
                            <option value="hospital">Hastane / Eczane</option>
                            <option value="cinema">Sinema / Tiyatro</option>
                            <option value="library">Kütüphane</option>
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase block">Görsel Tema</label>
                        <select
                            value={options.theme || 'indigo'}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange('theme', e.target.value)}
                            className="w-full p-2 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-xl text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)]"
                        >
                            <option value="indigo">Gece Mavisi</option>
                            <option value="emerald">Zümrüt Yeşil</option>
                            <option value="amber">Kehribar</option>
                            <option value="rose">Gül Kurusu</option>
                            <option value="blue">Deniz Mavisi</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Ölçeklendirme */}
            <div className="p-5 bg-[var(--bg-paper)] rounded-[2.5rem] border border-[var(--border-color)] shadow-sm">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[var(--accent-color)] uppercase block">Soru Sayısı</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={options.problemCount || 4}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('problemCount', parseInt(e.target.value))}
                            className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-[var(--accent-color)] uppercase block">Max Sıra Boyu</label>
                        <input
                            type="number"
                            min={3}
                            max={15}
                            value={options.maxQueueSize || 10}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('maxQueueSize', parseInt(e.target.value))}
                            className="w-full p-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl text-xs font-black text-[var(--text-primary)] outline-none focus:border-[var(--accent-color)]"
                        />
                    </div>
                </div>

                <div className="mt-5 space-y-4">
                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange('showVisualClues', options.showVisualClues !== false ? false : true)}>
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] uppercase transition-colors cursor-pointer">Görsel İpuçları Göster</label>
                        <button
                            className={`w-10 h-5 rounded-full transition-colors relative ${options.showVisualClues !== false ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]/70'}`}
                        >
                            <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${options.showVisualClues !== false ? 'left-6 shadow-md' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between group cursor-pointer" onClick={() => onChange('showPositionNumbers', options.showPositionNumbers !== false ? false : true)}>
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] uppercase transition-colors cursor-pointer">Sıra Numaralarını Göster</label>
                        <button
                            className={`w-10 h-5 rounded-full transition-colors relative ${options.showPositionNumbers !== false ? 'bg-[var(--accent-color)]' : 'bg-[var(--border-color)]/70'}`}
                        >
                            <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${options.showPositionNumbers !== false ? 'left-6 shadow-md' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                <CompactToggleGroup
                    label="İkon Stili"
                    selected={options.iconStyle || 'emoji'}
                    onChange={(v: string) => onChange('iconStyle', v)}
                    options={[
                        { value: 'emoji', label: 'Emoji' },
                        { value: 'avatar', label: 'Profil' },
                        { value: 'minimal', label: 'Minimal' }
                    ]}
                />
            </div>
        </div>
    );
};
