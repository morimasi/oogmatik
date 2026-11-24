// Kelime-Cümle Studio — Main Orchestrator v3 (Ultra-Premium & Adaptive Edition)
// Comprehensive neuro-pedagogy profiles, auto-draft saving, robust font capture, and sharing.

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
    KelimeCumleConfig,
    KelimeCumleGeneratedContent,
    KelimeCumleActivityType
} from '../../types/kelimeCumle';
import { KELIME_CUMLE_REGISTRY } from './registry';
import { useKelimeCumleGenerator } from './hooks/useKelimeCumleGenerator';
import { TypeSelectorPanel } from './shared/TypeSelectorPanel';
import { CommonConfigPanel } from './shared/CommonConfigPanel';
import { StudentProfilePanel } from './shared/StudentProfilePanel';
import { ErrorFallback } from './shared/ErrorFallback';
import { A4CompactRenderer } from './shared/A4CompactRenderer';
import { ShareModal } from '../ShareModal';
import { printService } from '../../utils/printService';
import { preloadFontsForCapture } from '../../utils/print/CaptureEngine';
import { worksheetService } from '../../services/worksheetService';
import { useAuthStore } from '../../store/useAuthStore';
import { useStudentStore } from '../../store/useStudentStore';
import { useFascicleStore } from '../../store/useFascicleStore';
import { logError } from '../../utils/logger.js';
import { ActivityType, Student } from '../../types';
import toast from 'react-hot-toast';
import './KelimeCumleStudio.css';

interface KelimeCumleStudioProps {
    onBack?: () => void;
    onSaveToArchive?: (name: string, activityType: string, data: any) => Promise<void>;
    initialData?: Record<string, unknown>;
}

export const KelimeCumleStudio: React.FC<KelimeCumleStudioProps> = ({ onBack, onSaveToArchive, initialData }) => {
    const { user } = useAuthStore();
    const { students, activeStudent } = useStudentStore();
    const isStudent = user?.role === 'student';

    // --- STATE ---
    const [config, setConfig] = useState<KelimeCumleConfig>({
        id: crypto.randomUUID(),
        type: 'bosluk_doldurma',
        ageGroup: '8-10',
        difficulty: 'Orta',
        title: 'Kelime-Cümle Etkinliği',
        itemCount: 10,
        showAnswers: false,
        topics: ['Genel'],
        fontSize: 22,
        wordSpacing: 1.5,
        dotSize: 12,
        itemsPerPage: 10,
        learningProfile: 'dyslexia',
    });

    const [selectedStudentId, setSelectedStudentId] = useState<string>('anonymous');
    const [content, setContent] = useState<KelimeCumleGeneratedContent | null>(null);
    const [generationMode, setGenerationMode] = useState<'ai' | 'offline'>('offline');
    const { generateOffline, generateAI, isGenerating, error } = useKelimeCumleGenerator();
    
    // UI state
    const [scale, setScale] = useState(0.8);
    const [isPrinting, setIsPrinting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [lastAutoSaveTime, setLastAutoSaveTime] = useState<Date | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    // Initial default generation on mount if empty
    const initialGeneratedRef = useRef(false);
    useEffect(() => {
        if (!initialGeneratedRef.current && !initialData) {
            initialGeneratedRef.current = true;
            try {
                const initialContent = generateOffline(config);
                setContent(initialContent);
            } catch (err) {
                logError(err instanceof Error ? err : String(err));
            }
        }
    }, [config, generateOffline, initialData]);

    // Initial data hydration (if restored from archive/draft)
    useEffect(() => {
        if (initialData) {
            const rawData = initialData as Record<string, any>;
            const data = rawData.content || rawData;
            if (data.config) setConfig(data.config);
            if (data.content) setContent(data.content);
            else if (data.items) {
                setContent({
                    title: data.title || 'Kelime-Cümle Çalışması',
                    instructions: data.instructions || data.instruction || '',
                    items: data.items,
                    activityType: data.activityType || 'bosluk_doldurma',
                    difficulty: data.difficulty || 'Orta',
                    pedagogicalNote: data.pedagogicalNote,
                    settings: data.settings
                });
            }
        }
    }, [initialData]);

    // Sync with active student
    useEffect(() => {
        if (activeStudent) {
            setSelectedStudentId(activeStudent.id);
            const sProfile = (activeStudent as { learningProfile?: string; profile?: string }).learningProfile
                || (activeStudent as { profile?: string }).profile || 'dyslexia';

            setConfig(prev => ({
                ...prev,
                studentId: activeStudent.id,
                studentName: activeStudent.name,
                learningProfile: sProfile,
                ageGroup: activeStudent.age <= 7 ? '5-7' : activeStudent.age <= 10 ? '8-10' : activeStudent.age <= 13 ? '11-13' : '14+',
                difficulty: activeStudent.grade?.includes('1') || activeStudent.grade?.includes('2') ? 'Başlangıç' : activeStudent.grade?.includes('5') ? 'İleri' : 'Orta',
                title: `${activeStudent.name} — ${prev.type.replace('_', ' ').toUpperCase()} Çalışması`
            }));
        }
    }, [activeStudent]);

    // Student selection handler
    const handleSelectStudent = (sid: string) => {
        setSelectedStudentId(sid);
        if (sid !== 'anonymous') {
            const s = students.find((x: Student) => x.id === sid);
            if (s) {
                useStudentStore.getState().setActiveStudent(s);
                const sProfile = (s as { learningProfile?: string; profile?: string }).learningProfile
                    || (s as { profile?: string }).profile || 'dyslexia';
                setConfig(prev => ({
                    ...prev,
                    studentId: s.id,
                    studentName: s.name,
                    learningProfile: sProfile,
                    title: `${s.name} — ${prev.type.replace('_', ' ').toUpperCase()} Çalışması`
                }));
            }
        } else {
            useStudentStore.getState().setActiveStudent(null);
            setConfig(prev => ({
                ...prev,
                studentId: undefined,
                studentName: undefined,
                title: 'Kelime-Cümle Etkinliği'
            }));
        }
    };

    // Profile selection handler
    const handleSelectProfile = useCallback((profile: string) => {
        setConfig(prev => {
            let extraSpacing = 1.5;
            let extraFontSize = 22;
            let extraPerPage = prev.itemsPerPage || 10;

            if (profile === 'dyslexia') {
                extraSpacing = 1.8;
                extraFontSize = 24;
                extraPerPage = Math.min(extraPerPage, 8);
            } else if (profile === 'adhd') {
                extraSpacing = 1.5;
                extraFontSize = 22;
                extraPerPage = Math.min(extraPerPage, 6); // 5-7 dk mikro-döngü
            }

            return {
                ...prev,
                learningProfile: profile,
                wordSpacing: extraSpacing,
                fontSize: extraFontSize,
                itemsPerPage: extraPerPage
            };
        });
        toast.success(`Destek profili güncellendi: ${profile.toUpperCase()}`);
    }, []);

    // Content generation
    const handleGenerate = async () => {
        if (generationMode === 'offline') {
            try {
                const newContent = generateOffline(config);
                setContent(newContent);
                toast.success('Etkinlik hazırlandı!');
            } catch (err) {
                logError(err instanceof Error ? err : String(err));
                toast.error('İçerik hazırlanamadı.');
            }
        } else {
            try {
                const newContent = await generateAI(config);
                setContent(newContent);
                toast.success('AI destekli özgün etkinlik üretildi!');
            } catch (e: unknown) {
                logError(e instanceof Error ? e : String(e));
                toast.error('AI hatası; yedek havuzdan içerik yüklendi.');
            }
        }
    };

    // --- AUTO-DRAFT SAVE EFFECT (Debounced 30s) ---
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!content || !content.items || content.items.length === 0) return;

        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(() => {
            setIsAutoSaving(true);
            try {
                const draftKey = `bdmind_kc_draft_${user?.id || 'anon'}_${config.type}`;
                localStorage.setItem(draftKey, JSON.stringify({
                    timestamp: new Date().toISOString(),
                    config,
                    content
                }));
                setLastAutoSaveTime(new Date());
            } catch {
                // Ignore storage quota
            } finally {
                setIsAutoSaving(false);
            }
        }, 30000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [content, config, user?.id]);

    // Print & PDF with font preloading and KVKK sanitization
    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            await preloadFontsForCapture();
            await new Promise(r => setTimeout(r, 60));
            const safeTitle = (content?.title || 'Kelime_Cumle_Calismasi')
                .replace(/[^a-zA-Z0-9_\u00C0-\u017F\s-]/g, '')
                .trim()
                .replace(/\s+/g, '_');
            await printService.generatePdf('.print-page', safeTitle, { action: 'print' });
        } catch (err) {
            logError(err instanceof Error ? err : String(err));
            toast.error('Yazdırma sırasında bir sorun oluştu.');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleDownload = async () => {
        setIsPrinting(true);
        try {
            await preloadFontsForCapture();
            await new Promise(r => setTimeout(r, 60));
            const safeTitle = (content?.title || 'Kelime_Cumle_Calismasi')
                .replace(/[^a-zA-Z0-9_\u00C0-\u017F\s-]/g, '')
                .trim()
                .replace(/\s+/g, '_');
            const fileName = `${safeTitle}_${new Date().toISOString().slice(0, 10)}`;
            await printService.generatePdf('.print-page', fileName, { action: 'download' });
            toast.success('A4 PDF başarıyla indirildi!');
        } catch (err) {
            logError(err instanceof Error ? err : String(err));
            toast.error('İndirme sırasında bir sorun oluştu.');
        } finally {
            setIsPrinting(false);
        }
    };

    // Export Answer Key Only
    const handleExportAnswerKey = async () => {
        if (!content) return;
        setIsPrinting(true);
        try {
            await preloadFontsForCapture();
            await new Promise(r => setTimeout(r, 60));
            // Show answers temporarily for capture
            const prevShowAnswers = config.showAnswers;
            setConfig(prev => ({ ...prev, showAnswers: true }));
            await new Promise(r => setTimeout(r, 100));
            
            const fileName = `Cevap_Anahtari_${config.type}_${new Date().toISOString().slice(0, 10)}`;
            await printService.generatePdf('.print-page', fileName, { action: 'download' });
            
            setConfig(prev => ({ ...prev, showAnswers: prevShowAnswers }));
            toast.success('Cevap Anahtarı PDF olarak indirildi!');
        } catch (err) {
            logError(err instanceof Error ? err : String(err));
            toast.error('Cevap anahtarı indirilemedi.');
        } finally {
            setIsPrinting(false);
        }
    };

    // Copy Share Link
    const handleCopyShareLink = async () => {
        try {
            const currentUrl = window.location.href.split('?')[0];
            const shareUrl = `${currentUrl}?view=kelime-cumle-studio&shared=true&t=${Date.now()}`;
            if (navigator?.clipboard?.writeText) {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Çalışma bağlantısı panoya kopyalandı!');
            }
        } catch {
            toast.error('Bağlantı kopyalanamadı.');
        }
    };

    // Save to Firestore Worksheet Service
    const handleSaveToArchive = async () => {
        if (!content || !user) {
            toast.error('Kaydetmek için giriş yapmalısınız.');
            return;
        }

        setIsSaving(true);
        try {
            const typeLabels: Record<KelimeCumleActivityType, string> = {
                bosluk_doldurma: 'Boşluk Doldurma',
                test: 'Çoktan Seçmeli',
                kelime_tamamlama: 'Kelime Tamamlama',
                karisik_cumle: 'Karışık Cümle',
                zit_anlam: 'Zıt Anlam'
            };

            const name = `${typeLabels[config.type] || 'Kelime-Cümle'} - ${new Date().toLocaleDateString('tr-TR')}`;
            const activityType = ActivityType.KELIME_CUMLE;

            const worksheetData = [{
                id: `kc-${Date.now()}`,
                type: activityType,
                title: name,
                instruction: content.instructions || 'Yönerge yok',
                pedagogicalNote: content.pedagogicalNote,
                targetSkills: content.targetSkills,
                items: content.items,
                activityType: config.type,
                difficulty: config.difficulty,
                learningProfile: config.learningProfile,
                settings: content.settings || {},
                config,
                createdAt: new Date().toISOString()
            }];

            await worksheetService.saveWorksheet(
                user.id,
                name,
                activityType,
                worksheetData,
                activityInfo.icon || 'fa-solid fa-file-pen',
                { id: 'reading-verbal', title: 'Okuma & Dil' },
                undefined,
                undefined,
                activeStudent?.id,
                activeStudent?.name
            );

            if (onSaveToArchive) {
                await onSaveToArchive(name, activityType, worksheetData);
            }

            setLastAutoSaveTime(new Date());
            toast.success(`"${name}" arşive kaydedildi!`);
        } catch (error: unknown) {
            logError('Arşive kaydetme hatası:', { error: error instanceof Error ? error.message : String(error) });
            toast.error('Arşive kaydedilirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    // Share with user
    const handleShareWithUser = async (receiverIds: string[]) => {
        if (!user || !content) return;
        try {
            const mockSavedWorksheet: any = {
                name: content.title || 'Kelime-Cümle Çalışması',
                activityType: ActivityType.KELIME_CUMLE,
                worksheetData: [{ content, config }],
                icon: activityInfo.icon || 'fa-solid fa-file-pen',
                category: { id: 'reading-verbal', title: 'Okuma & Dil' },
            };
            await worksheetService.shareWorksheet(mockSavedWorksheet, user.id, user.name || '', receiverIds[0]);
            setIsShareModalOpen(false);
            toast.success('Çalışma başarıyla paylaşıldı!');
        } catch {
            toast.error('Paylaşım sırasında bir hata oluştu.');
        }
    };

    // Pagination chunks
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
    }, [content, config.type, config.itemsPerPage]);

    const currentType = content?.activityType || config.type;
    const activityInfo = KELIME_CUMLE_REGISTRY[currentType] || KELIME_CUMLE_REGISTRY.bosluk_doldurma;
    const Renderer = activityInfo.renderer;

    const selectedStudentName = selectedStudentId !== 'anonymous'
        ? students.find(s => s.id === selectedStudentId)?.name
        : undefined;

    return (
        <div className="kc-studio-premium-container">
            <div className="kc-premium-bg">
                <div className="kc-bg-orb orb-1"></div>
                <div className="kc-bg-orb orb-2"></div>
            </div>

            <div className="kc-premium-layout">
                {/* SIDEBAR PANEL */}
                <div className="kc-sidebar-glass">
                    <div className="kc-sidebar-header">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
                            {onBack && (
                                <button onClick={onBack} className="kc-btn-back" title="Geri Dön">
                                    <i className="fa-solid fa-arrow-left text-xs"></i>
                                </button>
                            )}
                            <h1 className="kc-brand-title">Kelime-Cümle</h1>
                        </div>
                        <p className="kc-brand-subtitle">Nöro-Pedagojik Dil & Okuma Stüdyosu v3</p>
                    </div>

                    <div className="kc-sidebar-scrollable custom-scrollbar">
                        {/* Student & Neuro-Pedagogical Profile Panel */}
                        <StudentProfilePanel
                            selectedStudentId={selectedStudentId}
                            students={students}
                            onSelectStudent={handleSelectStudent}
                            learningProfile={config.learningProfile}
                            onSelectProfile={handleSelectProfile}
                        />

                        {/* Activity Type Selector */}
                        <TypeSelectorPanel
                            types={Object.entries(KELIME_CUMLE_REGISTRY).map(([key, val]) => ({
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

                        {/* Common Controls */}
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

                {/* PREVIEW VIEWPORT */}
                <div className="kc-preview-glass">
                    {/* TOP ACTION TOOLBAR (Glassmorphism) */}
                    <div className="kc-toolbar-glass">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {/* Yazdır */}
                            <button
                                className="kc-btn-action"
                                onClick={handlePrint}
                                disabled={isPrinting}
                                title="A4 Olarak Yazdır"
                            >
                                <i className="fa-solid fa-print"></i>
                                <span>{isPrinting ? 'Hazırlanıyor...' : 'Yazdır'}</span>
                            </button>

                            {/* İndir */}
                            <button
                                className="kc-btn-action"
                                onClick={handleDownload}
                                disabled={isPrinting}
                                title="A4 PDF Olarak İndir"
                            >
                                <i className="fa-solid fa-file-pdf"></i>
                                <span>PDF İndir</span>
                            </button>

                            {/* Cevap Anahtarı İndir */}
                            {!isStudent && (
                                <button
                                    className="kc-btn-action"
                                    onClick={handleExportAnswerKey}
                                    disabled={isPrinting}
                                    title="Yalnızca Cevap Anahtarını İndir"
                                    style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                                >
                                    <i className="fa-solid fa-key"></i>
                                    <span>Cevap Anahtarı</span>
                                </button>
                            )}

                            {/* Bağlantıyı Kopyala */}
                            <button
                                className="kc-btn-action"
                                onClick={handleCopyShareLink}
                                title="Çalışma Bağlantısını Kopyala"
                            >
                                <i className="fa-solid fa-link"></i>
                                <span>Bağlantıyı Kopyala</span>
                            </button>

                            {/* Paylaş */}
                            <button
                                className="kc-btn-action"
                                onClick={() => setIsShareModalOpen(true)}
                                title="Meslektaş veya Öğrenciyle Paylaş"
                            >
                                <i className="fa-solid fa-share-nodes"></i>
                                <span>Paylaş</span>
                            </button>

                            {/* Arşive Kaydet */}
                            <button
                                className="kc-btn-action"
                                onClick={handleSaveToArchive}
                                disabled={isSaving}
                                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white' }}
                            >
                                <i className="fa-solid fa-floppy-disk"></i>
                                <span>{isSaving ? 'Kaydediliyor...' : 'Arşive Kaydet'}</span>
                            </button>

                            {/* Fasiküle Ekle */}
                            <button
                                className="kc-btn-action"
                                onClick={() => {
                                    const { addItem, items: fascicleItems } = useFascicleStore.getState();
                                    const fascicleDifficulty = config.difficulty === 'Başlangıç' ? 'Kolay' : (config.difficulty === 'İleri' || config.difficulty === 'Uzman') ? 'Zor' : 'Orta';
                                    addItem({
                                        id: crypto.randomUUID(),
                                        type: ActivityType.KELIME_CUMLE,
                                        difficulty: fascicleDifficulty,
                                        pageCount: contentChunks.length,
                                        order: fascicleItems.length,
                                        content: { content, config },
                                    });
                                    toast.success('Fasiküle başarıyla eklendi!');
                                }}
                                style={{ background: 'linear-gradient(135deg, #a855f7, #d946ef)', color: 'white' }}
                            >
                                <i className="fa-solid fa-layer-group"></i>
                                <span>Fasiküle Ekle</span>
                            </button>
                        </div>

                        {/* Right: Status and Zoom Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {/* Auto-Save Indicator */}
                            {isAutoSaving ? (
                                <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="fa-solid fa-circle-notch fa-spin"></i> Taslak Yedekleniyor...
                                </span>
                            ) : lastAutoSaveTime ? (
                                <span style={{ fontSize: '0.7rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <i className="fa-solid fa-check"></i> Taslak Hazır
                                </span>
                            ) : null}

                            {/* Zoom */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                                <button onClick={() => setScale(prev => Math.max(0.4, prev - 0.1))} className="kc-zoom-btn">➖</button>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, minWidth: '35px', textAlign: 'center' }}>%{Math.round(scale * 100)}</span>
                                <button onClick={() => setScale(prev => Math.min(1.5, prev + 0.1))} className="kc-zoom-btn">➕</button>
                            </div>
                        </div>
                    </div>

                    {/* VIEWPORT CANVAS */}
                    <div className="kc-preview-viewport custom-scrollbar" id="kelime-cumle-canvas-container">
                        {error ? (
                            <ErrorFallback onRetry={handleGenerate} />
                        ) : (
                            <div className="kc-a4-wrapper" style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}>
                                {contentChunks.length > 0 ? (
                                    contentChunks.map((chunk, idx) => (
                                        <A4CompactRenderer
                                            key={idx}
                                            pedagogicalNote={idx === 0 ? content?.pedagogicalNote : undefined}
                                            studentName={selectedStudentName}
                                            typography={{
                                                fontSize: config.fontSize || 22,
                                                lineHeight: 1.8,
                                                letterSpacing: 0.04,
                                                wordSpacing: config.wordSpacing || 1.5
                                            }}
                                        >
                                            <div
                                                className="print-page a4-page clinic-high-contrast"
                                                style={{
                                                    height: '100%',
                                                    width: '100%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    backgroundColor: '#ffffff',
                                                    color: '#1a1a1a',
                                                    position: 'relative'
                                                }}
                                            >
                                                <div className="page-indicator" style={{ position: 'absolute', top: '10px', right: '15px', fontSize: '10px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                    Sayfa {idx + 1} / {contentChunks.length}
                                                </div>
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

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                onShare={handleShareWithUser}
                worksheetTitle={content?.title || 'Kelime-Cümle Çalışması'}
            />
        </div>
    );
};

export default KelimeCumleStudio;
