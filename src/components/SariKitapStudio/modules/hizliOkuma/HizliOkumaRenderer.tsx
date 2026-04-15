import React from 'react';
import type { RendererProps } from '../../registry';

export const HizliOkumaRenderer = React.memo(({ config, content }: RendererProps) => {
    if (config.type !== 'hizli_okuma') return null;
    const c = config;

    const blocks = content.wordBlocks ?? [];

    return (
        <div className="sk-renderer-hizli-okuma">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', color: '#18181b' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.6875rem', color: '#4b5563', marginBottom: '1rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                {blocks.map((row: string[], ri: number) => (
                    <div
                        key={ri}
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            padding: '0.375rem 0.75rem',
                            borderRadius: '0.25rem',
                            background: c.rhythmicMode && ri % 2 === 1 ? '#f4f4f5' : 'transparent',
                        }}
                    >
                        {row.map((word: string, wi: number) => (
                            <span key={wi} style={{ fontWeight: 600, minWidth: '3.5rem', textAlign: 'center', fontSize: '1rem' }}>
                                {word}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '0.5rem 0.75rem', borderLeft: '3px solid #06b6d4', background: '#ecfeff', fontSize: '0.6875rem', color: '#155e75' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
HizliOkumaRenderer.displayName = 'HizliOkumaRenderer';
