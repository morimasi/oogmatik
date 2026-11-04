// ============================================================
// VisionStudio — Etkinlik durum makinesi (saf, yan etkisiz)
// ============================================================
import type { ActivityStatus } from '../../types/visionStudio';

export const ALLOWED_TRANSITIONS: Record<ActivityStatus, ActivityStatus[]> = {
  uploading: ['analyzing', 'ready'],
  analyzing: ['ready'],
  ready: ['pending'],
  pending: ['approved', 'rejected', 'ready'],
  approved: [],
  rejected: ['pending'],
};

export function canTransition(from: ActivityStatus, to: ActivityStatus): boolean {
  return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
}
