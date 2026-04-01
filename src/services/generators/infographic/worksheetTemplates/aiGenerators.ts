/**
 * aiGenerators.ts — AI destekli etkinlik üreticileri
 * Konu bazlı, bağlamsal içerik gerektiren şablonlar için Gemini 2.5 Flash kullanır.
 *
 * Selin Arslan: gemini-2.5-flash sabit, prompt yapısı ROL+HEDEF+KISIT+ÇIKTI
 */

import { generateCreativeMultimodal } from '../../../geminiClient';
import { AppError } from '../../../../utils/AppError';
import type {
  WorksheetActivityData,
  WorksheetGeneratorParams,
  WorksheetGeneratorFn,
  WorksheetTemplateType,
  WorksheetActivityCategory,
} from '../../../../types/worksheetActivity';

const SYSTEM_INSTRUCTION = `Sen Oogmatik platformunun "Etkinlik Oluşturucu Stüdyosu" baş pedagojik tasarımcısı ve uzman özel eğitim zeka motorusun.
Görevin: Öğrencinin KALEMLE yazıp çizeceği, boyayacağı ve bizzat üstünde çalışacağı PROFESYONEL interaktif çalışma kağıtları tasarlamak.

** PEDAGOJİK VE TASARIM KURALLARI **
1. ZPD (Yakınsal Gelişim Alanı) Uyumlu Zorluk: İlk sorular güven inşası için bariz düzeyde kolay olmalı, kademeli zorlaşmalıdır.
2. Nöro-Mimari Yaklaşım: Sorular arası görsel nefes alma boşlukları planlanmalıdır. Kalabalık görünümlerden kaçın. Yönergeler maksimum 2 kısa cümleden oluşmalıdır.
3. Görsel Hafıza & Motor Beceri Desteği: Etkinlikler sadece okuma değil; eşleştirme, kutucuk doldurma, grid boyama gibi mekanikleri aktif şekilde kullanmalıdır. 
4. Etkinlik Bölümleri (Sections): Her bölümde öğrencinin kalemle işlem yapabileceği net bir format belirlenmelidir ("answerArea").
5. "pedagogicalNote": Bu alan EĞİTMENE özeldir ve etkinlik tasarımının nöropsikolojik arka planını en az 60 kelimeyle bilimsel bir dille açıklamalıdır.
6. HASSASİYET: Tanı koyucu ("disleksisi var"), acıma veya etiketleyici dilden KESİNLİKLE kaçın. "Özel öğrenme desteğine ihtiyacı olan", "görsel işlemleme güçlüğü yaşayan" gibi nötr/betimleyici kavramlar kullan.

** YANIT ALANI (ANSWER AREA) TÜRLERİ **
Ürettiğin \`sections\` array içindeki her objede, soru tipine en uygun \`answerArea.type\` değerini SEÇMELİSİN:
- 'blank-line' -> Öğrencinin yazı yazması gereken sorular (lines = satır sayısı)
- 'blank-box' -> Tek/kısa bir kelime, sayı yazılacak geniş kutular
- 'multiple-choice' -> Test formatı (bunun için options listesini de doldur)
- 'matching-lines' -> İki sütunu birleştireceği sorular (bunun için matchingPairs listesini doldur: [{left, right}])
- 'true-false-check' -> Doğru Yanlış işaretleme soruları
- 'drawing-area' -> Serbest çizim yapması beklenen durumlar
- 'circle-mark' -> Seçeneği veya metni yuvarlak içine alacağı sorular

Senden JSON formatında, çok kaliteli ve eğlenceli bir çalışma yaprağı taslağı dönmen bekleniyor.`;

interface AIGenConfig {
  templateType: WorksheetTemplateType;
  category: WorksheetActivityCategory;
  activityName: string;
  promptDetail: string;
}

function buildSchema() {
  return {
    type: 'OBJECT' as const,
    properties: {
      title: { type: 'STRING' as const },
      generalInstruction: { type: 'STRING' as const },
      pedagogicalNote: { type: 'STRING' as const },
      estimatedDuration: { type: 'NUMBER' as const },
      targetSkills: { type: 'ARRAY' as const, items: { type: 'STRING' as const } },
      sections: {
        type: 'ARRAY' as const,
        items: {
          type: 'OBJECT' as const,
          properties: {
            instruction: { type: 'STRING' as const },
            content: { type: 'STRING' as const },
            options: { type: 'ARRAY' as const, items: { type: 'STRING' as const } },
            correctAnswer: { type: 'STRING' as const },
            matchingPairs: {
              type: 'ARRAY' as const,
              items: {
                type: 'OBJECT' as const,
                properties: {
                  left: { type: 'STRING' as const },
                  right: { type: 'STRING' as const },
                },
                required: ['left', 'right'],
              },
            },
            gridData: {
              type: 'ARRAY' as const,
              items: { type: 'ARRAY' as const, items: { type: 'STRING' as const } },
            },
            answerArea: {
              type: 'OBJECT' as const,
              properties: {
                type: {
                  type: 'STRING' as const,
                  description:
                    "Cevap formatı: 'blank-line', 'blank-box', 'multiple-choice', 'true-false-check', 'matching-lines', 'classification-table', 'drawing-area', 'grid', 'numbering', 'circle-mark'",
                },
                lines: { type: 'NUMBER' as const },
                gridSize: {
                  type: 'OBJECT' as const,
                  properties: {
                    rows: { type: 'NUMBER' as const },
                    cols: { type: 'NUMBER' as const },
                  },
                  required: ['rows', 'cols'],
                },
              },
              required: ['type'],
            },
          },
          required: ['instruction', 'content', 'answerArea'],
        },
      },
    },
    required: ['title', 'generalInstruction', 'pedagogicalNote', 'sections', 'targetSkills'],
  };
}

function createAIWorksheetGenerator(config: AIGenConfig): WorksheetGeneratorFn {
  return async (params: WorksheetGeneratorParams): Promise<WorksheetActivityData> => {
    const userPrompt = `
LÜTFEN ŞU ÖZELLİKLERE SAHİP BİR UYGULAMALI (ÇALIŞMA KAĞIDI) ETKİNLİĞİ TASARLA:

Etkinlik Türü: ${config.activityName}
Öğrenci Yaş Grubu: ${params.ageGroup}
Görev Zorluğu: ${params.difficulty}
Hedef Bilişsel Profil: ${params.profile} (Profil özellikleri: ${params.profile === 'dyslexia' ? 'Görsel kalabalığa duyarlı, kısa ve net yönergeler' : params.profile === 'dyscalculia' ? 'Uzamsal destekli, somut, sayısal bağlam' : params.profile === 'adhd' ? 'Hızlı ödüllendiren, oyunlaştırma ve renklendirme içeren' : 'Genel bilişsel destekli'})
Konu Konsepti / Tema: ${params.topic || 'Çocuğun ilgisini çekecek yaşa uygun eğlenceli ve günlük hayattan bir tema'}
Talep Edilen Madde/Soru Sayısı: ${params.sectionCount}

AYRINTILI GÖREV TANIMI:
${config.promptDetail}

KURALLAR VE BEKLENTİLER:
1. Öğrencinin yaşı ve profiline uygun bir zorluk eğrisi planla. İlk madde aşırı kolay ve özgüven inşa edici olmalıdır.
2. Tam olarak istenen soru sayısında (sections array length = ${params.sectionCount}) veri sağla.
3. Her bir section'ın \`answerArea.type\` alanına etkinliğin doğasına GÖRE EN MANTIKLI arayüz tipini ata: 'blank-line', 'blank-box', 'multiple-choice', 'true-false-check', 'matching-lines', 'classification-table', 'drawing-area', 'circle-mark' veya 'numbering'.
4. "multiple-choice" için mutlaka "options" dizisini doldur. "matching-lines" için mutlaka "matchingPairs" ({left, right}) dizisini doldur.
5. "pedagogicalNote" alanını, eğitimcinin okuyacağı nöropsikolojik arka planla akademik dille tamamla.`;

    try {
      const raw: Record<string, unknown> = await generateCreativeMultimodal({
        prompt: userPrompt,
        systemInstruction: SYSTEM_INSTRUCTION,
        schema: buildSchema(),
        temperature: 0.7,
      });

      const sections = (Array.isArray(raw.sections) ? raw.sections : []).map(
        (s: Record<string, unknown>, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          order: i + 1,
          instruction: String(s.instruction ?? ''),
          content: String(s.content ?? ''),
          options: Array.isArray(s.options) ? s.options.map(String) : undefined,
          correctAnswer: s.correctAnswer ? String(s.correctAnswer) : undefined,
          matchingPairs: Array.isArray(s.matchingPairs) ? s.matchingPairs : undefined,
          gridData: Array.isArray(s.gridData) ? s.gridData : undefined,
          answerArea: s.answerArea || { type: 'blank-line', lines: 2 },
        })
      );

      return {
        title: String(raw.title ?? config.activityName),
        generalInstruction: String(raw.generalInstruction ?? ''),
        templateType: config.templateType,
        category: config.category,
        sections,
        pedagogicalNote: String(raw.pedagogicalNote ?? ''),
        difficultyLevel: params.difficulty,
        targetSkills: Array.isArray(raw.targetSkills) ? raw.targetSkills.map(String) : [],
        ageGroup: params.ageGroup,
        profile: params.profile,
        estimatedDuration: Number(raw.estimatedDuration) || sections.length * 3,
        generationMode: 'ai',
        hasAnswerKey: sections.some((s) => s.correctAnswer !== undefined),
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        'Etkinlik üretimi sırasında hata oluştu. Tekrar deneyin.',
        'GENERATION_ERROR',
        500
      );
    }
  };
}

// ── Okuduğunu Anlama (AI) ─────────────────────────────────────────────────

export const generateFiveWOneHQuestions = createAIWorksheetGenerator({
  templateType: 'five-w-one-h-questions',
  category: 'ws-reading-comprehension',
  activityName: '5N1K Temelli Metin Çözümlemesi',
  promptDetail:
    'Öğrencinin yaş grubunun bilişsel söz dağarcığına uygun (yaklaşık 100-150 kelimelik) özgün, somut ve eğlenceli bir kısa öykü/metin üret (Bunu generalInstruction altına hikaye formatında ekle veya ilk section içeriğine bağla). Metin temelinde "Kim, Ne, Nerede, Ne Zaman, Neden, Nasıl" soruları tasarla. Öğrencinin yanıtları yazacağı "blank-line" alanını kullan. İlk soru tamamen güven verici, metinde cevabı çok bariz olan bir madde olmalıdır.',
});

export const generateFillInBlanks = createAIWorksheetGenerator({
  templateType: 'fill-in-blanks',
  category: 'ws-reading-comprehension',
  activityName: 'Bağlamsal Boşluk Doldurma',
  promptDetail:
    'Gündelik yaşam veya seçilen temanın üzerine anlamlı, mantıksal cümle yapıları üret. Her cümlede temel bir kelimeyi eksik bırak (___ ile göster). answerArea tipini "blank-box" veya "blank-line" olarak seç. Soruların altında seçenek havuzu sunacaksan "options" alanına doldur, sunmayacaksan boş bırak. Cümleler arası semantik bağlantı öğrencinin akıl yürütmesini desteklemeli.',
});

export const generateEventSequencing = createAIWorksheetGenerator({
  templateType: 'event-sequencing',
  category: 'ws-reading-comprehension',
  activityName: 'Kronolojik Olay Sıralama',
  promptDetail:
    'Sebep-sonuç ilişkisine sahip kısa bir süreç hikayesi tasarla (örn. Bir fidanın büyümesi, kek yapımı, sabah rutinleri). Bu hikayedeki olay adımlarını KARIŞTIRARAK sırala. Öğrenciden kutulara (answerArea = "numbering" veya "blank-box") kronolojik numara yazmasını bekle.',
});

export const generateMainIdea = createAIWorksheetGenerator({
  templateType: 'main-idea',
  category: 'ws-reading-comprehension',
  activityName: 'Tema ve Ana Fikir Analizi',
  promptDetail:
    'Kısa, net paragraflar üret. Her paragrafta örtük veya açık bir duygusal, çevresel veya ahlaki tema bulunsun. Öğrenci her metin bloğunun "Ana Fikri"ni "multiple-choice" veya "blank-line" formatında test etmeli.',
});

export const generateInference = createAIWorksheetGenerator({
  templateType: 'inference',
  category: 'ws-reading-comprehension',
  activityName: 'Dedektif Çıkarım Soruları',
  promptDetail:
    'Somut ipuçları barındıran gizemli veya merak uyandıran senaryolar üret. Öğrencinin bu somut durumlardan "Neden böyle olmuş olabilir?" ya da "Sırada ne olacak?" gibi soyut çıkarımlar yapmasını sağla. "multiple-choice", "true-false-check" (D-Y) veya kısa yazma "blank-line" formatlarını çeşitli şekillerde kullan.',
});

export const generateCharacterAnalysis = createAIWorksheetGenerator({
  templateType: 'character-analysis',
  category: 'ws-reading-comprehension',
  activityName: 'Karakter Analizi & Empati',
  promptDetail:
    'Öğrencinin yaş grubunun bilişsel kapasitesine uygun, duygu durumu değişen bir kahraman yarat. Metin içinde karakterin özelliklerini sakla. Sorularda "Karakter ne hissetti?", "Nasıl görünüyordu?" gibi sorular sorarak "drawing-area", "blank-line" veya "multiple-choice" cevap arayüzlerini harmanla.',
});

export const generateCauseEffectMatching = createAIWorksheetGenerator({
  templateType: 'cause-effect-matching',
  category: 'ws-reading-comprehension',
  activityName: 'Sebep - Sonuç Zinciri Eşleştirme',
  promptDetail:
    'Birbirini doğrudan etkileyen olay zincirlerinden oluşan bir "Sebep" ve bir "Sonuç" çiftleri yarat. Bunları "matching-lines" arayüz tipinde öğrenciye sun. "matchingPairs" özelliğini {left, right} objeleri ile mantıksal ama görsel olarak karışık şekilde doldur.',
});

// ── Okuma & Dil (AI destekli olanlar) ──────────────────────────────────────

export const generateSentenceElements = createAIWorksheetGenerator({
  templateType: 'sentence-elements',
  category: 'ws-language-literacy',
  activityName: 'Cümle Yapısı ve Ögeler (Dilbilgisi Laboratuvarı)',
  promptDetail:
    'Kısa, kolay anlaşılır cümleler kur. Yaş grubuna göre "Özne (İş yapan) / Yüklem (Yapılan iş)" gibi kavramlarla öğrencinin "circle-mark" veya "multiple-choice" yöntemiyle kelimenin görevini belirlemesini sağla.',
});

// ── Matematik & Mantık (AI destekli olanlar) ───────────────────────────────

export const generateGraphReading = createAIWorksheetGenerator({
  templateType: 'graph-reading',
  category: 'ws-math-logic',
  activityName: 'Veri Analizi & Grafik Okuma',
  promptDetail:
    'Daha somut bir "Çetele" (Çizgi tablosu) veya "Sıklık" tablosu (örn: Sınıftaki meyve tercihleri) tasarla (generalInstruction içerisinde bunu belirt veya ilk section contentinde tabloyu ASCII karakterlerle/kısa liste ile çiz). Sonrasında öğrencinin bu veriye dayanarak çözeceği "true-false-check", "blank-box" tipi sayısal ve mantıksal sorular sor.',
});

export const generateWordProblem = createAIWorksheetGenerator({
  templateType: 'word-problem',
  category: 'ws-math-logic',
  activityName: 'Hikayeli Problem Çözümü',
  promptDetail:
    'Günlük hayat senaryolarına dayanan (örn: market alışverişi, oyuncak paylaşımı) sadece 1 veya 2 adımdan oluşan problemler üret. Profil diskalkuli ise sayıları küçük (<20) tut. "Verilenler", "İstenenler" ve "Çözüm" bölümlerinin ayrı ayrı belirgin olduğu profesyonel matematiksel bir çalışma sayfası (drawing-area veya blank-box) formatı yarat.',
});

export const generateSyllableSplitting = createAIWorksheetGenerator({
  templateType: 'syllable-splitting',
  category: 'ws-language-literacy',
  activityName: 'Hece Analizi ve Parçalama',
  promptDetail:
    'Öğrencinin yaşına ve bilişsel düzeyine uygun kelimeler seç. Kelimelerin hece sayısını "options" içine yaz, öğrenci hem hecelerine ayırsın hem de sayısını seçsin. "blank-box" formatını kullanarak her hece için ayrı kutu öngör.',
});

export const generateSynonymMatching = createAIWorksheetGenerator({
  templateType: 'synonym-matching',
  category: 'ws-language-literacy',
  activityName: 'Eş Anlamlı Kelime Eşleştirme',
  promptDetail:
    'Verilen konuya/temaya uygun kelime çiftleri (eş anlamlı) oluştur. "matching-lines" kullanarak "matchingPairs" dizisine ({left, right}) ekle.',
});

export const generateAntonymMatching = createAIWorksheetGenerator({
  templateType: 'antonym-matching',
  category: 'ws-language-literacy',
  activityName: 'Zıt Anlamlı Kelime Eşleştirme',
  promptDetail:
    'Verilen konuya/temaya uygun zıt anlamlı kelime çiftleri oluştur. "matching-lines" kullanarak "matchingPairs" dizisine ({left, right}) ekle. Zıt kavramları somutlaştıracak kısa cümleler de instruction içinde verilebilir.',
});

export const generateSpellingRules = createAIWorksheetGenerator({
  templateType: 'spelling-rules',
  category: 'ws-language-literacy',
  activityName: 'Yazım Kuralları Dedektifi',
  promptDetail:
    'Sık yapılan yazım hatalarını içeren eğlenceli ve bağlamsal cümleler üret. Öğrenci cümlenin doğrusunu bulup düzeltecektir. "multiple-choice" veya "blank-line" kullanabilirsin.',
});

export const generateMoneyCalculation = createAIWorksheetGenerator({
  templateType: 'money-calculation',
  category: 'ws-math-logic',
  activityName: 'Para Hesaplama ve Market Alışverişi',
  promptDetail:
    'Gerçek hayat bakkal/market senaryoları kur. "Ödenen Tutar", "Alınan Ürünler" vererek para üstü hesaplama veya bütçe yönetimi senaryoları yarat. "blank-box" veya "drawing-area" kullanarak öğrencinin işlem yapmasını bekle.',
});

export const generateSequencePattern = createAIWorksheetGenerator({
  templateType: 'sequence-pattern',
  category: 'ws-math-logic',
  activityName: 'Görsel ve Sayısal Örüntüler',
  promptDetail:
    'Sayısal artış, azalış veya karmaşık matematiksel seriler oluştur. Eğer görsel istiyorsan, sembollerden (üçgen, kare vb.) oluşan bir dizi kur. Eksik olanı sor. "multiple-choice" veya "blank-box" formatı kullan.',
});

export const generateFillInBlanks = createAIWorksheetGenerator({
  templateType: 'fill-in-blanks',
  category: 'ws-reading-comprehension',
  activityName: 'Boşluk Doldurma',
  promptDetail:
    'Konu hakkında cümleler üret. Her cümlede bir anahtar kelimeyi boşluk (___) olarak bırak. correctAnswer alanına doğru kelimeyi yaz.',
});

export const generateEventSequencing = createAIWorksheetGenerator({
  templateType: 'event-sequencing',
  category: 'ws-reading-comprehension',
  activityName: 'Olay Sıralama',
  promptDetail:
    'Kısa bir hikaye/süreç hikayesi yaz. Olayları KARIŞTIRARAK listele. Öğrenci doğru sıraya koyacak. correctAnswer alanına doğru sıra numarasını yaz.',
});

export const generateMainIdea = createAIWorksheetGenerator({
  templateType: 'main-idea',
  category: 'ws-reading-comprehension',
  activityName: 'Ana Fikir Bulma',
  promptDetail:
    'Kısa paragraflar üret. Öğrenci her paragrafın ana fikrini yazacak. correctAnswer alanına ana fikri yaz.',
});

export const generateInference = createAIWorksheetGenerator({
  templateType: 'inference',
  category: 'ws-reading-comprehension',
  activityName: 'Çıkarım Yapma',
  promptDetail:
    'Dolaylı bilgi içeren kısa metinler üret. Öğrenci metinde açıkça yazılmayan ama çıkarılabilecek bilgiyi yazacak.',
});

export const generateCharacterAnalysis = createAIWorksheetGenerator({
  templateType: 'character-analysis',
  category: 'ws-reading-comprehension',
  activityName: 'Karakter Analizi',
  promptDetail:
    'Kısa bir hikaye üret. Öğrenci karakterin fiziksel, kişilik ve davranış özelliklerini yazacak.',
});

export const generateCauseEffectMatching = createAIWorksheetGenerator({
  templateType: 'cause-effect-matching',
  category: 'ws-reading-comprehension',
  activityName: 'Neden-Sonuç Eşleştirme',
  promptDetail:
    'Neden ve sonuç çiftleri üret. Bunları KARIŞTIR. Öğrenci nedenleri sonuçlarla eşleştirecek.',
});

// ── Okuma & Dil (AI destekli olanlar) ──────────────────────────────────────

export const generateSentenceElements = createAIWorksheetGenerator({
  templateType: 'sentence-elements',
  category: 'ws-language-literacy',
  activityName: 'Cümle Ögesi Bulma',
  promptDetail:
    'Cümleler üret. Öğrenci her cümledeki özne, yüklem, nesne, tümleç gibi ögeleri belirleyecek.',
});

// ── Matematik & Mantık (AI destekli olanlar) ───────────────────────────────

export const generateGraphReading = createAIWorksheetGenerator({
  templateType: 'graph-reading',
  category: 'ws-math-logic',
  activityName: 'Grafik Okuma',
  promptDetail:
    'Bir çubuk/pasta grafik için veri seti üret. Grafiği JSON olarak tanımla. Sonra grafik hakkında sorular sor. Cevaplar MUTLAKA grafik verileriyle tutarlı olmalı.',
});

export const generateWordProblem = createAIWorksheetGenerator({
  templateType: 'word-problem',
  category: 'ws-math-logic',
  activityName: 'Problem Çözme',
  promptDetail:
    'Yaş grubuna uygun sözel matematik problemleri üret. Her problemde "Verilen", "İstenen" belli olsun. correctAnswer\'da MUTLAKA doğru sayısal cevabı yaz.',
});
