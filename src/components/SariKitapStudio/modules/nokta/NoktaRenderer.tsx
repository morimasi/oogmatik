import { memo } from 'react';
import type { RendererProps } from '../../registry';
import type { NoktaConfig } from '../../../../types/sariKitap';

/**
 * Nokta Renderer — Kelime Bazlı
 * Her kelimenin altında yapılandırılabilir nokta işareti.
 * Kompakt A4 düzeni: minimal boşluk, dopdolu sayfa.
 */
export const NoktaRenderer = memo(({ config, content }: RendererProps) => {
    if (config.type !== 'nokta') return null;
    const c = config as NoktaConfig;

    const fontSize = `${c.compactFontSize ?? 16}pt`;
    const gapVal = `${(c.wordGap ?? 0.5)}rem`;
    const dotSz = c.dotSize ?? 6;
    const dotClr = c.dotColor ?? '#000000';

    const renderDot = (size: number, color: string, style: string) => {
        switch (style) {
            case 'kare':
                return (
                    <svg width={size} height={size} aria-hidden="true" style={{ flexShrink: 0 }}>
                        <rect x={0} y={0} width={size} height={size} fill={color} />
                    </svg>
                );
            case 'elips':
                return (
                    <svg width={size * 1.5} height={size} aria-hidden="true" style={{ flexShrink: 0 }}>
                        <ellipse cx={size * 0.75} cy={size / 2} rx={size * 0.6} ry={size / 2} fill={color} />
                    </svg>
                );
            default:
                return (
                    <svg width={size} height={size} aria-hidden="true" style={{ flexShrink: 0 }}>
                        <circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />
                    </svg>
                );
        }
    };

    return (
        <div className="sk-renderer-nokta" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%', background: '#fcf096' }}>
            {/* Başlık */}
            <h2 style={{
                fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem',
                textAlign: 'center', color: '#18181b', textTransform: 'uppercase',
                letterSpacing: '0.12em', borderBottom: '2px solid #18181b',
                paddingBottom: '0.4rem'
            }}>
                {content.title}
            </h2>

            {/* Yönerge */}
            <p style={{
                fontSize: '0.65rem', color: '#64748b', textAlign: 'center',
                marginBottom: '0.5rem', fontStyle: 'italic', lineHeight: 1.3
            }}>
                Her kelimenin altındaki noktayı takip ederek okuyun.
            </p>

            {/* İçerik — Kelime bazlı kompakt paragraf */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                gap: '0.2rem', padding: '0 0.25rem'
            }}>
                {content.heceRows?.map((row, ri) => (
                    <div key={ri} style={{
                        display: 'flex', flexWrap: 'wrap',
                        columnGap: gapVal, rowGap: '0.35rem',
                        alignItems: 'flex-start', lineHeight: 1.2
                    }}>
                        {row.syllables.map((s, si) => (
                            <div key={si} style={{
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', gap: '0.1rem'
                            }}>
                                <span role="text" style={{
                                    fontSize, fontWeight: 500, lineHeight: 1.2,
                                    fontFamily: 'Lexend, sans-serif', color: '#18181b'
                                }}>
                                    {s.syllable}
                                </span>
                                {s.dotBelow && renderDot(dotSz, dotClr, c.dotStyle)}
                                {c.showGuideLine && (
                                    <div style={{
                                        width: '100%', height: '1px',
                                        background: '#cbd5e1', marginTop: '0.05rem'
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            {/* Alt bilgi */}
            <div style={{
                marginTop: 'auto', paddingTop: '0.5rem',
                borderTop: '1px solid #e2e8f0',
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.6rem', color: '#94a3b8', padding: '0.5rem 0.25rem 0'
            }}>
                <span>Nokta Takibi • {c.difficulty}</span>
                <span>Oogmatik © Sarı Kitap</span>
                <span>{config.pageNumber}</span>
            </div>
        </div>
    );
});
NoktaRenderer.displayName = 'NoktaRenderer';
