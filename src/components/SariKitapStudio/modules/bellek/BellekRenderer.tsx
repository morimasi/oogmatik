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
        <div className="sk-renderer-bellek" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {content.title}
            </h2>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${c.gridColumns}, 1fr)`,
                    gap: '1rem',
                    flex: 1,
                    padding: '0 1rem'
                }}
            >
                {blocks.flat().map((word: string, i: number) => (
                    <div
                        key={i}
                        style={{
                            border: '1.5px solid #18181b',
                            borderRadius: '0.5rem',
                            padding: '1.25rem',
                            fontSize: '1.25rem',
                            textAlign: 'center',
                            fontWeight: 600,
                            position: 'relative',
                            minHeight: '4.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white',
                            fontFamily: 'Lexend, sans-serif'
                        }}
                    >
                        {c.showNumbers && (
                            <span style={{ position: 'absolute', top: '0.375rem', left: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#18181b' }}>
                                {i + 1}
                            </span>
                        )}
                        {word}
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
BellekRenderer.displayName = 'BellekRenderer';
