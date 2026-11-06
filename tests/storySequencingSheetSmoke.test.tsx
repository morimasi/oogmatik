// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { StorySequencingSheet } from '../src/components/sheets/verbal/StorySequencingSheet';

afterEach(() => cleanup());

describe('StorySequencingSheet — veri şekli dayanıklılığı', () => {
  it('AI jeneratörünün düz { items } çıktısını çökmeksizin basar', () => {
    const data = {
      title: 'Olayları Sırala',
      instruction: 'Karışık verilen olayları doğru sıraya koyunuz.',
      items: [
        { id: 's1', text: 'Tohum toprağa düşer.', correctOrder: 1 },
        { id: 's2', text: 'Filiz güneşe uzanır.', correctOrder: 2 },
      ],
    } as unknown as Parameters<typeof StorySequencingSheet>[0]['data'];

    const { container } = render(<StorySequencingSheet data={data} />);

    expect(container.textContent).toContain('Olayları Sırala');
    expect(container.textContent).toContain('Tohum toprağa düşer.');
    expect(container.textContent).toContain('Filiz güneşe uzanır.');
  });

  it('offline jeneratörün { content: { panels } } şeklini geçiş kelimeleriyle basar', () => {
    const data = {
      title: 'Olay Sıralama: Tohumun Yolculuğu',
      instruction: 'Olayları oluş sırasına göre numaralandırın.',
      content: {
        title: 'Tohumun Yolculuğu',
        panels: [
          { id: 'p-0', text: 'Tohum toprağa düşer.', imagePrompt: 'Plant life cycle - step 1' },
          { id: 'p-1', text: 'Can suyu verilir.', imagePrompt: 'Plant life cycle - step 2' },
        ],
        transitionWords: ['Önce', 'Sonra'],
        fullStory: 'Tohum toprağa düşer. Can suyu verilir.',
      },
    } as unknown as Parameters<typeof StorySequencingSheet>[0]['data'];

    const { container } = render(<StorySequencingSheet data={data} />);

    expect(container.textContent).toContain('Tohumun Yolculuğu');
    expect(container.textContent).toContain('Can suyu verilir.');
    expect(container.textContent).toContain('Önce');
  });

  it('boş/bozuk veri geldiğinde çökmez', () => {
    const empty = {} as unknown as Parameters<typeof StorySequencingSheet>[0]['data'];
    const { container } = render(<StorySequencingSheet data={empty} />);
    expect(container.textContent).toContain('Olay Sıralama');
  });
});
