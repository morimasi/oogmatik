import React from 'react';
import type { RendererProps } from '../../registry';

export const HizliOkumaRenderer = React.memo(({ config, content }: RendererProps) => {
    if (config.type !== 'hizli_okuma') return null;
    const c = config;

    const blocks = content.wordBlocks ?? [];

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1.5rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {blocks.map((row: string[], ri: number) => (
                    <div
                        key={ri}
                        style={{
                            display: 'flex',
                            gap: '1.5rem',
                            justifyContent: 'center',
                            padding: '0.5rem 1rem',
                            borderRadius: '0.375rem',
                            background: c.rhythmicMode && ri % 2 === 1 ? '#f4f4f5' : 'transparent',
                        }}
                    >
                        {row.map((word: string, wi: number) => (
                            <span key={wi} style={{ fontWeight: 600, minWidth: '4rem', textAlign: 'center' }}>
                                {word}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '0.75rem', background: '#ecfeff', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#155e75' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
HizliOkumaRenderer.displayName = 'HizliOkumaRenderer';
