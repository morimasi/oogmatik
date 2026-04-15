import React, { memo } from 'react';
import type { RendererProps } from '../../registry';
import type { PencereConfig, HeceRow, HeceData } from '../../../../types/sariKitap';

export const PencereRenderer = memo(({ config, content }: RendererProps) => {
    if (config.type !== 'pencere') return null;
    const c = config as PencereConfig;

    return (
        <div className="sk-renderer-pencere" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {content.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, padding: '0 1rem' }}>
                {content.heceRows?.map((row: HeceRow, ri: number) => (
                    <div
                        key={ri}
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            columnGap: '0.5rem',
                            rowGap: '0.75rem',
                            alignItems: 'baseline',
                            justifyContent: 'space-between'
                        }}
                    >
                        {row.syllables.map((s: HeceData, si: number) => (
                            <span
                                key={si}
                                role="text"
                                style={{
                                    display: 'inline-block',
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '0.25rem',
                                    background: s.isHighlighted ? 'transparent' : '#f1f5f9',
                                    color: s.isHighlighted ? '#18181b' : '#f1f5f9',
                                    fontSize: '1.25rem',
                                    fontWeight: 500,
                                    fontFamily: 'Lexend, sans-serif',
                                    lineHeight: 1.2,
                                }}
                                aria-hidden={!s.isHighlighted}
                            >
                                {s.syllable}
                            </span>
                        ))}
                    </div>
                ))}
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
                1
            </div>
        </div>
    );
});
PencereRenderer.displayName = 'PencereRenderer';
