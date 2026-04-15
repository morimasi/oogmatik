import React, { memo } from 'react';
import type { RendererProps } from '../../registry';
import type { PencereConfig, HeceRow, HeceData } from '../../../../types/sariKitap';

export const PencereRenderer = memo(({ config, content }: RendererProps) => {
    if (config.type !== 'pencere') return null;
    const c = config as PencereConfig;

    return (
        <div className="sk-renderer-pencere" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#3f3f46', marginBottom: '0.75rem', fontWeight: 500, textAlign: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.5rem' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
                {content.heceRows?.map((row: HeceRow, ri: number) => (
                    <div
                        key={ri}
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            columnGap: '0.125rem',
                            rowGap: '0.125rem',
                            alignItems: 'baseline',
                            padding: '0.05rem 0',
                        }}
                    >
                        {row.syllables.map((s: HeceData, si: number) => (
                            <span
                                key={si}
                                role="text"
                                style={{
                                    display: 'inline-block',
                                    padding: '0.05rem 0.2rem',
                                    borderRadius: '0.125rem',
                                    background: s.isHighlighted ? 'transparent' : c.maskColor,
                                    color: s.isHighlighted ? 'inherit' : c.maskColor,
                                    opacity: s.isHighlighted ? 1 : c.maskOpacity,
                                    fontSize: '1.125rem',
                                    fontWeight: 600,
                                    transition: 'all 0.3s ease',
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

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '2px solid #3b82f6', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ background: '#3b82f6', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Pedagojik Not
                </div>
                <div style={{ fontSize: '0.7rem', color: '#1e40af', fontStyle: 'italic', flex: 1 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
});
PencereRenderer.displayName = 'PencereRenderer';
