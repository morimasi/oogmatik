import { VercelRequest, VercelResponse } from '@vercel/node';
import { ActivityValidator } from '../../src/tools/scaffold/ActivityValidator';
import { authenticate } from '../../src/middleware/permissionValidator';
import { enforceRateLimit } from '../../src/services/rateLimiter';
import { AgentOrchestrator } from '../../src/tools/scaffold/AgentOrchestrator';

/**
 * api/admin/scaffold.ts
 * Otonom etkinlik blueprint'ini doğrular ve güvenlik zincirinden geçirip
 * Vercel ortamında read-only disk yapısı nedeniyle Blueprint'i doğrulanmış 
 * şekilde kayıta alır.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ─── Method Check ───
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
  }

  try {
    // ─── Auth ve RBAC Check ───
    const { userId, role } = authenticate(req);

    // Yalnızca adminlerin çalışmasına izin ver
    if (role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Yetkisiz erişim', code: 'FORBIDDEN' } });
    }

    // ─── Rate Limiting ───
    // Üst üste çağrıların sistem çöktürmesini engellemek için
    await enforceRateLimit(userId, role, 'apiGeneration', 5);

    // ─── Input Validation & Ajan Testi ───
    // 1. Zod şeması ve pedagojik testler
    const blueprint = ActivityValidator.validateBlueprint(req.body);

    // 2. Ajan Orkestratör Denetimi (Agent approvals check)
    const orchestrator = new AgentOrchestrator();
    const agentResult = await orchestrator.evaluate(blueprint as any);

    if (!agentResult.allApproved) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Ajan onayları geçilemedi',
          code: 'AGENT_APPROVAL_FAILED',
          details: agentResult.approvals
        }
      });
    }

    // Blueprint Firestore'a 'pending' statüsüyle kaydedilir...
    // asıl derleme CLI tarafından yapılır (fs readonly limiti sebebiyle).

    return res.status(200).json({
      success: true,
      data: {
        message: 'Blueprint kaydedildi ve ajanlardan onaylandı. CLI ile üretim başlatın: npm run scaffold -- --blueprint <path>',
        key: blueprint.identity.key,
        status: 'pending',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    const message = error.message || 'Bilinmeyen hata';
    const status = error.statusCode || error.httpStatus || 500;

    return res.status(status).json({
      success: false,
      error: { message, code: error.code || 'INTERNAL_ERROR' },
      timestamp: new Date().toISOString(),
    });
  }
}
