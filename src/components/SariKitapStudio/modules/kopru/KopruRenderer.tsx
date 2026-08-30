import React, { useMemo } from 'react';
import type { RendererProps } from '../../registry';
import type { KopruConfig } from '../../../../types/sariKitap';
import { metniKelimele, metniHecele } from '../../../../utils/heceAyirici';

/**
 * Köprü Renderer — Kaynak PDF Standartlarında (Gökkuşağı Yay Modeli)
 * Görseldeki gibi: kalın yaylar, büyük punto, geniş boşluklar ve noktalama uyumu.
 */
export const KopruRenderer: React.FC<RendererProps> = React.memo(({ config, content }) => {
    if (config.type !== 'kopru') return null;
    const c = config as KopruConfig;

    // Ayarların anında etki etmesi için rawText'ten dinamik heceleme/kelimeleme yapıyoruz
    const displayRows = useMemo(() => {
        if (content.rawText) {
            return c.bridgePlacement === 'hece' ? metniHecele(content.rawText) : metniKelimele(content.rawText);
        }
        return content.heceRows;
    }, [content.rawText, content.heceRows, c.bridgePlacement]);

    // Görseldeki standartlara göre ölçekleme (Punto: Dinamik, Yay: 3px kalınlık)
    const fontSizePx = (c.typography.fontSize || 22) * 1.5; // pt to px conversion factor
    const bThickness = c.bridgeThickness ?? 3;
    const bColor = c.bridgeColor ?? '#18181b';
    const bridgeStyle = c.bridgeStyle || 'yay';

    // Satır aralığı — görseldeki gibi ferah
    const rowGap = '4rem';

    const bHeight = c.bridgeHeight ?? 18;

    const renderBridge = () => {
        if (bridgeStyle === 'düz') {
            return (
                <svg width="100%" height={bHeight} viewBox={`0 0 100 ${bHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <line x1="0" y1={bHeight - 2} x2="100" y2={bHeight - 2} stroke={bColor} strokeWidth={bThickness} vectorEffect="non-scaling-stroke" />
                </svg>
            );
        } else if (bridgeStyle === 'noktalı') {
            return (
                <svg width="100%" height={bHeight} viewBox={`0 0 100 ${bHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <path d={`M 0,${bHeight - 2} Q 50,2 100,${bHeight - 2}`} fill="none" stroke={bColor} strokeWidth={bThickness} strokeDasharray="4,4" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                </svg>
            );
        } else {
            // Varsayılan kavisli üst yarım yay stili (M 0,h Q 50,0 100,h - Gerçek Köprü Kemeri)
            return (
                <svg width="100%" height={bHeight} viewBox={`0 0 100 ${bHeight}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                    <path d={`M 0,${bHeight - 2} Q 50,2 100,${bHeight - 2}`} fill="none" stroke={bColor} strokeWidth={bThickness} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                </svg>
            );
        }
    };

    // Karakter sayısını piksel genişliğine dönüştürme (örneğin 2 karakter ~ 32px, 3 karakter ~ 48px, 4 karakter ~ 64px)
    const bWidthPx = Math.max(24, (c.bridgeWidth ?? 3) * 16);

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
                {/* Dinamik oluşturulan satırlar */}
                {(displayRows || []).map((row, ri) => {
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
                            {words.map((s, si) => {
                                if (!s || s.syllable.trim() === '') return null;
                                return (
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
                                                width: `${bWidthPx}px`,
                                                height: `${bHeight}px`,
                                                display: 'flex',
                                                alignItems: 'flex-end',
                                                padding: '0 2px',
                                                marginBottom: '4px',
                                                flexShrink: 0
                                            }}>
                                                {renderBridge()}
                                            </div>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </div>
                    );
                })}
            </div>

        </div>
    );
});
KopruRenderer.displayName = 'KopruRenderer';



