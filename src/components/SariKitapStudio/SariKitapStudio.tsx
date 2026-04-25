import React, { useRef, useCallback } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { useSariKitapStore } from '../../store/useSariKitapStore';
import { useSariKitapGenerator } from './hooks/useSariKitapGenerator';
import { useExportActions } from './hooks/useExportActions';
import { printService } from '../../utils/printService';
import { SariKitapHeader } from './shared/SariKitapHeader';
import { TypeSelectorPanel } from './shared/TypeSelectorPanel';
import { CommonConfigPanel } from './shared/CommonConfigPanel';
import { A4PreviewShell } from './shared/A4PreviewShell';
import { PreviewToolbar } from './shared/PreviewToolbar';
import { getModule } from './registry';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { worksheetService } from '../../services/worksheetService';
import { ActivityType } from '../../types/activity';
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
    } = useSariKitapStore();

    const { user } = useAuthStore();
    const toast = useToastStore();
    const { generate } = useSariKitapGenerator();
    const { exportToPDF, exportToPNG } = useExportActions();
    const previewRef = useRef<HTMLDivElement>(null);

    const activeModule = getModule(activeType);

    const handlePrint = useCallback(() => {
        const element = previewRef.current;
        if (!element) return;
        
        // Ensure unique ID for targeting
        if (!element.id) {
            element.id = `hizli-okuma-print-${Math.random().toString(36).slice(2, 9)}`;
        }

        printService.generatePdf(`#${element.id}`, 'hizli-okuma', {
            action: 'print',
        });
    }, []);

    const handleExportPDF = useCallback(() => {
        exportToPDF({
            format: 'pdf',
            elementRef: previewRef,
            filename: `bursadisleksi-hizli-okuma-${activeType}-${new Date().getTime()}`,
        });
    }, [exportToPDF, activeType]);

    const handleExportPNG = useCallback(() => {
        exportToPNG({
            format: 'png',
            elementRef: previewRef,
            filename: `bursadisleksi-hizli-okuma-${activeType}-${new Date().getTime()}`,
        });
    }, [exportToPNG, activeType]);

    const handleSave = useCallback(async () => {
        if (!user || !generatedContent) return;

        try {
            await worksheetService.saveWorksheet(
                user.id,
                generatedContent.title || 'BursaDisleksi Hızlı Okuma Etkinliği',
                'sari-kitap-studio' as ActivityType,
                [{
                    title: generatedContent.title || 'BursaDisleksi Hızlı Okuma Etkinliği',
                    instruction: generatedContent.instructions || '',
                    type: activeType,
                    content: generatedContent,
                    config: config,
                    metadata: {
                        generatedAt: generatedContent.generatedAt,
                        model: generatedContent.model
                    }
                }],
                '📒',
                { id: 'hizli-okuma', title: 'Hızlı Okuma' }
            );
            toast.success('Etkinlik başarıyla kaydedildi!');
        } catch (err) {
            console.error('Save error:', err);
            toast.error('Kaydedilirken bir hata oluştu.');
        }
    }, [user, generatedContent, activeType, config, toast]);

    const handleShare = useCallback(() => {
        // Simüle edilmiş paylaşım
        navigator.clipboard.writeText(window.location.href);
        toast.info('Bağlantı panoya kopyalandı! (Paylaşım özelliği yakında)');
    }, [toast]);

    const ConfigPanel = activeModule?.ConfigPanel;
    const Renderer = activeModule?.Renderer;

    return (
        <div className="sari-kitap-studio">
            <SariKitapHeader
                onBack={onBack}
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

                    {/* Son Üretimler (Sol panelin altına taşındı) */}
                    {(Array.isArray(recentGenerations) && recentGenerations.length > 0) && (
                        <div className="sk-panel" style={{ marginTop: 'auto' }}>
                            <div className="sk-section-title">Son Üretimler</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                {recentGenerations.slice(0, 3).map((gen: any, i: number) => (
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

                {/* ═══ SAĞ PANEL: A4 Preview ═══ */}
                <div className="sk-center-panel">
                    <PreviewToolbar
                        onPrint={handlePrint}
                        onExportPDF={handleExportPDF}
                        onExportPNG={handleExportPNG}
                        onSave={handleSave}
                        onShare={handleShare}
                        onAddToWorkbook={onAddToWorkbook}
                        isGenerating={isGenerating}
                    />

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
                                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>BursaDisleksi Hızlı Okuma Stüdyosu</p>
                                <p style={{ fontSize: '0.8125rem' }}>
                                    Soldaki panelden bir format seçin ve &quot;Oluştur&quot; butonuna tıklayın.
                                </p>
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
