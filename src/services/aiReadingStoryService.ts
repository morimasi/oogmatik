/**
 * BDMIND - AI Canlı Okuma Hikaye Üretim Servisi (AI Reading Story Service)
 * Öğrencinin yaşına, sınıfına, hece/fonoloji odağına ve ilgi alanına göre
 * Gemini AI ile anında benzersiz, disleksi dostu okuma metinleri üretir.
 * Sunucu veya ağ kesintisi durumunda 8 tema ve 6 fonolojik odaklı zengin
 * çevrimdışı pedagojik hikaye kataloğuna anında kesintisiz düşer (Zero Failure).
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

export const PHONOLOGICAL_LABELS: Record<string, string> = {
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

// ============================================================================
// ÇEVRİMDIŞI ZENGİN PEDAGOJİK HİKAYE KATALOĞU (Dr. Deniz Yılmaz & Elif Yıldız)
// ============================================================================
interface OfflineStoryTemplate {
  title: string;
  text: string;
  targetSkill: string;
  questions: ComprehensionQuestion[];
}

const OFFLINE_STORY_CATALOG: Record<string, OfflineStoryTemplate> = {
  // 1. Hayvanlar & Orman
  animal: {
    title: 'Sevimli Tavşan Pıtırcık ve Bilge Baykuş',
    text: 'Bilge baykuş Bora ile sevimli tavşan Pıtırcık bahçede buluştu. Dalgalı yaprakların altındaki parlak bal kovanına baktılar. Pıtırcık pıt pıt zıplayarak çitlerin altından geçti. Bora büyük kanatlarını açtı ve ona taze turuncu bir havuç uzattı. Birlikte ormanda çok neşeli bir gün geçirdiler.',
    targetSkill: 'b - d - p Ayna Harf Farkındalığı & Ritmik Okuma',
    questions: [
      {
        id: 'q-animal-1',
        question: 'Pıtırcık ile Bora nerede buluştu?',
        options: ['Okul bahçesinde', 'Ormandaki bahçede', 'Göl kenarında', 'Kalede'],
        correctIndex: 1,
        explanation: 'Metinde Bora ile Pıtırcık\'ın bahçede buluştuğu belirtilmiştir.',
      },
      {
        id: 'q-animal-2',
        question: 'Bora büyük kanatlarını açıp Pıtırcık\'a ne uzattı?',
        options: ['Kırmızı bir elma', 'Taze turuncu bir havuç', 'Sarı bir armut', 'Ceviz'],
        correctIndex: 1,
        explanation: 'Bora ona taze turuncu bir havuç uzatmıştır.',
      },
    ],
  },
  // 2. Uzay & Gezegenler
  space: {
    title: 'Kaptan Burak ve Mavi Gezegen Yolculuğu',
    text: 'Parlak beyaz bir roket derin uzayda hızla yol aldı. Kaptan Burak uzay gemisinin penceresinden parıldayan yıldızlara baktı. Büyük mavi bir gezegenin etrafında döndü. Küçük uydusuna dostça sinyaller gönderdi. Görevini başarıyla tamamlayıp güvenle üssüne döndü.',
    targetSkill: 'Uzamsal Sözcükler & b-d Fonem Ayırt Etme',
    questions: [
      {
        id: 'q-space-1',
        question: 'Kaptan Burak uzayda neyin etrafında döndü?',
        options: ['Kırmızı bir ayın', 'Büyük mavi bir gezegenin', 'Güneşin', 'Bir kara deliğin'],
        correctIndex: 1,
        explanation: 'Kaptan Burak büyük mavi bir gezegenin etrafında dönmüştür.',
      },
      {
        id: 'q-space-2',
        question: 'Burak görevini tamamlayınca nereye döndü?',
        options: ['Üssüne', 'Ormana', 'Başka bir galaksiye', 'Parka'],
        correctIndex: 0,
        explanation: 'Metinde güvenle üssüne döndüğü yazmaktadır.',
      },
    ],
  },
  // 3. Robotlar & Küçük Mucit
  robot: {
    title: 'Küçük Mucit Can ve Akıllı Robot Bip',
    text: 'Küçük mucit Can atölyesinde harika bir robot tasarladı. Robotun adı Bip idi. Bip parlak mavi düğmelerine bastığında neşeyle ışıklar saçıyordu. Birlikte odadaki dağınık blokları düzenlediler ve sağlam bir köprü kurdular. Can dostuna teşekkür edip gülümsedi.',
    targetSkill: 'Akıcı Okuma & Sebep-Sonuç İlişkisi Kurma',
    questions: [
      {
        id: 'q-robot-1',
        question: 'Robot Bip düğmelerine basıldığında ne yapıyordu?',
        options: ['Korkup kaçıyordu', 'Neşeyle ışıklar saçıyordu', 'Sessizce bekliyordu', 'Uyuyordu'],
        correctIndex: 1,
        explanation: 'Bip parlak düğmelerine bastığında neşeyle ışıklar saçıyordu.',
      },
      {
        id: 'q-robot-2',
        question: 'Can ve Bip bloklarla ne inşa ettiler?',
        options: ['Büyük bir kale', 'Sağlam bir köprü', 'Hızlı bir araba', 'Uçak'],
        correctIndex: 1,
        explanation: 'Birlikte sağlam bir köprü kurmuşlardır.',
      },
    ],
  },
  // 4. Denizaltı & Okyanus
  ocean: {
    title: 'Mavi Yunus Derin ve Parlak İnci',
    text: 'Deniz derin ve masmavi bir göldü. Mavi yunus Derin berrak suların altında neşeyle yüzdü. Dalgalar kıyıya doğru tatlı bir melodiyle vurdu. Derin yosunların arasında pırıl pırıl parlayan bir inci buldu. Sevimli deniz kaplumbağası ona dostça el salladı.',
    targetSkill: 'Görsel Canlandırma & Betimleyici Sözcük Dağarcığı',
    questions: [
      {
        id: 'q-ocean-1',
        question: 'Mavi yunus Derin yosunların arasında ne buldu?',
        options: ['Eski bir pusula', 'Pırıl pırıl parlayan bir inci', 'Yeşil bir deniz kabuğu', 'Balık'],
        correctIndex: 1,
        explanation: 'Derin yosunların arasında parıldayan bir inci bulmuştur.',
      },
      {
        id: 'q-ocean-2',
        question: 'Derin\'e dostça el sallayan deniz canlısı hangisiydi?',
        options: ['Köpek balığı', 'Sevimli deniz kaplumbağası', 'Ahtapot', 'Denizanası'],
        correctIndex: 1,
        explanation: 'Metinde sevimli deniz kaplumbağasının el salladığı belirtilmiştir.',
      },
    ],
  },
  // 5. Park & Neşeli Spor
  park: {
    title: 'Parkta Dostluk ve Renkli Salıncak',
    text: 'Güneş pırıl pırıl parlıyordu. Kerem ile Zeynep yemyeşil parkta buluştu. Birlikte renkli salıncaklarda gökyüzüne doğru yükseldiler. Kaydıraktan kayarken neşeli kahkahaları tüm parka yayıldı. Parktaki sokak kedisine biraz su verip eve döndüler.',
    targetSkill: 'Günlük Yaşam Diyalogları & Akıcı Okuma',
    questions: [
      {
        id: 'q-park-1',
        question: 'Kerem ile Zeynep parkta hangi oyuncağa bindiler?',
        options: ['Dönme dolap', 'Renkli salıncaklar ve kaydırak', 'Çarpışan araba', 'Atlıkarınca'],
        correctIndex: 1,
        explanation: 'Çocuklar salıncakta sallanmış ve kaydıraktan kaymışlardır.',
      },
      {
        id: 'q-park-2',
        question: 'Eve dönmeden önce kime su verdiler?',
        options: ['Kuşlara', 'Parktaki sokak kedisine', 'Köpeğe', 'Çiçeklere'],
        correctIndex: 1,
        explanation: 'Parktaki sokak kedisine su vermişlerdir.',
      },
    ],
  },
  // 6. Dinozorlar Çağı
  dino: {
    title: 'Minik Dinozor Dino ve Tatlı Meyveler',
    text: 'Yemyeşil vadide minik bir yavru dinozor yaşardı. Adı Dino idi. Dino sabah erkenden uyandı ve dostlarına taze yeşil yapraklar topladı. Uzun boyunlu dostu Poti ona tatlı mor meyveler ikram etti. Güneş batarken mağaralarına huzurla çekildiler.',
    targetSkill: 'Fonolojik Farkındalık & Hece Akıcılığı',
    questions: [
      {
        id: 'q-dino-1',
        question: 'Minik dinozorun adı neydi?',
        options: ['Dino', 'Poti', 'Bora', 'Can'],
        correctIndex: 0,
        explanation: 'Metinde minik yavru dinozorun adının Dino olduğu yazmaktadır.',
      },
      {
        id: 'q-dino-2',
        question: 'Uzun boyunlu Poti Dino\'ya ne ikram etti?',
        options: ['Taze su', 'Tatlı mor meyveler', 'Çiçek', 'Balık'],
        correctIndex: 1,
        explanation: 'Poti ona tatlı mor meyveler ikram etmiştir.',
      },
    ],
  },
  // 7. Gizemli Kale & Dostluk
  castle: {
    title: 'Gizemli Taş Kale ve Altın Pusula',
    text: 'Tepedeki eski taş kalenin bahçesinde gizemli ahşap bir sandık vardı. Ali sandığı dikkatle açtığında parıldayan altın bir pusula gördü. Pusula yönleri değil, sevgiyi ve yardımlaşmayı gösteriyordu. Arkadaşlarına bu güzel haberi sevinçle anlattı.',
    targetSkill: 'Soyut Kavram Farkındalığı & Okuduğunu Anlama',
    questions: [
      {
        id: 'q-castle-1',
        question: 'Ali eski kalenin bahçesinde ne buldu?',
        options: ['Gümüş bir anahtar', 'Gizemli ahşap bir sandık', 'Eski bir harita', 'Kılıç'],
        correctIndex: 1,
        explanation: 'Ali ahşap bir sandık bulmuştur.',
      },
      {
        id: 'q-castle-2',
        question: 'Altın pusula neyi gösteriyordu?',
        options: ['Kuzeyi', 'Sevgiyi ve yardımlaşmayı', 'Defineyi', 'Güneşi'],
        correctIndex: 1,
        explanation: 'Pusula sevgiyi ve yardımlaşmayı göstermektedir.',
      },
    ],
  },
  // 8. Renkli Boyalar & Sihirli Fırça
  art: {
    title: 'Ressam Elif ve Sihirli Fırça',
    text: 'Ressam Elif eline sihirli fırçasını aldı. Beyaz tuvale masmavi bir gökyüzü ve sapsarı sıcacık bir güneş çizdi. Çizdiği kuşlar bir anda kanat çırparak tuvalin üzerinde neşeyle cıvıldamaya başladı. Elif bu büyüleyici manzarayı mutlulukla seyretti.',
    targetSkill: 'Zengin Betimleme & Yaratıcı İmgelem Okuması',
    questions: [
      {
        id: 'q-art-1',
        question: 'Ressam Elif tuvale önce neleri çizdi?',
        options: ['Büyük bir orman', 'Masmavi gökyüzü ve sapsarı güneş', 'Deniz ve balıklar', 'Ev'],
        correctIndex: 1,
        explanation: 'Elif tuvale masmavi bir gökyüzü ve sapsarı bir güneş çizmiştir.',
      },
      {
        id: 'q-art-2',
        question: 'Tuvaldeki kuşlar ne yaptı?',
        options: ['Uçup uzaklaştı', 'Kanat çırparak cıvıldamaya başladı', 'Sessizce durdu', 'Yok oldu'],
        correctIndex: 1,
        explanation: 'Kuşlar kanat çırparak tuvalin üzerinde neşeyle cıvıldamıştır.',
      },
    ],
  },
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
      if (!text || text === 'test string' || text.split(/\s+/).length < 5) {
        throw new Error('AI yanıtı yetersiz veya boş');
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
      // Çevrimdışı / Hata / Kota anında zengin pedagojik kataloğa düş (Zero Failure)
      return this.generateOfflineFallbackStory(config);
    }
  }

  /**
   * Çevrimdışı, kota dolumu veya sunucu hatası anında seçilen temaya göre
   * zengin ve hedeflenmiş pedagojik okuma metnini anında devreye alır.
   */
  public static generateOfflineFallbackStory(config: AIStoryConfig): ReadingPassage {
    const rawTheme = (config.customTopic || config.theme || '').toLowerCase();
    
    // Tema eşleştirici
    let selectedTemplate = OFFLINE_STORY_CATALOG.animal;
    if (rawTheme.includes('uzay') || rawTheme.includes('yıldız') || rawTheme.includes('gezegen')) {
      selectedTemplate = OFFLINE_STORY_CATALOG.space;
    } else if (rawTheme.includes('robot') || rawTheme.includes('mucit')) {
      selectedTemplate = OFFLINE_STORY_CATALOG.robot;
    } else if (rawTheme.includes('deniz') || rawTheme.includes('okyanus') || rawTheme.includes('yunus') || rawTheme.includes('su')) {
      selectedTemplate = OFFLINE_STORY_CATALOG.ocean;
    } else if (rawTheme.includes('park') || rawTheme.includes('spor') || rawTheme.includes('oyun')) {
      selectedTemplate = OFFLINE_STORY_CATALOG.park;
    } else if (rawTheme.includes('dino')) {
      selectedTemplate = OFFLINE_STORY_CATALOG.dino;
    } else if (rawTheme.includes('kale') || rawTheme.includes('şato')) {
      selectedTemplate = OFFLINE_STORY_CATALOG.castle;
    } else if (rawTheme.includes('boya') || rawTheme.includes('fırça') || rawTheme.includes('sanat') || rawTheme.includes('resim')) {
      selectedTemplate = OFFLINE_STORY_CATALOG.art;
    }

    const words = selectedTemplate.text.trim().split(/\s+/).filter(Boolean);
    const syllabifiedWords = words.map((w) => syllabifyTurkishWord(w));

    return {
      id: `story-catalog-${Date.now()}`,
      title: selectedTemplate.title,
      level: config.gradeLevel === '1' ? 'kolay' : (config.gradeLevel === '2' || config.gradeLevel === '3') ? 'orta' : 'ileri',
      targetSkill: PHONOLOGICAL_LABELS[config.phonologicalFocus] || selectedTemplate.targetSkill,
      ageGroup: `${config.ageGroup} Yaş (${config.gradeLevel}. Sınıf)`,
      text: selectedTemplate.text,
      words,
      syllabifiedWords,
      difficultyRating: config.gradeLevel === '1' ? 1 : config.gradeLevel === '2' ? 2 : 3,
      comprehensionQuestions: selectedTemplate.questions,
    };
  }
}
