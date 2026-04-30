import { safeFetch } from '../utils/apiClient.js';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code: string };
}

/**
 * Activity Studio API İstemcisi
 * Bora Demir'in teknik standartlarına göre safeFetch entegrasyonu yapıldı.
 */
async function request<T>(action: 'generate' | 'approve' | 'draft' | 'export', init: RequestInit): Promise<T> {
  const result = await safeFetch<ApiResponse<T>>(`/api/activity-studio/${action}`, init);

  if (!result.success || result.data === undefined) {
    throw new Error(result.error?.message ?? 'Activity Studio API hatası.');
  }

  return result.data;
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
    body: JSON.stringify(payload),
  });
}
