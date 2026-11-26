import React, { useState, useMemo } from 'react';
import { X, QrCode, Check } from 'lucide-react';
import { generateQrSvg } from '../../utils/qrCodeGenerator';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (svgContent: string, label: string) => void;
}

const QUICK_LINKS = [
  { label: 'Sesli Okuma / Podcast', url: 'https://bdmind.org/audio/' },
  { label: 'Video Çözüm Linki', url: 'https://bdmind.org/video-cozum/' },
  { label: 'İnteraktif Alıştırma', url: 'https://bdmind.org/etkinlik/' },
  { label: 'Öğrenci Portalı', url: 'https://bdmind.org/ogrenci/' },
];

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [text, setText] = useState('https://bdmind.org');
  const [size, setSize] = useState(160);
  const [color, setColor] = useState('#1e293b');

  const svgPreview = useMemo(() => {
    if (!text.trim()) return '';
    return generateQrSvg(text.trim(), { size, color });
  }, [text, size, color]);

  if (!isOpen) return null;

  const handleInsert = () => {
    if (svgPreview) {
      onInsert(svgPreview, 'qr-kod');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[var(--text-primary)] font-['Lexend']">
        <header className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <QrCode size={18} />
            </span>
            <div>
              <h3 className="text-sm font-black tracking-tight">QR Kod Vektörü</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)]">
                Çalışma kağıdına ses / video / kaynak bağlantısı ekleyin
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-elevated)] hover:text-[var(--text-primary)]"
          >
            <X size={16} />
          </button>
        </header>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Hızlı Şablonlar */}
          <div>
            <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              Örnek Bağlantılar
            </span>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
              {QUICK_LINKS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setText(item.url)}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1 text-[10px] font-bold hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* URL Input */}
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              Bağlantı URL veya Yönerge Metni
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-bold outline-none focus:border-emerald-500"
            />
          </div>

          {/* Ayarlar */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold">
              <span>Boyut:</span>
              <input
                type="number"
                min={80}
                max={300}
                value={size}
                onChange={(e) => setSize(Math.max(80, Math.min(300, Number(e.target.value) || 160)))}
                className="h-8 w-16 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 text-xs font-bold outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-xs font-bold">
              <span>Renk:</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
              />
            </label>
          </div>

          {/* Canlı Önizleme */}
          {svgPreview && (
            <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-dashed border-[var(--border-color)] bg-white shadow-inner">
              <div
                className="w-36 h-36 [&>svg]:w-full [&>svg]:h-full"
                dangerouslySetInnerHTML={{ __html: svgPreview }}
              />
              <span className="mt-2 text-[10px] font-mono text-slate-500 max-w-[240px] truncate text-center">
                {text}
              </span>
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-[var(--border-color)] px-4 py-3 bg-[var(--bg-secondary)]/30">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border-color)] px-3 py-1.5 text-xs font-bold text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)]"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={!svgPreview}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
          >
            <Check size={14} /> Belgeye Ekle
          </button>
        </footer>
      </div>
    </div>
  );
};
