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
        options: ['6', '9', '12', '15'],
        defaultValue: '15',
        description: 'A4 sayfasına sığacak soru adedi (3 sütunlu ızgara düzeni).'
      },
      {
        name: 'lineCount',
        label: 'Satır Sayısı',
        type: 'number',
        defaultValue: 2,
        description: 'Her kutudaki cevap satırı sayısı (1-3).'
      },
      {
        name: 'colorMode',
        label: 'Renk Modu',
        type: 'enum',
        options: ['Karma Renkli', 'Tek Renk (Premium)'],
        defaultValue: 'Karma Renkli',
        description: 'Kutuların sınır renk düzeni.'
      }
    ]
  },
  template: 'short-answer-grid'
};
