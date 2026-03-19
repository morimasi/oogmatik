import { TemplateDef } from '../../core/types';

export const phoneticsFormats: TemplateDef[] = [
    {
        id: 'PHONO_01_SOUND_DROP',
        studioId: 'ses-olaylari',
        label: 'Ünlü Düşmesi Kaydırağı',
        description: 'İki heceli kelimeye sesli harf geldiğinde düşen harfi bul.',
        icon: 'fa-arrow-down-long',
        difficulty: 'orta',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                words: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            root: { type: "STRING" },
                            suffix: { type: "STRING" },
                            result: { type: "STRING" },
                            droppedVowel: { type: "STRING" }
                        },
                        required: ["root", "suffix", "result", "droppedVowel"]
                    }
                }
            },
            required: ["words"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      ${grade}. sınıf Ses Bilgisi konusuna uygun ${s.kelimeSayisi} adet KESİN ünlü düşmesine (Hece düşmesi) uğrayan kelime seç.
      Kök halini (root), köke gelen ünlü ile başlayan eki (suffix) ve birleşmiş (düşmüş) halini (result) ver.
      Ayrıca hangi sesin düştüğünü droppedVowel olarak belirt.
    `,
        fastGenerate: () => ({
            words: [
                { root: "Burun", suffix: "um", result: "Burnum", droppedVowel: "u" },
                { root: "Gönül", suffix: "üm", result: "Gönlüm", droppedVowel: "ü" },
                { root: "Fikir", suffix: "i", result: "Fikri", droppedVowel: "i" }
            ]
        })
    },
    {
        id: 'PHONO_02_HARDENING_SOFTENING',
        studioId: 'ses-olaylari',
        label: 'Sertleşme/Yumuşama Tahterevallisi',
        description: 'Ünsüz benzeşmesi ve yumuşamasını aynı bağlamda tespit.',
        icon: 'fa-scale-balanced',
        difficulty: 'zor',
        settings: [
            { key: 'odak', label: 'Odak Noktası', type: 'select', defaultValue: 'Karma', options: ['Karma', 'Sadece Sertleşme (Benzeşme)', 'Sadece Yumuşama'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                text: { type: "STRING" },
                events: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            word: { type: "STRING" },
                            type: { type: "STRING" }, // Sertleşme veya Yumuşama
                            changesFromTo: { type: "STRING" } // Örn: ç -> c veya d -> t
                        },
                        required: ["word", "type", "changesFromTo"]
                    }
                }
            },
            required: ["text", "events"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" temalı kısa ve akıcı bir metin yaz.
        Metnin içine olabildiğince çok Ünsüz Yumuşaması (p,ç,t,k -> b,c,d,g,ğ) ve Ünsüz Benzeşmesi (Sertleşmesi) (f,s,t,k,ç,ş,h,p yanına c,d,g gelerek ç,t,k olması) yerleştir.
        Filtre: ${s.odak}. Sınıf: ${grade}.
        events dizisinde her bir ses olayını, kelimenin metindeki çekimli halini (word) ve değişimi (changesFromTo) yaz.
      `,
        fastGenerate: () => ({
            text: "Ağacın altındaki çocuk sokakta oynarken kitabını düşürdü. Dolapta kalan sütü içip yatağına koştu.",
            events: [
                { word: "Ağacın", type: "Ünsüz Yumuşaması", changesFromTo: "ç -> c" },
                { word: "sokakta", type: "Ünsüz Benzeşmesi (Sertleşme)", changesFromTo: "d -> t" },
                { word: "kitabını", type: "Ünsüz Yumuşaması", changesFromTo: "p -> b" },
                { word: "Dolapta", type: "Ünsüz Benzeşmesi (Sertleşme)", changesFromTo: "d -> t" },
                { word: "yatağına", type: "Ünsüz Yumuşaması", changesFromTo: "k -> ğ" }
            ]
        })
    }
];
