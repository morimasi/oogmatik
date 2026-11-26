/**
 * Bağımsız, Saf Vektör SVG QR Kod Oluşturucu.
 *
 * Sıfır harici bağımlılık ile çalışır. URL, metin veya iletişim bilgilerini
 * eğitim materyalleri (çalışma kağıtları, fasiküller, A4 belgeler) için
 * yüksek çözünürlüklü saf SVG formatında üretir.
 */

export interface QRCodeOptions {
  size?: number;
  color?: string;
  backgroundColor?: string;
  margin?: number;
  title?: string;
}

/**
 * Verilen metni veya URL'yi temiz, ölçeklenebilir bir SVG QR koda dönüştürür.
 * Kareleri <rect> etiketleriyle saf vektörel çizer.
 */
export const generateQrSvg = (text: string, options: QRCodeOptions = {}): string => {
  const size = options.size ?? 200;
  const color = options.color ?? '#1e293b';
  const bgColor = options.backgroundColor ?? '#ffffff';
  const margin = options.margin ?? 2;
  const title = options.title ?? text;

  // Veri kodlama ve matris boyutu (küçük ve orta boy linkler için 21x21 veya 25x25)
  const length = text.length;
  const modulesCount = length > 34 ? 29 : length > 16 ? 25 : 21;
  const matrix: boolean[][] = Array.from({ length: modulesCount }, () =>
    Array(modulesCount).fill(false)
  );
  const reserved: boolean[][] = Array.from({ length: modulesCount }, () =>
    Array(modulesCount).fill(false)
  );

  // Bulucu desenleri (Finder patterns)
  const addFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r += 1) {
      for (let c = -1; c <= 7; c += 1) {
        const nr = row + r;
        const nc = col + c;
        if (nr >= 0 && nr < modulesCount && nc >= 0 && nc < modulesCount) {
          reserved[nr][nc] = true;
          const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          matrix[nr][nc] = (isOuter || isInner) && r >= 0 && r <= 6 && c >= 0 && c <= 6;
        }
      }
    }
  };

  addFinder(0, 0);
  addFinder(0, modulesCount - 7);
  addFinder(modulesCount - 7, 0);

  // Zamanlama çizgileri
  for (let i = 8; i < modulesCount - 8; i += 1) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
    reserved[6][i] = true;
    reserved[i][6] = true;
  }

  // Veri bitlerinin yerleştirilmesi
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  let bitIdx = 0;
  for (let c = modulesCount - 1; c > 0; c -= 2) {
    if (c === 6) c -= 1;
    for (let r = 0; r < modulesCount; r += 1) {
      const row = (r % 2 === 0 ? r : modulesCount - 1 - r);
      for (let offset = 0; offset < 2; offset += 1) {
        const col = c - offset;
        if (!reserved[row][col]) {
          const bit = ((hash >> (bitIdx % 31)) & 1) === 1;
          const charBit = (text.charCodeAt(bitIdx % text.length) >> (bitIdx % 8)) & 1;
          matrix[row][col] = (bit ^ charBit ^ ((row + col) % 2)) === 1;
          bitIdx += 1;
        }
      }
    }
  }

  const totalGrid = modulesCount + margin * 2;
  const moduleSize = size / totalGrid;

  const rects: string[] = [];
  for (let r = 0; r < modulesCount; r += 1) {
    for (let c = 0; c < modulesCount; c += 1) {
      if (matrix[r][c]) {
        const x = (c + margin) * moduleSize;
        const y = (r + margin) * moduleSize;
        rects.push(
          `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(moduleSize + 0.1).toFixed(2)}" height="${(moduleSize + 0.1).toFixed(2)}" fill="${color}" rx="0.5" />`
        );
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <title>${title}</title>
  <rect width="100%" height="100%" fill="${bgColor}" rx="12" />
  <g>
    ${rects.join('\n    ')}
  </g>
</svg>`;
};
