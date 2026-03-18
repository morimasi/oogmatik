import { SuperTurkceModuleSettings } from '../types/superTurkceModules';

const stModuleSchemas: Record<string, any> = {
  st_fluency_pyramid: {
    type: 'OBJECT',
    description: 'Tekrarlı okuma için yukarıdan aşağıya büyüyen kelime piramidi.',
    properties: {
      targetWord: { type: 'STRING', description: 'Odaklanılacak zor kelime.' },
      pyramidLines: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'Piramit satırları. İlk satır tek kelime, son satır tam cümle olmalı.',
      },
    },
    required: ['targetWord', 'pyramidLines'],
  },
  st_scaffolded_reading: {
    type: 'OBJECT',
    description: 'Öğrencinin okuyacağı, kısa, etken çatılı ve disleksiye uygun metin.',
    properties: {
      title: { type: 'STRING', description: 'Metin başlığı.' },
      text: {
        type: 'STRING',
        description: 'Metnin kendisi. Uzunluk sınırına uyulmalı, soyut ifadelerden kaçınılmalıdır.',
      },
    },
    required: ['title', 'text'],
  },
  st_semantic_mapping: {
    type: 'OBJECT',
    description: 'Metin veya olayla ilgili 5N1K (Görsel Zihin Haritası) bilgileri.',
    properties: {
      centralEvent: { type: 'STRING', description: 'Merkezdeki ana olay veya konu.' },
      nodes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            question: { type: 'STRING', description: 'Kim, Ne, Nerede vb. soru kelimesi.' },
            answer: { type: 'STRING', description: 'Sorunun kısa cevabı.' },
            icon: {
              type: 'STRING',
              description:
                'Soruyu temsil eden FontAwesome ikonu (Örn: Kim için fa-user, Nerede için fa-map-location-dot)',
            },
          },
          required: ['question', 'answer', 'icon'],
        },
        description: 'Seçilen sorular ve kısa cevapları.',
      },
    },
    required: ['centralEvent', 'nodes'],
  },
  st_guided_cloze: {
    type: 'OBJECT',
    description: 'Elkonin kutulu (kutu uzunluğuna göre ipucu) yönlendirmeli boşluk doldurma.',
    properties: {
      sentence: {
        type: 'STRING',
        description: 'Eksik olan kelimenin yerine "[BLANK]" konmuş çok kısa cümle.',
      },
      wordPool: {
        type: 'ARRAY',
        items: { type: 'STRING' },
        description: 'Doğru kelime ve varsa çeldiriciler dahil kelime havuzu.',
      },
      correctWord: { type: 'STRING', description: 'Doğru kelimenin kendisi.' },
    },
    required: ['sentence', 'wordPool', 'correctWord'],
  },
  st_dual_coding_match: {
    type: 'OBJECT',
    description: 'Eş/Zıt anlamlı veya tanım kavramları ile ikonların eşleştirilmesi.',
    properties: {
      pairs: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            left: { type: 'STRING', description: 'Eşleştirilecek sol kelime/kavram.' },
            rightText: {
              type: 'STRING',
              description: 'Karşılık gelen sağ kelime/anlam (opsiyonel).',
            },
            rightIcon: {
              type: 'STRING',
              description: 'Kavramı/Cevabı görselleştiren FontAwesome ikonu.',
            },
            matchId: { type: 'STRING', description: 'Eşleri birbirine bağlayan benzersiz ID.' },
          },
          required: ['left', 'rightIcon', 'matchId'],
        },
      },
    },
    required: ['pairs'],
  },
  st_story_sequencing: {
    type: 'OBJECT',
    description: 'Olayların mantıksal sıralanması (Yürütücü İşlevler).',
    properties: {
      steps: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            text: { type: 'STRING', description: 'Olayın adımı (Kısa cümle).' },
            order: { type: 'INTEGER', description: 'Doğru sırası (Örn: 1, 2, 3).' },
          },
          required: ['text', 'order'],
        },
      },
    },
    required: ['steps'],
  },
  st_cause_effect_analysis: {
    type: 'OBJECT',
    description: 'LGS mantığı sebep-sonuç ilişkisi tablosu.',
    properties: {
      scenario: { type: 'STRING', description: 'Kısa olay/senaryo.' },
      cause: { type: 'STRING', description: 'Olayın sebebi.' },
      effect: { type: 'STRING', description: 'Olayın sonucu.' },
      inferenceQuestion: {
        type: 'STRING',
        description: 'Çıkarım sorusu (Örn: Eğer böyle olmasaydı ne olurdu?).',
      },
      inferenceAnswer: { type: 'STRING', description: 'Çıkarım cevabı.' },
    },
    required: ['scenario', 'cause', 'effect', 'inferenceQuestion', 'inferenceAnswer'],
  },
  st_radar_true_false: {
    type: 'OBJECT',
    description: 'Büyük ✅/❌ ikonlarıyla cevaplanacak Doğru/Yanlış ifadeleri.',
    properties: {
      statements: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            text: {
              type: 'STRING',
              description: 'Net bir yargı cümlesi. Negatif (-me, -ma) ek içermemeli.',
            },
            isTrue: { type: 'BOOLEAN', description: 'Doğru mu?' },
          },
          required: ['text', 'isTrue'],
        },
      },
    },
    required: ['statements'],
  },
  st_spot_highlight: {
    type: 'OBJECT',
    description: 'Metin/Harf matrisi içinden belirli bir hedefi bulma/boyama etkinliği.',
    properties: {
      instruction: {
        type: 'STRING',
        description:
          'Yönerge (Örn: "Aşağıdaki kelimelerden eş anlamlısı olanları bul ve işaretle.")',
      },
      target: { type: 'STRING', description: 'Aranacak hedef(ler).' },
      content: {
        type: 'STRING',
        description: 'İçinde hedef kelime/harflerin bolca geçtiği paragraf veya kelime kümesi.',
      },
    },
    required: ['instruction', 'target', 'content'],
  },
  st_scaffolded_open: {
    type: 'OBJECT',
    description: 'Destekli (Başlama cümleli) açık uçlu soru.',
    properties: {
      question: { type: 'STRING', description: 'Öğrenciye yöneltilen açık uçlu soru.' },
      sentenceStarter: {
        type: 'STRING',
        description:
          'Cevap satırının başındaki ilk kelimeler (Sentence Starter). Örn: "Bence kahraman hata yaptı, çünkü..."',
      },
    },
    required: ['question'],
  },
};

export const buildSTDynamicSchema = (selectedModules: SuperTurkceModuleSettings[]): any => {
  const modulesSchemaProperties: Record<string, any> = {};

  selectedModules.forEach((mod) => {
    const instanceId = mod.id;
    const schemaTemplate = stModuleSchemas[mod.type];
    if (schemaTemplate) {
      modulesSchemaProperties[instanceId] = schemaTemplate;
    }
  });

  return {
    type: 'OBJECT',
    properties: {
      modules: {
        type: 'OBJECT',
        description: 'Seçilen modüllerin id leri ve verileri.',
        properties: modulesSchemaProperties,
        required: Object.keys(modulesSchemaProperties),
      },
    },
    required: ['modules'],
  };
};

export const compileSTModuleSettingsToPrompt = (
  selectedModules: SuperTurkceModuleSettings[]
): string => {
  let settingsPrompt = '\\n[SÜPER TÜRKÇE V2 - BİLEŞEN ÖZEL AYARLARI]\\n';

  selectedModules.forEach((mod) => {
    settingsPrompt += `- **Modül ID: ${mod.id} (${mod.type})**\\n`;
    switch (mod.type) {
      case 'st_fluency_pyramid':
        settingsPrompt += `  -> Üreteceğin okuma piramidi tam olarak ${mod.linesCount} satır olmalıdır. İlk satır tek kelime ile başlamalıdır.\\n`;
        break;
      case 'st_scaffolded_reading':
        settingsPrompt += `  -> Mikro metin maksimum ${mod.maxWords} kelime ile sınırlandırılmıştır. Cümleleri çok kısa ve somut tut.\\n`;
        break;
      case 'st_semantic_mapping':
        const askedQuestions = [
          mod.askWho && 'Kim',
          mod.askWhat && 'Ne',
          mod.askWhere && 'Nerede',
          mod.askWhen && 'Ne Zaman',
          mod.askHow && 'Nasıl',
          mod.askWhy && 'Niçin',
        ].filter(Boolean);
        settingsPrompt += `  -> 5N1K (Zihin Haritası) için SADECE şu soruları üret: ${askedQuestions.join(', ')}.\\n`;
        break;
      case 'st_guided_cloze':
        settingsPrompt += `  -> Boşluk doldurma sorusuna doğru cevabın yanına ekstra ${mod.distractorCount} adet kelime çeldirici (distractor) ekle.\\n`;
        break;
      case 'st_dual_coding_match':
        settingsPrompt += `  -> ${mod.matchType} temalı, tam olarak ${mod.pairCount} adet eşleşme çifti üret.\\n`;
        break;
      case 'st_story_sequencing':
        settingsPrompt += `  -> Olayları mantıksal veya kronolojik olarak tam ${mod.stepCount} adıma böl.\\n`;
        break;
      case 'st_cause_effect_analysis':
        settingsPrompt += `  -> Zorluk seviyesi: ${mod.difficulty}. Eğer direct ise net bir sebep, inferential ise çıkarım gerektiren dolaylı bir etki üret.\\n`;
        break;
      case 'st_radar_true_false':
        settingsPrompt += `  -> Tam olarak ${mod.statementCount} yargı cümlesi üret.\\n`;
        if (mod.forbidNegativePhrasing) {
          settingsPrompt += `  -> KESİN KURAL: Hiçbir cümlede negatif (-me, -ma) ek, "yapmamalıdır", "değildir" gibi ifadeler KULLANILAMAZ. Tüm ifadeler OLUMLU DÜZ CÜMLE yapısında olmalıdır.\\n`;
        }
        break;
      case 'st_spot_highlight':
        settingsPrompt += `  -> Hedef türü: "${mod.targetType}". Bu hedeften içeriğin (content) içinde tam olarak ${mod.targetCount} adet bulunmalıdır.\\n`;
        break;
      case 'st_scaffolded_open':
        if (mod.includeStarter) {
          settingsPrompt += `  -> Öğrencinin açık uçlu soruyu cevaplamaya başlaması için, cevabın giriş kısmını (Sentence Starter) hazır olarak "sentenceStarter" içine yaz.\\n`;
        }
        break;
    }
    settingsPrompt += '\\n';
  });

  return settingsPrompt;
};
