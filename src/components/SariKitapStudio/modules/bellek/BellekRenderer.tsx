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
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1.5rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${c.gridColumns}, 1fr)`,
                    gap: '0.5rem',
                }}
            >
                {blocks.flat().map((word: string, i: number) => (
                    <div
                        key={i}
                        style={{
                            border: '1.5px solid #d4d4d8',
                            borderRadius: '0.5rem',
                            padding: sizeStyle.padding,
                            fontSize: sizeStyle.fontSize,
                            textAlign: 'center',
                            fontWeight: 600,
                            position: 'relative',
                        }}
                    >
                        {c.showNumbers && (
                            <span style={{ position: 'absolute', top: '0.125rem', left: '0.25rem', fontSize: '0.5rem', color: '#a1a1aa' }}>
                                {i + 1}
                            </span>
                        )}
                        {word}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '0.75rem', background: '#fef2f2', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#991b1b' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
BellekRenderer.displayName = 'BellekRenderer';
