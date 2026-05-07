import React from 'react';
import type { RendererProps } from '../../registry';
import type { KopruConfig } from '../../../../types/sariKitap';

/**
 * Köprü Renderer — Kaynak PDF Standartlarında (Gökkuşağı Yay Modeli)
 * Görseldeki gibi: kalın yaylar, büyük punto, geniş boşluklar ve noktalama uyumu.
 */
export const KopruRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
    if (config.type !== 'kopru') return null;
    const c = config as KopruConfig;

    // Görseldeki standartlara göre ölçekleme (Punto: Dinamik, Yay: 3px kalınlık)
    const fontSizePx = (c.typography.fontSize || 22) * 1.5; // pt to px conversion factor
    const bThickness = 3;
    const bColor = c.bridgeColor ?? '#18181b';
    
    // Satır aralığı — görseldeki gibi ferah
    const rowGap = '4rem';

    return (
        <div className="sk-renderer-kopru" style={{
            padding: '2rem 1rem 4rem 1rem', 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%',
            height: '100%',
            color: '#18181b',
            fontFamily: 'Lexend, sans-serif',
            boxSizing: 'border-box',
            position: 'relative',
        }}>
            {/* ═══ İÇERİK ═══ */}
            <div style={{
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column',
                gap: rowGap,
                zIndex: 1
            }}>
                {/* 1. Senaryo: AI 'words' dizisi gelirse */}
                {content.words && (
                    <div style={{ 
                        display: 'flex', 
                        flexDirection: 'row', 
                        flexWrap: 'wrap', 
                        alignItems: 'flex-end', 
                        width: '100%',
                        rowGap: '3rem',
                        columnGap: '0.2rem'
                    }}>
                        {content.words.map((w, wi) => (
                            <React.Fragment key={`ai-w-${wi}`}>
                                <div style={{
                                    fontSize: `${fontSizePx}px`,
                                    fontWeight: 400,
                                    lineHeight: '1.2',
                                    paddingBottom: '2px', 
                                    whiteSpace: 'nowrap'
                                }}>
                                    {w.word}
                                </div>

                                {wi < content.words!.length - 1 && (
                                    <div style={{
                                        width: '40px',
                                        display: 'flex',
                                        alignItems: 'flex-end',
                                        padding: '0 4px', 
                                        marginBottom: '6px' 
                                    }}>
                                        <svg width="100%" height="20" viewBox="0 0 100 24" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                            <path d="M 0,24 Q 50,0 100,24" fill="none" stroke={bColor} strokeWidth={bThickness} strokeLinecap="round" />
                                        </svg>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {/* 2. Senaryo: Geleneksel 'heceRows' gelirse */}
                {!content.words && (content.heceRows || []).map((row, ri) => {
                    const words = row.syllables || [];
                    if (words.length === 0) return null;

                    return (
                        <div key={ri} style={{ 
                            display: 'flex', 
                            flexDirection: 'row', 
                            flexWrap: 'wrap', 
                            alignItems: 'flex-end', 
                            width: '100%',
                            rowGap: '2.5rem' 
                        }}>
                            {words.map((s, si) => (
                                <React.Fragment key={`w-${si}`}>
                                    <div style={{
                                        fontSize: `${fontSizePx}px`,
                                        fontWeight: 400,
                                        lineHeight: '1.2',
                                        paddingBottom: '2px', 
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {s.syllable}
                                    </div>

                                    {si < words.length - 1 && (
                                        <div style={{
                                            width: '50px',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            padding: '0 4px', 
                                            marginBottom: '8px' 
                                        }}>
                                            <svg width="100%" height="24" viewBox="0 0 100 24" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                                                <path d="M 0,24 Q 50,0 100,24" fill="none" stroke={bColor} strokeWidth={bThickness} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* ═══ SAYFA ALTI (Sayfa Numarası Standartı) ═══ */}
            <div style={{
                position: 'absolute',
                bottom: '2rem',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: '#18181b',
                fontWeight: 600,
                opacity: 0.8
            }}>
                {config.pageNumber}
            </div>
        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';



