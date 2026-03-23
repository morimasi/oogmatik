import React from 'react';
import { TemplateSettingsProps } from './types';

export const DilBilgisiSettings: React.FC<TemplateSettingsProps> = ({ settings, onChange }) => {
    return (
        <div className="space-y-3 mt-3">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Odaklanılacak Konu</label>
                <select
                    value={settings.focus || 'tum'}
                    onChange={(e) => onChange({ focus: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-teal-500"
                >
                    <option value="tum">Genel / Karma</option>
                    <option value="isim-sifat">İsimler ve Sıfatlar</option>
                    <option value="fiil">Fiiller ve Eylemsiler</option>
                    <option value="anlatim">Anlatım Bozuklukları</option>
                </select>
            </div>
            <div className="flex items-center mt-2">
                <input
                    type="checkbox"
                    className="mr-2"
                    checked={settings.includeTheory || false}
                    onChange={(e) => onChange({ includeTheory: e.target.checked })}
                />
                <span className="text-xs text-slate-400">Kısa Konu Anlatımı Ekle</span>
            </div>
        </div>
    );
};
