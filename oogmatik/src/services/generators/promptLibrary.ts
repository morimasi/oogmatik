
export interface ActivityLibraryItem {
    id: string;
    title: string;
    methodology: 'Orton-Gillingham' | 'Feuerstein' | 'Wilson' | 'Lindamood-Bell' | 'Sensory-Integration';
    category: 'Phonological' | 'Visual-Perception' | 'Working-Memory' | 'Executive-Function' | 'Math-Logic';
    description: string;
    basePrompt: string;
}

export const PEDAGOGICAL_LIBRARY: ActivityLibraryItem[] = [
    // --- 1. PHONOLOGICAL CATEGORY (10 Items) ---
    {
        id: 'phon-og-mapping',
        title: 'Fonem-Grafem Haritalama',
        methodology: 'Orton-Gillingham',
        category: 'Phonological',
        description: 'Seslerin ve harflerin multisensoriyel eşleşmesi.',
        basePrompt: "Orton-Gillingham prensipleriyle, ses-harf eşleşmesini (fonem-grafem) vurgulayan, kelimeleri hece bloklarına ayıran ve her hece tipi için farklı görsel işaretler (kapalı/açık hece) içeren bir çalışma üret."
    },
    {
        id: 'phon-wilson-scooping',
        title: 'Hece Kepçeleme (Scooping)',
        methodology: 'Wilson',
        category: 'Phonological',
        description: 'Okuma akıcılığı için hece yayları kullanımı.',
        basePrompt: "Wilson Reading System standartlarında, karmaşık kelimelerin altındaki hece yaylarını (scoops) gösteren ve öğrencinin bu yayları takip ederek okumasını sağlayan bir akıcılık çalışması tasarla."
    },
    {
        id: 'phon-rhyme-detective',
        title: 'Kafiye Dedektifi',
        methodology: 'Orton-Gillingham',
        category: 'Phonological',
        description: 'İşitsel ayırt etme ve kafiye farkındalığı.',
        basePrompt: "Kelimelerin son ses benzerliklerine (rimes) odaklanan, işitsel ayırt etme becerisini geliştiren ve uyaklı kelimeleri görsel bir ağaç yapısında gruplayan bir aktivite üret."
    },
    {
        id: 'phon-segmenting-blocks',
        title: 'Parçalama Blokları',
        methodology: 'Lindamood-Bell',
        category: 'Phonological',
        description: 'Kelimeleri ses birimlerine ayırma.',
        basePrompt: "Lindamood-Bell 'LiPS' tekniğine uygun, kelimeleri ağız hareketlerine ve ses çıkış noktalarına göre (dudak sesleri, diş sesleri vb.) sembolize eden bir ses parçalama çalışması üret."
    },
    {
        id: 'phon-manipulation-swap',
        title: 'Ses Manipülasyonu',
        methodology: 'Wilson',
        category: 'Phonological',
        description: 'Harf değiştirerek yeni kelime türetme.',
        basePrompt: "Bir kelimenin baş, orta veya son sesini değiştirerek anlam değişimini gözlemlemeyi hedefleyen (Örn: Kas -> Kas -> Kas), minimum çiftler üzerinden kurgulanmış bir değişim tablosu üret."
    },
    {
        id: 'phon-syllable-sorting',
        title: 'Hece Tipi Sınıflama',
        methodology: 'Wilson',
        category: 'Phonological',
        description: '6 farklı hece tipini tanıma.',
        basePrompt: "Wilson metodundaki 6 hece tipine (Closed, Open, VCE, R-Controlled, Vowel Team, C-le) göre kelimeleri sınıflandırmayı öğreten, her tip için özel bir kutucuk içeren matris yapısı üret."
    },
    {
        id: 'phon-onset-rime-fun',
        title: 'Onset-Rime Birleştirme',
        methodology: 'Orton-Gillingham',
        category: 'Phonological',
        description: 'Kelime başlangıç ve bitiş seslerini sentezleme.',
        basePrompt: "Kelimelerin ilk ünsüzü (onset) ve geri kalan kısmını (rime) farklı renklerle belirten, öğrencinin bu iki parçayı sentezleyerek anlamlı kelimeler kurmasını sağlayan bir yap-boz temalı çalışma üret."
    },
    {
        id: 'phon-auditory-minimal-pairs',
        title: 'İşitsel Benzerlik Analizi',
        methodology: 'Sensory-Integration',
        category: 'Phonological',
        description: 'Birbirine yakın sesleri (b-p, d-t) ayırt etme.',
        basePrompt: "Birbirine çok yakın duyulan ses çiftlerini içeren kelimeleri (Örn: 'dal' ve 'tal') görsellerle eşleştiren ve öğrencinin doğru sesi seçmesini gerektiren bir işitsel dikkat çalışması tasarla."
    },
    {
        id: 'phon-morphology-tree',
        title: 'Morfolojik Kök Ağacı',
        methodology: 'Orton-Gillingham',
        category: 'Phonological',
        description: 'Kök ve ek farkındalığı.',
        basePrompt: "Kelimelerin köklerini ve yapım eklerini ayırt etmeyi öğreten, bir ana kökten türeyen 5 farklı kelimeyi içeren 'Morfoloji Ağacı' mimarisinde bir sayfa üret."
    },
    {
        id: 'phon-blending-slides',
        title: 'Kaydırak Okuma (Blending)',
        methodology: 'Lindamood-Bell',
        category: 'Phonological',
        description: 'Sesleri uzatarak birleştirme.',
        basePrompt: "Ses birimlerini (fonem) birbirine bağlayarak akıcı okumayı hedefleyen, görsel bir 'kaydırak' metaforu kullanan ve harfler arası geçişleri yumuşatan bir blending çalışması üret."
    },

    // --- 2. VISUAL-PERCEPTION CATEGORY (10 Items) ---
    {
        id: 'vis-figure-ground-map',
        title: 'Şekil-Zemin Karmaşası',
        methodology: 'Sensory-Integration',
        category: 'Visual-Perception',
        description: 'Karmaşık arka planda hedefi bulma.',
        basePrompt: "Yoğun bir görsel doku içinde gizlenmiş spesifik harf dizilerini veya sembolleri bulmayı gerektiren, dikkat dağıtıcıların (distractors) sistematik olarak artırıldığı bir tarama çalışması üret."
    },
    {
        id: 'vis-closure-puzzle',
        title: 'Görsel Tamamlama',
        methodology: 'Feuerstein',
        category: 'Visual-Perception',
        description: 'Eksik parçalı sembolleri zihinsel bütünleme.',
        basePrompt: "Feuerstein'ın organizasyonel algı ilkeleriyle, sadece bir kısmı çizilmiş harf veya şekillerin ne olduğunu tahmin etmeyi ve tamamlamayı gerektiren bir görsel kapanış (closure) çalışması üret."
    },
    {
        id: 'vis-reversal-recovery',
        title: 'Ayna Harf Onarımı',
        methodology: 'Orton-Gillingham',
        category: 'Visual-Perception',
        description: 'b-d, p-q, m-w karışıklığı için yönsel algı.',
        basePrompt: "Harflerin yönsel özelliklerini (sağ/sol) fiziksel ipuçlarıyla (el, ok, yön) eşleştiren, dislekside sık görülen ayna hatalarını (reversal) düzeltmeye odaklı bir yön tayini çalışması tasarla."
    },
    {
        id: 'vis-sequential-patterns',
        title: 'Görsel Ardışıklık Dizileri',
        methodology: 'Wilson',
        category: 'Visual-Perception',
        description: 'Sembollerin sırasını takip etme.',
        basePrompt: "Karmaşık sembollerin veya anlamsız şekillerin belirli bir sırayla dizildiği, öğrencinin bu sırayı bozmadan kopyalamasını veya devam ettirmesini gerektiren bir ardışıklık matrisi üret."
    },
    {
        id: 'vis-form-constancy',
        title: 'Form Değişmezliği Lab',
        methodology: 'Sensory-Integration',
        category: 'Visual-Perception',
        description: 'Dönmüş veya boyut değiştirmiş şekli tanıma.',
        basePrompt: "Aynı şeklin veya harfin farklı boyut, renk ve rotasyonlardaki (dönmüş) hallerini bir grup içinde bulmayı hedefleyen, görsel sabitlik becerisini tetikleyen bir analiz sayfası üret."
    },
    {
        id: 'vis-boundary-tracking',
        title: 'Sınır ve Satır Takibi',
        methodology: 'Wilson',
        category: 'Visual-Perception',
        description: 'Gözün satır üzerinde kalmasını sağlama.',
        basePrompt: "Okuma sırasında satır atlamayı önleyen, kelime sınırlarını belirginleştiren ve gözün yatay hareketini (saccades) disipline eden renkli yol haritaları içeren bir metin çalışması üret."
    },
    {
        id: 'vis-orthographic-search',
        title: 'Ortografik Örüntü Avı',
        methodology: 'Orton-Gillingham',
        category: 'Visual-Perception',
        description: 'Sık kullanılan harf gruplarını tarama.',
        basePrompt: "Türkçedeki sık kullanılan harf kombinasyonlarını (Örn: -lar, -miş, -yor) metin içinde en hızlı şekilde bulmayı hedefleyen bir görsel tarama ve tanıma görevi tasarla."
    },
    {
        id: 'vis-spatial-rotation',
        title: 'Uzamsal Rotasyon Matrisi',
        methodology: 'Feuerstein',
        category: 'Visual-Perception',
        description: '3D şekilleri zihinde döndürme.',
        basePrompt: "İzometrik (3D) küp yapılarının farklı açılardan görünümlerini eşleştirmeyi gerektiren, uzamsal akıl yürütme ve zihinsel döndürme (mental rotation) becerisini geliştiren bir sayfa üret."
    },
    {
        id: 'vis-letter-case-sync',
        title: 'Büyük-Küçük Harf Senkronu',
        methodology: 'Wilson',
        category: 'Visual-Perception',
        description: 'Farklı formdaki aynı harfi tanıma.',
        basePrompt: "Aynı harfin el yazısı, matbu, büyük ve küçük formlarını bir labirent içinde birleştiren, görsel formlar arası transferi güçlendiren bir eşleştirme çalışması üret."
    },
    {
        id: 'vis-tracking-mazes',
        title: 'Dikkatli Göz Labirenti',
        methodology: 'Sensory-Integration',
        category: 'Visual-Perception',
        description: 'Karmaşık çizgiler arası yol bulma.',
        basePrompt: "Birbirine geçmiş 5 farklı renkli çizginin hangi çıkışa gittiğini sadece gözle takip ederek bulmayı gerektiren, oküler motor kontrolü geliştiren bir takip çalışması tasarla."
    },

    // --- 3. WORKING-MEMORY CATEGORY (10 Items) ---
    {
        id: 'wm-vv-imagery',
        title: 'Sözel Sembolleştirme (V/V)',
        methodology: 'Lindamood-Bell',
        category: 'Working-Memory',
        description: 'Cümleleri zihinsel resme dönüştürme.',
        basePrompt: "Lindamood-Bell V/V tekniğiyle, kısa bir metindeki detayları (renk, boyut, miktar, konum) zihinde canlandırmayı ve ardından bu imgeleri geri çağırmayı hedefleyen yapı taşlı sorular üret."
    },
    {
        id: 'wm-digit-reverse',
        title: 'Geriye Doğru Sayı Manipülasyonu',
        methodology: 'Feuerstein',
        category: 'Working-Memory',
        description: 'Duyulan sayıları zihinde ters çevirme.',
        basePrompt: "Öğrenciye verilen sayı dizilerini zihninde tersine çevirip (Örn: 1-5-8 -> 8-5-1) yeni bir işlemle (Örn: +1 ekleyerek) söylemesini gerektiren çok katmanlı bir bellek çalışması üret."
    },
    {
        id: 'wm-instruction-chain',
        title: 'Yönerge Zinciri',
        methodology: 'Wilson',
        category: 'Working-Memory',
        description: 'Çok adımlı görevleri akılda tutma.',
        basePrompt: "Karmaşıklığı kademeli artan, 3 ile 6 adım arası ardışık talimatlar içeren (Örn: 'Mavi kareyi çiz, içine 2 yaz, sonra altını çiz') ve işlem sırasını denetleyen bir çalışma üret."
    },
    {
        id: 'wm-sentence-puzzles',
        title: 'Cümle İnşası (Bellek)',
        methodology: 'Orton-Gillingham',
        category: 'Working-Memory',
        description: 'Parçalanmış uzun cümleleri sentezleme.',
        basePrompt: "Bellekte tutulması gereken 4-5 farklı kelime grubunu, anlamlı bir cümle oluşturacak şekilde zihinsel olarak birleştirmeyi hedefleyen, kelime sırası karıştırılmış yapılar üret."
    },
    {
        id: 'wm-dual-task-stroop',
        title: 'İkili Görev Girişimi',
        methodology: 'Feuerstein',
        category: 'Working-Memory',
        description: 'Aynı anda iki bilişsel işlem yapma.',
        basePrompt: "Bir yandan görsel bir örüntüyü takip ederken diğer yandan basit sözel soruları yanıtlamayı gerektiren, 'Enterferans' (karışma) direncini ölçen bir çalışma tasarla."
    },
    {
        id: 'wm-backward-spelling',
        title: 'Zihinsel Tersten Yazım',
        methodology: 'Lindamood-Bell',
        category: 'Working-Memory',
        description: 'Kelimeleri sondan başa heceleme.',
        basePrompt: "Duyulan veya görülen kelimeleri zihinde harf harf tersine çevirmeyi (Örn: 'KALEM' -> 'M-E-L-A-K') ve bu süreçte sesli harfleri elemeyi gerektiren bir fonolojik bellek çalışması üret."
    },
    {
        id: 'wm-association-maps',
        title: 'Anlamsal İlişki Haritası',
        methodology: 'Sensory-Integration',
        category: 'Working-Memory',
        description: 'Kavramları bellek ağlarına bağlama.',
        basePrompt: "Bellekteki uzun süreli bilgiyi kısa süreliğine çağırıp yeni bilgilerle (Örn: Hayvan ismi + Yaşadığı yer + Baş harfi) çapraz eşleştirmeyi hedefleyen bir ilişkisel ağ üret."
    },
    {
        id: 'wm-chunking-numbers',
        title: 'Gruplandırma (Chunking) Stratejisi',
        methodology: 'Wilson',
        category: 'Working-Memory',
        description: 'Uzun dizileri küçük birimlere ayırma.',
        basePrompt: "Uzun sayı veya harf dizilerini (Örn: 19232023) anlamlı parçalara (1923 - 2023) ayırarak akılda tutma stratejisini öğreten, sistematik bir bellek eğitimi sayfası üret."
    },
    {
        id: 'wm-story-recall-matrix',
        title: 'Hikaye Detay Matrisi',
        methodology: 'Lindamood-Bell',
        category: 'Working-Memory',
        description: 'Dinlenen hikayeden 5N1K verisi çekme.',
        basePrompt: "Kısa bir sesli veya yazılı metindeki 5 farklı değişkeni (kim, nerede, ne zaman, neyle, niçin) bir tabloya hatasız yerleştirmeyi gerektiren bir geri çağırma çalışması üret."
    },
    {
        id: 'wm-visual-span-test',
        title: 'Görsel Menzil (Span) Eğitimi',
        methodology: 'Sensory-Integration',
        category: 'Working-Memory',
        description: 'Anlık görülen nesnelerin sayısını artırma.',
        basePrompt: "Flaş kart mantığıyla çok kısa süre gösterilen (simüle edilen) nesne gruplarının yerlerini ve miktarlarını hatırlamayı hedefleyen, kademeli zorlaşan bir görsel bellek seti üret."
    },

    // --- 4. EXECUTIVE-FUNCTION CATEGORY (10 Items) ---
    {
        id: 'ef-planning-maze',
        title: 'Stratejik Planlama Labirenti',
        methodology: 'Feuerstein',
        category: 'Executive-Function',
        description: 'Önceden plan yapma ve dürtü kontrolü.',
        basePrompt: "Birden fazla çıkışı olan ancak sadece bir yolun kurallara (Örn: 'Sadece çift sayılara bas') uygun olduğu, öğrencinin kalemini oynatmadan önce rotayı planlamasını zorunlu kılan bir labirent tasarla."
    },
    {
        id: 'ef-prioritization-sort',
        title: 'Önceliklendirme Sıralaması',
        methodology: 'Feuerstein',
        category: 'Executive-Function',
        description: 'Görevleri aciliyet ve öneme göre dizme.',
        basePrompt: "Günlük hayattan 6 farklı görevi (Örn: Ödev yap, Diş fırçala, Oyun oyna) bir zaman çizelgesine mantıksal bir sıra ve hiyerarşi ile yerleştirmeyi hedefleyen bir organizasyon çalışması üret."
    },
    {
        id: 'ef-inhibition-control',
        title: 'Dürtü Kontrolü (Go/No-Go)',
        methodology: 'Sensory-Integration',
        category: 'Executive-Function',
        description: 'Tepkiyi durdurma ve baskılama eğitimi.',
        basePrompt: "Öğrencinin belirli sembollere (Örn: Yeşil Daire) hızlı tepki vermesini, ancak diğerlerine (Örn: Kırmızı Kare) tepkisini durdurmasını gerektiren, dikkat ve ketleme (inhibition) odaklı bir sayfa üret."
    },
    {
        id: 'ef-self-monitoring',
        title: 'Öz-Denetim Kontrol Listesi',
        methodology: 'Wilson',
        category: 'Executive-Function',
        description: 'Kendi hatalarını bulma ve düzeltme.',
        basePrompt: "İçinde bilerek yapılmış 10 farklı yazım, noktalama ve mantık hatası olan bir metin üret ve öğrencinin bu hataları bir dedektif gibi bulup 'düzeltme günlüğüne' yazmasını sağla."
    },
    {
        id: 'ef-cognitive-flexibility',
        title: 'Bilişsel Esneklik (Kural Değişimi)',
        methodology: 'Feuerstein',
        category: 'Executive-Function',
        description: 'Değişen kurallara hızlı uyum sağlama.',
        basePrompt: "İlk yarıda sayıların büyüklüğüne göre, ikinci yarıda ise renklerine göre gruplandırma yapmayı gerektiren, zihinsel set değişimini (set-shifting) tetikleyen bir dinamik görev tasarla."
    },
    {
        id: 'ef-time-estimation',
        title: 'Zaman Tahmini ve Yönetimi',
        methodology: 'Wilson',
        category: 'Executive-Function',
        description: 'İşlerin ne kadar süreceğini öngörme.',
        basePrompt: "Verilen farklı akademik görevlerin (Örn: 10 soru çözmek, bir sayfa okumak) kaç dakika süreceğini tahmin etmeyi ve gerçek süreyle karşılaştırmayı hedefleyen bir 'Zaman Mimarı' çalışması üret."
    },
    {
        id: 'ef-mental-sorting',
        title: 'Zihinsel Alfabetik Sıralama',
        methodology: 'Lindamood-Bell',
        category: 'Executive-Function',
        description: 'Bilgiyi bellekte tutup işlemleme.',
        basePrompt: "Rastgele verilen 5 kelimeyi, kağıda bakmadan zihninde alfabetik sıraya dizip ardından yazmayı gerektiren, işleyen bellek ve yönetici işlev sentezi bir çalışma üret."
    },
    {
        id: 'ef-problem-flowchart',
        title: 'Çözüm Akış Şeması',
        methodology: 'Feuerstein',
        category: 'Executive-Function',
        description: 'Sorunlara alternatif çözümler üretme.',
        basePrompt: "Bir problem durumu ver (Örn: 'Kalemin ucu kırıldı ve açacağın yok') ve öğrencinin bu durumdan çıkmak için 'Eğer... ise...' mantığıyla 3 farklı yol çizmesini sağlayan bir akış şeması tasarla."
    },
    {
        id: 'ef-task-decomposition',
        title: 'Görev Parçalama Atölyesi',
        methodology: 'Wilson',
        category: 'Executive-Function',
        description: 'Büyük hedefleri küçük adımlara bölme.',
        basePrompt: "Karmaşık bir hedefi (Örn: 'Bir kitap özeti yazmak') 10 küçük ve başarılabilir alt adıma bölmeyi öğreten, 'Adım Adım Başarı' temalı bir planlama sayfası üret."
    },
    {
        id: 'ef-error-checker',
        title: 'Hata Analizörü',
        methodology: 'Feuerstein',
        category: 'Executive-Function',
        description: 'Neden hata yapıldığını anlama (Metabiliş).',
        basePrompt: "Yapılmış bir hata örneği göster (Örn: Yanlış çözülmüş bir matematik sorusu) ve öğrencinin hatanın hangi adımda ve 'neden' yapıldığını (dikkat mi, bilgi mi, acele mi) analiz etmesini sağla."
    },

    // --- 5. MATH-LOGIC CATEGORY (10 Items) ---
    {
        id: 'math-feuerstein-matrix',
        title: 'Bilişsel Matris Tamamlama',
        methodology: 'Feuerstein',
        category: 'Math-Logic',
        description: 'Soyut düşünme ve kategorizasyon.',
        basePrompt: "3x3 matris yapısında, şekillerin veya sayıların belirli bir değişim kuralına (Örn: renk değişimi + sayı artışı) göre dizildiği, eksik parçanın mantık yoluyla bulunduğu bir çalışma üret."
    },
    {
        id: 'math-analogies-logic',
        title: 'Mantıksal Analojiler',
        methodology: 'Feuerstein',
        category: 'Math-Logic',
        description: 'İlişkiler arası ilişki kurma becerisi.',
        basePrompt: "Kavramlar veya sayılar arasında orantısal bağlar kurmayı gerektiren (Örn: 2'nin 4'e oranı, 5'in kaça oranıdır? veya Göz:Görmek ise Kulak:?) bir analoji seti tasarla."
    },
    {
        id: 'math-magnitude-check',
        title: 'Sayısal Büyüklük Karşılaştırma',
        methodology: 'Sensory-Integration',
        category: 'Math-Logic',
        description: 'Sayı sembolü ve miktar algısı.',
        basePrompt: "İki farklı sayı sembolü ile bu sayıları temsil eden düzensiz nokta gruplarını karşılaştırmayı ve hangisinin 'daha çok' olduğunu anlık fark etmeyi (subitizing) hedefleyen bir diskalkuli çalışması üret."
    },
    {
        id: 'math-symbolic-paths',
        title: 'Sembolik İşlem Yolları',
        methodology: 'Wilson',
        category: 'Math-Logic',
        description: 'Harflerin sayısal değerlerini çözme.',
        basePrompt: "Her geometrik şeklin gizli bir sayısal değere sahip olduğu (Örn: Üçgen=5, Kare=2) ve bu şekillerle kurulan denklemlerin çözülmesini gerektiren bir 'Matematiksel Şifreleme' sayfası üret."
    },
    {
        id: 'math-subitizing-dots',
        title: 'Anlık Sayılama (Subitizing)',
        methodology: 'Sensory-Integration',
        category: 'Math-Logic',
        description: 'Sayamadan miktarı tahmin etme.',
        basePrompt: "Farklı konfeti desenleri içindeki nokta sayılarını saymadan, gruplandırma stratejisiyle (Örn: 2şerli 3şerli görme) en hızlı şekilde tahmin etmeyi hedefleyen bir görsel miktar çalışması üret."
    },
    {
        id: 'math-logic-grid-deduction',
        title: 'Mantıksal Çıkarım Izgarası',
        methodology: 'Feuerstein',
        category: 'Math-Logic',
        description: 'İpuçlarından yola çıkarak tablo doldurma.',
        basePrompt: "3 kişi, 3 nesne ve 3 mekan içeren karmaşık ipuçları ver (Örn: 'Ali mavi olanı almadı') ve öğrencinin eleme yöntemiyle doğru eşleşmeyi bulacağı bir mantık ızgarası (logic grid) tasarla."
    },
    {
        id: 'math-algebraic-objects',
        title: 'Nesneli Cebir Giriş',
        methodology: 'Lindamood-Bell',
        category: 'Math-Logic',
        description: 'X yerine meyveler/nesnelerle denklem.',
        basePrompt: "Görsel nesnelerin (Örn: 2 Elma + 1 Armut = 10 TL) kullanıldığı, bilinmeyeni bulmaya yönelik somut bir denklem sistemi ve çözüm adımları içeren bir matematik sayfası üret."
    },
    {
        id: 'math-spatial-geometry',
        title: 'Geometrik Perspektif Analizi',
        methodology: 'Sensory-Integration',
        category: 'Math-Logic',
        description: 'Şekillerin açılımını ve birleşimini anlama.',
        basePrompt: "Parçalarına ayrılmış geometrik şekillerin (tangram benzeri) birleştirildiğinde hangi ana formu oluşturacağını zihinsel olarak bulmayı hedefleyen bir uzamsal mantık çalışması üret."
    },
    {
        id: 'math-number-line-jump',
        title: 'Sayı Doğrusu Navigasyonu',
        methodology: 'Wilson',
        category: 'Math-Logic',
        description: 'Sayılar arası mesafeyi görselleştirme.',
        basePrompt: "Bir kurbağanın sayı doğrusu üzerindeki zıplayışlarını (Örn: 2 ileri, 5 geri) modelleyen ve varış noktasını zihinsel olarak hesaplamayı gerektiren bir sayı hissi (number sense) çalışması tasarla."
    },
    {
        id: 'math-money-logic-pro',
        title: 'Finansal Mantık ve Değişim',
        methodology: 'Feuerstein',
        category: 'Math-Logic',
        description: 'Alışveriş simülasyonu ve para üstü.',
        basePrompt: "Kısıtlı bir bütçe ile (Örn: 50 TL) bir listedeki en verimli ürün kombinasyonlarını seçmeyi ve para üstünü hesaplamayı gerektiren, günlük yaşam temelli bir matematiksel muhakeme çalışması üret."
    }
];
