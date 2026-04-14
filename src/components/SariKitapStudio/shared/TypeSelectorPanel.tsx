import React from 'react';
import type { SariKitapActivityType } from '../../../types/sariKitap';
import { MODULE_LIST } from '../constants';

interface TypeSelectorPanelProps {
    activeType: SariKitapActivityType;
    onSelect: (type: SariKitapActivityType) => void;
}

export const TypeSelectorPanel: React.FC<TypeSelectorPanelProps> = React.memo(
    ({ activeType, onSelect }) => {
        return (
            <div className="sk-panel">
                <div className="sk-section-title">Etkinlik Formatı</div>
                <div className="sk-module-grid">
                    {MODULE_LIST.map((mod) => (
                        <button
                            key={mod.type}
                            className={`sk-module-card ${activeType === mod.type ? 'active' : ''}`}
                            onClick={() => onSelect(mod.type)}
                            title={mod.description}
                        >
                            <span className="sk-module-card-icon">{mod.icon}</span>
                            <span className="sk-module-card-label">{mod.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }
);

TypeSelectorPanel.displayName = 'TypeSelectorPanel';
