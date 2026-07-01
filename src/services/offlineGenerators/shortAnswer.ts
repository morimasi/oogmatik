import { ActivityType } from '../../types/activity';
import { GeneratorOptions } from '../../types/core';
import { shuffle } from './helpers';

export const generateOfflineShortAnswer = async (
  options: GeneratorOptions
): Promise<any[]> => {
  const { difficulty = 'Orta' } = options;
  const opts = options as Record<string, unknown>;
  const topic = (opts.topic as string) || 'Genel Kültür';
  const itemCount = (opts.itemCountShort as number) || 8;

  const library: Record<string, any[]> = {
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

  const pool = library[topic] || library['Bilim'];
  const questions = shuffle([...pool]).slice(0, itemCount);

  return [{
    id: `short_answer_global_${Date.now()}`,
    activityType: ActivityType.SHORT_ANSWER,
    title: topic.toUpperCase() + ": KISA CEVAPLI SORULAR",
    instruction: "Aşağıdaki soruları dikkatlice okuyup verilen boşluklara kısa ve net cevaplar yazın.",
    settings: { ...options },
    content: {
      questions: questions.map((q, idx) => ({
        id: `q_${idx}`,
        text: q.q,
        answer: q.a,
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
