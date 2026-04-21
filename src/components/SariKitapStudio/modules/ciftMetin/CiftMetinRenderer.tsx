import React, { memo } from 'react';
import type { RendererProps } from '../../registry';
import type { CiftMetinConfig } from '../../../../types/sariKitap';

export const CiftMetinRenderer = memo(({ config, content }: RendererProps) => {
    if (config.type !== 'cift_metin') return null;
    const c = config as CiftMetinConfig;
    const src = content.sourceTexts;

    const getStyle = (style: 'bold' | 'normal' | 'italic'): React.CSSProperties => ({
        fontWeight: style === 'bold' ? 700 : 400,
        fontStyle: style === 'italic' ? 'italic' : 'normal',
    });

    if (!src) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                Çift metin verisi bulunamadı.
            </div>
        );
    }

    const wordsA = (src.a?.text || '').split(/\s+/).filter(w => w.length > 0);
    const wordsB = (src.b?.text || '').split(/\s+/).filter(w => w.length > 0);
    
    const interleavedWords: Array<{ text: string; source: 'a' | 'b' }> = [];
    const maxWords = Math.max(wordsA.length, wordsB.length);

    for (let i = 0; i < maxWords; i++) {
        if (i < wordsA.length) interleavedWords.push({ text: wordsA[i], source: 'a' });
        if (i < wordsB.length) interleavedWords.push({ text: wordsB[i], source: 'b' });
    }

    return (
        <div className="sk-renderer-cift-metin" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            {/* Başlıklar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#18181b', textTransform: 'uppercase' }}>
                    {src.a.title}
                </h2>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase' }}>
                    {src.b.title}
                </h2>
            </div>

            <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                columnGap: '0.75rem', 
                rowGap: '1.25rem', 
                flex: 1,
                padding: '0 1rem',
                alignContent: 'flex-start'
            }}>
                {interleavedWords.map((word, i) => (
                    <span
                        key={i}
                        style={{
                            color: word.source === 'a' ? '#18181b' : '#ef4444',
                            fontSize: '1.5rem',
                            fontWeight: 500,
                            fontFamily: 'Lexend, sans-serif',
                            lineHeight: 1.4
                        }}
                    >
                        {word.text}
                    </span>
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
                {config.pageNumber}
            </div>
        </div>
    );
});
CiftMetinRenderer.displayName = 'CiftMetinRenderer';
