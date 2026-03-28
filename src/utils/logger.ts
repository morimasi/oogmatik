/**
 * OOGMATIK - Structured Logging System
 * KVKK uyumlu loglama - Kişisel veri loglamayı engeller
 */

import { AppError } from './AppError.js';

type LogLevel = 'info' | 'warn' | 'error' | 'audit';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

/**
 * Production'da kişisel veri loglanmasını önler
 * Development'ta console kullanır
 */
class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = this.checkIsDevelopment();
  }

  private checkIsDevelopment(): boolean {
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
      return true;
    }
    if (typeof window !== 'undefined' && (window as any).__VITE_IS_DEV__) {
      return true;
    }
    return false;
  }

  /**
   * Info seviyesi log
   * Production'da Vercel Analytics'e gönderilir
   */
  info(message: string, meta?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, meta || '');
    } else {
      // Production: Vercel Analytics veya başka bir servis
      this.sendToAnalytics('info', message, meta);
    }
  }

  /**
   * Warning seviyesi log
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, meta || '');
    } else {
      this.sendToAnalytics('warn', message, meta);
    }
  }

  /**
   * Error seviyesi log
   * AppError tipinde hataları özel olarak işler
   */
  error(error: Error | AppError | string, meta?: Record<string, unknown>): void {
    let message: string;
    let errorMeta: Record<string, unknown> = meta || {};

    if (error instanceof AppError) {
      message = error.userMessage;
      errorMeta = {
        ...errorMeta,
        code: error.code,
        httpStatus: error.httpStatus,
        isRetryable: error.isRetryable,
      };
    } else if (error instanceof Error) {
      message = error.message;
      errorMeta = {
        ...errorMeta,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    } else {
      message = error;
    }

    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, errorMeta);
    } else {
      // Production: Sentry veya başka bir error tracking servisi
      this.sendToErrorTracking(message, errorMeta);
    }
  }

  /**
   * KVKK uyumlu audit log
   * Hassas veri loglamaz, sadece event ve userId
   */
  audit(event: string, userId: string, action: string, meta?: Record<string, unknown>): void {
    const auditEntry: LogEntry = {
      level: 'audit',
      message: `${event}: ${action}`,
      timestamp: new Date().toISOString(),
      meta: {
        userId, // Hash'lenmiş olmalı
        action,
        ...meta,
      },
    };

    if (this.isDevelopment) {
      console.log('[AUDIT]', auditEntry);
    } else {
      // Production: Audit log database'e yazılır
      this.sendToAuditLog(auditEntry);
    }
  }

  /**
   * Production analytics gönderimi
   */
  private sendToAnalytics(level: LogLevel, _message: string, _meta?: Record<string, unknown>): void {
    // TODO: Vercel Analytics entegrasyonu
    // Bu noktada sadece critical hataları logluyoruz
    if (level === 'error') {
      // Minimal log
    }
  }

  /**
   * Production error tracking gönderimi
   */
  private sendToErrorTracking(_message: string, _meta: Record<string, unknown>): void {
    // TODO: Sentry entegrasyonu
    // window.Sentry?.captureException(new Error(message), { extra: meta });
  }

  /**
   * Audit log database'e yazma
   */
  private sendToAuditLog(_entry: LogEntry): void {
    // TODO: Firestore audit collection'a yazma
    // Bu kritik - her erişim kaydedilmeli (KVKK Madde 11)
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();

/**
 * Production'da console.log'u devre dışı bırak
 * Sadece error ve warn'a izin ver
 */
export const disableConsoleInProduction = (): void => {
  if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && (import.meta as any).env?.PROD) {
    console.log = () => { };
    console.info = () => { };
    console.debug = () => { };
    // console.error ve console.warn'a dokunma - bunlar kritik
  }
};

/**
 * Convenience exports
 */
export const logInfo = (message: string, meta?: Record<string, unknown>) => logger.info(message, meta);
export const logWarn = (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta);
export const logError = (error: Error | AppError | string, meta?: Record<string, unknown>) => logger.error(error, meta);
export const logAudit = (event: string, userId: string, action: string, meta?: Record<string, unknown>) =>
  logger.audit(event, userId, action, meta);
