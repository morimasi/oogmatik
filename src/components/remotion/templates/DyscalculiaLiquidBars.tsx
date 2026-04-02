import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AnimationPayloadType } from '../../../utils/schemas';

interface Props {
  data: AnimationPayloadType;
}

export const DyscalculiaLiquidBars: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', display: 'flex', flexDirection: 'row', gap: '40px', padding: '60px', alignItems: 'flex-end', justifyContent: 'center' }}>
      {data.timeline.map((item) => {
        const start = item.timing.startFrame;
        const duration = item.timing.durationInFrames;
        const end = start + duration;

        if (frame < start || frame > end) return null;

        const numericValue = parseInt(item.content || '10');
        const heightPercentage = Math.min((numericValue / 20) * 100, 100);

        const fillHeight = interpolate(
          frame,
          [start, start + Math.min(60, duration / 2)],
          [0, heightPercentage],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const opacity = interpolate(frame, [start, start+10, end-10, end], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

        return (
          <div
            key={item.id}
            style={{
              width: '120px',
              height: '400px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '20px',
              border: '2px solid rgba(255,255,255,0.1)',
              position: 'relative',
              opacity,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '20px',
              width: '100%',
              textAlign: 'center',
              fontFamily: 'Lexend, sans-serif',
              fontSize: '48px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              zIndex: 10,
            }}>
              {item.content || item.type}
            </div>

            <div style={{
              width: '100%',
              height: `${fillHeight}%`,
              backgroundColor: item.colorPalette?.[0] || '#38BDF8',
              background: `linear-gradient(to top, ${item.colorPalette?.[0] || '#0284C7'}, ${item.colorPalette?.[1] || '#38BDF8'})`,
              borderTopLeftRadius: '10px',
              borderTopRightRadius: '10px',
              transition: 'height 0.1s linear',
              boxShadow: '0 -4px 15px rgba(56, 189, 248, 0.5)',
            }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
