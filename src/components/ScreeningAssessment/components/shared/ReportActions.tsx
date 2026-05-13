import { Save, Download, Printer, Share2, BookOpen, X, ChevronRight } from 'lucide-react';

interface ReportActionsProps {
  onSave?: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
  onShare?: () => void;
  onAddToWorkbook?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  isSaving?: boolean;
  isSaved?: boolean;
  showBack?: boolean;
}

export const ReportActions: React.FC<ReportActionsProps> = ({
  onSave,
  onDownload,
  onPrint,
  onShare,
  onAddToWorkbook,
  onBack,
  onClose,
  isSaving,
  isSaved,
  showBack,
}) => {
  const buttonBase = 'w-8 h-8 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-glass)] text-[var(--text-primary)] border border-[var(--border-color)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95';

  return (
    <div className="flex items-center gap-1.5">
      {showBack && onBack && (
        <button onClick={onBack} className={buttonBase} title="Geri">
          <ChevronRight className="w-4 h-4 rotate-180" />
        </button>
      )}
      {onSave && (
        <button
          onClick={onSave}
          disabled={isSaving || isSaved}
          className={`${buttonBase} ${isSaved ? '!bg-emerald-500/20 !text-emerald-500' : ''}`}
          title="Kaydet"
        >
          <Save className="w-4 h-4" />
        </button>
      )}
      {onDownload && (
        <button onClick={onDownload} className={buttonBase} title="İndir">
          <Download className="w-4 h-4" />
        </button>
      )}
      {onPrint && (
        <button onClick={onPrint} className={buttonBase} title="Yazdır">
          <Printer className="w-4 h-4" />
        </button>
      )}
      {onShare && (
        <button onClick={onShare} className={buttonBase} title="Paylaş">
          <Share2 className="w-4 h-4" />
        </button>
      )}
      {onAddToWorkbook && (
        <button onClick={onAddToWorkbook} className={buttonBase} title="Kitapçığa Ekle">
          <BookOpen className="w-4 h-4" />
        </button>
      )}
      {onClose && (
        <button onClick={onClose} className={buttonBase} title="Kapat">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
