import { memo } from 'react';
import type { RendererProps } from '../../registry';
import type { NoktaConfig, HeceRow, HeceData } from '../../../../types/sariKitap';

export const NoktaRenderer = memo(({ config, content }: RendererProps) => {
    if (config.type !== 'nokta') return null;
    const c = config as NoktaConfig;

    const getDotShape = (style: string, size: number, color: string) => {
        switch (style) {
            case 'yuvarlak':
                return <circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />;
            case 'kare':
                return <rect x={0} y={0} width={size} height={size} fill={color} />;
            case 'elips':
                return <ellipse cx={size / 2} cy={size / 2} rx={size / 2} ry={size / 4} fill={color} />;
            default:
                return <circle cx={size / 2} cy={size / 2} r={size / 2} fill={color} />;
        }
    };

    return (
        <div className="sk-renderer-nokta" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.75rem', color: '#3f3f46', marginBottom: '0.75rem', fontWeight: 500, textAlign: 'center', borderBottom: '1px solid #e4e4e7', paddingBottom: '0.5rem' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {content.heceRows?.map((row: HeceRow, ri: number) => (
                    <div key={ri} style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.25rem', rowGap: '0.375rem', alignItems: 'baseline', padding: '0.125rem 0' }}>
                        {row.syllables.map((s: HeceData, si: number) => (
                            <div key={si} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.05rem' }}>
                                <span role="text" style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.2 }}>{s.syllable}</span>
                                {s.dotBelow && (
                                    <svg
                                        width={c.dotSize}
                                        height={c.dotSize}
                                        aria-hidden="true"
                                        style={{ flexShrink: 0, marginTop: '-0.1rem' }}
                                    >
                                        {getDotShape(c.dotStyle, c.dotSize, c.dotColor)}
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '2px solid #10b981', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ background: '#10b981', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase' }}>
                    Pedagojik Not
                </div>
                <div style={{ fontSize: '0.7rem', color: '#065f46', fontStyle: 'italic', flex: 1 }}>
                    {content.pedagogicalNote}
                </div>
            </div>
        </div>
    );
});
NoktaRenderer.displayName = 'NoktaRenderer';
