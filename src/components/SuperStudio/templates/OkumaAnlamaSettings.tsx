import React from 'react';
import { TemplateSettingsProps } from './types';

export const OkumaAnlamaSettings: React.FC<TemplateSettingsProps> = ({ settings, onChange }) => {
    return (
        <div className="space-y-3 mt-3">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Metin Uzunluğu</label>
                <select
                    value={settings.length || 'kisa'}
                    onChange={(e) => onChange({ length: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-teal-500"
                >
                    <option value="kisa">Kısa (100-150 Kelime)</option>
                    <option value="orta">Orta (150-250 Kelime)</option>
                    <option value="uzun">Uzun (250+ Kelime)</option>
                </select>
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1">Soru Sayısı</label>
                <input
                    type="number"
                    min={1} max={10}
                    value={settings.questionCount || 3}
                    onChange={(e) => onChange({ questionCount: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-teal-500"
                />
            </div>
        </div>
    );
};
