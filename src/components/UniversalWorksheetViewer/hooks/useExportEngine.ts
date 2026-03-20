import { useState, useCallback, useRef } from 'react';
import type {
  ExportJob,
  ExportFormat,
  ExportSettings,
  WorksheetDocument,
  UseExportEngineReturn,
} from '../types/worksheet';

function makeJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

// ── Simulated export implementations ─────────────────────────────────────────
// In production these would call real export libraries (jsPDF, html2canvas, etc.)

async function doExportPdf(
  document: WorksheetDocument,
  settings: ExportSettings,
  onProgress: (p: number) => void,
): Promise<string> {
  // Simulate progressive export
  for (let i = 10; i <= 90; i += 20) {
    onProgress(i);
    await new Promise<void>((r) => setTimeout(r, 80));
  }
  // In a real implementation we'd use jsPDF / @react-pdf/renderer here
  const blob = new Blob(
    [JSON.stringify({ document, settings, exportedAt: nowIso() }, null, 2)],
    { type: 'application/pdf' },
  );
  const url = URL.createObjectURL(blob);
  onProgress(100);
  return url;
}

async function doExportPng(
  document: WorksheetDocument,
  settings: ExportSettings,
  onProgress: (p: number) => void,
): Promise<string> {
  for (let i = 10; i <= 90; i += 30) {
    onProgress(i);
    await new Promise<void>((r) => setTimeout(r, 60));
  }
  // In a real implementation we'd use html2canvas here
  const blob = new Blob(
    [JSON.stringify({ document, settings, exportedAt: nowIso() })],
    { type: 'image/png' },
  );
  const url = URL.createObjectURL(blob);
  onProgress(100);
  return url;
}

async function doExportDocx(
  document: WorksheetDocument,
  settings: ExportSettings,
  onProgress: (p: number) => void,
): Promise<string> {
  for (let i = 10; i <= 90; i += 25) {
    onProgress(i);
    await new Promise<void>((r) => setTimeout(r, 70));
  }
  const blob = new Blob(
    [JSON.stringify({ document, settings, exportedAt: nowIso() })],
    { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  );
  const url = URL.createObjectURL(blob);
  onProgress(100);
  return url;
}

async function doExportJson(
  document: WorksheetDocument,
  settings: ExportSettings,
  onProgress: (p: number) => void,
): Promise<string> {
  onProgress(50);
  await new Promise<void>((r) => setTimeout(r, 30));
  const blob = new Blob([JSON.stringify({ document, settings, exportedAt: nowIso() }, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  onProgress(100);
  return url;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

interface UseExportEngineOptions {
  document: WorksheetDocument;
  defaultSettings: ExportSettings;
}

export function useExportEngine(options: UseExportEngineOptions): UseExportEngineReturn {
  const { document, defaultSettings } = options;
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const cancelledRef = useRef<Set<string>>(new Set());

  const updateJob = useCallback((id: string, updates: Partial<ExportJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
  }, []);

  const exportDocument = useCallback(
    async (format: ExportFormat, settingsOverride?: Partial<ExportSettings>): Promise<ExportJob> => {
      const settings: ExportSettings = { ...defaultSettings, ...settingsOverride, format };
      const jobId = makeJobId();
      const job: ExportJob = {
        id: jobId,
        format,
        status: 'pending',
        progress: 0,
        startedAt: nowIso(),
      };
      setJobs((prev) => [...prev, job]);

      const onProgress = (p: number) => {
        if (!cancelledRef.current.has(jobId)) {
          updateJob(jobId, { progress: p, status: 'processing' });
        }
      };

      try {
        updateJob(jobId, { status: 'processing' });

        let url: string;
        switch (format) {
          case 'pdf':
            url = await doExportPdf(document, settings, onProgress);
            break;
          case 'png':
            url = await doExportPng(document, settings, onProgress);
            break;
          case 'docx':
            url = await doExportDocx(document, settings, onProgress);
            break;
          case 'json':
            url = await doExportJson(document, settings, onProgress);
            break;
          default:
            throw new Error(`Bilinmeyen format: ${format}`);
        }

        if (cancelledRef.current.has(jobId)) {
          const cancelledJob: ExportJob = { ...job, status: 'error', error: 'İptal edildi', progress: 0 };
          updateJob(jobId, cancelledJob);
          return cancelledJob;
        }

        const doneJob: ExportJob = { ...job, status: 'done', progress: 100, url, completedAt: nowIso() };
        updateJob(jobId, doneJob);
        return doneJob;
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        const failedJob: ExportJob = { ...job, status: 'error', error: errMsg, completedAt: nowIso() };
        updateJob(jobId, failedJob);
        return failedJob;
      }
    },
    [document, defaultSettings, updateJob],
  );

  const batchExport = useCallback(
    async (formats: ExportFormat[]): Promise<ExportJob[]> => {
      const results = await Promise.all(formats.map((f) => exportDocument(f)));
      return results;
    },
    [exportDocument],
  );

  const cancelJob = useCallback((jobId: string) => {
    cancelledRef.current.add(jobId);
    updateJob(jobId, { status: 'error', error: 'İptal edildi' });
  }, [updateJob]);

  const clearJobs = useCallback(() => {
    setJobs([]);
    cancelledRef.current.clear();
  }, []);

  const isExporting = jobs.some((j) => j.status === 'pending' || j.status === 'processing');

  return { jobs, exportDocument, batchExport, cancelJob, clearJobs, isExporting };
}
