/**
 * MEB 2024-2025 Matematik Müfredatı — 1-8. Sınıf
 * MatSinavStudyosu bağımsız veri katmanı
 * Kaynak: supermatsınav.md PRD
 */

import type { MatSinifMufredati, MatKazanim } from '../types/matSinav';

// ─── Müfredat Verisi ──────────────────────────────────────────
export const MEB_MATEMATIK_MUFREDATI: MatSinifMufredati[] = [
    // ══════════════════════════════════════════════════════════════
    // 1. SINIF
    // ══════════════════════════════════════════════════════════════
    {
        sinif: 1,
        uniteler: [
            {
                id: 'mat-1-1',
                baslik: 'Sayılar ve İşlemler',
                ogrenmeAlani: 'Sayılar ve İşlemler',
                kazanimlar: [
                    { kod: 'M.1.1.1.1', tanim: "Nesne sayısı 20'ye kadar (20 dâhil) olan bir topluluktaki nesnelerin sayısını belirler ve bu sayıyı rakamla yazar." },
                    { kod: 'M.1.1.1.2', tanim: "20'ye kadar olan sayıları ileriye ve geriye doğru birer birer ritmik sayar." },
                    { kod: 'M.1.1.1.3', tanim: 'Rakamları okur ve yazar.' },
                    { kod: 'M.1.1.1.4', tanim: '20 içinde iki sayıyı karşılaştırır ve aralarındaki ilişkiyi "büyük", "küçük", "eşit" ifadeleriyle belirtir.' },
                    { kod: 'M.1.1.1.5', tanim: 'Sıra bildiren sayıları sözlü olarak ifade eder.' },
                    { kod: 'M.1.1.2.1', tanim: 'Toplama işleminin anlamını kavrar.' },
                    { kod: 'M.1.1.2.2', tanim: "Toplamları 20'ye kadar (20 dâhil) olan doğal sayılarla toplama işlemini yapar." },
                    { kod: 'M.1.1.2.3', tanim: 'Toplama işleminde verilmeyen toplananı bulur.' },
                    { kod: 'M.1.1.2.4', tanim: 'Zihinden toplama işlemi yapar.' },
                    { kod: 'M.1.1.3.1', tanim: 'Çıkarma işleminin anlamını kavrar.' },
                    { kod: 'M.1.1.3.2', tanim: "20'ye kadar (20 dâhil) olan doğal sayılarla çıkarma işlemini yapar." },
                    { kod: 'M.1.1.3.3', tanim: 'Çıkarma işleminde verilmeyen terimleri bulur.' },
                ],
            },
            {
                id: 'mat-1-2',
                baslik: 'Geometri',
                ogrenmeAlani: 'Geometri',
                kazanimlar: [
                    { kod: 'M.1.2.1.1', tanim: 'Uzamsal ilişkileri ifade eder.' },
                    { kod: 'M.1.2.2.1', tanim: 'Geometrik cisimleri tanır ve isimlendirir.' },
                    { kod: 'M.1.2.2.2', tanim: 'Geometrik şekilleri tanır ve isimlendirir.' },
                    { kod: 'M.1.2.3.1', tanim: 'Bir örüntüdeki ilişkiyi belirler ve örüntüyü tamamlar.' },
                ],
            },
            {
                id: 'mat-1-3',
                baslik: 'Ölçme',
                ogrenmeAlani: 'Ölçme',
                kazanimlar: [
                    { kod: 'M.1.3.1.1', tanim: 'Uzunlukları standart olmayan birimlerle ölçer.' },
                    { kod: 'M.1.3.1.2', tanim: 'Nesneleri uzunlukları yönünden karşılaştırır ve sıralar.' },
                    { kod: 'M.1.3.2.1', tanim: 'Paralarımızı tanır.' },
                    { kod: 'M.1.3.3.1', tanim: 'Zaman ölçme birimlerini tanır.' },
                    { kod: 'M.1.3.3.2', tanim: 'Tam saatleri okur.' },
                ],
            },
            {
                id: 'mat-1-4',
                baslik: 'Veri İşleme',
                ogrenmeAlani: 'Veri İşleme',
                kazanimlar: [
                    { kod: 'M.1.4.1.1', tanim: 'En çok iki veri grubuna ait basit tabloları okur.' },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    // 2. SINIF
    // ══════════════════════════════════════════════════════════════
    {
        sinif: 2,
        uniteler: [
            {
                id: 'mat-2-1',
                baslik: 'Sayılar ve İşlemler',
                ogrenmeAlani: 'Sayılar ve İşlemler',
                kazanimlar: [
                    { kod: 'M.2.1.1.1', tanim: "100'e kadar olan doğal sayıları ileriye doğru birer, beşer ve onar ritmik sayar." },
                    { kod: 'M.2.1.1.2', tanim: "100'den küçük doğal sayıların basamaklarını adlandırır, basamaklarındaki rakamların basamak değerlerini belirtir." },
                    { kod: 'M.2.1.1.3', tanim: "100'den küçük doğal sayıları karşılaştırır ve sıralar." },
                    { kod: 'M.2.1.1.4', tanim: "100'den küçük doğal sayıları en yakın onluğa yuvarlar." },
                    { kod: 'M.2.1.2.1', tanim: "Toplamları 100'e kadar (100 dâhil) olan doğal sayılarla eldesiz ve eldeli toplama işlemini yapar." },
                    { kod: 'M.2.1.2.2', tanim: 'İki sayının toplamını tahmin eder ve tahminini işlem sonucuyla karşılaştırır.' },
                    { kod: 'M.2.1.2.3', tanim: 'Zihinden toplama işlemi yapar.' },
                    { kod: 'M.2.1.2.4', tanim: 'Toplama işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.2.1.3.1', tanim: "100'e kadar olan doğal sayılarla onluk bozmayı gerektiren ve gerektirmeyen çıkarma işlemini yapar." },
                    { kod: 'M.2.1.3.2', tanim: 'İki sayının farkını tahmin eder ve tahminini işlem sonucuyla karşılaştırır.' },
                    { kod: 'M.2.1.3.3', tanim: 'Zihinden çıkarma işlemi yapar.' },
                    { kod: 'M.2.1.3.4', tanim: 'Çıkarma işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.2.1.4.1', tanim: 'Çarpma işleminin tekrarlı toplama olduğunu anlar.' },
                    { kod: 'M.2.1.4.2', tanim: 'Çarpım tablosunu oluşturur.' },
                    { kod: 'M.2.1.4.3', tanim: 'Çarpma işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.2.1.5.1', tanim: 'Bölme işleminin anlamını kavrar.' },
                    { kod: 'M.2.1.5.2', tanim: 'Bölme işlemi gerektiren problemleri çözer.' },
                ],
            },
            {
                id: 'mat-2-2',
                baslik: 'Geometri',
                ogrenmeAlani: 'Geometri',
                kazanimlar: [
                    { kod: 'M.2.2.1.1', tanim: 'Geometrik şekilleri kenar ve köşe sayılarına göre sınıflandırır.' },
                    { kod: 'M.2.2.2.1', tanim: 'Bir örüntüdeki ilişkiyi belirler ve örüntüyü tamamlar.' },
                ],
            },
            {
                id: 'mat-2-3',
                baslik: 'Ölçme',
                ogrenmeAlani: 'Ölçme',
                kazanimlar: [
                    { kod: 'M.2.3.1.1', tanim: 'Standart uzunluk ölçme birimlerini tanır.' },
                    { kod: 'M.2.3.1.2', tanim: 'Metre ve santimetre arasındaki ilişkiyi açıklar.' },
                    { kod: 'M.2.3.2.1', tanim: 'Tam, yarım ve çeyrek saatleri okur.' },
                    { kod: 'M.2.3.3.1', tanim: 'Paralarımızla ilgili problemleri çözer.' },
                    { kod: 'M.2.3.4.1', tanim: 'Nesneleri gram ve kilogram birimleriyle tartar.' },
                ],
            },
            {
                id: 'mat-2-4',
                baslik: 'Veri İşleme',
                ogrenmeAlani: 'Veri İşleme',
                kazanimlar: [
                    { kod: 'M.2.4.1.1', tanim: 'Veri toplar ve çetele tablosu oluşturur.' },
                    { kod: 'M.2.4.1.2', tanim: 'Nesne ve şekil grafiği oluşturur.' },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    // 3. SINIF
    // ══════════════════════════════════════════════════════════════
    {
        sinif: 3,
        uniteler: [
            {
                id: 'mat-3-1',
                baslik: 'Sayılar ve İşlemler',
                ogrenmeAlani: 'Sayılar ve İşlemler',
                kazanimlar: [
                    { kod: 'M.3.1.1.1', tanim: 'Üç basamaklı doğal sayıları okur ve yazar.' },
                    { kod: 'M.3.1.1.2', tanim: 'Üç basamaklı doğal sayıların basamak adlarını, basamaklarındaki rakamların basamak değerlerini belirler.' },
                    { kod: 'M.3.1.1.3', tanim: "1000'e kadar olan doğal sayıları karşılaştırır ve sıralar." },
                    { kod: 'M.3.1.1.4', tanim: "1000'e kadar olan doğal sayıları en yakın onluğa ve yüzlüğe yuvarlar." },
                    { kod: 'M.3.1.1.5', tanim: '1000 içinde altışar, yedişer, sekizer, dokuzar ileriye ritmik sayar.' },
                    { kod: 'M.3.1.2.1', tanim: 'En çok üç basamaklı sayılarla eldesiz ve eldeli toplama işlemini yapar.' },
                    { kod: 'M.3.1.2.2', tanim: 'İki sayının toplamını tahmin eder ve tahminini işlem sonucuyla karşılaştırır.' },
                    { kod: 'M.3.1.2.3', tanim: 'Toplama işleminin özelliklerini kullanır.' },
                    { kod: 'M.3.1.2.4', tanim: 'Toplama işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.3.1.3.1', tanim: 'En çok üç basamaklı sayılardan, en çok üç basamaklı sayıları çıkarır.' },
                    { kod: 'M.3.1.3.2', tanim: 'Zihinden çıkarma işlemi yapar.' },
                    { kod: 'M.3.1.3.3', tanim: 'Çıkarma işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.3.1.4.1', tanim: 'Çarpma işleminin özelliklerini kullanır.' },
                    { kod: 'M.3.1.4.2', tanim: 'Üç basamaklı bir doğal sayı ile bir basamaklı bir doğal sayıyı çarpar.' },
                    { kod: 'M.3.1.4.3', tanim: 'İki basamaklı bir doğal sayı ile en çok iki basamaklı bir doğal sayıyı çarpar.' },
                    { kod: 'M.3.1.4.4', tanim: 'Zihinden çarpma işlemi yapar.' },
                    { kod: 'M.3.1.4.5', tanim: 'Çarpma işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.3.1.5.1', tanim: 'İki basamaklı bir doğal sayıyı bir basamaklı bir doğal sayıya böler.' },
                    { kod: 'M.3.1.5.2', tanim: 'Bölme işleminde kalanı yorumlar.' },
                    { kod: 'M.3.1.5.3', tanim: 'Bölme işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.3.1.6.1', tanim: 'Birim kesirleri tanır ve modellerle gösterir.' },
                    { kod: 'M.3.1.6.2', tanim: 'Bir bütünün belirtilen birim kesir kadarını belirler.' },
                    { kod: 'M.3.1.6.3', tanim: 'Paydası 10 ve 100 olan kesirleri birim kesir olarak ifade eder.' },
                ],
            },
            {
                id: 'mat-3-2',
                baslik: 'Geometri',
                ogrenmeAlani: 'Geometri',
                kazanimlar: [
                    { kod: 'M.3.2.1.1', tanim: 'Nokta, doğru, doğru parçası ve ışını açıklar.' },
                    { kod: 'M.3.2.1.2', tanim: 'Düzlem ve düzlemsel şekilleri açıklar.' },
                    { kod: 'M.3.2.2.1', tanim: 'Açıları isimlendirir ve sınıflandırır.' },
                    { kod: 'M.3.2.2.2', tanim: 'Üçgen, kare, dikdörtgeni kenarlarına ve açılarına göre sınıflandırır.' },
                    { kod: 'M.3.2.3.1', tanim: 'Tekrarlayan bir geometrik örüntü oluşturur ve örüntünün kuralını açıklar.' },
                    { kod: 'M.3.2.4.1', tanim: 'Düzlemsel şekillerin simetri doğrularını belirler ve çizer.' },
                ],
            },
            {
                id: 'mat-3-3',
                baslik: 'Ölçme',
                ogrenmeAlani: 'Ölçme',
                kazanimlar: [
                    { kod: 'M.3.3.1.1', tanim: 'Metre ve santimetre arasındaki ilişkiyi fark eder ve birbiri cinsinden yazar.' },
                    { kod: 'M.3.3.1.2', tanim: 'Kilometrenin kullanım alanlarını belirtir.' },
                    { kod: 'M.3.3.1.3', tanim: 'Uzunluk ölçme birimleriyle ilgili problemleri çözer.' },
                    { kod: 'M.3.3.2.1', tanim: 'Şekillerin çevre uzunluğunu hesaplar.' },
                    { kod: 'M.3.3.2.2', tanim: 'Çevre uzunlukları ile ilgili problemleri çözer.' },
                    { kod: 'M.3.3.3.1', tanim: 'Alanın, standart olmayan birimlerle ölçülebileceğini fark eder.' },
                    { kod: 'M.3.3.4.1', tanim: 'Saat, dakika ve saniye arasındaki ilişkiyi açıklar.' },
                    { kod: 'M.3.3.4.2', tanim: 'Zaman ölçme birimleriyle ilgili problemleri çözer.' },
                    { kod: 'M.3.3.5.1', tanim: 'Lira ve kuruş ilişkisini gösterir.' },
                    { kod: 'M.3.3.5.2', tanim: 'Paralarımızla ilgili problemleri çözer.' },
                    { kod: 'M.3.3.6.1', tanim: 'Kilogram ve gram arasındaki ilişkiyi fark eder.' },
                    { kod: 'M.3.3.6.2', tanim: 'Tartma ile ilgili problemleri çözer.' },
                    { kod: 'M.3.3.7.1', tanim: 'Litre ve yarım litreyi kullanır.' },
                    { kod: 'M.3.3.7.2', tanim: 'Sıvı ölçme ile ilgili problemleri çözer.' },
                ],
            },
            {
                id: 'mat-3-4',
                baslik: 'Veri İşleme',
                ogrenmeAlani: 'Veri İşleme',
                kazanimlar: [
                    { kod: 'M.3.4.1.1', tanim: 'Nesne ve şekil grafikleri oluşturur ve yorumlar.' },
                    { kod: 'M.3.4.1.2', tanim: 'Sıklık tablosu oluşturur.' },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    // 4. SINIF
    // ══════════════════════════════════════════════════════════════
    {
        sinif: 4,
        uniteler: [
            {
                id: 'mat-4-1',
                baslik: 'Sayılar ve İşlemler',
                ogrenmeAlani: 'Sayılar ve İşlemler',
                kazanimlar: [
                    { kod: 'M.4.1.1.1', tanim: '4, 5 ve 6 basamaklı doğal sayıları okur ve yazar.' },
                    { kod: 'M.4.1.1.2', tanim: 'Milyonlar basamağına kadar olan doğal sayıları okur ve yazar.' },
                    { kod: 'M.4.1.1.3', tanim: 'Doğal sayıları en yakın onluğa veya yüzlüğe yuvarlar.' },
                    { kod: 'M.4.1.1.4', tanim: 'Sayı örüntülerindeki ilişkiyi bulur ve örüntüyü genişletir.' },
                    { kod: 'M.4.1.2.1', tanim: 'En çok dört basamaklı doğal sayılarla toplama işlemi yapar.' },
                    { kod: 'M.4.1.2.2', tanim: 'Zihinden toplama işlemi yapar.' },
                    { kod: 'M.4.1.2.3', tanim: 'Toplama işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.4.1.3.1', tanim: 'En çok dört basamaklı doğal sayılarla çıkarma işlemi yapar.' },
                    { kod: 'M.4.1.3.2', tanim: 'Zihinden çıkarma işlemi yapar.' },
                    { kod: 'M.4.1.3.3', tanim: 'Çıkarma işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.4.1.4.1', tanim: 'En çok üç basamaklı bir doğal sayı ile en çok iki basamaklı bir doğal sayıyı çarpar.' },
                    { kod: 'M.4.1.4.2', tanim: 'Çarpma işleminin sonucunu tahmin eder.' },
                    { kod: 'M.4.1.5.1', tanim: 'En çok dört basamaklı bir doğal sayıyı en çok iki basamaklı bir doğal sayıya böler.' },
                    { kod: 'M.4.1.5.2', tanim: 'Bölme işleminin sonucunu tahmin eder.' },
                    { kod: 'M.4.1.5.3', tanim: 'Zihinden bölme işlemi yapar.' },
                    { kod: 'M.4.1.6.1', tanim: 'Basit, bileşik ve tam sayılı kesirleri tanır ve modellerle gösterir.' },
                    { kod: 'M.4.1.6.2', tanim: 'Kesirleri karşılaştırır ve sıralar.' },
                    { kod: 'M.4.1.6.3', tanim: 'Bir çokluğun belirtilen basit kesir kadarını bulur.' },
                    { kod: 'M.4.1.7.1', tanim: 'Kesirlerle toplama ve çıkarma işlemi yapar.' },
                ],
            },
            {
                id: 'mat-4-2',
                baslik: 'Geometri',
                ogrenmeAlani: 'Geometri',
                kazanimlar: [
                    { kod: 'M.4.2.1.1', tanim: 'Açının kenarlarını ve köşesini isimlendirir.' },
                    { kod: 'M.4.2.1.2', tanim: 'Açıları standart olmayan birimlerle ölçer ve standart açı ölçme birimlerinin gerekliliğini açıklar.' },
                    { kod: 'M.4.2.1.3', tanim: 'Açıları standart birimlerle ölçer.' },
                    { kod: 'M.4.2.2.1', tanim: 'Üçgenleri kenar uzunluklarına göre sınıflandırır.' },
                    { kod: 'M.4.2.2.2', tanim: 'Üçgenleri açılarına göre sınıflandırır.' },
                    { kod: 'M.4.2.2.3', tanim: 'Kare ve dikdörtgenin kenar ve açı özelliklerini belirler.' },
                    { kod: 'M.4.2.3.1', tanim: 'Düzlemsel şekillerin simetri doğrularını belirler.' },
                ],
            },
            {
                id: 'mat-4-3',
                baslik: 'Ölçme',
                ogrenmeAlani: 'Ölçme',
                kazanimlar: [
                    { kod: 'M.4.3.1.1', tanim: 'Uzunluk ölçme birimleri ile ilgili problemleri çözer.' },
                    { kod: 'M.4.3.1.2', tanim: 'Metre, santimetre ve milimetre arasındaki ilişkiyi açıklar.' },
                    { kod: 'M.4.3.1.3', tanim: 'Kilometre ve metre arasındaki ilişkiyi açıklar.' },
                    { kod: 'M.4.3.2.1', tanim: 'Kare ve dikdörtgenin çevre uzunlukları ile kenar uzunlukları arasındaki ilişkiyi açıklar.' },
                    { kod: 'M.4.3.2.2', tanim: 'Çevre uzunluğu ile ilgili problemleri çözer.' },
                    { kod: 'M.4.3.2.3', tanim: 'Üçgenin çevre uzunluğunu hesaplar.' },
                    { kod: 'M.4.3.3.1', tanim: 'Dikdörtgenin alanını hesaplar.' },
                    { kod: 'M.4.3.3.2', tanim: 'Alanı ile ilgili problemleri çözer.' },
                    { kod: 'M.4.3.4.1', tanim: 'Zaman ölçü birimleri arasındaki ilişkiyi açıklar.' },
                    { kod: 'M.4.3.4.2', tanim: 'Zaman ölçme birimleri ile ilgili problemleri çözer.' },
                ],
            },
            {
                id: 'mat-4-4',
                baslik: 'Veri İşleme',
                ogrenmeAlani: 'Veri İşleme',
                kazanimlar: [
                    { kod: 'M.4.4.1.1', tanim: 'Sütun grafiği oluşturur ve yorumlar.' },
                    { kod: 'M.4.4.1.2', tanim: 'Sütun grafiği, tablo ve diğer grafiklerle gösterilen bilgileri kullanarak günlük hayatla ilgili problemler çözer.' },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    // 5. SINIF
    // ══════════════════════════════════════════════════════════════
    {
        sinif: 5,
        uniteler: [
            {
                id: 'mat-5-1',
                baslik: 'Sayılar ve İşlemler',
                ogrenmeAlani: 'Sayılar ve İşlemler',
                kazanimlar: [
                    { kod: 'M.5.1.1.1', tanim: 'Milyonlu sayıları okur ve yazar.' },
                    { kod: 'M.5.1.1.2', tanim: 'Doğal sayıları en yakın onluğa, yüzlüğe veya binliğe yuvarlar.' },
                    { kod: 'M.5.1.1.3', tanim: 'Sayı ve şekil örüntülerinin kuralını bulur ve örüntüyü genişletir.' },
                    { kod: 'M.5.1.2.1', tanim: 'Doğal sayılarla zihinden toplama ve çıkarma işlemlerinde strateji belirler ve kullanır.' },
                    { kod: 'M.5.1.2.2', tanim: 'Doğal sayılarla çarpma ve bölme işlemlerinin sonuçlarını tahmin eder.' },
                    { kod: 'M.5.1.2.3', tanim: 'Bir doğal sayının karesini ve küpünü hesaplar.' },
                    { kod: 'M.5.1.2.4', tanim: 'Parantezli işlemleri yapar.' },
                    { kod: 'M.5.1.2.5', tanim: 'Doğal sayılarla dört işlem yapmayı gerektiren problemleri çözer.' },
                    { kod: 'M.5.1.3.1', tanim: 'Kesirleri sıralar.' },
                    { kod: 'M.5.1.3.2', tanim: 'Tam sayılı kesri bileşik kesre, bileşik kesri tam sayılı kesre dönüştürür.' },
                    { kod: 'M.5.1.4.1', tanim: 'Kesirlerle toplama ve çıkarma işlemi yapar.' },
                    { kod: 'M.5.1.4.2', tanim: 'Bir çokluğun belirtilen bir basit kesir kadarını ve basit kesir kadarı verilen bir çokluğun tamamını bulur.' },
                    { kod: 'M.5.1.4.3', tanim: 'Kesirlerle toplama ve çıkarma işlemi gerektiren problemleri çözer.' },
                    { kod: 'M.5.1.5.1', tanim: 'Ondalık gösterimleri okur ve yazar.' },
                    { kod: 'M.5.1.5.2', tanim: 'Ondalık gösterimlerde basamak değerlerini belirler.' },
                    { kod: 'M.5.1.5.3', tanim: 'Ondalık gösterimleri verilen sayıları sıralar.' },
                    { kod: 'M.5.1.5.4', tanim: 'Ondalık gösterimlerle toplama ve çıkarma işlemi yapar.' },
                    { kod: 'M.5.1.6.1', tanim: 'Yüzdeleri, kesir ve ondalık gösterimle ilişkilendirir.' },
                    { kod: 'M.5.1.6.2', tanim: 'Bir çokluğun belirtilen bir yüzdesine karşılık gelen miktarı bulur.' },
                    { kod: 'M.5.1.6.3', tanim: 'Yüzde ile ilgili problemleri çözer.' },
                ],
            },
            {
                id: 'mat-5-2',
                baslik: 'Geometri',
                ogrenmeAlani: 'Geometri',
                kazanimlar: [
                    { kod: 'M.5.2.1.1', tanim: 'Temel geometrik kavramları tanır.' },
                    { kod: 'M.5.2.1.2', tanim: 'Doğruya, bir noktasından veya dışındaki bir noktadan dikme çizer.' },
                    { kod: 'M.5.2.1.3', tanim: 'Bir doğru parçasına paralel bir doğru parçası inşa eder.' },
                    { kod: 'M.5.2.2.1', tanim: 'Çokgenleri isimlendirir, oluşturur ve temel elemanlarını tanır.' },
                    { kod: 'M.5.2.2.2', tanim: 'Üçgen ve dörtgenlerin iç açılarının ölçüleri toplamını belirler ve verilmeyen açıyı bulur.' },
                ],
            },
            {
                id: 'mat-5-3',
                baslik: 'Ölçme',
                ogrenmeAlani: 'Ölçme',
                kazanimlar: [
                    { kod: 'M.5.3.1.1', tanim: 'Uzunluk ölçme birimlerini (km, m, cm, mm) birbirine dönüştürür.' },
                    { kod: 'M.5.3.1.2', tanim: 'Zaman ölçü birimlerini (yıl, ay, hafta, gün) birbirine dönüştürür.' },
                    { kod: 'M.5.3.1.3', tanim: 'Uzunluk ve zaman ölçme birimleri ile ilgili problemleri çözer.' },
                    { kod: 'M.5.3.2.1', tanim: 'Dikdörtgenin alanını hesaplamayı gerektiren problemleri çözer.' },
                    { kod: 'M.5.3.2.2', tanim: 'Üçgenin alanını hesaplar.' },
                    { kod: 'M.5.3.3.1', tanim: 'Dikdörtgenler prizmasının yüzey alanını hesaplar.' },
                    { kod: 'M.5.3.3.2', tanim: 'Dikdörtgenler prizmasının hacmini hesaplar.' },
                ],
            },
            {
                id: 'mat-5-4',
                baslik: 'Veri İşleme',
                ogrenmeAlani: 'Veri İşleme',
                kazanimlar: [
                    { kod: 'M.5.4.1.1', tanim: 'Araştırma soruları üretir, veri toplar ve düzenler.' },
                    { kod: 'M.5.4.1.2', tanim: 'Sıklık tablosu ve sütun grafiği oluşturur.' },
                    { kod: 'M.5.4.1.3', tanim: 'Bir veri grubuna ait aritmetik ortalamayı hesaplar ve yorumlar.' },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    // 6. SINIF
    // ══════════════════════════════════════════════════════════════
    {
        sinif: 6,
        uniteler: [
            {
                id: 'mat-6-1',
                baslik: 'Sayılar ve İşlemler',
                ogrenmeAlani: 'Sayılar ve İşlemler',
                kazanimlar: [
                    { kod: 'M.6.1.1.1', tanim: 'Bir doğal sayının kendisiyle tekrarlı çarpımını üslü ifade olarak yazar ve değerini hesaplar.' },
                    { kod: 'M.6.1.1.2', tanim: 'İşlem önceliğini dikkate alarak doğal sayılarla dört işlem yapar.' },
                    { kod: 'M.6.1.2.1', tanim: 'Doğal sayıların çarpanlarını ve katlarını belirler.' },
                    { kod: 'M.6.1.2.2', tanim: 'Bölünebilme kurallarını açıklar ve kullanır.' },
                    { kod: 'M.6.1.2.3', tanim: 'Asal sayıları özellikleriyle belirler.' },
                    { kod: 'M.6.1.3.1', tanim: 'Kümeler ile ilgili temel kavramları anlar.' },
                    { kod: 'M.6.1.4.1', tanim: 'Tam sayıları tanır ve sayı doğrusunda gösterir.' },
                    { kod: 'M.6.1.5.1', tanim: 'Kesirleri karşılaştırır, sıralar ve sayı doğrusunda gösterir.' },
                    { kod: 'M.6.1.5.2', tanim: 'Kesirlerle toplama, çıkarma, çarpma ve bölme işlemlerini yapar.' },
                    { kod: 'M.6.1.6.1', tanim: 'Ondalık gösterimleri verilen sayıları çözümler.' },
                    { kod: 'M.6.1.7.1', tanim: 'İki çokluğun oranını ifade eder.' },
                ],
            },
            {
                id: 'mat-6-2',
                baslik: 'Cebir',
                ogrenmeAlani: 'Cebir',
                kazanimlar: [
                    { kod: 'M.6.2.1.1', tanim: 'Sözel olarak verilen bir duruma uygun cebirsel ifade ve verilen bir cebirsel ifadeye uygun sözel bir durum yazar.' },
                ],
            },
            {
                id: 'mat-6-3',
                baslik: 'Geometri ve Ölçme',
                ogrenmeAlani: 'Geometri ve Ölçme',
                kazanimlar: [
                    { kod: 'M.6.3.1.1', tanim: 'Açıyı başlangıç noktaları aynı olan iki ışının oluşturduğu şekil olarak tanır ve sembolle gösterir.' },
                    { kod: 'M.6.3.2.1', tanim: 'Üçgenin alan bağıntısını oluşturur ve ilgili problemleri çözer.' },
                    { kod: 'M.6.3.3.1', tanim: 'Çember çizerek merkezini, yarıçapını ve çapını tanır.' },
                ],
            },
            {
                id: 'mat-6-4',
                baslik: 'Veri İşleme',
                ogrenmeAlani: 'Veri İşleme',
                kazanimlar: [
                    { kod: 'M.6.4.1.1', tanim: 'İki veri grubuna ait verileri karşılaştırmayı gerektiren araştırma soruları oluşturur.' },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    // 7. SINIF
    // ══════════════════════════════════════════════════════════════
    {
        sinif: 7,
        uniteler: [
            {
                id: 'mat-7-1',
                baslik: 'Sayılar ve İşlemler',
                ogrenmeAlani: 'Sayılar ve İşlemler',
                kazanimlar: [
                    { kod: 'M.7.1.1.1', tanim: 'Tam sayılarla toplama ve çıkarma işlemlerini yapar, ilgili problemleri çözer.' },
                    { kod: 'M.7.1.1.2', tanim: 'Tam sayılarla çarpma ve bölme işlemlerini yapar.' },
                    { kod: 'M.7.1.2.1', tanim: 'Rasyonel sayıları tanır ve sayı doğrusunda gösterir.' },
                    { kod: 'M.7.1.3.1', tanim: 'Rasyonel sayılarla toplama, çıkarma, çarpma ve bölme işlemlerini yapar.' },
                    { kod: 'M.7.1.4.1', tanim: 'Birbirine oranı verilen iki çokluktan biri verildiğinde diğerini bulur.' },
                    { kod: 'M.7.1.5.1', tanim: 'Bir çokluğun belirtilen bir yüzdesine karşılık gelen miktarını bulur.' },
                ],
            },
            {
                id: 'mat-7-2',
                baslik: 'Cebir',
                ogrenmeAlani: 'Cebir',
                kazanimlar: [
                    { kod: 'M.7.2.1.1', tanim: 'Cebirsel ifadelerle toplama ve çıkarma işlemleri yapar.' },
                    { kod: 'M.7.2.2.1', tanim: 'Birinci dereceden bir bilinmeyenli denklemleri kurar ve çözer.' },
                ],
            },
            {
                id: 'mat-7-3',
                baslik: 'Geometri ve Ölçme',
                ogrenmeAlani: 'Geometri ve Ölçme',
                kazanimlar: [
                    { kod: 'M.7.3.1.1', tanim: 'Bir açıya eş bir açı çizer ve bir açıyı iki eş açıya ayırır.' },
                    { kod: 'M.7.3.2.1', tanim: 'Düzgün çokgenlerin kenar ve açı özelliklerini açıklar.' },
                    { kod: 'M.7.3.3.1', tanim: 'Çemberde merkez açıları, gördüğü yayları ve ölçüleri arasındaki ilişkileri belirler.' },
                ],
            },
            {
                id: 'mat-7-4',
                baslik: 'Veri İşleme',
                ogrenmeAlani: 'Veri İşleme',
                kazanimlar: [
                    { kod: 'M.7.4.1.1', tanim: 'Verilere ilişkin çizgi grafiği oluşturur ve yorumlar.' },
                ],
            },
        ],
    },

    // ══════════════════════════════════════════════════════════════
    // 8. SINIF
    // ══════════════════════════════════════════════════════════════
    {
        sinif: 8,
        uniteler: [
            {
                id: 'mat-8-1',
                baslik: 'Sayılar ve İşlemler',
                ogrenmeAlani: 'Sayılar ve İşlemler',
                kazanimlar: [
                    { kod: 'M.8.1.1.1', tanim: 'Verilen pozitif tam sayıların pozitif tam sayı çarpanlarını bulur.' },
                    { kod: 'M.8.1.1.2', tanim: 'İki doğal sayının en büyük ortak bölenini (EBOB) ve en küçük ortak katını (EKOK) hesaplar.' },
                    { kod: 'M.8.1.2.1', tanim: 'Tam sayıların, tam sayı kuvvetlerini hesaplar.' },
                    { kod: 'M.8.1.3.1', tanim: 'Tam kare pozitif tam sayılarla bu sayıların karekökleri arasındaki ilişkiyi belirler.' },
                ],
            },
            {
                id: 'mat-8-2',
                baslik: 'Veri İşleme',
                ogrenmeAlani: 'Veri İşleme',
                kazanimlar: [
                    { kod: 'M.8.2.1.1', tanim: 'En fazla üç veri grubuna ait çizgi ve sütun grafiklerini yorumlar.' },
                ],
            },
            {
                id: 'mat-8-3',
                baslik: 'Olasılık',
                ogrenmeAlani: 'Olasılık',
                kazanimlar: [
                    { kod: 'M.8.3.1.1', tanim: 'Bir olaya ait olası durumları belirler.' },
                ],
            },
            {
                id: 'mat-8-4',
                baslik: 'Cebir',
                ogrenmeAlani: 'Cebir',
                kazanimlar: [
                    { kod: 'M.8.4.1.1', tanim: 'Cebirsel ifadeleri çarpanlara ayırır.' },
                    { kod: 'M.8.4.2.1', tanim: 'Birinci dereceden bir bilinmeyenli denklemleri çözer.' },
                    { kod: 'M.8.4.3.1', tanim: 'Birinci dereceden bir bilinmeyenli eşitsizlikleri sayı doğrusunda gösterir.' },
                ],
            },
            {
                id: 'mat-8-5',
                baslik: 'Geometri ve Ölçme',
                ogrenmeAlani: 'Geometri ve Ölçme',
                kazanimlar: [
                    { kod: 'M.8.5.1.1', tanim: 'Üçgende kenarortay, açıortay ve yüksekliği inşa eder.' },
                    { kod: 'M.8.5.2.1', tanim: 'Nokta, doğru parçası ve diğer şekillerin öteleme ve yansıma altındaki görüntülerini çizer.' },
                ],
            },
        ],
    },
];

// ─── Helper Fonksiyonlar ──────────────────────────────────────

/** Sınıfa göre üniteleri döndür */
export function getMatUnitesBySinif(sinif: number) {
    const muf = MEB_MATEMATIK_MUFREDATI.find((m) => m.sinif === sinif);
    return muf?.uniteler ?? [];
}

/** Sınıfa göre tüm kazanımları düz liste olarak döndür */
export function getMatKazanimlarBySinif(sinif: number): MatKazanim[] {
    const uniteler = getMatUnitesBySinif(sinif);
    return uniteler.flatMap((u) => u.kazanimlar);
}

/** Kazanım koduna göre tek kazanım bul */
export function getMatKazanimByCode(kod: string): (MatKazanim & { ogrenmeAlani: string; unite: string }) | null {
    for (const sinif of MEB_MATEMATIK_MUFREDATI) {
        for (const unite of sinif.uniteler) {
            const kazanim = unite.kazanimlar.find((k) => k.kod === kod);
            if (kazanim) {
                return {
                    ...kazanim,
                    ogrenmeAlani: unite.ogrenmeAlani,
                    unite: unite.baslik,
                };
            }
        }
    }
    return null;
}

/** Toplam kazanım sayısını döndür */
export function getToplamKazanimSayisi(): number {
    return MEB_MATEMATIK_MUFREDATI.reduce(
        (acc, sinif) => acc + sinif.uniteler.reduce((uAcc, u) => uAcc + u.kazanimlar.length, 0),
        0
    );
}
