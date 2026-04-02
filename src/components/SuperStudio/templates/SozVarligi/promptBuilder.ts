import { IPromptBuilderContext } from '../registry';
import { SozVarligiSettings } from './types';

export default function buildSozVarligiPrompt(
  context: IPromptBuilderContext<SozVarligiSettings>
): string {
  const { topic, difficulty, grade, studentName, settings } = context;
  const densityLabel =
    settings.layoutDensity === 'standart'
      ? 'standart'
      : settings.layoutDensity === 'yogun'
        ? 'yoğun'
        : 'ultra yoğun';
  const typeLabels: Record<string, string> = {
    deyim: 'Deyimler',
    atasozu: 'Atasözleri',
    mecaz: 'Mecaz Anlatım',
  };
  const typesText = settings.itemTypes.map((t) => typeLabels[t] || t).join(', ');

  let prompt = `
SEN: Çocukların kelime dağarcığını geliştiren uzman eğitimci, anlam bilgisi uzmanısın.
GÖREV: "${topic}" konusu etrafında, ${grade || 'ilkokul seviyesi'} düzeyinde, ${difficulty} zorlukta SÖZ VARLIĞI çalışma kağıdı hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}

KRİTİK KURALLAR:
- Tüm içerik Türkçe, disleksi dostu sade dil kullan.
- Yerleşim yoğunluğu: ${densityLabel}.
- Kategoriler: ${typesText}. Toplam ${settings.count} madde, ${settings.taskCount} görev bloğu.
- Her görev bloğunda EN AZ 2 alt-aktivite bulunmalı.
- Tüm sorular numaralı olmalı (1., 2., 3. ...).
- Her sorunun altında cevap yazma alanı bırak.
- Görev blokları arasına ───────────────────── ayırıcı çizgi koy.
- Her deyim/atasözünün anlamını sade, çocuk dostu dille açıkla.
`;

  if (settings.visualAnalogy) {
    prompt += `
GÖRSEL BENZETME: Her deyim/atasözü/mecaz için basit emoji veya SVG ikon eşleştirmesi ekle. Öğrenciden görseli anlamla eşleştirmesini iste.
`;
  }

  if (settings.contextualUsage) {
    prompt += `
BAĞLAMSAL KULLANIM: Boşluklu cümleler kur. Öğrenciden uygun deyim/atasözünü boşluğa yerleştirmesini iste.
`;
  }

  if (settings.includeMatching) {
    prompt += `
EŞLEŞTİRME: Deyim-anlam eşleştirme tablosu oluştur. Öğrenciden doğru eşleştirmeleri çizgiyle birleştirmesini veya harfle eşleştirmesini iste.
`;
  }

  if (settings.includeSentenceCreation) {
    prompt += `
CÜMLE KURMA: Her deyim/atasözünü kullanarak yaratıcı cümle kurdur. En az 2 cümle alanı bırak.
`;
  }

  if (settings.includeScenarioSection) {
    prompt += `
SENARYO BÖLÜMÜ: Günlük yaşam senaryoları ver. Öğrenciden senaryoya uygun deyim/atasözünü seçmesini ve nedenini açıklamasını iste.
`;
  }

  if (settings.includeBonusSection) {
    prompt += `
BONUS BÖLÜM: "Deyim Bulmaca" + "Arkadaşına Sor" bölümü + tüyo kutusu ekle.
`;
  }

  prompt += `
GÖREV BLOKLARI YAPISI (${settings.taskCount} GÖREV):
`;

  for (let i = 1; i <= settings.taskCount; i++) {
    prompt += `- GÖREV ${i}: `;
    const activities: string[] = [];
    if (i === 1) {
      activities.push('Deyim/atasözü açıklama', 'Görsel eşleştirme');
    } else if (i === 2) {
      activities.push('Bağlamsal boşluk doldurma', 'Anlam bulma');
    } else if (i === 3) {
      activities.push('Eşleştirme tablosu', 'Doğru/yanlış');
    } else if (i === 4) {
      activities.push('Cümle kurma', 'Yaratıcı kullanım');
    } else if (i === 5) {
      activities.push('Senaryo analizi', 'Durum eşleştirme');
    } else {
      activities.push('Serbest uygulama', 'Tekrar');
    }
    if (settings.includeBonusSection && i === settings.taskCount) activities.push('Bonus bulmaca');
    prompt += activities.join(' + ') + '. ';
    const itemsForTask = Math.max(2, Math.floor(settings.count / settings.taskCount));
    prompt += `${itemsForTask} madde içerir. Her madde numaralı ve cevap alanlı.\n`;
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
  "title": "${topic} - Söz Varlığı Çalışması",
  "content": "Tüm görevleri içeren Markdown bloğu. # H1 başlıkla başla. A4'ü tamamen doldur.",
  "pedagogicalNote": "ZORUNLU: Bu etkinliğin kelime dağarcığını, anlam bilgisini ve dil kullanımını nasıl geliştirdiğini, ${densityLabel} yerleşimin neden seçildiğini ve öğretmenin dikkat etmesi gereken noktaları açıkla (en az 100 karakter)."
}
`;

  return prompt;
}
