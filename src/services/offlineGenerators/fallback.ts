import { ActivityType, GeneratorOptions, SingleWorksheetData } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';

function formatFriendlyTitle(type: ActivityType): string {
  const words = String(type)
    .replace(/^INFOGRAPHIC_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ');
  const capitalized = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
  return `${capitalized} Etkinliği`;
}

/**
 * generateOfflineFallback — Çevrimdışı (Hızlı) Pedagojik Yedek Motoru
 *
 * Özel bir offline jeneratörü bulunmayan etkinlikler için
 * disleksi ve DEHB dostu, tam yapılandırılmış pedagojik A4 çalışma kâğıdı üretir.
 * Kesinlikle hata mesajı veya boş alan basmaz; tam doldurulabilir çalışma sunar.
 */
export async function generateOfflineFallback(
  type: ActivityType,
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta', topic = 'Genel Öğrenme' } = options;
  const title = formatFriendlyTitle(type);

  const builder = new WorksheetBuilder(type, title)
    .addPremiumHeader()
    .setInstruction(
      'Aşağıdaki adımları dikkatle inceleyiniz, soruları okuyarak boş bırakılan alanlara yanıtlarınızı yazınız.'
    );

  // 1. Temel Bilgi ve Rehber İpucu Bloğu (Scaffolding)
  builder.addPrimaryActivity('text', {
    content: `### 📌 Öğrenme ve Keşif Alanı (${topic})\nBu çalışma kağıdı, **${title}** becerisini adım adım geliştirmek için özel olarak kurgulanmıştır. Yönergeleri takip ederek etkinliği tamamlayınız.`,
    style: {
      backgroundColor: '#f8fafc',
      padding: '12px 16px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      color: '#1e293b',
      fontSize: 13,
      lineHeight: 1.6,
    },
  });

  // 2. Yapılandırılmış Soru ve Alıştırma Maddeleri
  builder.addPrimaryActivity('question', {
    items: [
      {
        id: 'q1',
        prompt: `1. Adım (Başlangıç): Verilen konuyla (${topic}) ilgili en önemli 2 temel kavramı belirleyip aşağıya yazınız.`,
        lines: 2,
      },
      {
        id: 'q2',
        prompt: `2. Adım (Uygulama): Belirlediğiniz kavramlar arasındaki mantıksal veya işlevsel ilişkiyi bir cümleyle açıklayınız.`,
        lines: 2,
      },
      {
        id: 'q3',
        prompt: `3. Adım (Derinleştirme): Bu kavramları günlük hayatınızda nerede ve nasıl gözlemleyebilirsiniz? Bir örnek veriniz.`,
        lines: 2,
      },
    ],
  });

  // 3. Destekleyici Pekiştirme Drili
  builder.addSupportingDrill(
    'Kavram Kontrolü ve Eşleştirme',
    {
      description: 'Öğrendiğiniz kavramları aşağıdaki durumlarla eşleştiriniz ve doğruluk kutusunu işaretleyiniz.',
      options: [
        '[ ] Kavramın tanımını ve temel işlevini anladım.',
        '[ ] Günlük yaşamdan en az bir somut örnek bulabildim.',
        '[ ] Çözüm yolunu kendi cümlelerimle ifade edebildim.',
      ],
    },
    'text'
  );

  // 4. Öğretmen / Pedagojik Not
  builder.addPrimaryActivity('text', {
    content: `💡 **Öğretmen ve Veli Notu:** Bu etkinlik; özel öğrenme desteğine ihtiyaç duyan çocuklarda kavramsal haritalama, sözel ifade ve çalışma belleği fonksiyonlarını eşzamanlı olarak destekler.`,
    style: {
      backgroundColor: '#fef3c7',
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid #fde68a',
      color: '#92400e',
      fontSize: 11,
    },
  });

  return builder.addSuccessIndicator().build();
}
