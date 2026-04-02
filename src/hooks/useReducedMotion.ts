// src/hooks/useReducedMotion.ts
// Accessibility Hook: Detect user's motion preference
// Returns true if user prefers reduced motion (prefers-reduced-motion: reduce)

import { useState, useEffect } from 'react';

/**
 * Detects if user has enabled reduced motion in their system preferences
 * @returns true if reduced motion is preferred, false otherwise
 *
 * @example
 * const prefersReduced = useReducedMotion();
 * if (!prefersReduced) {
 *   // Apply animations
 * }
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);

  useEffect(() => {
    // Check media query
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReduced(mediaQuery.matches);

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
    // Fallback for older browsers
    else if ((mediaQuery as any).addListener) {
      (mediaQuery as any).addListener(handler);
      return () => (mediaQuery as any).removeListener(handler);
    }
  }, []);

  return prefersReduced;
}

/**
 * Get motion config based on user preference
 * Returns empty config if reduced motion is enabled
 *
 * @param variants Motion variants to use
 * @returns Safe motion config
 *
 * @example
 * import { premiumMotion } from '@/utils/motionPresets';
 * const motionConfig = getSafeMotionConfig(premiumMotion.glassEnter);
 */
export function getSafeMotionConfig<T extends Record<string, unknown>>(
  variants: T
): T | Record<string, never> {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    // Return empty config - no animations
    return {} as Record<string, never>;
  }

  return variants;
}

/**
 * Conditional animation wrapper
 * @param shouldAnimate Whether to animate
 * @param animatedValue Animated value
 * @param staticValue Static value (fallback)
 *
 * @example
 * const opacity = conditionalAnimate(!prefersReduced, { opacity: [0, 1] }, 1);
 */
export function conditionalAnimate<T>(
  shouldAnimate: boolean,
  animatedValue: T,
  staticValue: T
): T {
  return shouldAnimate ? animatedValue : staticValue;
}
