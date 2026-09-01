/**
 * MEB 2024-2025 İlkokul ve Ortaokul Matematik Müfredatı
 * 1. Sınıf - 8. Sınıf Tüm Üniteler ve Kazanımlar
 */

export interface MebKazanim {
    kod: string;
    tanim: string;
    aciklama?: string;
}

export interface MebUnite {
    id: string;
    baslik: string;
    ogrenmeAlani: 'sayilar-islemler' | 'geometri' | 'veri' | 'cebir' | 'olcme';
    kazanimlar: MebKazanim[];
}

export interface MebSinifMufredat {
    sinif: number;
    uniteler: MebUnite[];
}

export const MEB_MATEMATIK_MUFREDATI: Record<number, MebSinifMufredat> = {
    1: {
        sinif: 1,
        uniteler: [
            {
                id: 'unite-1-1',
                baslik: '1. Ünite: Doğal Sayılar (1-20)',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.1.1.1.1', tanim: 'Nesne sayısı 20’ye kadar olan bir gruptaki nesnelerin sayısını belirler ve bu sayıyı rakamla yazar.' },
                    { kod: 'M.1.1.1.2', tanim: '20’ye kadar olan doğal sayıları sıralar ve sayı doğrusunda gösterir.' },
                    { kod: 'M.1.1.1.3', tanim: 'Nesne sayıları 20’den az olan iki gruptaki nesne sayılarını karşılaştırır.' },
                    { kod: 'M.1.1.1.4', tanim: 'Sıra bildiren sayıları (1. Sayı, 2. Sayı) günlük yaşamda kullanır.' },
                    { kod: 'M.1.1.1.5', tanim: '20’ye kadar olan doğal sayıları birer ve ikişer ileriye ve geriye doğru sayar.' },
                ],
            },
            {
                id: 'unite-1-2',
                baslik: '2. Ünite: Doğal Sayılarla Toplama İşlemi',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.1.1.2.1', tanim: 'Toplamları 20’ye kadar olan iki doğal sayının toplama işlemini yapar ve modellenmesini gösterir.' },
                    { kod: 'M.1.1.2.2', tanim: 'Toplama işleminde "artma", "katılma" ve "toplam" kavramlarını ifade eder.' },
                    { kod: 'M.1.1.2.3', tanim: 'Toplananların yeri değiştirildiğinde toplamın değişmediğini fark eder.' },
                    { kod: 'M.1.1.2.4', tanim: 'Doğal sayılarla toplama işlemini gerektiren tek adımlı gerçek yaşam problemlerini çözer.' },
                ],
            },
            {
                id: 'unite-1-3',
                baslik: '3. Ünite: Doğal Sayılarla Çıkarma İşlemi',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.1.1.3.1', tanim: '20’ye kadar olan doğal sayılarla çıkarma işlemi yapar ve nesnelerle modeller.' },
                    { kod: 'M.1.1.3.2', tanim: 'Zihinden çıkarma işlemi tekniklerini basit modellerle uygular.' },
                    { kod: 'M.1.1.3.3', tanim: 'Doğal sayılarla çıkarma işlemini gerektiren tek adımlı sözel problemleri çözer.' },
                ],
            },
            {
                id: 'unite-1-4',
                baslik: '4. Ünite: Geometrik Şekiller ve Örüntüler',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.1.2.1.1', tanim: 'Üçgen, kare, dikdörtgen ve çemberi modelleriyle tanır ve çizer.' },
                    { kod: 'M.1.2.1.2', tanim: 'Geometrik cisim ve şekillerden yararlanarak örüntüler oluşturur ve eksik ögeyi tamamlar.' },
                    { kod: 'M.1.2.1.3', tanim: 'Uzamsal (uzamsal ilişki: altında, üstünde, içinde, dışında) kavramları sözel ifade eder.' },
                ],
            },
            {
                id: 'unite-1-5',
                baslik: '5. Ünite: Zaman ve Ölçme (Paralarımız, Saat)',
                ogrenmeAlani: 'olcme',
                kazanimlar: [
                    { kod: 'M.1.3.1.1', tanim: 'Tam ve yarım saatleri okur ve gösterir.' },
                    { kod: 'M.1.3.2.1', tanim: 'Paralarımızı (1, 5, 10, 25, 50 kr ve 1, 5, 10, 20 TL) tanır.' },
                    { kod: 'M.1.3.3.1', tanim: 'Standart olmayan birimlerle uzunlukları ölçer ve karşılaştırır.' },
                    { kod: 'M.1.3.4.1', tanim: 'Nesneleri kütlelerine göre (hafif-ağır) sıralar.' },
                ],
            },
            {
                id: 'unite-1-6',
                baslik: '6. Ünite: Veri Toplama ve Çetele',
                ogrenmeAlani: 'veri',
                kazanimlar: [
                    { kod: 'M.1.4.1.1', tanim: 'En çok iki veri grubuna sahip basit nesne grafiklerini ve tabloları yorumlar.' },
                ],
            },
        ],
    },
    2: {
        sinif: 2,
        uniteler: [
            {
                id: 'unite-2-1',
                baslik: '1. Ünite: Doğal Sayılar (100’e Kadar)',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.2.1.1.1', tanim: '100’e kadar olan doğal sayıların basamaklarını (onluk ve birlik) modeller ve yazar.' },
                    { kod: 'M.2.1.1.2', tanim: '100’den küçük doğal sayıları en yakın onluğa yuvarlar.' },
                    { kod: 'M.2.1.1.3', tanim: '100’e kadar olan doğal sayıları karşılaştırar sembollerle sıralar.' },
                    { kod: 'M.2.1.1.4', tanim: 'İkişer, üçer, dörder ve beşer ritmik sayar.' },
                ],
            },
            {
                id: 'unite-2-2',
                baslik: '2. Ünite: Doğal Sayılarla Toplama ve Çıkarma',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.2.1.2.1', tanim: 'Eldeli ve eldesiz toplama işlemlerini 100’e kadar olan sayılarla yapar.' },
                    { kod: 'M.2.1.3.1', tanim: 'Onluk bozmayı gerektiren ve gerektirmeyen çıkarma işlemlerini yapar.' },
                    { kod: 'M.2.1.3.2', tanim: 'Toplama ve çıkarma arasındaki ilişkiyi kullanarak verilmeyen terimi bulur.' },
                    { kod: 'M.2.1.3.3', tanim: 'Toplama ve çıkarma işlemleri içeren en çok iki adımlı gerçek yaşam problemlerini çözer.' },
                ],
            },
            {
                id: 'unite-2-3',
                baslik: '3. Ünite: Çarpma ve Bölme İşlemine Giriş',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.2.1.4.1', tanim: 'Çarpma işleminin tekrarlı toplama anlamına geldiğini açıklar ve 1-5 sayılarıyla çarpar.' },
                    { kod: 'M.2.1.5.1', tanim: 'Bölme işleminin eşit paylaşım anlamına geldiğini fark eder ve sembolüyle gösterir.' },
                    { kod: 'M.2.1.5.2', tanim: 'Çarpma ve bölme işlemi içeren tek adımlı basit problemleri çözer.' },
                ],
            },
            {
                id: 'unite-2-4',
                baslik: '4. Ünite: Kesirler ve Zaman Ölçme',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.2.1.6.1', tanim: 'Bütün, yarım ve çeyrek arasındaki ilişkiyi modeller ve açıklar.' },
                    { kod: 'M.2.3.1.1', tanim: 'Tam, yarım ve çeyrek saatleri gösterir ve zaman problemlerini çözer.' },
                    { kod: 'M.2.3.1.2', tanim: 'Gün, hafta, ay, mevsim ve yıl arasındaki ilişkileri açıklar.' },
                ],
            },
            {
                id: 'unite-2-5',
                baslik: '5. Ünite: Geometri, Şekiller ve Örüntüler',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.2.2.1.1', tanim: 'Kare, dikdörtgen, üçgen ve çemberin kenar ve köşe sayılarını belirler.' },
                    { kod: 'M.2.2.2.1', tanim: 'Geometrik şekillerden oluşan belirli bir kuralı olan örüntüleri tamamlar ve kuralını söyler.' },
                ],
            },
            {
                id: 'unite-2-6',
                baslik: '6. Ünite: Paralarımız, Tartma ve Veri',
                ogrenmeAlani: 'olcme',
                kazanimlar: [
                    { kod: 'M.2.3.3.1', tanim: 'Lira ve kuruş ilişkisini gösterir, para hesabına dayalı problemleri çözer.' },
                    { kod: 'M.2.3.4.1', tanim: 'Nesneleri kilogram cinsinden tartar ve ağırlık problemlerini çözer.' },
                    { kod: 'M.2.4.1.1', tanim: 'Şekil ve nesne grafiklerini okur, soruları yanıtlar.' },
                ],
            },
        ],
    },
    3: {
        sinif: 3,
        uniteler: [
            {
                id: 'unite-3-1',
                baslik: '1. Ünite: Üç Basamaklı Doğal Sayılar',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.3.1.1.1', tanim: 'Üç basamaklı doğal sayıları okur, yazar ve basamak değerlerini belirler.' },
                    { kod: 'M.3.1.1.2', tanim: 'Üç basamaklı doğal sayıları en yakın onluğa veya yüzlüğe yuvarlar.' },
                    { kod: 'M.3.1.1.3', tanim: 'Üç basamaklı doğal sayıları sıralar ve tek-çift sayıları ay ayırt eder.' },
                    { kod: 'M.3.1.1.4', tanim: 'Romen rakamlarını (I’den XX’ye kadar) tanır ve kullanır.' },
                ],
            },
            {
                id: 'unite-3-2',
                baslik: '2. Ünite: Doğal Sayılarla Toplama ve Çıkarma',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.3.1.2.1', tanim: 'En çok üç basamaklı sayılarla eldeli toplama ve eldesiz toplama yapar.' },
                    { kod: 'M.3.1.3.1', tanim: 'En çok üç basamaklı sayılarla çıkarma işlemi yapar ve tahmin eder.' },
                    { kod: 'M.3.1.3.2', tanim: 'Toplama ve çıkarma içeren çok adımlı gerçek yaşam problemlerini çözer.' },
                ],
            },
            {
                id: 'unite-3-3',
                baslik: '3. Ünite: Çarpma ve Bölme İşlemleri',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.3.1.4.1', tanim: 'İki basamaklı bir doğal sayı ile bir basamaklı bir doğal sayıyı çarpar.' },
                    { kod: 'M.3.1.5.1', tanim: 'İki basamaklı doğal sayıları bir basamaklı doğal sayılara böler, kalanı yorumlar.' },
                    { kod: 'M.3.1.5.2', tanim: 'Çarpma ve bölme gerektiren iki adımlı problemleri çözer.' },
                ],
            },
            {
                id: 'unite-3-4',
                baslik: '4. Ünite: Kesirler ve Birim Kesir',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.3.1.6.1', tanim: 'Birim kesirleri modeller ve sayı doğrusunda gösterir.' },
                    { kod: 'M.3.1.6.2', tanim: 'Bir çokluğun belirtilen birim kesir kadarını hesaplar.' },
                    { kod: 'M.3.1.6.3', tanim: 'Payı paydasından küçük (basit) kesirleri açıklar ve gösterir.' },
                ],
            },
            {
                id: 'unite-3-5',
                baslik: '5. Ünite: Geometri, Çevre ve Alan Ölçme',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.3.2.1.1', tanim: 'Doğru, ışın, açı ve doğru parçasını tanıtır ve modeller.' },
                    { kod: 'M.3.3.1.1', tanim: 'Kare ve dikdörtgenin çevresini hesaplar ve alanını birim karelerle ölçer.' },
                    { kod: 'M.3.3.2.1', tanim: 'Standart uzunluk ölçme birimlerini (m, cm, mm) kullanır ve dönüştürür.' },
                ],
            },
            {
                id: 'unite-3-6',
                baslik: '6. Ünite: Zaman, Tartma ve Veri Toplama',
                ogrenmeAlani: 'olcme',
                kazanimlar: [
                    { kod: 'M.3.3.3.1', tanim: 'Zaman ölçme birimleri (saat, dakika, saniye) arasındaki dönüşümleri yapar.' },
                    { kod: 'M.3.3.4.1', tanim: 'Kilogram ve gram birimlerini kullanarak tartma problemleri çözer.' },
                    { kod: 'M.3.4.1.1', tanim: 'Çetele ve sıklık tablosu ile nesne ve sütun grafiklerini oluşturur ve yorumlar.' },
                ],
            },
        ],
    },
    4: {
        sinif: 4,
        uniteler: [
            {
                id: 'unite-4-1',
                baslik: '1. Ünite: Dört, Beş ve Altı Basamaklı Doğal Sayılar',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.4.1.1.1', tanim: '4, 5 ve 6 basamaklı doğal sayıları okur, yazar ve basamak değerlerini belirler.' },
                    { kod: 'M.4.1.1.2', tanim: 'Doğal sayıları en yakın binliğe, yüzlüğe veya onluğa yuvarlar.' },
                    { kod: 'M.4.1.1.3', tanim: 'Çok basamaklı doğal sayıları sıralar ve örüntü kuralını belirler.' },
                    { kod: 'M.4.1.2.1', tanim: 'En çok dört basamaklı doğal sayılarla toplama ve çıkarma işlemi yapar.' },
                ],
            },
            {
                id: 'unite-4-2',
                baslik: '2. Ünite: Çarpma ve Bölme İşlemleri',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.4.1.3.1', tanim: 'Üç basamaklı doğal sayılarla iki basamaklı doğal sayıları çarpar.' },
                    { kod: 'M.4.1.4.1', tanim: 'En çok dört basamaklı sayıları iki basamaklı sayılara böler.' },
                    { kod: 'M.4.1.4.2', tanim: 'Çarpma ve bölme işlemlerinin sonuçlarını tahmin eder ve zihinden işlemler yapar.' },
                    { kod: 'M.4.1.4.3', tanim: 'Dört işlem içeren çok adımlı gerçek yaşam problemlerini çözer.' },
                ],
            },
            {
                id: 'unite-4-3',
                baslik: '3. Ünite: Kesirler ve Kesirlerle İşlemler',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.4.1.5.1', tanim: 'Basit, bileşik ve tam sayılı kesirleri tanır, modeller ve dönüştürür.' },
                    { kod: 'M.4.1.5.2', tanim: 'Bir çokluğun istenen kesir kadarını hesaplar.' },
                    { kod: 'M.4.1.5.3', tanim: 'Paydaları eşit kesirlerle toplama ve çıkarma işlemleri yapar ve problemlerini çözer.' },
                ],
            },
            {
                id: 'unite-4-4',
                baslik: '4. Ünite: Ondalık Gösterim ve Zaman Ölçme',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.4.1.6.1', tanim: 'Paydası 10 ve 100 olan kesirleri ondalık gösterim olarak yazar ve okur.' },
                    { kod: 'M.4.1.6.2', tanim: 'Ondalık gösterimlerde basamak isimlerini ve basamak değerlerini belirler.' },
                    { kod: 'M.4.3.2.1', tanim: 'Zaman ölçme birimleriyle (saat, dakika, saniye, yıl, ay, hafta, gün) ilgili problemleri çözer.' },
                ],
            },
            {
                id: 'unite-4-5',
                baslik: '5. Ünite: Açılar, Geometri, Çevre ve Alan',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.4.2.1.1', tanim: 'Açıları derece cinsinden ölçer, dik, dar, geniş ve doğru açı olarak sınıflandırır.' },
                    { kod: 'M.4.3.3.1', tanim: 'Kare ve dikdörtgenin çevre uzunluğunu ve alanını formülle hesaplar.' },
                    { kod: 'M.4.3.3.2', tanim: 'Çevre ve alan ilişkisini içeren problemleri çözer.' },
                ],
            },
            {
                id: 'unite-4-6',
                baslik: '6. Ünite: Tartma, Sıvı Ölçme ve Veri Analizi',
                ogrenmeAlani: 'olcme',
                kazanimlar: [
                    { kod: 'M.4.3.5.1', tanim: 'Ton ve miligramı tanır, kilogram-gram dönüşümlerini yapar.' },
                    { kod: 'M.4.3.6.1', tanim: 'Litre ve mililitreyi miktar ilişkilerine göre yorumlar ve sıvı problemlerini çözer.' },
                    { kod: 'M.4.4.1.1', tanim: 'Sütun grafiği, tablo ve diğer verileri inceleyip yorumlar.' },
                ],
            },
        ],
    },
    5: {
        sinif: 5,
        uniteler: [
            {
                id: 'unite-5-1',
                baslik: '1. Ünite: Doğal Sayılar ve İşlemler (Milyonlar)',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.5.1.1.1', tanim: 'En çok dokuz basamaklı doğal sayıları okur ve yazar.' },
                    { kod: 'M.5.1.1.2', tanim: 'Kuralı verilen sayı ve şekil örüntülerinin istenen adımlarını oluşturur.' },
                    { kod: 'M.5.1.2.1', tanim: 'Doğal sayılarla dört işlem içeren problemleri çözer.' },
                    { kod: 'M.5.1.2.2', tanim: 'Bir doğal sayının karesini (a²) ve küpünü (a³) hesaplar.' },
                ],
            },
            {
                id: 'unite-5-2',
                baslik: '2. Ünite: Kesirler ve Kesirlerle İşlemler',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.5.1.3.1', tanim: 'Bileşik kesri tam sayılı kesre, tam sayılı kesri bileşik kesre dönüştürür.' },
                    { kod: 'M.5.1.3.2', tanim: 'Denk kesirleri elde eder ve kesirleri sıralar.' },
                    { kod: 'M.5.1.4.1', tanim: 'Paydaları eşit veya birbiri katı olan kesirlerle toplama ve çıkarma yapar.' },
                ],
            },
            {
                id: 'unite-5-3',
                baslik: '3. Ünite: Ondalık Gösterim ve Yüzdeler',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.5.1.5.1', tanim: 'Ondalık gösterimleri okur, yazar ve basamak değerlerini gösterir.' },
                    { kod: 'M.5.1.5.2', tanim: 'Ondalık gösterimlerle toplama ve çıkarma işlemleri yapar.' },
                    { kod: 'M.5.1.6.1', tanim: 'Yüzde sembolünü (%) anlar ve kesirlerle ilişkilendirir.' },
                    { kod: 'M.5.1.6.2', tanim: 'Bir çokluğun belirtilen yüzdesini hesaplar ve bütçelerde kullanır.' },
                ],
            },
            {
                id: 'unite-5-4',
                baslik: '4. Ünite: Geometrik Kavramlar, Üçgen ve Dörtgenler',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.5.2.1.1', tanim: 'Doğru, doğru parçası, ışın kavramlarını sembollerle gösterir.' },
                    { kod: 'M.5.2.1.2', tanim: 'Dik, paralel ve kesişen doğruları belirler.' },
                    { kod: 'M.5.2.2.1', tanim: 'Üçgenleri açılarına ve kenarlarına göre sınıflandırır.' },
                    { kod: 'M.5.2.2.2', tanim: 'Paralelkenar, eşkenar dörtgen, yamuk ve dikdörtgenin temel özelliklerini anlar.' },
                ],
            },
            {
                id: 'unite-5-5',
                baslik: '5. Ünite: Veri İşleme ve Uzunluk/Zaman Ölçme',
                ogrenmeAlani: 'veri',
                kazanimlar: [
                    { kod: 'M.5.3.1.1', tanim: 'Araştırma soruları üretir, sıklık tablosu ve sütun grafiği çizer.' },
                    { kod: 'M.5.4.1.1', tanim: 'Uzunluk ölçme birimlerini (km, m, dm, cm, mm) birbirine dönüştürür.' },
                    { kod: 'M.5.4.2.1', tanim: 'Zaman ölçme birimlerini içeren problemleri çözer.' },
                ],
            },
            {
                id: 'unite-5-6',
                baslik: '6. Ünite: Alan Ölçme ve Geometrik Cisimler (Prizma)',
                ogrenmeAlani: 'olcme',
                kazanimlar: [
                    { kod: 'M.5.4.3.1', tanim: 'Dikdörtgenin alanını hesaplar, alan ölçme birimlerini (m², cm²) kullanır.' },
                    { kod: 'M.5.4.4.1', tanim: 'Dikdörtgenler prizmasının açınımını çizer ve yüzey alanını hesaplar.' },
                    { kod: 'M.5.4.5.1', tanim: 'Dikdörtgenler prizmasının hacmini birim küplerle hesaplar.' },
                ],
            },
        ],
    },
    6: {
        sinif: 6,
        uniteler: [
            {
                id: 'unite-6-1',
                baslik: '1. Ünite: Çarpanlar ve Katlar, Üslü İfadeler, Kümeler',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.6.1.1.1', tanim: 'Bir doğal sayının üslü ifadesini (aⁿ) hesaplar ve değerini bulur.' },
                    { kod: 'M.6.1.1.2', tanim: 'İşlem önceliğini dikkate alarak dört işlem yapar.' },
                    { kod: 'M.6.1.2.1', tanim: 'Doğal sayıların çarpanlarını ve katlarını bulur.' },
                    { kod: 'M.6.1.2.2', tanim: '2, 3, 4, 5, 6, 9 ve 10’a kalansız bölünebilme kurallarını açıklar.' },
                    { kod: 'M.6.1.2.3', tanim: 'Asal sayıları tanır ve doğal sayıları asal çarpanlarına ayırır.' },
                    { kod: 'M.6.1.3.1', tanim: 'Kümeler ile ilgili temel kavramları (liste, venn şeması, eleman sayısı) anlar.' },
                ],
            },
            {
                id: 'unite-6-2',
                baslik: '2. Ünite: Tam Sayılar ve Kesirlerle İşlemler',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.6.1.4.1', tanim: 'Tam sayıları (pozitif ve negatif) modeller, sayı doğrusunda gösterir ve sıralar.' },
                    { kod: 'M.6.1.4.2', tanim: 'Bir tam sayının mutlak değerini belirler ve yorumlar.' },
                    { kod: 'M.6.1.5.1', tanim: 'Kesirlerle toplama, çıkarma, çarpma ve bölme işlemlerini yapar.' },
                ],
            },
            {
                id: 'unite-6-3',
                baslik: '3. Ünite: Ondalık Gösterim ve Oran',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.6.1.6.1', tanim: 'Ondalık gösterimleri verilen sayıları 10, 100, 1000 ile kısa yoldan çarpar ve böler.' },
                    { kod: 'M.6.1.6.2', tanim: 'Ondalık gösterimlerle bölme işlemi yapar ve problemleri çözer.' },
                    { kod: 'M.6.1.7.1', tanim: 'İki çokluğun birbirine oranını ifade eder, birimli ve birimsiz oranları ayırt eder.' },
                ],
            },
            {
                id: 'unite-6-4',
                baslik: '4. Ünite: Cebirsel İfadeler ve Veri Analizi',
                ogrenmeAlani: 'cebir',
                kazanimlar: [
                    { kod: 'M.6.2.1.1', tanim: 'Cebirsel ifadeleri yazar ve verilen değişken değerine göre sonucunu hesaplar.' },
                    { kod: 'M.6.3.1.1', tanim: 'Aritmetik ortalama, açıklık kavramlarını hesaplar ve veri gruplarını karşılaştırır.' },
                ],
            },
            {
                id: 'unite-6-5',
                baslik: '5. Ünite: Açılar ve Alan Ölçme',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.6.4.1.1', tanim: 'Açı eşliğini, komşu, tümler, bütünler ve ters açıları belirler.' },
                    { kod: 'M.6.4.2.1', tanim: 'Üçgenin alan bağıntısını oluşturur ve alanını hesaplar.' },
                    { kod: 'M.6.4.2.2', tanim: 'Paralelkenarın alan bağıntısını oluşturur ve problemlerini çözer.' },
                ],
            },
            {
                id: 'unite-6-6',
                baslik: '6. Ünite: Çember, Hacim ve Sıvı Ölçme',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.6.4.3.1', tanim: 'Çemberin uzunluğunu (çevresini) π (pi) sayısı ilişkisiyle hesaplar.' },
                    { kod: 'M.6.4.4.1', tanim: 'Dikdörtgenler prizmasının hacim bağıntısını oluşturur ve hesaplar.' },
                    { kod: 'M.6.4.5.1', tanim: 'Sıvı ölçme birimlerini hacim ölçme birimleriyle ilişkilendirir.' },
                ],
            },
        ],
    },
    7: {
        sinif: 7,
        uniteler: [
            {
                id: 'unite-7-1',
                baslik: '1. Ünite: Tam Sayılarla İşlemler',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.7.1.1.1', tanim: 'Tam sayılarla toplama ve çıkarma işlemlerini yapar.' },
                    { kod: 'M.7.1.1.2', tanim: 'Tam sayılarla çarpma ve bölme işlemlerini yapar.' },
                    { kod: 'M.7.1.1.3', tanim: 'Tam sayıların kendisi ile tekrarlı çarpımını üslü nicelik olarak ifade eder.' },
                    { kod: 'M.7.1.1.4', tanim: 'Tam sayılarla ilgili problem durumlarını çözer.' },
                ],
            },
            {
                id: 'unite-7-2',
                baslik: '2. Ünite: Rasyonel Sayılar ve İşlemler',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.7.1.2.1', tanim: 'Rasyonel sayıları tanır, sayı doğrusunda gösterir ve devirli ondalık açılarını belirtir.' },
                    { kod: 'M.7.1.3.1', tanim: 'Rasyonel sayılarla dört işlem yapar ve çok adımlı işlemleri çözer.' },
                    { kod: 'M.7.1.3.2', tanim: 'Rasyonel sayılarla problem çözme stratejileri geliştirir.' },
                ],
            },
            {
                id: 'unite-7-3',
                baslik: '3. Ünite: Cebirsel İfadeler, Eşitlik ve Denklem',
                ogrenmeAlani: 'cebir',
                kazanimlar: [
                    { kod: 'M.7.2.1.1', tanim: 'Cebirsel ifadelerle toplama ve çıkarma işlemleri yapar, bir doğal sayı ile çarpar.' },
                    { kod: 'M.7.2.2.1', tanim: 'Eşitliğin korunumu ilkesini anlar.' },
                    { kod: 'M.7.2.2.2', tanim: 'Birinci dereceden bir bilinmeyenli denklemleri çözer ve problemlerini kurgular.' },
                ],
            },
            {
                id: 'unite-7-4',
                baslik: '4. Ünite: Oran, Orantı ve Yüzdeler',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.7.1.4.1', tanim: 'Orantıda verilmeyen terimi bulur, doğru ve ters orantı kavramlarını ayırt eder.' },
                    { kod: 'M.7.1.4.2', tanim: 'Doğru ve ters orantı içeren problemleri (ölçek, hız, iş vb.) çözer.' },
                    { kod: 'M.7.1.5.1', tanim: 'Bir çokluğu diğer bir çokluğun yüzdesi olarak hesaplar.' },
                    { kod: 'M.7.1.5.2', tanim: 'Yüzde ile artırma, eksiltme, kâr-zarar, indirim ve faiz problemlerini çözer.' },
                ],
            },
            {
                id: 'unite-7-5',
                baslik: '5. Ünite: Doğrular, Açılar, Çokgenler ve Çember',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.7.3.1.1', tanim: 'Paralel iki doğrunun bir kesenle yaptığı iç ters, dış ters, yöndeş açıları belirler.' },
                    { kod: 'M.7.3.2.1', tanim: 'Düzgün çokgenlerin iç ve dış açılarının ölçülerini hesaplar.' },
                    { kod: 'M.7.3.2.2', tanim: 'Eşkenar dörtgen ve yamuğun alan bağıntılarını oluşturur ve çözer.' },
                    { kod: 'M.7.3.3.1', tanim: 'Çemberde merkeze açı ile yay uzunluğu ve daire diliminin alanını hesaplar.' },
                ],
            },
            {
                id: 'unite-7-6',
                baslik: '6. Ünite: Veri Analizi ve Cisimlerin Görünümü',
                ogrenmeAlani: 'veri',
                kazanimlar: [
                    { kod: 'M.7.4.1.1', tanim: 'Çizgi grafiğini oluşturur ve daire grafiğiyle verileri karşılaştırır.' },
                    { kod: 'M.7.3.4.1', tanim: 'Üç boyutlu cisimlerin farklı yönlerden iki boyutlu görünümlerini çizer.' },
                ],
            },
        ],
    },
    8: {
        sinif: 8,
        uniteler: [
            {
                id: 'unite-8-1',
                baslik: '1. Ünite: Çarpanlar ve Katlar (EBOB-EKOK) ve Üslü İfadeler [LGS]',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.8.1.1.1', tanim: 'Pozitif tam sayıların çarpanlarını bulur, üslü ifadelerin çarpımı şeklinde yazar.' },
                    { kod: 'M.8.1.1.2', tanim: 'İki doğal sayının EBOB ve EKOK’unu hesaplar, ilgili LGS seviyesi problemleri çözer.' },
                    { kod: 'M.8.1.1.3', tanim: 'Verilen iki sayının aralarında asal olup olmadığını belirler.' },
                    { kod: 'M.8.1.2.1', tanim: 'Tam sayıların tam sayı kuvvetlerini hesaplar ve kuralları açıklar.' },
                    { kod: 'M.8.1.2.2', tanim: 'Ondalık gösterimleri 10’un tam sayı kuvvetlerini kullanarak çözümler.' },
                    { kod: 'M.8.1.2.3', tanim: 'Çok büyük ve çok küçük sayıları bilimsel gösterimle ifade eder.' },
                ],
            },
            {
                id: 'unite-8-2',
                baslik: '2. Ünite: Kareköklü İfadeler ve Veri Analizi [LGS]',
                ogrenmeAlani: 'sayilar-islemler',
                kazanimlar: [
                    { kod: 'M.8.1.3.1', tanim: 'Tam kare doğal sayıların kareköklerini belirler.' },
                    { kod: 'M.8.1.3.2', tanim: 'Tam kare olmayan kareköklü bir sayının hangi iki doğal sayı arasında olduğunu bulur.' },
                    { kod: 'M.8.1.3.3', tanim: 'Kareköklü bir ifadeyi a√b şeklinde yazar ve katsayıyı kök içine alır.' },
                    { kod: 'M.8.1.3.4', tanim: 'Kareköklü ifadelerde dört işlem yapar ve gerçek yaşam problemlerinde uygular.' },
                    { kod: 'M.8.4.1.1', tanim: 'En fazla iki veri grubuna ait sütun ve daire grafiklerini yorumlar ve dönüştürür.' },
                ],
            },
            {
                id: 'unite-8-3',
                baslik: '3. Ünite: Olasılık ve Cebirsel İfadeler / Özdeşlikler [LGS]',
                ogrenmeAlani: 'cebir',
                kazanimlar: [
                    { kod: 'M.8.5.1.1', tanim: 'Basit olayların olma olasılığını (Olasılık = İstenen / Tüm Durumlar) hesaplar.' },
                    { kod: 'M.8.2.1.1', tanim: 'Cebirsel ifadeleri çarpar, terim, katsayı ve sabit terimlerini belirler.' },
                    { kod: 'M.8.2.1.2', tanim: 'Özdeşlikleri (Tam Kare Özdeşliği ve İki Kare Farkı) modeller ve çarpanlarına ayırır.' },
                ],
            },
            {
                id: 'unite-8-4',
                baslik: '4. Ünite: Doğrusal Denklemler, Eğim ve Eşitsizlikler [LGS]',
                ogrenmeAlani: 'cebir',
                kazanimlar: [
                    { kod: 'M.8.2.2.1', tanim: 'Birinci dereceden bir bilinmeyenli denklemleri çözer.' },
                    { kod: 'M.8.2.2.2', tanim: 'Koordinat sistemini tanır, iki değişkenli doğrusal denklemlerin grafiklerini çizer.' },
                    { kod: 'M.8.2.2.3', tanim: 'Doğrunun eğimini dikey / yatay uzunluk oranı olarak açıklar ve hesaplar.' },
                    { kod: 'M.8.2.3.1', tanim: 'Birinci dereceden bir bilinmeyenli eşitsizlikleri yazar, sayı doğrusunda gösterir ve çözer.' },
                ],
            },
            {
                id: 'unite-8-5',
                baslik: '5. Ünite: Üçgenler, Pisagor Teoremi ve Eşlik/Benzerlik [LGS]',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.8.3.1.1', tanim: 'Üçgende kenarortay, açıortay ve yüksekliği çizer.' },
                    { kod: 'M.8.3.1.2', tanim: 'Üçgenin kenar uzunlukları ile açıları arasındaki ilişkileri (Üçgen Eşitsizliği) kurar.' },
                    { kod: 'M.8.3.1.3', tanim: 'Pisagor bağıntısını (a² + b² = c²) oluşturur ve ilgili problemleri çözer.' },
                    { kod: 'M.8.3.2.1', tanim: 'Eş ve benzer çokgenlerin kenar ve açı ilişkilerini (benzerlik oranı) belirler.' },
                ],
            },
            {
                id: 'unite-8-6',
                baslik: '6. Ünite: Dönüşüm Geometrisi ve Geometrik Cisimler [LGS]',
                ogrenmeAlani: 'geometri',
                kazanimlar: [
                    { kod: 'M.8.3.3.1', tanim: 'Nokta, doğru parçası ve diğer şekillerin öteleme ve yansıma görüntülerini çizer.' },
                    { kod: 'M.8.3.4.1', tanim: 'Dik prizmaları, dik silindiri, dik piramidi ve koniyi tanır, açınımlarını ve yüzey alanlarını/hacimlerini hesaplar.' },
                ],
            },
        ],
    },
};

export const getMebMufredatBySinif = (sinif: number): MebSinifMufredat | null => {
    return MEB_MATEMATIK_MUFREDATI[sinif] || null;
};
