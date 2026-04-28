/**
 * OOGMATIK - User PaperSize API
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { logInfo, logError, logWarn } from '../../src/utils/logger.js';
const VALID_PAPER_SIZES = ['A4', 'Letter', 'Legal'] as const;
type PaperSize = (typeof VALID_PAPER_SIZES)[number];

// In-memory persistence (serverless cold-start'lar arasında sıfırlanır).
// Kullanıcı tercihleri aynı instance içinde korunur; kalıcı depolama için
// Firestore entegrasyonu bir sonraki iterasyonda planlanmaktadır.
const paperSizeStore = new Map<string, PaperSize>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers — credentials ile birlikte wildcard (*) kullanılamaz (CORS spec)
  // Origin header yalnızca cross-origin isteklerde gönderilir; same-origin için CORS gerekmez
  const requestOrigin = req.headers.origin as string | undefined;
  if (requestOrigin) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-User-ID');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    res.setHeader('Content-Type', 'application/json');

    // Identify user
    const userId = (req.headers['x-user-id'] as string) || 'anonymous';
    const key = `user:${userId}:paperSize`;

    // GET Handler
    if (req.method === 'GET') {
      const size = paperSizeStore.get(key) || 'A4';
      return res.status(200).json({ paperSize: size });
    }

    // POST Handler
    if (req.method === 'POST') {
      const body = req.body || {};
      const paperSize = body.paperSize as string;

      if (!paperSize || !(VALID_PAPER_SIZES as readonly string[]).includes(paperSize)) {
        return res.status(400).json({
          success: false,
          error: 'Hatalı kağıt boyutu',
          received: paperSize,
          allowed: VALID_PAPER_SIZES,
        });
      }

      paperSizeStore.set(key, paperSize as PaperSize);
      return res.status(200).json({
        success: true,
        paperSize,
        message: 'Tercih kaydedildi',
      });
    }

    return res.status(405).json({ success: false, error: 'Yöntem izni yok' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen sunucu hatası';
    logError('[PaperSize API] Hata:', message, error);
    return res.status(500).json({
      success: false,
      error: 'Sunucu hatası',
      message,
    });
  }
}
