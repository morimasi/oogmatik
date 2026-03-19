import { z } from 'zod';

// ==========================================
// 1. ZORLUK VE KİTLE AYARLARI (Ultra Settings)
// ==========================================

export type DifficultyLevel = 'kolay' | 'orta' | 'zor' | 'lgs';

export type TargetAudience =
    | 'normal'
    | 'hafif_disleksi'
    | 'derin_disleksi';

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
export const MEB_CURRICULUM: Record<GradeLevel, GradeCurriculum> = {
    4: {
        grade: 4,
        units: [
            {
                id: 'unit_4_1',
                title: 'Okuma (Metin Türleri ve Söz Varlığı)',
                objectives: [
                    { id: 'T4.1.1', title: 'Kelimelerin zıt ve eş anlamlılarını bulma' },
                    { id: 'T4.1.2', title: 'Gerçek ve mecaz anlamı ayırt etme' },
                    { id: 'T4.1.3', title: 'Metnin ana fikrini/ana duygusunu belirleme' },
                ]
            },
            {
                id: 'unit_4_2',
                title: 'Yazma ve Noktalama',
                objectives: [
                    { id: 'T4.2.1', title: 'Büyük harflerin ve temel noktalama işaretlerinin doğru kullanımı' },
                    { id: 'T4.2.2', title: 'Kısa yönergelerle hikaye tamamlama' },
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
                    { id: 'T5.1.1', title: 'Eş sesli (sesteş) kelimeleri ayırt etme' },
                    { id: 'T5.1.2', title: 'Deyimler ve atasözlerinin metne kattığı anlamı bulma' },
                ]
            },
            {
                id: 'unit_5_2',
                title: 'Cümlede ve Parçada Anlam',
                objectives: [
                    { id: 'T5.2.1', title: 'Sebep-sonuç, amaç-sonuç ve koşul-sonuç cümleleri kurma' },
                    { id: 'T5.2.2', title: 'Paragrafın yapısını (Giriş, gelişme, sonuç) belirleme' },
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
                    { id: 'T6.1.1', title: 'İsimler (Adlar), Sıfatlar (Ön adlar) ve Zamirleri (Adıllar) metin içinde bulma' },
                    { id: 'T6.1.2', title: 'Edat, Bağlaç ve Ünlem kullanımı' },
                ]
            },
            {
                id: 'unit_6_2',
                title: 'Paragraf ve Anlam',
                objectives: [
                    { id: 'T6.2.1', title: 'Öznel ve nesnel yargıları ayırt etme' },
                    { id: 'T6.2.2', title: 'Metnin dil ve anlatım özelliklerini belirleme' },
                    { id: 'T6.2.3', title: 'Sözcükte kök ve ek bilgisi (Yapım ve çekim ekleri)' },
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
                    { id: 'T7.1.1', title: 'Fiilde anlam özellikleri (İş, oluş, durum)' },
                    { id: 'T7.1.2', title: 'Fiillerde kip ve kişi' },
                    { id: 'T7.1.3', title: 'Ek fiil ve yapı bakımından fiiller' },
                ]
            },
            {
                id: 'unit_7_2',
                title: 'Söz Sanatları ve Yazım Kuralları',
                objectives: [
                    { id: 'T7.2.1', title: 'Kişileştirme, Konuşturma ve Karşıtlık bulma' },
                    { id: 'T7.2.2', title: 'Bitişik/Ayrı yazılan kelimeler ve kısaltmaların yazımı' },
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
                    { id: 'T8.1.1', title: 'İsim-fiil, sıfat-fiil ve zarf-fiil ayrımları' },
                    { id: 'T8.1.2', title: 'Cümle ögeleri analizleri (Özne, yüklem, nesne, tümleç)' },
                    { id: 'T8.1.3', title: 'Fiil çatısı (Etken, edilgen)' },
                ]
            },
            {
                id: 'unit_8_2',
                title: 'LGS Odaklı Paragraf ve Mantık Muhakeme',
                objectives: [
                    { id: 'T8.2.1', title: 'Görsel okuma ve infografik yorumlama' },
                    { id: 'T8.2.2', title: 'Sözel mantık ve şifre çözme' },
                    { id: 'T8.2.3', title: 'Çoklu metin analizi ve çıkarım yapma' },
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
