import { TemplateDef } from '../../core/types';

export const readingComprehensionFormats: TemplateDef[] = [
    {
        id: 'READ_01_5N1K',
        studioId: 'okuma-anlama',
        label: '5N1K Derin Analiz Karti',
        description: 'Haber veya hikaye metninin kim, ne, nerede boyutlarini çizer.',
        icon: 'fa-newspaper',
        difficulty: 'all',
        settings: [
            { key: 'soruSayisi', label: 'Soru Sayisi', type: 'range', defaultValue: 5, min: 3, max: 6 },
            { key: 'metinBoyutu', label: 'Metin Uzunlugu', type: 'select', defaultValue: 'Orta', options: ['Kisa', 'Orta', 'Uzun'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                title: { type: "STRING" },
                content: { type: "STRING", description: "Ana okuma metni" },
                questions: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            type: { type: "STRING", description: "Örn: Ne, Nerede, Kim" },
                            question: { type: "STRING" },
                            emptyLines: { type: "NUMBER", description: "Çocugun yazmasi için gerekli bos satir sayisi (1-3)" }
                        },
                        required: ["type", "question", "emptyLines"]
                    }
                }
            },
            required: ["title", "content", "questions"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      ${grade}. sinif ögrencileri için "${topic}" temali bir okuma metni yaz.
      Metin uzunlugu: ${s.metinBoyutu}.
      Metne bagli olarak tam ${s.soruSayisi} adet 5N1K türünde analiz sorusu çikar. 
      Her soru için çocugun yazacagi cevabin uzunluguna göre 1 ile 3 arasinda 'emptyLines' belirle.
    `,
        fastGenerate: () => ({
            title: "Ormandaki Gizemli Ses",
            content: "Küçük ayi sabah uyandiginda ormanin derinliklerinden gelen garip bir ses duydu. Ses nehrin karsisindaki ulu çinar agacindan geliyordu.",
            questions: [
                { type: "Kim", question: "Sabah uyanan kimdir?", emptyLines: 1 },
                { type: "Nerede", question: "Ses tam olarak nereden geliyordu?", emptyLines: 2 }
            ]
        })
    },
    {
        id: 'READ_02_VENN',
        studioId: 'okuma-anlama',
        label: 'Venn Diyagrami',
        description: 'Iki farkli kavram veya karakteri karsilastirmali okuma.',
        icon: 'fa-object-group',
        difficulty: 'orta',
        settings: [
            { key: 'karisikEkle', label: 'Ipucu Kelimeleri Ver', type: 'toggle', defaultValue: true }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                conceptA: { type: "STRING" },
                conceptB: { type: "STRING" },
                text: { type: "STRING", description: "Karsilastirma metni" },
                clues: { type: "ARRAY", items: { type: "STRING" }, description: "Ögrencilerin diyagrama yerlestirecegi özellikler listesi" }
            },
            required: ["conceptA", "conceptB", "text"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      ${grade}. siniflar için "${topic}" konusu etrafinda iki farkli kavrami (veya karakteri) karsilastiran kisa bir metin yaz.
      Kavramlar conceptA ve conceptB olarak net belirlensin.
      ${s.karisikEkle ? "Metnin altinda diyagrama yerlestirilmeleri için karisik 6-8 adet ipucu (clue) kelime/cümlecik ver. Bunlarin bir kismi A'ya, bir kismi B'ye, bir kismi ikisine de uymali." : ""}
    `,
        fastGenerate: () => ({
            conceptA: "Yaz Mevsimi",
            conceptB: "Kis Mevsimi",
            text: "Yaz mevsiminde sicak rüzgarlar eserken kisin dondurucu soguklar baslar. Ancak her iki mevsim de çocuklar için oyun demektir.",
            clues: ["Kar yagar", "Güneslidir", "Oyun oynanir", "Sicaktir", "Kalindir"]
        })
    },
    {
        id: 'READ_03_STORY_MAP',
        studioId: 'okuma-anlama',
        label: 'Hikaye Haritasi',
        description: 'Olay, Kahraman, Yer, Zaman, Sorun ve Çözüm haritasi',
        icon: 'fa-map',
        difficulty: 'kolay',
        settings: [
            { key: 'sorunCozum', label: 'Sorun-Çözüm Eklensin mi?', type: 'toggle', defaultValue: true }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                title: { type: "STRING" },
                story: { type: "STRING" },
                mapElements: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            label: { type: "STRING", description: "Olay, Kisiler vb" },
                            placeholderText: { type: "STRING", description: "Kutu içi ipucu" }
                        },
                        required: ["label", "placeholderText"]
                    }
                }
            },
            required: ["title", "story", "mapElements"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      ${grade}. siniflar için "${topic}" ana fikrini tasiyan macera/öyküleyici bir metin yaz.
      Metinde ana karakter(ler), net bir mekan, zaman ve ${s.sorunCozum ? "bir sorun ile çozumu" : "belirgin olay örgüsü"} bulunmali.
      mapElements dizisine çizilecek kutularin basliklarini (Ana Karakter, Yer, Zaman, Sorun, Çözüm) ve içine ögrencinin yazmasini kolaylastiracak kisa ipuçlarini koy.
    `,
        fastGenerate: () => ({
            title: "Kayıp Harita",
            story: "Efe, kasabanın eski kütüphanesinde tozlu raflar arasında dedesinden kalma bir harita buldu...",
            mapElements: [
                { label: "Ana Karakterler", placeholderText: "Kimler var?" },
                { label: "Olay Yeri", placeholderText: "Nerede gerçekleşiyor?" }
            ]
        })
    },
    {
        id: 'READ_04_INFER_FEELING',
        studioId: 'okuma-anlama',
        label: 'Duygu Termometresi',
        description: 'Metindeki gizli duyguyu çikarma ve dereceleme çalisma kagidi.',
        icon: 'fa-temperature-half',
        difficulty: 'zor',
        settings: [
            { key: 'durumSayisi', label: 'Verilen Durum Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                instruction: { type: "STRING" },
                situations: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            text: { type: "STRING", description: "Duyguyu gizlice hissettiren kisa paragraf" },
                            hiddenEmotion: { type: "STRING", description: "Hedef duygu" }
                        },
                        required: ["text", "hiddenEmotion"]
                    }
                }
            },
            required: ["instruction", "situations"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
      "${topic}" konusunda ${s.durumSayisi} adet kisa durum/paragraf yaz. Sınıf: ${grade}.
      Paragraflarda duygularin isimlerini (üzüldü, sevindi, korktu vb) YAZMA. 
      Bunun yerine zihinde canlanan fiziksel tepkileri veya düsünceleri yazarak ögrencinin duyguyu çikartmasini sagla 
      (Örn: 'Kalbi hizla çarpmaya basladi, elleri terlemisti' -> Korku/Heyecan).
      Çogu metin ${grade > 5 ? 'incelikli ve zor tahmin edilebilir' : 'basit somut ipuçlu'} olsun.
    `,
        fastGenerate: () => ({
            instruction: "Aşağıdaki olayları okuyun. Karakterin hangi duyguyu hissettiğini yanındaki boşluğa yazın.",
            situations: [
                { text: "Eve girdiğinde her yer karanlıktı. Aniden ışıklar yandı ve herkes 'Sürpriz!' diye bağırdı. Gözleri yaşardı.", hiddenEmotion: "Mutluluk/Şaşkınlık" },
                { text: "Başını önüne eğdi, ayak parmaklarına bakarak tek kelime etmeden odadan çıktı.", hiddenEmotion: "Üzüntü/Utanç" }
            ]
        })
    },
    {
        id: 'READ_05_CAUSE_EFFECT',
        studioId: 'okuma-anlama',
        label: 'Neden-Sonuç Zinciri',
        description: 'Metindeki olayların birbirini nasıl tetiklediğini bulma.',
        icon: 'fa-link',
        difficulty: 'orta',
        settings: [
            { key: 'zincirUzunlugu', label: 'Zincir Uzunluğu', type: 'range', defaultValue: 4, min: 3, max: 6 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                text: { type: "STRING" },
                chain: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            step: { type: "NUMBER" },
                            cause: { type: "STRING", description: "Varsa veya boş bırakılacaksa" },
                            effect: { type: "STRING", description: "Varsa veya boş bırakılacaksa" },
                            missing: { type: "STRING", description: "'cause' veya 'effect' boş ise öğrenci dolduracak" }
                        },
                        required: ["step", "missing"]
                    }
                }
            },
            required: ["text", "chain"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" temasında, domino taşı etkisi gibi birbirini tetikleyen ardışık olayların olduğu bir metin yaz. Sınıf seviyesi: ${grade}.
        Daha sonra ${s.zincirUzunlugu} halkalı bir zincir oluştur. Zincirin bazı halkalarında Nedenler eksik olsun, bazılarında Sonuçlar eksik olsun. (missing alanı 'cause' veya 'effect' degeri almali).
      `,
        fastGenerate: () => ({
            text: "Gece şiddetli yağmur yağdığı için nehir taştı. Nehir taşınca yollar kapandı. Yollar kapanınca okullar tatil edildi.",
            chain: [
                { step: 1, cause: "Gece şiddetli yağmur yağması", effect: "", missing: "effect" },
                { step: 2, cause: "", effect: "Okulların tatil edilmesi", missing: "cause" }
            ]
        })
    },
    {
        id: 'READ_06_TRUE_FALSE',
        studioId: 'okuma-anlama',
        label: 'Doğru / Yanlış İfadesi',
        description: 'Klasik ama şaşırtmacalı D/Y tabloları.',
        icon: 'fa-check-double',
        difficulty: 'kolay',
        settings: [
            { key: 'maddeSayisi', label: 'Madde Sayısı', type: 'range', defaultValue: 5, min: 4, max: 10 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                text: { type: "STRING", description: "Kısa metin" },
                statements: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            statement: { type: "STRING" },
                            isTrue: { type: "BOOLEAN" }
                        },
                        required: ["statement", "isTrue"]
                    }
                }
            },
            required: ["text", "statements"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" temalı, ${grade}. sınıfa uygun bilgilendirici bir metin oluştur.
        Ardından metne dayalı ${s.maddeSayisi} adet Doğru/Yanlış önermesi çıkar.
        Yanlış önermelerin yarısı çeldirici olmalı (metinde geçmeyen ama gerçekte doğru olabilen gibi ya da metindeki bir kelimenin değiştirilmesiyle oluşturulmuş).
      `,
        fastGenerate: () => ({
            text: "Güneş sistemimizde 8 gezegen bulunmaktadır. Bunlardan en büyüğü Jüpiter'dir.",
            statements: [
                { statement: "Sistemde toplam 9 gezegen vardır.", isTrue: false },
                { statement: "Jüpiter güneş sisteminin en büyük gezegenidir.", isTrue: true }
            ]
        })
    },
    {
        id: 'READ_07_TITLE_FIND',
        studioId: 'okuma-anlama',
        label: 'Ana Fikir ve Başlık',
        description: 'Metnin ana fikrini yazıp ona uygun başlık bulma etkinliği.',
        icon: 'fa-heading',
        difficulty: 'orta',
        settings: [
            { key: 'metinSayisi', label: 'Kaç Farklı Metin', type: 'range', defaultValue: 2, min: 1, max: 4 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                items: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            text: { type: "STRING" }
                        },
                        required: ["text"]
                    }
                }
            },
            required: ["items"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" konusunda ${s.metinSayisi} adet tamamen farklı ana fikir taşıyan kısa metin tasarla.
        Öğrenciden bu metinlerin altına kendi ana fikrini ve en uygun başlığını yazması beklenecek, bu yüzden mesajı net ama doğrudan vermeyen metinler olmalı. Seviye: ${grade}.sınıf.
      `,
        fastGenerate: () => ({
            items: [
                { text: "Herkesin aynı şeyi düşündüğü yerde, aslında kimse çok fazla düşünmüyordur." },
                { text: "Başarısızlık, yeniden ve daha zekice başlama fırsatından başka bir şey değildir." }
            ]
        })
    },
    {
        id: 'READ_08_LGS_PARAGRAPH',
        studioId: 'okuma-anlama',
        label: 'LGS Yeni Nesil Paragraf',
        description: 'Çoklu çıkarım ve muhakeme gerektiren uzun paragraf analizi.',
        icon: 'fa-graduation-cap',
        difficulty: 'lgs',
        settings: [
            { key: 'grafikVarMi', label: 'Metinde görsel referans?', type: 'toggle', defaultValue: false },
            { key: 'secenekSayisi', label: 'Şık Sayısı', type: 'select', defaultValue: '4', options: ['4'] }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                passage: { type: "STRING", description: "Büyük LGS paragrafı" },
                infographicContext: { type: "STRING", description: "Görsel veya grafik tasviri, eğer seçilmişse" },
                questionText: { type: "STRING", description: "Soru kökü" },
                options: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["passage", "questionText", "options"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        LGS (8. sınıf) zorluğunda, "${topic}" ekseninde yeni nesil bir paragraf sorusu oluştur.
        ${s.grafikVarMi ? 'Soruda bir infografik tablosu/grafiği de var gibi davran, bu görsel veriyi infographicContext icinde tasvir et.' : ''}
        Soru kökü 'Buna göre aşağıdakilerden hangisine ulaşılamaz?' veya 'Metindeki ana düşünceyi destekleyen en güçlü veri hangisidir?' tadında yüksek bilişsel beceri gerektirsin.
        Seçenekler ${s.secenekSayisi} adet olacak. Sadece 1 doğru seçenek, diğer 3 'ü çok güçlü çeldirici olsun (kapsam dışı veya aşırı genelleme olan).
      `,
        fastGenerate: () => ({
            passage: "Modern çağın en büyük meydan okumalarından biri, bilgi kirliliğidir. Eskiden bilgiye ulaşmak zorken, bugün doğru bilgiyi teyit etmek asıl uzmanlık alanı haline gelmiştir...",
            infographicContext: "",
            questionText: "Bu metinden hareketle aşağıdaki yargılardan hangisine KESİNLİKLE ulaşılamaz?",
            options: ["A) Eskiden bilgikaynakları daha azdı.", "B) Günümüzde doğrulama becerisi, bilgiyi bulmaktan daha kritiktir.", "C) Bilgiye kolay ulaşmak, cehaleti tamamen ortadan kaldırmıştır.", "D) Her dönemin kendine has zorlukları vardır."]
        })
    },
    {
        id: 'READ_09_SEQ_ORDER',
        studioId: 'okuma-anlama',
        label: 'Olay Sıralama',
        description: 'Karışık verilen olayları / cümleleri sıraya dizme.',
        icon: 'fa-list-ol',
        difficulty: 'kolay',
        settings: [
            { key: 'cumleSayisi', label: 'Cümle Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                shuffledSentences: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["shuffledSentences"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        "${topic}" temasında anlamlı bir bütün oluşturan ${s.cumleSayisi} cümlelik bir hikaye veya süreç (örneğin bir bitkinin düğü, deney vs) oluştur.
        Cümleleri JSON çıktısında KARIŞIK SIRAYLA (shuffled) ver. 
        Kullanıcı bunları kesip yapıştırma veya numara vererek sıraya dizecek. Cümleler aralarında zaman zarfları ('önce, sonra, nihayet') barındırsın ki mantık kurmada ipucu olsun. Sınıf seviyesi: ${grade}.
      `,
        fastGenerate: () => ({
            shuffledSentences: [
                "Fırından taze çıkan simitlerin kokusu tüm sokağı sardı.",
                "Fırıncı Rıza amca kepenkleri açıp hamur karmaya başladı.",
                "Hazırlanan simitler dikkatle tepsilere dizilip fırına verildi.",
                "Sabahın ilk ışıklarıyla birlikte sokakta hayat başladı."
            ].sort(() => Math.random() - 0.5)
        })
    },
    {
        id: 'READ_10_VOCAB_CONTEXT',
        studioId: 'okuma-anlama',
        label: 'Bağlamdan Kelime Avı',
        description: 'Metin içinde anlamı bağlamdan çıkarılabilecek kelimeleri buldurma.',
        icon: 'fa-magnifying-glass-plus',
        difficulty: 'orta',
        settings: [
            { key: 'hedefKelimeSayisi', label: 'Hedef Kelime', type: 'range', defaultValue: 3, min: 2, max: 5 }
        ],
        schema: {
            type: "OBJECT",
            properties: {
                passage: { type: "STRING", description: "Bol bağlam ipucu içeren metin" },
                targetWords: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            word: { type: "STRING" },
                            contextClue: { type: "STRING", description: "Öğrencinin metinden altını çizeceği açıklayıcı bölge" },
                            meaning: { type: "STRING" }
                        },
                        required: ["word", "meaning"]
                    }
                }
            },
            required: ["passage", "targetWords"]
        },
        buildAiPrompt: (s: any, grade: any, topic: any) => `
        ${grade}. sınıf seviyesinde, MEB müfredatında yer alan ${s.hedefKelimeSayisi} adet akademik / yeni kelimeyi içeren "${topic}" bağlamında bir metin oluştur.
        Bu kelimelerin anlamı doğrudan verilmemeli, fakat içindeki ve etrafındaki cümleler (bağlam ipuçları) sayesinde anlamı ÇIKARILABİLİR olmalı.
      `,
        fastGenerate: () => ({
            passage: "Dağcılar, zirveye yaklaştıkça havanın ne kadar çetin ve sert olduğunu hissettiler. Bu *çetin* koşullar altında ilerlemek, adeta güçlerini son damlasına kadar emiyordu.",
            targetWords: [
                { word: "çetin", contextClue: "sert olduğunu hissettiler, güçlerini son damlasına kadar emiyordu", meaning: "Zorlu, sert, güç." }
            ]
        })
    }
];
