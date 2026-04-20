import { FiveWOneHQuestion } from '../../../types/verbal';

export interface FiveWOneHLibraryEntry {
    id: string;
    title: string;
    text: string;
    paragraphs: string[];
    ageGroup: '5-7' | '8-10' | '11-13' | '14+';
    difficulty: 'çok kolay' | 'kolay' | 'orta' | 'zor';
    questions: FiveWOneHQuestion[];
}

export const FIVE_W_ONE_H_LIBRARY: FiveWOneHLibraryEntry[] = [
    {
        id: 'lib-5n1k-1',
        title: 'Yaramaz Mırnav',
        text: "Sibel'in bir kedisi var. Çok iyi ve çok yaramaz bir kedi. Oyun oynamaya bayılır, oynamazsa darılır. Tüyleri bembeyaz burnu kıpkırmızı bir kedi. Kedinin adı Mırnav. Sibel onu süt ile besler. Mırnav sütü şapır şupur içer. Bir gün pencere açılmış. Mırnav pencereye çıkmış. Birden pencere kapanmış ve Mırnav dışarıda kalmış. Çok korkmuş. Sibel Mırnav'ın sesini duymuş. Onu içeriye almış.",
        paragraphs: ["Sibel'in bir kedisi var. Çok iyi ve çok yaramaz bir kedi. Oyun oynamaya bayılır, oynamazsa darılır. Tüyleri bembeyaz burnu kıpkırmızı bir kedi. Kedinin adı Mırnav. Sibel onu süt ile besler. Mırnav sütü şapır şupur içer.", "Bir gün pencere açılmış. Mırnav pencereye çıkmış. Birden pencere kapanmış ve Mırnav dışarıda kalmış. Çok korkmuş. Sibel Mırnav'ın sesini duymuş. Onu içeriye almış."],
        ageGroup: '5-7',
        difficulty: 'çok kolay',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Sibel\'in kedisinin adı nedir?', answerType: 'open_ended', correctAnswer: 'Mırnav' },
            { id: 'q2', type: 'what', questionText: 'Sibel kedisini ne ile besler?', answerType: 'open_ended', correctAnswer: 'Süt' },
            { id: 'q3', type: 'where', questionText: 'Mırnav nereye çıkmış?', answerType: 'open_ended', correctAnswer: 'Pencereye' },
            { id: 'q4', type: 'when', questionText: 'Mırnav ne zaman dışarıda kalmış?', answerType: 'open_ended', correctAnswer: 'Pencere kapandığında' },
            { id: 'q5', type: 'how', questionText: 'Mırnav sütü nasıl içer?', answerType: 'open_ended', correctAnswer: 'Şapır şupur' },
            { id: 'q6', type: 'why', questionText: 'Mırnav neden korkmuş?', answerType: 'open_ended', correctAnswer: 'Dışarıda kaldığı için' }
        ]
    },
    {
        id: 'lib-5n1k-2',
        title: "Ali'nin Topu",
        text: "Altan ve Ali çok iyi arkadaşlarmış. Ali'ye, babası yeni bir top almış. İki arkadaş yeni topla önce futbol, sonra yakar top, en sonunda da saydırmaca oynamışlar. Doyasıya eğlenmişler. Bir bakmışlar akşam olmuş. İkisi de yorgun bir şekilde evlerine dönmüşler. Zamanın nasıl geçtiğini anlamamışlar.",
        paragraphs: ["Altan ve Ali çok iyi arkadaşlarmış. Ali'ye, babası yeni bir top almış. İki arkadaş yeni topla önce futbol, sonra yakar top, en sonunda da saydırmaca oynamışlar.", "Doyasıya eğlenmişler. Bir bakmışlar akşam olmuş. İkisi de yorgun bir şekilde evlerine dönmüşler. Zamanın nasıl geçtiğini anlamamışlar."],
        ageGroup: '8-10',
        difficulty: 'kolay',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Ali\'ye topu kim almış?', answerType: 'open_ended', correctAnswer: 'Babası' },
            { id: 'q2', type: 'what', questionText: 'Ali ve Altan hangi oyunları oynamışlar?', answerType: 'open_ended', correctAnswer: 'Futbol, yakar top ve saydırmaca' },
            { id: 'q3', type: 'where', questionText: 'Ali ve Altan akşam nereye dönmüşler?', answerType: 'open_ended', correctAnswer: 'Evlerine' },
            { id: 'q4', type: 'when', questionText: 'İki arkadaş ne zaman evlerine dönmüşler?', answerType: 'open_ended', correctAnswer: 'Akşam olduğunda' },
            { id: 'q5', type: 'how', questionText: 'Ali ve Altan nasıl dönmüşler?', answerType: 'open_ended', correctAnswer: 'Yorgun bir şekilde' },
            { id: 'q6', type: 'why', questionText: 'Neden zamanın nasıl geçtiğini anlamamışlar?', answerType: 'open_ended', correctAnswer: 'Doyasıya eğlendikleri için' }
        ]
    },
    {
        id: 'lib-5n1k-3',
        title: 'Aslan ile Fare',
        text: 'Aslan ormanda uyuyormuş. Bir fare gelip aslanın vücudunun üzerinde dolaşmaya başlamış. Aslan uyanmış, fareyi yakalamış. Küçük fare yalvarmaya başlamış: "Bırak beni. Gün olur beni hatırlarsın, benim de sana bir iyiliğim dokunur." demiş. Aslan gülmüş ve fareyi bırakmış. Aradan zaman geçmiş. Avcılar aslanı bir tuzağa düşürmüşler. Onu sımsıkı bağlamışlar. Fare, aslanın inlemelerini duymuş, koşarak gelmiş. İpleri kemirip aslanı kurtarmış. Fare aslana: "Vaktiyle bana gülmüştür ama gördün ya, küçüklerin yardımı büyüklere dokunabilir" demiş.',
        paragraphs: ['Aslan ormanda uyuyormuş. Bir fare gelip aslanın vücudunun üzerinde dolaşmaya başlamış. Aslan uyanmış, fareyi yakalamış. Küçük fare yalvarmaya başlamış: "Bırak beni. Gün olur beni hatırlarsın, benim de sana bir iyiliğim dokunur." demiş. Aslan gülmüş ve fareyi bırakmış.', 'Aradan zaman geçmiş. Avcılar aslanı bir tuzağa düşürmüşler. Onu sımsıkı bağlamışlar. Fare, aslanın inlemelerini duymuş, koşarak gelmiş. İpleri kemirip aslanı kurtarmış.'],
        ageGroup: '8-10',
        difficulty: 'orta',
        questions: [
            { id: 'q1', type: 'who', questionText: 'İpleri kemirerek aslanı kim kurtarmış?', answerType: 'open_ended', correctAnswer: 'Fare' },
            { id: 'q2', type: 'what', questionText: 'Avcılar aslana ne yapmışlar?', answerType: 'open_ended', correctAnswer: 'Tuzağa düşürüp bağlamışlar' },
            { id: 'q3', type: 'where', questionText: 'Olay nerede geçmektedir?', answerType: 'open_ended', correctAnswer: 'Ormanda' },
            { id: 'q4', type: 'when', questionText: 'Fare aslanı ne zaman kurtarmaya gelmiş?', answerType: 'open_ended', correctAnswer: 'Aslanın inlemelerini duyduğunda' },
            { id: 'q5', type: 'how', questionText: 'Fare aslanı nasıl kurtarmış?', answerType: 'open_ended', correctAnswer: 'İpleri kemirerek' },
            { id: 'q6', type: 'inference', questionText: 'Bu hikayeden çıkarılacak ders nedir?', answerType: 'open_ended', correctAnswer: 'Küçüklerin yardımı büyüklere dokunabilir / İyilik yapan iyilik bulur' }
        ]
    },
    {
        id: 'lib-5n1k-4',
        title: 'Kurnaz Tilki ile Teke',
        text: 'Bir gün tilkinin biri bir kuyuya düşmüş. Çok uğraşmış ama bir türlü kuyudan çıkamamış. O sırada oradan bir teke geçiyormuş. Teke susadığı için kuyuya bakmış. Bir de ne görsün? Kuyuda bir tilki! Hemen sormuş "Bu su iyi mi, içilir mi?" Tilki kurnazca gülmüş, suyu bir övmüş ki tekenin ağzının suyu akmış. Tilki "Hadi durma aşağı in" deyince teke kuyuya inmiş. Suyu kana kana içtikten sonra tilkiye "Eee, nasıl çıkacağız buradan?" diye sormuş. Tilki "Sen hiç merak etme. Ben buradan ikimizi de kurtarmanın yolunu biliyorum. Sen şimdi doğrulup ayaklarını duvara dayar, omuzlarını havaya dikersin. Ben de senin omuzlarına tırmanıp çıkar, sonra seni çekerim" demiş. Teke bu aklı çok beğenmiş. Tilki tekenin omuzlarına basıp kuyudan çıkmış ve hemen oradan uzaklaşmış. Teke sitem edince tilki geri dönmüş: "Ey teke! Senin çenendeki kıllar kadar kafanda da akıl olsaydı, nasıl çıkacağını düşünmeden bu kuyuya inmezdin" demiş.',
        paragraphs: ['Bir gün tilkinin biri bir kuyuya düşmüş. Çok uğraşmış ama bir türlü kuyudan çıkamamış. O sırada oradan bir teke geçiyormuş. Teke susadığı için kuyuya bakmış. Bir de ne görsün? Kuyuda bir tilki!', 'Tilki kurnazca gülmüş, suyu bir övmüş ki tekenin ağzının suyu akmış. Tilki "Hadi durma aşağı in" deyince teke kuyuya inmiş. Suyu kana kana içtikten sonra tilkiye "Eee, nasıl çıkacağız buradan?" diye sormuş.', 'Tilki "Sen hiç merak etme. Ben buradan ikimizi de kurtarmanın yolunu biliyorum. Sen şimdi doğrulup ayaklarını duvara dayar, omuzlarını havaya dikersin. Ben de senin omuzlarına tırmanıp çıkar, sonra seni çekerim" demiş. Teke bu aklı çok beğenmiş. Tilki tekenin omuzlarına basıp kuyudan çıkmış ve hemen oradan uzaklaşmış.'],
        ageGroup: '11-13',
        difficulty: 'zor',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Kuyudan kendi başına çıkan kimdir?', answerType: 'open_ended', correctAnswer: 'Tilki' },
            { id: 'q2', type: 'what', questionText: 'Tilki kuyuya neden düşmüş?', answerType: 'open_ended', correctAnswer: 'Yanlışlıkla / Bir gün düşmüş' },
            { id: 'q3', type: 'where', questionText: 'Olay nerede geçmektedir?', answerType: 'open_ended', correctAnswer: 'Kuyu' },
            { id: 'q4', type: 'when', questionText: 'Teke kuyuya ne zaman bakmış?', answerType: 'open_ended', correctAnswer: 'Susadığı sırada geçerken' },
            { id: 'q5', type: 'how', questionText: 'Tilki kuyudan nasıl çıkmış?', answerType: 'open_ended', correctAnswer: 'Tekenin omuzlarına basıp tırmanarak' },
            { id: 'q6', type: 'why', questionText: 'Tilki tekeye neden kızmış?', answerType: 'open_ended', correctAnswer: 'Sonunu düşünmeden kuyuya indiği için / Akılsızlık ettiği için' }
        ]
    },
    {
        id: 'lib-5n1k-5',
        title: 'Atatürk ve Öğretmen',
        text: "Atatürk bir gün bir köy okuluna gitmiş. Sınıfa girdiğinde öğretmen hemen ayağa kalkmış ve yerini ona vermek istemiş. Atatürk \"Hayır, yerinize oturunuz ve dersinize devam ediniz. Unutmayınız ki cumhurbaşkanı bile sınıfta öğretmenden sonra gelir\" demiş. Atatürk, öğretmenlik mesleğine ve eğitime ne kadar değer verdiğini bu sözüyle göstermiş.",
        paragraphs: ["Atatürk bir gün bir köy okuluna gitmiş. Sınıfa girdiğinde öğretmen hemen ayağa kalkmış ve yerini ona vermek istemiş.", "Atatürk \"Hayır, yerinize oturunuz ve dersinize devam ediniz. Unutmayınız ki cumhurbaşkanı bile sınıfta öğretmenden sonra gelir\" demiş. Atatürk, öğretmenlik mesleğine ve eğitime ne kadar değer verdiğini bu sözüyle göstermiş."],
        ageGroup: '11-13',
        difficulty: 'orta',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Atatürk sınıfa girdiğinde kim ayağa kalkmış?', answerType: 'open_ended', correctAnswer: 'Öğretmen' },
            { id: 'q2', type: 'what', questionText: 'Atatürk öğretmene ne demiş?', answerType: 'open_ended', correctAnswer: 'Yerinize oturunuz ve dersinize devam ediniz' },
            { id: 'q3', type: 'where', questionText: 'Atatürk nereye gitmiş?', answerType: 'open_ended', correctAnswer: 'Köy okuluna' },
            { id: 'q4', type: 'when', questionText: 'Atatürk bu sözü ne zaman söylemiş?', answerType: 'open_ended', correctAnswer: 'Ders sırasında sınıfa girdiğinde' },
            { id: 'q5', type: 'why', questionText: 'Öğretmen neden ayağa kalkmış?', answerType: 'open_ended', correctAnswer: 'Atatürk\'e saygı göstermek ve yerini vermek için' },
            { id: 'q6', type: 'inference', questionText: 'Bu hikayenin ana fikri nedir?', answerType: 'open_ended', correctAnswer: 'Öğretmenlik mesleğinin ve eğitimin her şeyden üstün olduğu' }
        ]
    },
    {
        id: 'lib-5n1k-6',
        title: 'Küçük Damla',
        text: 'Ben bir küçük damlayım. Gölde yaşıyordum. Çevremde pek çok arkadaşım vardı. Sonra hava ısındı. Bende hafifledim. Havaya çıkmaya başladım. Annem bana seslendi: "Korkma! Buhar oldun. Yine buluşacağız." Anneme el salladım. Bir süre havada gezindim. Bulutlarla tanıştım. Sonra hava soğudu. Birden yere düşmeye başladım. Hoop! Topraktayım artık. Toprak beni görünce çok sevindi. Sımsıkı sarıldı bana. İçine çekti beni. Toprağın içinde kaydım. Bir de ne göreyim? Yine göldeyim. Hemen annemi buldum. Gördüklerimi ona anlattım. Tekrar yolculuğa çıkmayı merakla bekliyorum.',
        paragraphs: ['Ben bir küçük damlayım. Gölde yaşıyordum. Çevremde pek çok arkadaşım vardı. Sonra hava ısındı. Bende hafifledim. Havaya çıkmaya başladım.', 'Annem bana seslendi: "Korkma! Buhar oldun. Yine buluşacağız." Anneme el salladım. Bir süre havada gezindim. Bulutlarla tanıştım.', 'Sonra hava soğudu. Birden yere düşmeye başladım. Hoop! Topraktayım artık. Toprak beni görünce çok sevindi. Sımsıkı sarıldı bana. İçine çekti beni. Toprağın içinde kaydım. Bir de ne göreyim? Yine göldeyim.'],
        ageGroup: '8-10',
        difficulty: 'orta',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Hikaye kimin ağzından anlatılmaktadır?', answerType: 'open_ended', correctAnswer: 'Küçük Damla' },
            { id: 'q2', type: 'what', questionText: 'Damla havaya çıktığında neye dönüşmüş?', answerType: 'open_ended', correctAnswer: 'Buhar' },
            { id: 'q3', type: 'where', questionText: 'Damla en başta nerede yaşıyordu?', answerType: 'open_ended', correctAnswer: 'Gölde' },
            { id: 'q4', type: 'when', questionText: 'Damla ne zaman hafiflemeye başlamış?', answerType: 'open_ended', correctAnswer: 'Hava ısındığında' },
            { id: 'q5', type: 'how', questionText: 'Damla göle nasıl geri dönmüş?', answerType: 'open_ended', correctAnswer: 'Yağmur olarak toprağa düşüp yer altından kayarak' },
            { id: 'q6', type: 'why', questionText: 'Toprak damlayı neden içine çekmiş?', answerType: 'open_ended', correctAnswer: 'Onu sevdiği ve damlaya sarılmak istediği için (mecazi)' }
        ]
    },
    {
        id: 'lib-5n1k-7',
        title: 'Çilli Horoz',
        text: "Çilli Horoz sabah erkenden kalktı. Zaten Çilli Horoz erken kalkmayı çok seviyordu. Hemen elini yüzünü yıkadı. Sabah hava çok soğuktu. Karnı çok acıkmıştı ama Çilli hemen işe koyuldu. Çünkü erken saatlerde Hasan Dayı'yı uyandırması gerekiyordu. Çilli Horoz uzun uzun öttü. Hasan Dayı uykusundan esneyerek uyandı. Hasan Dayı kümese gitti. Çilli Horoz'a arpa ve yem verdi. Çilli Horoz yemeğini yedi ve bahçede gezmeye başladı.",
        paragraphs: ["Çilli Horoz sabah erkenden kalktı. Zaten Çilli Horoz erken kalkmayı çok seviyordu. Hemen elini yüzünü yıkadı. Sabah hava çok soğuktu. Karnı çok acıkmıştı ama Çilli hemen işe koyuldu.", "Çünkü erken saatlerde Hasan Dayı'yı uyandırması gerekiyordu. Çilli Horoz uzun uzun öttü. Hasan Dayı uykusundan esneyerek uyandı. Hasan Dayı kümese gitti. Çilli Horoz'a arpa ve yem verdi. Çilli Horoz yemeğini yedi ve bahçede gezmeye başladı."],
        ageGroup: '5-7',
        difficulty: 'çok kolay',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Sabah erkenden kalkan kimdir?', answerType: 'open_ended', correctAnswer: 'Çilli Horoz' },
            { id: 'q2', type: 'what', questionText: 'Hasan Dayı Çilli Horoz\'a ne verdi?', answerType: 'open_ended', correctAnswer: 'Arpa ve yem' },
            { id: 'q3', type: 'where', questionText: 'Hasan Dayı nereye gitti?', answerType: 'open_ended', correctAnswer: 'Kümese' },
            { id: 'q4', type: 'when', questionText: 'Çilli Horoz ne zaman kalkmış?', answerType: 'open_ended', correctAnswer: 'Sabah erkenden' },
            { id: 'q5', type: 'how', questionText: 'Hasan Dayı nasıl uyandı?', answerType: 'open_ended', correctAnswer: 'Esneyerek' },
            { id: 'q6', type: 'why', questionText: 'Çilli Horoz neden hemen işe koyuldu?', answerType: 'open_ended', correctAnswer: 'Hasan Dayı\'yı uyandırması gerektiği için' }
        ]
    },
    {
        id: 'lib-5n1k-8',
        title: 'Taşıtların Kıskançlığı',
        text: 'Büyük deniz kıyısındaki bir kentte vapur iskelesi ile tren garı yan yanaymış. Bir gün tren otomobile demiş ki: "Şu otomobiller ne kadar şanslı. İstedikleri her yere, her yola gidiyorlar. Benim ise yolum belli, raylardan ayrılamam." Otomobil ise "Doğru, ben de vapurları kıskanıyorum. Onların altında yumuşacık deniz var, her yer onlara yol" demiş. Vapur cevap vermiş: "Ben de uçakları kıskanıyorum. Onlar özgürce gökyüzünde uçuyorlar." Uçak ise hepsini yukarıdan dinlemiş ve "Yanılıyorsunuz arkadaşlar. Aslında her taşıt kendi yolunda özgür ve değerlidir" demiş.',
        paragraphs: ['Büyük deniz kıyısındaki bir kentte vapur iskelesi ile tren garı yan yanaymış. Bir gün tren otomobile otomobilleri kıskandığını söylemiş. Otomobil ise vapurları kıskandığını eklemiş.', 'Vapur ise uçakları kıskandığını söylemiş. En sonunda uçak hepsine cevap vererek her birinin değerli olduğunu hatırlatmış.'],
        ageGroup: '11-13',
        difficulty: 'orta',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Taşıtlara "Her taşıt değerlidir" diyen kimdir?', answerType: 'open_ended', correctAnswer: 'Uçak' },
            { id: 'q2', type: 'what', questionText: 'Tren neyi kıskanmaktadır?', answerType: 'open_ended', correctAnswer: 'Otomobillerin her yere gidebilmesini' },
            { id: 'q3', type: 'where', questionText: 'İskele ve gar nerededir?', answerType: 'open_ended', correctAnswer: 'Büyük deniz kıyısındaki bir kentte' },
            { id: 'q4', type: 'when', questionText: 'Otomobil ne zaman konuşmuş?', answerType: 'open_ended', correctAnswer: 'Tren ona dert yandığı zaman' },
            { id: 'q5', type: 'how', questionText: 'Uçak diğerlerini nasıl dinlemiş?', answerType: 'open_ended', correctAnswer: 'Yukarıdan' },
            { id: 'q6', type: 'why', questionText: 'Tren neden raylardan ayrılamıyor?', answerType: 'open_ended', correctAnswer: 'Yolu belli olduğu için / Tren olduğu için' }
        ]
    },
    {
        id: 'lib-5n1k-9',
        title: 'Güvercin ile Karınca',
        text: 'Günlerden bir gün çok susayan bir karınca, su içmek için bir derenin kenarına konmuş. Karınca yanlışlıkla suya düşmüş. ZavalIı karınca tam boğulacakken, dalda duran bir güvercin bunu görmüş. Güvercin hemen bir yaprak koparıp suya atmış. Karınca yaprağa tutunup kıyıya çıkmış. O sırada bir avcı güvercini nişan almış. Karınca hemen gidip avcının ayağını ısırmış. Avcı acıyla bağırınca güvercin havalanmış ve kurtulmuş.',
        paragraphs: ['Günlerden bir gün çok susayan bir karınca, su içmek için bir derenin kenarına konmuş. Karınca yanlışlıkla suya düşmüş. Güvercin bir yaprak atarak onu kurtarmış.', 'O sırada bir avcı güvercini nişan almış. Karınca avcının ayağını ısırarak güvercini kurtarmış.'],
        ageGroup: '5-7',
        difficulty: 'kolay',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Avcının ayağını ısıran kimdir?', answerType: 'open_ended', correctAnswer: 'Karınca' },
            { id: 'q2', type: 'what', questionText: 'Güvercin karıncaya ne atmış?', answerType: 'open_ended', correctAnswer: 'Yaprak' },
            { id: 'q3', type: 'where', questionText: 'Karınca nereye düşmüş?', answerType: 'open_ended', correctAnswer: 'Dereye / Suya' },
            { id: 'q4', type: 'when', questionText: 'Güvercin ne zaman havalanmış?', answerType: 'open_ended', correctAnswer: 'Avcı acıyla bağırdığı zaman' },
            { id: 'q5', type: 'how', questionText: 'Karınca avcıyı nasıl engellemiş?', answerType: 'open_ended', correctAnswer: 'Ayağını ısırarak' },
            { id: 'q6', type: 'why', questionText: 'Karınca neden dere kenarına gitmiş?', answerType: 'open_ended', correctAnswer: 'Çok susadığı için / Su içmek için' }
        ]
    },
    {
        id: 'lib-5n1k-10',
        title: 'Can Arı ile Sarı Çiçek',
        text: 'Can Arı her gün yüzlerce çiçeğe konarmış ama sarı çiçeklere hiç konmazmış. Sarı Çiçek buna çok üzülürmüş. Bir gün Can Arı hastalanmış. Arkadaşları onu iyileştirmek için tek bir çare olduğunu, onun da sarı çiçekte bulunan bir vitamin olduğunu öğrenmişler. Sarı Çiçek, Can Arı üzülmesin diye tüm vitaminlerini ona vermiş. Can Arı iyileşince yaptığı hatayı anlamış ve Sarı Çiçekten özür dilemiş.',
        paragraphs: ['Can Arı her gün yüzlerce çiçeğe konarmış ama sarı çiçeklere hiç konmazmış. Sarı Çiçek buna çok üzülürmüş.', 'Bir gün Can Arı hastalanmış. Arkadaşları onu iyileştirmek için tek bir çare olduğunu, onun da sarı çiçekte bulunan bir vitamin olduğunu öğrenmişler.', 'Sarı Çiçek tüm vitaminlerini ona vermiş. Can Arı iyileşince yaptığı hatayı anlamış ve Sarı Çiçekten özür dilemiş.'],
        ageGroup: '8-10',
        difficulty: 'orta',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Vitaminlerini arıya veren kimdir?', answerType: 'open_ended', correctAnswer: 'Sarı Çiçek' },
            { id: 'q2', type: 'what', questionText: 'Can Arı\'yı ne iyileştirebilirmiş?', answerType: 'open_ended', correctAnswer: 'Sarı çiçekteki vitamin' },
            { id: 'q3', type: 'where', questionText: 'Sarı çiçekteki vitamin nerede bulunurmuş?', answerType: 'open_ended', correctAnswer: 'Sarı çiçekte' },
            { id: 'q4', type: 'when', questionText: 'Arı ne zaman hatasını anlamış?', answerType: 'open_ended', correctAnswer: 'İyileştiği zaman' },
            { id: 'q5', type: 'how', questionText: 'Can Arı hatasını nasıl telafi etmiş?', answerType: 'open_ended', correctAnswer: 'Özür dileyerek' },
            { id: 'q6', type: 'why', questionText: 'Sarı Çiçek neden başta çok üzülüyormuş?', answerType: 'open_ended', correctAnswer: 'Can Arı ona hiç konmadığı için' }
        ]
    },
    {
        id: 'lib-5n1k-11',
        title: 'Nasrettin Hoca: Balık Başı',
        text: "Nasrettin Hoca bir gün yolculuk yaparken bir hana uğramış. Yanında bir başka yolcu daha varmış. İkisi de acıkmışlarmış. Hancı onlara pişmiş bir balık getirmiş. Diğer yolcu hemen atılmış ve hocaya: \"Balığın başını ben yemek istiyorum\" demiş. Hoca da itiraz etmemiş, balığın gövdesini yemiş ve bir güzel karnını doyurmuş. Diğer yolcu ise sadece balığın başını yemiş ve sonra hocaya seslenmiş: \"Sen koca gövdeyi yedin, karnını doyurdun. Ben sadece başını yedim, aç kaldım.\" Hoca cevap vermiş: \"Bak balık başı yedin, nasıl da akıllandın!\"",
        paragraphs: ["Nasrettin Hoca bir gün yolculuk yaparken bir hana uğramış. Yanında bir başka yolcu daha varmış. İkisi de acıkmışlarmış. Hancı onlara pişmiş bir balık getirmiş.", "Diğer yolcu hemen balığın başını yemek istemiş. Hoca gövdeyi yemiş. Adam aç kalınca sızlanmış, hoca da ona hazırcevap bir şekilde karşılık vermiş."],
        ageGroup: '8-10',
        difficulty: 'orta',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Balığın başını yemek isteyen kimdir?', answerType: 'open_ended', correctAnswer: 'Diğer yolcu' },
            { id: 'q2', type: 'what', questionText: 'Hancı onlara ne getirmiş?', answerType: 'open_ended', correctAnswer: 'Pişmiş bir balık' },
            { id: 'q3', type: 'where', questionText: 'Olay nerede geçmektedir?', answerType: 'open_ended', correctAnswer: 'Han' },
            { id: 'q4', type: 'when', questionText: 'Hoca ve yolcu ne zaman hana uğramışlar?', answerType: 'open_ended', correctAnswer: 'Yolculuk yaptıkları bir gün' },
            { id: 'q5', type: 'how', questionText: 'Nasrettin Hoca balığın hangi kısmını yemiş?', answerType: 'open_ended', correctAnswer: 'Gövdesini' },
            { id: 'q6', type: 'why', questionText: 'Hoca yolcuya neden "akıllandın" demiştir?', answerType: 'open_ended', correctAnswer: 'Yolcunun yaptığı hatayı fark etmesiyle dalga geçmek için' }
        ]
    },
    {
        id: 'lib-5n1k-12',
        title: 'Kırmızı Balık',
        text: 'Kırmızı Balık, küçük bir gölde yaşarmış. Bir gün canı sıkılmış. Kendini derenin içinde bulmuş. Dere onu bir nehre götürmüş. Nehir denizden de büyükmüş. Masmaviymiş. Üstelik suyu da tuzluymuş. Kırmızı Balık "Bu kadar gezdim, çok yer gördüm. Şimdi gölüme döneyim" demiş. Yolda birçok tehlike atlatmış. Çok yorulmuş. Güçlükle küçük göle dönebilmiş. Gördüklerini arkadaşlarına anlatmış. "Bir daha bilmediğim yerlere gitmeyeceğim" demiş.',
        paragraphs: ['Kırmızı Balık, küçük bir gölde yaşarmış. Bir gün canı sıkılmış. Kendini derenin içinde bulmuş. Dere onu bir nehre götürmüş.', 'Nehir denizden de büyükmüş. Masmaviymiş. Üstelik suyu da tuzluymuş. Kırmızı Balık gördüğü yerlerden yorulunca gölüne dönmüş.'],
        ageGroup: '8-10',
        difficulty: 'kolay',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Yolculuğa çıkan kimdir?', answerType: 'open_ended', correctAnswer: 'Kırmızı Balık' },
            { id: 'q2', type: 'what', questionText: 'Kırmızı balık gittiği yerlerde ne hissetmiş?', answerType: 'open_ended', correctAnswer: 'Yorgunluk / Birçok tehlike atlatmış' },
            { id: 'q3', type: 'where', questionText: 'Kırmızı Balık en sonunda nereye dönmüş?', answerType: 'open_ended', correctAnswer: 'Küçük göle (evine)' },
            { id: 'q4', type: 'when', questionText: 'Balık ne zaman gölüne dönmeye karar vermiş?', answerType: 'open_ended', correctAnswer: 'Çok yer gezip yorulduğu zaman' },
            { id: 'q5', type: 'how', questionText: 'Denizin suyu nasılmış?', answerType: 'open_ended', correctAnswer: 'Tuzlu' },
            { id: 'q6', type: 'why', questionText: 'Balık neden yolculuğa çıkmış?', answerType: 'open_ended', correctAnswer: 'Canı sıkıldığı için' }
        ]
    },
    {
        id: 'lib-5n1k-13',
        title: 'Küçük Ayıcık',
        text: 'Küçük ayıcık uyandı. Çok susamıştı. Annesinden su istedi. Annesi ona "Git dereden su iç, evde su kalmamış" dedi. Küçük ayıcık kırmızı elbisesini giydi, şapkasını taktı ve dereye gitti. Dereye eğildi, suya baktı. Suyun üzerinde kendisini gördü. Onu başka bir ayı zannetti ve korktu. Küçük ayıcık korku ile birden kalktı. Ayağı kaydı suya düştü. Suya düşünce boş yere korktuğunu anladı ve güldü.',
        paragraphs: ['Küçük ayıcık uyandı. Çok susamıştı. Annesi ona "Git dereden su iç, evde su kalmamış" dedi.', 'Küçük ayıcık kırmızı elbisesini giydi, şapkasını taktı ve dereye gitti. Suda kendisini görünce korktu ama sonra suya düşüp gerçeği anladı.'],
        ageGroup: '5-7',
        difficulty: 'çok kolay',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Ayıcığın annesi ona ne demiş?', answerType: 'open_ended', correctAnswer: 'Dereden su içmesini' },
            { id: 'q2', type: 'what', questionText: 'Ayıcık dereye bakınca ne görmüş?', answerType: 'open_ended', correctAnswer: 'Sudaki kendi yansımasını' },
            { id: 'q3', type: 'where', questionText: 'Ayıcık su içmek için nereye gitmiş?', answerType: 'open_ended', correctAnswer: 'Dereye' },
            { id: 'q4', type: 'when', questionText: 'Ayıcık suya ne zaman düşmüş?', answerType: 'open_ended', correctAnswer: 'Suda kendisini görüp korktuğu zaman' },
            { id: 'q5', type: 'how', questionText: 'Ayıcık ne renk elbise giymiş?', answerType: 'open_ended', correctAnswer: 'Kırmızı' },
            { id: 'q6', type: 'why', questionText: 'Küçük ayıcık neden korkmuş?', answerType: 'open_ended', correctAnswer: 'Sudaki yansımasını başka bir ayı zannettiği için' }
        ]
    },
    {
        id: 'lib-5n1k-14',
        title: 'Zeki Köyde',
        text: "Zeki, yaz tatilinde köye gitti. Dedesi Zeki'ye \"Hadi beraber tarlaya gidelim\" dedi. Dedesi ve Zeki, tarlayı motor ile sürdü. Birlikte toprağın içine tohum ektiler, gübre attılar. Tarlanın etrafına telden çit çektiler. Zeki, her gün tarlanın kenarına bir fidan dikti. Ağaç fidana dönüştü. Düzenli olarak suladı. Tarlasından çok ürün aldı. Çünkü Zeki tarlasına çok iyi bakmıştı. Ürünleri dedesi ile birlikte pazarda sattı. Parası ile kendisine kitap ve elbise aldı. Dedesine her işinde yardım etti. İneklere ve koyunlara yem verdi. Her gün onların yumurtalarını topladı. Zeki o yaz tatilinde hem çok eğlendi hem çok çalıştı.",
        paragraphs: ["Zeki, yaz tatilinde köye gitti. Dedesi ile tarlada tohum ektiler, çit çektiler.", "Zeki tarlasına çok iyi baktı, fidan dikti. Ürünleri satıp kitap ve elbise aldı. Hem eğlendi hem çalıştı."],
        ageGroup: '8-10',
        difficulty: 'orta',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Zeki tarlaya kiminle gitti?', answerType: 'open_ended', correctAnswer: 'Dedesiyle' },
            { id: 'q2', type: 'what', questionText: 'Zeki parasıyla ne aldı?', answerType: 'open_ended', correctAnswer: 'Kitap ve elbise' },
            { id: 'q3', type: 'where', questionText: 'Zeki yaz tatilinde nereye gitti?', answerType: 'open_ended', correctAnswer: 'Köye' },
            { id: 'q4', type: 'when', questionText: 'Zeki köye ne zaman gitmiş?', answerType: 'open_ended', correctAnswer: 'Yaz tatilinde' },
            { id: 'q5', type: 'how', questionText: 'Tarlayı ne ile sürdüler?', answerType: 'open_ended', correctAnswer: 'Motor ile' },
            { id: 'q6', type: 'why', questionText: 'Zeki neden tarlasından çok ürün aldı?', answerType: 'open_ended', correctAnswer: 'Tarlasına çok iyi baktığı için' }
        ]
    },
    {
        id: 'lib-5n1k-15',
        title: 'Örnek Davranış',
        text: "Pazar günü Okan, Sinan, Erkan ve Gürkan okulun bahçesinde toplandılar. Hava çok güzeldi. Hemen iki takım kurdular. Maç yapmaya başladılar. Gürkan hakem oldu, Erkan kaleci oldu. Güzelce oynuyorlardı ama bir kaza oldu. Okan topa sert vurunca, top okulun penceresine çarptı ve camı kırdı. Çok üzüldüler. Ne yapacaklarını konuştular ve aralarında para topladılar. Ertesi gün Okan okul müdürüne olanları anlattı. \"Camı ben kırdım\" dedi. Özür diledi. Topladıkları para ile camın parasını ödedi. Müdür Okan'a teşekkür etti. Ona \"Sen iyi bir öğrencisin, aferin\" dedi.",
        paragraphs: ["Pazar günü Okan ve arkadaşları okul bahçesinde maç yaptılar. Okan yanlışlıkla camı kırdı.", "Çocuklar para toplayıp müdüre gittiler. Okan dürüstçe suçunu itiraf etti ve camın parasını ödediler."],
        ageGroup: '11-13',
        difficulty: 'orta',
        questions: [
            { id: 'q1', type: 'who', questionText: 'Müdüre camı kendisinin kırdığını söyleyen kimdir?', answerType: 'open_ended', correctAnswer: 'Okan' },
            { id: 'q2', type: 'what', questionText: 'Çocuklar bahçede ne yapıyorlardı?', answerType: 'open_ended', correctAnswer: 'Maç yapıyorlardı' },
            { id: 'q3', type: 'where', questionText: 'Olay nerede geçmektedir?', answerType: 'open_ended', correctAnswer: 'Okulun bahçesi' },
            { id: 'q4', type: 'when', questionText: 'Maçı ne zaman yaptılar?', answerType: 'open_ended', correctAnswer: 'Pazar günü' },
            { id: 'q5', type: 'how', questionText: 'Cam nasıl kırıldı?', answerType: 'open_ended', correctAnswer: 'Okan topa sert vurunca camı kırdı' },
            { id: 'q6', type: 'why', questionText: 'Müdür Okan\'a neden teşekkür etti?', answerType: 'open_ended', correctAnswer: 'Dürüst davrandığı ve sorumluluk aldığı için' }
        ]
    }
];
