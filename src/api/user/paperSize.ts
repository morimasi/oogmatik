/**
 * OOGMATIK - User PaperSize API (Bypassing external dependencies for debug)
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Persistence simulator (in-memory)
const paperSizeStore = new Map<string, string>();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Standard headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

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
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: error?.message || 'Unknown'
    });
  }
}
