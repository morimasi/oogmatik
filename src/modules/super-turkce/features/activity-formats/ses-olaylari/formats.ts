// =============================================================================
// HECE VE SES OLAYLARI — 10 Format Tanımı
// =============================================================================

import { ActivityFormatDef } from '../../../core/types/activity-formats';

export const sesOlaylariFormats: ActivityFormatDef[] = [
    {
        id: 'HECE_YAPI',
        category: 'ses_olaylari',
        icon: 'fa-layers',
        label: 'Hecelere Ayır & Yapısını Bul',
        description: 'Sözcüğü hecelere ayır, açık/kapalı hece yapısını belirle.',
        difficulty: 'easy',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 },
            { key: 'heceYapisi', label: 'Hece Yapısı Analizi', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, heceler: { type: "ARRAY", items: { type: "STRING" } }, yapisi: { type: "STRING" } }, required: ["kelime", "heceler", "yapisi"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "Öğretmen", heceler: ["Öğ", "ret", "men"], yapisi: "Kapalı-Kapalı-Kapalı" },
                { kelime: "Araba", heceler: ["A", "ra", "ba"], yapisi: "Açık-Açık-Açık" },
                { kelime: "İstanbul", heceler: ["İs", "tan", "bul"], yapisi: "Kapalı-Kapalı-Kapalı" },
                { kelime: "Kitaplık", heceler: ["Ki", "tap", "lık"], yapisi: "Açık-Kapalı-Kapalı" }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf düzeyi için MEB temasında hece tahlili yapılacak sözcükler seç. \n` +
            `Sözcüklerin hece yapılarını (açık/kapalı) belirlerken profesyonel dil bilgisi kurallarını baz al. \n` +
            `${s.heceYapisi ? 'JSON içine heceler ve yapisi (Açık/Kapalı) alanlarını ekle.' : 'Sadece doğru heceleme listesini döndür.'}`,
    },
    {
        id: 'SES_OLAY_TANI',
        category: 'ses_olaylari',
        icon: 'fa-wave-square',
        label: 'Ses Olayını Tanımla',
        description: 'Sözcükte gerçekleşen ses olayını (benzeşme, aykırılaşma vb.) tanımla.',
        difficulty: 'hard',
        settings: [
            { key: 'olayTuru', label: 'Ses Olayı Türü', type: 'select', defaultValue: 'Hepsi', options: ['Hepsi', 'Ünlü Değişimi', 'Ünsüz Benzeşmesi', 'Ünlü Düşmesi', 'Ünsüz Türemesi'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, olay: { type: "STRING" } }, required: ["kelime", "olay"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "Kitapçı", olay: "Ünsüz Benzeşmesi" },
                { kelime: "Karnı", olay: "Ünlü Düşmesi" },
                { kelime: "Hakkı", olay: "Ünsüz Türemesi" },
                { kelime: "Bana", olay: "Ünlü Değişimi" },
                { kelime: "Gidiyor", olay: "Ünsüz Yumuşaması" }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf LGS standartlarında Ses Bilgisi analiz soruları hazırla. \n` +
            `Sözcükleri "${topic}" veya MEB temalı metinlerden seç. \n` +
            `Soru, öğrencinin kelimeyi önce kök ve eklerine ayırmasını, sonra aradaki ses değişimini (benzeşme, yumuşama vb.) tespit etmesini istemeli. \n` +
            `JSON: { kelimeler: [{kelime, olay}] }`,
    },
    {
        id: 'UNLU_UYUMU',
        category: 'ses_olaylari',
        icon: 'fa-music',
        label: 'Ünlü Uyumu Testi',
        description: 'Büyük/Küçük ünlü uyumuna uyan veya uymayan sözcükleri bul.',
        difficulty: 'medium',
        settings: [
            { key: 'uyumTuru', label: 'Uyum Türü', type: 'select', defaultValue: 'İkisi Birlikte', options: ['Yalnız Büyük Ünlü Uyumu', 'Yalnız Küçük Ünlü Uyumu', 'İkisi Birlikte'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 8, min: 5, max: 12 },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, uyuyor: { type: "BOOLEAN" }, uyumTuru: { type: "STRING" } }, required: ["kelime", "uyuyor", "uyumTuru"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "Kelebek", uyuyor: true, uyumTuru: "Büyük Ünlü Uyumu" },
                { kelime: "Kitap", uyuyor: false, uyumTuru: "Büyük Ünlü Uyumu" },
                { kelime: "Yazı", uyuyor: true, uyumTuru: "İkisi Birlikte" },
                { kelime: "Tiyatro", uyuyor: false, uyumTuru: "İkisi Birlikte" }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasında ${s.kelimeSayisi} adet kelime seç. \n` +
            `Kelimelerin bir kısmı ${s.uyumTuru} kuralına uysun, bir kısmı uymasın. \n` +
            `JSON içinde 'uyuyor' alanını (boolean) ve hangi kurala baktığını belirt.`,
    },
    {
        id: 'UNSUZ_BENZEŞMESI',
        category: 'ses_olaylari',
        icon: 'fa-sound',
        label: 'Ünsüz Benzeşme Analizi',
        description: 'Ek aldığında ünsüz benzeşmesine uğrayan sözcükleri tespit et.',
        difficulty: 'hard',
        settings: [
            { key: 'benzeşmeTuru', label: 'Benzeşme Türü', type: 'select', defaultValue: 'Hepsi', options: ['Süreksiz Ünsüz (p/ç/t/k)', 'Sürekli Ünsüz (f/s/ş/h)', 'Hepsi'] },
            { key: 'ornekSayisi', label: 'Örnek Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { ornekler: { type: "ARRAY", items: { type: "OBJECT", properties: { temel: { type: "STRING" }, ek: { type: "STRING" }, sonuc: { type: "STRING" }, kural: { type: "STRING" } }, required: ["temel", "ek", "sonuc", "kural"] } } }, required: ["ornekler"] },
        fastGenerate: (s, grade, topic) => ({
            ornekler: [
                { temel: "Kitap", ek: "-cı", sonuc: "Kitapçı", kural: "p - c → ç" },
                { temel: "Sınıf", ek: "-da", sonuc: "Sınıfta", kural: "f - d → t" },
                { temel: "Ağaç", ek: "-tan", sonuc: "Ağaçtan", kural: "ç - t → t (doğal)" },
                { temel: "Yavaş", ek: "-ca", sonuc: "Yavaşça", kural: "ş - c → ç" }
            ].slice(0, s.ornekSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf müfredatına uygun MEB temalı ünsüz benzeşmesi (sertleşme) örnekleri yaz. \n` +
            `Sertleşme kuralını (fıstıkçı şahap) bir 'Ön Bilgi/Scaffolding' olarak soru başına ekle. \n` +
            `Örneklerin sadece sözcük değil, LGS'deki gibi 'ek kurgusu' (kök+ek) üzerinden sorulmasını sağla.`,
    },
    {
        id: 'SES_DUSME_TUREME',
        category: 'ses_olaylari',
        icon: 'fa-minus-circle',
        label: 'Ses Düşmesi / Türemesi Bul',
        description: 'Ek alırken ses düşen veya yeni ses türeyen sözcükleri tespit et.',
        difficulty: 'hard',
        settings: [
            { key: 'olayTuru', label: 'Olay Türü', type: 'select', defaultValue: 'İkisi Birlikte', options: ['Yalnız Düşme', 'Yalnız Türeme', 'İkisi Birlikte'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kok: { type: "STRING" }, ekli: { type: "STRING" }, olay: { type: "STRING" } }, required: ["kok", "ekli", "olay"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kok: "Ağız", ekli: "Ağzı", olay: "Ünlü Düşmesi" },
                { kok: "Af", ekli: "Affetmek", olay: "Ünsüz Türemesi" },
                { kok: "Burun", ekli: "Burnu", olay: "Ünlü Düşmesi" },
                { kok: "Zan", ekli: "Zannetmek", olay: "Ünsüz Türemesi" }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasında ${s.kelimeSayisi} adet ses düşmesi veya türemesi örneği seç. \n` +
            `Kelimelerin yalın halini (kok) ve ek almış/değişmiş halini (ekli) yaz. \n` +
            `Gerçekleşen olayın adını (Düşme veya Türeme olarak) belirt.`,
    },
    {
        id: 'KAYNAŞTIRMA',
        category: 'ses_olaylari',
        icon: 'fa-arrows-merge',
        label: 'Kaynaştırma Harfi Ekle',
        description: 'Ünlüyle biten sözcüğe ünlüyle başlayan ek gelince kaynaştırma harfi ekle.',
        difficulty: 'medium',
        settings: [
            { key: 'cumleAdedi', label: 'Cümle/Kelime Adedi', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'zor', label: 'Özel Durumlar Dahil', type: 'toggle', defaultValue: false },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, ek: { type: "STRING" }, dogru: { type: "STRING" }, aciklama: { type: "STRING" } }, required: ["kelime", "ek", "dogru", "aciklama"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "Araba", ek: "-ı", dogru: "Arabayı", aciklama: '"y" kaynaştırma harfi' },
                { kelime: "İki", ek: "-er", dogru: "İkişer", aciklama: '"ş" kaynaştırma harfi' },
                { kelime: "Anne", ek: "-si", dogru: "Annesi", aciklama: '"s" kaynaştırma harfi' },
                { kelime: "O", ek: "-un", dogru: "Onun", aciklama: '"n" kaynaştırma harfi' }
            ].slice(0, s.cumleAdedi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temasında geçebilecek kaynaştırma harfi (y, ş, s, n) örnekleri yaz. \n` +
            `Soru başında 'Kaynaştırma Harflerinin Görevi'ni açıklayan kısa bir bilgi notu ekle. \n` +
            `${s.zor ? 'Zamir n-si veya üleştirme sayıları (ikişer/yedişer) gibi hassas noktaları da dahil et.' : 'Temel kurallara odaklan.'}`,
    },
    {
        id: 'ULASMA',
        category: 'ses_olaylari',
        icon: 'fa-link',
        label: 'Eklerin Doğru Eklenmesi (Ulama)',
        description: 'Sözcüğe doğru ekin doğru biçimiyle eklenmesi uygulaması.',
        difficulty: 'medium',
        settings: [
            { key: 'ekTuru', label: 'Ek Türü', type: 'select', defaultValue: 'Hepsi', options: ['Durum Ekleri', 'Çoğul Eki', 'İyelik Ekleri', 'Hepsi'] },
            { key: 'soruAdedi', label: 'Soru Adedi', type: 'range', defaultValue: 6, min: 4, max: 10 },
        ],
        schema: { type: "OBJECT", properties: { sorular: { type: "ARRAY", items: { type: "OBJECT", properties: { sozcuk: { type: "STRING" }, eklenecek: { type: "STRING" }, dogru: { type: "STRING" } }, required: ["sozcuk", "eklenecek", "dogru"] } } }, required: ["sorular"] },
        fastGenerate: (s, grade, topic) => ({
            sorular: [
                { sozcuk: "Kitap", eklenecek: "-ı", dogru: "Kitabı" },
                { sozcuk: "Sınıf", eklenecek: "-da", dogru: "Sınıfta" },
                { sozcuk: "Araba", eklenecek: "-lar", dogru: "Arabalar" },
                { sozcuk: "Defter", eklenecek: "-im", dogru: "Defterim" }
            ].slice(0, s.soruAdedi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasında ${s.soruAdedi} adet ek ekleme sorusu yaz. \n` +
            `Sözcüğün son harfine göre (ünlü-ünsüz uyumu veya yumuşama kuralı) ekin doğru halini almasını sağla. \n` +
            `JSON içinde 'sozcuk', 'eklenecek' ve doğru sonucu 'dogru' alanına yaz.`,
    },
    {
        id: 'HECE_BOLME',
        category: 'ses_olaylari',
        icon: 'fa-cut',
        label: 'Hecelere Ayırma Yarışması',
        description: 'Sözcükleri doğru kurallarla hecelere ayırma egzersizi.',
        difficulty: 'easy',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 8, min: 5, max: 15 },
            { key: 'yanlisCevapli', label: 'Yanlış Cevaplı Karışık Sorular', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, dogru: { type: "STRING" }, yanlis: { type: "STRING" } }, required: ["kelime", "dogru", "yanlis"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "İlkokul", dogru: "İl-ko-kul", yanlis: "İlk-o-kul" },
                { kelime: "Başöğretmen", dogru: "Ba-şöğ-ret-men", yanlis: "Baş-öğ-ret-men" },
                { kelime: "Kırklareli", dogru: "Kırk-la-re-li", yanlis: "Kırk-lar-e-li" },
                { kelime: "Hanımeli", dogru: "Ha-nı-me-li", yanlis: "Ha-nım-e-li" }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasında geçebilecek ${s.kelimeSayisi} tane hecelemesi zor veya birleşik kelime seç. \n` +
            `Sözcüklerin doğru heceleme biçimini ve ${s.yanlisCevapli ? 'yaygın yapılan bir yanlış heceleme biçimini' : 'sadece doğru hecelemeyi'} yaz. \n` +
            `Özellikle ulama olan birleşik kelimelere (ilkokul gibi) dikkat et.`,
    },
    {
        id: 'RADYOAKTIF_HARF',
        category: 'ses_olaylari',
        icon: 'fa-atom',
        label: 'Sert/Yumuşak Ünsüzler',
        description: 'Sözcükteki sert ve yumuşak ünsüzleri işaretleme aktivitesi.',
        difficulty: 'easy',
        settings: [
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 8, min: 5, max: 12 },
            { key: 'ayirtEdici', label: 'Sert/Yumuşak İşaret Yöntemi', type: 'select', defaultValue: 'Renklendirme', options: ['Renklendirme', 'Altını Çizme', 'Yuvarlak İçine Al'] },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, sertler: { type: "ARRAY", items: { type: "STRING" } }, yöntem: { type: "STRING" } }, required: ["kelime", "sertler", "yöntem"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: [
                { kelime: "Kitaplık", sertler: ["k", "t", "p", "l", "k"], yöntem: s.ayirtEdici },
                { kelime: "Sertlik", sertler: ["s", "r", "t", "l", "k"], yöntem: s.ayirtEdici },
                { kelime: "Fıstıkçı", sertler: ["f", "s", "t", "k", "ç"], yöntem: s.ayirtEdici }
            ].slice(0, s.kelimeSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasında ${s.kelimeSayisi} adet kelime belirle. \n` +
            `Bu kelimelerin içerisindeki sert ünsüzleri (f, s, t, k, ç, ş, h, p) liste olarak hazırla. \n` +
            `Öğrencinin bu harfleri ${s.ayirtEdici} yöntemiyle bulmasını iste.`,
    },
    {
        id: 'SES_ETKIN_QUIZ',
        category: 'ses_olaylari',
        icon: 'fa-bolt',
        label: 'Ses Bilgisi Hızlı Quiz',
        description: 'Hece, ünlü-ünsüz, ses olayları karışık kısa sorular.',
        difficulty: 'medium',
        settings: [
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 },
            { key: 'konuKarisimi', label: 'Konu Karışımı', type: 'select', defaultValue: 'Karma', options: ['Karma', 'Yalnız Hece', 'Yalnız Ses Olayları', 'Yalnız Ünlü-Ünsüz'] },
        ],
        schema: { type: "OBJECT", properties: { sorular: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["soru", "options"] } } }, required: ["sorular"] },
        fastGenerate: (s, grade, topic) => ({
            sorular: [
                { soru: '"Kitap-ı" birleşince "Kitabı" olur. Buradaki ses olayı nedir?', options: ["A) Ünsüz Yumuşaması", "B) Ünsüz Benzeşmesi", "C) Ünlü Düşmesi", "D) Ses Türemesi"] },
                { soru: 'Aşağıdaki kelimelerin hangisinde "YaŞaSıN" harflerinden biri kaynaştırma harfi olarak kullanılmıştır?', options: ["A) Masaya", "B) Kalemler", "C) Okulda", "D) Kitaplar"] }
            ].slice(0, s.soruSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf LGS "Ses Bilgisi" deneme testi hazırla. \n` +
            `Sorular ${s.konuKarisimi} alanlarını kapsayan, sadece bilgi değil muhakeme ölçen (Örn: 'Hangisinde birden fazla ses olayı vardır?') tarzda olmalı. \n` +
            `Çeldiriciler LGS standartlarında profesyonelce kurgulansın.`,
    },
];
