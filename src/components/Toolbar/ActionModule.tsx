import React, { useState, useEffect, useRef } from 'react';
import { ActivityType, StyleSettings, WorksheetData } from '../../types';
import { IconButton } from './ToolbarShared';
import { usePaperSizeStore } from '../../store/usePaperSizeStore';
import { useAppStore } from '../../store/useAppStore';
import { printService } from '../../utils/printService';
import { ExportProgressModal } from '../ExportProgressModal';
import { useToastStore } from '../../store/useToastStore';
import { useFascicleStore } from '../../store/useFascicleStore';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { logError } from '../../utils/logger.js';
import { snapshotService } from '../../utils/snapshotService';
import {
  collectAnswers,
  sanitizeFileBaseName,
  worksheetToHtml,
} from '../../services/a4StudioService';
import { copyHtmlToClipboard, downloadTextFile, htmlToPlainText } from '../../utils/a4ExportUtils';

interface ActionModuleProps {
  settings: StyleSettings;
  onSave: () => void | Promise<void>;
  onAssign?: () => void;
  onShare?: () => void;
  onFeedback?: () => void;
  worksheetData?: WorksheetData;
  activityType?: string;
}

const ZoomGroup = () => {
  const zoomScale = useAppStore((state) => state.zoomScale);
  const setZoomScale = useAppStore((state) => state.setZoomScale);
  const isEditorOpen = useA4EditorStore((state) => state.isEditorOpen);

  const fitToPage = () => {
    const page = document.querySelector('.worksheet-page') as HTMLElement | null;
    const pageWidth = page?.offsetWidth || 794;
    const available = window.innerWidth - (isEditorOpen ? 440 : 96);
    setZoomScale(Math.max(0.3, Math.min(1.5, Math.round((available / pageWidth) * 100) / 100)));
  };

  return (
    <div
      className="flex items-center bg-[var(--surface-glass)]/50 border border-[var(--border-color)] rounded-2xl p-1 gap-0.5 shadow-sm backdrop-blur-md"
      role="group"
      aria-label="Yakınlaştırma"
    >
      <IconButton
        icon="fa-magnifying-glass-minus"
        title="Uzaklaştır"
        onClick={() => setZoomScale(Math.max(0.3, zoomScale - 0.1))}
        disabled={zoomScale <= 0.3}
        className="!w-8 !h-8"
      />
      <button
        type="button"
        onClick={() => setZoomScale(1)}
        title="Gerçek boyut (%100)"
        aria-label="Gerçek boyut yüzde yüz"
        className="min-w-[44px] h-8 px-1 rounded-lg text-[10px] font-black text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
      >
        %{Math.round(zoomScale * 100)}
      </button>
      <IconButton
        icon="fa-magnifying-glass-plus"
        title="Yakınlaştır"
        onClick={() => setZoomScale(Math.min(2.5, zoomScale + 0.1))}
        disabled={zoomScale >= 2.5}
        className="!w-8 !h-8"
      />
      <IconButton
        icon="fa-expand"
        title="Sayfaya sığdır"
        onClick={fitToPage}
        className="!w-8 !h-8"
      />
    </div>
  );
};

const StudioItem = ({
  icon,
  label,
  hint,
  onClick,
  active,
}: {
  icon: string;
  label: string;
  hint?: string;
  onClick: () => void;
  active?: boolean;
}) => (
  <button
    type="button"
    role="menuitem"
    onClick={onClick}
    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors ${
      active
        ? 'bg-[var(--accent-muted)] text-[var(--accent-color)]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)]'
    }`}
  >
    <i className={`fa-solid ${icon} w-3.5 text-[10px]`}></i>
    <span className="min-w-0 flex-1 truncate text-[10px] font-bold">{label}</span>
    {hint && (
      <span className="shrink-0 text-[8px] font-black uppercase tracking-wider text-[var(--text-muted)]">
        {hint}
      </span>
    )}
  </button>
);

export const ActionModule: React.FC<ActionModuleProps> = ({
  settings,
  onSave,
  onAssign,
  onShare,
  onFeedback,
  worksheetData,
  activityType,
}) => {
  const [exportProgress, setExportProgress] = useState({ open: false, percent: 0, message: '' });
  const [snapshotMenuOpen, setSnapshotMenuOpen] = useState(false);
  const [studioMenuOpen, setStudioMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const snapshotMenuRef = useRef<HTMLDivElement>(null);
  const studioMenuRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklama ve Esc ile açılır menüleri kapat + panel kapalıyken global Ctrl+K / Ctrl+Z kısayolları
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (snapshotMenuOpen && snapshotMenuRef.current && !snapshotMenuRef.current.contains(target)) {
        setSnapshotMenuOpen(false);
      }
      if (studioMenuOpen && studioMenuRef.current && !studioMenuRef.current.contains(target)) {
        setStudioMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSnapshotMenuOpen(false);
        setStudioMenuOpen(false);
        return;
      }
      const target = e.target as HTMLElement | null;
      const isTyping =
        !!target &&
        (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const store = useA4EditorStore.getState();

      // Panel açıkken A4EditorPanel kendi kısayollarını yönetir; kapalıyken buradan çalışır
      if (!store.isEditorOpen && mod && key === 'k') {
        e.preventDefault();
        store.setEditorOpen(true);
        store.setCommandPaletteOpen(true);
        return;
      }
      if (!store.isEditorOpen && !isTyping && mod && key === 'z') {
        e.preventDefault();
        if (e.shiftKey) store.redo();
        else store.undo();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [snapshotMenuOpen, studioMenuOpen]);
  const paperSizeStore = usePaperSizeStore();
  const toast = useToastStore();
  const paperSize = paperSizeStore.paperSize;

  const isEditorOpen = useA4EditorStore((state) => state.isEditorOpen);
  const isPrintPreview = useA4EditorStore((state) => state.isPrintPreview);
  const answerKeyMode = useA4EditorStore((state) => state.answerKeyMode);
  const printLayout = useA4EditorStore((state) => state.printLayout);
  const cutLines = useA4EditorStore((state) => state.cutLines);
  const dirty = useA4EditorStore((state) => state.dirty);
  const canUndo = useA4EditorStore((state) => state.history.length > 0);
  const canRedo = useA4EditorStore((state) => state.future.length > 0);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSave();
      useA4EditorStore.getState().markSaved();
      try {
        window.localStorage.removeItem(`bdmind.a4draft.v1:${activityType ?? 'genel'}`);
      } catch {
        /* storage kapalı olabilir */
      }
    } catch (error) {
      logError(error as Error);
      toast.error('Kaydetme sırasında bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToFascicle = () => {
    if (!worksheetData || !activityType) {
      toast.warning('Fasiküle eklemek için önce bir etkinlik oluşturun.');
      return;
    }

    const normalizedType = activityType.toUpperCase().replace(/-/g, '_');

    const { addItem, items } = useFascicleStore.getState();

    addItem({
      id: crypto.randomUUID(),
      type: normalizedType as ActivityType,
      difficulty: 'Orta',
      pageCount: Array.isArray(worksheetData) ? worksheetData.length : 1,
      order: items.length,
      content: worksheetData,
    });
    toast.success('Fasiküle başarıyla eklendi!');
  };

  const handleUnifiedPrint = async (method: 'pdf' | 'print' | 'v2') => {
    try {
      setExportProgress({ open: true, percent: 0, message: 'Sayfa hazırlanıyor...' });

      const targetSelector = document.getElementById('print-container')
        ? '#print-container'
        : '.worksheet-page';

      if (method === 'v2') {
        const { forceRenderAllPages, ensurePrintStyle } = await import('../../utils/print/CSSInjector');
        forceRenderAllPages();
        ensurePrintStyle(paperSize);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await printService.generatePdf(targetSelector, settings.title || 'bdmind_Calisma_Kagidi', {
        action: method === 'pdf' ? 'download' : 'print',
        paperSize: paperSize,
        onProgress: (percent, message) => {
          setExportProgress({ open: true, percent, message });
        },
      });

      if (method === 'pdf') toast.success('PDF Başarıyla İndirildi!');
    } catch (e) {
      logError(e as Error);
      toast.error('İşlem sırasında bir hata oluştu.');
    } finally {
      setTimeout(() => setExportProgress({ open: false, percent: 0, message: '' }), 800);
    }
  };

  const currentData = (): WorksheetData =>
    useA4EditorStore.getState().bridge?.get() ?? worksheetData ?? null;

  const handleWordExport = (includeAnswers: boolean) => {
    const data = currentData();
    if (!data) {
      toast.warning('Dışa aktarılacak içerik yok.');
      return;
    }
    const title = data[0]?.title ?? settings.title ?? 'bdmind-etkinlik';
    const ok = downloadTextFile(
      worksheetToHtml(data, { title, includeAnswers }),
      `${sanitizeFileBaseName(title)}${includeAnswers ? '-cevap-anahtari' : ''}.doc`,
      'application/msword;charset=utf-8'
    );
    if (ok) toast.success('Word belgesi indirildi.');
    else toast.error('Word belgesi oluşturulamadı.');
  };

  const handleCopyBlocks = async () => {
    const data = currentData();
    if (!data) {
      toast.warning('Kopyalanacak içerik yok.');
      return;
    }
    const selected = useA4EditorStore.getState().selectedBlockIds;
    const html = worksheetToHtml(data, { onlyBlockIds: selected.length ? selected : undefined });
    const ok = await copyHtmlToClipboard(html, htmlToPlainText(html));
    if (ok) toast.success(selected.length ? 'Seçili bileşenler kopyalandı.' : 'Sayfa kopyalandı.');
    else toast.error('Panoya kopyalama izni verilmedi.');
  };

  const handleVectorPrint = async () => {
    try {
      document.body.classList.add('a4-vector-print');
      const { forceRenderAllPages, ensurePrintStyle } = await import('../../utils/print/CSSInjector');
      forceRenderAllPages();
      ensurePrintStyle(paperSize);
      await new Promise((resolve) => setTimeout(resolve, 450));
      window.print();
    } catch (error) {
      logError(error as Error);
      toast.error('Vektörel yazdırma başlatılamadı.');
    } finally {
      setTimeout(() => document.body.classList.remove('a4-vector-print'), 900);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <ExportProgressModal
        isOpen={exportProgress.open}
        percent={exportProgress.percent}
        message={exportProgress.message}
      />

      {/* Düzenleme Grubu — seçim, geçmiş, önizleme ve zoom */}
      <div
        className="flex items-center bg-[var(--surface-glass)]/50 border border-[var(--border-color)] rounded-2xl p-1 gap-0.5 shadow-sm backdrop-blur-md"
        role="group"
        aria-label="Düzenleme araçları"
      >
        <IconButton
          icon="fa-rotate-left"
          title="Geri al (Ctrl+Z)"
          onClick={() => {
            if (!useA4EditorStore.getState().undo()) toast.info('Geri alınacak değişiklik yok.');
          }}
          disabled={!canUndo}
          className="!w-8 !h-8"
        />
        <IconButton
          icon="fa-rotate-right"
          title="Yinele (Ctrl+Shift+Z)"
          onClick={() => {
            if (!useA4EditorStore.getState().redo()) toast.info('Yinelenecek değişiklik yok.');
          }}
          disabled={!canRedo}
          className="!w-8 !h-8"
        />
        <IconButton
          icon="fa-eye"
          title={isPrintPreview ? 'Düzenleme görünümüne dön' : 'Baskı önizlemesi'}
          onClick={() => useA4EditorStore.getState().setPrintPreview(!isPrintPreview)}
          active={isPrintPreview}
          className="!w-8 !h-8"
        />
      </div>

      <ZoomGroup />

      {/* Dışa Aktarma Grubu */}
      <div
        className="flex items-center bg-[var(--surface-glass)]/50 border border-[var(--border-color)] rounded-2xl p-1 gap-0.5 shadow-sm backdrop-blur-md"
        role="group"
        aria-label="Dışa aktarma"
      >
        <button
          type="button"
          title="PDF Olarak İndir"
          onClick={() => handleUnifiedPrint('pdf')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all duration-200
            bg-[var(--accent-muted)] text-[var(--accent-color)] hover:scale-[1.03] active:scale-95 uppercase tracking-wider"
        >
          <i className="fa-solid fa-file-pdf text-xs"></i>
          <span className="hidden lg:inline">PDF</span>
        </button>

        <button
          type="button"
          title="Sistem Yazdır"
          onClick={() => handleUnifiedPrint('print')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all duration-200
            bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:scale-[1.03] active:scale-95 uppercase tracking-wider"
        >
          <i className="fa-solid fa-print text-xs"></i>
          <span className="hidden lg:inline">YAZDIR</span>
        </button>

        <button
          type="button"
          title="Profesyonel Yazdır (V2) — tüm sayfaları zorla render eder"
          onClick={() => handleUnifiedPrint('v2')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all duration-200
            bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm hover:scale-[1.03] active:scale-95 uppercase tracking-wider"
        >
          <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
          <span className="hidden lg:inline">YAZDIR V2</span>
        </button>

        <div className="relative" ref={snapshotMenuRef}>
          <IconButton
            icon="fa-camera"
            title="Görüntü Al (PNG / panoya kopyala)"
            onClick={() => setSnapshotMenuOpen(!snapshotMenuOpen)}
            active={snapshotMenuOpen}
            className="!w-9 !h-9"
          />
          {snapshotMenuOpen && (
            <div className="absolute top-full mt-2 right-0 z-50 min-w-[210px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setSnapshotMenuOpen(false);
                  snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'download');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all"
              >
                <i className="fa-solid fa-image w-4 text-[var(--accent-color)]"></i> Sayfayı Kaydet (PNG)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSnapshotMenuOpen(false);
                  snapshotService.takeSnapshot('.worksheet-page', 'etkinlik', 'clipboard');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--accent-muted)] hover:text-[var(--accent-color)] transition-all"
              >
                <i className="fa-solid fa-copy w-4 text-emerald-500"></i> Panoya Kopyala
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stüdyo Grubu — komut paleti, cevap anahtarı, kağıt ekonomisi, dışa aktarma */}
      <div className="relative" ref={studioMenuRef}>
        <button
          type="button"
          title="Stüdyo araçları — komut paleti, cevap anahtarı, Word, kağıt ekonomisi"
          aria-haspopup="menu"
          aria-expanded={studioMenuOpen}
          onClick={() => setStudioMenuOpen(!studioMenuOpen)}
          className={`flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-[10px] font-black uppercase tracking-wider transition-all ${
            studioMenuOpen
              ? 'border-[var(--accent-color)] bg-[var(--accent-muted)] text-[var(--accent-color)]'
              : 'border-[var(--border-color)] bg-[var(--surface-glass)]/50 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
          <span className="hidden xl:inline">STÜDYO</span>
          <i className="fa-solid fa-chevron-down text-[8px]"></i>
        </button>
        {studioMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-[268px] rounded-xl border border-[var(--border-color)] bg-[var(--bg-paper)] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95"
          >
            <p className="px-2 pb-1 pt-0.5 text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Düzenleme
            </p>
            <StudioItem
              icon="fa-terminal"
              label="Komut Paleti"
              hint="Ctrl+K"
              onClick={() => {
                setStudioMenuOpen(false);
                useA4EditorStore.getState().setEditorOpen(true);
                useA4EditorStore.getState().setCommandPaletteOpen(true);
              }}
            />
            <StudioItem
              icon="fa-shield-heart"
              label="Üretim Denetimi"
              hint={`${collectAnswers(currentData()).length} cevap`}
              onClick={() => {
                setStudioMenuOpen(false);
                useA4EditorStore.getState().setEditorOpen(true);
                useA4EditorStore.getState().setEditorTab('insights');
              }}
            />
            <div className="my-1 h-px bg-[var(--border-color)]" />
            <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Nüsha
            </p>
            <StudioItem
              icon="fa-key"
              label="Cevap Anahtarı"
              hint={answerKeyMode === 'appendix' ? 'Ayrı sayfa' : answerKeyMode === 'overlay' ? 'Rozet' : 'Kapalı'}
              active={answerKeyMode !== 'off'}
              onClick={() => {
                const next =
                  answerKeyMode === 'off'
                    ? 'overlay'
                    : answerKeyMode === 'overlay'
                      ? 'appendix'
                      : 'off';
                useA4EditorStore.getState().setAnswerKeyMode(next);
              }}
            />
            <StudioItem
              icon="fa-copy"
              label="Yaprak Başına 2 Sayfa"
              hint={printLayout === 'nup2' ? 'Açık' : 'Kapalı'}
              active={printLayout === 'nup2'}
              onClick={() =>
                useA4EditorStore
                  .getState()
                  .setPrintLayout(printLayout === 'nup2' ? 'single' : 'nup2')
              }
            />
            <StudioItem
              icon="fa-scissors"
              label="Kesme Çizgileri"
              hint={cutLines ? 'Açık' : 'Kapalı'}
              active={cutLines}
              onClick={() => useA4EditorStore.getState().setCutLines(!cutLines)}
            />
            <div className="my-1 h-px bg-[var(--border-color)]" />
            <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Çıktı
            </p>
            <StudioItem
              icon="fa-file-pdf"
              label="Vektörel PDF"
              hint="Metin seçilebilir"
              onClick={() => {
                setStudioMenuOpen(false);
                void handleVectorPrint();
              }}
            />
            <StudioItem
              icon="fa-file-word"
              label="Word İndir"
              hint="Öğrenci nüshası"
              onClick={() => {
                setStudioMenuOpen(false);
                handleWordExport(false);
              }}
            />
            <StudioItem
              icon="fa-file-circle-check"
              label="Word — Cevap Anahtarlı"
              hint="Öğretmen nüshası"
              onClick={() => {
                setStudioMenuOpen(false);
                handleWordExport(true);
              }}
            />
            <StudioItem
              icon="fa-copy"
              label="Panoya Kopyala"
              hint="Seçili bloklar"
              onClick={() => {
                setStudioMenuOpen(false);
                void handleCopyBlocks();
              }}
            />
          </div>
        )}
      </div>

      {/* Kaydetme & Atama Grubu */}
      <div
        className="flex items-center bg-[var(--surface-glass)]/50 border border-[var(--border-color)] rounded-2xl p-1 gap-1 shadow-sm backdrop-blur-md"
        role="group"
        aria-label="Kaydetme ve paylaşım"
      >
        <div className="relative" ref={snapshotMenuRef}>
          <IconButton
            icon="fa-bookmark"
            title={dirty ? 'Arşive Kaydet — kaydedilmemiş değişiklik var' : 'Arşive Kaydet'}
            onClick={() => void handleSave()}
            isLoading={isSaving}
            colorClass="text-amber-500"
            active={dirty}
          />
          {dirty && (
            <span
              className="pointer-events-none absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-[var(--bg-paper)]"
              aria-hidden="true"
            />
          )}
        </div>
        {onAssign && (
          <IconButton
            icon="fa-user-plus"
            title="Öğrenciye Ata"
            onClick={onAssign}
            colorClass="text-emerald-500"
          />
        )}
        {onShare && (
          <IconButton
            icon="fa-share-nodes"
            title="Hızlı Paylaş"
            onClick={onShare}
            colorClass="text-sky-500"
          />
        )}
        <IconButton
          icon="fa-layer-group"
          title="Fasiküle Ekle"
          onClick={handleAddToFascicle}
          colorClass="text-fuchsia-500"
        />
        <IconButton
          icon="fa-pen-ruler"
          title={isEditorOpen ? 'A4 Tasarımcısını Kapat' : 'A4 Tasarımcısını Aç'}
          onClick={() => {
            const current = useA4EditorStore.getState().isEditorOpen;
            useA4EditorStore.getState().setEditorOpen(!current);
          }}
          active={isEditorOpen}
          colorClass="text-[var(--accent-color)]"
        />
        {onFeedback && (
          <IconButton
            icon="fa-comment-dots"
            title="Geri Bildirim Gönder"
            onClick={onFeedback}
            colorClass="text-purple-500"
          />
        )}
      </div>
    </div>
  );
};
