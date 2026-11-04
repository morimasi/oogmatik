// ============================================================
// VisionStudio — Gemini Vision Analiz Servisi (istemci tarafı)
// Serverless endpoint'e çağrı yapar; AI anahtarı yalnızca sunucuda.
// Kimlik: Firebase ID token (Authorization: Bearer) — sunucu Admin SDK ile doğrular.
// ============================================================
import { AppError } from '../../utils/AppError';
import { AnalyzeRequestSchema, AnalyzeResponseSchema } from '../../utils/schemas/visionStudio';
import type { AnalyzeRequest, AnalyzeResponse } from './types';
import { getAuthHeaders } from '../../utils/apiClient';
import { auth } from '../firebaseClient';

const ANALYZE_ENDPOINT = '/api/vision-studio/analyze';
const TIMEOUT_MS = 90_000;

function extractServerMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') return null;

  const maybeError = (body as { error?: unknown }).error;
  if (typeof maybeError === 'string' && maybeError.trim()) return maybeError;
  if (maybeError && typeof maybeError === 'object') {
    const message = (maybeError as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  const topLevelMessage = (body as { message?: unknown }).message;
  return typeof topLevelMessage === 'string' && topLevelMessage.trim() ? topLevelMessage : null;
}

/** Sunucu { success, data } zarfı döner; eski/düz yanıtları da tolere eder. */
function unwrapPayload(body: unknown): unknown {
  if (body && typeof body === 'object' && 'data' in body) {
    const data = (body as { data?: unknown }).data;
    return data ?? body;
  }
  return body;
}

async function buildAuthorizationHeader(): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new AppError(
      'Oturum bulunamadi. Lutfen tekrar giris yapin.',
      'AUTH_REQUIRED',
      401
    );
  }
  const token = await currentUser.getIdToken();
  return `Bearer ${token}`;
}

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

  const authorization = await buildAuthorizationHeader();

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization,
        ...getAuthHeaders(userId, userRole),
      },
      body: JSON.stringify(parsed.data),
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AppError(
        'Yapay zeka analizi zaman asimina ugradi. Lutfen tekrar deneyin.',
        'TIMEOUT',
        504,
        undefined,
        true
      );
    }
    if (err instanceof AppError) throw err;
    throw new AppError(
      'Sunucuya baglanilamadi. Internet baglantinizi kontrol edin.',
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
    const serverMsg = extractServerMessage(body) ?? `Sunucu hatasi (${res.status})`;

    if (res.status === 429) {
      throw new AppError(
        serverMsg || 'Gunluk analiz kotanizi doldurdunuz. Yarin tekrar deneyin.',
        'RATE_LIMIT_EXCEEDED',
        429
      );
    }
    if (res.status === 401 || res.status === 403) {
      throw new AppError(
        serverMsg || 'Oturum sureniz dolmus. Lutfen tekrar giris yapin.',
        'AUTH_ERROR',
        res.status
      );
    }
    if (res.status === 413) {
      throw new AppError(
        'Dosya boyutu sunucu sinirini asiyor. Lutfen 2.5 MB altinda bir dosya yukleyin.',
        'PAYLOAD_TOO_LARGE',
        413
      );
    }
    throw new AppError(serverMsg, 'SERVER_ERROR', res.status, undefined, res.status >= 500);
  }

  const payload = unwrapPayload(body);
  const validated = AnalyzeResponseSchema.safeParse(payload);

  if (!validated.success) {
    throw new AppError(
      'Sunucudan gecersiz etkinlik verisi alindi. Lutfen tekrar deneyin.',
      'INVALID_RESPONSE',
      502,
      undefined,
      true
    );
  }

  return validated.data;
}
