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

    const linesA = src.a.text.split(/[.!?]+/).filter((s: string) => s.trim()).map((s: string) => s.trim() + '.');
    const linesB = src.b.text.split(/[.!?]+/).filter((s: string) => s.trim()).map((s: string) => s.trim() + '.');
    const interleavedLines: Array<{ text: string; source: 'a' | 'b' }> = [];

    const ratio = c.interleaveRatio || 1;
    let iA = 0;
    let iB = 0;

    while (iA < linesA.length || iB < linesB.length) {
        // Source A'dan ratio kadar ekle
        for (let r = 0; r < ratio && iA < linesA.length; r++) {
            interleavedLines.push({ text: linesA[iA++], source: 'a' });
        }
        // Source B'den ratio kadar ekle
        for (let r = 0; r < ratio && iB < linesB.length; r++) {
            interleavedLines.push({ text: linesB[iB++], source: 'b' });
        }
    }

    return (
        <div className="sk-renderer-cift-metin" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#3f3f46', marginBottom: '0.75rem', fontWeight: 500, textAlign: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.5rem' }}>
                {content.instructions}
            </p>

            {c.showSourceLabels && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: c.sourceAColor }}></div>
                        <span style={{ color: '#3f3f46', ...getStyle(c.sourceAStyle), fontSize: '0.7rem', fontWeight: 700 }}>
                            {src.a.title}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <div style={{ width: '0.75rem', height: '0.75rem', borderRadius: '50%', background: c.sourceBColor }}></div>
                        <span style={{ color: '#3f3f46', ...getStyle(c.sourceBStyle), fontSize: '0.7rem', fontWeight: 700 }}>
                            {src.b.title}
                        </span>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                {interleavedLines.map((line: { text: string; source: 'a' | 'b' }, i: number) => (
                    <p
                        key={i}
                        aria-label={line.source === 'a' ? src.a.title : src.b.title}
                        style={{
                            color: line.source === 'a' ? c.sourceAColor : c.sourceBColor,
                            ...getStyle(line.source === 'a' ? c.sourceAStyle : c.sourceBStyle),
                            margin: 0,
                            fontSize: '1.125rem',
                            lineHeight: 1.3,
                            padding: '0.125rem 0'
                        }}
                    >
                        {line.text}
                    </p>
                ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '2px solid #f59e0b', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ background: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Pedagojik Not
                </div>
                <div style={{ fontSize: '0.7rem', color: '#92400e', fontStyle: 'italic', flex: 1 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
});
CiftMetinRenderer.displayName = 'CiftMetinRenderer';
