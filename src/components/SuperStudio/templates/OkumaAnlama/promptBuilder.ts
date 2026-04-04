import { IPromptBuilderContext } from '../registry';
import { OkumaAnlamaSettings } from './types';

export default function buildOkumaAnlamaPrompt(
  context: IPromptBuilderContext<OkumaAnlamaSettings>
): string {
  const { topic, difficulty, grade, studentName, settings } = context;

  const lengthMap = { kisa: '120-160', orta: '180-250', uzun: '280-350' };
  const wordRange = lengthMap[settings.readingLength] || '180-250';
  const densityMap = { standart: '1.8', yogun: '1.5', 'ultra-yogun': '1.3' };
  const lineSpacing = densityMap[settings.layoutDensity] || '1.5';
  const qTypesText =
    settings.questionTypes && settings.questionTypes.length > 0
      ? settings.questionTypes
          .map((t: string) => {
            const map: Record<string, string> = {
              'coktan-secmeli': 'Çoktan Seçmeli (A/B/C/D)',
              'bosluk-doldurma': 'Boşluk Doldurma',
              'dogru-yanlis': 'Doğru/Yanlış',
              'acik-uc': 'Açık Uçlu',
              eslestirme: 'Eşleştirme',
            };
            return map[t] || t;
          })
          .join(', ')
      : 'Çoktan Seçmeli, Boşluk Doldurma, Doğru/Yanlış karışık';

  let prompt = `
SEN: MEB müfredatına hakim, disleksi ve DEHB uzmanı klinik öğretmensin.
GÖREV: "${topic}" konulu, ${grade || 'ilkokul'} düzeyinde, ${difficulty} zorlukta PREMIUM OKUMA ANLAMA A4 çalışma kağıdı üret.
${studentName ? `Öğrenci: "${studentName}"` : ''}

KRITIK KURALLAR:
- TÜM içerik Türkçe, disleksi dostu sade dil.
- Etken cümle yapısı. Mecaz/deyim/dolaylı anlatım YASAK.
- HİÇBİR cümle ${settings.cognitiveLoadLimit} kelimeden uzun OLAMAZ.
- Satır aralığı: ${lineSpacing}, Lexend font uyumlu.
`;

  if (settings.chunkingEnabled) {
    prompt += `
PARÇALI OKUMA: Metni 3-4 parçaya böl. Her parça sonrası "📌 Bölüm Sorusu" ile 1-2 anlama sorusu sor.
`;
  }

  if (settings.visualScaffolding) {
    prompt += `
GÖRSEL DESTEK: Her paragrafa uygun emoji/sembol (📖🌿🔭). Görsel yönergeler ekle.
`;
  }

  if (settings.typographicHighlight) {
    prompt += `
KÖK-EK FARKINDALIK: Önemli kelimelerin KÖKünü **kalın** yaz. Örn: "**Gel**iyorum".
`;
  }

  const taskCount = settings.taskCount;
  prompt += `
ÇALIŞMA KAĞIDI YAPISI — TAM ${taskCount} GÖREV BLOĞU:
`;

  const tasks = [];
  tasks.push(
    `GÖREV 1 — OKUMA METNİ: "${topic}" hakkında ${wordRange} kelimelik, ${settings.chunkingEnabled ? 'parçalara bölünmüş, ' : ''}giriş-gelişme-sonuç yapılı metin. ${settings.typographicHighlight ? 'Kök vurguları dahil.' : ''}`
  );
  tasks.push(
    `GÖREV 2 — ANLAMA SORULARI: ${qTypesText} formatında tam ${settings.questionCount} soru. Her soru numaralı, şıklı (varsa), cevap alanı bırakılmış.`
  );

  if (settings.mindMap5N1K) {
    tasks.push(
      `GÖREV 3 — 5N1K TABLOSU: Kim? Ne? Nerede? Ne zaman? Nasıl? Neden? sütunlu tablo. Boş bırak, öğrenci doldursun.`
    );
  }
  if (settings.includeDetectiveTask) {
    tasks.push(
      `GÖREV ${tasks.length + 1} — DEDEKTİFLİK: Metne gizlenmiş 1 tutarsız cümleyi buldur. Altını çizme alanı bırak.`
    );
  }
  if (settings.includeWordWork) {
    tasks.push(
      `GÖREV ${tasks.length + 1} — KELİME ÇALIŞMASI: Metinden 6 zor kelime seç. Anlam + cümle kurma + eş anlamlı bulma.`
    );
  }
  tasks.push(
    `GÖREV ${tasks.length + 1} — DOĞRU/YANLIŞ: 6 maddelik D/Y tablosu. Her madde metne dayalı.`
  );
  tasks.push(
    `GÖREV ${tasks.length + 1} — METİN İÇİ BOŞLUK: Metinden 5 kritik kelimeyi boş bırak. Öğrenci tamamlasın.`
  );

  if (settings.includeBonusSection) {
    tasks.push(
      `GÖREV ${tasks.length + 1} — BONUS: Eğlenceli mini yarışma sorusu + tüyo kutusu + "Arkadaşına Sor" bölümü.`
    );
  }

  for (const t of tasks) prompt += `- ${t}\n`;

  if (settings.includeAnswerKey) {
    prompt += `
CEVAP ANAHTARI: En altta "📋 CEVAP ANAHTARI" başlığıyla TÜM soruların doğru cevapları.`;
  }

  prompt += `

A4 DOLU SAYFA — ZORUNLU KURALLAR:
1. İçerik A4 kağıdın %95'ini DOLDURMALI. Boş alan YASAK.
2. Her görev "📌 GÖREV X" başlığı + "═══════════════════" ayırıcı ile başlar.
3. Sorular numaralı (1., 2., 3...). Şıklar alt alta (A) B) C) D)).
4. Her soru sonrası "Cevap: ______" çizgisi bırak.
5. Tablolar Markdown formatında çizgiyle çizilsin.
6. Kenar boşlukları: Üst 1.5cm, Alt 1.5cm, Sol 2cm, Sağ 2cm.
7. Satır aralığı: ${lineSpacing}. Font: Lexend.

İÇERİK YOĞUNLUĞU:
- En az ${settings.questionCount} soru + ${tasks.length} görev bloğu.
- Her görevde en az 2 alt-aktivite.
- Toplam sayfa doldurma hedefi: 1 tam A4 sayfa.

PAGINATION:
İçerik A4'e sığmazsa görevler arasına "===SAYFA_SONU===" koy.

YANIT FORMATI — GEÇERLİ JSON:
{
  "title": "${topic} — Okuma Anlama Çalışması",
  "content": "TÜM görevleri, soruları, tabloları, yönergeleri içeren Markdown. # H1 başlıkla başla.",
  "pedagogicalNote": "ZORUNLU (min 100 karakter): Bu etkinliğin geliştirdiği bilişsel beceriler, disleksi desteği mekanizmaları, öğretmenin dikkat etmesi gereken noktalar ve MEB kazanım ilişkisi."
}`;

  return prompt;
}
