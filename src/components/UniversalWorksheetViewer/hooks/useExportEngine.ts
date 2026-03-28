import { AppError } from '../../../utils/AppError';
import { useState, useCallback, useRef } from 'react';
import type { Worksheet, ExportSettings, ExportJob, ExportFormat } from '../types/worksheet';

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

async function exportAsPdf(worksheet: Worksheet, settings: ExportSettings): Promise<string> {
  // Dynamically import jsPDF to keep the bundle lean
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
    doc.setTextColor(100, 100, 100);
    doc.text(settings.headerText, marginX, 12, { maxWidth });
  }

  doc.setFontSize(20);
  doc.setTextColor(30, 30, 30);
  doc.text(worksheet.metadata.title, marginX, y, { maxWidth });
  y += 12;

  for (const block of worksheet.content.blocks) {
    if (y > doc.internal.pageSize.getHeight() - 25) {
      doc.addPage();
      y = 20;
    }

    switch (block.type) {
      case 'heading': {
        const level = block.headingLevel ?? 2;
        const size = level === 1 ? 16 : level === 2 ? 14 : 12;
        doc.setFontSize(size);
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(block.content, maxWidth);
        doc.text(lines, marginX, y);
        y += lines.length * (size * 0.4) + 4;
        break;
      }
      case 'text': {
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        const lines = doc.splitTextToSize(block.content, maxWidth);
        doc.text(lines, marginX, y);
        y += lines.length * 5 + 4;
        break;
      }
      case 'divider': {
        doc.setDrawColor(180, 180, 180);
        doc.line(marginX, y, pageWidth - marginX, y);
        y += 6;
        break;
      }
      case 'list': {
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        for (const item of block.listItems ?? []) {
          const lines = doc.splitTextToSize(`• ${item}`, maxWidth - 5);
          doc.text(lines, marginX + 5, y);
          y += lines.length * 5 + 2;
          if (y > doc.internal.pageSize.getHeight() - 25) {
            doc.addPage();
            y = 20;
          }
        }
        y += 4;
        break;
      }
      case 'math': {
        doc.setFontSize(11);
        doc.setFont('courier', 'normal');
        doc.setTextColor(30, 30, 30);
        const lines = doc.splitTextToSize(block.mathRaw ?? block.content, maxWidth);
        doc.text(lines, marginX, y);
        doc.setFont('helvetica', 'normal');
        y += lines.length * 5 + 4;
        break;
      }
    }
  }

  if (settings.includeFooter && settings.footerText) {
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(settings.footerText, marginX, pageH - 8, { maxWidth });
  }

  return doc.output('datauristring');
}

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
            url = await exportAsPdf(worksheet, settings);
            updateJob(job.id, { progress: 90 });
            triggerDownload(url, `${filename}.pdf`);
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
