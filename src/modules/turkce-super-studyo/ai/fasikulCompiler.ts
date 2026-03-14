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
 * AI-Driven Fasikül Compiler
 * Analyzes the student's recent telemetry and error patterns to generate a personalized PDF.
 * If the student struggles with "SOZ_VARLIGI", it generates more vocabulary questions.
 */
export const compilePersonalizedFasikul = async (
  options: CompilationOptions
): Promise<CompiledFasikul> => {
  console.log(
    `[FasikulCompiler] ${options.studentId} için kişiselleştirilmiş fasikül derleniyor...`
  );

  // Simulated AI analysis of student telemetry
  // In a real implementation, you'd send `recentSessions` to an LLM to extract the weakest skills.
  const weakestSkill = 'SOZ_VARLIGI'; // Mock decision
  const targetTheme = 'DOGA';

  console.log(
    `[FasikulCompiler] Tespit edilen en zayıf beceri: ${weakestSkill}. Tema: ${targetTheme}. AI üretimi başlıyor...`
  );

  // Step 1: Generate a text passage targeted at the weak skill
  const { passage } = await generateFullStudioActivity(targetTheme, options.gradeLevel);

  // Step 2: Generate specific questions focusing heavily on the weak skill
  const generatedQuestions = await generateQuestionsFromText({
    text: passage.content,
    count: 4,
    difficulty: 'KOLAY',
    skills: [weakestSkill, 'ANA_FIKIR'], // Prioritize weak skill
  });

  return {
    id: `fasikul-${Date.now()}`,
    title: `Kişiye Özel Gelişim Fasikülü - Seviye ${options.gradeLevel}`,
    passage,
    questions: generatedQuestions,
    recommendedDurationMs: 15 * 60 * 1000, // 15 minutes
  };
};
