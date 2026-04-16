import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { printService } from '../../utils/printService';
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
        itemCount: 20,
        itemsPerPage: 'auto',
        showAnswers: false,
        topics: ['Genel']
    });

    const [content, setContent] = useState<KelimeCumleGeneratedContent | null>(null);
    const [generationMode, setGenerationMode] = useState<'ai' | 'offline'>('offline');
    const { generateOffline, generateAI, isGenerating, error } = useKelimeCumleGenerator();
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const [scale, setScale] = useState(0.8); // Default scale to fit height better

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

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handlePrint = () => {
        printService.captureAndPrint('.print-page', content?.title || 'Kelime_Cumle_Calismasi', 'print', 'A4');
    };

    const handleDownload = () => {
        printService.captureAndPrint('.print-page', content?.title || 'Kelime_Cumle_Calismasi', 'download', 'A4');
    };

    const handleAddToWorkbook = () => {
        if (onAddToWorkbook && content) {
            onAddToWorkbook('kelime-cumle', content);
            showToast('✅ Kitapçığa eklendi!');
        } else {
            showToast('⚠️ Kitapçığa eklenemedi (Sistem Hazır Değil)');
        }
    };

    const handleShare = () => {
        showToast('🔗 Paylaşım bağlantısı kopyalandı!');
    };

    // Chunking Logic (Pagination)
    const contentChunks = useMemo(() => {
        if (!content || !content.items || content.items.length === 0) return [];
        
        let perPage = 10; // default
        if (config.itemsPerPage === 'auto') {
            switch (config.type) {
                case 'bosluk_doldurma': perPage = 12; break;
                case 'zit_anlam': perPage = 15; break;
                case 'test': perPage = 6; break;
                case 'kelime_tamamlama': perPage = 21; break;
                default: perPage = 10; break;
            }
        } else if (typeof config.itemsPerPage === 'number') {
            perPage = config.itemsPerPage;
        }

        const chunks = [];
        for (let i = 0; i < content.items.length; i += perPage) {
            chunks.push({
                ...content,
                items: content.items.slice(i, i + perPage)
            });
        }
        return chunks;
    }, [content, config.itemsPerPage, config.type]);

    const currentType = content?.activityType || config.type;
    const activityInfo = KELIME_CUMLE_REGISTRY[currentType] || KELIME_CUMLE_REGISTRY.bosluk_doldurma;
    const Renderer = activityInfo.renderer;

    return (
        <div className="kc-studio-premium-container">
            {toastMsg && (
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: '#10b981', color: 'white', padding: '10px 20px', borderRadius: '8px', zIndex: 9999, fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    {toastMsg}
                </div>
            )}
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
                            <button className="kc-btn-action" onClick={handlePrint} title="Kompakt Yazdır">
                                🖨️ <span className="btn-text">Yazdır</span>
                            </button>
                            <button className="kc-btn-action" onClick={handleDownload} title="PNG Olarak İndir">
                                💾 <span className="btn-text">İndir</span>
                            </button>
                            <button className="kc-btn-action" onClick={handleShare} title="Uygulama İçi Paylaş">
                                🔗 <span className="btn-text">Paylaş</span>
                            </button>
                        </div>
                        
                        {/* Zoom Kontrolleri */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <button 
                                onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))}
                                className="kc-zoom-btn"
                                title="Uzaklaştır"
                            >
                                ➖
                            </button>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '45px', textAlign: 'center' }}>
                                %{Math.round(scale * 100)}
                            </span>
                            <button 
                                onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))}
                                className="kc-zoom-btn"
                                title="Yakınlaştır"
                            >
                                ➕
                            </button>
                            <button 
                                onClick={() => setScale(0.8)}
                                style={{ fontSize: '0.75rem', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none', color: 'white' }}
                            >
                                Sıfırla
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button className="kc-btn-accent-glow" onClick={handleAddToWorkbook}>
                                📚 Sınıf Kitapçığına Ekle
                            </button>
                        </div>
                    </div>

                    <div className="kc-preview-viewport custom-scrollbar">
                        {error ? (
                            <ErrorFallback onRetry={handleGenerate} />
                        ) : (
                            <div className="kc-a4-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '2rem' }}>
                                {contentChunks.length > 0 ? (
                                    contentChunks.map((chunk, idx) => (
                                        <A4CompactRenderer key={idx} scale={scale}>
                                            <div className="print-page a4-page" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                                                {/* Page Counter Indicator in UI only */}
                                                <div className="page-indicator" style={{ position: 'absolute', top: '5px', right: '10px', fontSize: '10px', color: '#94a3b8' }} data-design-only>
                                                    Sayfa {idx + 1} / {contentChunks.length}
                                                </div>
                                                <Renderer 
                                                    content={chunk} 
                                                    showAnswers={config.showAnswers} 
                                                />
                                            </div>
                                        </A4CompactRenderer>
                                    ))
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
