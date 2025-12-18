
import React from 'react';

interface StickerPickerProps {
    onSelect: (url: string) => void;
    onClose: () => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose }) => {
    
    const motivational = [
        { label: 'Aferin', color: '#16a34a' },
        { label: 'Harika', color: '#ea580c' },
        { label: 'Çok İyi', color: '#2563eb' },
        { label: 'Süper', color: '#9333ea' },
        { label: 'Başarılı', color: '#db2777' },
        { label: 'Tekrar Dene', color: '#dc2626' },
    ];

    const emojis = [
        '⭐', '🌟', '💫', '👑', '🏆', '🥇',
        '✅', '💯', '❤️', '🧡', '💛', '💚',
        '💙', '💜', '🌈', '☀️', '🌸', '🍀',
        '🐶', '🐱', '🦁', '🦄', '🚀', '🎨'
    ];

    const handleSelectBadge = (text: string, color: string) => {
        // Create a simple SVG badge data URI
        const svg = `
        <svg width="100" height="40" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="96" height="36" rx="10" fill="${color}" stroke="white" stroke-width="2"/>
            <text x="50" y="25" font-family="sans-serif" font-weight="bold" font-size="16" text-anchor="middle" fill="white">${text}</text>
        </svg>`.trim();
        const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        onSelect(base64);
    };

    const handleSelectEmoji = (emoji: string) => {
        // Create an SVG emoji
        const svg = `
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <text x="30" y="45" font-size="40" text-anchor="middle">${emoji}</text>
        </svg>`.trim();
        const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
        onSelect(base64);
    };

    return (
        <div className="absolute top-12 right-0 z-50 bg-white dark:bg-zinc-800 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-700 p-4 w-72 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm text-zinc-600 dark:text-zinc-300">Çıkartma Ekle</h4>
                <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600"><i className="fa-solid fa-times"></i></button>
            </div>
            
            <div className="mb-4">
                <p className="text-xs text-zinc-400 mb-2 uppercase font-bold">Motive Edici</p>
                <div className="grid grid-cols-2 gap-2">
                    {motivational.map((m, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSelectBadge(m.label, m.color)}
                            className="px-2 py-1 rounded text-white text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
                            style={{ backgroundColor: m.color }}
                        >
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-xs text-zinc-400 mb-2 uppercase font-bold">Emojiler</p>
                <div className="grid grid-cols-6 gap-2">
                    {emojis.map((e, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSelectEmoji(e)}
                            className="text-xl hover:scale-125 transition-transform"
                        >
                            {e}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
