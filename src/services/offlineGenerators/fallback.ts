import { ActivityType, GeneratorOptions, SingleWorksheetData } from '../../types';
import { WorksheetBuilder } from '../generators/core/WorksheetBuilder';

/**
 * generateOfflineFallback — Çevrimdışı (Hızlı) Yedek Motoru
 * 
 * Henüz spesifik bir çevrimdışı üreticisi olmayan aktiviteler için
 * standart bir 'Premium' şablon sunar.
 */
export async function generateOfflineFallback(
  type: ActivityType,
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { difficulty = 'Orta' } = options;

  const builder = new WorksheetBuilder(type, `${type} Çalışma Kağıdı`)
    .addPremiumHeader()
    .setInstruction("Aşağıdaki aktiviteyi öğretmeninizin rehberliğinde tamamlayınız.")
    .addPrimaryActivity('text', {
      content: `Bu ${type} aktivitesi için henüz otomatik bir hızlı şablon bulunmamaktadır. Lütfen yapay zeka (AI) modunu kullanarak daha zengin bir içerik üretin veya bu alanı serbest çalışma için kullanın.`,
      style: { textAlign: 'center', color: '#64748b', fontSize: 16 }
    });

  return builder.addSuccessIndicator().build();
}
