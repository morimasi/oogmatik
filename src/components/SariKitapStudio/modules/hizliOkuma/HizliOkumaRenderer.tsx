import React from 'react';
import type { RendererProps } from '../../registry';
import type { HizliOkumaConfig } from '../../../../types/sariKitap';

/**
 * Hızlı Okuma Renderer — A4 Tam Dolu Kompakt
 * Sayfayı tamamen dolduracak kelime blokları. Sıkı satır aralığı.
 * Tek/Çift sütun desteği.
 */
export const HizliOkumaRenderer = React.memo(({ config, content }: RendererProps) => {
    if (config.type !== 'hizli_okuma') return null;
    const c = config as HizliOkumaConfig;

    const blocks = content.wordBlocks ?? [];

    // Satır aralığı
    const rowGap = c.lineSpacing === 'sıkı' ? '0.05rem' : c.lineSpacing === 'geniş' ? '0.35rem' : '0.15rem';
    const rowPadding = c.lineSpacing === 'sıkı' ? '0.25rem 0.5rem' : c.lineSpacing === 'geniş' ? '0.6rem 0.5rem' : '0.4rem 0.5rem';
    const baseFontSize = c.lineSpacing === 'sıkı' ? '0.9rem' : '1rem';

    // Çift sütun modu
    const isTwoCol = c.columnMode === 'cift';
    const midPoint = isTwoCol ? Math.ceil(blocks.length / 2) : blocks.length;
    const col1 = blocks.slice(0, midPoint);
    const col2 = isTwoCol ? blocks.slice(midPoint) : [];

    const renderColumn = (columnBlocks: string[][], startIndex: number) => (
        <div style={{
            display: 'flex', flexDirection: 'column', gap: rowGap, flex: 1
        }}>
            {columnBlocks.map((row: string[], ri: number) => {
                const globalIndex = startIndex + ri;
                const isZebra = c.rhythmicMode && globalIndex % 2 === 1;
                return (
                    <div
                        key={ri}
                        style={{
                            display: 'flex',
                            gap: '1rem',
                            justifyContent: 'center',
                            padding: rowPadding,
                            borderRadius: '0.2rem',
                            background: isZebra ? '#f1f5f9' : 'transparent',
                            borderLeft: isZebra ? '3px solid #cbd5e1' : '3px solid transparent',
                            alignItems: 'center',
                            minHeight: '1.4rem'
                        }}
                    >
                        {/* Satır numarası */}
                        <span style={{
                            fontSize: '0.55rem', color: '#94a3b8', fontWeight: 700,
                            minWidth: '1.2rem', textAlign: 'right', fontFamily: 'Inter, sans-serif'
                        }}>
                            {globalIndex + 1}
                        </span>
                        {row.map((word: string, wi: number) => (
                            <span key={wi} style={{
                                fontWeight: 600,
                                minWidth: isTwoCol ? '3.5rem' : '5rem',
                                textAlign: 'center',
                                fontSize: baseFontSize,
                                color: '#18181b',
                                fontFamily: 'Lexend, sans-serif',
                                letterSpacing: '0.01em'
                            }}>
                                {word}
                            </span>
                        ))}
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className="sk-renderer-hizli-okuma" style={{
            padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%'
        }}>
            {/* Başlık */}
            <h2 style={{
                fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.3rem',
                textAlign: 'center', color: '#18181b', textTransform: 'uppercase',
                letterSpacing: '0.12em', borderBottom: '2px solid #18181b',
                paddingBottom: '0.3rem'
            }}>
                {content.title}
            </h2>

            {/* Yönerge */}
            <p style={{
                fontSize: '0.6rem', color: '#64748b', textAlign: 'center',
                marginBottom: '0.3rem', fontStyle: 'italic', lineHeight: 1.2
            }}>
                Satır satır ilerleyerek kelimeleri olabildiğince hızlı okuyun.
            </p>

            {/* İçerik */}
            <div style={{
                flex: 1, display: 'flex', gap: '0.5rem',
                ...(isTwoCol ? { borderRight: 'none' } : {})
            }}>
                {renderColumn(col1, 0)}
                {isTwoCol && (
                    <>
                        <div style={{ width: '1px', background: '#e2e8f0', flexShrink: 0 }} />
                        {renderColumn(col2, midPoint)}
                    </>
                )}
            </div>

            {/* Alt bilgi */}
            <div style={{
                marginTop: 'auto', paddingTop: '0.3rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.6rem', color: '#94a3b8', padding: '0.3rem 0.25rem 0'
            }}>
                <span>Hızlı Okuma • {c.difficulty} • {blocks.length} satır</span>
                <span>© BursaDisleksi Hızlı Okuma Stüdyosu</span>
                <span>{config.pageNumber}</span>
            </div>
        </div>
    );
});
HizliOkumaRenderer.displayName = 'HizliOkumaRenderer';
