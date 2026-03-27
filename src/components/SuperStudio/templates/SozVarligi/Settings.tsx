import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { SozVarligiSettings } from './types';

export const SozVarligiSettingsPanel: React.FC<TemplateSettingsProps<SozVarligiSettings>> = ({ settings, onChange }) => {
    const itemTypes = [
        { id: 'deyim', label: 'Deyimler', icon: '🗣️' },
        { id: 'atasozu', label: 'Atasözleri', icon: '📜' },
        { id: 'mecaz', label: 'Mecaz Anlatım', icon: '✨' }
    ];

    const toggleType = (typeId: any) => {
        const newTypes = settings.itemTypes.includes(typeId)
            ? settings.itemTypes.filter(t => t !== typeId)
            : [...settings.itemTypes, typeId];
        onChange({ itemTypes: newTypes });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-100 border-b border-slate-700 pb-2">Söz Varlığı & Anlam Bilgisi Ayarları</h3>
            
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">İçerik Türleri (Çoklu Seçim)</label>
                    <div className="grid grid-cols-3 gap-2">
                        {itemTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => toggleType(type.id)}
                                className={`p-2 flex flex-col items-center gap-1 rounded-lg border transition-all ${
                                    settings.itemTypes.includes(type.id as any) 
                                    ? 'bg-emerald-600 border-emerald-400 text-white' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                            >
                                <span className="text-xl">{type.icon}</span>
                                <span className="text-[10px]">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Madde Sayısı: {settings.count}</label>
                    <input 
                        type="range" min="3" max="12" 
                        value={settings.count}
                        onChange={(e) => onChange({ count: parseInt(e.target.value) })}
                        className="w-full accent-emerald-500"
                    />
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.visualAnalogy} onChange={(e) => onChange({ visualAnalogy: e.target.checked })} className="form-checkbox text-emerald-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Görsel Benzetme / Analog İpucu Ekle</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.contextualUsage} onChange={(e) => onChange({ contextualUsage: e.target.checked })} className="form-checkbox text-emerald-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Hemen Altında Cümle İçinde Kullandır</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default SozVarligiSettingsPanel;
