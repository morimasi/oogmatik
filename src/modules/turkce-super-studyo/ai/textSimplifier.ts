export interface SimplificationOptions {
  originalText: string;
  targetGradeLevel: 1 | 2 | 3 | 4;
}

/**
 * Mocks an AI-driven text simplification service.
 * In production, this uses Gemini/Claude to rewrite a complex text into
 * shorter sentences and simpler vocabulary based on the Flesch-Kincaid scale.
 */
export const simplifyText = async (options: SimplificationOptions): Promise<string> => {
  console.log(`[TextSimplifier] Sadeleştiriliyor... Hedef Sınıf: ${options.targetGradeLevel}`);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        `Bu, orijinal metnin ${options.targetGradeLevel}. sınıf disleksili bir öğrenci için uyarlanmış, daha kısa cümlelerden oluşan sadeleştirilmiş halidir.`
      );
    }, 1200);
  });
};

/**
 * A basic function to approximate Turkish readability.
 * (Placeholder logic for demonstration purposes)
 */
export const calculateReadabilityScore = (text: string): number => {
  const words = text.split(' ').length;
  const sentences = text.split(/[.!?]+/).length - 1 || 1;
  const averageSentenceLength = words / sentences;

  // Very naive approximation: shorter sentence length = higher score (easier)
  return Math.max(0, 100 - averageSentenceLength * 5);
};
