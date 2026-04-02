import { ActivityType, GeneratorOptions, SingleWorksheetData } from '../../../types';
import { generateCreativeMultimodal } from '../../geminiClient';
import { WorksheetBuilder } from './WorksheetBuilder';

/**
 * SmartFallbackGenerator — Akıllı AI Yedek Motoru
 * 
 * Spesifik bir jeneratörü olmayan tüm aktiviteler için
 * dinamik olarak kaliteli içerik üretir.
 */
export async function generateSmartFallbackAI(
  type: ActivityType,
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { topic, difficulty, studentAge, profile } = options;

  const SYSTEM_PROMPT = `
Sen, Oogmatik platformunun kıdemli Pedagojik İçerik Tasarımcısısın. 
Görevin, ${type} aktivitesi için "Ultra Premium" seviyede disleksi dostu bir çalışma kağıdı üretmektir.

BAĞLAM:
- Aktivite Türü: ${type}
- Yaş Grubu: ${studentAge}
- Zorluk: ${difficulty}
- Öğrenci Profili: ${profile}

ÜRETİM KURALLARI:
1. İÇERİK: Konu "${topic || 'Rastgele'}" üzerine, öğrenciyi zorlamayan ama geliştiren, "dolu dolu" bir içerik üret.
2. BÖLÜMLER: 
   - Ana Görev (Primary Task)
   - Destekleyici Dril (Supporting Drill)
   - Pedagojik Not (Bilimsel temelli - Örn: "Yönetici İşlevler", "Görsel Algı")
3. FORMAT: Yanıtın her zaman geçerli bir JSON olmalıdır.
`;

  const USER_PROMPT = `
Lütfen ${type} aktivitesi için ${difficulty} seviye ${studentAge} yaş ${profile} profiline uygun, 
A4 sayfasını kompakt ve zengin bir şekilde dolduracak bir çalışma kağıdı verisi üret.
`;

  const schema = {
    type: 'OBJECT',
    properties: {
      title: { type: 'STRING' },
      instruction: { type: 'STRING' },
        pedagogicalNote: { type: 'STRING' },
      primaryActivity: { 
          type: 'OBJECT',
          properties: {
              type: { type: 'STRING' },
              content: { type: 'OBJECT' }
          },
          required: ['type', 'content']
      },
      supportingDrill: {
          type: 'OBJECT',
          properties: {
              title: { type: 'STRING' },
              type: { type: 'STRING' },
              content: { type: 'OBJECT' }
          },
          required: ['title', 'type', 'content']
      }
    },
    required: ['title', 'instruction', 'primaryActivity', 'supportingDrill', 'pedagogicalNote']
  };

  const response = await generateCreativeMultimodal({
    prompt: USER_PROMPT,
    systemInstruction: SYSTEM_PROMPT,
    schema,
    temperature: 0.7
  });

  const builder = new WorksheetBuilder(type, response.title)
    .addPremiumHeader()
    .setInstruction(response.instruction)
    .addPedagogicalNote(response.pedagogicalNote)
    .addPrimaryActivity(response.primaryActivity.type, response.primaryActivity.content)
    .addSupportingDrill(response.supportingDrill.title, response.supportingDrill.content, response.supportingDrill.type);

  return builder.addSuccessIndicator().build();
}
