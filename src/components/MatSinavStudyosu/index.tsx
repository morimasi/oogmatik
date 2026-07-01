/**
 * MatSinavStudyosu — Ana Stüdyo Shell
 * Süper Matematik Sınav Stüdyosu ana bileşeni
 * Tamamen bağımsız modül — mevcut SinavStudyosu'na dokunmaz
 */

import React, { useState } from 'react';
import { useMatSinavStore } from '../../store/useMatSinavStore';
import { useStudentStore } from '../../store/useStudentStore';
import { generateMatExam, refreshSingleQuestion } from '../../services/matSinavService';
import { MatKazanimPicker } from './MatKazanimPicker';
import { MatSoruAyarlari } from './MatSoruAyarlari';
import { MatSinavOnizleme } from './MatSinavOnizleme';
import { MatCevapAnahtariComponent } from './MatCevapAnahtari';
import { AppError } from '../../utils/AppError';
import type { MatSoru, MatSinav, MatCevapAnahtari } from '../../types/matSinav';
import { renderToString } from 'react-dom/server';
import { printService } from '../../utils/printService';
import { GraphicRenderer } from './components/GraphicRenderer';
import { PrintConfig, DEFAULT_PRINT_CONFIG } from '../../types/sinav';
import { useFascicleStore } from '../../store/useFascicleStore';
import { worksheetService } from '../../services/worksheetService';
import { useAuthStore } from '../../store/useAuthStore';
import { ActivityType } from '../../types';

type TabType = 'onizleme' | 'cevap-anahtari' | 'gecmis';

// ─── Alt bileşenler ──────────────────────────────────────────
const FmtBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; icon?: string; title?: string; }> = ({ active, onClick, children, icon, title }) => (
    <button onClick={onClick} title={title} className={`px-2 py-1 rounded-[6px] text-[9px] font-black border flex items-center justify-center gap-1.5 transition-all duration-300 shadow-sm ${active ? 'bg-accent/90 text-white border-accent shadow-accent/20 z-10' : 'bg-transparent text-[var(--text-muted)] border-transparent hover:border-[var(--border-color)]/30 hover:text-accent hover:bg-[var(--bg-paper)] hover:shadow-xs'}`}>
        {icon && <span className="text-[10px] opacity-80">{icon}</span>}
        <span className="uppercase tracking-widest">{children}</span>
    </button>
);

const SectionHeader: React.FC<{ icon: string; title: string; badge?: string; isOpen: boolean; onToggle: () => void; }> = ({ icon, title, badge, isOpen, onToggle }) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 bg-transparent hover:bg-accent/5 transition-all duration-300 group rounded-xl">
        <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-accent text-white shadow-lg shadow-accent/20 rotate-6' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:bg-accent/20 group-hover:text-accent group-hover:rotate-3'}`}>
                <span className="text-lg">{icon}</span>
            </div>
            <div className="flex flex-col items-start text-left">
                <span className={`text-[13px] font-bold tracking-tight transition-colors ${isOpen ? 'text-accent' : 'text-[var(--text-muted)] group-hover:text-accent'}`}>{title}</span>
                {badge && <span className="text-[9px] font-bold text-accent/70 uppercase tracking-widest mt-0.5">{badge}</span>}
            </div>
        </div>
        <span className={`text-[var(--text-muted)] transition-all duration-500 ${isOpen ? 'rotate-180 text-accent' : 'group-hover:text-accent/70'}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
    </button>
);

interface MatSinavStudyosuProps {
    initialData?: any;
}

export const MatSinavStudyosu: React.FC<MatSinavStudyosuProps> = ({ initialData }) => {
    const {
        ayarlar,
        setSinif,
        setSecilenUniteler,
        setSecilenKazanimlar,
        setSoruDagilimi,
        setAyarlar,
        aktifSinav,
        setAktifSinav,
        isGenerating,
        setIsGenerating,
        addSinavGecmisi,
        sinavGecmisi,
        removeSinavGecmisi,
    } = useMatSinavStore();

    const { activeStudent } = useStudentStore();

    // --- SYNC WITH GLOBAL STUDENT ---
    React.useEffect(() => {
        if (activeStudent) {
            const grade = parseInt(activeStudent.grade?.replace('. Sınıf', '') || '1');
            if (!isNaN(grade)) {
                setSinif(grade);
            }
        }
    }, [activeStudent]);

    // --- INITIAL DATA LOAD ---
    React.useEffect(() => {
        if (initialData && Array.isArray(initialData.data) && initialData.data[0]) {
            const exam = initialData.data[0];
            setAktifSinav(exam);
            if (initialData.printConfig) setPrintConfig(initialData.printConfig);
            setActiveTab('onizleme');
        }
    }, [initialData]);

    const [activeTab, setActiveTab] = useState<TabType>('onizleme');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [refreshingIndex, setRefreshingIndex] = useState<number | null>(null);
    const [printConfig, setPrintConfig] = useState<PrintConfig>(DEFAULT_PRINT_CONFIG);
    const [isSavingToWorkbook, setIsSavingToWorkbook] = useState(false);
    const [savedExamDocId, setSavedExamDocId] = useState<string | null>(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [shareUserId, setShareUserId] = useState('');
    const [assignedStudentId, setAssignedStudentId] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const updateConfig = <K extends keyof PrintConfig>(key: K, val: PrintConfig[K]) => setPrintConfig(c => ({ ...c, [key]: val }));

    // Accordion state
    const [openSections, setOpenSections] = useState({
        sinif: true,
        kazanim: true,
        ayarlar: true,
    });
    const toggleSection = (key: keyof typeof openSections) =>
        setOpenSections((p) => ({ ...p, [key]: !p[key] }));

    const toplamSoru =
        ayarlar.soruDagilimi.coktan_secmeli +
        ayarlar.soruDagilimi.dogru_yanlis +
        ayarlar.soruDagilimi.bosluk_doldurma +
        ayarlar.soruDagilimi.acik_uclu;
    const kazanimCount = ayarlar.secilenKazanimlar.length;

    const canGenerate = () =>
        ayarlar.sinif !== null && kazanimCount > 0 && toplamSoru >= 1;

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // ─── Sınav Oluştur ───────────────────────────────────────────
    const handleGenerate = async () => {
        setError(null);
        setSuccessMessage(null);
        try {
            setIsGenerating(true);
            const sinav = await generateMatExam(ayarlar);
            setAktifSinav(sinav);
            addSinavGecmisi(sinav);
            setActiveTab('onizleme');
            showSuccess('Sınav başarıyla oluşturuldu!');
        } catch (err: unknown) {
            if (err instanceof AppError) setError(err.userMessage);
            else setError('Sınav oluşturulurken beklenmeyen bir hata oluştu.');
        } finally {
            setIsGenerating(false);
        }
    };

    // ─── Tek Soru Yenileme ────────────────────────────────────────
    const handleRefreshSoru = async (index: number) => {
        if (!aktifSinav) return;
        setRefreshingIndex(index);
        try {
            const yeniSoru = await refreshSingleQuestion(index, ayarlar, aktifSinav.sorular[index]);
            const yeniSorular = [...aktifSinav.sorular];
            yeniSorular[index] = yeniSoru;
            setAktifSinav({ ...aktifSinav, sorular: yeniSorular });
        } catch (err: unknown) {
            if (err instanceof AppError) setError(err.userMessage);
            else setError('Soru yenilenirken bir hata oluştu.');
        } finally {
            setRefreshingIndex(null);
        }
    };

    // ─── Soru Güncelle (inline edit) ──────────────────────────────
    const handleUpdateSoru = (index: number, updated: MatSoru) => {
        if (!aktifSinav) return;
        const yeniSorular = [...aktifSinav.sorular];
        yeniSorular[index] = updated;
        setAktifSinav({ ...aktifSinav, sorular: yeniSorular });
    };

    // ─── Yazdır ───────────────────────────────────────────────────
    const handlePrint = () => {
        if (!aktifSinav) return;
        printService.generatePdf('#mat-sinav-print-inner', aktifSinav.baslik, { action: 'print' });
    };

    // ─── Fasiküle Ekle ────────────────────────────────────────────
    const handleAddToFascicle = () => {
        if (!aktifSinav) return;
        const { addItem, items } = useFascicleStore.getState();
        addItem({
            id: crypto.randomUUID(),
            type: ActivityType.MAT_SINAV,
            difficulty: 'Orta',
            pageCount: Math.ceil((aktifSinav.sorular?.length || 1) / 4), // Ortalama sayfa hesabı
            order: items.length,
            content: { ...aktifSinav, printConfig }, // PrintConfig ile birleştirerek gönderiyoruz

        });
        showSuccess('Kitapçığa eklendi!');
    };

    // ─── Kaydet ────────────────────────────────────────────────────
    const handleSaveExam = async () => {
        if (!aktifSinav) return;
        const user = useAuthStore.getState().user;
        if (!user) { setError('Lütfen giriş yapın.'); return; }
        try {
            setIsSavingToWorkbook(true);
            const saved = await worksheetService.saveWorksheet(
                user.id,
                aktifSinav.baslik || 'Matematik Sınavı',
                ActivityType.MAT_SINAV,
                [{
                    title: aktifSinav.baslik || 'Matematik Sınavı',
                    instruction: 'Problemleri dikkatlice çözünüz.',
                    activityType: ActivityType.MAT_SINAV,
                    data: [aktifSinav],
                    printConfig,
                }],
                'fa-solid fa-square-root-variable',
                { id: 'math-logic', title: 'Matematik & Mantık' },
            );
            setSavedExamDocId(saved.id);
            showSuccess('Sınav kaydedildi!');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
            setError(`Kaydetme hatası: ${msg}`);
        } finally {
            setIsSavingToWorkbook(false);
        }
    };

    // ─── Paylaş ────────────────────────────────────────────────────
    const handleShareExam = () => {
        if (!savedExamDocId) {
            handleSaveExam().then(() => setShowShareModal(true));
            return;
        }
        setShowShareModal(true);
    };

    const handleConfirmShare = async () => {
        if (!savedExamDocId || !shareUserId.trim()) return;
        setIsSharing(true);
        try {
            const user = useAuthStore.getState().user;
            await worksheetService.shareWorksheet(savedExamDocId, user?.id || '', (user as { displayName?: string })?.displayName || user?.name || '', shareUserId.trim());
            showSuccess('Sınav paylaşıldı!');
            setShowShareModal(false);
            setShareUserId('');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Paylaşma hatası';
            setError(msg);
        } finally {
            setIsSharing(false);
        }
    };

    // ─── Öğrenciye Ata ─────────────────────────────────────────────
    const handleAssignToStudent = async (studentId: string, studentName: string) => {
        if (!aktifSinav) return;
        setIsAssigning(true);
        try {
            const user = useAuthStore.getState().user;
            if (!user) { setError('Lütfen giriş yapın.'); return; }
            const saved = await worksheetService.saveWorksheet(
                user.id,
                aktifSinav.baslik || 'Matematik Sınavı',
                ActivityType.MAT_SINAV,
                [{
                    title: aktifSinav.baslik || 'Matematik Sınavı',
                    instruction: 'Problemleri dikkatlice çözünüz.',
                    activityType: ActivityType.MAT_SINAV,
                    data: [aktifSinav],
                    printConfig,
                }],
                'fa-solid fa-user-graduate',
                { id: 'assigned-exams', title: 'Öğrenci Sınavları' },
                undefined,
                undefined,
                studentId,
                studentName,
            );
            setSavedExamDocId(saved.id);
            setAssignedStudentId(studentId);
            showSuccess(`"${studentName}" öğrencisine atandı!`);
            setShowAssignModal(false);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Atama hatası';
            setError(msg);
        } finally {
            setIsAssigning(false);
        }
    };

    // ─── Geçmişten Yükle ─────────────────────────────────────────
    const handleLoadFromHistory = (sinav: typeof aktifSinav) => {
        if (!sinav) return;
        setAktifSinav(sinav);
        setActiveTab('onizleme');
    };

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-secondary)] font-sans overflow-hidden selection:bg-accent/20 selection:text-accent">

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Header */}
            <div className="flex-none px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-paper)]/70 backdrop-blur-2xl flex items-center justify-between gap-4 z-50">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/20">
                        <span className="text-xl">🧮</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-[var(--text-primary)] tracking-tight leading-none">
                            Süper Matematik Sınav Stüdyosu
                        </h1>
                        <p className="text-[10px] text-accent/70 font-bold uppercase tracking-widest mt-1 opacity-80">MEB 2024-2025 · AI Destekli · 1-8. Sınıf</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {ayarlar.sinif && (
                        <div className="px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            <span className="text-[11px] font-bold text-accent">{ayarlar.sinif}. Sınıf</span>
                        </div>
                    )}
                    {kazanimCount > 0 && (
                        <div className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-100/50 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                            <span className="text-[11px] font-bold text-purple-700">{kazanimCount} Kazanım</span>
                        </div>
                    )}
                    <div className="px-3 py-1.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 flex items-center gap-2">
                        <span className="text-[11px] font-bold text-[var(--text-muted)]">{toplamSoru} Soru</span>
                    </div>
                </div>
            </div>



            {/* Ana Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">

                {/* SOL PANEL (SaaS Premium Sidebar) */}
                <div className="lg:col-span-3 flex flex-col bg-[var(--bg-paper)]/50 backdrop-blur-3xl border-r border-[var(--border-color)] shadow-[20px_0_40px_-20px_rgba(0,0,0,0.05)] z-20 overflow-hidden min-h-0">

                    {/* Sticky Oluştur Butonu (Fixed position at Top with blur) */}
                    <div className="flex-none sticky top-0 px-5 py-6 bg-[var(--bg-paper)]/95 backdrop-blur-3xl border-b border-[var(--border-color)] z-[40] shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                        <button
                            onClick={handleGenerate}
                            disabled={!canGenerate() || isGenerating}
                            className={`relative w-full py-4.5 rounded-2xl font-black text-sm tracking-tight text-white transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden group shadow-xl ${canGenerate() && !isGenerating ? 'bg-accent hover:bg-accent hover:shadow-accent/40 hover:-translate-y-1 active:scale-95 active:translate-y-0' : 'bg-[var(--bg-secondary)]/50 cursor-not-allowed text-[var(--text-muted)] shadow-none'}`}
                        >
                            {canGenerate() && !isGenerating && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                            )}
                            {isGenerating ? (
                                <><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>AI Motoru Üretiyor...</>
                            ) : (
                                <>Sınavı Oluştur <i className="fa-solid fa-sparkles text-xs opacity-70 animate-pulse"></i></>
                            )}
                        </button>
                        {!canGenerate() && !isGenerating && (
                            <div className="mt-4 p-3 bg-accent/5 rounded-2xl border border-accent/10 anim-fade-in">
                                <p className="text-[10px] text-accent font-black text-center uppercase tracking-widest leading-relaxed">
                                    {ayarlar.sinif === null ? 'Sınıf seçimi bekleniyor' : kazanimCount === 0 ? 'Kazanım haritası tamamlanmalı' : toplamSoru < 1 ? 'Hedef: En az 1 soru' : ''}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">

                        {/* Sınıf Seçimi */}
                        <div className="bg-[var(--bg-paper)]/70 backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                            <SectionHeader icon="🏫" title="Sınıf Seçimi" badge={ayarlar.sinif ? `${ayarlar.sinif}. Sınıf` : undefined} isOpen={openSections.sinif} onToggle={() => toggleSection('sinif')} />
                            <div className={`transition-all duration-500 ease-in-out ${openSections.sinif ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="px-5 pb-5 pt-1">
                                    <div className="bg-[var(--bg-secondary)]/50 p-2 rounded-2xl border border-[var(--border-color)]">
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                                                <button key={g} onClick={() => setSinif(g)}
                                                    className={`py-3 rounded-xl text-xs font-black transition-all duration-300 ${ayarlar.sinif === g ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-105 z-10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-paper)] hover:text-accent hover:shadow-sm'}`}>
                                                    {g}.
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kazanımlar */}
                        <div className="bg-[var(--bg-paper)]/70 backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                            <SectionHeader icon="🎯" title="Kazanımlar" badge={kazanimCount > 0 ? `${kazanimCount} seçildi` : undefined} isOpen={openSections.kazanim} onToggle={() => toggleSection('kazanim')} />
                            <div className={`transition-all duration-500 ease-in-out ${openSections.kazanim ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="px-5 pb-5 pt-1">
                                    <MatKazanimPicker selectedGrade={ayarlar.sinif} selectedUnites={ayarlar.secilenUniteler} selectedKazanimlar={ayarlar.secilenKazanimlar} onUniteChange={setSecilenUniteler} onKazanimChange={setSecilenKazanimlar} />
                                </div>
                            </div>
                        </div>

                        {/* Soru Ayarları */}
                        <div className="bg-[var(--bg-paper)]/70 backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
                            <SectionHeader icon="⚙️" title="Soru Ayarları" badge={toplamSoru > 0 ? `${toplamSoru} soru` : undefined} isOpen={openSections.ayarlar} onToggle={() => toggleSection('ayarlar')} />
                            <div className={`transition-all duration-500 ease-in-out ${openSections.ayarlar ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="px-5 pb-5 pt-1">
                                    {kazanimCount > 0 ? (
                                        <MatSoruAyarlari ayarlar={ayarlar} onSoruDagilimiChange={setSoruDagilimi} onAyarlarChange={setAyarlar} />
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[var(--border-color)]/50 rounded-2xl bg-[var(--bg-primary)]">
                                            <div className="w-12 h-12 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-3 text-2xl opacity-40">🎯</div>
                                            <span className="text-[11px] font-bold text-[var(--text-muted)] text-center px-4 uppercase tracking-wider leading-relaxed">Kazanım haritası tamamlandıktan sonra açılır</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hata */}
                        {error && (
                            <div className="m-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 font-medium flex items-start gap-3">
                                <span className="text-lg leading-none">⚠️</span>
                                <span>{error}</span>
                                <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">✕</button>
                            </div>
                        )}

                    </div>
                </div>

                {/* SAĞ PANEL */}
                <div className="lg:col-span-9 flex flex-col overflow-hidden min-h-0">

                    {/* Toolbar */}
                    <div className="flex-none bg-[var(--bg-paper)]/30 backdrop-blur-3xl border-b border-[var(--border-color)]/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-20 transition-all duration-500 shadow-[0_8px_32px_-16px_rgba(0,0,0,0.08)]">
                        <div className="flex bg-[var(--bg-secondary)]/30 p-1.5 rounded-2xl backdrop-blur-xl border border-[var(--border-color)]/10 shadow-inner">
                            {(['onizleme', 'cevap-anahtari', 'gecmis'] as TabType[]).map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} disabled={tab !== 'gecmis' && !aktifSinav}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-500 ${activeTab === tab ? 'bg-white text-accent shadow-[0_4px_12px_rgba(0,0,0,0.05)] scale-105 z-10' : (tab === 'gecmis' || aktifSinav) ? 'text-[var(--text-muted)] hover:text-accent hover:bg-white/40' : 'text-[var(--text-muted)] opacity-70 cursor-not-allowed'}`}>
                                    {tab === 'onizleme' ? <span className="flex items-center gap-2">👁️ <span className="hidden sm:inline">Önizleme</span></span> : tab === 'cevap-anahtari' ? <span className="flex items-center gap-2">✓ <span className="hidden sm:inline">Cevap Anahtarı</span></span> : <span className="flex items-center gap-2">📋 <span className="hidden sm:inline">Geçmiş ({sinavGecmisi.length})</span></span>}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { label: 'Kaydet', icon: '💾', fn: handleSaveExam, loading: isSavingToWorkbook, color: 'hover:bg-accent', disabled: !aktifSinav || isSavingToWorkbook },
                                { label: 'Paylaş', icon: '🔗', fn: handleShareExam, loading: false, color: 'hover:bg-purple-600', disabled: !aktifSinav },
                                { label: 'Öğrenciye Ata', icon: '👤', fn: () => setShowAssignModal(true), loading: false, color: 'hover:bg-amber-600', disabled: !aktifSinav },
                            ].map(({ label, icon, fn, color, disabled }) => (
                                <button key={label} onClick={fn} disabled={disabled}
                                    className={`toolbar-btn bg-[var(--bg-paper)]/90 border-2 border-[var(--border-color)] text-[var(--text-muted)] ${color} hover:text-white shadow-sm hover:shadow-lg backdrop-blur-md hover:translate-y-[-2px]`}>
                                    <span className="text-base">{icon}</span><span className="hidden lg:inline">{label}</span>
                                </button>
                            ))}
                            <button
                                onClick={handleAddToFascicle}
                                disabled={!aktifSinav}
                                className="toolbar-btn bg-emerald-500/90 text-white border border-emerald-400/20 shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 hover:shadow-emerald-500/20 hover:translate-y-[-2px] active:scale-95 transition-all duration-300"
                            >
                                <span className="text-base">📚</span><span className="hidden sm:inline uppercase tracking-widest text-[10px]">Kitapçığa Ekle</span>
                            </button>
                            <div className="w-px h-8 bg-[var(--border-color)]/20 mx-1 self-center"></div>
                            <button onClick={handlePrint} disabled={!aktifSinav}
                                className="toolbar-btn bg-[var(--text-primary)] text-[var(--bg-primary)] border-none shadow-xl hover:bg-black hover:translate-y-[-2px] hover:shadow-2xl active:scale-95 transition-all duration-300 disabled:opacity-30">
                                <span className="text-base">🖨️</span><span className="hidden sm:inline uppercase tracking-widest text-[10px]">PDF Yazdır</span>
                            </button>
                        </div>
                    </div>

                    {/* Format Settings Sub-Toolbar (Ultra Minimal SaaS) */}
                    {aktifSinav && activeTab === 'onizleme' && (
                        <div className="flex-none bg-[var(--bg-paper)]/40 backdrop-blur-3xl border-b border-[var(--border-color)]/10 px-6 py-2 flex flex-wrap items-center gap-x-6 gap-y-2 z-10 anim-slide-in shadow-[inset_0_-8px_16px_-8px_rgba(0,0,0,0.02)] h-12">
                            <div className="flex items-center gap-1 bg-white/20 p-1 rounded-[8px] border border-white/40 shadow-sm backdrop-blur-xl">
                                <span className="text-[7.5px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] px-2 border-r border-[var(--border-color)]/20 mr-1">Tasarım</span>
                                <FmtBtn active={printConfig.fontFamily === 'helvetica'} onClick={() => updateConfig('fontFamily', 'helvetica')} title="Inter Fontu">Inter</FmtBtn>
                                <FmtBtn active={printConfig.fontFamily === 'times'} onClick={() => updateConfig('fontFamily', 'times')} title="Times New Roman">Times</FmtBtn>
                                <div className="w-[1px] h-4 bg-[var(--border-color)]/20 mx-1"></div>
                                {([9, 10, 11, 12] as const).map((s) => (
                                    <FmtBtn key={s} active={printConfig.fontSize === s} onClick={() => updateConfig('fontSize', s)} title={`${s} Punto`}>{s}pt</FmtBtn>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 bg-white/20 p-1 rounded-[8px] border border-white/40 shadow-sm backdrop-blur-xl">
                                <span className="text-[7.5px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] px-2 border-r border-[var(--border-color)]/20 mr-1">Yerleşim</span>
                                <FmtBtn active={printConfig.marginMm === 10} onClick={() => updateConfig('marginMm', 10)}>Dar</FmtBtn>
                                <FmtBtn active={printConfig.marginMm === 18} onClick={() => updateConfig('marginMm', 18)}>Orta</FmtBtn>
                                <FmtBtn active={printConfig.marginMm === 25} onClick={() => updateConfig('marginMm', 25)}>Geniş</FmtBtn>
                                <div className="w-[1px] h-4 bg-[var(--border-color)]/20 mx-1"></div>
                                <FmtBtn active={printConfig.columns === 1} onClick={() => updateConfig('columns', 1)} icon="📄">Tek</FmtBtn>
                                <FmtBtn active={printConfig.columns === 2} onClick={() => updateConfig('columns', 2)} icon="📖">Çift</FmtBtn>
                            </div>
                            <div className="flex items-center gap-1 bg-white/20 p-1 rounded-[8px] border border-white/40 shadow-sm backdrop-blur-xl">
                                <span className="text-[7.5px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] px-2 border-r border-[var(--border-color)]/20 mr-1">Metin</span>
                                <FmtBtn active={printConfig.textAlign === 'left'} onClick={() => updateConfig('textAlign', 'left')} icon="⫷">Sola</FmtBtn>
                                <FmtBtn active={printConfig.textAlign === 'justify'} onClick={() => updateConfig('textAlign', 'justify')} icon="⫹">Yasla</FmtBtn>
                                <div className="w-[1px] h-4 bg-[var(--border-color)]/20 mx-1"></div>
                                <FmtBtn active={printConfig.lineHeight === 1.4} onClick={() => updateConfig('lineHeight', 1.4)}>Sıkı</FmtBtn>
                                <FmtBtn active={printConfig.lineHeight === 1.6} onClick={() => updateConfig('lineHeight', 1.6)}>Normal</FmtBtn>
                                <FmtBtn active={printConfig.lineHeight === 1.8} onClick={() => updateConfig('lineHeight', 1.8)}>Ayrık</FmtBtn>
                            </div>
                        </div>
                    )}

                    {/* Toast */}
                    {successMessage && (
                        <div className="absolute top-14 right-5 z-50 anim-slide-in bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 font-semibold text-sm">
                            ✅ {successMessage}
                        </div>
                    )}

                    {/* İçerik */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--bg-secondary)]/30">
                        <div className="p-8 lg:p-12 min-h-full flex justify-center">
                            {activeTab === 'gecmis' ? (
                                /* Geçmiş */
                                <div className="max-w-[800px] w-full mx-auto anim-fade-in">
                                    <h2 className="text-lg font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">📋 Sınav Geçmişi</h2>
                                    {sinavGecmisi.length === 0 ? (
                                        <div className="text-center text-[var(--text-muted)] opacity-70 text-sm py-32 bg-[var(--bg-paper)]/50 backdrop-blur-xl rounded-3xl border-2 border-dashed border-[var(--border-color)] font-bold uppercase tracking-widest">Henüz sınav oluşturmadınız.</div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {sinavGecmisi.map((sinav: MatSinav) => (
                                                <div key={sinav.id} className="bg-white/70 backdrop-blur-md rounded-2xl border border-[var(--border-color)] p-4 flex items-center justify-between hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 group">
                                                    <div>
                                                        <p className="text-[13px] font-black text-[var(--text-primary)] group-hover:text-accent transition-colors uppercase tracking-tight">{sinav.baslik}</p>
                                                        <div className="flex items-center gap-2 mt-1.5 font-bold">
                                                            <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-accent/20">{sinav.sinif}. Sınıf</span>
                                                            <span className="text-[9px] text-[var(--text-muted)]">{new Date(sinav.olusturmaTarihi).toLocaleDateString('tr-TR')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => handleLoadFromHistory(sinav)} className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/20 hover:scale-110 active:scale-95 transition-transform">👁️</button>
                                                        <button onClick={() => removeSinavGecmisi(sinav.id)} className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 hover:bg-rose-100 hover:scale-110 active:scale-95 transition-transform">🗑</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : aktifSinav ? (
                                <div className="anim-fade-in w-full max-w-[900px]">
                                    {activeTab === 'onizleme' ? (
                                        <div className="shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden ring-1 ring-white/60">
                                            <MatSinavOnizleme
                                                sinav={aktifSinav}
                                                onUpdateSoru={handleUpdateSoru}
                                                onRefreshSoru={handleRefreshSoru}
                                                refreshingIndex={refreshingIndex}
                                                config={printConfig}
                                            />
                                        </div>
                                    ) : (
                                        <div className="bg-[var(--bg-paper)]/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[var(--border-color)]">
                                            <MatCevapAnahtariComponent
                                                cevapAnahtari={aktifSinav.cevapAnahtari}
                                                sinavBaslik={aktifSinav.baslik}
                                            />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-[var(--text-muted)] opacity-70 space-y-6">
                                    <div className="w-32 h-32 bg-[var(--bg-paper)]/50 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl border border-[var(--border-color)] group">
                                        <span className="text-6xl opacity-30 group-hover:scale-110 transition-transform duration-500">🧮</span>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-black text-[var(--text-muted)] tracking-tight">Önizleme Alanı</p>
                                        <p className="text-sm text-[var(--text-muted)] mt-2 font-medium">
                                            Sol panelden ayarları yapın ve <strong className="text-accent">Sınavı Oluştur</strong>'a basın.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* GİZLİ BASKI KATMANI — Sadece Sınav */}
            {aktifSinav && (
                <div id="mat-sinav-print-target" className="hidden">
                    <div id="mat-sinav-print-inner">
                        <MatSinavOnizleme 
                            sinav={aktifSinav} 
                            onUpdateSoru={handleUpdateSoru} 
                            onRefreshSoru={handleRefreshSoru} 
                            refreshingIndex={null} 
                            config={printConfig} 
                            isPrinting={true} 
                        />
                    </div>
                    {/* Yazdırma CSS — sayfa bölünmez sorular + compact A4 */}
                    <style>{`
                        .mat-sinav-onizleme.is-printing {
                            padding: 5mm 7mm !important;
                            font-size: 8.5pt !important;
                            page-break-after: avoid !important;
                            break-after: avoid !important;
                        }
                        .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper,
                        .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div {
                            page-break-inside: avoid !important;
                            break-inside: avoid !important;
                        }
                        .mat-sinav-onizleme.is-printing .sorular-container {
                            gap: 3mm !important;
                            column-gap: 4mm !important;
                        }
                        .mat-sinav-onizleme.is-printing .mat-sinav-print-header {
                            margin-bottom: 3px !important;
                            padding-bottom: 2px !important;
                        }
                        .mat-sinav-onizleme.is-printing .mat-sinav-print-header h1 {
                            font-size: 13pt !important;
                        }
                        .mat-sinav-onizleme.is-printing .mat-sinav-print-header div {
                            font-size: 8pt !important;
                            gap: 8px !important;
                        }
                        .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div {
                            padding: 1mm 1.5mm !important;
                            margin: 0 !important;
                            border: none !important;
                            border-bottom: 0.5px dashed #ccc !important;
                            border-radius: 0 !important;
                        }
                        .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div .soru-label {
                            font-size: 9pt !important;
                        }
                        .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div .soru-text {
                            font-size: 8pt !important;
                            line-height: 1.25 !important;
                            margin-bottom: 0.5mm !important;
                        }
                        .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper > div .secenek {
                            font-size: 7.5pt !important;
                            line-height: 1.15 !important;
                            padding: 0.2mm 0.8mm !important;
                        }
                        @media print {
                            .mat-sinav-onizleme.is-printing .mat-sinav-soru-wrapper {
                                page-break-inside: avoid !important;
                                break-inside: avoid !important;
                            }
                        }
                    `}</style>
                </div>
            )}

            {/* ÖĞRENCİYE ATA MODAL */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowAssignModal(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-gray-800 mb-4">Öğrenciye Ata</h2>
                        {useStudentStore.getState().students.length === 0 ? (
                            <p className="text-sm text-gray-500">Henüz öğrenci eklenmemiş. Lütfen önce öğrenci ekleyin.</p>
                        ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                                {useStudentStore.getState().students.map((s: any) => (
                                    <button
                                        key={s.id}
                                        onClick={() => handleAssignToStudent(s.id, s.name)}
                                        disabled={isAssigning}
                                        className="w-full text-left px-4 py-3 rounded-2xl border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-all flex items-center gap-3 group"
                                    >
                                        <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                                            {s.name.charAt(0)}
                                        </span>
                                        <div>
                                            <div className="font-bold text-sm text-gray-800">{s.name}</div>
                                            <div className="text-[10px] text-gray-500">{s.grade} · {s.learningStyle}</div>
                                        </div>
                                        {isAssigning && <span className="ml-auto text-amber-500"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg></span>}
                                    </button>
                                ))}
                            </div>
                        )}
                        <button onClick={() => setShowAssignModal(false)} className="mt-4 w-full py-2.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all">İptal</button>
                    </div>
                </div>
            )}

            {/* PAYLAŞIM MODAL */}
            {showShareModal && (
                <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-lg font-black text-gray-800 mb-4">Sınavı Paylaş</h2>
                        <p className="text-sm text-gray-500 mb-3">Paylaşmak istediğiniz kullanıcının ID'sini girin:</p>
                        <input
                            type="text"
                            value={shareUserId}
                            onChange={(e) => setShareUserId(e.target.value)}
                            placeholder="Kullanıcı ID'si"
                            className="w-full px-4 py-2.5 rounded-2xl border-2 border-gray-200 text-sm font-medium focus:border-purple-400 focus:outline-none"
                        />
                        <div className="flex gap-2 mt-4">
                            <button onClick={handleConfirmShare} disabled={isSharing || !shareUserId.trim()}
                                className="flex-1 py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 transition-all disabled:opacity-50">
                                {isSharing ? 'Paylaşılıyor...' : 'Paylaş'}
                            </button>
                            <button onClick={() => setShowShareModal(false)} className="flex-1 py-2.5 rounded-2xl bg-gray-100 text-gray-600 font-bold text-sm hover:bg-gray-200 transition-all">İptal</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .toolbar-btn {
          display:flex; align-items:center; gap:0.5rem;
          padding:0.5rem 1rem; border-radius:1rem;
          font-weight:800; font-size:0.75rem; transition:all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toolbar-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .custom-scrollbar::-webkit-scrollbar { width:6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background:hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.1); border-radius:10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background:hsl(var(--accent-h) var(--accent-s) var(--accent-l) / 0.3); }
        .anim-fade-in { animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .anim-slide-in { animation: slideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.98) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes slideIn { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
        </div>
    );
};
