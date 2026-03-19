// =============================================================================
// MANTIK MUHAKEME & PARAGRAF — 10 Format Tanımı
// =============================================================================

import { ActivityFormatDef } from '../../../core/types/activity-formats';

export const mantikMuhakemeFormats: ActivityFormatDef[] = [
    {
        id: 'SOZEL_MANTIK_TABLO',
        category: 'mantik_muhakeme',
        icon: 'fa-table',
        label: 'Sözel Mantık (Tablolu)',
        description: 'Kişi-özellik eşleştirme tablosu mantık sorusu.',
        difficulty: 'hard',
        settings: [
            { key: 'degiskenSayisi', label: 'Değişken Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 },
            { key: 'kisiSayisi', label: 'Kişi Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { kisiler: { type: "ARRAY", items: { type: "STRING" } }, degiskenler: { type: "ARRAY", items: { type: "STRING" } }, ipuclari: { type: "ARRAY", items: { type: "STRING" } } }, required: ["kisiler", "degiskenler", "ipuclari"] },
        fastGenerate: (s, grade, topic) => ({
            kisiler: ["Ali", "Ayşe", "Mehmet", "Elif"].slice(0, s.kisiSayisi),
            degiskenler: ["Mavi", "Kırmızı", "Sarı", "Yeşil"].slice(0, s.degiskenSayisi),
            ipuclari: [
                "Ali kırmızı rengi sevmemektedir.",
                "Eşyası sarı olan kişi Ayşe değildir.",
                "Mehmet ve Elif'ten biri yeşil, diğeri mavi eşyaya sahiptir.",
                "Ali'nin eşyası en sağdaki dolaptadır (Sarı)."
            ],
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf öğrencisi için "Premium" Sözel Mantık bulmacası hazırla. \n` +
            `Bulmacada ${s.kisiSayisi} kişi ve ${s.degiskenSayisi} değişken olsun. \n` +
            `İpuçları birbirine bağlı bir 'Mantık Zinciri' (Logical Chain) oluşturmalı. (Örn: Ali'nin gittiği yer Ayşe'nin yanındaki yerdir...) \n` +
            `Kesin bir tablo sonucuna ulaşılabilecek ${s.kisiSayisi + 1} adet tutarlı ve çelişki içermeyen profesyonel ipucu yaz.`,
    },
    {
        id: 'SEBEP_SONUC_ESLESTIR',
        category: 'mantik_muhakeme',
        icon: 'fa-link',
        label: 'Sebep-Sonuç Eşleştirme',
        description: 'Sebepler ve sonuçlar birbirinden bağımsız çizgileri ile eşleştirilir.',
        difficulty: 'medium',
        settings: [
            { key: 'cifSayisi', label: 'Sebep-Sonuç Çifti', type: 'range', defaultValue: 4, min: 3, max: 6 },
            { key: 'zorluk', label: 'Zorluk', type: 'select', defaultValue: 'Orta', options: ['Kolay', 'Orta', 'Zor'] },
        ],
        schema: { type: "OBJECT", properties: { left: { type: "ARRAY", items: { type: "STRING" } }, right: { type: "ARRAY", items: { type: "STRING" } } }, required: ["left", "right"] },
        fastGenerate: (s, grade, topic) => ({
            left: [
                "Kar yağdığı için",
                "Çok kitap okuduğu için",
                "Dişlerini fırçalamadığı için",
                "Geç kalktığı için"
            ],
            right: [
                "Oyun oynayamadı.",
                "Kelimeleri daha iyi anladı.",
                "Dişi çürüdü.",
                "Okula geç kaldı."
            ].sort(() => Math.random() - 0.5),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisinin mantık yürüterek eşleştirebileceği ${s.cifSayisi} adet sebep-sonuç cümlesi yaz. \n` +
            `Konu "${topic}" ile ilgili veya genel yaşam becerileri üzerine olabilir. \n` +
            `Sol tarafa sebepler (nedenler), sağ tarafa karmaşık sırada sonuçlar gelsin.`,
    },
    {
        id: 'PARAGRAF_MANTIK_TEST',
        category: 'mantik_muhakeme',
        icon: 'fa-list-check',
        label: 'Yeni Nesil LGS Mantık Testi',
        description: 'Paragrafı okuyup mantık zinciri soruları çözülür.',
        difficulty: 'lgs',
        settings: [
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 4, min: 3, max: 6 },
            { key: 'gorselEkle', label: 'Görsel/Grafik Ekle', type: 'toggle', defaultValue: false },
        ],
        schema: { type: "OBJECT", properties: { paragraf: { type: "STRING" }, sorular: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, options: { type: "ARRAY", items: { type: "STRING" } } }, required: ["soru", "options"] } } }, required: ["paragraf", "sorular"] },
        fastGenerate: (s, grade, topic) => ({
            paragraf: `"${topic}" konusunu işleyen, çıkarım, değerlendirme ve eleştirel düşünme becerilerini ölçen ${grade}. sınıf LGS tarzı paragraf.`,
            sorular: Array.from({ length: s.soruSayisi }, (_, i) => ({
                soru: `Paragraf ${i + 1}. Sorusu (${topic})`,
                options: ['A) İlk seçenek', 'B) İkinci seçenek', 'C) Üçüncü seçenek', 'D) Dördüncü seçenek'],
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf LGS/PISA standartlarında "Beceri Temelli" bir soru seti hazırla. \n` +
            `Metin ${topic} temasında veya MEB 2025 güncel temalarından (örn: Yapay Zeka, Ekoloji) biri olsun. \n` +
            `Soru sadece metni anlamayı değil, metindeki verileri tabloya dökme veya tablodaki veriyi yorumlama becerisini ölçmeli. \n` +
            `${s.gorselEkle ? 'Sorunun yanına profesyonel bir grafik veya infografik (taslak metni) ekle.' : ''}`,
    },
    {
        id: 'MANTIKSIZLIGI_BUL',
        category: 'mantik_muhakeme',
        icon: 'fa-magnifying-glass-xmark',
        label: 'Mantıksız Cümleyi Bul',
        description: 'Verilen cümle grubundan anlam ve mantık tutarsızlığı olanı bul.',
        difficulty: 'medium',
        settings: [
            { key: 'hataYeri', label: 'Hata Türü', type: 'select', defaultValue: 'Gizli İncelikli Hata', options: ['Açık Hata', 'Gizli İncelikli Hata'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 5, min: 4, max: 7 },
        ],
        schema: { type: "OBJECT", properties: { cumleler: { type: "ARRAY", items: { type: "STRING" } }, hataYeri: { type: "NUMBER" } }, required: ["cumleler", "hataYeri"] },
        fastGenerate: (s, grade, topic) => ({
            cumleler: [
                "Güneşli bir nisan sabahı kuşlar cıvıldayarak uyandı.",
                "Ali pencereyi açıp derin bir nefes aldı.",
                "Dışarıdaki karın erimesini izlerken sıcağın tadını çıkardı.",
                "Üzerine kalın kazağını giyip ince tişörtüyle bahçeye fırladı.",
                "Arkadaşlarıyla dondurma yemek için sözleşmişti."
            ],
            hataYeri: 3,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf düzeyi için MEB temalı (örn: Milli Kültür) bir metin yaz. \n` +
            `Metnin içine gizlenmiş, metnin genel mantığıyla çelişen veya zaman/mekan/özellik uyuşmazlığı olan bir 'Mantıksızlık' yerleştir. \n` +
            `Hata seviyesi ${s.hataYeri} olsun. (LGS hazırlık için daha incelikli hatalar tercih et).`,
    },
    {
        id: 'KODLAMA_SIFRE',
        category: 'mantik_muhakeme',
        icon: 'fa-key',
        label: 'Şifreli Metin Çözümü',
        description: 'Harf-sayı veya sembol şifresiyle kodlanan metni çöz.',
        difficulty: 'hard',
        settings: [
            { key: 'algoritma', label: 'Şifreleme Algoritması', type: 'select', defaultValue: 'Caesar (+3)', options: ['Caesar (+1)', 'Ayna Yansıma', 'Sayı-Harf'] },
            { key: 'kelimeAdedi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        schema: { type: "OBJECT", properties: { sifre: { type: "STRING" }, ipucu: { type: "STRING" }, cevap: { type: "STRING" } }, required: ["sifre", "ipucu", "cevap"] },
        fastGenerate: (s, grade, topic) => ({
            sifre: "L-İ-B-B-P",
            ipucu: "Harfleri alfabede bir önceki harfe dönüştür (+1 kaydırma mantığı).",
            cevap: "KİTAP",
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf öğrencisi için "${topic}" temasında geçebilecek ${s.kelimeAdedi} kelimelik kısa bir mesaj seç. \n` +
            `Bu mesajı ${s.algoritma} algoritmasıyla şifrele. \n` +
            `Öğrencinin şifreyi çözebilmesi için net bir ipucu ve örnek göster. JSON: 'sifre', 'ipucu', 'cevap'.`,
    },
    {
        id: 'GORSEL_OKUMA',
        category: 'mantik_muhakeme',
        icon: 'fa-image',
        label: 'Görsel & İnfografik Yorumlama',
        description: 'Tablo, grafik veya infografik okuma ve soru çözme.',
        difficulty: 'medium',
        settings: [
            { key: 'gorselTuru', label: 'Görsel Türü', type: 'select', defaultValue: 'Sütun Grafik', options: ['Çizgi Grafik', 'Pasta Grafik', 'Sütun Grafik', 'Bilgi Kutusu'] },
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 },
        ],
        schema: { type: "OBJECT", properties: { gorselAciklamasi: { type: "STRING" }, sorular: { type: "ARRAY", items: { type: "STRING" } } }, required: ["gorselAciklamasi", "sorular"] },
        fastGenerate: (s, grade, topic) => ({
            gorselAciklamasi: `Bir okulun kütüphanesinden en çok ödünç alınan kitap türlerini gösteren ${s.gorselTuru}. (Hikaye: 45, Şiir: 12, Roman: 30, Bilim: 25)`,
            sorular: [
                "Kütüphaneden en çok hangi tür kitap ödünç alınmıştır?",
                "Şiir kitapları, Bilim kitaplarından ne kadar az tercih edilmiştir?",
                "Okulun genel okuma alışkanlığı hakkında ne söylenebilir?"
            ].slice(0, s.soruSayisi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 8}. sınıf LGS görsel okuma standartlarında, "${topic}" veya MEB temalı karmaşık veri setleri (örn: illerin kütüphane kullanım oranları) kurgula. \n` +
            `İnfografiğin içeriğini detaylıca açıkla. Sorular 'Verilen grafikten aşağıdakilerin hangisine ulaşılamaz?' veya 'Hangi iki veri arasında doğrudan ilişki vardır?' tarzında analiz odaklı olmalı.`,
    },
    {
        id: 'HIKAYE_TAMAMLAMA',
        category: 'mantik_muhakeme',
        icon: 'fa-pen',
        label: 'Yarım Kalan Mantığı Tamamla',
        description: 'Hikâyenin mantık zincirine uygun son cümleyi veya olayı seç.',
        difficulty: 'medium',
        settings: [
            { key: 'format', label: 'Tamamlama Formatı', type: 'select', defaultValue: 'Çoktan Seçmeli', options: ['Çoktan Seçmeli', 'Açık Uçlu Yazma'] },
            { key: 'cumleAdedi', label: 'Hikâye Uzunluğu (Cümle)', type: 'range', defaultValue: 4, min: 3, max: 6 },
        ],
        schema: { type: "OBJECT", properties: { hikaye: { type: "STRING" }, sorular: { type: "ARRAY", items: { type: "STRING" } }, acikUclu: { type: "BOOLEAN" } }, required: ["hikaye", "sorular", "acikUclu"] },
        fastGenerate: (s, grade, topic) => ({
            hikaye: `Ali çok susamıştı. Mutfaktaki masanın üzerinde duran bardağa elini uzattı. Tam içecekken bardağın içinden tuhaf bir ışıltı yükseldiğini fark etti. Merakla eğilip içine baktığında...`,
            sorular: s.format === 'Çoktan Seçmeli'
                ? ["A) Bir perinin ona gülümsediğini gördü.", "B) Bardağın içindeki suyun birden donduğunu gördü.", "C) Bardağın kırılıp yere düştüğünü anladı.", "D) Susuzluğunun geçtiğini hissetti."]
                : [],
            acikUclu: s.format !== 'Çoktan Seçmeli',
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade || 5}. sınıf için MEB temasında sürükleyici bir 'Mantık Akışı' hikayesi yaz. \n` +
            `Hikaye bir problem/gizem içersin ve tam çözüm noktasında kesilsin. \n` +
            `Seçenekler öğrencinin elindeki verileri (ipuçlarını) kullanarak bulabileceği tek bir mantıklı sonuca odaklanmalı.`,
    },
    {
        id: 'YONERGE_TAKIBI',
        category: 'mantik_muhakeme',
        icon: 'fa-map-location',
        label: 'Yönlendirme Takibi',
        description: 'Verilen yönlendirme adımlarını takip ederek hedefe ulaş.',
        difficulty: 'easy',
        settings: [
            { key: 'adimSayisi', label: 'Yönlendirme Adımı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'labirent', label: 'Labirent / Harita Ekle', type: 'toggle', defaultValue: false },
        ],
        schema: { type: "OBJECT", properties: { yonlendirmeler: { type: "ARRAY", items: { type: "STRING" } }, alanTuru: { type: "STRING" } }, required: ["yonlendirmeler", "alanTuru"] },
        fastGenerate: (s, grade, topic) => ({
            yonlendirmeler: Array.from({ length: s.adimSayisi }, (_, i) =>
                `Adım ${i + 1}: "${topic}" ile ilgili yönlendirme talimatı.`
            ),
            alanTuru: s.labirent ? 'labirent' : 'grid',
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.adimSayisi} adımlık yönlendirme yaz. ` +
            `${s.labirent ? 'Basit bir labirent haritası ekle.' : 'Öğrenci adımları sırayla uygulasın.'}`,
    },
    {
        id: 'KAVRAM_HARITASI',
        category: 'mantik_muhakeme',
        icon: 'fa-diagram-project',
        label: 'Kavram Haritası Doldurma',
        description: 'Boş bırakılan kavram haritasını mantık zinciriyle doldur.',
        difficulty: 'medium',
        settings: [
            { key: 'dugumSayisi', label: 'Düğüm Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
            { key: 'merkez', label: 'Merkez Kavram', type: 'select', defaultValue: 'konu_basligi', options: ['Konu Başlığı', 'Temel Kavram', 'Ana Karakter'] },
        ],
        schema: { type: "OBJECT", properties: { merkez: { type: "STRING" }, dallar: { type: "ARRAY", items: { type: "OBJECT", properties: { dal: { type: "STRING" }, bos: { type: "BOOLEAN" } }, required: ["dal", "bos"] } } }, required: ["merkez", "dallar"] },
        fastGenerate: (s, grade, topic) => ({
            merkez: s.merkez === 'Konu Başlığı' ? topic : `${topic} Ana Kavramı`,
            dallar: Array.from({ length: s.dugumSayisi }, (_, i) => ({ dal: `Alt Kavram ${i + 1}`, bos: i % 2 === 0 })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusunu merkeze alan ${s.dugumSayisi} düğümlü bir kavram haritası oluştur. ` +
            `Bazı düğümleri boş bırak. ${grade}. sınıf öğrencisi boşlukları doldursun.`,
    },
    {
        id: 'BILMECELI_DUSUNME',
        category: 'mantik_muhakeme',
        icon: 'fa-question',
        label: 'Bilmeceli Mantık Yürütme',
        description: 'Bilmece formatıyla muhakeme becerisi geliştirilir.',
        difficulty: 'easy',
        settings: [
            { key: 'bilmeceAdedi', label: 'Bilmece Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 },
            { key: 'kategori', label: 'Bilmece Kategorisi', type: 'select', defaultValue: 'Doğa', options: ['Doğa', 'Teknoloji', 'Günlük Hayat', 'Türkçe Dil'] },
        ],
        schema: { type: "OBJECT", properties: { bilmeceler: { type: "ARRAY", items: { type: "OBJECT", properties: { soru: { type: "STRING" }, cevap: { type: "STRING" } }, required: ["soru", "cevap"] } } }, required: ["bilmeceler"] },
        fastGenerate: (s, grade, topic) => ({
            bilmeceler: [
                { soru: "Ben giderim o gider, arkamdan tık tık eder.", cevap: "Baston" },
                { soru: "Ağzı var dili yok, nefesi var canı yok.", cevap: "Flüt / Kaval" },
                { soru: "Şehirleri var evi yok, dağları var ağacı yok.", cevap: "Harita" }
            ].slice(0, s.bilmeceAdedi),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf seviyesinde, "${topic}" temasını çağrıştıran veya ${s.kategori} kategorisinden ${s.bilmeceAdedi} adet klasik/modern bilmece yaz. \n` +
            `Bilmeceler öğrencinin kavramsal düşünme becerisini zorlamamalı ama keyifli bir muhakeme sunmalıdır.`,
    },
];
