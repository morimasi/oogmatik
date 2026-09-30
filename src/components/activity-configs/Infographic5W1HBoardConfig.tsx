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
            <div className="p-4 bg-[var(--accent-muted)] rounded-xl border border-[var(--border-color)]">
                <h4 className="text-sm font-semibold text-[var(--accent-color)] mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-clipboard-question"></i>
                    5N1K Panosu Ayarları
                </h4>
                <div className="text-xs text-[var(--accent-color)]">
                    İnfografik 5N1K modülü varsayılan ayarlarla AI tarafından içeriğe uygun olarak üretilir.
                </div>
            </div>
        </div>
    );
};
