import { useState, useCallback, useRef } from 'react';
import type { BatchExportJob, BatchExportItem, ExportSettings, Worksheet } from '../types/worksheet';

interface UseBatchExportReturn {
  currentJob: BatchExportJob | null;
  isRunning: boolean;
  startBatchExport: (items: BatchExportItem[], settings: ExportSettings) => Promise<void>;
  cancelBatchExport: () => void;
  retryFailed: () => Promise<void>;
  clearJob: () => void;
}

function generateId(): string {
  return `batch-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function exportSingleItem(
  item: BatchExportItem,
  settings: ExportSettings,
): Promise<{ url: string; filename: string }> {
  const worksheet: Worksheet = {
    metadata: item.metadata,
    content: item.content,
  };

  if (settings.format === 'json') {
    const blob = new Blob([JSON.stringify(worksheet, null, 2)], { type: 'application/json' });
    return { url: URL.createObjectURL(blob), filename: `${item.worksheetTitle}.json` };
  }

  if (settings.format === 'pdf') {
    const { default: jsPDF } = await import('jspdf');
    const orientation = settings.orientation === 'landscape' ? 'l' : 'p';
    const customFormat: [number, number] = [settings.customWidth ?? 210, settings.customHeight ?? 297];
    const format = settings.pageSize === 'Custom' ? customFormat : settings.pageSize.toLowerCase();
    const doc = new jsPDF({ orientation, unit: 'mm', format });

    const marginX = 20;
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - marginX * 2;

    if (settings.includeHeader && settings.headerText) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(settings.headerText, marginX, 12, { maxWidth });
    }

    doc.setFontSize(18);
    doc.setTextColor(30, 30, 30);
    doc.text(item.worksheetTitle, marginX, y, { maxWidth });
    y += 10;

    doc.setFontSize(12);
    for (const block of item.content.blocks) {
      if (y > doc.internal.pageSize.getHeight() - 25) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(50, 50, 50);
      const lines = doc.splitTextToSize(block.content || '', maxWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 7 + 4;
    }

    if (settings.includeFooter && settings.footerText) {
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(settings.footerText, marginX, pageHeight - 8, { maxWidth });
    }

    const blob = doc.output('blob');
    return { url: URL.createObjectURL(blob), filename: `${item.worksheetTitle}.pdf` };
  }

  if (settings.format === 'docx') {
    const text = item.content.blocks.map((b) => b.content || '').join('\n\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    return { url: URL.createObjectURL(blob), filename: `${item.worksheetTitle}.txt` };
  }

  const blob = new Blob([JSON.stringify(worksheet, null, 2)], { type: 'application/json' });
  return { url: URL.createObjectURL(blob), filename: `${item.worksheetTitle}.json` };
}

async function createZipFromUrls(
  results: Array<{ url: string; filename: string }>,
): Promise<string> {
  // Collect all blobs and create a simple multi-part download manifest
  const manifest: Array<{ filename: string; data: string }> = [];
  for (const r of results) {
    manifest.push({ filename: r.filename, data: r.url });
  }
  const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

export function useBatchExport(): UseBatchExportReturn {
  const [currentJob, setCurrentJob] = useState<BatchExportJob | null>(null);
  const cancelRef = useRef(false);

  const startBatchExport = useCallback(async (items: BatchExportItem[], settings: ExportSettings) => {
    if (items.length === 0) return;

    cancelRef.current = false;

    const jobId = generateId();
    const job: BatchExportJob = {
      id: jobId,
      items,
      settings,
      status: 'processing',
      progress: 0,
      completedCount: 0,
      failedCount: 0,
      results: [],
      createdAt: new Date().toISOString(),
    };

    setCurrentJob({ ...job });

    const successUrls: Array<{ url: string; filename: string }> = [];

    for (let i = 0; i < items.length; i++) {
      if (cancelRef.current) {
        setCurrentJob((prev) =>
          prev ? { ...prev, status: 'cancelled', completedAt: new Date().toISOString() } : prev,
        );
        return;
      }

      const item = items[i];
      try {
        const result = await exportSingleItem(item, settings);
        successUrls.push(result);
        setCurrentJob((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            completedCount: prev.completedCount + 1,
            progress: Math.round(((i + 1) / items.length) * 100),
            results: [...prev.results, { worksheetId: item.worksheetId, status: 'done', url: result.url }],
          };
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Export hatası';
        setCurrentJob((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            failedCount: prev.failedCount + 1,
            progress: Math.round(((i + 1) / items.length) * 100),
            results: [...prev.results, { worksheetId: item.worksheetId, status: 'error', error: errorMsg }],
          };
        });
      }
    }

    // Create zip manifest if multiple files
    if (successUrls.length > 1) {
      const zipUrl = await createZipFromUrls(successUrls);
      // Trigger download of the manifest
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `batch-export-${jobId.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(zipUrl);
    } else if (successUrls.length === 1) {
      const a = document.createElement('a');
      a.href = successUrls[0].url;
      a.download = successUrls[0].filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(successUrls[0].url);
    }

    setCurrentJob((prev) =>
      prev
        ? {
            ...prev,
            status: prev.failedCount === 0 ? 'done' : prev.completedCount === 0 ? 'error' : 'done',
            progress: 100,
            completedAt: new Date().toISOString(),
          }
        : prev,
    );
  }, []);

  const cancelBatchExport = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const retryFailed = useCallback(async () => {
    if (!currentJob) return;
    const failedItems = currentJob.items.filter((item) => {
      const result = currentJob.results.find((r) => r.worksheetId === item.worksheetId);
      return result?.status === 'error';
    });
    if (failedItems.length === 0) return;
    await startBatchExport(failedItems, currentJob.settings);
  }, [currentJob, startBatchExport]);

  const clearJob = useCallback(() => {
    setCurrentJob(null);
  }, []);

  return {
    currentJob,
    isRunning: currentJob?.status === 'processing',
    startBatchExport,
    cancelBatchExport,
    retryFailed,
    clearJob,
  };
}

export type { UseBatchExportReturn };
