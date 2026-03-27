import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { YazimNoktalamaSettings } from './types';

export const YazimNoktalamaSettingsPanel: React.FC<TemplateSettingsProps<YazimNoktalamaSettings>> = ({ settings, onChange }) => {
    const rulesList = [
        { id: 'buyuk-harf', label: 'Büyük Harf Kullanımı' },
        { id: 'kesme-isareti', label: 'Kesme İşareti' },
        { id: 'noktalama', label: 'Noktalama İşaretleri' },
        { id: 'bitisik-ayri', label: 'Bitişik/Ayrı Yazım' }
    ];

    const toggleRule = (ruleId: any) => {
        const newRules = settings.focusRules.includes(ruleId)
            ? settings.focusRules.filter(r => r !== ruleId)
            : [...settings.focusRules, ruleId];
        onChange({ focusRules: newRules });
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-100 border-b border-slate-700 pb-2">Yazım & Noktalama Ayarları</h3>
            
            <div className="space-y-4">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Odaklanılacak Kurallar (Çoklu Seçim)</label>
                    <div className="grid grid-cols-2 gap-2">
                        {rulesList.map((rule) => (
                            <button
                                key={rule.id}
                                onClick={() => toggleRule(rule.id)}
                                className={`p-2 text-xs rounded-lg border transition-all ${
                                    settings.focusRules.includes(rule.id as any) 
                                    ? 'bg-rose-600 border-rose-400 text-white' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                            >
                                {rule.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Egzersiz Sayısı: {settings.exerciseCount}</label>
                    <input 
                        type="range" min="3" max="15" 
                        value={settings.exerciseCount}
                        onChange={(e) => onChange({ exerciseCount: parseInt(e.target.value) })}
                        className="w-full accent-rose-500"
                    />
                </div>

                <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.showRuleHint} onChange={(e) => onChange({ showRuleHint: e.target.checked })} className="form-checkbox text-rose-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Kural Hatırlatıcı Kartı Ekle</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input type="checkbox" checked={settings.errorCorrectionMode} onChange={(e) => onChange({ errorCorrectionMode: e.target.checked })} className="form-checkbox text-rose-500 rounded h-5 w-5 bg-slate-900 border-slate-700" />
                        <span className="text-sm text-slate-300 font-medium">Hata Dedektifi (Düzeltme Modu)</span>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default YazimNoktalamaSettingsPanel;
