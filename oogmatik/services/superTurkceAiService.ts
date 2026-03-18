import { generateWithSchema } from './geminiClient';
import { buildSTDynamicSchema, compileSTModuleSettingsToPrompt } from './superTurkceSchemaBuilder';
import { SuperTurkceModuleSettings } from '../types/superTurkceModules';
import {
  GradeLevel,
  BloomLevel,
  curriculumOntology,
  bloomStrategies,
  tier2Words,
} from '../data/curriculumOntology';

export const buildSTAggregatedContext = (
  grade: GradeLevel,
  unit: string,
  bloomLevel: BloomLevel,
  studentProfile: string
): string => {
  // 1. Ontolojiyi Çek
  // Ünite ismi eşleşmesini genişletebiliriz. Türkçe okuma odaklı.
  const subjectKey = 'turkce_okuma';
  const objectives = curriculumOntology[grade]?.[subjectKey] || [];

  // Eğer belirli bir ünite/konu varsa filtreleyebiliriz, şimdilik tüm kazanımları birleştirip genel bir bağlam vereceğiz
  // (Veya arayüzden spesifik kazanım objesi yollayabiliriz)
  const objectiveText =
    objectives.length > 0
      ? objectives
          .map(
            (obj) =>
              `- Kazanım (${obj.code}): ${obj.description}\\n  Klinik Kısıt: ${obj.neuroConstraint}\\n  Anahtar Kelimeler: ${obj.keywords.join(', ')}`
          )
          .join('\\n\\n')
      : `- Sınıf seviyesine uygun Türkçe Okuma Anlama kazanımları.`;

  const bloomInstruction = bloomStrategies[bloomLevel];
  const words = tier2Words[grade] || [];

  let profileInstruction = '';
  if (studentProfile === 'dyslexia_mild') {
    profileInstruction =
      'ÖĞRENCİ PROFİLİ (Hafif Disleksi): Cümleleri kısa tut. Yazı yoğunluğunu azalt. Etken çatı kullan. Pasif cümle (edilgen) kullanma.';
  } else if (studentProfile === 'dyslexia_deep') {
    profileInstruction =
      'ÖĞRENCİ PROFİLİ (Derin Disleksi): ÇOK KRİTİK! Maksimum 5-6 kelimelik cümleler kur. Soyut HİÇBİR kavram kullanma. P-B, D-B gibi çeldirici harfleri yan yana getirme. Sadece somut olaylar kurgula.';
  } else if (studentProfile === 'adhd') {
    profileInstruction =
      'ÖĞRENCİ PROFİLİ (DEHB): Yönergeleri çok belirgin numaralandır. Dikkat dağıtıcı betimleme (sıfat tamlaması vs.) yapma. Sadeleştir.';
  } else {
    profileInstruction =
      'ÖĞRENCİ PROFİLİ (Standart): Genel MEB standartlarında, anlaşılır ve temiz bir dil kullan.';
  }

  return `
[ONTOLOJİK MÜFREDAT BAĞLAMI]
Hedef Kitle: ${grade}. Sınıf
Ünite/Konu: ${unit}
Bilişsel Taksonomi Seviyesi (Bloom): ${bloomLevel.toUpperCase()} -> ${bloomInstruction}

${profileInstruction}

[ZORUNLU KAZANIMLAR VE KISITLAR]
Aşağıdaki kazanım hedeflerine ve kısıtlamalarına harfiyen uymalısın:
${objectiveText}

[KULLANILABİLECEK TIER-2 AKADEMİK KELİMELER]
Metin kurgusu içine serpiştirilecek pedagojik kelimeler: ${words.join(', ')}
`;
};

export const generateSuperTurkceModules = async (
  modules: SuperTurkceModuleSettings[],
  contextOptions: {
    grade: GradeLevel;
    unit: string;
    bloomLevel: BloomLevel;
    studentProfile: string;
  }
): Promise<Record<string, any>> => {
  const schema = buildSTDynamicSchema(modules);
  const settingsPrompt = compileSTModuleSettingsToPrompt(modules);
  const contextPrompt = buildSTAggregatedContext(
    contextOptions.grade,
    contextOptions.unit,
    contextOptions.bloomLevel,
    contextOptions.studentProfile
  );

  const finalPrompt = `
Sen "Süper Türkçe V2" Ultra Premium Klinik Eğitim Mimarısın.
Aşağıdaki Müfredat Bağlamı ve Modül Özel Ayarlarına SIKI SIKIYA uyarak, benden istenen JSON verisini SIFIR HATA ile üret.

${contextPrompt}

${settingsPrompt}

[KESİN KURALLAR]
- İstenen modüller dışında HİÇBİR bileşen üretme.
- ASLA JSON dışında metin (Markdown vb.) veya açıklama döndürme.
- Her modülün içindeki kendi [Klinik Kısıt] kurallarını birincil emir olarak kabul et.
    `;

  try {
    const result = await generateWithSchema(finalPrompt, schema);
    if (result && result.modules) {
      return result.modules;
    }
    return result;
  } catch (error: any) {
    console.error('Super Turkce V2 AI Error:', error);
    throw new Error(error.message || 'İçerik üretilirken bir hata oluştu.');
  }
};

/**
 * Faz 3.3: Hızlı Mod (Fast Mode)
 * Seçilen sınıfa göre pedagojik olarak en uygun 3 modülü otomatik seçer.
 */
export const getFastModeModules = (grade: GradeLevel): SuperTurkceModuleSettings[] => {
  const generateId = () => Math.random().toString(36).substring(2, 9);

  // Temel bir okuma metni herkes için şart
  const reading: SuperTurkceModuleSettings = {
    id: `st_scaffolded_reading_${generateId()}`,
    type: 'st_scaffolded_reading',
    maxWords: parseInt(grade) <= 2 ? 30 : parseInt(grade) <= 4 ? 60 : 100,
    syllableColoring: parseInt(grade) <= 2,
    focusBar: true,
  };

  if (parseInt(grade) <= 3) {
    return [
      reading,
      { id: `st_fluency_pyramid_${generateId()}`, type: 'st_fluency_pyramid', linesCount: 4 },
      {
        id: `st_dual_coding_match_${generateId()}`,
        type: 'st_dual_coding_match',
        matchType: 'synonym',
        pairCount: 3,
      },
    ];
  } else if (parseInt(grade) <= 5) {
    return [
      reading,
      { id: `st_guided_cloze_${generateId()}`, type: 'st_guided_cloze', distractorCount: 1 },
      { id: `st_story_sequencing_${generateId()}`, type: 'st_story_sequencing', stepCount: 4 },
    ];
  } else {
    return [
      reading,
      {
        id: `st_cause_effect_analysis_${generateId()}`,
        type: 'st_cause_effect_analysis',
        difficulty: 'inferential',
      },
      {
        id: `st_scaffolded_open_${generateId()}`,
        type: 'st_scaffolded_open',
        includeStarter: false,
      },
    ];
  }
};
