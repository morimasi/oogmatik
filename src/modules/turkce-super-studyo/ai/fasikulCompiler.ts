import { Question, TextPassage, LearningSession } from '../types/schemas';
import { generateQuestionsFromText, generateFullStudioActivity } from './magicGenerator';

export interface CompilationOptions {
  studentId: string;
  recentSessions: LearningSession[]; // Telemetry data from the last week
  gradeLevel: 1 | 2 | 3 | 4;
}

export interface CompiledFasikul {
  id: string;
  title: string;
  passage: TextPassage;
  questions: Question[];
  recommendedDurationMs: number;
}

/**
 * FAZ D — D1: weakestSkill artık localStorage'daki oturum verilerinden hesaplanıyor.
 * Öğrencinin en çok hata yaptığı skill belirlenir.
 */
function detectWeakestSkill(studentId: string): string {
  try {
    const key = `turkce_session_scores_${studentId}`;
    const raw = localStorage.getItem(key);
    if (!raw) return 'SOZ_VARLIGI'; // default

    const scores: Record<string, { correct: number; total: number }> = JSON.parse(raw);
    let worstSkill = 'SOZ_VARLIGI';
    let worstRate = 1;

    for (const [skill, data] of Object.entries(scores)) {
      if (data.total === 0) continue;
      const rate = data.correct / data.total;
      if (rate < worstRate) {
        worstRate = rate;
        worstSkill = skill;
      }
    }

    console.log(`[FasikulCompiler] En zayıf beceri: ${worstSkill} (doğruluk: ${Math.round(worstRate * 100)}%)`);
    return worstSkill;
  } catch {
    return 'SOZ_VARLIGI';
  }
}

/**
 * FAZ D — D2: Kelime Kumbarası'ndaki kelimeler fasikül soru üretiminde önceliklendirilir.
 */
function getVaultWords(studentId: string): string[] {
  try {
    const raw = localStorage.getItem('turkce_studyo_kelime_kumbarasi');
    if (!raw) return [];
    const vault: { word: string; meaning: string }[] = JSON.parse(raw);
    return vault.slice(0, 10).map((v) => v.word);
  } catch {
    return [];
  }
}

/**
 * AI-Driven Fasikül Compiler
 * Öğrencinin localStorage skor geçmişini analiz ederek kişiselleştirilmiş PDF fasikülü üretir.
 */
export const compilePersonalizedFasikul = async (
  options: CompilationOptions
): Promise<CompiledFasikul> => {
  console.log(`[FasikulCompiler] ${options.studentId} için kişiselleştirilmiş fasikül derleniyor...`);

  // FAZ D — D1: Gerçek analiz
  const weakestSkill = detectWeakestSkill(options.studentId);

  // FAZ D — D2: Kelime Kumbarası'ndan söz varlığı
  const vaultWords = getVaultWords(options.studentId);
  const targetTheme = 'DOGA';

  const skillToTopic: Record<string, string> = {
    SOZ_VARLIGI: 'Kelime Dünyası',
    ANA_FIKIR: 'Hikaye Anlama',
    SEBEP_SONUC: 'Neden-Sonuç',
    YAZIM_NOKTALAMA: 'Yazım Kuralları',
    MANTIK: 'Mantık ve Muhakeme',
  };

  const topic = skillToTopic[weakestSkill] || 'Doğa';

  console.log(`[FasikulCompiler] Zayıf beceri: ${weakestSkill}, Konu: ${topic}`);

  // Generate passage targeted at weak skill
  const { passage } = await generateFullStudioActivity(topic, options.gradeLevel);

  // Generate questions with extra vocabulary context if vault words exist
  const extraContext = vaultWords.length > 0
    ? `Öğrencinin kelime kumbarasındaki kelimeler: ${vaultWords.join(', ')}`
    : '';

  const generatedQuestions = await generateQuestionsFromText({
    text: passage.content + (extraContext ? `\n\n${extraContext}` : ''),
    count: 4,
    difficulty: 'KOLAY',
    skills: [weakestSkill, 'ANA_FIKIR'],
    gradeLevel: options.gradeLevel,
  });

  return {
    id: `fasikul-${Date.now()}`,
    title: `Kişiye Özel Gelişim Fasikülü - Seviye ${options.gradeLevel} — ${skillToTopic[weakestSkill] || weakestSkill}`,
    passage,
    questions: generatedQuestions,
    recommendedDurationMs: 15 * 60 * 1000,
  };
};
