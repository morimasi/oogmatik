import React from 'react';

interface SariKitapHeaderProps {
    onBack: () => void;
    onPrint: () => void;
    onExportPDF: () => void;
    onExportPNG: () => void;
    isGenerating: boolean;
}

export const SariKitapHeader = ({
    onBack,
    onPrint,
    onExportPDF,
    onExportPNG,
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
                <button
                    className="sk-btn sk-btn-ghost"
                    onClick={onPrint}
                    disabled={isGenerating}
                    title="Yazdır"
                >
                    🖨️ Yazdır
                </button>
                <button
                    className="sk-btn sk-btn-ghost"
                    onClick={onExportPDF}
                    disabled={isGenerating}
                    title="PDF İndir"
                >
                    📄 PDF
                </button>
                <button
                    className="sk-btn sk-btn-ghost"
                    onClick={onExportPNG}
                    disabled={isGenerating}
                    title="PNG İndir"
                >
                    🖼️ PNG
                </button>
            </div>
        </div>
    );
}

SariKitapHeader.displayName = 'SariKitapHeader';
