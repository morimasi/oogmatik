
import React from 'react';

// ============================================================
// İNLİNE SVG TÜRKİYE HARİTASI — Harici bağımlılık sıfır
// ViewBox: 0 0 1000 500 (mevcut koordinat sistemiyle uyumlu)
// ============================================================

interface TurkeyMapSVGProps {
    emphasizedRegion?: string;
    width?: string;
    height?: string;
    className?: string;
    showRegionLabels?: boolean;
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

// Türkiye dış sınır — 1000x500 viewBox (kalibre edilmiş)
const TURKEY_OUTLINE = `
M 30,70 L 50,52 L 75,48 L 95,55 L 110,45 L 130,50 L 150,60 L 155,75 
L 135,80 L 125,95 L 140,100 L 160,95 L 175,85 L 195,80 L 210,90
L 180,115 L 170,140 L 175,160 L 195,175 L 210,190 L 195,205 L 175,210
L 160,225 L 140,240 L 120,250 L 105,260 L 95,280 L 80,300 L 75,320
L 70,340 L 65,360 L 70,375 L 80,385 L 95,380 L 110,370 L 125,355
L 140,345 L 155,360 L 145,380 L 130,395 L 120,410 L 130,420 L 145,425
L 160,430 L 180,440 L 200,445 L 225,440 L 250,435 L 270,430 L 285,435
L 300,440 L 310,450 L 325,455 L 340,450 L 355,440 L 370,435 L 395,440
L 420,445 L 440,440 L 455,435 L 475,440 L 495,445 L 510,450 L 530,455
L 545,460 L 560,465 L 575,470 L 590,480 L 605,490 L 615,495 L 630,490
L 640,480 L 650,465 L 660,450 L 670,440 L 685,435 L 700,440 L 720,445
L 740,450 L 760,445 L 780,440 L 800,445 L 820,450 L 840,455 L 860,450
L 880,445 L 900,440 L 920,430 L 940,420 L 955,405 L 965,390 L 975,370
L 985,350 L 990,330 L 995,310 L 990,290 L 985,270 L 980,250 L 975,235
L 970,220 L 960,205 L 950,195 L 935,185 L 920,178 L 905,170 L 890,165
L 875,155 L 860,148 L 845,145 L 830,140 L 815,138 L 800,135 L 780,130
L 760,128 L 745,130 L 730,128 L 715,125 L 700,120 L 685,118 L 670,115
L 655,112 L 640,110 L 620,108 L 600,105 L 580,102 L 560,100 L 540,98
L 520,95 L 500,93 L 480,92 L 460,95 L 440,100 L 425,105 L 410,110
L 395,115 L 380,120 L 365,125 L 350,130 L 335,125 L 320,118 L 310,112
L 295,108 L 280,105 L 265,108 L 250,112 L 240,120 L 230,130 L 220,140
L 210,150 L 195,145 L 185,135 L 175,120 L 165,110 L 155,100 L 145,90
L 135,85 L 115,82 L 100,78 L 85,72 L 70,68 L 50,60 L 30,70 Z
`;

// 7 bölge sınır alanları (yaklaşık polygon'lar)
const REGION_PATHS: Record<string, string> = {
    'Marmara': `M 30,70 L 50,52 L 95,55 L 130,50 L 160,60 L 175,85 L 210,90
        L 230,130 L 250,150 L 265,175 L 250,195 L 235,200 L 210,190 
        L 195,175 L 175,160 L 165,145 L 155,100 L 135,85 L 100,78 L 30,70 Z`,

    'Ege': `M 95,280 L 105,260 L 120,250 L 140,240 L 160,225 L 175,210
        L 195,205 L 230,200 L 250,195 L 265,210 L 280,230 L 285,260 
        L 265,275 L 245,290 L 225,305 L 200,325 L 180,345 L 160,360
        L 145,380 L 130,395 L 120,375 L 105,360 L 95,340 L 85,315 L 95,280 Z`,

    'Akdeniz': `M 145,380 L 160,360 L 180,345 L 200,325 L 225,305 L 245,290
        L 285,300 L 320,320 L 370,340 L 420,370 L 460,390 L 510,410
        L 560,425 L 590,440 L 615,460 L 605,490 L 590,480 L 560,465
        L 530,455 L 495,445 L 455,435 L 420,445 L 370,435 L 325,455 
        L 300,440 L 270,430 L 225,440 L 180,440 L 145,425 L 130,420
        L 130,395 L 145,380 Z`,

    'İç Anadolu': `M 265,175 L 280,160 L 310,150 L 350,158 L 390,170 
        L 430,180 L 470,185 L 510,190 L 550,195 L 575,200 L 590,220
        L 580,250 L 560,280 L 540,310 L 510,330 L 470,350 L 430,370
        L 395,380 L 360,370 L 320,350 L 290,325 L 270,295 L 260,265
        L 255,235 L 260,205 L 265,175 Z`,

    'Karadeniz': `M 280,105 L 310,112 L 350,130 L 390,120 L 425,105
        L 460,95 L 500,93 L 540,98 L 580,102 L 620,108 L 655,112
        L 700,120 L 730,128 L 760,130 L 780,140 L 765,160 L 740,175
        L 710,185 L 680,190 L 650,195 L 620,200 L 590,210 L 575,200
        L 550,195 L 510,190 L 470,185 L 430,180 L 390,170 L 350,158
        L 310,150 L 280,160 L 265,175 L 250,150 L 265,108 L 280,105 Z`,

    'Doğu Anadolu': `M 765,160 L 780,140 L 815,138 L 845,145 L 875,155
        L 905,170 L 935,185 L 960,205 L 975,235 L 985,270 L 990,310
        L 975,340 L 955,360 L 930,375 L 900,385 L 870,390 L 840,385
        L 810,380 L 785,370 L 765,350 L 750,330 L 740,305 L 735,275
        L 735,245 L 740,220 L 750,200 L 760,180 L 765,160 Z`,

    'Güneydoğu': `M 615,460 L 630,450 L 650,435 L 680,425 L 710,430
        L 740,440 L 770,435 L 800,440 L 830,445 L 860,450 L 880,445
        L 900,440 L 920,430 L 940,420 L 955,405 L 955,360 L 930,375
        L 900,385 L 870,390 L 840,385 L 810,380 L 785,370 L 765,350
        L 750,330 L 735,305 L 720,320 L 700,340 L 680,355 L 660,370
        L 640,385 L 625,400 L 615,420 L 610,440 L 615,460 Z`
};

// Bölge etiket konumları
const REGION_LABEL_POSITIONS: Record<string, { x: number; y: number }> = {
    'Marmara': { x: 170, y: 135 },
    'Ege': { x: 145, y: 295 },
    'Akdeniz': { x: 400, y: 430 },
    'İç Anadolu': { x: 420, y: 270 },
    'Karadeniz': { x: 530, y: 130 },
    'Doğu Anadolu': { x: 850, y: 265 },
    'Güneydoğu': { x: 780, y: 420 },
};

export const TurkeyMapSVG: React.FC<TurkeyMapSVGProps> = ({
    emphasizedRegion,
    width = '100%',
    height = '100%',
    className = '',
    showRegionLabels = true
}) => {
    const isEmphasized = (region: string) => {
        if (!emphasizedRegion || emphasizedRegion === 'all') return true;
        return region === emphasizedRegion;
    };

    return (
        <svg
            viewBox="0 0 1000 500"
            width={width}
            height={height}
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: 'transparent' }}
        >
            <defs>
                {/* Deniz gradient */}
                <radialGradient id="seaGradient" cx="50%" cy="50%" r="60%">
                    <stop offset="0%" stopColor="#e0f2fe" />
                    <stop offset="100%" stopColor="#bae6fd" />
                </radialGradient>
                {/* Gölge filtresi */}
                <filter id="mapShadow" x="-5%" y="-5%" width="110%" height="110%">
                    <feDropShadow dx="2" dy="3" stdDeviation="4" floodOpacity="0.15" />
                </filter>
            </defs>

            {/* Deniz zemin */}
            <rect x="0" y="0" width="1000" height="500" fill="url(#seaGradient)" rx="20" />

            {/* Bölge alanları */}
            {Object.entries(REGION_PATHS).map(([region, path]) => {
                const colors = REGION_COLORS[region];
                const active = isEmphasized(region);
                return (
                    <path
                        key={region}
                        d={path}
                        fill={active ? colors.fill : '#f4f4f5'}
                        stroke={active ? colors.stroke : '#d4d4d8'}
                        strokeWidth={active ? 2 : 1}
                        opacity={active ? 1 : 0.4}
                        className="transition-all duration-500"
                    />
                );
            })}

            {/* Türkiye dış sınır */}
            <path
                d={TURKEY_OUTLINE}
                fill="none"
                stroke="#27272a"
                strokeWidth="3"
                strokeLinejoin="round"
                filter="url(#mapShadow)"
            />

            {/* Bölge etiketleri */}
            {showRegionLabels && Object.entries(REGION_LABEL_POSITIONS).map(([region, pos]) => {
                const colors = REGION_COLORS[region];
                const active = isEmphasized(region);
                if (!active) return null;
                return (
                    <text
                        key={`label-${region}`}
                        x={pos.x}
                        y={pos.y}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="900"
                        fill={colors.stroke}
                        opacity={0.6}
                        className="font-sans uppercase"
                        style={{
                            letterSpacing: '0.15em',
                            paintOrder: 'stroke',
                            stroke: 'white',
                            strokeWidth: '3px',
                            strokeLinejoin: 'round'
                        }}
                    >
                        {colors.label}
                    </text>
                );
            })}

            {/* Deniz kenarı etiketi */}
            <text x="40" y="460" fontSize="9" fill="#93c5fd" fontWeight="700" opacity="0.5" className="uppercase" style={{ letterSpacing: '0.3em' }}>
                AKDENİZ
            </text>
            <text x="40" y="175" fontSize="9" fill="#93c5fd" fontWeight="700" opacity="0.5" className="uppercase" style={{ letterSpacing: '0.3em' }}>
                EGE DENİZİ
            </text>
            <text x="550" y="50" fontSize="9" fill="#93c5fd" fontWeight="700" opacity="0.5" className="uppercase" style={{ letterSpacing: '0.3em' }}>
                KARADENİZ
            </text>
        </svg>
    );
};
