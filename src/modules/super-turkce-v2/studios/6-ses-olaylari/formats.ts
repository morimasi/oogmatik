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
                            type: { type: "STRING" },
                            changesFromTo: { type: "STRING" }
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
    },
    {
        id: 'PHONO_03_SYLLABLE_SPLIT',
        studioId: 'ses-olaylari',
        label: 'Hece Bölme Ustası',
        description: 'Kelimeleri doğru hece sınırlarından ayırma ve hece sayısını bulma.',
        icon: 'fa-scissors',
        difficulty: 'kolay',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 8, min: 5, max: 12 },
            { key: 'zorluk', label: 'Hece Sayısı', type: 'select', defaultValue: 'Karma', options: ['Karma', 'Sadece 2 Hece', 'Sadece 3 Hece', '4+ Hece'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                words: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            word: { type: "STRING" },
                            syllables: { type: "ARRAY", items: { type: "STRING" }, description: "Her hece ayrı eleman" },
                            count: { type: "NUMBER" }
                        },
                        required: ["word", "syllables", "count"]
                    }
                }
            },
            required: ["words"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuyla ilişkili ${s.kelimeSayisi} adet kelime seç. Filtre: ${s.zorluk}. Sınıf: ${grade}.
      Her kelime için hecelere ayırılmış halini (syllables dizisi) ve hece sayısını (count) ver.
      Hece bölme Türkçe ses bilgisi kurallarına uygun olsun (Ünlü-Ünsüz dengesi).
    `,
        fastGenerate: () => ({
            words: [
                { word: "bilgisayar", syllables: ["bil", "gi", "sa", "yar"], count: 4 },
                { word: "öğretmen", syllables: ["öğ", "ret", "men"], count: 3 },
                { word: "kalem", syllables: ["ka", "lem"], count: 2 },
                { word: "elma", syllables: ["el", "ma"], count: 2 },
                { word: "televizyon", syllables: ["te", "le", "viz", "yon"], count: 4 }
            ]
        })
    },
    {
        id: 'PHONO_04_VOWEL_HARMONY',
        studioId: 'ses-olaylari',
        label: 'Büyük-Küçük Ünlü Uyumu Kontrolü',
        description: 'Kelimenin ünlü uyumuna uyup uymadığını test etme.',
        icon: 'fa-circle-check',
        difficulty: 'orta',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 8, min: 5, max: 12 },
            { key: 'uyumTuru', label: 'Uyum Türü', type: 'select', defaultValue: 'Her İkisi', options: ['Her İkisi', 'Sadece Büyük Ünlü Uyumu', 'Sadece Küçük Ünlü Uyumu'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                words: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            word: { type: "STRING" },
                            bigHarmony: { type: "BOOLEAN", description: "Büyük ünlü uyumuna uyuyor mu?" },
                            smallHarmony: { type: "BOOLEAN", description: "Küçük ünlü uyumuna uyuyor mu?" },
                            exception: { type: "BOOLEAN", description: "Alıntı/istisna kelime mi?" },
                            note: { type: "STRING", description: "Kısa açıklama" }
                        },
                        required: ["word", "bigHarmony", "smallHarmony", "exception", "note"]
                    }
                }
            },
            required: ["words"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuyla ilgili ${s.kelimeSayisi} adet kelime seç. Filtre: ${s.uyumTuru}. Sınıf: ${grade}.
      Her kelime için büyük ünlü uyumuna (bigHarmony) ve küçük ünlü uyumuna (smallHarmony) uyup uymadığını belirt.
      Alıntı/istisna kelimeleri (exception: true) de dahil et; kısa not ekle.
    `,
        fastGenerate: () => ({
            words: [
                { word: "kalem", bigHarmony: true, smallHarmony: true, exception: false, note: "Türkçe kökenli; iki uyuma da uyar." },
                { word: "kitap", bigHarmony: true, smallHarmony: false, exception: false, note: "a-ı: büyük uyuma uyar; küçük uyuma uymaz." },
                { word: "alkol", bigHarmony: false, smallHarmony: false, exception: true, note: "Alıntı kelime; ünlü uyumu aramaya gerek yok." }
            ]
        })
    },
    {
        id: 'PHONO_05_CONSONANT_CLUSTER',
        studioId: 'ses-olaylari',
        label: 'Ünsüz Yumuşama Zinciri',
        description: 'p/ç/t/k harflerinin ek alırken nasıl değiştiğini adım adım izleme.',
        icon: 'fa-link',
        difficulty: 'orta',
        settings: [
            { key: 'ekSayisi', label: 'Ek/Kelime Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                chains: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            baseWord: { type: "STRING" },
                            suffix: { type: "STRING" },
                            step1: { type: "STRING", description: "Ek getirilmeden önceki hali" },
                            step2: { type: "STRING", description: "Ünsüz yumuşaması sonucu" },
                            finalWord: { type: "STRING" },
                            rule: { type: "STRING" }
                        },
                        required: ["baseWord", "suffix", "step1", "step2", "finalWord", "rule"]
                    }
                }
            },
            required: ["chains"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusundan esinlenerek ünsüz yumuşamasına uğrayan ${s.ekSayisi} adet kelime seç. Sınıf: ${grade}.
      Her kelime için adım adım değişimi göster: temel kelime (baseWord), ek (suffix), ek öncesi (step1), yumuşama sonrası (step2) ve son hali (finalWord).
      Uygulanan kuralı (rule) kısaca yaz.
    `,
        fastGenerate: () => ({
            chains: [
                { baseWord: "kitap", suffix: "ı", step1: "kitap + ı", step2: "kitab + ı", finalWord: "kitabı", rule: "Sonu p ile biten kelime ünlüyle başlayan ek alırken p→b olur." },
                { baseWord: "ağaç", suffix: "a", step1: "ağaç + a", step2: "ağac + a", finalWord: "ağaca", rule: "Sonu ç ile biten kelime ünlüyle başlayan ek alırken ç→c olur." }
            ]
        })
    },
    {
        id: 'PHONO_06_STRESS_PATTERN',
        studioId: 'ses-olaylari',
        label: 'Vurgu Yeri Analizi',
        description: 'Türkçede hangi hecenin vurgu aldığını kural ve örnekle kavrama.',
        icon: 'fa-exclamation',
        difficulty: 'zor',
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
                            word: { type: "STRING" },
                            syllables: { type: "ARRAY", items: { type: "STRING" } },
                            stressIndex: { type: "NUMBER", description: "Vurgulu heceyi gösteren index (0-indexed)" },
                            rule: { type: "STRING", description: "Vurgu kuralı açıklaması" }
                        },
                        required: ["word", "syllables", "stressIndex", "rule"]
                    }
                }
            },
            required: ["words"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusundan ${s.kelimeSayisi} adet kelime seç. Sınıf: ${grade}.
      Her kelimede hecelere böl (syllables), vurgulu hecenin indeksini (stressIndex, 0-based) ve uygulanan vurgu kuralını (rule) yaz.
      Yer adları, fiil çekimleri ve isimler farklı vurgu davranışı sergileyecek şekilde çeşitlendir.
    `,
        fastGenerate: () => ({
            words: [
                { word: "ANKARA", syllables: ["AN", "KA", "RA"], stressIndex: 0, rule: "Yer adlarında vurgu genellikle ilk hecededir." },
                { word: "geliyorum", syllables: ["ge", "li", "yo", "rum"], stressIndex: 2, rule: "Fiil çekimlerinde vurgu son ekten önceki heceye düşer." },
                { word: "güzel", syllables: ["gü", "zel"], stressIndex: 1, rule: "Çift heceli Türkçe isimlerde genellikle son hece vurgulu." }
            ]
        })
    },
    {
        id: 'PHONO_07_BORROWED_WORDS',
        studioId: 'ses-olaylari',
        label: 'Yabancı Kökenli Kelime Tarayıcı',
        description: 'Alıntı kelimeleri Türkçe kökenli kelimelerden ayırt etme.',
        icon: 'fa-globe',
        difficulty: 'kolay',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 8, min: 5, max: 12 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                words: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            word: { type: "STRING" },
                            origin: { type: "STRING", description: "Türkçe, Arapça, Fransızca vb." },
                            isTurkish: { type: "BOOLEAN" },
                            hint: { type: "STRING", description: "Yabancı olduğunu belli eden özellik" }
                        },
                        required: ["word", "origin", "isTurkish", "hint"]
                    }
                }
            },
            required: ["words"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuyla ilişkili ${s.kelimeSayisi} adet kelime seç. Türkçe ve alıntı kelimeler karışık olsun. Sınıf: ${grade}.
      Her kelime için kökenini (origin), Türkçe olup olmadığını (isTurkish) ve alıntı ise hangi sesbirim/yazım özelliğinin bunu ele verdiğini belirt (hint).
    `,
        fastGenerate: () => ({
            words: [
                { word: "okul", origin: "Fransızca (école)", isTurkish: false, hint: "Türkçede 'okul' yabancı kökenlidir; özgün Türkçe karşılığı 'mektep' idi." },
                { word: "yıldız", origin: "Türkçe", isTurkish: true, hint: "Ünlü uyumuna uyuyor, Türkçe kökenli." },
                { word: "kalem", origin: "Arapça (qalam)", isTurkish: false, hint: "a-e değişimi ve son ünsüz yalnız olması alıntı işareti." }
            ]
        })
    },
    {
        id: 'PHONO_08_SOUND_MAP',
        studioId: 'ses-olaylari',
        label: 'Ses Olayları Haritası (Genel Tekrar)',
        description: 'Tüm ses olaylarını aynı kağıtta tanımlama ve örneklendirme.',
        icon: 'fa-map',
        difficulty: 'orta',
        settings: [
            { key: 'olayBasinaOrnek', label: 'Olay Başına Örnek', type: 'range', defaultValue: 2, min: 1, max: 4 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                events: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            eventName: { type: "STRING" },
                            shortDefinition: { type: "STRING" },
                            examples: { type: "ARRAY", items: { type: "STRING" }, description: "Örnek kelimeler (etkilenmiş hali)" }
                        },
                        required: ["eventName", "shortDefinition", "examples"]
                    }
                }
            },
            required: ["events"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuyla bağlantılı örnekler kullanarak tüm temel Türkçe ses olaylarını (Ünlü Düşmesi, Ünlü Türemesi, Ünsüz Yumuşaması, Ünsüz Sertleşmesi, Ünsüz Benzeşmesi, Göçüşme) listele.
      Her olay için kısa tanım (shortDefinition) ve ${s.olayBasinaOrnek} adet somut örnek kelime ver. Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            events: [
                { eventName: "Ünlü Düşmesi", shortDefinition: "İki heceli bir kelime ünlüyle başlayan ek aldığında orta hecenin ünlüsü düşer.", examples: ["burun → burnum", "gönül → gönlüm"] },
                { eventName: "Ünsüz Yumuşaması", shortDefinition: "Sonu sert ünsüzle biten kelime ünlüyle başlayan ek alınca son ünsüz yumuşar.", examples: ["kitap → kitabı", "ağaç → ağaca"] },
                { eventName: "Ünsüz Sertleşmesi", shortDefinition: "Sert ünsüzle biten kelimeye c/d/g ile başlayan ek gelince ek sertleşir.", examples: ["sokak + da → sokakta", "kitap + dan → kitaptан"] }
            ]
        })
    },
    {
        id: 'PHONO_09_RHYTHM_POEM',
        studioId: 'ses-olaylari',
        label: 'Ses Farkındalığı Şiiri',
        description: 'Uyak ve ses tekrarlarını keşfetmek için ritimli bir şiiri analiz etme.',
        icon: 'fa-music',
        difficulty: 'kolay',
        settings: [
            { key: 'dizeAdedi', label: 'Şiir Dize Adedi', type: 'range', defaultValue: 8, min: 4, max: 12 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                poem: { type: "STRING", description: "Tam şiir" },
                rhymeScheme: { type: "STRING", description: "Uyak şeması (ABAB vb.)" },
                soundPatterns: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            patternName: { type: "STRING", description: "Aliterasyon, asonans, kafiye vb." },
                            example: { type: "STRING" }
                        },
                        required: ["patternName", "example"]
                    }
                },
                questions: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["poem", "rhymeScheme", "soundPatterns", "questions"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı ${s.dizeAdedi} dizelik, çocuklar için kafiyeli ve ritmik bir şiir yaz. Sınıf: ${grade}.
      Şiirde aliterasyon veya asonans örnekleri olsun.
      Uyak şemasını (rhymeScheme), ses örüntülerini (soundPatterns) ve 2-3 anlama/ses sorusu (questions) belirt.
    `,
        fastGenerate: () => ({
            poem: "Yağmur yağar pıtır pıtır,\nDamlar üstünde kıtır kıtır.\nÇocuklar koşar sağa sola,\nSu birikir küçük göle.",
            rhymeScheme: "AABB",
            soundPatterns: [
                { patternName: "Ses Yansıması (Onomatope)", example: "'pıtır pıtır' – yağmurun sesini taklit eder." },
                { patternName: "Kafiye", example: "pıtır / kıtır / sola / göle" }
            ],
            questions: [
                "Bu şiirde kaç dize var? Her dizede kaç hece bulunuyor?",
                "'pıtır pıtır' ifadesi nasıl bir ses olayına örnektir?"
            ]
        })
    },
    {
        id: 'PHONO_10_LGS_SOUND_TEST',
        studioId: 'ses-olaylari',
        label: 'LGS Ses Bilgisi Testi',
        description: 'Tüm ses olaylarını kapsayan LGS formatında çoktan seçmeli test.',
        icon: 'fa-graduation-cap',
        difficulty: 'zor',
        settings: [
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                questions: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            question: { type: "STRING" },
                            options: { type: "ARRAY", items: { type: "STRING" } },
                            answer: { type: "STRING" },
                            explanation: { type: "STRING" }
                        },
                        required: ["question", "options", "answer", "explanation"]
                    }
                }
            },
            required: ["questions"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusundan yola çıkarak ${grade}. sınıf LGS formatında ${s.soruSayisi} adet ses bilgisi sorusu yaz.
      Sorular ünlü/ünsüz uyumları, ses olayları, hece sayısı ve benzer konuları kapsamalı.
      Her soru için 4 seçenek (A-D), doğru cevap ve açıklama ver.
    `,
        fastGenerate: () => ({
            questions: [
                {
                    question: "\"Ağaç\" kelimesine \"-a\" eki getirildiğinde aşağıdaki ses olaylarından hangisi gerçekleşir?",
                    options: ["A) Ünlü düşmesi", "B) Ünsüz yumuşaması (ç→c)", "C) Ünsüz sertleşmesi", "D) Ünlü türemesi"],
                    answer: "B) Ünsüz yumuşaması (ç→c)",
                    explanation: "Sonu 'ç' ile biten 'ağaç' kelimesi ünlüyle başlayan ek alınca ç→c değişimi yaşanır: ağaç + a = ağaca."
                },
                {
                    question: "\"Burun\" kelimesinin iyelik çekiminde (burnum) hangi ses olayı görülür?",
                    options: ["A) Ünsüz yumuşaması", "B) Ünsüz benzeşmesi", "C) Ünlü düşmesi", "D) Göçüşme"],
                    answer: "C) Ünlü düşmesi",
                    explanation: "'Burun' + 'um' → 'Burnum'; orta hekedeki 'u' sesi düşer."
                }
            ]
        })
    }
];
