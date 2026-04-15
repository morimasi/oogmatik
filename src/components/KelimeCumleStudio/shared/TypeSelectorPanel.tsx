import React from 'react';

interface TypeSelectorPanelProps {
    types: Array<{
        id: string;
        title: string;
        icon: string;
        description: string;
    }>;
    activeType: string;
    onTypeChange: (type: string) => void;
}

export const TypeSelectorPanel: React.FC<TypeSelectorPanelProps> = ({ types, activeType, onTypeChange }) => {
    return (
        <div className="sk-panel">
            <div className="sk-section-title">Etkinlik Formatı</div>
            <div className="sk-module-grid">
                {types.map((mod) => (
                    <button
                        key={mod.id}
                        className={`sk-module-card ${activeType === mod.id ? 'active' : ''}`}
                        onClick={() => onTypeChange(mod.id)}
                        title={mod.description}
                    >
                        <span className="sk-module-card-icon">{mod.icon}</span>
                        <span className="sk-module-card-label">{mod.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
