import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdminActivityScaffold } from '../src/components/Admin/AdminActivityScaffold';

vi.mock('../src/services/firebaseClient', () => ({
  db: {},
  collection: vi.fn(),
  getDocs: vi.fn(() => Promise.resolve({
    docs: [],
    forEach: (cb: any) => { /* history boş */ }
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

vi.mock('../src/utils/apiClient', () => ({
  safeFetch: vi.fn(() => Promise.resolve({
    success: true,
    data: {
      message: 'Blueprint kaydedildi ve ajanlardan onaylandı.',
      key: 'AUTO_MODULE_TEST',
      status: 'pending'
    }
  })),
  getAuthHeaders: vi.fn(() => ({
    'x-user-id': 'test-user',
    'x-user-role': 'admin',
    'x-user-tier': 'pro'
  }))
}));

vi.mock('../src/store/useAuthStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 'test-user',
      role: 'admin'
    }
  })
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

  it('Prompt gönderildiğinde backend scaffold endpointine istek atmalı ve başarı mesajını göstermeli', async () => {
    const { container } = render(<AdminActivityScaffold />);

    const input = screen.getByPlaceholderText(/root@oogmatik: ~ Komut girin veya görsel referans yükleyin/i);
    const submitBtn = container.querySelector('button[type="submit"]');
    expect(submitBtn).toBeInstanceOf(HTMLButtonElement);

    fireEvent.change(input, { target: { value: 'Disleksili 2. sınıf için matematik testi üret' } });
    fireEvent.click(submitBtn as Element);

    expect(screen.getByText('Disleksili 2. sınıf için matematik testi üret')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Blueprint backend tarafından kabul edildi/i)).toBeDefined();
    }, { timeout: 3000 });
  });

  it('Terminal geçmişi sıfırlama işlevi doğru çalışmalı', async () => {
    // Window.confirm dialogunu mock et (evet dön)
    global.window.confirm = vi.fn(() => true);

    render(<AdminActivityScaffold />);
    
    const clearBtn = screen.getByTitle('Sıfırla');
    fireEvent.click(clearBtn);

    // Silme sonrası onay mesajı ekrana yansımalı
    await waitFor(() => {
      expect(screen.getByText(/Terminal Sıfırlandı./i)).toBeDefined();
    });
  });
});
