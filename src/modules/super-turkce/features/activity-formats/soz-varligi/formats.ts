// =============================================================================
// DEYİMLER, ATASÖZLERİ & SÖZ VARLIĞI — 10 Format Tanımı
// =============================================================================

import { ActivityFormatDef } from '../../../core/types/activity-formats';

export const sozVarligiFormats: ActivityFormatDef[] = [
    {
        id: 'DEYIM_ANLAM',
        category: 'soz_varligi',
        icon: 'fa-comment-dots',
        label: 'Deyim Anlam Eşleştirme',
        description: 'Deyimi doğru anlamıyla eşleştir.',
        difficulty: 'all',
        settings: [
            { key: 'deyimSayisi', label: 'Deyim Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'format', label: 'Format', type: 'select', defaultValue: 'Eşleştirme', options: ['Eşleştirme', 'Çoktan Seçmeli', 'Boşluk Doldurma'] },
        ],
        schema: { type: "OBJECT", properties: { left: { type: "ARRAY", items: { type: "STRING" } }, right: { type: "ARRAY", items: { type: "STRING" } } }, required: ["left", "right"] },
        fastGenerate: (s, grade, topic) => ({
            left: ["Göz boyamak", "Etekleri zil çalmak", "Ağzı kulaklarına varmak", "Burnu büyümek", "Dili dolaşmak"].slice(0, s.deyimSayisi),
            right: [
                "Gösterişle aldatmak",
                "Çok sevinmek",
                "Çok mutlu olmak",
                "Kibirlenmek",
                " Heyecandan konuşamamak"
            ].slice(0, s.deyimSayisi).sort(() => Math.random() - 0.5),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf düzeyi için MEB temasında (örn: Erdemler, Kişisel Gelişim) ${s.deyimSayisi} adet deyim seç. \n` +
            `Deyimleri sadece anlamıyla değil, 'Bu deyim hangi durumda kullanılır?' mantığıyla kısa birer cümlelik senaryo içinde sor. \n` +
            `Deyimler ortaokul seviyesinde, sınav başarısı (LGS) için kritik olanlardan seçilsin.`,
    },
    {
        id: 'ATASOZI_ESLESTIR',
        category: 'soz_varligi',
        icon: 'fa-quote-right',
        label: 'Atasözü Anlam & Durum Eşleştirme',
        description: 'Atasözünü uygun olduğu durumla eşleştir.',
        difficulty: 'medium',
        settings: [
            { key: 'atasozuSayisi', label: 'Atasözü Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 },
            { key: 'formatTuru', label: 'Format', type: 'select', defaultValue: 'Durum Eşleştir', options: ['Durum Eşleştir', 'Anlamını Seç', 'Hangi Durumda Kullanılır'] },
        ],
        schema: { type: "OBJECT", properties: { atasozleri: { type: "ARRAY", items: { type: "OBJECT", properties: { atasoz: { type: "STRING" }, durum: { type: "STRING" } }, required: ["atasoz", "durum"] } } }, required: ["atasozleri"] },
        fastGenerate: (s, grade, topic) => ({
            atasozleri: [
                { atasoz: "Damlaya damlaya göl olur.", durum: "Biriktirilen küçük miktarlar zamanla büyük bir varlığa dönüşür." },
                { atasoz: "Ağaç yaşken eğilir.", durum: "İnsanlar küçük yaşlarda daha kolay eğitilir." },
                { atasoz: "Sakla samanı, gelir zamanı.", durum: "Gereksiz görülen şeyler ileride değer kazanabilir." },
                { atasoz: "Gülü seven dikenine katlanır.", durum: "Sevilen bir şeyin getirdiği zorluklara razı olunmalıdır." }
            ].slice(0, s.atasozuSayisi || 4),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf seviyesinde, MEB temalı (örn: Milli Kültür, Doğa) ${s.atasozuSayisi || 4} adet atasözü seç. \n` +
            `Atasözlerini doğrudan sormak yerine, 'Ayşe'nin düştüğü bu durum için hangi atasözü söylenebilir?' tarzında senaryolaştırılmış sorular hazırla. \n` +
            `Atasözlerinin mecaz anlam derinliğini öğrenciye fark ettiren bir ${s.formatTuru} kurgula.`,
    },
    {
        id: 'KELIME_ANLAM',
        category: 'soz_varligi',
        icon: 'fa-book-open',
        label: 'Kelime Anlam & Kullanım',
        description: 'Sözcüğün gerçek, mecaz, yan anlamlarını tespit et.',
        difficulty: 'medium',
        settings: [
            { key: 'anlamTuru', label: 'Anlam Türü', type: 'select', defaultValue: 'Hepsi', options: ['Gerçek Anlam', 'Mecaz Anlam', 'Yan Anlam', 'Hepsi'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, cumle: { type: "STRING" }, soru: { type: "STRING" } }, required: ["kelime", "cumle", "soru"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "Yüzmek", cumle: "Dedesinden kalan mirasta paralar içinde yüzüyordu.", soru: "Kelimemizin anlamı nedir? (Gerçek mi, Mecaz mı?)" },
                { kelime: "Kırılmak", cumle: "Dün akşam dünkü sözlerin için sana çok kırıldım.", soru: "Buradaki anlam türü hangisidir?" },
                { kelime: "Ağır", cumle: "Bize çok ağır sorumluluklar yükledi.", soru: "Bu cümledeki anlamı nedir?" },
                { kelime: "Soğuk", cumle: "Bize karşı çok soğuk davranıyor.", soru: "Anlam türünü belirtiniz." }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf LGS standartlarında SÖZCÜKTE ANLAM (Çok Anlamlılık) sorusu hazırla. \n` +
            `Aynı kelimenin (örn: 'açmak', 'çekmek', 'bakmak') ${s.kelimeSayisi} farklı cümlede ${s.anlamTuru} farklarını sor. \n` +
            `Cümlelerden bazıları edebi, bazıları günlük dilden olsun. Çeldiricileri LGS gibi birbirine yakın tut.`,
    },
    {
        id: 'ES_ANLAMLI_ZITLIK',
        category: 'soz_varligi',
        icon: 'fa-arrows-left-right',
        label: 'Eş Anlamlı / Zıt Anlamlı Bul',
        description: 'Verilen sözcüğün eş ve zıt anlamlısını bul.',
        difficulty: 'easy',
        settings: [
            { key: 'format', label: 'Format', type: 'select', defaultValue: 'İkisi Birlikte', options: ['Yalnız Eş Anlamlı', 'Yalnız Zıt Anlamlı', 'İkisi Birlikte'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, esAnlamli: { type: "STRING" }, zitAnlamli: { type: "STRING" } }, required: ["kelime", "esAnlamli", "zitAnlamli"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "Ak", esAnlamli: "Beyaz", zitAnlamli: "Kara" },
                { kelime: "Yitik", esAnlamli: "Kayıp", zitAnlamli: "Bulunmuş" },
                { kelime: "Cömert", esAnlamli: "Eli açık", zitAnlamli: "Cimri" },
                { kelime: "Tutsak", esAnlamli: "Esir", zitAnlamli: "Özgür" },
                { kelime: "Islak", esAnlamli: "Yaş", zitAnlamli: "Kuru" },
                { kelime: "Savaş", esAnlamli: "Harp", zitAnlamli: "Barış" }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasından veya genel Türkçeden ${s.kelimeSayisi} adet orta zorlukta kelime seç. \n` +
            `Bu kelimelerin ${s.format} karşılıklarını bulmasını isteyen bir tablo/liste hazırla. \n` +
            `Çıktı JSON yapısında 'kelime', 'esAnlamli' ve 'zitAnlamli' alanlarını içermelidir.`,
    },
    {
        id: 'DEYIM_CUMLE',
        category: 'soz_varligi',
        icon: 'fa-pencil',
        label: 'Deyimi Cümle İçinde Kullan',
        description: 'Verilen deyimi anlamına uygun cümle içinde kullan.',
        difficulty: 'medium',
        settings: [
            { key: 'deyimSayisi', label: 'Deyim Sayısı', type: 'range', defaultValue: 4, min: 2, max: 6 },
            { key: 'yardimli', label: 'Deyim Anlamı Verilsin mi', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { deyimler: { type: "ARRAY", items: { type: "OBJECT", properties: { deyim: { type: "STRING" }, anlam: { type: "STRING" }, bosluk: { type: "STRING" } }, required: ["deyim", "anlam", "bosluk"] } } }, required: ["deyimler"] },
        fastGenerate: (s, grade, topic) => ({
            deyimler: [
                { deyim: "Küplere binmek", anlam: "Çok öfkelenmek", bosluk: "Ödevlerini yapmadığını öğrenen babası adeta __________." },
                { deyim: "Göz kulak olmak", anlam: "Korumak, bakmak", bosluk: "Annem markete giderken kardeşime __________ istedi." },
                { deyim: "Can kulağıyla dinlemek", anlam: "Çok dikkatli dinlemek", bosluk: "Öğretmenin anlattığı hikayeyi bütün sınıf __________." },
                { deyim: "Pabuçu dama atılmak", anlam: "Eski önemini yitirmek", bosluk: "Yeni kardeş gelince Ali'nin __________." }
            ].slice(0, s.deyimSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temasında bütüncül bir paragraf yaz. \n` +
            `Paragrafın içinde deyim geçmesi gereken yerleri boş bırak. \n` +
            `Öğrenci, deyimin anlamına uygun çekimli halini (örn: 'can kulağıyla dinlemek' ise 'can kulağıyla dinledi') bağlama göre yazmalı.`,
    },
    {
        id: 'KELIME_TAHMINI',
        category: 'soz_varligi',
        icon: 'fa-lightbulb',
        label: 'İpuçlarıyla Kelime Tahmini',
        description: 'Verilen 3 ipucundan kelimeyi tahmin et.',
        difficulty: 'medium',
        settings: [
            { key: 'ipucuSayisi', label: 'İpucu Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 },
            { key: 'kelimeSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 4, min: 2, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { sorular: { type: "ARRAY", items: { type: "OBJECT", properties: { ipuclari: { type: "ARRAY", items: { type: "STRING" } }, cevap: { type: "STRING" } }, required: ["ipuclari", "cevap"] } } }, required: ["sorular"] },
        fastGenerate: (s, grade, topic) => ({
            sorular: [
                { ipuclari: ["Gökten dökülür", "Bembeyazdır", "Soğuktur"], cevap: "Kar" },
                { ipuclari: ["Ormanların kralıdır", "Yelidir", "Kükrer"], cevap: "Aslan" },
                { ipuclari: ["Okumaya yarar", "Sayfaları vardır", "Bilgi verir"], cevap: "Kitap" },
                { ipuclari: ["Sıvıdır", "Hayattır", "Rengizdir"], cevap: "Su" }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf seviyesinde, "${topic}" veya MEB temalı (örn: Değerlerimiz) ${s.kelimeSayisi} adet kelime seç. \n` +
            `İpuçları sadece fiziksel özellikleri değil, 'Bu nesne olmasaydı ne olurdu?' veya 'Hangi eylemle ilişkilidir?' gibi ${s.ipucuSayisi} adet dolaylı bilgiden oluşsun. \n` +
            `Öğrencinin kavramsal ağını (concept map) güçlendiren sorular üret.`,
    },
    {
        id: 'KELIME_HARITAS',
        category: 'soz_varligi',
        icon: 'fa-diagram-project',
        label: 'Kelime Ağı / Anlam Haritası',
        description: 'Verileni sözcüğü merkeze koyarak anlam ağı oluştur.',
        difficulty: 'easy',
        settings: [
            { key: 'dalSayisi', label: 'Dal Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'merkez', label: 'Merkez Kavram Türü', type: 'select', defaultValue: 'Konu Kavramı', options: ['Konu Kavramı', 'Duygu Sözcüğü', 'Eylem Sözcüğü'] },
        ],
        schema: { type: "OBJECT", properties: { merkezKelime: { type: "STRING" }, dallar: { type: "ARRAY", items: { type: "STRING" } } }, required: ["merkezKelime", "dallar"] },
        fastGenerate: (s, grade, topic) => ({
            merkezKelime: topic,
            dallar: ["Tanımı", "Örnekleri", "Zıt Kavramları", "Kullanım Yerleri", "Önemi"].slice(0, s.dalSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" veya MEB temalı bir ana kavramı merkeze al. \n` +
            `Bu kavramla ilgili ${s.dalSayisi} adet alt dalı (neden-sonuç, parça-bütün veya özellik ilişkisi) LGS mantığıyla kurgula. \n` +
            `Öğrencinin kavramı 360 derece analiz etmesini sağlayan bir harita taslağı üret.`,
    },
    {
        id: 'OKUMALIK_SOZLUK',
        category: 'soz_varligi',
        icon: 'fa-book',
        label: 'Okuma Parçası Sözlüğü',
        description: 'Okunan metinden zor / yeni kelimeleri sözlük hâliyle çıkar.',
        difficulty: 'easy',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 },
            { key: 'icerik', label: 'Eklenecek Bilgi', type: 'select', defaultValue: 'Tanım + Örnek', options: ['Yalnız Tanım', 'Tanım + Örnek', 'Tanım + Eş Anlamlı + Örnek'] },
        ],
        schema: { type: "OBJECT", properties: { sozluk: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, tanim: { type: "STRING" }, ornek: { type: "STRING" }, esAnlamli: { type: "STRING" } }, required: ["kelime", "tanim", "ornek", "esAnlamli"] } } }, required: ["sozluk"] },
        fastGenerate: (s, grade, topic) => ({
            sozluk: [
                { kelime: "İstikbal", tanim: "Gelecek", ornek: "İstikbal göklerdedir.", esAnlamli: "Gelecek" },
                { kelime: "Medeniyet", tanim: "Uygarlık", ornek: "Modern medeniyet seviyesine ulaşmalıyız.", esAnlamli: "Uygarlık" },
                { kelime: "Gayret", tanim: "Çaba", ornek: "Başarmak için çok gayret sarf etti.", esAnlamli: "Çaba" },
                { kelime: "Hoşgörü", tanim: "Tolerans", ornek: "Hoşgörü toplumsal barışın temelidir.", esAnlamli: "Müsamaha" }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf düzeyinde, MEB 2025 temasını işleyen (örn: Vatan Sevgisi, Bilim) kısa bir giriş metni yaz. \n` +
            `Metindeki kelimelerin sözlük tanımlarını verirken, 'Metindeki anlamıyla' (Contextual meaning) vurgusuna dikkat et. \n` +
            `JSON: { sozluk: [{kelime, tanim, ornek, esAnlamli}] }`,
    },
    {
        id: 'DOLDUR_DEYIM',
        category: 'soz_varligi',
        icon: 'fa-fill-drip',
        label: 'Cümleyi Deyimle Tamamla',
        description: 'Cümlenin anlam boşluğunu doğru deyimle doldur.',
        difficulty: 'medium',
        settings: [
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 5, min: 3, max: 7 },
            { key: 'deyimHavuzu', label: 'Deyim Havuzu Göster', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { words: { type: "ARRAY", items: { type: "STRING" } }, sentences: { type: "ARRAY", items: { type: "STRING" } } }, required: ["words", "sentences"] },
        fastGenerate: (s, grade, topic) => ({
            words: ["Kulak misafiri olmak", "Göze girmek", "Burnunun dikine gitmek", "Aklı bir karış havada", "Ağzı laf yapmak"],
            sentences: [
                "Ali sürekli __________, hiç kimsenin tavsiyesini dinlemezdi.",
                "Yolda konuşulanlara istemeden __________.",
                "Son yaptığı projeyle müdürün __________ başardı.",
                "Ders çalışmak yerine oyun oynamayı düşünen Ali'nin __________.",
                "Satış temsilcisi olduğu için çok iyi __________."
            ].slice(0, s.cumleAdedi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temasında geçebilecek ${s.cumleAdedi} cümle yaz. \n` +
            `Cümledeki durumu karşılayan en uygun deyimi seçme etkinliği hazırla. \n` +
            `Deyim havuzu içinde birbirine yakın anlamlı 'çeldirici' deyimler mutlaka olsun.`,
    },
    {
        id: 'OZDEYIS_ANALIZ',
        category: 'soz_varligi',
        icon: 'fa-star',
        label: 'Özlü Söz & Özdeyiş Analizi',
        description: 'Meşhur özdeyişi yorumla ve özgün cümleyle ilişkilendir.',
        difficulty: 'hard',
        settings: [
            { key: 'soruTuru', label: 'Soru Türü', type: 'select', defaultValue: 'Anlam & Yorum', options: ['Anlam & Yorum', 'Yaşamla İlişkilendir', 'Katılıyor musun?'] },
            { key: 'ozdeyisSayisi', label: 'Özdeyiş Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 },
        ],
        schema: { type: "OBJECT", properties: { ozdeyisler: { type: "ARRAY", items: { type: "OBJECT", properties: { ozdeyis: { type: "STRING" }, soru: { type: "STRING" } }, required: ["ozdeyis", "soru"] } } }, required: ["ozdeyisler"] },
        fastGenerate: (s, grade, topic) => ({
            ozdeyisler: [
                { ozdeyis: "Hayatta en hakiki mürşit ilimdir.", soru: "Atatürk burada eğitimin önemini nasıl vurgulamıştır?" },
                { ozdeyis: "Bilgi güçtür.", soru: "Bu söze katılıyor musun? Neden?" },
                { ozdeyis: "Eğitim kafayı geliştirmek demektir.", soru: "Zihinsel gelişimin eğitimdeki rolü nedir?" }
            ].slice(0, s.ozdeyisSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için PISA standartlarında 'Öz Düşünüm' (Self-reflection) soruları hazırla. \n` +
            `Merkezdeki özdeyiş "${topic}" veya MEB temalı (örn: Dürüstlük) olsun. \n` +
            `Soru, 'Yazarın bu sözüne dayanarak bugünkü dünyadan bir örnek veriniz.' gibi beceri temelli ve yorum odaklı olmalı.`,
    },
];
