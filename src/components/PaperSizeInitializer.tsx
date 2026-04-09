import React, { useEffect } from 'react';
import { loadCurrentUserPaperSize } from '../services/paperSizeApi';
import { usePaperSizeStore } from '../store/usePaperSizeStore';
import { PaperSize } from '../utils/printService';
import { useAuthStore } from '../store/useAuthStore';

export const PaperSizeInitializer: React.FC = () => {
  const paperSizeStore = usePaperSizeStore();
  const auth = useAuthStore((s: any) => s);

  useEffect(() => {
    (async () => {
      const user = auth?.user;
      if (user?.id) {
        try {
          const serverSize = await loadCurrentUserPaperSize();
          if (serverSize) {
            paperSizeStore.setPaperSize(serverSize as PaperSize);
            localStorage.setItem('oogmatik.paperSize', serverSize);
          } else {
            const local = localStorage.getItem('oogmatik.paperSize');
            if (local) paperSizeStore.setPaperSize(local as PaperSize);
          }
        } catch {
          const local = localStorage.getItem('oogmatik.paperSize');
          if (local) paperSizeStore.setPaperSize(local as PaperSize);
        }
      } else {
        const local = localStorage.getItem('oogmatik.paperSize');
        if (local) paperSizeStore.setPaperSize(local as PaperSize);
      }
    })();
  }, [auth?.user?.id]);

  useEffect(() => {
    if (!auth?.user) {
      paperSizeStore.setPaperSize('Extreme_Dikey');
      localStorage.removeItem('oogmatik.paperSize');
    }
  }, [auth?.user]);

  return null;
};
