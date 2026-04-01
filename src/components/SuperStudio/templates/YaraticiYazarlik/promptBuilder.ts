import { IPromptBuilderContext } from '../registry';
import { YaraticiYazarlikSettings } from './types';

export default function buildYaraticiYazarlikPrompt(
  context: IPromptBuilderContext<YaraticiYazarlikSettings>
): string {
  const { topic, difficulty, grade, studentName, settings } = context;
  const densityLabel =
    settings.layoutDensity === 'standart'
      ? 'standart'
      : settings.layoutDensity === 'yogun'
        ? 'yoğun'
        : 'ultra yoğun';
  const clozeText =
    settings.clozeFormat === 'none'
      ? 'yok'
      : settings.clozeFormat === 'fiil'
        ? 'fiil boşluklu'
        : settings.clozeFormat === 'sifat'
          ? 'sıfat boşluklu'
          : 'rastgele boşluklu';

  let prompt = `
SEN: Yaratıcı yazarlık koçu, disleksi dostu içerikler üreten çocuk edebiyatı uzmanısın.
GÖREV: "${topic}" konusu etrafında, ${grade || 'ilkokul seviyesi'} düzeyinde, ${difficulty} zorlukta YARATICI YAZARLIK çalışma kağıdı hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}

KRİTİK KURALLAR:
- Tüm içerik Türkçe, disleksi dostu sade dil kullan.
- Yerleşim yoğunluğu: ${densityLabel}.
- Toplam ${settings.questionCount} soru, ${settings.taskCount} görev bloğu, ${settings.writingPrompts} yazma promptu.
- Her görev bloğunda EN AZ 2 alt-aktivite bulunmalı.
- Tüm sorular/görevler numaralı olmalı (1., 2., 3. ...).
- Her yazma alanı altında çizgili yazma satırları bırak.
- Görev blokları arasına ───────────────────── ayırıcı çizgi koy.
- Hedef: Öğrenciden en az ${settings.minSentences} cümle kurmasını bekle.
`;

  prompt += `
HİKAYE ZARLARI: Konuya uygun ${settings.storyDiceCount} adet basit SVG ikon kodu üret. Her ikon bir hikaye zarı olarak sunulsun. Öğrenciden zarları kullanarak hikaye oluşturmasını iste.
`;

  if (settings.clozeFormat !== 'none') {
    prompt += `
CLOZE (BOŞLUK DOLDURMA): Metne ${clozeText} boşluklar bırak. Öğrenciden uygun kelimeleri yazmasını iste.
`;
  }

  if (settings.emotionRadar) {
    prompt += `
DUYGU RADARI: Karakterlerin hislerini gösteren emoji/SVG ikonları ekle. Öğrenciden duyguları eşleştirmesini iste.
`;
  }

  if (settings.includeWordBank) {
    prompt += `
KELİME BANKASI: Her yazma görevi için 5-8 kilit kelime içeren kelime bankası kutusu ekle. Öğrenci bu kelimeleri yazımında kullansın.
`;
  }

  if (settings.includeStoryMap) {
    prompt += `
HİKAYE HARİTASI: Giriş-Gelişme-Sonuç şablonu ekle. Öğrenciden hikayesini planlamasını iste.
`;
  }

  if (settings.includePeerReview) {
    prompt += `
AKRAN DEĞERLENDİRME: "Arkadaşının yazısını oku, 2 güzel şey ve 1 öneri yaz" bölümü ekle.
`;
  }

  if (settings.includeBonusSection) {
    prompt += `
BONUS BÖLÜM: "Arkadaşına Sor" bölümü + mini yazma yarışması + tüyo kutusu ekle.
`;
  }

  prompt += `
GÖREV BLOKLARI YAPISI (${settings.taskCount} GÖREV):
`;

  for (let i = 1; i <= settings.taskCount; i++) {
    prompt += `- GÖREV ${i}: `;
    const activities: string[] = [];
    if (i === 1) {
      activities.push('Hikaye zarları', 'Rol yapma');
    } else if (i === 2) {
      activities.push('Kelime kavanozu', 'Cümle kurma');
    } else if (i === 3) {
      activities.push('Cloze doldurma', 'Hikaye başlatma');
    } else if (i === 4) {
      activities.push('Duygu haritası', 'Karakter yaratma');
    } else if (i === 5) {
      activities.push('Serbest yazma', 'Hikaye tamamlama');
    } else {
      activities.push('Yaratıcı yazma', 'İllüstrasyon');
    }
    if (settings.includePeerReview && i === settings.taskCount)
      activities.push('Akran değerlendirme');
    if (settings.includeBonusSection && i === settings.taskCount)
      activities.push('Bonus mini yarışma');
    prompt += activities.join(' + ') + '. ';
    const promptsForTask = Math.max(1, Math.floor(settings.writingPrompts / settings.taskCount));
    prompt += `${promptsForTask} yazma promptu içerir. Her prompt için çizgili yazma satırları bırak.\n`;
  }

  if (settings.includeAnswerKey) {
    prompt += `
CEVAP ANAHTARI: Cloze boşlukları ve örnek cevapları "📋 CEVAP ANAHTARI" başlığıyla listele.
`;
  }

  prompt += `
A4 DOLU SAYFA KURALI (ZORUNLU):
- İçerik A4 kağıdın %95'ini doldurmalı. BOŞ ALAN KALMAMALI.
- Her görev bloğu "═══ GÖREV X ═══" başlığıyla başlamalı.
- Görevler arası geçişlerde ───────────────────── çizgisi kullan.
- Sayfa sonu ayracı: ===SAYFA_SONU=== (görevler arasına koy, cümle ortasında kullanma).
- Markdown formatında yaz. Tablolar, listeler, kutular, çizgili satırlar kullan.

YANIT FORMATI — GEÇERLİ JSON:
{
  "title": "${topic} - Yaratıcı Yazarlık Stüdyosu",
  "content": "Tüm görevleri içeren Markdown bloğu. # H1 başlıkla başla. A4'ü tamamen doldur.",
  "pedagogicalNote": "ZORUNLU: Bu etkinliğin yaratıcı yazma becerilerini, hayal gücünü ve ifade yeteneğini nasıl geliştirdiğini, ${densityLabel} yerleşimin neden seçildiğini ve öğretmenin dikkat etmesi gereken noktaları açıkla (en az 100 karakter)."
}
`;

  return prompt;
}
