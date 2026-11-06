import DOMPurify from 'isomorphic-dompurify';

/**
 * AI tarafından üretilen dekoratif SVG kodunu güvenli biçimde temizler.
 *
 * Kapak sayfası bu SVG'yi `dangerouslySetInnerHTML` ile bastığı için, model
 * çıktısına sızmış bir `<script>`, `onload`/`onerror` niteliği veya harici
 * `<use xlink:href>` referansı XSS'e dönüşebilir. Temizlik tek noktadan
 * yapılır; hiçbir bileşen ham SVG'yi doğrudan basmaz.
 */
export function sanitizeSvgMarkup(raw?: string | null): string {
  const value = (raw ?? '').trim();
  if (!value) return '';

  return DOMPurify.sanitize(value, {
    // Yalnızca SVG ailesi ve filtreleri kalsın; HTML gövdesi tamamen düşer.
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ['script', 'style', 'foreignObject', 'iframe', 'object', 'embed', 'a', 'image'],
    FORBID_ATTR: ['href', 'xlink:href', 'src', 'onload', 'onerror', 'onclick', 'onmouseover'],
    KEEP_CONTENT: false,
  });
}
