import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { HeceSesSettings } from './types';

export const HeceSesSettingsPanel: React.FC<TemplateSettingsProps<HeceSesSettings>> = ({ settings, onChange }) => {
    const eventsList = [
        { id: 'heceleme', label: 'Heceleme' },
        { id: 'yumusama', label: 'Ünsüz Yumuşaması' },
        { id: 'sertlesme', label: 'Ünsüz Benzeşmesi' },
        { id: 'ses-dusmesi', label: 'Ses Düşmesi' }
    ];

    const toggleEvent = (eventId: any) => {
        const newEvents = settings.focusEvents.includes(eventId)
            ? settings.focusEvents.filter(e => e !== eventId)
            : [...settings.focusEvents, eventId];
        onChange({ focusEvents: newEvents });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-100 border-b border-slate-700 pb-2">Hece & Ses Olayları Ayarları</h3>
            
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Odaklanılacak Ses Olayları</label>
                    <div className="grid grid-cols-2 gap-2">
                        {eventsList.map((event) => (
                            <button
                                key={event.id}
                                onClick={() => toggleEvent(event.id)}
                                className={`p-2 text-[10px] rounded-lg border transition-all ${
                                    settings.focusEvents.includes(event.id as any) 
                                    ? 'bg-purple-600 border-purple-400 text-white' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                            >
                                {event.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Kelime Sayısı: {settings.wordCount}</label>
                    <input 
                        type="range" min="5" max="20" 
                        value={settings.wordCount}
                        onChange={(e) => onChange({ wordCount: parseInt(e.target.value) })}
                        className="w-full accent-purple-500"
                    />
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.syllableHighlight} onChange={(e) => onChange({ syllableHighlight: e.target.checked })} className="form-checkbox text-purple-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Hece Sınırlarını [ ] İle Görselleştir</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.multisensorySupport} onChange={(e) => onChange({ multisensorySupport: e.target.checked })} className="form-checkbox text-purple-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">İşitsel Vurgu (BÜYÜK Harf İpucu)</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default HeceSesSettingsPanel;
