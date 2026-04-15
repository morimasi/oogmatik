import React from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';

interface PreviewToolbarProps {
    onPrint: () => void;
    onExportPDF: () => void;
    onExportPNG: () => void;
    onSave: () => void;
    onShare: () => void;
    onAddToWorkbook?: () => void;
    isGenerating: boolean;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({
    onPrint,
    onExportPDF,
    onExportPNG,
    onSave,
    onShare,
    onAddToWorkbook,
    isGenerating,
}) => {
    const { 
        previewScale, 
        setPreviewScale, 
        showGrid, 
        toggleGrid,
        generatedContent 
    } = useSariKitapStore();

    return (
        <div className="sk-preview-toolbar">
            <div className="sk-toolbar-group">
                <button
                    className="sk-btn sk-btn-primary"
                    onClick={onSave}
                    disabled={isGenerating || !generatedContent}
                    title="Çalışmayı Kaydet"
                >
                    💾 Kaydet
                </button>
                <button
                    className="sk-btn sk-btn-ghost"
                    onClick={onPrint}
                    disabled={isGenerating || !generatedContent}
                    title="Yazdır"
                >
                    🖨️ Yazdır
                </button>
                <div className="sk-toolbar-dropdown">
                    <button className="sk-btn sk-btn-ghost" disabled={isGenerating || !generatedContent}>
                        📥 İndir ▾
                    </button>
                    <div className="sk-dropdown-content">
                        <button onClick={onExportPDF}>📄 PDF olarak indir</button>
                        <button onClick={onExportPNG}>🖼️ PNG olarak indir</button>
                    </div>
                </div>
                <button
                    className="sk-btn sk-btn-ghost"
                    onClick={onShare}
                    disabled={isGenerating || !generatedContent}
                    title="Paylaş"
                >
                    🔗 Paylaş
                </button>
                {onAddToWorkbook && (
                    <button
                        className="sk-btn sk-btn-ghost"
                        onClick={onAddToWorkbook}
                        disabled={isGenerating || !generatedContent}
                        title="Kitapçığa Ekle"
                    >
                        📚 Kitapçığa Ekle
                    </button>
                )}
            </div>

            <div className="sk-toolbar-divider" />

            <div className="sk-toolbar-group">
                <div className="sk-toolbar-scale">
                    <span style={{ fontSize: '0.75rem', color: 'var(--sk-text-muted)', minWidth: '3ch' }}>
                        {Math.round(previewScale * 100)}%
                    </span>
                    <input
                        type="range"
                        min={0.3}
                        max={1.5}
                        step={0.1}
                        value={previewScale}
                        onChange={(e) => setPreviewScale(Number(e.target.value))}
                        style={{ width: '80px' }}
                    />
                </div>
                <button
                    className={`sk-btn sk-btn-icon ${showGrid ? 'active' : ''}`}
                    onClick={toggleGrid}
                    title="Izgara Göster/Gizle"
                >
                    #
                </button>
            </div>

            {generatedContent && (
                <div className="sk-toolbar-info">
                    <div className="sk-info-trigger">💡 Bilgi</div>
                    <div className="sk-info-tooltip">
                        <div className="sk-section-title">Pedagojik Not</div>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.75rem' }}>
                            {generatedContent.pedagogicalNote}
                        </p>
                        <div className="sk-section-title">Hedef Beceriler</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {generatedContent.targetSkills.map((skill, i) => (
                                <span key={i} className="sk-skill-badge">{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
