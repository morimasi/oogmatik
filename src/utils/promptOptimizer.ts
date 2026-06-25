export interface OptimizeResult {
  optimized: string;
  originalTokens: number;
  optimizedTokens: number;
  savingsPercent: number;
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

const REMOVAL_PATTERNS: RegExp[] = [
  /======================================\n\[GLOBAL UNIQENESS & CREATIVITY PROTOCOL - v2\][\s\S]*?======================================/g,
  /======================================\n\[NÖRO-PEDAGOJİK VE KLİNİK BAĞLAM BİLDİRİMİ\][\s\S]*?ZORUNLU UZMAN KURALLARI \(İHLAL EDİLEMEZ\):[\s\S]*?sağlayacaktır\./g,
  /Bu bir (eğitim|öğretim|pedagojik) (materyalidir|içeriktir|çalışmadır)[^.]*\./gi,
  /Lütfen (aşağıdaki|verilen|hazırlanan) (yönergeleri|talimatları|açıklamaları) (dikkatlice|özenle) (takip ediniz|uygulayınız|okuyunuz)\.?/gi,
  /Amaç:[\s\S]*?Kazanım:[\s\S]*?/g,
  /Öğrenci (dikkat|ilgi|odak|motivasyon)[^.]*\./gi,
];

const REPLACEMENT_PATTERNS: [RegExp, string][] = [
  [/lütfen /gi, ''],
  [/dikkatlice /gi, ''],
  [/aşağıdaki /gi, ''],
  [/bulunmaktadır/gi, 'var'],
  [/gerçekleştirilmesi/gi, 'yapılması'],
  [/değerlendirilmesi/gi, 'değerlendirme'],
  [/kullanılmaktadır/gi, 'kullanılır'],
  [/sahiptir/gi, 'var'],
  [/içermektedir/gi, 'içerir'],
  [/sağlamaktadır/gi, 'sağlar'],
  [/oluşturulmuştur/gi, 'oluşturuldu'],
  [/belirtilmiştir/gi, 'belirtildi'],
  [/gerekmektedir/gi, 'gerekir'],
  [/teşkil etmek/gi, 'olmak'],
  [/müteşekkil/gi, 'oluşan'],
  [/\s{2,}/g, ' '],
];

export function optimizePrompt(prompt: string): OptimizeResult {
  const originalTokens = estimateTokens(prompt);
  let optimized = prompt;

  for (const pattern of REMOVAL_PATTERNS) {
    optimized = optimized.replace(pattern, '');
  }

  for (const [pattern, replacement] of REPLACEMENT_PATTERNS) {
    optimized = optimized.replace(pattern, replacement);
  }

  optimized = optimized.replace(/\n{3,}/g, '\n\n').trim();

  const optimizedTokens = estimateTokens(optimized);
  const savingsPercent = Math.round(((originalTokens - optimizedTokens) / Math.max(1, originalTokens)) * 100);

  return { optimized, originalTokens, optimizedTokens, savingsPercent };
}

export function isOverTokenLimit(prompt: string, limit = 4000): boolean {
  return estimateTokens(prompt) > limit;
}

export function truncatePrompt(prompt: string, maxTokens = 4000): string {
  if (!isOverTokenLimit(prompt, maxTokens)) return prompt;
  const maxChars = maxTokens * 4;
  return prompt.substring(0, maxChars) + '\n...[içerik kısaltıldı]';
}
