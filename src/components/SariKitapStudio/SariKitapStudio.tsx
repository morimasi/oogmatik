import React, { useRef, useCallback } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { useSariKitapStore } from '../../store/useSariKitapStore';
import { useSariKitapGenerator } from './hooks/useSariKitapGenerator';
import { useExportActions } from './hooks/useExportActions';
import { SariKitapHeader } from './shared/SariKitapHeader';
import { TypeSelectorPanel } from './shared/TypeSelectorPanel';
import { CommonConfigPanel } from './shared/CommonConfigPanel';
import { A4PreviewShell } from './shared/A4PreviewShell';
import { ErrorFallback } from './shared/ErrorFallback';
import { getModule } from './registry';
import './SariKitapStudio.css';

interface SariKitapStudioInnerProps {
    onBack: () => void;
    onAddToWorkbook?: () => void;
}

const SariKitapStudioInner = ({ onBack, onAddToWorkbook }: SariKitapStudioInnerProps) => {
    const {
        activeType,
        config,
        isGenerating,
        generationMode,
        generatedContent,
        error,
        previewScale,
        showGrid,
        recentGenerations,
        setActiveType,
        updateConfig,
        setGenerationMode,
        setContent,
        setPreviewScale,
        toggleGrid,
    } = useSariKitapStore();

    const { generate } = useSariKitapGenerator();
    const { exportToPDF, exportToPNG } = useExportActions();
    const previewRef = useRef<HTMLDivElement>(null);

    const activeModule = getModule(activeType);

    const handlePrint = useCallback(() => {
        window.print();
    }, []);

    const handleExportPDF = useCallback(() => {
        exportToPDF({
            format: 'pdf',
            elementRef: previewRef,
            filename: `sari-kitap-${activeType}`,
        });
    }, [exportToPDF, activeType]);

    const handleExportPNG = useCallback(() => {
        exportToPNG({
            format: 'png',
            elementRef: previewRef,
            filename: `sari-kitap-${activeType}`,
        });
    }, [exportToPNG, activeType]);

    const ConfigPanel = activeModule?.ConfigPanel;
    const Renderer = activeModule?.Renderer;

    return (
        <div className="sari-kitap-studio">
            <SariKitapHeader
                onBack={onBack}
                onPrint={handlePrint}
                onExportPDF={handleExportPDF}
                onExportPNG={handleExportPNG}
                isGenerating={isGenerating}
            />

            <div className="sk-body">
                {/* ═══ SOL PANEL: Config ═══ */}
                <div className="sk-left-panel">
                    <TypeSelectorPanel activeType={activeType} onSelect={setActiveType} />

                    <CommonConfigPanel
                        config={config}
                        onUpdate={updateConfig}
                        generationMode={generationMode}
                        onModeChange={setGenerationMode}
                    />

                    {ConfigPanel && (
                        <ConfigPanel config={config} onUpdate={updateConfig} />
                    )}

                    <button
                        className={`sk-generate-btn ${isGenerating ? 'generating' : ''}`}
                        onClick={generate}
                        disabled={isGenerating}
                    >
                        {isGenerating ? '⏳ Üretiliyor...' : '✨ Oluştur'}
                    </button>

                    {error && <div className="sk-error">⚠️ {error}</div>}
                </div>

                {/* ═══ ORTA PANEL: A4 Preview ═══ */}
                <div className="sk-center-panel">
                    {generatedContent && Renderer ? (
                        <A4PreviewShell
                            ref={previewRef}
                            scale={previewScale}
                            showGrid={showGrid}
                            typography={config.typography}
                        >
                            <ErrorBoundary>
                                <Renderer config={config} content={generatedContent} />
                            </ErrorBoundary>
                        </A4PreviewShell>
                    ) : (
                        <div className="sk-empty-state">
                            <div className="sk-empty-state-icon">📒</div>
                            <div>
                                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Sarı Kitap Stüdyosu</p>
                                <p style={{ fontSize: '0.8125rem' }}>
                                    Soldaki panelden bir format seçin ve &quot;Oluştur&quot; butonuna tıklayın.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ SAĞ PANEL: Bilgi + Geçmiş ═══ */}
                <div className="sk-right-panel">
                    {/* Preview Kontrolleri */}
                    <div className="sk-panel">
                        <div className="sk-section-title">Önizleme</div>
                        <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                            <div>
                                <label className="sk-label">Ölçek ({Math.round(previewScale * 100)}%)</label>
                                <input
                                    type="range"
                                    className="sk-input"
                                    style={{ padding: '0.25rem' }}
                                    min={0.3}
                                    max={1.5}
                                    step={0.1}
                                    value={previewScale}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreviewScale(Number(e.target.value))}
                                />
                            </div>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'rgba(255,255,255,0.8)', cursor: 'pointer' }}>
                                <input type="checkbox" checked={showGrid} onChange={toggleGrid} />
                                Izgara Göster
                            </label>
                        </div>
                    </div>

                    {/* Pedagojik Bilgi */}
                    {generatedContent && (
                        <div className="sk-panel">
                            <div className="sk-section-title">Pedagojik Bilgi</div>
                            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                                {generatedContent.pedagogicalNote}
                            </p>
                            {generatedContent.targetSkills.length > 0 && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div className="sk-label">Hedef Beceriler</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                        {generatedContent.targetSkills.map((skill: string, i: number) => (
                                            <span
                                                key={i}
                                                style={{
                                                    padding: '0.125rem 0.5rem',
                                                    background: 'rgba(234,179,8,0.1)',
                                                    border: '1px solid rgba(234,179,8,0.2)',
                                                    borderRadius: '1rem',
                                                    fontSize: '0.6875rem',
                                                    color: '#eab308',
                                                }}
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Son Üretimler */}
                    {recentGenerations.length > 0 && (
                        <div className="sk-panel">
                            <div className="sk-section-title">Son Üretimler ({recentGenerations.length})</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                {recentGenerations.slice(0, 5).map((gen: any, i: number) => (
                                    <div
                                        key={i}
                                        className="sk-history-item"
                                        onClick={() => setContent(gen)}
                                    >
                                        <div className="sk-history-item-title">{gen.title}</div>
                                        <div className="sk-history-item-meta">
                                            {new Date(gen.generatedAt).toLocaleTimeString('tr-TR')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Error Boundary Wrapper ──────────────────────────────────────

export const SariKitapStudio = (props: SariKitapStudioInnerProps) => {
    return (
        <ErrorBoundary>
            <SariKitapStudioInner {...props} />
        </ErrorBoundary>
    );
};
