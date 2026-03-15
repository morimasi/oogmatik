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
            { key: 'format', label: 'Format', type: 'select', defaultValue: 'bosluk', options: ['Boşluk Doldurma', 'Doğru Yazımı Seç (3 Şık)'] },
            { key: 'kategori', label: 'Yazım Kategorisi', type: 'select', defaultValue: 'hepsi', options: ['Hepsi', 'Büyük Harf', 'Birleşik-Ayrı Yazım', 'Ses Değişimi', 'Yabancı Sözcükler'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            words: Array.from({ length: 4 }, (_, i) => `doğruKelime${i + 1}`),
            sentences: Array.from({ length: s.cumleAdedi }, (_, i) =>
                `Cümle ${i + 1}: "${topic}" bağlamında ${s.kategori} kuralıyla ilgili ________ boşluklu cümle.`,
            ),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunu kapsayan ${s.cumleAdedi} cümle yaz. ` +
            `Her cümlede ${s.kategori} kategorisinde bir sözcüğü boş bırak. ` +
            `Format: ${s.format}.`,
    },
    {
        id: 'NOKTALAMA_EKLE',
        category: 'yazim_noktalama',
        icon: 'fa-paragraph',
        label: 'Noktalama İşaretlerini Ekle',
        description: 'Noktalama işareti eksik metne doğru işaretleri yerleştir.',
        difficulty: 'medium',
        settings: [
            { key: 'isaretTuru', label: 'İşaret Türü', type: 'select', defaultValue: 'hepsi', options: ['Hepsi', 'Nokta & Virgül', 'Tırnak & Parantez', 'Soru & Ünlem'] },
            { key: 'metinUzunlugu', label: 'Metin Uzunluğu', type: 'select', defaultValue: 'orta', options: ['Kısa (3 cümle)', 'Orta (5 cümle)', 'Uzun (8 cümle)'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            metin: `Noktalama işaretsiz metin: "${topic}" konusunu anlatan ${s.metinUzunlugu} uzunlukta cümleler noktalama işaretleri olmadan yazılmıştır öğrenci doğru işaretleri koyacak`,
            eksikIsamretler: s.isaretTuru === 'Hepsi' ? ['.', ',', '?', '"', '!'] : ['...'],
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" konusunda ${s.metinUzunlugu} uzunlukta bir metin yaz. ` +
            `Tüm ${s.isaretTuru} işaretlerini metinden kaldır. Öğrenci geri eklesin.`,
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
            { key: 'hataYeri', label: 'Hata Türü', type: 'select', defaultValue: 'karisik', options: ['Yalnız Büyük Harf', 'Yalnız Birleşik Yazım', 'Karışık'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            metin: `Bu metin "${topic}" konusunu işlemektedir. İçinde ${s.hataSayisi} adet ${s.hataYeri} yazım hatası bulunmaktadır. Öğrenci hataları bulup düzeltmelidir.`,
            hataSayisi: s.hataSayisi,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" için kısa bir paragraf yaz. ` +
            `İçine ${s.hataSayisi} adet ${s.hataYeri} yazım hatası ekle. Öğrenci hataları bulsun.`,
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
        fastGenerate: (s, grade, topic) => ({
            cumleler: Array.from({ length: s.cumleAdedi }, (_, i) => ({
                karisik: Array.from({ length: s.sozcukAdedi }, (_, j) => `Sözcük${j + 1}`).sort(() => Math.random() - 0.5),
                dogru: Array.from({ length: s.sozcukAdedi }, (_, j) => `Sözcük${j + 1}`),
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" konusunda ${s.cumleAdedi} adet ${s.sozcukAdedi} sözcüklü cümle yaz. ` +
            `Sözcükleri karıştır. Öğrenci doğru sıraya koysun.`,
    },
    {
        id: 'BUYUK_KUCUK_HARF',
        category: 'yazim_noktalama',
        icon: 'fa-font',
        label: 'Büyük/Küçük Harf Kuralları',
        description: 'Özel isimler, cümle başları ve kısaltmalarda büyük harf kuralları.',
        difficulty: 'easy',
        settings: [
            { key: 'kural', label: 'Kural Odağı', type: 'select', defaultValue: 'ozel_isim', options: ['Özel İsimler', 'Cümle Başı', 'Kısaltmalar', 'Hepsi'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        fastGenerate: (s, grade, topic) => ({
            cumleler: Array.from({ length: s.cumleAdedi }, (_, i) =>
                `cümle ${i + 1}: "${topic}" ile ilgili büyük/küçük harf kuralı uygulanacak cümle örneği (tümü küçük yazılmış).`
            ),
            kural: s.kural,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" için ${s.cumleAdedi} cümle yaz. ` +
            `${s.kural} kuralını ihlal eden büyük/küçük harf hataları ekle. Öğrenci düzeltsın.`,
    },
    {
        id: 'METIN_DUZELT',
        category: 'yazim_noktalama',
        icon: 'fa-pen',
        label: 'Metni Kural Uygun Düzelt',
        description: 'Çoklu hatalar içeren metni tüm kurallarla birlikte düzelt.',
        difficulty: 'hard',
        settings: [
            { key: 'hataTuru', label: 'Hata Türü Karışımı', type: 'select', defaultValue: 'karma', options: ['Yalnız Yazım', 'Yalnız Noktalama', 'Karma'] },
            { key: 'paragrafUzunlugu', label: 'Paragraf Uzunluğu', type: 'select', defaultValue: 'orta', options: ['Kısa', 'Orta', 'Uzun'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            metin: `"${topic}" konusunda ${s.paragrafUzunlugu} uzunlukta, ${s.hataTuru} hata içeren düzeltme metni.`,
            hataTuru: s.hataTuru,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf "${topic}" konusunda ${s.paragrafUzunlugu} bir paragraf yaz. ` +
            `İçinde ${s.hataTuru} türde yazım/noktalama hatası ekle. Öğrenci metni düzeltsın.`,
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
            { key: 'analizBoyutu', label: 'Analiz Boyutu', type: 'select', defaultValue: 'hepsi', options: ['Harf & Ses', 'Hece', 'Harf-Ses Farkı', 'Hepsi'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            kelimeler: Array.from({ length: s.kelimeSayisi }, (_, i) => ({
                kelime: `${topic.split(' ')[0]}${i}`,
                analizSutunlari: ['Harf Sayısı', 'Ses Sayısı', 'Hece Sayısı'].slice(0, s.analizBoyutu === 'Hepsi' ? 3 : 2),
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusuna ait ${s.kelimeSayisi} sözcük seç. Her birini ${s.analizBoyutu} boyutunda ` +
            `analiz etmelerini isteyen tablo hazırla. ${grade}. sınıf.`,
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
        fastGenerate: (s, grade, topic) => ({
            kisaltmalar: Array.from({ length: s.kisaltmaSayisi }, (_, i) => ({
                kisaltma: `KSLT${i + 1}`,
                acilimi: `Kısaltma${i + 1} açılımı`,
                cumle: s.cumleIceEkle ? `Bu kısaltmayı "${topic}" konusunda kullanan örnek cümle.` : null,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusuyla ilgili ${s.kisaltmaSayisi} yaygın kısaltma listesi hazırla. ` +
            `${s.cumleIceEkle ? 'Her kısaltmayı cümle içinde kullan ve doğru yazımını göster.' : ''}`,
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
            { key: 'zorlukSeviyesi', label: 'Sözcük Zorluğu', type: 'select', defaultValue: 'orta', options: ['Kolay', 'Orta', 'Zor'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            cumleler: Array.from({ length: s.cumleSayisi }, (_, i) =>
                `Dikte cümlesi ${i + 1}: "${topic}" konusunda ${s.zorlukSeviyesi} düzeyde yazılmış cümle.`
            ),
            ogretmenNotu: 'Öğretmen not alanı: Dikkat çekecek sözcükler ve yazım noktaları.',
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf Türkçe dersi için "${topic}" konusunda ${s.cumleSayisi} cümlelik dikte metni yaz. ` +
            `Sözcük zorluğu: ${s.zorlukSeviyesi}. Öğretmen için ayrıca dikkat edilecek sözcüklerin listesini ekle.`,
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
        fastGenerate: (s, grade, topic) => ({
            kurallar: Array.from({ length: s.kuralSayisi }, (_, i) => ({
                kural: `Yazım Kuralı ${i + 1} (${topic} bağlamında)`,
                dogru: `Doğru kullanım ${i + 1}`,
                yanlis: `Yanlış kullanım ${i + 1}`,
                ornek: s.ornekliMi ? `Örnek cümle ${i + 1}` : null,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusuyla ilgili ${s.kuralSayisi} adet temel yazım kuralı özetle. ` +
            `${s.ornekliMi ? 'Her kural için doğru ve yanlış kullanım ve örnek cümle ver.' : 'Sadece kuralı açıkla.'}`,
    },
];
