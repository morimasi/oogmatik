import { IPromptBuilderContext } from '../registry';
import { YazimNoktalamaSettings } from './types';

export default function buildYazimNoktalamaPrompt(
  context: IPromptBuilderContext<YazimNoktalamaSettings>
): string {
  const { topic, difficulty, grade, studentName, settings } = context;
  const densityLabel =
    settings.layoutDensity === 'standart'
      ? 'standart'
      : settings.layoutDensity === 'yogun'
        ? 'yoğun'
        : 'ultra yoğun';

  const ruleLabels: Record<string, string> = {
    'buyuk-harf': 'Büyük Harf Kullanımı',
    'kesme-isareti': 'Kesme İşareti',
    noktalama: 'Noktalama İşaretleri (. , ! ? : ;)',
    'bitisik-ayri': 'Bitişik/Ayrı Yazım (de/da, ki, mi)',
  };

  const focusText = settings.focusRules.map((r) => ruleLabels[r] || r).join(', ');
  const paraLenText =
    settings.paragraphLength === 'kisa'
      ? '2-3 cümle'
      : settings.paragraphLength === 'uzun'
        ? '6-8 cümle'
        : '4-5 cümle';

  let prompt = `
SEN: MEB müfredatına hakim, disleksi dostu eğitim uzmanısın.
GÖREV: "${topic}" konusu etrafında, ${grade || 'ilkokul seviyesi'} düzeyinde, ${difficulty} zorlukta YAZIM VE NOKTALAMA çalışma kağıdı hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}

KRİTİK KURALLAR:
- Tüm içerik Türkçe, disleksi dostu sade dil kullan.
- Yerleşim yoğunluğu: ${densityLabel}.
- Odak kurallar: ${focusText}.
- Toplam ${settings.exerciseCount} egzersiz, ${settings.taskCount} görev bloğu.
- Her görev bloğunda EN AZ 2 alt-aktivite bulunmalı.
- Tüm sorular numaralı olmalı (1., 2., 3. ...).
- Her sorunun altında cevap/düzeltme çizgisi (________) bırak.
- Görev blokları arasına ───────────────────── ayırıcı çizgi koy.
- Her paragraf ${paraLenText} uzunluğunda olsun.
`;

  if (settings.showRuleHint) {
    prompt += `
KURAL HATIRLATICI: Her görev bloğunun başına, o görevdeki yazım kuralını özetleyen 📌 bilgi notu kutusu ekle. Kutunun etrafında kesikli çerçeve olsun.
`;
  }

  if (settings.errorCorrectionMode) {
    prompt += `
HATA DEDEKTİFİ MODU: Cümleleri BİLİNÇLİ OLARAK HATALI yaz. Öğrenciden hataları bulup altını çizmesini ve doğrusunu yazmasını iste. Her cümlede 1-2 yazım/noktalama hatası olsun.
`;
  }

  if (settings.includeScenarioWriting) {
    prompt += `
SENARYO YAZMA: Öğrenciden verilen duruma uygun doğru cümleler yazmasını iste. Cümlelerde odak kuralları uygulatsın. Senaryo kutuları ekle.
`;
  }

  if (settings.includeTestSection) {
    prompt += `
TEST BÖLÜMÜ: Doğru/Yanlış soruları + çoktan seçmeli sorular ekle. Hepsinde yazım/noktalama bilgisi sorsun.
`;
  }

  if (settings.includeBonusSection) {
    prompt += `
BONUS BÖLÜM: "Noktalama Yarışması" tablosu + "Arkadaşına Sor" bölümü + tüyo kutusu ekle.
`;
  }

  prompt += `
GÖREV BLOKLARI YAPISI (${settings.taskCount} GÖREV):
`;

  for (let i = 1; i <= settings.taskCount; i++) {
    prompt += `- GÖREV ${i}: `;
    const activities: string[] = [];
    if (i === 1) {
      activities.push('Bağlamsal düzeltme', 'Hatalı cümle bulma');
    } else if (i === 2) {
      activities.push('Boşluk doldurma', 'Noktalama yerleştirme');
    } else if (i === 3) {
      activities.push('Kural eşleştirme', 'Doğru/yanlış');
    } else if (i === 4) {
      activities.push('Senaryo yazma', 'Durum cümlesi');
    } else if (i === 5) {
      activities.push('Çoktan seçmeli test', 'Hata avı');
    } else {
      activities.push('Serbest uygulama', 'Kural tekrarı');
    }
    if (settings.includeTestSection && i === settings.taskCount) activities.push('Test bölümü');
    if (settings.includeBonusSection && i === settings.taskCount) activities.push('Bonus yarışma');
    prompt += activities.join(' + ') + '. ';
    const exercisesForTask = Math.max(2, Math.floor(settings.exerciseCount / settings.taskCount));
    prompt += `${exercisesForTask} egzersiz içerir. Her egzersiz numaralı ve düzeltme çizgili.\n`;
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
- Markdown formatında yaz. Tablolar, listeler, kutular kullan.

YANIT FORMATI — GEÇERLİ JSON:
{
  "title": "${topic} - Yazım ve Noktalama",
  "content": "Tüm görevleri içeren Markdown bloğu. # H1 başlıkla başla. A4'ü tamamen doldur.",
  "pedagogicalNote": "ZORUNLU: Bu etkinliğin yazım ve noktalama becerilerini nasıl geliştirdiğini, ${densityLabel} yerleşimin neden seçildiğini ve öğretmenin dikkat etmesi gereken noktaları açıkla (en az 100 karakter)."
}
`;

  return prompt;
}
