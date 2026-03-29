/**
 * Sınav Service - Frontend API integration
 * Frontend'den /api/generate-exam endpoint'ine istek gönderir
 */

import type { SinavAyarlari, Sinav } from '../types/sinav';
import { AppError } from '../utils/AppError';

/**
 * API endpoint'ine sınav oluşturma isteği gönder
 */
export const generateExamViaAPI = async (settings: SinavAyarlari): Promise<Sinav> => {
  try {
    const response = await fetch('/api/generate-exam', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: AuthStore'dan userId al
        'x-user-id': 'current-user-id'
      },
      body: JSON.stringify(settings)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AppError(
        data.error?.message || 'Sınav oluşturulurken hata oluştu.',
        data.error?.code || 'API_ERROR',
        response.status,
        data,
        response.status >= 500 // Retry only on server errors
      );
    }

    if (!data.success || !data.data) {
      throw new AppError(
        'API yanıtı geçersiz format.',
        'INVALID_API_RESPONSE',
        500,
        data,
        false
      );
    }

    return data.data as Sinav;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      throw error;
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AppError(
        'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.',
        'NETWORK_ERROR',
        0,
        error,
        true
      );
    }

    // Unknown errors
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
    throw new AppError(
      'Beklenmeyen bir hata oluştu.',
      'UNKNOWN_ERROR',
      500,
      { originalError: errorMessage },
      false
    );
  }
};
