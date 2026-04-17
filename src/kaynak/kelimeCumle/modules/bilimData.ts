import { 
    BoslukDoldurmaItem, 
    TestItem, 
    KelimeTamamlamaItem, 
    KarisikCumleItem, 
    ZitAnlamItem 
} from '../../../types/kelimeCumle';

export const BILIM_BOSLUK_DOLDURMA: BoslukDoldurmaItem[] = [
    { sentence: "Canlıların kalıtsal bilgilerini taşıyan ve hücre çekirdeğinde bulunan yapıya ……… denir.", answer: "DNA" },
    { sentence: "Güneş, rüzgar ve jeotermal gibi kaynaklar ……… enerji kaynakları olarak adlandırılır.", answer: "yenilenebilir" },
    { sentence: "Maddenin en küçük yapı taşına ……… adı verilir ve merkezinde çekirdek bulunur.", answer: "atom" },
    { sentence: "İnsan zekasını taklit eden ve veri analizi yaparak karar veren sistemlere ……… denir.", answer: "yapay zeka" },
    { sentence: "Bilimsel bir gerçeğe ulaşmak için yapılan kontrollü gözlem ve incelemelere ……… denir.", answer: "deney" },
    { sentence: "Sıvıların sıcaklığını ölçmek için kullanılan araca ……… adı verilir.", answer: "termometre" },
    { sentence: "Elektrik enerjisini ışığa dönüştüren ve çevreyi aydınlatan araca ……… denir.", answer: "ampul" },
    { sentence: "Mikroskop, çıplak gözle görülemeyecek kadar küçük ……… incelenmesini sağlar.", answer: "mikroorganizmaların" },
    { sentence: "Yer kabuğundaki kırılmalar sonucu oluşan sarsıntılara ……… denir.", answer: "deprem" },
    { sentence: "Sürekli kendini tekrar eden ve belli bir kurala göre ilerleyen olaylara ……… denir.", answer: "periyot" },
    { sentence: "Robotlar, bir dizi karmaşık işlemi otonom olarak yapabilen ……… makinelerdir.", answer: "elektronik" },
    { sentence: "İnternet üzerinden veri paylaşımını ve iletişimi sağlayan sisteme ……… denir.", answer: "bilgi ağı" },
    { sentence: "Besinlerin vücudumuzda enerjiye dönüşmesi olayına ……… denir.", answer: "metabolizma" },
    { sentence: "Zamanla bozulan ve çevreye zarar veren plastiklerin yerine ……… maddeler kullanılmalıdır.", answer: "doğa dostu" },
    { sentence: "Teknolojik cihazların çalışmasını sağlayan gizli komut dizilerine ……… adı verilir.", answer: "yazılım/kod" },
    { sentence: "Mıknatıslar, demir gibi maddeleri çeken bir ……… alan oluşturur.", answer: "manyetik" },
    { sentence: "Su buharlaşarak bulutları, bulutlar ise yağış olarak yeryüzünü besleyen ……… oluşturur.", answer: "su döngüsünü" },
    { sentence: "Bitkilerin güneş ışığını kullanarak kendi besinlerini üretmesine ……… denir.", answer: "fotosentez" },
    { sentence: "Elektronik devrelerde akımı ileten maddelere ……… denir.", answer: "iletken" },
    { sentence: "Genetik mühendisliği, canlıların ……… yapısını değiştirerek yeni özellikler kazandırır.", answer: "genetik" }
];

export const BILIM_TEST: TestItem[] = [
    { question: "Hangisi yenilenemez bir enerji kaynağıdır?", options: ["Rüzgar", "Güneş", "Kömür", "Biyokütle"], answer: "Kömür" },
    { question: "Hücrenin yönetim merkezi neresidir?", options: ["Sitoplazma", "Çekirdek", "Koful", "Ribozom"], answer: "Çekirdek" },
    { question: " Suyun donma sıcaklığı kaç derecedir?", options: ["0", "10", "32", "100"], answer: "0" },
    { question: "Yapay zekanın en büyük avantajı nedir?", options: ["Acıkmaması", "Hızlı veri işleme ve analiz", "Uyuması", "Yorulması"], answer: "Hızlı veri işleme ve analiz" },
    { question: "Elektrik devresinde akımı kontrol eden anahtara ne denir?", options: ["Pil", "Direnç", "Anahtar", "Duy"], answer: "Anahtar" },
    { question: "Doğal seçilim teorisini ortaya atan bilim insanı kimdir?", options: ["Einstein", "Newton", "Darwin", "Tesla"], answer: "Darwin" },
    { question: "Işık hangi ortamda en hızlı yayılır?", options: ["Su", "Hava", "Cam", "Boşluk"], answer: "Boşluk" },
    { question: "Maddenin hangi hali belirli bir şekle sahiptir?", options: ["Katı", "Sıvı", "Gaz", "Plazma"], answer: "Katı" },
    { question: "İnternet hızını belirleyen ana faktör hangisidir?", options: ["Klavye", "Ekran çözünürlüğü", "Bant genişliği", "Fare"], answer: "Bant genişliği" },
    { question: "Hangi gaz atmosferde en fazla oranda bulunur?", options: ["Oksijen", "Karbondioksit", "Azot", "Helyum"], answer: "Azot" }
];

export const BILIM_KELIME_TAMAMLAMA: KelimeTamamlamaItem[] = [
    { word: "Tek...oloji", fullWord: "Teknoloji", clue: "Bilimsel bilginin pratik yaşama uygulanması" },
    { word: "Labo...atuvar", fullWord: "Laboratuvar", clue: "Bilimsel araştırmaların yapıldığı alan" },
    { word: "Mik...oskop", fullWord: "Mikroskop", clue: "Küçük canlıları görmeye yarayan alet" },
    { word: "Biy...loji", fullWord: "Biyoloji", clue: "Canlıları inceleyen bilim dalı" },
    { word: "Kod...ama", fullWord: "Kodlama", clue: "Bilgisayara komut verme işlemi" },
    { word: "En...rji", fullWord: "Enerji", clue: "İş yapabilme yeteneği" },
    { word: "Gen...tik", fullWord: "Genetik", clue: "Kalıtım bilimi" },
    { word: "Deney", fullWord: "Deney", clue: "Hipotezleri test etmek için yapılan çalışma" },
    { word: "İcat", fullWord: "İcat", clue: "Daha önce olmayan bir şeyi bulma" },
    { word: "Robot", fullWord: "Robot", clue: "Programlanabilen otomatik makine" }
];

export const BILIM_KARISIK_CUMLE: KarisikCumleItem[] = [
    { words: ["DNA", "yapısı", "sarmal", "bir", "merdivene", "benzer"], correctSentence: "DNA yapısı sarmal bir merdivene benzer." },
    { words: ["yenilenebilir", "enerji", "çevreyi", "korur"], correctSentence: "Yenilenebilir enerji çevreyi korur." },
    { words: ["yapay", "zeka", "tıp", "alanında", "çığır", "açtı"], correctSentence: "Yapay zeka tıp alanında çığır açtı." },
    { words: ["ışık", "doğrusal", "bir", "yolla", "yayılır"], correctSentence: "Işık doğrusal bir yolla yayılır." },
    { words: ["teleskoplar", "uzaydaki", "yıldızları", "yakınlaştırır"], correctSentence: "Teleskoplar uzaydaki yıldızları yakınlaştırır." }
];

export const BILIM_ZIT_ANLAM: ZitAnlamItem[] = [
    { word: "Doğal", antonym: "Yapay" },
    { word: "İletken", antonym: "Yalıtkan" },
    { word: "Negatif", antonym: "Pozitif" },
    { word: "Somut", antonym: "Soyut" },
    { word: "Basit (Devre)", antonym: "Karmaşık" },
    { word: "Hızlı (İşlem)", antonym: "Yavaş" },
    { word: "Artı", antonym: "Eksi" },
    { word: "Sıvı", antonym: "Katı" },
    { word: "İleri", antonym: "Geri" },
    { word: "Büyük (Hücre)", antonym: "Küçük" }
];
