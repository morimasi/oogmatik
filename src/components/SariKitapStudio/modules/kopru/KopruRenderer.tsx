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
        <div className="sk-renderer-kopru">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', color: '#18181b' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.6875rem', color: '#4b5563', marginBottom: '1rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {content.heceRows.map((row, ri) => {
                    const syllableWidth = 40 + c.bridgeGap;
                    const svgWidth = row.syllables.length * syllableWidth;
                    const svgHeight = c.bridgeHeight + 30;

                    return (
                        <div key={ri} style={{ marginBottom: '0.75rem', overflow: 'visible' }}>
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
                                            y={svgHeight - 5}
                                            textAnchor="middle"
                                            style={{ fontFamily: 'Lexend, sans-serif', fontSize: '1rem', fontWeight: 500, fill: '#18181b' }}
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
                                    const y = svgHeight - 20;
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

            <div style={{ marginTop: '1.5rem', padding: '0.5rem 0.75rem', borderLeft: '3px solid #8b5cf6', background: '#f3e8ff', fontSize: '0.6875rem', color: '#581c87' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';
