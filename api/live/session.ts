import type { VercelRequest, VercelResponse } from '@vercel/node';
import { corsMiddleware } from '../../src/utils/cors.js';
import { RateLimiter } from '../../src/services/rateLimiter.js';
import { RateLimitError, AppError } from '../../src/utils/AppError.js';
import { logError } from '../../src/utils/errorHandler.js';

const rateLimiter = new RateLimiter();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (corsMiddleware(req, res)) return;

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' },
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    const actualUserId = (req.headers['x-user-id'] as string) || clientIp;
    const userTier = (req.headers['x-user-tier'] as string) || 'free';

    try {
      await rateLimiter.enforceLimit(actualUserId, userTier as any, 'apiQuery');
    } catch (error) {
      if (error instanceof RateLimitError) {
        return res.status(429).json({
          success: false,
          error: { message: error.userMessage, code: error.code },
          timestamp: new Date().toISOString(),
        });
      }
      throw error;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // API anahtarı ayarlanmamışsa güvenli yerel/demo oturum modu döndür
      return res.status(200).json({
        success: true,
        mode: 'demo_fallback',
        message: 'Lokal sesli koç ve Web Speech API aktif',
        sessionToken: `local_session_${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Google Gemini 3.8 Live API Canlı Oturum Parametreleri
    const sessionConfig = {
      model: 'models/gemini-2.0-flash-exp', // Canlı çok modlu ses uç noktası
      generationConfig: {
        responseModalities: ['audio', 'text'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Puck', // Sıcak, sevecen koç sesi
            },
          },
        },
      },
    };

    return res.status(200).json({
      success: true,
      mode: 'live_cloud',
      endpoint: `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`,
      config: sessionConfig,
      sessionToken: `live_tok_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    logError(err as Error, { context: 'api/live/session' });
    if (err instanceof AppError) {
      return res.status(err.httpStatus).json({
        success: false,
        error: { message: err.userMessage, code: err.code },
        timestamp: new Date().toISOString(),
      });
    }
    return res.status(500).json({
      success: false,
      error: { message: 'Canlı okuma oturumu açılamadı.', code: 'SESSION_INIT_FAILED' },
      timestamp: new Date().toISOString(),
    });
  }
}
