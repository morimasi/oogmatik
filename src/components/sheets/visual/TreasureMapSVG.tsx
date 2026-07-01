import React from 'react';

interface TreasureMapSVGProps {
  showRegionLabels?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const TreasureMapSVG = ({
  width = '100%',
  height = '100%',
  className = '',
}: TreasureMapSVGProps) => {
  return (
    <svg viewBox="0 0 1000 500" width={width} height={height} className={className}>
      <defs>
        <filter id="roughpaper">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
          <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise" />
          <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" />
        </filter>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#8b5e3c" strokeWidth="0.3" opacity="0.3" />
        </pattern>
        <radialGradient id="islandGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e8d5a3" />
          <stop offset="60%" stopColor="#d4b87a" />
          <stop offset="100%" stopColor="#c49a6c" />
        </radialGradient>
      </defs>

      {/* Parchment background */}
      <rect width="1000" height="500" fill="#f5e6c8" ry="8" />
      <rect width="1000" height="500" fill="url(#grid)" />

      {/* Stained edges */}
      <g opacity="0.15">
        <rect x="0" y="0" width="1000" height="500" fill="none" stroke="#6b4226" strokeWidth="20" rx="8" />
        <rect x="15" y="15" width="970" height="470" fill="none" stroke="#8b5e3c" strokeWidth="2" rx="4" />
      </g>

      {/* Ocean waves */}
      <g fill="none" stroke="#8fb8d6" strokeWidth="0.8" opacity="0.25">
        {Array.from({ length: 15 }).map((_, i) => {
          const y = 20 + i * 32;
          return (
            <path key={i} d={`M 0 ${y} Q 20 ${y - 3} 40 ${y} Q 60 ${y + 3} 80 ${y} Q 100 ${y - 3} 120 ${y} Q 140 ${y + 3} 160 ${y}`} opacity={0.3 + Math.random() * 0.4} />
          );
        })}
        {Array.from({ length: 15 }).map((_, i) => {
          const y = 25 + i * 32;
          return (
            <path key={`w${i}`} d={`M 800 ${y} Q 820 ${y - 2} 840 ${y} Q 860 ${y + 2} 880 ${y} Q 900 ${y - 2} 920 ${y} Q 940 ${y + 2} 960 ${y}`} opacity={0.2 + Math.random() * 0.3} />
          );
        })}
      </g>

      {/* Island shape */}
      <path d="M 350,100 C 400,80 480,70 550,90 C 620,110 680,140 700,180 C 720,220 710,270 680,310 C 650,350 600,380 540,390 C 480,400 420,390 370,370 C 320,350 290,320 270,280 C 250,240 260,190 290,150 C 310,120 330,110 350,100 Z" fill="url(#islandGrad)" stroke="#a0764a" strokeWidth="2" />

      {/* Island terrain details */}
      <g fill="none" stroke="#b8935a" strokeWidth="0.6" opacity="0.4">
        <path d="M 380,160 C 420,150 460,155 490,170" />
        <path d="M 420,180 C 450,175 480,180 510,195" />
        <path d="M 360,210 C 390,200 430,205 460,220" />
        <path d="M 500,240 C 530,230 560,235 580,250" />
        <path d="M 440,280 C 470,270 500,275 520,290" />
        <path d="M 390,310 C 420,300 450,305 470,320" />
      </g>

      {/* Mountains (triangle symbols) */}
      <g fill="#7a6b4a" stroke="#5c4f33" strokeWidth="1" opacity="0.6">
        <polygon points="430,210 440,190 450,210" />
        <polygon points="455,205 465,185 475,205" />
        <polygon points="500,220 510,200 520,220" />
        <polygon points="545,230 555,212 565,230" />
        <polygon points="400,250 410,232 420,250" />
        <polygon points="480,270 490,252 500,270" />
      </g>

      {/* Trees (small circles) */}
      <g fill="#5a7a3a" opacity="0.5">
        <circle cx="370" cy="180" r="4" />
        <circle cx="380" cy="190" r="3" />
        <circle cx="360" cy="195" r="3.5" />
        <circle cx="520" cy="260" r="4" />
        <circle cx="530" cy="270" r="3" />
        <circle cx="540" cy="255" r="3.5" />
        <circle cx="330" cy="280" r="3" />
        <circle cx="340" cy="290" r="4" />
      </g>

      {/* River */}
      <path d="M 450,190 C 460,210 450,230 440,250 C 430,270 425,290 430,310 L 435,330" fill="none" stroke="#7eb8d6" strokeWidth="3" strokeLinecap="round" opacity="0.5" />

      {/* Dotted treasure path */}
      <path d="M 170,400 C 220,350 250,300 300,280 C 350,260 380,290 400,270 C 420,250 440,240 460,230 C 480,220 520,200 540,190 C 560,180 580,170 600,175 C 620,180 630,190 640,200" fill="none" stroke="#8b4513" strokeWidth="2.5" strokeDasharray="6,6" strokeLinecap="round" />

      {/* Start marker */}
      <text x="170" y="415" fontSize="10" fontWeight="bold" fill="#8b4513" textAnchor="middle">BAŞLANGIÇ</text>
      <circle cx="170" cy="400" r="5" fill="#8b4513" />

      {/* X marks along the path */}
      {[
        { x: 250, y: 310 },
        { x: 380, y: 280 },
        { x: 520, y: 200 },
        { x: 580, y: 175 },
      ].map((p, i) => (
        <g key={i} transform={`translate(${p.x}, ${p.y})`}>
          <line x1="-4" y1="-4" x2="4" y2="4" stroke="#8b4513" strokeWidth="2" />
          <line x1="-4" y1="4" x2="4" y2="-4" stroke="#8b4513" strokeWidth="2" />
        </g>
      ))}

      {/* Treasure island name */}
      <text x="490" y="155" fontSize="18" fontWeight="900" fill="#6b4226" textAnchor="middle" fontFamily="serif" transform="rotate(-5, 490, 155)">Gizemli Ada</text>

      {/* Compass Rose */}
      <g transform="translate(850, 110)">
        <circle r="35" fill="none" stroke="#8b5e3c" strokeWidth="1.5" />
        <circle r="32" fill="none" stroke="#8b5e3c" strokeWidth="0.5" opacity="0.5" />
        <polygon points="0,-30 4,-8 0,0 -4,-8" fill="#8b4513" />
        <polygon points="0,30 4,8 0,0 -4,8" fill="#a0764a" />
        <polygon points="-30,0 -8,4 0,0 -8,-4" fill="#a0764a" />
        <polygon points="30,0 8,4 0,0 8,-4" fill="#a0764a" />
        <polygon points="0,-30 8,-12 0,0 -8,-12" fill="none" stroke="#8b5e3c" strokeWidth="0.5" />
        <circle r="2" fill="#8b4513" />
        <text x="0" y="-38" fontSize="11" fontWeight="900" fill="#8b4513" textAnchor="middle" fontFamily="serif">K</text>
        <text x="0" y="44" fontSize="9" fontWeight="700" fill="#8b4513" textAnchor="middle" fontFamily="serif">G</text>
        <text x="-42" y="4" fontSize="9" fontWeight="700" fill="#8b4513" textAnchor="middle" fontFamily="serif">B</text>
        <text x="42" y="4" fontSize="9" fontWeight="700" fill="#8b4513" textAnchor="middle" fontFamily="serif">D</text>
      </g>

      {/* Big treasure X */}
      <g transform="translate(640, 200)">
        <line x1="-14" y1="-14" x2="14" y2="14" stroke="#d32f2f" strokeWidth="4" strokeLinecap="round" />
        <line x1="-14" y1="14" x2="14" y2="-14" stroke="#d32f2f" strokeWidth="4" strokeLinecap="round" />
        <circle r="20" fill="none" stroke="#d32f2f" strokeWidth="2" strokeDasharray="4,3" />
        <text y="30" fontSize="10" fontWeight="900" fill="#d32f2f" textAnchor="middle" fontFamily="serif">HAZİNE BURADA</text>
      </g>

      {/* Sea monsters / decorations */}
      <g opacity="0.2" fill="#5c8a8a">
        {/* Kraken tentacle */}
        <path d="M 120,250 C 130,240 140,255 135,265 C 130,275 125,260 120,250 Z" />
        <path d="M 140,240 C 150,235 155,245 150,250 C 145,255 140,245 140,240 Z" />
        {/* Whale spout */}
        <path d="M 780,380 C 785,370 790,365 795,370" fill="none" stroke="#5c8a8a" strokeWidth="2" />
        <circle cx="790" cy="362" r="3" fill="#5c8a8a" />
        <circle cx="787" cy="358" r="2" fill="#5c8a8a" />
        <circle cx="793" cy="358" r="2" fill="#5c8a8a" />
      </g>

      {/* Legend box */}
      <g transform="translate(780, 380)">
        <rect x="0" y="0" width="180" height="80" fill="#f5e6c8" fillOpacity="0.9" stroke="#8b5e3c" strokeWidth="1" rx="4" />
        <text x="90" y="16" fontSize="9" fontWeight="900" fill="#6b4226" textAnchor="middle" fontFamily="serif">LEJANT</text>
        <line x1="10" y1="28" x2="10" y2="34" stroke="#8b4513" strokeWidth="2.5" strokeDasharray="4,4" />
        <text x="22" y="33" fontSize="8" fill="#6b4226" fontFamily="serif">Gizli Yol</text>
        <text x="10" y="47" fontSize="12" fontWeight="900" fill="#d32f2f" fontFamily="serif">X</text>
        <text x="22" y="48" fontSize="8" fill="#6b4226" fontFamily="serif">Hazine Noktası</text>
        <polygon points="10,58 13,68 7,68" fill="#7a6b4a" />
        <text x="22" y="65" fontSize="8" fill="#6b4226" fontFamily="serif">Dağ</text>
        <circle cx="10" cy="74" r="2.5" fill="#5a7a3a" />
        <text x="22" y="76" fontSize="8" fill="#6b4226" fontFamily="serif">Orman</text>
      </g>
    </svg>
  );
};
