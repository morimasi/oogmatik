// @ts-ignore
import React from 'react';
import { useState } from 'react';
// @ts-ignore
import { turkeyMapPaths } from './turkeyMapPaths';
import { TURKEY_REGIONS } from './turkeyRegions';

// ============================================================
// PROFESYONEL İNLİNE SVG TÜRKİYE HARİTASI
// ViewBox: 0 0 1000 500
// ============================================================

interface TurkeyMapSVGProps {
    emphasizedRegion?: string;
    width?: string | number;
    height?: string | number;
    className?: string;
    showRegionLabels?: boolean;
    onRegionClick?: (region: string) => void;
    interactive?: boolean;
}

// 7 Coğrafi Bölge — Yüksek Kontrastlı, Disleksi Uyumlu, Ayrışan Renk Paleti
const REGION_COLORS: Record<string, {
    fill: string;
    stroke: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    label: string;
    badgeWidth: number;
}> = {
    'Marmara': {
        fill: '#e0e7ff',        // İndigo-100
        stroke: '#6366f1',      // İndigo-500
        badgeBg: '#ffffff',
        badgeBorder: '#4f46e5',
        badgeText: '#312e81',   // İndigo-900 (Ultra yüksek kontrast)
        label: 'MARMARA',
        badgeWidth: 98
    },
    'Ege': {
        fill: '#dcfce7',        // Emerald-100
        stroke: '#10b981',      // Emerald-500
        badgeBg: '#ffffff',
        badgeBorder: '#059669',
        badgeText: '#064e3b',   // Emerald-900
        label: 'EGE',
        badgeWidth: 68
    },
    'Akdeniz': {
        fill: '#fef3c7',        // Amber-100
        stroke: '#f59e0b',      // Amber-500
        badgeBg: '#ffffff',
        badgeBorder: '#d97706',
        badgeText: '#78350f',   // Amber-900
        label: 'AKDENİZ',
        badgeWidth: 98
    },
    'İç Anadolu': {
        fill: '#fed7aa',        // Orange-200 (Sıcak bozkır / turuncu)
        stroke: '#f97316',      // Orange-500
        badgeBg: '#ffffff',
        badgeBorder: '#ea580c',
        badgeText: '#7c2d12',   // Orange-950
        label: 'İÇ ANADOLU',
        badgeWidth: 122
    },
    'Karadeniz': {
        fill: '#cffafe',        // Cyan-100 (Deniz turkuazı / camgöbeği)
        stroke: '#06b6d4',      // Cyan-500
        badgeBg: '#ffffff',
        badgeBorder: '#0891b2',
        badgeText: '#164e63',   // Cyan-950
        label: 'KARADENİZ',
        badgeWidth: 114
    },
    'Doğu Anadolu': {
        fill: '#f3e8ff',        // Purple-100 (Mor dağlar / asil leylak)
        stroke: '#a855f7',      // Purple-500
        badgeBg: '#ffffff',
        badgeBorder: '#9333ea',
        badgeText: '#581c87',   // Purple-950
        label: 'DOĞU ANADOLU',
        badgeWidth: 138
    },
    'Güneydoğu': {
        fill: '#ffe4e6',        // Rose-100 (Gül kırmızısı / terakota)
        stroke: '#f43f5e',      // Rose-500
        badgeBg: '#ffffff',
        badgeBorder: '#e11d48',
        badgeText: '#881337',   // Rose-950
        label: 'GÜNEYDOĞU',
        badgeWidth: 120
    },
};

// Bölge Rozet Konumları (Bölgelerin tam merkezine kalibre edilmiştir)
const REGION_LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
    'Marmara': { x: 155, y: 92 },
    'Ege': { x: 142, y: 275 },
    'Akdeniz': { x: 415, y: 360 },
    'İç Anadolu': { x: 435, y: 220 },
    'Karadeniz': { x: 550, y: 105 },
    'Doğu Anadolu': { x: 815, y: 200 },
    'Güneydoğu': { x: 745, y: 325 },
};

export const TurkeyMapSVG = ({
    emphasizedRegion,
    width = '100%',
    height = '100%',
    className = '',
    showRegionLabels = true,
    onRegionClick,
    interactive = false
}: TurkeyMapSVGProps) => {
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    const isEmphasized = (region: string) => {
        if (!emphasizedRegion || emphasizedRegion === 'all') return true;
        return region === emphasizedRegion;
    };

    const handleMouseEnter = (region: string) => {
        if (interactive) setHoveredRegion(region);
    };

    const handleMouseLeave = () => {
        if (interactive) setHoveredRegion(null);
    };

    const handleClick = (region: string) => {
        if (interactive && onRegionClick) {
            onRegionClick(region);
        }
    };

    return (
        <svg
            viewBox="0 0 1000 500"
            width={width}
            height={height}
            className={`print:!filter-none print:transform-none ${className}`}
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: 'transparent', userSelect: 'none', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                .harita-grup { filter: url(#mapShadow); }
                @media print {
                    .harita-grup { filter: none !important; }
                    .sehir-path {
                        stroke-width: 1.0 !important;
                        stroke-opacity: 0.8 !important;
                    }
                    .region-badge-rect {
                        fill: #ffffff !important;
                        stroke-width: 2.5px !important;
                        filter: none !important;
                    }
                    .region-badge-text {
                        font-weight: 900 !important;
                    }
                    svg {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            ` }} />
            <defs>
                {/* Deniz gradient */}
                <radialGradient id="seaGradient" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#f0f9ff" />
                    <stop offset="100%" stopColor="#e0f2fe" />
                </radialGradient>
                {/* Harita gölge filtresi */}
                <filter id="mapShadow" x="-3%" y="-3%" width="106%" height="106%">
                    <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.18" />
                </filter>
                <filter id="hoverShadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#3b82f6" floodOpacity="0.5" />
                </filter>
                {/* Bölge Rozeti Gölge Filtresi */}
                <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.22" />
                </filter>
            </defs>

            {/* Deniz zemin (Sade, dingin ve dikkati dağıtmayan) */}
            <rect x="0" y="0" width="1000" height="500" fill="url(#seaGradient)" rx="20" className="print:fill-slate-50" />

            {/* İllerin çizimi — Sadeleştirilmiş detaylar, net bölge blokları */}
            <g className="harita-grup">
                {turkeyMapPaths.map((cityData) => {
                    const region = TURKEY_REGIONS[cityData.plate];
                    const active = isEmphasized(region);
                    const colors = REGION_COLORS[region] || {
                        fill: '#f1f5f9',
                        stroke: '#94a3b8',
                        badgeBg: '#ffffff',
                        badgeBorder: '#64748b',
                        badgeText: '#0f172a',
                        label: '',
                        badgeWidth: 80
                    };

                    const isHovered = hoveredRegion === region;
                    const fillColor = active ? colors.fill : '#f1f5f9';
                    // Görsel karmaşayı azaltmak için il içi sınır çizgileri sade, zarif ve ince tutuldu
                    const strokeColor = active ? colors.stroke : '#cbd5e1';
                    const strokeWidth = isHovered ? 1.8 : 0.8;
                    const fillOpq = active ? (isHovered ? 1 : 0.95) : 0.35;
                    const strokeOpq = active ? (isHovered ? 1 : 0.55) : 0.25;

                    return (
                        <path
                            key={cityData.plate}
                            id={cityData.plate + '-' + cityData.city}
                            d={cityData.draw}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            fillOpacity={fillOpq}
                            strokeOpacity={strokeOpq}
                            filter={isHovered ? 'url(#hoverShadow)' : undefined}
                            className="transition-all duration-300 ease-in-out sehir-path"
                            style={{
                                cursor: interactive ? 'pointer' : 'default',
                                outline: 'none'
                            }}
                            onMouseEnter={() => handleMouseEnter(region)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleClick(region)}
                        >
                            <title>{cityData.city} ({colors.label})</title>
                        </path>
                    );
                })}
            </g>

            {/* Bölge Rozetleri (Pill Badges) — Yüksek Kontrast, Disleksi Uyumlu, Ultra-Okunaklı */}
            {showRegionLabels && Object.entries(REGION_LABEL_POSITIONS).map(([region, pos]) => {
                const colors = REGION_COLORS[region];
                const active = isEmphasized(region);
                if (!active || !colors) return null;
                const badgeW = colors.badgeWidth;
                const badgeH = 26;
                const isHovered = hoveredRegion === region;

                return (
                    <g
                        key={`badge-${region}`}
                        transform={`translate(${pos.x}, ${pos.y}) scale(${isHovered ? 1.06 : 1})`}
                        className="pointer-events-none transition-transform duration-200"
                    >
                        {/* Rozet Beyaz Zemin & Kalın Belirgin Kenarlık */}
                        <rect
                            x={-badgeW / 2}
                            y={-badgeH / 2}
                            width={badgeW}
                            height={badgeH}
                            rx="13"
                            ry="13"
                            fill="#ffffff"
                            stroke={colors.badgeBorder}
                            strokeWidth="2.5"
                            className="region-badge-rect print:stroke-zinc-800"
                            filter="url(#badgeShadow)"
                        />
                        {/* Bölge İsmi — Büyük, Kalın, Kristal Netliğinde */}
                        <text
                            x="0"
                            y="4.5"
                            textAnchor="middle"
                            fontSize="12.5"
                            fontWeight="900"
                            fill={colors.badgeText}
                            className="region-badge-text uppercase print:fill-zinc-900"
                            style={{
                                letterSpacing: '0.08em',
                                fontFamily: 'Lexend, sans-serif'
                            }}
                        >
                            {colors.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};
