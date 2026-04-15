import React, { useState, useEffect, useRef } from 'react';
import { 
    KelimeCumleConfig, 
    KelimeCumleGeneratedContent, 
    KelimeCumleActivityType 
} from '../../types/kelimeCumle';
import { KELIME_CUMLE_REGISTRY } from './registry';
import { useKelimeCumleGenerator } from './hooks/useKelimeCumleGenerator';
import { TypeSelectorPanel } from './shared/TypeSelectorPanel';
import { CommonConfigPanel } from './shared/CommonConfigPanel';
import { ErrorFallback } from './shared/ErrorFallback';
import { A4PreviewShell } from '../SariKitapStudio/shared/A4PreviewShell';
import './KelimeCumleStudio.css';

interface KelimeCumleStudioProps {
    onBack?: () => void;
    onAddToWorkbook?: (activityType: any, data: any) => void;
}

const KelimeCumleStudio: React.FC<KelimeCumleStudioProps> = ({ onBack, onAddToWorkbook }) => {
    const [config, setConfig] = useState<KelimeCumleConfig>({
        id: crypto.randomUUID(),
        type: 'bosluk_doldurma',
        ageGroup: '8-10',
        difficulty: 'Orta',
        title: 'Yeni Etkinlik',
        itemCount: 10,
        showAnswers: false,
        topics: ['Genel']
    });

    const [content, setContent] = useState<KelimeCumleGeneratedContent | null>(null);
    const [generationMode, setGenerationMode] = useState<'ai' | 'offline'>('offline');
    const { generateOffline, generateAI, isGenerating, error } = useKelimeCumleGenerator();
    const previewRef = useRef<HTMLDivElement>(null);

    const handleGenerate = async () => {
        if (generationMode === 'offline') {
            const newContent = generateOffline(config);
            setContent(newContent);
        } else {
            try {
                const newContent = await generateAI(config);
                setContent(newContent);
            } catch (e) {
                console.error(e);
            }
        }
    };

    // İlk yüklemede bir tane üret
    useEffect(() => {
        handleGenerate();
    }, [config.type]); // Tip değiştiğinde otomatik üret

    const activityInfo = KELIME_CUMLE_REGISTRY[config.type];
    const Renderer = activityInfo.renderer;

    return (
        <div className="kc-studio-container">
            {/* Sol Panel: Ayarlar */}
            <div className="kc-sidebar">
                <div className="kc-sidebar-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        {onBack && (
                            <button 
                                onClick={onBack}
                                style={{ 
                                    background: 'rgba(255,255,255,0.1)', 
                                    border: 'none', 
                                    color: 'white', 
                                    width: '32px', 
                                    height: '32px', 
                                    borderRadius: '50%', 
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ←
                            </button>
                        )}
                        <h1 style={{ margin: 0 }}>Kelime-Cümle Stüdyosu</h1>
                    </div>
                    <p>Profesyonel dil becerileri materyalleri</p>
                </div>

                <div className="kc-sidebar-content">
                    <TypeSelectorPanel 
                        types={Object.entries(KELIME_CUMLE_REGISTRY).map(([key, val]) => ({
                            id: key,
                            title: val.title,
                            icon: val.icon,
                            description: val.description
                        }))}
                        activeType={config.type}
                        onTypeChange={(type) => setConfig(prev => ({ ...prev, type: type as KelimeCumleActivityType }))}
                    />

                    <CommonConfigPanel 
                        config={config}
                        generationMode={generationMode}
                        onConfigChange={(updates) => setConfig(prev => ({ ...prev, ...updates }))}
                        onModeChange={setGenerationMode}
                        onGenerate={handleGenerate}
                        isGenerating={isGenerating}
                    />
                </div>
            </div>

            {/* Sağ Panel: Önizleme */}
            <div className="kc-preview-area">
                <div className="kc-toolbar-wrapper" style={{ 
                    padding: '1rem 2rem', 
                    background: 'rgba(15, 23, 42, 0.9)', 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="kc-btn-primary" onClick={() => window.print()}>🖨️ Yazdır</button>
                        <button className="kc-btn-secondary" onClick={() => console.log('Download')}>💾 İndir</button>
                        <button className="kc-btn-secondary" onClick={() => console.log('Archive')}>📁 Arşivle</button>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="kc-btn-secondary" onClick={() => console.log('Share')}>🔗 Paylaş</button>
                        <button className="kc-btn-accent" onClick={() => onAddToWorkbook?.('kelime-cumle', content)}>📚 Kitapçığa Ekle</button>
                    </div>
                </div>

                <div className="kc-preview-viewport">
                    {error ? (
                        <ErrorFallback onRetry={handleGenerate} />
                    ) : (
                        <A4PreviewShell ref={previewRef}>
                            {content && (
                                <Renderer 
                                    content={content} 
                                    showAnswers={config.showAnswers} 
                                />
                            )}
                        </A4PreviewShell>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KelimeCumleStudio;
