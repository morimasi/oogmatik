/**
 * OOGMATIK — Anime.js v4 Animasyon Yardımcıları
 *
 * Bu modül, tüm stüdyo bileşenlerinde kullanılabilecek merkezi animasyon
 * yardımcı fonksiyonları içerir. Eğitim materyali deneyimini güçlendirmek
 * için anime.js v4'ün güçlü timeline ve stagger API'sinden yararlanır.
 *
 * Kullanım Alanları:
 *  - OCR Stüdyosu: Tarama ışını, faz göstergesi, sonuç açılışı
 *  - MathStudio: Sayı sayma animasyonu
 *  - CreativeStudio: Daktilo efekti
 *  - Genel: Kart girişi, başarı patlaması
 */

import { animate, createTimeline, stagger } from 'animejs';

// ─── Tip Tanımları ───────────────────────────────────────────────────────

export type ProcessingPhase = 'idle' | 'analyzing' | 'generating' | 'submitting' | 'complete' | 'error';

export interface ScanBeamCleanup {
  stop: () => void;
}

export interface CountUpOptions {
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export interface StaggerRevealOptions {
  /** Her eleman arasındaki gecikme (ms) */
  delay?: number;
  /** Yukarıdan aşağı kaydırma mesafesi (px) */
  distance?: number;
  /** Toplam süre (ms) */
  duration?: number;
}

// ─── Fonksiyonlar ────────────────────────────────────────────────────────

/**
 * Staggered girişi — liste öğeleri için sıralı fade-in + slide-up
 *
 * @example
 * staggerReveal(containerRef.current.querySelectorAll('.item'))
 */
export function staggerReveal(
  targets: Element | Element[] | NodeListOf<Element> | string,
  options?: StaggerRevealOptions,
): void {
  const { delay = 80, distance = 18, duration = 480 } = options ?? {};

  animate(targets as Parameters<typeof animate>[0], {
    opacity: [0, 1],
    translateY: [distance, 0],
    duration,
    delay: stagger(delay),
    ease: 'outExpo',
  });
}

/**
 * Tek eleman için fade-in + slide-up
 */
export function fadeInUp(el: HTMLElement, delayMs = 0, duration = 500): void {
  animate(el, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration,
    delay: delayMs,
    ease: 'outExpo',
  });
}

/**
 * OCR Tarama ışını animasyonu
 *
 * Verilen container üzerinde dikey yönde hareket eden mor bir ışık çizgisi oluşturur.
 * Görsel OCR analizi sırasında gerçekçi bir "tarama" hissi verir.
 *
 * @returns Animasyonu durduran ve temizleyen cleanup fonksiyonu
 *
 * @example
 * const cleanup = scanBeam(imageContainerRef.current);
 * // işlem bitince:
 * cleanup.stop();
 */
export function scanBeam(containerEl: HTMLElement): ScanBeamCleanup {
  // Izgara çizgisi (grid overlay)
  const grid = document.createElement('div');
  grid.setAttribute('data-anime-overlay', 'scan-grid');
  grid.style.cssText = `
    position: absolute; inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 18px,
      rgba(129,140,248,0.06) 18px,
      rgba(129,140,248,0.06) 19px
    );
    pointer-events: none; z-index: 9; border-radius: inherit;
  `;

  // Işın çizgisi
  const beam = document.createElement('div');
  beam.setAttribute('data-anime-overlay', 'scan-beam');
  beam.style.cssText = `
    position: absolute; top: 0; left: 0; right: 0; height: 4px;
    background: linear-gradient(90deg,
      transparent 0%,
      rgba(129,140,248,0.15) 10%,
      rgba(129,140,248,0.9) 40%,
      rgba(196,181,253,1) 50%,
      rgba(129,140,248,0.9) 60%,
      rgba(129,140,248,0.15) 90%,
      transparent 100%
    );
    box-shadow: 0 0 18px 6px rgba(129,140,248,0.55);
    pointer-events: none; z-index: 10; border-radius: 2px;
  `;

  containerEl.style.position = 'relative';
  containerEl.style.overflow = 'hidden';
  containerEl.appendChild(grid);
  containerEl.appendChild(beam);

  const anim = animate(beam, {
    top: ['0%', '100%'],
    duration: 1800,
    loop: true,
    direction: 'alternate',
    ease: 'inOutSine',
  });

  return {
    stop: () => {
      anim.pause();
      grid.remove();
      beam.remove();
    },
  };
}

/**
 * İşlem fazı geçişi — panel pulse animasyonu
 *
 * Faz değiştiğinde hedef elementi vurgular (scale + renk)
 */
export function animatePhaseChange(el: HTMLElement): void {
  animate(el, {
    scale: [0.97, 1],
    opacity: [0.6, 1],
    duration: 380,
    ease: 'outBack(1.3)',
  });
}

/**
 * Başarı patlaması — aktivite oluşturulduğunda veya gönderildiğinde
 *
 * Elementte elastic scale efekti uygular.
 */
export function successPop(el: HTMLElement): void {
  animate(el, {
    scale: [1, 1.06, 1],
    duration: 650,
    ease: 'outElastic(1, 0.5)',
  });
}

/**
 * Sayı sayma animasyonu — 0'dan hedef değere kadar animate eder
 *
 * @param el   Sayının yazılacağı DOM elemanı
 * @param to   Hedef sayı
 * @param opts Opsiyonlar (süre, prefix, suffix, ondalık basamak)
 *
 * @example
 * animateCountUp(ref.current, 42, { suffix: ' soru' })
 */
export function animateCountUp(el: HTMLElement, to: number, opts?: CountUpOptions): void {
  const { duration = 1200, prefix = '', suffix = '', decimals = 0 } = opts ?? {};
  const counter = { value: 0 };

  animate(counter, {
    value: to,
    duration,
    ease: 'outExpo',
    onUpdate: () => {
      const formatted = counter.value.toFixed(decimals);
      el.textContent = `${prefix}${formatted}${suffix}`;
    },
    onComplete: () => {
      // Kesin son değeri yaz
      el.textContent = `${prefix}${to.toFixed(decimals)}${suffix}`;
    },
  });
}

/**
 * Daktilo efekti — yaratıcı stüdyo hikaye başlatıcıları için
 *
 * Metni karakter karakter yazar.
 *
 * @returns Animasyonu durduran cleanup fonksiyonu
 *
 * @example
 * const stop = typewriterEffect(el, 'Bir zamanlar...', { speed: 35 })
 */
export function typewriterEffect(
  el: HTMLElement,
  text: string,
  options?: { speed?: number; onComplete?: () => void },
): () => void {
  const { speed = 40, onComplete } = options ?? {};

  el.textContent = '';
  const counter = { index: 0 };

  const anim = animate(counter, {
    index: text.length,
    duration: text.length * speed,
    ease: 'linear',
    onUpdate: () => {
      const i = Math.floor(counter.index);
      el.textContent = text.substring(0, i);
    },
    onComplete: () => {
      el.textContent = text;
      onComplete?.();
    },
  });

  return () => anim.pause();
}

/**
 * İşlem adımları timeline animasyonu — OCR faz göstergesi
 *
 * Verilen adım öğelerini timeline ile sırayla vurgular.
 *
 * @param stepElements  Adım DOM elemanları dizisi
 * @param activeIndex   Şu an aktif adım indeksi
 */
export function animateProcessingSteps(stepElements: HTMLElement[], activeIndex: number): void {
  const tl = createTimeline({ defaults: { duration: 300, ease: 'outExpo' } });

  stepElements.forEach((el, idx) => {
    const isActive = idx === activeIndex;
    const isDone = idx < activeIndex;

    tl.add(
      el,
      {
        opacity: isActive ? [0.5, 1] : isDone ? [0.4, 0.85] : [1, 0.3],
        scale: isActive ? [0.9, 1.05, 1] : [1, 1],
        duration: isActive ? 450 : 200,
      },
      idx * 60, // stagger ile sıralı çalışır
    );
  });
}
