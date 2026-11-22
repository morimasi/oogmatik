// Math Studio — Top Header Bar with Glassmorphism, ZPD Badges, and Quick Export Actions

import React from 'react';
import { MathMode } from '../../../types/math';
import { useFascicleStore } from '../../../store/useFascicleStore';
import { useAuthStore } from '../../../store/useAuthStore';
import { ActivityType } from '../../../types';
import toast from 'react-hot-toast';

interface MathHeaderProps {
    mode: MathMode;
    setMode: (mode: MathMode) => void;
    onBack: () => void;
    onPrint: (action: 'print' | 'download') => void;
    onSave: () => void;
    onShare: () => void;
    onCopyLink?: () => void;
    onExportAnswerKey?: () => void;
    onRegenerate: () => void;
    onToggleSidebar: () => void;
    isPrinting: boolean;
    isSaving: boolean;
    isAutoSaving?: boolean;
    lastAutoSaveTime?: Date | null;
    isSidebarOpen: boolean;
    learningProfile?: string;
    // Data for Fascicle
    drillConfig?: any;
    problemConfig?: any;
    pageConfig?: any;
    generatedDrills?: any[];
    generatedProblems?: any[];
}

export const MathHeader: React.FC<MathHeaderProps> = ({
    mode, setMode, onBack, onPrint, onSave, onShare, onCopyLink, onExportAnswerKey,
    onRegenerate, onToggleSidebar, isPrinting, isSaving, isAutoSaving, lastAutoSaveTime, isSidebarOpen,
    learningProfile = 'dyslexia',
    drillConfig, problemConfig, pageConfig, generatedDrills, generatedProblems
}) => {
    const { user } = useAuthStore();
    const isStudent = user?.role === 'student';

    const profileBadge = {
        dyscalculia: { label: 'Diskalkuli Odaklı', icon: 'fa-shapes', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
        dyslexia: { label: 'Disleksi Dostu', icon: 'fa-book-open-reader', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
        adhd: { label: 'DEHB Mikro-Döngü', icon: 'fa-bolt', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
        mixed: { label: 'Karma Destek', icon: 'fa-puzzle-piece', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    }[learningProfile] || { label: 'Özel Eğitim', icon: 'fa-graduation-cap', color: 'bg-accent/10 text-accent border-accent/30' };

    return (
        <div className="h-16 bg-[var(--bg-paper)]/90 backdrop-blur-xl border-b border-[var(--border-color)] flex justify-between items-center px-4 shrink-0 z-50">
            {/* LEFT — Brand & Back */}
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:text-accent transition-all shadow-sm"
                    title="Geri Dön"
                >
                    <i className="fa-solid fa-arrow-left text-xs"></i>
                </button>

                {/* Mobile sidebar toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:text-accent transition-all lg:hidden"
                    title={isSidebarOpen ? 'Paneli Kapat' : 'Paneli Aç'}
                >
                    <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'} text-xs`}></i>
                </button>

                <div className="flex items-center gap-2">
                    <h1 className="font-black text-base tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-emerald-400">
                            MATEMATİK STÜDYOSU
                        </span>
                        <span className="bg-accent/20 text-accent px-1.5 py-0.5 rounded text-[8px] border border-accent/30 font-black uppercase tracking-wider">
                            PRO v3
                        </span>
                    </h1>

                    {/* Neuro-Pedagogical Profile Badge */}
                    <div className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${profileBadge.color}`}>
                        <i className={`fa-solid ${profileBadge.icon} text-[9px]`}></i>
                        <span>{profileBadge.label}</span>
                    </div>

                    {/* Auto-Save Status */}
                    {isAutoSaving ? (
                        <span className="hidden xl:flex items-center gap-1 text-[9px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            <i className="fa-solid fa-circle-notch fa-spin text-[8px]"></i>
                            <span>Taslak Kaydediliyor...</span>
                        </span>
                    ) : lastAutoSaveTime ? (
                        <span className="hidden xl:flex items-center gap-1 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <i className="fa-solid fa-check text-[8px]"></i>
                            <span>Otomatik Taslak Kaydedildi</span>
                        </span>
                    ) : null}
                </div>
            </div>

            {/* CENTER — Mode Switch */}
            <div className="flex bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-1 gap-1 shadow-inner">
                <button
                    onClick={() => setMode('drill')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        mode === 'drill'
                            ? 'bg-accent text-white shadow-md shadow-accent/20 scale-[1.02]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                >
                    <i className="fa-solid fa-calculator text-xs"></i>
                    <span className="hidden sm:inline">İşlem Atölyesi</span>
                </button>
                <button
                    onClick={() => setMode('problem_ai')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                        mode === 'problem_ai'
                            ? 'bg-accent text-white shadow-md shadow-accent/20 scale-[1.02]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                >
                    <i className="fa-solid fa-brain text-xs"></i>
                    <span className="hidden sm:inline">AI Problemleri</span>
                </button>
            </div>

            {/* RIGHT — Actions */}
            <div className="flex items-center gap-1.5">
                {/* Regenerate */}
                <button
                    onClick={onRegenerate}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] hover:bg-accent border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-all shadow-sm"
                    title="Soruları Yeniden Üret"
                >
                    <i className="fa-solid fa-rotate text-xs"></i>
                </button>

                {/* Copy Link */}
                {onCopyLink && (
                    <button
                        onClick={onCopyLink}
                        className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-sm hidden md:flex"
                        title="Çalışma Linkini Kopyala"
                    >
                        <i className="fa-solid fa-link text-xs"></i>
                    </button>
                )}

                {/* PDF Download */}
                <button
                    onClick={() => onPrint('download')}
                    disabled={isPrinting}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-sm disabled:opacity-50"
                    title="A4 PDF Olarak İndir"
                >
                    {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i> : <i className="fa-solid fa-file-pdf text-xs"></i>}
                </button>

                {/* Direct Print */}
                <button
                    onClick={() => onPrint('print')}
                    disabled={isPrinting}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-sm hidden sm:flex disabled:opacity-50"
                    title="Doğrudan Yazdır"
                >
                    <i className="fa-solid fa-print text-xs"></i>
                </button>

                {/* Export Answer Key Only */}
                {onExportAnswerKey && !isStudent && (
                    <button
                        onClick={onExportAnswerKey}
                        disabled={isPrinting}
                        className="w-9 h-9 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 hover:text-amber-400 transition-all shadow-sm hidden lg:flex"
                        title="Yalnızca Cevap Anahtarını İndir"
                    >
                        <i className="fa-solid fa-key text-xs"></i>
                    </button>
                )}

                {/* Share Modal */}
                <button
                    onClick={onShare}
                    className="w-9 h-9 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-sm"
                    title="Öğrenci veya Meslektaşla Paylaş"
                >
                    <i className="fa-solid fa-share-nodes text-xs"></i>
                </button>

                {/* Add to Fascicle */}
                <button
                    onClick={() => {
                        const { addItem, items: fascicleItems } = useFascicleStore.getState();
                        const isDrill = mode === 'drill';
                        const activeConfig = isDrill ? drillConfig : problemConfig;
                        const activeItems = isDrill ? generatedDrills : generatedProblems;

                        if (!activeItems || activeItems.length === 0) {
                            toast.error('Lütfen önce içerik üretin!');
                            return;
                        }

                        addItem({
                            id: crypto.randomUUID(),
                            type: ActivityType.MATH_STUDIO,
                            difficulty: activeConfig?.difficulty || 'Orta',
                            pageCount: 1,
                            order: fascicleItems.length,
                            content: {
                                mode,
                                config: activeConfig,
                                pageConfig,
                                items: activeItems
                            }
                        });
                        toast.success('Fasiküle eklendi!');
                    }}
                    className="w-9 h-9 rounded-xl bg-fuchsia-600/90 hover:bg-fuchsia-500 border border-fuchsia-400/40 flex items-center justify-center text-white transition-all shadow-md shadow-fuchsia-600/20"
                    title="Fasikül Kitapçığına Ekle"
                >
                    <i className="fa-solid fa-layer-group text-xs"></i>
                </button>

                {/* Save (Firestore) */}
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md ${
                        isSaving
                            ? 'bg-[var(--bg-secondary)] text-[var(--text-muted)] cursor-not-allowed'
                            : 'bg-[var(--accent-color)] text-white hover:opacity-90 hover:scale-[1.02]'
                    }`}
                >
                    {isSaving ? <i className="fa-solid fa-circle-notch fa-spin text-xs"></i> : <i className="fa-solid fa-floppy-disk text-xs"></i>}
                    <span className="hidden sm:inline">Kaydet</span>
                </button>
            </div>
        </div>
    );
};
