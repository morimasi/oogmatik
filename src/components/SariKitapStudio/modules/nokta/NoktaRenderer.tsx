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
        <div className="sk-renderer-nokta">
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', color: '#18181b' }}>
                {content.title}
            </h2>
            <p style={{ fontSize: '0.6875rem', color: '#4b5563', marginBottom: '1rem', fontStyle: 'italic', textAlign: 'center' }}>
                {content.instructions}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {content.heceRows?.map((row: HeceRow, ri: number) => (
                    <div key={ri} style={{ display: 'flex', flexWrap: 'wrap', columnGap: '0.375rem', rowGap: '0.5rem', alignItems: 'baseline' }}>
                        {row.syllables.map((s: HeceData, si: number) => (
                            <div key={si} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.125rem' }}>
                                <span role="text" style={{ fontSize: '1rem', fontWeight: 500 }}>{s.syllable}</span>
                                {s.dotBelow && (
                                    <svg
                                        width={c.dotSize}
                                        height={c.dotSize}
                                        aria-hidden="true"
                                        style={{ flexShrink: 0 }}
                                    >
                                        {getDotShape(c.dotStyle, c.dotSize, c.dotColor)}
                                    </svg>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '1.5rem', padding: '0.5rem 0.75rem', borderLeft: '3px solid #10b981', background: '#f0fdf4', fontSize: '0.6875rem', color: '#065f46' }}>
                <strong>Pedagojik Not:</strong> {content.pedagogicalNote}
            </div>
        </div>
    );
});
NoktaRenderer.displayName = 'NoktaRenderer';
