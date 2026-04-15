import React from 'react';

interface SariKitapHeaderProps {
    onBack: () => void;
    isGenerating: boolean;
}

export const SariKitapHeader = ({
    onBack,
    isGenerating,
}: SariKitapHeaderProps) => {
    return (
        <div className="sk-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="sk-btn-icon" onClick={onBack} title="Geri">
                    ←
                </button>
                <span className="sk-header-title">📒 Sarı Kitap Stüdyosu</span>
            </div>

            <div className="sk-header-actions">
                {isGenerating && <span style={{ fontSize: '0.8125rem', color: 'var(--sk-primary)' }}>✨ AI Üretiyor...</span>}
            </div>
        </div>
    );
}

SariKitapHeader.displayName = 'SariKitapHeader';
