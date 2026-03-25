/**
 * OOGMATIK — animeUtils Tests
 *
 * anime.js animasyon yardımcı fonksiyonlarını test eder.
 * anime.js mock'lanarak DOM davranışları ve arayüz sözleşmeleri doğrulanır.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── anime.js Mock (hoisted) ─────────────────────────────────────────────

const { mockAnimate, mockPause, mockCreateTimeline, mockAdd, mockStagger } = vi.hoisted(() => {
  const mockPause = vi.fn();
  const mockAnimate = vi.fn(() => ({ pause: mockPause }));
  const mockAdd = vi.fn();
  mockAdd.mockReturnValue(mockAdd); // chainable
  const mockCreateTimeline = vi.fn(() => ({ add: mockAdd }));
  const mockStagger = vi.fn((val: number) => val);
  return { mockAnimate, mockPause, mockCreateTimeline, mockAdd, mockStagger };
});

vi.mock('animejs', () => ({
  animate: mockAnimate,
  createTimeline: mockCreateTimeline,
  stagger: mockStagger,
}));

// ─── Import After Mock ───────────────────────────────────────────────────

import {
  staggerReveal,
  fadeInUp,
  scanBeam,
  animatePhaseChange,
  successPop,
  animateCountUp,
  typewriterEffect,
  animateProcessingSteps,
  type CountUpOptions,
  type StaggerRevealOptions,
} from '@/utils/animeUtils';

// ─── DOM Yardımcı Fonksiyon ──────────────────────────────────────────────

function makeEl(tag = 'div'): HTMLElement {
  const el = document.createElement(tag);
  document.body.appendChild(el);
  return el;
}

function makeContainer(childCount = 3): { container: HTMLElement; children: HTMLElement[] } {
  const container = document.createElement('div');
  const children: HTMLElement[] = [];
  for (let i = 0; i < childCount; i++) {
    const child = document.createElement('div');
    child.className = 'item';
    container.appendChild(child);
    children.push(child);
  }
  document.body.appendChild(container);
  return { container, children };
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('animeUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Re-setup chainable mock after clearAllMocks
    mockAdd.mockReturnValue(mockAdd);
    mockCreateTimeline.mockReturnValue({ add: mockAdd });
    mockAnimate.mockReturnValue({ pause: mockPause });
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ─── staggerReveal ──────────────────────────────────────────────────

  describe('staggerReveal', () => {
    it('should call animate with targets', () => {
      const { container } = makeContainer(3);
      const items = container.querySelectorAll('.item');

      staggerReveal(items);

      expect(mockAnimate).toHaveBeenCalledOnce();
      expect(mockAnimate).toHaveBeenCalledWith(
        items,
        expect.objectContaining({ opacity: expect.anything() }),
      );
    });

    it('should call stagger with custom delay option', () => {
      const { container } = makeContainer(2);
      const items = container.querySelectorAll('.item');
      const opts: StaggerRevealOptions = { delay: 80, duration: 400 };

      staggerReveal(items, opts);

      expect(mockStagger).toHaveBeenCalledWith(80);
    });

    it('should work with HTMLElement array', () => {
      const { children } = makeContainer(2);

      staggerReveal(children);

      expect(mockAnimate).toHaveBeenCalledOnce();
    });
  });

  // ─── fadeInUp ───────────────────────────────────────────────────────

  describe('fadeInUp', () => {
    it('should call animate on the provided element', () => {
      const el = makeEl();

      fadeInUp(el);

      expect(mockAnimate).toHaveBeenCalledOnce();
      expect(mockAnimate).toHaveBeenCalledWith(el, expect.any(Object));
    });

    it('should pass delay parameter to animate options', () => {
      const el = makeEl();

      fadeInUp(el, 200);

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.delay).toBe(200);
    });

    it('should include opacity transition', () => {
      const el = makeEl();

      fadeInUp(el);

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.opacity).toBeDefined();
    });
  });

  // ─── scanBeam ───────────────────────────────────────────────────────

  describe('scanBeam', () => {
    it('should return an object with a stop function', () => {
      const el = makeEl();
      const result = scanBeam(el);

      expect(result).toHaveProperty('stop');
      expect(typeof result.stop).toBe('function');
    });

    it('should create a beam element inside the container', () => {
      const el = makeEl();

      scanBeam(el);

      expect(el.children.length).toBeGreaterThan(0);
    });

    it('should remove beam element on stop()', () => {
      const el = makeEl();
      const { stop } = scanBeam(el);
      const childCount = el.children.length;

      stop();

      expect(el.children.length).toBeLessThan(childCount);
    });
  });

  // ─── animatePhaseChange ─────────────────────────────────────────────

  describe('animatePhaseChange', () => {
    it('should call animate on the element', () => {
      const el = makeEl();

      animatePhaseChange(el);

      expect(mockAnimate).toHaveBeenCalledWith(el, expect.any(Object));
    });
  });

  // ─── successPop ─────────────────────────────────────────────────────

  describe('successPop', () => {
    it('should call animate with scale animation', () => {
      const el = makeEl();

      successPop(el);

      expect(mockAnimate).toHaveBeenCalledOnce();
      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.scale).toBeDefined();
    });
  });

  // ─── animateCountUp ─────────────────────────────────────────────────

  describe('animateCountUp', () => {
    it('should call animate with value transition to target', () => {
      const el = makeEl('span');

      animateCountUp(el, 42);

      expect(mockAnimate).toHaveBeenCalledOnce();
      const [target, props] = mockAnimate.mock.calls[0] as [unknown, Record<string, unknown>];
      expect((target as Record<string, number>).value).toBe(0);
      expect(props.value).toBe(42);
    });

    it('should use custom duration from options', () => {
      const el = makeEl('span');
      const opts: CountUpOptions = { duration: 800 };

      animateCountUp(el, 100, opts);

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.duration).toBe(800);
    });

    it('should write final value with prefix/suffix on complete', () => {
      const el = makeEl('span');

      animateCountUp(el, 7, { prefix: '✓ ', suffix: ' soru', decimals: 0 });

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      const onComplete = callArgs.onComplete as () => void;
      onComplete();

      expect(el.textContent).toBe('✓ 7 soru');
    });
  });

  // ─── typewriterEffect ───────────────────────────────────────────────

  describe('typewriterEffect', () => {
    it('should return a stop function', () => {
      const el = makeEl('p');
      const stop = typewriterEffect(el, 'Merhaba Dünya');

      expect(typeof stop).toBe('function');
    });

    it('should clear element content before animating', () => {
      const el = makeEl('p');
      el.textContent = 'önceki metin';

      typewriterEffect(el, 'yeni metin');

      expect(el.textContent).toBe('');
    });

    it('should call animate with correct text length-based duration', () => {
      const el = makeEl('p');
      const text = 'Test';
      const speed = 50;

      typewriterEffect(el, text, { speed });

      expect(mockAnimate).toHaveBeenCalledOnce();
      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.duration).toBe(text.length * speed);
    });

    it('should call onComplete callback and write full text when done', () => {
      const el = makeEl('p');
      const text = 'Merhaba';
      const onComplete = vi.fn();

      typewriterEffect(el, text, { onComplete });

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      const cb = callArgs.onComplete as () => void;
      cb();

      expect(el.textContent).toBe(text);
      expect(onComplete).toHaveBeenCalledOnce();
    });

    it('stop() should pause the animation', () => {
      const el = makeEl('p');
      const stop = typewriterEffect(el, 'Deneme');

      stop();

      expect(mockPause).toHaveBeenCalledOnce();
    });
  });

  // ─── animateProcessingSteps ─────────────────────────────────────────

  describe('animateProcessingSteps', () => {
    it('should create a timeline and add each step', () => {
      const steps = [makeEl(), makeEl(), makeEl()];

      animateProcessingSteps(steps, 1);

      expect(mockCreateTimeline).toHaveBeenCalledOnce();
      expect(mockAdd).toHaveBeenCalledTimes(3);
    });

    it('should handle empty steps array without throwing', () => {
      expect(() => animateProcessingSteps([], 0)).not.toThrow();
    });

    it('should add all steps to timeline for last active index', () => {
      const steps = [makeEl(), makeEl()];

      animateProcessingSteps(steps, 1);

      expect(mockAdd).toHaveBeenCalledTimes(2);
    });
  });
});


// ─── Import After Mock ───────────────────────────────────────────────────

import {
  staggerReveal,
  fadeInUp,
  scanBeam,
  animatePhaseChange,
  successPop,
  animateCountUp,
  typewriterEffect,
  animateProcessingSteps,
  type CountUpOptions,
  type StaggerRevealOptions,
} from '@/utils/animeUtils';

// ─── DOM Yardımcı Fonksiyon ──────────────────────────────────────────────

function makeEl(tag = 'div'): HTMLElement {
  const el = document.createElement(tag);
  document.body.appendChild(el);
  return el;
}

function makeContainer(childCount = 3): { container: HTMLElement; children: HTMLElement[] } {
  const container = document.createElement('div');
  const children: HTMLElement[] = [];
  for (let i = 0; i < childCount; i++) {
    const child = document.createElement('div');
    child.className = 'item';
    container.appendChild(child);
    children.push(child);
  }
  document.body.appendChild(container);
  return { container, children };
}

// ─── Tests ───────────────────────────────────────────────────────────────

describe('animeUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  // ─── staggerReveal ──────────────────────────────────────────────────

  describe('staggerReveal', () => {
    it('should call animate with targets', () => {
      const { container } = makeContainer(3);
      const items = container.querySelectorAll('.item');

      staggerReveal(items);

      expect(mockAnimate).toHaveBeenCalledOnce();
      expect(mockAnimate).toHaveBeenCalledWith(
        items,
        expect.objectContaining({ opacity: expect.anything() }),
      );
    });

    it('should accept custom delay option', () => {
      const { container } = makeContainer(2);
      const items = container.querySelectorAll('.item');
      const opts: StaggerRevealOptions = { delay: 80, duration: 400 };

      staggerReveal(items, opts);

      expect(mockStagger).toHaveBeenCalledWith(80);
    });

    it('should work with HTMLElement array', () => {
      const { children } = makeContainer(2);

      staggerReveal(children);

      expect(mockAnimate).toHaveBeenCalledOnce();
    });
  });

  // ─── fadeInUp ───────────────────────────────────────────────────────

  describe('fadeInUp', () => {
    it('should call animate on the provided element', () => {
      const el = makeEl();

      fadeInUp(el);

      expect(mockAnimate).toHaveBeenCalledOnce();
      expect(mockAnimate).toHaveBeenCalledWith(el, expect.any(Object));
    });

    it('should pass delay parameter to animate options', () => {
      const el = makeEl();

      fadeInUp(el, 200);

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.delay).toBe(200);
    });

    it('should include opacity transition', () => {
      const el = makeEl();

      fadeInUp(el);

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.opacity).toBeDefined();
    });
  });

  // ─── scanBeam ───────────────────────────────────────────────────────

  describe('scanBeam', () => {
    it('should return an object with a stop function', () => {
      const el = makeEl();
      const result = scanBeam(el);

      expect(result).toHaveProperty('stop');
      expect(typeof result.stop).toBe('function');
    });

    it('should create a beam element inside the container', () => {
      const el = makeEl();

      scanBeam(el);

      // Beam element appended as child
      expect(el.children.length).toBeGreaterThan(0);
    });

    it('should remove beam element on stop()', () => {
      const el = makeEl();
      const { stop } = scanBeam(el);
      const childCount = el.children.length;

      stop();

      expect(el.children.length).toBeLessThan(childCount);
    });
  });

  // ─── animatePhaseChange ─────────────────────────────────────────────

  describe('animatePhaseChange', () => {
    it('should call animate on the element', () => {
      const el = makeEl();

      animatePhaseChange(el);

      expect(mockAnimate).toHaveBeenCalledWith(el, expect.any(Object));
    });
  });

  // ─── successPop ─────────────────────────────────────────────────────

  describe('successPop', () => {
    it('should call animate with scale animation', () => {
      const el = makeEl();

      successPop(el);

      expect(mockAnimate).toHaveBeenCalledOnce();
      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.scale).toBeDefined();
    });
  });

  // ─── animateCountUp ─────────────────────────────────────────────────

  describe('animateCountUp', () => {
    it('should call animate with value transition to target', () => {
      const el = makeEl('span');

      animateCountUp(el, 42);

      expect(mockAnimate).toHaveBeenCalledOnce();
      const [target, props] = mockAnimate.mock.calls[0] as [unknown, Record<string, unknown>];
      expect((target as Record<string, number>).value).toBe(0); // counter starts at 0
      expect(props.value).toBe(42);
    });

    it('should use custom duration from options', () => {
      const el = makeEl('span');
      const opts: CountUpOptions = { duration: 800, suffix: ' puan' };

      animateCountUp(el, 100, opts);

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.duration).toBe(800);
    });

    it('should write final value on complete via onComplete callback', () => {
      const el = makeEl('span');

      // Capture the onComplete callback and call it manually
      animateCountUp(el, 7, { prefix: '✓ ', suffix: ' soru', decimals: 0 });

      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      const onComplete = callArgs.onComplete as () => void;
      onComplete();

      expect(el.textContent).toBe('✓ 7 soru');
    });
  });

  // ─── typewriterEffect ───────────────────────────────────────────────

  describe('typewriterEffect', () => {
    it('should return a stop function', () => {
      const el = makeEl('p');
      const stop = typewriterEffect(el, 'Merhaba Dünya');

      expect(typeof stop).toBe('function');
    });

    it('should clear element content before animating', () => {
      const el = makeEl('p');
      el.textContent = 'önceki metin';

      typewriterEffect(el, 'yeni metin');

      expect(el.textContent).toBe('');
    });

    it('should call animate with correct text length-based duration', () => {
      const el = makeEl('p');
      const text = 'Test';
      const speed = 50;

      typewriterEffect(el, text, { speed });

      expect(mockAnimate).toHaveBeenCalledOnce();
      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      expect(callArgs.duration).toBe(text.length * speed); // 4 * 50 = 200
    });

    it('should call onComplete callback when animation finishes', () => {
      const el = makeEl('p');
      const text = 'Merhaba';
      const onComplete = vi.fn();

      typewriterEffect(el, text, { onComplete });

      // Trigger complete
      const callArgs = mockAnimate.mock.calls[0][1] as Record<string, unknown>;
      const cb = callArgs.onComplete as () => void;
      cb();

      expect(el.textContent).toBe(text);
      expect(onComplete).toHaveBeenCalledOnce();
    });

    it('stop() should pause the animation', () => {
      const el = makeEl('p');
      const stop = typewriterEffect(el, 'Deneme');

      stop();

      expect(mockPause).toHaveBeenCalledOnce();
    });
  });

  // ─── animateProcessingSteps ─────────────────────────────────────────

  describe('animateProcessingSteps', () => {
    it('should create a timeline and add each step', () => {
      const steps = [makeEl(), makeEl(), makeEl()];
      const mockAdd = vi.fn().mockReturnThis();
      mockCreateTimeline.mockReturnValueOnce({ add: mockAdd });

      animateProcessingSteps(steps, 1);

      expect(mockCreateTimeline).toHaveBeenCalledOnce();
      expect(mockAdd).toHaveBeenCalledTimes(3);
    });

    it('should handle empty steps array without throwing', () => {
      expect(() => animateProcessingSteps([], 0)).not.toThrow();
    });

    it('should add all steps to timeline even with last active', () => {
      const steps = [makeEl(), makeEl()];
      const mockAdd = vi.fn().mockReturnThis();
      mockCreateTimeline.mockReturnValueOnce({ add: mockAdd });

      animateProcessingSteps(steps, 1);

      expect(mockAdd).toHaveBeenCalledTimes(2);
    });
  });
});
