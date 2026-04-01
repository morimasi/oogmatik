import { IPromptBuilderContext } from '../registry';
import { MantikMuhakemeSettings } from './types';

export default function buildMantikMuhakemePrompt(
  context: IPromptBuilderContext<MantikMuhakemeSettings>
): string {
  const { topic, difficulty, grade, studentName, settings } = context;
  const densityLabel =
    settings.layoutDensity === 'standart'
      ? 'standart'
      : settings.layoutDensity === 'yogun'
        ? 'yoğun'
        : 'ultra yoğun';

  let prompt = `
SEN: Bilişsel gelişim uzmanı, disleksi dostu mantık muhakeme içerikleri üreten eğitimcisin.
GÖREV: "${topic}" konusu etrafında, ${grade || 'ilkokul seviyesi'} düzeyinde, ${difficulty} zorlukta, ${settings.storyComplexity} karmaşıklıkta MANTIK MUHAKEME çalışma kağıdı hazırla.
${studentName ? `Öğrenci: "${studentName}"` : ''}

KRİTİK KURALLAR:
- Tüm içerik Türkçe, disleksi dostu sade dil kullan.
- Yerleşim yoğunluğu: ${densityLabel}.
- Toplam ${settings.questionCount} soru, ${settings.taskCount} görev bloğu, ${settings.sequenceSteps} adımlı olay sıralama.
- Her görev bloğunda EN AZ 2 alt-aktivite bulunmalı.
- Tüm sorular numaralı olmalı (1., 2., 3. ...).
- Her sorunun altında cevap yazma çizgisi (________) bırak.
- Görev blokları arasına ───────────────────── ayırıcı çizgi koy.
- 3 kademeli ipucu sistemi kullan: 1. ipucu → 2. ipucu → cevap.
`;

  prompt += `
OLAY SIRALAMA: "${topic}" konusuna uygun, ${settings.sequenceSteps} adımlı bir olay örgüsü kurgula. Cümleleri karışık sırada ver (A, B, C... harfleriyle). Öğrenciden oluş sırasına göre numaralandırmasını iste.
`;

  if (settings.logicMatrix) {
    prompt += `
MANTIK MATRİSİ: ${settings.matrixSize} boyutunda sözel sudoku / mantık matrisi oluştur. Sözel ipuçları ver (örn: "En soldaki mavidir", "Ali kırmızıyı sevmez"). Öğrenciden ipuçlarını kullanarak tabloyu doldurmasını iste.
`;
  }

  if (settings.detailDetective) {
    prompt += `
DETAY DEDEKTİFİ: Konuya dair kısa bir paragraf yaz. Paragrafa ustaca 1-2 mantık hatası veya kronolojik tutarsızlık gizle. Öğrenciden hataları bulup altını çizmesini iste.
`;
  }

  if (settings.includePatternCompletion) {
    prompt += `
ÖRÜNTÜ TAMAMLAMA: Kavramsal veya olay sırası olarak boş bırakılan yerleri tamamlattırma. Desen devam ettirme egzersizleri ekle.
`;
  }

  if (settings.includeCausalReasoning) {
    prompt += `
NEDESEL AKIL YÜRÜTME: "Eğer A olursa B ne olur?" tarzı sebep-sonuç soruları ekle. Açık uçlu düşünce soruları içer.
`;
  }

  if (settings.includeBonusSection) {
    prompt += `
BONUS BÖLÜM: "Arkadaşına Sor" bölümü + mini mantık bulmacası + tüyo kutusu ekle.
`;
  }

  prompt += `
GÖREV BLOKLARI YAPISI (${settings.taskCount} GÖREV):
`;

  for (let i = 1; i <= settings.taskCount; i++) {
    prompt += `- GÖREV ${i}: `;
    const activities: string[] = [];
    if (i === 1) {
      activities.push('Olay sıralama', 'Kronoloji bulma');
    } else if (i === 2) {
      activities.push('Mantık matrisi', 'İpucu çözme');
    } else if (i === 3) {
      activities.push('Detay dedektifi', 'Tutarsızlık bulma');
    } else if (i === 4) {
      activities.push('Örüntü tamamlama', 'Desen devam ettirme');
    } else if (i === 5) {
      activities.push('Nedensel akıl yürütme', 'Sebep-sonuç analizi');
    } else {
      activities.push('Bağlamsal muhakeme', 'Serbest uygulama');
    }
    if (settings.includeBonusSection && i === settings.taskCount)
      activities.push('Bonus mini bulmaca');
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
  "title": "${topic} - Mantık ve Muhakeme",
  "content": "Tüm görevleri içeren Markdown bloğu. # H1 başlıkla başla. A4'ü tamamen doldur.",
  "pedagogicalNote": "ZORUNLU: Bu etkinliğin bilişsel gelişim, mantık muhakeme becerilerini nasıl geliştirdiğini, ${densityLabel} yerleşimin neden seçildiğini ve öğretmenin dikkat etmesi gereken noktaları açıkla (en az 100 karakter)."
}
`;

  return prompt;
}
