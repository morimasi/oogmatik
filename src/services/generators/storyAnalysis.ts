import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { AppError } from '../../utils/AppError';

/**
 * Hikaye Analizi (Ultra Pro) Aktivite Üreticisi
 * Derinlemesine anlama, karakter analizi ve olay örgüsü tespiti yapar.
 */
export const generateStoryAnalysisFromAI = async (options: GeneratorOptions): Promise<any> => {
  const { 
    difficulty = 'Orta', 
    ageGroup = '8-10', 
    topic = 'Genel Çocuk Hikayesi',
    analysisDepth = 'detaylı',
    showStoryMap = true,
    gradeLevel = 3,
    includeCharacterAnalysis = true,
    includeSettingAnalysis = true,
    includeConflictResolution = true,
    includeMainIdea = true,
    includeSubThemes = true,
    includeThematicQuestions = true,
    includeInferentialQuestions = true,
    includeCreativeQuestions = true,
    questionCount = 5,
    storyLength = 'orta',
    vocabularyLevel = 'orta',
    sentenceComplexity = 'birleşik',
    includeVocabularyList = true,
    vocabularyWordCount = 5,
    compactLayout = true,
    useIcons = true,
    showReadingRuler = true,
    syllableColoring = false,
    fontSize = 'medium',
    lineHeight = 'normal',
    columnLayout = 'single',
    mode = 'ai'
  } = options;

  // Zorluk seviyesine göre sınıf seviyesi eşleştirmesi
  const difficultyConfig = {
    'çok kolay': { gradeMin: 1, gradeMax: 2, storyLength: 'kısa', vocabularyCount: 3, questionCount: 3 },
    'kolay': { gradeMin: 2, gradeMax: 3, storyLength: 'kısa', vocabularyCount: 4, questionCount: 4 },
    'Orta': { gradeMin: 3, gradeMax: 5, storyLength: 'orta', vocabularyCount: 5, questionCount: 5 },
    'orta': { gradeMin: 3, gradeMax: 5, storyLength: 'orta', vocabularyCount: 5, questionCount: 5 },
    'Zor': { gradeMin: 5, gradeMax: 7, storyLength: 'uzun', vocabularyCount: 7, questionCount: 7 },
    'zor': { gradeMin: 5, gradeMax: 7, storyLength: 'uzun', vocabularyCount: 7, questionCount: 7 },
    'uzman': { gradeMin: 7, gradeMax: 8, storyLength: 'çok uzun', vocabularyCount: 10, questionCount: 10 }
  };

  const config = difficultyConfig[difficulty as unknown as keyof typeof difficultyConfig] || difficultyConfig['orta'];
  
  const actualQuestionCount = questionCount || config.questionCount;
  const actualVocabularyCount = vocabularyWordCount || config.vocabularyCount;

  const prompt = `
    Sen bir Dil Bilgisi ve Okuma Anlama Uzmanısın (Elif Yıldız rolünde). 
    Disleksi ve DEHB olan çocuklar için "Ultra Pro" seviyesinde bir "Hikaye Analizi" etkinliği üret.

    🎯 GENEL PARAMETRELER:
    - Mod: ${mode} (${mode === 'fast' ? 'Hızlı üretim - önceden tanımlı şablonlar' : 'AI üretimi - tam özelleştirme'})
    - Konu: ${topic}
    - Yaş Grubu: ${ageGroup}
    - Sınıf Seviyesi: ${gradeLevel}. Sınıf
    - Zorluk Seviyesi: ${difficulty}
    - Analiz Derinliği: ${analysisDepth}
    - Hikaye Uzunluğu: ${storyLength || config.storyLength}
    - Kelime Dağarcığı Seviyesi: ${vocabularyLevel}
    - Cümle Karmaşıklığı: ${sentenceComplexity}

    🔍 ANALİZ BÖLÜMLERİ:
    ${includeCharacterAnalysis ? '- Karakter Analizi' : ''}
    ${includeSettingAnalysis ? '- Yer ve Zaman Analizi' : ''}
    ${includeConflictResolution ? '- Çatışma ve Çözüm Analizi' : ''}
    ${includeMainIdea ? '- Ana Fikir' : ''}
    ${includeSubThemes ? '- Alt Temalar' : ''}
    ${showStoryMap ? '- Hikaye Haritası' : ''}

    📝 SORU ÖZELLİKLERİ:
    - Toplam Soru Sayısı: ${actualQuestionCount}
    ${includeThematicQuestions ? '- Tematik Sorular' : ''}
    ${includeInferentialQuestions ? '- Çıkarım Soruları' : ''}
    ${includeCreativeQuestions ? '- Yaratıcı Sorular' : ''}

    📚 KELİME DAĞARCIĞI:
    ${includeVocabularyList ? `- Kelime Listesi: ${actualVocabularyCount} kelime` : ''}

    🎨 GÖRSEL VE DÜZEN:
    - Kompakt Layout: ${compactLayout ? 'Evet' : 'Hayır'}
    - İkon Kullanımı: ${useIcons ? 'Evet' : 'Hayır'}
    - Okuma Cetveli: ${showReadingRuler ? 'Evet' : 'Hayır'}
    - Hece Renklendirme: ${syllableColoring ? 'Evet' : 'Hayır'}
    - Font Boyutu: ${fontSize}
    - Satır Aralığı: ${lineHeight}
    - Sütun Düzeni: ${columnLayout}

    GÖREV:
    1. Özgün, merak uyandırıcı ve pedagojik değeri olan bir hikaye yaz. 
    2. Hikaye için seçilen analiz bileşenlerini oluştur.
    3. Belirtilen tür ve sayıda sorular hazırla.
    ${includeVocabularyList ? '4. Önemli kelimelerden oluşan bir kelime listesi oluştur.' : ''}

    KURALLAR:
    - Dil disleksi dostu, cümleler net olmalı.
    - Lexend font ve geniş satır aralığı kullan (UI tarafında).
    - Duygusal zeka (EQ) öğeleri içermeli.
    - Hikaye dopdolu ve etkileyici bir olay örgüsüne sahip olmalı.
    - MUTLAKA aşağıdaki JSON formatında döndür. BAŞKA HİÇBİR AÇIKLAMA YAZMA.

    JSON FORMATI:
    {
      "title": "Hikaye Analizi • Ultra Pro",
      "instruction": "Metni dikkatlice oku ve analiz bölümlerini inceleyerek anlama yeteneğini test et.",
      "pedagogicalNote": "Bu çalışma öğrencinin çıkarım yapma, ana fikri kavrama ve karakter-mekan ilişkisini kurma becerilerini geliştirir.",
      "imagePrompt": "Hikayeyi anlatan disleksi dostu, yumuşak pastel renkli çocuk kitabı tarzında bir illüstrasyon",
      "settings": {
        "difficulty": "${difficulty}",
        "topic": "${topic}",
        "ageGroup": "${ageGroup}",
        "gradeLevel": ${gradeLevel},
        "analysisDepth": "${analysisDepth}",
        "showStoryMap": ${showStoryMap},
        "includeCharacterAnalysis": ${includeCharacterAnalysis},
        "includeSettingAnalysis": ${includeSettingAnalysis},
        "includeConflictResolution": ${includeConflictResolution},
        "includeMainIdea": ${includeMainIdea},
        "includeSubThemes": ${includeSubThemes},
        "questionCount": ${actualQuestionCount},
        "storyLength": "${storyLength || config.storyLength}",
        "vocabularyLevel": "${vocabularyLevel}",
        "sentenceComplexity": "${sentenceComplexity}",
        "includeVocabularyList": ${includeVocabularyList},
        "vocabularyWordCount": ${actualVocabularyCount},
        "compactLayout": ${compactLayout},
        "useIcons": ${useIcons},
        "showReadingRuler": ${showReadingRuler},
        "syllableColoring": ${syllableColoring},
        "fontSize": "${fontSize}",
        "lineHeight": "${lineHeight}",
        "columnLayout": "${columnLayout}"
      },
      "content": {
        "title": "Hikayenin Kendi Başlığı",
        "story": "Hikayenin detaylı ve eksiksiz metni...",
        "analysis": {
          "mainIdea": "Metnin ana fikri",
          "characters": [
            { "name": "Karakter İsim", "traits": ["Özellik 1", "Özellik 2"], "description": "Karakterin kısa açıklaması" }
          ],
          "setting": { "place": "Detaylı yer tasviri", "time": "Zaman dilimi", "description": "Mekanın kısa açıklaması" },
          "conflict": "Karakterin çözmesi gereken ana problem veya çatışma nedir?",
          "resolution": "Problem nasıl ve ne şekilde çözüldü?",
          "subThemes": ["Alt tema 1", "Alt tema 2", "Alt tema 3"]
        },
        "vocabulary": [
          { "word": "Kelime 1", "definition": "Kelimenin açıklaması" },
          { "word": "Kelime 2", "definition": "Kelimenin açıklaması" }
        ],
        "visualElements": {
          "icons": [
            { "position": 0, "icon": "fas unknown as fa-book", "style": "text-indigo-500 text-xl" }
          ]
        }
      },
      "questions": [
        { "type": "open-ended", "question": "Metinle ilgili derinlemesine mantık yürütebilecekleri 1. soru", "answer": "" },
        { "type": "inference", "question": "Karakterin duygularını ve motivasyonunu sorgulayan 2. soru", "answer": "" },
        { "type": "creative", "question": "Eğer sen olsaydın ne yapardın veya metin nasıl devam ederdi tarzı 3. yaratıcı soru", "answer": "" }
      ]
    }
  `;

  try {
    const result = await generateCreativeMultimodal({ prompt });
    
    if (!result || !result.content || !result.content.title) {
      throw new AppError('AI Hikaye Analizi JSON formati eksik veya hatali uretildi.', 'GENERATION_FAILED', 500);
    }

    return {
      success: true,
      data: result,
      metadata: { 
        difficulty, 
        ageGroup, 
        gradeLevel,
        analysisDepth,
        generatedAt: new Date().toISOString(),
        mode,
        version: '3.0-ultra-pro'
      }
    };
  } catch (error: any) {
    throw new AppError('Hikaye Analizi üretilirken hata: ' + error.message, 'AI_ERROR', 500);
  }
};
