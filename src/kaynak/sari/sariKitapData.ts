import type { SariKitapDifficulty, SariKitapActivityType } from '../../types/sariKitap';
import type { AgeGroup } from '../../types/creativeStudio';

export interface SariKitapSourceEntry {
    id: string;
    title: string;
    text: string;
    ageGroup: AgeGroup;
    difficulty: SariKitapDifficulty;
}

export const SARI_KITAP_SOURCES: Record<SariKitapActivityType, SariKitapSourceEntry[]> = {
    pencere: [
        {
            id: 'pencere-1',
            title: 'Yaramaz Mırnav',
            text: 'Sibel\'in bir kedisi var. Çok iyi ve çok yaramaz bir kedi. Oyun oynamaya bayılır, oynamazsa darılır. Tüyleri bembeyaz burnu kıpkırmızı bir kedi. Kedinin adı Mırnav. Sibel onu süt ile besler. Mırnav sütü şapır şupur içer. Bir gün pencere açılmış. Mırnav pencereye çıkmış. Birden pencere kapanmış ve Mırnav dışarıda kalmış. Çok korkmuş. Sibel Mırnav\'ın sesini duymuş. Onu içeriye almış.',
            ageGroup: '5-7',
            difficulty: 'Başlangıç'
        },
        {
            id: 'pencere-2',
            title: 'Ali\'nin Topu',
            text: 'Altan ve Ali çok iyi arkadaşlarmış. Ali\'ye babası yeni bir top almış. İki arkadaş yeni topla önce futbol, sonra yakar top, en sonunda da saydırmaca oynamışlar. Doyasıya eğlenmişler. Bir bakmışlar akşam olmuş. İkisi de yorgun bir şekilde evlerine dönmüşler. Zamanın nasıl geçtiğini anlamamışlar.',
            ageGroup: '8-10',
            difficulty: 'Orta'
        },
        {
            id: 'pencere-3',
            title: 'Kardeşim Mehmet',
            text: 'Kardeşim Mehmet daha yeni doğdu. O hastanede iken ben onu evde bekliyordum. Babam ve annem hastaneye gitmişler, ben evde teyzem ile birlikte kalmıştım. Akşam saat 8\'de babam eve telefon etti. Teyzem ile konuştular. Teyzem telefonu bana verdi. Babam bana bir tane erkek kardeşin oldu, adını ise Mehmet koyduk dedi. Ben çok heyecanlanmıştım. İki gün sonra babam, annem ve kardeşim geldiler. Mehmet\'i gördüğümde çok sevdim. Küçücük oyuncak bir bebeğe benziyordu.',
            ageGroup: '8-10',
            difficulty: 'İleri'
        },
        {
            id: 'pencere-4',
            title: 'Kurnaz Tilki ile Teke',
            text: 'Bir gün tilkinin biri bir kuyuya düşmüş. Çok uğraşmış ama bir türlü kuyudan çıkamamış. O sırada oradan bir teke geçiyormuş. Teke susadığı için kuyuya bakmış. Kuyuda bir tilki görmüş. Hemen sormuş: "Bu su iyi mi, içilir mi?" Tilki kurnazca gülmüş, suyu bir övmüş ki tekenin ağzının suyu akmış. Tilki, "Hadi durma aşağı in" deyince teke kuyuya inmiş. Suyu kana kana içtikten sonra tilkiye "Eee, nasıl çıkacağız buradan?" diye sormuş. Tilki, "Sen hiç merak etme. Sen şimdi doğrulup ayaklarını duvara dayarsın. Ben senin omuzlarına tırmanıp çıkarım, sonra seni çekerim" demiş. Teke bu aklı beğenmiş. Tilki tekenin omuzlarına basıp dışarı çıkmış ve hemen oradan uzaklaşmış. Teke sitem edince tilki geri dönmüş: "Senin çenendeki kıllar kadar kafanda da akıl olsaydı, nasıl çıkacağını düşünmeden bu kuyuya inmezdin" demiş.',
            ageGroup: '11-13',
            difficulty: 'İleri'
        },
        {
            id: 'pencere-5',
            title: 'Küçük Damla',
            text: 'Ben bir küçük damlayım. Gölde yaşıyordum. Çevremde pek çok arkadaşım vardı. Sonra hava ısındı. Ben de hafifledim. Havaya çıkmaya başladım. Annem bana seslendi: "Korkma! Buhar oldun. Yine buluşacağız." Anneme el salladım. Bir süre havada gezindim. Bulutlarla tanıştım. Sonra hava soğudu. Birden yere düşmeye başladım. Hoop! Topraktayım artık. Toprak beni görünce çok sevindi. Sımsıkı sarıldı bana. İçine çekti beni. Toprağın içinde kaydım. Bir de ne göreyim? Yine göldeyim. Hemen annemi buldum. Gördüklerimi ona anlattım. Tekrar yolculuğa çıkmayı merakla bekliyorum.',
            ageGroup: '5-7',
            difficulty: 'Orta'
        },
        {
            id: 'pencere-6',
            title: 'Kiraz Ağacı',
            text: 'İlkbahar geçmiş, yaz gelmişti. Dallarındaki çiçekler meyve vermeye başlamıştı. Ama tam olarak olgunlaşmamışlardı. Biraz daha güneş görmeye ihtiyacım vardı. Güneş görünce kirazlarım büyüyüp sarıdan kırmızıya döneceklerdi. Kirazlarım olgunlaşınca tonton teyzeler toplayacak, sepetlere koyacaklar, pazarda tezgahlara yayacaklar. Kirazlarımı alan anneler çocuklarını sevindirecek. Çocukların yüzü gülecek.',
            ageGroup: '5-7',
            difficulty: 'Başlangıç'
        },
        {
            id: 'pencere-7',
            title: 'Kırmızı Balık',
            text: 'Kırmızı Balık, küçük bir gölde yaşarmış. Bir gün canı sıkılmış. Kendini derenin içinde bulmuş. Dere onu bir nehre götürmüş. Nehir denizden de büyükmüş. Masmaviymiş. Üstelik suyu da tuzluymuş. Kırmızı Balık, "Bu kadar gezdim, çok yer gördüm. Şimdi gölüme döneyim" demiş. Yolda birçok tehlike atlatmış. Çok yorulmuş. Güçlükle küçük göle dönebilmiş. Gördüklerini arkadaşlarına anlatmış. "Bir daha bilmediğim yerlere gitmeyeceğim" demiş.',
            ageGroup: '8-10',
            difficulty: 'Orta'
        },
        {
            id: 'pencere-8',
            title: 'Küçük Ayıcık',
            text: 'Küçük ayıcık uyandı. Çok susamıştı. Annesinden su istedi. Annesi ona "Git dereden su iç, evde su kalmamış" dedi. Küçük ayıcık kırmızı elbisesini giydi, şapkasını taktı ve dereye gitti. Dereye eğildi, suya baktı. Suyun üzerinde kendisini gördü. Onu başka bir ayı zannetti ve korktu. Küçük ayıcık korku ile birden kalktı. Ayağı kaydı suya düştü. Suya düşünce boş yere korktuğunu anladı ve güldü.',
            ageGroup: '5-7',
            difficulty: 'Başlangıç'
        },
        {
            id: 'pencere-9',
            title: 'Zeki Köyde',
            text: 'Zeki, yaz tatilinde köye gitti. Dedesi Zeki\'ye "Hadi beraber tarlaya gidelim" dedi. Dedesi ve Zeki, tarlayı motor ile sürdü. Birlikte toprağın içine tohum ektiler, gübre attılar. Tarlanın etrafına telden çit çektiler. Zeki, her gün tarlanın kenarına uygun bir fidan dikti. Ağaç fidana, fidan ağaca dönüştü. Düzenli olarak suladı. Tarlasından çok ürün aldı. Çünkü Zeki tarlasına çok iyi bakmıştı. Ürünleri dedesi ile birlikte pazarda sattı. Parası ile kendisine kitap ve elbise aldı. Dedesine her işinde yardım etti. İneklere ve koyunlara yem verdi. Her gün onların yumurtalarını topladı. Zeki o yaz tatilinde hem çok eğlendi hem çok çalıştı.',
            ageGroup: '8-10',
            difficulty: 'Orta'
        },
        {
            id: 'pencere-10',
            title: 'Örnek Davranış',
            text: 'Pazar günü Okan, Sinan, Erkan ve Gürkan okulun bahçesinde toplandılar. Hava çok güzeldi. Hemen iki takım kurdular. Maç yapmaya başladılar. Gürkan hakem oldu, Erkan kaleci oldu. Güzelce oynuyorlardı ama bir kaza oldu. Okan topa sert vurunca, top okulun penceresine çarptı ve camı kırdı. Çok üzüldüler. Ne yapacaklarını konuştular ve aralarında para topladılar. Ertesi gün Okan okul müdürüne olanları anlattı. "Camı ben kırdım" dedi. Özür diledi. Topladıkları para ile camın parasını ödedi. Müdür Okan\'a teşekkür etti. Ona "Sen iyi bir öğrencisin, aferin" dedi.',
            ageGroup: '11-13',
            difficulty: 'Orta'
        },
        {
            id: 'pencere-11',
            title: 'Kara Karga',
            text: 'Bir gün Nasrettin Hoca ile karısı dere kıyısına gitmişler. Orada çamaşır yıkayacaklarmış. Ateşi yakmışlar, kazanı üstüne oturtmuşlar. Tam o sırada bir karga gelmiş. Sabunu kapıp havalanmış. Hocanın karısı üzgün üzgün "Yetiş hoca! Sabun gitti!" diye bağırmış. Hoca karganın arkasından bakmış ve "Üzülme hanım, baksana üstü başı kapkara. O bizden daha kirli. En iyisi o temizlensin" demiş.',
            ageGroup: '8-10',
            difficulty: 'Başlangıç'
        },
        {
            id: 'pencere-12',
            title: 'Tembel Eşek ve Tuz',
            text: 'Bir zamanlar küçük bir köyde bir tüccar yaşarmış. Çeşitli malların ticaretini yaparmış. Tüccarın bir eşeği varmış. Malları eşeğin sırtına yükler ve satmak için pazara götürürmüş. Eşek genç ve güçlüymüş ama en kötü huyu tembel olmasıymış. Sadece boş oturmak, yem yemek ve uyumak istermiş. Bir gün tüccar pazarda satmak için on iki çuval tuz almış. Yükün eşek için ağır olduğunu fark edince çuvallardan birini kendi sırtına almış. Nehirden geçerken eşeğin ayağı taşa takılmış ve suya yuvarlanmış. Suya düştüğünde çuvallardaki tuz erimiş ve yükü çok hafiflemiş. Eşek bunu fark edince çok sevinmiş. Ertesi gün yine tuz yüklenince eşek bilerek suya yatmış ve yükünü hafifletmiş. Tüccar bunu fark edince bir yöntem bulmuş. Ertesi gün eşeğin sırtına tuz yerine pamuk yüklemiş. Eşek yine suya yatınca pamuklar suyu emip ağırlaşmış. Eşek bu kez yüküyle zor bela pazara kadar yürümüş ve bir daha asla suya yatmamış.',
            ageGroup: '11-13',
            difficulty: 'İleri'
        },
        {
            id: 'pencere-13',
            title: 'Tarla Faresi ile Şehir Faresi',
            text: 'Bir zamanlar uzak bir şehirde şehir faresi yaşarmış. Yalnızlıktan sıkılınca kırlara çıkmış ve tarla faresi ile arkadaş olmuş. Şehir faresi arkadaşını yemeğe davet etmiş: "Bu akşam bize gel, sana güzel bir sofra hazırlayayım" demiş. Tarla faresi gitmiş, sofradaki çeşit çeşit yiyecekleri görünce çok sevinmiş. Tam yemeğe başlayacakken bir ses duyulmuş. Şehir faresi hemen deliğe kaçmış, tarla faresi de zorlukla kendini içeri atmış. Tehlike geçince tekrar sofraya oturmuşlar ama her ses duyulduğunda korkuyla deliğe kaçmışlar. Tarla faresi sonunda dayanamamış: "Bu kadar yeter! Korku içinde yemek istemem. Yarın sen bana gel. Kuru ekmek yeriz belki ama kimse bizi korkutamaz" demiş.',
            ageGroup: '11-13',
            difficulty: 'Orta'
        },
        {
            id: 'pencere-14',
            title: 'Altın Yumurtlayan Kaz',
            text: 'Bir zamanlar yoksul bir çiftçi ve karısı varmış. Bu çiftçinin çok sevdiği özel bir kazı varmış. Kazın özelliği her gün bir altın yumurta yumurtlamasıymış. Çiftçi her gün altın yumurtayı şehre götürüp satar ve zenginleşirmiş. Zenginleştikçe çiftçi değişmiş, daha fazla para istemeye başlamış. Her gün bir yumurta ona yetmemeye başlamış. Kazın karnında bir hazine olduğunu düşünmüş. "Kazı kesip karnındaki hazineyi alırsam bir anda çok zengin olurum" demiş. Açgözlülükle bıçağı alıp kazı kesmiş ama karnında ne altın ne de hazine varmış. Kaz öldüğü için elindeki tek altın yumurta kaynağından da olmuş. Çiftçi yaptığına çok pişman olmuş ama iş işten geçmiş.',
            ageGroup: '11-13',
            difficulty: 'Uzman'
        }
    ],
    nokta: [
        {
            id: 'nokta-1',
            title: 'Çilli Horoz',
            text: 'Çilli Horoz sabah erkenden kalktı. Zaten Çilli Horoz erken kalkmayı çok seviyordu. Hemen elini yüzünü yıkadı. Sabah hava çok soğuktu. Karnı çok acıkmıştı ama Çilli hemen işe koyuldu. Çünkü erken saatlerde Hasan Dayı\'yı uyandırması gerekiyordu. Çilli Horoz uzun uzun öttü. Hasan Dayı uykusundan esneyerek uyandı. Hasan Dayı kümese gitti. Çilli Horoz\'a arpa ve yem verdi. Çilli Horoz yemeğini yedi ve bahçede gezmeye başladı.',
            ageGroup: '5-7',
            difficulty: 'Başlangıç'
        },
        {
            id: 'nokta-2',
            title: 'Aslan ile Fare',
            text: 'Aslan ormanda uyuyormuş. Bir fare gelip vücudunun üzerinde dolaşmaya başlamış. Aslan uyanmış, fareyi yakalamış. Küçük fare yalvarmaya başlamış: "Bırak beni, gün olur sana bir iyiliğim dokunur." demiş. Aslan gülmüş ve fareyi bırakmış. Aradan zaman geçmiş. Avcılar aslanı bir tuzağa düşürmüşler. Aslanı bir ağaca sımsıkı bağlamışlar. Fare aslanın inlemelerini duymuş, koşarak gelmiş. Keskin dişleriyle ipleri kemirmiş ve aslanı kurtarmış.',
            ageGroup: '8-10',
            difficulty: 'Orta'
        }
    ],
    kopru: [
        {
            id: 'kopru-1',
            title: 'Ormanlar Kralı',
            text: 'Bir gün aslan ile fil ormanda tartışmaya başlamışlar. Aslan "Bu ormanın en güçlü hayvanı benim." demiş. Fil ise kendisinin daha güçlü olduğunu iddia etmiş. Bakmışlar böyle tartışarak bir yere varamıyorlar, ormandaki tüm hayvanları toplayıp onlara sormaya karar vermişler. En çok oyu alan orman kralı olacakmış. Bütün hayvanlara tek tek sormuşlar.',
            ageGroup: '8-10',
            difficulty: 'Orta'
        },
        {
            id: 'kopru-2',
            title: 'Sivrisinek',
            text: 'Sivrisinek ormanda aslan ve filin yanına gelmiş. "Siz neyi tartışıyorsunuz?" diye sormuş. Aslan ve fil sivrisineğe bakıp kahkahayı basmışlar. "Bizimle dalga mı geçiyorsun?" demişler. Sivrisinek "Siz benim gücümü biliyor musunuz?" demiş. Aslan sinirlenmiş, "Senin gücün ne ki böyle konuşuyorsun? İkimiz de seni tek ayağımızla ezeriz." demiş. Sivrisinek "Gelin de deneyelim." demiş.',
            ageGroup: '11-13',
            difficulty: 'İleri'
        }
    ],
    cift_metin: [
        {
            id: 'cift-metin-1',
            title: 'Cici Kuş ve Kek',
            text: 'Komşumuzun Kerim adında bir muhabbet kuşu var. Adı Cici Kuş. Annesi Kerim\'e sürpriz bir kek yapmaya karar verdi. Cici Kuş kafesinde neşeyle ötüyordu. Kerim mutfaktan gelen güzel kokuları duydu. Annesi fırından taze keki çıkardı. Kerim kuşuna bir parça kek vermek istedi ama annesi kuşların kek yememesi gerektiğini söyledi.',
            ageGroup: '11-13',
            difficulty: 'Orta'
        }
    ],
    bellek: [
        {
            id: 'bellek-1',
            title: 'Doğa Kelimeleri',
            text: 'Ağaç Çiçek Yaprak Orman Dere Dağ Bulut Yağmur Güneş Toprak Kar Deniz Dalga Rüzgar Fırtına Yıldız Ay Gökyüzü Gece Gündüz',
            ageGroup: '8-10',
            difficulty: 'Orta'
        }
    ],
    hizli_okuma: [
        {
            id: 'hizli-okuma-1',
            title: 'Hızlı Okuma Seviye 1',
            text: 'Ali bak. Işık yanıyor. Kitabı oku. Okul açıldı. Kalemi tut. Yazı yaz. Oyun oyna. Eve git. Yemek ye. Süt iç. Uyu uyan. Koş yürü. Zıpla oyna.',
            ageGroup: '5-7',
            difficulty: 'Başlangıç'
        }
    ]
};
