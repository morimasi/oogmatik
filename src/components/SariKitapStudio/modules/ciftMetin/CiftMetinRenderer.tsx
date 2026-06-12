import React, { memo, useMemo } from 'react';
import type { RendererProps } from '../../registry';
import type { CiftMetinConfig } from '../../../../types/sariKitap';

export const CiftMetinRenderer = memo(({ config, content }: RendererProps) => {
    if (config.type !== 'cift_metin') return null;
    const c = config as CiftMetinConfig;
    const src = content.sourceTexts;

    if (!src) {
        return (
            <div style={{ textAlign: 'center', padding: '10rem 2rem', color: '#9ca3af', fontFamily: 'Lexend, sans-serif' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#374151' }}>Çift metin verisi bulunamadı.</h3>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Lütfen tekrar üretmeyi deneyin.</p>
            </div>
        );
    }

    const interleaveRatio = c.interleaveRatio || 1;
    const mode = c.interleaveMode || 'kelime';
    const colorA = c.sourceAColor || '#1e293b';
    const colorB = c.sourceBColor || '#ef4444';

    const interleavedElements = useMemo(() => {
        const textA = src.a?.text || '';
        const textB = src.b?.text || '';

        const splitText = (text: string, m: string) => {
            if (m === 'paragraf') return text.split(/\n\n+/).filter(p => p.trim().length > 0);
            if (m === 'satir') return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0); // Cümle/satır bazlı
            return text.split(/\s+/).filter(w => w.length > 0);
        };

        const elementsA = splitText(textA, mode);
        const elementsB = splitText(textB, mode);
        
        const result: Array<{ text: string; source: 'a' | 'b' }> = [];
        let i = 0, j = 0;
        
        while (i < elementsA.length || j < elementsB.length) {
            for (let r = 0; r < interleaveRatio && i < elementsA.length; r++) {
                result.push({ text: elementsA[i++], source: 'a' });
            }
            for (let r = 0; r < interleaveRatio && j < elementsB.length; r++) {
                result.push({ text: elementsB[j++], source: 'b' });
            }
        }
        return result;
    }, [src.a?.text, src.b?.text, mode, interleaveRatio]);

    const getStyleForSource = (source: 'a' | 'b') => {
        const styleSetting = source === 'a' ? c.sourceAStyle : c.sourceBStyle;
        const color = source === 'a' ? colorA : colorB;
        
        return {
            color,
            fontWeight: styleSetting === 'bold' ? 700 : 500,
            fontStyle: styleSetting === 'italic' ? 'italic' : 'normal',
            fontSize: '1.4rem',
            lineHeight: 1.5,
            display: mode === 'paragraf' ? 'block' : 'inline',
            marginBottom: mode === 'paragraf' ? '1rem' : 0
        };
    };

    return (
        <div className="sk-renderer-cift-metin" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '1.5rem', fontFamily: 'Lexend, sans-serif' }}>
            {/* Başlıklar */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', marginBottom: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 900, color: '#94a3b8', letterSpacing: '0.1em' }}>KAYNAK A</span>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: colorA, textTransform: 'uppercase' }}>{src.a.title}</h2>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '0.6rem', fontWeight: 900, color: '#fca5a5', letterSpacing: '0.1em' }}>KAYNAK B</span>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: colorB, textTransform: 'uppercase' }}>{src.b.title}</h2>
                </div>
            </div>

            {/* Harmanlanmış Metin Alani */}
            <div style={{ 
                display: mode === 'paragraf' ? 'block' : 'flex', 
                flexWrap: 'wrap', 
                columnGap: '0.75rem', 
                rowGap: '1.25rem', 
                padding: '1.5rem',
                backgroundColor: '#fafafa',
                borderRadius: '1.5rem',
                border: '1px dashed #e5e7eb',
                alignContent: 'flex-start'
            }}>
                {interleavedElements.map((el, i) => (
                    <span key={i} style={getStyleForSource(el.source)}>
                        {el.text}{mode === 'satir' && ' '}
                    </span>
                ))}
            </div>

            {/* 5N1K SORULARI BÖLÜMÜ */}
            <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                {/* Metin A Sorulari */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 900, color: colorA, borderBottom: `${colorA}40 2px solid`, paddingBottom: '0.5rem', textTransform: 'uppercase' }}>
                        {c.showSourceLabels ? `(${src.a.title})` : ''} Okuduğunu Anlama
                    </h4>
                    {src.a.questions?.map((q, idx) => (
                        <div key={idx} style={{ marginBottom: '0.5rem' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1e293b', marginBottom: '0.5rem' }}>
                                {idx + 1}. {q.q}
                            </p>
                            <div style={{ borderBottom: '1px dotted #cbd5e1', height: '1.5rem', width: '100%' }}></div>
                            <div style={{ borderBottom: '1px dotted #cbd5e1', height: '1.5rem', width: '100%', marginTop: '0.25rem' }}></div>
                        </div>
                    ))}
                    {(!src.a.questions || src.a.questions.length === 0) && (
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>Bu metin için soru üretilmedi.</p>
                    )}
                </div>

                {/* Metin B Sorulari */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 900, color: colorB, borderBottom: `${colorB}40 2px solid`, paddingBottom: '0.5rem', textTransform: 'uppercase' }}>
                        {c.showSourceLabels ? `(${src.b.title})` : ''} Okuduğunu Anlama
                    </h4>
                    {src.b.questions?.map((q, idx) => (
                        <div key={idx} style={{ marginBottom: '0.5rem' }}>
                            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1e293b', marginBottom: '0.5rem' }}>
                                {idx + 1}. {q.q}
                            </p>
                            <div style={{ borderBottom: '1px dotted #cbd5e1', height: '1.5rem', width: '100%' }}></div>
                            <div style={{ borderBottom: '1px dotted #cbd5e1', height: '1.5rem', width: '100%', marginTop: '0.25rem' }}></div>
                        </div>
                    ))}
                    {(!src.b.questions || src.b.questions.length === 0) && (
                        <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>Bu metin için soru üretilmedi.</p>
                    )}
                </div>
            </div>

            {/* Sayfa Numarası */}
         </div>
     );
 });
CiftMetinRenderer.displayName = 'CiftMetinRenderer';
