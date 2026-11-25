import React, { useState, useEffect, useRef, useCallback } from 'react';
import { printService } from '../utils/printService';
import { snapshotService } from '../utils/snapshotService';
import { renderPaginatedPreview } from '../utils/print/PaginatedPreview';
import type { WorksheetData, StyleSettings } from '../types';
import type { PaperSize, PdfQuality } from '../utils/print/types';
import { usePaperSizeStore } from '../store/usePaperSizeStore';
import { ExportProgressModal } from './ExportProgressModal';
import { logError, logWarn } from '../utils/logger.js';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  worksheetData?: WorksheetData;
  title?: string;
  settings?: StyleSettings;
}

const PAPER_OPTIONS: { id: PaperSize; label: string }[] = [
  { id: 'Extreme_Dikey', label: 'A4 Dikey' },
  { id: 'Extreme_Yatay', label: 'A4 Yatay' },
  { id: 'Letter', label: 'Letter' },
  { id: 'Legal', label: 'Legal' },
];

const QUALITY_OPTIONS: { id: PdfQuality; label: string }[] = [
  { id: 'standard', label: 'Hızlı (1.5x)' },
  { id: 'high', label: 'Yüksek (2x)' },
  { id: 'print', label: 'Baskı (3x)' },
];

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  worksheetData: _worksheetData,
  title,
  settings: _settings,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [quality, setQuality] = useState<PdfQuality>('print');
  const [grayscale, setGrayscale] = useState(false);
  const [exportProgress, setExportProgress] = useState({ open: false, percent: 0, message: '' });
  const [previewReady, setPreviewReady] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<{ cleanup: () => void; scrollToPage: (i: number) => void } | null>(null);
  const { paperSize, setPaperSize } = usePaperSizeStore();

  const renderPreview = useCallback(async () => {
    const container = previewContainerRef.current;
    if (!container) return;

    if (cleanupRef.current) {
      cleanupRef.current.cleanup();
      cleanupRef.current = null;
    }

    setPreviewBusy(true);
    try {
      // Yazdırma/PDF ile AYNI akıllı mizanpaj motoru kullanılır.
      // Böylece önizlemede görünen sayfa bölünmesi çıktıyla birebir aynıdır.
      const result = await renderPaginatedPreview(
        container,
        paperSize as unknown as PaperSize,
        '.worksheet-page, .a4-page, .universal-mode-canvas, .print-page'
      );

      setTotalPages(result.totalPages);
      setCurrentPage(1);
      setPreviewReady(result.totalPages > 0);

      cleanupRef.current = {
        cleanup: result.cleanup,
        scrollToPage: result.scrollToPage,
      };
    } catch (err) {
      logWarn(err instanceof Error ? err.message : String(err));
      setPreviewReady(false);
    } finally {
      setPreviewBusy(false);
    }
  }, [paperSize]);

  useEffect(() => {
    if (!isOpen) {
      setPreviewReady(false);
      return;
    }

    const timer = setTimeout(() => {
      void renderPreview();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (cleanupRef.current) {
        cleanupRef.current.cleanup();
        cleanupRef.current = null;
      }
    };
  }, [isOpen, renderPreview]);

  useEffect(() => {
    if (isOpen && previewReady) {
      void renderPreview();
    }
  }, [paperSize]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentPage((prev) => {
        const newPage = direction === 'prev' ? Math.max(1, prev - 1) : Math.min(totalPages, prev + 1);
        if (cleanupRef.current) {
          cleanupRef.current.scrollToPage(newPage - 1);
        }
        return newPage;
      });
    },
    [totalPages]
  );

  if (!isOpen) return null;

  const handleAction = async (action: 'print' | 'pdf' | 'zip') => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 50));

    const targetSelector = document.getElementById('print-container')
      ? '#print-container'
      : '.worksheet-page, .a4-page, .universal-mode-canvas';

    try {
      if (action === 'print') {
        await printService.generatePdf(targetSelector, title, {
          action: 'print',
          paperSize: paperSize as unknown as PaperSize,
          grayscale,
        });
      } else if (action === 'pdf') {
        setExportProgress({ open: true, percent: 0, message: 'PDF Hazırlanıyor...' });
        await printService.generateRealPdf(targetSelector, title, {
          paperSize: paperSize as unknown as PaperSize,
          quality,
          grayscale,
          onProgress: (percent, msg) => setExportProgress({ open: true, percent, message: msg }),
        });
      } else if (action === 'zip') {
        setExportProgress({ open: true, percent: 40, message: 'Görüntüler sıkıştırılıyor...' });
        await snapshotService.takeSnapshot(targetSelector, title ?? 'etkinlik', 'download_zip', 2);
      }
    } catch (e) {
      logError(e instanceof Error ? e : String(e));
    } finally {
      setIsProcessing(false);
      setExportProgress({ open: false, percent: 0, message: '' });
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200 font-lexend">
        <div className="bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] w-full max-w-5xl h-[88vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
          {/* Sol Panel: Ayarlar ve Eylemler */}
          <div className="w-full md:w-80 bg-[var(--bg-secondary)]/70 flex flex-col border-r border-[var(--border-color)]">
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
                  <i className="fa-solid fa-print text-[var(--accent-color)]"></i> Dışa Aktar
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                  Platform Baskı Merkezi
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Kapat"
                className="w-8 h-8 rounded-full bg-[var(--bg-paper)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              {/* Kağıt Boyutu & Yön */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">
                  Kağıt Boyutu & Yön
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PAPER_OPTIONS.map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPaperSize(p.id)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        paperSize === p.id
                          ? 'bg-[var(--accent-muted)] border-[var(--accent-color)] text-[var(--accent-color)] shadow-sm'
                          : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-color)]/40'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PDF Kalitesi */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">
                  PDF Çözünürlüğü
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      type="button"
                      key={q.id}
                      onClick={() => setQuality(q.id)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all ${
                        quality === q.id
                          ? 'bg-[var(--accent-muted)] border-[var(--accent-color)] text-[var(--accent-color)]'
                          : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Baskı Ayarları */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest block">
                  Baskı Modu
                </label>
                <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl p-4 space-y-3 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setGrayscale((prev) => !prev)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <div>
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        Siyah / Beyaz (Mürekkep Tasarrufu)
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)]">
                        Yüksek kontrastlı ekonomik çıktı
                      </span>
                    </div>
                    <span
                      className={`w-10 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                        grayscale ? 'bg-[var(--accent-color)] justify-end' : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] justify-start'
                      }`}
                    >
                      <span className="w-4 h-4 rounded-full bg-white shadow"></span>
                    </span>
                  </button>
                </div>
              </div>

              <div className="bg-emerald-500/10 rounded-2xl p-4 border border-emerald-500/20">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-circle-info text-emerald-500 mt-0.5"></i>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] mb-1">
                      Akıllı Mizanpaj Koruması
                    </h4>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                      Kartlar, sorular, ızgara ve tablo satırları asla ortadan bölünmez. Sığmayan blok
                      tamamen sonraki sayfaya taşınır; devam sayfaları işaretlenir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-color)] bg-[var(--bg-paper)] space-y-3">
              <button
                type="button"
                onClick={() => handleAction('pdf')}
                disabled={isProcessing}
                className="w-full py-3.5 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-black rounded-xl shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-xs uppercase tracking-wider"
              >
                <i className="fa-solid fa-file-pdf"></i>
                PREMIUM PDF İNDİR
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAction('print')}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-[var(--accent-color)] hover:opacity-90 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-xs"
                >
                  <i className="fa-solid fa-print"></i>
                  Yazdır
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('zip')}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/40 text-[var(--text-primary)] font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 text-xs"
                >
                  <i className="fa-solid fa-file-zipper"></i>
                  ZIP İndir
                </button>
              </div>
            </div>
          </div>

          {/* Sağ Panel: Canlı Önizleme Alanı */}
          <div className="flex-1 bg-[var(--bg-primary)] overflow-hidden flex flex-col relative">
            {/* Önizleme Araç Çubuğu */}
            <div className="h-14 bg-[var(--bg-paper)]/90 backdrop-blur-md border-b border-[var(--border-color)] flex items-center justify-between px-6 z-10">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)]">
                <i className="fa-regular fa-file-lines text-[var(--accent-color)]"></i>
                {previewReady ? (
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-[10px] text-emerald-500"></i>
                    Akıllı Mizanpaj · {totalPages} Sayfa
                  </span>
                ) : (
                  <span className="text-[var(--text-muted)]">
                    {previewBusy ? 'Mizanpaj hesaplanıyor...' : 'Yükleniyor...'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => { void renderPreview(); }}
                  disabled={previewBusy}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-secondary)] text-[var(--text-muted)] transition-colors disabled:opacity-40"
                  title="Önizlemeyi Yenile"
                >
                  <i className={`fa-solid fa-arrows-rotate text-xs ${previewBusy ? 'fa-spin' : ''}`}></i>
                </button>
                <div className="flex items-center gap-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-1 ml-1">
                  <button
                    type="button"
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage <= 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-paper)] disabled:opacity-40 transition-colors"
                  >
                    <i className="fa-solid fa-chevron-left text-xs"></i>
                  </button>
                  <span className="text-xs font-mono font-bold px-2 text-[var(--text-primary)]">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePageChange('next')}
                    disabled={currentPage >= totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-paper)] disabled:opacity-40 transition-colors"
                  >
                    <i className="fa-solid fa-chevron-right text-xs"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Canlı Önizleme İçeriği */}
            <div
              className={`flex-1 overflow-auto p-4 custom-scrollbar relative transition-all ${grayscale ? 'grayscale contrast-125' : ''}`}
              ref={previewContainerRef}
            >
              {!previewReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-20">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent-muted)] text-[var(--accent-color)] flex items-center justify-center mb-4 animate-pulse">
                    <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                  </div>
                  <h3 className="text-lg font-black text-[var(--text-primary)] mb-2">
                    Önizleme Hazırlanıyor
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] max-w-[280px]">
                    Sayfa içeriği klonlanıyor ve ölçekleniyor...
                  </p>
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="absolute inset-0 bg-[var(--bg-paper)]/85 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                <i className="fa-solid fa-circle-notch fa-spin text-4xl text-[var(--accent-color)] mb-4"></i>
                <div className="text-lg font-bold text-[var(--text-primary)]">İşleniyor...</div>
                <div className="text-sm text-[var(--text-muted)] mt-1">
                  Lütfen bekleyin, yüksek kalite render uzun sürebilir.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ExportProgressModal
        isOpen={exportProgress.open}
        percent={exportProgress.percent}
        message={exportProgress.message}
      />
    </>
  );
};
