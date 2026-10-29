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
    showLakes?: boolean;
    onRegionClick?: (region: string) => void;
    interactive?: boolean;
}

// Bölge renk paleti
const REGION_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
    'Marmara': { fill: '#e0e7ff', stroke: '#818cf8', label: 'MARMARA' },
    'Ege': { fill: '#dcfce7', stroke: '#4ade80', label: 'EGE' },
    'Akdeniz': { fill: '#fef3c7', stroke: '#fbbf24', label: 'AKDENİZ' },
    'İç Anadolu': { fill: '#fce7f3', stroke: '#f472b6', label: 'İÇ ANADOLU' },
    'Karadeniz': { fill: '#d1fae5', stroke: '#34d399', label: 'KARADENİZ' },
    'Doğu Anadolu': { fill: '#e0e7ff', stroke: '#a78bfa', label: 'DOĞU ANADOLU' },
    'Güneydoğu': { fill: '#fee2e2', stroke: '#f87171', label: 'GÜNEYDOĞU' },
};

// Bölge etiket renkleri — koyu, sabit, okunaklı
const LABEL_COLORS: Record<string, string> = {
    'Marmara': '#3730a3',
    'Ege': '#15803d',
    'Akdeniz': '#b45309',
    'İç Anadolu': '#9d174d',
    'Karadeniz': '#065f46',
    'Doğu Anadolu': '#5b21b6',
    'Güneydoğu': '#991b1b',
};

// Etiket pill arka plan renkleri
const LABEL_BG: Record<string, string> = {
    'Marmara': 'rgba(224,231,255,0.92)',
    'Ege': 'rgba(220,252,231,0.92)',
    'Akdeniz': 'rgba(254,243,199,0.92)',
    'İç Anadolu': 'rgba(252,231,243,0.92)',
    'Karadeniz': 'rgba(209,250,229,0.92)',
    'Doğu Anadolu': 'rgba(224,231,255,0.92)',
    'Güneydoğu': 'rgba(254,226,226,0.92)',
};

// Güncellenmiş bölge etiket konumları — bölge merkezlerine taşındı
const REGION_LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
    'Marmara': { x: 155, y: 110 },
    'Ege': { x: 120, y: 275 },
    'Akdeniz': { x: 390, y: 355 },
    'İç Anadolu': { x: 490, y: 240 },
    'Karadeniz': { x: 600, y: 100 },
    'Doğu Anadolu': { x: 810, y: 210 },
    'Güneydoğu': { x: 760, y: 330 },
};

export const TurkeyMapSVG = ({
    emphasizedRegion,
    width = '100%',
    height = '100%',
    className = '',
    showRegionLabels = true,
    showLakes: _showLakes = true,
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
                        stroke-width: 1.5 !important;
                        stroke-opacity: 1 !important;
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
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#bae6fd" />
                </radialGradient>
                {/* Gölge filtresi */}
                <filter id="mapShadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="2" dy="5" stdDeviation="4" floodOpacity="0.25" />
                </filter>
                {/* Hover filtresi — azaltılmış efekt */}
                <filter id="hoverShadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#3b82f6" floodOpacity="0.6" />
                </filter>
            </defs>

            {/* Deniz zemin */}
            <rect x="0" y="0" width="1000" height="500" fill="url(#seaGradient)" rx="20" className="print:fill-slate-50" />

            {/* İllerin çizimi */}
            <g className="harita-grup">
                {turkeyMapPaths.map((cityData: { plate: string; draw: string; city: string }) => {
                    const region = TURKEY_REGIONS[cityData.plate];
                    const active = isEmphasized(region);
                    // Print için daha belirgin stroke renkleri (daha koyu)
                    const enhancedColor: Record<string, { fill: string; stroke: string }> = {
                        'Marmara': { fill: '#e0e7ff', stroke: '#6366f1' },       // indigo-500
                        'Ege': { fill: '#dcfce7', stroke: '#22c55e' },           // green-500
                        'Akdeniz': { fill: '#fef3c7', stroke: '#eab308' },       // yellow-500
                        'İç Anadolu': { fill: '#fce7f3', stroke: '#ec4899' },    // pink-500
                        'Karadeniz': { fill: '#d1fae5', stroke: '#10b981' },     // emerald-500
                        'Doğu Anadolu': { fill: '#e0e7ff', stroke: '#8b5cf6' },  // violet-500
                        'Güneydoğu': { fill: '#fee2e2', stroke: '#ef4444' }      // red-500
                    };
                    const colors = REGION_COLORS[region] || { fill: '#f4f4f5', stroke: '#d4d4d8', label: '' };
                    const printColors = enhancedColor[region] || colors;

                    const isHovered = hoveredRegion === region;

                    // Önemli: printte soluk çıkmaması için opaklıklar artırıldı
                    const fillOpq = active ? (isHovered ? 1 : 0.9) : 0.6;

                    const fillColor = active ? colors.fill : '#e4e4e7';
                    const strokeColor = active ? printColors.stroke : '#a1a1aa'; // aktif değilse bile belirgin (zinc-400)
                    // İl sınırları ince — 0.8
                    const strokeWidth = isHovered ? 2 : 0.8;

                    return (
                        <path
                            key={cityData.plate}
                            id={cityData.plate + '-' + cityData.city}
                            d={cityData.draw}
                            fill={fillColor}
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            fillOpacity={fillOpq}
                            strokeOpacity={1}
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

            {/* Bölge etiketleri — pill arka plan + koyu metin */}
            {showRegionLabels && Object.entries(REGION_LABEL_POSITIONS).map(([region, pos]) => {
                const colors = REGION_COLORS[region];
                const active = isEmphasized(region);
                if (!active || !colors) return null;
                return (
                    <g key={`label-g-${region}`}>
                        <rect
                            x={pos.x - 36}
                            y={pos.y - 14}
                            width={72}
                            height={20}
                            rx="4"
                            fill={LABEL_BG[region] || 'rgba(255,255,255,0.9)'}
                            stroke={LABEL_COLORS[region] || '#333'}
                            strokeWidth="1.2"
                            opacity="0.95"
                        />
                        <text
                            key={`label-${region}`}
                            x={pos.x}
                            y={pos.y}
                            textAnchor="middle"
                            fontSize="13"
                            fontWeight="900"
                            fill={LABEL_COLORS[region] || '#333'}
                            opacity={1}
                            className="font-sans uppercase pointer-events-none"
                            style={{
                                letterSpacing: '0.05em',
                                paintOrder: 'stroke',
                                stroke: 'white',
                                strokeWidth: '3px',
                                strokeLinejoin: 'round'
                            }}
                        >
                            {colors.label}
                        </text>
                    </g>
                );
            })}

            {/* Deniz kenarı etiketi — hafifletilmiş */}
            <text x="40" y="460" fontSize="8" fill="#93c5fd" fontWeight="700" opacity="0.25" className="uppercase pointer-events-none" style={{ letterSpacing: '0.3em' }}>
                AKDENİZ
            </text>
            <text x="40" y="175" fontSize="8" fill="#93c5fd" fontWeight="700" opacity="0.25" className="uppercase pointer-events-none" style={{ letterSpacing: '0.3em' }}>
                EGE DENİZİ
            </text>
            <text x="550" y="50" fontSize="8" fill="#93c5fd" fontWeight="700" opacity="0.25" className="uppercase pointer-events-none" style={{ letterSpacing: '0.3em' }}>
                KARADENİZ
            </text>
        </svg>
    );
};
