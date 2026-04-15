import React from 'react';
import type { RendererProps } from '../../registry';
import type { KopruConfig } from '../../../../types/sariKitap';

export const KopruRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
    if (config.type !== 'kopru') return null;
    const c = config as KopruConfig;

    const getStrokeDashArray = (style: string): string | undefined => {
        if (style === 'noktalı') return '4,4';
        return undefined;
    };

    return (
        <div className="sk-renderer-kopru" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#3f3f46', marginBottom: '0.75rem', fontWeight: 500, textAlign: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.5rem' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                {content.heceRows.map((row, ri) => {
                    const syllableWidth = 45 + c.bridgeGap;
                    const svgWidth = row.syllables.length * syllableWidth;
                    const svgHeight = c.bridgeHeight + 25;

                    return (
                        <div key={ri} style={{ marginBottom: '0.25rem', overflow: 'visible' }}>
                            <svg
                                width={svgWidth}
                                height={svgHeight}
                                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                style={{ display: 'block', maxWidth: '100%' }}
                                aria-hidden="true"
                            >
                                {/* Heceler (metin) */}
                                {row.syllables.map((s, si) => {
                                    const x = si * syllableWidth + syllableWidth / 2;
                                    return (
                                        <text
                                            key={`t-${si}`}
                                            x={x}
                                            y={svgHeight - 2}
                                            textAnchor="middle"
                                            style={{ fontFamily: 'Lexend, sans-serif', fontSize: '1.125rem', fontWeight: 600, fill: '#18181b' }}
                                            role="text"
                                        >
                                            {s.syllable}
                                        </text>
                                    );
                                })}

                                {/* Köprü yayları */}
                                {row.syllables.map((s, si) => {
                                    if (!s.bridgeNext || si >= row.syllables.length - 1) return null;
                                    const x1 = si * syllableWidth + syllableWidth / 2;
                                    const x2 = (si + 1) * syllableWidth + syllableWidth / 2;
                                    const cx = (x1 + x2) / 2;
                                    const y = svgHeight - 18;
                                    const cy = y - c.bridgeHeight;

                                    if (c.bridgeStyle === 'düz') {
                                        return (
                                            <line
                                                key={`b-${si}`}
                                                x1={x1}
                                                y1={y}
                                                x2={x2}
                                                y2={y}
                                                stroke={c.bridgeColor}
                                                strokeWidth={c.bridgeThickness}
                                            />
                                        );
                                    }

                                    return (
                                        <path
                                            key={`b-${si}`}
                                            d={`M ${x1},${y} Q ${cx},${cy} ${x2},${y}`}
                                            fill="none"
                                            stroke={c.bridgeColor}
                                            strokeWidth={c.bridgeThickness}
                                            strokeDasharray={getStrokeDashArray(c.bridgeStyle)}
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '2px solid #8b5cf6', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ background: '#8b5cf6', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Pedagojik Not
                </div>
                <div style={{ fontSize: '0.7rem', color: '#581c87', fontStyle: 'italic', flex: 1 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';
