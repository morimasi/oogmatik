// ============================================================
// VisionStudio — Gemini Vision Analiz Servisi (istemci tarafı)
// Serverless endpoint'e çağrı yapar; AI anahtarı yalnızca sunucuda.
// ============================================================
import { AppError } from '../../utils/AppError';
import { AnalyzeRequestSchema } from '../../utils/schemas/visionStudio';
import type { AnalyzeRequest, AnalyzeResponse } from './types';
import { getAuthHeaders } from '../../utils/apiClient';

const ANALYZE_ENDPOINT = '/api/vision-studio/analyze';
const TIMEOUT_MS = 60_000;

export async function analyzeUploadedFile(
  request: AnalyzeRequest,
  userId: string,
  userRole: string
): Promise<AnalyzeResponse> {
  const parsed = AnalyzeRequestSchema.safeParse(request);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join(', ');
    throw new AppError(`Gecersiz istek: ${msg}`, 'VALIDATION_ERROR', 400);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(userId, userRole),
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    clearTimeout(timer);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AppError(
        'Yapay zeka analizi zaman asimina ugradi. Lutfen tekrar deneyin.',
        'TIMEOUT',
        504,
        undefined,
        true
      );
    }
    throw new AppError(
      'Sunucuya baglanılamadi. Internet baglantiinizi kontrol edin.',
      'NETWORK_ERROR',
      0,
      undefined,
      true
    );
  } finally {
    clearTimeout(timer);
  }

  const body: unknown = await res.json().catch(() => null);

  if (!res.ok) {
    const serverMsg =
      body != null &&
      typeof body === 'object' &&
      'error' in body &&
      (body as Record<string, unknown>).error != null &&
      typeof (body as Record<string, unknown>).error === 'object' &&
      'message' in ((body as Record<string, unknown>).error as object)
        ? String(((body as Record<string, Record<string, unknown>>).error).message)
        : 'Sunucu hatasi';

    if (res.status === 429) {
      throw new AppError(
        'Gunluk analiz kotanizi doldurdunuz. Yarin tekrar deneyin.',
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new AppError(
        'Oturum suren dolmus. Lutfen tekrar giris yapin.',
        'AUTH_ERROR',
        res.status
      );
    }
    throw new AppError(serverMsg, 'SERVER_ERROR', res.status, undefined, res.status >= 500);
  }

  return body as AnalyzeResponse;
}
