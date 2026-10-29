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
    mapColorMode?: 'renkli' | 'siyahbeyaz' | 'pastel';
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
    'Marmara': 'rgba(224,231,255,0.96)',
    'Ege': 'rgba(220,252,231,0.96)',
    'Akdeniz': 'rgba(254,243,199,0.96)',
    'İç Anadolu': 'rgba(252,231,243,0.96)',
    'Karadeniz': 'rgba(209,250,229,0.96)',
    'Doğu Anadolu': 'rgba(224,231,255,0.96)',
    'Güneydoğu': 'rgba(254,226,226,0.96)',
};

const MONOCHROME_REGION_COLORS: Record<string, { fill: string; stroke: string }> = {
    'Marmara': { fill: '#ffffff', stroke: '#334155' },
    'Ege': { fill: '#f1f5f9', stroke: '#334155' },
    'Akdeniz': { fill: '#e2e8f0', stroke: '#334155' },
    'İç Anadolu': { fill: '#ffffff', stroke: '#334155' },
    'Karadeniz': { fill: '#f1f5f9', stroke: '#334155' },
    'Doğu Anadolu': { fill: '#e2e8f0', stroke: '#334155' },
    'Güneydoğu': { fill: '#ffffff', stroke: '#334155' },
};

const PASTEL_REGION_COLORS: Record<string, { fill: string; stroke: string }> = {
    'Marmara': { fill: '#e0e7ff', stroke: '#6366f1' },
    'Ege': { fill: '#dcfce7', stroke: '#22c55e' },
    'Akdeniz': { fill: '#fef3c7', stroke: '#d97706' },
    'İç Anadolu': { fill: '#fce7f3', stroke: '#db2777' },
    'Karadeniz': { fill: '#d1fae5', stroke: '#059669' },
    'Doğu Anadolu': { fill: '#ede9fe', stroke: '#7c3aed' },
    'Güneydoğu': { fill: '#fee2e2', stroke: '#dc2626' },
};

const MONOCHROME_LABEL_BACKGROUND = 'rgba(255,255,255,0.98)';

// Harita etiketleri için disleksi dostu yazı tipi (OpenDyslexic projede yerel font olarak yüklenir)
export const MAP_LABEL_FONT_FAMILY = '"OpenDyslexic", "Lexend", sans-serif';

export const REGION_LABEL_FONT_SIZE = 18;
export const REGION_LABEL_HEIGHT = 26;

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

export interface MapLabelBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface MapLabelPlacement {
    x: number;
    y: number;
    textAnchor: 'middle' | 'start' | 'end';
    box: MapLabelBox;
}

const getRegionLabelWidth = (region: string) => {
    const label = REGION_COLORS[region]?.label ?? '';
    // OpenDyslexic geniş bir yazı tipidir — pill, metni rahatça kavrayacak kadar geniş tutulur
    return Math.max(64, Math.ceil([...label].length * REGION_LABEL_FONT_SIZE * 0.68) + 24);
};

/**
 * Bölge etiketlerinin harita üzerinde kapladığı alanlar.
 * Şehir etiketleri bu alanlara girmeyecek şekilde yerleştirilir.
 */
export const getRegionLabelBoxes = (emphasizedRegion?: string, showRegionLabels = true): MapLabelBox[] => {
    if (!showRegionLabels) return [];
    return Object.entries(REGION_LABEL_POSITIONS).flatMap(([region, pos]) => {
        if (!REGION_COLORS[region]) return [];
        if (emphasizedRegion && emphasizedRegion !== 'all' && emphasizedRegion !== region) return [];
        const width = getRegionLabelWidth(region);
        return [{ x: pos.x - width / 2, y: pos.y - 20, width, height: REGION_LABEL_HEIGHT }];
    });
};

/**
 * Verilen metnin yaklaşık kutu ölçüsü (OpenDyslexic geniş bir yazı tipidir).
 */
export const estimateLabelBox = (
    text: string,
    x: number,
    y: number,
    fontSize: number,
    textAnchor: 'middle' | 'start' | 'end' = 'middle'
): MapLabelBox => {
    const width = [...text].length * fontSize * 0.66 + 8;
    const height = fontSize * 1.25;
    const left = textAnchor === 'start' ? x : textAnchor === 'end' ? x - width : x - width / 2;
    return { x: left, y: y - height * 0.8, width, height };
};

export const labelsOverlap = (a: MapLabelBox, b: MapLabelBox): boolean =>
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y;

const LABEL_CANDIDATES: { dx: number; dy: number; textAnchor: 'middle' | 'start' | 'end' }[] = [
    { dx: 0, dy: -16, textAnchor: 'middle' },
    { dx: 0, dy: 28, textAnchor: 'middle' },
    { dx: 14, dy: 5, textAnchor: 'start' },
    { dx: -14, dy: 5, textAnchor: 'end' },
    { dx: 0, dy: -36, textAnchor: 'middle' },
    { dx: 0, dy: 48, textAnchor: 'middle' },
];

/**
 * Şehir etiketini engellenen alanlarla (bölge etiketleri, diğer şehir etiketleri)
 * çakışmayacak ilk konuma yerleştirir. Hiçbiri uygun değilse en az çakışan adayı döner.
 */
export const resolveMapLabelPlacement = ({
    text,
    x,
    y,
    fontSize = 13,
    blocked = [],
}: {
    text: string;
    x: number;
    y: number;
    fontSize?: number;
    blocked?: MapLabelBox[];
}): MapLabelPlacement => {
    let best: MapLabelPlacement | null = null;
    let bestOverlaps = Number.POSITIVE_INFINITY;

    for (const candidate of LABEL_CANDIDATES) {
        const px = x + candidate.dx;
        const py = y + candidate.dy;
        const box = estimateLabelBox(text, px, py, fontSize, candidate.textAnchor);
        const overlaps = blocked.filter(area => labelsOverlap(box, area)).length;
        if (overlaps === 0) return { x: px, y: py, textAnchor: candidate.textAnchor, box };
        if (overlaps < bestOverlaps) {
            bestOverlaps = overlaps;
            best = { x: px, y: py, textAnchor: candidate.textAnchor, box };
        }
    }

    return best ?? { x, y: y - 16, textAnchor: 'middle', box: estimateLabelBox(text, x, y - 16, fontSize) };
};

export const TurkeyMapSVG = ({
    emphasizedRegion,
    width = '100%',
    height = '100%',
    className = '',
    showRegionLabels = true,
    mapColorMode = 'renkli',
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
                @media print {
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
            {/* Deniz zemin */}
            <rect x="0" y="0" width="1000" height="500" fill="#eff6ff" className="print:fill-slate-50" />

            {/* İllerin çizimi */}
            <g className="harita-grup">
                {turkeyMapPaths.map((cityData: { plate: string; draw: string; city: string }) => {
                    const region = TURKEY_REGIONS[cityData.plate];
                    const active = isEmphasized(region);
                    const colors = REGION_COLORS[region] || { fill: '#f4f4f5', stroke: '#d4d4d8', label: '' };
                    const monochromeColors = MONOCHROME_REGION_COLORS[region] || { fill: '#ffffff', stroke: '#334155' };
                    const regionColors = mapColorMode === 'siyahbeyaz'
                        ? monochromeColors
                        : mapColorMode === 'pastel'
                            ? PASTEL_REGION_COLORS[region] || { fill: '#f1f5f9', stroke: '#64748b' }
                            : colors;

                    const isHovered = hoveredRegion === region;

                    // Önemli: printte soluk çıkmaması için opaklıklar artırıldı
                    const fillOpq = active ? (isHovered ? 1 : 0.9) : 0.6;

                    const fillColor = active ? regionColors.fill : (mapColorMode === 'siyahbeyaz' ? '#e2e8f0' : '#e4e4e7');
                    const strokeColor = active ? regionColors.stroke : '#94a3b8';
                    const strokeWidth = isHovered ? 1.5 : 1;

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
                            className="transition-all duration-300 ease-in-out sehir-path"
                            style={{
                                cursor: interactive ? 'pointer' : 'default',
                                outline: 'none'
                            }}
                            onMouseEnter={() => handleMouseEnter(region)}
                            onMouseLeave={handleMouseLeave}
                            onClick={() => handleClick(region)}
                        >
                            <title>{`${cityData.city} (${colors.label})`}</title>
                        </path>
                    );
                })}
            </g>

            {/* Bölge etiketleri — pill arka plan + koyu metin */}
            {showRegionLabels && Object.entries(REGION_LABEL_POSITIONS).map(([region, pos]) => {
                const colors = REGION_COLORS[region];
                const active = isEmphasized(region);
                if (!active || !colors) return null;
                const labelWidth = getRegionLabelWidth(region);
                const labelTextColor = mapColorMode === 'siyahbeyaz' ? '#0f172a' : LABEL_COLORS[region] || '#333';
                const labelBackground = mapColorMode === 'siyahbeyaz'
                    ? MONOCHROME_LABEL_BACKGROUND
                    : LABEL_BG[region] || 'rgba(255,255,255,0.9)';
                return (
                    <g key={`label-g-${region}`}>
                        <rect
                            x={pos.x - labelWidth / 2}
                            y={pos.y - 20}
                            width={labelWidth}
                            height={REGION_LABEL_HEIGHT}
                            rx="4"
                            fill={labelBackground}
                            stroke={labelTextColor}
                            strokeWidth="1.2"
                            opacity="0.95"
                        />
                        <text
                            key={`label-${region}`}
                            x={pos.x}
                            y={pos.y}
                            textAnchor="middle"
                            fontSize={REGION_LABEL_FONT_SIZE}
                            fontWeight="700"
                            fill={labelTextColor}
                            opacity={1}
                            className="uppercase pointer-events-none"
                            style={{
                                fontFamily: MAP_LABEL_FONT_FAMILY,
                                letterSpacing: '0.02em'
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
