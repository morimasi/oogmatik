import React from 'react';
import type { RendererProps } from '../../registry';
import type { PencereConfig, HeceRow, HeceData } from '../../../../types/sariKitap';

export const PencereRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
    if (config.type !== 'pencere') return null;
    const c = config as PencereConfig;

    return (
        <div className="sk-renderer-pencere">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', color: '#18181b' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.6875rem', color: '#4b5563', marginBottom: '1rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {content.heceRows?.map((row: HeceRow, ri: number) => (
                    <div
                        key={ri}
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            columnGap: '0.125rem',
                            rowGap: '0.25rem',
                            alignItems: 'baseline',
                        }}
                    >
                        {row.syllables.map((s: HeceData, si: number) => (
                            <span
                                key={si}
                                role="text"
                                style={{
                                    display: 'inline-block',
                                    padding: '0.1rem 0.25rem',
                                    borderRadius: '0.15rem',
                                    background: s.isHighlighted ? 'transparent' : c.maskColor,
                                    color: s.isHighlighted ? 'inherit' : c.maskColor,
                                    opacity: s.isHighlighted ? 1 : c.maskOpacity,
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    transition: 'all 0.3s ease',
                                }}
                                aria-hidden={!s.isHighlighted}
                            >
                                {s.syllable}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '0.5rem 0.75rem', borderLeft: '3px solid #3b82f6', background: '#eff6ff', fontSize: '0.6875rem', color: '#1e40af' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
PencereRenderer.displayName = 'PencereRenderer';
