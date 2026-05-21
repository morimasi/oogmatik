
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
  gradeLevel: number;
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
      settings: { type: 'OBJECT' },
      content: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          instruction: { type: 'STRING' },
          wordBank: { type: 'ARRAY', items: { type: 'STRING' } }
        }
      },
      items: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            sentence: { type: 'STRING' },
            blankValue: { type: 'STRING' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING' }
    }
  };

  const result = await generateWithSchema(prompt, schema);
  return {
    ...result,
    type: 'fill_blanks',
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
          title: { type: 'STRING' },
          instruction: { type: 'STRING' }
        }
      },
      items: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING' },
            options: { type: 'ARRAY', items: { type: 'STRING' } },
            correctAnswer: { type: 'STRING' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING' }
    }
  };

  const result = await generateWithSchema(prompt, schema);
  return {
    ...result,
    type: 'multiple_choice_verbal',
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
      content: { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' } } },
      items: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            missingPart: { type: 'STRING' },
            imagePrompt: { type: 'STRING' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING' }
    }
  };

  const result = await generateWithSchema(prompt, schema);
  return {
    ...result,
    type: 'word_completion',
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
      content: { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' } } },
      items: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            scrambledWords: { type: 'ARRAY', items: { type: 'STRING' } },
            correctSentence: { type: 'STRING' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING' }
    }
  };

  const result = await generateWithSchema(prompt, schema);
  return {
    ...result,
    type: 'mixed_sentence',
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
      content: { type: 'OBJECT', properties: { title: { type: 'STRING' }, instruction: { type: 'STRING' } } },
      items: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            word: { type: 'STRING' },
            target: { type: 'STRING' },
            contextSentence: { type: 'STRING' }
          }
        }
      },
      pedagogicalNote: { type: 'STRING' }
    }
  };

  const result = await generateWithSchema(prompt, schema);
  return {
    ...result,
    type: 'antonym',
    settings: { ...config, compactLayout: true, fontSize: 'small', lineHeight: 'tight', showVisualHints: false, columnLayout: 2 }
  };
};
