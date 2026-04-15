import { memo } from 'react';
import type { RendererProps } from '../../registry';
import type { NoktaConfig, HeceRow, HeceData } from '../../../../types/sariKitap';

export const NoktaRenderer = memo(({ config, content }: RendererProps) => {
    if (config.type !== 'nokta') return null;
    const c = config as NoktaConfig;

    const getDotShape = (style: string, size: number, color: string) => {
        switch (style) {
            case 'yuvarlak':
                return <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill="none" stroke={color} strokeWidth={2} />;
            case 'kare':
                return <rect x={0} y={0} width={size} height={size} fill="none" stroke={color} strokeWidth={2} />;
            case 'elips':
                return <ellipse cx={size / 2} cy={size / 2} rx={size / 2} ry={size / 4} fill="none" stroke={color} strokeWidth={2} />;
            default:
                return <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill="none" stroke={color} strokeWidth={2} />;
        }
    };

    return (
        <div className="sk-renderer-nokta" style={{ padding: '0', display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center', color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                {content.title}
            </h2>

            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.25rem', 
                flex: 1,
                padding: '0 1rem'
            }}>
                {content.heceRows?.map((row: HeceRow, ri: number) => (
                    <div key={ri} style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        columnGap: '1rem', 
                        rowGap: '1.5rem', 
                        alignItems: 'baseline',
                        justifyContent: 'space-between'
                    }}>
                        {row.syllables.map((s: HeceData, si: number) => (
                            <div key={si} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                                <span role="text" style={{ fontSize: '1.25rem', fontWeight: 500, lineHeight: 1, fontFamily: 'Lexend, sans-serif' }}>{s.syllable}</span>
                                <svg
                                    width={14}
                                    height={14}
                                    aria-hidden="true"
                                    style={{ flexShrink: 0 }}
                                >
                                    {getDotShape('yuvarlak', 14, '#ef4444')}
                                </svg>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ 
                marginTop: 'auto', 
                paddingTop: '1rem', 
                borderTop: '1px solid #e2e8f0', 
                display: 'flex', 
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#64748b'
            }}>
                1
            </div>
        </div>
    );
});
NoktaRenderer.displayName = 'NoktaRenderer';
