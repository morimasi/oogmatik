import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { AnimationPayloadType } from '../../../utils/schemas';

interface Props {
  data: AnimationPayloadType;
}

export const AdhdZenMode: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', padding: 40, alignItems: 'center', justifyContent: 'center' }}>
      {data.timeline.map((item) => {
        const start = item.timing.startFrame;
        const duration = item.timing.durationInFrames;
        const end = start + duration;

        if (frame < start || frame > end) {
          return null;
        }

        const transitionY = interpolate(
          frame,
          [start, start + 30],
          [50, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const opacity = interpolate(
          frame,
          [start, start + 20, end - 20, end],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const widthPercent = interpolate(frame, [start, end], [100, 0]);

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              transform: `translateY(${transitionY}px)`,
              opacity,
              fontFamily: 'Lexend, sans-serif',
              fontSize: '80px',
              fontWeight: 400,
              color: item.colorPalette?.[0] || '#94A3B8',
              backgroundColor: 'rgba(255,255,255,0.05)',
              padding: '24px 48px',
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 4px 30px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              textAlign: 'center',
            }}
          >
            {item.content || item.type}
            
            <div style={{ marginTop: '20px', width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                backgroundColor: item.colorPalette?.[1] || '#818CF8',
                width: `${widthPercent}%`,
              }} />
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
