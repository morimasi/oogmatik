import React from 'react';
import { GeneratorOptions } from '../../types';

interface InfographicConceptMapConfigProps {
    settings: GeneratorOptions;
    onChange: (newSettings: GeneratorOptions) => void;
}

export const InfographicConceptMapConfig: React.FC<InfographicConceptMapConfigProps> = ({
    settings,
    onChange,
}) => {
    const custom = (settings as any).customSettings || {};

    return (
        <div className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-700 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-sitemap"></i>
                    Kavram Haritası Ayarları
                </h4>
                <div className="text-xs text-blue-600">
                    İnfografik modülü varsayılan ayarlarla AI tarafından otomatik düzenlenir. Şimdilik ekstra bir parametre içermemektedir.
                </div>
            </div>
        </div>
    );
};
