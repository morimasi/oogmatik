import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence, AbsoluteFill } from 'remotion';

export type TextSegment = {
    text: string;
    isHighlight?: boolean;
    color?: string;
    duration?: number;
};

export type DyslexiaTextRevealProps = {
    segments: TextSegment[];
    title: string;
    templateType?: 'syllable' | 'tracking' | 'math' | 'default';
};

export const DyslexiaTextReveal: React.FC<DyslexiaTextRevealProps> = ({ segments, title, templateType = 'default' }) => {
    const frame = useCurrentFrame();
    const { fps, width, height } = useVideoConfig();

    // Dinamik timing: AI'dan gelen duration varsa onu kullan, yoksa varsayılan
    const framesPerSegment = fps * 1.2;

    const titleOpacity = interpolate(frame, [0, fps / 2], [0, 1], { extrapolateRight: 'clamp' });
    const titleScale = spring({ frame, fps, config: { stiffness: 100 } });

    return (
        <AbsoluteFill style={{
            backgroundColor: '#050810', // Dark Mode
            fontFamily: '"Lexend", sans-serif',
            color: '#e2e8f0',
            overflow: 'hidden'
        }}>
            {/* Arkaplan Gradiyenti */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 50% 50%, #1e1b4b 0%, #050810 100%)',
                opacity: 0.6
            }} />

            {/* Premium Header Container */}
            <div style={{
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                padding: '100px'
            }}>
                {/* Başlık Animasyonu - Kinetic Typography */}
                <h1 style={{
                    opacity: titleOpacity,
                    transform: `scale(${titleScale})`,
                    fontSize: '84px',
                    fontWeight: 900,
                    marginBottom: '80px',
                    textAlign: 'center',
                    background: 'linear-gradient(to right, #818cf8, #c084fc, #fb7185)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '-2px'
                }}>
                    {title}
                </h1>

                {/* Metin Segmentleri */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '40px',
                    justifyContent: 'center',
                    maxWidth: '85%',
                    perspective: '1000px'
                }}>
                    {segments.map((seg, index) => {
                        const startFrame = (fps / 2) + (index * framesPerSegment);

                        return (
                            <Sequence key={index} from={startFrame} layout="none">
                                <AnimatedWord segment={seg} type={templateType} />
                            </Sequence>
                        );
                    })}
                </div>
            </div>

            {/* Progress Bar - Alt Kısım */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '10%',
                width: '80%',
                height: '6px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '3px',
                overflow: 'hidden'
            }}>
                <div style={{
                    width: `${(frame / (segments.length * framesPerSegment + fps)) * 100}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #4f46e5, #ec4899)',
                    boxShadow: '0 0 15px rgba(79,70,229,0.5)'
                }} />
            </div>
        </AbsoluteFill>
    );
};

const AnimatedWord: React.FC<{ segment: TextSegment, type: string }> = ({ segment, type }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entry = spring({
        fps,
        frame,
        config: { damping: 10, stiffness: 120 },
    });

    const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const y = interpolate(frame, [0, 20], [40, 0], { extrapolateRight: 'clamp' });
    const rotateX = interpolate(frame, [0, 20], [45, 0], { extrapolateRight: 'clamp' });

    // Vurgu stili
    const isSpecial = segment.isHighlight;
    const highlightColor = segment.color || '#fb7185';

    return (
        <div style={{
            fontSize: '64px',
            fontWeight: isSpecial ? 900 : 500,
            color: isSpecial ? highlightColor : '#f1f5f9',
            opacity,
            transform: `translateY(${y}px) rotateX(${rotateX}deg) scale(${entry})`,
            display: 'inline-block',
            padding: '10px 24px',
            borderRadius: '24px',
            background: isSpecial ? 'rgba(251, 113, 133, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${isSpecial ? 'rgba(251, 113, 133, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
            boxShadow: isSpecial ? `0 10px 30px rgba(251, 113, 133, 0.2)` : 'none',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease'
        }}>
            {segment.text}
        </div >
    );
};
