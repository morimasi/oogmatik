/**
 * Sınav Service - Frontend API integration
 * Frontend'den /api/generate-exam endpoint'ine istek gönderir
 */

import type { SinavAyarlari, Sinav } from '../types/sinav';
import { AppError } from '../utils/AppError';
import { safeFetch } from '../utils/apiClient';

/**
 * API endpoint'ine sınav oluşturma isteği gönder
 */
export const generateExamViaAPI = async (settings: SinavAyarlari): Promise<Sinav> => {
  const data = await safeFetch<{success: boolean, data: Sinav}>('/api/generate-exam', {
    method: 'POST',
    body: JSON.stringify(settings)
  });

  if (!data.success || !data.data) {
    throw new AppError(
      'API yanıtı geçersiz format.',
      'INVALID_API_RESPONSE',
      500,
      data,
      false
    );
  }

  return data.data;
};
