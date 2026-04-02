import { IPromptBuilderContext } from '../registry';
import { HeceSesSettings } from './types';

export default function buildHeceSesPrompt(
  context: IPromptBuilderContext<HeceSesSettings>
): string {
  const { topic, difficulty, grade, studentName, settings } = context;
  const densityLabel =
    settings.layoutDensity === 'standart'
      ? 'standart'
      : settings.layoutDensity === 'yogun'
        ? 'yoğun'
        : 'ultra yoğun';
  const eventLabels: Record<string, string> = {
    heceleme: 'Heceleme',
    yumusama: 'Ünsüz Yumuşaması',
    sertlesme: 'Ünsüz Benzeşmesi',
    'ses-dusmesi': 'Ses Düşmesi',
  };
  const eventsText = settings.focusEvents.map((e) => eventLabels[e] || e).join(', ');

  let prompt = `
SEN: Disleksi-fonolojik farkındalık uzmanı, ses olayları ve heceleme öğretmeni.
GÖREV: "${topic}" konusu etrafında, ${grade || 'ilkokul seviyesi'} düzeyinde, ${difficulty} zorlukta HECE VE SES OLAYLARI çalışma kağıdı hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}

KRİTİK KURALLAR:
- Tüm içerik Türkçe, disleksi dostu sade dil kullan.
- Yerleşim yoğunluğu: ${densityLabel}.
- Odak ses olayları: ${eventsText}.
- Toplam ${settings.wordCount} kelime, ${settings.taskCount} görev bloğu.
- Her görev bloğunda EN AZ 2 alt-aktivite bulunmalı.
- Tüm sorular numaralı olmalı (1., 2., 3. ...).
- Her sorunun altında cevap yazma alanı bırak.
- Görev blokları arasına ───────────────────── ayırıcı çizgi koy.
`;

  if (settings.syllableHighlight) {
    prompt += `
HECE GÖRSELLEŞTİRME: Kelimeleri hecelerine ayırırken köşeli parantez kullan: [Ki-tap-lık], [Öğ-ren-ci]. Hece sınırlarını belirgin göster.
`;
  }

  if (settings.multisensorySupport) {
    prompt += `
ÇOK DUYULU DESTEK: Hedef harfi veya sesi BÜYÜK yazarak vurgula. Renk kodlama ipuçları ekle.
`;
  }

  if (settings.includeSyllableCounting) {
    prompt += `
HECE SAYMA: Her kelimenin hece sayısını tabloya yazdırma egzersizi ekle. Hece sayma tablosu oluştur.
`;
  }

  if (settings.includeWordBuilding) {
    prompt += `
KELİME KURMA: Dağınık hecelerden anlamlı kelime türetme egzersizleri ekle. Karışık heceleri doğru sırada dizdir.
`;
  }

  if (settings.includeSoundDetection) {
    prompt += `
SES ALGILAMA: Hedef sesi içeren kelimeleri bulma oyunu ekle. Ses tespiti egzersizleri içer.
`;
  }

  if (settings.includeBonusSection) {
    prompt += `
BONUS BÖLÜM: "Ses Bulmaca" + "Arkadaşına Sor" bölümü + tüyo kutusu ekle.
`;
  }

  prompt += `
GÖREV BLOKLARI YAPISI (${settings.taskCount} GÖREV):
`;

  for (let i = 1; i <= settings.taskCount; i++) {
    prompt += `- GÖREV ${i}: `;
    const activities: string[] = [];
    if (i === 1) {
      activities.push('Heceleme pratiği', 'Hece sınırlarını çiz');
    } else if (i === 2) {
      activities.push('Ünsüz yumuşaması', 'Sertleşme tespiti');
    } else if (i === 3) {
      activities.push('Hece sayma tablosu', 'Renk kodlu kutular');
    } else if (i === 4) {
      activities.push('Dağınık hece toplama', 'Kelime türetme');
    } else if (i === 5) {
      activities.push('Ses algılama', 'Ses bulma oyunu');
    } else {
      activities.push('Ses düşmesi', 'Serbest uygulama');
    }
    if (settings.includeBonusSection && i === settings.taskCount)
      activities.push('Bonus ses bulmaca');
    prompt += activities.join(' + ') + '. ';
    const wordsForTask = Math.max(2, Math.floor(settings.wordCount / settings.taskCount));
    prompt += `${wordsForTask} kelime içerir. Her kelime numaralı ve cevap alanlı.\n`;
  }

  if (settings.includeAnswerKey) {
    prompt += `
CEVAP ANAHTARI: Tüm görevlerin sonunda "📋 CEVAP ANAHTARI" başlığıyla doğru cevapları listele.
`;
  }

  prompt += `
A4 DOLU SAYFA KURALI (ZORUNLU):
- İçerik A4 kağıdın %95'ini doldurmalı. BOŞ ALAN KALMAMALI.
- Her görev bloğu "═══ GÖREV X ═══" başlığıyla başlamalı.
- Görevler arası geçişlerde ───────────────────── çizgisi kullan.
- Sayfa sonu ayracı: ===SAYFA_SONU=== (görevler arasına koy, cümle ortasında kullanma).
- Markdown formatında yaz. Tablolar, listeler, kutular, renk kodlama kullan.

YANIT FORMATI — GEÇERLİ JSON:
{
  "title": "${topic} - Hece ve Ses Olayları",
  "content": "Tüm görevleri içeren Markdown bloğu. # H1 başlıkla başla. A4'ü tamamen doldur.",
  "pedagogicalNote": "ZORUNLU: Bu etkinliğin fonolojik farkındalık, heceleme ve ses olayları becerilerini nasıl geliştirdiğini, ${densityLabel} yerleşimin neden seçildiğini ve öğretmenin dikkat etmesi gereken noktaları açıkla (en az 100 karakter)."
}
`;

  return prompt;
}
