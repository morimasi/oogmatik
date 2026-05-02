import { generateCreativeMultimodal } from '../geminiClient';
import { GeneratorOptions } from '../../types/core';
import { AppError } from '../../utils/AppError';

/**
 * Eksik Parçaları Tamamlama - Ultra Gelişmiş AI Üreticisi
 * Premium SaaS kalitesinde, ultra özelleştirilebilir etkinlik üretimi
 */
export const generateAdvancedMissingPartsFromAI = async (options: GeneratorOptions): Promise<any> => {
  const {
    difficulty = 'orta',
    ageGroup = '8-10',
    topic = 'Doğa ve Bilim',
    blankType = 'word',
    blankCount = 10,
    blankSize = 'medium',
    blankStyle = 'underline',
    showWordBank = true,
    compactLayout = true,
    syllableColoring = false,
    useIcons = true,
    showVisualHints = false,
    includeDistractors = true,
    distractorCount = 4,
    semanticComplexity = 'medium',
    sentenceComplexity = 'compound',
    showInstructions = true,
    showExamples = true,
    includeTimer = false,
    showProgress = true,
    fontSize = 'medium',
    lineHeight = 'normal',
    columnLayout = 'single',
    maxParagraphsPerPage = 3
  } = options;

  // Zorluk seviyesine göre parametreler
  const difficultyConfig = {
    'çok kolay': { 
      paragraphs: 2, 
      blanksPerParagraph: 3, 
      wordLength: '4-6 harf', 
      sentenceStructure: 'basit',
      vocabulary: 'günlük',
      distractorDifficulty: 'çok farklı'
    },
    'kolay': { 
      paragraphs: 2, 
      blanksPerParagraph: 4, 
      wordLength: '5-7 harf', 
      sentenceStructure: 'basit-birleşik',
      vocabulary: 'günlük-temel',
      distractorDifficulty: 'farklı'
    },
    'orta': { 
      paragraphs: 3, 
      blanksPerParagraph: 4, 
      wordLength: '6-8 harf', 
      sentenceStructure: 'birleşik',
      vocabulary: 'geniş',
      distractorDifficulty: 'benzer'
    },
    'zor': { 
      paragraphs: 3, 
      blanksPerParagraph: 5, 
      wordLength: '7-10 harf', 
      sentenceStructure: 'karmaşık',
      vocabulary: 'akademik',
      distractorDifficulty: 'çok benzer'
    },
    'uzman': { 
      paragraphs: 4, 
      blanksPerParagraph: 6, 
      wordLength: '8-12 harf', 
      sentenceStructure: 'çok karmaşık',
      vocabulary: 'uzman',
      distractorDifficulty: 'kafa karıştırıcı'
    }
  };

  const config = difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig['orta'];

  const prompt = `
    SEN BİR DİL VE KONUŞMA TERAPİSTİ UZMANISIN. Disleksi olan çocuklar için "Eksik Parçaları Tamamlama" (Advanced Cloze Test) etkinliği üret.

    🎯 HEDEF: ${topic} temasında, ${ageGroup} yaş grubuna uygun, ${difficulty} zorluk seviyesinde ultra gelişmiş bir etkinlik.

    📊 KONFİGÜRASYON:
    - Paragraf sayısı: ${config.paragraphs}
    - Her paragraftaki boşluk: ${config.blanksPerParagraph}
    - Toplam boşluk: ${blankCount}
    - Boşluk türü: ${blankType}
    - Kelime uzunluğu: ${config.wordLength}
    - Cümle yapısı: ${config.sentenceStructure}
    - Kelime dağarcığı: ${config.vocabulary}
    - Anlamsal karmaşıklık: ${semanticComplexity}
    - Görsel ipuçları: ${showVisualHints ? 'Evet' : 'Hayır'}

    🎨 TASARIM ÖZELLİKLERİ:
    - Düzen: ${compactLayout ? 'Ultra kompakt A4' : 'Geniş açıklamalı'}
    - Font boyutu: ${fontSize}
    - Satır aralığı: ${lineHeight}
    - Sütun düzeni: ${columnLayout}
    - Hece renklendirme: ${syllableColoring ? 'Evet' : 'Hayır'}
    - İkon kullanımı: ${useIcons ? 'Evet' : 'Hayır'}

    📝 İÇERİK KURALLARI:
    1. ${topic} hakkında ilgi çekici, öğretici bir metin yaz
    2. Metin akıcı ve bağlamlı olmalı
    3. Boşluklar anlam bütünlüğünü bozmamalı
    4. Her boşluk için ${includeDistractors ? distractorCount : 0} tane çeldirici kelime ekle
    5. Çeldiriciler ${config.distractorDifficulty} olmalı (anlamca, yazım olarak)
    6. A4 sayfasını tam dolduracak yoğunlukta içerik üret
    7. Her paragraf ${maxParagraphsPerPage} sayfayı geçmemeli

    🔍 PEDAGOJİK DESTEK:
    - ${showExamples ? '2 adet örnek cümle' : 'Örnek yok'}
    - ${showVisualHints ? 'Her boşluk için ipucu' : 'İpucu yok'}
    - 3 adet strateji önerisi
    - Anlamlı bir pedagojik not

    🎯 GÖRSEL ÖĞELER:
    ${useIcons ? `
    - Her paragraf için tema uygun ikon
    - Başlık için ana ikon
    - Kelime havuzu için puzzle ikonu
    ` : 'Görsel öğe yok'}

    📄 ÇIKTI FORMATI (MUTLAKA BU JSON YAPISINI KULLAN):
    {
      "title": "${topic} - Eksik Parçaları Tamamlama",
      "instruction": "Aşağıdaki metni dikkatlice okuyunuz ve kelime havuzundaki kelimeleri uygun boşluklara yerleştiriniz.",
      "content": {
        "title": "${topic} Temalı Metin",
        "paragraphs": [
          {
            "id": "paragraph_1",
            "parts": [
              { "text": "Bir gün sabah ", "isBlank": false },
              { "text": "erkenden", "isBlank": true, "answer": "erkenden", "hints": ["Zaman kelimesi"], "distractors": ["geç", "geciken", "sabah"], "difficulty": "easy" },
              { "text": " kalktım ve ", "isBlank": false },
              { "text": "hızla", "isBlank": true, "answer": "hızla", "hints": ["Hareket şekli"], "distractors": ["yavaş", "koşarak", "yürüyerek"], "difficulty": "easy" },
              { "text": " dışarı çıktım.", "isBlank": false }
            ]
          }
        ],
        "wordBank": {
          "words": ["erkenden", "hızla", "mutlu", "kitap", "güneş", "kuşlar"],
          "categories": ["Zaman", "Hareket", "Duygu", "Nesne"],
          "showCategories": true,
          "randomOrder": true
        },
        "visualElements": {
          "icons": [
            { "position": 0, "icon": "fas fa-sun", "style": "text-yellow-500 text-2xl" },
            { "position": 1, "icon": "fas fa-book", "style": "text-blue-500 text-xl" }
          ],
          "images": [],
          "decorations": []
        },
        "pedagogicalSupport": {
          "examples": [
            { "sentence": "Bugün hava çok ___ oldu.", "answer": "güzel" },
            { "sentence": "Okula ___ gittim.", "answer": "koşarak" }
          ],
          "tips": ["Cümlenin anlamını düşün", "Kelime havuzunu kontrol et", "Bağlama dikkat et"],
          "strategies": ["Önce metni tamam oku", "Zor kelimeleri sonra yap", "Anlam bütünlüğünü kontrol et"]
        }
      },
      "pedagogicalNote": "Bu etkinlik öğrencinin bağlamdan anlam çıkarma, kelime dağarcığını kullanma ve metin bütünlüğü kurma becerilerini geliştirir. Disleksi olan öğrenciler için görsel destekler ve ipuçları içerir."
    }

    ⚠️ ÖNEMLİ: 
    - JSON formatını kesinlikle bozma
    - Tüm alanları doldur
    - Gerçek ve anlamlı içerik üret
    - Yaş grubuna uygun dil kullan
    - ${compactLayout ? 'Kompakt ve yoğun içerik' : 'Geniş açıklamalı içerik'}
  `;

  try {
    const result = await generateCreativeMultimodal({ prompt });
    
    if (!result || !result.content) {
      throw new AppError('AI Gelişmiş Eksik Parçaları Tamamlama üretilemedi.', 'GENERATION_FAILED', 500);
    }

    // AI sonucunu doğrula ve gerekirse düzelt
    const validatedResult = validateAndEnhanceResult(result, options);

    return {
      success: true,
      data: validatedResult,
      metadata: { 
        difficulty, 
        ageGroup, 
        topic,
        blankCount,
        generatedAt: new Date().toISOString(),
        version: '2.0-ultra-advanced'
      }
    };
  } catch (error: any) {
    throw new AppError('Gelişmiş Eksik Parçaları Tamamlama üretilirken hata: ' + error.message, 'AI_ERROR', 500);
  }
};

/**
 * AI sonucunu doğrula ve geliştir
 */
function validateAndEnhanceResult(result: any, options: GeneratorOptions): any {
  const { content } = result;
  
  // Temel doğrulamalar
  if (!content.paragraphs || content.paragraphs.length === 0) {
    throw new AppError('Paragraf içeriği bulunamadı', 'INVALID_CONTENT', 400);
  }

  if (!content.wordBank || !content.wordBank.words || content.wordBank.words.length === 0) {
    throw new AppError('Kelime havuzu bulunamadı', 'INVALID_WORD_BANK', 400);
  }

  // Boşluk sayısını kontrol et ve ayarla
  const totalBlanks = content.paragraphs.flatMap((p: any) => p.parts).filter((part: any) => part.isBlank).length;
  const targetBlanks = options.blankCount || 10;

  if (totalBlanks !== targetBlanks) {
    console.warn(`Beklenen boşluk sayısı: ${targetBlanks}, bulunan: ${totalBlanks}`);
  }

  // Görsel öğeleri ekle (isteğe bağlı)
  if (options.useIcons && !content.visualElements?.icons) {
    content.visualElements = content.visualElements || {};
    content.visualElements.icons = generateDefaultIcons(content.paragraphs.length);
  }

  // Pedagojik desteği ekle (eğer yoksa)
  if (options.showExamples && !content.pedagogicalSupport?.examples) {
    content.pedagogicalSupport = content.pedagogicalSupport || {};
    content.pedagogicalSupport.examples = generateDefaultExamples();
  }

  if (!content.pedagogicalSupport?.strategies) {
    content.pedagogicalSupport = content.pedagogicalSupport || {};
    content.pedagogicalSupport.strategies = generateDefaultStrategies();
  }

  return result;
}

/**
 * Varsayılan ikonları oluştur
 */
function generateDefaultIcons(paragraphCount: number) {
  const icons = [
    'fas fa-sun', 'fas fa-book', 'fas fa-puzzle-piece', 'fas fa-star',
    'fas fa-heart', 'fas fa-rocket', 'fas fa-tree', 'fas fa-cloud'
  ];
  
  return Array.from({ length: paragraphCount }, (_, i) => ({
    position: i,
    icon: icons[i % icons.length],
    style: `text-${['blue', 'green', 'purple', 'orange', 'red', 'indigo'][i % 6]}-500 text-xl`
  }));
}

/**
 * Varsayılan örnekleri oluştur
 */
function generateDefaultExamples() {
  return [
    { sentence: "Bugün hava çok ___ oldu.", answer: "güzel" },
    { sentence: "Okula ___ gittim.", answer: "koşarak" }
  ];
}

/**
 * Varsayılan stratejileri oluştur
 */
function generateDefaultStrategies() {
  return [
    "Önce metni tamam okuyup anlamını kavrayın",
    "Boşluğun etrafındaki kelimelere dikkat edin",
    "Kelime havuzundaki seçenekleri deneyin",
    "Cümlenin anlam bütünlüğünü kontrol edin"
  ];
}
