import { TemplateDef } from '../../core/types';

export const idiomProverbFormats: TemplateDef[] = [
    {
        id: 'IDIOM_01_MATCH_PICTURE',
        studioId: 'deyimler',
        label: 'Görselden Deyimi Tahmin Et',
        description: 'Verilen karikatürize metinden / konudan doğru deyimi bulma.',
        icon: 'fa-images',
        difficulty: 'kolay',
        settings: [
            { key: 'sayi', label: 'Deyim Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                items: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            visualDescription: { type: "STRING", description: "Öğrenciye verilecek somut sahne/karikatür tasviri" },
                            idiom: { type: "STRING", description: "Cevap olan deyim" },
                            meaning: { type: "STRING", description: "Deyimin öğretmen için anlamı" }
                        },
                        required: ["visualDescription", "idiom", "meaning"]
                    }
                }
            },
            required: ["items"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temasına (veya insani duygulara) uygun ${s.sayi} adet sık kullanılan, ${grade}. sınıfa uygun DEYİM seç.
      Her deyim için, o deyimi kelimenin tam anlamıyla "resmeden" somut, komik veya canlandırıcı bir sahne tasviri (visualDescription) yaz.
      Örneğin "Küplere binmek" için "Adamın biri sinirden kıpkırmızı olmuş, üst üste dizilmiş küplerin üzerine zıplıyor." gibi.
    `,
        fastGenerate: () => ({
            items: [
                { visualDescription: "Bir adam düşünün, burnu havada yürüyor ve kimseye bakmıyor, adeta bulutlara değiyor.", idiom: "Burnu havada olmak", meaning: "Kibirli davranmak." },
                { visualDescription: "Küçük çocuk, annesinin sözlerini dinlemiyor, sanki sözler bir kulağından girip diğerinden çıkıyor.", idiom: "Bir kulağından girip diğerinden çıkmak", meaning: "Söylenenleri umursamamak." }
            ]
        })
    },
    {
        id: 'PROVERB_02_FILL_BLANK',
        studioId: 'deyimler',
        label: 'Atasözü Tamamlama',
        description: 'Yarım bırakılmış atasözünün devamını getirme.',
        icon: 'fa-feather',
        difficulty: 'orta',
        settings: [
            { key: 'secenekVer', label: 'Eşleştirme Seçeneği Ver', type: 'toggle', defaultValue: true }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                proverbs: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            firstHalf: { type: "STRING" },
                            secondHalf: { type: "STRING" },
                            fullMeaning: { type: "STRING" }
                        },
                        required: ["firstHalf", "secondHalf", "fullMeaning"]
                    }
                }
            },
            required: ["proverbs"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunda veya genel kültüre ait ${grade}. sınıf müfredatındaki 5 adet popüler ATASÖZÜ seç.
      Bu atasözlerini mantıksal olarak tam ortadan (virgülden veya anlam bütünlüğünden) ikiye böl. (firstHalf, secondHalf)
      Anlamını da fullMeaning bölümüne ekle.
    `,
        fastGenerate: () => ({
            proverbs: [
                { firstHalf: "Sakla samanı,", secondHalf: "gelir zamanı.", fullMeaning: "Gereksiz görünen şeyleri saklamalı, ileride lazım olabilir." },
                { firstHalf: "Damlaya damlaya", secondHalf: "göl olur.", fullMeaning: "Küçük birikimler zamanla büyük şeylere dönüşür." }
            ]
        })
    },
    {
        id: 'IDIOM_03_CONTEXT_MATCH',
        studioId: 'deyimler',
        label: 'Bağlama Uygun Deyim Seç',
        description: 'Verilen duruma en uygun deyimi dört seçenekten bulma.',
        icon: 'fa-list-check',
        difficulty: 'orta',
        settings: [
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                questions: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            situation: { type: "STRING", description: "Kısa durum tasviri" },
                            options: { type: "ARRAY", items: { type: "STRING" }, description: "4 seçenek deyim" },
                            answer: { type: "STRING", description: "Doğru deyim" },
                            explanation: { type: "STRING" }
                        },
                        required: ["situation", "options", "answer", "explanation"]
                    }
                }
            },
            required: ["questions"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuna uygun ${s.soruSayisi} adet durum (situation) oluştur.
      Her duruma uygun bir deyim (answer) ve üç yanlış seçenek (options) ver. Sınıf: ${grade}.
      Neden o deyimin doğru olduğunu kısaca açıkla (explanation).
    `,
        fastGenerate: () => ({
            questions: [
                {
                    situation: "Sınav sonucunu öğrenince çok sevinç içinde evine koşan çocuğun durumu:",
                    options: ["Göğsü kabarmak", "Dili tutulmak", "Eli ayağına dolaşmak", "Ağzı açık kalmak"],
                    answer: "Göğsü kabarmak",
                    explanation: "'Göğsü kabarmak' gurur ve sevinç hissetmek anlamına gelir."
                }
            ]
        })
    },
    {
        id: 'IDIOM_04_MEANING_CARD',
        studioId: 'deyimler',
        label: 'Anlam Kartı Eşleştirme',
        description: 'Deyimi kart olarak çevir, gerçek anlamını bul.',
        icon: 'fa-clone',
        difficulty: 'kolay',
        settings: [
            { key: 'kartSayisi', label: 'Kart Çifti Sayısı', type: 'range', defaultValue: 5, min: 4, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                pairs: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            idiom: { type: "STRING" },
                            meaning: { type: "STRING" }
                        },
                        required: ["idiom", "meaning"]
                    }
                }
            },
            required: ["pairs"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuna uygun ${s.kartSayisi} adet ${grade}. sınıf düzeyinde deyim seç.
      Her deyimi (idiom) gerçek anlamıyla (meaning) eşleştir.
      Deyimler birbirine karıştırılabilmeli (shuffle uyumlu).
    `,
        fastGenerate: () => ({
            pairs: [
                { idiom: "Eli açık olmak", meaning: "Cömert olmak, kolay harcamak." },
                { idiom: "Kılı kırk yarmak", meaning: "Aşırı dikkatli ve titiz olmak." },
                { idiom: "Ayakları yere basmak", meaning: "Gerçekçi ve pratik düşünmek." },
                { idiom: "Parmak ısırmak", meaning: "Çok şaşırmak, hayret etmek." },
                { idiom: "İşi rast gitmek", meaning: "İşlerin iyi gitmesi, başarıya ulaşmak." }
            ]
        })
    },
    {
        id: 'IDIOM_05_STORY_DETECTIVE',
        studioId: 'deyimler',
        label: 'Metindeki Deyim Dedektifi',
        description: 'Okuma parçasındaki deyim ve atasözlerini bulup anlamını yazma.',
        icon: 'fa-magnifying-glass',
        difficulty: 'zor',
        settings: [
            { key: 'metin', label: 'Metin Uzunluğu', type: 'select', defaultValue: 'Orta', options: ['Kısa', 'Orta', 'Uzun'] },
            { key: 'deyimSayisi', label: 'Gömülü Deyim Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                text: { type: "STRING" },
                hiddenIdioms: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            idiom: { type: "STRING" },
                            contextSentence: { type: "STRING", description: "Deyimin geçtiği cümle" },
                            meaning: { type: "STRING" }
                        },
                        required: ["idiom", "contextSentence", "meaning"]
                    }
                }
            },
            required: ["text", "hiddenIdioms"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı ${s.metin} uzunluğunda bir okuma metni yaz.
      Metne doğal biçimde ${s.deyimSayisi} adet deyim veya atasözü gömülü olsun.
      hiddenIdioms dizisinde her deyimi, metindeki cümlesini (contextSentence) ve anlamını ver. Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            text: "Ali, sınavdan yüksek not alınca göğsü kabardı. Ama ödevleri birikince eli ayağına dolaştı. Annesi 'Balık baştan kokar' dedi. Sonunda tüm derslere çalışıp ayakları yere basmayı öğrendi.",
            hiddenIdioms: [
                { idiom: "Göğsü kabarmak", contextSentence: "sınavdan yüksek not alınca göğsü kabardı", meaning: "Gurur ve sevinç duymak." },
                { idiom: "Eli ayağına dolaşmak", contextSentence: "ödevleri birikince eli ayağına dolaştı", meaning: "Telaşlanıp hata yapmak." },
                { idiom: "Balık baştan kokar", contextSentence: "Annesi 'Balık baştan kokar' dedi", meaning: "Bozukluk hep tepeden gelir." },
                { idiom: "Ayakları yere basmak", contextSentence: "ayakları yere basmayı öğrendi", meaning: "Gerçekçi olmak." }
            ]
        })
    },
    {
        id: 'IDIOM_06_PROVERB_DEBATE',
        studioId: 'deyimler',
        label: 'Atasözü Tartışma Köşesi',
        description: 'İki zıt atasözünü karşılaştırarak anlam farkını tartışma.',
        icon: 'fa-scale-balanced',
        difficulty: 'zor',
        settings: [
            { key: 'ciftSayisi', label: 'Çift Sayısı', type: 'range', defaultValue: 2, min: 1, max: 4 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                debates: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            proverb1: { type: "STRING" },
                            proverb2: { type: "STRING" },
                            commonTheme: { type: "STRING" },
                            difference: { type: "STRING" },
                            discussion: { type: "STRING", description: "Öğrenciye yöneltilecek tartışma sorusu" }
                        },
                        required: ["proverb1", "proverb2", "commonTheme", "difference", "discussion"]
                    }
                }
            },
            required: ["debates"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" ekseninde birbiriyle zıt veya çelişen ${s.ciftSayisi} atasözü çifti bul.
      Her çift için ortak temayı (commonTheme), anlam farkını (difference) ve sınıf tartışmasına açacak bir soru (discussion) yaz.
      Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            debates: [
                {
                    proverb1: "Acele eden deve kuyu da içer.",
                    proverb2: "Bugünün işini yarına bırakma.",
                    commonTheme: "Zaman yönetimi",
                    difference: "Biri aceleyi yerer, diğeri ertelemeyi.",
                    discussion: "Hangi atasözü daha çok hangi durumda geçerlidir? Örnekle tartış."
                }
            ]
        })
    },
    {
        id: 'IDIOM_07_SENTENCE_CREATION',
        studioId: 'deyimler',
        label: 'Deyimle Cümle Kurma Atölyesi',
        description: 'Verilen deyimi anlamlı bir bağlamda kullanarak özgün cümle yazma.',
        icon: 'fa-pen-to-square',
        difficulty: 'orta',
        settings: [
            { key: 'deyimSayisi', label: 'Deyim Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                idioms: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            idiom: { type: "STRING" },
                            meaning: { type: "STRING" },
                            exampleSentence: { type: "STRING", description: "Öğretmen için örnek cümle" }
                        },
                        required: ["idiom", "meaning", "exampleSentence"]
                    }
                }
            },
            required: ["idioms"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temasına uygun ${s.deyimSayisi} adet ${grade}. sınıf düzeyi deyim seç.
      Her deyim için anlamını (meaning) ve öğretmen için örnek cümle (exampleSentence) ver.
      Öğrenci bu sayfada deyimi görüp kendi özgün cümlesini boş satıra yazacak.
    `,
        fastGenerate: () => ({
            idioms: [
                { idiom: "Göz yummak", meaning: "Bir hatayı ya da durumu görmezden gelmek.", exampleSentence: "Öğretmen bu sefer küçük hataya göz yumdu." },
                { idiom: "Dil dökmek", meaning: "İkna etmek için tatlı dilli konuşmak.", exampleSentence: "Arkadaşını gelmeye ikna etmek için saatlerce dil döktü." },
                { idiom: "Başı belaya girmek", meaning: "Sıkıntı veya sorunla karşılaşmak.", exampleSentence: "Sınava geç kalan Ahmet başı belaya girdi." }
            ]
        })
    },
    {
        id: 'IDIOM_08_ORIGIN_STORY',
        studioId: 'deyimler',
        label: 'Atasözü Köken Hikâyesi',
        description: 'Bir atasözünün nasıl ortaya çıktığını anlatan kısa hikâye okuma.',
        icon: 'fa-book',
        difficulty: 'kolay',
        settings: [
            { key: 'atasozuSayisi', label: 'Atasözü Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                stories: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            proverb: { type: "STRING" },
                            originStory: { type: "STRING", description: "Kısa köken hikâyesi (2-3 cümle)" },
                            modernMeaning: { type: "STRING" },
                            questions: { type: "ARRAY", items: { type: "STRING" }, description: "2 anlama sorusu" }
                        },
                        required: ["proverb", "originStory", "modernMeaning", "questions"]
                    }
                }
            },
            required: ["stories"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusuyla ilişkilendirilebilecek ${s.atasozuSayisi} adet bilinen atasözü seç.
      Her atasözü için kısa ve eğlenceli bir köken hikâyesi yaz (2-3 cümle) ve günümüzdeki anlamını ver.
      Anlama soruları da ekle (questions). Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            stories: [
                {
                    proverb: "Taşıma su ile değirmen dönmez.",
                    originStory: "Eskiden değirmenler nehir kenarına kurulurdu. Bir köylü taşıyarak su getirip değirmenini döndürmeye çalışmış; ama her seferinde yorulmuş ve başaramamış.",
                    modernMeaning: "Geçici veya yetersiz kaynaklarla büyük işler yürütülemez.",
                    questions: ["Bu atasözü günümüzde hangi durumlara uygulanabilir?", "Atasözündeki 'taşıma su' neyi temsil ediyor?"]
                }
            ]
        })
    },
    {
        id: 'IDIOM_09_BODY_IDIOMS',
        studioId: 'deyimler',
        label: 'Vücut Deyimleri Haritası',
        description: 'Organ adı içeren deyimleri insan vücudu üzerinde etiketleme.',
        icon: 'fa-person',
        difficulty: 'kolay',
        settings: [
            { key: 'organSayisi', label: 'Organ/Deyim Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                bodyIdioms: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            bodyPart: { type: "STRING", description: "Organ adı" },
                            idiom: { type: "STRING" },
                            meaning: { type: "STRING" },
                            exampleSentence: { type: "STRING" }
                        },
                        required: ["bodyPart", "idiom", "meaning", "exampleSentence"]
                    }
                }
            },
            required: ["bodyIdioms"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temasıyla bağlantılı ${s.organSayisi} adet organ/vücut bölümü içeren deyim seç.
      Her deyim için organ adını (bodyPart), deyimi (idiom), anlamını (meaning) ve örnek cümleyi ver. Sınıf: ${grade}.
    `,
        fastGenerate: () => ({
            bodyIdioms: [
                { bodyPart: "Kulak", idiom: "Kulak kabartmak", meaning: "Gizlice dinlemek.", exampleSentence: "Arkadaşlar konuşurken kulak kabartıyordu." },
                { bodyPart: "Göz", idiom: "Göz atmak", meaning: "Hızlıca bakmak, üstünkörü incelemek.", exampleSentence: "Sınava girmeden önce notlara bir göz attı." },
                { bodyPart: "El", idiom: "El vermek", meaning: "Yardım etmek, destek olmak.", exampleSentence: "Komşusuna taşınmasında el verdi." }
            ]
        })
    },
    {
        id: 'IDIOM_10_PROVERB_QUIZ',
        studioId: 'deyimler',
        label: 'LGS Tarzı Deyim/Atasözü Testi',
        description: 'Paragraf anlam sorularıyla bütünleşik deyim/atasözü değerlendirmesi.',
        icon: 'fa-graduation-cap',
        difficulty: 'zor',
        settings: [
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                passage: { type: "STRING", description: "Deyim içeren okuma parçası" },
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
            required: ["passage", "questions"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" ekseninde ${grade}. sınıf LGS formatında bir okuma parçası yaz.
      Parçaya en az 3 deyim/atasözü göm.
      ${s.soruSayisi} adet çoktan seçmeli soru hazırla. Sorular deyimin anlamını, bağlamdaki kullanımını veya yerine geçebilecek ifadeyi ölçsün.
      Her soru için 4 seçenek, doğru cevap ve açıklama ver.
    `,
        fastGenerate: () => ({
            passage: "Efe, sınavdan düşük not aldığında yüzü düşmüştü. Ama 'Ne ekersen onu biçersin' diyen öğretmeninin sözleri aklında kaldı. Kılı kırk yarak çalıştı ve göğsü kabardı.",
            questions: [
                {
                    question: "Parçada 'Kılı kırk yarmak' deyimi hangi anlamda kullanılmıştır?",
                    options: ["A) Saç kesmek", "B) Çok dikkatli çalışmak", "C) Yorulmak", "D) Arkadaşa yardım etmek"],
                    answer: "B) Çok dikkatli çalışmak",
                    explanation: "'Kılı kırk yarmak' aşırı titiz ve dikkatli olmak demektir."
                }
            ]
        })
    }
];
