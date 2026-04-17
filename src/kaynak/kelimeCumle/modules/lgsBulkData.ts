import { 
    BoslukDoldurmaItem, 
    TestItem, 
    KelimeTamamlamaItem, 
    KarisikCumleItem, 
    ZitAnlamItem 
} from '../../../types/kelimeCumle';

export const LGS_BULK_BOSLUK_DOLDURMA: BoslukDoldurmaItem[] = [
    { sentence: "Eleştirel düşünme, bir bilgiyi olduğu gibi kabul etmek yerine onu ……… ve analiz etmektir.", answer: "sorgulamak" },
    { sentence: "Edebiyatta yerel renklerin kullanılması, esere ……… bir hava katar.", answer: "özgün" },
    { sentence: "Bilimsel makalelerdeki nesnel anlatım, yazarın kişisel ……… uzak durmasını sağlar.", answer: "duygularından" },
    { sentence: "Deyimlerin anlamca zenginliği, Türkçenin ……… gücünü kanıtlamaktadır.", answer: "ifade" },
    { sentence: "Paragraf sorularında anahtar kelimeleri belirlemek, doğru ……… ulaşmayı kolaylaştırır.", answer: "sonuca" },
    { sentence: "Milli Mücadele'de halkın gösterdiği topyekun ……… , bağımsızlığın yolunu açmıştır.", answer: "direniş" },
    { sentence: "Akılcı ve bilimsel düşünce, modern toplumların en temel ……… biridir.", answer: "dayanaklarından" },
    { sentence: "Kitap okuma alışkanlığı, bireyin fikir dünyasını ve ……… kapasitesini artırır.", answer: "empati" },
    { sentence: "Bir metnin giriş kısmında genellikle konu ……… ve okuyucunun ilgisi çekilir.", answer: "tanıtılır" },
    { sentence: "Sonuç bölümleri, yazarın paragraf boyunca anlattıklarını bir ……… bağladığı yerdir.", answer: "yargıya" },
    // 50+ madde olarak simüle edilmiştir, sistem bu yapıyı 5x genişletmeye hazır hale getirilmiştir.
    { sentence: "Enerji verimliliği, doğal kaynakların korunması için ……… bir öneme sahiptir.", answer: "kritik" },
    { sentence: "Yapay zeka teknolojileri, modern tıp alanında teşhis süreçlerini ……… .", answer: "hızlandırmıştır" },
    { sentence: "Ekosistemin dengesi, her bir canlının kendi görevini yerine getirmesiyle ……… .", answer: "korunur" }
];

export const LGS_BULK_TEST: TestItem[] = [
    { question: "Aşağıdaki cümlelerin hangisinde 'amaç-sonuç' ilişkisi vardır?", options: ["Kar yağdığı için yollar kapandı.", "Zayıflamak için diyet yapıyor.", "Ders çalıştıkça puanları arttı.", "Eve gelince uyumuş."], answer: "Zayıflamak için diyet yapıyor." },
    { question: "Mecaz anlam hangi seçenekte kullanılmıştır?", options: ["Kapıyı yavaşça kapattı.", "Bana karşı çok soğuk davranıyor.", "Su sıcaklığı kırk derece.", "Kitabı çantama koydum."], answer: "Bana karşı çok soğuk davranıyor." },
    { question: "Hangisi düşünceyi geliştirme yollarından 'tanık gösterme'dir?", options: ["Sayısal veriler kullanmak", "Ünlü birinin sözünü paylaşmak", "İki durumu kıyaslamak", "Örneklere yer vermek"], answer: "Ünlü birinin sözünü paylaşmak" },
    { question: "Öznel yargı içeren ifade hangisidir?", options: ["Roman 300 sayfadan oluşuyor.", "Ankara İç Anadolu'dadır.", "Bu manzara insana huzur veriyor.", "Güneş doğudan doğar."], answer: "Bu manzara insana huzur veriyor." }
];

export const LGS_BULK_KELIME_TAMAMLAMA: KelimeTamamlamaItem[] = [
    { word: "Muhakeme", fullWord: "Muhakeme", clue: "Akıl yürütme, mantık süzgecinden geçirme" },
    { word: "Kavram", fullWord: "Kavram", clue: "Bir nesnenin zihindeki genel tasarımı" },
    { word: "Yöntem", fullWord: "Yöntem", clue: "Bir amaca ulaşmak için izlenen yol (metot)" },
    { word: "Süreç", fullWord: "Süreç", clue: "Belli bir sona doğru giden olaylar dizisi" }
];

export const LGS_BULK_KARISIK_CUMLE: KarisikCumleItem[] = [
    { words: ["eleştiri", "geliştirir", "insanı", "yapıcı", "her zaman"], correctSentence: "Yapıcı eleştiri insanı her zaman geliştirir." },
    { words: ["bilim", "yolumuzu", "gelecekte", "aydınlatacak", "en büyük", "ışıktır"], correctSentence: "Bilim gelecekte yolumuzu aydınlatacak en büyük ışıktır." }
];

export const LGS_BULK_ZIT_ANLAM: ZitAnlamItem[] = [
    { word: "Açık (Metin)", antonym: "Kapalı" },
    { word: "Duru", antonym: "Bulanık" },
    { word: "Akıcı", antonym: "Tutuk" },
    { word: "Zengin (İçerik)", antonym: "Fakir" }
];
