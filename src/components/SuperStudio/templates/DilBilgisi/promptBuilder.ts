import { IPromptBuilderContext } from '../registry';
import { DilBilgisiSettings } from './types';

export default function buildDilBilgisiPrompt(
  context: IPromptBuilderContext<DilBilgisiSettings>
): string {
  const { topic, difficulty, grade, studentName, settings } = context;
  const [h1, h2] =
    settings.targetDistractors !== 'none' ? settings.targetDistractors.split('-') : ['', ''];
  const densityLabel =
    settings.layoutDensity === 'standart'
      ? 'standart'
      : settings.layoutDensity === 'yogun'
        ? 'yoğun'
        : 'ultra yoğun';

  let prompt = `
SEN: Özel eğitim uzmanı, disleksi dostu içerikler üreten dil bilimcisisin.
GÖREV: "${topic}" konusu etrafında, ${grade || 'ilkokul seviyesi'} düzeyinde, ${difficulty} zorlukta DİL BİLGİSİ & HARF ALGI çalışma kağıdı hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}

KRİTİK KURALLAR:
- Tüm içerik Türkçe, disleksi dostu sade dil kullan.
- Büyük punto, net yazı tipi, satır aralığı 1.8.
- Yerleşim yoğunluğu: ${densityLabel}.
- Toplam ${settings.questionCount} soru, ${settings.taskCount} görev bloğu, ${settings.wordCount} kelime üret.
- Her görev bloğunda EN AZ 2 alt-aktivite bulunmalı.
- Tüm sorular numaralı olmalı (1., 2., 3. ...).
- Her sorunun altında cevap yazma çizgisi (________) bırak.
- Görev blokları arasına ───────────────────── ayırıcı çizgi koy.
`;

  if (settings.hintBox) {
    prompt += `
İPUCU KUTUSU: Sayfanın başına konuyu ve harf kuralını anlatan 📌 İpucu Kutusu ekle. Kutunun etrafında kesikli çerçeve olsun.
`;
  }

  if (settings.targetDistractors !== 'none') {
    prompt += `
AYNA HARFLER: "${h1}" ve "${h2}" harflerinin karıştırılmasını önlemek için özel etkinlikler kurgula. Bu harfleri içeren kelimeleri ön plana çıkar. Ayna harf ayırt etme egzersizleri ekle.
`;
  }

  if (settings.syllableSimulation) {
    prompt += `
HECELEME MODU: Tüm kelimeleri hecelerine ayırarak yaz. Köşeli parantez kullan: [Ki-tap-lık], [Öğ-ren-ci]. Heceleme alıştırmaları ekle.
`;
  }

  if (settings.camouflageGrid && settings.gridSize !== 'none') {
    prompt += `
KAMUFLAJ IZGARA: ${settings.gridSize} boyutunda harf avı tablosu oluştur. Hedef harfleri benzer harflerin arasına gizle. Öğrenciden hedef harfleri yuvarlak içine almasını ve saymasını iste.
`;
  }

  if (settings.includeWordChain) {
    prompt += `
KELİME ZİNCİRİ: Son harfle başlayan kelime türetme zinciri oyunu ekle. En az ${Math.max(4, Math.floor(settings.wordCount / 3))} kelime alanı bırak.
`;
  }

  if (settings.includeErrorDetective) {
    prompt += `
HATA DEDEKTİFİ: Bilinçli olarak hatalı yazılmış kelimeler/cümleler ver. Öğrenciden hataları bulup altını çizmesini ve doğrusunu yazmasını iste.
`;
  }

  if (settings.includeBonusSection) {
    prompt += `
BONUS BÖLÜM: "Arkadaşına Sor" bölümü + mini yarışma sorusu + tüyo kutusu ekle.
`;
  }

  prompt += `
GÖREV BLOKLARI YAPISI (${settings.taskCount} GÖREV):
`;

  for (let i = 1; i <= settings.taskCount; i++) {
    prompt += `- GÖREV ${i}: `;
    const activities: string[] = [];
    if (i === 1) {
      activities.push('Ayna harf ayırt etme', 'Şifre çözme');
    } else if (i === 2) {
      activities.push('Heceleme pratiği', 'Kelime eşleştirme');
    } else if (i === 3) {
      activities.push('Kamuflaj grid avı', 'Harf sayma tablosu');
    } else if (i === 4) {
      activities.push('Hata dedektifi', 'Doğru yazımı bulma');
    } else if (i === 5) {
      activities.push('Kelime zinciri', 'Boşluk doldurma');
    } else {
      activities.push('Bağlamsal yazma', 'Serbest uygulama');
    }
    if (settings.includeWordChain && i === settings.taskCount)
      activities.push('Kelime zinciri oyunu');
    if (settings.includeBonusSection && i === settings.taskCount)
      activities.push('Bonus mini yarışma');
    prompt += activities.join(' + ') + '. ';
    const questionsForTask = Math.max(2, Math.floor(settings.questionCount / settings.taskCount));
    prompt += `${questionsForTask} soru içerir. Her soru numaralı ve cevap çizgili.\n`;
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
  "title": "${topic} - Harf Farkındalığı Çalışması",
  "content": "Tüm görevleri içeren Markdown bloğu. # H1 başlıkla başla. A4'ü tamamen doldur.",
  "pedagogicalNote": "ZORUNLU: Bu etkinliğin disleksi desteği, harf algısı becerilerini nasıl geliştirdiğini, ${densityLabel} yerleşimin neden seçildiğini ve öğretmenin dikkat etmesi gereken noktaları açıkla (en az 100 karakter)."
}
`;

  return prompt;
}
