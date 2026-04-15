import type { SariKitapDifficulty } from '../../../types/sariKitap';
import type { AgeGroup } from '../../../types/creativeStudio';

import { SARI_KITAP_SOURCES } from '../../../kaynak/sari/sariKitapData';

// ─── Metin Havuzu Yapısı ─────────────────────────────────────────

interface MetinEntry {
  baslik: string;
  metin: string;
}

type Konu = 'Doğa' | 'Okul' | 'Hayvanlar' | 'Aile' | 'Macera' | 'Kaynak Kitap';

const METIN_HAVUZU: Record<Konu, Record<SariKitapDifficulty, MetinEntry[]>> = {
  'Kaynak Kitap': {
    'Başlangıç': [
      ...SARI_KITAP_SOURCES.pencere.filter(s => s.difficulty === 'Başlangıç').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.nokta.filter(s => s.difficulty === 'Başlangıç').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.hizli_okuma.filter(s => s.difficulty === 'Başlangıç').map(s => ({ baslik: s.title, metin: s.text }))
    ],
    'Orta': [
      ...SARI_KITAP_SOURCES.pencere.filter(s => s.difficulty === 'Orta').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.nokta.filter(s => s.difficulty === 'Orta').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.kopru.filter(s => s.difficulty === 'Orta').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.cift_metin.filter(s => s.difficulty === 'Orta').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.bellek.filter(s => s.difficulty === 'Orta').map(s => ({ baslik: s.title, metin: s.text }))
    ],
    'İleri': [
      ...SARI_KITAP_SOURCES.pencere.filter(s => s.difficulty === 'İleri').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.nokta.filter(s => s.difficulty === 'İleri').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.kopru.filter(s => s.difficulty === 'İleri').map(s => ({ baslik: s.title, metin: s.text })),
      ...SARI_KITAP_SOURCES.cift_metin.filter(s => s.difficulty === 'İleri').map(s => ({ baslik: s.title, metin: s.text }))
    ],
    'Uzman': [
      ...SARI_KITAP_SOURCES.pencere.filter(s => s.difficulty === 'Uzman').map(s => ({ baslik: s.title, metin: s.text }))
    ]
  },
  Doğa: {
    'Başlangıç': [
      { baslik: 'Ağaç', metin: 'Ağaç çok güzel. Yaprakları yeşil. Kuşlar dalda öter. Rüzgar eser.' },
      { baslik: 'Güneş', metin: 'Güneş doğar. Hava ısınır. Çiçekler açar. Arılar uçar.' },
      { baslik: 'Yağmur', metin: 'Bulutlar gelir. Yağmur yağar. Su birikir. Toprak ıslanır.' },
    ],
    'Orta': [
      { baslik: 'Ormandaki Geyik', metin: 'Ormanda bir geyik yaşardı. Her sabah dereye su içmeye giderdi. Yaprakların arasından güneş süzülürdü. Geyik mutlu bir hayat sürüyordu.' },
      { baslik: 'Bahçedeki Kelebek', metin: 'Renkli bir kelebek bahçeye kondu. Çiçekten çiçeğe uçarak dolaştı. Kanatlarını açıp kapattı. Bahar gelmişti nihayet.' },
    ],
    'İleri': [
      { baslik: 'Mevsim Değişimi', metin: 'Sonbahar yaprakları sararmaya başladığında doğa büyük bir dönüşüme girer. Ağaçlar kışa hazırlanarak yapraklarını dökerken hayvanlar yiyecek depolar. Her mevsim değişimi ekosistemde zincirleme bir etki yaratır.' },
    ],
    'Uzman': [
      { baslik: 'Biyoçeşitlilik', metin: 'Ekosistemlerdeki biyoçeşitlilik kaybı küresel bir tehdit oluşturmaktadır. Habitat tahribatı ve iklim değişikliği türlerin göç örüntülerini değiştirmektedir. Bilim insanları koruma stratejileri geliştirerek nesli tehlike altındaki türleri korumaya çalışmaktadır.' },
    ],
  },
  Okul: {
    'Başlangıç': [
      { baslik: 'Sınıf', metin: 'Okul güzel. Sınıf büyük. Tahtaya yazarız. Kitap okuruz.' },
      { baslik: 'Teneffüs', metin: 'Zil çalar. Bahçeye çıkarız. Oyun oynarız. Çok eğleniriz.' },
    ],
    'Orta': [
      { baslik: 'İlk Gün', metin: 'Okulun ilk günü heyecanlıydım. Yeni arkadaşlarımla tanıştım. Öğretmenimiz bize kitaplarımızı dağıttı. Derslere başlamak için sabırsızlanıyordum.' },
      { baslik: 'Kütüphane', metin: 'Kütüphanede sessizlik hakimdi. Raflardan bir kitap seçtim. Hikaye çok güzeldi. Saatlerce okudum.' },
    ],
    'İleri': [
      { baslik: 'Proje Çalışması', metin: 'Fen projemiz için haftalarca araştırma yaptık. Grupça deney tasarladık ve sonuçları analiz ettik. Sunumu hazırlarken herkes kendi görevini eksiksiz yerine getirdi.' },
    ],
    'Uzman': [
      { baslik: 'Eğitim Felsefesi', metin: 'Modern eğitim yaklaşımları öğrenci merkezli öğrenme modellerini benimser. Yapılandırmacı pedagoji anlayışında bilgi aktarımı yerine bilginin yapılandırılması esastır. Öğretmen rehber rolü üstlenerek öğrencinin keşif sürecini destekler.' },
    ],
  },
  Hayvanlar: {
    'Başlangıç': [
      { baslik: 'Kedi', metin: 'Kedim beyaz. Süt sever. Yumuşak tüyleri var. Çok sevimli.' },
      { baslik: 'Köpek', metin: 'Köpek havlar. Kuyruğunu sallar. Top oynarız. Sadık dostum.' },
      { baslik: 'Kuş', metin: 'Kuşlar uçar. Yuvada yatar. Sabah öter. Böcek yer.' },
    ],
    'Orta': [
      { baslik: 'Karınca', metin: 'Karıncalar birlikte çalışır. Yiyeceklerini yuvalarına taşırlar. Çok güçlüdürler. Küçük ama azimlidirler.' },
      { baslik: 'Balık', metin: 'Denizde renkli balıklar yüzerdi. Mercan resifleri onların evidir. Suyun altında güzel bir dünya vardır.' },
    ],
    'İleri': [
      { baslik: 'Göç Eden Kuşlar', metin: 'Leylekler her yıl binlerce kilometre yol kat ederek Afrika kıtasına göç ederler. Manyetik alanı pusula gibi kullanarak yollarını bulurlar. Bahar geldiğinde aynı yuvaya geri dönerler.' },
    ],
    'Uzman': [
      { baslik: 'Hayvan Davranışları', metin: 'Etoloji bilimi hayvanların doğal ortamlarındaki davranış kalıplarını incelemektedir. Sosyal yapı oluşturan türlerde hiyerarşi ve iletişim mekanizmaları karmaşık örüntüler sergiler. Konrad Lorenz ve Nikolaas Tinbergen bu alandaki öncü araştırmacılardandır.' },
    ],
  },
  Aile: {
    'Başlangıç': [
      { baslik: 'Annem', metin: 'Annemi severim. Bana sarılır. Yemek yapar. En güzel annem.' },
      { baslik: 'Ev', metin: 'Evimiz sıcak. Odamız güzel. Bahçemiz var. Mutluyuz.' },
    ],
    'Orta': [
      { baslik: 'Bayram Sabahı', metin: 'Bayram sabahı erkenden kalktık. Yeni giysilerimizi giydik. Büyüklerin elini öptük. Çikolata ve şeker aldık.' },
      { baslik: 'Aile Yemeği', metin: 'Pazar günü herkes bir araya geldi. Annem güzel yemekler hazırladı. Sofrada sohbet ettik. Çok güzel vakit geçirdik.' },
    ],
    'İleri': [
      { baslik: 'Tatil Anıları', metin: 'Geçen yaz ailemle deniz kenarında bir kasabaya gittik. Sahilde kumdan kaleler yaparak ve yüzerek vakit geçirdik. Akşamları balıkçı barınağında taze balık yedik ve yıldızları seyrettik.' },
    ],
    'Uzman': [
      { baslik: 'Kuşaklar Arası Bağ', metin: 'Aile yapısı toplumsal değişimlerle birlikte dönüşüm geçirmektedir. Geleneksel geniş aile modelinden çekirdek aileye doğru yaşanan geçiş iletişim dinamiklerini etkilemektedir. Kuşaklar arası deneyim aktarımı kültürel sürekliliğin temel taşıdır.' },
    ],
  },
  Macera: {
    'Başlangıç': [
      { baslik: 'Hazine', metin: 'Bir harita bulduk. Yola çıktık. Ağacın altını kazdık. Hazine bulduk.' },
      { baslik: 'Orman', metin: 'Ormana girdik. Yol uzundu. Bir tavşan gördük. Eve döndük.' },
    ],
    'Orta': [
      { baslik: 'Gizemli Mağara', metin: 'Dağda bir mağara keşfettik. İçerisi karanlık ve serindir. El fenerimizle ilerlediğimizde duvarlarda ilginç şekiller gördük. Sonunda büyük bir salona ulaştık.' },
      { baslik: 'Kayıp Köpek', metin: 'Komşumuzun köpeği kaybolmuştu. Mahalledeki arkadaşlarımla birlikte aramaya çıktık. Parkta izlerini takip ettik. Sonunda onu eski okulun bahçesinde bulduk.' },
    ],
    'İleri': [
      { baslik: 'Deniz Yolculuğu', metin: 'Küçük yelkenliyle açık denize çıktığımızda rüzgar birden güçlendi. Dalgalar tekneyi sağa sola savururken pusulamız yönümüzü kaybetmemize engel oldu. Fırtına dindiğinde küçük bir adanın kıyısına ulaşmıştık.' },
    ],
    'Uzman': [
      { baslik: 'Antarktika Keşif Seferi', metin: 'Ernest Shackleton liderliğindeki Endurance seferi keşif tarihinin en dramatik hayatta kalma hikayelerinden biridir. Geminin buzlar arasında sıkışmasının ardından mürettebat aylarca buz kütleleri üzerinde kamp kurarak hayatta kalmıştır. Shackleton küçük bir filikayı kullanarak yardım getirmeyi başarmıştır.' },
    ],
  },
};

// ─── Çift Metin Çiftleri ─────────────────────────────────────────

export interface CiftMetinCifti {
  a: { baslik: string; metin: string };
  b: { baslik: string; metin: string };
}

export const CIFT_METIN_CIFTLERI: CiftMetinCifti[] = [
  {
    a: { baslik: 'Cici Kuş', metin: 'Cici kuş ağaçta oturuyordu sabahtan beri. Kanatlarını açıp güneşe baktı. Sonra uçarak gökyüzüne yükseldi.' },
    b: { baslik: 'Leziz Kek', metin: 'Kek hamuru karıştırıldı kasenin içinde. Fırına konuldu dikkatli bir şekilde. Güzel bir koku yayıldı mutfağa.' },
  },
  {
    a: { baslik: 'Denizde Gemi', metin: 'Gemi limandan yavaşça ayrıldı sabah erkenden. Dalgalar geminin etrafında köpürdü. Martılar güvertede dolaştı.' },
    b: { baslik: 'Bahçede Çiçek', metin: 'Çiçekler sabah çiyleriyle ıslandı nazikçe. Yapraklar rüzgarla sallandı hafiften. Kelebekler etrafında dans etti.' },
  },
  {
    a: { baslik: 'Tren Yolculuğu', metin: 'Tren istasyondan hareket etti düdüğünü çalarak. Pencereden ovalar ve dağlar göründü. Her durakta yeni yolcular bindi.' },
    b: { baslik: 'Yağmurlu Gün', metin: 'Yağmur damlaları cama vurdu ritmik sesler çıkararak. Sokaklar suyla kaplandı birden. Şemsiyeler açıldı rengarenk.' },
  },
  {
    a: { baslik: 'Kamp Ateşi', metin: 'Kamp ateşi yakıldı çıtırtılarla akşam olunca. Marshmallow çubukların ucuna takıldı. Yıldızlar gökyüzünde parladı.' },
    b: { baslik: 'Kütüphane', metin: 'Kitaplar raflarda sessizce duruyordu yan yana. Sayfalar çevrildi usulca parmak uçlarıyla. Bilgi her satırda gizliydi.' },
  },
  {
    a: { baslik: 'Futbol Maçı', metin: 'Top sahada sektirilerek ilerledi hızla. Kaleciye doğru bir şut atıldı güçlü. Tribünler alkışlarla inledi.' },
    b: { baslik: 'Resim Yapma', metin: 'Boya fırçası tuvale dokundu nazikçe renklerle. Mavi gökyüzü ve yeşil tepeler belirdi. Sanat eseri yavaş yavaş şekillendi.' },
  },
  {
    a: { baslik: 'Kar Yağışı', metin: 'Kar taneleri yere düştü sessizce beyaz örtü gibi. Her yer bembeyaz oldu birden. Çocuklar kardan adam yaptı.' },
    b: { baslik: 'Pazar Alışverişi', metin: 'Tezgahlar renkli meyvelerle doluydu sıra sıra. Satıcılar sesli sesli bağırdı neşeyle. Sepetler taze ürünlerle doldu.' },
  },
  {
    a: { baslik: 'Uçurtma', metin: 'Uçurtma gökyüzüne yükseldi rüzgarın gücüyle. İpi elimde sıkıca tutuyordum. Renkli kuyruğu dalgalandı havada.' },
    b: { baslik: 'Pasta Yapımı', metin: 'Un ve şeker karıştırıldı büyük bir kasede. Yumurtalar eklendi birer birer dikkatle. Hamur kabararak pişti fırında.' },
  },
  {
    a: { baslik: 'Balık Tutma', metin: 'Oltayı suya attım sabırla göl kenarında. Şamandıra suyun üstünde sallandı hafifçe. Derken ip gerildi birden.' },
    b: { baslik: 'Bisiklet Turu', metin: 'Pedalları çevirdim hızla yokuş aşağı inerken. Rüzgar yüzüme vurdu serinleterek. Yol kıvrılarak devam etti.' },
  },
  {
    a: { baslik: 'Müze Gezisi', metin: 'Müzede eski eserler sergileniyordu ışıklar altında. Her vitrin farklı bir dönem anlatıyordu. Tarih burada canlanıyordu.' },
    b: { baslik: 'Yemek Pişirme', metin: 'Soğanlar doğrandı ince ince tahta üzerinde. Tencerede yağ kızardı hafif ateşte. Güzel kokular yayıldı eve.' },
  },
  {
    a: { baslik: 'Gökkuşağı', metin: 'Gökkuşağı belirdi yağmur dinince gökyüzünde. Yedi renk birbiri ardına sıralandı parlak. Herkes hayretle seyretti bu güzelliği.' },
    b: { baslik: 'Müzik Dersi', metin: 'Flüt sesleri sınıfta yankılandı yumuşak melodiyle. Notalar tahtaya yazıldı özenle. Koro hep birlikte söyledi şarkıyı.' },
  },
];

// ─── Metin Erişim Fonksiyonları ──────────────────────────────────

const YAS_KELIME_LIMITI: Record<AgeGroup, number> = {
  '5-7': 10,
  '8-10': 20,
  '11-13': 45,
  '14+': 999,
};

const ZORLUK_UZUNLUK_ARALIGI: Record<SariKitapDifficulty, { min: number; max: number }> = {
  'Başlangıç': { min: 0, max: 100 },
  'Orta': { min: 100, max: 300 },
  'İleri': { min: 300, max: 800 },
  'Uzman': { min: 800, max: 9999 },
};

export function getMetinByAgeAndDifficulty(
  ageGroup: AgeGroup,
  difficulty: SariKitapDifficulty,
  konu?: Konu
): MetinEntry {
  // Eğer konu belirtilmemişse 'Kaynak Kitap'ı en başa ekle
  const konular = konu ? [konu] : (['Kaynak Kitap', ...Object.keys(METIN_HAVUZU).filter(k => k !== 'Kaynak Kitap')] as Konu[]);
  
  const yasLimit = YAS_KELIME_LIMITI[ageGroup];
  const uzunlukSiniri = ZORLUK_UZUNLUK_ARALIGI[difficulty];

  for (const k of konular) {
    const entries = METIN_HAVUZU[k]?.[difficulty];
    if (entries && entries.length > 0) {
      // 1. Hem yaş limitine hem de uzunluk aralığına uyanları bul
      const tamUygun = entries.filter((e) => {
        const words = e.metin.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;
        const cumleler = e.metin.split(/[.!?]+/).filter((c) => c.trim());
        const cumleYapisiUygun = cumleler.every((c) => c.trim().split(/\s+/).length <= yasLimit);
        const uzunlukUygun = wordCount >= uzunlukSiniri.min && wordCount <= uzunlukSiniri.max;
        return cumleYapisiUygun && uzunlukUygun;
      });

      if (tamUygun.length > 0) {
        return tamUygun[Math.floor(Math.random() * tamUygun.length)];
      }

      // 2. Sadece yaş limitine uyanları bul (Fallback)
      const yasUygun = entries.filter((e) => {
        const cumleler = e.metin.split(/[.!?]+/).filter((c) => c.trim());
        return cumleler.every((c) => c.trim().split(/\s+/).length <= yasLimit);
      });

      if (yasUygun.length > 0) {
        return yasUygun[Math.floor(Math.random() * yasUygun.length)];
      }

      // 3. Hiçbiri uymazsa zorluk kategorisindeki herhangi birini seç
      return entries[Math.floor(Math.random() * entries.length)];
    }
  }

  // Global Fallback
  return { baslik: 'Metin', metin: 'Güzel bir gün. Güneş parlıyor. Kuşlar ötüyor.' };
}

export function getCiftMetinCifti(): CiftMetinCifti {
  return CIFT_METIN_CIFTLERI[Math.floor(Math.random() * CIFT_METIN_CIFTLERI.length)];
}
