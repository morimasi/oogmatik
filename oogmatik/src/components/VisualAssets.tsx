
import React from 'react';

// --- MASCOTS ---

export const MascotRobot = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 10)">
            {/* Body */}
            <rect x="60" y="90" width="80" height="70" rx="10" fill="#6366f1" stroke="#312e81" strokeWidth="3"/>
            <rect x="75" y="105" width="50" height="40" rx="5" fill="#e0e7ff"/>
            {/* Head */}
            <rect x="50" y="30" width="100" height="60" rx="15" fill="#a5b4fc" stroke="#312e81" strokeWidth="3"/>
            {/* Eyes */}
            <circle cx="80" cy="60" r="12" fill="white" stroke="#312e81" strokeWidth="2"/>
            <circle cx="80" cy="60" r="4" fill="#312e81"/>
            <circle cx="120" cy="60" r="12" fill="white" stroke="#312e81" strokeWidth="2"/>
            <circle cx="120" cy="60" r="4" fill="#312e81"/>
            {/* Antenna */}
            <line x1="100" y1="30" x2="100" y2="10" stroke="#312e81" strokeWidth="3"/>
            <circle cx="100" cy="10" r="5" fill="#ef4444"/>
            {/* Mouth */}
            <path d="M 85 75 Q 100 85 115 75" fill="none" stroke="#312e81" strokeWidth="3" strokeLinecap="round"/>
            {/* Arms */}
            <path d="M 60 100 Q 40 120 40 140" fill="none" stroke="#312e81" strokeWidth="4" strokeLinecap="round"/>
            <path d="M 140 100 Q 160 120 160 100" fill="none" stroke="#312e81" strokeWidth="4" strokeLinecap="round"/>
        </g>
    </svg>
);

export const MascotOwl = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 10)">
            {/* Body */}
            <ellipse cx="100" cy="110" rx="50" ry="60" fill="#fbbf24" stroke="#78350f" strokeWidth="3"/>
            <path d="M 70 110 Q 100 140 130 110" fill="none" stroke="#d97706" strokeWidth="2" strokeDasharray="5,5"/>
            {/* Head */}
            <path d="M 50 60 Q 50 20 100 20 Q 150 20 150 60 Q 150 90 100 90 Q 50 90 50 60" fill="#fcd34d" stroke="#78350f" strokeWidth="3"/>
            {/* Ears */}
            <path d="M 50 40 L 40 20 L 70 30 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="2"/>
            <path d="M 150 40 L 160 20 L 130 30 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="2"/>
            {/* Glasses */}
            <circle cx="80" cy="55" r="18" fill="white" stroke="#374151" strokeWidth="3"/>
            <circle cx="120" cy="55" r="18" fill="white" stroke="#374151" strokeWidth="3"/>
            <line x1="98" y1="55" x2="102" y2="55" stroke="#374151" strokeWidth="3"/>
            {/* Eyes */}
            <circle cx="80" cy="55" r="5" fill="black"/>
            <circle cx="120" cy="55" r="5" fill="black"/>
            {/* Beak */}
            <polygon points="100,65 95,75 105,75" fill="#f97316"/>
            {/* Wings */}
            <path d="M 50 110 Q 30 130 50 150" fill="#f59e0b" stroke="#78350f" strokeWidth="2"/>
            <path d="M 150 110 Q 170 130 150 150" fill="#f59e0b" stroke="#78350f" strokeWidth="2"/>
        </g>
    </svg>
);

export const MascotCat = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" className={className} xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(0, 20)">
             {/* Tail */}
             <path d="M 130 140 Q 160 140 160 100" fill="none" stroke="#f472b6" strokeWidth="8" strokeLinecap="round"/>
            {/* Body */}
            <ellipse cx="100" cy="130" rx="40" ry="35" fill="#fbcfe8" stroke="#be185d" strokeWidth="3"/>
            {/* Head */}
            <circle cx="100" cy="70" r="35" fill="#fce7f3" stroke="#be185d" strokeWidth="3"/>
            {/* Ears */}
            <path d="M 75 45 L 65 20 L 90 40 Z" fill="#f472b6" stroke="#be185d" strokeWidth="2"/>
            <path d="M 125 45 L 135 20 L 110 40 Z" fill="#f472b6" stroke="#be185d" strokeWidth="2"/>
            {/* Face */}
            <circle cx="90" cy="65" r="4" fill="black"/>
            <circle cx="110" cy="65" r="4" fill="black"/>
            <path d="M 100 75 L 95 80 L 105 80 Z" fill="#db2777"/>
            <path d="M 100 80 L 100 85 M 95 85 Q 100 90 105 85" fill="none" stroke="#be185d" strokeWidth="2"/>
            {/* Whiskers */}
            <line x1="120" y1="75" x2="140" y2="70" stroke="#be185d" strokeWidth="1"/>
            <line x1="120" y1="80" x2="140" y2="80" stroke="#be185d" strokeWidth="1"/>
            <line x1="80" y1="75" x2="60" y2="70" stroke="#be185d" strokeWidth="1"/>
            <line x1="80" y1="80" x2="60" y2="80" stroke="#be185d" strokeWidth="1"/>
        </g>
    </svg>
);

// --- BORDERS ---

export const getBorderCSS = (type: string, color: string = '#3f3f46', width: number = 4) => {
    if (type === 'none') return {};
    
    // Simple borders use the dynamic color directly
    if (type === 'simple') return {
        border: `${width}px solid ${color}`,
        borderRadius: '0px'
    };

    let svgData = '';

    // Thematic borders use SVG. We use 'width' to control border thickness.
    // Colors are generally fixed for themes but could be parameterized if needed.
    // For now, we respect the width setting.

    if (type === 'math') {
        svgData = `
            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                <text x="15" y="40" font-family="monospace" font-weight="bold" font-size="24" fill="%236366f1" opacity="0.3">+</text>
                <text x="45" y="20" font-family="monospace" font-weight="bold" font-size="20" fill="%23ef4444" opacity="0.3">123</text>
            </svg>
        `;
    } else if (type === 'verbal') {
        svgData = `
            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                <text x="10" y="40" font-family="serif" font-weight="bold" font-size="28" fill="%2310b981" opacity="0.3">A</text>
                <text x="40" y="20" font-family="serif" font-weight="bold" font-size="28" fill="%23f59e0b" opacity="0.3">b</text>
            </svg>
        `;
    } else if (type === 'stars') {
        svgData = `
            <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                <polygon points="20,5 24,15 35,15 26,22 29,32 20,26 11,32 14,22 5,15 16,15" fill="%23fbbf24" opacity="0.4"/>
            </svg>
        `;
    } else if (type === 'geo') {
        svgData = `
            <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="20" height="20" stroke="%238b5cf6" fill="none" stroke-width="2" opacity="0.3"/>
                <circle cx="35" cy="35" r="10" stroke="%23ec4899" fill="none" stroke-width="2" opacity="0.3"/>
            </svg>
        `;
    }

    const encoded = `url("data:image/svg+xml,${encodeURIComponent(svgData.trim())}")`;

    return {
        border: `${width}px solid transparent`,
        borderImageSource: encoded,
        borderImageSlice: 30,
        borderImageRepeat: 'round'
    };
};
