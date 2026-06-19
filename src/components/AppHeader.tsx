import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DyslexiaLogo from './DyslexiaLogo';
import GlobalSearch from './GlobalSearch';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useWorksheetStore } from '../store/useWorksheetStore';
import { useRBAC } from '../hooks/useRBAC';
import { ActivityType, View } from '../types';
import { useStudentStore } from '../store/useStudentStore';
import { messagingService } from '../services/messagingService';

interface AppHeaderProps {
    onOpenModal: (modal: 'settings' | 'history' | 'about' | 'developer') => void;
    onOpenFeedback: () => void;
    onOpenAuth: () => void;
    onSelectActivity: (activity: ActivityType | null) => void;
    onOpenStudio: (viewName: View) => void;
}

/** Yalnızca DESTEK menüsü — ultra kompakt, tema token’ları */
export const DropdownItemSupportCompact = ({
    icon,
    label,
    onClick,
}: {
    icon: string;
    label: string;
    onClick?: () => void;
}) => (
    <button
        type="button"
        onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (onClick && typeof onClick === 'function') {
                onClick();
            }
        }}
        className="w-full flex items-center gap-1.5 pl-1 pr-1 py-[3px] rounded-md border border-transparent bg-transparent hover:bg-[var(--bg-secondary)] hover:border-[var(--border-color)]/40 transition-[background-color,border-color] duration-150 group/sup focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-color)]/35 focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--bg-paper)]"
    >
        <span
            aria-hidden
            className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] bg-[var(--bg-secondary)] text-[var(--accent-color)] border border-[var(--border-color)]/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] text-[8px]"
        >
            <i className={`fa-solid ${icon} leading-none`}></i>
        </span>
        <span className="flex-1 min-w-0 text-left text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-secondary)] leading-[1.1] group-hover/sup:text-[var(--text-primary)]">
            {label}
        </span>
        <i className="fa-solid fa-angle-right text-[7px] text-[var(--text-muted)] opacity-35 shrink-0 group-hover/sup:opacity-60 translate-x-px" aria-hidden />
    </button>
);

export const HeaderDropdown = ({
    label,
    icon,
    children,
    colorClass = 'text-[var(--text-secondary)]',
    menuVariant = 'default',
}: {
    label: string;
    icon: string;
    children?: React.ReactNode;
    colorClass?: string;
    /** `supportCompact` — dar panel, sıkı liste (DESTEK) */
    menuVariant?: 'default' | 'supportCompact';
}) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className="relative group font-['Lexend']"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                title={label}
                className={`flex flex-col items-center justify-center gap-0 w-10 min-h-[2.75rem] py-1 rounded-xl transition-all duration-200 border border-transparent hover:bg-[var(--bg-secondary)] hover:border-[var(--border-color)]/35 hover:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] active:scale-[0.96] group/drop ${colorClass} relative overflow-hidden`}
            >
                <i className={`fa-solid ${icon} text-[15px] leading-none group-hover/drop:text-[var(--accent-color)] transition-colors`}></i>
                <span className="text-[6.5px] font-black uppercase tracking-[0.09em] opacity-65 group-hover/drop:opacity-100 transition-opacity leading-none max-w-[2.85rem] truncate text-center">{label}</span>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            layoutId="dropdown-dot"
                            className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-[var(--accent-color)]"
                        />
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute right-0 top-full z-[100] ${menuVariant === 'supportCompact' ? 'pt-1' : 'pt-2'}`}
                    >
                        <div
                            className={
                                menuVariant === 'supportCompact'
                                    ? 'min-w-[176px] max-w-[200px] p-0.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)]/98 backdrop-blur-xl shadow-premium ring-1 ring-black/[0.04] dark:ring-white/[0.06] overflow-hidden'
                                    : 'bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[1.8rem] shadow-premium p-2 min-w-[240px] overflow-hidden backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5'
                            }
                        >
                            {menuVariant === 'supportCompact' ? (
                                <div className="flex flex-col gap-px rounded-[10px] bg-[var(--bg-secondary)]/20 p-0.5">
                                    {children}
                                </div>
                            ) : (
                                children
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const DropdownItem = ({
    icon,
    label,
    onClick,
    badge,
}: {
    icon: string;
    label: string;
    onClick?: () => void;
    badge?: number;
}) => (
    <button
        onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (typeof onClick === 'function') {
                onClick();
            }
        }}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[var(--bg-secondary)] hover:pl-6 rounded-[1.2rem] transition-all duration-300 group font-['Lexend']"
    >
        <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-xl bg-[var(--bg-secondary)] group-hover:bg-[var(--bg-paper)] flex items-center justify-center transition-colors">
                <i className={`fa-solid ${icon} text-xs text-[var(--text-muted)] group-hover:text-[var(--accent-color)] transition-all`}></i>
            </div>
            <span className="text-[12px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                {label}
            </span>
        </div>
        {badge !== undefined && badge > 0 && (
            <span className="bg-[var(--accent-color)] text-white text-[9px] font-black px-2 py-0.5 rounded-lg shadow-sm">
                {badge}
            </span>
        )}
    </button>
);

export const AppHeader = ({
    onOpenModal,
    onOpenFeedback,
    onOpenAuth,
    onSelectActivity,
    onOpenStudio,
}: AppHeaderProps) => {
    const { user, logout } = useAuthStore();
    const { isAdmin, canAccess } = useRBAC();
    const { setIsSidebarOpen, zenMode, setIsTourActive, showConnect, toggleConnect, unreadMessageCount, setUnreadMessageCount } = useUIStore();
    const { currentView, setCurrentView, addHistoryView, setSelectedActivity, setWorksheetData, setActiveCurriculumSession, activeCurriculumSession } = useWorksheetStore();
    const { activeStudent } = useStudentStore();

    // ─── Okunmamış mesaj sayacı — gerçek zamanlı Firestore listener ───
    useEffect(() => {
        if (!user?.id || !canAccess('messaging')) return;
        const unsub = messagingService.listenToUnreadCount(user.id, (count) => {
            setUnreadMessageCount(count);
        });
        return () => unsub?.();
    }, [user?.id]);

    // Connect panel açıkken okunmamış sayacı sıfırla
    useEffect(() => {
        if (showConnect) setUnreadMessageCount(0);
    }, [showConnect]);

    const navigateTo = (view: View) => {
        if (currentView === view) return;
        addHistoryView(currentView);
        setCurrentView(view);
    };

    return (
        <header
            className={`relative bg-[var(--bg-paper)] border-b border-[var(--border-color)] shadow-xl z-[90] transition-all duration-500 font-['Lexend'] ${zenMode ? '-mt-24 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}
        >
            <div className="w-full px-6 md:px-8 py-4 flex items-center gap-3 md:gap-4">
                {/* Sol: logo eş geniş şerit (sağ ile dengeli orta blok için flex-1) */}
                <div className="flex min-w-0 flex-1 items-center justify-start gap-4 md:gap-6">
                    <button
                        onClick={() => {
                            if (typeof setIsSidebarOpen === 'function') setIsSidebarOpen(true);
                        }}
                        className="md:hidden shrink-0 text-[var(--text-muted)] p-2 hover:text-[var(--text-primary)] transition-colors"
                    >
                        <i className="fa-solid fa-bars-staggered fa-lg"></i>
                    </button>

                    <button
                        id="tour-logo"
                        onClick={() => {
                            navigateTo('generator');
                            setSelectedActivity(null);
                            setWorksheetData(null);
                            setActiveCurriculumSession(null);
                        }}
                        className="relative group flex shrink-0 items-center gap-3"
                        type="button"
                    >
                        <div className="relative">
                            <DyslexiaLogo className="h-10 w-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[var(--bg-paper)] rounded-full shadow-sm"></div>
                        </div>
                    </button>
                </div>

                {/* Orta: başlıklar tam yatay merkez; sol–sağ şeritleri eşit flex-1 ile dengelenir */}
                <div className="hidden shrink-0 flex-col items-center justify-center text-center md:flex">
                    <button
                        type="button"
                        onClick={() => {
                            navigateTo('generator');
                            setSelectedActivity(null);
                            setWorksheetData(null);
                            setActiveCurriculumSession(null);
                        }}
                        className="group flex flex-col items-center justify-center px-3 transition-transform duration-500"
                    >
                        <span className="text-[20px] font-black tracking-tighter text-[var(--text-primary)] leading-none mb-0.5 group-hover:text-[var(--accent-color)] transition-colors uppercase">
                            BDMIND
                        </span>
                        <span className="text-[8px] font-black tracking-[0.25em] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] uppercase transition-colors whitespace-nowrap">
                            EDU-TECH PLATFORM
                        </span>
                    </button>
                </div>

                <div className="flex min-w-0 flex-1 items-center justify-end gap-1 md:gap-2">
                    <AnimatePresence>
                        {activeStudent && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[var(--bg-paper)]/80 backdrop-blur-xl border border-emerald-500/40 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.15)] transition-all duration-300 group/active cursor-default mr-1 hover:border-emerald-500/60 hover:shadow-[0_4px_25px_rgba(16,185,129,0.25)] ring-1 ring-white/5 z-[100]"
                            >
                                <div className="relative flex items-center justify-center mt-0.5">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-40"></div>
                                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] z-10"></div>
                                </div>
                                <div className="flex flex-col -space-y-0.5">
                                    <span className="text-[9px] font-black tracking-[0.15em] text-emerald-500 uppercase leading-none opacity-90 drop-shadow-sm">
                                        AKTİF ODAK
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <i className="fa-solid fa-user-graduate text-emerald-400 text-[11px]"></i>
                                        <span className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-tight">
                                            {activeStudent.name.split(' ')[0]}
                                        </span>
                                    </div>
                                </div>
                                <div className="ml-1 pl-2 border-l border-emerald-500/20 flex flex-col justify-center gap-0.5 py-0.5">
                                    <span className="text-[7.5px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">
                                        SNF: <span className="text-emerald-400/90">{activeStudent.grade}</span>
                                    </span>
                                    <span className="text-[7.5px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">
                                        PRFL: <span className="text-emerald-400/90">{activeStudent.diagnosis?.[0] || 'GENEL'}</span>
                                    </span>
                                </div>
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        useStudentStore.getState().setActiveStudent(null);
                                    }}
                                    className="ml-1 w-6 h-6 flex items-center justify-center rounded-[10px] hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-400 transition-colors shadow-none hover:shadow-[0_0_10px_rgba(244,63,94,0.1)] active:scale-95"
                                    title="Öğrenci Odağını Kapat"
                                >
                                    <i className="fa-solid fa-xmark text-[11px]"></i>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center gap-1 p-1 bg-[var(--bg-secondary)]/90 rounded-xl border border-[var(--border-color)] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-sm">
                        {(activeStudent || activeCurriculumSession) && (
                            <button
                                onClick={() => {
                                    (window as any).studentDashboardDefaultTab = 'plans';
                                    (window as any).academicPlanDefaultTab = 'schedule';
                                    if (typeof onOpenStudio === 'function') onOpenStudio('students');
                                }}
                                className="flex shrink-0 items-center justify-center w-9 h-9 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all shadow-md hover:shadow-lg active:scale-[0.96] border border-white/10 group/nav animate-pulse"
                                title="Öğrenci Eğitim Planına Geri Dön"
                            >
                                <i className="fa-solid fa-map-location-dot text-[15px] leading-none group-hover/nav:scale-105 transition-transform"></i>
                            </button>
                        )}

                        <button
                            onClick={() => onOpenStudio('assessment')}
                            className="flex shrink-0 items-center justify-center w-9 h-9 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all shadow-md hover:shadow-lg active:scale-[0.96] border border-white/10 group/nav"
                            title="Değerlendirme Modülü"
                        >
                            <i className="fa-solid fa-stethoscope text-[15px] leading-none group-hover/nav:scale-105 transition-transform"></i>
                        </button>

                        <button
                            onClick={() => {
                                if (typeof setIsSidebarOpen === 'function') setIsSidebarOpen(false);
                                if (typeof onOpenStudio === 'function') onOpenStudio('students');
                            }}
                            className="flex shrink-0 items-center justify-center w-9 h-9 bg-[var(--bg-paper)] text-[var(--accent-color)] hover:bg-[var(--accent-muted)] border border-[var(--border-color)] rounded-lg transition-all active:scale-[0.96] shadow-sm group/nav"
                            title="Öğrenci Yönetimi"
                        >
                            <i className="fa-solid fa-user-graduate text-[15px] leading-none group-hover/nav:scale-105 transition-transform"></i>
                        </button>

                        {canAccess('messaging') && (
                            // Wrapper div: badge buton sınırlarını aşabileceği için overflow-visible burada
                            <div className="relative">
                                <button
                                    onClick={() => toggleConnect()}
                                    className={`flex shrink-0 items-center justify-center w-9 h-9 bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-lg transition-all active:scale-[0.96] shadow-sm group/nav relative ${showConnect ? 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                                    title="Oogmatik Connect"
                                >
                                    <i className="fa-solid fa-comments text-[15px] leading-none group-hover/nav:scale-105 transition-transform"></i>
                                    {/* Okunmamış yok → küçük indigo nokta (buton içinde kalır) */}
                                    {unreadMessageCount === 0 && (
                                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                                    )}
                                </button>
                                {/* Okunmamış badge — butonun DIŞINDA, wrapper div'e konumlandırıldı, asla kırpılmaz */}
                                {unreadMessageCount > 0 && (
                                    <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-[var(--bg-paper)] shadow-lg shadow-rose-500/50 animate-bounce tabular-nums z-[200] pointer-events-none">
                                        {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-0.5 md:gap-1">
                        <GlobalSearch onSelectActivity={onSelectActivity} />


                        <div className="w-px self-stretch min-h-[1rem] max-h-[1.5rem] bg-[var(--border-color)] mx-0.5 opacity-35" aria-hidden />

                        <HeaderDropdown label="KİTAPLIK" icon="fa-shapes" colorClass="text-[var(--accent-color)]">
                            <DropdownItem icon="fa-star" label="Favori Etkinliklerim" onClick={() => { setIsSidebarOpen(false); navigateTo('favorites'); }} />
                            <DropdownItem icon="fa-box-archive" label="Dijital Arşiv" onClick={() => { setIsSidebarOpen(false); navigateTo('savedList'); }} />
                            <DropdownItem icon="fa-share-nodes" label="Paylaşılan Materyaller" onClick={() => { setIsSidebarOpen(false); navigateTo('shared'); }} />
                            <DropdownItem icon="fa-clock-rotate-left" label="İşlem Geçmişi" onClick={() => { setIsSidebarOpen(false); onOpenModal('history'); }} />
                        </HeaderDropdown>

                        <HeaderDropdown label="DESTEK" icon="fa-headset" menuVariant="supportCompact">
                            <DropdownItemSupportCompact icon="fa-circle-play" label="Rehber Turu Başlat" onClick={() => setIsTourActive(true)} />
                            <DropdownItemSupportCompact icon="fa-headset" label="Premium Yardım Masası" onClick={onOpenFeedback} />
                            <DropdownItemSupportCompact icon="fa-circle-question" label="Platform Hakkımızda" onClick={() => onOpenModal('about')} />
                            <DropdownItemSupportCompact icon="fa-laptop-code" label="Geliştirici Vizyonu" onClick={() => onOpenModal('developer')} />
                        </HeaderDropdown>

                        <div className="w-px self-stretch min-h-[1rem] max-h-[1.5rem] bg-[var(--border-color)] mx-1 opacity-45" aria-hidden />

                        {user ? (
                            <HeaderDropdown
                                label={user.name.split(' ')[0].toUpperCase()}
                                icon="fa-user-circle"
                                colorClass="text-[var(--text-primary)]"
                            >
                                <DropdownItem icon="fa-user-gear" label="Profil Ayarları" onClick={() => { setIsSidebarOpen(false); navigateTo('profile'); }} />
                                <DropdownItem icon="fa-sliders" label="Görünüm Ayarları" onClick={() => { setIsSidebarOpen(false); onOpenModal('settings'); }} />
                                {isAdmin && <div className="h-px bg-[var(--border-color)] my-2 opacity-50"></div>}
                                {isAdmin && <DropdownItem icon="fa-shield-halved" label="Yönetim Paneli" onClick={() => { setIsSidebarOpen(false); navigateTo('admin'); }} />}
                                <div className="h-px bg-[var(--border-color)] my-2 opacity-50"></div>

                                <DropdownItem icon="fa-arrow-right-from-bracket" label="Oturumu Kapat" onClick={async () => await logout()} />
                            </HeaderDropdown>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="px-4 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-[10px] font-black tracking-wide shadow-premium hover:shadow-lg active:scale-[0.98] transition-all border border-white/10"
                            >
                                GİRİŞ YAP
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
