import React, { memo } from 'react';
import type { RendererProps } from '../../registry';
import type { PencereConfig, HeceRow, HeceData } from '../../../../types/sariKitap';

/**
 * Pencere Renderer — Grid Tablo Yapısı
 * Kaynak PDF birebir: her hece bir tablo hücresinde, maskelenen hücreler dolu.
 * Kompakt A4: minimal hücre padding, sayfayı dolduran grid.
 */
export const PencereRenderer = memo(({ config, content }: RendererProps) => {
    if (config.type !== 'pencere') return null;
    const c = config as PencereConfig;

    // Tüm heceleri tek düz dizi olarak al
    const allSyllables: HeceData[] = content.heceRows?.flatMap(r => r.syllables) ?? [];

    // Grid sütun sayısını hecelere göre belirle
    const configCols = (c as any).gridColumns;
    const colCount = configCols === '6' ? 6 : configCols === '8' ? 8 : configCols === '10' ? 10 : (allSyllables.length > 60 ? 10 : allSyllables.length > 40 ? 8 : 6);
    const rowCount = Math.ceil(allSyllables.length / colCount);

    const maskBg = c.maskColor ?? '#1e293b';
    const maskOp = c.maskOpacity ?? 0.6;

    const bStyle = (c as any).borderStyle || 'solid';
    const cellBorder = bStyle === 'none' ? 'none' : 
                      bStyle === 'bold' ? '2px solid #18181b' :
                      bStyle === 'dashed' ? '1px dashed #94a3b8' : '1px solid #94a3b8';

    return (
        <div className="sk-renderer-pencere" style={{
            padding: 0, display: 'flex', flexDirection: 'column', height: '100%'
        }}>
            {/* Başlık */}
            <h2 style={{
                fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem',
                textAlign: 'center', color: '#18181b', textTransform: 'uppercase',
                letterSpacing: '0.12em', borderBottom: '2px solid #18181b',
                paddingBottom: '0.3rem'
            }}>
                {content.title}
            </h2>

            {/* Yönerge */}
            <p style={{
                fontSize: '0.65rem', color: '#64748b', textAlign: 'center',
                marginBottom: '0.4rem', fontStyle: 'italic', lineHeight: 1.3
            }}>
                Sadece açık penceredeki heceleri okuyun. Maskelenmiş bölümleri tahmin etmeyin.
            </p>

            {/* Grid Tablo */}
            <table style={{
                width: '100%', borderCollapse: 'collapse', flex: 1,
                tableLayout: 'fixed', border: bStyle === 'none' ? 'none' : '2px solid #18181b'
            }}>
                <tbody>
                    {Array.from({ length: rowCount }).map((_, ri) => (
                        <tr key={ri}>
                            {Array.from({ length: colCount }).map((_, ci) => {
                                const idx = ri * colCount + ci;
                                const syl = allSyllables[idx];

                                if (!syl) {
                                    return (
                                        <td key={ci} style={{
                                            border: cellBorder,
                                            padding: '0.25rem 0.15rem',
                                            textAlign: 'center',
                                            background: '#f8fafc',
                                            height: '1.6rem'
                                        }} />
                                    );
                                }

                                const isVisible = syl.isHighlighted;

                                return (
                                    <td key={ci} style={{
                                        border: cellBorder,
                                        padding: '0.25rem 0.15rem',
                                        textAlign: 'center',
                                        fontFamily: 'Lexend, sans-serif',
                                        fontSize: '0.85rem',
                                        fontWeight: isVisible ? 600 : 400,
                                        color: isVisible ? '#18181b' : 'transparent',
                                        background: isVisible ? '#ffffff' : maskBg,
                                        opacity: isVisible ? 1 : maskOp,
                                        lineHeight: 1.2,
                                        height: '1.6rem',
                                        transition: 'all 0.1s ease',
                                        userSelect: isVisible ? 'text' : 'none'
                                    }}>
                                        {syl.syllable}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Alt bilgi */}
            <div style={{
                marginTop: 'auto', paddingTop: '0.5rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.6rem', color: '#94a3b8', padding: '0.5rem 0.25rem 0'
            }}>
                <span>Pencere Okuma • {c.difficulty}</span>
                <span>Oogmatik © Sarı Kitap</span>
                <span>1</span>
            </div>
        </div>
    );
});
PencereRenderer.displayName = 'PencereRenderer';
