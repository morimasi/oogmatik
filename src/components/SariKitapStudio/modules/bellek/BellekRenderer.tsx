import React from 'react';
import type { RendererProps } from '../../registry';
import type { BellekConfig } from '../../../../types/sariKitap';

const BLOCK_SIZES: Record<string, { padding: string; fontSize: string }> = {
    küçük: { padding: '0.375rem 0.625rem', fontSize: '0.75rem' },
    orta: { padding: '0.625rem 1rem', fontSize: '0.875rem' },
    büyük: { padding: '0.875rem 1.25rem', fontSize: '1rem' },
};

export const BellekRenderer = React.memo(({ config, content }: RendererProps) => {
    if (config.type !== 'bellek') return null;
    const c = config as BellekConfig;
    const sizeStyle = BLOCK_SIZES[c.blockSize] ?? BLOCK_SIZES['orta'];

    const blocks = content.wordBlocks ?? [];

    return (
        <div className="sk-renderer-bellek" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#3f3f46', marginBottom: '0.75rem', fontWeight: 500, textAlign: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.5rem' }}>
                {content.instructions}
            </p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${c.gridColumns}, 1fr)`,
                    gap: '0.5rem',
                    flex: 1
                }}
            >
                {blocks.flat().map((word: string, i: number) => (
                    <div
                        key={i}
                        style={{
                            border: '2px solid #d4d4d8',
                            borderRadius: '0.5rem',
                            padding: sizeStyle.padding,
                            fontSize: '1.125rem',
                            textAlign: 'center',
                            fontWeight: 700,
                            position: 'relative',
                            minHeight: '3.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f8fafc'
                        }}
                    >
                        {c.showNumbers && (
                            <span style={{ position: 'absolute', top: '0.25rem', left: '0.375rem', fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8' }}>
                                {i + 1}
                            </span>
                        )}
                        {word}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '2px solid #ef4444', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ background: '#ef4444', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Pedagojik Not
                </div>
                <div style={{ fontSize: '0.7rem', color: '#991b1b', fontStyle: 'italic', flex: 1 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
});
BellekRenderer.displayName = 'BellekRenderer';
