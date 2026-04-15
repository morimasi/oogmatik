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
        <div className="sk-renderer-kopru" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem', flex: 1, padding: '1rem 0' }}>
                {content.heceRows.map((row, ri) => {
                    const charWidth = 12;
                    const bridgeGap = 15;
                    const svgHeight = 45;
                    
                    let currentX = 0;
                    const syllablePositions = row.syllables.map((s) => {
                        const width = s.syllable.length * charWidth;
                        const pos = {
                            x: currentX,
                            width: width,
                            midX: currentX + width / 2
                        };
                        currentX += width + bridgeGap;
                        return pos;
                    });

                    const svgWidth = currentX;

                    return (
                        <div key={ri} style={{ overflow: 'visible' }}>
                            <svg
                                width={svgWidth}
                                height={svgHeight}
                                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                                style={{ display: 'block', overflow: 'visible' }}
                                aria-hidden="true"
                            >
                                {row.syllables.map((s, si) => {
                                    const pos = syllablePositions[si];
                                    return (
                                        <text
                                            key={`t-${si}`}
                                            x={pos.midX}
                                            y={svgHeight - 10}
                                            textAnchor="middle"
                                            style={{ 
                                                fontFamily: 'Lexend, sans-serif', 
                                                fontSize: '1.5rem', 
                                                fontWeight: 500, 
                                                fill: '#18181b' 
                                            }}
                                        >
                                            {s.syllable}
                                        </text>
                                    );
                                })}

                                {row.syllables.map((s, si) => {
                                    if (si >= row.syllables.length - 1) return null;
                                    
                                    const pos1 = syllablePositions[si];
                                    const pos2 = syllablePositions[si + 1];
                                    
                                    const x1 = pos1.midX + (pos1.width / 2) - 2;
                                    const x2 = pos2.midX - (pos2.width / 2) + 2;
                                    const cx = (x1 + x2) / 2;
                                    const y = svgHeight - 15;
                                    const bridgeH = 12;
                                    const cy = y - bridgeH;

                                    return (
                                        <path
                                            key={`b-${si}`}
                                            d={`M ${x1},${y} Q ${cx},${cy} ${x2},${y}`}
                                            fill="none"
                                            stroke="#18181b"
                                            strokeWidth={2.5}
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </svg>
                        </div>
                    );
                })}
            </div>

            <div style={{ 
                marginTop: 'auto', 
                paddingTop: '1rem', 
                borderTop: '1px solid #e2e8f0', 
                display: 'flex', 
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#64748b'
            }}>
                3
            </div>
        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';
