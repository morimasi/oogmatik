import { TemplateDef } from '../../core/types';

export const grammarFormats: TemplateDef[] = [
    {
        id: 'GRAM_01_SENTENCE_TREE',
        studioId: 'dil-bilgisi',
        label: 'Cümle Ögeleri Ağacı',
        description: 'Cümleyi yüklemden başlayarak dallarına ayırma.',
        icon: 'fa-tree',
        difficulty: 'zor',
        settings: [
            { key: 'ogeSayisi', label: 'Maks. Öge Sayısı', type: 'range', defaultValue: 5, min: 3, max: 7 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                sentence: { type: "STRING" },
                elements: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            wordSegment: { type: "STRING" },
                            type: { type: "STRING", description: "Özne, Yüklem, Nesne vb." },
                            questionAsked: { type: "STRING", description: "Yükleme sorulan soru (Ne, Kim, Neyi vb)" }
                        },
                        required: ["wordSegment", "type", "questionAsked"]
                    }
                }
            },
            required: ["sentence", "elements"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunda, karmaşık tamlamalar (isim/sıfat) içeren kurallı bir cümle oluştur (Sınıf: ${grade}).
      Bu cümleyi cümlenin ögelerine (Özne, Yüklem, Nesne, Zarf/Yer Tamlayıcısı) ayır. 
      elements dizisinde her ögenin kelime grubunu (wordSegment), öge adını (type) ve o ögeyi bulmak için Yükleme sorulan 'Soru'yu (questionAsked) ver.
      Toplam öge sayısı en fazla ${s.ogeSayisi} olsun.
    `,
        fastGenerate: () => ({
            sentence: "Küçük çocuk, sabah erkenden dedesinin tarlasındaki olgun elmaları büyük bir sevinçle topladı.",
            elements: [
                { wordSegment: "topladı", type: "Yüklem", questionAsked: "-" },
                { wordSegment: "Küçük çocuk", type: "Özne", questionAsked: "Toplayan Kim?" },
                { wordSegment: "sabah erkenden", type: "Zarf Tamlayıcısı", questionAsked: "Ne zaman?" },
                { wordSegment: "dedesinin tarlasındaki olgun elmaları", type: "Belirtili Nesne", questionAsked: "Neyi?" },
                { wordSegment: "büyük bir sevinçle", type: "Zarf Tamlayıcısı", questionAsked: "Nasıl?" }
            ]
        })
    },
    {
        id: 'GRAM_02_TIME_WHEEL',
        studioId: 'dil-bilgisi',
        label: 'Zamanlar Çarkı (Fiiller)',
        description: 'Aynı olayı 4 farklı zaman kipiyle yeniden yazma.',
        icon: 'fa-clock-rotate-left',
        difficulty: 'orta',
        settings: [
            { key: 'sahisEki', label: 'Şahıs', type: 'select', defaultValue: '1. Tekil (Ben)', options: ['1. Tekil (Ben)', '3. Çoğul (Onlar)', 'Karma'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                rootVerb: { type: "STRING", description: "Mastarsız fiil kök/gövdesi" },
                context: { type: "STRING", description: "Fiilin kullanılacağı durum" },
                tenses: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            tenseName: { type: "STRING", description: "Örn: Şimdiki Zaman" },
                            conjugated: { type: "STRING", description: "Örn: okuyorum" },
                            sentence: { type: "STRING" }
                        },
                        required: ["tenseName", "conjugated", "sentence"]
                    }
                }
            },
            required: ["rootVerb", "context", "tenses"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı bir makmek mastarına uygun fiil (rootVerb) ve kısa bağlam (context) belirle.
      Bu fiili ${s.sahisEki} şahsında şu 4 kipe göre çekimle (tenses): Geçmiş Zaman (Di'li), Şimdiki Zaman, Gelecek Zaman, Geniş Zaman.
      Her çekim için kısa bir cümle (sentence) kur (Seviye: ${grade}.sınıf).
    `,
        fastGenerate: () => ({
            rootVerb: "Gözlemle",
            context: "Gökyüzündeki yıldız hareketleri",
            tenses: [
                { tenseName: "Görülen Geçmiş Zaman", conjugated: "gözlemledim", sentence: "Dün gece teleskopla Ay'ı gözlemledim." },
                { tenseName: "Şimdiki Zaman", conjugated: "gözlemliyorum", sentence: "Şu an teleskopla Ay'ı gözlemliyorum." },
                { tenseName: "Gelecek Zaman", conjugated: "gözlemleyeceğim", sentence: "Yarın gece teleskopla Ay'ı gözlemleyeceğim." },
                { tenseName: "Geniş Zaman", conjugated: "gözlemlerim", sentence: "Ben her gece teleskopla Ay'ı gözlemlerim." }
            ]
        })
    },
    {
        id: 'GRAM_03_ADJECTIVE_HUNT',
        studioId: 'dil-bilgisi',
        label: 'Sıfat (Önad) Avcısı',
        description: 'Metindeki isme sorulan Nasıl/Hangi sorularının cevabını bul.',
        icon: 'fa-tag',
        difficulty: 'kolay',
        settings: [
            { key: 'hedefSifat', label: 'Bulunacak Sıfat S.', type: 'range', defaultValue: 5, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                text: { type: "STRING" },
                adjectives: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            noun: { type: "STRING", description: "Nitelenen isim" },
                            adjective: { type: "STRING", description: "Sıfat kelimesi" },
                            type: { type: "STRING", description: "Niteleme veya Belirtme" }
                        },
                        required: ["noun", "adjective", "type"]
                    }
                }
            },
            required: ["text", "adjectives"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      ${grade}. sınıflar için, "${topic}" hakkında betimleyici bir metin yaz.
      Metin içine bilerek çok sayıda Sıfat Tamlaması yerleştir.
      Bunların içinden tam ${s.hedefSifat} tanesini adjectives dizisinde (isim, sıfat ve sıfat çeşidi) belirterek çıkar.
    `,
        fastGenerate: () => ({
            text: "Kırmızı çatılı eski evlerin arasından geçen dar sokağın sonunda, sevimli bir köpek yatıyordu. O köpek, üç gündür orada bekliyordu.",
            adjectives: [
                { noun: "evlerin", adjective: "eski", type: "Niteleme" },
                { noun: "köpek", adjective: "sevimli", type: "Niteleme" },
                { noun: "gündür", adjective: "üç", type: "Belirtme (Asıl Sayı)" },
                { noun: "köpek", adjective: "o", type: "Belirtme (İşaret)" }
            ]
        })
    },
    {
        id: 'GRAM_04_NOUN_CASES',
        studioId: 'dil-bilgisi',
        label: 'İsim Hâlleri Tablosu',
        description: 'Bir ismin tüm çekim hâllerini tablo içinde doldurma.',
        icon: 'fa-table',
        difficulty: 'orta',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                words: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            root: { type: "STRING", description: "Yalın hali" },
                            genitive: { type: "STRING", description: "İlgi hali (ın/in/un/ün)" },
                            dative: { type: "STRING", description: "Yönelme hali (a/e)" },
                            accusative: { type: "STRING", description: "Belirtme hali (ı/i/u/ü)" },
                            locative: { type: "STRING", description: "Bulunma hali (da/de/ta/te)" },
                            ablative: { type: "STRING", description: "Ayrılma hali (dan/den/tan/ten)" }
                        },
                        required: ["root", "genitive", "dative", "accusative", "locative", "ablative"]
                    }
                }
            },
            required: ["words"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuyla ilgili ${s.kelimeSayisi} adet somut isim (tek heceli ve iki heceli karışık) seç.
      Her isim için tüm isim hâli çekimlerini (yalın, ilgi, yönelme, belirtme, bulunma, ayrılma) ver.
      Ünlü uyumu kurallarına kesinlikle uy. Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            words: [
                { root: "dağ", genitive: "dağın", dative: "dağa", accusative: "dağı", locative: "dağda", ablative: "dağdan" },
                { root: "göl", genitive: "gölün", dative: "göle", accusative: "gölü", locative: "gölde", ablative: "gölden" },
                { root: "orman", genitive: "ormanın", dative: "ormana", accusative: "ormanı", locative: "ormanda", ablative: "ormandan" }
            ]
        })
    },
    {
        id: 'GRAM_05_COMPOUND_WORDS',
        studioId: 'dil-bilgisi',
        label: 'Birleşik Kelime Fabrikası',
        description: 'İki ayrı sözcükten yeni anlamlı birleşik kelimeler üretme.',
        icon: 'fa-puzzle-piece',
        difficulty: 'kolay',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Çifti Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 },
            { key: 'birlesimTuru', label: 'Birleşim Türü', type: 'select', defaultValue: 'Karma', options: ['Karma', 'Kalıplaşmış', 'Belirtisiz İsim T.', 'Sıfat T.'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                pairs: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            word1: { type: "STRING" },
                            word2: { type: "STRING" },
                            compound: { type: "STRING" },
                            type: { type: "STRING" },
                            meaning: { type: "STRING" }
                        },
                        required: ["word1", "word2", "compound", "type", "meaning"]
                    }
                }
            },
            required: ["pairs"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temasıyla bağlantılı ${s.kelimeSayisi} adet birleşik kelime üret. Tür: ${s.birlesimTuru}. Sınıf: ${grade}.
      Her kelime için iki bileşen sözcüğü (word1, word2), birleşik halini (compound), tür adını (type) ve kısa anlamını (meaning) ver.
    `,
        fastGenerate: () => ({
            pairs: [
                { word1: "gece", word2: "yarı", compound: "geceyarısı", type: "Kalıplaşmış", meaning: "Gece 12.00 zamanı" },
                { word1: "el", word2: "yaz", compound: "el yazısı", type: "Belirtisiz İsim T.", meaning: "Elle yazılmış yazı" },
                { word1: "kara", word2: "kuru", compound: "karakuru", type: "Sıfat Tamlaması", meaning: "Esmer, zayıf" }
            ]
        })
    },
    {
        id: 'GRAM_06_PRONOUN_FINDER',
        studioId: 'dil-bilgisi',
        label: 'Zamir (Adıl) Dedektifi',
        description: 'Metindeki kişi, işaret, soru ve belirsizlik zamirlerini ayırma.',
        icon: 'fa-magnifying-glass',
        difficulty: 'orta',
        settings: [
            { key: 'odakZamir', label: 'Zamir Türü', type: 'select', defaultValue: 'Karma', options: ['Karma', 'Sadece Kişi', 'Sadece İşaret', 'Sadece Soru'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                text: { type: "STRING" },
                pronouns: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            pronoun: { type: "STRING" },
                            type: { type: "STRING", description: "Kişi, İşaret, Soru, Belgisiz" },
                            refersTo: { type: "STRING", description: "Neyin/kimin yerini tutuyor?" }
                        },
                        required: ["pronoun", "type", "refersTo"]
                    }
                }
            },
            required: ["text", "pronouns"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      ${grade}. sınıf düzeyinde "${topic}" ekseninde kısa bir diyalog veya paragraf yaz.
      İçine ${s.odakZamir} türünde zamirler yerleştir. 
      pronouns dizisinde her zamiri, türünü ve neyin/kimin yerini tuttuğunu belirt.
    `,
        fastGenerate: () => ({
            text: "Bu kitabı okuyan o çocuk kimdi? Ben onu tanımıyorum ama herkes ondan söz ediyor.",
            pronouns: [
                { pronoun: "Bu", type: "İşaret", refersTo: "Yakın nesne (kitap)" },
                { pronoun: "o", type: "İşaret", refersTo: "Uzak nesne (çocuk)" },
                { pronoun: "kimdi", type: "Soru", refersTo: "Kimliği bilinmeyen kişi" },
                { pronoun: "Ben", type: "Kişi", refersTo: "1. tekil kişi (konuşan)" },
                { pronoun: "onu", type: "Kişi", refersTo: "3. tekil kişi (çocuk)" },
                { pronoun: "herkes", type: "Belgisiz", refersTo: "Belirsiz bir grup" },
                { pronoun: "ondan", type: "Kişi", refersTo: "3. tekil (çocuk)" }
            ]
        })
    },
    {
        id: 'GRAM_07_SENTENCE_TRANSFORM',
        studioId: 'dil-bilgisi',
        label: 'Cümle Dönüştürme Atölyesi',
        description: 'Olumlu cümleyi olumsuz, soru ve ünlem cümlelerine çevirme.',
        icon: 'fa-arrows-rotate',
        difficulty: 'kolay',
        settings: [
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 4, min: 3, max: 6 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                sentences: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            positive: { type: "STRING", description: "Olumlu cümle" },
                            negative: { type: "STRING", description: "Olumsuz hali" },
                            question: { type: "STRING", description: "Soru hali" },
                            exclamation: { type: "STRING", description: "Ünlem hali" }
                        },
                        required: ["positive", "negative", "question", "exclamation"]
                    }
                }
            },
            required: ["sentences"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunu içeren ${s.cumleAdedi} adet olumlu cümle kur (Sınıf: ${grade}).
      Her cümlenin olumsuz, soru ve ünlem biçimlerini de yaz.
      Çekimler dil bilgisi kurallarına tam uyumlu olsun.
    `,
        fastGenerate: () => ({
            sentences: [
                { positive: "Kuşlar güney ülkelerine göç eder.", negative: "Kuşlar güney ülkelerine göç etmez.", question: "Kuşlar güney ülkelerine göç eder mi?", exclamation: "Kuşlar güney ülkelerine göç eder!" },
                { positive: "Çocuklar bahçede oyun oynuyor.", negative: "Çocuklar bahçede oyun oynamıyor.", question: "Çocuklar bahçede oyun oynuyor mu?", exclamation: "Çocuklar bahçede oyun oynuyor!" }
            ]
        })
    },
    {
        id: 'GRAM_08_PASSIVE_VOICE',
        studioId: 'dil-bilgisi',
        label: 'Edilgen Çatı Dönüşümü',
        description: 'Etken cümleyi edilgen yapıya dönüştürme ve farkı kavrama.',
        icon: 'fa-right-left',
        difficulty: 'zor',
        settings: [
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 4, min: 3, max: 6 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                exercises: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            active: { type: "STRING", description: "Etken cümle" },
                            passive: { type: "STRING", description: "Edilgen cümle" },
                            note: { type: "STRING", description: "Dönüşüm kuralı notu" }
                        },
                        required: ["active", "passive", "note"]
                    }
                }
            },
            required: ["exercises"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuna uygun ${s.cumleAdedi} adet etken cümle yaz (Sınıf: ${grade}).
      Her cümleyi edilgen yapıya dönüştür ve dönüşüm sırasında uygulanan kuralı kısaca not olarak açıkla.
    `,
        fastGenerate: () => ({
            exercises: [
                { active: "Mühendisler köprüyü inşa etti.", passive: "Köprü mühendisler tarafından inşa edildi.", note: "Nesne özne oldu; özneye 'tarafından' eklendi; fiil '-il/-in' eki aldı." },
                { active: "Öğretmen tahtaya soruyu yazdı.", passive: "Soru tahtaya öğretmen tarafından yazıldı.", note: "Nesne başa alındı; etken özne 'tarafından' ile belirtildi." }
            ]
        })
    },
    {
        id: 'GRAM_09_WORD_FAMILY',
        studioId: 'dil-bilgisi',
        label: 'Kelime Ailesi Ağacı',
        description: 'Kök sözcükten türetilmiş tüm aile üyelerini ağaç şeklinde gösterme.',
        icon: 'fa-sitemap',
        difficulty: 'orta',
        settings: [
            { key: 'aileSayisi', label: 'Kelime Ailesi Sayısı', type: 'range', defaultValue: 2, min: 1, max: 4 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                families: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            root: { type: "STRING" },
                            members: {
                                type: "ARRAY",
                                items: {
                                    type: "OBJECT",
                                    properties: {
                                        word: { type: "STRING" },
                                        suffix: { type: "STRING", description: "Hangi ek alındı" },
                                        type: { type: "STRING", description: "İsim, Sıfat, Fiil, Zarf" },
                                        exampleSentence: { type: "STRING" }
                                    },
                                    required: ["word", "suffix", "type", "exampleSentence"]
                                }
                            }
                        },
                        required: ["root", "members"]
                    }
                }
            },
            required: ["families"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuyla ilişkili ${s.aileSayisi} adet kök sözcük seç.
      Her kök sözcükten en az 4 türemiş kelime üret (İsim, Sıfat, Fiil, Zarf).
      Her türemiş kelime için hangi eki aldığını, kelime türünü ve kısa bir örnek cümle ver. Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            families: [
                {
                    root: "yaz",
                    members: [
                        { word: "yazı", suffix: "-ı", type: "İsim", exampleSentence: "Onun yazısı çok güzel." },
                        { word: "yazılı", suffix: "-ılı", type: "Sıfat", exampleSentence: "Yazılı sınav başlıyor." },
                        { word: "yazdır", suffix: "-dır", type: "Ettirgen Fiil", exampleSentence: "Öğretmen tahtayı yazdırdı." },
                        { word: "yazılım", suffix: "-ılım", type: "İsim", exampleSentence: "Bilgisayar yazılımı güncellendi." }
                    ]
                }
            ]
        })
    },
    {
        id: 'GRAM_10_CONJUNCTION_BRIDGE',
        studioId: 'dil-bilgisi',
        label: 'Bağlaç Köprüsü',
        description: 'İki cümleyi doğru bağlaçla birleştirme ve anlam farkını kavrama.',
        icon: 'fa-link',
        difficulty: 'orta',
        settings: [
            { key: 'egzersizSayisi', label: 'Egzersiz Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'baglaçTuru', label: 'Bağlaç Türü', type: 'select', defaultValue: 'Karma', options: ['Karma', 'Bağlama (ve/da)', 'Karşıtlık (ama/fakat)', 'Neden-Sonuç (çünkü/onun için)'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                exercises: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            sentence1: { type: "STRING" },
                            sentence2: { type: "STRING" },
                            correctConjunction: { type: "STRING" },
                            combined: { type: "STRING" },
                            options: { type: "ARRAY", items: { type: "STRING" }, description: "3-4 seçenek bağlaç" }
                        },
                        required: ["sentence1", "sentence2", "correctConjunction", "combined", "options"]
                    }
                }
            },
            required: ["exercises"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunu içeren ${s.egzersizSayisi} adet çift cümle hazırla. Bağlaç türü: ${s.baglaçTuru}. Sınıf: ${grade}.
      Her egzersizde iki ayrı cümle ver. Doğru bağlacı (correctConjunction) ve üç yanlış seçeneği (options) listele.
      Birleştirilmiş doğru cümleyi de yaz (combined).
    `,
        fastGenerate: () => ({
            exercises: [
                {
                    sentence1: "Hava soğudu.",
                    sentence2: "Çocuklar içeri girdi.",
                    correctConjunction: "bunun için",
                    combined: "Hava soğudu, bunun için çocuklar içeri girdi.",
                    options: ["ve", "ama", "bunun için", "ya da"]
                },
                {
                    sentence1: "Ödevimi bitirdim.",
                    sentence2: "Dışarı çıkamadım.",
                    correctConjunction: "ama",
                    combined: "Ödevimi bitirdim ama dışarı çıkamadım.",
                    options: ["çünkü", "ama", "ve", "ne… ne de"]
                }
            ]
        })
    }
];
