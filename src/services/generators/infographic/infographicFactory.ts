/**
 * @file src/services/generators/infographic/infographicFactory.ts
 * @description InfographicStudio v3 Ultra Premium — Factory Pattern for Remaining 84 Activities
 *
 * Sprint 4-9: Kalan 84 aktivite için otomatik generator pair üretimi.
 * Her aktivite için AI + Offline generator ve customizationSchema oluşturur.
 */

import { ActivityType } from '../../../types/activity';
import {
  UltraCustomizationParams,
  InfographicGeneratorPair,
  InfographicGeneratorResult,
  CustomizationSchema,
} from '../../../types/infographic';
import { generateWithSchema } from '../../geminiClient';

// ── HELPER: Kategori Tespiti (infographicAdapter'tan kopya) ──────────────────

function detectTopicCategory(
  topic: string
): 'science' | 'math' | 'language' | 'social' | 'general' {
  const t = topic.toLowerCase();
  if (
    t.includes('canlı') ||
    t.includes('hayvan') ||
    t.includes('bitki') ||
    t.includes('doğa') ||
    t.includes('fen') ||
    t.includes('gezegen') ||
    t.includes('su döngüsü') ||
    t.includes('enerji')
  )
    return 'science';
  if (
    t.includes('sayı') ||
    t.includes('matematik') ||
    t.includes('geometri') ||
    t.includes('açı') ||
    t.includes('kesir') ||
    t.includes('oran') ||
    t.includes('yüzde')
  )
    return 'math';
  if (
    t.includes('hikaye') ||
    t.includes('masal') ||
    t.includes('şiir') ||
    t.includes('yazı') ||
    t.includes('okuma') ||
    t.includes('harf') ||
    t.includes('kelime')
  )
    return 'language';
  if (
    t.includes('tarih') ||
    t.includes('cumhuriyet') ||
    t.includes('atatürk') ||
    t.includes('coğrafya') ||
    t.includes('harita') ||
    t.includes('ülke')
  )
    return 'social';
  return 'general';
}

function generateGenericItems(topic: string, count: number, prefix = 'Öğe'): string[] {
  return Array.from({ length: count }, (_, i) => `${prefix} ${i + 1} — ${topic}`);
}

function generateGenericSteps(
  topic: string,
  count: number
): Array<{ stepNumber: number; label: string; description: string; isCheckpoint: boolean }> {
  return Array.from({ length: count }, (_, i) => ({
    stepNumber: i + 1,
    label: `Adım ${i + 1}`,
    description: `${topic} konusunda ${i + 1}. adım açıklaması.`,
    isCheckpoint: (i + 1) % 3 === 0,
  }));
}

// ── GENERIC AI GENERATOR ─────────────────────────────────────────────────────

async function generateInfographic_Generic_AI(
  activityName: string,
  params: UltraCustomizationParams,
  rules: string
): Promise<InfographicGeneratorResult> {
  const prompt = `Sen ${params.ageGroup} yaş grubu, ${params.difficulty} zorluk seviyesinde, ${params.profile} profili için ${activityName} infografiği oluşturan bir pedagoji uzmanısın.

KONU: ${params.topic}

ÖZEL PARAMETRELER:
${JSON.stringify(params.activityParams, null, 2)}

KURALLAR:
${rules}

JSON ÇIKTI:`;

  const schema = {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      items: { type: 'array' as const, items: { type: 'string' as const } },
      pedagogicalNote: { type: 'string' as const },
    },
  };

  const result = await generateWithSchema(prompt, schema);
  const data = result as { title: string; items: string[]; pedagogicalNote: string };

  return {
    title: data.title || `${params.topic} — ${activityName}`,
    content: {
      questions: (data.items || []).map((item) => ({
        question: item,
        questionType: 'open-ended' as const,
        difficulty: 'medium' as const,
      })),
    },
    pedagogicalNote:
      data.pedagogicalNote ||
      `Bu ${activityName.toLowerCase()} etkinliği, "${params.topic}" konusunda öğrencinin bilişsel becerilerini geliştirir. ${params.ageGroup} yaş grubu için somut örneklerle desteklenmelidir. Disleksi desteğine ihtiyacı olan öğrenciler için görsel ipuçları ve renk kodlu yapılar kullanılmalıdır.`,
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: [activityName, 'Analitik düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

// ── GENERIC OFFLINE GENERATOR ────────────────────────────────────────────────

function generateInfographic_Generic_Offline(
  activityName: string,
  params: UltraCustomizationParams
): InfographicGeneratorResult {
  const itemCount = (params.activityParams.itemCount as number) || 5;
  const items = generateGenericItems(params.topic, itemCount, activityName);

  return {
    title: `${params.topic} — ${activityName}`,
    content: {
      questions: items.map((item) => ({
        question: item,
        questionType: 'open-ended' as const,
        difficulty: 'medium' as const,
      })),
    },
    pedagogicalNote: `Bu ${activityName.toLowerCase()} etkinliği, "${params.topic}" konusunda öğrencinin bilişsel becerilerini geliştirir. ${params.ageGroup} yaş grubu için somut örneklerle desteklenmelidir. Disleksi desteğine ihtiyacı olan öğrenciler için görsel ipuçları ve renk kodlu yapılar kullanılmalıdır.`,
    layoutHints: { orientation: 'vertical', fontSize: 11, colorScheme: 'dyslexia-friendly' },
    targetSkills: [activityName, 'Analitik düşünme'],
    estimatedDuration: 15,
    difficultyLevel: params.difficulty,
    ageGroup: params.ageGroup,
    profile: params.profile,
  };
}

// ── ACTIVITY DEFINITIONS (84 Activities) ─────────────────────────────────────

interface ActivityDefinition {
  type: ActivityType;
  name: string;
  rules: string;
  schema: CustomizationSchema;
}

const ACTIVITY_DEFINITIONS: ActivityDefinition[] = [
  // Kat 2: Okuduğunu Anlama (10)
  {
    type: ActivityType.INFOGRAPHIC_5W1H_BOARD,
    name: '5N1K Panosu',
    rules:
      '1. Ne, Nerede, Ne Zaman, Neden, Nasıl, Kim sorularını cevapla\n2. Her soru için kısa ve net cevap yaz\n3. Pedagojik not: 5N1K tekniğinin okuduğunu anlamaya katkısı (min 100 kelime)\n4. Lexend font, disleksi uyumlu',
    schema: {
      parameters: [
        {
          name: 'includeAll',
          type: 'boolean',
          label: 'Tüm Sorular',
          defaultValue: true,
          description: '6 soru da dahil edilsin mi?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_READING_FLOW,
    name: 'Okuma Akış Şeması',
    rules:
      '1. Metni bölümlere ayır\n2. Her bölüm için özet yaz\n3. Akış yönü oklarla göster\n4. Pedagojik not: Okuma akışının anlamaya katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'sectionCount',
          type: 'number',
          label: 'Bölüm Sayısı',
          defaultValue: 4,
          description: 'Metin kaç bölüme ayrılsın?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SEQUENCE,
    name: 'Sıralama Etkinliği',
    rules:
      '1. Olayları doğru sıraya koy\n2. En az 5 adım\n3. Her adım kısa ve net\n4. Pedagojik not: Sıralama becerisinin gelişime katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stepCount',
          type: 'number',
          label: 'Adım Sayısı',
          defaultValue: 5,
          description: 'Kaç adımlı sıra olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_STORY_MAP,
    name: 'Hikaye Haritası',
    rules:
      '1. Karakterler, mekan, zaman, sorun, çözüm belirle\n2. Her öğe için kısa açıklama yaz\n3. Pedagojik not: Hikaye haritasının okuma anlamaya katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeTheme',
          type: 'boolean',
          label: 'Tema Dahil',
          defaultValue: true,
          description: 'Hikaye teması da gösterilsin mi?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_CHARACTER_ANALYSIS,
    name: 'Karakter Analizi',
    rules:
      '1. Karakterin fiziksel ve duygusal özelliklerini yaz\n2. En az 3 özellik\n3. Pedagojik not: Karakter analizi empati gelişimine katkı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'characterCount',
          type: 'number',
          label: 'Karakter Sayısı',
          defaultValue: 2,
          description: 'Kaç karakter analiz edilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_INFERENCE_CHAIN,
    name: 'Çıkarım Zinciri',
    rules:
      '1. Metinden yola çıkarak çıkarım yap\n2. Her çıkarımı bir sonrakine bağla\n3. En az 3 halka\n4. Pedagojik not: Çıkarım yapma becerisinin gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'chainLength',
          type: 'number',
          label: 'Zincir Uzunluğu',
          defaultValue: 3,
          description: 'Kaç halkalı zincir olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SUMMARY_PYRAMID,
    name: 'Özet Piramidi',
    rules:
      '1. En genel fikir tepede, detaylar altta\n2. 3-4 seviyeli piramit\n3. Pedagojik not: Özetleme becerisinin gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'levelCount',
          type: 'number',
          label: 'Seviye Sayısı',
          defaultValue: 3,
          description: 'Piramit kaç seviyeli olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_PREDICTION_BOARD,
    name: 'Tahmin Panosu',
    rules:
      '1. Metne dayalı tahminler yap\n2. Her tahmin için gerekçe yaz\n3. En az 3 tahmin\n4. Pedagojik not: Tahmin becerisinin okumaya katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'predictionCount',
          type: 'number',
          label: 'Tahmin Sayısı',
          defaultValue: 3,
          description: 'Kaç tahmin yapılsın?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_COMPARE_TEXTS,
    name: 'Metin Karşılaştırma',
    rules:
      '1. İki metni karşılaştır\n2. Benzerlik ve farklılıkları yaz\n3. Pedagojik not: Karşılaştırmalı okumanın gelişime katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'criteria',
          type: 'string',
          label: 'Karşılaştırma Kriteri',
          defaultValue: 'tema',
          description: 'Hangi açıdan karşılaştırılsın?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_THEME_WEB,
    name: 'Tema Ağı',
    rules:
      '1. Ana tema merkezde, alt temalar dallarda\n2. En az 4 alt tema\n3. Pedagojik not: Tema analizi okuma anlamaya katkı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'subThemeCount',
          type: 'number',
          label: 'Alt Tema Sayısı',
          defaultValue: 4,
          description: 'Kaç alt tema olsun?',
        },
      ],
    },
  },

  // Kat 3: Okuma & Dil (10)
  {
    type: ActivityType.INFOGRAPHIC_SYLLABLE_MAP,
    name: 'Hece Ağacı',
    rules:
      '1. Kelimeleri hecelerine ayır\n2. Her heceyi ağaç yapısında göster\n3. En az 5 kelime\n4. Pedagojik not: Hece bilincinin okumaya katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'wordCount',
          type: 'number',
          label: 'Kelime Sayısı',
          defaultValue: 5,
          description: 'Kaç kelime hecelensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_WORD_FAMILY,
    name: 'Sözcük Ailesi',
    rules:
      '1. Kök kelimeden türeyen kelimeleri göster\n2. En az 4 türemiş kelime\n3. Pedagojik not: Kelime ailesi çalışmasının sözcük dağarcığına katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'derivationCount',
          type: 'number',
          label: 'Türetme Sayısı',
          defaultValue: 4,
          description: 'Kaç türemiş kelime gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SENTENCE_BUILDER,
    name: 'Cümle İnşası',
    rules:
      '1. Verilen kelimelerle cümle kur\n2. Özne-yüklem-nesne yapısını göster\n3. En az 3 cümle\n4. Pedagojik not: Cümle kurma becerisinin gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'sentenceCount',
          type: 'number',
          label: 'Cümle Sayısı',
          defaultValue: 3,
          description: 'Kaç cümle kurulsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_VOCAB_TREE,
    name: 'Kelime Haritası',
    rules:
      '1. Kelimenin anlamı, eş anlamlısı, zıt anlamlısı\n2. Örnek cümle ekle\n3. Pedagojik not: Kelime haritasının sözcük dağarcığına katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'wordCount',
          type: 'number',
          label: 'Kelime Sayısı',
          defaultValue: 5,
          description: 'Kaç kelime işlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_PREFIX_SUFFIX,
    name: 'Fonem Izgarası',
    rules:
      '1. Sesleri harflerle eşleştir\n2. Benzer sesleri grupla\n3. Pedagojik not: Fonem farkındalığının okumaya katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'phonemeCount',
          type: 'number',
          label: 'Fonem Sayısı',
          defaultValue: 6,
          description: 'Kaç fonem işlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ANTONYM_SYNONYM,
    name: 'Dilbilgisi Ağacı',
    rules:
      '1. Cümlenin dilbilgisi yapısını ağaç olarak göster\n2. Özne, yüklem, nesne, tümleç dalları\n3. Pedagojik not: Dilbilgisi analizi yazmaya katkı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'sentenceCount',
          type: 'number',
          label: 'Cümle Sayısı',
          defaultValue: 2,
          description: 'Kaç cümle analiz edilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_WORD_ORIGIN,
    name: 'Yazım Kuralları Tablosu',
    rules:
      '1. Yazım kurallarını örneklerle göster\n2. Doğru/Yanlış karşılaştırması\n3. En az 5 kural\n4. Pedagojik not: Yazım kurallarının önemi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'ruleCount',
          type: 'number',
          label: 'Kural Sayısı',
          defaultValue: 5,
          description: 'Kaç kural gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_COMPOUND_WORD,
    name: 'Noktalama Rehberi',
    rules:
      '1. Noktalama işaretlerini kullanım örnekleriyle göster\n2. En az 5 işaret\n3. Pedagojik not: Noktalama bilincinin okumaya katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'signCount',
          type: 'number',
          label: 'İşaret Sayısı',
          defaultValue: 5,
          description: 'Kaç noktalama işareti gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_GENRE_CHART,
    name: 'Yazma Planı',
    rules:
      '1. Yazma sürecini adım adım planla\n2. Giriş-Gelişme-Sonuç yapısı\n3. Pedagojik not: Planlı yazmanın kaliteye etkisi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stepCount',
          type: 'number',
          label: 'Adım Sayısı',
          defaultValue: 5,
          description: 'Yazma planı kaç adımlı olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_MATH_STEPS,
    name: 'Matematik Adımları',
    rules:
      '1. Şiirin teması, duygusu, imgeleri\n2. Kafiye şeması\n3. Pedagojik not: Şiir analizi duygusal zekaya katkı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeRhyme',
          type: 'boolean',
          label: 'Kafiye Şeması',
          defaultValue: true,
          description: 'Kafiye şeması gösterilsin mi?',
        },
      ],
    },
  },

  // Kat 4: Matematik & Mantık (10)
  {
    type: ActivityType.INFOGRAPHIC_NUMBER_LINE,
    name: 'Sayı Doğrusu',
    rules:
      '1. Sayı doğrusu üzerinde sayıları göster\n2. İşlemleri oklarla belirt\n3. Pedagojik not: Sayı doğrusunun sayı hissine katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'range',
          type: 'number',
          label: 'Aralık',
          defaultValue: 20,
          description: 'Sayı doğrusu kaç sayıyı göstersin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_FRACTION_VISUAL,
    name: 'Kesir Görselleştirme',
    rules:
      '1. Kesirleri pasta/dikdörtgen modeliyle göster\n2. En az 3 kesir\n3. Pedagojik not: Görsel kesir modelinin anlamaya katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'fractionCount',
          type: 'number',
          label: 'Kesir Sayısı',
          defaultValue: 3,
          description: 'Kaç kesir gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_GEOMETRY_EXPLORER,
    name: 'Geometrik Şekiller',
    rules:
      '1. Şekillerin özelliklerini tablo halinde göster\n2. Kenar, açı, simetri bilgisi\n3. Pedagojik not: Geometri farkındalığının gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'shapeCount',
          type: 'number',
          label: 'Şekil Sayısı',
          defaultValue: 4,
          description: 'Kaç geometrik şekil gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_MEASUREMENT_GUIDE,
    name: 'Ölçü Dönüştürme Tablosu',
    rules:
      '1. Ölçü birimleri arası dönüşümleri göster\n2. Örnek hesaplamalar ekle\n3. Pedagojik not: Ölçü bilincinin günlük yaşama katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'unitCount',
          type: 'number',
          label: 'Birim Sayısı',
          defaultValue: 4,
          description: 'Kaç ölçü birimi gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_PATTERN_RULE,
    name: 'Desen Tasarımı',
    rules:
      '1. Desen örüntüsü oluştur\n2. Devamını öğrenci tamamlasın\n3. Pedagojik not: Örüntü tanımanın matematiksel düşünmeye katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'patternLength',
          type: 'number',
          label: 'Desen Uzunluğu',
          defaultValue: 6,
          description: 'Desen kaç elemanlı olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_DATA_CHART,
    name: 'Veri Grafiği',
    rules:
      '1. Verileri çubuk/pasta grafiği olarak göster\n2. Yorum soruları ekle\n3. Pedagojik not: Veri okuryazarlığının gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'dataPoints',
          type: 'number',
          label: 'Veri Noktası',
          defaultValue: 5,
          description: 'Kaç veri noktası olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ALGEBRA_BALANCE,
    name: 'Matematik Hikayesi',
    rules:
      '1. Matematiksel durumu hikaye olarak anlat\n2. Adım adım çözüm yolu göster\n3. Pedagojik not: Hikayeleştirilmiş matematiğin motivasyona etkisi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stepCount',
          type: 'number',
          label: 'Çözüm Adımı',
          defaultValue: 4,
          description: 'Çözüm kaç adımda gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_WORD_PROBLEM_MAP,
    name: 'Simetri Izgarası',
    rules:
      '1. Simetri eksenini göster\n2. Yarım şekli tamamla etkinliği\n3. Pedagojik not: Simetri algısının görsel gelişime katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'gridSize',
          type: 'number',
          label: 'Izgara Boyutu',
          defaultValue: 4,
          description: 'Izgara kaçx kaç olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SUMMARY_PYRAMID,
    name: 'Zaman ve Saat',
    rules:
      '1. Saat okuma etkinlikleri\n2. Zaman çizelgesi\n3. Pedagojik not: Zaman kavramının gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'eventCount',
          type: 'number',
          label: 'Etkinlik Sayısı',
          defaultValue: 4,
          description: 'Kaç zaman etkinliği olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_PREDICTION_BOARD,
    name: 'Para Matematiği',
    rules:
      '1. Para üstü, toplama, çıkarma problemleri\n2. Gerçek yaşam senaryoları\n3. Pedagojik not: Finansal okuryazarlık temeli (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'problemCount',
          type: 'number',
          label: 'Problem Sayısı',
          defaultValue: 3,
          description: 'Kaç para problemi olsun?',
        },
      ],
    },
  },

  // Kat 5: Fen Bilimleri (8)
  {
    type: ActivityType.INFOGRAPHIC_LIFE_CYCLE,
    name: 'Yaşam Döngüsü',
    rules:
      '1. Canlının yaşam evrelerini sırayla göster\n2. En az 4 evre\n3. Pedagojik not: Yaşam döngüsü bilincinin doğa anlayışına katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stageCount',
          type: 'number',
          label: 'Evre Sayısı',
          defaultValue: 4,
          description: 'Kaç yaşam evresi gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_FOOD_CHAIN,
    name: 'Besin Zinciri',
    rules:
      '1. Üretici-tüketici-ayrıştırıcı zincirini göster\n2. Oklarla enerji akışını belirt\n3. Pedagojik not: Ekosistem farkındalığı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'linkCount',
          type: 'number',
          label: 'Zincir Halkası',
          defaultValue: 4,
          description: 'Besin zinciri kaç halkalı olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SCIENTIFIC_METHOD,
    name: 'Su Döngüsü',
    rules:
      '1. Buharlaşma-yoğuşma-yağış-toplanma döngüsünü göster\n2. Her evreyi açıkla\n3. Pedagojik not: Su döngüsü bilincinin çevre farkındalığına katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeDetails',
          type: 'boolean',
          label: 'Detaylı Açıklama',
          defaultValue: true,
          description: 'Her evre detaylı açıklansın mı?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SOLAR_SYSTEM,
    name: 'Güneş Sistemi',
    rules:
      '1. Gezegenleri sırayla göster\n2. Her gezegenin temel özelliğini yaz\n3. Pedagojik not: Uzay farkındalığının bilimsel düşünceye katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeDwarf',
          type: 'boolean',
          label: 'Cüce Gezegenler',
          defaultValue: false,
          description: 'Cüce gezegenler de gösterilsin mi?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_CELL_DIAGRAM,
    name: 'Bitki Bölümleri',
    rules:
      '1. Bitkinin kök-gövde-yaprak-çiçek bölümlerini göster\n2. Her bölümün görevini yaz\n3. Pedagojik not: Bitki biyolojisi farkındalığı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeFunctions',
          type: 'boolean',
          label: 'Görev Açıklaması',
          defaultValue: true,
          description: 'Her bölümün görevi yazılsın mı?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ECOSYSTEM_WEB,
    name: 'Hayvan Sınıflandırma',
    rules:
      '1. Hayvanları grupla (memeli, kuş, balık, sürüngen, amfibyen)\n2. Her gruptan örnek ver\n3. Pedagojik not: Sınıflandırma becerisinin bilimsel düşünceye katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'groupCount',
          type: 'number',
          label: 'Grup Sayısı',
          defaultValue: 5,
          description: 'Kaç hayvan grubu gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_STATES_MATTER,
    name: 'Deney Basamakları',
    rules:
      '1. Deney adımlarını sırayla yaz\n2. Malzeme listesi ekle\n3. Pedagojik not: Bilimsel yöntem farkındalığı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stepCount',
          type: 'number',
          label: 'Adım Sayısı',
          defaultValue: 5,
          description: 'Deney kaç adımlı olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_HUMAN_BODY,
    name: 'Enerji Türleri',
    rules:
      '1. Enerji türlerini örneklerle göster\n2. Dönüşümlerini oklarla belirt\n3. Pedagojik not: Enerji farkındalığının fen okuryazarlığına katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'energyCount',
          type: 'number',
          label: 'Enerji Türü Sayısı',
          defaultValue: 5,
          description: 'Kaç enerji türü gösterilsin?',
        },
      ],
    },
  },

  // Kat 6: Sosyal Bilgiler (8)
  {
    type: ActivityType.INFOGRAPHIC_TIMELINE_EVENT,
    name: 'Tarih Zaman Çizelgesi',
    rules:
      '1. Olayları kronolojik sırayla göster\n2. Her olay için tarih ve kısa açıklama\n3. Pedagojik not: Zaman algısının tarih bilincine katkısı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'eventCount',
          type: 'number',
          label: 'Olay Sayısı',
          defaultValue: 5,
          description: 'Kaç olay gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_MAP_EXPLORER,
    name: 'Harita Okuma',
    rules:
      '1. Harita sembollerini ve anlamlarını göster\n2. Yön, ölçek, lejant bilgisi\n3. Pedagojik not: Mekansal okuryazarlık gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'symbolCount',
          type: 'number',
          label: 'Sembol Sayısı',
          defaultValue: 6,
          description: 'Kaç harita sembolü gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_CULTURE_COMPARE,
    name: 'Kültür Ağı',
    rules:
      '1. Kültür unsurlarını ağ yapısında göster\n2. Gelenekler, bayramlar, yemekler, giysiler\n3. Pedagojik not: Kültürel farkındalık gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'elementCount',
          type: 'number',
          label: 'Unsur Sayısı',
          defaultValue: 5,
          description: 'Kaç kültür unsuru gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_GOVERNMENT_CHART,
    name: 'Toplumda Roller',
    rules:
      '1. Toplum bireylerinin rollerini göster\n2. Meslekler ve görevleri\n3. Pedagojik not: Sosyal sorumluluk bilinci (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'roleCount',
          type: 'number',
          label: 'Rol Sayısı',
          defaultValue: 5,
          description: 'Kaç toplum rolü gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_GEOGRAPHY_PROFILE,
    name: 'Coğrafya Bilgileri',
    rules:
      '1. Bölge özelliklerini tablo halinde göster\n2. İklim, nüfus, ekonomik faaliyetler\n3. Pedagojik not: Coğrafi okuryazarlık gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'regionCount',
          type: 'number',
          label: 'Bölge Sayısı',
          defaultValue: 3,
          description: 'Kaç bölge karşılaştırılsın?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_EVENT_ANALYSIS,
    name: 'Yönetim Yapısı',
    rules:
      '1. Yönetim organlarını hiyerarşik göster\n2. Görev ve sorumlulukları yaz\n3. Pedagojik not: Vatandaşlık bilinci gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'levelCount',
          type: 'number',
          label: 'Seviye Sayısı',
          defaultValue: 3,
          description: 'Yönetim yapısı kaç seviyeli gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ECONOMIC_FLOW,
    name: 'Ekonomi Döngüsü',
    rules:
      '1. Üretim-tüketim-tasarruf döngüsünü göster\n2. Basit ekonomik kavramlar\n3. Pedagojik not: Ekonomik okuryazarlık temeli (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stageCount',
          type: 'number',
          label: 'Aşama Sayısı',
          defaultValue: 4,
          description: 'Ekonomi döngüsü kaç aşamalı olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_BIOGRAPHY_BOARD,
    name: 'Kahraman Zaman Çizelgesi',
    rules:
      '1. Önemli kişinin hayat olaylarını kronolojik göster\n2. Her olayın önemini belirt\n3. Pedagojik not: Rol model farkındalığı (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'eventCount',
          type: 'number',
          label: 'Olay Sayısı',
          defaultValue: 5,
          description: 'Kaç hayat olayı gösterilsin?',
        },
      ],
    },
  },

  // Kat 7: Yaratıcı Düşünme (8)
  {
    type: ActivityType.INFOGRAPHIC_BRAINSTORM_WEB,
    name: 'Beyin Fırtınası Ağı',
    rules:
      '1. Merkez fikir etrafında serbest çağrışım\n2. En az 6 dal\n3. Pedagojik not: Yaratıcı düşünce gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'branchCount',
          type: 'number',
          label: 'Dal Sayısı',
          defaultValue: 6,
          description: 'Kaç dal oluşturulsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SCAMPER,
    name: 'SCAMPER Tekniği',
    rules:
      '1. SCAMPER basamaklarını uygula (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse)\n2. Her basamak için örnek ver\n3. Pedagojik not: Yaratıcı problem çözme (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeAll',
          type: 'boolean',
          label: 'Tüm Basamaklar',
          defaultValue: true,
          description: '7 basamak da dahil edilsin mi?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ASSOCIATIONS,
    name: 'Düşünme Şapkaları',
    rules:
      '1. 6 düşünme şapkasını göster\n2. Her şapka için örnek düşünce\n3. Pedagojik not: Çok yönlü düşünme becerisi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeAll',
          type: 'boolean',
          label: 'Tüm Şapkalar',
          defaultValue: true,
          description: '6 şapka da gösterilsin mi?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ROLE_PLAY_SCENARIO,
    name: 'Zihin Boşaltma',
    rules:
      '1. Konuyla ilgili tüm fikirleri serbest yaz\n2. Sonra grupla ve önceliklendir\n3. Pedagojik not: Fikir üretme becerisi gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'ideaCount',
          type: 'number',
          label: 'Fikir Sayısı',
          defaultValue: 8,
          description: 'En az kaç fikir üretilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_FUTURE_VISION,
    name: 'Yaratıcı Yazma İstemi',
    rules:
      '1. Yaratıcı yazma için istem cümleleri üret\n2. En az 3 istem\n3. Pedagojik not: Yaratıcı yazma becerisi gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'promptCount',
          type: 'number',
          label: 'İstem Sayısı',
          defaultValue: 3,
          description: 'Kaç yazma istemi oluşturulsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_DESIGN_THINKING,
    name: 'Tasarım Meydan Okuması',
    rules:
      '1. Tasarım problemi ve kısıtları tanımla\n2. Çözüm önerileri için alan bırak\n3. Pedagojik not: Tasarım düşünce becerisi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'constraintCount',
          type: 'number',
          label: 'Kısıt Sayısı',
          defaultValue: 3,
          description: 'Kaç tasarım kısıtı belirlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ALTERNATIVE_ENDS,
    name: 'Analoji Haritası',
    rules:
      '1. İki farklı alan arasında benzerlik kur\n2. En az 3 analoji\n3. Pedagojik not: Analojik düşünce soyutlamayı geliştirir (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'analogyCount',
          type: 'number',
          label: 'Analoji Sayısı',
          defaultValue: 3,
          description: 'Kaç analoji kurulsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_INVENTION_PLAN,
    name: 'Buluş Planı',
    rules:
      '1. Sorun tanımla, çözüm öner, prototip planla\n2. Adım adım buluş süreci\n3. Pedagojik not: İcat etme becerisi girişimciliği destekler (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stepCount',
          type: 'number',
          label: 'Adım Sayısı',
          defaultValue: 5,
          description: 'Buluş süreci kaç adımlı olsun?',
        },
      ],
    },
  },

  // Kat 8: Öğrenme Stratejileri (8)
  {
    type: ActivityType.INFOGRAPHIC_NOTE_TAKING,
    name: 'Cornell Not Alma',
    rules:
      '1. Cornell not formatında bölümler oluştur\n2. Anahtar kelimeler, notlar, özet\n3. Pedagojik not: Etkili not alma stratejisi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeSummary',
          type: 'boolean',
          label: 'Özet Bölümü',
          defaultValue: true,
          description: 'Özet bölümü dahil edilsin mi?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_TEST_PREPARATION,
    name: 'KWL Tablosu',
    rules:
      '1. Ne Biliyorum, Ne Öğrenmek İstiyorum, Ne Öğrendim sütunları\n2. Her sütuna en az 3 madde\n3. Pedagojik not: Üstbilişsel farkındalık gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'itemPerColumn',
          type: 'number',
          label: 'Sütun Başına Madde',
          defaultValue: 3,
          description: 'Her sütunda kaç madde olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_STUDY_PLAN,
    name: 'Çalışma Planı',
    rules:
      '1. Haftalık/daily çalışma programı oluştur\n2. Ders, süre, molalar\n3. Pedagojik not: Zaman yönetimi becerisi gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'dayCount',
          type: 'number',
          label: 'Gün Sayısı',
          defaultValue: 5,
          description: 'Kaç günlük plan oluşturulsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_TIME_MANAGEMENT,
    name: 'Zaman ve Saat',
    rules:
      '1. Saat okuma etkinlikleri\n2. Zaman çizelgesi\n3. Pedagojik not: Zaman kavramının gelişimi (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'eventCount',
          type: 'number',
          label: 'Etkinlik Sayısı',
          defaultValue: 4,
          description: 'Kaç zaman etkinliği olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_GOAL_SETTING,
    name: 'Para Matematiği',
    rules:
      '1. Para üstü, toplama, çıkarma problemleri\n2. Gerçek yaşam senaryoları\n3. Pedagojik not: Finansal okuryazarlık temeli (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'problemCount',
          type: 'number',
          label: 'Problem Sayısı',
          defaultValue: 3,
          description: 'Kaç para problemi olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SELF_REFLECTION,
    name: 'Hedef Takip',
    rules:
      '1. SMART hedefler belirle\n2. İlerleme göstergesi ekle\n3. Pedagojik not: Hedef belirleme motivasyonu artırır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'goalCount',
          type: 'number',
          label: 'Hedef Sayısı',
          defaultValue: 3,
          description: 'Kaç hedef belirlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_MOTIVATION_BOARD,
    name: 'Öz Değerlendirme',
    rules:
      '1. Öğrencinin kendini değerlendirmesi için kriterler\n2. Radar veya puanlama skalası\n3. Pedagojik not: Öz değerlendirme üstbilişsel beceridir (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'criteriaCount',
          type: 'number',
          label: 'Kriter Sayısı',
          defaultValue: 5,
          description: 'Kaç değerlendirme kriteri olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_NOTE_TAKING,
    name: 'Yansıtma Günlüğü',
    rules:
      '1. Günlük yansıtma soruları oluştur\n2. Ne öğrendim, ne hissettim, ne yapacağım\n3. Pedagojik not: Yansıtıcı düşünme öğrenmeyi derinleştirir (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'questionCount',
          type: 'number',
          label: 'Soru Sayısı',
          defaultValue: 4,
          description: 'Kaç yansıtma sorusu oluşturulsun?',
        },
      ],
    },
  },

  // Kat 9: SpLD Destek (10)
  {
    type: ActivityType.INFOGRAPHIC_DYSLEXIA_READING,
    name: 'Okuma Cetveli',
    rules:
      '1. Satır takibi için görsel cetvel tasarla\n2. Renkli overlay efekti\n3. Pedagojik not: Okuma cetveli satır takibini kolaylaştırır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'lineCount',
          type: 'number',
          label: 'Satır Sayısı',
          defaultValue: 5,
          description: 'Kaç satır gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_DYSGRAPHIA_WRITING,
    name: 'Renk Kaplama',
    rules:
      '1. Farklı renk kaplamalarının okumaya etkisini göster\n2. En az 3 renk seçeneği\n3. Pedagojik not: Renk kaplaması disleksi okuma konforunu artırır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'colorCount',
          type: 'number',
          label: 'Renk Sayısı',
          defaultValue: 3,
          description: 'Kaç renk seçeneği gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_DYSCALCULIA_MATH,
    name: 'Fonik Haritası',
    rules:
      '1. Harf-ses eşleştirmelerini göster\n2. En az 6 harf-ses çifti\n3. Pedagojik not: Fonik farkındalık okuma becerisinin temelidir (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'pairCount',
          type: 'number',
          label: 'Çift Sayısı',
          defaultValue: 6,
          description: 'Kaç harf-ses çifti gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ADHD_FOCUS,
    name: 'Görsel Program',
    rules:
      '1. Günlük programı görsel ikonlarla göster\n2. En az 5 etkinlik\n3. Pedagojik not: Görsel program DEHB dikkat düzenlemesine yardımcı olur (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'activityCount',
          type: 'number',
          label: 'Etkinlik Sayısı',
          defaultValue: 5,
          description: 'Kaç etkinlik gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_EXECUTIVE_FUNCTION,
    name: 'Görev Parçalama',
    rules:
      '1. Karmaşık görevi küçük adımlara böl\n2. En az 4 adım\n3. Pedagojik not: Görev parçalama DEHB yürütücü işlevleri destekler (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stepCount',
          type: 'number',
          label: 'Adım Sayısı',
          defaultValue: 4,
          description: 'Görev kaç adıma bölünsün?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SENSORY_INTEGRATION,
    name: 'Çok Duyulu Öğrenme',
    rules:
      '1. Görsel-işitsel-dokunsal öğrenme yollarını göster\n2. Her duyuya yönelik etkinlik öner\n3. Pedagojik not: Çok duyulu yaklaşım SpLD öğrencilerine etkilidir (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'senseCount',
          type: 'number',
          label: 'Duyu Sayısı',
          defaultValue: 3,
          description: 'Kaç duyu yolu kullanılsın?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_EMOTION_GAUGE,
    name: 'Duygu Ölçer',
    rules:
      '1. Duygu durumunu görsel ölçekle göster\n2. En az 5 duygu seviyesi\n3. Pedagojik not: Duygu farkındalığı öz düzenlemeyi destekler (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'emotionCount',
          type: 'number',
          label: 'Duygu Sayısı',
          defaultValue: 5,
          description: 'Kaç duygu gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SOCIAL_SKILLS,
    name: 'Odaklanma Araçları',
    rules:
      '1. Dikkat artırıcı stratejileri listele\n2. Her araç için kısa açıklama\n3. Pedagojik not: Odaklanma araçları DEHB semptomlarını yönetmeye yardımcı olur (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'toolCount',
          type: 'number',
          label: 'Araç Sayısı',
          defaultValue: 5,
          description: 'Kaç odaklanma aracı gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ROUTINE_BUILDER,
    name: 'Güçlü Yönler Çarkı',
    rules:
      '1. Öğrencinin güçlü yönlerini çark halinde göster\n2. En az 6 alan\n3. Pedagojik not: Güçlü yön farkındalığı özgüveni artırır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'areaCount',
          type: 'number',
          label: 'Alan Sayısı',
          defaultValue: 6,
          description: 'Kaç güçlü yön alanı gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ANXIETY_RELIEF,
    name: 'Sakinleşme Planı',
    rules:
      '1. Stres anında uygulanacak adımlar\n2. Nefes egzersizi, sayma, görselleştirme\n3. Pedagojik not: Öz düzenleme becerisi duygusal sağlığı destekler (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stepCount',
          type: 'number',
          label: 'Adım Sayısı',
          defaultValue: 4,
          description: 'Sakinleşme planı kaç adımlı olsun?',
        },
      ],
    },
  },

  // Kat 10: Klinik & BEP (12)
  {
    type: ActivityType.INFOGRAPHIC_BEP_GOAL_MAP,
    name: 'BEP Hedefleri',
    rules:
      '1. SMART formatında BEP hedefleri yaz\n2. Domain, hedef, tarih, destek stratejileri\n3. Pedagojik not: BEP hedefleri bireyselleştirilmiş eğitimin temelidir (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'goalCount',
          type: 'number',
          label: 'Hedef Sayısı',
          defaultValue: 3,
          description: 'Kaç BEP hedefi belirlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_IEP_PROGRESS,
    name: 'İlerleme İzleme',
    rules:
      '1. Hedeflere yönelik ilerleme göstergesi\n2. Başlangıç-şimdiki-hedef seviyeleri\n3. Pedagojik not: İlerleme izleme veriye dayalı karar vermeyi sağlar (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'metricCount',
          type: 'number',
          label: 'Metrik Sayısı',
          defaultValue: 4,
          description: 'Kaç ilerleme metriği izlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_OBSERVATION_MATRIX,
    name: 'Davranış Çizelgesi',
    rules:
      '1. Hedef davranışları ve gözlem verilerini göster\n2. Günlük/haftalık takip\n3. Pedagojik not: Davranış izleme pozitif pekiştirmeyi destekler (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'behaviorCount',
          type: 'number',
          label: 'Davranış Sayısı',
          defaultValue: 3,
          description: 'Kaç davranış izlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_COGNITIVE_PROFILE,
    name: 'Müdahale Planı',
    rules:
      '1. Müdahale stratejilerini adım adım yaz\n2. Sorun, strateji, süre, değerlendirme\n3. Pedagojik not: Erken müdahale öğrenme güçlüklerini azaltır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'strategyCount',
          type: 'number',
          label: 'Strateji Sayısı',
          defaultValue: 3,
          description: 'Kaç müdahale stratejisi belirlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_BEHAVIOR_INTERVENTION,
    name: 'Beceri Açığı Analizi',
    rules:
      '1. Beklenen ve mevcut beceri seviyesini karşılaştır\n2. Radar grafik formatında göster\n3. Pedagojik not: Beceri açığı analizi hedef belirlemeyi kolaylaştırır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'skillCount',
          type: 'number',
          label: 'Beceri Sayısı',
          defaultValue: 5,
          description: 'Kaç beceri analiz edilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_ACCOMMODATION_LIST,
    name: 'Uarlama Listesi',
    rules:
      '1. Öğrenciye sağlanacak uyarlamaları listele\n2. Sınav, ödev, sınıf içi uyarlamalar\n3. Pedagojik not: Uyarlama eşit öğrenme fırsatı sağlar (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'accommodationCount',
          type: 'number',
          label: 'Uyarlama Sayısı',
          defaultValue: 5,
          description: 'Kaç uyarlama belirlensin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_TRANSITION_PLAN,
    name: 'Geçiş Planı',
    rules:
      '1. Sınıf/okul geçişi için hazırlık adımları\n2. Duygusal ve akademik hazırlık\n3. Pedagojik not: Geçiş planı belirsizlik kaygısını azaltır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'stepCount',
          type: 'number',
          label: 'Adım Sayısı',
          defaultValue: 5,
          description: 'Geçiş planı kaç adımlı olsun?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SENSORY_DIET,
    name: 'İş Birliği Haritası',
    rules:
      '1. Öğretmen-aile-uzman iş birliği ağını göster\n2. Her rolün sorumluluğunu belirt\n3. Pedagojik not: İş birliği öğrenci başarısını artırır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'roleCount',
          type: 'number',
          label: 'Rol Sayısı',
          defaultValue: 4,
          description: 'Kaç iş birliği rolü gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_SPEECH_THERAPY_TARGET,
    name: 'Değerlendirme Özeti',
    rules:
      '1. Değerlendirme sonuçlarını özetle\n2. Güçlü ve gelişim alanları\n3. Pedagojik not: Değerlendirme özeti bütünsel bakış sağlar (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'domainCount',
          type: 'number',
          label: 'Alan Sayısı',
          defaultValue: 4,
          description: 'Kaç değerlendirme alanı gösterilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_PARENT_GUIDE,
    name: 'Aile Rehberi',
    rules:
      '1. Ailelere yönelik destek önerileri\n2. Evde uygulanabilecek stratejiler\n3. Pedagojik not: Aile katılımı öğrenci başarısını önemli ölçüde artırır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'tipCount',
          type: 'number',
          label: 'Öneri Sayısı',
          defaultValue: 5,
          description: 'Kaç aile önerisi verilsin?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_MOTOR_SKILLS,
    name: 'RTI Katmanları',
    rules:
      '1. RTI (Response to Intervention) 3 katmanını göster\n2. Her katmanda destek düzeyini belirt\n3. Pedagojik not: RTI modeli erken müdahale için kanıta dayalıdır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeData',
          type: 'boolean',
          label: 'Veri Desteği',
          defaultValue: true,
          description: 'Her katman için veri örnekleri eklensin mi?',
        },
      ],
    },
  },
  {
    type: ActivityType.INFOGRAPHIC_EVALUATION_SUMMARY,
    name: 'BEP Özet Raporu',
    rules:
      '1. BEP özetini tek sayfada göster\n2. Mevcut seviye, hedefler, destekler, değerlendirme\n3. Pedagojik not: BEP özeti ekip iletişimini kolaylaştırır (min 100 kelime)',
    schema: {
      parameters: [
        {
          name: 'includeTimeline',
          type: 'boolean',
          label: 'Zaman Çizelgesi',
          defaultValue: true,
          description: 'Hedef zaman çizelgesi eklensin mi?',
        },
      ],
    },
  },
];

// ── FACTORY: Create Generator Pair from Definition ───────────────────────────

function createGeneratorPair(def: ActivityDefinition): InfographicGeneratorPair {
  return {
    activityType: def.type,
    aiGenerator: (params: UltraCustomizationParams) =>
      generateInfographic_Generic_AI(def.name, params, def.rules),
    offlineGenerator: (params: UltraCustomizationParams) =>
      generateInfographic_Generic_Offline(def.name, params),
    customizationSchema: def.schema,
  };
}

// ── EXPORT ALL 84 GENERATORS ─────────────────────────────────────────────────

export const INFOGRAPHIC_ADAPTERS_REMAINING_84: Record<string, InfographicGeneratorPair> =
  Object.fromEntries(
    ACTIVITY_DEFINITIONS.map((def) => [def.type, createGeneratorPair(def)])
  ) as Record<string, InfographicGeneratorPair>;

// Total count verification
export const TOTAL_INFOGRAPHIC_ADAPTERS = 10 + ACTIVITY_DEFINITIONS.length; // 10 + 84 = 94
