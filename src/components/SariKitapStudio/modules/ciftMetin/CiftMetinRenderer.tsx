import React from 'react';
import type { RendererProps } from '../../registry';
import type { CiftMetinConfig } from '../../../../types/sariKitap';

export const CiftMetinRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
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

    const linesA = src.a.text.split(/[.!?]+/).filter((s) => s.trim()).map((s) => s.trim() + '.');
    const linesB = src.b.text.split(/[.!?]+/).filter((s) => s.trim()).map((s) => s.trim() + '.');
    const maxLen = Math.max(linesA.length, linesB.length);
    const interleavedLines: Array<{ text: string; source: 'a' | 'b' }> = [];

    for (let i = 0; i < maxLen; i++) {
        if (i < linesA.length) interleavedLines.push({ text: linesA[i], source: 'a' });
        if (i < linesB.length) interleavedLines.push({ text: linesB[i], source: 'b' });
    }

    return (
        <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', textAlign: 'center' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '1rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            {c.showSourceLabels && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                    <span style={{ color: c.sourceAColor, ...getStyle(c.sourceAStyle), fontSize: '0.75rem' }}>
                        ■ {src.a.title}
                    </span>
                    <span style={{ color: c.sourceBColor, ...getStyle(c.sourceBStyle), fontSize: '0.75rem' }}>
                        ■ {src.b.title}
                    </span>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {interleavedLines.map((line, i) => (
                    <p
                        key={i}
                        aria-label={line.source === 'a' ? src.a.title : src.b.title}
                        style={{
                            color: line.source === 'a' ? c.sourceAColor : c.sourceBColor,
                            ...getStyle(line.source === 'a' ? c.sourceAStyle : c.sourceBStyle),
                            margin: 0,
                        }}
                    >
                        {line.text}
                    </p>
                ))}
            </div>

            <div style={{ marginTop: '2rem', padding: '0.75rem', background: '#fffbeb', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#92400e' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
CiftMetinRenderer.displayName = 'CiftMetinRenderer';
