import { create } from 'zustand';
import { PaperSize } from '../utils/printService';
import { loadCurrentUserPaperSize, saveCurrentUserPaperSize } from '../services/paperSizeApi';
import { safeFetch, getAuthHeaders } from '../utils/apiClient';
import { User } from '../types';

type PaperSizeState = {
  paperSize: PaperSize;
  setPaperSize: (p: PaperSize) => void;
};

export const usePaperSizeStore = create<PaperSizeState>((set) => ({
  paperSize:
    (typeof window !== 'undefined'
      ? (localStorage.getItem('oogmatik.paperSize') as PaperSize)
      : null) || 'Extreme_Dikey',
  setPaperSize: (p: PaperSize) => {
    set({ paperSize: p });
    if (typeof window !== 'undefined') localStorage.setItem('oogmatik.paperSize', p);
    // Persist to server (best-effort, only works with authenticated user)
    (async () => {
      try {
        await saveCurrentUserPaperSize(p);
      } catch {
        // ignore persistence errors in UI
      }
    })();
  },
}));

// Initialize paper size for the current user (if logged in) or fallback to localStorage
export const initPaperSizeForCurrentUser = async (user: User | null) => {
  try {
    const { setPaperSize } = usePaperSizeStore.getState();
    if (user && user.id) {
      const serverSize = await (async () => {
        try {
          // Load size from server; if endpoint is unavailable, fall back to localStorage
          const data = await safeFetch<{ paperSize: PaperSize }>(
            '/api/user/paperSize',
            {
              method: 'GET',
              headers: getAuthHeaders(user.id, user.role),
            }
          );
          return data?.paperSize ?? null;
        } catch {
          return null;
        }
      })();
      if (serverSize) {
        setPaperSize(serverSize);
        localStorage.setItem('oogmatik.paperSize', serverSize);
        return;
      }
    }
    const local = localStorage.getItem('oogmatik.paperSize');
    if (local) {
      setPaperSize(local as PaperSize);
    }
  } catch {
    // silent fail; rely on localStorage fallback
  }
};

// Reset to default (Extreme_Dikey) and clear local user-specific value
export const resetPaperSizeToDefault = () => {
  const { setPaperSize } = usePaperSizeStore.getState();
  setPaperSize('Extreme_Dikey');
  if (typeof window !== 'undefined') localStorage.removeItem('oogmatik.paperSize');
};
