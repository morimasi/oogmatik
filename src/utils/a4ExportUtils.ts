/**
 * A4 Studio dosya/panosu yardımcıları.
 * DOM'a dokunan ince katman: tarayıcı yoksa sessizce başarısız olur.
 */

export const downloadTextFile = (
  content: string,
  fileName: string,
  mime = 'text/plain;charset=utf-8'
): boolean => {
  if (typeof document === 'undefined') return false;
  try {
    const blob = new Blob(['\ufeff', content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    return true;
  } catch {
    return false;
  }
};

/** Panoya HTML yazar; izin yoksa düz metne düşer. */
export const copyHtmlToClipboard = async (html: string, plain: string): Promise<boolean> => {
  if (typeof navigator === 'undefined') return false;
  try {
    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      return true;
    }
  } catch {
    // HTML yazma reddedildi — düz metne düş
  }
  try {
    await navigator.clipboard.writeText(plain);
    return true;
  } catch {
    return false;
  }
};

/** HTML'den kaba düz metin (pano yedeği için). */
export const htmlToPlainText = (html: string): string => {
  if (typeof document === 'undefined') return html.replace(/<[^>]+>/g, ' ');
  const container = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('br').forEach((node) => node.replaceWith('\n'));
  container.querySelectorAll('p, h1, h2, h3, li, tr').forEach((node) => {
    node.append('\n');
  });
  return (container.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
};
