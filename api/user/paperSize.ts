/**
 * OOGMATIK - User PaperSize API
 * Handles user's paper size preference
 *
 * Vercel API endpoint routes:
 * GET    /api/user/paperSize - get user's paper size preference
 * POST   /api/user/paperSize - save user's paper size preference
 */

import { VercelRequest, VercelResponse } from '@vercel/node';
import { extractUserInfo } from '../../middleware/permissionValidator';

type PaperSize = 'A4' | 'Letter' | 'Legal';

// In-memory store for demo (replace with proper KV store in production)
const paperSizeStore = new Map<string, PaperSize>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  try {
    const { userId } = extractUserInfo(req);

    // Ensure we handle JSON body correctly
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

    if (!userId) {
      // For demo: use a default key if not authenticated
      const demoKey = 'demo-user';

      if (req.method === 'GET') {
        const paperSize = paperSizeStore.get(demoKey) || 'A4';
        res.status(200).json({ paperSize });
        return;
      }

      if (req.method === 'POST') {
        const { paperSize } = body;
        if (!paperSize || !['A4', 'Letter', 'Legal'].includes(paperSize)) {
          res.status(400).json({
            error: { message: 'Invalid paper size', code: 'BAD_REQUEST' },
          });
          return;
        }
        paperSizeStore.set(demoKey, paperSize);
        res.status(200).json({
          success: true,
          paperSize,
          message: 'Paper size preference saved (demo mode)',
        });
        return;
      }

      res.status(401).json({
        error: { message: 'Unauthorized - login to save preferences', code: 'UNAUTHORIZED' },
      });
      return;
    }

    const key = `user:${userId}:paperSize`;

    if (req.method === 'GET') {
      const paperSize = paperSizeStore.get(key) || 'A4';
      res.status(200).json({ paperSize });
      return;
    }

    if (req.method === 'POST') {
      const { paperSize } = body;

      if (!paperSize || !['A4', 'Letter', 'Legal'].includes(paperSize)) {
        res.status(400).json({
          error: {
            message: 'Invalid paper size. Must be A4, Letter, or Legal',
            code: 'BAD_REQUEST',
          },
        });
        return;
      }

      paperSizeStore.set(key, paperSize);

      res.status(200).json({
        success: true,
        paperSize,
        message: 'Paper size preference saved',
      });
      return;
    }

    res.status(405).json({ error: { message: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' } });
  } catch (error: any) {
    console.error('PaperSize API error:', error);
    res.status(500).json({
      error: {
        message: 'Internal server error: ' + (error?.message || 'Unknown error'),
        code: 'INTERNAL_ERROR',
        details: error?.stack
      }
    });
  }
}
