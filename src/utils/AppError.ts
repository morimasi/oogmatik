/**
 * BDMIND - Merkezi Error Yönetim Sistemi
 * Tüm hataları standardize eden custom Error class
 */

export class AppError extends Error {
  public originalError?: unknown;

  constructor(
    public userMessage: string, // Kullanıcı dostu mesaj
    public code: string, // Sistem kodlaması (DEBUG)
    public httpStatus: number = 500, // HTTP durum kodu
    public details?: Record<string, unknown>, // Debug detayları
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
  constructor(message: string, details?: Record<string, unknown>) {
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
  constructor(message?: string, details?: { retryAfter?: number } ) {
    const retryAfter = details?.retryAfter || 60;
    super(
      message || `Çok hızlı istek gönderdiniz. ${retryAfter} saniye sonra tekrar deneyiniz.`,
      'RATE_LIMIT_EXCEEDED',
      429,
      { ...details, retryAfter },
      true // Retry edilebilir
    );
    this.name = 'RateLimitError';
  }
}

export class QuotaExceededError extends AppError {
  constructor(message: string = 'Sistem AI kapasitesine ulaşmıştır. Lütfen daha sonra tekrar deneyiniz veya sistem yöneticinize başvurun.') {
    super(
      message,
      'APAI_QUOTA_EXCEEDED',
      403,
      undefined,
      false // Fatura/Quota dolduğu için anında retry işe yaramaz
    );
    this.name = 'QuotaExceededError';
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
export function toAppError(
  error: unknown,
  defaultMessage?: string,
  defaultCode?: string
): AppError {
  // Zaten AppError ise
  if (isAppError(error)) {
    return error;
  }

  let result: AppError;

  // Standart Error nesnesi (FirebaseError de Error'dan türemiştir)
  if (error instanceof Error) {
    const code = (error as any).code;

    // Firebase Auth hataları
    if (code && code.startsWith('auth/')) {
      if (
        code === 'auth/invalid-credential' ||
        code === 'auth/user-not-found' ||
        code === 'auth/wrong-password'
      ) {
        result = new AuthenticationError('E-posta veya şifre hatalı.');
      } else if (code === 'auth/email-already-in-use') {
        result = new ValidationError('Bu e-posta adresi zaten kayıtlı.');
      } else if (code === 'auth/weak-password') {
        result = new ValidationError('Şifre en az 6 karakter olmalıdır.');
      } else if (code === 'auth/network-request-failed') {
        result = new NetworkError('Sunucuya ulaşılamadı.');
      } else {
        result = new AuthenticationError(defaultMessage || 'Kimlik doğrulama hatası.');
      }
    }
    // Firebase Firestore hataları
    else if (code && code.startsWith('firestore/')) {
      if (code === 'firestore/permission-denied') {
        result = new AuthorizationError('Veritabanı erişim izniniz yok. Yönetici ile iletişime geçin.');
      } else if (code === 'firestore/unavailable') {
        result = new NetworkError('Veritabanı şu anda kullanılamıyor.');
      } else if (code === 'firestore/deadline-exceeded') {
        result = new TimeoutError('Veritabanı');
      } else if (code === 'firestore/quota-exceeded') {
        result = new QuotaExceededError('Veritabanı kotası dolmuştur.');
      } else if (code === 'firestore/failed-precondition') {
        result = new ConflictError('İşlem çakışması oluştu. Lütfen yeniden deneyiniz.');
      } else if (code === 'firestore/invalid-argument') {
        result = new ValidationError('Geçersiz veri gönderildi.');
      } else {
        result = new DatabaseError(defaultMessage || `Veritabanı hatası: ${code}`);
      }
    }
    // Network hatası
    else if (error.message.includes('fetch') || error.message.includes('network')) {
      result = new NetworkError();
    }
    // Timeout
    else if (error.message.includes('timeout')) {
      result = new TimeoutError();
    }
    // Firestore PERMISSION_DENIED (mesaj bazlı, eski sürümler için)
    else if (error.message.includes('PERMISSION_DENIED') || error.message.includes('permission-denied')) {
      result = new AuthorizationError();
    }
    // Default: Generic error
    else {
      let isDev = false;
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
        isDev = true;
      } else if (typeof window !== 'undefined' && (window as any).__VITE_IS_DEV__) {
        isDev = true;
      }
      result = new InternalServerError(defaultMessage || (isDev ? error.message : undefined));
      if (defaultCode) result.code = defaultCode;
    }
  }
  // Plain object with code (non-Error Firebase objects)
  else if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as any).code;

    if (code && code.startsWith('auth/')) {
      result = new AuthenticationError(defaultMessage || 'Kimlik doğrulama hatası.');
    } else if (code && code.startsWith('firestore/')) {
      if (code === 'firestore/permission-denied') {
        result = new AuthorizationError('Veritabanı erişim izniniz yok.');
      } else {
        result = new DatabaseError(defaultMessage || `Veritabanı hatası: ${code}`);
      }
    } else {
      result = new InternalServerError(defaultMessage || 'Bilinmeyen hata oluştu.');
      result.code = defaultCode || 'UNKNOWN_ERROR';
    }
  }
  // String hata
  else if (typeof error === 'string') {
    result = new InternalServerError(defaultMessage || error);
    if (defaultCode) result.code = defaultCode;
  }
  // Tamamen unknown
  else {
    result = new InternalServerError(defaultMessage || 'Bilinmeyen hata oluştu.');
    if (defaultCode) result.code = defaultCode;
  }

  result.originalError = error;
  return result;
}
