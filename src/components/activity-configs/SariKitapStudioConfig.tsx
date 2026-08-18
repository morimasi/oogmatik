import React from 'react';
import { GeneratorOptions } from '../../types';

interface SariKitapStudioConfigProps {
    settings: GeneratorOptions;
    onChange: (newSettings: GeneratorOptions) => void;
}

export const SariKitapStudioConfig: React.FC<SariKitapStudioConfigProps> = ({
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
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                <h4 className="text-sm font-semibold text-orange-700 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-book-medical"></i>
                    Sarı Kitap Ayarları
                </h4>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">Modül Seçimi</label>
                        <select
                            value={custom.moduleType || 'pencere'}
                            onChange={(e) => updateCustom('moduleType', e.target.value)}
                            className="w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="pencere">Johari Penceresi Deneyimi</option>
                            <option value="nokta">Odak - Noktalar</option>
                            <option value="kopru">Köprü Kurma</option>
                            <option value="ciftmetin">Çift Metin Analizi</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};
