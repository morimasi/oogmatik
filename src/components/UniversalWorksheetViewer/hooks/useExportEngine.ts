import { AppError } from '../../../utils/AppError';
import { useState, useCallback, useRef } from 'react';
import type { Worksheet, ExportSettings, ExportJob, ExportFormat } from '../types/worksheet';
import { printService } from '../../../utils/printService';

interface UseExportEngineReturn {
  jobs: ExportJob[];
  activeJob: ExportJob | null;
  isExporting: boolean;
  exportWorksheet: (worksheet: Worksheet, settings: ExportSettings) => Promise<void>;
  cancelExport: () => void;
  clearJobs: () => void;
}

function generateJobId() {
  return `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// Unified export engine using printService

async function exportAsPng(_worksheet: Worksheet): Promise<string> {
  // Fontların yüklenmesini bekle
  if (typeof document !== 'undefined') {
    try {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      );
    } catch { /* devam et */ }
  }
  const { default: html2canvas } = await import('html2canvas');
  const el = document.getElementById('worksheet-preview-root');
  if (!el) throw new AppError('Önizleme elementi bulunamadı. Lütfen önizleme panelini açın.', 'INTERNAL_ERROR', 500);
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: document.documentElement.offsetWidth,
    windowHeight: document.documentElement.offsetHeight,
    onclone: (clonedDoc: Document) => {
      try {
        document.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
          clonedDoc.head.appendChild(link.cloneNode(true));
        });
        document.querySelectorAll('style').forEach((style) => {
          clonedDoc.head.appendChild(style.cloneNode(true));
        });
      } catch { /* devam et */ }
    },
  });
  return canvas.toDataURL('image/png');
}

function exportAsJson(worksheet: Worksheet): string {
  const json = JSON.stringify(worksheet, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

function triggerDownload(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-z0-9türçşğüöıİĞÜŞÖÇ\s_-]/gi, '').trim().replace(/\s+/g, '_') || 'calisma_kagidi';
}

export function useExportEngine(): UseExportEngineReturn {
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [activeJob, setActiveJob] = useState<ExportJob | null>(null);
  const abortRef = useRef(false);

  const updateJob = useCallback((id: string, patch: Partial<ExportJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
    setActiveJob((prev) => (prev?.id === id ? { ...prev, ...patch } : prev));
  }, []);

  const exportWorksheet = useCallback(
    async (worksheet: Worksheet, settings: ExportSettings) => {
      abortRef.current = false;
      const job: ExportJob = {
        id: generateJobId(),
        worksheetId: worksheet.metadata.id,
        format: settings.format,
        status: 'pending',
        progress: 0,
        createdAt: new Date().toISOString(),
      };

      setJobs((prev) => [...prev, job]);
      setActiveJob(job);

      try {
        updateJob(job.id, { status: 'processing', progress: 10 });

        let url = '';
        const filename = sanitizeFilename(worksheet.metadata.title);

        switch (settings.format as ExportFormat) {
          case 'pdf': {
            updateJob(job.id, { progress: 40 });
            // Use modern printService for high-fidelity PDF
            await printService.generatePdf('#worksheet-preview-root', filename, {
              action: 'download',
            });
            updateJob(job.id, { progress: 100, status: 'done' });
            break;
          }
          case 'png': {
            updateJob(job.id, { progress: 40 });
            url = await exportAsPng(worksheet);
            updateJob(job.id, { progress: 90 });
            triggerDownload(url, `${filename}.png`);
            break;
          }
          case 'json': {
            updateJob(job.id, { progress: 60 });
            url = exportAsJson(worksheet);
            updateJob(job.id, { progress: 90 });
            triggerDownload(url, `${filename}.json`);
            break;
          }
          case 'docx': {
            // Minimal DOCX via plain-text for now (full library integration optional)
            updateJob(job.id, { progress: 50 });
            const textContent = worksheet.content.blocks
              .map((b) => {
                if (b.type === 'list') return (b.listItems ?? []).map((i) => `• ${i}`).join('\n');
                if (b.type === 'divider') return '───────────────────────────────';
                return b.content;
              })
              .join('\n\n');
            const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
            url = URL.createObjectURL(blob);
            updateJob(job.id, { progress: 90 });
            triggerDownload(url, `${filename}.txt`);
            break;
          }
        }

        updateJob(job.id, { status: 'done', progress: 100, url });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Bilinmeyen hata';
        updateJob(job.id, { status: 'error', error: message });
      } finally {
        setActiveJob(null);
      }
    },
    [updateJob],
  );

  const cancelExport = useCallback(() => {
    abortRef.current = true;
    if (activeJob) {
      updateJob(activeJob.id, { status: 'error', error: 'İptal edildi' });
      setActiveJob(null);
    }
  }, [activeJob, updateJob]);

  const clearJobs = useCallback(() => {
    setJobs([]);
  }, []);

  return {
    jobs,
    activeJob,
    isExporting: activeJob !== null,
    exportWorksheet,
    cancelExport,
    clearJobs,
  };
}
