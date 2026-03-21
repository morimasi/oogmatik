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
 * LOGGING: Centralized error logging
 */
export const logError = (error: AppError, context?: Record<string, any>) => {
  const errorLog = {
    ...error.toJSON(),
    context,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    timestamp: new Date().toISOString(),
  };

  // Console'da debug
  let isDev = false;
  if (typeof process !== 'undefined' && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
    isDev = true;
  } else if (typeof window !== 'undefined' && (window as any).__VITE_IS_DEV__) {
    isDev = true;
  }

  if (isDev) {
    console.error('[AppError]', errorLog);
  }

  // Production'da external service'e gönder
  // TODO: Sentry, Loggly, DataDog vb. entegrasyonu
  // sendToLoggingService(errorLog);

  return errorLog;
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
      if (attempt >= maxRetries - 1) {
        logError(appError, { attempt: attempt + 1, maxRetries });
        throw appError;
      }

      // Exponential backoff + jitter
      const exponentialDelay = Math.min(
        initialDelay * Math.pow(backoffMultiplier, attempt),
        maxDelay
      );

      // Jitter: ±10% rastgelelik
      const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);
      const finalDelay = Math.max(100, exponentialDelay + jitter);

      console.warn(
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
      console.warn(
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
