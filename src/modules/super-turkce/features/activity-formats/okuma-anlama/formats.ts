// =============================================================================
// OKUMA ANLAMA & YORUMLAMA — 10 Format Tanımı
// Her formatın: ince ayarları (SettingDef[]), hızlı motor ve AI prompt mantığı.
// =============================================================================

import { ActivityFormatDef } from '../../../core/types/activity-formats';


const BASE_TOPIC = (topic: string, grade: number | null) =>
    `${grade ? grade + '. sınıf' : 'Genel'} Türkçe - ${topic}`;

export const okumaAnlamaFormats: ActivityFormatDef[] = [
    {
        id: '5N1K',
        category: 'okuma_anlama',
        icon: 'fa-newspaper',
        label: '5N1K Haber Küpürü Analizi',
        description: 'Gerçek gazete haberinden 5N1K anlama soruları üret.',
        difficulty: 'all',
        settings: [
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'haberTuru', label: 'Haber Türü', type: 'select', defaultValue: 'guncel', options: ['Güncel', 'Bilim', 'Spor', 'Kültür'] },
            { key: 'metinUzunlugu', label: 'Metin Uzunluğu', type: 'select', defaultValue: 'orta', options: ['Kısa (3-5 cümle)', 'Orta (5-8 cümle)', 'Uzun (8-12 cümle)'] },
            { key: 'gorselEkle', label: 'Haber Görseli (Kutu)', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { title: { type: "STRING" }, content: { type: "STRING" }, questions: { type: "ARRAY", items: { type: "STRING" } }, hasImage: { type: "BOOLEAN" } }, required: ["title", "content", "questions"] },
        fastGenerate: (s, grade, topic) => ({
            title: `${s.haberTuru.toUpperCase()} HABERİ: ${BASE_TOPIC(topic, grade)}`,
            content: Array.from({ length: s.metinUzunlugu === 'Kısa (3-5 cümle)' ? 4 : s.metinUzunlugu === 'Orta (5-8 cümle)' ? 6 : 10 })
                .map((_, i) => `Cümle ${i + 1}: ${topic} konusuyla ilgili haber içeriği.`).join(' '),
            questions: ['Kim?', 'Ne?', 'Nerede?', 'Ne Zaman?', 'Neden?', 'Nasıl?'].slice(0, s.soruSayisi),
            hasImage: s.gorselEkle,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf Türkçe öğrencisi için "${topic}" konusunu işleyen, ${s.haberTuru} kategorisinde, ` +
            `${s.metinUzunlugu} uzunluğunda gerçekçi bir haber metni yaz. Ardından metinden 5N1K soruları ${s.soruSayisi} adet sor.`,
    },
    {
        id: 'ANA_DUSUNCE',
        category: 'okuma_anlama',
        icon: 'fa-lightbulb',
        label: 'Paragrafta Ana Düşünce',
        description: 'Paragraftan merkezi fikri bulma, yardımcı düşünce ayrımı.',
        difficulty: 'all',
        settings: [
            { key: 'celdiriciOrani', label: 'Çeldirici Şık Oranı', type: 'select', defaultValue: 'orta', options: ['Düşük (kolay)', 'Orta', 'Yüksek (LGS tarzı)'] },
            { key: 'cokluParagraf', label: 'Çoklu Paragraf', type: 'toggle', defaultValue: false },
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 4, min: 2, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { question: { type: "STRING" }, paragraf: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["question", "paragraf", "options"] },
        fastGenerate: (s, grade, topic) => ({
            question: `Aşağıdaki paragrafta "${topic}" ile ilgili ana düşünce nedir?`,
            paragraf: `Bu paragraf ${grade}. sınıf düzeyinde ${topic} konusunu ele almaktadır. Paragrafın başında iddianın atıldığı, gelişme kısmında desteklendiği ve sonuç cümlesiyle tamamlandığı görülmektedir.`,
            options: [
                'A) Yardımcı düşünce (yanlış - çeldirici)',
                `B) ${topic} konusunun temel mesajı (DOĞRU)`,
                'C) Konuyla ilgisiz detay (yanlış)',
                'D) Örneklerden çıkan ikincil yorum (yanlış)',
            ].slice(0, 4),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf Türkçe "${topic}" konusunda ${s.cokluParagraf ? 'iki farklı' : 'bir'} paragraf yaz. ` +
            `Her paragraf için ${s.celdiriciOrani === 'Yüksek (LGS tarzı)' ? 'LGS tarzında aldatıcı çeldiriciler içeren' : 'sade'} ` +
            `${s.soruSayisi} adet "ana düşünce nedir?" sorusu hazırla.`,
    },
    {
        id: 'CIKARIM_YAPMA',
        category: 'okuma_anlama',
        icon: 'fa-magnifying-glass',
        label: 'Metinden Çıkarım Yapma',
        description: 'Okunan metinden dolaylı anlam ve çıkarım soruları üretir.',
        difficulty: 'medium',
        settings: [
            { key: 'yorumSayisi', label: 'Çıkarım Sorusu Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 },
            { key: 'zorluk', label: 'Zorluk', type: 'select', defaultValue: 'orta', options: ['Basit', 'Orta', 'Zorlu'] },
            { key: 'metinTuru', label: 'Metin Türü', type: 'select', defaultValue: 'hikaye', options: ['Hikâye', 'Bilgilendirici', 'Şiir'] },
        ],
        schema: { type: "OBJECT", properties: { metin: { type: "STRING" }, questions: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["soru", "options"] } } }, required: ["metin", "questions"] },
        fastGenerate: (s, grade, topic) => ({
            metin: `"${topic}" konusuna dair ${s.metinTuru} türünde bir metin. Metnin bazı ifadeleri dolaylı anlatım içermektedir.`,
            questions: Array.from({ length: s.yorumSayisi }, (_, i) => ({
                soru: `Soru ${i + 1}: Metnin "${i + 1}. paragrafından" çıkarılabilecek en doğru anlam hangisidir?`,
                options: ['A) Doğrudan söylenen', 'B) Yazar açıkça ima ediyor', 'C) Metnin ruhu buna işaret ediyor', 'D) Yanlış çıkarım'],
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" konusunda ${s.metinTuru} türünde bir metin yaz. ` +
            `Metinden ${s.yorumSayisi} adet çıkarım sorusu türet. Zorluk: ${s.zorluk}.`,
    },
    {
        id: 'METIN_KARSILASTIRMA',
        category: 'okuma_anlama',
        icon: 'fa-scale-balanced',
        label: 'İki Metni Karşılaştırma',
        description: 'İki farklı metin arasında Venn diyagramı veya tablo temelli karşılaştırma.',
        difficulty: 'medium',
        settings: [
            { key: 'format', label: 'Karşılaştırma Formatı', type: 'select', defaultValue: 'tablo', options: ['Tablo', 'Venn Diyagramı', 'Liste'] },
            { key: 'boyut', label: 'Karşılaştırma Boyutu', type: 'select', defaultValue: 'benzerlik_zitlik', options: ['Benzerlik/Zıtlık', 'Amaç/Konu', 'Dil/Üslup'] },
        ],
        schema: { type: "OBJECT", properties: { metin1: { type: "STRING" }, metin2: { type: "STRING" }, format: { type: "STRING" }, boyut: { type: "STRING" } }, required: ["metin1", "metin2", "format", "boyut"] },
        fastGenerate: (s, grade, topic) => ({
            metin1: `Metin A: ${topic} hakkında görüş bildiren ilk yazar.`,
            metin2: `Metin B: ${topic} hakkında farklı bir bakış açısı sunan ikinci yazar.`,
            format: s.format,
            boyut: s.boyut,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda birbirinden farklı üsluba sahip iki kısa metin yaz. ` +
            `Öğrenciden bu metinleri ${s.format} formatında ${s.boyut} boyutunda karşılaştırmasını iste.`,
    },
    {
        id: 'OLAY_SIRALAMA',
        category: 'okuma_anlama',
        icon: 'fa-arrow-down-1-9',
        label: 'Olay Örgüsü Sıralama',
        description: 'Karıştırılmış cümleler doğru sıraya konulur.',
        difficulty: 'easy',
        settings: [
            { key: 'cumleAdedi', label: 'Cümle Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'kafaKaristirici', label: 'Kafa Karıştırıcı Cümle Ekle', type: 'toggle', defaultValue: false },
        ],
        schema: { type: "OBJECT", properties: { shuffled: { type: "ARRAY", items: { type: "STRING" } }, correct: { type: "ARRAY", items: { type: "STRING" } } }, required: ["shuffled", "correct"] },
        fastGenerate: (s, grade, topic) => {
            const sentences = Array.from({ length: s.cumleAdedi }, (_, i) =>
                `${i + 1}. Olay: "${topic}" ile ilgili ${i + 1}. sıradaki olay cümlesi.`
            );
            const shuffled = [...sentences].sort(() => Math.random() - 0.5);
            return { shuffled, correct: sentences };
        },
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.cumleAdedi} cümlelik bir olay örgüsü hikâyesi yaz. ` +
            `Cümleleri karıştır. ${s.kafaKaristirici ? 'Bir cümle konuyla alakasız olsun.' : ''} Öğrenci doğru sıraya koysun.`,
    },
    {
        id: 'BASLIK_BULMA',
        category: 'okuma_anlama',
        icon: 'fa-heading',
        label: 'En Uygun Başlığı Seç',
        description: 'Özet veya paragraf için en uygun başlık bulma.',
        difficulty: 'easy',
        settings: [
            { key: 'secenekSayisi', label: 'Şık Sayısı', type: 'select', defaultValue: '4', options: ['4', '5'] },
            { key: 'yaniltici', label: 'Yanıltıcı Şık Oranı', type: 'select', defaultValue: 'orta', options: ['Az', 'Orta', 'Çok'] },
        ],
        schema: { type: "OBJECT", properties: { paragraf: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["paragraf", "options"] },
        fastGenerate: (s, grade, topic) => ({
            paragraf: `"${topic}" konusunu anlatan kısa bir metin. Bu metne aşağıdakilerden hangisi en uygun başlık olur?`,
            options: [
                `A) ${topic}: Bilinmeyenler (yanlış)`, `B) ${topic}'in Önemi (DOĞRU)`,
                `C) Konuyla Uzak İlişkili Başlık (yanlış)`, `D) Çok Genel Bir Başlık (yanlış)`,
            ].slice(0, parseInt(s.secenekSayisi)),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda 4-6 cümlelik bir paragraf yaz. ` +
            `${s.secenekSayisi} şıklı "Bu metne en uygun başlık hangisidir?" sorusu hazırla. Yanıltıcı şık oranı: ${s.yaniltici}.`,
    },
    {
        id: 'SIIR_INCELEME',
        category: 'okuma_anlama',
        icon: 'fa-feather',
        label: 'Şiir İnceleme ve Duygu',
        description: 'Şiirde duygu, tema ve ses uyumu analizi yapılır.',
        difficulty: 'medium',
        settings: [
            { key: 'misraSayisi', label: 'Mısra Sayısı', type: 'range', defaultValue: 8, min: 4, max: 16 },
            { key: 'analizTuru', label: 'Analiz Türü', type: 'select', defaultValue: 'tema_duygu', options: ['Tema & Duygu', 'Uyak Şeması', 'Söz Sanatı Bul'] },
        ],
        schema: { type: "OBJECT", properties: { siir: { type: "STRING" }, sorular: { type: "ARRAY", items: { type: "STRING" } } }, required: ["siir", "sorular"] },
        fastGenerate: (s, grade, topic) => ({
            siir: Array.from({ length: s.misraSayisi }, (_, i) =>
                `Mısra ${i + 1}: ${topic} izleği üzerine yazılmış örneksel bir dize.`
            ).join('\n'),
            sorular: [s.analizTuru === 'Tema & Duygu' ? 'Bu şiirde işlenen ana tema nedir?' :
                s.analizTuru === 'Uyak Şeması' ? 'Bu şiirin uyak şemasını gösteriniz.' : 'Şiirde hangi söz sanatları kullanılmıştır?'],
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" teması üzerine ${s.misraSayisi} mısralık bir şiir yaz. ` +
            `Ardından ${grade}. sınıf düzeyinde ${s.analizTuru} soruları sor.`,
    },
    {
        id: 'KARAKTER_ANALIZI',
        category: 'okuma_anlama',
        icon: 'fa-users',
        label: 'Karakter & Varlık Analizi',
        description: 'Metindeki kişi ya da kavramların özelliklerini çıkartma.',
        difficulty: 'medium',
        settings: [
            { key: 'karakterSayisi', label: 'Karakter Sayısı', type: 'range', defaultValue: 2, min: 1, max: 4 },
            { key: 'tabloluYapi', label: 'Karşılaştırma Tablosu', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { karakterler: { type: "ARRAY", items: { type: "OBJECT", properties: { ad: { type: "STRING" }, ozellikler: { type: "ARRAY", items: { type: "STRING" } } }, required: ["ad", "ozellikler"] } }, format: { type: "STRING" } }, required: ["karakterler", "format"] },
        fastGenerate: (s, grade, topic) => ({
            karakterler: Array.from({ length: s.karakterSayisi }, (_, i) => ({
                ad: `Karakter ${i + 1}`,
                ozellikler: [`${topic} konusunda pozitif özellik`, 'Olumsuz özellik', 'Nötr özellik'],
            })),
            format: s.tabloluYapi ? 'tablo' : 'liste',
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusunu işleyen kısa bir hikâye yaz. ${s.karakterSayisi} karakter olsun. ` +
            `Karakterleri ${s.tabloluYapi ? 'tablo halinde' : 'maddeler hâlinde'} karşılaştıran ${grade}. sınıf düzeyi sorular ekle.`,
    },
    {
        id: 'SOZ_SANATLARI',
        category: 'okuma_anlama',
        icon: 'fa-masks-theater',
        label: 'Söz Sanatlarını Bul',
        description: 'Metinden teşbih, istiare, mübalağa vb. sanatları tespit eder.',
        difficulty: 'hard',
        settings: [
            { key: 'sanatilar', label: 'Söz Sanatı Odağı', type: 'select', defaultValue: 'hepsi', options: ['Hepsi', 'Teşbih & İstiare', 'Mübalağa & Tezat', 'Kişileştirme'] },
            { key: 'ornekSayisi', label: 'Örnek Sayısı', type: 'range', defaultValue: 4, min: 2, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "OBJECT", properties: { cumle: { type: "STRING" }, sanat: { type: "STRING" } }, required: ["cumle", "sanat"] } } }, required: ["cumleler"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: Array.from({ length: s.ornekSayisi }, (_, i) => ({
                cumle: `Cümle ${i + 1}: "${topic}" konusuyla ilgili edebi bir söz sanatı örneği.`,
                sanat: ['Teşbih', 'İstiare', 'Mübalağa', 'Kişileştirme'][i % 4],
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusunu işleyen bir metin yaz. İçinde ${s.sanatilar === 'Hepsi' ? 'çeşitli' : s.sanatilar} ` +
            `söz sanatları geçsin. ${grade}. sınıf için ${s.ornekSayisi} adet sanat tespit sorusu ekle.`,
    },
    {
        id: 'OKUDUGUNU_CIZ',
        category: 'okuma_anlama',
        icon: 'fa-palette',
        label: 'Okuduğunu Görselleştir (Açık Uçlu)',
        description: 'Okunan metni resim veya zihin haritasına dönüştürme etkinliği.',
        difficulty: 'easy',
        settings: [
            { key: 'boslukBoyutu', label: 'Çizim Alanı Boyutu', type: 'select', defaultValue: 'orta', options: ['Küçük', 'Orta', 'Büyük (Tam Sayfa)'] },
            { key: 'yonlendirici', label: 'Yönlendirici Çizgi Ekle', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { yonerge: { type: "STRING" }, alanBoyutu: { type: "STRING" }, cizgiSayisi: { type: "NUMBER" } }, required: ["yonerge", "alanBoyutu", "cizgiSayisi"] },
        fastGenerate: (s, grade, topic) => ({
            yonerge: `"${topic}" konusunu okuduğun metni aklında canlandır ve aşağıdaki alana çiz.`,
            alanBoyutu: s.boslukBoyutu,
            cizgiSayisi: s.yonlendirici ? 6 : 0,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" hakkında kısa bir betimleyici metin yaz. ` +
            `Ardından öğrenciden metni ${s.boslukBoyutu} boyutlu bir alana çizmesini isteyen yönlendirme cümlesi ekle.`,
    },
];
