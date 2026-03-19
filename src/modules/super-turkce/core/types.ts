<<<<<<< HEAD
import { z } from 'zod';
=======
/**
 * Süper Türkçe Core Type Definitions
 * 
 * MEB müfredat ontolojisi, etkinlik formatları ve premium ayarlar için merkezi tip sistemi.
 */
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060

// ==========================================
// 1. ZORLUK VE KİTLE AYARLARI (Ultra Settings)
// ==========================================

export type DifficultyLevel = 'kolay' | 'orta' | 'zor' | 'lgs';

export type TargetAudience =
    | 'normal'
    | 'hafif_disleksi'
    | 'derin_disleksi';

<<<<<<< HEAD
=======
export type StudentSelectionType = 'manual' | 'existing' | 'blank';

export interface Student {
    id: string;
    name: string;
    grade: GradeLevel;
    className?: string; // Örn: 4-A
}

>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
export interface ActivitySettings {
    difficulty: DifficultyLevel;
    audience: TargetAudience;
    interestArea?: string; // Özelleştirilmiş konu (Örn: Uzay, Dinozorlar)
    wordLimit?: number;    // Üretilecek metin/içerik için kelime sınırı
    avoidLetters?: string[]; // Disleksi için kullanılmaması tercih edilen harfler (Örn: ['b', 'd'])
}

// ==========================================
// 2. MEB KAZANIM (MÜFREDAT) AĞACI
// ==========================================

export type GradeLevel = 4 | 5 | 6 | 7 | 8;

export interface Objective {
    id: string;        // Örn: 'T(4).3.7'
    title: string;     // Örn: 'Kelimelerin zıt ve eş anlamlılarını bulur.'
    description?: string;
<<<<<<< HEAD
=======
    tier2Words?: string[]; // Akademik kelime listesi (Tier-2)
    tier3Words?: string[]; // Alana özgü kelime listesi (Tier-3)
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
}

export interface Unit {
    id: string;        // Örn: 'unit_4_1'
    title: string;     // Örn: 'Okuma (Metin Türleri ve Söz Varlığı)'
    objectives: Objective[];
}

export interface GradeCurriculum {
    grade: GradeLevel;
    units: Unit[];
}

// MEB Kazanımları Sabit Veri Yapısı (Mocked from MEB_TURKCE_PLANI)
<<<<<<< HEAD
=======
// Genişletilmiş Versiyon 2.0 - Tier-2/3 Kelimeleri İçerir
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
export const MEB_CURRICULUM: Record<GradeLevel, GradeCurriculum> = {
    4: {
        grade: 4,
        units: [
            {
                id: 'unit_4_1',
                title: 'Okuma (Metin Türleri ve Söz Varlığı)',
                objectives: [
<<<<<<< HEAD
                    { id: 'T4.1.1', title: 'Kelimelerin zıt ve eş anlamlılarını bulma' },
                    { id: 'T4.1.2', title: 'Gerçek ve mecaz anlamı ayırt etme' },
                    { id: 'T4.1.3', title: 'Metnin ana fikrini/ana duygusunu belirleme' },
=======
                    {
                        id: 'T4.1.1',
                        title: 'Kelimelerin zıt ve eş anlamlılarını bulma',
                        tier2Words: ['anlam', 'eş', 'zıt', 'benzer', 'farklı'],
                        tier3Words: ['eş anlamlı', 'zıt anlamlı', 'anlamdaşı']
                    },
                    {
                        id: 'T4.1.2',
                        title: 'Gerçek ve mecaz anlamı ayırt etme',
                        tier2Words: ['gerçek', 'mecaz', 'anlam', 'yorum', 'bağlam'],
                        tier3Words: ['terim anlam', 'yan anlam']
                    },
                    {
                        id: 'T4.1.3',
                        title: 'Metnin ana fikrini/ana duygusunu belirleme',
                        tier2Words: ['ana fikir', 'duygu', 'konu', 'başlık', 'özet'],
                        tier3Words: ['tema', 'motif']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            },
            {
                id: 'unit_4_2',
                title: 'Yazma ve Noktalama',
                objectives: [
<<<<<<< HEAD
                    { id: 'T4.2.1', title: 'Büyük harflerin ve temel noktalama işaretlerinin doğru kullanımı' },
                    { id: 'T4.2.2', title: 'Kısa yönergelerle hikaye tamamlama' },
=======
                    {
                        id: 'T4.2.1',
                        title: 'Büyük harflerin ve temel noktalama işaretlerinin doğru kullanımı',
                        tier2Words: ['harf', 'işaret', 'cümle', 'kelime', 'başlık'],
                        tier3Words: ['nokta', 'virgül', 'soru işareti', 'ünlem']
                    },
                    {
                        id: 'T4.2.2',
                        title: 'Kısa yönergelerle hikaye tamamlama',
                        tier2Words: ['hikaye', 'olay', 'karakter', 'sonuç', 'gelişme'],
                        tier3Words: ['masal', 'fabl', 'öykü']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            }
        ]
    },
    5: {
        grade: 5,
        units: [
            {
                id: 'unit_5_1',
                title: 'Sözcükte Anlam',
                objectives: [
<<<<<<< HEAD
                    { id: 'T5.1.1', title: 'Eş sesli (sesteş) kelimeleri ayırt etme' },
                    { id: 'T5.1.2', title: 'Deyimler ve atasözlerinin metne kattığı anlamı bulma' },
=======
                    {
                        id: 'T5.1.1',
                        title: 'Eş sesli (sesteş) kelimeleri ayırt etme',
                        tier2Words: ['eş', 'ses', 'anlam', 'fark', 'benzerlik'],
                        tier3Words: ['eş sesli', 'sesteş', 'homofon']
                    },
                    {
                        id: 'T5.1.2',
                        title: 'Deyimler ve atasözlerinin metne kattığı anlamı bulma',
                        tier2Words: ['deyim', 'atasözü', 'anlam', 'mesaj', 'öğüt'],
                        tier3Words: ['kalıplaşmış söz', 'vecize']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            },
            {
                id: 'unit_5_2',
                title: 'Cümlede ve Parçada Anlam',
                objectives: [
<<<<<<< HEAD
                    { id: 'T5.2.1', title: 'Sebep-sonuç, amaç-sonuç ve koşul-sonuç cümleleri kurma' },
                    { id: 'T5.2.2', title: 'Paragrafın yapısını (Giriş, gelişme, sonuç) belirleme' },
=======
                    {
                        id: 'T5.2.1',
                        title: 'Sebep-sonuç, amaç-sonuç ve koşul-sonuç cümleleri kurma',
                        tier2Words: ['sebep', 'sonuç', 'amaç', 'koşul', 'ilişki'],
                        tier3Words: ['nedensellik', 'koşulluluk']
                    },
                    {
                        id: 'T5.2.2',
                        title: 'Paragrafın yapısını (Giriş, gelişme, sonuç) belirleme',
                        tier2Words: ['paragraf', 'giriş', 'gelişme', 'sonuç', 'yapı'],
                        tier3Words: ['gövde', 'ana düşünce', 'yardımcı düşünce']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            }
        ]
    },
    6: {
        grade: 6,
        units: [
            {
                id: 'unit_6_1',
                title: 'Sözcük Türleri (Dil Bilgisi)',
                objectives: [
<<<<<<< HEAD
                    { id: 'T6.1.1', title: 'İsimler (Adlar), Sıfatlar (Ön adlar) ve Zamirleri (Adıllar) metin içinde bulma' },
                    { id: 'T6.1.2', title: 'Edat, Bağlaç ve Ünlem kullanımı' },
=======
                    {
                        id: 'T6.1.1',
                        title: 'İsimler (Adlar), Sıfatlar (Ön adlar) ve Zamirleri (Adıllar) metin içinde bulma',
                        tier2Words: ['isim', 'sıfat', 'zamir', 'tür', 'özellik'],
                        tier3Words: ['ad', 'ön ad', 'adıl', 'işaret zamiri', 'kişi zamiri']
                    },
                    {
                        id: 'T6.1.2',
                        title: 'Edat, Bağlaç ve Ünlem kullanımı',
                        tier2Words: ['edat', 'bağlaç', 'ünlem', 'ilişki', 'bağlantı'],
                        tier3Words: ['ilgeç', 'bağlama sözü', 'ünlem sözü']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            },
            {
                id: 'unit_6_2',
                title: 'Paragraf ve Anlam',
                objectives: [
<<<<<<< HEAD
                    { id: 'T6.2.1', title: 'Öznel ve nesnel yargıları ayırt etme' },
                    { id: 'T6.2.2', title: 'Metnin dil ve anlatım özelliklerini belirleme' },
                    { id: 'T6.2.3', title: 'Sözcükte kök ve ek bilgisi (Yapım ve çekim ekleri)' },
=======
                    {
                        id: 'T6.2.1',
                        title: 'Öznel ve nesnel yargıları ayırt etme',
                        tier2Words: ['öznel', 'nesnel', 'yargı', 'görüş', 'kanıt'],
                        tier3Words: ['subjektif', 'objektif', 'yorum', 'veri']
                    },
                    {
                        id: 'T6.2.2',
                        title: 'Metnin dil ve anlatım özelliklerini belirleme',
                        tier2Words: ['dil', 'anlatım', 'özellik', 'üslup', 'ton'],
                        tier3Words: ['betimleme', 'açıklama', 'tartışma']
                    },
                    {
                        id: 'T6.2.3',
                        title: 'Sözcükte kök ve ek bilgisi (Yapım ve çekim ekleri)',
                        tier2Words: ['kök', 'ek', 'yapı', 'türetme', 'değiştirme'],
                        tier3Words: ['yapım eki', 'çekim eki', 'gövde']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            }
        ]
    },
    7: {
        grade: 7,
        units: [
            {
                id: 'unit_7_1',
                title: 'Fiiller (Eylemler)',
                objectives: [
<<<<<<< HEAD
                    { id: 'T7.1.1', title: 'Fiilde anlam özellikleri (İş, oluş, durum)' },
                    { id: 'T7.1.2', title: 'Fiillerde kip ve kişi' },
                    { id: 'T7.1.3', title: 'Ek fiil ve yapı bakımından fiiller' },
=======
                    {
                        id: 'T7.1.1',
                        title: 'Fiilde anlam özellikleri (İş, oluş, durum)',
                        tier2Words: ['fiil', 'iş', 'oluş', 'durum', 'eylem'],
                        tier3Words: ['kılış', 'oluş', 'durum fiili', 'hareket']
                    },
                    {
                        id: 'T7.1.2',
                        title: 'Fiillerde kip ve kişi',
                        tier2Words: ['kip', 'kişi', 'zaman', 'mod', 'çekim'],
                        tier3Words: ['haber kipi', 'dilek kipi', 'şart', 'emir']
                    },
                    {
                        id: 'T7.1.3',
                        title: 'Ek fiil ve yapı bakımından fiiller',
                        tier2Words: ['ek', 'yapı', 'basit', 'birleşik'],
                        tier3Words: ['ek fiil', 'kurallı fiil', 'birleşik zamanlı']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            },
            {
                id: 'unit_7_2',
                title: 'Söz Sanatları ve Yazım Kuralları',
                objectives: [
<<<<<<< HEAD
                    { id: 'T7.2.1', title: 'Kişileştirme, Konuşturma ve Karşıtlık bulma' },
                    { id: 'T7.2.2', title: 'Bitişik/Ayrı yazılan kelimeler ve kısaltmaların yazımı' },
=======
                    {
                        id: 'T7.2.1',
                        title: 'Kişileştirme, Konuşturma ve Karşıtlık bulma',
                        tier2Words: ['sanat', 'kişileştirme', 'konuşturma', 'karşıtlık', 'etki'],
                        tier3Words: ['teşhis', 'intak', 'tezat']
                    },
                    {
                        id: 'T7.2.2',
                        title: 'Bitişik/Ayrı yazılan kelimeler ve kısaltmaların yazımı',
                        tier2Words: ['bitişik', 'ayrı', 'kısaltma', 'yazım', 'kural'],
                        tier3Words: ['birleşik kelime', 'kısaltma eki']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            }
        ]
    },
    8: {
        grade: 8,
        units: [
            {
                id: 'unit_8_1',
                title: 'Fiilimsiler (Eylemsiler) ve Cümle Ögeleri',
                objectives: [
<<<<<<< HEAD
                    { id: 'T8.1.1', title: 'İsim-fiil, sıfat-fiil ve zarf-fiil ayrımları' },
                    { id: 'T8.1.2', title: 'Cümle ögeleri analizleri (Özne, yüklem, nesne, tümleç)' },
                    { id: 'T8.1.3', title: 'Fiil çatısı (Etken, edilgen)' },
=======
                    {
                        id: 'T8.1.1',
                        title: 'İsim-fiil, sıfat-fiil ve zarf-fiil ayrımları',
                        tier2Words: ['fiilimsi', 'isim', 'sıfat', 'zarf', 'ayrım'],
                        tier3Words: ['mastar', 'ortaç', 'gerund', '-ma/-me', '-an/-en']
                    },
                    {
                        id: 'T8.1.2',
                        title: 'Cümle ögeleri analizleri (Özne, yüklem, nesne, tümleç)',
                        tier2Words: ['cümle', 'özne', 'yüklem', 'nesne', 'tümleç'],
                        tier3Words: ['temel ögeler', 'yardımcı ögeler', 'belirtili nesne', 'dolaylı tümleç']
                    },
                    {
                        id: 'T8.1.3',
                        title: 'Fiil çatısı (Etken, edilgen)',
                        tier2Words: ['çatı', 'etken', 'edilgen', 'dönüşlü'],
                        tier3Words: ['ettirgen', 'oldurgaç', 'işteş']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            },
            {
                id: 'unit_8_2',
                title: 'LGS Odaklı Paragraf ve Mantık Muhakeme',
                objectives: [
<<<<<<< HEAD
                    { id: 'T8.2.1', title: 'Görsel okuma ve infografik yorumlama' },
                    { id: 'T8.2.2', title: 'Sözel mantık ve şifre çözme' },
                    { id: 'T8.2.3', title: 'Çoklu metin analizi ve çıkarım yapma' },
=======
                    {
                        id: 'T8.2.1',
                        title: 'Görsel okuma ve infografik yorumlama',
                        tier2Words: ['görsel', 'grafik', 'tablo', 'yorum', 'analiz'],
                        tier3Words: ['infografik', 'veri görselleştirme']
                    },
                    {
                        id: 'T8.2.2',
                        title: 'Sözel mantık ve şifre çözme',
                        tier2Words: ['mantık', 'akıl yürütme', 'çıkarım', 'şifre', 'çözüm'],
                        tier3Words: ['kıyaslama', 'sıralama', 'eşleştirme']
                    },
                    {
                        id: 'T8.2.3',
                        title: 'Çoklu metin analizi ve çıkarım yapma',
                        tier2Words: ['metin', 'analiz', 'çıkarım', 'karşılaştırma', 'sonuç'],
                        tier3Words: ['metinlerarasılık', 'referans']
                    },
>>>>>>> 37d1d96381135fd8bf93ebaa9b295311cd2c5060
                ]
            }
        ]
    }
};

// ==========================================
// 3. FSD MODÜL SEÇENEKLERİ (ETKİNLİK FORMATLARI)
// ==========================================

export const ACTIVITY_TYPES = [
    'FILL_IN_THE_BLANKS', // Dinamik Boşluk Doldurma
    'MULTIPLE_CHOICE',    // Klasik Çoktan Seçmeli (LGS Optik)
    'MATCH_LINES',        // Sağ-Sol Eşleştirme (Çizgi Çekme)
    'TRUE_FALSE',         // Doğru / Yanlış (D-Y, Gülen Yüz)
    'CIPHER',             // Karışık Harf / Şifre Çözücü
    'GRAMMAR_TREE',       // Tablo ve Kavram Ağacı
    'CREATIVE_WRITING',   // Yaratıcı Yazarlık Yönergeleri
    'COLOR_CODED_TABLE',  // Renk/Şekil Kodlu Tablo
    '5N1K_NEWS',          // 5N1K Haber Tasarımı
    'OPEN_RESPONSE',      // Açık Uçlu (Münazara vs)
    'SUPER_TURKCE_MATCHING' // Eşleştirme Modülü
] as const;

export type ActivityType = string; // V2 mimarisindeki esnek formatları desteklemek için genişletildi.

// Faz 3: Draft (Taslak) Bileşeni
export interface DraftComponent {
    id: string;            // Benzersiz bileşen ID'si (Örn: uuid)
    type: string;          // Eşleştirilen format tipi (Örn: SOZEL_MANTIK_TABLO)
    settings: Record<string, any>; // O formata özel ince ultra ayarlar
    data: any | null;      // AI/Hızlı motordan dönen JSON veri (üretim sonrası dolar)
}

// Ortak Çift Çekirdek (Dual Engine) Seçimi
export type EngineMode = 'fast' | 'ai';

// ==========================================
// 4. POST-PRODUCTION (ARŞİV & KUMBARA) MİMARİSİ (Faz 10)
// ==========================================

export interface ArchiveItem {
    id: string; // Benzersiz arşiv no
    createdAt: number; // Üretim tarihi timestamp
    grade: GradeLevel;
    objectiveTitle: string;
    engineMode: EngineMode;
    totalActivities: number;
    drafts: DraftComponent[]; // Üretilmiş ve PDF'e basılmış o anki halleri
}

export interface VocabularyItem {
    id: string;
    word: string;
    meaning?: string;
    discoveredAt: number; // Kelimenin kumbaraya eklendiği tarih
    contextSource?: string; // Hangi metin/kazanım formatından geldiği
}
