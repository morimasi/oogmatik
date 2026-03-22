/**
 * OOGMATIK - CORS Validation & Security Utility
 *
 * Güvenli origin validation sistemi - wildcard (*) yerine whitelist kullanır.
 * CORS wildcard kullanımı credentials ile uyumlu değildir ve güvenlik riski oluşturur.
 *
 * @module utils/cors
 * @see IYILESTIRME_PLANI.md - Güvenlik Geliştirmeleri
 * @author Bora Demir - Senior Full-Stack Engineer
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppError } from './AppError.js';

/**
 * İzin verilen origin listesi
 * Production, preview ve development ortamları için güvenli origin'ler
 */
const ALLOWED_ORIGINS = [
  // Production domains
  'https://oogmatik.com',
  'https://www.oogmatik.com',
  'https://oogmatik.vercel.app',

  // Preview deployments (Vercel pattern)
  /^https:\/\/oogmatik-[a-z0-9]+-[a-z0-9]+\.vercel\.app$/,

  // Development
  'http://localhost:5173',     // Vite default
  'http://localhost:3000',     // Alternative port
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',

  // Google Project IDX / Antigravity
  /^https:\/\/[a-z0-9]+-idx-[a-z0-9]+\.idx\.dev$/,
  /^https:\/\/[0-9]+-idx\.idx-preview\.h\.loopp\.ggpht\.com$/,
];

/**
 * Vercel preview deployment pattern matcher
 * Örnek: https://oogmatik-git-feature-user.vercel.app
 */
const VERCEL_PREVIEW_PATTERN = /^https:\/\/oogmatik-git-[a-z0-9-]+-[a-z0-9]+\.vercel\.app$/;

/**
 * Origin'in izin verilen listede olup olmadığını kontrol eder
 *
 * @param origin - Request origin header değeri
 * @returns true ise origin güvenli
 */
export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) {
    // Origin header yoksa (same-origin requests veya bazı araçlar)
    // Geliştirme ortamında izin ver, production'da reddet
    return process.env.NODE_ENV === 'development';
  }

  // Exact match kontrolü
  if (ALLOWED_ORIGINS.some(allowed => typeof allowed === 'string' && allowed === origin)) {
    return true;
  }

  // Regex pattern kontrolü
  if (ALLOWED_ORIGINS.some(allowed => allowed instanceof RegExp && allowed.test(origin))) {
    return true;
  }

  // Vercel preview deployment kontrolü
  if (VERCEL_PREVIEW_PATTERN.test(origin)) {
    return true;
  }

  return false;
}

/**
 * Güvenli CORS headers ayarlar
 * Origin validation yapar ve sadece izin verilen origin'ler için credentials desteği ekler
 *
 * @param req - Vercel Request
 * @param res - Vercel Response
 * @param options - CORS options
 * @throws AppError - Origin izin verilmiyorsa
 */
export function setCorsHeaders(
  req: VercelRequest,
  res: VercelResponse,
  options: {
    methods?: string[];
    headers?: string[];
    credentials?: boolean;
    maxAge?: number;
  } = {}
): void {
  const origin = req.headers.origin;

  // Origin validation
  if (!isAllowedOrigin(origin)) {
    throw new AppError(
      'Bu kaynaktan erişim izni yok',
      'CORS_ORIGIN_NOT_ALLOWED',
      403,
      { origin, allowedOrigins: ALLOWED_ORIGINS.map(o => o.toString()) }
    );
  }

  // Güvenli origin için headers ayarla
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // Credentials desteği (sadece whitelist'teki origin'ler için)
  if (options.credentials !== false) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Allowed methods
  const methods = options.methods || ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
  res.setHeader('Access-Control-Allow-Methods', methods.join(', '));

  // Allowed headers
  const headers = options.headers || [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-User-ID',
    'X-API-Key'
  ];
  res.setHeader('Access-Control-Allow-Headers', headers.join(', '));

  // Preflight cache duration (24 saat)
  const maxAge = options.maxAge || 86400;
  res.setHeader('Access-Control-Max-Age', maxAge.toString());

  // Güvenlik headers (OWASP best practices)
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

/**
 * OPTIONS preflight request handler
 * Tüm API endpoint'lerde kullanılabilir middleware pattern
 *
 * @param req - Vercel Request
 * @param res - Vercel Response
 * @returns true ise preflight handled, endpoint logic devam etmemeli
 *
 * @example
 * ```typescript
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   if (handleCorsPreflightV2(req, res)) {
 *     return; // Preflight handled
 *   }
 *   // Normal endpoint logic...
 * }
 * ```
 */
export function handleCorsPreflight(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  if (req.method === 'OPTIONS') {
    try {
      setCorsHeaders(req, res);
      res.status(200).end();
      return true;
    } catch (error) {
      // CORS validation failed
      if (error instanceof AppError) {
        res.status(error.httpStatus).json({
          success: false,
          error: {
            message: error.userMessage,
            code: error.code
          },
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(403).json({
          success: false,
          error: {
            message: 'CORS validation failed',
            code: 'CORS_ERROR'
          },
          timestamp: new Date().toISOString()
        });
      }
      return true;
    }
  }
  return false;
}

/**
 * API endpoint wrapper - CORS + method validation
 * Tüm boilerplate CORS kodunu tek fonksiyona indirger
 *
 * @param req - Vercel Request
 * @param res - Vercel Response
 * @param allowedMethods - İzin verilen HTTP methods (örn: ['POST'])
 * @param corsOptions - CORS options
 * @returns true ise request geçerli ve işlenebilir
 *
 * @example
 * ```typescript
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   if (!validateCorsAndMethod(req, res, ['POST'])) {
 *     return; // Already handled (error veya preflight)
 *   }
 *
 *   // Normal endpoint logic
 *   try {
 *     const result = await processRequest(req.body);
 *     res.status(200).json({ success: true, data: result });
 *   } catch (error) {
 *     handleError(res, error);
 *   }
 * }
 * ```
 */
export function validateCorsAndMethod(
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: string[] = ['POST'],
  corsOptions?: {
    headers?: string[];
    credentials?: boolean;
    maxAge?: number;
  }
): boolean {
  try {
    // 1. CORS validation + headers
    setCorsHeaders(req, res, { ...corsOptions, methods: allowedMethods });

    // 2. OPTIONS preflight handling
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return false; // Preflight handled, don't process further
    }

    // 3. Method validation
    if (!allowedMethods.includes(req.method || '')) {
      throw new AppError(
        `Sadece ${allowedMethods.join(', ')} metodları destekleniyor`,
        'METHOD_NOT_ALLOWED',
        405,
        { method: req.method, allowedMethods }
      );
    }

    return true; // Request geçerli, işlenebilir

  } catch (error) {
    // CORS veya method validation hatası
    if (error instanceof AppError) {
      res.status(error.httpStatus).json({
        success: false,
        error: {
          message: error.userMessage,
          code: error.code
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        error: {
          message: 'İstek doğrulama hatası',
          code: 'VALIDATION_ERROR'
        },
        timestamp: new Date().toISOString()
      });
    }
    return false; // Request invalid, don't process
  }
}

/**
 * Development mode'da kullanım için permissive CORS
 * SADECE geliştirme ortamında kullan!
 *
 * @param res - Vercel Response
 * @deprecated Production'da kullanma - sadece local test için
 */
export function setPermissiveCorsForDev(res: VercelResponse): void {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('setPermissiveCorsForDev sadece development ortamında kullanılabilir!');
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

/**
 * CORS origin listesine runtime'da yeni origin ekle
 * Admin panel üzerinden dinamik origin yönetimi için
 *
 * @param origin - Eklenecek origin (string veya regex)
 * @throws Error - Geçersiz origin formatı
 *
 * @example
 * ```typescript
 * // String origin
 * addAllowedOrigin('https://new-domain.com');
 *
 * // Regex pattern
 * addAllowedOrigin(/^https:\/\/.*\.customer-domain\.com$/);
 * ```
 */
export function addAllowedOrigin(origin: string | RegExp): void {
  if (typeof origin === 'string') {
    try {
      new URL(origin); // URL validation
      if (!ALLOWED_ORIGINS.includes(origin)) {
        ALLOWED_ORIGINS.push(origin);
      }
    } catch {
      throw new Error(`Geçersiz origin URL: ${origin}`);
    }
  } else if (origin instanceof RegExp) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      ALLOWED_ORIGINS.push(origin);
    }
  } else {
    throw new Error('Origin string veya RegExp olmalı');
  }
}

/**
 * Mevcut izin verilen origin listesini döndür
 * Debug ve admin panel için
 *
 * @returns İzin verilen origin'lerin kopyası
 */
export function getAllowedOrigins(): Array<string | RegExp> {
  return [...ALLOWED_ORIGINS];
}

/**
 * Origin'i whitelist'ten kaldır
 *
 * @param origin - Kaldırılacak origin
 */
export function removeAllowedOrigin(origin: string | RegExp): void {
  const index = ALLOWED_ORIGINS.findIndex(allowed => {
    if (typeof allowed === 'string' && typeof origin === 'string') {
      return allowed === origin;
    }
    if (allowed instanceof RegExp && origin instanceof RegExp) {
      return allowed.source === origin.source;
    }
    return false;
  });

  if (index !== -1) {
    ALLOWED_ORIGINS.splice(index, 1);
  }
}

/**
 * Legacy CORS middleware wrapper for backward compatibility
 * Wraps handleCorsPreflight and setCorsHeaders
 *
 * @param req - Vercel Request
 * @param res - Vercel Response
 * @returns true if request should continue, false if already handled
 *
 * @example
 * ```typescript
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   if (!corsMiddleware(req, res)) {
 *     return; // CORS handled or failed
 *   }
 *   // Continue with endpoint logic
 * }
 * ```
 */
export function corsMiddleware(req: VercelRequest, res: VercelResponse): boolean {
  try {
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      setCorsHeaders(req, res);
      res.status(200).end();
      return false;
    }

    // Set CORS headers for actual request
    setCorsHeaders(req, res);
    return true;

  } catch (error) {
    // CORS validation failed
    if (error instanceof AppError) {
      res.status(error.httpStatus).json({
        success: false,
        error: {
          message: error.userMessage,
          code: error.code
        },
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(403).json({
        success: false,
        error: {
          message: 'CORS validation failed',
          code: 'CORS_ERROR'
        },
        timestamp: new Date().toISOString()
      });
    }
    return false;
  }
}
