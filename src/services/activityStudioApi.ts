import { AppError } from '@/utils/AppError';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code: string };
}

async function request<T>(action: 'generate' | 'approve' | 'draft' | 'export', init: RequestInit): Promise<T> {
  const response = await fetch(`/api/activity-studio/${action}`, init);
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new AppError(payload.error?.message ?? 'Activity Studio API hatasi.', payload.error?.code ?? 'API_ERROR', response.status);
  }

  return payload.data;
}

export interface ApprovalPayload {
  activityId: string;
  reviewerId: string;
  action: 'approve' | 'revise' | 'reject';
  note: string;
}

export async function submitApproval(payload: ApprovalPayload) {
  return request<ApprovalPayload & { timestamp: string }>('approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
