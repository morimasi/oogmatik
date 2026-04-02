import { IPromptBuilderContext } from '../registry';
import { KelimeBilgisiSettings } from './types';

export default function buildKelimeBilgisiPrompt(
  context: IPromptBuilderContext<KelimeBilgisiSettings>
): string {
  const { topic, difficulty, grade, studentName, settings } = context;
  const densityLabel =
    settings.layoutDensity === 'standart'
      ? 'standart'
      : settings.layoutDensity === 'yogun'
        ? 'yoğun'
        : 'ultra yoğun';

  const wordTypesText = settings.wordTypes
    .map((t) => {
      switch (t) {
        case 'es-anlamli':
          return 'Eş Anlamlı Kelimeler';
        case 'zit-anlamli':
          return 'Zıt Anlamlı Kelimeler';
        case 'es-sesli':
          return 'Eş Sesli Kelimeler';
        default:
          return t;
      }
    })
    .join(', ');

  const wordCount =
    settings.generationMode === 'ai'
      ? settings.aiSettings.wordCount
      : settings.hizliSettings.questionCount;

  let prompt = `
SEN: Kelime dağarcığı ve anlam bilgisi uzmanı, özel eğitim öğretmenisin.
GÖREV: "${topic}" konusu etrafında, ${grade || 'ilkokul seviyesi'} düzeyinde, ${difficulty} zorlukta KELİME BİLGİSİ çalışma kağıdı hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}

KRİTİK KURALLAR:
- Tüm içerik Türkçe, disleksi dostu sade dil kullan.
- Yerleşim yoğunluğu: ${densityLabel}.
- Kelime türleri: ${wordTypesText}.
- Toplam ${wordCount} kelime, ${settings.taskCount} görev bloğu.
- Her görev bloğunda EN AZ 2 alt-aktivite bulunmalı.
- Tüm sorular numaralı olmalı (1., 2., 3. ...).
- Her sorunun altında cevap yazma alanı bırak.
- Görev blokları arasına ───────────────────── ayırıcı çizgi koy.
`;

  if (settings.visualSettings.useColorCoding) {
    prompt += `
RENK KODLAMA: Eş anlamlı=mavi, zıt anlamlı=kırmızı, eş sesli=yeşil renk kodlaması kullan.
`;
  }

  if (settings.visualSettings.useIcons) {
    prompt += `
GÖRSEL İKONLAR: Her kelime grubuna uygun emoji/SVG ikon ekle.
`;
  }

  if (settings.aiSettings.includeMnemonics) {
    prompt += `
MNEMONİK İPUÇLARI: Her kelime için akılda kalıcı hatırlatma ipucu veya kısaltma ekle.
`;
  }

  if (settings.aiSettings.themeBased) {
    prompt += `
TEMATİK GRUPLAMA: Kelimeleri tematik kategorilere ayır (hayvanlar, yiyecekler, duygular vb.).
`;
  }

  if (settings.includeMatching) {
    prompt += `
EŞLEŞTİRME KARTLARI: Eş/zıt/eş sesli kelime eşleştirme kartları oluştur. Öğrenciden doğru eşleri bulmasını iste.
`;
  }

  if (settings.includeSentenceContext) {
    prompt += `
CÜMLE BAĞLAMI: Her kelime çifti için cümle içinde kullanım örnekleri ver. Boşluklu cümleler ile uygulama yaptır.
`;
  }

  if (settings.includeWordSearch) {
    prompt += `
KELİME AVI: Harf tablosunda gizli kelimeleri bulma bulmacası ekle.
`;
  }

  if (settings.includeBonusSection) {
    prompt += `
BONUS BÖLÜM: "Kelime Bulmaca" + "Arkadaşına Sor" bölümü + tüyo kutusu ekle.
`;
  }

  prompt += `
GÖREV BLOKLARI YAPISI (${settings.taskCount} GÖREV):
`;

  for (let i = 1; i <= settings.taskCount; i++) {
    prompt += `- GÖREV ${i}: `;
    const activities: string[] = [];
    if (i === 1) {
      activities.push('Kelime çifti bulma', 'Eşleştirme');
    } else if (i === 2) {
      activities.push('Cümle içinde kullanım', 'Boşluk doldurma');
    } else if (i === 3) {
      activities.push('Kelime avı', 'Bulmaca');
    } else if (i === 4) {
      activities.push('Mnemonik eşleştirme', 'Hafıza oyunu');
    } else if (i === 5) {
      activities.push('Tematik gruplama', 'Kategori bulma');
    } else {
      activities.push('Serbest uygulama', 'Tekrar');
    }
    if (settings.includeBonusSection && i === settings.taskCount) activities.push('Bonus bulmaca');
    prompt += activities.join(' + ') + '. ';
    const wordsForTask = Math.max(2, Math.floor(wordCount / settings.taskCount));
    prompt += `${wordsForTask} kelime içerir. Her kelime numaralı ve cevap alanlı.\n`;
  }

  if (settings.hizliSettings.includeAnswerKey || settings.aiSettings.includeExamples) {
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
  "title": "${topic} - Kelime Bilgisi Çalışması",
  "content": "Tüm görevleri içeren Markdown bloğu. # H1 başlıkla başla. A4'ü tamamen doldur.",
  "pedagogicalNote": "ZORUNLU: Bu etkinliğin kelime dağarcığını, anlam bilgisini ve eş/zıt/eş sesli kelime farkındalığını nasıl geliştirdiğini, ${densityLabel} yerleşimin neden seçildiğini ve öğretmenin dikkat etmesi gereken noktaları açıkla (en az 100 karakter)."
}
`;

  return prompt;
}
