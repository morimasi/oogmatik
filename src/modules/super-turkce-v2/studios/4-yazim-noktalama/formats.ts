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
    },
    {
        id: 'ORTHO_03_APOSTROPHE',
        studioId: 'yazim-noktalama',
        label: 'Kesme İşareti Ustası',
        description: 'Özel isim ve kısaltmalara doğru ek getirme.',
        icon: 'fa-apostrophe',
        difficulty: 'orta',
        settings: [
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 6, min: 4, max: 10 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                exercises: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            rawSentence: { type: "STRING", description: "Kesme işaretsiz cümle" },
                            corrected: { type: "STRING", description: "Kesme işaretli doğru hali" },
                            rule: { type: "STRING" }
                        },
                        required: ["rawSentence", "corrected", "rule"]
                    }
                }
            },
            required: ["exercises"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı ${s.cumleAdedi} adet cümle yaz. Cümlelerde Türk milliyet isimleri, şehir adları, kısaltmalar ve özel isimler yer alsın.
      Her cümleyi önce kesme işaretSİZ (rawSentence), sonra doğru halini (corrected) ver. Kuralı kısaca açıkla. Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            exercises: [
                { rawSentence: "Türkiyeden gelen misafirler Istanbulda buluştu.", corrected: "Türkiye'den gelen misafirler İstanbul'da buluştu.", rule: "Özel isim eklerinde kesme işareti zorunludur." },
                { rawSentence: "TDKnın sözlüğünü her zaman kullan.", corrected: "TDK'nın sözlüğünü her zaman kullan.", rule: "Büyük harfle yazılan kısaltmalara getirilen ekler kesme ile ayrılır." }
            ]
        })
    },
    {
        id: 'ORTHO_04_DE_DA_KI',
        studioId: 'yazim-noktalama',
        label: 'de/da, ki, mi Seçim Yarışması',
        description: 'En çok karıştırılan bağlaç/ek ayrımını egzersizle kavrama.',
        icon: 'fa-question-circle',
        difficulty: 'orta',
        settings: [
            { key: 'egzersizSayisi', label: 'Egzersiz Sayısı', type: 'range', defaultValue: 8, min: 5, max: 12 },
            { key: 'odakKelime', label: 'Odak Kelime', type: 'select', defaultValue: 'Karma', options: ['Karma', 'Sadece de/da', 'Sadece ki', 'Sadece mi'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                items: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            sentence: { type: "STRING", description: "Boşluklu cümle (___ ile işaretlenmiş)" },
                            answer: { type: "STRING", description: "Doğru seçenek (bitişik/ayrı)" },
                            explanation: { type: "STRING" }
                        },
                        required: ["sentence", "answer", "explanation"]
                    }
                }
            },
            required: ["items"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunda ${s.odakKelime} kullanımını içeren ${s.egzersizSayisi} adet cümle yaz.
      Her cümlede soru edatı veya bağlaç seçimini '___' ile boş bırak.
      Doğru cevabı (answer) ve nedenini kısa açıkla (explanation). Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            items: [
                { sentence: "Bu kalem benim___, o da onun.", answer: "benim; (ayrı da)", explanation: "Bağlaç olan 'da' her zaman ayrı yazılır." },
                { sentence: "Geldin___ sonunda!", answer: "Geldin mi (ayrı mi)", explanation: "Soru eki 'mi' her zaman ayrı yazılır." },
                { sentence: "Öyle bir haber duydum___ hayret ettim.", answer: "ki (ayrı ki)", explanation: "Bağlaç olarak kullanılan 'ki' ayrı yazılır." }
            ]
        })
    },
    {
        id: 'ORTHO_05_CAPITAL_LETTERS',
        studioId: 'yazim-noktalama',
        label: 'Büyük Harf Kural Avı',
        description: 'Hangi kelimenin büyük harf gerektirdiğini bulma.',
        icon: 'fa-font',
        difficulty: 'kolay',
        settings: [
            { key: 'mevcutHata', label: 'Metin İçindeki Hata Adedi', type: 'range', defaultValue: 5, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                textWithErrors: { type: "STRING" },
                corrections: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: { wrongWord: { type: "STRING" }, correctWord: { type: "STRING" }, rule: { type: "STRING" } },
                        required: ["wrongWord", "correctWord", "rule"]
                    }
                }
            },
            required: ["textWithErrors", "corrections"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" hakkında ${grade}. sınıf düzeyinde kısa bir paragraf yaz.
      Kişi adlarını, yer adlarını, dergi/kitap başlıklarını küçük harfle yaz (${s.mevcutHata} adet hata).
      corrections dizisinde her hatayı ve doğru büyük harf kuralını belirt.
    `,
        fastGenerate: () => ({
            textWithErrors: "türkiye'nin başkenti ankara'dır. atatürk bu şehri seçmiştir.",
            corrections: [
                { wrongWord: "türkiye'nin", correctWord: "Türkiye'nin", rule: "Ülke adları büyük harfle başlar." },
                { wrongWord: "ankara'dır", correctWord: "Ankara'dır", rule: "Şehir adları büyük harfle başlar." },
                { wrongWord: "atatürk", correctWord: "Atatürk", rule: "Özel kişi adları büyük harfle başlar." }
            ]
        })
    },
    {
        id: 'ORTHO_06_NUMBER_WRITING',
        studioId: 'yazim-noktalama',
        label: 'Sayı Yazım Kuralları',
        description: 'Hangi sayılar rakamla, hangisi yazıyla yazılır?',
        icon: 'fa-hashtag',
        difficulty: 'orta',
        settings: [
            { key: 'ornekSayisi', label: 'Örnek Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                exercises: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            rawForm: { type: "STRING", description: "Öğrenciye verilen karışık hali" },
                            correctForm: { type: "STRING" },
                            rule: { type: "STRING" }
                        },
                        required: ["rawForm", "correctForm", "rule"]
                    }
                }
            },
            required: ["exercises"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuyla ilgili ${s.ornekSayisi} adet sayı ifadesi içeren cümle üret (Sınıf: ${grade}).
      Her cümleyi önce yanlış yazım (rawForm) ardından doğru yazım (correctForm) olarak ver.
      İlgili TDK kuralını kısa açıkla.
    `,
        fastGenerate: () => ({
            exercises: [
                { rawForm: "23 Nisan 1920'de büyük millet meclisi açıldı.", correctForm: "23 Nisan 1920'de Büyük Millet Meclisi açıldı.", rule: "Kurum ve kuruluş adlarında her sözcük büyük harfle başlar." },
                { rawForm: "Üç yüz elli 2 kişi oy kullandı.", correctForm: "352 kişi oy kullandı.", rule: "Belirgin sayılar rakamla yazılır; karma kullanım yanlıştır." }
            ]
        })
    },
    {
        id: 'ORTHO_07_HYPHEN_DASH',
        studioId: 'yazim-noktalama',
        label: 'Kısa Çizgi & Düzeltme Çizgisi',
        description: 'Tire (-) ve düzeltme işaretini (^) doğru yerde kullanma.',
        icon: 'fa-minus',
        difficulty: 'zor',
        settings: [
            { key: 'cumleSayisi', label: 'Cümle Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                exercises: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            incorrect: { type: "STRING" },
                            correct: { type: "STRING" },
                            explanation: { type: "STRING" }
                        },
                        required: ["incorrect", "correct", "explanation"]
                    }
                }
            },
            required: ["exercises"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı ${s.cumleSayisi} adet cümle yaz. Kısa çizgi veya şapka (^) işaretinin yanlış/eksik kullanıldığı hatalar içersin.
      incorrect (hatalı) ve correct (doğru) halini ver, kuralı açıkla. Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            exercises: [
                { incorrect: "Haluk bey toplantıya geç kaldı.", correct: "Haluk Bey toplantıya geç kaldı.", explanation: "Unvan ve lakaplar büyük harfle başlar; birleşik yazılır." },
                { incorrect: "Kara-kuru bir adam kapıya dayandı.", correct: "Karakuru bir adam kapıya dayandı.", explanation: "Kalıplaşmış sıfatlar bitişik yazılır." }
            ]
        })
    },
    {
        id: 'ORTHO_08_LETTER_CONFUSION',
        studioId: 'yazim-noktalama',
        label: 'i/İ, g/ğ, c/ç Harf Karmaşası',
        description: 'Türkçeye özgü harf kullanım kurallarını pratikle pekiştirme.',
        icon: 'fa-spell-check',
        difficulty: 'kolay',
        settings: [
            { key: 'harfCifti', label: 'Odak Harf Çifti', type: 'select', defaultValue: 'Karma', options: ['Karma', 'i/ı', 'g/ğ', 'c/ç', 's/ş'] },
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
                            word: { type: "STRING", description: "Doğru yazımı" },
                            commonMistake: { type: "STRING", description: "Yaygın yanlış yazım" },
                            tip: { type: "STRING" }
                        },
                        required: ["word", "commonMistake", "tip"]
                    }
                }
            },
            required: ["words"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusundan yola çıkarak ${s.harfCifti} harflerinin karıştırıldığı ${s.kelimeSayisi} adet kelime seç (Sınıf: ${grade}).
      Her kelime için doğru yazımı (word), yaygın yanlış yazımı (commonMistake) ve kısa ipucu (tip) ver.
    `,
        fastGenerate: () => ({
            words: [
                { word: "değil", commonMistake: "degil", tip: "'ğ' sesi yazıda mutlaka gösterilir; yumuşak g sessiz okunur." },
                { word: "çiçek", commonMistake: "cicek", tip: "Türkçede ç/c sesi imlada ayrıdır; sert ünsüz 'ç' kullanılır." },
                { word: "şeker", commonMistake: "seker", tip: "'ş' Türkçeye özgü harf; s ile karıştırılmamalıdır." }
            ]
        })
    },
    {
        id: 'ORTHO_09_QUOTE_MARKS',
        studioId: 'yazim-noktalama',
        label: 'Alıntı İşaretleri & Diyalog',
        description: 'Konuşma ve alıntı cümlelerini tırnak/kısa çizgi ile doğru yazma.',
        icon: 'fa-comments',
        difficulty: 'orta',
        settings: [
            { key: 'diyalogSayisi', label: 'Diyalog Satırı', type: 'range', defaultValue: 4, min: 3, max: 6 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                rawDialogue: { type: "STRING", description: "Tırnaksız/çizgisiz diyalog" },
                correctDialogue: { type: "STRING", description: "Noktalama işaretleriyle doğru hali" },
                rules: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["rawDialogue", "correctDialogue", "rules"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı ${s.diyalogSayisi} satırlık bir diyalog yaz.
      Önce tırnak ve çizgi işaretleri OLMADAN (rawDialogue), ardından tüm noktalama işaretleriyle doğru halini (correctDialogue) ver.
      Uyguladığın kuralları rules dizisinde listele. Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            rawDialogue: "Anne bugün okul çok güzeldi dedi Ayşe. Annesi neden diye sordu.",
            correctDialogue: "- \"Anne, bugün okul çok güzeldi!\" dedi Ayşe.\n- Annesi \"Neden?\" diye sordu.",
            rules: ["Konuşma cümlelerinde kısa çizgi (-) satır başına gelir.", "Alıntı cümleleri tırnak içine alınır.", "Ünlem ve soru işaretleri tırnak içinde kalır."]
        })
    },
    {
        id: 'ORTHO_10_REWRITE_POLISH',
        studioId: 'yazim-noktalama',
        label: 'Metni Düzelt ve Parlatır',
        description: 'Tüm yazım ve noktalama hatalarını tek seferde tarayıp düzeltme.',
        icon: 'fa-wand-magic-sparkles',
        difficulty: 'zor',
        settings: [
            { key: 'toplamHata', label: 'Hata Yoğunluğu', type: 'range', defaultValue: 8, min: 5, max: 15 },
            { key: 'hataTuru', label: 'Hata Kategorisi', type: 'select', defaultValue: 'Karma', options: ['Karma', 'Sadece Noktalama', 'Sadece Büyük/Küçük', 'Sadece Ek Yazımı'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                dirtyText: { type: "STRING" },
                cleanText: { type: "STRING" },
                errorList: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: { errorNo: { type: "NUMBER" }, wrong: { type: "STRING" }, correct: { type: "STRING" }, rule: { type: "STRING" } },
                        required: ["errorNo", "wrong", "correct", "rule"]
                    }
                }
            },
            required: ["dirtyText", "cleanText", "errorList"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" hakkında ${grade}. sınıf düzeyinde iki–üç paragraflık bir metin oluştur.
      Metne bilinçli olarak ${s.toplamHata} adet "${s.hataTuru}" kategorisinde hata yerleştir.
      dirtyText içinde hatalar olsun; cleanText düzeltilmiş metin olsun.
      errorList içinde her hatanın numarasını, yanlış halini, doğru halini ve kuralını ver.
    `,
        fastGenerate: () => ({
            dirtyText: "mehmet, ankara'dan gelen trene bindi. yanındaki çanta çok ağırdı, ama taşıdı.",
            cleanText: "Mehmet, Ankara'dan gelen trene bindi. Yanındaki çanta çok ağırdı ama taşıdı.",
            errorList: [
                { errorNo: 1, wrong: "mehmet", correct: "Mehmet", rule: "Cümle başı büyük harfle." },
                { errorNo: 2, wrong: "ama taşıdı", correct: "ama taşıdı", rule: "Virgül bağlaç önünde kullanılmaz (ama, fakat, ancak)." }
            ]
        })
    }
];
