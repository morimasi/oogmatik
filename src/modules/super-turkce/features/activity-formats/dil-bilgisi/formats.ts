// =============================================================================
// DİL BİLGİSİ & ANLATIM BOZUKLUKLARI — 10 Format Tanımı
// =============================================================================

import { ActivityFormatDef } from '../../../core/types/activity-formats';

export const dilBilgisiFormats: ActivityFormatDef[] = [
    {
        id: 'DIL_BILGISI_TEST',
        category: 'dil_bilgisi',
        icon: 'fa-list-check',
        label: 'Çoktan Seçmeli Dil Bilgisi Testi',
        description: 'MEB müfredatına göre dil bilgisi kuralı test soruları.',
        difficulty: 'all',
        settings: [
            { key: 'ogeFiltresu', label: 'Öğe Filtresi', type: 'select', defaultValue: 'Hepsi', options: ['Hepsi', 'Sözcük Türleri', 'Cümle Öğeleri', 'Yapım Ekleri', 'Çekim Ekleri'] },
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 5, min: 3, max: 10 },
            { key: 'celdiriciMaskesi', label: 'Çeldirici Türü', type: 'select', defaultValue: 'Karıştırıcı', options: ['Basit', 'Karıştırıcı', 'Eşsesli Kelimeler', 'Yanlış Kural'] },
        ],
        schema: { type: "OBJECT", properties: { sorular: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["soru", "options"] } } }, required: ["sorular"] },
        fastGenerate: (s, grade, topic) => ({
            sorular: [
                { soru: `"${topic}" konusunda hangisi temel bir dil bilgisi kuralıdır?`, options: ["A) Kuralın doğru tanımı (DOĞRU)", "B) Yanlış kural eşleştirmesi", "C) Başka bir konuyla ilgili kural", "D) Mantıksız seçenek"] },
                { soru: `Aşağıdaki cümlelerin hangisinde "${topic}" ile ilgili bir kullanım vardır?`, options: ["A) Bilinçli kullanım (DOĞRU)", "B) Alakasız cümle", "C) Kural ihlali olan cümle", "D) Farklı bir öğe"] }
            ].slice(0, s.soruSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf MEB müfredatına uygun, "Premium" kalitede bir dil bilgisi testi hazırla. \n` +
            `Soru başında mutlaka o konuyla ilgili kısa bir kural bilgisi (Scaffolding/Ön Bilgi) ver. (Örn: 'Fiilimsiler, fiil köklerine gelen eklerle oluşur...') \n` +
            `Sorular ${s.ogeFiltresu} odaklı olsun ve MEB 2025 temalarıyla (Doğa, Vatan, Bilim) harmanlanmış bir metin/cümle üzerinden sorulsun. \n` +
            `Çeldiriciler LGS standartlarında, güçlü ve mantıklı olmalı.`,
    },
    {
        id: 'HATALI_SOZCUK',
        category: 'dil_bilgisi',
        icon: 'fa-bug',
        label: 'Hatalı Sözcüğü Bul / İşaretle',
        description: 'Paragraftaki dil bilgisi hatasını bulma.',
        difficulty: 'medium',
        settings: [
            { key: 'hataKategorisi', label: 'Hata Kategorisi', type: 'select', defaultValue: 'Ek Hatası', options: ['Ek Hatası', 'Kök Hatası', 'Çekim Yanlışı', 'Sözcük Türü Yanlışı'] },
            { key: 'yogunluk', label: 'Hata Yoğunluğu', type: 'select', defaultValue: 'Tek Hata', options: ['Tek Hata', 'İki Hata', 'Üç Hata'] },
        ],
        schema: { type: "OBJECT", properties: { paragraf: { type: "STRING" }, hataSayisi: { type: "NUMBER" } }, required: ["paragraf", "hataSayisi"] },
        fastGenerate: (s, grade, topic) => ({
            paragraf: `Bu sabah okulda "${topic}" konusunu işlerken öğretmenimiz tahtaya gelerek kalemini masaya bıraktılar. Birçok öğrenci bu durumu fark etmediler ama Ali sessizce gülümsedi.`,
            hataSayisi: 2,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf öğrencisi için MEB temalı (Vatan, Doğa vb.) 5-6 cümlelik bir paragraf yaz. \n` +
            `Paragraf içine kasıtlı olarak ${s.yogunluk} kadar ${s.hataKategorisi} gizle. \n` +
            `Hatalar cümlede 'bağırmamalı', öğrencinin dikkatini ve bilgisini ölçmeli. \n` +
            `JSON içinde 'paragraf' ve 'hataSayisi' alanlarını doldur.`,
    },
    {
        id: 'BOSLUK_CEKIM_EKI',
        category: 'dil_bilgisi',
        icon: 'fa-puzzle-piece',
        label: 'Boşlukları Eklerle Doldur',
        description: 'Doğru yapım veya çekim ekini seçerek cümleleri tamamla.',
        difficulty: 'medium',
        settings: [
            { key: 'ekTuru', label: 'Ek Türü', type: 'select', defaultValue: 'Çekim Eki', options: ['Yapım Eki', 'Çekim Eki', 'İkisi Birlikte'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'kelimeListesi', label: 'Kelime Listesi Göster', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { words: { type: "ARRAY", items: { type: "STRING" } }, sentences: { type: "ARRAY", items: { type: "STRING" } } }, required: ["words", "sentences"] },
        fastGenerate: (s, grade, topic) => ({
            words: ["-ler/-lar", "-da/-de", "-den/-dan", "-ı/-i", "-ın/-in"].slice(0, s.cumleAdedi),
            sentences: [
                `Okul_______ bir grup öğrenci "${topic}" üzerine konuşuyordu.`,
                `Kitap_______ sayfalarını heyecanla çevirmeye başladı.`,
                `Bu konu_______ detaylı bir şekilde öğrenmeliyiz.`,
                `Sınıf_______ herkes "${topic}" konusuna odaklanmıştı.`,
                `Dün akşam bahçe_______ toplandık.`
            ].slice(0, s.cumleAdedi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temasını işleyen bir bütüncül metin (paragraf) yaz. \n` +
            `Metindeki bazı kelimelerin ${s.ekTuru} kısımlarını boş bırak (örn: çiçek____). \n` +
            `Öğrencinin metnin bağlamından hareketle doğru eki seçmesini sağla. \n` +
            `JSON: 'words' (doğru ekler listesi) ve 'sentences' (boşluklu cümleler dizisi).`,
    },
    {
        id: 'KAVRAM_ESLESTIRME',
        category: 'dil_bilgisi',
        icon: 'fa-link',
        label: 'Tanım → Örnek Eşleştirme',
        description: 'Dil bilgisi kavramını doğru örnekle eşleştirme.',
        difficulty: 'easy',
        settings: [
            { key: 'cizgiTipi', label: 'Eşleştirme Tipi', type: 'select', defaultValue: 'Çizgi Çekme', options: ['Çizgi Çekme', 'Ok İşareti', 'Numara Eşleştirme'] },
            { key: 'kavramSayisi', label: 'Kavram Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { left: { type: "ARRAY", items: { type: "STRING" } }, right: { type: "ARRAY", items: { type: "STRING" } } }, required: ["left", "right"] },
        fastGenerate: (s, grade, topic) => ({
            left: ["Niteleme Sıfatı", "Belirtme Sıfatı", "İsim Tamlaması", "Sıfat Tamlaması"].slice(0, s.kavramSayisi),
            right: ["Mavi kapı", "İki çocuk", "Kapının kolu", "Güzel ev"].sort(() => Math.random() - 0.5),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" konusuyla ilgili ${s.kavramSayisi} adet terim-örnek çifti yaz. \n` +
            `Sol sütunda dil bilgisi terimleri, sağ sütunda ise bunlara uygun karmaşık sırada örnek cümleler/atamalar olsun. \n` +
            `Öğrencinin doğru eşleştirmeyi yapması hedeflensin.`,
    },
    {
        id: 'CUMLE_OGESI_AYIRMA',
        category: 'dil_bilgisi',
        icon: 'fa-scissors',
        label: 'Cümle Ögelerine Ayırma',
        description: 'Cümledeki özne, yüklem, nesne, tümleçleri ayır ve işaretle.',
        difficulty: 'medium',
        settings: [
            { key: 'bolmeYontemi', label: 'Gösterim Yöntemi', type: 'select', defaultValue: 'Bölme Çizgisi', options: ['Altını Çiz', 'Bölme Çizgisi', 'Renk Kutusu'] },
            { key: 'zorCumleler', label: 'Devrik/Zor Cümleler', type: 'toggle', defaultValue: false },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 4, min: 2, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "STRING" } }, yontem: { type: "STRING" } }, required: ["cumleler", "yontem"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: [
                `Ali dün akşam "${topic}" konusunu çok iyi çalıştı.`,
                `Öğretmenimiz dersin sonunda bize önemli bir soru sordu.`,
                `Yağmurlu bir havada yavaşça yolda yürüyorduk.`,
                `Bahçedeki çiçekler baharın gelişiyle etrafa hoş kokular yayıyordu.`
            ].slice(0, s.cumleAdedi),
            yontem: s.bolmeYontemi,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `Soru başında cümle ögelerinin (Özne, Yüklem, Nesne vb.) tanımını içeren kısa bir LGS tipi bilgi notu ekle. \n` +
            `${grade || 8}. sınıf seviyesinde, MEB 2025 temalı ${s.cumleAdedi} cümle yaz. \n` +
            `${s.zorCumleler ? 'Cümleler arasında ara sözlü, devrik ve yüklemi ortada olan yapılar mutlaka olsun.' : 'Daha kurallı ama anlamca zengin cümleler olsun.'} \n` +
            `Cümlelerden birinin öge dizilişini (Özne-Nesne-Yüklem vb.) örnek olarak göster.`,
    },
    {
        id: 'TRUE_FALSE_DIL',
        category: 'dil_bilgisi',
        icon: 'fa-check-double',
        label: 'Doğru / Yanlış Tablosu',
        description: 'Dil bilgisi ifadelerini doğru/yanlış olarak sınıflandır.',
        difficulty: 'easy',
        settings: [
            { key: 'maddeSayisi', label: 'Madde Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 },
            { key: 'karmasikKurallar', label: 'Karmaşık Kural Dahil Et', type: 'toggle', defaultValue: false },
        ],
        schema: { type: "OBJECT", properties: { maddeler: { type: "ARRAY", items: { type: "OBJECT", properties: { ifade: { type: "STRING" }, cevap: { type: "STRING" } }, required: ["ifade", "cevap"] } } }, required: ["maddeler"] },
        fastGenerate: (s, grade, topic) => ({
            maddeler: [
                { ifade: `"${topic}" konusunda her zaman büyük harf kullanılır.`, cevap: "Y" },
                { ifade: `Cümledeki özne her zaman cümlenin başında bulunur.`, cevap: "Y" },
                { ifade: `İsimlerin yerine kullanılan sözcüklere zamir denir.`, cevap: "D" },
                { ifade: `Fiiller, oluş ve hareket bildirirler.`, cevap: "D" }
            ].slice(0, s.maddeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf düzeyinde, "${topic}" konusu üzerine ${s.maddeSayisi} adet ifade yaz. \n` +
            `İfadelerin bir kısmı bilimsel olarak doğru, bir kısmı ise yaygın yanılgıları içeren yanlışlar olsun. \n` +
            `Öğrencinin 'D' veya 'Y' olarak işaretlemesi için net önermeler kur.`,
    },
    {
        id: 'CUMLE_DONUSTUR',
        category: 'dil_bilgisi',
        icon: 'fa-rotate',
        label: 'Cümle Çatısını Dönüştür',
        description: 'Cümleyi etken-edilgen, olumluda-olumsuz, isim-fiil cümlesi dönüştür.',
        difficulty: 'hard',
        settings: [
            { key: 'donusumTuru', label: 'Dönüşüm Türü', type: 'select', defaultValue: 'Olumlu-Olumsuz', options: ['Etken-Edilgen', 'Olumlu-Olumsuz', 'İsim-Fiil Cümlesi', 'Devrik-Kurallı'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 4, min: 2, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "STRING" } }, donusumTuru: { type: "STRING" } }, required: ["cumleler", "donusumTuru"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: [
                `Ali dün akşam "${topic}" kitabını okudu.`,
                `Sınıftaki herkes bu konuyu çok iyi anladı.`,
                `Bugün hava çok güzel görünüyor.`,
                `Yarınki piknik için hazırlıklar tamamlandı.`
            ].slice(0, s.cumleAdedi),
            donusumTuru: s.donusumTuru,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf müfredatındaki ${s.donusumTuru} konusuna uygun premium sorular hazırla. \n` +
            `Soru başında dönüşüm kuralını (Etken: işi yapan belli, Edilgen: -l,-n ekleri alır) kısaca açıkla. \n` +
            `Cümleler MEB temalı (örn: Atasözleri üzerinden dönüşüm) veya edebi değer taşıyan yapıda olsun.`,
    },
    {
        id: 'TABLODA_HATA_AVI',
        category: 'dil_bilgisi',
        icon: 'fa-table-cells',
        label: 'Tablolu Hata Avı (Renklendirme)',
        description: 'Tablo içinde hatalı dil bilgisi öğeleri renklendirilir.',
        difficulty: 'medium',
        settings: [
            { key: 'izgara', label: 'Izgara Boyutu', type: 'select', defaultValue: '3x3', options: ['3x3', '4x4', '5x5'] },
            { key: 'celdiriciRengi', label: 'Çeldirici Renk Sayısı', type: 'range', defaultValue: 2, min: 1, max: 4 },
        ],
        schema: { type: "OBJECT", properties: { tablo: { type: "ARRAY", items: { type: "ARRAY", items: { type: "STRING" } } }, hataHucreleri: { type: "ARRAY", items: { type: "ARRAY", items: { type: "NUMBER" } } } }, required: ["tablo", "hataHucreleri"] },
        fastGenerate: (s, grade, topic) => ({
            tablo: [
                ["Geliyor", "Bakmış", "Koşacak"],
                ["Gidiyorlar", "Geldiler (HATA)", "Yazdı"],
                ["Okuyor", "Sever", "Görürler (HATA)"]
            ],
            hataHucreleri: [[1, 1], [2, 2]],
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusuyla ilgili dil bilgisi öğelerini içeren ${s.izgara} boyutunda bir tablo oluştur. \n` +
            `Tablodaki hücrelerin çoğunda doğru kullanımlar olsun. \n` +
            `Ancak ${s.celdiriciRengi} adet hücrede kasıtlı dil bilgisi hatası (yanlış ek, yanlış zaman vb.) yap. \n` +
            `Öğrenciden bu hatalı hücreleri bulup renklendirmesini iste.`,
    },
    {
        id: 'ANLATIM_BOZUKLUGU',
        category: 'dil_bilgisi',
        icon: 'fa-wrench',
        label: 'Anlatım Bozukluğunu Düzelt',
        description: 'Anlatım bozukluğu içeren cümleleri tespit ve düzeltme.',
        difficulty: 'hard',
        settings: [
            { key: 'bozuklukTuru', label: 'Bozukluk Türü', type: 'select', defaultValue: 'Anlam Bozukluğu', options: ['Anlam Bozukluğu', 'Mantık Bozukluğu', 'Dil Bilgisi Yanlışı', 'Tekrar'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 4, min: 3, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "OBJECT", properties: { bozuk: { type: "STRING" }, duzgun: { type: "STRING" } }, required: ["bozuk", "duzgun"] } } }, required: ["cumleler"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: [
                { bozuk: "Hava sıcaklığı sıfırın altında eksi beş dereceydi.", duzgun: "Hava sıcaklığı sıfırın altında beş dereceydi. (veya -5 dereceydi)" },
                { bozuk: "Öğrenciler henüz hala okula gelmediler.", duzgun: "Öğrenciler henüz okula gelmediler. (Gereksiz sözcük kullanımı)" },
                { bozuk: "Onunla ilk tanıştığımız günü hiç unutmam.", duzgun: "Onunla tanıştığımız günü hiç unutmam. (Tanışmak zaten ilk kez olur)" }
            ].slice(0, s.cumleAdedi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf müfredatına uygun, MEB temalı (Vatan, Doğa, Kültür) bir metin yaz. \n` +
            `Metin içinde ${s.cumleAdedi} tane ${s.bozuklukTuru} (gereksiz kelime kullanımı, deyim yanlışı, mantık hatası vb.) yap. \n` +
            `Hatalar profesyonelce gizlenmiş olmalı. JSON içinde 'bozuk' ve 'duzgun' hallerini belirt.`,
    },
    {
        id: 'YARATICI_CUMLE',
        category: 'dil_bilgisi',
        icon: 'fa-wand-magic-sparkles',
        label: 'Yaratıcı Cümle Kurma',
        description: 'Verilen sözcük veya ek kullanılarak özgün cümle kurma.',
        difficulty: 'easy',
        settings: [
            { key: 'kelimeSayisi', label: 'Verilen Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'kisit', label: 'Kısıt', type: 'select', defaultValue: 'Deyim Kullan', options: ['Kısıt Yok', 'Deyim Kullan', 'Belirli Ek Kullan'] },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "STRING" } }, yonerge: { type: "STRING" } }, required: ["kelimeler", "yonerge"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: ["Kitap", "Gelecek", "Başarı", "Çalışma", "Hayal"].slice(0, s.kelimeSayisi),
            yonerge: `Yukarıdaki kelimeleri kullanarak, "${topic}" temasında ve içerisinde mutlaka bir ${s.kisit} olacak şekilde özgün cümleler kurunuz.`,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisinin hayal gücünü zorlayacak, "${topic}" konusuyla ilişkili ${s.kelimeSayisi} adet kelime seç. \n` +
            `Bu kelimelerin yanına '${s.kisit}' kuralını ekleyerek öğrenciden yaratıcı cümleler kurmasını iste.`,
    },
];
