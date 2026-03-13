import { create } from 'zustand';
import { PaperSize } from '../utils/printService';

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
  },
}));
