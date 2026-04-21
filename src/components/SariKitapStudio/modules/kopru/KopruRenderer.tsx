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

    // Görseldeki standartlara göre ölçekleme (Punto: 34px, Yay: 3px kalınlık)
    const fontSizePx = 34; // Büyük ve okunaklı punto
    const bThickness = 3;
    const bColor = c.bridgeColor ?? '#18181b';
    
    // Satır aralığı — görseldeki gibi ferah
    const rowGap = '3.5rem';

    return (
        <div className="sk-renderer-kopru" style={{
            padding: '4rem 3rem', display: 'flex', flexDirection: 'column', height: '100%',
            background: '#fcf096', // Görseldeki sarı kağıt dokusu
            color: '#18181b',
            fontFamily: 'Lexend, sans-serif'
        }}>
            {/* ═══ İÇERİK ═══ */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                gap: rowGap
            }}>
                {content.heceRows.map((row, ri) => {
                    const words = row.syllables || [];
                    if (words.length === 0) return null;

                    return (
                        <div key={ri} style={{ 
                            display: 'flex', 
                            flexDirection: 'row', 
                            alignItems: 'flex-end', 
                            width: '100%' 
                        }}>
                            {words.map((s, si) => (
                                <React.Fragment key={`w-${si}`}>
                                    {/* Kelime veya Hece */}
                                    <div style={{
                                        fontSize: `${fontSizePx}px`,
                                        fontWeight: 400,
                                        lineHeight: '1',
                                        paddingBottom: '4px', // Yükseklik hizalaması için hafif boşluk
                                        whiteSpace: 'pre'
                                    }}>
                                        {s.syllable}
                                    </div>

                                    {/* Köprü (Yay) */}
                                    {si < words.length - 1 && (
                                        <div style={{
                                            flex: 1, // Aradaki boşluğu tamamen esnek şekilde doldur
                                            minWidth: '50px',
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            padding: '0 8px', // Kelimelerden güvenli mesafe
                                            marginBottom: '10px' // Yay biraz daha yukarıda başlasın
                                        }}>
                                            <svg 
                                                width="100%" 
                                                height="26" 
                                                viewBox="0 0 100 26" 
                                                preserveAspectRatio="none" 
                                                style={{ overflow: 'visible', display: 'block' }}
                                            >
                                                <path
                                                    d="M 0,26 Q 50,0 100,26"
                                                    fill="none"
                                                    stroke={bColor}
                                                    strokeWidth={bThickness}
                                                    vectorEffect="non-scaling-stroke"
                                                    strokeLinecap="round"
                                                />
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
                marginTop: 'auto',
                display: 'flex',
                justifyContent: 'center',
                padding: '1rem 0',
                fontSize: '1.25rem',
                color: '#18181b',
                fontWeight: 600,
                opacity: 0.8
            }}>
                3
            </div>
        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';

