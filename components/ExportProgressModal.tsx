// @ts-nocheck
import React from 'react';

interface ExportProgressModalProps {
  isOpen: boolean;
  percent: number;
  message: string;
  onCancel?: () => void;
}

export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  isOpen,
  percent,
  message,
  onCancel,
}) => {
  if (!isOpen) return null;

  const clampedPercent = Math.min(100, Math.max(0, percent));
  const isComplete = clampedPercent >= 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[var(--bg-paper)] border border-[var(--border-color)] rounded-2xl shadow-2xl p-6 w-[340px] max-w-[90vw]">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isComplete 
              ? 'bg-emerald-500/15 text-emerald-500' 
              : 'bg-[var(--accent-muted)] text-[var(--accent-color)]'
          }`}>
            <i className={`fa-solid ${isComplete ? 'fa-circle-check' : 'fa-file-pdf fa-beat-fade'} text-lg`}></i>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              {isComplete ? 'Tamamlandı!' : 'PDF Oluşturuluyor'}
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">
              {message}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden mb-3">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out ${
              isComplete 
                ? 'bg-emerald-500' 
                : 'bg-gradient-to-r from-[var(--accent-color)] to-purple-500'
            }`}
            style={{ width: `${clampedPercent}%` }}
          />
          {!isComplete && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          )}
        </div>

        {/* Percent */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            %{Math.round(clampedPercent)}
          </span>
          {!isComplete && onCancel && (
            <button
              onClick={onCancel}
              className="text-[10px] font-medium text-[var(--text-muted)] hover:text-red-400 transition-colors"
            >
              İptal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
