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
        <div className="kc-panel" style={{ padding: '0.75rem' }}>
            <div className="kc-label" style={{ marginBottom: '1rem' }}>
                <span>📑</span> Etkinlik Formatı
            </div>
            <div className="kc-module-grid">
                {types.map((mod) => (
                    <button
                        key={mod.id}
                        className={`kc-module-card ${activeType === mod.id ? 'active' : ''}`}
                        onClick={() => onTypeChange(mod.id)}
                        title={mod.description}
                    >
                        <span className="kc-module-card-icon">{mod.icon}</span>
                        <span className="kc-module-card-label">{mod.title}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
