import { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';

/**
 * api/admin/scaffold.ts
 * Otonom etkinlik blueprint'ini doğrular ve Firestore'a kaydeder.
 * 
 * NOT: Vercel serverless ortamında dosya sistemi read-only olduğu için
 * bu endpoint blueprint'i Firestore'a "pending" olarak kaydeder.
 * Asıl dosya üretimi CLI ile geliştirici ortamında yapılır.
 */

// ─── Zod Validation Schema ───
const BlueprintSchema = z.object({
  identity: z.object({
    key: z.string().min(1).regex(/^[A-Z][A-Z0-9_]*$/),
    enumValue: z.string().min(1),
    title: z.string().min(1),
    description: z.string().default(''),
    icon: z.string().default('fa-solid fa-star'),
    categoryId: z.string().default('reading-verbal'),
  }),
  dataModel: z.object({
    interfaceName: z.string().min(1),
    itemsName: z.string().optional(),
    fields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string().optional(),
    })).default([]),
    itemFields: z.array(z.object({
      name: z.string(),
      type: z.string(),
      required: z.boolean(),
      description: z.string().optional(),
    })).optional(),
  }),
  logic: z.object({
    offlineAlgorithm: z.string().default(''),
    aiPrompt: z.object({
      role: z.string().default('Uzman Eğitimci'),
      task: z.string().min(10),
      rules: z.array(z.string()).default([]),
      schema: z.record(z.unknown()).default({}),
    }),
  }),
  ui: z.object({
    columnsPerDifficulty: z.record(z.number()).optional(),
    configFields: z.array(z.unknown()).default([]),
    renderType: z.enum(['list', 'grid', 'table', 'custom']).default('list'),
  }).optional(),
  pedagogical: z.object({
    targetSkills: z.array(z.string()).default([]),
    errorTags: z.array(z.string()).default([]),
    ageGroups: z.array(z.string()).default([]),
  }).optional(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ─── Method Check ───
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
  }

  // ─── Auth Check ───
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: { message: 'Yetkilendirme gerekli', code: 'UNAUTHORIZED' } });
  }

  // TODO: JWT doğrulama ve RBAC admin kontrolü
  // const user = await verifyToken(authHeader.split(' ')[1]);
  // if (user.role !== 'admin') return res.status(403)...

  try {
    // ─── Input Validation ───
    const parsed = BlueprintSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Blueprint doğrulama hatası',
          code: 'VALIDATION_ERROR',
          details: parsed.error.flatten(),
        },
        timestamp: new Date().toISOString(),
      });
    }

    const blueprint = parsed.data;

    // ─── Firestore'a Kaydet (Vercel'de dosya yazılamaz) ───
    // TODO: Firestore entegrasyonu
    // await firestore.collection('scaffold_blueprints').add({
    //   ...blueprint,
    //   status: 'pending',
    //   createdAt: new Date().toISOString(),
    //   createdBy: user.uid,
    // });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Blueprint kaydedildi. CLI ile üretim başlatın: npm run scaffold -- --blueprint <path>',
        key: blueprint.identity.key,
        status: 'pending',
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return res.status(500).json({
      success: false,
      error: { message, code: 'INTERNAL_ERROR' },
      timestamp: new Date().toISOString(),
    });
  }
}
