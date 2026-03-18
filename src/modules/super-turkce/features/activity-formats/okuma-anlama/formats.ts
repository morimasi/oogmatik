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
            { key: 'haberTuru', label: 'Haber Türü', type: 'select', defaultValue: 'Güncel', options: ['Güncel', 'Bilim', 'Spor', 'Kültür'] },
            { key: 'metinUzunlugu', label: 'Metin Uzunluğu', type: 'select', defaultValue: 'Orta', options: ['Kısa (3-5 cümle)', 'Orta (5-8 cümle)', 'Uzun (8-12 cümle)'] },
            { key: 'gorselEkle', label: 'Haber Görseli (Kutu)', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { title: { type: "STRING" }, content: { type: "STRING" }, questions: { type: "ARRAY", items: { type: "STRING" } }, hasImage: { type: "BOOLEAN" } }, required: ["title", "content", "questions"] },
        fastGenerate: (s, grade, topic) => ({
            title: `HABER: ${topic.toUpperCase()} KONUSUNDA ÖNEMLİ GELİŞME`,
            content: `${topic} konusunda bugün ilginç bir gelişme yaşandı. Uzmanlar, ${grade}. sınıf düzeyindeki bu konunun önemini vurguladılar. Okulda yapılan etkinlikte öğrenciler, öğrendiklerini uygulama fırsatı buldular. Veliler ve öğretmenler süreci yakından takip ediyorlar.`,
            questions: ['Bu haberde anlatılan olay nedir?', 'Olay nerede gerçekleşiyor?', 'Konunun uzmanları kimlerdir?', 'Haber hangi zaman dilimini kapsıyor?', 'Bu etkinlik neden yapıldı?'].slice(0, s.soruSayisi),
            hasImage: s.gorselEkle,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "Premium" kalitede, MEB 2025 müfredat temalarına (Vatan Sevgisi, Doğa ve İnsan, Milli Kültür veya Bilim ve Teknoloji) uygun bir haber metni kurgula. \n` +
            `Metin ${grade < 6 ? 'somut ve ilgi çekici' : 'daha akademik ve analitik'} bir dille yazılmalı. \n` +
            `5N1K soruları sadece bilgi sormamalı, 'Neden' ve 'Nasıl' sorularıyla öğrencinin çıkarım yapmasını sağlamalı. \n` +
            `JSON yapısında 'title', 'content' ve 'questions' alanlarını doldur.`,
    },
    {
        id: 'ANA_DUSUNCE',
        category: 'okuma_anlama',
        icon: 'fa-lightbulb',
        label: 'Paragrafta Ana Düşünce',
        description: 'Paragraftan merkezi fikri bulma, yardımcı düşünce ayrımı.',
        difficulty: 'all',
        settings: [
            { key: 'celdiriciOrani', label: 'Çeldirici Şık Oranı', type: 'select', defaultValue: 'Orta', options: ['Düşük (kolay)', 'Orta', 'Yüksek (LGS tarzı)'] },
            { key: 'cokluParagraf', label: 'Çoklu Paragraf', type: 'toggle', defaultValue: false },
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 4, min: 2, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { question: { type: "STRING" }, paragraf: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["question", "paragraf", "options"] },
        fastGenerate: (s, grade, topic) => ({
            question: `Yukarıdaki paragraf temel alınarak "${topic}" ile ilgili çıkarılabilecek en kapsamlı yargı hangisidir?`,
            paragraf: `${topic}, hayatımızın her alanında karşımıza çıkan temel bir kavramdır. ${grade}. sınıfta öğrendiğimiz bu konu, bize dünyayı anlama konusunda yeni pencereler açar. Eğer bu bilinci kazanırsak, gelecekte daha başarılı adımlar atabiliriz. Önemli olan, öğrenilen bilgiyi doğru yerde ve zamanda kullanma becerisini geliştirmektir.`,
            options: [
                'A) Bilginin sadece okulda önemli olduğu (Çeldirici)',
                `B) ${topic} prensibinin doğru uygulandığında başarı getireceği (DOĞRU)`,
                'C) Konunun ezberlenmesi gerektiği (Yanlış)',
                'D) Geçmişte bu konunun hiç işlenmediği (Alakasız)',
            ].slice(0, 4),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf seviyesinde, MEB temalı (örn: Erdemler, Doğa) özgün bir paragraf yaz. \n` +
            `Paragrafın içinde mutlaka bir deyim veya atasözü barındır. \n` +
            `Ana düşünce sorusu 'Bu metnin yazılma amacı aşağıdakilerden hangisidir?' gibi üst bilişsel seviyede olmalı. \n` +
            `Yardımcı fikir soruları çeldiricisi güçlü, LGS standartlarında (8. sınıf ise) hazırlanmalı.`,
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
            { key: 'zorluk', label: 'Zorluk', type: 'select', defaultValue: 'Orta', options: ['Basit', 'Orta', 'Zorlu'] },
            { key: 'metinTuru', label: 'Metin Türü', type: 'select', defaultValue: 'Hikâye', options: ['Hikâye', 'Bilgilendirici', 'Şiir'] },
        ],
        schema: { type: "OBJECT", properties: { metin: { type: "STRING" }, questions: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["soru", "options"] } } }, required: ["metin", "questions"] },
        fastGenerate: (s, grade, topic) => ({
            metin: `Bir zamanlar ${topic} üzerine düşünen bilge bir yaşlı varmış. Köy halkına her zaman bu konunun gizli güçlerinden bahsedermiş. Kimse başlangıçta ona inanmasa da, zamanla yaşanan olaylar bilgenin haklılığını ortaya çıkarmış. Söylenenlerin ardındaki gizli manayı anlayanlar, köyün en saygın kişileri olmuşlar.`,
            questions: [
                {
                    soru: "Bilge yaşlının köy halkından beklentisi ne olabilir?",
                    options: ['A) Söylediklerine körü körüne inanmaları', 'B) Olaylar arasındaki gizli bağlantıları fark etmeleri (DOĞRU)', 'C) Köyü terk etmeleri', 'D) Sadece susup dinlemeleri']
                },
                {
                    soru: "Metne göre 'saygınlık' kazanmanın yolu nedir?",
                    options: ['A) Çok zengin olmak', 'B) Çok hızlı koşmak', 'C) Anlatılanların altındaki derin anlamı kavramak (DOĞRU)', 'D) Yaşlı bir bilge olmak']
                }
            ].slice(0, s.yorumSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için MEB temasında (örn: Doğa ve İnsan) bir metin yaz. \n` +
            `Metin doğrudan söylenmeyen ama ipuçlarından anlaşılabilecek bilgiler içermeli. \n` +
            `Çıkarım soruları 'Bu metinden aşağıdakilerin hangisine ulaşılamaz?' veya 'Yazarın tutumu için ne söylenebilir?' gibi analiz odaklı olmalı.`,
    },
    {
        id: 'METIN_KARSILASTIRMA',
        category: 'okuma_anlama',
        icon: 'fa-scale-balanced',
        label: 'İki Metni Karşılaştırma',
        description: 'İki farklı metin arasında Venn diyagramı veya tablo temelli karşılaştırma.',
        difficulty: 'medium',
        settings: [
            { key: 'format', label: 'Karşılaştırma Formatı', type: 'select', defaultValue: 'Tablo', options: ['Tablo', 'Venn Diyagramı', 'Liste'] },
            { key: 'boyut', label: 'Karşılaştırma Boyutu', type: 'select', defaultValue: 'Benzerlik/Zıtlık', options: ['Benzerlik/Zıtlık', 'Amaç/Konu', 'Dil/Üslup'] },
        ],
        schema: { type: "OBJECT", properties: { metin1: { type: "STRING" }, metin2: { type: "STRING" }, format: { type: "STRING" }, boyut: { type: "STRING" } }, required: ["metin1", "metin2", "format", "boyut"] },
        fastGenerate: (s, grade, topic) => ({
            metin1: `Yazar A: "${topic}" konusu evrensel bir değerdir ve her toplumda benzer şekilde işlenmelidir.`,
            metin2: `Yazar B: "${topic}" her ne kadar evrensel olsa da, yerel kültürlerin süzgecinden geçerek farklılık gösterir.`,
            format: s.format,
            boyut: s.boyut,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf seviyesinde, aynı temada (örn: Teknoloji) ama farklı bakış açılarına sahip iki kısa metin yaz. \n` +
            `Metinlerden biri daha duygusal/öznel, diğeri daha bilimsel/nesnel olsun. \n` +
            `Sorular 'İki metnin ortak vurgusu nedir?' veya 'İki metin arasındaki üslup farkı hangisidir?' gibi karşılaştırmalı olmalı.`,
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
            const sentences = [
                `Ali sabah erkenden kalkıp "${topic}" dersi için hazırlandı.`,
                "En sevdiği defterini ve kalemini çantasına koydu.",
                "Okula vardığında arkadaşlarıyla ders hakkında konuştu.",
                "Öğretmen derse girdiğinde Ali büyük bir dikkatle dinlemeye başladı.",
                "Dersin sonunda öğrendiği yeni bilgileri defterine not etti."
            ].slice(0, s.cumleAdedi);
            const shuffled = [...sentences].sort(() => Math.random() - 0.5);
            return { shuffled, correct: sentences };
        },
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temasında mantıklı bir zaman akışına sahip ${s.cumleAdedi} cümlelik bir olay örgüsü oluştur. \n` +
            `Cümleler arası geçişlerde 'önce, sonra, daha sonra, en sonunda' gibi yapıları hissettir. \n` +
            `${s.kafaKaristirici ? 'Ek olarak bir tane de konuyla tamamen alakasız, akışı bozan bir "çürük" cümle ekle.' : ''}`,
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
            paragraf: `${topic} sadece bir bilgi değil, aynı zamanda bir bakış açısıdır. Onu anlayanlar, çevrelerindeki dünyayı daha net görürler. Bu yüzden eğitim hayatımızda ${topic} konusuna özel bir yer ayırmalıyız.`,
            options: [
                `A) ${topic}: Bilinmeyenlerin Gizemi`,
                `B) ${topic} ve Hayatımızdaki Yeri (DOĞRU)`,
                `C) Eğitimin Zorlukları`,
                `D) Kitap Okumanın Faydaları`,
            ].slice(0, parseInt(s.secenekSayisi)),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temalı (örn: Milli Kültür), ana fikri derin olan bir metin yaz. \n` +
            `Başlık seçeneklerini 'En kapsamlı yargıyı hangisi içerir?' mantığıyla kurgula. \n` +
            `Çeldiriciler metindeki sadece bir kelimeye veya yan fikre odaklansın.`,
    },
    {
        id: 'SIIR_INCELEME',
        category: 'okuma_anlama',
        icon: 'fa-feather',
        label: 'Şiir İnceleme ve Duygu',
        description: 'Şiirde duygu, tema ve ses uyumu analizi yapılır.',
        difficulty: 'medium',
        settings: [
            { key: 'misraSayisi', label: 'Mısra Sayısı', type: 'range', defaultValue: 4, min: 4, max: 12 },
            { key: 'analizTuru', label: 'Analiz Türü', type: 'select', defaultValue: 'Tema & Duygu', options: ['Tema & Duygu', 'Uyak Şeması', 'Söz Sanatı Bul'] },
        ],
        schema: { type: "OBJECT", properties: { siir: { type: "STRING" }, sorular: { type: "ARRAY", items: { type: "STRING" } } }, required: ["siir", "sorular"] },
        fastGenerate: (s, grade, topic) => ({
            siir: `Mavi bir gökyüzü altında,\n"${topic}" sesleri yankılanır.\nKalbimde derin bir sevda,\nBu rüya hiç bitmeyecek sanılır.`,
            sorular: [s.analizTuru === 'Tema & Duygu' ? 'Bu şiirde baskın olan duygu hangisidir?' :
                s.analizTuru === 'Uyak Şeması' ? 'Şiirdeki kafiye örgüsünü (abab vb.) belirtiniz.' : 'Şiirin ikinci mısrasında hangi söz sanatı vardır?'],
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf öğrencisi için MEB temalı, ${s.misraSayisi} mısralık, edebi değeri olan bir şiir yaz. \n` +
            `Şiirde duygu ve imge kullanımı ön planda olsun. \n` +
            `Analiz sorusu 'Şair bu mısrada hangi ruh halindedir?' veya 'Hangi söz sanatı şiire nasıl bir anlam katmıştır?' gibi yorum odaklı olsun.`,
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
                ad: i === 0 ? "Bilge Kağan" : "Meraklı Çocuk",
                ozellikler: [
                    i === 0 ? `"${topic}" konusunda engin bilgi sahibi` : `"${topic}" konusunu yeni öğrenen`,
                    i === 0 ? "Sabırlı ve eğitici" : "Heyecanlı ve araştırmacı",
                    i === 0 ? "Geleneksel yöntemleri savunur" : "Yenilikçi yaklaşımları sever"
                ],
            })),
            format: s.tabloluYapi ? 'tablo' : 'liste',
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temasında geçen, karakter derinliği olan bir metin yaz. \n` +
            `Karakterlerin sadece fiziksel değil, tutum ve davranışları da betimlensin. \n` +
            `Analiz isteği 'Karakterin bu olay karşısındaki tutumu onun hangi kişilik özelliğini gösterir?' şeklinde olsun.`,
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
            cumleler: [
                { cumle: `Güneş "${topic}" bahçesinde altın bir top gibi parlıyordu.`, sanat: "Teşbih" },
                { cumle: `Rüzgar "${topic}" fısıltılarını kulağıma getirdi.`, sanat: "Kişileştirme" },
                { cumle: `Ağlamaktan "${topic}" gölleri oluştu evinde.`, sanat: "Mübalağa" },
                { cumle: `Kara günlerin ardından ak bir "${topic}" ışığı doğdu.`, sanat: "Tezat" }
            ].slice(0, s.ornekSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf müfredatındaki söz sanatlarını (Teşbih, Kişileştirme, Mübalağa, Tezat vb.) içeren MEB temalı bir metin yaz. \n` +
            `Sanatlar metnin akışında doğal bir şekilde yer almalı, 'bağırmamalı'. \n` +
            `JSON içinde 'cumleler' (cumle/sanat objesi) döndürürken sanatın neden kullanıldığını açıklayan kısa bir not da ekle.`,
    },
    {
        id: 'OKUDUGUNU_CIZ',
        category: 'okuma_anlama',
        icon: 'fa-palette',
        label: 'Okuduğunu Görselleştir (Çizim)',
        description: 'Okunan betimleyici metni resme dönüştürme etkinliği.',
        difficulty: 'easy',
        settings: [
            { key: 'boslukBoyutu', label: 'Çizim Alanı Boyutu', type: 'select', defaultValue: 'Orta', options: ['Küçük', 'Orta', 'Büyük (Tam Sayfa)'] },
            { key: 'yonlendirici', label: 'Yönlendirici İpuçları', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { yonerge: { type: "STRING" }, metin: { type: "STRING" }, ipuclari: { type: "ARRAY", items: { type: "STRING" } } }, required: ["yonerge", "metin"] },
        fastGenerate: (s, grade, topic) => ({
            yonerge: `Aşağıdaki betimleyici metni dikkatle oku ve zihninde canlanan manzarayı kutuya çiz.`,
            metin: `Güneşli bir sabahın ilk ışıkları, "${topic}" bahçesindeki rengarenk çiçeklerin üzerine düşüyordu. Kenarda duran eski ahşap kulübe, geçmişin anılarını fısıldar gibiydi. Küçük bir kedi, bahçedeki saksıların arasından merakla etrafı seyrediyordu. Her yer huzur doluydu.`,
            ipuclari: s.yonlendirici ? ['Güneşin konumu', 'Kedinin duruşu', 'Bahçedeki detaylar'] : [],
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temalı, görsel detayları zengin, renk ve mekan algısını ön plana çıkaran 4-5 cümlelik bir metin yaz. \n` +
            `Metin ${grade < 6 ? 'masalsı/somut' : 'gerçekçi/betimleyici'} bir atmosfere sahip olmalı. \n` +
            `${s.yonlendirici ? 'Çizimde mutlaka yer alması gereken 3 kilit nesneyi ipucu olarak belirt.' : ''}`,
    },
];
