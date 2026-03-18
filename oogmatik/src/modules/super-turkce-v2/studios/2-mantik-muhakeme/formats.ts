import { TemplateDef } from '../../core/types';

export const logicReasoningFormats: TemplateDef[] = [
    {
        id: 'LOGIC_01_GRID',
        studioId: 'mantik-muhakeme',
        label: '4x4 Sözel Mantık Tablosu',
        description: 'LGS tarzı kişi-özellik eşleştirme ızgarası.',
        icon: 'fa-table-cells',
        difficulty: 'zor',
        settings: [
            { key: 'degiskenSayisi', label: 'Değişken Kategorisi', type: 'range', defaultValue: 3, min: 2, max: 4 },
            { key: 'ipucuSayisi', label: 'İpucu Sayısı', type: 'range', defaultValue: 5, min: 4, max: 7 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                scenario: { type: "STRING", description: "Olayın genel çerçevesi" },
                entities: { type: "ARRAY", items: { type: "STRING" }, description: "Kişiler (Örn: Ali, Veli, Ayşe)" },
                categories: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            name: { type: "STRING" },
                            items: { type: "ARRAY", items: { type: "STRING" } }
                        },
                        required: ["name", "items"]
                    }
                },
                clues: { type: "ARRAY", items: { type: "STRING" }, description: "Çözüm için ipuçları" },
                solution: { type: "STRING", description: "Öğretmen için çözüm anahtarı" }
            },
            required: ["scenario", "entities", "categories", "clues", "solution"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      ${grade}. sınıf seviyesinde, "${topic}" ekseninde %100 mantıklı, tutarlı ve tek çözümü olan bir Sözel Mantık (Grid Logic) bulmacası hazırla.
      Kişi (entities) sayısı 3 veya 4 olsun. Toplam kategori sayısı (categories): ${s.degiskenSayisi}.
      Şu ipuçlarını (clues) ver: ${s.ipucuSayisi} adet ipucu yaz. İpuçları 'Ali kırmızı şapka takmıyor', 'Dinozor seven kişi 3. sıradadır' gibi kesinlik veya eleme bildirsin.
    `,
        fastGenerate: () => ({
            scenario: "Spor kulübüne kayıt olan 3 arkadaşın (Can, Efe, Nil) seçtikleri spor dalları ve antrenman günleri farklıdır.",
            entities: ["Can", "Efe", "Nil"],
            categories: [
                { name: "Spor", items: ["Tenis", "Yüzme", "Okçuluk"] },
                { name: "Gün", items: ["Pazartesi", "Çarşamba", "Cuma"] }
            ],
            clues: [
                "Can, Çarşamba günleri antrenman yapmamaktadır.",
                "Okçuluk antrenmanı Cuma günüdür.",
                "Nil tenis oynamaktadır ve antrenmanı Pazartesi değildir."
            ],
            solution: "Can(Yüzme-Pzt), Efe(Okçuluk-Cuma), Nil(Tenis-Çarş)"
        })
    },
    {
        id: 'LOGIC_02_FIND_ERROR',
        studioId: 'mantik-muhakeme',
        label: 'Mantıksızlığı Bul',
        description: 'Metnindeki zaman, mekan veya mantık hatasını teşhis etme.',
        icon: 'fa-magnifying-glass-xmark',
        difficulty: 'orta',
        settings: [
            { key: 'hataTuru', label: 'Hata Türü', type: 'select', defaultValue: 'Gizli/İncelikli', options: ['Açık', 'Gizli/İncelikli'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                text: { type: "STRING", description: "4-5 cümlelik metin" },
                flawedSentenceIndex: { type: "NUMBER", description: "Hatalı olan cümlenin sırası (1-indexed)" },
                explanation: { type: "STRING", description: "Neden mantıksız olduğu" }
            },
            required: ["text", "flawedSentenceIndex", "explanation"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" temalı kısa bir paragraf (4-5 cümle) yaz. Sınıf seviyesi: ${grade}.
      Paragrafın içine mantıksal bir çelişki (anachronism, zaman/mekan uyuşmazlığı, fiziksel imkansızlık vb.) yerleştir. Format: ${s.hataTuru} hata.
      Hangi cümlenin hatalı olduğunu flawedSentenceIndex ile göster.
    `,
        fastGenerate: () => ({
            text: "Güneş yavaş yavaş batıyor, hava serinliyordu. Çocuklar dışarıda kar topu oynamak için montlarını giydiler. Ancak kalın kabanları içinde o kadar terlediler ki ağustos ortasında dışarı çıkmak pek keyifli olmadı.",
            flawedSentenceIndex: 3,
            explanation: "Ağustos ayında kar topu oynamak mantıksızdır, mevsimsel bir çelişki vardır."
        })
    },
    {
        id: 'LOGIC_03_CIPHER',
        studioId: 'mantik-muhakeme',
        label: 'Kripto / Şifre Çözücü',
        description: 'Verilen bir algoritma/anahtar ile gizli mesajı bulma.',
        icon: 'fa-key',
        difficulty: 'orta',
        settings: [
            { key: 'sifreTipi', label: 'Şifreleme Algoritması', type: 'select', defaultValue: 'Harf Kaydırma', options: ['Harf Kaydırma', 'Sayı-Harf Eşleştirme', 'Ters Çevirme'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                keyInstruction: { type: "STRING", description: "Şifrenin nasıl çözüleceği (Küçük bir örnekle)" },
                cipherText: { type: "STRING", description: "Şifreli metin" },
                plainText: { type: "STRING", description: "Cevap (Çözülmüş hali)" }
            },
            required: ["keyInstruction", "cipherText", "plainText"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" temasına uygun, öğrencilere moral/motivasyon verecek 3-4 kelimelik bir gizli mesaj oluştur (plainText). Sınıf: ${grade}.
        Daha sonra bu mesajı '${s.sifreTipi}' yöntemiyle şifrele (cipherText).
        keyInstruction bölümünde çocugun sifeleyi nasıl çözeceğini net, basit bir örnek vererek açıkla.
      `,
        fastGenerate: () => ({
            keyInstruction: "Alfabedeki her harfi bir sonraki harfle değiştirdik. (A->B, B->C gibi). Şifreyi çözmek için bir önceki harfe git!",
            cipherText: "L İ U B Q",
            plainText: "K İ T A P"
        })
    },
    {
        id: 'LOGIC_04_IF_THEN',
        studioId: 'mantik-muhakeme',
        label: 'Eğer - O Halde Algoritması',
        description: 'Bilişimsel düşünme temelli yönlendirme takibi.',
        icon: 'fa-code-branch',
        difficulty: 'zor',
        settings: [
            { key: 'adimSayisi', label: 'Komut Sayısı', type: 'range', defaultValue: 4, min: 3, max: 7 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                context: { type: "STRING" },
                rules: { type: "ARRAY", items: { type: "STRING" }, description: "Eğer X ise Y yap kuralları" },
                scenarios: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            situation: { type: "STRING" },
                            correctAction: { type: "STRING" }
                        },
                        required: ["situation", "correctAction"]
                    }
                }
            },
            required: ["context", "rules", "scenarios"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" temalı bir 'Robot Yönlendirme' veya 'Oyun Kuralları' senaryosu (context) oluştur. 
        Tam ${s.adimSayisi} adet "Eğer [Şart] gerçekleşirse, o halde [Eylem] yap" şeklinde kural belirle (rules).
        Daha sonra farklı durumlar (situations) vererek kural setini uygulatmaya yönelik soru/senaryolar yaz. Öğrenci doğru eylemi (correctAction) bulacak. Sınıf seviyesi: ${grade}.
      `,
        fastGenerate: () => ({
            context: "Mars'a inen keşif robotumuzun hareket kuralları şöyledir:",
            rules: [
                "Eğer önüne kaya çıkarsa sağa dön.",
                "Eğer pilin %20'nin altına düşerse güneş panellerini aç.",
                "Eğer kırmızı kum görürsen fotoğraf çek."
            ],
            scenarios: [
                { situation: "Robot ilerlerken pili %15'e düştü ve önünde dev bir kaya var. Ne yapmalı?", correctAction: "Güneş panellerini açmalı ve sağa dönmeli." }
            ]
        })
    },
    {
        id: 'LOGIC_05_SYLLOGISM',
        studioId: 'mantik-muhakeme',
        label: 'Kıyas (Tasım) Zinciri',
        description: 'A->B ve B->C ise A->C çıkarımı yapma.',
        icon: 'fa-code-compare',
        difficulty: 'zor',
        settings: [
            { key: 'soyutluk', label: 'Önermeler', type: 'select', defaultValue: 'Somut ve Gerçek', options: ['Somut ve Gerçek', 'Absürt ve Hayali (Alice Diyarı)'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                sets: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            premise1: { type: "STRING" },
                            premise2: { type: "STRING" },
                            validConclusion: { type: "STRING" },
                            invalidConclusion: { type: "STRING" }
                        },
                        required: ["premise1", "premise2", "validConclusion", "invalidConclusion"]
                    }
                }
            },
            required: ["sets"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        Bilişsel gelişimi desteklemek için "${topic}" ekseninde Kıyas (Syllogism) setleri oluştur. 
        Türü: '${s.soyutluk}'. 
        İki öncül (premise1, premise2) ve bunlardan çıkan %100 mantıklı bir sonuç (validConclusion) ile mantıksız bir sonuç (invalidConclusion) üret. Sayı: 3 set. Seviye: ${grade}.sınıf.
      `,
        fastGenerate: () => ({
            sets: [
                { premise1: "Bütün gezegenler Güneş etrafında döner.", premise2: "Dünya bir gezegendir.", validConclusion: "O halde Dünya da Güneş etrafında döner.", invalidConclusion: "Güneş, Dünya'nın etrafında döner." },
                { premise1: "Tüm zürafaların boynu uzundur.", premise2: "Kamil bir zürafadır.", validConclusion: "Kamil'in boynu uzundur.", invalidConclusion: "Kamil bir ağaçtır." }
            ]
        })
    },
    {
        id: 'LOGIC_06_FRACTURED_STORY',
        studioId: 'mantik-muhakeme',
        label: 'Parçalanmış Hikaye',
        description: 'Mantıksal sıralaması bozulmuş 6-8 cümlelik metni dizme.',
        icon: 'fa-puzzle-piece',
        difficulty: 'orta',
        settings: [
            { key: 'parcaSayisi', label: 'Parça Sayısı', type: 'range', defaultValue: 6, min: 4, max: 9 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                scrambledParts: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["scrambledParts"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        Sınıf seviyesi ${grade} olan öğrencilere "${topic}" hakkında anlamlı, kronolojik ve mantıksal bir akışı olan ${s.parcaSayisi} cümlelik kısa hikaye oluştur.
        Cümleleri JSON dizisinde RASTGELE SIRAYLA gönder (scrambledParts).
        Daha sonra öğrenci kağıt üzerinde bunları numaralandırarak sıraya sokacaktır.
      `,
        fastGenerate: () => ({
            scrambledParts: [
                "Fırından gelen kokular herkesi uyandırdı.", // 2
                "Sabahın erken saatlerinde küçük fırıncı işe koyuldu.", // 1
                "Ekmekleri tek tek kese kağıtlarına yerleştirdi.", // 4
                "Sıcak ekmekleri tepsilerden çıkarıp tezgaha dizdi.", // 3
                "İlk müşteri kapıdan içeri gülümseyerek girdi." // 5
            ].sort(() => Math.random() - 0.5)
        })
    },
    {
        id: 'LOGIC_07_ODD_ONE_OUT',
        studioId: 'mantik-muhakeme',
        label: 'Farklı Olanı Bul (Bağlam)',
        description: 'Verilen 4 maddeden mantıksal olarak gruba uymayanı bulma.',
        icon: 'fa-circle-exclamation',
        difficulty: 'kolay',
        settings: [
            { key: 'grupSayisi', label: 'Grup Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                groups: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            items: { type: "ARRAY", items: { type: "STRING" } },
                            oddOne: { type: "STRING" },
                            reason: { type: "STRING", description: "Öğretmen için açıklama" }
                        },
                        required: ["items", "oddOne", "reason"]
                    }
                }
            },
            required: ["groups"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" ve genel kültür bağlantılı, mantıksal kategori gruplandırması oyunu oluştur.
        Toplam ${s.grupSayisi} grup yapacaksın. Her grupta 4 kelime/ifade olacak (items dizisi, oddOne dahil karışık sırada verilsin).
        Bunlardan 3 tanesi belli bir ortak özelliğe sahipken, 1 tanesi (oddOne) dışarıda kalacak (Odd one out). Seviye: ${grade}.
      `,
        fastGenerate: () => ({
            groups: [
                { items: ["Elma", "Armut", "Muz", "Kabak"], oddOne: "Kabak", reason: "Diğerleri meyve, kabak sebzedir." },
                { items: ["Uçak", "Helikopter", "Planör", "Gemi"], oddOne: "Gemi", reason: "Diğerleri hava, gemi deniz taşıtıdır." }
            ]
        })
    },
    {
        id: 'LOGIC_08_RIDDLE_ME_THIS',
        studioId: 'mantik-muhakeme',
        label: 'Bilmeceli Mantık Yürütme',
        description: 'Soyut/Örtük ipuçlarından gerçeğe ulaşma bilmeceleri.',
        icon: 'fa-brain',
        difficulty: 'orta',
        settings: [
            { key: 'bilmeceSayisi', label: 'Bilmece Sayısı', type: 'range', defaultValue: 4, min: 3, max: 8 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                riddles: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            riddleText: { type: "STRING" },
                            answer: { type: "STRING" }
                        },
                        required: ["riddleText", "answer"]
                    }
                }
            },
            required: ["riddles"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" kavramları etrafında veya genel hayata dair ${grade}. sınıfa uygun, modern ve eğlenceli ${s.bilmeceSayisi} adet bilmece üret.
        Fazla klasik (Örn: Çarşıdan aldım bir tane...) OLMASIN. Çocuğun özelliklerden eşyayı/kavramı ÇIKARAKÇASI mantık yürütme formatları (Örn: 'Bacaklarım var ama yürümem, sırtım var ama omurgam yok. Ben neyim? -> Sandalye') olsun.
      `,
        fastGenerate: () => ({
            riddles: [
                { riddleText: "Şehirlerim var evim yok, nehirlerim var suyum yok. Ben neyim?", answer: "Harita" },
                { riddleText: "Beni paylaştıkça büyürüm. Tek başınayken hiçbir işe yaramam.", answer: "Sevgi / Bilgi" }
            ]
        })
    },
    {
        id: 'LOGIC_09_VISUAL_MATH',
        studioId: 'mantik-muhakeme',
        label: 'Sözel-Matematiksel İlişki',
        description: 'Sözel problemin içindeki gizli işlem mantığını çözme.',
        icon: 'fa-calculator',
        difficulty: 'zor',
        settings: [
            { key: 'islemSayisi', label: 'Problem Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                problems: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            storyText: { type: "STRING" },
                            questionText: { type: "STRING" },
                            logicSteps: { type: "ARRAY", items: { type: "STRING" } },
                            finalAnswer: { type: "STRING" }
                        },
                        required: ["storyText", "questionText", "logicSteps", "finalAnswer"]
                    }
                }
            },
            required: ["problems"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        Matematikten çok 'Mantık ve Dikkat' gerektiren ${s.islemSayisi} adet sözel problem yaz. Seviye: ${grade}.sınıf. ("${topic}")
        Örneğin: 'Ağacın üstünde 10 kuş var. Avcı 1 el ateş edip 1 kuşu vurursa kaç kuş kalır?' (Cevap: 0, hepsi uçar). 
        Böyle 'Trick' (şaşırtmaca) barındıran veya adım adım okumayı gerektiren hikayeli problemler (storyText) üret. 
      `,
        fastGenerate: () => ({
            problems: [
                {
                    storyText: "Bir yarıştasınız. Tam bitiş çizgisine yaklaşırken ikinci sıradaki kişiyi geçtiniz.",
                    questionText: "Şu anda kaçıncı sıradasınız?",
                    logicSteps: [
                        "İkinciyi geçen kişi onun yerine geçer.",
                        "Yani ikinci sıraya yerleşir.",
                        "Birinci olmak için birinciyi geçmek gerekir."
                    ],
                    finalAnswer: "İkinci (2.) sıradasınız."
                }
            ]
        })
    },
    {
        id: 'LOGIC_10_DIRECTIONAL',
        studioId: 'mantik-muhakeme',
        label: 'Yön ve Alan Uzamsal Takip',
        description: 'Yazılı komutlarla bir harita veya mekanda hareket etme.',
        icon: 'fa-compass',
        difficulty: 'orta',
        settings: [
            { key: 'adimBuyuklugu', label: 'Adım Karmaşıklığı', type: 'range', defaultValue: 5, min: 3, max: 7 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                startPoint: { type: "STRING" },
                instructions: { type: "ARRAY", items: { type: "STRING" } },
                finalDestinationQuestion: { type: "STRING" },
                correctDestination: { type: "STRING" }
            },
            required: ["startPoint", "instructions", "finalDestinationQuestion", "correctDestination"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" mekanında (Örneğin: Uzay üssü, Orman Kampı vs) geçen uzamsal bir yön bulma oyunu hazırla. Seviye: ${grade}.sınıf.
        Başlangıç noktasını (startPoint) belirle. Öğrencinin zihninde veya kağıda çizerek takip edeceği ${s.adimBuyuklugu} adet komut (Kuzeye git, sağa dön, 2 kare ilerle vb) ver (instructions).
        Günün sonunda nereye ulaştığını soran finalDestinationQuestion ve cevabı olan correctDestination'ı belirle.
      `,
        fastGenerate: () => ({
            startPoint: "Okul bahçesinin tam ortasındaki bayrak direği.",
            instructions: [
                "Yüzünü okul binasına dön.",
                "3 adım ilerle ve sağa dön.",
                "5 adım yürü ve tekrar sağa dön."
            ],
            finalDestinationQuestion: "Şu anda yüzün başlangıçtaki duruma göre hangi yöne (nereye) bakıyor?",
            correctDestination: "Okul binasının tersi yönüne (Arkanı dönmüş oldun)."
        })
    }
];
