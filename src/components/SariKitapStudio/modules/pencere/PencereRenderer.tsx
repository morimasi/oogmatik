import React from 'react';
import type { RendererProps } from '../../registry';
import type { PencereConfig } from '../../../../types/sariKitap';

export const PencereRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
    if (config.type !== 'pencere') return null;
    const c = config as PencereConfig;

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1.5rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            {content.heceRows.map((row, ri) => (
                <div
                    key={ri}
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem',
                        marginBottom: '0.75rem',
                        alignItems: 'baseline',
                    }}
                >
                    {row.syllables.map((s, si) => (
                        <span
                            key={si}
                            role="text"
                            style={{
                                display: 'inline-block',
                                padding: '0.15rem 0.35rem',
                                borderRadius: '0.25rem',
                                background: s.isHighlighted ? 'transparent' : c.maskColor,
                                color: s.isHighlighted ? 'inherit' : c.maskColor,
                                opacity: s.isHighlighted ? 1 : c.maskOpacity,
                                transition: 'all 0.3s ease',
                            }}
                            aria-hidden={!s.isHighlighted}
                        >
                            {s.syllable}
                        </span>
                    ))}
                </div>
            ))}

            <div style={{ marginTop: '2rem', padding: '0.75rem', background: '#fef9c3', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#854d0e' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
PencereRenderer.displayName = 'PencereRenderer';
