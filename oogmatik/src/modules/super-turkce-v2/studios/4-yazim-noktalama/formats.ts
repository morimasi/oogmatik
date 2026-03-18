import { TemplateDef } from '../../core/types';

export const orthographyFormats: TemplateDef[] = [
    {
        id: 'ORTHO_01_DOCTOR',
        studioId: 'yazim-noktalama',
        label: 'Metin Doktoru (Yazım)',
        description: 'Bilinçli yazım yanlışlarını bulup altını çizme.',
        icon: 'fa-user-doctor',
        difficulty: 'zor',
        settings: [
            { key: 'hataSayisi', label: 'Toplam Hata', type: 'range', defaultValue: 5, min: 3, max: 10 },
            { key: 'odakKonu', label: 'Sadece Şuna Odaklan', type: 'select', defaultValue: 'Karma', options: ['Karma', 'de/da, ki, mi', 'Büyük Harfler', 'Sayılar/Tarihler'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                textWithErrors: { type: "STRING", description: "Öğrenci metni" },
                corrections: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            wrongWord: { type: "STRING" },
                            correctWord: { type: "STRING" },
                            rule: { type: "STRING", description: "Kural açıklaması" }
                        },
                        required: ["wrongWord", "correctWord", "rule"]
                    }
                }
            },
            required: ["textWithErrors", "corrections"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı, ${grade}. sınıf düzeyinde akıcı bir paragraf yaz.
      Paragraf içine ${s.odakKonu} türünde TDK ile ÇELİŞEN ${s.hataSayisi} adet yazım yanlışı yerleştir.
      textWithErrors içine metni ver.
      corrections dizisine yanlış yazılmış kelimeyi, doğrusunu ve kuralı yaz.
    `,
        fastGenerate: () => ({
            textWithErrors: "Ankaradan gelen misafirleri ahmet bey kapıda karşıladı. Yanındada minik bir köpek vardı.",
            corrections: [
                { wrongWord: "Ankaradan", correctWord: "Ankara'dan", rule: "Özel isimlere getirilen çekim ekleri kesme ile ayrılır." },
                { wrongWord: "ahmet", correctWord: "Ahmet", rule: "Özel isimler büyük harfle başlar." },
                { wrongWord: "Yanındada", correctWord: "Yanında da", rule: "Bağlaç olan da ayrı yazılır." }
            ]
        })
    },
    {
        id: 'ORTHO_02_PUNCTUATION_PUZZLE',
        studioId: 'yazim-noktalama',
        label: 'Kayıp Noktalama Yapbozu',
        description: 'Boş bırakılan parantezlere doğru işareti koyma.',
        icon: 'fa-quote-left',
        difficulty: 'orta',
        settings: [
            { key: 'uzunluk', label: 'Cümle Uzunluğu', type: 'select', defaultValue: 'Orta', options: ['Kısa', 'Orta', 'Uzun (LGS)'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                textWithBlanks: { type: "STRING", description: "Örn: Hey ( ) Dikkat et ( )" },
                answers: { type: "ARRAY", items: { type: "STRING" }, description: "Sırasıyla işaretler (!, . vb)" }
            },
            required: ["textWithBlanks", "answers"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunda ${s.uzunluk} seviyesinde bir veya iki cümle yaz.
      Cümledeki tırnak, virgül, ünlem, soru, noktalı virgül gibi ${grade}. sınıf Düzeyi Tüm noktalama işaretleri yerlerini ' ( ) ' boşluklarıyla (parantez) değiştir (textWithBlanks).
      Boşlukların sırasıyla alması gereken işaretleri answers dizisine koy.
    `,
        fastGenerate: () => ({
            textWithBlanks: "Eyvah ( ) Tüm süt yere döküldü ( ) Annem bunu görünce ne diyecek ( )",
            answers: ["!", ".", "?"]
        })
    }
];
