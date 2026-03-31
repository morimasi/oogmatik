export interface InfographicTemplate {
  title: string;
  prompt: string;
  hint: string;
}

export interface TemplateCategory {
  category: string;
  items: InfographicTemplate[];
}

export const SPLD_PREMIUM_TEMPLATES: TemplateCategory[] = [
  {
    category: 'Disleksi',
    items: [
      {
        title: 'Ortografik Haritalama - Uzay Gemisi Navigasyonu',
        prompt: 'Uzay macerası temalı dinamik analiz şeması. Öğrencinin harf rotasyon hatalarını (b/d/p/q) engellemek adına, ayna nöronlarını tetikleyen zıt formlu asteroit yörüngeleri metaforunu kur. Tasarım karanlık uzay zemininde yüksek sarı/turuncu neon (Lexend fontu) kontrastıyla "Görsel Kümeleme" (Visual Crowding) etkisini sıfıra indirgesin. Kapsam: Görsel Ayırt Etme.',
        hint: 'compare'
      },
      {
        title: 'Ortografik Haritalama - Kayıp Dinozor Fosilleri',
        prompt: 'Dinozor dönemi temalı kazı şeması. Harflerin (m/n, h/b) köşe ve kıvrımlarını kemik parçalarıyla eşleştir. Dislektik beynin detaya odaklanmasını sağlamak için topraktan çıkan pürüzlü zemin efektleri üzerinden sağ/sol ayrımını netleştiren zıt kutuplu (mavi-turuncu) kontrast blokları kullan. Kapsam: Ortografik Şablon.',
        hint: 'compare'
      },
      {
        title: 'Ortografik Haritalama - Okyanus Tabanı Haritası',
        prompt: 'Derin okyanus temalı keşif diyagramı. Harflerin simetrik karmaşasını (s/z) çözmek için, akıntı yönlerine göre süzülen deniz canlıları metaforunu işle. Göz kaslarını soldan sağa akıcı okumaya alıştırmak amacıyla, soldan sağa doğru parlayan yatay deniz feneri ışınları (%0 visual noise) yerleştir. Aydınlatılmış alanlarda sadece tek bir sembol görünsün. Kapsam: Sağ/Sol Algısı.',
        hint: 'hierarchy'
      },
      {
        title: 'Ortografik Haritalama - Büyülü Orman Aynaları',
        prompt: 'Sihirli orman temalı illüzyon diyagramı. b ve d harflerinin orman perilerinin tuttuğu asimetrik aynalardan yansıdığı bir hiyerarşi oluştur. Harflerin sap (ascender/descender) kısımlarının uzunluklarını ağaç dallarına benzeterek somutlaştır ve "yapısal farkındalığı" artır. Pastel yeşil ve mat mor arka planlarla harf-şekil sınırlarını kalın hatlarla (bold stroke) belirginleştir. Kapsam: Sembolik Muhakeme.',
        hint: 'hierarchy'
      },
      {
        title: 'Ortografik Haritalama - Geleceğin Şehri Trafiği',
        prompt: 'Fütüristik uçan araba trafiği temalı akış diyagramı. Trafik levhalarındaki harflerin karmaşıklığını gidermek için "yol ayrımları" metaforu kullan. Çocuğun işleyen belleğine (Working Memory) yüklenmemek için bir ekranda maksimum 3 bilgi kutucuğu ver. Metinler arası boşlukları (line spacing) %150 oranında tut. Kapsam: Okuma Yönü ve Akıcılık.',
        hint: 'sequence'
      },
      {
        title: 'Fonolojik Bellek - Müzikal Notalar ve Uzay',
        prompt: 'Uzayda çalan ritmik notalar diyagramı. Kelimelerin hecelere bölünme sürecini (Hece Merdiveni) yıldızların birbirine bağlanma hızıyla sembolize et. "Disleksik bireyler sesi heceye bölmekte zorlanır" ilkesinden yola çıkarak, her hece baloncuğunu akustik/görsel bir rezonans çemberine koy. İlk hece kırmızı renkle başlayıp, sondaki hece maviye evrilerek dizi (sequence) algısını beynin dil merkezine kazısın. Kapsam: Ses Birimsel Analiz.',
        hint: 'sequence'
      },
      {
        title: 'Fonolojik Bellek - Antik Mısır Papirüsleri',
        prompt: 'Eski Mısır piramit hiyerarşisi temalı sıralama diyagramı. Bir kelimeyi oluşturan harfleri ve sesleri piramidin aşağıdan yukarıya dizilen taş blokları olarak görselleştir. Kafiyeli kelimelerin (Rhymer) aynı form/renkte bloklardan oluştuğu "Fonolojik Kafiye Aileleri" modelini (Matrix) kur. Metin karmaşası olmaması için, tamamen saf zemin üzerinde sadece kelime ve uyumlu piktogram bulunsun. Kapsam: Kafiye ve Hece Sentezi.',
        hint: 'hierarchy'
      },
      {
        title: 'Fonolojik Bellek - Korsan Hazinesi Şifresi',
        prompt: 'Korsan haritası temalı şifre çözme matrisi. Kelimelerin başlangıç seslerinin değiştikçe farklı kelimelere (örn: bal-çal-dal) dönüşmesini, birbirine zincirle bağlı altın sikkelerle yapılandır. Çocuğun "işitsel ayrımlaştırma" eksikliğini telafi etmek için, değişen harfleri kalın (BOLD) ve tamamen zıt parlayan bir renkle izole et. Kapsam: Sesteş ve Ses Değiştirme.',
        hint: 'list'
      },
      {
        title: 'Fonolojik Bellek - Mikro Evren Laboratuvarı',
        prompt: 'Hücrelerin bölündüğü mikroskobik laboratuvar temalı akış şeması. Uzun (çok heceli) kelimelerin okunmasındaki bilişsel tıkanmayı açmak için kelimeleri "hücre bölünmesi" animasyonlarına benzer bağ noktalarıyla (node-link) dörde/beşe ayır. Her bir heceyi (hücreyi) tek bir yutulabilir (subitizable) görsel parçaya bölen Fishbone diyagramı tasarla. Kapsam: Uzun Kelime Okuma Strategisi.',
        hint: 'hierarchy'
      },
      {
        title: 'Fonolojik Bellek - Kış Sporları Parkuru',
        prompt: 'Karda kayan kayakçı temalı sıralama zinciri. Kelimenin ilk, orta ve son seslerini kayak parkurundaki bayrak noktaları olarak kur. Okuma sırasındaki atlama/yutma (omission) hatalarını engellemek için, gözün kayma hizasını (tracking) belirten koyu gri kalın çizgiler çek. Tüm alan soluk beyaz/buzul tonuyken, harf istasyonları sıcak renklerde (kiremit, hardal) belirsin. Kapsam: Ses Yutma Hatalarını Önleme.',
        hint: 'timeline'
      },
      {
        title: 'Okuduğunu Anlama (5N1K) - Gizli Ajan Görevi',
        prompt: 'Casusluk temalı 5N1K bilgi avı diyagramı. Metin okuma sonrası anlama sorununu (Reading Comprehension) çözmek amacıyla Kim, Ne, Nerede, Ne Zaman sorularını, ajan çantalarındaki gizli dosyalar olarak Venn veya Matrix şemasına oturt. Soruları uzun cümleler yerine 2 kelimelik net yönergeler halinde ver. Sayfadaki yazılı metin oranını %30\'un altında tutarak grafiksel çıkarımı (inferencing) güçlendir. Kapsam: 5N1K ve Çıkarım Yapma.',
        hint: 'auto'
      },
      {
        title: 'Okuduğunu Anlama (5N1K) - Ortaçağ Şatosu Savunması',
        prompt: 'Kale savunma temalı hiyerarşik okuma diyagramı. Hikayedeki ana olayı kalenin merkezindeki kral, yan olayları ise kuleler olarak konumlandır. Dislektik işleyen belleğin konuyu unutmasını önlemek için "Hikaye Haritası" (Story Map) algoritması kur. Her kuleye bağlanan yolların üzerinde sadece 1 kelimelik anahtar sözcükler yer alsın. Karmaşık arka plan detayı silinmiş, pastel tonlarda flat bir tasarım yap. Kapsam: Metnin Ana Fikri ve Detayları.',
        hint: 'hierarchy'
      },
      {
        title: 'Okuduğunu Anlama (5N1K) - Arı Kovanı Sistemi',
        prompt: 'Arı kovanı petekleri temalı kavram haritası (Concept Map). Okunan metindeki olayların kronolojik sıralamasını veya etki-tepki ilişkisini altıgen petekler halinde birbirine geçir. Peteklerin merkezine Neden-Sonuç (Cause-Effect) dinamiği yerleştir ve ok şaretleriyle net bir hiyerarşi kur. Etrafta uçuşan gereksiz ikonları temizle, "Bilişsel Yük Kuramı"na uygun olarak ekranın %40\'ını "Negatif Boşluk" (White Space) olarak bırak. Kapsam: Neden-Sonuç Bağlantıları.',
        hint: 'list'
      },
      {
        title: 'Okuduğunu Anlama (5N1K) - Sihirbazlık Akademisi',
        prompt: 'Büyü formülleri temalı balık-kılçığı (Fishbone) şeması. Okunacak paragraftaki "Ana Fikir" (Büyü İksiri) ve bu ana fikri destekleyen "Yardımcı Düşünceleri" (Malzemeler) net hatlarla kılçık uçlarına diz. Disleksik göz okumasına uygun olması adına satır boşluklarını 1.5 kat artır ve şablonu aşağıdan yukarı (veya tam soldan sağa) akacak şekilde tek boyutlu tasarla. Kapsam: Ana Düşünce Çıkarımı.',
        hint: 'hierarchy'
      },
      {
        title: 'Okuduğunu Anlama (5N1K) - Zaman Yolculuğu Treni',
        prompt: 'Zaman makinesi treni temalı Timeline haritası. Kronolojik hikayeleri okurken sırayı karıştıran dislektik hafızaya destek olmak için, her bir hikaye anını bir tren vagonuna yerleştir. Vagonları birbirine kopmaz kalın halatlarla bağlayarak zamanın/olay örgüsünün sürekliliğini görsel bağlama (anchoring) ile kodla. Fontlar strictly Lexend ve siyah renkte, zemin kirli-sarı (sepya/warm) tonunda parlamayı (glare) engelleyecek matlıkta olsun. Kapsam: Olay Akışı Sıralaması.',
        hint: 'timeline'
      }
    ]
  },
  {
    category: 'Diskalkuli',
    items: [
      {
        title: 'Sayı Hissi (Subitizing) - Okyanus Mercanları',
        prompt: 'Okyanus mercan resifleri temalı sayma ve kümeleme (subitizing) diyagramı. Diskalkulik beyin sayıların sembolik anlamını (5) somutlaştırmada zorlanır. Bu yüzden sayı sembolünün hemen yanında zar şeklinde anında algılanabilir (max 4\'lü küme) balık grupları yerleştir. Hiçbir zaman sayıları izole olarak bırakma, "Parça-Bütün" (Part-Whole) ilişkisini Venn Şeması ile bağlayarak %0 soyut kavram prensibini uygula. Kapsam: 1-10 Arası Rakam-Değer Algısı.',
        hint: 'compare'
      },
      {
        title: 'Sayı Hissi (Subitizing) - İtfaiye Kurtarma Operasyonu',
        prompt: 'İtfaiye temalı ardışık hiyerarşi şeması. Sayı doğrusunun ileri-geri mantığını anlamlandıramayan diskalkulik bireyler için sayı doğrusunu yatay bir çizgi yerine "kat kat yukarı çıkan itfaiye merdivenleri" şeklinde dikey bir hiyerarşide konumlandır. Geriye saymanın "aşağı inmek", ileri saymanın "yukarı çıkmak" olduğunu somut yer-yön (spatial) metrikleriyle birleştir (Matrix/Sequence). Font boyutu abartılı derecede büyük, zemin pastel mavi. Kapsam: Sayı Doğrusu ve Yönelim.',
        hint: 'sequence'
      },
      {
        title: 'Sayı Hissi (Subitizing) - Çiftlik Hasadı',
        prompt: 'Meyve hasadı temalı matris. Azlık-çokluk kavramını sepetlere yerleştirilmiş somut meyvelerle kur. Diskalkulik kıyaslama zorluğu yaşayan beyne "Büyük/Küçük" kavramını matematik sembolleriyle (>, <) göstermeden önce fiziksel boyut ve hacim farklarıyla algılat. Karışıklığı kesmek için "Aynı Tür" meyveleri kıyaslat, farklı şekilli ve renkli nesne kalabalıklığı yapma (düşük bilişsel parazit). Kapsam: Miktar Karşılaştırma.',
        hint: 'list'
      },
      {
        title: 'Sayı Hissi (Subitizing) - İnşaat Vinçleri',
        prompt: 'Vinçle taşınan yapı blokları temalı gruplama diyagramı. Onluk ve Birlik kavramlarını ayrıştırmak için 10\'lu kümeleri parçalanamaz büyük beton kütleler, birlikleri ise ufak tuğlalar olarak göster (Hierarchy). Onluk bozmayı görsel ve fiziksel olarak kütlenin parçalanması biçiminde grafiklendir. Kullanılan renklerin sayı kodlaması ile eşleşmesini sağla (Örn: Onluklar her zaman lacivert, birlikler her zaman turuncu). Kapsam: Basamak Değeri (Onluk-Birlik).',
        hint: 'hierarchy'
      },
      {
        title: 'Sayı Hissi (Subitizing) - Kristal Mağarası',
        prompt: 'Renk değiştiren kristaller temalı işlem ağacı (Concept Map). "Sıfır" kavramının uzamsal hiçlik (yokluk) olduğunu aktarmak için, işlem (toplama çıkarma) sonucunda yok olan kristalleri yarı şeffaf silik tasarımlarla göster. Göz hareketi soldan sağa doğru işlemi takip ederken karmaşık oklar değil, sıvı gibi akan bağlantı hatları bağla. Kapsam: O İşlemi ve Sayı Yutan Algı.',
        hint: 'auto'
      },
      {
        title: 'Algoritmik Matematik - Uzay İstasyonu Bağlantıları',
        prompt: 'Uzay istasyon modülleri temalı Toplama/Çıkarma algoritmaları diyagramı. Diskalkulik beyin alt alta işlem yaparken sütunlarda (basamaklarda) kayma yaşar. Basamakları sımsıkı kilitleyen asansör/tünel formlu modüllerle (Matrix) basamak hizalaması yap. Birler basamağının işlemini devasa neon bir kilit olarak öne çıkar; diğer basamakları o işlem bitene kadar "karanlık mod: %30 opaklık" içinde tut. Kapsam: Alt Alta İşlem Basamakları.',
        hint: 'list'
      },
      {
        title: 'Algoritmik Matematik - Fırıncı ve Somun Ekmekler',
        prompt: 'Ekmek fırını temalı kesir (Fractions) diyagramı. Kesirlerin "bölme" ile akraba olduğunu soyut bir "1/4" yazısıyla değil, fiziksel olarak bir somunun 4 parçaya bıçakla kesilerek (dilimler arası boşluk bırakarak) göster. Payın seçilen/alınan dilimi renkli ve dokulu, paydanın ise toplam tepsi alanını temsil ettiğini netleştir. Kesir sembolünü arasına bir "çizgi" çekilmiş rakamlar olarak değil, "üst/alt kat" metaforuyla hizala. Kapsam: Somut Kesirler ve Bütün.',
        hint: 'compare'
      },
      {
        title: 'Algoritmik Matematik - Dişli Çark Mekanizması',
        prompt: 'Makine dişlileri temalı çarpım tablosu stratejileri şeması. Çarpma işlemini bir ezber olmaktan çıkarıp "Tekrarlı Toplanma" motoru gibi göster (Sequence). Bir büyük çarkın (Örn: "4 kere") dönmesiyle, içine yapışık olan 3\'erli minik çarkların harekete geçtiğini görselleştir. Toplam sonucun (12) çarkların bütünlüğünü ifade ettiğini, "Cause-Effect" (Neden-sonuç) diyagramında somutlaştır. Kapsam: Çarpma İşleminin Mantığı.',
        hint: 'sequence'
      },
      {
        title: 'Algoritmik Matematik - Zaman Yolcusu Saatler',
        prompt: 'Zaman makinesi kadranı temelli Akrep/Yelkovan diyagramı. Diskalkulik zamanda algı güçlüğü çeker. 60 dakikalık uzamsal döngüyü, saatin etrafında dilimlenmiş tam, yarım ve çeyrek renkli dilimler olarak pasta grafiğine (Pie/Cycle Diagram) entegre et. Akrep kalın bir ağaç kütüğü gibi durağan, yelkovan ise ince ama hızlı ve renkli bir şimşek olarak tasarlanıp uzamsal ayırt edicilik yarat. Kapsam: Zamanı Okuma ve Uzamsal Kadran.',
        hint: 'timeline'
      },
      {
        title: 'Algoritmik Matematik - Define Adaları Haritası',
        prompt: 'Adalar arası define rotası temalı Para Birimi ve Alışveriş hiyerarşisi. "Bozuk para"ların toplanıp "tam para" oluşturduğunu (Bozuk para hiyerarşisi), 1 liranın içinde 2 tane 50 kuruş barındırdığını bir Venn Şeması (Kesişim) veya Hiyerarşi ağacı ile kurgula. Sayıların altına mutlaka gerçekçi (foto-piktogram) bozuk para silüetleri ekle. 1 Lirayı altına, kuruşları gümüş/kahverengi tonlarına boyayarak materyal zıtlığı kat. Kapsam: Paraları Tanıma ve Eşdeğerlik.',
        hint: 'hierarchy'
      }
    ]
  },
  {
    category: 'DEHB',
    items: [
      {
        title: 'Bölünmüş Dikkat Cenderesi - Uzay Teleskobu',
        prompt: 'Uzay teleskobu vizörü (odak merceği) temalı dikkat şeması. DEHB zihnindeki aşırı tepkiselliği ve dikkat dağınıklığını minimuma indirmek için tüm arka planı zifiri karanlık (Pure dark) yap. Bilginin işleneceği merkez alanını ise loş bir mavi ışık halkasıyla çevir. Hiyerarşiyi tepeden inme değil, "Merkeze Yaklaşan" balık kılçığı (Fishbone) modelinde kur. Çevrede kesinlikle nokta, yıldız, parıltı (çeldirici noise) kullanma. Kapsam: Görsel Gürültü ve İleri Odaklanma.',
        hint: 'auto'
      },
      {
        title: 'Bölünmüş Dikkat Cenderesi - Orman Kamp Ateşi',
        prompt: 'Gece karanlığındaki orman kamp ateşi temalı Sequence (Adım Adım Gece Planı) diyagramı. Görev dizisi takibi (Task sequencing) DEHB için kritiktir. 5 adımlık bir planı sayfanın ortasından geçen kalın ve tek düze bir ip (Timeline) olarak diz. O an yapılması gereken 2. madde haricindeki tüm maddeleri %50 solukluğa iterek dikkatin odağını hapset. Ateş/Işık efekti sadece "Şu Anki Görev" üzerinde yansısın. Kapsam: Görev Zinciri (Working Sequence).',
        hint: 'timeline'
      },
      {
        title: 'Bölünmüş Dikkat Cenderesi - Dalgıç ve Oksijen Tüpü',
        prompt: 'Deniz diplerinde dalış yapan dalgıç temalı Hiyerarşi (Hierarchy) şeması. "Dürtüsellik" ve bekleme/sabır kontrolünü öğretmek adına, bir işlemin (örn: paragraf okuma) aşamalarını, oksijen tüpündeki barometre veya dalış merdivenleri gibi sınırlandırılmış hedeflerle kodla. Bilginin parçalandıkça tüketilebilir olduğunu gösteren keskin bloklar tasarla. Hiçbir metin kutusu bir diğerine çapraz geçiş veya asimetrik bağ ile dokunmasın; aşırı nizam ve geometri hakim olsun. Kapsam: Sabır/Sürekli Dikkat ve Adım Hiyerarşisi.',
        hint: 'hierarchy'
      },
      {
        title: 'Zaman Algısı Daralması - Kum Saati Geçidi',
        prompt: 'Dev kum saati temalı Venn Diyagramı / Flowchart. Zaman körlüğü (Time Blindness) yasayan DEHB\'li bireylere "Şimdi" ile "Sonra" kavramlarını ayırmak için iki zıt renk odacığı kur. Sol taraf eylem merkezi (sıcak renkler), sağ taraf sonuç / ödül merkezi (soğuk renkler) olsun. Aralarındaki köprüyü (Fishbone omurgasını) oklarla kalın biçimde belirginleştir. Zihni oyalayacak arka plan deseni kullanma. Kapsam: Zamanı Bloklama ve Ödül Algısı.',
        hint: 'compare'
      },
      {
        title: 'Zaman Algısı Daralması - Mimari Taslak',
        prompt: 'Mimar çizim masası ve blueprint (mavi kopya) temalı Matrix. Organizasyon yeteneği için planlama tablolarını (Grid) kalın border/çerçevelerle zırhlandır. Satırlar ve sütunlar arasına gri geniş "nefes alma koridorları" ekle. Gözün başka bir satıra kaymasını (Saccadic jumps) engellemek için satır arka planlarında belirgin tonlama (Zebra striping - açık mavi / koyu mavi) yarat. Kapsam: Organizasyon ve Izgara Dikkat Takibi.',
        hint: 'list'
      }
    ]
  },
  {
    category: 'Karma (Mixed Spesifik)',
    items: [
      {
        title: 'Çoklu-Duyu (Multi-sensory) - Devre Kartları',
        prompt: 'Elektronik devre kartı (PCB) temalı karma öğrenme şeması (Concept Map). Hem DEHB hem Disleksi barındıran profiller için: Enerji hattını temsil eden parlak devre yollarında, kelimelerin kök ve eklerini elektrik düğümleri olarak bağla (Ortografik işlem). Ekrandaki renk sayısı 3\'ü (Neon mavi, beyaz, fosforlu yeşil) aşmamalıdır (DEHB kısıtı). Oklar, kısa ve dik açılı (90 derece) dönüşlerle zihinsel belirsizliği önlemeli. Kapsam: Ek ve Kök Ayırma (Görsel Yük Kuramı: Minimum).',
        hint: 'auto'
      },
      {
        title: 'Çoklu-Duyu (Multi-sensory) - Antik Su Kanalları',
        prompt: 'Romalıların su kemerleri temalı sıvı akış diyagramı (Sequence). Karma zorluk (Diskaluli + Disleksi) profilinde, matematik problemlerinin Türkçe sözcüklerden oluşmasını çözmek için: Soruyu (5N1K) suyu taşıyan yapboz taşları gibi parçalara böl, suyun ulaştığı havuzu ise sayısal işlem matrisi (Matrix) yap. Sözcükler büyük ve net (Lexend), sayılar ise renk kilitli (Onluklar Mavi) tasarlanmalı. Arka plan dokusu %0 olmalıdır. Kapsam: Problem Çözme ve Okuduğunu Anlamlandırma.',
        hint: 'sequence'
      }
    ]
  }
];
