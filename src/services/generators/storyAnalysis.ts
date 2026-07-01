
import { generateCreativeMultimodal } from '../geminiClient.js';
import { GeneratorOptions } from '../../types/core.js';
import { AppError } from '../../utils/AppError.js';
import { ActivityType } from '../../types/activity.js';

/**
 * Hikaye Analizi (Ultra Pro) Aktivite Üreticisi
 * Derinlemesine anlama, karakter analizi ve olay örgüsü tespiti yapar.
 * TÜM ayarları dinler: difficulty, ageGroup, topic, analysisDepth, questionCount, etc.
 */
export const generateStoryAnalysisFromAI = async (options: GeneratorOptions) => {
  const opts = options as Record<string, unknown>;

  const difficulty = (opts.difficulty as string) || 'Orta';
  const ageGroup = (opts.ageGroup as string) || '8-10';
  const topic = (opts.topic as string) || 'Genel Çocuk Hikayesi';
  const analysisDepth = (opts.analysisDepth as string) || 'detaylı';
  const showStoryMap = (opts.showStoryMap as boolean) ?? true;
  const gradeLevel = (opts.gradeLevel as number) || 3;
  const includeCharacterAnalysis = (opts.includeCharacterAnalysis as boolean) ?? true;
  const includeSettingAnalysis = (opts.includeSettingAnalysis as boolean) ?? true;
  const includeConflictResolution = (opts.includeConflictResolution as boolean) ?? true;
  const includeMainIdea = (opts.includeMainIdea as boolean) ?? true;
  const includeSubThemes = (opts.includeSubThemes as boolean) ?? true;
  const includeThematicQuestions = (opts.includeThematicQuestions as boolean) ?? true;
  const includeInferentialQuestions = (opts.includeInferentialQuestions as boolean) ?? true;
  const includeCreativeQuestions = (opts.includeCreativeQuestions as boolean) ?? true;
  const questionCount = (opts.questionCount as number) || 5;
  const storyLength = (opts.storyLength as string) || 'orta';
  const vocabularyLevel = (opts.vocabularyLevel as string) || 'orta';
  const sentenceComplexity = (opts.sentenceComplexity as string) || 'birleşik';
  const includeVocabularyList = (opts.includeVocabularyList as boolean) ?? true;
  const vocabularyWordCount = (opts.vocabularyWordCount as number) || 5;
  const compactLayout = (opts.compactLayout as boolean) ?? true;
  const useIcons = (opts.useIcons as boolean) ?? true;
  const showReadingRuler = (opts.showReadingRuler as boolean) ?? true;
  const syllableColoring = (opts.syllableColoring as boolean) ?? false;
  const fontSize = (opts.fontSize as string) || 'medium';
  const lineHeight = (opts.lineHeight as string) || 'normal';
  const columnLayout = (opts.columnLayout as string) || 'single';
  const mode = (opts.mode as string) || 'ai';

  // Zorluk seviyesine göre sınıf seviyesi eşleştirmesi
  const difficultyConfig: Record<string, { gradeMin: number; gradeMax: number; storyLength: string; vocabularyCount: number; questionCount: number }> = {
    'çok kolay': { gradeMin: 1, gradeMax: 2, storyLength: 'kısa', vocabularyCount: 3, questionCount: 3 },
    'kolay': { gradeMin: 2, gradeMax: 3, storyLength: 'kısa', vocabularyCount: 4, questionCount: 4 },
    'Orta': { gradeMin: 3, gradeMax: 5, storyLength: 'orta', vocabularyCount: 5, questionCount: 5 },
    'orta': { gradeMin: 3, gradeMax: 5, storyLength: 'orta', vocabularyCount: 5, questionCount: 5 },
    'Zor': { gradeMin: 5, gradeMax: 7, storyLength: 'uzun', vocabularyCount: 7, questionCount: 7 },
    'zor': { gradeMin: 5, gradeMax: 7, storyLength: 'uzun', vocabularyCount: 7, questionCount: 7 },
    'uzman': { gradeMin: 7, gradeMax: 8, storyLength: 'çok uzun', vocabularyCount: 10, questionCount: 10 }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig['orta'];
  const actualQuestionCount = questionCount || config.questionCount;
  const actualVocabularyCount = vocabularyWordCount || config.vocabularyCount;

  const prompt = `
Sen bir Dil Bilgisi ve Okuma Anlama Uzmanısın. Disleksi ve DEHB olan çocuklar için "Ultra Pro" seviyesinde bir "Hikaye Analizi" etkinliği üret.

🎯 PARAMETRELER:
- Konu: ${topic}
- Yaş Grubu: ${ageGroup}
- Sınıf Seviyesi: ${gradeLevel}. Sınıf
- Zorluk: ${difficulty}
- Analiz Derinliği: ${analysisDepth}
- Hikaye Uzunluğu: ${storyLength || config.storyLength}
- Kelime Seviyesi: ${vocabularyLevel}
- Cümle Karmaşıklığı: ${sentenceComplexity}
- Soru Sayısı: ${actualQuestionCount}
- Kelime Listesi: ${includeVocabularyList ? actualVocabularyCount + ' kelime' : 'yok'}
- Düzen: ${compactLayout ? 'Kompakt' : 'Standart'}

 ANALİZ BÖLÜMLERİ:
${includeCharacterAnalysis ? '✓ Karakter Analizi' : '✗ Karakter Analizi'}
${includeSettingAnalysis ? '✓ Yer ve Zaman Analizi' : '✗ Yer ve Zaman Analizi'}
${includeConflictResolution ? '✓ Çatışma ve Çözüm' : '✗ Çatışma ve Çözüm'}
${includeMainIdea ? '✓ Ana Fikir' : '✗ Ana Fikir'}
${includeSubThemes ? '✓ Alt Temalar' : '✗ Alt Temalar'}
${showStoryMap ? '✓ Hikaye Haritası' : '✗ Hikaye Haritası'}

📝 SORU TÜRLERİ:
${includeThematicQuestions ? '✓ Tematik Sorular' : ''}
${includeInferentialQuestions ? '✓ Çıkarım Soruları' : ''}
${includeCreativeQuestions ? '✓ Yaratıcı Sorular' : ''}

 GÖRSEL:
- İkonlar: ${useIcons ? 'Evet' : 'Hayır'}
- Okuma Cetveli: ${showReadingRuler ? 'Evet' : 'Hayır'}
- Hece Renklendirme: ${syllableColoring ? 'Evet' : 'Hayır'}
- Font: ${fontSize}, Satır: ${lineHeight}, Sütun: ${columnLayout}

KURALLAR:
1. Özgün, merak uyandırıcı hikaye yaz.
2. Karakter isimleri Türkçe ve yaşa uygun olsun.
3. Yer ve Zaman cevapları BOŞ bırak — öğrenci kendi bulsun.
4. Çatışma ve Çözüm cevapları BOŞ bırak — öğrenci kendi yazsın.
5. Ana fikir BOŞ bırak — öğrenci kendi çıkarsın.
6. Soruların answer alanları BOŞ olsun.
7. Disleksi dostu: net cümleler, kısa paragraflar.
8. SADECE geçerli JSON döndür.

JSON FORMATI:
{
  "title": "Hikaye Analizi",
  "instruction": "Metni dikkatlice oku ve analiz bölümlerini tamamla.",
  "imagePrompt": "Hikayeyi anlatan disleksi dostu, yumuşak pastel renkli çocuk kitabı tarzında illüstrasyon",
  "content": {
    "title": "Hikayenin Başlığı",
    "story": "Hikayenin detaylı metni. Paragraflar halinde, yaş grubuna uygun.",
    "analysis": {
      "mainIdea": "",
      "characters": [
        { "name": "Karakter İsmi", "traits": ["Cesur", "Meraklı"], "description": "Kısa açıklama" }
      ],
      "setting": { "place": "", "time": "", "description": "" },
      "conflict": "",
      "resolution": "",
      "subThemes": ["Tema 1", "Tema 2"]
    },
    "vocabulary": [
      { "word": "Kelime", "definition": "Açıklama" }
    ]
  },
  "questions": [
    { "type": "open-ended", "question": "Metinle ilgili soru?", "answer": "" },
    { "type": "inference", "question": "Çıkarım sorusu?", "answer": "" },
    { "type": "creative", "question": "Yaratıcı soru?", "answer": "" }
  ]
}

NOT: answer alanları MUTLAKA boş string "" olsun. Öğrenci kendi cevaplasın.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      instruction: { type: 'STRING' },
      imagePrompt: { type: 'STRING' },
      content: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          story: { type: 'STRING' },
          analysis: {
            type: 'OBJECT',
            properties: {
              mainIdea: { type: 'STRING' },
              characters: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    name: { type: 'STRING' },
                    traits: { type: 'ARRAY', items: { type: 'STRING' } },
                    description: { type: 'STRING' }
                  }
                }
              },
              setting: {
                type: 'OBJECT',
                properties: {
                  place: { type: 'STRING' },
                  time: { type: 'STRING' },
                  description: { type: 'STRING' }
                }
              },
              conflict: { type: 'STRING' },
              resolution: { type: 'STRING' },
              subThemes: { type: 'ARRAY', items: { type: 'STRING' } }
            }
          },
          vocabulary: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                word: { type: 'STRING' },
                definition: { type: 'STRING' }
              }
            }
          }
        }
      },
      questions: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            type: { type: 'STRING' },
            question: { type: 'STRING' },
            answer: { type: 'STRING' }
          }
        }
      }
    },
    required: ['title', 'instruction', 'content', 'questions']
  };

  const result = await generateCreativeMultimodal({ prompt, schema }) as unknown as Record<string, unknown>;

  if (!result || !(result as Record<string, unknown>).content) {
    throw new AppError('AI Hikaye Analizi JSON formatı eksik veya hatalı üretildi.', 'GENERATION_FAILED', 500);
  }

  const content = (result as Record<string, unknown>).content as Record<string, unknown>;
  const analysis = (content.analysis as Record<string, unknown>) || {};

  // Cevap alanlarını temizle — öğrenci kendi bulsun
  if (analysis.setting) {
    (analysis.setting as Record<string, unknown>).place = '';
    (analysis.setting as Record<string, unknown>).time = '';
  }
  analysis.conflict = '';
  analysis.resolution = '';
  analysis.mainIdea = '';

  // Soru cevaplarını temizle
  const questions = (result as Record<string, unknown>).questions as Array<Record<string, unknown>> | undefined;
  if (questions) {
    questions.forEach(q => { q.answer = ''; });
  }

  return {
    id: `story_analysis_${Date.now()}`,
    activityType: ActivityType.STORY_ANALYSIS,
    title: (result.title as string) || 'Hikaye Analizi',
    instruction: (result.instruction as string) || 'Metni oku ve analiz bölümlerini tamamla.',
    imagePrompt: (result.imagePrompt as string) || '',
    settings: {
      difficulty,
      ageGroup,
      topic,
      analysisDepth,
      showStoryMap,
      gradeLevel,
      includeCharacterAnalysis,
      includeSettingAnalysis,
      includeConflictResolution,
      includeMainIdea,
      includeSubThemes,
      includeThematicQuestions,
      includeInferentialQuestions,
      includeCreativeQuestions,
      questionCount: actualQuestionCount,
      storyLength,
      vocabularyLevel,
      sentenceComplexity,
      includeVocabularyList,
      vocabularyWordCount: actualVocabularyCount,
      compactLayout,
      useIcons,
      showReadingRuler,
      syllableColoring,
      fontSize,
      lineHeight,
      columnLayout,
      mode,
    },
    content: content,
    questions: questions || [],
  };
};
