import React from 'react';
import { TemplateSettingsProps } from './types';

export const MantikMuhakemeSettings: React.FC<TemplateSettingsProps> = ({ settings, onChange }) => {
    return (
        <div className="space-y-3 mt-3">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Mantık Türü</label>
                <select
                    value={settings.type || 'karma'}
                    onChange={(e) => onChange({ type: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-teal-500"
                >
                    <option value="siralama">Sıralama / Şifreleme</option>
                    <option value="cikarim">Metinden Çıkarım (Paragraf)</option>
                    <option value="karma">Karma (AI Algoritması)</option>
                </select>
            </div>
            <div>
                <label className="block text-xs text-slate-400 mb-1">Bulmaca Adedi</label>
                <input
                    type="number"
                    min={1} max={5}
                    value={settings.itemCount || 2}
                    onChange={(e) => onChange({ itemCount: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-teal-500"
                />
            </div>
        </div>
    );
};
