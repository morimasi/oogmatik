import { PremiumModuleSettings } from '../types/premiumModules';

/**
 * Dinamik Schema İnşa Edici (Dynamic Schema Builder)
 * Öğretmenin arayüzde (Sihirbaz) seçtiği ve ayarlarını yaptığı modüllere göre
 * Gemini API'sine (Google AI) gönderilecek JSON Şemasını inşa eder.
 */

// ==========================================
// BİLEŞEN BAZLI ŞEMA MİMARİLERİ
// ==========================================

const moduleSchemas: Record<string, any> = {
  scaffolded_reading: {
    type: 'OBJECT',
    description: 'Öğrencinin okuyacağı mikro-metin ve başlığı.',
    properties: {
      title: { type: 'STRING', description: 'Metin için kısa ve somut bir başlık.' },
      text: {
        type: 'STRING',
        description: 'Metnin kendisi. Uzunluk hedefine uygun, etken çatılı, somut ifadeler.',
      },
      keywords: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'Metindeki 3-4 adet vurgulanacak (kalın yazılacak) önemli kelime.',
      },
    },
    required: ['title', 'text', 'keywords'],
  },
  concept_matching: {
    type: 'OBJECT',
    description:
      'Kavramlar (kelimeler) ile Onları temsil eden FontAwesome İkonlarının Eşleştirilmesi.',
    properties: {
      pairs: {
        type: 'ARRAY',
        description: 'Kelimeler ve karşılık gelen doğru ikonların listesi.',
        items: {
          type: 'OBJECT',
          properties: {
            left: { type: 'STRING', description: 'Eşleştirilecek kelime (Sol taraf)' },
            rightIcon: {
              type: 'STRING',
              description:
                'Sağ taraf için temsil edici FontAwesome v6 solid icon ismi (Örn: fa-dog)',
            },
            matchId: {
              type: 'STRING',
              description: 'Aynı olan eşleri bulmak için gizli bir kimlik (Örn: match_1)',
            },
          },
          required: ['left', 'rightIcon', 'matchId'],
        },
      },
      distractors: {
        type: 'ARRAY',
        description: 'Öğrenciyi yanıltacak ekstra öğeler (Eğer hasDistractors aktifse)',
        items: {
          type: 'OBJECT',
          properties: {
            left: { type: 'STRING', description: 'Ekstra kelime çeldiricisi (İsteğe bağlı)' },
            rightIcon: { type: 'STRING', description: 'Ekstra ikon çeldiricisi (İsteğe bağlı)' },
          },
        },
      },
    },
    required: ['pairs'],
  },
  guided_cloze: {
    type: 'OBJECT',
    description: 'Kelime havuzundan seçerek boşluk doldurma sorusu.',
    properties: {
      sentence: {
        type: 'STRING',
        description: 'Eksik olan kelimenin yerine "[BLANK]" yazılmış çok kısa bir cümle.',
      },
      wordPool: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description:
          'Cümleyi tamamlayacak doğru kelime ve 2 adet çeldirici kelimeden oluşan rastgele sıralanmış havuz.',
      },
      correctWord: {
        type: 'STRING',
        description: 'Cümledeki boşluğa gelmesi gereken doğru kelime.',
      },
    },
    required: ['sentence', 'wordPool', 'correctWord'],
  },
  true_false_logic: {
    type: 'OBJECT',
    description: 'Doğru (✅) ve Yanlış (❌) ile işaretlenecek net ifadeler.',
    properties: {
      statements: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING', description: 'Kesin bir yargı bildiren kısa ve net cümle.' },
            isTrue: { type: 'BOOLEAN', description: 'İfadenin doğruluğu (True/False)' },
          },
          required: ['text', 'isTrue'],
        },
      },
    },
    required: ['statements'],
  },
  step_sequencing: {
    type: 'OBJECT',
    description:
      'Algoritmik veya kronolojik olarak 1-2-3 diye sıralanması gereken karışık adımlar.',
    properties: {
      steps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING', description: 'Olay zincirinin bir adımı.' },
            order: { type: 'INTEGER', description: 'Bu adımın doğru sırası (Örn: İlk adım 1)' },
            iconHint: {
              type: 'STRING',
              description: 'Eğer useVisuals aktifse, bu adımı temsil eden FontAwesome ikonu.',
            },
          },
          required: ['text', 'order'],
        },
      },
    },
    required: ['steps'],
  },
  scaffolded_open_ended: {
    type: 'OBJECT',
    description:
      'Öğrencinin kısa bir yanıt yazması beklenen soru, ancak cümleye başlamasına yardım edilir.',
    properties: {
      question: {
        type: 'STRING',
        description: 'Öğrencinin kendi düşüncesi veya okuduğu metinle ilgili kısa açık uçlu soru.',
      },
      sentenceStarter: {
        type: 'STRING',
        description:
          'Cevap alanında öğrenci için hazır yazılı olarak duracak başlangıç sözü. Örn: "Bence bu karakterin yaptığı şey doğruydu çünkü..."',
      },
    },
    required: ['question'],
  },
  visual_multiple_choice: {
    type: 'OBJECT',
    description: 'Büyük ve somut ikonlarla desteklenen çoktan seçmeli bir soru.',
    properties: {
      question: { type: 'STRING', description: 'Soru kökü (Net ve olumlu olmalı).' },
      options: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING', description: 'Şıkkın metni (Çok kısa olmalı).' },
            icon: {
              type: 'STRING',
              description: 'Şıkkı somutlaştıran, temsil edici FontAwesome ikonu.',
            },
            isCorrect: { type: 'BOOLEAN', description: 'Bu şık doğru mu?' },
          },
          required: ['text', 'isCorrect'],
        },
      },
    },
    required: ['question', 'options'],
  },
  spot_and_highlight: {
    type: 'OBJECT',
    description: 'Karmaşık bir dizilim içinden istenen öğeleri bulup işaretleme etkinliği.',
    properties: {
      target: {
        type: 'STRING',
        description: 'Aranacak hedef (Örn: "p" harfi, veya "ve" kelimesi)',
      },
      content: {
        type: 'STRING',
        description:
          'İçine hedeflerin (targetCount kadar) homojen ve karmaşık bir şekilde dağıtıldığı uzun metin veya karakter dizisi.',
      },
    },
    required: ['target', 'content'],
  },
  mini_mind_map: {
    type: 'OBJECT',
    description: 'Ortadaki ana konu etrafına dallanan fikir/kavram haritası.',
    properties: {
      centralTopic: { type: 'STRING', description: 'Merkezdeki ana konu başlığı.' },
      branches: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING', description: 'Ana konuya bağlı alt fikir veya kavram.' },
            isFilledByAI: {
              type: 'BOOLEAN',
              description:
                'Eğer partialFill ayarı aktifse, bazı dalları AI önceden doldurur (True), diğerlerini öğrenci bulur (False).',
            },
          },
          required: ['text', 'isFilledByAI'],
        },
      },
    },
    required: ['centralTopic', 'branches'],
  },
  exit_ticket: {
    type: 'OBJECT',
    description: 'Çalışmanın sonundaki mini üstbilişsel değerlendirme.',
    properties: {
      reflectionQuestion: {
        type: 'STRING',
        description:
          'Eğer istenirse, kısa bir öz-değerlendirme sorusu. (Örn: Bugün en çok neyi sevdim?)',
      },
    },
  },
};

// ==========================================
// ANA BİRLEŞTİRİCİ (AGGREGATOR) FONKSİYON
// ==========================================

/**
 * Gönderilen seçilmiş ayarlara (settings array) bakarak devasa şemayı oluşturur.
 * Ekranda 3 modül (instance) varsa, onlara id atayarak birleştirir.
 */
export const buildDynamicSchema = (selectedModules: PremiumModuleSettings[]): any => {
  const modulesSchemaProperties: Record<string, any> = {};

  selectedModules.forEach((mod) => {
    // Her instance id için bir key (Örn: "scaffolded_reading_1")
    const instanceId = mod.id;
    const schemaTemplate = moduleSchemas[mod.type];

    if (schemaTemplate) {
      modulesSchemaProperties[instanceId] = schemaTemplate;
    }
  });

  return {
    type: 'OBJECT',
    properties: {
      modules: {
        type: 'OBJECT',
        description:
          'Arayüzdeki her bir modülün (ID ye göre) içeriği. Bu bir haritadır (Map/Record).',
        properties: modulesSchemaProperties,
        required: Object.keys(modulesSchemaProperties), // Tüm seçilen modüller zorunludur
      },
    },
    required: ['modules'],
  };
};

/**
 * Prompt Enjektörü
 * Seçilen modüllerin "Ayarlarını" Gemini'ye text komutu olarak derler.
 * Çünkü JSON schema sadece tipi belirler, "hedef kelime max 50 olsun" diyemez.
 */
export const compileModuleSettingsToPrompt = (selectedModules: PremiumModuleSettings[]): string => {
  let settingsPrompt = '\\n[BİLEŞEN BAZLI ÖZEL AYARLAR]\\n';

  selectedModules.forEach((mod) => {
    settingsPrompt += `- **Modül ID: ${mod.id} (${mod.type})**\\n`;

    switch (mod.type) {
      case 'scaffolded_reading':
        settingsPrompt += `  -> Üreteceğin metin en fazla ${mod.maxWords} kelime olmalıdır.\\n`;
        if (mod.highlightKeywords)
          settingsPrompt += `  -> Metnin ana fikrini yansıtan en kritik kelimeleri "keywords" dizisine eklemelisin.\\n`;
        break;
      case 'concept_matching':
        settingsPrompt += `  -> Tam olarak ${mod.pairCount} adet doğru eşleşme çifti üret.\\n`;
        if (mod.hasDistractors)
          settingsPrompt += `  -> 1 veya 2 adet alakasız çeldirici kelime/ikon ekle.\\n`;
        break;
      case 'guided_cloze':
        settingsPrompt += `  -> Boşluk doldurma cümlesi son derece yalın ve tek yargılı olmalı.\\n`;
        break;
      case 'true_false_logic':
        settingsPrompt += `  -> Tam olarak ${mod.questionCount} adet yargı cümlesi üret.\\n`;
        if (!mod.allowNegativePhrasing)
          settingsPrompt += `  -> DİKKAT: Cümlelerde asla negatif "-me, -ma" (yapmamalıdır vb.) ekleri kullanma. Hepsi olumlu yargılar olmalı (ister doğru, ister yanlış ifade olsun).\\n`;
        break;
      case 'step_sequencing':
        settingsPrompt += `  -> Bir eylemi veya hikayeyi kronolojik olarak tam ${mod.stepCount} adıma böl.\\n`;
        if (mod.useVisuals)
          settingsPrompt += `  -> Her adım için olayı sembolize eden FontAwesome (solid) ikonu ver.\\n`;
        break;
      case 'scaffolded_open_ended':
        if (mod.provideSentenceStarter)
          settingsPrompt += `  -> Sorunun altına, öğrencinin cevaba giriş yapabilmesi için bir Sentence Starter (cümle başı ipucu) yaz.\\n`;
        break;
      case 'visual_multiple_choice':
        settingsPrompt += `  -> Şık sayısı kesinlikle ${mod.optionCount} adet olmalıdır.\\n`;
        settingsPrompt += `  -> Her şıkkı destekleyen mantıklı bir ikon (FontAwesome v6 solid) eklemelisin.\\n`;
        break;
      case 'spot_and_highlight':
        settingsPrompt += `  -> Öğrencinin arayacağı hedef türü: "${mod.targetType}". Bu hedeften içeriğin içinde tam olarak ${mod.targetCount} adet geçir.\\n`;
        break;
      case 'mini_mind_map':
        settingsPrompt += `  -> Merkezden çıkan tam ${mod.branchCount} adet mantıklı dal oluştur.\\n`;
        if (mod.partialFill)
          settingsPrompt += `  -> Bu dalların yaklaşık yarısını "isFilledByAI: true" yap (Yani öğrenciye hazır verilecek).\\n`;
        break;
      case 'exit_ticket':
        if (mod.includeReflectionQuestion)
          settingsPrompt += `  -> Öğrenci için duygu durumlarına yönelik 1 cümlelik basit yansıtma sorusu üret.\\n`;
        break;
    }
    settingsPrompt += '\\n';
  });

  return settingsPrompt;
};
