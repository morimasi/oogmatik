import React, { useState, useMemo } from 'react';
import { X, Check, Calculator, Sparkles } from 'lucide-react';
import { renderLatexToHtml, renderLatexToSvg, QUICK_FORMULAS } from '../../utils/mathRenderer';

interface MathFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (svgContent: string) => void;
}

export const MathFormulaModal: React.FC<MathFormulaModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [latex, setLatex] = useState('\\frac{a}{b}');
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState('#0f172a');

  const preview = useMemo(() => {
    return renderLatexToHtml(latex);
  }, [latex]);

  if (!isOpen) return null;

  const handleInsert = () => {
    const result = renderLatexToSvg(latex, { fontSize, color });
    if (result.ok && result.svg) {
      onInsert(result.svg);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[var(--text-primary)] font-['Lexend']">
        <header className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600">
              <Calculator size={18} />
            </span>
            <div>
              <h3 className="text-sm font-black tracking-tight">Matematik &amp; Fen Formülü</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)]">
                KaTeX / LaTeX ile vektör denklem ekleyin
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
              Hızlı Formüller
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar p-1 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
              {QUICK_FORMULAS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setLatex(item.latex)}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1 text-[10px] font-bold hover:border-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* LaTeX Input */}
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              LaTeX Kodu
            </label>
            <textarea
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              rows={3}
              placeholder="LaTeX kodunu buraya yazın..."
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-2.5 text-xs font-mono outline-none focus:border-indigo-500"
            />
          </div>

          {/* Ayarlar */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-bold">
              <span>Punto:</span>
              <input
                type="number"
                min={12}
                max={64}
                value={fontSize}
                onChange={(e) => setFontSize(Math.max(12, Math.min(64, Number(e.target.value) || 24)))}
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
          <div>
            <span className="mb-1.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              <Sparkles size={11} className="text-amber-500" /> Canlı Önizleme
            </span>
            <div
              className="flex min-h-[72px] items-center justify-center rounded-xl border border-dashed border-[var(--border-color)] bg-white p-3 text-slate-900 shadow-inner overflow-x-auto"
              style={{ fontSize: `${fontSize}px`, color }}
            >
              {preview.ok && preview.html ? (
                <div dangerouslySetInnerHTML={{ __html: preview.html }} />
              ) : (
                <span className="text-xs text-rose-500 font-bold">
                  {preview.error || 'Geçersiz LaTeX sözdizimi'}
                </span>
              )}
            </div>
          </div>
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
            disabled={!preview.ok}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
          >
            <Check size={14} /> Tuvale Ekle
          </button>
        </footer>
      </div>
    </div>
  );
};
