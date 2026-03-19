export type PaperSize = 'A4' | 'Letter' | 'Legal';

const STORAGE_KEY = 'oogmatik.paperSize';

export async function loadCurrentUserPaperSize(): Promise<PaperSize | null> {
  try {
    // Try to load from server first
    const res = await fetch('/api/user/paperSize', {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const paperSize = (data?.paperSize as PaperSize) ?? 'A4';
      localStorage.setItem(STORAGE_KEY, paperSize);
      return paperSize;
    }

    // Fallback to localStorage if server fails
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'A4' || stored === 'Letter' || stored === 'Legal') {
      return stored;
    }
    return 'A4';
  } catch {
    // Fallback to localStorage on network errors
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'A4' || stored === 'Letter' || stored === 'Legal') {
      return stored;
    }
    return 'A4';
  }
}

export async function saveCurrentUserPaperSize(size: PaperSize): Promise<void> {
  try {
    // Try to save to server
    const res = await fetch('/api/user/paperSize', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paperSize: size }),
    });

    if (res.ok || res.status === 401) {
      // Also save to localStorage as backup
      localStorage.setItem(STORAGE_KEY, size);
    }
  } catch {
    // Save to localStorage as fallback
    localStorage.setItem(STORAGE_KEY, size);
  }
}
