/**
 * @file src/services/generators/infographic/adapters/adapter_short_answer.ts
 * @description Kısa Cevaplı Sorular (Ultra Premium) Infographic Adapter.
 *
 * Bora Demir standardı: any yasak, tüm parametreler tip güvenli.
 * Elif Yıldız onaylı: Pedagojik ızgara düzeni, disleksi dostu tasarım.
 */

import { InfographicGeneratorPair } from '../../../../types/infographic';
import { ActivityType } from '../../../../types/activity';

export const INFOGRAPHIC_SHORT_ANSWER: InfographicGeneratorPair = {
  activityType: ActivityType.INFOGRAPHIC_SHORT_ANSWER,
  title: 'Kısa Cevaplı Sorular (Ultra)',
  description: 'Görsel destekli, halkalı ve satırlı profesyonel soru panosu.',
  customizationSchema: {
    parameters: [
      {
        name: 'questionCount',
        label: 'Soru Sayısı',
        type: 'enum',
        options: ['6', '8', '9', '12', '15', '18', '21'],
        defaultValue: '15',
        description: 'A4 sayfasına sığacak soru adedi.'
      },
      {
        name: 'lineCount',
        label: 'Satır Sayısı',
        type: 'number',
        defaultValue: 2,
        description: 'Her kutudaki cevap satırı sayısı (1-4).'
      },
      {
        name: 'colorMode',
        label: 'Renk Modu',
        type: 'enum',
        options: ['Karma Renkli', 'Tek Renk (Vurgulu)', 'Siyah-Beyaz (Print Dostu)'],
        defaultValue: 'Karma Renkli',
        description: 'Kutuların sınır renk düzeni.'
      },
      {
        name: 'showStudentInfo',
        label: 'Öğrenci Bilgi Alanı',
        type: 'boolean',
        defaultValue: true,
        description: 'İsim, Soyisim ve Tarih alanını en üste ekler.'
      },
      {
        name: 'gridDensity',
        label: 'Izgara Sıklığı',
        type: 'enum',
        options: ['Kompakt', 'Normal', 'Geniş'],
        defaultValue: 'Kompakt',
        description: 'Kutular arası boşluk ve sayfa doluluğu.'
      },
      {
        name: 'pedagogicalFocus',
        label: 'Pedagojik Odak',
        type: 'enum',
        options: ['Genel Kavrama', 'Detay Odaklı', 'Neden-Sonuç', 'Hafıza Çalışması'],
        defaultValue: 'Genel Kavrama',
        description: 'AI sorularının hangi bilişsel beceriyi hedefleyeceği.'
      }
    ]
  },
  template: 'short-answer-grid'
};
