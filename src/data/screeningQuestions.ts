
import { Question, EvaluationCategory } from '../types/screening';

export const SCREENING_QUESTIONS: Question[] = [
    // 1. Genel Gelişim ve Dikkat
    {
        id: 'att_1',
        text: 'Çocuğunuzun dikkatini bir göreve (ödev, etkinlik, oyun) uzun süre vermekte zorlandığını gözlemler misiniz?',
        category: 'attention',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'att_2',
        text: 'Talimatları ilk söyleyişinizde çoğunlukla tekrar etmeniz gerekiyor mu?',
        category: 'attention',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'att_3',
        text: 'Aynı anda iki‑üç adımlı yönergeleri (örn. “Odanı topla, sonra çantayı hazırla, sonra yanıma gel”) takip etmekte zorlanır mı?',
        category: 'attention',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'att_4',
        text: 'Yaşıtlarına göre daha çabuk yorulma, çabuk pes etme veya “yapamam” deme eğilimi var mı?',
        category: 'attention',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'att_5',
        text: 'Yeni bir akademik beceriyi öğrenirken (okuma, yazma, matematik) çok hızlı hayal kırıklığına uğrar mı?',
        category: 'attention',
        weight: 1.0,
        formType: 'both'
    },

    // 2. Okuma Alanı (Disleksi)
    {
        id: 'read_1',
        text: 'd-b, p-q, u-n, m-n gibi birbirine benzeyen harfleri sık sık karıştırır mı?',
        category: 'reading',
        weight: 1.5, // Critical Indicator
        formType: 'both'
    },
    {
        id: 'read_2',
        text: 'v-f, t-d, b-p gibi ses olarak benzer harflerin seslerini karıştırır mı?',
        category: 'reading',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'read_3',
        text: '“top-pot”, “tak-kat” gibi harf sırası değişince anlamı değişen kelimeleri okurken hatalar yapar mı?',
        category: 'reading',
        weight: 1.3,
        formType: 'both'
    },
    {
        id: 'read_4',
        text: 'Tanımadığı kelimeleri okumakta zorlanır, sık sık duraklar veya tahmin ederek mi okur?',
        category: 'reading',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'read_5',
        text: 'Okuma sırasında harf, hece veya kelime atladığını, eklediğini ya da yerlerini değiştirdiğini fark eder misiniz?',
        category: 'reading',
        weight: 1.4,
        formType: 'both'
    },
    {
        id: 'read_6',
        text: 'Satır atlama, aynı satırı iki kez okuma, satır kaydırma gibi sorunlar yaşıyor mu?',
        category: 'reading',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'read_7',
        text: '“Harfler/sayılar hareket ediyor, yer değiştiriyor, silik ya da parlak görünüyor” şeklinde şikayetleri oldu mu?',
        category: 'reading',
        weight: 1.1,
        formType: 'both'
    },
    {
        id: 'read_8',
        text: 'Sessiz okuduğunda metni anlamakta zorlanıp, bir başkası yüksek sesle okuduğunda daha iyi mi anlar?',
        category: 'reading',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'read_9',
        text: 'Yaşıtlarına göre okuma hızı belirgin şekilde yavaş mı, çok çabuk mu yoruluyor?',
        category: 'reading',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'read_10',
        text: 'Okurken parmağıyla veya başka bir işaretleyiciyle satırı takip etme ihtiyacı duyuyor mu?',
        category: 'reading',
        weight: 1.0,
        formType: 'both'
    },

    // 3. Yazma / Disgrafi
    {
        id: 'write_1',
        text: 'El yazısı ya da bitişik yazısı yaşıtlarına göre belirgin şekilde dağınık, okunması zor ya da düzensiz mi?',
        category: 'writing',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'write_2',
        text: 'Harflerin boyutları, aralıkları ve satır üzerindeki yerleşimleri tutarsız mı (çok büyük-küçük, satırın üstüne/altına taşma vb.)?',
        category: 'writing',
        weight: 1.1,
        formType: 'both'
    },
    {
        id: 'write_3',
        text: 'Kelime içindeki harfleri atlama, ekleme, yer değiştirme (örn. “okul” yerine “oluk”, “kalem” yerine “kaelm”) sık görülür mü?',
        category: 'writing',
        weight: 1.4,
        formType: 'both'
    },
    {
        id: 'write_4',
        text: 'Yazarken eli çabuk yorulur, bilek/avuç ağrısından şikayet eder mi, sık sık yazmayı bırakmak ister mi?',
        category: 'writing',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'write_5',
        text: 'Kalemi çok sıkı, garip bir pozisyonda ya da yaşından beklenmeyecek kadar kontrolsüz mü tutar?',
        category: 'writing',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'write_6',
        text: 'Tahtadan ya da kitaptan deftere yazı geçirirken (kopya ederken) belirgin şekilde zorlanır mı?',
        category: 'writing',
        weight: 1.3,
        formType: 'teacher'
    },
    {
        id: 'write_7',
        text: 'Yazılı anlatımda, konuşurken kullanabildiği kelime ve cümleleri kağıda aktarmakta zorlanır mı?',
        category: 'writing',
        weight: 1.1,
        formType: 'both'
    },
    {
        id: 'write_8',
        text: 'Cümleleri tamamlamakta, noktalama işaretlerini yerli yerinde kullanmakta belirgin zorluk yaşar mı?',
        category: 'writing',
        weight: 1.0,
        formType: 'both'
    },

    // 4. Matematik / Diskalkuli
    {
        id: 'math_1',
        text: 'Yaşıtları sayı saymayı öğrenmişken, hâlâ ileri-geri saymada zorlanır mı?',
        category: 'math',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'math_2',
        text: '10’a kadar, 20’ye kadar gibi temel sayı dizilerini karıştırır, atlar veya sıralamayı bozarak mı söyler?',
        category: 'math',
        weight: 1.3,
        formType: 'both'
    },
    {
        id: 'math_3',
        text: 'Sayı sembollerini (2, 5, 9 gibi) tanımakta, ayırt etmekte ya da isimlerini hatırlamakta zorlanır mı?',
        category: 'math',
        weight: 1.4,
        formType: 'both'
    },
    {
        id: 'math_4',
        text: 'Toplama-çıkarma gibi temel işlemleri, işlemin hangi tür olduğunu karıştırarak mı yapar (örn. toplaması gerekirken çıkarma yapmak)?',
        category: 'math',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'math_5',
        text: 'Günlük yaşamla ilgili basit problemleri (örn. “3 kalemin var, 1’ini verirsen kaç kalemin kalır?”) çözerken zorlanır mı?',
        category: 'math',
        weight: 1.3,
        formType: 'both'
    },
    {
        id: 'math_6',
        text: 'Saat okuma, zamanı tahmin etme, “yarım saat sonra”, “10 dakika önce” gibi kavramları anlamakta güçlük yaşar mı?',
        category: 'math',
        weight: 1.1,
        formType: 'both'
    },
    {
        id: 'math_7',
        text: 'Parayla işlem yaparken (alışveriş, para üstü hesaplama) yaşıtlarına göre daha çok hata yapar mı?',
        category: 'math',
        weight: 1.1,
        formType: 'both'
    },
    {
        id: 'math_8',
        text: 'Sayılarda büyük-küçük karşılaştırması (hangisi daha büyük, hangisi daha küçük) yapmakta zorlanır mı?',
        category: 'math',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'math_9',
        text: 'Çarpma tablosunu ezberleme ve hatırlamada belirgin ve sürekli güçlük yaşıyor mu?',
        category: 'math',
        weight: 1.0,
        formType: 'both'
    },

    // 5. Dil ve İşitsel
    {
        id: 'lang_1',
        text: 'İşittiği kelimenin içindeki sesleri/heceleri sırayla söylemekte zorlanır mı (örn. “kalem” kelimesinin seslerini ayırma)?',
        category: 'language',
        weight: 1.4,
        formType: 'both'
    },
    {
        id: 'lang_2',
        text: 'Kafiyeli kelimeleri bulma, ilk sesi aynı olan kelimeleri fark etme gibi dil oyunlarında zorlanır mı?',
        category: 'language',
        weight: 1.3,
        formType: 'both'
    },
    {
        id: 'lang_3',
        text: 'Sözlü yönergeleri dinlerken dalıp gitme, “sanki hiç duymamış gibi” tepki vermeme halleri sık mı görülür?',
        category: 'language',
        weight: 1.1,
        formType: 'both'
    },
    {
        id: 'lang_4',
        text: 'Konuşurken düşüncelerini sıralı ve organize bir şekilde ifade etmekte zorlanır, sık sık konu atlar mı?',
        category: 'language',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'lang_5',
        text: 'Yeni kelimeleri öğrenme ve hatırlamada yaşıtlarına göre geri planda kaldığını hissediyor musunuz?',
        category: 'language',
        weight: 1.0,
        formType: 'both'
    },

    // 6. Organizasyon ve Motor
    {
        id: 'motor_1',
        text: 'Günlük rutinde (çantayı toplama, defter-kitap taşıma, ödevleri düzenleme) sık sık unutma ve dağınıklık yaşar mı?',
        category: 'motor_spatial',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'motor_2',
        text: 'Sağ-sol, dün-bugün-yarın, önce-sonra gibi yön ve zaman kavramlarını karıştırma eğilimi var mı?',
        category: 'motor_spatial',
        weight: 1.3,
        formType: 'both'
    },
    {
        id: 'motor_3',
        text: 'Sözlü olarak verilen kısa bir listeyi (örn. “silgi, kalem, kitap”) birkaç dakika sonra hatırlamakta zorlanır mı?',
        category: 'motor_spatial',
        weight: 1.2,
        formType: 'both'
    },
    {
        id: 'motor_4',
        text: 'Okul çantasını, dolabını veya çalışma masasını düzenli tutmakta zorlanır, sürekli eşyalarını kaybeder mi?',
        category: 'motor_spatial',
        weight: 1.0,
        formType: 'both'
    },
    {
        id: 'motor_5',
        text: 'Günün planını, ödev teslim tarihlerini ve sınav günlerini takip etmekte yaşıtlarına göre daha çok zorlanır mı?',
        category: 'motor_spatial',
        weight: 1.0,
        formType: 'both'
    },

    // Öğretmen Özel
    {
        id: 'teach_1',
        text: 'Okuma derslerinde metni gönüllü olarak okumaktan kaçınma, okuma sırasında “hasta”, “yorgun” hissettiğini söyleme gibi kaçınma davranışları gözlemler misiniz?',
        category: 'reading',
        weight: 1.3,
        formType: 'teacher'
    },
    {
        id: 'teach_2',
        text: 'Yazılı sınav performansı ile sözlü performansı arasında belirgin fark (sözlüde çok daha başarılı olma) var mı?',
        category: 'reading',
        weight: 1.4,
        formType: 'teacher'
    },
    {
        id: 'teach_3',
        text: 'Grup çalışmalarında yazma, not tutma, problemi deftere yazma gibi görevlerden özellikle kaçınır mı?',
        category: 'writing',
        weight: 1.2,
        formType: 'teacher'
    },
    {
        id: 'teach_4',
        text: 'Aynı konuyu defalarca işlemeye rağmen, temel kavramları (harf-ses eşleştirme, dört işlem vb.) sanki ilk kez duyuyormuş gibi karıştırdığı olur mu?',
        category: 'attention',
        weight: 1.3,
        formType: 'teacher'
    }
];

export const CATEGORY_LABELS: Record<string, string> = {
    'attention': 'Dikkat & Odaklanma',
    'reading': 'Okuma (Disleksi)',
    'writing': 'Yazma (Disgrafi)',
    'math': 'Matematik (Diskalkuli)',
    'language': 'Dil & İşitsel İşlemleme',
    'motor_spatial': 'Organizasyon & Mekansal'
};

export const CATEGORY_COLORS: Record<string, string> = {
    'attention': 'text-amber-600 bg-amber-50 border-amber-200',
    'reading': 'text-indigo-600 bg-indigo-50 border-indigo-200',
    'writing': 'text-rose-600 bg-rose-50 border-rose-200',
    'math': 'text-blue-600 bg-blue-50 border-blue-200',
    'language': 'text-teal-600 bg-teal-50 border-teal-200',
    'motor_spatial': 'text-purple-600 bg-purple-50 border-purple-200'
};
