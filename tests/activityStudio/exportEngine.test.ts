import { describe, it, expect } from 'vitest';
import { exportStudioOutput } from '@/components/ActivityStudio/preview/ExportEngine';

describe('activity studio export engine', () => {
  it('json export blobu olusturur', async () => {
    const blob = await exportStudioOutput({
      activityId: 'a1',
      format: 'json',
      payload: { x: 1 },
    });

    expect(blob.type).toBe('application/json');
    expect(blob.size).toBeGreaterThan(5);
  });
});
