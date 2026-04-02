import { ActivityType, GeneratorOptions, SingleWorksheetData } from '../../../types';
import { generateCreativeMultimodal } from '../../geminiClient';
import { WorksheetBuilder } from './WorksheetBuilder';
import { getPromptTemplate } from '../prompts/index.js';

/**
 * EnhancedSmartGenerator — Premium AI Üretim Motoru
 *
 * Her aktivite türü için özelleştirilmiş prompt şablonları kullanarak
 * Gemini 2.5 Flash'tan "dolu dolu" A4 çalışma kağıtları üretir.
 *
 * Mimari:
 * 1. promptTemplates.ts'ten aktivite-spesifik şablon al
 * 2. Kullanıcı parametreleriyle (zorluk, yaş, konu) birleştir
 * 3. Gemini'ye gönder → JSON yanıt al
 * 4. WorksheetBuilder ile Premium A4 yapısına dönüştür
 */
export async function generateSmartFallbackAI(
  type: ActivityType,
  options: GeneratorOptions
): Promise<SingleWorksheetData> {
  const { topic, difficulty, studentAge, profile } = options;
  const template = getPromptTemplate(type);

  // ── SYSTEM PROMPT ─────────────────────────────────────────────
  const baseSystemPrompt = `
Sen, Oogmatik platformunun kıdemli Pedagojik İçerik Tasarımcısısın.
Türkiye'deki disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için
"Ultra Premium" standartlarda A4 çalışma kağıtları üretiyorsun.

GENEL PRENSİPLER:
- İçerik A4 sayfasını DOLU DOLU kaplamalı — minimal boşluk, kompakt yerleşim.
- Her bölüm pedagojik olarak gerekçelendirilmiş olmalı.
- Disleksi dostu: kısa cümleler, somut kavramlar, yüksek kontrastlı yapılar.
- Tüm metinler Türkçe olmalı.

BAĞLAM:
- Aktivite Türü: ${type}
- Yaş Grubu: ${studentAge || '8-10'}
- Zorluk: ${difficulty || 'Orta'}
- Öğrenci Profili: ${profile || 'mixed'}
- Konu: ${topic || 'Rastgele'}
`;

  const specificSuffix = template?.systemPromptSuffix || `
Görevin: "${type}" aktivitesi için premium çalışma kağıdı üret.
YAPI:
- Ana Görev (Primary Task): Aktivite türüne özgü ana içerik bloğu.
- Destekleyici Dril (Supporting Drill): 3-5 kısa pekiştirme sorusu.
- Pedagojik Not: Hangi bilişsel beceriyi geliştirdiği (bilimsel temelli).
FORMAT: JSON olarak dön.`;

  const SYSTEM_PROMPT = baseSystemPrompt + '\n' + specificSuffix;

  // ── USER PROMPT ───────────────────────────────────────────────
  const baseUserPrompt = `
Lütfen "${type}" aktivitesi için ${difficulty || 'Orta'} seviye,
${studentAge || '8-10'} yaş, ${profile || 'mixed'} profiline uygun,
A4 sayfasını kompakt ve zengin bir şekilde dolduracak bir çalışma kağıdı verisi üret.
Konu: ${topic || 'Rastgele'}`;

  const userSuffix = template?.userPromptSuffix || '';
  const USER_PROMPT = baseUserPrompt + '\n\n' + userSuffix;

  // ── GEMINI SCHEMA ─────────────────────────────────────────────
  const schema = {
    type: 'OBJECT' as const,
    properties: {
      title: { type: 'STRING' as const },
      instruction: { type: 'STRING' as const },
      pedagogicalNote: { type: 'STRING' as const },
      primaryActivity: {
        type: 'OBJECT' as const,
        properties: {
          type: { type: 'STRING' as const },
          content: { type: 'OBJECT' as const }
        },
        required: ['type', 'content']
      },
      supportingDrill: {
        type: 'OBJECT' as const,
        properties: {
          title: { type: 'STRING' as const },
          type: { type: 'STRING' as const },
          content: { type: 'OBJECT' as const }
        },
        required: ['title', 'type', 'content']
      },
      ...(template?.extraSchemaFields || {})
    },
    required: ['title', 'instruction', 'primaryActivity', 'supportingDrill', 'pedagogicalNote']
  };

  // ── GEMINI ÇAĞRISI ────────────────────────────────────────────
  const response = await generateCreativeMultimodal({
    prompt: USER_PROMPT,
    systemInstruction: SYSTEM_PROMPT,
    schema,
    temperature: 0.7
  });

  // ── PREMIUM A4 YAPISI ─────────────────────────────────────────
  const builder = new WorksheetBuilder(type, response.title)
    .addPremiumHeader()
    .setInstruction(response.instruction)
    .addPedagogicalNote(response.pedagogicalNote)
    .addPrimaryActivity(
      response.primaryActivity?.type || 'text',
      response.primaryActivity?.content || {}
    )
    .addSupportingDrill(
      response.supportingDrill?.title || 'Pekiştirme',
      response.supportingDrill?.content || {},
      response.supportingDrill?.type || 'question'
    );

  return builder.addSuccessIndicator().build();
}
