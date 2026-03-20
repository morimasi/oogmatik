
import React, { useState } from 'react';

interface StickerPickerProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
    const [activeTab, setActiveTab] = useState<'badges' | 'emoji' | 'shapes'>('badges');

    const motivational = [
        { label: 'Aferin', color: '#16a34a' },
        { label: 'Harika', color: '#ea580c' },
        { label: 'Çok İyi', color: '#2563eb' },
        { label: 'Süper', color: '#9333ea' },
        { label: 'Başarılı', color: '#db2777' },
        { label: 'Tekrar Dene', color: '#dc2626' },
        { label: 'Mükemmel', color: '#0891b2' },
        { label: 'Devam Et', color: '#65a30d' },
    ];

    const emojis = [
        '⭐', '🌟', '💫', '👑', '🏆', '🥇',
        '✅', '💯', '❤️', '🧡', '💛', '💚',
        '💙', '💜', '🌈', '☀️', '🌸', '🍀',
        '🐶', '🐱', '🦁', '🦄', '🚀', '🎨',
        '📚', '✏️', '🎯', '🧩', '🔔', '🎵',
    ];

    const shapes = [
        { name: 'Yıldız', svg: '<polygon points="50,5 62,35 95,35 68,57 79,90 50,70 21,90 32,57 5,35 38,35" fill="#fbbf24" stroke="#f59e0b" stroke-width="2"/>' },
        { name: 'Kalp', svg: '<path d="M50,85 C25,65 0,40 25,20 C35,12 47,15 50,25 C53,15 65,12 75,20 C100,40 75,65 50,85Z" fill="#ef4444" stroke="#dc2626" stroke-width="2"/>' },
        { name: 'Onay', svg: '<circle cx="50" cy="50" r="40" fill="#16a34a" stroke="#15803d" stroke-width="3"/><polyline points="30,50 45,65 72,35" fill="none" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' },
        { name: 'Rozet', svg: '<circle cx="50" cy="50" r="35" fill="#3b82f6" stroke="#2563eb" stroke-width="3"/><circle cx="50" cy="50" r="25" fill="none" stroke="#fbbf24" stroke-width="2"/><text x="50" y="57" font-size="20" text-anchor="middle" fill="white" font-weight="bold">A+</text>' },
    ];

    const handleSelectBadge = (text: string, color: string) => {
        const svg = `
        <svg width="100" height="40" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="96" height="36" rx="10" fill="${color}" stroke="white" stroke-width="2"/>
            <text x="50" y="25" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle" fill="white">${text}</text>
        </svg>`.trim();
        const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        onSelect(base64);
    };

    const handleSelectEmoji = (emoji: string) => {
        const svg = `
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <text x="30" y="45" font-size="40" text-anchor="middle">${emoji}</text>
        </svg>`.trim();
        const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        onSelect(base64);
    };

    const handleSelectShape = (svgContent: string) => {
        const svg = `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${svgContent}</svg>`.trim();
        const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        onSelect(base64);
    };

    const tabs = [
        { id: 'badges' as const, label: 'Rozetler', icon: 'fa-certificate' },
        { id: 'emoji' as const, label: 'Emojiler', icon: 'fa-face-smile' },
        { id: 'shapes' as const, label: 'Şekiller', icon: 'fa-shapes' },
    ];

    return (
        <div className="absolute top-12 right-0 z-50 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 w-80 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm text-zinc-600 dark:text-zinc-300">
                    <i className="fa-solid fa-icons mr-1"></i> Çıkartma Ekle
                </h4>
                <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-times"></i></button>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 mb-3 bg-zinc-100 dark:bg-zinc-700 p-0.5 rounded-lg">
                {tabs.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                            activeTab === t.id
                                ? 'bg-white dark:bg-zinc-600 shadow-sm text-zinc-900 dark:text-white'
                                : 'text-zinc-400 hover:text-zinc-600'
                        }`}
                    >
                        <i className={`fa-solid ${t.icon} mr-1`}></i>
                        {t.label}
                    </button>
                ))}
            </div>

            {activeTab === 'badges' && (
                <div className="grid grid-cols-2 gap-2">
                    {motivational.map((m, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelectBadge(m.label, m.color)}
                            className="px-2 py-1.5 rounded-lg text-white text-xs font-bold shadow-sm hover:opacity-90 hover:scale-105 transition-all"
                            style={{ backgroundColor: m.color }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            )}

            {activeTab === 'emoji' && (
                <div className="grid grid-cols-6 gap-2">
                    {emojis.map((e, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelectEmoji(e)}
                            className="text-xl hover:scale-125 transition-transform p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                            {e}
                        </button>
                    ))}
                </div>
            )}

            {activeTab === 'shapes' && (
                <div className="grid grid-cols-4 gap-2">
                    {shapes.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleSelectShape(s.svg)}
                            title={s.name}
                            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-600 hover:border-zinc-400 hover:scale-110 transition-all"
                            dangerouslySetInnerHTML={{
                                __html: `<svg viewBox="0 0 100 100" class="w-full h-full">${s.svg}</svg>`
                            }}
                        />
                    ))}
                </div>
            )}

            <p className="text-[9px] text-zinc-400 mt-3 text-center">
                Sürükleyerek çalışma sayfasına yerleştirin
            </p>
        </div>
    );
};
