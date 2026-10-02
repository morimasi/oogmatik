import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { OperationCardVertical, OperationCardHorizontal } from '../src/components/MathStudio/components/OperationCard';
import { DEFAULT_THEME_CONFIG } from '../src/components/MathStudio/constants';
import { generateMathDrillSet } from '../src/services/offlineGenerators/mathStudio';
import type { MathOperation } from '../src/types/math';

// Baskı regression kilidi: önizlemede görünüp yazdırmada kaybolan çizgilerin
// kök nedenleri (background-div ayraç, şeffaf border, `group` class'ı,
// boş sabit-height kutu) tekrar giremez.
const divOp: MathOperation = { id: 't-div', num1: 36, num2: 9, symbol: '÷', answer: 4 };
const addOp: MathOperation = { id: 't-add', num1: 48, num2: 27, symbol: '+', answer: 75 };

const baseProps = {
  fontSize: 28,
  fontWeight: 400,
  showText: false,
  themeConfig: DEFAULT_THEME_CONFIG,
  index: 0,
} as const;

describe('Bölme kartı baskı dayanıklılığı', () => {
  const html = renderToStaticMarkup(<OperationCardVertical op={divOp} {...baseProps} />);

  it('dikey ayraç background-div değil, border ile çizilir', () => {
    // Eski kod: aria-hidden + backgroundColor div'i → print CSS transparent yapar
    expect(html).not.toContain('aria-hidden');
    expect(html).toContain('border-left');
  });

  it('yatay ayraç ayrı boş div değil, bölenin border-bottomıdır', () => {
    expect(html).toContain('div-divisor');
    expect(html).toContain('border-bottom');
  });

  it('border renklerinde şeffaf (8-digit hex) renk yok', () => {
    // %25 opak border baskı önizlemede görünmezleşir
    expect(html).not.toMatch(/border[^;]*#[0-9a-fA-F]{8}/);
  });

  it('cevap kutusu boşken bile çökmez (nbsp içerik)', () => {
    expect(html).toContain('div-answer-box');
    expect(html).toContain('\u00A0');
  });

  it('kartta PrintLock tuzağı olan `group` classı yok', () => {
    // PrintLock `.group` seçicisini display:block yapar, flex düzeni bozar
    expect(html).not.toMatch(/class="[^"]*\bgroup\b/);
  });
});

describe('Diğer kartlar baskı dayanıklılığı', () => {
  it('dikey toplama kartı: opak border + nbsp + groupsuz', () => {
    const html = renderToStaticMarkup(<OperationCardVertical op={addOp} {...baseProps} />);
    expect(html).not.toMatch(/border[^;]*#[0-9a-fA-F]{8}/);
    expect(html).toContain('\u00A0');
    expect(html).not.toMatch(/class="[^"]*\bgroup\b/);
  });

  it('yatay kart: opak border + nbsp + groupsuz', () => {
    const html = renderToStaticMarkup(<OperationCardHorizontal op={addOp} {...baseProps} />);
    expect(html).not.toMatch(/border[^;]*#[0-9a-fA-F]{8}/);
    expect(html).toContain('\u00A0');
    expect(html).not.toMatch(/class="[^"]*\bgroup\b/);
  });
});

describe('Kalanlı bölme gizliliği (öğrenci kartı)', () => {
  const remOp: MathOperation = { ...divOp, id: 't-rem', num1: 37, num2: 9, answer: 4, remainder: 1 };

  it('dikey bölme kartında kalan ipucu görünmez', () => {
    const html = renderToStaticMarkup(<OperationCardVertical op={remOp} {...baseProps} />);
    expect(html).not.toContain('Kalan');
    expect(html).not.toContain('(K:');
  });

  it('yatay kartta kalan ipucu görünmez', () => {
    const html = renderToStaticMarkup(<OperationCardHorizontal op={remOp} {...baseProps} />);
    expect(html).not.toContain('Kalan');
    expect(html).not.toContain('(K:');
  });

  it('bölme cevap alanında kesik çerçeve yok, boş alan korunur', () => {
    const html = renderToStaticMarkup(<OperationCardVertical op={remOp} {...baseProps} />);
    expect(html).toContain('div-answer-box');
    expect(html).not.toMatch(/div-answer-box[^>]*border/);
    expect(html).toContain('\u00A0');
  });
});

describe('3. sayı kuralları (tek işaret + toplama/çıkarma)', () => {
  const chainOp: MathOperation = { id: 't-chain', num1: 48, num2: 27, num3: 15, symbol: '+', symbol2: '+', answer: 90 };

  it('3 sayılı dikey kartta işaret tektir ve en alt satırdadır', () => {
    const html = renderToStaticMarkup(<OperationCardVertical op={chainOp} {...baseProps} />);
    expect(html).toContain('15');
    expect(html.match(/\+/g)?.length ?? 0).toBe(1);
  });

  it("2 sayılı kartta işaret davranışı değişmez (tek '+')", () => {
    const html = renderToStaticMarkup(<OperationCardVertical op={addOp} {...baseProps} />);
    expect(html.match(/\+/g)?.length ?? 0).toBe(1);
  });

  it('çarpma ve bölmede 3. sayı üretilmez', () => {
    const base = { digit1: 2, digit2: 1, digit3: 1, useThirdNumber: true, allowCarry: true, allowBorrow: true, allowRemainder: true, allowNegative: false };
    const mults = generateMathDrillSet(20, ['mult'], base);
    const divs = generateMathDrillSet(20, ['div'], base);
    expect(mults.every((o) => o.num3 === undefined)).toBe(true);
    expect(divs.every((o) => o.num3 === undefined)).toBe(true);
  });

  it('toplamada 3. sayı üretilir', () => {
    const base = { digit1: 2, digit2: 1, digit3: 1, useThirdNumber: true, allowCarry: true, allowBorrow: true, allowRemainder: true, allowNegative: false };
    const adds = generateMathDrillSet(20, ['add'], base);
    expect(adds.every((o) => o.num3 !== undefined)).toBe(true);
  });
});
