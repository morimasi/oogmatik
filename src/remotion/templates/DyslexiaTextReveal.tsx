import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from 'remotion';

export type TextSegment = {
    text: string;
    isHighlight?: boolean;
};

export type DyslexiaTextRevealProps = {
    segments: TextSegment[];
    title: string;
};

export const DyslexiaTextReveal: React.FC<DyslexiaTextRevealProps> = ({ segments, title }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Her kelime/segment için gösterim aralığı (örneğin kelime başı 1 saniye = fps kadar frame)
    const framesPerSegment = fps * 1.5;

    const titleOpacity = interpolate(frame, [0, fps / 2], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = interpolate(frame, [0, fps / 2], [50, 0], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            flex: 1,
            backgroundColor: '#f8fafc',
            padding: '60px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: '"Lexend", sans-serif',
            color: '#1e293b'
        }}>

            {/* Başlık Animasyonu */}
            <div style={{
                opacity: titleOpacity,
                transform: `translateY(${titleY}px)`,
                fontSize: '48px',
                fontWeight: 'bold',
                marginBottom: '60px',
                textAlign: 'center',
                color: '#4f46e5'
            }}>
                {title}
            </div>

            {/* Metin Kelimeleri/Segmentleri (Yavaş gösterim, disleksi dostu ara) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'center', maxWidth: '80%' }}>
                {segments.map((seg, index) => {
                    // Her kelimenin başlama zamanı
                    const startFrame = (fps / 2) + (index * framesPerSegment);

                    return (
                        <Sequence key={index} from={startFrame} layout="none">
                            <Word segment={seg} />
                        </Sequence>
                    );
                })}
            </div>
        </div>
    );
};

const Word: React.FC<{ segment: TextSegment }> = ({ segment }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Yay (spring) animasyonu ile hafifçe üste zıplama efekti
    const scale = spring({
        fps,
        frame,
        config: { damping: 12, stiffness: 200 },
    });

    const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp' });

    return (
        <div style={{
            fontSize: '42px',
            fontWeight: segment.isHighlight ? 'bold' : 'normal',
            color: segment.isHighlight ? '#e11d48' : '#334155',
            letterSpacing: '2px', // Disleksi dostu harf arası
            opacity,
            transform: `scale(${scale})`,
            display: 'inline-block',
            backgroundColor: segment.isHighlight ? '#ffe4e6' : 'transparent',
            padding: segment.isHighlight ? '4px 12px' : '0',
            borderRadius: '8px'
        }}>
            {segment.text}
        </div>
    );
};
