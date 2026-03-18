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
            { key: 'ogeFiltresu', label: 'Öğe Filtresi', type: 'select', defaultValue: 'hepsi', options: ['Hepsi', 'Sözcük Türleri', 'Cümle Öğeleri', 'Yapım Ekleri', 'Çekim Ekleri'] },
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 5, min: 3, max: 10 },
            { key: 'celdiriciMaskesi', label: 'Çeldirici Türü', type: 'select', defaultValue: 'karistirici', options: ['Basit', 'Karıştırıcı', 'Eşsesli Kelimeler', 'Yanlış Kural'] },
        ],
        schema: { type: "OBJECT", properties: { sorular: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["soru", "options"] } } }, required: ["sorular"] },
        fastGenerate: (s, grade, topic) => ({
            sorular: Array.from({ length: s.soruSayisi }, (_, i) => ({
                soru: `Soru ${i + 1}: "${topic}" konusunda ${s.ogeFiltresu === 'Hepsi' ? 'genel dil bilgisi' : s.ogeFiltresu} sorusu.`,
                options: ['A) Doğru cevap', 'B) Yanlış - çeldirici', 'C) Yanlış - ' + s.celdiriciMaskesi, 'D) Yanlış - benzer kural'],
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.ogeFiltresu} odaklı ${s.soruSayisi} adet ` +
            `çoktan seçmeli dil bilgisi sorusu yaz. Çeldirici türü: ${s.celdiriciMaskesi}.`,
    },
    {
        id: 'HATALI_SOZCUK',
        category: 'dil_bilgisi',
        icon: 'fa-bug',
        label: 'Hatalı Sözcüğü Bul / İşaretle',
        description: 'Paragraftaki dil bilgisi hatasını bulma.',
        difficulty: 'medium',
        settings: [
            { key: 'hataKategorisi', label: 'Hata Kategorisi', type: 'select', defaultValue: 'ek_hata', options: ['Ek Hatası', 'Kök Hatası', 'Çekim Yanlışı', 'Sözcük Türü Yanlışı'] },
            { key: 'yogunluk', label: 'Hata Yoğunluğu', type: 'select', defaultValue: 'tek_hata', options: ['Tek Hata', 'İki Hata', 'Üç Hata'] },
        ],
        schema: { type: "OBJECT", properties: { paragraf: { type: "STRING" }, hataSayisi: { type: "NUMBER" } }, required: ["paragraf", "hataSayisi"] },
        fastGenerate: (s, grade, topic) => ({
            paragraf: `Bu paragraf "${topic}" konusunu işlemektedir. İçinde ${s.yogunluk === 'Tek Hata' ? '1' : s.yogunluk === 'İki Hata' ? '2' : '3'} adet ${s.hataKategorisi} bulunmaktadır. Hatalı sözcükleri bulunuz.`,
            hataSayisi: s.yogunluk === 'Tek Hata' ? 1 : s.yogunluk === 'İki Hata' ? 2 : 3,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda 5-7 cümlelik bir paragraf yaz. ` +
            `İçine ${s.yogunluk} kadar ${s.hataKategorisi} gizle. Öğrenci hataları bulsun.`,
    },
    {
        id: 'BOSLUK_CEKIM_EKI',
        category: 'dil_bilgisi',
        icon: 'fa-puzzle-piece',
        label: 'Boşlukları Eklerle Doldur',
        description: 'Doğru yapım veya çekim ekini seçerek cümleleri tamamla.',
        difficulty: 'medium',
        settings: [
            { key: 'ekTuru', label: 'Ek Türü', type: 'select', defaultValue: 'cekim', options: ['Yapım Eki', 'Çekim Eki', 'İkisi Birlikte'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'kelimeListesi', label: 'Kelime Listesi Göster', type: 'toggle', defaultValue: true },
        ],
        schema: { type: "OBJECT", properties: { words: { type: "ARRAY", items: { type: "STRING" } }, sentences: { type: "ARRAY", items: { type: "STRING" } } }, required: ["words", "sentences"] },
        fastGenerate: (s, grade, topic) => ({
            words: Array.from({ length: Math.min(s.cumleAdedi, 5) }, (_, i) => `Kelime${i + 1}`),
            sentences: Array.from({ length: s.cumleAdedi }, (_, i) =>
                `Cümle ${i + 1}: "${topic}" bağlamında ${s.ekTuru} sorusu — Kelime ________.`
            ),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.cumleAdedi} cümlelik boşluk doldurma etkinliği yaz. ` +
            `Boşluklar ${s.ekTuru} ile doldurulsun. ${s.kelimeListesi ? 'Üstte kelime/ek listesi ver.' : 'Liste olmadan yap.'}`,
    },
    {
        id: 'KAVRAM_ESLESTIRME',
        category: 'dil_bilgisi',
        icon: 'fa-link',
        label: 'Tanım → Örnek Eşleştirme',
        description: 'Dil bilgisi kavramını doğru örnekle eşleştirme.',
        difficulty: 'easy',
        settings: [
            { key: 'cizgiTipi', label: 'Eşleştirme Tipi', type: 'select', defaultValue: 'cizgi', options: ['Çizgi Çekme', 'Ok İşareti', 'Numara Eşleştirme'] },
            { key: 'kavramSayisi', label: 'Kavram Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { left: { type: "ARRAY", items: { type: "STRING" } }, right: { type: "ARRAY", items: { type: "STRING" } } }, required: ["left", "right"] },
        fastGenerate: (s, grade, topic) => ({
            left: Array.from({ length: s.kavramSayisi }, (_, i) => `${topic} → Tanım ${i + 1}`),
            right: Array.from({ length: s.kavramSayisi }, (_, i) => `Örnek cümle ${i + 1}`).sort(() => Math.random() - 0.5),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" konusunda ${s.kavramSayisi} adet kavram-örnek çifti hazırla. ` +
            `Öğrenci ${s.cizgiTipi} yöntemiyle eşleştirsin.`,
    },
    {
        id: 'CUMLE_OGESI_AYIRMA',
        category: 'dil_bilgisi',
        icon: 'fa-scissors',
        label: 'Cümle Ögelerine Ayırma',
        description: 'Cümledeki özne, yüklem, nesne, tümleçleri ayır ve işaretle.',
        difficulty: 'medium',
        settings: [
            { key: 'bolmeYontemi', label: 'Gösterim Yöntemi', type: 'select', defaultValue: 'bosluk', options: ['Altını Çiz', 'Bölme Çizgisi', 'Renk Kutusu'] },
            { key: 'zorCumleler', label: 'Devrik/Zor Cümleler', type: 'toggle', defaultValue: false },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 4, min: 2, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "STRING" } }, yontem: { type: "STRING" } }, required: ["cumleler", "yontem"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: Array.from({ length: s.cumleAdedi }, (_, i) =>
                `Cümle ${i + 1}: "${topic}" ile ilgili ${s.zorCumleler ? 'devrik veya uzun' : 'normal'} bir cümle örneği.`
            ),
            yontem: s.bolmeYontemi,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.cumleAdedi} adet ${s.zorCumleler ? 'devrik cümle dahil çeşitli' : 'sade'} ` +
            `örnek cümle yaz. Öğrenci cümle ögelerini ${s.bolmeYontemi} yöntemiyle ayırsın.`,
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
            maddeler: Array.from({ length: s.maddeSayisi }, (_, i) => ({
                ifade: `İfade ${i + 1}: "${topic}" konusunda ${i % 2 === 0 ? 'doğru' : 'yanlış'} bir kural açıklaması.`,
                cevap: i % 2 === 0 ? 'D' : 'Y',
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" için ${s.maddeSayisi} adet doğru/yanlış ifadesi listesi hazırla. ` +
            `${s.karmasikKurallar ? 'Bir kısmı tartışmalı veya karışık kural içersin.' : ''}`,
    },
    {
        id: 'CUMLE_DONUSTUR',
        category: 'dil_bilgisi',
        icon: 'fa-rotate',
        label: 'Cümle Çatısını Dönüştür',
        description: 'Cümleyi etken-edilgen, olumluda-olumsuz, isim-fiil cümlesi dönüştür.',
        difficulty: 'hard',
        settings: [
            { key: 'donusumTuru', label: 'Dönüşüm Türü', type: 'select', defaultValue: 'etken_edilgen', options: ['Etken-Edilgen', 'Olumlu-Olumsuz', 'İsim-Fiil Cümlesi', 'Devrik-Kurallı'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 4, min: 2, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "STRING" } }, donusumTuru: { type: "STRING" } }, required: ["cumleler", "donusumTuru"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: Array.from({ length: s.cumleAdedi }, (_, i) =>
                `Cümle ${i + 1}: "${topic}" konusunda ${s.donusumTuru} dönüştürülecek örnek cümle.`
            ),
            donusumTuru: s.donusumTuru,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.cumleAdedi} cümle yaz ve ` +
            `bunları ${s.donusumTuru} dönüşümü için hazırla. Öğrenci dönüştürsün.`,
    },
    {
        id: 'TABLODA_HATA_AVI',
        category: 'dil_bilgisi',
        icon: 'fa-table-cells',
        label: 'Tablolu Hata Avı (Renklendirme)',
        description: 'Tablo içinde hatalı dil bilgisi öğeleri renklendirilir.',
        difficulty: 'medium',
        settings: [
            { key: 'izgara', label: 'Izgara Boyutu', type: 'select', defaultValue: '4x4', options: ['3x3', '4x4', '5x5'] },
            { key: 'celdiriciRengi', label: 'Çeldirici Renk Sayısı', type: 'range', defaultValue: 2, min: 1, max: 4 },
        ],
        schema: { type: "OBJECT", properties: { tablo: { type: "ARRAY", items: { type: "ARRAY", items: { type: "STRING" } } }, hataHucreleri: { type: "ARRAY", items: { type: "ARRAY", items: { type: "NUMBER" } } } }, required: ["tablo", "hataHucreleri"] },
        fastGenerate: (s, grade, topic) => {
            const size = parseInt(s.izgara.split('x')[0]);
            return {
                tablo: Array.from({ length: size }, (_, r) =>
                    Array.from({ length: size }, (_, c) => (`Hücre(${r},${c}): ${topic} örneği`))
                ),
                hataHucreleri: [[0, 0], [1, 2]],
            };
        },
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusunda ${s.izgara} boyutlu bir sözcük tablosu oluştur. ` +
            `Tabloda ${s.celdiriciRengi} adet hatalı dil bilgisi kullanımı gizle. ${grade}. sınıf.`,
    },
    {
        id: 'ANLATIM_BOZUKLUGU',
        category: 'dil_bilgisi',
        icon: 'fa-wrench',
        label: 'Anlatım Bozukluğunu Düzelt',
        description: 'Anlatım bozukluğu içeren cümleleri tespit ve düzeltme.',
        difficulty: 'hard',
        settings: [
            { key: 'bozuklukTuru', label: 'Bozukluk Türü', type: 'select', defaultValue: 'anlam', options: ['Anlam Bozukluğu', 'Mantık Bozukluğu', 'Dil Bilgisi Yanlışı', 'Tekrar'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 4, min: 3, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "OBJECT", properties: { bozuk: { type: "STRING" }, duzgun: { type: "STRING" } }, required: ["bozuk", "duzgun"] } } }, required: ["cumleler"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: Array.from({ length: s.cumleAdedi }, (_, i) => ({
                bozuk: `Bozuk cümle ${i + 1}: "${topic}" konusunda ${s.bozuklukTuru} içeren cümle.`,
                duzgun: `Düzeltilmiş hâli ${i + 1}: Doğru kullanım.`,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.cumleAdedi} adet ${s.bozuklukTuru} içeren bozuk cümle yaz. ` +
            `Doğru biçimlerini de ver. Öğrenci bozukluğu bulsun ve düzeltsın.`,
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
            { key: 'kisit', label: 'Kısıt', type: 'select', defaultValue: 'yok', options: ['Kısıt Yok', 'Deyim Kullan', 'Belirli Ek Kullan'] },
        ],
        schema: { type: "OBJECT", properties: { kelimeler: { type: "ARRAY", items: { type: "STRING" } }, yonerge: { type: "STRING" } }, required: ["kelimeler", "yonerge"] },
        fastGenerate: (s, grade, topic) => ({
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => `${topic} ile ilgili kelime ${i + 1}`),
            yonerge: `Yukarıdaki kelimeler${s.kisit !== 'Kısıt Yok' ? ` ve ${s.kisit} kuralına uyarak` : ''} anlamlı cümleler kur.`,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusuna ait ${s.kelimeSayisi} adet kelime/kavram belirle. ` +
            `Öğrenciden bu kelimelerle ${s.kisit !== 'Kısıt Yok' ? s.kisit + ' şartıyla' : ''} özgün cümleler kurmasını iste.`,
    },
];
