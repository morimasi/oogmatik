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
    const charWidth = 14; // Punto büyüdüğü için karakter genişliğini artırdık
    const charGapWidth = 12; // Kelime ve yay arasındaki "hava boşluğu"
    const bThickness = 2.5;
    const bColor = c.bridgeColor ?? '#18181b';
    const bHeight = 18; // Yayın yüksekliği
    
    // Satır aralığı — görseldeki gibi ferah (line-height: 2.5)
    const lineGap = '3.5rem';

    return (
        <div className="sk-renderer-kopru" style={{
            padding: '1.5rem 0.5rem', display: 'flex', flexDirection: 'column', height: '100%'
        }}>
            {/* ═══ İÇERİK ═══ */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                gap: lineGap, padding: '0 1rem'
            }}>
                {content.heceRows.map((row, ri) => {
                    // Pozisyonları metin uzunluğuna göre hesapla
                    let currentX = 0;
                    const wordPositions = row.syllables.map((s) => {
                        // Word metni için canvas ölçümü simülasyonu
                        const wordWidth = s.syllable.length * (charWidth * 0.85); 
                        const pos = {
                            x: currentX,
                            width: wordWidth,
                            centerX: currentX + wordWidth / 2
                        };
                        // Mesafe: kelime + sol boşluk + yay genişliği + sağ boşluk
                        const bridgeAreaWidth = 45; // Köprü alanı sabit ve geniş
                        currentX += wordWidth + (charGapWidth * 2) + bridgeAreaWidth;
                        return pos;
                    });

                    const totalWidth = currentX;
                    // Yükseklik puntoya ve yaya göre ayarlandı
                    const svgTextY = bHeight + 25;
                    const svgHeight = svgTextY + 10;

                    return (
                        <div key={ri} style={{ overflow: 'visible', width: '100%' }}>
                            <svg
                                width="100%"
                                height={svgHeight}
                                viewBox={`0 0 ${totalWidth} ${svgHeight}`}
                                preserveAspectRatio="xMinYMid meet"
                                style={{ display: 'block', overflow: 'visible' }}
                            >
                                {/* Kelime metinleri (Noktalama dahil) */}
                                {row.syllables.map((s, si) => {
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
                                                fill: '#18181b',
                                                letterSpacing: '0.02em'
                                            }}
                                        >
                                            {s.syllable}
                                        </text>
                                    );
                                })}

                                {/* Köprü yayları (Rainbow Bridge) */}
                                {row.syllables.map((s, si) => {
                                    if (si >= row.syllables.length - 1) return null;

                                    const pos1 = wordPositions[si];
                                    const pos2 = wordPositions[si + 1];

                                    // Yay başlangıç ve bitiş noktaları (Kelimeden uzaklaştırıldı)
                                    const x1 = pos1.x + pos1.width + charGapWidth;
                                    const x2 = pos2.x - charGapWidth;
                                    const midX = (x1 + x2) / 2;
                                    const arcY = svgTextY - 8; // Metinden biraz yukarıda başla
                                    const arcTopY = arcY - bHeight;

                                    return (
                                        <path
                                            key={`b-${si}`}
                                            // Quadratic curve ile "gökkuşağı" yay formu
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

            {/* ═══ SAYFA ALTI (Görseldeki standart) ═══ */}
            <div style={{
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'center',
                padding: '1rem 0',
                fontSize: '0.9rem',
                color: '#18181b',
                fontWeight: 500,
                fontFamily: 'Inter, sans-serif'
            }}>
                3
            </div>
        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';
