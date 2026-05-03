import { safeFetch, getAuthHeaders } from '../utils/apiClient';
import { useAuthStore } from '../store/useAuthStore';
import type { PaperSize } from '../utils/printService';

const STORAGE_KEY = 'oogmatik.paperSize';

export async function loadCurrentUserPaperSize(): Promise<PaperSize | null> {
  try {
    const user = useAuthStore.getState().user;
    if (!user) return null;

    // Try to load from server first
    const data = await safeFetch<{ paperSize: PaperSize }>(
      '/api/user/paperSize',
      {
        method: 'GET',
        headers: getAuthHeaders(user.id, user.role),
      }
    );

    const paperSize = data?.paperSize ?? 'Extreme_Dikey';
    localStorage.setItem(STORAGE_KEY, paperSize);
    return paperSize;
  } catch {
    // Fallback to localStorage on network errors
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return stored as PaperSize;
    }
    return 'Extreme_Dikey';
  }
}

export async function saveCurrentUserPaperSize(size: PaperSize): Promise<void> {
  try {
    const user = useAuthStore.getState().user;
    if (!user) {
      localStorage.setItem(STORAGE_KEY, size);
      return;
    }

    // Try to save to server
    await safeFetch(
      '/api/user/paperSize',
      {
        method: 'POST',
        headers: getAuthHeaders(user.id, user.role),
        body: JSON.stringify({ paperSize: size }),
      }
    );

    localStorage.setItem(STORAGE_KEY, size);
  } catch {
    // Save to localStorage as fallback
    localStorage.setItem(STORAGE_KEY, size);
  }
}
