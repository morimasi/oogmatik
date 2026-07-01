import React from 'react';

interface WorldMapSVGProps {
  emphasizedRegion?: string;
  showRegionLabels?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const WorldMapSVG = ({
  showRegionLabels = true,
  width = '100%',
  height = '100%',
  className = '',
}: WorldMapSVGProps) => {
  return (
    <svg viewBox="0 0 1000 500" width={width} height={height} className={className}>
      <rect width="1000" height="500" fill="#e8f4f8" rx="8" />
      <g stroke="#c8dce8" strokeWidth="0.5" opacity="0.4">
        {Array.from({ length: 20 }).map((_, i) => (
          <line key={`h${i}`} x1={0} y1={i * 25} x2={1000} y2={i * 25} />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 25} y1={0} x2={i * 25} y2={500} />
        ))}
      </g>
      <g fill="#7ab87a" stroke="#4a8a4a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M120,80 L160,50 L210,40 L250,45 L290,55 L320,70 L340,90 L350,110 L340,130 L330,150 L320,170 L310,190 L300,210 L310,230 L320,250 L310,270 L290,280 L270,275 L250,260 L230,250 L210,240 L190,230 L170,220 L160,200 L150,180 L140,160 L130,140 L120,120 L110,100 Z" fill="#8bc34a" />
        <path d="M290,280 L270,290 L260,310 L270,320 L280,310 L290,300 L300,290 Z" fill="#8bc34a" />
        <path d="M300,290 L320,300 L340,310 L350,330 L360,350 L370,370 L360,390 L340,400 L320,405 L300,400 L290,380 L280,360 L270,340 L275,320 L280,310 L290,300 Z" fill="#66bb6a" />
        <path d="M460,70 L480,60 L500,55 L520,60 L540,65 L550,80 L560,95 L550,110 L540,120 L530,130 L520,135 L510,130 L500,120 L490,110 L480,100 L470,90 L460,80 Z" fill="#81c784" />
        <path d="M440,70 L450,65 L455,75 L450,85 L445,80 Z" fill="#81c784" />
        <path d="M500,35 L510,30 L520,35 L530,45 L525,55 L515,50 L505,45 Z" fill="#81c784" />
        <path d="M500,140 L520,145 L540,155 L555,170 L565,190 L570,210 L565,230 L555,250 L540,265 L520,275 L500,280 L490,270 L480,250 L475,230 L470,210 L475,190 L480,170 L485,155 Z" fill="#a5d6a7" />
        <path d="M570,240 L575,230 L580,235 L582,250 L578,255 Z" fill="#a5d6a7" />
        <path d="M560,65 L580,55 L600,50 L620,45 L640,40 L660,38 L680,40 L700,45 L720,50 L740,55 L760,60 L780,70 L790,85 L800,100 L810,120 L815,140 L810,160 L800,175 L790,185 L780,190 L760,195 L740,200 L720,205 L700,210 L680,215 L660,220 L640,225 L620,230 L600,235 L580,230 L560,220 L540,210 L530,195 L525,180 L530,160 L535,140 L540,120 L550,100 L555,80 Z" fill="#81c784" />
        <path d="M530,195 L540,210 L550,220 L560,225 L570,220 L575,210 L570,200 L560,195 L550,190 Z" fill="#a5d6a7" />
        <path d="M620,230 L630,240 L640,260 L650,280 L660,300 L655,310 L640,315 L625,310 L620,300 L615,280 L610,260 L615,245 Z" fill="#66bb6a" />
        <path d="M660,300 L670,290 L680,285 L690,290 L700,300 L695,310 L685,315 L675,310 L665,305 Z" fill="#66bb6a" />
        <path d="M780,100 L788,95 L792,105 L790,120 L785,125 L780,115 Z" fill="#81c784" />
        <path d="M690,310 L700,315 L710,312 L720,315 L730,320 L725,330 L715,328 L705,325 L695,320 Z" fill="#66bb6a" />
        <path d="M720,315 L735,310 L745,315 L750,325 L740,330 L730,325 Z" fill="#66bb6a" />
        <path d="M760,150 L765,145 L770,150 L768,160 L762,158 Z" fill="#81c784" />
        <path d="M810,340 L830,330 L850,325 L870,330 L890,340 L900,355 L895,370 L880,380 L860,385 L840,380 L820,370 L808,355 Z" fill="#e8c87a" stroke="#c4a050" />
        <path d="M920,390 L925,385 L928,395 L924,400 Z" fill="#81c784" />
        <path d="M300,30 L320,25 L340,28 L350,40 L345,55 L330,60 L310,55 L295,45 Z" fill="#e0e0e0" stroke="#bdbdbd" />
        <path d="M100,480 L200,475 L300,470 L400,468 L500,470 L600,472 L700,468 L800,470 L900,475 L950,478" fill="none" stroke="#b0bec5" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
      </g>
      {showRegionLabels && (
        <g fontFamily="Lexend, sans-serif" fontWeight="900" fontSize="12" fill="#2e7d32" opacity="0.6">
          <text x="200" y="160" textAnchor="middle" fontSize="15">KUZEY AMERİKA</text>
          <text x="330" y="360" textAnchor="middle" fontSize="13">GÜNEY AMERİKA</text>
          <text x="500" y="170" textAnchor="middle" fontSize="14">AFRİKA</text>
          <text x="500" y="50" textAnchor="middle" fontSize="13">AVRUPA</text>
          <text x="660" y="140" textAnchor="middle" fontSize="16">ASYA</text>
          <text x="860" y="365" textAnchor="middle" fontSize="13">AVUSTRALYA</text>
        </g>
      )}
      <line x1="0" y1="250" x2="1000" y2="250" stroke="#ff6f00" strokeWidth="1" strokeDasharray="8,6" opacity="0.3" />
    </svg>
  );
};
