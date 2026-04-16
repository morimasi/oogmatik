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
import { A4CompactRenderer } from './shared/A4CompactRenderer';
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

    // İlk yüklemede ve tip değişiminde otomatik üret
    useEffect(() => {
        handleGenerate();
    }, [config.type]);

    const activityInfo = KELIME_CUMLE_REGISTRY[config.type];
    const Renderer = activityInfo.renderer;

    return (
        <div className="kc-studio-premium-container">
            {/* Animasyonlu Arkaplan */}
            <div className="kc-premium-bg">
                <div className="kc-bg-orb orb-1"></div>
                <div className="kc-bg-orb orb-2"></div>
                <div className="kc-bg-orb orb-3"></div>
            </div>

            <div className="kc-premium-layout">
                {/* SOL PANEL - Ayarlar (Glassmorphism) */}
                <div className="kc-sidebar-glass">
                    <div className="kc-sidebar-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                            {onBack && (
                                <button 
                                    onClick={onBack}
                                    className="kc-btn-back"
                                    title="Geri Dön"
                                >
                                    ←
                                </button>
                            )}
                            <h1 className="kc-brand-title">Kelime-Cümle</h1>
                        </div>
                        <p className="kc-brand-subtitle">Ultra Premium PDF Izgara Stüdyosu</p>
                    </div>

                    <div className="kc-sidebar-scrollable custom-scrollbar">
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

                {/* SAĞ PANEL - A4 Önizleme */}
                <div className="kc-preview-glass">
                    <div className="kc-toolbar-glass">
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="kc-btn-action" onClick={() => window.print()}>
                                🖨️ <span className="btn-text">Kompakt Yazdır</span>
                            </button>
                            <button className="kc-btn-action" onClick={() => console.log('Download')}>
                                💾 <span className="btn-text">İndir</span>
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="kc-btn-accent-glow" onClick={() => onAddToWorkbook?.('kelime-cumle', content)}>
                                📚 Sınıf Kitapçığına Ekle
                            </button>
                        </div>
                    </div>

                    <div className="kc-preview-viewport custom-scrollbar">
                        {error ? (
                            <ErrorFallback onRetry={handleGenerate} />
                        ) : (
                            <div className="kc-a4-wrapper">
                                {content ? (
                                    <A4CompactRenderer ref={previewRef}>
                                        <Renderer 
                                            content={content} 
                                            showAnswers={config.showAnswers} 
                                        />
                                    </A4CompactRenderer>
                                ) : (
                                    <div className="kc-loading-skeleton">Modül Yükleniyor...</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KelimeCumleStudio;
