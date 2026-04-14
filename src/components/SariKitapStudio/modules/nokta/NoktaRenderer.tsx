import React from 'react';
import type { RendererProps } from '../../registry';
import type { NoktaConfig } from '../../../../types/sariKitap';

export const NoktaRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
    if (config.type !== 'nokta') return null;
    const c = config as NoktaConfig;

    const getDotShape = (style: string, size: number, color: string) => {
        switch (style) {
            case 'kare':
                return <rect x={0} y={0} width={size} height={size} fill={color} />;
            case 'elips':
                return <ellipse cx={size / 2} cy={size / 3} rx={size / 2} ry={size / 3} fill={color} />;
            default:
                return <circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />;
        }
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1.5rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            {content.heceRows.map((row, ri) => (
                <div key={ri} style={{ marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'baseline' }}>
                        {row.syllables.map((s, si) => (
                            <div key={si} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <span role="text">{s.syllable}</span>
                                {s.dotBelow && (
                                    <svg
                                        width={c.dotSize}
                                        height={c.dotSize}
                                        aria-hidden="true"
                                        style={{ flexShrink: 0 }}
                                    >
                                        {getDotShape(c.dotStyle, c.dotSize, c.dotColor)}
                                    </svg>
                                )}
                                {c.showGuideLine && (
                                    <div style={{ width: '100%', height: '1px', background: c.dotColor, opacity: 0.3 }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div style={{ marginTop: '2rem', padding: '0.75rem', background: '#ecfdf5', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#065f46' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
NoktaRenderer.displayName = 'NoktaRenderer';
