import { KelimeCumleActivityType, KelimeCumleDifficulty } from '../../types/kelimeCumle';
import { AgeGroup } from '../../types/creativeStudio';

export interface KelimeCumleSourceEntry {
    id: string;
    type: KelimeCumleActivityType;
    ageGroup: AgeGroup;
    difficulty: KelimeCumleDifficulty;
    title: string;
    items: any[];
}

export const KELIME_CUMLE_SOURCES: Record<KelimeCumleActivityType, KelimeCumleSourceEntry[]> = {
    bosluk_doldurma: [
        {
            id: 'bd-1',
            type: 'bosluk_doldurma',
            ageGroup: '5-7',
            difficulty: 'Başlangıç',
            title: 'Cümleleri Tamamlayalım',
            items: [
                { sentence: "Bugün hava çok ……… ..", answer: "soğuk" },
                { sentence: "Atatürk 1881 yılında Selanik’te ……… .", answer: "doğdu" },
                { sentence: "Eren sınıfın camını …………", answer: "kırdı" },
                { sentence: "Emre hasta ………… ..", answer: "oldu" },
                { sentence: "Annem pazardan armut …………", answer: "aldı" },
                { sentence: "Emine denizde …………… ..", answer: "yüzüyor" },
                { sentence: "Burcu dişlerini …………", answer: "fırçaladı" },
                { sentence: "Arzu akşam televizyon ……………", answer: "seyretti" },
                { sentence: "Çocuklar bahçede top …………", answer: "oynadı" },
                { sentence: "Hasan sabah saat 7.30’ da …… ...", answer: "uyandı" }
            ]
        },
        {
            id: 'bd-2',
            type: 'bosluk_doldurma',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Boşlukları Doldurma',
            items: [
                { sentence: "Ufuk okuldan eve gelince çok …………… .", answer: "çalıştı" },
                { sentence: "Meral yemekten önce ……… .. ellerini yıkadı.", answer: "önce" },
                { sentence: "Arı …………… yapar.", answer: "bal" },
                { sentence: "Küçük kedi ………… .. içti.", answer: "süt" },
                { sentence: "…….……… ot yiyor.", answer: "Koyunlar" },
                { sentence: "…………… .. uçak kullanıyor.", answer: "Pilot" },
                { sentence: "Osman …………… . ile balık tutuyor.", answer: "olta" },
                { sentence: "Tavuklar ve horoz ………………… .. yiyor.", answer: "yem" },
                { sentence: "………… mevsimi çok soğuk.", answer: "Kış" },
                { sentence: "Öğrenciler bayramda sınıfta ……… ... astı..", answer: "bayrak" }
            ]
        }
    ],
    test: [
        {
            id: 'test-1',
            type: 'test',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Çoktan Seçmeli Etkinlik',
            items: [
                { question: "İbrahim fırından …… simit aldı.", options: ["yaşlı", "taze", "spor", "hasta"], answer: "taze" },
                { question: "Dedem tarlaya ….. ekti..", options: ["yorgan", "şimşek", "balık", "buğday"], answer: "buğday" },
                { question: "Dün akşam … kar ……. yağı.", options: ["fiş", "tişört", "defter", "kar"], answer: "kar" },
                { question: "Hatice kümesteki ……. yem verdi.", options: ["yoğurtlara", "kazaklara", "aslanlara", "horozlara"], answer: "horozlara" },
                { question: "Dayım ağaçları ………… ile kesti..", options: ["kilit", "şişe", "makas", "balta"], answer: "balta" },
                { question: "Mustafa bavula ………… koydu.", options: ["halı", "elbise", "soba", "ahtapot"], answer: "elbise" },
                { question: "Arabanın …….. bitti.", options: ["benzini", "çadırı", "kömürü", "örtüsü"], answer: "benzini" },
                { question: "Banyodan sonra ………… giydim.", options: ["cımbız", "perde", "kilim", "bornoz"], answer: "bornoz" }
            ]
        }
    ],
    kelime_tamamlama: [
        {
            id: 'kt-1',
            type: 'kelime_tamamlama',
            ageGroup: '5-7',
            difficulty: 'Başlangıç',
            title: 'Eksik Harfleri Tamamlayalım',
            items: [
                { word: "Sil gi………", fullWord: "Silgi", clue: "Silmeye yarayan ders aracı" },
                { word: "i ………… ..", fullWord: "İnek", clue: "Süt veren hayvan" },
                { word: "Ho ………", fullWord: "Horoz", clue: "Kümeste yaşar" },
                { word: "Ha ……… ..", fullWord: "Halı", clue: "Evde yere sereriz." },
                { word: "Göz ……… .", fullWord: "Gözlük", clue: "Gözümüze takarız." },
                { word: "Ga ………… .", fullWord: "Gazete", clue: "Okuruz." },
                { word: "Ek ………… .", fullWord: "Ekmek", clue: "Yemekte yeriz." },
                { word: "Do ……… .", fullWord: "Domuz", clue: "Bir hayvan" },
                { word: "Çor ………", fullWord: "Çorba", clue: "Yemekte içeriz." },
                { word: "Çi ………… .", fullWord: "Çilek", clue: "Bir meyve adı." }
            ]
        }
    ],
    karisik_cumle: [
        {
            id: 'kc-1',
            type: 'karisik_cumle',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Karışık Kelimelerden Cümle Kuralım',
            items: [
                { words: ["saat", "Kemal", "7.00 de", "sabah", "uyandı."], correctSentence: "Kemal sabah saat 7.00’de uyandı." },
                { words: ["Ömer", "yemek", "Yedi."], correctSentence: "Ömer yemek yedi." },
                { words: ["ve", "Hasan", "resim", "Ayşe", "güzel", "yapıyor."], correctSentence: "Ayşe ve Hasan güzel resim yapıyor." },
                { words: ["günü", "oynadı.", "Hasan", "top", "pazar"], correctSentence: "Hasan pazar günü top oynadı." },
                { words: ["aldı.", "çikolata", "bakkaldan", "iki", "Ahmet"], correctSentence: "Ahmet bakkaldan iki çikolata aldı." },
                { words: ["koydu.", "Anne", "çatal", "masaya"], correctSentence: "Anne masaya çatal koydu." },
                { words: ["mutfakta", "yapıyor", "Ayşe", "yemek"], correctSentence: "Ayşe mutfakta yemek yapıyor." },
                { words: ["dinliyor", "müzik", "İbrahim"], correctSentence: "İbrahim müzik dinliyor." }
            ]
        }
    ],
    zit_anlam: [
        {
            id: 'za-1',
            type: 'zit_anlam',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Zıt Anlamlı Kelimeler',
            items: [
                { word: "Çalışkan", antonym: "tembel" },
                { word: "zengin", antonym: "fakir" },
                { word: "şişman", antonym: "zayıf" },
                { word: "zor", antonym: "kolay" },
                { word: "hızlı", antonym: "yavaş" },
                { word: "ağır", antonym: "hafif" },
                { word: "yumuşak", antonym: "sert" },
                { word: "çirkin", antonym: "güzel" },
                { word: "ıslak", antonym: "kuru" },
                { word: "kirli", antonym: "temiz" }
            ]
        }
    ]
};
