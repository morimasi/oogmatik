import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminActivityScaffold } from '../src/components/Admin/AdminActivityScaffold';
import * as firebaseClient from '../src/services/firebaseClient';

// Firebase Mocking
vi.mock('../src/services/firebaseClient', () => ({
  db: {},
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [],
    forEach: (cb: any) => { /* history bos */ }
  })),
  setDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  deleteDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(),
  orderBy: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => date)
  }
}));

describe('AdminActivityScaffold (Otonom CLI Terminal)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Terminal ekranı eksiksiz şekilde yüklenmeli (Welcome Message görünmeli)', async () => {
    render(<AdminActivityScaffold />);
    
    // Yüklenme sonrası sistemin "Hoş Geldiniz" mesajı atamasını bekliyoruz
    await waitFor(() => {
      expect(screen.getByText(/Oogmatik Agent CLI v2.0 Sistemine Hoş Geldiniz/i)).toBeDefined();
    });
  });

  it('Prompt gönderildiğinde ajanların otonom simülasyonu ateşlenmeli', async () => {
    render(<AdminActivityScaffold />);
    
    // Inputu bul ve komut gönder
    const input = screen.getByPlaceholderText(/Aktivite konsepti, pedagogik hedef veya doğrudan prompt giriniz/i);
    const submitBtn = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'Disleksili 2. sınıf için matematik testi üret' } });
    fireEvent.click(submitBtn);

    // Kullanıcının yazdığı mesajın ekranda olduğunu onayla
    expect(screen.getByText('Disleksili 2. sınıf için matematik testi üret')).toBeDefined();

    // Elif Yıldız (Pedagoji) ajanın yüklenmesini bekle (setTimeout 600ms)
    await waitFor(() => {
      expect(screen.getByText(/ZPD \(Yakınsal Gelişim Alanı\) analizi başlatılıyor/i)).toBeDefined();
    }, { timeout: 1000 });

    // Dr. Ahmet Kaya (Klinik) beklentisi (setTimeout 1800ms kümülatif)
    await waitFor(() => {
      expect(screen.getByText(/Klinik olarak dikkat dağıtıcılardan arındırılmış/i)).toBeDefined();
    }, { timeout: 2500 });
  });

  it('Terminal geçmişi sıfırlama işlevi doğru çalışmalı', async () => {
    // Window.confirm dialogunu mock et (evet dön)
    global.window.confirm = vi.fn(() => true);

    render(<AdminActivityScaffold />);
    
    const clearBtn = screen.getByTitle('Tüm geçmişi temizle');
    fireEvent.click(clearBtn);

    // Silme sonrası onay mesajı ekrana yansımalı
    await waitFor(() => {
      expect(screen.getByText(/Terminal Sıfırlandı./i)).toBeDefined();
    });
  });
});
