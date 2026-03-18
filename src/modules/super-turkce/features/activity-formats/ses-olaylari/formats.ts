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
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `${topic.split(' ')[0] || 'kelime'}${i + 1}`,
                heceler: [],
                yapisi: s.heceYapisi ? '(Açık/Kapalı analizi)' : '',
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusundan ${s.kelimeSayisi} sözcük seç. ` +
            `${grade}. sınıf için hecelere ayırma${s.heceYapisi ? ' ve hece yapısı (açık/kapalı) belirleme' : ''} aktivitesi hazırla.`,
    },
    {
        id: 'SES_OLAY_TANI',
        category: 'ses_olaylari',
        icon: 'fa-wave-square',
        label: 'Ses Olayını Tanımla',
        description: 'Sözcükte gerçekleşen ses olayını (benzeşme, aykırılaşma vb.) tanımla.',
        difficulty: 'hard',
        settings: [
            { key: 'olayTuru', label: 'Ses Olayı Türü', type: 'select', defaultValue: 'hepsi', options: ['Hepsi', 'Ünlü Değişimi', 'Ünsüz Benzeşmesi', 'Ünlü Düşmesi', 'Ünsüz Türemesi'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, olay: { type: "STRING" } }, required: ["kelime", "olay"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `SesOlay${i + 1}`,
                olay: s.olayTuru === 'Hepsi' ? ['Ünsüz Benzeşmesi', 'Ünlü Düşmesi', 'Ses Türemesi'][i % 3] : s.olayTuru,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" konusunda ses olaylarına örnek ${s.kelimeSayisi} sözcük üret. ` +
            `Odak: ${s.olayTuru}. Öğrenci ses olayını tespit etsin.`,
    },
    {
        id: 'UNLU_UYUMU',
        category: 'ses_olaylari',
        icon: 'fa-music',
        label: 'Ünlü Uyumu Testi',
        description: 'Büyük/Küçük ünlü uyumuna uyan veya uymayan sözcükleri bul.',
        difficulty: 'medium',
        settings: [
            { key: 'uyumTuru', label: 'Uyum Türü', type: 'select', defaultValue: 'ikisi', options: ['Yalnız Büyük Ünlü Uyumu', 'Yalnız Küçük Ünlü Uyumu', 'İkisi Birlikte'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 8, min: 5, max: 12 },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, uyuyor: { type: "BOOLEAN" }, uyumTuru: { type: "STRING" } }, required: ["kelime", "uyuyor", "uyumTuru"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `Kelime${i + 1}`,
                uyuyor: i % 3 !== 0,
                uyumTuru: s.uyumTuru,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için ${s.kelimeSayisi} sözcük listesi hazırla. ` +
            `${s.uyumTuru} kuralına uyan ve uymayan örnekler karışık olsun. "${topic}" konusuyla bağlantılı.`,
    },
    {
        id: 'UNSUZ_BENZEŞMESI',
        category: 'ses_olaylari',
        icon: 'fa-sound',
        label: 'Ünsüz Benzeşme Analizi',
        description: 'Ek aldığında ünsüz benzeşmesine uğrayan sözcükleri tespit et.',
        difficulty: 'hard',
        settings: [
            { key: 'benzeşmeTuru', label: 'Benzeşme Türü', type: 'select', defaultValue: 'hepsi', options: ['Süreksiz Ünsüz (p/ç/t/k)', 'Sürekli Ünsüz (f/s/ş/h)', 'Hepsi'] },
            { key: 'ornekSayisi', label: 'Örnek Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { ornekler: { type: "ARRAY", items: { type: "OBJECT", properties: { temel: { type: "STRING" }, ek: { type: "STRING" }, sonuc: { type: "STRING" }, kural: { type: "STRING" } }, required: ["temel", "ek", "sonuc", "kural"] } } }, required: ["ornekler"] },
        fastGenerate: (s, grade, topic) => ({
            ornekler: Array.from({ length: s.ornekSayisi || 5 }, (_, i) => ({
                temel: `sözcük${i + 1}`,
                ek: '-de/-da ekini al',
                sonuc: `sözcük${i + 1} + ek → benzeşme sonucu`,
                kural: s.benzeşmeTuru,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için ${s.benzeşmeTuru} ünsüz benzeşmesine ${s.ornekSayisi || 5} örnek ver. ` +
            `"${topic}" bağlamında. Öğrenci benzeşme kuralını açıklasın.`,
    },
    {
        id: 'SES_DUSME_TUREME',
        category: 'ses_olaylari',
        icon: 'fa-minus-circle',
        label: 'Ses Düşmesi / Türemesi Bul',
        description: 'Ek alırken ses düşen veya yeni ses türeyen sözcükleri tespit et.',
        difficulty: 'hard',
        settings: [
            { key: 'olayTuru', label: 'Olay Türü', type: 'select', defaultValue: 'ikisi', options: ['Yalnız Düşme', 'Yalnız Türeme', 'İkisi Birlikte'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kok: { type: "STRING" }, ekli: { type: "STRING" }, olay: { type: "STRING" } }, required: ["kok", "ekli", "olay"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kok: `Kök${i + 1}`,
                ekli: `Kök${i + 1}+ek`,
                olay: s.olayTuru === 'İkisi Birlikte' ? (i % 2 === 0 ? 'Düşme' : 'Türeme') : s.olayTuru.replace('Yalnız ', ''),
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusundan ${s.kelimeSayisi} sözcük seç. ` +
            `${s.olayTuru} olay(lar)ını gösteren sözcük-ek kombinasyonları hazırla. ${grade}. sınıf.`,
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
            kelimeler: Array.from({ length: s.cumleAdedi }, (_, i) => ({
                kelime: `sözcük${i}`,
                ek: '-e/-a eki',
                dogru: `sözcük${i}+y+e`,
                aciklama: 'Kaynaştırma harfi "y" eklendi.',
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" için ${s.cumleAdedi} adet kaynaştırma harfi örneği hazırla. ` +
            `${s.zor ? 'Özel durumları ve istisnaları da dahil et.' : 'Temel kurallarla sınırlı tut.'}`,
    },
    {
        id: 'ULASMA',
        category: 'ses_olaylari',
        icon: 'fa-link',
        label: 'Eklerin Doğru Eklenmesi (Ulama)',
        description: 'Sözcüğe doğru ekin doğru biçimiyle eklenmesi uygulaması.',
        difficulty: 'medium',
        settings: [
            { key: 'ekTuru', label: 'Ek Türü', type: 'select', defaultValue: 'hepsi', options: ['Durum Ekleri', 'Çoğul Eki', 'İyelik Ekleri', 'Hepsi'] },
            { key: 'soruAdedi', label: 'Soru Adedi', type: 'range', defaultValue: 6, min: 4, max: 10 },
        ],
        schema: { type: "OBJECT", properties: { sorular: { type: "ARRAY", items: { type: "OBJECT", properties: { sozcuk: { type: "STRING" }, eklenecek: { type: "STRING" }, dogru: { type: "STRING" } }, required: ["sozcuk", "eklenecek", "dogru"] } } }, required: ["sorular"] },
        fastGenerate: (s, grade, topic) => ({
            sorular: Array.from({ length: s.soruAdedi }, (_, i) => ({
                sozcuk: `Sözcük${i + 1}`,
                eklenecek: s.ekTuru === 'Hepsi' ? ['-de', '-ı', '-ler'][i % 3] : s.ekTuru,
                dogru: `Sözcük${i + 1}+ek doğru biçimi`,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" için ${s.soruAdedi} adet ${s.ekTuru} ekleme sorusu yaz. ` +
            `Ses uyumu kurallarına dikkat edilsin.`,
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
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `${topic.split(' ')[0] || 'türkçe'}${i + 1}`,
                dogru: `he-ce-${i + 1}`,
                yanlis: s.yanlisCevapli && i % 3 === 0 ? `h-ece${i + 1} (yanlış)` : '',
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusundan ${s.kelimeSayisi} sözcük seç. ` +
            `Hecelere ayırma aktivitesi hazırla. ` +
            `${s.yanlisCevapli ? 'Bir kısmı yanlış hecelenmiş biçimde ver, öğrenci doğrusunu bulsun.' : ''}`,
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
            { key: 'ayirtEdici', label: 'Sert/Yumuşak İşaret Yöntemi', type: 'select', defaultValue: 'renklendirme', options: ['Renklendirme', 'Altını Çizme', 'Yuvarlak İçine Al'] },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "OBJECT", properties: { kelime: { type: "STRING" }, sertler: { type: "ARRAY", items: { type: "STRING" } }, yöntem: { type: "STRING" } }, required: ["kelime", "sertler", "yöntem"] } } }, required: ["kelimeler"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `Kelime${i + 1}`,
                sertler: ['p', 'ç', 't', 'k', 'f', 's', 'ş', 'h'],
                yöntem: s.ayirtEdici,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusundan ${s.kelimeSayisi} sözcük seç. ` +
            `Sert/yumuşak ünsüz işaretleme aktivitesi hazırla. ${grade}. sınıf. ` +
            `Yöntem: ${s.ayirtEdici}.`,
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
            { key: 'konuKarisimi', label: 'Konu Karışımı', type: 'select', defaultValue: 'karma', options: ['Karma', 'Yalnız Hece', 'Yalnız Ses Olayları', 'Yalnız Ünlü-Ünsüz'] },
        ],
        schema: { type: "OBJECT", properties: { sorular: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["soru", "options"] } } }, required: ["sorular"] },
        fastGenerate: (s, grade, topic) => ({
            sorular: Array.from({ length: s.soruSayisi }, (_, i) => ({
                soru: `Soru ${i + 1}: "${topic}" konusunda ${s.konuKarisimi} ses bilgisi sorusu.`,
                options: ['A) Seçenek 1', 'B) Seçenek 2', 'C) Seçenek 3', 'D) Seçenek 4'],
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" için ${s.soruSayisi} adet ${s.konuKarisimi} ses bilgisi sorusu yaz. ` +
            `Her soru çoktan seçmeli olsun.`,
    },
];
