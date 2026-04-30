import React, { useState } from 'react';
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
            className="relative group"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                title={label}
                className={`flex flex-col items-center justify-center w-11 h-11 rounded-2xl transition-all duration-300 hover:bg-[var(--accent-muted)] hover:scale-105 active:scale-95 group/drop ${colorClass}`}
            >
                <i className={`fa-solid ${icon} text-lg mb-0.5 group-hover/drop:text-[var(--accent-color)]`}></i>
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 group-hover/drop:opacity-100">{label}</span>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent-color)] opacity-0 group-hover/drop:opacity-100 transition-all"></div>
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full pt-2 z-[100] animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="bg-[var(--panel-bg-solid)] border border-[var(--border-color)] rounded-2xl shadow-premium p-2 min-w-[220px] overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
                        {children}
                    </div>
                </div>
            )}
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
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--panel-bg-subtle)] hover:pl-5 rounded-xl transition-all duration-300 group"
    >
        <div className="flex items-center gap-3">
            <i
                className={`fa-solid ${icon} w-4 text-center text-[var(--text-muted)] group-hover:text-[var(--accent-color)] group-hover:scale-110 transition-all`}
            ></i>
            <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]">
                {label}
            </span>
        </div>
        {badge !== undefined && badge > 0 && (
            <span className="bg-[var(--accent-color)] text-[var(--bg-primary)] text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                {badge}
            </span>
        )}
    </button>
);

export const AppHeader: React.FC<AppHeaderProps> = ({
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
            className={`relative bg-[var(--panel-bg-solid)] border-b border-[var(--border-color)] shadow-premium z-[90] transition-all duration-500 ${zenMode ? '-mt-24 opacity-0 pointer-events-none' : 'mt-0 opacity-100'}`}
        >
            <div className="w-full px-6 py-4 flex justify-between items-center gap-6">
                <div className="flex items-center gap-4">
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
                        className="flex items-center gap-2"
                    >
                        <DyslexiaLogo className="h-10 w-auto transition-transform hover:scale-105" />
                        <div className="flex flex-col leading-none">
                            <span className="text-[13px] font-black tracking-tight text-[#6366f1] leading-tight">Bursa Disleksi</span>
                            <span className="text-[11px] font-bold tracking-[0.1em] text-[#8b5cf6] leading-tight uppercase">EduMind</span>
                        </div>
                    </button>
                </div>

                <div className="flex-1 max-w-xl hidden md:block">
                    <GlobalSearch onSelectActivity={onSelectActivity} />
                </div>

                <div className="flex items-center gap-3">
                    {/* Grup 1: Klinik İşlemler */}
                    <div className="flex items-center gap-1.5 p-1 bg-[var(--surface-glass)] rounded-[20px] border border-[var(--border-color)] shadow-sm">
                        <button
                            onClick={() => onOpenStudio('assessment')}
                            title="DEĞERLENDİRME"
                            className="flex flex-col items-center justify-center w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[16px] transition-all shadow-lg active:scale-95 group/nav"
                        >
                            <i className="fa-solid fa-user-doctor text-lg mb-0.5"></i>
                            <span className="text-[7px] font-black tracking-tighter uppercase">Sınav</span>
                        </button>

                        <button
                            onClick={() => onOpenStudio('students')}
                            title="ÖĞRENCİLERİM"
                            className="flex flex-col items-center justify-center w-12 h-12 text-[var(--accent-color)] hover:bg-[var(--accent-muted)] rounded-[16px] transition-all active:scale-95 group/nav"
                        >
                            <i className="fa-solid fa-user-graduate text-lg mb-0.5"></i>
                            <span className="text-[7px] font-black tracking-tighter uppercase">Öğrenci</span>
                        </button>
                    </div>

                    {/* Grup 2: İçerik ve Kitaplık */}
                    <div className="flex items-center gap-1 p-1 bg-[var(--surface-glass)] rounded-[20px] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 transition-colors">
                        <button
                            onClick={() => navigateTo('workbook')}
                            className="relative flex flex-col items-center justify-center w-11 h-11 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all rounded-[14px] hover:bg-[var(--accent-muted)] group/nav"
                            title="Kitapçık"
                        >
                            <i className="fa-solid fa-book-medical text-lg mb-0.5"></i>
                            <span className="text-[7px] font-black tracking-tighter uppercase">Dosyam</span>
                            {workbookItemsCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 bg-[var(--accent-color)] text-[var(--bg-primary)] text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[var(--bg-paper)]">
                                    {workbookItemsCount}
                                </span>
                            )}
                        </button>
                        
                        <button
                            onClick={() => navigateTo('messages')}
                            className="relative flex flex-col items-center justify-center w-11 h-11 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-all rounded-[14px] hover:bg-[var(--accent-muted)] group/nav"
                            title="Mesajlar"
                        >
                            <i className="fa-solid fa-comment-dots text-lg mb-0.5"></i>
                            <span className="text-[7px] font-black tracking-tighter uppercase">Mesaj</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-[var(--bg-paper)]">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <div className="w-px h-6 bg-[var(--border-color)] mx-0.5"></div>

                        <HeaderDropdown
                            label="KITAPLIK"
                            icon="fa-bookmark"
                            colorClass="text-[var(--accent-color)]"
                        >
                            <DropdownItem
                                icon="fa-heart"
                                label="Favoriler"
                                onClick={() => navigateTo('favorites')}
                            />
                            <DropdownItem
                                icon="fa-box-archive"
                                label="Arşiv"
                                onClick={() => navigateTo('savedList')}
                            />
                            <DropdownItem
                                icon="fa-share-nodes"
                                label="Paylaşılanlar"
                                onClick={() => navigateTo('shared')}
                            />
                            <DropdownItem
                                icon="fa-clock-rotate-left"
                                label="İşlem Geçmişi"
                                onClick={() => onOpenModal('history')}
                            />
                        </HeaderDropdown>
                    </div>

                    {/* Grup 3: Yardım ve Profil */}
                    <div className="flex items-center gap-1">
                        <HeaderDropdown label="DESTEK" icon="fa-circle-info">
                            <DropdownItem
                                icon="fa-circle-play"
                                label="Tur Başlat"
                                onClick={() => setIsTourActive(true)}
                            />
                            <DropdownItem
                                icon="fa-headset"
                                label="Yardım Masası"
                                onClick={onOpenFeedback}
                            />
                            <DropdownItem
                                icon="fa-circle-question"
                                label="Hakkımızda"
                                onClick={() => onOpenModal('about')}
                            />
                            <DropdownItem
                                icon="fa-laptop-code"
                                label="Geliştirici"
                                onClick={() => onOpenModal('developer')}
                            />
                        </HeaderDropdown>

                        <div className="h-8 w-px bg-[var(--border-color)] mx-1"></div>

                        {user ? (
                            <HeaderDropdown
                                label={user.name.split(' ')[0].toUpperCase()}
                                icon="fa-user-circle"
                                colorClass="text-[var(--text-primary)]"
                            >
                                <DropdownItem
                                    icon="fa-user-gear"
                                    label="Profil Ayarları"
                                    onClick={() => navigateTo('profile')}
                                />
                                <DropdownItem
                                    icon="fa-sliders"
                                    label="Görünüm Ayarları"
                                    onClick={() => onOpenModal('settings')}
                                />
                                {user.role === 'admin' && (
                                    <div className="h-px bg-[var(--border-color)] my-1"></div>
                                )}
                                {user.role === 'admin' && (
                                    <DropdownItem
                                        icon="fa-shield-halved"
                                        label="Admin Paneli"
                                        onClick={() => navigateTo('admin')}
                                    />
                                )}
                                <div className="h-px bg-[var(--border-color)] my-1"></div>
                                <DropdownItem
                                    icon="fa-arrow-right-from-bracket"
                                    label="Çıkış Yap"
                                    onClick={async () => {
                                        await logout();
                                    }}
                                />
                            </HeaderDropdown>
                        ) : (
                            <button
                                onClick={onOpenAuth}
                                className="px-5 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-xl text-[10px] font-black shadow-lg transition-all active:scale-95"
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
