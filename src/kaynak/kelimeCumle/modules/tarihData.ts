import { 
    BoslukDoldurmaItem, 
    TestItem, 
    KelimeTamamlamaItem, 
    KarisikCumleItem, 
    ZitAnlamItem 
} from '../../../types/kelimeCumle';

export const TARIH_BOSLUK_DOLDURMA: BoslukDoldurmaItem[] = [
    { sentence: "Milli Mücadele'nin fitilini ateşleyen gelişme, Mustafa Kemal'in ……… tarihinde Samsun'a çıkmasıdır.", answer: "19 Mayıs 1919" },
    { sentence: "Erzurum ve Sivas Kongrelerinde manda ve ……… kesinlikle reddedilmiştir.", answer: "himaye" },
    { sentence: "Türkiye Büyük Millet Meclisi, ……… tarihinde Ankara'da açılmıştır.", answer: "23 Nisan 1920" },
    { sentence: "Milli sınırların (Misak-ı Milli) ilk kez bahsedildiği kongre ……… Kongresi'dir.", answer: "Erzurum" },
    { sentence: "Kurtuluş Savaşı'ndaki son askeri harekat ……… Taarruz'dur.", answer: "Büyük" },
    { sentence: "Yeni Türk devletinin tapusu olarak kabul edilen anlaşma ……… Barış Antlaşması'dır.", answer: "Lozan" },
    { sentence: "Milli Mücadele Dönemi’nde Batı Cephesi Komutanlığı’nı ……… yürütmüştür.", answer: "İsmet İnönü" },
    { sentence: "Mustafa Kemal'e 'Mareşal' ve 'Gazi' ünvanı ……… Meydan Muharebesi sonrası verilmiştir.", answer: "Sakarya" },
    { sentence: "Milli Mücadele'nin amacı, yöntemi ve gerekçesi ilk kez ……… Genelgesi'nde belirtilmiştir.", answer: "Amasya" },
    { sentence: "Düzenli ordunun kazandığı ilk askeri başarı ……… İnönü Savaşı'dır.", answer: "Birinci" },
    { sentence: "Atatürk, 'Ordular, ilk hedefiniz Akdeniz'dir. İleri!' emrini ……… savaşında vermiştir.", answer: "Dumlupınar" },
    { sentence: "Güney Cephesi'nde Fransızlara karşı büyük bir direnç gösteren halk kahramanına ……… denir.", answer: "Sütçü İmam/Şahin Bey" },
    { sentence: "İlk Türk devletlerinde hükümdara yönetme yetkisinin Tanrı tarafından verilmesine ……… denir.", answer: "Kut" },
    { sentence: "Orhun Yazıtları, Türk tarihinin bilinen ilk ……… belgeleridir.", answer: "yazılı" },
    { sentence: "Fatih Sultan Mehmet, ……… yılında İstanbul'u fethederek Orta Çağ'ı kapatmıştır.", answer: "1453" },
    { sentence: "Osmanlı Devleti'nin kurucusu ……… Bey'dir.", answer: "Osman" },
    { sentence: "Ankara'nın başkent olma nedeni stratejik konumu ve ……… merkezinde olmasıdır.", answer: "Milli Mücadele'nin" },
    { sentence: "Saltanatın kaldırılmasıyla milli ……… önündeki en büyük engel kalkmış oldu.", answer: "egemenlik" },
    { sentence: "Mudanya Ateşkes Antlaşması ile İstanbul ve Boğazlar ……… kurtarılmıştır.", answer: "savaşılmadan" },
    { sentence: "İstiklal Marşı'mızın yazarı ……… 'dur.", answer: "Mehmet Akif Ersoy" }
];

export const TARIH_TEST: TestItem[] = [
    { question: "Milli Mücadele'nin merkezi hangi şehirdir?", options: ["İstanbul", "İzmir", "Ankara", "Sivas"], answer: "Ankara" },
    { question: "Amasya Genelgesi'nde vurgulanan halkın bağımsızlığını yine kim kurtaracaktır?", options: ["Sultan", "Mebuslar Meclisi", "Halkın azim ve kararı", "Dış devletler"], answer: "Halkın azim ve kararı" },
    { question: "Hangisi Doğu Cephesi'nde Ermenilere karşı zafer kazanan komutandır?", options: ["Kazım Karabekir", "Fevzi Çakmak", "Rauf Orbay", "Refet Bele"], answer: "Kazım Karabekir" },
    { question: "Misak-ı Milli sınırlarından verilen ilk taviz neresidir?", options: ["Hatay", "Batum", "Musul", "Rodop"], answer: "Batum" },
    { question: "Cumhuriyet ne zaman ilan edilmiştir?", options: ["23 Nisan 1920", "29 Ekim 1923", "30 Ağustos 1922", "19 Mayıs 1919"], answer: "29 Ekim 1923" },
    { question: "Tarihte ilk 'Türk' adıyla kurulan devlet hangisidir?", options: ["Hunlar", "Köktürkler", "Uygurlar", "Selçuklular"], answer: "Köktürkler" },
    { question: "Osmanlı tarihinin en görkemli dönemi olan Kanuni Sultan Süleyman dönemi hangi yüzyıldır?", options: ["14. Yüzyıl", "15. Yüzyıl", "16. Yüzyıl", "17. Yüzyıl"], answer: "16. Yüzyıl" },
    { question: "Milli Mücadele'de kadın kahramanlarımızdan hangisi cepheye mermi taşırken hayatını kaybetmiştir?", options: ["Nene Hatun", "Şerife Bacı", "Halide Edip", "Kara Fatma"], answer: "Şerife Bacı" },
    { question: "Düzenli ordunun kurulması hangi olaydan sonra hızlanmıştır?", options: ["Gediz Taarruzu", "İzmir'in İşgali", "Amasya Görüşmeleri", "Lozan"], answer: "Gediz Taarruzu" },
    { question: "Hangisi laiklik ilkesinin ilk adımı sayılır?", options: ["Soyadı Kanunu", "Saltanatın Kaldırılması", "Kılık Kıyafet Kanunu", "Şapka İnkılabı"], answer: "Saltanatın Kaldırılması" }
];

export const TARIH_KELIME_TAMAMLAMA: KelimeTamamlamaItem[] = [
    { word: "Cumb...uriyet", fullWord: "Cumhuriyet", clue: "Halkın kendi kendini yönetme şekli" },
    { word: "Egemenlik", fullWord: "Egemenlik", clue: "Yönetme yetkisinin millete ait olması" },
    { word: "Kongre", fullWord: "Kongre", clue: "Milli kararların alındığı büyük toplantı" },
    { word: "Bağım...ızlık", fullWord: "Bağımsızlık", clue: "Bir devletin kimseden emir almadan hür yaşaması" },
    { word: "İnkılap", fullWord: "İnkılap", clue: "Kökten yapılan yenilik ve değişim" },
    { word: "Antlaşma", fullWord: "Antlaşma", clue: "Savaş sonrası yapılan yazılı uzlaşı" },
    { word: "Cephe", fullWord: "Cephe", clue: "Savaşın sürdüğü bölge veya alan" },
    { word: "Mud...hale", fullWord: "Müdahale", clue: "Dış işlerimize yapılan haksız karışma" },
    { word: "Sef...ret", fullWord: "Sefaret", clue: "Elçilik binası veya elçilik görevi" },
    { word: "Müf...redat", fullWord: "Müfredat", clue: "Okullarda okutulan derslerin programı" }
];

export const TARIH_KARISIK_CUMLE: KarisikCumleItem[] = [
    { words: ["egemenlik", "kayıtsız", "şartsız", "milletindir"], correctSentence: "Egemenlik kayıtsız şartsız milletindir." },
    { words: ["bağımsızlık", "vazgeçilmez", "karakterimdir", "benim"], correctSentence: "Bağımsızlık benim vazgeçilmez karakterimdir." },
    { words: ["yurtta", "dünyada", "sulh", "barış"], correctSentence: "Yurtta sulh dünyada barış." },
    { words: ["geldikleri", "giderler", "gibi"], correctSentence: "Geldikleri gibi giderler." },
    { words: ["milletin", "kararı", "kurtaracaktır", "istiklalini"], correctSentence: "Milletin kararı istiklalini kurtaracaktır." }
];

export const TARIH_ZIT_ANLAM: ZitAnlamItem[] = [
    { word: "Esaret", antonym: "Özgürlük" },
    { word: "Savaş", antonym: "Barış" },
    { word: "Dış (Politika)", antonym: "İç" },
    { word: "Eski (Rejim)", antonym: "Yeni" },
    { word: "Zorunlu", antonym: "Gönüllü" },
    { word: "Resmi", antonym: "Özel" },
    { word: "Doğu", antonym: "Batı" },
    { word: "Bağımsız", antonym: "Bağımlı" },
    { word: "Milli", antonym: "Gayri-milli" },
    { word: "Geçmiş", antonym: "Gelecek" }
];
