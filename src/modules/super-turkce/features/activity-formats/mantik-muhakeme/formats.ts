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
        fastGenerate: (s, grade, topic) => ({
            kisiler: Array.from({ length: s.kisiSayisi }, (_, i) => `Kişi ${i + 1}`),
            degiskenler: Array.from({ length: s.degiskenSayisi }, (_, i) => `Özellik ${i + 1} (${topic} ile ilgili)`),
            ipuclari: [`İpucu 1: ${topic} bağlamında bilgi.`, `İpucu 2: Olumsuz çıkarım.`],
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" temalı sözel mantık sorusu hazırla. ` +
            `${s.kisiSayisi} kişi ve ${s.degiskenSayisi} farklı özellik olsun. İpuçlarından tablo doldurulsun.`,
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
            { key: 'zorluk', label: 'Zorluk', type: 'select', defaultValue: 'orta', options: ['Kolay', 'Orta', 'Zor'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            left: Array.from({ length: s.cifSayisi }, (_, i) => `Sebep ${i + 1}: ${topic} konusunda neden.`),
            right: Array.from({ length: s.cifSayisi }, (_, i) => `Sonuç ${i + 1}: Bunun ardından olan.`).sort(() => Math.random() - 0.5),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusunda ${s.cifSayisi} adet sebep-sonuç çifti yaz. Zorluk: ${s.zorluk}. ` +
            `Öğrenci çizgi çekerek eşleştirsin. ${grade}. sınıf düzeyi.`,
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
        fastGenerate: (s, grade, topic) => ({
            paragraf: `"${topic}" konusunu işleyen, çıkarım, değerlendirme ve eleştirel düşünme becerilerini ölçen ${grade}. sınıf LGS tarzı paragraf.`,
            sorular: Array.from({ length: s.soruSayisi }, (_, i) => ({
                soru: `Paragraf ${i + 1}. Sorusu (${topic})`,
                options: ['A) İlk seçenek', 'B) İkinci seçenek', 'C) Üçüncü seçenek', 'D) Dördüncü seçenek'],
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf LGS tarzında "${topic}" konusunda bir paragraf ve ` +
            `${s.soruSayisi} adet çıkarım/mantık sorusu yaz. ${s.gorselEkle ? 'Bir görsel veya grafik öner.' : ''}`,
    },
    {
        id: 'MANTIKSIZLIGI_BUL',
        category: 'mantik_muhakeme',
        icon: 'fa-magnifying-glass-xmark',
        label: 'Mantıksız Cümleyi Bul',
        description: 'Verilen cümle grubundan anlam ve mantık tutarsızlığı olanı bul.',
        difficulty: 'medium',
        settings: [
            { key: 'hataYeri', label: 'Hata Türü', type: 'select', defaultValue: 'gizli', options: ['Açık Hata', 'Gizli İncelikli Hata'] },
            { key: 'cumleAdedi', label: 'Cümle Adedi', type: 'range', defaultValue: 5, min: 4, max: 7 },
        ],
        fastGenerate: (s, grade, topic) => ({
            cumleler: Array.from({ length: s.cumleAdedi }, (_, i) =>
                i === 2 ? `Bu cümle "${topic}" mantığına AYKIRI bir ifade içermektedir.` :
                    `Bu cümle "${topic}" konusunda doğru ve tutarlı bir bilgi vermektedir.`
            ),
            hataYeri: 2,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" konusunda ${s.cumleAdedi} cümlelik bir paragraf yaz. ` +
            `Cümlelerin birinde ${s.hataYeri === 'Açık Hata' ? 'belirgin' : 'ince ve gizli'} bir mantık hatası olsun. ` +
            `${grade}. sınıf öğrencisi mantıksız olanı bulsun.`,
    },
    {
        id: 'KODLAMA_SIFRE',
        category: 'mantik_muhakeme',
        icon: 'fa-key',
        label: 'Şifreli Metin Çözümü',
        description: 'Harf-sayı veya sembol şifresiyle kodlanan metni çöz.',
        difficulty: 'hard',
        settings: [
            { key: 'algoritma', label: 'Şifreleme Algoritması', type: 'select', defaultValue: 'ceasar', options: ['Caesar (+3)', 'Ayna Yansıma', 'Sayı-Harf'] },
            { key: 'kelimeAdedi', label: 'Kelime Sayısı', type: 'range', defaultValue: 5, min: 3, max: 8 },
        ],
        fastGenerate: (s, grade, topic) => ({
            sifre: `Şifrelenmiş metin: [${Array.from({ length: s.kelimeAdedi || 5 }, (_, i) => `SFRE${i}`).join('-')}]`,
            ipucu: `Algoritma: ${s.algoritma}. "${topic}" konusuyla ilgili gizli mesaj.`,
            cevap: `Çözüm: "${topic}" konusundaki gizli mesaj burada yazardı.`,
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.kelimeAdedi} kelimelik bir mesaj oluştur. ` +
            `Bu mesajı ${s.algoritma} algoritmasıyla şifrele. Öğrenci şifreyi çözsün.`,
    },
    {
        id: 'GORSEL_OKUMA',
        category: 'mantik_muhakeme',
        icon: 'fa-image',
        label: 'Görsel & İnfografik Yorumlama',
        description: 'Tablo, grafik veya infografik okuma ve soru çözme.',
        difficulty: 'medium',
        settings: [
            { key: 'gorselTuru', label: 'Görsel Türü', type: 'select', defaultValue: 'cizgi_grafik', options: ['Çizgi Grafik', 'Pasta Grafik', 'Sütun Grafik', 'Bilgi Kutusu'] },
            { key: 'soruSayisi', label: 'Soru Sayısı', type: 'range', defaultValue: 3, min: 2, max: 5 },
        ],
        fastGenerate: (s, grade, topic) => ({
            gorselAciklamasi: `${s.gorselTuru} türünde "${topic}" verilerini gösteren görsel (PDF'e çizim alanı bırakılır).`,
            sorular: Array.from({ length: s.soruSayisi }, (_, i) => `Soru ${i + 1}: Görselden çıkarılabilecek bilgi hangisidir?`),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `"${topic}" hakkında ${grade}. sınıf için ${s.gorselTuru} verileri oluştur. ` +
            `Bu verilerden ${s.soruSayisi} adet yorum sorusu hazırla.`,
    },
    {
        id: 'HIKAYE_TAMAMLAMA',
        category: 'mantik_muhakeme',
        icon: 'fa-pen',
        label: 'Yarım Kalan Mantığı Tamamla',
        description: 'Hikâyenin mantık zincirine uygun son cümleyi veya olayı seç.',
        difficulty: 'medium',
        settings: [
            { key: 'format', label: 'Tamamlama Formatı', type: 'select', defaultValue: 'coktan_secmeli', options: ['Çoktan Seçmeli', 'Açık Uçlu Yazma'] },
            { key: 'cumleAdedi', label: 'Hikâye Uzunluğu (Cümle)', type: 'range', defaultValue: 4, min: 3, max: 6 },
        ],
        fastGenerate: (s, grade, topic) => ({
            hikaye: Array.from({ length: s.cumleAdedi }, (_, i) => `Hikâye cümlesi ${i + 1}: "${topic}" bağlamında.`).join(' ') + ' ???',
            sorular: s.format === 'Çoktan Seçmeli'
                ? ['A) Mantıksal son', 'B) Mantıksız son', 'C) Konu dışı son', 'D) Tutarsız son']
                : [],  // null yerine boş dizi — PDF renderer null kabul etmiyor
            acikUclu: s.format !== 'Çoktan Seçmeli',
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusunda ${s.cumleAdedi} cümlelik yarım bir hikâye yaz. ` +
            `Son olayı ${s.format === 'Çoktan Seçmeli' ? '4 şıklı çoktan seçmeli soru olarak' : 'açık uçlu yazma ödevi olarak'} sor.`,
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
            { key: 'kategori', label: 'Bilmece Kategorisi', type: 'select', defaultValue: 'doga', options: ['Doğa', 'Teknoloji', 'Günlük Hayat', 'Türkçe Dil'] },
        ],
        fastGenerate: (s, grade, topic) => ({
            bilmeceler: Array.from({ length: s.bilmeceAdedi }, (_, i) => ({
                soru: `Bilmece ${i + 1}: "${topic}" bağlamında ${s.kategori} kategorisinde ipuçları verilen bilmece.`,
                cevap: `Cevap ${i + 1}`,
            })),
        }),
        buildAiPrompt: (s, grade, topic) =>
            `${grade}. sınıf için "${topic}" konusuyla bağlantılı, ${s.kategori} kategorisinde ` +
            `${s.bilmeceAdedi} adet bilmece yaz. Her bilmeceye cevap ver.`,
    },
];
