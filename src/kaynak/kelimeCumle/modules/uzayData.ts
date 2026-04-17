import { 
    BoslukDoldurmaItem, 
    TestItem, 
    KelimeTamamlamaItem, 
    KarisikCumleItem, 
    ZitAnlamItem 
} from '../../../types/kelimeCumle';

export const UZAY_BOSLUK_DOLDURMA: BoslukDoldurmaItem[] = [
    { sentence: "Güneş sisteminin en büyük gezegeni olan ……… , devasa kütlesiyle bilinen bir gaz devidir.", answer: "Jüpiter" },
    { sentence: "Yıldızların ömürlerini tamamlayıp büyük bir patlamayla çökmesi sonucu ……… oluşur.", answer: "karadelikler" },
    { sentence: "Dünya'nın tek doğal uydusu olan Ay, yer çekimi etkisiyle ……… olayına neden olur.", answer: "gelgit" },
    { sentence: "Astronotlar uzayda yer çekimi olmadığı için ……… bir ortamda hareket ederler.", answer: "ayaksız/serbest" },
    { sentence: "Işığın bir yılda katettiği mesafeye ……… adı verilir.", answer: "ışık yılı" },
    { sentence: "Güneş sistemindeki kızıl gezegen olarak bilinen ……… , gelecekteki insan kolonileri için araştırılıyor.", answer: "Mars" },
    { sentence: "Yıldız kümelerini ve galaksileri inceleyen bilim dalına ……… denir.", answer: "astronomi" },
    { sentence: "Atmosfere giren gök taşlarının sürtünme etkisiyle ışıması halk arasında ……… olarak bilinir.", answer: "yıldız kayması" },
    { sentence: "Satürn gezegeni, çevresindeki görkemli ……… yapısıyla diğerlerinden kolayca ayırt edilir.", answer: "halka" },
    { sentence: "Uzay araçlarının yörüngeye fırlatılmasını sağlayan güçlü motorlara sahip taşıtlara ……… denir.", answer: "roket" },
    { sentence: "Samanyolu Galaksisi içinde milyarlarca ……… ve gezegen barındıran sarmal bir yapıdadır.", answer: "yıldız" },
    { sentence: "Güneş patlamaları sonucu yayılan parçacıkların kutup bölgelerinde oluşturduğu ışımaya ……… ışıkları denir.", answer: "aurora/kutup" },
    { sentence: "Evrenin yaklaşık 13.8 milyar yıl önce ……… adı verilen büyük bir patlamayla oluştuğu kabul edilir.", answer: "Big Bang" },
    { sentence: "Uzay boşluğunda ses iletilemez çünkü sesin yayılması için bir ……… gereklidir.", answer: "madde/ortam" },
    { sentence: "Hubble Uzay ……… , insanlığın evrenin derinliklerini görmesini sağlayan en önemli araçlardan biridir.", answer: "Teleskobu" },
    { sentence: "Uluslararası Uzay İstasyonu (ISS), Dünya yörüngesinde dönen dev bir ……… laboratuvarıdır.", answer: "araştırma" },
    { sentence: "Merkür, Güneş'e en ……… gezegen olması nedeniyle yüzey sıcaklığı gündüzleri çok yüksektir.", answer: "yakın" },
    { sentence: "Ay'ın yüzeyindeki derin çukurlara gök taşı çarpmaları sonucu oluşan ……… adı verilir.", answer: "krater" },
    { sentence: "Gök cisimlerinin birbirine uyguladığı çekim kuvvetine ……… kuvveti denir.", answer: "kütle çekim" },
    { sentence: "Nebula ya da ……… , yıldızların doğduğu devasa toz ve gaz bulutlarıdır.", answer: "bulutsu" }
];

export const UZAY_TEST: TestItem[] = [
    { question: "Hangisi Güneş sisteminde yer alan bir iç (kayalık) gezegendir?", options: ["Jüpiter", "Satürn", "Venüs", "Neptün"], answer: "Venüs" },
    { question: "Uzayda en hızlı hareket eden şey hangisidir?", options: ["Ses", "Işık", "Roket", "Meteor"], answer: "Işık" },
    { question: "Güneş bir ne tür gök cismidir?", options: ["Gezegen", "Uydu", "Yıldız", "Asteroit"], answer: "Yıldız" },
    { question: "Dünya'nın atmosferi dışında kalan sonsuz boşluğa ne ad verilir?", options: ["Okyanus", "Uzay", "Stratosfer", "Küre"], answer: "Uzay" },
    { question: "Hangisi bir doğal uydudur?", options: ["Türksat", "Ay", "Güneş", "Venüs"], answer: "Ay" },
    { question: "Karadeliklerin en belirgin özelliği hangisidir?", options: ["Çok parlak olmaları", "Aşırı güçlü çekim kuvveti", "Sıcak olmaları", "Küçük olmaları"], answer: "Aşırı güçlü çekim kuvveti" },
    { question: "Astronotların uzayda giydiği özel kıyafetlerin temel amacı nedir?", options: ["Şık görünmek", "Hızlı yürümek", "Vücut ısısını ve basıncı korumak", "Uçmak"], answer: "Vücut ısısını ve basıncı korumak" },
    { question: "Gece gökyüzünde en parlak görülen gezegen hangisidir?", options: ["Mars", "Venüs", "Plüton", "Merkür"], answer: "Venüs" },
    { question: "Uzay araştırmalarında kullanılan insansız araçlara ne denir?", options: ["Sonda", "Uçak", "Gemi", "Kapsül"], answer: "Sonda" },
    { question: "Hangi gezegenin halkaları en belirgindir?", options: ["Dünya", "Mars", "Satürn", "Uranüs"], answer: "Satürn" }
];

export const UZAY_KELIME_TAMAMLAMA: KelimeTamamlamaItem[] = [
    { word: "Ast...not", fullWord: "Astronot", clue: "Uzay yolculuğu yapan eğitimli kişi" },
    { word: "Tel...kop", fullWord: "Teleskop", clue: "Gök cisimlerini incelemek için kullanılan araç" },
    { word: "Gal...ksi", fullWord: "Galaksi", clue: "Milyarlarca yıldızdan oluşan sistem (Gök ada)" },
    { word: "Yö...nge", fullWord: "Yörünge", clue: "Bir gök cisminin izlediği dairesel yol" },
    { word: "Met...or", fullWord: "Meteor", clue: "Atmosfere girip yanan gök taşı" },
    { word: "Ekv...tor", fullWord: "Ekvator", clue: "Dünyayı iki eş parçaya böldüğü varsayılan çizgi" },
    { word: "Kap...ül", fullWord: "Kapsül", clue: "Uzay araçlarının yolcu taşıyan bölümü" },
    { word: "Yer...ekimi", fullWord: "Yerçekimi", clue: "Dünyanın cisimleri kendine çekme kuvveti" },
    { word: "Kü...ey", fullWord: "Kuzey", clue: "Kutup yıldızının gösterdiği ana yön" },
    { word: "Sistem", fullWord: "Sistem", clue: "Güneş ve etrafındaki gezegenler topluluğu" }
];

export const UZAY_KARISIK_CUMLE: KarisikCumleItem[] = [
    { words: ["Dünya", "Güneş", "üçüncü", "sisteminde", "gezegendir"], correctSentence: "Dünya Güneş sisteminde üçüncü gezegendir." },
    { words: ["karadelikler", "ışığı", "bile", "yutarlar"], correctSentence: "Karadelikler ışığı bile yutarlar." },
    { words: ["Ay", "yüzeyi", "kraterlerle", "doludur"], correctSentence: "Ay yüzeyi kraterlerle doludur." },
    { words: ["Mars", "üzerinde", "su", "izleri", "bulundu"], correctSentence: "Mars üzerinde su izleri bulundu." },
    { words: ["astronotlar", "yerçekimsiz", "ortamda", "havada", "süzülürler"], correctSentence: "Astronotlar yerçekimsiz ortamda havada süzülürler." }
];

export const UZAY_ZIT_ANLAM: ZitAnlamItem[] = [
    { word: "Derin (Uzay)", antonym: "Sığ" },
    { word: "Uzak (Yıldız)", antonym: "Yakın" },
    { word: "Aydınlık", antonym: "Karanlık" },
    { word: "İniş (Roket)", antonym: "Kalkış" },
    { word: "Büyük (Galaksi)", antonym: "Küçük" },
    { word: "Sıcak (Güneş)", antonym: "Soğuk" },
    { word: "Geniş (Evren)", antonym: "Dar" },
    { word: "Hızlı (Işık)", antonym: "Yavaş" },
    { word: "Doğal (Uydu)", antonym: "Yapay" },
    { word: "Ağır (Kütle)", antonym: "Hafif" }
];
