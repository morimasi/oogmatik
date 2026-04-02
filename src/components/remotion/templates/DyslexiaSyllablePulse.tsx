import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate } from 'remotion';
import { AnimationPayloadType } from '../../../utils/schemas';

interface Props {
  data: AnimationPayloadType;
}

export const DyslexiaSyllablePulse: React.FC<Props> = ({ data }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', display: 'flex', flexDirection: 'column', padding: 40 }}>
      {data.timeline.map((item, index) => {
        const start = item.timing.startFrame;
        const duration = item.timing.durationInFrames;
        const end = start + duration;

        if (frame < start || frame > end) {
          return null;
        }

        const scale = spring({
          fps,
          frame: frame - start,
          config: {
            damping: 10,
            mass: 0.5,
            stiffness: 100,
          },
        });

        const opacity = interpolate(
          frame,
          [start, start + 10, end - 10, end],
          [0, 1, 1, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              fontFamily: 'Lexend, sans-serif',
              fontSize: '120px',
              fontWeight: 600,
              color: item.colorPalette?.[0] || '#4ADE80',
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
              letterSpacing: '0.1em',
            }}
          >
            {item.content || item.type}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
