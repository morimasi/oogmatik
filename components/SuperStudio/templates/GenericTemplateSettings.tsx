import React from 'react';
import { TemplateSettingsProps } from './types';

export const GenericTemplateSettings: React.FC<TemplateSettingsProps> = ({ templateId, settings, onChange }) => {
    return (
        <div className="space-y-3 mt-3">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Soru / Öge Adedi</label>
                <input
                    type="number"
                    min={1} max={10}
                    value={settings.count || 5}
                    onChange={(e) => onChange({ count: parseInt(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-300 outline-none focus:border-teal-500"
                />
            </div>
            <div className="text-xs text-slate-500 italic mt-2">
                Bu modül ({templateId.replace('-', ' ')}) jenerik premium ayar şablonunu kullanmaktadır.
            </div>
        </div>
    );
};
