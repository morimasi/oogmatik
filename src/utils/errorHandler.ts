import { logInfo, logError, logWarn } from '../utils/logger.js';

/**
 * OOGMATIK - Error Handler Utilities
 * Error transformation, retry logic, logging
 */

import {
  AppError,
  toAppError,
  NetworkError,
  TimeoutError,
  RateLimitError,
  InternalServerError,
  isAppError,
} from './AppError.js';

/**
 * EXTERNAL MONITORING: Pluggable error reporter
 *
 * Kullanım (main.tsx veya App.tsx içinde):
 * ```
 * import * as Sentry from '@sentry/browser';
 * Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
 * setErrorReporter((log) => Sentry.captureException(new Error(log.userMessage), { extra: log }));
 * ```
 * Herhangi bir external monitoring servisi (Sentry, Datadog, Loggly vb.) bağlanabilir.
 * VITE_SENTRY_DSN tanımlıysa, lightweight HTTP reporter otomatik aktif olur.
 */
type ErrorReporter = (errorLog: Record<string, unknown>) => void;
let _externalReporter: ErrorReporter | null = null;

export const setErrorReporter = (reporter: ErrorReporter | null): void => {
  _externalReporter = reporter;
};

/**
 * Lightweight Sentry HTTP reporter — SDK kurulumu gerektirmez.
 * VITE_SENTRY_DSN tanımlanmışsa otomatik devreye girer.
 */
const sendToSentryHttp = (errorLog: Record<string, unknown>): void => {
  const sentryDsn =
    typeof window !== 'undefined'
      ? (window as unknown as Record<string, string>).__SENTRY_DSN__
      : undefined;

  // Vite env var desteği (build-time inject)
  const dsn =
    sentryDsn ??
    (typeof (globalThis as Record<string, unknown>).__VITE_SENTRY_DSN__ === 'string'
      ? (globalThis as unknown as Record<string, string>).__VITE_SENTRY_DSN__
      : undefined);

  if (!dsn) return;

  // DSN parse: https://<key>@<host>/<projectId>
  const match = dsn.match(/^https?:\/\/([^@]+)@([^/]+)\/(.+)$/);
  if (!match) return;
  const [, key, host, projectId] = match;

  // Güvenlik: host yalnızca bilinen Sentry domainlerine izin ver (SSRF önleme)
  if (!host.endsWith('.sentry.io') && host !== 'sentry.io') return;

  // Fire-and-forget — uygulama akışını engellemesin
  fetch(`https://${host}/api/${projectId}/store/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${key}`,
    },
    body: JSON.stringify({
      message: String(errorLog.userMessage ?? 'Unknown error'),
      level: 'error',
      extra: errorLog,
      timestamp: String(errorLog.timestamp ?? new Date().toISOString()),
    }),
    keepalive: true,
  }).catch(() => {
    /* monitoring hatası uygulamayı bozmamalı */
  });
};

/**
 * LOGGING: Centralized error logging
 */
export const logError = (error: AppError, context?: Record<string, unknown>) => {
  const errorLog: Record<string, unknown> = {
    ...error.toJSON(),
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
  };

  // Console'da debug
  let isDev = false;
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
    isDev = true;
  } else if (
    typeof window !== 'undefined' &&
    (window as unknown as Record<string, boolean>).__VITE_IS_DEV__
  ) {
    isDev = true;
  }

  if (isDev) {
    console.group(`🔴 AppError: ${error.code}`);
    logError('Message:', error.message);
    if (error.originalError) logError('Original:', error.originalError);
    if (context) console.dir(context);
    console.groupEnd();
  }

  // External reporting
  if (_externalReporter) {
    _externalReporter(errorLog);
  } else {
    sendToSentryHttp(errorLog);
  }
};

/**
 * WRAPPER: Async function error handler
 * Catch errors and transform to AppError
 */
export const wrapAsync = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  defaultMessage: string = 'İşlem başarısız',
  defaultCode: string = 'INTERNAL_ERROR'
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      if (isAppError(error)) throw error;
      throw toAppError(error, defaultMessage, defaultCode);
    }
  };
};

/**
 * RETRY LOGIC: Exponential backoff with jitter
 *
 * Örnek:
 * await retryWithBackoff(
 *   () => fetchData(),
 *   { maxRetries: 3, initialDelay: 1000 }
 * )
 */
export interface RetryOptions {
  maxRetries?: number; // Maksimum deneme sayısı (default: 3)
  initialDelay?: number; // İlk bekleme (ms, default: 1000)
  maxDelay?: number; // Maksimum bekleme (ms, default: 30000)
  backoffMultiplier?: number; // Üstel artış faktörü (default: 2)
  shouldRetry?: (error: AppError) => boolean; // Hangi hatalar retry edilsin?
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    shouldRetry = (error) => error.isRetryable,
  } = options;

  let lastError: AppError | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const appError = toAppError(error);
      lastError = appError;

      // Retry edilmemesi gereken hata?
      if (!shouldRetry(appError)) {
        throw appError;
      }

      // Son denemeyse hata fırlat
      if (attempt === maxRetries - 1) {
        logError(appError, { attempt: attempt + 1, maxRetries });
        throw appError;
      }

      // Exponential backoff (üstel artış)
      const exponentialDelay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      // Full jitter (AWS önerisi): [0, exponentialDelay] aralığında rastgele seç.
      // ±10%'lik kısmi jitter yerine tam yayılım → thundering herd tamamen önlenir.
      const finalDelay = Math.max(100, Math.random() * exponentialDelay);

      logWarn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${finalDelay.toFixed(0)}ms...`,
        { errorCode: appError.code }
      );

      await new Promise((resolve) => setTimeout(resolve, finalDelay));
    }
  }

  // Tüm denemeler başarısız
  if (lastError) {
    throw lastError;
  }

  throw new InternalServerError('Retry loop failed unexpectedly');
};

/**
 * TIMEOUT WRAPPER: Promise'e zaman limiti koy
 *
 * Örnek:
 * await withTimeout(fetchData(), 5000, 'Data fetching')
 */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string = 'İşlem'
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError(operationName, timeoutMs)), timeoutMs)
    ),
  ]);
};

/**
 * NETWORK CHECK: Bağlantı durumunu kontrol et
 */
export const checkNetworkConnection = async (
  checkUrl: string = 'https://www.google.com/favicon.ico'
): Promise<boolean> => {
  try {
    // Offline modu kontrol et
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return false;
    }

    // Sunucuya ping at
    const response = await fetch(checkUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
    });

    return response.ok || response.status === 0; // CORS no-cors modu 0 döner
  } catch {
    return false;
  }
};

/**
 * SAFE ASYNC: Ama error'a catch bloğu gerek yok
 *
 * Örnek:
 * const [data, error] = await safeAsync(() => fetchData())
 * if (error) { ... } else { use(data) }
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>,
  onError?: (error: AppError) => void
): Promise<[T | null, AppError | null]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error: unknown) {
    const appError = toAppError(error);
    onError?.(appError);
    logError(appError);
    return [null, appError];
  }
};

/**
 * BATCH RETRY: Birden fazla işlemi paralel olarak retry et
 */
export const batchRetry = async <T>(
  tasks: Array<() => Promise<T>>,
  options: RetryOptions = {}
): Promise<{ success: T[]; failed: Array<{ task: () => Promise<T>; error: AppError }> }> => {
  const success: T[] = [];
  const failed: Array<{ task: () => Promise<T>; error: AppError }> = [];

  const results = await Promise.allSettled(tasks.map((task) => retryWithBackoff(task, options)));

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      success.push(result.value);
    } else {
      failed.push({
        task: tasks[index],
        error: toAppError(result.reason),
      });
    }
  });

  return { success, failed };
};

/**
 * CIRCUIT BREAKER: Başarısız request'lerin çok fazla denmesini önle
 *
 * Örnek:
 * const breaker = new CircuitBreaker(100, 60000);
 * if (breaker.canAttempt()) {
 *   await makeRequest()
 * }
 */
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(
    private failureThreshold: number = 5, // Kaç hata sonra aç?
    private resetTimeoutMs: number = 60000 // Ne kadar sonra resetle?
  ) { }

  canAttempt(): boolean {
    const now = Date.now();

    // OPEN state: Timeout geçtiyse HALF_OPEN'a geç
    if (this.state === 'OPEN') {
      if (now - this.lastFailureTime > this.resetTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.failureCount = 0;
        return true;
      }
      return false;
    }

    return true;
  }

  recordSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failureCount = 0;
    }
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      logWarn(
        `[CircuitBreaker] Opened after ${this.failureCount} failures. Will retry in ${this.resetTimeoutMs}ms`
      );
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
  }
}

/**
 * BATCH OPERATION: Hata olmadığında toplu işlem yap
 *
 * Örnek:
 * await batchOperation(
 *   [item1, item2, item3],
 *   (item) => saveToFirestore(item),
 *   { batchSize: 10 }
 * )
 */
export interface BatchOperationOptions {
  batchSize?: number; // Kaçlısını paralel yapsa
  delayBetweenBatches?: number; // Batch'ler arasında bekleme
  onProgress?: (completed: number, total: number) => void;
}

export const batchOperation = async <T, R>(
  items: T[],
  operation: (item: T) => Promise<R>,
  options: BatchOperationOptions = {}
): Promise<{ results: R[]; errors: Array<{ item: T; error: AppError }> }> => {
  const { batchSize = 10, delayBetweenBatches = 100, onProgress } = options;

  const results: R[] = [];
  const errors: Array<{ item: T; error: AppError }> = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const batchResults = await Promise.allSettled(batch.map((item) => operation(item)));

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        errors.push({
          item: batch[index],
          error: toAppError(result.reason),
        });
      }
    });

    onProgress?.(i + batch.length, items.length);

    // Batch'ler arasında bekle
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return { results, errors };
};

/**
 * ERROR CONTEXT: Error'a context ekle
 */
export const addErrorContext = (error: AppError, context: Record<string, any>): AppError => {
  return new AppError(
    error.userMessage,
    error.code,
    error.httpStatus,
    { ...error.details, ...context },
    error.isRetryable
  );
};

/**
 * API RESPONSE STANDARDIZATION for Vercel Serverless
 * All API routes should use these helpers for consistent responses
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    httpStatus: number;
    timestamp: string;
    requestId?: string;
  };
}

/**
 * Standard API success response format
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  timestamp: string;
  requestId?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Handle API errors with standardized response
 * Usage in API routes:
 * try { ... } catch (error) { return handleApiError(error, res, 'operation-name'); }
 */
export function handleApiError(
  error: unknown,
  res: VercelResponse,
  operationName?: string
): VercelResponse {
  const appError = toAppError(error);

  logError(appError, {
    context: operationName || 'API_ERROR',
    code: appError.code,
    httpStatus: appError.httpStatus,
    isRetryable: appError.isRetryable,
  });

  const response: ApiErrorResponse = {
    success: false,
    error: {
      message: appError.userMessage,
      code: appError.code,
      httpStatus: appError.httpStatus,
      timestamp: new Date().toISOString(),
      requestId: (res as any).locals?.requestId,
    },
  };

  return res.status(appError.httpStatus).json(response);
}

/**
 * Send standardized success response
 */
export function sendApiSuccess<T>(
  res: VercelResponse,
  data: T,
  statusCode: number = 200
): VercelResponse {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
    requestId: (res as any).locals?.requestId,
  };

  return res.status(statusCode).json(response);
}

/**
 * Higher-order function to wrap API handlers with error handling
 */
export function withErrorHandling(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void> | void
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Add request context
      (res as any).locals = (res as any).locals || {};
      (res as any).locals.requestId = req.headers['x-request-id'] || `req-${Date.now()}`;

      await Promise.resolve(handler(req, res));
    } catch (error) {
      handleApiError(error, res, `${req.method} ${req.url}`);
    }
  };
}

/**
 * Type guard for success response
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiSuccessResponse<T> {
  return response.success === true;
}

/**
 * Type guard for error response
 */
export function isErrorResponse(
  response: ApiResponse
): response is ApiErrorResponse {
  return response.success === false;
}
