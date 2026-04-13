// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { A4CompactRenderer } from '@/components/ActivityStudio/preview/A4CompactRenderer';
import type { ContentBlock, ThemeConfig, CompactA4Config } from '@/types/activityStudio';

const baseBlocks: ContentBlock[] = [
  { id: 'b1', type: 'title', order: 0, content: 'Minik Başlık', pedagogicalNote: 'not1' },
  { id: 'b2', type: 'question', order: 1, content: 'Soru metni?', pedagogicalNote: 'not2' },
  { id: 'b3', type: 'explanation', order: 2, content: 'Açıklama metni', pedagogicalNote: 'not3' },
];

const theme: ThemeConfig = {
  primaryColor: '#1F2937',
  secondaryColor: '#6366F1',
  accentColor: '#EC4899',
  bgPaper: '#FFFDF7',
  textColor: '#1A1A2E',
  contrastChecks: {
    primary_bgPaper: 14.5,
    secondary_bgPaper: 4.6,
    accent_bgPaper: 4.8,
    textColor_bgPaper: 16.1,
  },
};

const layout: CompactA4Config = {
  densityLevel: 2,
  fontSize: 12,
  lineHeight: 1.8,
  marginMM: 15,
  effectiveMinFontPT: 12,
};

describe('A4CompactRenderer', () => {
  beforeEach(() => {
    cleanup();
  });

  it('render olur ve data-testid görünür', () => {
    render(
      <A4CompactRenderer
        title="Test Etkinliği"
        blocks={baseBlocks}
        pedagogicalNote="Bu etkinlik disleksi desteği için."
        themeConfig={theme}
        compactA4Config={layout}
      />
    );
    expect(screen.getByTestId('a4-compact-renderer')).toBeDefined();
  });

  it('başlık metni render edilir', () => {
    render(
      <A4CompactRenderer
        title="Test Etkinliği"
        blocks={baseBlocks}
        pedagogicalNote=""
        themeConfig={null}
        compactA4Config={null}
      />
    );
    // Başlık h1 içinde
    const h1 = document.querySelector('h1');
    expect(h1?.textContent).toContain('Test Etkinliği');
  });

  it('pedagogicalNote footer 11pt gösterilir', () => {
    render(
      <A4CompactRenderer
        title="Etkinlik"
        blocks={[]}
        pedagogicalNote="Pedagojik açıklama burada."
        themeConfig={null}
        compactA4Config={null}
      />
    );
    const footer = screen.getByTestId('a4-pedagogical-footer');
    expect(footer.textContent).toContain('Pedagojik açıklama burada.');
    // font-size style kontrolü
    expect(footer.style.fontSize).toBe('11pt');
  });

  it('pedagogicalNote boşsa footer render edilmez', () => {
    render(
      <A4CompactRenderer
        title="Etkinlik"
        blocks={[]}
        pedagogicalNote=""
        themeConfig={null}
        compactA4Config={null}
      />
    );
    expect(screen.queryByTestId('a4-pedagogical-footer')).toBeNull();
  });

  it('bloklar order\'a göre sıralanır', () => {
    const unsorted: ContentBlock[] = [
      { id: 'c2', type: 'question', order: 2, content: 'İkinci', pedagogicalNote: '' },
      { id: 'c1', type: 'explanation', order: 1, content: 'Birinci', pedagogicalNote: '' },
    ];
    render(
      <A4CompactRenderer
        title="Sıralama Testi"
        blocks={unsorted}
        pedagogicalNote=""
        themeConfig={null}
        compactA4Config={null}
      />
    );
    const container = screen.getByTestId('a4-compact-renderer');
    const text = container.textContent ?? '';
    expect(text.indexOf('Birinci')).toBeLessThan(text.indexOf('İkinci'));
  });

  it('bgPaper tema rengi uygulanır', () => {
    render(
      <A4CompactRenderer
        title="Tema Testi"
        blocks={[]}
        pedagogicalNote=""
        themeConfig={theme}
        compactA4Config={layout}
      />
    );
    const container = screen.getByTestId('a4-compact-renderer');
    expect(container.style.backgroundColor).toBe('rgb(255, 253, 247)'); // #FFFDF7
  });
});
