export interface QualityScoreResult {
  overall: number;
  criteria: {
    pedagogicRelevance: number;
    difficultyBalance: number;
    visualLoad: number;
    wordChoice: number;
    instructionClarity: number;
    engagementFactor: number;
  };
  suggestions: string[];
}

export function assessContentQuality(
  content: string,
  options?: { grade?: string | null; difficulty?: string }
): QualityScoreResult {
  const scores = {
    pedagogicRelevance: scorePedagogicRelevance(content),
    difficultyBalance: scoreDifficultyBalance(content),
    visualLoad: scoreVisualLoad(content),
    wordChoice: scoreWordChoice(content),
    instructionClarity: scoreInstructionClarity(content),
    engagementFactor: scoreEngagementFactor(content),
  };

  const overall = Math.round(
    (scores.pedagogicRelevance * 0.25 +
      scores.difficultyBalance * 0.20 +
      scores.visualLoad * 0.15 +
      scores.wordChoice * 0.15 +
      scores.instructionClarity * 0.15 +
      scores.engagementFactor * 0.10) *
      10
  ) / 10;

  const suggestions = generateSuggestions(scores, options);
  return { overall, criteria: scores, suggestions };
}

function scorePedagogicRelevance(content: string): number {
  let score = 50;
  const pedagogicalTerms = [
    'yönerge', 'talimat', 'açıklama', 'okuma', 'yazma',
    'çiz', 'boya', 'birleştir', 'tamamla', 'eşleştir',
    'pedagojik', 'öğrenme', 'pekiştir', 'tekrar',
  ];
  const matches = pedagogicalTerms.filter((t) => content.toLowerCase().includes(t)).length;
  score += matches * 5;
  return Math.min(100, Math.max(0, score));
}

function scoreDifficultyBalance(content: string): number {
  let score = 60;
  const easyWords = ['kolay', 'basit', 'kısa', 'az', 'bir'];
  const mediumWords = ['orta', 'biraz', 'daha', 'hangi', 'neden'];
  const hardWords = ['zor', 'karmaşık', 'derin', 'analiz', 'sentez'];

  const hasEasy = easyWords.some((w) => content.toLowerCase().includes(w));
  const hasMedium = mediumWords.some((w) => content.toLowerCase().includes(w));
  const hasHard = hardWords.some((w) => content.toLowerCase().includes(w));

  if (hasEasy && hasMedium) score += 20;
  if (hasHard) score += 10;
  const sentences = content.split(/[.!?]+/).filter(Boolean);
  const avgWords = sentences.reduce((s, sent) => s + sent.split(/\s+/).filter(Boolean).length, 0) / Math.max(1, sentences.length);
  if (avgWords > 5 && avgWords < 20) score += 10;
  else if (avgWords >= 20) score -= 10;
  return Math.min(100, Math.max(0, score));
}

function scoreVisualLoad(content: string): number {
  let score = 50;
  const visualTerms = ['svg', 'resim', 'görsel', 'şekil', 'tablo', 'diyagram', 'illüstrasyon', 'ikon'];
  const matches = visualTerms.filter((t) => content.toLowerCase().includes(t)).length;
  score += matches * 8;
  return Math.min(100, Math.max(0, score));
}

function scoreWordChoice(content: string): number {
  let score = 60;
  const complexWords = ['müteşekkil', 'teşkil', 'mülahaza', 'zımni', 'münderiç'];
  const simpleWords = ['ile', 've', 'ama', 'çünkü', 'sonra', 'önce', 'gibi'];
  const hasComplex = complexWords.some((w) => content.toLowerCase().includes(w));
  const hasSimple = simpleWords.filter((w) => content.toLowerCase().includes(w)).length;
  if (hasComplex) score -= 20;
  score += hasSimple * 5;
  return Math.min(100, Math.max(0, score));
}

function scoreInstructionClarity(content: string): number {
  let score = 50;
  const hasTitle = content.includes('##') || content.includes('Başlık');
  const hasList = content.includes('- ') || content.includes('1.') || content.includes('* ');
  const hasBold = content.includes('**');
  const hasSeparator = content.includes('---') || content.includes('___');
  if (hasTitle) score += 15;
  if (hasList) score += 15;
  if (hasBold) score += 10;
  if (hasSeparator) score += 10;
  return Math.min(100, Math.max(0, score));
}

function scoreEngagementFactor(content: string): number {
  let score = 40;
  const engagingTerms = [
    'haydi', 'keşfet', 'dene', 'oyna', 'yarış',
    'merak', 'acaba', 'şaşırtıcı', 'eğlenceli', 'meydan',
  ];
  const matches = engagingTerms.filter((t) => content.toLowerCase().includes(t)).length;
  score += matches * 6;
  const qMark = (content.match(/\?/g) || []).length;
  const exMark = (content.match(/!/g) || []).length;
  score += Math.min(15, qMark * 2);
  score += Math.min(10, exMark * 3);
  return Math.min(100, Math.max(0, score));
}

function generateSuggestions(
  scores: QualityScoreResult['criteria'],
  _options?: { grade?: string | null; difficulty?: string }
): string[] {
  const suggestions: string[] = [];
  if (scores.pedagogicRelevance < 60) suggestions.push('Pedagojik terimleri artırın (yönerge, talimat, pekiştirme).');
  if (scores.difficultyBalance < 60) suggestions.push('Zorluk dengesini gözden geçirin; kolay ve orta seviye karışık olsun.');
  if (scores.visualLoad < 50) suggestions.push('Görsel destek ekleyin (SVG diyagram, illüstrasyon).');
  if (scores.wordChoice < 60) suggestions.push('Karmaşık kelimeleri basitleştirin, kısa cümleler kullanın.');
  if (scores.instructionClarity < 60) suggestions.push('Yönergeleri netleştirin, başlık ve madde işaretleri ekleyin.');
  if (scores.engagementFactor < 50) suggestions.push('Etkileşimi artırın, oyunlaştırma öğeleri ve merak uyandırıcı ifadeler ekleyin.');
  return suggestions;
}
