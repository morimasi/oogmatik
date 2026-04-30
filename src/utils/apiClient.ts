import { AppError } from './AppError.js';
import { logError } from './logger.js';

/**
 * OOGMATIK - Güvenli Fetch İstemcisi
 * Sunucu tarafındaki 500/504 HTML hatalarını JSON parse hatasına dönüşmeden yakalar.
 * 
 * Muhendislik Direktoru Bora Demir: "Naked fetch" kullanımı yasaktır, her zaman safeFetch kullanılmalı.
 */
export async function safeFetch<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    const contentType = response.headers.get('content-type');
    
    // Yanıt OK değilse
    if (!response.ok) {
      let errorMessage = `Sunucu Hatası (${response.status})`;
      
      if (contentType && contentType.includes('application/json')) {
        const errData = await response.json().catch(() => ({}));
        errorMessage = errData.error?.message || errData.message || errorMessage;
      } else {
        const textError = await response.text().catch(() => '');
        logError('API JSON dışı yanıt döndürdü', { 
          status: response.status, 
          url,
          text: textError.substring(0, 100) 
        });
        
        if (response.status === 504) errorMessage = 'Sunucu zaman aşımına uğradı. Lütfen tekrar deneyin.';
        else if (response.status === 500) errorMessage = 'Sunucu tarafında beklenmedik bir hata oluştu.';
      }
      
      throw new AppError(errorMessage, 'API_FETCH_ERROR', response.status);
    }

    // Yanıt JSON değilse (Beklenmeyen durum)
    if (!contentType || !contentType.includes('application/json')) {
      const preview = await response.text().catch(() => '');
      logError('Beklenmeyen içerik tipi', { url, contentType, preview: preview.substring(0, 50) });
      throw new AppError('Sunucudan geçersiz veri formatı alındı.', 'INVALID_FORMAT', 500);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AppError) throw error;
    
    logError('Network Request Failed', { url, error });
    
    if (error instanceof SyntaxError) {
      throw new AppError('Sunucudan gelen veri işlenemedi (JSON Hatası).', 'PARSE_ERROR', 500);
    }
    
    throw error;
  }
}
