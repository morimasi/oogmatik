/**
 * OOGMATIK - Merkezi Error Yönetim Sistemi
 * Tüm hataları standardize eden custom Error class
 */

export class AppError extends Error {
  constructor(
    public userMessage: string, // Kullanıcı dostu mesaj
    public code: string, // Sistem kodlaması (DEBUG)
    public httpStatus: number = 500, // HTTP durum kodu
    public details?: Record<string, any>, // Debug detayları
    public isRetryable: boolean = false // Tekrar denenebilir mi?
  ) {
    super(userMessage);
    this.name = 'AppError';
  }

  /**
   * Error'ı JSON'a dönüştür (logging için)
   */
  toJSON() {
    let isDev = false;
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      isDev = true;
    } else if (typeof window !== 'undefined' && (window as any).__VITE_IS_DEV__) {
      isDev = true;
    }
    return {
      name: this.name,
      code: this.code,
      userMessage: this.userMessage,
      httpStatus: this.httpStatus,
      isRetryable: this.isRetryable,
      details: isDev ? this.details : undefined,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Özel Error Tiplemeleri
 */

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message || 'Giriş verileri geçersiz.', 'VALIDATION_ERROR', 400, details, false);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Oturumunuz sona ermiştir. Lütfen yeniden giriş yapınız.') {
    super(message, 'AUTH_ERROR', 401, undefined, false);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Bu işlemi yapmaya yetkiniz yok.') {
    super(message, 'AUTHORIZATION_ERROR', 403, undefined, false);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Kaynak') {
    super(`${resource} bulunamadı.`, 'NOT_FOUND', 404, { resource }, false);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter: number = 60) {
    super(
      `Çok hızlı istek gönderdiniz. ${retryAfter} saniye sonra tekrar deneyiniz.`,
      'RATE_LIMIT_EXCEEDED',
      429,
      { retryAfter },
      true // Retry edilebilir
    );
    this.name = 'RateLimitError';
  }
}

export class TimeoutError extends AppError {
  constructor(operation: string = 'İşlem', timeoutMs: number = 5000) {
    super(
      `${operation} çok uzun sürüyor. Lütfen yeniden deneyiniz.`,
      'TIMEOUT',
      504,
      { operation, timeoutMs },
      true // Retry edilebilir
    );
    this.name = 'TimeoutError';
  }
}

export class NetworkError extends AppError {
  constructor(message?: string) {
    super(
      message || 'İnternet bağlantısında sorun var. Bağlantınızı kontrol edin.',
      'NETWORK_ERROR',
      503,
      undefined,
      true // Retry edilebilir
    );
    this.name = 'NetworkError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'İstek çakışması oluştu. Lütfen yeniden deneyiniz.') {
    super(message, 'CONFLICT', 409, undefined, true);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Sunucu hatası oluştu. Lütfen destek ile iletişime geçin.') {
    super(message, 'INTERNAL_SERVER_ERROR', 500, undefined, true);
    this.name = 'InternalServerError';
  }
}

export class AIServiceError extends AppError {
  constructor(
    message: string = 'AI servisi şu anda kullanılamıyor. Lütfen birkaç dakika sonra deneyiniz.'
  ) {
    super(message, 'AI_SERVICE_UNAVAILABLE', 503, undefined, true);
    this.name = 'AIServiceError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Veritabanı hatası oluştu.', originalError?: Error) {
    super(
      message,
      'DATABASE_ERROR',
      500,
      originalError ? { originalMessage: originalError.message } : undefined,
      true
    );
    this.name = 'DatabaseError';
  }
}

/**
 * Type Guard: unknown -> AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Error'ı AppError'a dönüştür (unknown -> AppError)
 */
export function toAppError(error: unknown): AppError {
  // Zaten AppError ise
  if (isAppError(error)) {
    return error;
  }

  // Standart Error nesnesi
  if (error instanceof Error) {
    // Firebase Authentication hatası
    if ('code' in error) {
      const code = (error as any).code;

      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        return new AuthenticationError('E-posta veya şifre hatalı.');
      }

      if (code === 'auth/email-already-in-use') {
        return new ValidationError('Bu e-posta adresi zaten kayıtlı.');
      }

      if (code === 'auth/weak-password') {
        return new ValidationError('Şifre en az 6 karakter olmalıdır.');
      }

      if (code === 'auth/network-request-failed') {
        return new NetworkError('Sunucuya ulaşılamadı.');
      }
    }

    // Network hatası
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return new NetworkError();
    }

    // Timeout
    if (error.message.includes('timeout')) {
      return new TimeoutError();
    }

    // Firestore hatası
    if (error.message.includes('PERMISSION_DENIED')) {
      return new AuthorizationError();
    }

    // Default: Generic error
    let isDev = false;
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      isDev = true;
    } else if (typeof window !== 'undefined' && (window as any).__VITE_IS_DEV__) {
      isDev = true;
    }
    return new InternalServerError(isDev ? error.message : undefined);
  }

  // String hata
  if (typeof error === 'string') {
    return new InternalServerError(error);
  }

  // Tamamen unknown
  return new InternalServerError('Bilinmeyen hata oluştu.');
}
