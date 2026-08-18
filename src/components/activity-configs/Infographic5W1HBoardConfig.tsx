import React from 'react';
import { GeneratorOptions } from '../../types';

interface Infographic5W1HBoardConfigProps {
    settings: GeneratorOptions;
    onChange: (newSettings: GeneratorOptions) => void;
}

export const Infographic5W1HBoardConfig: React.FC<Infographic5W1HBoardConfigProps> = ({
    settings,
    onChange,
}) => {
    const custom = (settings as any).customSettings || {};

    return (
        <div className="space-y-6">
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                <h4 className="text-sm font-semibold text-purple-700 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-clipboard-question"></i>
                    5N1K Panosu Ayarları
                </h4>
                <div className="text-xs text-purple-600">
                    İnfografik 5N1K modülü varsayılan ayarlarla AI tarafından içeriğe uygun olarak üretilir.
                </div>
            </div>
        </div>
    );
};
