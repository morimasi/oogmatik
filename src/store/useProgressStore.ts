import { create } from 'zustand';
import { StudentProgressSnapshot } from '../types/progress';
import { AppError } from '../utils/AppError';
import { logError } from '../utils/errorHandler';
import { safeFetch, getAuthHeaders } from '../utils/apiClient';
import { useAuthStore } from './useAuthStore';

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
      const user = useAuthStore.getState().user;
      if (!user) {
        // Oturum henüz yüklenmemiş olabilir, hata fırlatmak yerine bekle
        set({ isLoading: false });
        return;
      }

      const response = await safeFetch<{ success: boolean; data: StudentProgressSnapshot }>(
        `/api/progress?studentId=${studentId}`,
        {
          method: 'GET',
          headers: getAuthHeaders(user.id, user.role),
        }
      );
      
      set({ snapshot: response.data, isLoading: false });
    } catch (error: any) {
      logError(error instanceof Error ? error : new AppError('Store progress fetch error'), { context: 'useProgressStore' });
      set({ 
        error: error.userMessage || error.message || 'Veri alınırken bir hata oluştu.', 
        isLoading: false 
      });
    }
  },

  clearProgress: () => {
    set({ snapshot: null, error: null });
  }
}));
