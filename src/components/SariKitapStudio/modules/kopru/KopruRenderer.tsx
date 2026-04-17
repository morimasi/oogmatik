import React from 'react';
import type { RendererProps } from '../../registry';
import type { KopruConfig } from '../../../../types/sariKitap';

/**
 * Köprü Renderer — Kaynak PDF Standartlarında (Gökkuşağı Yay Modeli)
 * Görseldeki gibi: kalın yaylar, büyük punto, geniş boşluklar ve noktalama uyumu.
 */
export const KopruRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
    if (config.type !== 'kopru') return null;
    const c = config as KopruConfig;

    // Görseldeki standartlara göre ölçekleme (Punto: 22px, Yay: 2.5px kalınlık)
    const fontSizePx = 22;
    const charWidth = 14; 
    const charGapWidth = 12; // Kelime ve yay arasındaki "hava boşluğu"
    const bThickness = 2.5;
    const bColor = c.bridgeColor ?? '#18181b';
    const bHeight = 18; // Yayın yüksekliği
    
    // Satır aralığı — görseldeki gibi ferah (line-height: 2.5)
    const lineGap = '4rem';

    return (
        <div className="sk-renderer-kopru" style={{
            padding: '2rem 1rem', display: 'flex', flexDirection: 'column', height: '100%',
            background: '#ffffff', color: '#18181b'
        }}>
            {/* ═══ İÇERİK ═══ */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                gap: lineGap, padding: '10mm 5mm 0 5mm'
            }}>
                {content.heceRows.map((row, ri) => {
                    let currentX = 0;
                    const wordPositions = row.syllables?.map((s, si) => {
                        // Hece uzunluğuna göre dinamik genişlik hesabı (en az 1.5rem)
                        const rawWidth = (s.syllable?.length || 0) * (charWidth * 0.9);
                        const wordWidth = Math.max(rawWidth, 15);
                        
                        const pos = {
                            x: currentX,
                            width: wordWidth,
                            centerX: currentX + wordWidth / 2
                        };
                        const bridgeAreaWidth = 50; // Görseldeki o ferah boşluk
                        currentX += wordWidth + (charGapWidth * 2) + bridgeAreaWidth;
                        return pos;
                    }) || [];

                    const totalWidth = currentX;
                    const svgTextY = bHeight + 25;
                    const svgHeight = svgTextY + 12;

                    return (
                        <div key={ri} style={{ overflow: 'visible', width: '100%' }}>
                            <svg
                                width="100%"
                                height={svgHeight}
                                viewBox={`0 0 ${totalWidth} ${svgHeight}`}
                                preserveAspectRatio="xMinYMid meet"
                                style={{ display: 'block', overflow: 'visible' }}
                            >
                                {row.syllables?.map((s, si) => {
                                    const pos = wordPositions[si];
                                    return (
                                        <text
                                            key={`w-${si}`}
                                            x={pos.centerX}
                                            y={svgTextY}
                                            textAnchor="middle"
                                            style={{
                                                fontFamily: 'Lexend, sans-serif',
                                                fontSize: `${fontSizePx}px`,
                                                fontWeight: 400,
                                                fill: '#18181b'
                                            }}
                                        >
                                            {s.syllable}
                                        </text>
                                    );
                                })}

                                {row.syllables?.map((s, si) => {
                                    // Son heceyse veya row/syllables hatalıysa sağında yay çizme
                                    if (!row.syllables || si >= row.syllables.length - 1) return null;

                                    const pos1 = wordPositions[si];
                                    const pos2 = wordPositions[si + 1];

                                    const x1 = pos1.x + pos1.width + charGapWidth;
                                    const x2 = pos2.x - charGapWidth;
                                    const midX = (x1 + x2) / 2;
                                    const arcY = svgTextY - 8;
                                    const arcTopY = arcY - bHeight;

                                    return (
                                        <path
                                            key={`b-${si}`}
                                            d={`M ${x1},${arcY} Q ${midX},${arcTopY} ${x2},${arcY}`}
                                            fill="none"
                                            stroke={bColor}
                                            strokeWidth={bThickness}
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    );
                })}
            </div>

            {/* ═══ SAYFA ALTI (Sayfa Numarası Standartı) ═══ */}
            <div style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'center',
                padding: '2rem 0',
                fontSize: '1.25rem',
                color: '#18181b',
                fontWeight: 600,
                fontFamily: 'Lexend, sans-serif',
                opacity: 0.8
            }}>
                3
            </div>
        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';
