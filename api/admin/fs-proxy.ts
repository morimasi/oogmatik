import { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { authenticate } from '../../src/middleware/permissionValidator';
import { enforceRateLimit } from '../../src/services/rateLimiter';
import { ValidationError } from '../../src/utils/AppError';

const ALLOWED_DIRECTORIES = [
  'src/components/generators',
  'src/services/generators'
];

function resolveSafePath(workspaceRoot: string, relativePath: string) {
  const normalized = path.normalize(relativePath).replace(/\\/g, '/');
  const absolutePath = path.resolve(workspaceRoot, normalized);
  const relative = path.relative(workspaceRoot, absolutePath);

  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new ValidationError('Geçersiz dosya yolu. Yalnızca izin verilen dizinlere yazabilirsiniz.');
  }

  const allowed = ALLOWED_DIRECTORIES.some((allowedDir) => {
    const allowedPath = path.resolve(workspaceRoot, allowedDir);
    return absolutePath === allowedPath || absolutePath.startsWith(`${allowedPath}${path.sep}`);
  });

  if (!allowed) {
    throw new ValidationError('Bu dosya yolu fiziksel kaydetme için izin verilen bir dizin değil.');
  }

  const extension = path.extname(absolutePath).toLowerCase();
  if (!['.tsx', '.ts'].includes(extension)) {
    throw new ValidationError('Sadece .tsx veya .ts dosyaları fiziksel olarak kaydedilebilir.');
  }

  return absolutePath;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
  }

  try {
    const { userId, role } = authenticate(req);
    if (role !== 'admin') {
      return res.status(403).json({ success: false, error: { message: 'Yetkisiz erişim', code: 'FORBIDDEN' } });
    }

    await enforceRateLimit(userId, role, 'apiFsProxy', 10);

    const allowPhysicalSync = process.env.ALLOW_PHYSICAL_SYNC === 'true' || process.env.NODE_ENV !== 'production';
    if (!allowPhysicalSync) {
      return res.status(501).json({
        success: false,
        error: { message: 'Fiziksel dosya yazma bu ortamda devre dışı.', code: 'PHYSICAL_SYNC_DISABLED' }
      });
    }

    const files = req.body?.files;
    if (!Array.isArray(files) || files.length === 0) {
      throw new ValidationError('Kaydedilecek dosyalar boş olamaz.');
    }

    const workspaceRoot = process.cwd();
    const savedFiles: string[] = [];

    for (const item of files) {
      if (!item || typeof item.path !== 'string' || typeof item.content !== 'string') {
        throw new ValidationError('Her dosya için geçerli bir path ve content alanı gereklidir.');
      }

      const absolutePath = resolveSafePath(workspaceRoot, item.path);
      const dir = path.dirname(absolutePath);
      fs.mkdirSync(dir, { recursive: true });

      if (fs.existsSync(absolutePath)) {
        const backupPath = `${absolutePath}.bak`;
        if (!fs.existsSync(backupPath)) {
          fs.copyFileSync(absolutePath, backupPath);
        }
      }

      fs.writeFileSync(absolutePath, item.content, 'utf-8');
      savedFiles.push(item.path);
    }

    return res.status(200).json({
      success: true,
      data: {
        savedFiles,
        message: 'Fiziksel dosyalar başarıyla kaydedildi.'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error: unknown) {
    if (error instanceof ValidationError) {
      return res.status(error.httpStatus).json({ success: false, error: { message: error.userMessage, code: error.code } });
    }

    const message = error instanceof Error ? error.message : 'Bilinmeyen hata';
    return res.status(500).json({ success: false, error: { message, code: 'FS_PROXY_ERROR' } });
  }
}
