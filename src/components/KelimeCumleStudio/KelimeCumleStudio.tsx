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

    // İlk yüklemede ve ayar değişimlerinde (Hızlı Mod ise) otomatik üret
    useEffect(() => {
        if (generationMode === 'offline') {
            handleGenerate();
        }
    }, [config.type, config.difficulty, config.ageGroup, config.itemCount, config.itemsPerPage, generationMode]);

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
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'var(--accent-color)', color: 'white', padding: '10px 24px', borderRadius: '12px', zIndex: 9999, fontWeight: 700, boxShadow: '0 8px 16px var(--accent-glow-subtle)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                    {toastMsg}
                </div>
            )}
            
            {/* Animasyonlu Arkaplan - Tema Duyarlı */}
            <div className="kc-premium-bg">
                <div className="kc-bg-orb orb-1"></div>
                <div className="kc-bg-orb orb-2"></div>
            </div>

            <div className="kc-premium-layout">
                {/* SOL PANEL - Ayarlar (Premium Sidebar) */}
                <div className="kc-sidebar-glass">
                    <div className="kc-sidebar-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                            {onBack && (
                                <button onClick={onBack} className="kc-btn-back" title="Geri Dön">
                                    ←
                                </button>
                            )}
                            <h1 className="kc-brand-title">Kelime-Cümle</h1>
                        </div>
                        <p className="kc-brand-subtitle">Ultra Premium Şablon Stüdyosu</p>
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

                {/* SAĞ PANEL - Canlı Önizleme Alanı */}
                <div className="kc-preview-glass">
                    <div className="kc-toolbar-glass">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="kc-btn-action" onClick={handlePrint}>
                                🖨️ <span>Yazdır</span>
                            </button>
                            <button className="kc-btn-action" onClick={handleDownload}>
                                💾 <span>İndir</span>
                            </button>
                        </div>
                        
                        {/* Zoom Kontrolleri */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                            <button onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))} className="kc-zoom-btn">➖</button>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '35px', textAlign: 'center' }}>%{Math.round(scale * 100)}</span>
                            <button onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))} className="kc-zoom-btn">➕</button>
                        </div>

                        <button className="kc-btn-accent-glow" onClick={handleAddToWorkbook}>
                            📚 Sınıf Kitapçığına Ekle
                        </button>
                    </div>

                    <div className="kc-preview-viewport custom-scrollbar">
                        {error ? (
                            <ErrorFallback onRetry={handleGenerate} />
                        ) : (
                            <div className="kc-a4-wrapper" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                                {contentChunks.length > 0 ? (
                                    contentChunks.map((chunk, idx) => (
                                        <A4CompactRenderer key={idx}>
                                            <div className="print-page a4-page clinic-high-contrast" style={{ 
                                                height: '100%', 
                                                width: '100%', 
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                backgroundColor: '#ffffff', // Her zamana beyaz zemin
                                                color: '#1a1a1a', // Klinik siyah metin
                                                position: 'relative'
                                            }}>
                                                <div className="page-indicator" style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
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
                                    <div className="kc-loading-skeleton">
                                        <span className="pulse-icon">📂</span>
                                        İçerik Hazırlanıyor...
                                    </div>
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
