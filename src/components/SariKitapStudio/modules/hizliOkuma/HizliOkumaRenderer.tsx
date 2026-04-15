import React from 'react';
import type { RendererProps } from '../../registry';

export const HizliOkumaRenderer = React.memo(({ config, content }: RendererProps) => {
    if (config.type !== 'hizli_okuma') return null;
    const c = config;

    const blocks = content.wordBlocks ?? [];

    return (
        <div className="sk-renderer-hizli-okuma" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#3f3f46', marginBottom: '0.75rem', fontWeight: 500, textAlign: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.5rem' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', flex: 1 }}>
                {blocks.map((row: string[], ri: number) => (
                    <div
                        key={ri}
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            padding: '0.5rem 0.75rem',
                            borderRadius: '0.375rem',
                            background: c.rhythmicMode && ri % 2 === 1 ? '#f8fafc' : 'transparent',
                            border: c.rhythmicMode && ri % 2 === 1 ? '1px solid #e2e8f0' : '1px solid transparent'
                        }}
                    >
                        {row.map((word: string, wi: number) => (
                            <span key={wi} style={{ fontWeight: 700, minWidth: '4.5rem', textAlign: 'center', fontSize: '1.125rem', color: '#1e293b' }}>
                                {word}
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '2px solid #06b6d4', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ background: '#06b6d4', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Pedagojik Not
                </div>
                <div style={{ fontSize: '0.7rem', color: '#155e75', fontStyle: 'italic', flex: 1 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
});
HizliOkumaRenderer.displayName = 'HizliOkumaRenderer';
