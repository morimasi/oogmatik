export interface ExportRequest {
  activityId: string;
  format: 'pdf' | 'png' | 'json';
  payload: Record<string, unknown>;
}

export async function exportStudioOutput(request: ExportRequest): Promise<Blob> {
  const body = {
    activityId: request.activityId,
    format: request.format,
    payload: request.payload,
    exportedAt: new Date().toISOString(),
  };

  const mime = request.format === 'json' ? 'application/json' : 'text/plain';
  const content = request.format === 'json' ? JSON.stringify(body, null, 2) : JSON.stringify(body);
  return new Blob([content], { type: mime });
}
