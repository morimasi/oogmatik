import type { AgeGroup, SariKitapDifficulty, SariKitapActivityType } from '../../types/sariKitap';

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
