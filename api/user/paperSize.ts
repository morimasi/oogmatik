/**
 * OOGMATIK - User PaperSize API
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../src/../utils/cors.js';
import { logger } from '../src/../utils/logger.js';

// Persistence simulator (in-memory)
const paperSizeStore = new Map<string, string>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // CORS Security - NO WILDCARD
    if (!corsMiddleware(req, res)) {
      return;
    }

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
      const paperSize = body.paperSize;

      if (!paperSize || !['A4', 'Letter', 'Legal'].includes(paperSize)) {
        return res.status(400).json({
          error: 'Hatalı kağıt boyutu',
          received: paperSize
        });
      }

      paperSizeStore.set(key, paperSize);
      return res.status(200).json({
        success: true,
        paperSize,
        message: 'Tercih kaydedildi'
      });
    }

    return res.status(405).json({ error: 'Yöntem izni yok' });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error(err, { context: 'PaperSize API' });
    return res.status(500).json({
      error: 'Server Error',
      message: err.message
    });
  }
}
