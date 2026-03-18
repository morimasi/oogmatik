import { generateWithSchema } from './geminiClient';
import { buildDynamicSchema, compileModuleSettingsToPrompt } from './schemaBuilder';
import { PremiumModuleSettings, GradeLevel, BloomLevel } from '../types/premiumModules';
import { curriculumOntology, bloomStrategies, tier2Words } from '../data/curriculumOntology';

/**
 * Faz 3.1: Context Aggregator (Bağlam Birleştirici)
 * Öğretmenin seçtiği Sınıf, Ünite ve Bloom seviyesini bir araya getirip
 * Gemini'ye gönderilecek devasa bağlam (Context) metnini oluşturur.
 */
export const buildAggregatedContext = (
  grade: GradeLevel,
  subject: string,
  bloomLevel: BloomLevel,
  studentProfile: string
): string => {
  // 1. Müfredat Ontolojisini Çek
  const subjectKey = subject.toLowerCase().includes('türkçe')
    ? 'turkce_okuma'
    : subject.toLowerCase().includes('hayat')
      ? 'hayat_bilgisi'
      : 'genel';

  const objectives = curriculumOntology[grade]?.[subjectKey] || [];
  const objectiveText =
    objectives.length > 0
      ? objectives
          .map(
            (obj) =>
              `- Kazanım (${obj.code}): ${obj.description}\\n  Klinik Kısıt: ${obj.neuroConstraint}`
          )
          .join('\\n')
      : `- Sınıf seviyesine uygun ${subject} kazanımları.`;

  // 2. Taksonomi ve Kelime Havuzu
  const bloomInstruction = bloomStrategies[bloomLevel];
  const words = tier2Words[grade] || [];

  // 3. Profil (Nöro-Kısıt) Yönergesi
  let profileInstruction = '';
  if (studentProfile === 'dyslexia_mild') {
    profileInstruction =
      'ÖĞRENCİ PROFİLİ (Hafif Disleksi): Cümleleri kısa tut. Yazı yoğunluğunu azalt. Etken çatı kullan.';
  } else if (studentProfile === 'dyslexia_deep') {
    profileInstruction =
      'ÖĞRENCİ PROFİLİ (Derin Disleksi): ÇOK KRİTİK! Maksimum 5-6 kelimelik cümleler kur. Soyut HİÇBİR kavram kullanma. p-b, d-b gibi çeldirici harfleri aynı kelimede kullanma.';
  } else if (studentProfile === 'adhd') {
    profileInstruction =
      'ÖĞRENCİ PROFİLİ (DEHB): Yönergeleri numaralandır (1, 2, 3). Dikkat dağıtıcı gereksiz edebi süslemeler yapma.';
  } else {
    profileInstruction =
      'ÖĞRENCİ PROFİLİ (Standart): Genel MEB standartlarında, anlaşılır bir dil kullan.';
  }

  return `
[ONTOLOJİK MÜFREDAT BAĞLAMI]
Hedef Kitle: ${grade}. Sınıf
Ders: ${subject}
Bilişsel Taksonomi Seviyesi (Bloom): ${bloomLevel.toUpperCase()} -> ${bloomInstruction}

${profileInstruction}

[ZORUNLU KAZANIMLAR VE KISITLAR]
${objectiveText}

[KULLANILABİLECEK TIER-2 AKADEMİK KELİMELER]
Lütfen bu kelimelerden uygun olanları metinlere serpiştir: ${words.join(', ')}
`;
};

/**
 * Faz 3.2: AI Üretim Tetikleyicisi
 * Dinamik şemayı ve bağlamı birleştirip Gemini'den veriyi çeker.
 */
export const generatePremiumModules = async (
  modules: PremiumModuleSettings[],
  contextOptions: {
    grade: GradeLevel;
    subject: string;
    bloomLevel: BloomLevel;
    studentProfile: string;
  }
): Promise<Record<string, any>> => {
  // 1. Şemayı ve Prompt'u İnşa Et
  const schema = buildDynamicSchema(modules);
  const settingsPrompt = compileModuleSettingsToPrompt(modules);
  const contextPrompt = buildAggregatedContext(
    contextOptions.grade,
    contextOptions.subject,
    contextOptions.bloomLevel,
    contextOptions.studentProfile
  );

  const finalPrompt = `
Sen "Premium Studio" Mimarısın.
Aşağıdaki Müfredat Bağlamı ve Modül Özel Ayarlarına SIKI SIKIYA uyarak benden istenen JSON verisini üret.

${contextPrompt}

${settingsPrompt}

ASLA AÇIKLAMA YAZMA. SADECE GEÇERLİ BİR JSON DÖNDÜR.
    `;

  try {
    // GeminiClient.ts üzerinden isteği atıyoruz
    // Sistem komutları sistemde zaten yüklü, biz sadece prompt ve schema yolluyoruz
    const result = await generateWithSchema(finalPrompt, schema);

    // Dönen JSON'ın 'modules' anahtarı altındaki verileri alıyoruz
    if (result && result.modules) {
      return result.modules;
    } else {
      // Eğer Gemini direkt modül id'lerini root'ta döndürdüyse
      return result;
    }
  } catch (error: any) {
    console.error('Premium Studio AI Error:', error);
    throw new Error(error.message || 'İçerik üretilirken bir hata oluştu.');
  }
};
