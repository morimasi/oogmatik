import React, { useState } from 'react';
import { X, Sparkles, Loader2, Check, Wand2 } from 'lucide-react';
import DOMPurify from 'isomorphic-dompurify';
import { generateSvgCode } from '../../../../services/geminiClient';

interface AIVectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (svgContent: string, label: string) => void;
}

const EXAMPLE_PROMPTS = [
  'Disleksi dostu renkli abaküs çizimi',
  'Basit 2D üçgen prizma açınımı',
  'Gülümseyen eğitici baykuş maskotu',
  'Basit güneş ve bulut illüstrasyonu',
  '4 basamaklı başarı merdiveni şeması',
  'Su döngüsü basit infografik çizimi',
];

export const AIVectorModal: React.FC<AIVectorModalProps> = ({
  isOpen,
  onClose,
  onInsert,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const fullPrompt = `${prompt.trim()}. Disleksi ve özel eğitim dostu, sıfır bilişsel yüklü, yüksek kontrastlı, pastel tonlu (#4F46E5, #0D9488, #F59E0B) temiz saf SVG vektör çizimi. Sadece <svg> kodu üret.`;
      const svg = await generateSvgCode(fullPrompt);
      if (svg && svg.includes('<svg')) {
        const sanitized = DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
        if (sanitized && sanitized.includes('<svg')) {
          setGeneratedSvg(sanitized);
        } else {
          setError('Üretilen SVG güvenlik filtresinden geçemedi.');
        }
      } else {
        setError('Geçerli bir SVG çizimi üretilemedi, lütfen farklı bir prompt deneyin.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI üretimi sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (generatedSvg) {
      const sanitized = DOMPurify.sanitize(generatedSvg, { USE_PROFILES: { svg: true, svgFilters: true } });
      onInsert(sanitized, prompt.slice(0, 20) || 'ai-vektor');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--bg-paper)] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-[var(--text-primary)] font-['Lexend']">
        <header className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <Sparkles size={18} />
            </span>
            <div>
              <h3 className="text-sm font-black tracking-tight">AI Vektör &amp; Çizim Asistanı</h3>
              <p className="text-[10px] font-bold text-[var(--text-muted)]">
                Gemini ile saf SVG pedagojik vektör üretin
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
          {/* Örnek Promptlar */}
          <div>
            <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              Örnek İstekler
            </span>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]">
              {EXAMPLE_PROMPTS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPrompt(item)}
                  className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-paper)] px-2 py-1 text-[10px] font-bold hover:border-purple-500 hover:text-purple-600 transition-colors"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Alanı */}
          <div>
            <label className="mb-1 block text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
              Nasıl bir vektör çizim istiyorsunuz?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Örn: 5 parçalı yapboz şeması, koordinat sistemi..."
                className="flex-1 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-xs font-bold outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-1 rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-50"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                <span>Üret</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs font-bold text-rose-600">
              {error}
            </div>
          )}

          {/* Önizleme */}
          {generatedSvg && (
            <div>
              <span className="mb-1.5 block text-[9px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                Üretilen Vektör Önizleme
              </span>
              <div
                className="flex min-h-[160px] max-h-[240px] items-center justify-center rounded-xl border border-dashed border-purple-500/40 bg-white p-4 shadow-inner overflow-hidden [&>svg]:max-h-full [&>svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: generatedSvg }}
              />
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
            disabled={!generatedSvg}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-1.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 disabled:opacity-50"
          >
            <Check size={14} /> Tuvale Yerleştir
          </button>
        </footer>
      </div>
    </div>
  );
};
