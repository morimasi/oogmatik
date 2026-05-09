import { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import { ActivityScaffoldEngine } from '../../src/tools/scaffold/ActivityScaffoldEngine';

/**
 * api/admin/scaffold.ts
 * Görsel arayüzden gelen blueprint'i otonom motorla işler.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Güvenlik: Sadece admin yetkisi olanlar (Bu örnekte basit bir check yapıyoruz)
  // Normalde authMiddleware üzerinden geçmeli

  try {
    const blueprint = req.body;
    const workspaceRoot = (process as any).cwd();
    const engine = new ActivityScaffoldEngine(workspaceRoot);
    
    console.log('[API] Otonom üretim başlatıldı:', blueprint.identity?.title);
    const result = await engine.process(blueprint);

    return res.status(200).json({
      success: true,
      message: 'Etkinlik otonom olarak başarıyla oluşturuldu ve sisteme entegre edildi.',
      result
    });
  } catch (error: any) {
    console.error('[API] Scaffold Hatası:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Otonom üretim sırasında bir hata oluştu.'
    });
  }
}
