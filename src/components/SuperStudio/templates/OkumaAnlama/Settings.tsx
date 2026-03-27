import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { OkumaAnlamaSettings } from './types';

export const OkumaAnlamaSettingsPanel: React.FC<TemplateSettingsProps<OkumaAnlamaSettings>> = ({ settings, onChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-100 border-b border-slate-700 pb-2">Okuma Anlama (Bilişsel Yük) Ayarları</h3>
            
            <div className="space-y-4">
                {/* Cognitive Load */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Cümle Başı Kelime Limiti (Bilişsel Yük)</label>
                    <select 
                        value={settings.cognitiveLoadLimit} 
                        onChange={(e) => onChange({ cognitiveLoadLimit: Number(e.target.value) as any })}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value={6}>Süper Kısa (Örn: Disleksi, Max 6 kelime)</option>
                        <option value={8}>Kısa (Max 8 kelime)</option>
                        <option value={12}>Orta (Max 12 kelime)</option>
                        <option value={15}>Standart (Max 15 kelime)</option>
                    </select>
                </div>

                {/* Question Count */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Soru Sayısı: {settings.questionCount}</label>
                    <input 
                        type="range" min="1" max="10" 
                        value={settings.questionCount}
                        onChange={(e) => onChange({ questionCount: parseInt(e.target.value) })}
                        className="w-full accent-blue-500"
                    />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.chunkingEnabled} onChange={(e) => onChange({ chunkingEnabled: e.target.checked })} className="form-checkbox text-blue-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Parçalı Okuma Modu (Chunking)</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.visualScaffolding} onChange={(e) => onChange({ visualScaffolding: e.target.checked })} className="form-checkbox text-blue-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Her Paragrafa SVG İkon Ekle</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.typographicHighlight} onChange={(e) => onChange({ typographicHighlight: e.target.checked })} className="form-checkbox text-blue-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Kök Kelimeleri Kalın Yazdır</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.mindMap5N1K} onChange={(e) => onChange({ mindMap5N1K: e.target.checked })} className="form-checkbox text-blue-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Hikaye Sonu 5N1K Grid Tablosu</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default OkumaAnlamaSettingsPanel;
