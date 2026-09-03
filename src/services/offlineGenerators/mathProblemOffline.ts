/**
 * MatProblemStudyosu — Offline Matematik Problemi Üreticisi (v2 — Sema-Free)
 *
 * Gemini 2.5 Flash erişilemediğinde (timeout, kotası bitti, offline, vb.)
 * MEB 2024-2025 müfredatına uygun 1-8. sınıf **tamamen metin tabanlı**
 * problemler üretir. Şema/görsel yok — tüm problemler sözel senaryolardır.
 *
 * Her sınıf için ≥3 şablon vardır; şablonlar zorluk ve kategori çeşitliliği
 * gözetir. Soru metinleri kendi kendine yeterlidir; "yukarıdaki tabloya
 * bakınız" gibi bir görsele atıf içermez.
 *
 * Uzman değerlendirmesi (4 lider ajan):
 *  - Elif Yıldız (Pedagoji): Metin-tabanlı problemler bilişsel yükü azaltır
 *    ve öğrenciyi kendi zihinsel modelini kurmaya teşvik eder.
 *  - Dr. Ahmet Kaya (Klinik/MEB): Her problem MEB kazanım kodu ve açıklaması
 *    içerir. Tanı koyucu dil yoktur, KVKK tam uyumludur.
 *  - Bora Demir (Mühendislik): `any` kullanılmaz; strict TS, AppError standardı.
 *  - Selin Arslan (AI): Sema seçim taksonomisi kaldırıldı; AI üretimi sadeleşti.
 */

import type {
    MatProblem,
    MatProblemAyarlari,
    MatProblemCevapAnahtari,
    MatProblemSeti,
} from '../../types/matProblem';

// ─── Şablon Tipi ──────────────────────────────────────────────
type OfflineSablon = Omit<MatProblem, 'id' | 'kazanimKodu' | 'sinif' | 'kategori' | 'puan' | 'tahminiSure'> & {
    /** Kazanım kodu (M.x.y.z.z) */
    kazanimKodu: string;
    /** Sınıf seviyesi (1-8) */
    sinif: number;
};

// ─── 1. Sınıf Şablonları ──────────────────────────────────────
const SABLON_1: OfflineSablon[] = [
    {
        soruMetni:
            'Sınıfımızda 5 kırmızı, 3 mavi ve 7 sarı top vardır. Sınıftaki toplam top sayısı kaçtır?',
        verilenler: ['Kırmızı top: 5', 'Mavi top: 3', 'Sarı top: 7'],
        istenenler: 'Toplam top sayısı',
        cozumAdimlari: [
            '1. Adım: Tüm topları topla → 5 + 3 + 7',
            '2. Adım: 5 + 3 = 8',
            '3. Adım: 8 + 7 = 15',
        ],
        dogruCevap: '15 top',
        gercekYasamBaglantisi: 'Sınıf içi nesne sayımı ve toplama işlemi.',
        zorluk: 'Kolay',
        kazanimMetni: 'Doğal sayılarla toplama işlemi yapar (20 ye kadar).',
        kazanimKodu: 'M.1.1.1.1',
        sinif: 1,
    },
    {
        soruMetni:
            '5 arkadaş elma, 3 arkadaş armut, 6 arkadaş muz yemiştir. En çok ve en az yenen meyve hangisidir?',
        verilenler: ['Elma yiyen: 5', 'Armut yiyen: 3', 'Muz yiyen: 6'],
        istenenler: 'En çok ve en az yenen meyve',
        cozumAdimlari: [
            '1. Adım: Sayıları karşılaştır',
            '2. Adım: En büyük sayıyı bul → 6 (muz)',
            '3. Adım: En küçük sayıyı bul → 3 (armut)',
        ],
        dogruCevap: 'En çok muz, en az armut',
        gercekYasamBaglantisi: 'Sayıları karşılaştırma ve sıralama.',
        zorluk: 'Kolay',
        kazanimMetni: 'Doğal sayıları büyüklük-küçüklük yönünden karşılaştırır.',
        kazanimKodu: 'M.1.1.1.4',
        sinif: 1,
    },
    {
        soruMetni:
            'Bir çiftlikte 12 tavuk ve 8 ördek vardır. Tavuk ve ördeklerin toplam ayak sayısı kaçtır? (Tavuk ve ördek: 2 ayak)',
        verilenler: ['Tavuk: 12', 'Ördek: 8', 'Her hayvan: 2 ayak'],
        istenenler: 'Toplam ayak sayısı',
        cozumAdimlari: [
            '1. Adım: Toplam hayvan = 12 + 8 = 20',
            '2. Adım: 20 × 2 = 40 ayak',
        ],
        dogruCevap: '40 ayak',
        gercekYasamBaglantisi: 'Çarpma ve toplama ilişkisi, günlük hayat hesabı.',
        zorluk: 'Orta',
        kazanimMetni: 'Doğal sayılarla çarpma işlemini kavrar.',
        kazanimKodu: 'M.1.1.2.2',
        sinif: 1,
    },
];

// ─── 2. Sınıf Şablonları ──────────────────────────────────────
const SABLON_2: OfflineSablon[] = [
    {
        soruMetni:
            'Bir sınıfta öğrencilerin en sevdiği meyveler sayılmıştır: 8 öğrenci elma, 5 öğrenci armut, 10 öğrenci çilek, 7 öğrenci muz seçmiştir. Toplam öğrenci sayısı kaçtır?',
        verilenler: ['Elma: 8', 'Armut: 5', 'Çilek: 10', 'Muz: 7'],
        istenenler: 'Toplam öğrenci sayısı',
        cozumAdimlari: [
            '1. Adım: 8 + 5 = 13',
            '2. Adım: 13 + 10 = 23',
            '3. Adım: 23 + 7 = 30',
        ],
        dogruCevap: '30 öğrenci',
        gercekYasamBaglantisi: 'Veri toplama ve toplama işlemi.',
        zorluk: 'Kolay',
        kazanimMetni: 'Sıklık tablosu ve çetele tablosu oluşturur.',
        kazanimKodu: 'M.2.4.1.1',
        sinif: 2,
    },
    {
        soruMetni:
            'Bir kütüphanede 45 kitap vardır. Öğrenciler 18 kitabı ödünç aldı. Kütüphanede kaç kitap kaldı?',
        verilenler: ['Toplam kitap: 45', 'Ödünç alınan: 18'],
        istenenler: 'Kalan kitap sayısı',
        cozumAdimlari: ['1. Adım: 45 - 18 = 27'],
        dogruCevap: '27 kitap',
        gercekYasamBaglantisi: 'Çıkarma işlemiyle günlük problem çözme.',
        zorluk: 'Kolay',
        kazanimMetni: 'Doğal sayılarla çıkarma işlemi yapar (100 e kadar).',
        kazanimKodu: 'M.2.1.2.1',
        sinif: 2,
    },
    {
        soruMetni:
            'Bir bütün çikolatanın 2/4 ü Ahmet e, 1/4 ü Ayşe ye verilmiştir. Geriye kaç parça kalmıştır?',
        verilenler: ['Ahmet: 2/4', 'Ayşe: 1/4'],
        istenenler: 'Kalan kesir miktarı',
        cozumAdimlari: [
            '1. Adım: Verilen kesirler = 2/4 + 1/4 = 3/4',
            '2. Adım: Kalan = 4/4 - 3/4 = 1/4',
        ],
        dogruCevap: '1/4',
        gercekYasamBaglantisi: 'Kesirlerle günlük paylaşım problemleri.',
        zorluk: 'Orta',
        kazanimMetni: 'Bütün, yarım, çeyrek modelleriyle kesirleri karşılaştırır.',
        kazanimKodu: 'M.2.3.1.1',
        sinif: 2,
    },
    {
        soruMetni:
            'Bir çiftçi 5 sıra, her sırada 12 ağaç olmak üzere elma ağacı dikti. Toplam kaç ağaç dikilmiştir?',
        verilenler: ['Sıra sayısı: 5', 'Her sıradaki ağaç: 12'],
        istenenler: 'Toplam ağaç sayısı',
        cozumAdimlari: ['1. Adım: 5 × 12 = 60 ağaç'],
        dogruCevap: '60 ağaç',
        gercekYasamBaglantisi: 'Çarpma ile tekrarlı toplama.',
        zorluk: 'Kolay',
        kazanimMetni: 'Çarpma işlemini tekrarlı toplama olarak modeller.',
        kazanimKodu: 'M.2.1.3.1',
        sinif: 2,
    },
];

// ─── 3. Sınıf Şablonları ──────────────────────────────────────
const SABLON_3: OfflineSablon[] = [
    {
        soruMetni:
            'Bir okulun 3 günde okuttuğu kitap sayıları şöyledir: Pazartesi 25, Salı 40, Çarşamba 15 kitap. En çok ve en az okutulan günler arasındaki fark kaçtır?',
        verilenler: ['Pazartesi: 25 kitap', 'Salı: 40 kitap', 'Çarşamba: 15 kitap'],
        istenenler: 'En çok ile en az arasındaki fark',
        cozumAdimlari: [
            '1. Adım: En çok = 40 (Salı)',
            '2. Adım: En az = 15 (Çarşamba)',
            '3. Adım: Fark = 40 - 15 = 25',
        ],
        dogruCevap: '25 kitap',
        gercekYasamBaglantisi: 'Sayıları karşılaştırma ve çıkarma.',
        zorluk: 'Orta',
        kazanimMetni: 'Veri yorumlama ve çıkarma işlemi.',
        kazanimKodu: 'M.3.4.1.1',
        sinif: 3,
    },
    {
        soruMetni:
            'Bir saat 03:00 ü gösterdiğinde akrep ve yelkovan arasındaki küçük açı kaç derecedir?',
        verilenler: ['Saat: 03:00'],
        istenenler: 'Akrep-yelkovan arasındaki açı',
        cozumAdimlari: [
            '1. Adım: 03:00 te akrep 3 üzerinde, yelkovan 12 üzerindedir',
            '2. Adım: Aralarında 3 saat dilimi = 3 × 30° = 90°',
        ],
        dogruCevap: '90° (dik açı)',
        gercekYasamBaglantisi: 'Saat okuma ve açı hesabı.',
        zorluk: 'Orta',
        kazanimMetni: 'Tam ve yarım saatleri okur, açı kavramıyla ilişkilendirir.',
        kazanimKodu: 'M.3.3.1.1',
        sinif: 3,
    },
    {
        soruMetni:
            '14 sayısından geriye 5 er 5 er sayıldığında ulaşılan sayıyı bulunuz.',
        verilenler: ['Başlangıç: 14', 'Adım: -5'],
        istenenler: 'Ulaşılan sayı',
        cozumAdimlari: [
            '1. Adım: 14 - 5 = 9',
            '2. Adım: 9 - 5 = 4',
        ],
        dogruCevap: '4',
        gercekYasamBaglantisi: 'Geriye doğru sayma.',
        zorluk: 'Kolay',
        kazanimMetni: 'Doğal sayılarla çıkarma işlemi yapar.',
        kazanimKodu: 'M.3.1.1.2',
        sinif: 3,
    },
    {
        soruMetni:
            'Bir terazide sol kefede 3 kg + 2 kg, sağ kefede bilinmeyen x kütlesi vardır. Denge durumuna göre x kaç kg dır?',
        verilenler: ['Sol: 3 + 2 kg', 'Sağ: x'],
        istenenler: 'Bilinmeyen x',
        cozumAdimlari: ['1. Adım: 3 + 2 = 5', '2. Adım: Denge → x = 5 kg'],
        dogruCevap: '5 kg',
        gercekYasamBaglantisi: 'Denklem ve denge kavramı.',
        zorluk: 'Orta',
        kazanimMetni: 'Bilinmeyenli denklemleri somut modellerle çözer.',
        kazanimKodu: 'M.3.2.1.1',
        sinif: 3,
    },
];

// ─── 4. Sınıf Şablonları ──────────────────────────────────────
const SABLON_4: OfflineSablon[] = [
    {
        soruMetni:
            'Bir sınıfta kız ve erkek öğrenci sayıları verilmiştir. Kız öğrencilerin sayısı 24, erkek öğrencilerin sayısı 20 dir. Sınıf mevcudu kaçtır?',
        verilenler: ['Kız: 24', 'Erkek: 20'],
        istenenler: 'Sınıf mevcudu',
        cozumAdimlari: ['1. Adım: 24 + 20 = 44'],
        dogruCevap: '44 öğrenci',
        gercekYasamBaglantisi: 'Toplama ve büyük sayılar.',
        zorluk: 'Orta',
        kazanimMetni: 'Doğal sayılarla toplama ve çıkarma işlemi yapar.',
        kazanimKodu: 'M.4.1.1.1',
        sinif: 4,
    },
    {
        soruMetni:
            'Bir dikdörtgenin uzun kenarı 18 cm, kısa kenarı 9 cm dir. Dikdörtgenin alanı ve çevresi kaçtır?',
        verilenler: ['Uzun kenar: 18 cm', 'Kısa kenar: 9 cm'],
        istenenler: 'Alan ve çevre',
        cozumAdimlari: [
            '1. Adım: Alan = 18 × 9 = 162 cm²',
            '2. Adım: Çevre = 2 × (18 + 9) = 54 cm',
        ],
        dogruCevap: 'Alan = 162 cm², Çevre = 54 cm',
        gercekYasamBaglantisi: 'Geometrik şekillerin günlük kullanımı.',
        zorluk: 'Orta',
        kazanimMetni: 'Dikdörtgenin alan ve çevresini hesaplar.',
        kazanimKodu: 'M.4.3.1.2',
        sinif: 4,
    },
    {
        soruMetni:
            '3/5 i kırmızıya boyanmış bir şeridin tamamı kaç eşit parçaya bölünmüştür?',
        verilenler: ['Boyalı kesir: 3/5'],
        istenenler: 'Toplam parça sayısı',
        cozumAdimlari: [
            '1. Adım: Payda = 5',
            '2. Adım: Toplam parça = 5',
        ],
        dogruCevap: '5 parça',
        gercekYasamBaglantisi: 'Kesir ve payda kavramı.',
        zorluk: 'Kolay',
        kazanimMetni: 'Basit kesirleri anlamlandırır.',
        kazanimKodu: 'M.4.3.1.1',
        sinif: 4,
    },
];

// ─── 5. Sınıf Şablonları ──────────────────────────────────────
const SABLON_5: OfflineSablon[] = [
    {
        soruMetni:
            'Bir markette haftalık satılan ekmek sayıları şöyledir: Pazartesi 80, Salı 95, Çarşamba 70, Perşembe 110, Cuma 120, Cumartesi 150, Pazar 90 ekmek. Ortalama günde kaç ekmek satılmıştır? (7 gün)',
        verilenler: [
            'Pzt: 80', 'Sal: 95', 'Çar: 70', 'Per: 110',
            'Cum: 120', 'Cmt: 150', 'Paz: 90',
        ],
        istenenler: 'Ortalama günlük ekmek satışı',
        cozumAdimlari: [
            '1. Adım: Toplam = 80+95+70+110+120+150+90 = 715',
            '2. Adım: Ortalama = 715 ÷ 7 = 102,14',
        ],
        dogruCevap: 'Yaklaşık 102 ekmek/gün',
        gercekYasamBaglantisi: 'Aritmetik ortalama ve yorumlama.',
        zorluk: 'Zor',
        kazanimMetni: 'Aritmetik ortalamayı hesaplar ve yorumlar.',
        kazanimKodu: 'M.5.4.1.2',
        sinif: 5,
    },
    {
        soruMetni:
            'Bir paralelkenarın tabanı 12 cm, yüksekliği 7 cm dir. Alanı kaç cm² dir?',
        verilenler: ['Taban: 12 cm', 'Yükseklik: 7 cm'],
        istenenler: 'Paralelkenar alanı',
        cozumAdimlari: ['1. Adım: Alan = taban × yükseklik = 12 × 7 = 84'],
        dogruCevap: '84 cm²',
        gercekYasamBaglantisi: 'Geometrik alan hesabı.',
        zorluk: 'Orta',
        kazanimMetni: 'Paralelkenarın alanını hesaplar.',
        kazanimKodu: 'M.5.3.1.2',
        sinif: 5,
    },
    {
        soruMetni:
            '3 kg elma 24 TL, 5 kg portakal 35 TL dir. Hangi meyvenin kilosu daha ucuzdur?',
        verilenler: ['3 kg elma = 24 TL', '5 kg portakal = 35 TL'],
        istenenler: 'Daha ucuz meyve',
        cozumAdimlari: [
            '1. Adım: Elma = 24 ÷ 3 = 8 TL/kg',
            '2. Adım: Portakal = 35 ÷ 5 = 7 TL/kg',
            '3. Adım: 7 < 8 → portakal daha ucuz',
        ],
        dogruCevap: 'Portakal (7 TL/kg)',
        gercekYasamBaglantisi: 'Bölme ile birim fiyat karşılaştırma.',
        zorluk: 'Orta',
        kazanimMetni: 'Bölme işlemiyle birim fiyat hesaplar.',
        kazanimKodu: 'M.5.1.2.3',
        sinif: 5,
    },
];

// ─── 6. Sınıf Şablonları ──────────────────────────────────────
const SABLON_6: OfflineSablon[] = [
    {
        soruMetni:
            'Bir sınıfın spor tercihleri yüzde olarak şöyledir: Futbol %40, Basketbol %25, Voleybol %20, Diğer %15. Sınıfta 40 öğrenci olduğuna göre her sporu seçen kaç öğrenci vardır?',
        verilenler: ['Futbol %40', 'Basketbol %25', 'Voleybol %20', 'Diğer %15', 'Toplam: 40'],
        istenenler: 'Her kategorideki öğrenci sayısı',
        cozumAdimlari: [
            '1. Adım: Futbol = 40 × 0,40 = 16',
            '2. Adım: Basketbol = 40 × 0,25 = 10',
            '3. Adım: Voleybol = 40 × 0,20 = 8',
            '4. Adım: Diğer = 40 × 0,15 = 6',
        ],
        dogruCevap: 'Futbol 16, Basketbol 10, Voleybol 8, Diğer 6',
        gercekYasamBaglantisi: 'Yüzde hesabı ve veri yorumlama.',
        zorluk: 'Zor',
        kazanimMetni: 'Yüzde hesaplamaları yapar.',
        kazanimKodu: 'M.6.2.1.1',
        sinif: 6,
    },
    {
        soruMetni:
            'Koordinat düzleminde A(2, 4) ve B(6, 4) noktaları verilmiştir. [AB] doğru parçasının uzunluğu kaç birimdir?',
        verilenler: ['A(2, 4)', 'B(6, 4)'],
        istenenler: '[AB] doğru parçasının uzunluğu',
        cozumAdimlari: [
            '1. Adım: Aynı y de → yatay mesafe',
            '2. Adım: |6 - 2| = 4 birim',
        ],
        dogruCevap: '4 birim',
        gercekYasamBaglantisi: 'Koordinat düzlemi ve uzaklık hesabı.',
        zorluk: 'Orta',
        kazanimMetni: 'Koordinat düzleminde iki nokta arası uzaklığı hesaplar.',
        kazanimKodu: 'M.6.3.1.2',
        sinif: 6,
    },
    {
        soruMetni:
            'Bir havuz 6 m uzunluğunda, 4 m genişliğinde ve 2 m derinliğindedir. Havuzun hacmi kaç m³ tür?',
        verilenler: ['Uzunluk: 6 m', 'Genişlik: 4 m', 'Derinlik: 2 m'],
        istenenler: 'Havuz hacmi',
        cozumAdimlari: ['1. Adım: V = 6 × 4 × 2 = 48 m³'],
        dogruCevap: '48 m³',
        gercekYasamBaglantisi: 'Dikdörtgenler prizması hacmi.',
        zorluk: 'Orta',
        kazanimMetni: 'Dikdörtgenler prizmasının hacmini hesaplar.',
        kazanimKodu: 'M.6.3.2.1',
        sinif: 6,
    },
];

// ─── 7. Sınıf Şablonları ──────────────────────────────────────
const SABLON_7: OfflineSablon[] = [
    {
        soruMetni:
            'Bir terazide sol kefede 2x + 3, sağ kefede 11 bulunmaktadır. Denge durumuna göre x kaçtır?',
        verilenler: ['Sol: 2x + 3', 'Sağ: 11'],
        istenenler: 'x değeri',
        cozumAdimlari: [
            '1. Adım: 2x + 3 = 11',
            '2. Adım: 2x = 8',
            '3. Adım: x = 4',
        ],
        dogruCevap: 'x = 4',
        gercekYasamBaglantisi: 'Birinci dereceden bir bilinmeyenli denklem çözme.',
        zorluk: 'Orta',
        kazanimMetni: 'Birinci dereceden bir bilinmeyenli denklem çözer.',
        kazanimKodu: 'M.7.2.1.1',
        sinif: 7,
    },
    {
        soruMetni:
            'İki paralel doğru d₁ // d₂ ve bunları kesen bir k transversal verilmiştir. Kese nin oluşturduğu açılardan biri 65° ise, yöndeş açı da kaç derecedir?',
        verilenler: ['d₁ // d₂', 'Verilen açı: 65°'],
        istenenler: 'Yöndeş açı',
        cozumAdimlari: [
            '1. Adım: Paralel doğrularda yöndeş açılar eşittir',
            '2. Adım: Yöndeş açı = 65°',
        ],
        dogruCevap: '65°',
        gercekYasamBaglantisi: 'Paralel doğrular ve açılar.',
        zorluk: 'Orta',
        kazanimMetni: 'Paralel iki doğrunun bir kesenle yaptığı açıları ilişkilendirir.',
        kazanimKodu: 'M.7.3.1.2',
        sinif: 7,
    },
    {
        soruMetni:
            'İki sayının EBOB u 6, EKOK u 72 dir. Sayılardan biri 24 ise diğeri kaçtır?',
        verilenler: ['EBOB: 6', 'EKOK: 72', 'Birinci sayı: 24'],
        istenenler: 'İkinci sayı',
        cozumAdimlari: [
            '1. Adım: a × b = EBOB × EKOK',
            '2. Adım: 24 × b = 6 × 72 = 432',
            '3. Adım: b = 432 ÷ 24 = 18',
        ],
        dogruCevap: '18',
        gercekYasamBaglantisi: 'EBOB-EKOK ilişkisi ve uygulamaları.',
        zorluk: 'Zor',
        kazanimMetni: 'EBOB ve EKOK arasındaki ilişkiyi açıklar.',
        kazanimKodu: 'M.7.1.2.2',
        sinif: 7,
    },
];

// ─── 8. Sınıf Şablonları (LGS) ────────────────────────────────
const SABLON_8: OfflineSablon[] = [
    {
        soruMetni:
            'Bir dik üçgende dik kenarlardan biri 9 cm, diğeri 12 cm dir. Hipotenüs kaç cm dir?',
        verilenler: ['a = 9 cm', 'b = 12 cm'],
        istenenler: 'c (hipotenüs)',
        cozumAdimlari: [
            '1. Adım: c² = a² + b² = 81 + 144 = 225',
            '2. Adım: c = √225 = 15',
        ],
        dogruCevap: '15 cm',
        gercekYasamBaglantisi: 'Pisagor bağıntısı, günlük hayat uygulamaları.',
        zorluk: 'Orta',
        kazanimMetni: 'Pisagor bağıntısını uygular.',
        kazanimKodu: 'M.8.3.1.1',
        sinif: 8,
    },
    {
        soruMetni:
            'Bir silindirin taban yarıçapı 5 cm, yüksekliği 12 cm dir. Silindirin hacmi kaç cm³ tür? (π ≈ 3,14)',
        verilenler: ['r = 5 cm', 'h = 12 cm', 'π ≈ 3,14'],
        istenenler: 'Silindir hacmi',
        cozumAdimlari: [
            '1. Adım: Taban alanı = π × r² = 3,14 × 25 = 78,5',
            '2. Adım: Hacim = 78,5 × 12 = 942',
        ],
        dogruCevap: '942 cm³',
        gercekYasamBaglantisi: 'Silindir hacmi, mühendislik ve günlük ölçüm.',
        zorluk: 'Zor',
        kazanimMetni: 'Dik dairesel silindirin hacmini hesaplar.',
        kazanimKodu: 'M.8.3.2.2',
        sinif: 8,
    },
    {
        soruMetni:
            '√20 sayısının yaklaşık değerini tahmin ediniz.',
        verilenler: ['√20 = ?'],
        istenenler: '√20 yaklaşık değeri',
        cozumAdimlari: [
            '1. Adım: 4² = 16, 5² = 25 → √20, 4 ile 5 arasında',
            '2. Adım: 4,5² = 20,25 → √20 ≈ 4,47',
        ],
        dogruCevap: '4 < √20 < 5, yaklaşık 4,47',
        gercekYasamBaglantisi: 'Karekök kavramı ve sayı doğrusu.',
        zorluk: 'Orta',
        kazanimMetni: 'Tam kare olmayan karekökleri tahmin eder.',
        kazanimKodu: 'M.8.1.1.2',
        sinif: 8,
    },
    {
        soruMetni:
            '(x + 3)² ifadesinin açılımı nedir?',
        verilenler: ['İfade: (x + 3)²'],
        istenenler: '(x + 3)² açılımı',
        cozumAdimlari: [
            '1. Adım: (x + 3)² = x² + 2·x·3 + 3²',
            '2. Adım: = x² + 6x + 9',
        ],
        dogruCevap: 'x² + 6x + 9',
        gercekYasamBaglantisi: 'Cebirsel özdeşlikler ve geometri.',
        zorluk: 'Zor',
        kazanimMetni: 'Tam kare özdeşliğini açıklar.',
        kazanimKodu: 'M.8.2.1.2',
        sinif: 8,
    },
];

// ─── Sınıf Eşlemesi ───────────────────────────────────────────
const SINIF_SABLONLARI: Record<number, OfflineSablon[]> = {
    1: SABLON_1,
    2: SABLON_2,
    3: SABLON_3,
    4: SABLON_4,
    5: SABLON_5,
    6: SABLON_6,
    7: SABLON_7,
    8: SABLON_8,
};

// ─── Yardımcı: Pseudo-random seçim (deterministik) ────────────
const pickSablon = (sinif: number, index: number): OfflineSablon | null => {
    const liste = SINIF_SABLONLARI[sinif] || SINIF_SABLONLARI[5];
    if (liste.length === 0) return null;
    return liste[index % liste.length];
};

// ─── Ana Üretim Fonksiyonu ────────────────────────────────────
export const generateOfflineMatProblemSeti = (settings: MatProblemAyarlari): MatProblemSeti => {
    const sinif = settings.sinif ?? 5;
    const sayi = Math.max(1, Math.min(20, settings.problemSayisi ?? 5));

    const problemler: MatProblem[] = [];
    for (let i = 0; i < sayi; i++) {
        const sablon = pickSablon(sinif, i);
        if (!sablon) continue;

        // Aynı soruyu tekrar üretmemek için index bazlı kaydırma + rastgele zorluk
        const zorlukRotasyonu: ('Kolay' | 'Orta' | 'Zor')[] = ['Kolay', 'Orta', 'Zor'];
        const zorluk = zorlukRotasyonu[(i + Math.floor((sinif + i) / 3)) % 3];

        problemler.push({
            ...sablon,
            id: `mat-offline-${sinif}-${i}-${Date.now()}`,
            sinif,
            kategori: settings.kategori || 'gercek-yasam',
            puan: 10,
            tahminiSure: 120,
            // Kullanıcı zorluk seçtiyse onu kullan, yoksa rotasyon
            zorluk: settings.zorlukSeviyesi && settings.zorlukSeviyesi !== 'Otomatik'
                ? (settings.zorlukSeviyesi as 'Kolay' | 'Orta' | 'Zor')
                : zorluk,
        });
    }

    const toplamPuan = problemler.reduce((sum, p) => sum + p.puan, 0);
    const toplamSure = problemler.reduce((sum, p) => sum + p.tahminiSure, 0);

    const cevapAnahtari: MatProblemCevapAnahtari = {
        problemler: problemler.map((p, index) => ({
            problemNo: index + 1,
            dogruCevap: p.dogruCevap,
            puan: p.puan,
            kazanimKodu: p.kazanimKodu,
            cozumAdimlari: p.cozumAdimlari,
            gercekYasamBaglantisi: p.gercekYasamBaglantisi,
            seviye: p.zorluk,
        })),
    };

    return {
        id: `mat-problem-seti-offline-${Date.now()}`,
        baslik: `${sinif}. Sınıf Matematik Problemleri (Çevrimdışı)`,
        sinif,
        secilenKazanimlar: settings.secilenKazanimlar,
        problemler,
        toplamPuan,
        tahminiSure: toplamSure,
        olusturmaTarihi: new Date().toISOString(),
        olusturanKullanici: 'Offline Generator',
        cevapAnahtari,
        dizgiAyarlari: {
            fontAilesi: 'Lexend',
            fontBoyutu: '11pt',
            kenarBoslugu: 'orta',
            sutunDuzeni: 'tek',
            metinHizalama: 'left',
            satirAraligi: 'normal',
        },
    };
};
