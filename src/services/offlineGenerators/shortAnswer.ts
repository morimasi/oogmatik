import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle } from './helpers';
import { SHORT_ANSWER_QUESTION_POOL, GENERIC_QUESTIONS } from './shortAnswerData';

export const generateOfflineShortAnswer = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel Kültür';
  const itemCount = (opts.itemCount as number) || (opts.itemCountShort as number) || 8;
  const activityType = (opts.activityType as ActivityType) || ActivityType.SHORT_ANSWER;

  const topicAliases: Record<string, string> = {
    'Genel Kültür': 'Genel Kültür',
    'Bilim': 'Bilim & Teknoloji',
    'Bilim & Teknoloji': 'Bilim & Teknoloji',
    'Tarih': 'Türk Tarihi',
    'Türk Tarihi': 'Türk Tarihi',
    'Doğa': 'Doğa & Çevre',
    'Doğa & Çevre': 'Doğa & Çevre',
  };
  const resolvedTopic = topicAliases[topic] || topic;

  const legacyLibrary: Record<string, any[]> = {
    'Bilim': [
        { q: "Suyun kimyasal formülü nedir?", a: "H2O", hint: "İki Hidrojen bir Oksijen atomundan oluşur." },
        { q: "Yer çekimi kanununu kim keşfetmiştir?", a: "Isaac Newton", hint: "Başına elma düştüğü rivayet edilir." },
        { q: "Dünyanın tek doğal uydusu nedir?", a: "Ay", hint: "Geceleri gökyüzünde parlak görünür." },
        { q: "Işık hızını yaklaşık olarak söyleyiniz.", a: "300.000 km/s", hint: "Evrendeki en yüksek hızdır." },
        { q: "Vücudumuzdaki kanı pompalayan organ hangisidir?", a: "Kalp", hint: "Göğüs kafesinin solundadır." }
    ],
    'Tarih': [
        { q: "Cumhuriyet ne zaman ilan edildi?", a: "29 Ekim 1923", hint: "Türkiye Cumhuriyeti'nin doğum günü." },
        { q: "İstanbul'u kim fethetmiştir?", a: "Fatih Sultan Mehmet", hint: "1453 yılında gerçekleşti." },
        { q: "Kurtuluş Savaşı'ndaki ilk kongre hangisidir?", a: "Erzurum Kongresi", hint: "Doğu Anadolu'da yapıldı." },
        { q: "Mustafa Kemal Atatürk nerede doğmuştur?", a: "Selanik", hint: "Bugünkü Yunanistan sınırları içindedir." }
    ]
  };

  // Zengin havuz (8'er soru): önce tema havuzu, eksikse legacy kütüphane, yoksa jenerik sorular
  const richPool = (SHORT_ANSWER_QUESTION_POOL as Record<string, { q: string; h: string }[]>)[resolvedTopic];
  let pool: { q: string; a?: string; hint: string }[];
  if (richPool && richPool.length > 0) {
    pool = richPool.map((item) => ({ q: item.q, hint: item.h || '', a: '' }));
  } else {
    const legacyPool = legacyLibrary[topic] || legacyLibrary[resolvedTopic];
    if (legacyPool && legacyPool.length > 0) {
      pool = legacyPool;
    } else {
      pool = (GENERIC_QUESTIONS as string[]).map((q, i) => ({ q, hint: `Konu hakkında düşün: ${resolvedTopic}`, a: '' }));
    }
  }

  const questions = shuffle([...pool]).slice(0, Math.min(itemCount, pool.length));

  return [{
    id: `short_answer_global_${Date.now()}`,
    activityType: activityType,
    title: (resolvedTopic || topic).toUpperCase() + ": KISA CEVAPLI SORULAR",
    instruction: "Aşağıdaki soruları dikkatlice okuyup verilen boşluklara kısa ve net cevaplar yazın.",
    settings: { ...options, topic: resolvedTopic },
    content: {
      questions: questions.map((q, idx) => ({
        id: `q_${idx}`,
        text: q.q,
        answer: q.a || '',
        hint: q.hint,
        points: 10
      })),
      insight: {
          title: "Sınav Tekniği",
          text: "Bilmediğin soruyu atla, süren artarsa geri dönüp tekrar incele."
      }
    }
  }];
};

export default generateOfflineShortAnswer;
