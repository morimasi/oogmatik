import React from 'react';
import { GeneratorOptions } from '../../types';

interface SemanticLinkerConfigProps {
    settings: GeneratorOptions;
    onChange: (newSettings: GeneratorOptions) => void;
}

export const SemanticLinkerConfig: React.FC<SemanticLinkerConfigProps> = ({
    settings,
    onChange,
}) => {
    const custom = (settings as any).customSettings || {};

    const updateCustom = (key: string, value: any) => {
        onChange({
            ...settings,
            customSettings: {
                ...custom,
                [key]: value,
            },
        });
    };

    return (
        <div className="space-y-6">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                <h4 className="text-sm font-semibold text-indigo-700 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-sliders"></i>
                    Anlamsal İlişki Ayarları
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Zorluk Seviyesi</label>
                        <select
                            value={custom.difficulty || 'Orta'}
                            onChange={(e) => updateCustom('difficulty', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="Kolay">Kolay</option>
                            <option value="Orta">Orta</option>
                            <option value="Zor">Zor</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
