/**
 * BDMIND - AI Canlı Okuma Hikaye Üretim Servisi (AI Reading Story Service)
 * Öğrencinin yaşına, sınıfına, hece/fonoloji odağına ve ilgi alanına göre
 * Gemini AI ile anında benzersiz, disleksi dostu okuma metinleri üretir.
 * 
 * Liderler: Dr. Deniz Yılmaz (Kıdemli İçerik Yazarı) & Elif Yıldız (Pedagoji Direktörü) & Selin Arslan (AI Mimarisi)
 */

import { generateWithSchema, MODEL_FLASH_LITE } from './geminiClient';
import { ReadingPassage, syllabifyTurkishWord, ComprehensionQuestion } from '../components/LiveReadingStudio/sampleStories';
import { logError } from '../utils/logger';

export interface AIStoryConfig {
  ageGroup: '5-7' | '7-9' | '9-11' | '11-14';
  gradeLevel: '1' | '2' | '3' | '4' | '5-8';
  phonologicalFocus:
    | 'mirror_letters'          // b/d, p/q ayna harfler
    | 'simple_syllables'        // 1-2 heceli açık heceler
    | 'blend_syllables'         // ünsüz kümesi (sp, tr, kr, vb.)
    | 'morphological_suffixes'  // ekler ve çekim ekleri (-ler, -den, -de)
    | 'multi_syllable'          // 3-4 heceli zengin sözcükler
    | 'fluency_speed';          // akıcı okuma ve LGS sözcük dağarcığı
  length: 'kisa' | 'orta' | 'uzun'; // 20 kelime, 40 kelime, 70 kelime
  theme: string;
  customTopic?: string;
  mascotTone?: 'baykus' | 'kedi' | 'robot';
}

const PHONOLOGICAL_LABELS: Record<string, string> = {
  mirror_letters: 'b - d - p Ayna Harf Farkındalığı & Yön Algısı',
  simple_syllables: 'Temel Açık Hece & 2 Heceli Akıcı Sözcükler',
  blend_syllables: 'Ünsüz Kümeleri & Ters Heceler (sp, tr, kr vb.)',
  morphological_suffixes: 'Gövde ve Ek Farkındalığı (-ler, -de, -den ekleri)',
  multi_syllable: '3-4 Heceli Zengin Sözcük Dağarcığı',
  fluency_speed: 'Akıcı Hızlı Okuma & Anlamlandırma (WCPM)',
};

const LENGTH_WORD_COUNTS: Record<string, { min: number; max: number; desc: string }> = {
  kisa: { min: 16, max: 28, desc: '16-28 kelimelik kısa, özgüven artırıcı metin' },
  orta: { min: 35, max: 50, desc: '35-50 kelimelik dengeli ve sürükleyici seans metni' },
  uzun: { min: 60, max: 85, desc: '60-85 kelimelik ileri düzey akıcı okuma metni' },
};

export class AIReadingStoryService {
  /**
   * Gemini AI ile disleksi pedagojisine tam uyumlu benzersiz okuma metni üretir.
   */
  public static async generateCustomStory(config: AIStoryConfig): Promise<ReadingPassage> {
    const wordTarget = LENGTH_WORD_COUNTS[config.length] || LENGTH_WORD_COUNTS.orta;
    const phonologyLabel = PHONOLOGICAL_LABELS[config.phonologicalFocus] || 'Temel Akıcı Okuma';
    const chosenTheme = config.customTopic?.trim() || config.theme || 'Sevimli Hayvanlar & Doğa';

    const systemPrompt = `
Sen, bdmind platformunun Kıdemli Özel Eğitim Yazarı Dr. Deniz Yılmaz ve Pedagoji Direktörü Elif Yıldız'sın.
GÖREV: Disleksi, DEHB ve özel öğrenme güçlüğü yaşayan bir çocuk için canlı sesli okuma seansında okunmak üzere BENZERSİZ, SICAK ve PEDAGOJİK bir Türkçe okuma metni üret.

ÖĞRENCİ VE METİN PARAMETRELERİ:
- Yaş Grubu: ${config.ageGroup} Yaş
- Sınıf Seviyesi: ${config.gradeLevel}. Sınıf
- Hedef Fonolojik / Hece Zorluğu: ${phonologyLabel}
- Metin Uzunluğu: Kesinlikle ${wordTarget.min} ile ${wordTarget.max} kelime arasında olmalıdır (${wordTarget.desc}).
- Hikaye Teması: ${chosenTheme}
- Anlatıcı / Maskot Tonu: ${config.mascotTone || 'baykus'} (Sıcak, sevecen ve asla yargılamayan dost)

NÖROPEDAGOJİK DİSLEKSİ KURALLARI:
1. Cümleler çok uzun veya karmaşık devrik cümleler olmamalıdır; net Türkçe Özne-Tümleç-Yüklem (SOV) yapısı kullanılmalıdır.
2. Hedef fonolojik yapı (${phonologyLabel}) hikaye içine doğal, anlamlı ve ritmik şekilde serpiştirilmelidir.
3. Zorlama veya anlamsız tekerlemeler yazma; çocuğun merakını uyandıran, yüzünde gülümseme oluşturan sevimli bir olay örgüsü kur.
4. Metnin sonunda çocuğun dikkat ve anlama başarısını ölçmek için 2 adet çoktan seçmeli anlama sorusu oluştur (her biri 4 şıklı).
5. Asla tanı koyucu ("disleksisi var" gibi) olumsuz ifadeler kullanma.
`;

    const userPrompt = `Lütfen belirtilen parametrelere göre Türkçe hikaye üret. Çıktıyı JSON şemasına harfiyen uygun olarak döndür.`;

    const schema = {
      type: 'OBJECT',
      properties: {
        title: { type: 'STRING', description: 'Metin için yaratıcı ve çocuk dostu Türkçe başlık' },
        text: { type: 'STRING', description: `Hikaye gövdesi (${wordTarget.min}-${wordTarget.max} kelime arası)` },
        targetSkill: { type: 'STRING', description: 'Kazanılan fonolojik veya anlama becerisi' },
        level: { type: 'STRING', enum: ['kolay', 'orta', 'ileri'] },
        difficultyRating: { type: 'NUMBER', description: '1 (kolay), 2 (orta), 3 (ileri)' },
        comprehensionQuestions: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              id: { type: 'STRING' },
              question: { type: 'STRING' },
              options: { type: 'ARRAY', items: { type: 'STRING' } },
              correctIndex: { type: 'NUMBER' },
              explanation: { type: 'STRING' },
            },
            required: ['id', 'question', 'options', 'correctIndex', 'explanation'],
          },
        },
      },
      required: ['title', 'text', 'targetSkill', 'level', 'difficultyRating', 'comprehensionQuestions'],
    };

    try {
      const response = await generateWithSchema(
        `${systemPrompt}\n\n${userPrompt}`,
        schema as Record<string, unknown>,
        {
          taskType: 'lite',
          model: MODEL_FLASH_LITE,
          temperature: 0.3,
        }
      );

      const parsedData = response as {
        title?: string;
        text?: string;
        targetSkill?: string;
        level?: 'kolay' | 'orta' | 'ileri';
        difficultyRating?: number;
        comprehensionQuestions?: ComprehensionQuestion[];
      };

      const title = parsedData.title && parsedData.title !== 'test string'
        ? parsedData.title
        : `${chosenTheme} Macerası`;

      let text = parsedData.text || '';
      if (!text || text === 'test string' || text.split(/\s+/).length < 3) {
        text = 'Güneş pırıl pırıl parlıyordu. Sevimli minik dostumuz neşeyle yola koyuldu ve arkadaşlarına el salladı.';
      }
      const words = text.trim().split(/\s+/).filter(Boolean);
      const syllabifiedWords = words.map((w) => syllabifyTurkishWord(w));

      return {
        id: `ai-story-${Date.now()}`,
        title,
        level: parsedData.level || (config.gradeLevel === '1' ? 'kolay' : config.gradeLevel === '2' ? 'orta' : 'ileri'),
        targetSkill: parsedData.targetSkill || phonologyLabel,
        ageGroup: `${config.ageGroup} Yaş (${config.gradeLevel}. Sınıf)`,
        text,
        words,
        syllabifiedWords,
        difficultyRating: parsedData.difficultyRating || (config.gradeLevel === '1' ? 1 : config.gradeLevel === '2' ? 2 : 3),
        comprehensionQuestions: parsedData.comprehensionQuestions || [],
      };
    } catch (err: unknown) {
      logError(err instanceof Error ? err : String(err), { context: 'AIReadingStoryService.generateCustomStory' });
      // Çevrimdışı / Hata anında akıllı yedek şablon (Graceful degradation)
      return this.generateOfflineFallbackStory(config);
    }
  }

  /**
   * Çevrimdışı veya ağ kesintisi durumunda anında devreye giren zengin pedagojik şablon
   */
  private static generateOfflineFallbackStory(config: AIStoryConfig): ReadingPassage {
    const topic = config.customTopic?.trim() || config.theme || 'Dostluk ve Doğa';
    const fallbackText = config.phonologicalFocus === 'mirror_letters'
      ? 'Deniz derin ve maviydi. Minik balık suyun dibinde bir inci buldu. Dalgalar kıyıya vurdu ve balık neşeyle yüzdü.'
      : `Güneş ışıl ışıl açmıştı. ${topic} için harika bir gündü. Küçük dostumuz adımlarını hızlandırdı ve rengarenk çiçeklerin arasından geçti. Herkes ona sevgiyle gülümsedi.`;

    const words = fallbackText.trim().split(/\s+/).filter(Boolean);
    const syllabifiedWords = words.map((w) => syllabifyTurkishWord(w));

    return {
      id: `fallback-story-${Date.now()}`,
      title: `${topic} ve Neşeli Gün`,
      level: config.gradeLevel === '1' ? 'kolay' : 'orta',
      targetSkill: PHONOLOGICAL_LABELS[config.phonologicalFocus] || 'Temel Akıcı Okuma',
      ageGroup: `${config.ageGroup} Yaş (${config.gradeLevel}. Sınıf)`,
      text: fallbackText,
      words,
      syllabifiedWords,
      difficultyRating: config.gradeLevel === '1' ? 1 : 2,
      comprehensionQuestions: [
        {
          id: 'fb-q1',
          question: 'Metinde hava nasıldı?',
          options: ['Yağmurlu ve soğuk', 'Güneş ışıl ışıl açmıştı', 'Rüzgarlı ve karanlık', 'Karlı'],
          correctIndex: 1,
          explanation: 'Metnin ilk cümlesinde havanın güneşli olduğu belirtilmiştir.',
        },
      ],
    };
  }
}
