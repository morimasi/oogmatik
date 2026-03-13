import { create } from 'zustand';
import { PaperSize } from '../utils/printService';
import { loadCurrentUserPaperSize, saveCurrentUserPaperSize } from '../services/paperSizeApi';

type PaperSizeState = {
  paperSize: PaperSize;
  setPaperSize: (p: PaperSize) => void;
};

export const usePaperSizeStore = create<PaperSizeState>((set) => ({
  paperSize:
    (typeof window !== 'undefined'
      ? (localStorage.getItem('oogmatik.paperSize') as PaperSize)
      : null) || 'A4',
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
export const initPaperSizeForCurrentUser = async (user: any) => {
  try {
    const { setPaperSize } = usePaperSizeStore.getState();
    if (user && user.id) {
      const serverSize = await (async () => {
        try {
          // Load size from server; if endpoint is unavailable, fall back to localStorage
          const res = (await fetch('/user/paperSize', {
            method: 'GET',
            credentials: 'include',
            headers: { Accept: 'application/json' },
          })) as Response;
          if (res.ok) {
            const data = await res.json();
            return (data?.paperSize as PaperSize) ?? null;
          }
        } catch {
          return null;
        }
        return null;
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

// Reset to default (A4) and clear local user-specific value
export const resetPaperSizeToDefault = () => {
  const { setPaperSize } = usePaperSizeStore.getState();
  setPaperSize('A4');
  if (typeof window !== 'undefined') localStorage.removeItem('oogmatik.paperSize');
};
