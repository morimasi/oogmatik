import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DyslexiaLogo from './DyslexiaLogo';
import GlobalSearch from './GlobalSearch';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useWorksheetStore } from '../store/useWorksheetStore';
import { ActivityType, View } from '../types';

interface AppHeaderProps {
    workbookItemsCount: number;
    unreadCount: number;
    onOpenModal: (modal: 'settings' | 'history' | 'about' | 'developer') => void;
    onOpenFeedback: () => void;
    onOpenAuth: () => void;
    onSelectActivity: (activity: ActivityType | null) => void;
    onOpenStudio: (viewName: View) => void;
}

export const HeaderDropdown = ({
    label,
    icon,
    children,
    colorClass = 'text-[var(--text-secondary)]',
}: {
    label: string;
    icon: string;
    children?: React.ReactNode;
    colorClass?: string;
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
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 hover:bg-[var(--accent-muted)] hover:scale-105 active:scale-95 group/drop ${colorClass} relative overflow-hidden`}
            >
                <i className={`fa-solid ${icon} text-lg mb-1 group-hover/drop:text-[var(--accent-color)] transition-colors`}></i>
                <span className="text-[7.5px] font-black uppercase tracking-[0.1em] opacity-60 group-hover/drop:opacity-100 transition-opacity">{label}</span>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            layoutId="dropdown-dot"
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent-color)]"
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
                        className="absolute right-0 top-full pt-2 z-[100]"
                    >
                        <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-[1.8rem] shadow-premium p-2 min-w-[240px] overflow-hidden backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/5">
                            {children}
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
            if (onClick && typeof onClick === 'function') {
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
    workbookItemsCount,
    unreadCount,
    onOpenModal,
    onOpenFeedback,
    onOpenAuth,
    onSelectActivity,
    onOpenStudio,
}: AppHeaderProps) => {
    const { user, logout } = useAuthStore();
    const { setIsSidebarOpen, zenMode, setIsTourActive } = useUIStore();
    const { currentView, setCurrentView, addHistoryView, setSelectedActivity, setWorksheetData, setActiveCurriculumSession } = useWorksheetStore();

    const navigateTo = (view: View) => {
        if (currentView === view) return;
        addHistoryView(currentView);
        setCurrentView(view);
    };

    return (
        <header
            className={`relative bg-[var(--bg-paper)] border-b border-[var(--border-color)] shadow-xl z-[90] transition-all duration-500 font-['Lexend'] ${zenMode ? '-mt-24 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}
        >
            <div className="w-full px-8 py-5 flex items-center justify-between gap-6">
                
                {/* 1. SOL BLOK: LOGO VE HAMBURGER */}
                <div className="flex-1 flex items-center justify-start gap-4 md:gap-6">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="md:hidden text-[var(--text-muted)] p-2 hover:text-[var(--text-primary)] transition-colors"
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
                        className="relative group block"
                    >
                        <DyslexiaLogo className="h-10 w-auto transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-[var(--bg-paper)] rounded-full shadow-sm"></div>
                    </button>
                </div>

                {/* 2. ORTA BLOK: BDMIND YAZISI */}
                <div 
                    className="flex-none flex flex-col items-center justify-center cursor-pointer transition-transform duration-500 hover:scale-105 group"
                    onClick={() => {
                        navigateTo('generator');
                        setSelectedActivity(null);
                        setWorksheetData(null);
                        setActiveCurriculumSession(null);
                    }}
                >
                    <span className="text-[20px] md:text-[22px] font-black tracking-tighter text-[var(--text-primary)] leading-none mb-1 group-hover:text-[var(--accent-color)] transition-colors uppercase">
                        BDMIND
                    </span>
                    <span className="text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.4em] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] uppercase transition-colors">
                        EDU-TECH PLATFORM
                    </span>
                </div>

                {/* 3. SAĞ BLOK: ARAMA VE İKONLAR */}
                <div className="flex-1 flex items-center justify-end gap-2 md:gap-4">
                    {/* Arama Çubuğu (Sağdaki ikonlara yaslandı) */}
                    <div className="hidden md:block w-48 xl:w-64 mr-2">
                        <GlobalSearch onSelectActivity={onSelectActivity} />
                    </div>

                    {/* Activity & Students Group */}
                    <div className="flex items-center gap-2 p-1.5 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)]">
                        <button
                            onClick={() => onOpenStudio('assessment')}
                            className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg active:scale-95 group/nav"
                            title="Değerlendirme Modülü"
                        >
                            <i className="fa-solid fa-stethoscope text-lg group-hover/nav:scale-110 transition-transform"></i>
                        </button>

                        <button
                            onClick={() => { setIsSidebarOpen(false); onOpenStudio('students'); }}
                            className="flex flex-col items-center justify-center w-12 h-12 bg-[var(--bg-paper)] text-[var(--accent-color)] hover:bg-[var(--accent-muted)] border border-[var(--border-color)] rounded-xl transition-all active:scale-95 group/nav"
                            title="Öğrenci Yönetimi"
                        >
                            <i className="fa-solid fa-user-graduate text-lg group-hover/nav:scale-110 transition-transform"></i>
                        </button>
                    </div>

                    {/* Secondary Navigation */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => navigateTo('workbook')}
                            className="relative flex flex-col items-center justify-center w-11 h-11 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all rounded-[14px] group/nav"
                            title="Çalışma Dosyam"
                        >
                            <i className="fa-solid fa-folder-plus text-lg group-hover/nav:scale-110 transition-transform"></i>
                            {workbookItemsCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[var(--accent-color)] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-4 border-[var(--bg-paper)] shadow-premium-sm scale-90">
                                    {workbookItemsCount}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => { setIsSidebarOpen(false); navigateTo('messages'); }}
                            className="relative flex flex-col items-center justify-center w-11 h-11 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all rounded-[14px] group/nav"
                            title="Mesajlar ve Bildirimler"
                        >
                            <i className="fa-solid fa-bell text-lg group-hover/nav:scale-110 transition-transform"></i>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-4 border-[var(--bg-paper)] shadow-premium-sm scale-90 animate-pulse">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="w-[1px] h-6 bg-[var(--border-color)] mx-2 opacity-50"></div>

                        <HeaderDropdown label="KİTAPLIK" icon="fa-shapes" colorClass="text-[var(--accent-color)]">
                            <DropdownItem icon="fa-star" label="Favori Etkinliklerim" onClick={() => { setIsSidebarOpen(false); navigateTo('favorites'); }} />
                            <DropdownItem icon="fa-box-archive" label="Dijital Arşiv" onClick={() => { setIsSidebarOpen(false); navigateTo('savedList'); }} />
                            <DropdownItem icon="fa-share-nodes" label="Paylaşılan Materyaller" onClick={() => { setIsSidebarOpen(false); navigateTo('shared'); }} />
                            <DropdownItem icon="fa-clock-rotate-left" label="İşlem Geçmişi" onClick={() => { setIsSidebarOpen(false); onOpenModal('history'); }} />
                        </HeaderDropdown>

                        <HeaderDropdown label="DESTEK" icon="fa-headset">
                            <DropdownItem icon="fa-circle-play" label="Rehber Turu Başlat" onClick={() => setIsTourActive(true)} />
                            <DropdownItem icon="fa-headset" label="Premium Yardım Masası" onClick={onOpenFeedback} />
                            <DropdownItem icon="fa-circle-question" label="Platform Hakkımızda" onClick={() => onOpenModal('about')} />
                            <DropdownItem icon="fa-laptop-code" label="Geliştirici Vizyonu" onClick={() => onOpenModal('developer')} />
                        </HeaderDropdown>

                        <div className="w-[1px] h-6 bg-[var(--border-color)] mx-2 opacity-50"></div>

                        {user ? (
                            <HeaderDropdown
                                label={user.name.split(' ')[0].toUpperCase()}
                                icon="fa-user-circle"
                                colorClass="text-[var(--text-primary)]"
                            >
                                <DropdownItem icon="fa-user-gear" label="Profil Ayarları" onClick={() => { setIsSidebarOpen(false); navigateTo('profile'); }} />
                                <DropdownItem icon="fa-sliders" label="Görünüm Ayarları" onClick={() => { setIsSidebarOpen(false); onOpenModal('settings'); }} />
                                {user.role === 'admin' && <div className="h-px bg-[var(--border-color)] my-2 opacity-50"></div>}
                                {user.role === 'admin' && <DropdownItem icon="fa-shield-halved" label="Yönetim Paneli" onClick={() => { setIsSidebarOpen(false); navigateTo('admin'); }} />}
                                <div className="h-px bg-[var(--border-color)] my-2 opacity-50"></div>

                                <DropdownItem icon="fa-arrow-right-from-bracket" label="Oturumu Kapat" onClick={async () => await logout()} />
                            </HeaderDropdown>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="px-6 py-2.5 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-[1.2rem] text-[11px] font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
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
