import type { HeceRow, HeceData } from '../types/sariKitap';

const UNLULER = new Set(['a', 'e', 'ı', 'i', 'o', 'ö', 'u', 'ü', 'â', 'î', 'û']);

function isUnlu(char: string): boolean {
  return UNLULER.has(char.toLowerCase());
}

/**
 * Türkçe fonetik kurallara göre hece ayırma
 *
 * Kurallar:
 * 1. Her hecede en az bir ünlü bulunur
 * 2. İki ünlü arasındaki tek ünsüz → sonraki hecenin başına
 * 3. İki ünlü arasında iki ünsüz → ilki önceki hecede
 * 4. İki ünlü arasında üç+ ünsüz → ilk ikisi önceki hecede
 */
export function hecelereAyir(kelime: string): string[] {
  if (!kelime || kelime.length === 0) return [];

  const lower = kelime.toLowerCase();
  const chars = [...lower];

  // Ünlü pozisyonlarını bul
  const vowelPositions: number[] = [];
  for (let i = 0; i < chars.length; i++) {
    if (isUnlu(chars[i])) {
      vowelPositions.push(i);
    }
  }

  // Ünlü yoksa kelimeyi olduğu gibi döndür
  if (vowelPositions.length === 0) return [kelime];
  if (vowelPositions.length === 1) return [kelime];

  const breakPoints: number[] = [];

  for (let v = 0; v < vowelPositions.length - 1; v++) {
    const currentVowel = vowelPositions[v];
    const nextVowel = vowelPositions[v + 1];

    // İki ünlü arasındaki ünsüz sayısı
    const consonantCount = nextVowel - currentVowel - 1;

    if (consonantCount === 0) {
      // Yan yana iki ünlü → aradan kes
      breakPoints.push(nextVowel);
    } else if (consonantCount === 1) {
      // Tek ünsüz → sonraki heceye
      breakPoints.push(currentVowel + 1);
    } else if (consonantCount === 2) {
      // İki ünsüz → ilki önceki hecede kalır
      breakPoints.push(currentVowel + 2);
    } else {
      // Üç+ ünsüz → ilk ikisi önceki hecede
      breakPoints.push(currentVowel + 3);
    }
  }

  // Orijinal casing'i koruyarak hecelere ayır
  const syllables: string[] = [];
  let start = 0;
  for (const bp of breakPoints) {
    syllables.push(kelime.slice(start, bp));
    start = bp;
  }
  syllables.push(kelime.slice(start));

  return syllables.filter((s) => s.length > 0);
}

/**
 * Metni satır satır → kelime kelime → hece hece parse eder
 * AI çıktısının post-processing'i için kullanılır
 */
export function metniHecele(metin: string): HeceRow[] {
  if (!metin) return [];

  const lines = metin.split('\n').filter((line) => line.trim().length > 0);
  const rows: HeceRow[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const words = lines[lineIndex].split(/\s+/).filter((w) => w.length > 0);
    const syllables: HeceData[] = [];

    for (const word of words) {
      // Noktalama işaretlerini ayır (prefix, core, suffix)
      const match = word.match(/^([.,!?;:'"()]*)(.*?)([.,!?;:'"()]*)$/);
      if (!match) continue;

      const prefix = match[1];
      const coreWord = match[2];
      const suffix = match[3];

      if (!coreWord) {
        if (prefix || suffix) {
          syllables.push({
            syllable: prefix + suffix,
            isHighlighted: false,
            dotBelow: false,
            bridgeNext: false,
          });
        }
        continue;
      }

      const heceler = hecelereAyir(coreWord);
      for (let h = 0; h < heceler.length; h++) {
        let displayHece = heceler[h];
        if (h === 0) displayHece = prefix + displayHece;
        if (h === heceler.length - 1) displayHece = displayHece + suffix;

        syllables.push({
          syllable: displayHece,
          isHighlighted: false,
          dotBelow: false,
          bridgeNext: false,
        });
      }
    }

    if (syllables.length > 0) {
      rows.push({ syllables, lineIndex });
    }
  }

  return rows;
}

/**
 * Metni kelime kelime parse eder (hece ayırmadan).
 * Nokta ve Köprü etkinliklerinde kelime bazlı çalışma için kullanılır.
 */
export function metniKelimele(metin: string): HeceRow[] {
  if (!metin) return [];

  const lines = metin.split('\n').filter((line) => line.trim().length > 0);
  const rows: HeceRow[] = [];

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const words = lines[lineIndex].split(/\s+/).filter((w) => w.length > 0);
    const syllables: HeceData[] = [];

    for (const word of words) {
      syllables.push({
        syllable: word,
        isHighlighted: false,
        dotBelow: false,
        bridgeNext: false,
      });
    }

    if (syllables.length > 0) {
      rows.push({ syllables, lineIndex });
    }
  }

  return rows;
}
