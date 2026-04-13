export interface ShareRequest {
  activityId: string;
  ownerId: string;
}

export function createShareLink(request: ShareRequest): string {
  const token = btoa(`${request.activityId}:${request.ownerId}:${Date.now()}`);
  return `/shared/activity-studio/${encodeURIComponent(token)}`;
}
