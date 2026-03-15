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
            { key: 'format', label: 'Format', type: 'select', defaultValue: 'eslestirme', options: ['Eşleştirme', 'Çoktan Seçmeli', 'Boşluk Doldurma'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            left: Array.from({ length: s.deyimSayisi }, (_, i) => `Deyim ${i + 1} (${topic} temalı)`),
            right: Array.from({ length: s.deyimSayisi }, (_, i) => `Deyim ${i + 1}'in anlamı`).sort(() => Math.random() - 0.5),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusuyla bağlantılı ${s.deyimSayisi} Türkçe deyim seç. ` +
            `${grade}. sınıf için ${s.format} formatında deyim-anlam aktivitesi hazırla.`,
    },
    {
        id: 'ATASOZI_ESLESTIR',
        category: 'soz_varligi',
        icon: 'fa-quote-right',
        label: 'Atasözü Anlam & Durum Eşleştirme',
        description: 'Atasözünü uygun olduğu durumla eşleştir.',
        difficulty: 'medium',
        settings: [
            { key: 'atasozu Sayisi', label: 'Atasözü Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 },
            { key: 'formatTuru', label: 'Format', type: 'select', defaultValue: 'durum_eslestir', options: ['Durum Eşleştir', 'Anlamını Seç', 'Hangi Durumda Kullanılır'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            atasozleri: Array.from({ length: s['atasozu Sayisi'] || 4 }, (_, i) => ({
                atasoz: `Atasözü ${i + 1}: "${topic}" konusuyla ilgili geleneksel atasözü.`,
                durum: `Durum ${i + 1}: Bu atasözünün kullanıldığı gerçek hayat örneği.`,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusuyla ilişkili ${s['atasozu Sayisi'] || 4} Türk atasözü seç. ` +
            `${grade}. sınıf için ${s.formatTuru} aktivitesi hazırla.`,
    },
    {
        id: 'KELIME_ANLAM',
        category: 'soz_varligi',
        icon: 'fa-book-open',
        label: 'Kelime Anlam & Kullanım',
        description: 'Sözcüğün gerçek, mecaz, yan anlamlarını tespit et.',
        difficulty: 'medium',
        settings: [
            { key: 'anlamTuru', label: 'Anlam Türü', type: 'select', defaultValue: 'hepsi', options: ['Gerçek Anlam', 'Mecaz Anlam', 'Yan Anlam', 'Hepsi'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        fastGenerate: (s, grade, topic) => ({
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `"${topic}" bağlamında Kelime ${i + 1}`,
                cumle: `Bu kelime ${s.anlamTuru === 'Hepsi' ? 'çok anlamlı' : s.anlamTuru} kullanımda cümle örneği.`,
                soru: 'Bu cümlede altı çizili sözcük hangi anlamda kullanılmıştır?',
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusunda ${s.kelimeSayisi} adet ${s.anlamTuru} örneği içeren cümle yaz. ` +
            `${grade}. sınıf için anlam sorusu ekle.`,
    },
    {
        id: 'ES_ANLAMLI_ZITLIK',
        category: 'soz_varligi',
        icon: 'fa-arrows-left-right',
        label: 'Eş Anlamlı / Zıt Anlamlı Bul',
        description: 'Verilen sözcüğün eş ve zıt anlamlısını bul.',
        difficulty: 'easy',
        settings: [
            { key: 'format', label: 'Format', type: 'select', defaultValue: 'ikisi', options: ['Yalnız Eş Anlamlı', 'Yalnız Zıt Anlamlı', 'İkisi Birlikte'] },
            { key: 'kelimeSayisi', label: 'Kelime Sayısı', type: 'range', defaultValue: 6, min: 4, max: 10 },
        ],
        fastGenerate: (s, grade, topic) => ({
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `Kelime ${i + 1} (${topic})`,
                esAnlamli: s.format !== 'Yalnız Zıt Anlamlı' ? `Eş anlamlı ${i + 1}` : null,
                zitAnlamli: s.format !== 'Yalnız Eş Anlamlı' ? `Zıt anlamlı ${i + 1}` : null,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusundan ${s.kelimeSayisi} sözcük seç. Her biri için ` +
            `${s.format} aktivitesi hazırla. ${grade}. sınıf düzeyi.`,
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
        fastGenerate: (s, grade, topic) => ({
            deyimler: Array.from({ length: s.deyimSayisi }, (_, i) => ({
                deyim: `Deyim ${i + 1}: ${topic} temalı gerçek deyim`,
                anlam: s.yardimli ? `Anlamı: Deyim ${i + 1} açıklaması` : null,
                bosluk: `_________ cümleyi tamamla.`,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" temalı ${s.deyimSayisi} Türkçe deyim seç. ${grade}. sınıf için ` +
            `${s.yardimli ? 'deyim anlamını vererek' : 'anlamı vermeden'} cümle içinde kullanma aktivitesi hazırla.`,
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
        fastGenerate: (s, grade, topic) => ({
            sorular: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                ipuclari: Array.from({ length: s.ipucuSayisi }, (_, j) => `İpucu ${j + 1}: ${topic} ile ilgili tahmin ipucu`),
                cevap: `Cevap Kelime ${i + 1}`,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusundan ${s.kelimeSayisi} kelime seç. ` +
            `Her biri için ${s.ipucuSayisi} İpucuyla kelime tahmini aktivitesi hazırla.`,
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
            { key: 'merkez', label: 'Merkez Kavram Türü', type: 'select', defaultValue: 'konu', options: ['Konu Kavramı', 'Duygu Sözcüğü', 'Eylem Sözcüğü'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            merkezKelime: topic,
            dallar: Array.from({ length: s.dalSayisi }, (_, i) => `İlişkili kavram ${i + 1}`),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" sözcüğünü merkeze alan ${s.dalSayisi} dallı kelime ağı oluştur. ` +
            `${grade}. sınıf için bağlantılı kavramlar önerin.`,
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
            { key: 'icerik', label: 'Eklenecek Bilgi', type: 'select', defaultValue: 'tanim_ornek', options: ['Yalnız Tanım', 'Tanım + Örnek', 'Tanım + Eş Anlamlı + Örnek'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            sozluk: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `${topic} Kelime ${i + 1}`,
                tanim: `Tanım: Bu sözcüğün anlamı...`,
                ornek: s.icerik !== 'Yalnız Tanım' ? `Örnek: Bu kelimeyi kullanan cümle.` : null,
                esAnlamli: s.icerik === 'Tanım + Eş Anlamlı + Örnek' ? `Eş anlamlısı` : null,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusunu işleyen kısa bir metin yaz. Zorluk seviyesi ${grade}. sınıf. ` +
            `Metinden ${s.kelimeSayisi} zor kelime çıkar ve ${s.icerik} biçiminde mini sözlük hazırla.`,
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
        fastGenerate: (s, grade, topic) => ({
            words: s.deyimHavuzu ? Array.from({ length: s.cumleAdedi + 2 }, (_, i) => `Deyim ${i + 1}`) : [],
            sentences: Array.from({ length: s.cumleAdedi }, (_, i) =>
                `Cümle ${i + 1}: "${topic}" konusunda anlam boşluğu içeren cümle ____________.`
            ),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" ile ilgili ${s.cumleAdedi} cümle yaz. ` +
            `Her cümlede doğru deyimle doldurulacak boşluk bırak. ` +
            `${s.deyimHavuzu ? `${s.cumleAdedi + 2} deyimlik seçenek havuzu ver.` : ''}`,
    },
    {
        id: 'OZDEYIS_ANALIZ',
        category: 'soz_varligi',
        icon: 'fa-star',
        label: 'Özlü Söz & Özdeyiş Analizi',
        description: 'Meşhur özdeyişi yorumla ve özgün cümleyle ilişkilendir.',
        difficulty: 'hard',
        settings: [
            { key: 'soruTuru', label: 'Soru Türü', type: 'select', defaultValue: 'anlam_yorum', options: ['Anlam & Yorum', 'Yaşamla İlişkilendir', 'Katılıyor musun?'] },
            { key: 'ozdeyisSayisi', label: 'Özdeyiş Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 },
        ],
        fastGenerate: (s, grade, topic) => ({
            ozdeyisler: Array.from({ length: s.ozdeyisSayisi }, (_, i) => ({
                ozdeyis: `Özdeyiş ${i + 1}: "${topic}" konusuyla bağlantılı anlamlı özdeyiş.`,
                soru: s.soruTuru,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusuyla ilgili ${s.ozdeyisSayisi} meşhur özdeyiş seç. ` +
            `${grade}. sınıf için "${s.soruTuru}" formatında analiz soruları hazırla.`,
    },
];
