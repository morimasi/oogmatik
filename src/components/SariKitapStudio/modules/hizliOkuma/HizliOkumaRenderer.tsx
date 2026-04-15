import React from 'react';
import type { RendererProps } from '../../registry';

export const HizliOkumaRenderer = React.memo(({ config, content }: RendererProps) => {
    if (config.type !== 'hizli_okuma') return null;
    const c = config;

    const blocks = content.wordBlocks ?? [];

    return (
        <div className="sk-renderer-hizli-okuma" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {content.title}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, padding: '0 1rem' }}>
                {blocks.map((row: string[], ri: number) => (
                    <div
                        key={ri}
                        style={{
                            display: 'flex',
                            gap: '2rem',
                            justifyContent: 'center',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            background: c.rhythmicMode && ri % 2 === 1 ? '#f8fafc' : 'transparent',
                            border: c.rhythmicMode && ri % 2 === 1 ? '1px solid #e2e8f0' : '1px solid transparent'
                        }}
                    >
                        {row.map((word: string, wi: number) => (
                            <span key={wi} style={{ 
                                fontWeight: 600, 
                                minWidth: '6rem', 
                                textAlign: 'center', 
                                fontSize: '1.25rem', 
                                color: '#18181b',
                                fontFamily: 'Lexend, sans-serif'
                            }}>
                                {word}
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
HizliOkumaRenderer.displayName = 'HizliOkumaRenderer';
