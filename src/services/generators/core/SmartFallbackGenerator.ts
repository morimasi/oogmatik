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
  const opts = options as Record<string, unknown>;
  const { topic, difficulty, studentAge, profile, variant, subVariant, itemCount, mixedMode, includeElapsed, includeRoutine } = opts;
  const template = getPromptTemplate(type);

  // ── SYSTEM PROMPT ─────────────────────────────────────────────
  const baseSystemPrompt = `
Sen, bdmind platformunun kıdemli Pedagojik İçerik Tasarımcısısın.
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

  let specificSuffix = template?.systemPromptSuffix || `
Görevin: "${type}" aktivitesi için premium çalışma kağıdı üret.
YAPI:
- Ana Görev (Primary Task): Aktivite türüne özgü ana içerik bloğu.
- Destekleyici Dril (Supporting Drill): 3-5 kısa pekiştirme sorusu.
- Pedagojik Not: Hangi bilişsel beceriyi geliştirdiği (bilimsel temelli).
FORMAT: JSON olarak dön.`;

  // Inject variant options into prompt placeholders
  specificSuffix = specificSuffix
    .replace('{variant}', (variant as string) || 'analog-to-digital')
    .replace('{subVariant}', (subVariant as string) || 'standard')
    .replace('{itemCount}', String(itemCount || 12))
    .replace('{mixedMode}', mixedMode ? 'Açık' : 'Kapalı')
    .replace('{includeElapsed}', includeElapsed ? 'Açık' : 'Kapalı')
    .replace('{includeRoutine}', includeRoutine ? 'Açık' : 'Kapalı');

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
  const activityContentSchema: Record<string, unknown> = template?.extraSchemaFields || {
    type: 'STRING' as const,
    description: 'Primary activity data as structured content (items, grid, questions, etc.)'
  };

  const schema = {
    type: 'OBJECT' as const,
    properties: {
      title: { type: 'STRING' as const, description: 'Activity title, engaging and clear' },
      instruction: { type: 'STRING' as const, description: 'Step-by-step instruction for the student' },
      pedagogicalNote: { type: 'STRING' as const, description: 'Teacher/parent note explaining the pedagogical value' },
      primaryActivity: {
        type: 'OBJECT' as const,
        properties: {
          type: { type: 'STRING' as const, description: 'Content type: text, grid, table, question, svg, list' },
          content: activityContentSchema
        },
        required: ['type', 'content']
      },
      supportingDrill: {
        type: 'OBJECT' as const,
        properties: {
          title: { type: 'STRING' as const, description: 'Drill title' },
          type: { type: 'STRING' as const, description: 'question, multiple_choice, fill_blank, matching' },
          content: {
            type: 'OBJECT' as const,
            description: '3-5 reinforcement questions with answers',
            properties: {
              questions: {
                type: 'ARRAY' as const,
                description: 'List of reinforcement questions',
                items: {
                  type: 'OBJECT' as const,
                  properties: {
                    question: { type: 'STRING' as const, description: 'The question text' },
                    answer: { type: 'STRING' as const, description: 'The correct answer' },
                    options: { type: 'ARRAY' as const, items: { type: 'STRING' as const }, description: 'Optional multiple choice options' }
                  },
                  required: ['question', 'answer']
                }
              }
            },
            required: ['questions']
          }
        },
        required: ['title', 'type', 'content']
      }
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
  const responseData = response as unknown as Record<string, unknown>;
  const builder = new WorksheetBuilder(type, responseData.title as unknown as string)
    .addPremiumHeader()
    .setInstruction(responseData.instruction as unknown as string)
    .addPedagogicalNote(responseData.pedagogicalNote as unknown as string)
    .addPrimaryActivity(
      (responseData.primaryActivity as unknown as Record<string, unknown>)?.type as unknown as string || 'text',
      (responseData.primaryActivity as unknown as Record<string, unknown>)?.content as unknown as Record<string, unknown> || {}
    )
    .addSupportingDrill(
      (responseData.supportingDrill as unknown as Record<string, unknown>)?.title as unknown as string || 'Pekiştirme',
      (responseData.supportingDrill as unknown as Record<string, unknown>)?.content as unknown as Record<string, unknown> || {},
      (responseData.supportingDrill as unknown as Record<string, unknown>)?.type as unknown as string || 'question'
    );

  return builder.addSuccessIndicator().build();
}
