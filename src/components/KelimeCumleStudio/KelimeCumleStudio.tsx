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
import { worksheetService } from '../../services/worksheetService';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useFascicleStore } from '../../store/useFascicleStore';
import { logInfo, logError, logWarn } from '../../utils/logger.js';
import { ActivityType } from '../../types';
import './KelimeCumleStudio.css';

interface KelimeCumleStudioProps {
    onBack?: () => void;
    onSaveToArchive?: (name: string, activityType: string, data: any) => Promise<void>;
}

const KelimeCumleStudio: React.FC<KelimeCumleStudioProps> = ({ onBack, onSaveToArchive }) => {
    const { user } = useAuthStore();
    const [config, setConfig] = useState<KelimeCumleConfig>({
        id: crypto.randomUUID(),
        type: 'bosluk_doldurma',
        ageGroup: '8-10',
        difficulty: 'Orta',
        title: 'Yeni Etkinlik',
        itemCount: 10,
        showAnswers: false,
        topics: ['Genel'],
        fontSize: 22,
        wordSpacing: 1.5,
        dotSize: 12,
        itemsPerPage: 10
    });

    const [content, setContent] = useState<KelimeCumleGeneratedContent | null>(null);
    const [generationMode, setGenerationMode] = useState<'ai' | 'offline'>('offline');
    const { generateOffline, generateAI, isGenerating, error } = useKelimeCumleGenerator();
    const [toastMsg, setToastMsg] = useState<string | null>(null);
    const { activeStudent } = useStudentStore();
    const [scale, setScale] = useState(0.8);

    useEffect(() => {
        if (activeStudent) {
            setConfig(prev => ({
                ...prev,
                ageGroup: activeStudent.age <= 7 ? '5-7' : activeStudent.age <= 10 ? '8-10' : activeStudent.age <= 13 ? '11-13' : '14+',
                difficulty: activeStudent.grade?.includes('1') || activeStudent.grade?.includes('2') ? 'Orta' : activeStudent.grade?.includes('5') ? 'Zor' : 'Orta',
                title: `${activeStudent.name} için ${prev.type.replace('_', ' ')} Çalışması`
            }));
        }
    }, [activeStudent]);

    const handleGenerate = async () => {
        if (generationMode === 'offline') {
            const newContent = generateOffline(config);
            setContent(newContent);
        } else {
            try {
                const newContent = await generateAI(config);
                setContent(newContent);
            } catch (e: any) {
                logError(e);
            }
        }
    };

    useEffect(() => {
        if (generationMode === 'offline') {
            handleGenerate();
        }
    }, [config.type, config.difficulty, config.ageGroup, config.itemCount, generationMode]);

    const showToast = (msg: string) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(null), 3000);
    };

    const handlePrint = () => {
        printService.generatePdf('.print-page', content?.title || 'Kelime_Cumle_Calismasi', { action: 'print' });
    };

    const handleDownload = () => {
        printService.generatePdf('.print-page', content?.title || 'Kelime_Cumle_Calismasi', { action: 'download' });
    };

    const handleSaveToArchive = async () => {
        if (!content || !user) {
            showToast('⚠️ Kaydetmek için giriş yapmalısınız');
            return;
        }

        try {
            const name = `${config.type === 'bosluk_doldurma' ? 'Boşluk Doldurma' : 
                           config.type === 'test' ? 'Çoktan Seçmeli' : 
                           config.type === 'kelime_tamamlama' ? 'Kelime Tamamlama' : 
                           config.type === 'karisik_cumle' ? 'Karışık Cümle' : 
                           'Zıt Anlam'} - ${new Date().toLocaleDateString('tr-TR')}`;
            
            const activityType = ActivityType.KELIME_CUMLE;
            
            const worksheetData = [{
                id: `kc-${Date.now()}`,
                type: activityType,
                title: name,
                instruction: content.instructions || 'Yönerge yok',
                items: content.items,
                activityType: config.type,
                difficulty: config.difficulty,
                settings: content.settings || {},
                createdAt: new Date().toISOString()
            }];
            
            await worksheetService.saveWorksheet(
                user.id,
                name,
                activityType,
                worksheetData,
                activityInfo.icon || 'fa-solid fa-file',
                { id: 'reading-verbal', title: 'Okuma & Dil' },
            );

            if (onSaveToArchive) {
                await onSaveToArchive(name, activityType, worksheetData);
            }

            showToast(`✅ "${name}" adıyla arşive kaydedildi!`);
        } catch (error: any) {
            logError('Arşive kaydetme hatası:', error as Record<string, unknown>);
            showToast('❌ Arşive kaydedilirken bir hata oluştu');
        }
    };

    const contentChunks = useMemo(() => {
        if (!content || !content.items || content.items.length === 0) return [];
        let perPage: number;
        if (config.itemsPerPage) {
            perPage = config.itemsPerPage;
        } else {
            switch (config.type) {
                case 'bosluk_doldurma': perPage = 10; break;
                case 'test': perPage = 5; break;
                case 'kelime_tamamlama': perPage = 12; break;
                case 'karisik_cumle': perPage = 8; break;
                case 'zit_anlam': perPage = 15; break;
                default: perPage = 10; break;
            }
        }
        const chunks = [];
        for (let i = 0; i < content.items.length; i += perPage) {
            chunks.push({
                ...content,
                items: content.items.slice(i, i + perPage)
            });
        }
        if (chunks.length === 0) chunks.push(content);
        return chunks;
    }, [content, config.type, config.itemCount, config.itemsPerPage]);

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
            
            <div className="kc-premium-bg">
                <div className="kc-bg-orb orb-1"></div>
                <div className="kc-bg-orb orb-2"></div>
            </div>

            <div className="kc-premium-layout">
                <div className="kc-sidebar-glass">
                    <div className="kc-sidebar-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                            {onBack && <button onClick={onBack} className="kc-btn-back" title="Geri Dön">←</button>}
                            <h1 className="kc-brand-title">Kelime-Cümle</h1>
                        </div>
                        <p className="kc-brand-subtitle">Ultra Premium Şablon Stüdyosu</p>
                    </div>

                    <div className="kc-sidebar-scrollable custom-scrollbar">
                        <TypeSelectorPanel 
                            types={Object.entries(KELIME_C_REGISTRY).map(([key, val]) => ({
                                id: key,
                                title: val.title,
                                icon: val.icon,
                                description: val.description
                            }))}
                            activeType={config.type}
                            onTypeChange={(type) => {
                                const newType = type as KelimeCumleActivityType;
                                let defaultPerPage = 10;
                                switch (newType) {
                                    case 'test': defaultPerPage = 5; break;
                                    case 'kelime_tamamlama': defaultPerPage = 12; break;
                                    case 'karisik_cumle': defaultPerPage = 8; break;
                                    case 'zit_anlam': defaultPerPage = 15; break;
                                    default: defaultPerPage = 10; break;
                                }
                                setConfig(prev => ({ ...prev, type: newType, itemsPerPage: defaultPerPage }));
                            }}
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

                <div className="kc-preview-glass">
                    <div className="kc-toolbar-glass">
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="kc-btn-action" onClick={handlePrint}>🖨️ <span>Yazdır</span></button>
                            <button className="kc-btn-action" onClick={handleDownload}>💾 <span>İndir</span></button>
                            <button className="kc-btn-action" onClick={handleSaveToArchive} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}>📦 <span>Arşive Kaydet</span></button>
                            <button
                                className="kc-btn-action"
                                onClick={() => {
                                    const { addItem, items: fascicleItems } = useFascicleStore.getState();
                                    addItem({
                                        id: crypto.randomUUID(),
                                        type: ActivityType.KELIME_CUMLE,
                                        difficulty: 'Orta',
                                        pageCount: contentChunks.length,
                                        order: fascicleItems.length,
                                        content: { content, config },
                                        pedagogicalNote: 'Kelime-Cümle Stüdyosu\'ndan eklendi.'
                                    });
                                    showToast('✅ Kitapçığa eklendi!');
                                }}
                                style={{ background: 'linear-gradient(135deg, #a855f7, #d946ef)', color: 'white' }}
                            >
                                📚 <span>Fasiküle Ekle</span>
                            </button>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                            <button onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))} className="kc-zoom-btn">➖</button>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '35px', textAlign: 'center' }}>%{Math.round(scale * 100)}</span>
                            <button onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))} className="kc-zoom-btn">➕</button>
                        </div>
                    </div>

                    <div className="kc-preview-viewport custom-scrollbar">
                        {error ? (
                            <ErrorFallback onRetry={handleGenerate} />
                        ) : (
                            <div className="kc-a4-wrapper" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                                {contentChunks.length > 0 ? (
                                    contentChunks.map((chunk, idx) => (
                                        <A4CompactRenderer 
                                            key={idx}
                                            typography={{
                                                fontSize: config.fontSize || 22,
                                                lineHeight: 1.8,
                                                letterSpacing: 0.04,
                                                wordSpacing: config.wordSpacing || 1.5
                                            }}
                                        >
                                            <div className="print-page a4-page clinic-high-contrast" style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', color: '#1a1a1a', position: 'relative' }}>
                                                <div className="page-indicator" style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>Sayfa {idx + 1} / {contentChunks.length}</div>
                                                <Renderer content={chunk} showAnswers={config.showAnswers} />
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

// Internal registry access fix
const KELIME_C_REGISTRY = KELIME_CUMLE_REGISTRY as any;

export default KelimeCumleStudio;
