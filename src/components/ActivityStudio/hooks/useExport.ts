import { exportStudioOutput } from '@/components/ActivityStudio/preview/ExportEngine';

export function useExport() {
  const runExport = async (activityId: string, format: 'pdf' | 'png' | 'json') => {
    const blob = await exportStudioOutput({
      activityId,
      format,
      payload: { exportedAt: new Date().toISOString() },
    });

    return {
      size: blob.size,
      type: blob.type,
    };
  };

  return { runExport };
}
