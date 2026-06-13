
import { generateWithSchema } from '../geminiClient.js';
import { 
  FillBlanksData, 
  MultipleChoiceVerbalData, 
  WordCompletionData, 
  MixedSentenceData, 
  AntonymData,
  KelimeCumleBaseData
} from '../../types/verbal.js';
import type { GeneratorOptions } from '../../types/core.js';

interface GenerationConfig extends Partial<GeneratorOptions> {
  studentName?: string;
  topic: string;
  difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor' | 'uzman';
  ageGroup: '5-7' | '8-10' | '11-13' | '14+';
  gradeLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  itemCount: number;
  studentProfile?: any;
}

/**
 * Boşluk Doldurma Etkinliği Üreticisi
 */
export const generateFillBlanks = async (config: GenerationConfig): Promise<FillBlanksData> => {
  const prompt = `
    [ROL: ÖZEL EĞİTİM & DİL TERAPİSİ UZMANI]
    Öğrenci için "${config.topic}" temalı, ${config.difficulty} zorluk seviyesinde ${config.itemCount} adet boşluk doldurma cümlesi üret.
    
    KURALLAR:
    1. Cümleler ${config.ageGroup} yaş grubuna ve ${config.gradeLevel}. sınıf seviyesine tam uyumlu olmalı.
    2. Her cümlede sadece 1 adet kritik boşluk olmalı.
    3. Boşluklar anlamsal, dilbilgisel ve bilişsel kazanım odaklı olmalı.
    4. Bir kelime bankası (wordBank) oluştur ve tüm cevapları içine koy.
    5. Disleksi dostu, somut ve görselleştirilebilir cümleler kur.
    
    FORMAT: Sadece JSON döndür.
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      settings: { type: 'OBJECT', description: 'Activity settings', properties: { compactLayout: { type: 'BOOLEAN', description: 'Dar yerleşim' }, fontSize: { type: 'STRING', enum: ['small', 'medium', 'large'], description: 'Yazı boyutu' }, showWordBank: { type: 'BOOLEAN', description: 'Kelime bankası göster' }, maxAttempts: { type: 'INTEGER', description: 'Maksimum deneme' }, hintEnabled: { type: 'BOOLEAN', description: 'İpucu aktif' }, randomizeOrder: { type: 'BOOLEAN', description: 'Rastgele sırala' } } },
      content: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Etkinlik başlığı' },
          instruction: { type: 'STRING', description: 'Öğrenci yönergesi' },
          wordBank: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Tüm cevapların listesi' }
        }
      },
      items: {
        type: 'ARRAY',
        description: 'Boşluk doldurma maddeleri',
        items: {
          type: 'OBJECT',
          properties: {
            sentence: { type: 'STRING', description: 'Boşluk içeren cümle (___)' },
            blankValue: { type: 'STRING', description: 'Doğru cevap kelime' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING', description: 'Öğretmene pedagojik not' }
    }
  };

  const result = await generateWithSchema(prompt, schema) as Record<string, unknown>;
  return {
    ...result,
    type: 'fill_blanks',
    instruction: (result?.content as Record<string, unknown>)?.instruction as string || '',
    title: (result?.content as Record<string, unknown>)?.title as string || '',
    settings: {
      ...config,
      compactLayout: true,
      fontSize: 'medium',
      lineHeight: 'normal',
      showVisualHints: true
    }
  };
};

/**
 * Çoktan Seçmeli Kelime Etkinliği Üreticisi
 */
export const generateMultipleChoiceVerbal = async (config: GenerationConfig): Promise<MultipleChoiceVerbalData> => {
  const prompt = `
    [ROL: TÜRKÇE DİL BİLGİSİ & ÖZEL ÖĞRENME GÜÇLÜĞÜ UZMANI]
    "${config.topic}" konusunda, ${config.itemCount} adet çoktan seçmeli soru üret.
    
    ÖNEMLİ:
    - Seviye: ${config.difficulty}, Yaş: ${config.ageGroup}.
    - Çeldiriciler (distractors) öğrencinin kafasını karıştırmayacak ama bilişsel bir ayrım yapmasını sağlayacak nitelikte olmalı.
    - Sorular kelime bilgisi, eş anlam, zıt anlam veya cümle tamamlama odaklı olabilir.
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      content: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Etkinlik başlığı' },
          instruction: { type: 'STRING', description: 'Öğrenci yönergesi' }
        }
      },
      items: {
        type: 'ARRAY',
        description: 'Çoktan seçmeli sorular',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING', description: 'Soru metni' },
            options: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Seçenek listesi (4 şık)' },
            correctAnswer: { type: 'STRING', description: 'Doğru cevap' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING', description: 'Öğretmene pedagojik not' }
    }
  };

  const result = await generateWithSchema(prompt, schema) as Record<string, unknown>;
  return {
    ...result,
    type: 'multiple_choice_verbal',
    instruction: (result?.content as Record<string, unknown>)?.instruction as string || '',
    title: (result?.content as Record<string, unknown>)?.title as string || '',
    settings: { ...config, compactLayout: true, fontSize: 'medium', lineHeight: 'normal', showVisualHints: false }
  };
};

/**
 * Kelime Tamamlama Etkinliği Üreticisi
 */
export const generateWordCompletion = async (config: GenerationConfig): Promise<WordCompletionData> => {
  const prompt = `
    [ROL: DİSLEKSİ FONOLOJİK FARKINDALIK UZMANI]
    "${config.topic}" temalı, ${config.itemCount} adet kelime tamamlama maddesi üret.
    
    YÖNERGE:
    - Kelimelerin içinden 1 veya 2 harfi çıkart ve yerine alt çizgi (_) koy (Örn: El_a).
    - Çıkartılan harfler fonetik olarak kritik olmalı (b/d karışıklığı, sesli harf takibi vb. odaklı).
    - Her kelime için görsel bir ipucu (imagePrompt) tanımla.
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      content: { type: 'OBJECT', description: 'İçerik başlık ve yönerge', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenci yönergesi' } } },
      items: {
        type: 'ARRAY',
        description: 'Kelime tamamlama maddeleri',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING', description: 'Eksik harfli kelime (ör: El_a)' },
            missingPart: { type: 'STRING', description: 'Eksik harf/hece' },
            imagePrompt: { type: 'STRING', description: 'Görsel ipucu (İngilizce)' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING', description: 'Öğretmene pedagojik not' }
    }
  };

  const result = await generateWithSchema(prompt, schema) as Record<string, unknown>;
  return {
    ...result,
    type: 'word_completion',
    instruction: (result?.content as Record<string, unknown>)?.instruction as string || '',
    title: (result?.content as Record<string, unknown>)?.title as string || '',
    settings: { ...config, compactLayout: true, fontSize: 'large', lineHeight: 'relaxed', showVisualHints: true }
  };
};

/**
 * Karışık Cümle Etkinliği Üreticisi
 */
export const generateMixedSentence = async (config: GenerationConfig): Promise<MixedSentenceData> => {
  const prompt = `
    [ROL: LXD - ÖĞRENME DENEYİMİ TASARIMCISI]
    "${config.topic}" temalı, ${config.itemCount} adet karışık kelimelerden cümle kurma maddesi üret.
    
    YAPI:
    - Kelimeler anlamlı bir cümle oluşturacak şekilde rastgele karıştırılmalı.
    - Cümleler öğrencinin seviyesine (${config.difficulty}) göre 3-7 kelime arası olmalı.
    - Her cümle için bir ipucu kelimesi (clueWord) verilebilir.
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      content: { type: 'OBJECT', description: 'İçerik başlık ve yönerge', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenci yönergesi' } } },
      items: {
        type: 'ARRAY',
        description: 'Karışık cümle maddeleri',
        items: {
          type: 'OBJECT',
          properties: {
            scrambledWords: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Karıştırılmış kelimeler' },
            correctSentence: { type: 'STRING', description: 'Doğru cümle sıralaması' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING', description: 'Öğretmene pedagojik not' }
    }
  };

  const result = await generateWithSchema(prompt, schema) as Record<string, unknown>;
  return {
    ...result,
    type: 'mixed_sentence',
    instruction: (result?.content as Record<string, unknown>)?.instruction as string || '',
    title: (result?.content as Record<string, unknown>)?.title as string || '',
    settings: { ...config, compactLayout: true, fontSize: 'medium', lineHeight: 'very_relaxed', showVisualHints: false }
  };
};

/**
 * Zıt Anlam Etkinliği Üreticisi
 */
export const generateAntonyms = async (config: GenerationConfig): Promise<AntonymData> => {
  const prompt = `
    [ROL: SEMANTİK İŞLEMLEME UZMANI]
    "${config.topic}" temalı, ${config.itemCount} adet zıt anlamlı kelime çifti üret.
    
    KAPSAM:
    - Sadece zıt anlamlara odaklan.
    - Kelimeler günlük hayattan ve müfredatla uyumlu olmalı.
    - Her madde için kelimenin geçtiği bir örnek cümle (contextSentence) oluştur.
  `;

  const schema = {
    type: 'OBJECT',
    properties: {
      content: { type: 'OBJECT', description: 'İçerik başlık ve yönerge', properties: { title: { type: 'STRING', description: 'Etkinlik başlığı' }, instruction: { type: 'STRING', description: 'Öğrenci yönergesi' } } },
      items: {
        type: 'ARRAY',
        description: 'Zıt anlam çiftleri',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING', description: 'Kaynak kelime' },
            target: { type: 'STRING', description: 'Zıt anlamlısı' },
            contextSentence: { type: 'STRING', description: 'Örnek cümle' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING', description: 'Öğretmene pedagojik not' }
    }
  };

  const result = await generateWithSchema(prompt, schema) as Record<string, unknown>;
  return {
    ...result,
    type: 'antonym',
    instruction: (result?.content as Record<string, unknown>)?.instruction as string || '',
    title: (result?.content as Record<string, unknown>)?.title as string || '',
    settings: { ...config, compactLayout: true, fontSize: 'small', lineHeight: 'tight', showVisualHints: false, columnLayout: 2 }
  };
};
