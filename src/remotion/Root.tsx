import React from 'react';
import { Composition } from 'remotion';
import { DyslexiaTextReveal, DyslexiaTextRevealProps } from './templates/DyslexiaTextReveal';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* 
        Bu bölüm, eğer komut satırı üzerinden (Node.js) render alınacaksa gereklidir.
        Browser/Player kurulumunda direkt <Player component={...} /> gönderebildiğimiz için 
        composition'ı buraya da kaydetmek, ilerideki sunucu taraflı renderlar (MP4) için
        bir ön hazırlıktır.
      */}
            <Composition
                id="DyslexiaTextReveal"
                component={DyslexiaTextReveal}
                durationInFrames={300} // Dinamik olarak değişebilir
                fps={30}
                width={1080}
                height={720}
                defaultProps={{
                    title: 'Remotion Animasyonları',
                    segments: [
                        { text: 'Bu' },
                        { text: 'animasyon' },
                        { text: 'gerçek', isHighlight: true },
                        { text: 'bir' },
                        { text: 'videodur.' }
                    ]
                } as DyslexiaTextRevealProps}
            />
        </>
    );
};
