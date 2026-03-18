// =============================================================================
// YAZIM KURALLARI & NOKTALAMA İŞARETLERİ — 10 Format Tanımı
// =============================================================================

import { ActivityFormatDef } from '../../../core/types/activity-formats';

export const yazimNoktalamaFormats: ActivityFormatDef[] = [
    {
        id: 'BOSLUK_DOLDURMA',
        category: 'yazim_noktalama',
        icon: 'fa-pen-to-square',
        label: 'Doğru Yazımı Seç / Doldur',
        description: 'Yanlış veya boş yazılan sözcükleri doğru biçimiyle doldur.',
        difficulty: 'all',
        settings: [
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'format', label: 'Format', type: 'select', defaultValue: 'Boşluk Doldurma', options: ['Boşluk Doldurma', 'Doğru Yazımı Seç (3 Şık)'] },
            { key: 'kategori', label: 'Yazım Kategorisi', type: 'select', defaultValue: 'Hepsi', options: ['Hepsi', 'Büyük Harf', 'Birleşik-Ayrı Yazım', 'Ses Değişimi', 'Yabancı Sözcükler'] },
        ],
        schema: { type: "OBJECT", properties: { words: { type: "ARRAY", items: { type: "STRING" } }, sentences: { type: "ARRAY", items: { type: "STRING" } } }, required: ["words", "sentences"] },
        fastGenerate: (s, grade, topic) => ({
            words: ["herkes", "yalnız", "yanlış", "birçok", "hiçbir"].slice(0, s.cumleAdedi),
            sentences: [
                `Sınıfta _________ "${topic}" konusunu dikkatle dinliyordu.`,
                `Bu soruyu _________ sen çözebilirsin.`,
                `Yaptığın bu küçük _________ seni üzmesin.`,
                `Haberlerde _________ yeni gelişme var.`,
                `Bu konuda _________ şüphem kalmadı.`
            ].slice(0, s.cumleAdedi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf müfredatına uygun, MEB temasında (örn: Milli Kültür) ${s.cumleAdedi} adet cümle yaz. \n` +
            `Cümlelerde ${s.kategori} kurallarına odaklan. \n` +
            `Sorular sadece yazımı sormasın, 'Bu sözcüğün yazımı neden hatalıdır?' mantığını hissettirsin.`,
    },
    {
        id: 'NOKTALAMA_EKLE',
        category: 'yazim_noktalama',
        icon: 'fa-paragraph',
        label: 'Noktalama İşaretlerini Ekle',
        description: 'Noktalama işareti eksik metne doğru işaretleri yerleştir.',
        difficulty: 'medium',
        settings: [
            { key: 'isaretTuru', label: 'İşaret Türü', type: 'select', defaultValue: 'Hepsi', options: ['Hepsi', 'Nokta & Virgül', 'Tırnak & Parantez', 'Soru & Ünlem'] },
            { key: 'metinUzunlugu', label: 'Metin Uzunluğu', type: 'select', defaultValue: 'Orta', options: ['Kısa (3 cümle)', 'Orta (5 cümle)', 'Uzun (8 cümle)'] },
        ],
        schema: { type: "OBJECT", properties: { metin: { type: "STRING" }, eksikIsaretler: { type: "ARRAY", items: { type: "STRING" } } }, required: ["metin", "eksikIsaretler"] },
        fastGenerate: (s, grade, topic) => ({
            metin: `Ali sabah erkenden kalktı ( ) Hemen kahvaltısını yaptı ( ) "${topic}" kitabını çantasına koyup yola çıktı ( ) Acaba bugün okulda neler öğrenecekti ( ) Çok heyecanlıydı ( )`,
            eksikIsamretler: [".", ".", ".", "?", "!"],
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf öğrencisi için MEB temasında (örn: Doğa) bir metin yaz. \n` +
            `Noktalama işaretlerini boş bırakırken, 'Virgülün buradaki görevi nedir?' gibi LGS tipi sorulara temel oluşturacak yapılar kur. \n` +
            `JSON: 'metin' (boşluklu) ve 'eksikIsamretler' (doğru cevap listesi).`,
    },
    {
        id: 'YAZIM_HATASI_BUL',
        category: 'yazim_noktalama',
        icon: 'fa-spell-check',
        label: 'Yazım Hatasını Bul & Düzelt',
        description: 'Metindeki yazım yanlışlarını tespit et ve doğrusunu yaz.',
        difficulty: 'medium',
        settings: [
            { key: 'hataSayisi', label: 'Hata Sayısı', type: 'range', defaultValue: 4, min: 2, max: 8 },
            { key: 'hataYeri', label: 'Hata Türü', type: 'select', defaultValue: 'Karışık', options: ['Yalnız Büyük Harf', 'Yalnız Birleşik Yazım', 'Karışık'] },
        ],
        schema: { type: "OBJECT", properties: { metin: { type: "STRING" }, hataSayisi: { type: "NUMBER" } }, required: ["metin", "hataSayisi"] },
        fastGenerate: (s, grade, topic) => ({
            metin: `Herkez "${topic}" dersine gitmişti. Ahmet beyde oradaydı. Hiç bir şeyden haberi yoktu. herkez sessizce bekledi.`,
            hataSayisi: 4,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf LGS standartlarında MEB temasında (örn: Milli Müdahale, Teknoloji) bir paragraf yaz. \n` +
            `Metin içine profesyonelce gizlenmiş ${s.hataSayisi} adet ${s.hataYeri} hatası ekle. \n` +
            `Metnin sonunda hataların hangi kurala aykırı olduğuna dair bir ipucu bölümü de kurgula.`,
    },
    {
        id: 'SOZCUK_SIRALA',
        category: 'yazim_noktalama',
        icon: 'fa-sort-alpha-down',
        label: 'Sözcükleri Doğru Sıraya Koy',
        description: 'Karışık verilmiş sözcüklerden anlamlı cümle oluştur.',
        difficulty: 'easy',
        settings: [
            { key: 'sozcukAdedi', label: 'Sözcük Adedi', type: 'range', defaultValue: 6, min: 4, max: 10 },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 3, min: 2, max: 5 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "OBJECT", properties: { karisik: { type: "ARRAY", items: { type: "STRING" } }, dogru: { type: "ARRAY", items: { type: "STRING" } } }, required: ["karisik", "dogru"] } } }, required: ["cumleler"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: [
                { karisik: ["bahar", "geldi", "çiçekler", "açtı", "bahçede"], dogru: ["Bahçede", "bahar", "geldi", "çiçekler", "açtı"] },
                { karisik: ["kitap", "en", "dosttur", "sadık", "insana"], dogru: ["Kitap", "insana", "en", "sadık", "dosttur"] },
                { karisik: ["öğretmenini", "dikkatle", "Ali", "dinliyordu", "sınıfta"], dogru: ["Ali", "sınıfta", "öğretmenini", "dikkatle", "dinliyordu"] }
            ].slice(0, s.cumleAdedi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasında ${s.cumleAdedi} adet anlamlı cümle yaz. \n` +
            `Her cümledeki kelimeleri karıştır (randomize et). \n` +
            `Öğrencinin bu kelimeleri anlamlı ve kurallı bir cümle haline getirmesini sağla. JSON: 'karisik' ve 'dogru' dizi alanları.`,
    },
    {
        id: 'BUYUK_KUCUK_HARF',
        category: 'yazim_noktalama',
        icon: 'fa-font',
        label: 'Büyük/Küçük Harf Kuralları',
        description: 'Özel isimler, cümle başları ve kısaltmalarda büyük harf kuralları.',
        difficulty: 'easy',
        settings: [
            { key: 'kural', label: 'Kural Odağı', type: 'select', defaultValue: 'Genel Kurallar', options: ['Özel İsimler', 'Cümle Başı', 'Kısaltmalar', 'Hepsi'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "STRING" } }, kural: { type: "STRING" } }, required: ["cumleler", "kural"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: [
                "dün akşam ali ile birlikte ankara yolculuğuna çıktık .",
                "türk dil kurumu ( tdk ) yeni bir sözlük yayınladı .",
                "doktor mehmet bey yarın sabah erkenden ameliyata girecek .",
                "bahçedeki çiçekleri sulayan ayşe teyze çok yorulmuştu ."
            ].slice(0, s.cumleAdedi),
            kural: s.kural,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasında geçebilecek ${s.cumleAdedi} adet cümle yaz. \n` +
            `Cümlelerdeki tüm büyük harfle başlaması gereken yerleri (özel isim, cümle başı vb.) kasıtlı olarak küçük yaz. \n` +
            `Öğrencinin bu ${s.kural} hatalarını bulup düzeltmesi hedeflensin.`,
    },
    {
        id: 'METIN_DUZELT',
        category: 'yazim_noktalama',
        icon: 'fa-pen',
        label: 'Metni Kural Uygun Düzelt',
        description: 'Çoklu hatalar içeren metni tüm kurallarla birlikte düzelt.',
        difficulty: 'hard',
        settings: [
            { key: 'hataTuru', label: 'Hata Türü Karışımı', type: 'select', defaultValue: 'Karma', options: ['Yalnız Yazım', 'Yalnız Noktalama', 'Karma'] },
            { key: 'paragrafUzunlugu', label: 'Paragraf Uzunluğu', type: 'select', defaultValue: 'Orta', options: ['Kısa', 'Orta', 'Uzun'] },
        ],
        schema: { type: "OBJECT", properties: { metin: { type: "STRING" }, hataTuru: { type: "STRING" } }, required: ["metin", "hataTuru"] },
        fastGenerate: (s, grade, topic) => ({
            metin: `Dün akşam mehmet amcamlar ( ) ankaradan geldiler . yolda gelirken herkez çok yorulmuştu ( ) Hiç kimse bişey konuşmadı .`,
            hataTuru: "Karma (Yazım + Noktalama)",
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf öğrencisi için MEB temasında kapsamlı bir metin yaz. \n` +
            `Metin ${s.hataTuru} hataları içermeli. \n` +
            `LGS standartlarında bir 'Metin Düzeltme' (Proofreading) etkinliği kurgula. Hataların gerekçelerini metin sonunda belirt.`,
    },
    {
        id: 'KELIME_ANALIZI',
        category: 'yazim_noktalama',
        icon: 'fa-microscope',
        label: 'Sözcük Ses & Harf Analizi',
        description: 'Sözcükteki harf, ses, hece sayısı ve çeşidi analizi.',
        difficulty: 'medium',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'analizBoyutu', label: 'Analiz Boyutu', type: 'select', defaultValue: 'Hepsi', options: ['Harf & Ses', 'Hece', 'Harf-Ses Farkı', 'Hepsi'] },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, analizSutunlari: { type: "ARRAY", items: { type: "STRING" } } }, required: ["kelime", "analizSutunlari"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "Kitaplık", analizSutunlari: ["Harf: 8", "Ses: 8", "Hece: Ki-tap-lık"] },
                { kelime: "Öğrenci", analizSutunlari: ["Harf: 7", "Ses: 7", "Hece: Ög-ren-ci"] },
                { kelime: "Cumhuriyet", analizSutunlari: ["Harf: 10", "Ses: 10", "Hece: Cum-hu-ri-yet"] }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" konusuyla ilgili veya sık kullanılan ${s.kelimeSayisi} adet kelime seç. \n` +
            `Her kelime için ${s.analizBoyutu} analizi yapabilecekleri bir tablo yapısı oluştur. \n` +
            `JSON: 'kelimeler' dizi objesi, içinde 'analizSutunlari' alanı olsun.`,
    },
    {
        id: 'KISALTMA_SEMBOL',
        category: 'yazim_noktalama',
        icon: 'fa-at',
        label: 'Kısaltma & Sembol Kuralları',
        description: 'Sık kullanılan kısaltmaları ve sembolleri doğru kullanma.',
        difficulty: 'easy',
        settings: [
            { key: 'kisaltmaSayisi', label: 'Kısaltma Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 },
            { key: 'cumleIceEkle', label: 'Cümle İçinde Test', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { kisaltmalar: { type: "ARRAY", items: { type: "OBJECT", properties: { kisaltma: { type: "STRING" }, acilimi: { type: "STRING" }, cumle: { type: "STRING" } }, required: ["kisaltma", "acilimi", "cumle"] } } }, required: ["kisaltmalar"] },
        fastGenerate: (s, grade, topic) => ({
            kisaltmalar: [
                { kisaltma: "TDK", acilimi: "Türk Dil Kurumu", cumle: "Türkçenin korunması konusunda TDK'nin kararları esastır." },
                { kisaltma: "MEB", acilimi: "Milli Eğitim Bakanlığı", cumle: "MEB tarafından yeni müfredat açıklandı." },
                { kisaltma: "kg", acilimi: "Kilogram", cumle: "Marketten 2 kg elma aldım." },
                { kisaltma: "bkz.", acilimi: "Bakınız", cumle: "Daha fazla bilgi için bkz. sayfa 45." }
            ].slice(0, s.kisaltmaSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf seviyesinde karşımıza çıkabilecek ${s.kisaltmaSayisi} adet yaygın kısaltma (kurum, ölçü birimi vb.) seç. \n` +
            `Her kısaltmanın açılımını yaz ve ${s.cumleIceEkle ? 'içinde kısaltmaya gelen eklerin doğru yazıldığı bir örnek cümle ekle.' : 'sadece doğru yazımını belirt.'}`,
    },
    {
        id: 'DIKTE_CALISMA',
        category: 'yazim_noktalama',
        icon: 'fa-microphone',
        label: 'Dikte Çalışma Metni',
        description: 'Dikte çalışması için sözlü okunmaya uygun metin üret.',
        difficulty: 'easy',
        settings: [
            { key: 'cumleSayisi', label: 'Cümle Sayısı', type: 'range', defaultValue: 5, min: 3, max: 10 },
            { key: 'zorlukSeviyesi', label: 'Sözcük Zorluğu', type: 'select', defaultValue: 'Orta', options: ['Kolay', 'Orta', 'Zor'] },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "STRING" } }, ogretmenNotu: { type: "STRING" } }, required: ["cumleler", "ogretmenNotu"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: [
                "Küçük Ali, bahçedeki çiçekleri sulamak için erkenden kalktı.",
                "Gökyüzündeki bembeyaz bulutlar birer pamuk yığınına benziyordu.",
                "En sevdiği kitabı bitirmek için sabırsızlanıyordu.",
                "Doğayı korumak her insanın en önemli görevidir.",
                "Bilgi, karanlığı aydınlatan en güçlü fenerdir."
            ].slice(0, s.cumleSayisi),
            ogretmenNotu: `Bu metinde "${topic}" konularına odaklanılmıştır. Yazım zorluğu: ${s.zorlukSeviyesi}.`,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisine öğretmeni tarafından yazdırılacak bir dikte metni oluştur. \n` +
            `Metin "${topic}" temasında, akıcı ve anlamlı ${s.cumleSayisi} cümleden oluşsun. \n` +
            `Sözcük zorluğu ${s.zorlukSeviyesi} düzeyinde olsun. Bir adet de 'ogretmenNotu' ekle.`,
    },
    {
        id: 'YAZIM_KURALI_PANO',
        category: 'yazim_noktalama',
        icon: 'fa-clipboard-list',
        label: 'Yazım Kuralı Özet Panosu',
        description: 'Öne çıkan yazım kurallarını tablo/özet formatında sunma.',
        difficulty: 'easy',
        settings: [
            { key: 'kuralSayisi', label: 'Kural Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'ornekliMi', label: 'Her Kurala Örnek Ekle', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { kurallar: { type: "ARRAY", items: { type: "OBJECT", properties: { kural: { type: "STRING" }, dogru: { type: "STRING" }, yanlis: { type: "STRING" }, ornek: { type: "STRING" } }, required: ["kural", "dogru", "yanlis", "ornek"] } } }, required: ["kurallar"] },
        fastGenerate: (s, grade, topic) => ({
            kurallar: [
                { kural: "Şey sözcüğünün yazımı", dogru: "Her şey", yanlis: "Herşey", ornek: "Pazardan her şeyi aldık." },
                { kural: "-de ekinin yazımı", dogru: "Okulda bekliyorum.", yanlis: "Okul da bekliyorum.", ornek: "Herkes sınıfta toplandı." },
                { kural: "ki bağlacının yazımı", dogru: "Duydum ki unutmuşsun.", yanlis: "Duydumki unutmuşsun.", ornek: "Öyle bir çocuk ki..." }
            ].slice(0, s.kuralSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf müfredatındaki kritik kuralları LGS standartlarında özetle. \n` +
            `Sadece doğru/yanlış değil, 'Kuralın Mantığı' bölümü ekle. \n` +
            `MEB 2025 güncel örnekleriyle (Yapay Zeka, Milli Teknoloji Hamlesi gibi bağlamlarda) kurgula.`,
    },
];
