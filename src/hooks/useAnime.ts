/**
 * OOGMATIK — Anime.js React Hook'ları
 *
 * Stüdyo bileşenlerinde anime.js animasyonlarını kullanmak için
 * tip-güvenli React hook'ları.
 *
 * Hook'lar:
 *  - useFadeInUp        — Bileşen mount / deps değişince fade-in slide-up
 *  - useStaggerReveal   — Container içindeki öğeleri stagger ile göster
 *  - useScanBeam        — OCR tarama ışını (aktif olunca başlar, biter temizler)
 *  - useCountUp         — Sayıyı 0'dan hedefe animate eder (reaktif)
 *  - useTypewriter      — Daktilo efekti (text değişince yeniden oynatır)
 *  - useSuccessPop      — Trigger'a göre başarı patlaması
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  fadeInUp,
  staggerReveal,
  scanBeam,
  animateCountUp,
  typewriterEffect,
  successPop,
  animateProcessingSteps,
  type StaggerRevealOptions,
  type CountUpOptions,
} from '../utils/animeUtils';

// ─── useFadeInUp ─────────────────────────────────────────────────────────

/**
 * Bileşen mount olduğunda veya deps değiştiğinde element fade-in + slide-up yapar.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useFadeInUp(ref, [isVisible]);
 * return <div ref={ref}> ... </div>;
 */
export function useFadeInUp<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  deps: React.DependencyList = [],
  delay = 0,
): void {
  useEffect(() => {
    if (ref.current) {
      fadeInUp(ref.current, delay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delay]);
}

// ─── useStaggerReveal ────────────────────────────────────────────────────

/**
 * Container içindeki `selector` ile eşleşen öğeleri stagger ile gösterir.
 * `deps` değiştiğinde yeniden oynatır.
 *
 * @example
 * const listRef = useRef<HTMLDivElement>(null);
 * useStaggerReveal(listRef, '.activity-item', [items]);
 */
export function useStaggerReveal<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  selector: string,
  deps: React.DependencyList = [],
  options?: StaggerRevealOptions,
): void {
  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll(selector);
    if (elements.length > 0) {
      // Opacity sıfırla, ardından stagger ile aç
      (elements as NodeListOf<HTMLElement>).forEach((el) => {
        el.style.opacity = '0';
      });
      // Kısa gecikme ile başlat (DOM stabilizasyonu için)
      const id = setTimeout(() => staggerReveal(elements, options), 50);
      return () => clearTimeout(id);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

// ─── useScanBeam ─────────────────────────────────────────────────────────

/**
 * `active` true olduğunda verilen ref üzerinde OCR tarama ışını başlatır,
 * false veya unmount olunca temizler.
 *
 * @example
 * const imgRef = useRef<HTMLDivElement>(null);
 * useScanBeam(imgRef, isScanning);
 */
export function useScanBeam<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  active: boolean,
): void {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (active && containerRef.current) {
      const { stop } = scanBeam(containerRef.current);
      cleanupRef.current = stop;
    } else {
      cleanupRef.current?.();
      cleanupRef.current = null;
    }

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}

// ─── useCountUp ──────────────────────────────────────────────────────────

/**
 * `value` değiştiğinde elemanı 0'dan (veya önceki değerden) hedefe animate eder.
 *
 * @example
 * const ref = useRef<HTMLSpanElement>(null);
 * useCountUp(ref, score, { suffix: ' puan' });
 * return <span ref={ref}>0</span>;
 */
export function useCountUp<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  value: number,
  options?: CountUpOptions,
): void {
  // Primitive değerleri ayrı ayrı takip et; options referansı değişse bile stale closure olmaz
  const prefix = options?.prefix ?? '';
  const suffix = options?.suffix ?? '';
  const decimals = options?.decimals ?? 0;
  const duration = options?.duration ?? 1200;

  useEffect(() => {
    if (ref.current) {
      animateCountUp(ref.current, value, { prefix, suffix, decimals, duration });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, prefix, suffix, decimals, duration]);
}

// ─── useTypewriter ───────────────────────────────────────────────────────

/**
 * `text` değiştiğinde daktilo efektiyle yeni metni yazar.
 *
 * @example
 * const ref = useRef<HTMLParagraphElement>(null);
 * useTypewriter(ref, storyStarter, { speed: 35 });
 * return <p ref={ref} />;
 */
export function useTypewriter<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  text: string,
  options?: { speed?: number; onComplete?: () => void },
): void {
  const stopRef = useRef<(() => void) | null>(null);
  // onComplete'i ref'te tut, çağrıda her zaman güncel versiyonu kullan
  const onCompleteRef = useRef(options?.onComplete);
  onCompleteRef.current = options?.onComplete;
  const speed = options?.speed ?? 40;

  useEffect(() => {
    if (!ref.current || !text) return;

    // Önceki animasyonu durdur
    stopRef.current?.();
    const stop = typewriterEffect(ref.current, text, {
      speed,
      onComplete: () => onCompleteRef.current?.(),
    });
    stopRef.current = stop;

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);
}

// ─── useSuccessPop ───────────────────────────────────────────────────────

/**
 * `trigger` true olduğunda hedef elemanda elastic pop animasyonu uygular.
 *
 * @example
 * const ref = useRef<HTMLButtonElement>(null);
 * useSuccessPop(ref, isSubmitted);
 */
export function useSuccessPop<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  trigger: boolean,
): void {
  const prevTrigger = useRef(false);

  useEffect(() => {
    if (trigger && !prevTrigger.current && ref.current) {
      successPop(ref.current);
    }
    prevTrigger.current = trigger;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
}

// ─── usePhaseSteps ───────────────────────────────────────────────────────

/**
 * İşlem adımlarının containerRef'ini ve aktif adım indeksini alır;
 * faz değiştiğinde adım öğelerini anime.js ile günceller.
 *
 * @example
 * const stepsRef = useRef<HTMLDivElement>(null);
 * usePhaseSteps(stepsRef, activeStepIndex);
 */
export function usePhaseSteps<T extends HTMLElement>(
  containerRef: React.RefObject<T | null>,
  activeIndex: number,
): void {
  const prevIndex = useRef(-1);

  const runAnimation = useCallback(() => {
    if (!containerRef.current) return;
    const steps = Array.from(
      containerRef.current.querySelectorAll('[data-step]'),
    ) as HTMLElement[];

    if (steps.length === 0) return;

    animateProcessingSteps(steps, activeIndex);
  }, [containerRef, activeIndex]);

  useEffect(() => {
    if (activeIndex !== prevIndex.current) {
      prevIndex.current = activeIndex;
      runAnimation();
    }
  }, [activeIndex, runAnimation]);
}
