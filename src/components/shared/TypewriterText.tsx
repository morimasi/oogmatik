/**
 * OOGMATIK — TypewriterText Bileşeni
 *
 * Anime.js ile daktilo efekti uygulayan metin bileşeni.
 * CreativeStudio hikaye başlatıcıları, ReadingStudio metin gösterimi
 * ve öğrencilere yönelik açıklama metinlerinde kullanılır.
 *
 * Kullanım:
 * ```tsx
 * <TypewriterText text="Bir zamanlar uzak bir ülkede..." speed={35} />
 * ```
 *
 * @prop text       - Yazılacak metin (değiştiğinde animasyon yeniden başlar)
 * @prop speed      - Karakter başına süre (ms, varsayılan: 40)
 * @prop tag        - HTML etiketi (varsayılan: "p")
 * @prop onComplete - Animasyon bitince çağrılır
 * @prop className  - CSS sınıfları
 * @prop style      - Inline stiller
 */

import React, { useRef } from 'react';
import { useTypewriter } from '../../hooks/useAnime';

type TextTag = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'label';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  tag?: TextTag;
  onComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  speed = 40,
  tag: Tag = 'p',
  onComplete,
  className,
  style,
}) => {
  const ref = useRef<HTMLParagraphElement>(null);

  useTypewriter(ref as React.RefObject<HTMLElement | null>, text, {
    speed,
    onComplete,
  });

  // Ref'i generic element'e yönlendir
  const props = { ref, className, style };
  return <Tag {...props} />;
};

export default TypewriterText;
