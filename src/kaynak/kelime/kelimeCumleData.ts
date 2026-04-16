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
            title: 'Cümleleri Tamamlayalım - 1',
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
            title: 'Boşlukları Doldurma - 2',
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
        },
        {
            id: 'bd-3',
            type: 'bosluk_doldurma',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Günlük Yaşam Boşluk Doldurma',
            items: [
                { sentence: "Tuvaletten sonra ellerimi ……………", answer: "yıkarım" },
                { sentence: "İtfaiye ……… . söndürdü.", answer: "yangını" },
                { sentence: "Berber …………… kesti.", answer: "saçlarımı" },
                { sentence: "Fatih arabaya ………… .. .", answer: "bindi" },
                { sentence: "Hakan ……… .… giydi.", answer: "mont" },
                { sentence: "Salı günü Kemal ve İbrahim …………… .. etti.", answer: "kavga" },
                { sentence: "Dün akşam eve ……………… geldi.", answer: "misafir" },
                { sentence: "Gölde ………………… .. yüzüyor.", answer: "ördekler" },
                { sentence: "Papatya ve güller güzel ……………", answer: "kokuyor" },
                { sentence: "Bakkaldan ………..… ... aldım.", answer: "çikolata" }
            ]
        },
        {
            id: 'bd-4',
            type: 'bosluk_doldurma',
            ageGroup: '11-13',
            difficulty: 'İleri',
            title: 'Zaman ve Mevsimler',
            items: [
                { sentence: "Bir yıl dört …………", answer: "mevsim" },
                { sentence: "Bir yıl 12 ……… .", answer: "ay" },
                { sentence: "Bir yıl 365 ……………", answer: "gün" },
                { sentence: "Bir hafta ………… .. gün", answer: "yedi" },
                { sentence: "Haftanın ilk günü …………", answer: "pazartesi" },
                { sentence: "Tatil günleri cumartesi ve …………… ..", answer: "pazar" },
                { sentence: "Bir gün 24 …… ...", answer: "saat" },
                { sentence: "………… .. mevsimi çok sıcak.", answer: "Yaz" },
                { sentence: "Bir ay ……… gün", answer: "30" },
                { sentence: "…………… mevsiminde çiçekler açar.", answer: "İlkbahar" }
            ]
        },
        {
            id: 'bd-5',
            type: 'bosluk_doldurma',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Okul ve Çevre',
            items: [
                { sentence: "Çocuklar …………… . sallanıyor", answer: "salıncakta" },
                { sentence: "Hayvanat bahçesinde ………..… . gördüm", answer: "zürafa" },
                { sentence: "Dedem …………… okuyor", answer: "gazete" },
                { sentence: "Ablam manavdan …..……… .. aldı.", answer: "çilek" },
                { sentence: "Hatice ……….…….. taze ekmek aldı.", answer: "fırından" },
                { sentence: "…………… .. mutfakta yemek yapıyor.", answer: "Aşçı" },
                { sentence: "Dedem camide ………..…… kılıyor.", answer: "namaz" },
                { sentence: "…………… günü okul tatil.", answer: "Pazar" },
                { sentence: "…………… öğrencilere aşı yapıyor.", answer: "Hemşire" },
                { sentence: "Akşam saat …….… ... uyudum..", answer: "22:00’de" }
            ]
        },
        {
            id: 'bd-6',
            type: 'bosluk_doldurma',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Ev Etkinlikleri',
            items: [
                { sentence: "Ayşe okuldan gelince …………… . yaptı.", answer: "ödevini" },
                { sentence: "Neşe doğum günüde ………… . kesti.", answer: "pasta" },
                { sentence: "Babam ………..…… oturuyor", answer: "kanepede" },
                { sentence: "Cemil ……..…… .. giydi", answer: "gömlek" },
                { sentence: "Kemal …… . ……… ile saçlarını yıkadı.", answer: "şampuan" },
                { sentence: "Amcam …………… .. dinliyor.", answer: "radyo" },
                { sentence: "Annem kirli camları ……………", answer: "sildi" },
                { sentence: "Kız güzel şarkı ………………… ..", answer: "söylüyor" },
                { sentence: "Köpek üç tane ………… yedi.", answer: "kemik" },
                { sentence: "Mehmet iki kaşık ………… içti.", answer: "çorba" }
            ]
        },
        {
            id: 'bd-10',
            type: 'bosluk_doldurma',
            ageGroup: '11-13',
            difficulty: 'Uzman',
            title: 'Karmaşık Boşluk Doldurma',
            items: [
                { sentence: "Annem fırında …………… . yaptı", answer: "kek" },
                { sentence: "Bülent lokantada ……………… yedi.", answer: "döner" },
                { sentence: "Tatilde on beş tane …………… okudum.", answer: "kitap" },
                { sentence: "Pazar günü arkadaşlarımla …..……… .. gittik", answer: "sinemaya" },
                { sentence: "Cuma günü ……………… . Marşı Töreni yapıldı", answer: "İstiklal" },
                { sentence: "Gamze iki ……………… . süt içti..", answer: "bardak" },
                { sentence: "Kümeste beş tane ……… . ……… var", answer: "hindi" },
                { sentence: "Hakan matematik ……… . ……… .. seviyor..", answer: "dersini" },
                { sentence: "Ahmet cumartesi günü …..……… yüzdü", answer: "havuzda" },
                { sentence: "Yeşim kahvaltıda ……….… ... yedi.", answer: "zeytin" }
            ]
        }
    ],
    test: [
        {
            id: 'v-test-1',
            type: 'test',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Genel Kültür Testi - 1',
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
        },
        {
            id: 'v-test-2',
            type: 'test',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Anlama ve Kavrama Testi - 2',
            items: [
                { question: "Paralarımı ………… koydum", options: ["internete", "cüzdana", "tokama", "klimaya"], answer: "cüzdana" },
                { question: "Gökhan, hasta arkadaşına ……… . dedi.", options: ["iyi geceler", "kolay gelsin", "günaydın", "geçmiş olsun"], answer: "geçmiş olsun" },
                { question: "Meral manavdan ……………. aldı.", options: ["perde", "kağıt", "terlik", "pırasa"], answer: "pırasa" },
                { question: "Ömer bugün yirmi ………… kitap okudu.", options: ["takvim", "yunus", "sayfa", "toka"], answer: "sayfa" },
                { question: "Yağmur yağınca ………….. açtım.", options: ["şemsiyemi", "dosyamı", "çatıyı", "kilimi"], answer: "şemsiyemi" },
                { question: "Pazar günü arkadaşımla …………… . gittik.", options: ["hırka", "sürahiye", "ödeve", "sinemaya"], answer: "sinemaya" },
                { question: "Fenerbahçe-Galatasaray ………… izledim.", options: ["maçını", "kumanda", "ehliyet", "döneri"], answer: "maçını" },
                { question: "Babam Kurban Bayramında ……..……… kesti.", options: ["çekirdek", "yunus", "koyun", "maymun"], answer: "koyun" }
            ]
        }
    ],
    kelime_tamamlama: [
        {
            id: 'v-kt-1',
            type: 'kelime_tamamlama',
            ageGroup: '5-7',
            difficulty: 'Başlangıç',
            title: 'Eksik Harf Avcısı - 1',
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
        },
        {
            id: 'v-kt-2',
            type: 'kelime_tamamlama',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Eksik Harf Avcısı - 2',
            items: [
                { word: "Bak …………", fullWord: "Bakkal", clue: "Alış veriş yapılan yer." },
                { word: "Bar ………… ..", fullWord: "Bardak", clue: "Su içeriz." },
                { word: "Yağ ………", fullWord: "Yağmur", clue: "Gökten yağar." },
                { word: "To ……… ..", fullWord: "Toka", clue: "Kızlar saçına takar" },
                { word: "Te ……… .", fullWord: "Telefon", clue: "Konuşuruz" },
                { word: "Tav ………… .", fullWord: "Tavşan", clue: "Bir hayvan." },
                { word: "Sa ……… .", fullWord: "Salı", clue: "Haftanın bir günü." },
                { word: "Şef ……… .", fullWord: "Şeftali", clue: "Bir meyve." },
                { word: "Şap ………", fullWord: "Şapka", clue: "Başımıza giyeriz." },
                { word: "Su ……… .", fullWord: "Sucuk", clue: "Bir yiyecek." }
            ]
        }
    ],
    karisik_cumle: [
        {
            id: 'v-kc-1',
            type: 'karisik_cumle',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Cümle Kurma Atölyesi - 1',
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
        },
        {
            id: 'v-kc-2',
            type: 'karisik_cumle',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Cümle Kurma Atölyesi - 2',
            items: [
                { words: ["bahçede", "uçuruyor", "Mustafa", "uçurtma"], correctSentence: "Mustafa bahçede uçurtma uçuruyor." },
                { words: ["verdi", "Yasemin", "yem", "tavuklara"], correctSentence: "Yasemin tavuklara yem verdi." },
                { words: ["duman", "Evin", "çıkıyor", "bacasından"], correctSentence: "Evin bacasından duman çıkıyor." },
                { words: ["yardım", "Zeynep", "ediyor", "annesine"], correctSentence: "Zeynep annesine yardım ediyor." },
                { words: ["ve", "kardeşim", "sinemaya", "gittik", "Ben"], correctSentence: "Kardeşim ve ben sinemaya gittik." }
            ]
        }
    ],
    zit_anlam: [
        {
            id: 'v-za-1',
            type: 'zit_anlam',
            ageGroup: '8-10',
            difficulty: 'Orta',
            title: 'Zıt Anlamlılar Listesi',
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
