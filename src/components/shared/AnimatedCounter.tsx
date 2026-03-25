/**
 * OOGMATIK — AnimatedCounter Bileşeni
 *
 * Anime.js ile 0'dan hedef değere sayı sayma animasyonu.
 * MathStudio, AssessmentModule ve diğer sayısal gösterimler için kullanılır.
 *
 * Kullanım:
 * ```tsx
 * <AnimatedCounter value={42} suffix=" soru" className="text-2xl font-bold" />
 * ```
 *
 * @prop value       - Hedef sayı (değiştiğinde animasyon yeniden oynatılır)
 * @prop prefix      - Sayı öneki (örn: "₺")
 * @prop suffix      - Sayı soneki (örn: " puan")
 * @prop decimals    - Ondalık basamak sayısı (varsayılan: 0)
 * @prop duration    - Animasyon süresi ms (varsayılan: 1200)
 * @prop className   - Ek CSS sınıfları
 * @prop style       - Ek inline stiller
 */

import React, { useRef } from 'react';
import { useCountUp } from '../../hooks/useAnime';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1200,
  className,
  style,
}) => {
  const ref = useRef<HTMLSpanElement>(null);

  useCountUp(ref, value, { prefix, suffix, decimals, duration });

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {value.toFixed(decimals)}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
