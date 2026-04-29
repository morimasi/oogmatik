import { create } from 'zustand';
import { StudentProgressSnapshot } from '../types/progress';
import { AppError } from '../utils/AppError';
import { logError } from '../utils/errorHandler';

interface ProgressStore {
  snapshot: StudentProgressSnapshot | null;
  isLoading: boolean;
  error: string | null;
  fetchProgress: (studentId: string) => Promise<void>;
  clearProgress: () => void;
}

export const useProgressStore = create<ProgressStore>((set) => ({
  snapshot: null,
  isLoading: false,
  error: null,

  fetchProgress: async (studentId: string) => {
    set({ isLoading: true, error: null });
    try {
      // API'den veri çekerken yetkilendirme başlıkları da eklenebilir
      const response = await fetch(`/api/progress?studentId=${studentId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || 'İlerleme verisi alınamadı.');
      }
      const data = await response.json();
      set({ snapshot: data.data, isLoading: false });
    } catch (error) {
      logError(error instanceof Error ? error : new AppError('Store progress fetch error'), { context: 'useProgressStore' });
      set({ 
        error: error instanceof Error ? error.message : 'Veri alınırken bir hata oluştu.', 
        isLoading: false 
      });
    }
  },

  clearProgress: () => {
    set({ snapshot: null, error: null });
  }
}));
