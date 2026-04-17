import { 
    BoslukDoldurmaItem, 
    TestItem, 
    KelimeTamamlamaItem, 
    KarisikCumleItem, 
    ZitAnlamItem 
} from '../../../types/kelimeCumle';

export const AKADEMIK_BOSLUK_DOLDURMA: BoslukDoldurmaItem[] = [
    { sentence: "Yazarın eserinde kullandığı ……… ifade tarzı, okuyucunun hayal dünyasını zenginleştiriyor.", answer: "mecazi" },
    { sentence: "Cümledeki anlam akışını bozan gereksiz sözcük kullanımı, anlatım ……… yol açar.", answer: "bozukluğuna" },
    { sentence: "Deyimler ve atasözleri, bir milletin kültürel ……… en önemli yansımalarıdır.", answer: "birikiminin" },
    { sentence: "Bilimsel bir metinde terim anlamlı sözcüklerin ağırlıklı olması, metne ……… kazandırır.", answer: "nesnellik" },
    { sentence: "Yazar, kahramanının yaşadığı iç ……… okuyucuya çok iyi bir şekilde aktarmıştır.", answer: "çatışmayı" },
    { sentence: "Neden-sonuç cümlelerinde bir olayın ……… ile birlikte verildiği görülür.", answer: "gerekçesi" },
    { sentence: "Karşılaştırma cümlelerinde en az iki farklı durumun ……… ve farklılıkları incelenir.", answer: "benzerlikleri" },
    { sentence: "Özne ve ……… uyumu, cümlenin dil bilgisi kurallarına uygunluğu için şarttır.", answer: "yüklem" },
    { sentence: "Paragrafta ana fikir, yazarın okuyucuya ulaştırmak istediği temel ……… .", answer: "mesajdır" },
    { sentence: "Betimleyici anlatımda kelimelerle ……… çiziliyormuş hissi uyandırılır.", answer: "resim" },
    { sentence: "Öyküleyici metinlerde olay, zaman, mekan ve ……… unsurları bulunur.", answer: "kişi" },
    { sentence: "Bir sözcüğün akla gelen ilk anlamına ……… anlam denir.", answer: "gerçek" },
    { sentence: "Farklı türdeki kitapların bulunduğu bölüme ……… dalı adı verilir.", answer: "edebiyat" },
    { sentence: "Atasözleri, uzun gözlem ve ……… dayanan, söyleyeni belli olmayan özlü sözlerdir.", answer: "deneyimlere" },
    { sentence: "Okuduğunu anlamak için metne yönelik '5N………' soruları sorulmalıdır.", answer: "1K" },
    { sentence: "Kitabın sonunda yer alan ……… bölümü, teknik terimlerin açıklamalarını içerir.", answer: "sözlük/glosery" },
    { sentence: "Şiirde her mısranın sonundaki ses benzerliklerine ……… denir.", answer: "kafiye/uyak" },
    { sentence: "Anlatımın sade ve ……… olması, okuyucunun metni daha hızlı anlamasını sağlar.", answer: "yalın" },
    { sentence: "Kurgusal metinler, yazarın ……… gücüyle oluşturduğu dünyaları anlatır.", answer: "hayal" },
    { sentence: "Bilimsel araştırmalarda kullanılan kaynakların listesine ……… denir.", answer: "kaynakça" }
];

export const AKADEMIK_TEST: TestItem[] = [
    { question: "Hangisi bir 'neden-sonuç' cümlesidir?", options: ["Seni görmek için geldim.", "Yağmur yağdığı için ıslandım.", "Okumak en büyük erdemdir.", "Kitapları rafa dizdi."], answer: "Yağmur yağdığı için ıslandım." },
    { question: "Hangisi nesnel (objektif) bir ifadedir?", options: ["Bu kitap çok sıkıcı.", "Türkiye'nin başkenti Ankara'dır.", "En güzel renk mavidir.", "Yaz mevsimi çok eğlenceli."], answer: "Türkiye'nin başkenti Ankara'dır." },
    { question: "Deyimlerden hangisi 'çok sevinmek' anlamındadır?", options: ["Gözden düşmek", "Etleri tutuşmak", "Etekleri zil çalmak", "Burnu büyümek"], answer: "Etekleri zil çalmak" },
    { question: "Paragrafın akışını bozan cümleyi bulurken neye dikkat edilir?", options: ["Cümlenin uzunluğuna", "Kelime sayısına", "Konudan sapan farklı yargıya", "Noktalama işaretlerine"], answer: "Konudan sapan farklı yargıya" },
    { question: "Hangisi bir isim tamlamasıdır?", options: ["Mavi kapı", "Evin bahçesi", "Koşan çocuk", "Hızlı araba"], answer: "Evin bahçesi" },
    { question: "Sözel mantık sorularında en önemli adım hangisidir?", options: ["Hızlı okumak", "Tablo veya şema oluşturmak", "Tahminde bulunmak", "Kelimeleri saymak"], answer: "Tablo veya şema oluşturmak" },
    { question: "Hangisi edebi bir tür değildir?", options: ["Roman", "Hikaye", "Deneme", "Kullanım kılavuzu"], answer: "Kullanım kılavuzu" },
    { question: "Şiirin her bir satırına ne ad verilir?", options: ["Kıta", "Mısra", "Paragraf", "Bölüm"], answer: "Mısra" },
    { question: "Zarf fül (bağ-fiil) ne zaman kullanılır?", options: ["İsim yaparken", "Sıfat yaparken", "Eylemi zaman veya durum yönünden tamamlarken", "Cümleyi bitirirken"], answer: "Eylemi zaman veya durum yönünden tamamlarken" },
    { question: "Anlatım bozukluğu hangisinde vardır?", options: ["Kitap okumayı severim.", "Okula her gün düzenli giderim.", "Onunla karşılıklı selamlaştık.", "Bugün hava çok güzel."], answer: "Onunla karşılıklı selamlaştık." }
];

export const AKADEMIK_KELIME_TAMAMLAMA: KelimeTamamlamaItem[] = [
    { word: "Edeb...yat", fullWord: "Edebiyat", clue: "Olay ve duyguların dil ile anlatıldığı sanat" },
    { word: "Paragraf", fullWord: "Paragraf", clue: "Yazıdaki bir düşünceyi anlatan bölüm" },
    { word: "Karakter", fullWord: "Karakter", clue: "Eserlerdeki kişilerin ayırt edici özelliği" },
    { word: "Metafor", fullWord: "Metafor", clue: "Bir şeyi başka bir şeye benzeterek anlatma" },
    { word: "Anat...liz", fullWord: "Analiz", clue: "Bir konuyu parçalarına ayırarak inceleme" },
    { word: "Bağlam", fullWord: "Bağlam", clue: "Sözün kullanıldığı yer ve durum (Kontekst)" },
    { word: "Özgün", fullWord: "Özgün", clue: "Eşi benzeri olmayan, yaratıcı" },
    { word: "Yorum", fullWord: "Yorum", clue: "Kendi görüş ve anlayışını katma" },
    { word: "Özet", fullWord: "Özet", clue: "Bir konunun ana hatlarını kısaca anlatma" },
    { word: "Kurgu", fullWord: "Kurgu", clue: "Hayali olarak tasarlanan olaylar bütünü" }
];

export const AKADEMIK_KARISIK_CUMLE: KarisikCumleItem[] = [
    { words: ["kitap", "hayal", "kapısını", "aralar", "dünyasının"], correctSentence: "Kitap hayal dünyasının kapısını aralar." },
    { words: ["dil", "bir", "milletin", "en", "büyük", "hazinesidir"], correctSentence: "Dil bir milletin en büyük hazinesidir." },
    { words: ["başarı", "disiplinli", "çalışmanın", "bir", "sonucudur"], correctSentence: "Başarı disiplinli çalışmanın bir sonucudur." },
    { words: ["okumak", "insanı", "karanlıktan", "aydınlığa", "çıkarır"], correctSentence: "Okumak insanı karanlıktan aydınlığa çıkarır." },
    { words: ["yazar", "topluma", "ayna", "tutan", "bir", "sanatçıdır"], correctSentence: "Yazar topluma ayna tutan bir sanatçıdır." }
];

export const AKADEMIK_ZIT_ANLAM: ZitAnlamItem[] = [
    { word: "Özgün", antonym: "Taklit" },
    { word: "Nesnel", antonym: "Öznel" },
    { word: "Soyut", antonym: "Somut" },
    { word: "Basit", antonym: "Bileşik" },
    { word: "Yalın", antonym: "Süslü" },
    { word: "Geniş", antonym: "Dar" },
    { word: "Açık", antonym: "Kapalı" },
    { word: "Doğru", antonym: "Yanlış" },
    { word: "Sığ", antonym: "Derin" },
    { word: "Az", antonym: "Çok" }
];
