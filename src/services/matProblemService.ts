/**
 * MatProblemStudyosu — Ana Servis
 * Tamamen bağımsız modül — mevcut matSinavService.ts'ye dokunmaz
 * Problem üretimi, offline fallback ve yardımcı fonksiyonlar
 */

import type {
    MatProblemAyarlari,
    MatProblemSeti,
    MatProblem,
    MatProblemCevapAnahtari,
} from '../types/matProblem';
import { generateMathProblems } from './generators/mathProblemGenerator';

// ─── Offline Fallback Problemleri ─────────────────────────────
const createOfflineProblem = (id: number, sinif: number): MatProblem => {
    const sablonlar = [
        {
            soruMetni: 'Ayşe market alışverişinde kilosu 18 TL olan domatesin 3 kg\'ını ve kilosu 12 TL olan salatalığın 2 kg\'ını almıştır. Ayşe kasaya toplam kaç TL ödeyecektir?',
            verilenler: ['Domates kilosu: 18 TL', 'Alınan domates: 3 kg', 'Salatalık kilosu: 12 TL', 'Alınan salatalık: 2 kg'],
            istenenler: 'Toplam ödenecek tutar',
            cozumAdimlari: ['1. Adım: Domates tutarı = 18 × 3 = 54 TL', '2. Adım: Salatalık tutarı = 12 × 2 = 24 TL', '3. Adım: Toplam = 54 + 24 = 78 TL'],
            dogruCevap: '78 TL',
            gercekYasamBaglantisi: 'Markette alışveriş yaparken toplam ücret hesaplama becerisi kazandırır.',
            zorluk: 'Kolay' as const,
        },
        {
            soruMetni: 'Bir bahçenin uzun kenarı 15 m, kısa kenarı 8 m\'dir. Bahçenin etrafına tel çit çekilecektir. Kaç metre tel gereklidir?',
            verilenler: ['Uzun kenar: 15 m', 'Kısa kenar: 8 m'],
            istenenler: 'Bahçenin çevresi (gereken tel uzunluğu)',
            cozumAdimlari: ['1. Adım: Çevre = 2 × (uzun kenar + kısa kenar)', '2. Adım: Çevre = 2 × (15 + 8) = 2 × 23 = 46 m'],
            dogruCevap: '46 m',
            gercekYasamBaglantisi: 'Bahçe çevre hesabı, günlük hayatta çit ve bordür yapımında kullanılır.',
            zorluk: 'Orta' as const,
        },
        {
            soruMetni: 'Bir otobüs durağı A noktasından B noktasına 45 dakikada, B noktasından C noktasına 1 saat 15 dakikada ulaşmaktadır. A noktasından saat 08:30\'da kalkan otobüs, C noktasına saat kaçta varır?',
            verilenler: ['A→B süresi: 45 dakika', 'B→C süresi: 1 saat 15 dakika', 'Kalkış saati: 08:30'],
            istenenler: 'C noktasına varış saati',
            cozumAdimlari: ['1. Adım: Toplam süre = 45 dk + 1 sa 15 dk = 2 saat', '2. Adım: Varış saati = 08:30 + 2 saat = 10:30'],
            dogruCevap: '10:30',
            gercekYasamBaglantisi: 'Toplu taşımada saat ve zaman hesabı yapma becerisi kazandırır.',
            zorluk: 'Orta' as const,
        },
        {
            soruMetni: 'Bir sınıfta 36 öğrenci vardır. Öğrencilerin 1/4\'ü basketbol, 1/3\'ü futbol, kalanı da voleybol oynamaktadır. Voleybol oynayan kaç öğrenci vardır?',
            verilenler: ['Toplam öğrenci: 36', 'Basketbol: 1/4', 'Futbol: 1/3'],
            istenenler: 'Voleybol oynayan öğrenci sayısı',
            cozumAdimlari: ['1. Adım: Basketbol = 36 × 1/4 = 9', '2. Adım: Futbol = 36 × 1/3 = 12', '3. Adım: Voleybol = 36 - 9 - 12 = 15'],
            dogruCevap: '15 öğrenci',
            gercekYasamBaglantisi: 'Kesir ve toplam ilişkisini günlük yaşamda kullanma becerisi kazandırır.',
            zorluk: 'Zor' as const,
        },
        {
            soruMetni: 'Emre, harçlığının 2/5\'ini kitap, 1/4\'ünü defter almak için harcamıştır. Kalan 14 TL\'si bir cüzdan aldıktan sonra elinde yalnızca 2 TL kalmıştır. Cüzdan kaç TL\'dir?',
            verilenler: ['Harcanan: 2/5 kitap, 1/4 defter', 'Kalan sonrası elde: 2 TL', 'Cüzdan aldıktan sonra: 2 TL'],
            istenenler: 'Cüzdanın fiyatı',
            cozumAdimlari: ['1. Adım: Harcanan kesir = 2/5 + 1/4 = 8/20 + 5/20 = 13/20', '2. Adım: Kalan kesir = 7/20', '3. Adım: 7/20 × Toplam = 14 TL → Toplam = 40 TL', '4. Adım: Cüzdan = 14 - 2 = 12 TL'],
            dogruCevap: '12 TL',
            gercekYasamBaglantisi: 'Harçlık yönetimi ve bütçe planlama becerisi kazandırır.',
            zorluk: 'Zor' as const,
        },
    ];

    const sablon = sablonlar[id % sablonlar.length];
    return {
        id: `problem-offline-${id}`,
        ...sablon,
        kazanimKodu: `M.${sinif}.1.${(id % 3) + 1}`,
        sinif,
        semaTipi: 'yok' as const,
        kategori: 'gercek-yasam' as const,
        puan: 10,
        tahminiSure: 120,
    };
};

const createOfflineProblemSeti = (settings: MatProblemAyarlari): MatProblemSeti => {
    const sinif = settings.sinif ?? 5;
    const sayi = settings.problemSayisi ?? 5;

    const problemler: MatProblem[] = [];
    for (let i = 0; i < sayi; i++) {
        problemler.push(createOfflineProblem(i, sinif));
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
        id: `problem-seti-offline-${Date.now()}`,
        baslik: `${sinif}. Sınıf Matematik Problemleri`,
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

// ─── Müfredat Helper Fonksiyonu ──────────────────────────────────
export const getMatMufredatBySinif = (sinif: number) => {
    return {
        sinif,
        uniteler: [
            {
                id: `unite-${sinif}-1`,
                baslik: `${sinif}. Sınıf 1. Ünite: Sayılar ve İşlemler`,
                ogrenmeAlani: 'sayilar-islemler' as const,
                kazanimlar: [
                    { kod: `M.${sinif}.1.1.1`, tanim: 'Doğal sayılarla dört işlem problemlerini çözer.' },
                    { kod: `M.${sinif}.1.1.2`, tanim: 'Kesirlerle toplama ve çıkarma işlemlerini içeren problemleri çözer.' },
                    { kod: `M.${sinif}.1.1.3`, tanim: 'Ondalık gösterimlerle ilgili gerçek yaşam problemlerini çözer.' },
                ],
            },
            {
                id: `unite-${sinif}-2`,
                baslik: `${sinif}. Sınıf 2. Ünite: Geometri ve Ölçme`,
                ogrenmeAlani: 'geometri' as const,
                kazanimlar: [
                    { kod: `M.${sinif}.2.1.1`, tanim: 'Çevre ve alan hesaplama gerektiren problemleri çözer.' },
                    { kod: `M.${sinif}.2.1.2`, tanim: 'Zaman ve para ölçme birimleriyle ilgili gerçek yaşam senaryolarını analiz eder.' },
                ],
            },
        ],
    };
};

// ─── Ana Üretim Fonksiyonu (AI + Offline Fallback) ────────────
export const generateMatProblemSeti = async (settings: MatProblemAyarlari): Promise<MatProblemSeti> => {
    try {
        return await generateMathProblems(settings);
    } catch (error: unknown) {
        console.warn('Gemini API başarısız, fallback olarak offline problemler kullanılıyor:', error);
        return createOfflineProblemSeti(settings);
    }
};
