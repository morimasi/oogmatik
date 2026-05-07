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
        <label className="text-[10px] font-bold text-zinc-500 uppercase block">{label}</label>
        <div className="flex bg-zinc-100 p-1 rounded-lg border border-zinc-200">
            {options.map((opt) => (
                <button 
                    key={opt.value} 
                    onClick={() => onChange(opt.value)} 
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${selected === opt.value ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
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

export const QueueOrderingConfig: React.FC<ConfigProps> = ({ options, onChange }) => {
    return (
        <div className="space-y-4 animate-in fade-in duration-300">
            {/* Lokasyon ve Tema */}
            <div className="p-4 bg-indigo-50/50 rounded-[2rem] border border-indigo-100">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Senaryo Mekanı</label>
                        <select
                            value={options.locationType || 'school'}
                            onChange={e => onChange('locationType', e.target.value)}
                            className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-[11px] font-bold outline-none focus:border-indigo-500"
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
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Görsel Tema</label>
                        <select
                            value={options.theme || 'indigo'}
                            onChange={e => onChange('theme', e.target.value)}
                            className="w-full p-2 bg-white border border-indigo-200 rounded-xl text-[11px] font-bold outline-none focus:border-indigo-500"
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
            <div className="p-5 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Soru Sayısı</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={options.problemCount || 4}
                            onChange={e => onChange('problemCount', parseInt(e.target.value))}
                            className="w-full p-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block">Max Sıra Boyu</label>
                        <input
                            type="number"
                            min={3}
                            max={15}
                            value={options.maxQueueSize || 10}
                            onChange={e => onChange('maxQueueSize', parseInt(e.target.value))}
                            className="w-full p-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Görsel İpuçları Göster</label>
                        <button
                            onClick={() => onChange('showVisualClues', options.showVisualClues !== false ? false : true)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${options.showVisualClues !== false ? 'bg-indigo-500' : 'bg-zinc-300'}`}
                        >
                            <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${options.showVisualClues !== false ? 'left-6' : 'left-1'}`} />
                        </button>
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Sıra Numaralarını Göster</label>
                        <button
                            onClick={() => onChange('showPositionNumbers', options.showPositionNumbers !== false ? false : true)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${options.showPositionNumbers !== false ? 'bg-indigo-500' : 'bg-zinc-300'}`}
                        >
                            <div className={`w-3 h-3 rounded-full bg-white absolute top-1 transition-transform ${options.showPositionNumbers !== false ? 'left-6' : 'left-1'}`} />
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
