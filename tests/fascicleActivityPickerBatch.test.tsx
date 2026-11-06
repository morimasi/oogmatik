// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { FascicleActivityPicker } from '../src/components/FascicleStudio/FascicleActivityPicker';
import { useFascicleStore } from '../src/store/useFascicleStore';

describe('FascicleActivityPicker — arama & toplu seçim (FEA-3)', () => {
  beforeEach(() => {
    useFascicleStore.getState().reset();
    cleanup();
  });

  it('modal açıldığında etkinlik havuzunu ve kategori sekmelerini gösterir', () => {
    render(<FascicleActivityPicker isOpen onClose={() => undefined} />);

    expect(screen.getByText('Etkinlik Havuzu')).toBeTruthy();
    expect(screen.getByLabelText('Etkinlik ara')).toBeTruthy();
    expect(screen.getByLabelText('Kapat')).toBeTruthy();
  });

  it('arama kutusuna yazıldığında sonuç başlığı güncellenir', () => {
    render(<FascicleActivityPicker isOpen onClose={() => undefined} />);

    const input = screen.getByLabelText('Etkinlik ara');
    fireEvent.change(input, { target: { value: 'stroop' } });

    expect(screen.getByText(/için Sonuçlar/)).toBeTruthy();
    expect(screen.getByLabelText('Aramayı temizle')).toBeTruthy();
  });

  it('bir etkinlik toplu seçime alındığında toplu ekleme çubuğu görünür', () => {
    render(<FascicleActivityPicker isOpen onClose={() => undefined} />);

    const toggles = screen.getAllByLabelText(/toplu seçime ekle$/);
    expect(toggles.length).toBeGreaterThan(0);

    fireEvent.click(toggles[0]);

    expect(screen.getByText('1 etkinlik seçildi')).toBeTruthy();
    expect(screen.getByLabelText('Toplu seçimi temizle')).toBeTruthy();
    expect(screen.getByLabelText('Seçilen 1 etkinliği fasiküle ekle')).toBeTruthy();
  });

  it('seçim temizlendiğinde toplu ekleme çubuğu kaybolur', () => {
    render(<FascicleActivityPicker isOpen onClose={() => undefined} />);

    fireEvent.click(screen.getAllByLabelText(/toplu seçime ekle$/)[0]);
    fireEvent.click(screen.getByLabelText('Toplu seçimi temizle'));

    expect(screen.queryByText(/etkinlik seçildi/)).toBeNull();
  });

  it('fasikül zaten içerik barındırıyorsa öğe sayısı korunur (seçim yan etkisiz)', () => {
    useFascicleStore.getState().addItem({
      id: 'existing-1',
      type: 'FIND_LETTER_PAIR',
      difficulty: 'Kolay',
      pageCount: 1,
      order: 0,
      content: { title: 'Mevcut Etkinlik' },
    });

    render(<FascicleActivityPicker isOpen onClose={() => undefined} />);
    fireEvent.click(screen.getAllByLabelText(/toplu seçime ekle$/)[0]);

    // Seçim yapmak fasiküle yazmaz; yalnızca "Seçilenleri Ekle" ekler.
    expect(useFascicleStore.getState().items).toHaveLength(1);
  });
});
