// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import React from 'react';
import { FascicleMultiPageRenderer } from '../src/components/FascicleStudio/FascicleMultiPageRenderer';
import { ActivityType } from '../src/types/activity';
import type { FascicleItem, FascicleMetadata } from '../src/types/fascicle';

// Ağır stüdyo renderer'ları yerine sayfa yerleşimini doğrularız.
vi.mock('../src/components/SheetRenderer', () => ({
  SheetRenderer: ({ data }: { data: unknown }) => (
    <div data-testid="sheet-content">
      {(data as { title?: string } | null)?.title || 'content'}
    </div>
  ),
}));

const metadata = {
  title: 'Test Fasikül',
  pageSettings: { paperColor: 'white', margin: 'normal', fontScale: 100 },
} as unknown as FascicleMetadata;

afterEach(() => cleanup());

describe('FascicleMultiPageRenderer — çok sayfalı yerleşim', () => {
  it('çok sayfalı etkinliği her sayfa için ayrı A4 olarak basar', () => {
    const item = {
      id: 'multi-1',
      type: ActivityType.FIND_LETTER_PAIR,
      difficulty: 'Kolay',
      pageCount: 3,
      order: 0,
      content: {
        data: [
          { title: 'Sayfa İçeriği 1' },
          { title: 'Sayfa İçeriği 2' },
          { title: 'Sayfa İçeriği 3' },
        ],
        title: 'Harf Eşleme',
      },
    } as unknown as FascicleItem;

    const { container } = render(
      <FascicleMultiPageRenderer
        item={item}
        itemIndex={0}
        metadata={metadata}
        startPageNumber={3}
        grandTotalPages={5}
        renderWatermark={() => null}
      />
    );

    const sheets = container.querySelectorAll('.worksheet-page');
    expect(sheets).toHaveLength(3);

    // İçerik kaybı yok: her sayfanın kendi içeriği basılır
    expect(screen.getByText('Sayfa İçeriği 1')).toBeTruthy();
    expect(screen.getByText('Sayfa İçeriği 2')).toBeTruthy();
    expect(screen.getByText('Sayfa İçeriği 3')).toBeTruthy();

    // Numaralandırma art arda devam eder
    expect(container.textContent).toContain('Sayfa 3 / 5');
    expect(container.textContent).toContain('Sayfa 4 / 5');
    expect(container.textContent).toContain('Sayfa 5 / 5');
  });

  it('tek sayfalık etkinlikte tek A4 üretir', () => {
    const item = {
      id: 'single-1',
      type: ActivityType.FIND_LETTER_PAIR,
      difficulty: 'Orta',
      pageCount: 1,
      order: 0,
      content: { title: 'Tek Sayfa', items: [{ id: 1 }] },
    } as unknown as FascicleItem;

    const { container } = render(
      <FascicleMultiPageRenderer
        item={item}
        itemIndex={0}
        metadata={metadata}
        startPageNumber={1}
        grandTotalPages={2}
        renderWatermark={() => null}
      />
    );

    expect(container.querySelectorAll('.worksheet-page')).toHaveLength(1);
  });
});
