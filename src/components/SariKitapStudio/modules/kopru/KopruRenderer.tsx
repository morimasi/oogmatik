import React from 'react';
import type { RendererProps } from '../../registry';
import type { KopruConfig } from '../../../../types/sariKitap';

/**
 * Köprü Renderer — Kelime Bazlı
 * Her kelime arasında yay köprüsü. Köprü genişliği: ~4 karakter.
 * Kelimeler arası 1 karakter boşluk. Kompakt A4 düzeni.
 */
export const KopruRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
    if (config.type !== 'kopru') return null;
    const c = config as KopruConfig;

    const charWidth = 9;
    const bridgeCharWidth = c.bridgeWidth ?? 4;
    const charGapWidth = (c.charGap ?? 1) * charWidth;
    const bridgePixelWidth = bridgeCharWidth * charWidth;
    const bThickness = c.bridgeThickness ?? 1.5;
    const bColor = c.bridgeColor ?? '#18181b';
    const bHeight = c.bridgeHeight ?? 14;
    const bStyle = c.bridgeStyle ?? 'yay';

    const getStrokeDash = (style: string): string | undefined => {
        if (style === 'noktalı') return '3,3';
        if (style === 'düz') return undefined;
        return undefined;
    };

    // Satır aralığı — yoğunluğa göre
    const lineGap = c.textDensity === 'yüksek' ? '0.6rem' : c.textDensity === 'düşük' ? '1.5rem' : '1rem';

    return (
        <div className="sk-renderer-kopru" style={{
            padding: 0, display: 'flex', flexDirection: 'column', height: '100%'
        }}>
            {/* Başlık */}
            <h2 style={{
                fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem',
                textAlign: 'center', color: '#18181b', textTransform: 'uppercase',
                letterSpacing: '0.12em', borderBottom: '2px solid #18181b',
                paddingBottom: '0.4rem'
            }}>
                {content.title}
            </h2>

            {/* Yönerge */}
            <p style={{
                fontSize: '0.65rem', color: '#64748b', textAlign: 'center',
                marginBottom: '0.5rem', fontStyle: 'italic', lineHeight: 1.3
            }}>
                Yay köprülerini takip ederek kelimeleri birleştirerek okuyun.
            </p>

            {/* İçerik — Kelime bazlı köprü SVG */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                gap: lineGap, padding: '0 0.25rem'
            }}>
                {content.heceRows.map((row, ri) => {
                    // Her kelime için pozisyon hesapla
                    let currentX = 4;
                    const wordPositions = row.syllables.map((s) => {
                        const wordWidth = s.syllable.length * charWidth;
                        const pos = {
                            x: currentX,
                            width: wordWidth,
                            centerX: currentX + wordWidth / 2
                        };
                        currentX += wordWidth + charGapWidth + bridgePixelWidth + charGapWidth;
                        return pos;
                    });

                    const totalWidth = currentX;
                    const svgTextY = bHeight + 18;
                    const svgHeight = svgTextY + 6;

                    return (
                        <div key={ri} style={{ overflow: 'visible', width: '100%' }}>
                            <svg
                                width="100%"
                                height={svgHeight}
                                viewBox={`0 0 ${totalWidth} ${svgHeight}`}
                                preserveAspectRatio="xMinYMid meet"
                                style={{ display: 'block', overflow: 'visible' }}
                                aria-hidden="true"
                            >
                                {/* Kelime metinleri */}
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
                                                fontSize: '14px',
                                                fontWeight: 500,
                                                fill: '#18181b'
                                            }}
                                        >
                                            {s.syllable}
                                        </text>
                                    );
                                })}

                                {/* Köprü yayları — kelimeler arası */}
                                {row.syllables.map((s, si) => {
                                    if (si >= row.syllables.length - 1) return null;

                                    const pos1 = wordPositions[si];
                                    const pos2 = wordPositions[si + 1];

                                    // Yay başlangıç ve bitiş noktaları
                                    const x1 = pos1.x + pos1.width + charGapWidth;
                                    const x2 = pos2.x - charGapWidth;
                                    const midX = (x1 + x2) / 2;
                                    const arcY = svgTextY - 4;
                                    const arcTopY = arcY - bHeight;

                                    if (bStyle === 'düz') {
                                        return (
                                            <line
                                                key={`b-${si}`}
                                                x1={x1} y1={arcY}
                                                x2={x2} y2={arcY}
                                                stroke={bColor}
                                                strokeWidth={bThickness}
                                                strokeDasharray={getStrokeDash(bStyle)}
                                            />
                                        );
                                    }

                                    return (
                                        <path
                                            key={`b-${si}`}
                                            d={`M ${x1},${arcY} Q ${midX},${arcTopY} ${x2},${arcY}`}
                                            fill="none"
                                            stroke={bColor}
                                            strokeWidth={bThickness}
                                            strokeLinecap="round"
                                            strokeDasharray={getStrokeDash(bStyle)}
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    );
                })}
            </div>

            {/* Alt bilgi */}
            <div style={{
                marginTop: 'auto', paddingTop: '0.5rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.6rem', color: '#94a3b8', padding: '0.5rem 0.25rem 0'
            }}>
                <span>Köprü Okuma • {c.difficulty}</span>
                <span>Oogmatik © Sarı Kitap</span>
                <span>1</span>
            </div>
        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';
