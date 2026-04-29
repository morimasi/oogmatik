import type { VercelRequest, VercelResponse } from '@vercel/node';
import { progressService } from '../src/services/progressService.js';
import { permissionService } from '../src/middleware/permissionValidator.js';
import { AppError, toAppError } from '../src/utils/AppError.js';
import { logError } from '../src/utils/errorHandler.js';
import { hasPermission } from '../src/services/rbac.js';
import { RateLimiter } from '../src/services/rateLimiter.js';
import { corsMiddleware } from '../src/utils/cors.js';

const rateLimiter = new RateLimiter();

/**
 * Öğrenci İlerleme API'si
 * GET  /api/progress?studentId=:id - snapshot getirir
 * POST /api/progress - yeni aktivite tamamlama kaydı ekler
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!corsMiddleware(req, res)) return;
  res.setHeader('Content-Type', 'application/json');

  try {
    const { method, query } = req;
    const userId = (req.headers['x-user-id'] as string) || 'anonymous';
    const userTier = (req.headers['x-user-tier'] as string) || 'free';

    await rateLimiter.enforceLimit(userId, userTier as any, 'apiQuery');

    if (method === 'GET') {
      const studentId = query.studentId as string;
      if (!studentId) {
        return res.status(400).json({ error: { message: 'studentId gereklidir', code: 'BAD_REQUEST' } });
      }

      const user = permissionService.authenticate(req);
      // Not: Admin veya öğrencinin öğretmeni olması kontrolü eklenebilir. 
      // Şimdilik sadece login olması gerektiğini varsayıp, ileride RBAC ile sıkılaştıracağız.
      
      const snapshot = await progressService.getStudentProgress(studentId);
      return res.status(200).json({ success: true, data: snapshot, timestamp: new Date().toISOString() });

    } else if (method === 'POST') {
      const user = permissionService.authenticate(req);
      if (!hasPermission(user.role, 'update:worksheet')) { // Benzer bir yetki kullanıyoruz
        return res.status(403).json({ error: { message: 'Bu işlem için yetkiniz yok', code: 'PERMISSION_DENIED' } });
      }

      const completionData = req.body;
      await progressService.logActivityCompletion(completionData);
      
      return res.status(201).json({ success: true, message: 'İlerleme kaydedildi', timestamp: new Date().toISOString() });

    } else {
      return res.status(405).json({ error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
    }
  } catch (error) {
    const appError = toAppError(error);
    logError(appError, { context: 'api/progress', path: req.url });
    return res.status(appError.httpStatus).json({
      error: { message: appError.userMessage, code: appError.code }
    });
  }
}
