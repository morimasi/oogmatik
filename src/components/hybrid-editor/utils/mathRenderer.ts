import katex from 'katex';

/**
 * KaTeX Matematik ve Fen Formül Motoru.
 *
 * LaTeX dizgisini temiz, ölçeklenebilir ve yüksek kaliteli SVG veya HTML
 * yapısına dönüştürür. Hata durumunda güvenli geri dönüş sağlar.
 */

export interface FormulaRenderResult {
  ok: boolean;
  html?: string;
  svg?: string;
  error?: string;
}

/**
 * LaTeX dizesini HTML'e dönüştürür.
 */
export const renderLatexToHtml = (latex: string, displayMode = true): FormulaRenderResult => {
  if (!latex.trim()) {
    return { ok: false, error: 'Formül boş olamaz.' };
  }
  try {
    const html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
    });
    return { ok: true, html };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Formül dönüştürülemedi.',
    };
  }
};

/**
 * LaTeX dizesini doğrudan Fabric / tuvale eklenebilecek SVG formatına sarar.
 * KaTeX HTML çıktısını foreignObject ile sararak standart vektör SVG elde eder.
 */
export const renderLatexToSvg = (
  latex: string,
  options: { fontSize?: number; color?: string } = {}
): FormulaRenderResult => {
  if (!latex.trim()) {
    return { ok: false, error: 'Formül boş olamaz.' };
  }
  try {
    const fontSize = options.fontSize ?? 22;
    const color = options.color ?? '#0f172a';
    const html = katex.renderToString(latex, {
      displayMode: true,
      throwOnError: false,
    });

    // Tahmini genişlik/yükseklik
    const estimatedWidth = Math.max(160, Math.min(800, latex.length * 20 + 60));
    const estimatedHeight = Math.max(70, Math.min(300, fontSize * 3.5));

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${estimatedWidth} ${estimatedHeight}" width="${estimatedWidth}" height="${estimatedHeight}">
  <style>
    .formula-container {
      font-size: ${fontSize}px;
      color: ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-family: 'KaTeX_Main', 'Lexend', serif;
    }
  </style>
  <foreignObject width="100%" height="100%">
    <div xmlns="http://www.w3.org/1999/xhtml" class="formula-container">
      ${html}
    </div>
  </foreignObject>
</svg>`;

    return { ok: true, html, svg };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'SVG oluşturulamadı.',
    };
  }
};

export const QUICK_FORMULAS = [
  { label: 'Kesir', latex: '\\frac{a}{b}' },
  { label: 'Karekök', latex: '\\sqrt{x}' },
  { label: 'Üslü Sayı', latex: 'x^{2}' },
  { label: 'Alt Simge', latex: 'x_{1}' },
  { label: 'Toplama & Çıkarma', latex: 'a + b = c' },
  { label: 'Çarpma & Bölme', latex: 'a \\times b \\div c' },
  { label: 'Denklem', latex: '2x + 5 = 15' },
  { label: 'Üçgen Alanı', latex: 'A = \\frac{taban \\times yukseklik}{2}' },
  { label: 'Daire Alanı', latex: 'A = \\pi r^{2}' },
  { label: 'Pisagor', latex: 'a^{2} + b^{2} = c^{2}' },
  { label: 'Yüzde', latex: '\\%25 = \\frac{25}{100}' },
  { label: 'Küme Elemanı', latex: 'x \\in A' },
];
