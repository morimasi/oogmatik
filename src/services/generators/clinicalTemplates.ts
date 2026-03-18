
import { ClinicalTemplate, ClinicalTemplateCategory, TargetSkill } from '../../types/creativeStudio';

// ============================================================
// GERÇEK ÖÖG ÇALIŞMA KAĞIDI ŞABLON KÜTÜPHANESİ
// 60+ Profesyonel Klinik Şablon
// ============================================================

// Yardımcı fonksiyon
const t = (
    id: string, title: string, category: ClinicalTemplateCategory,
    description: string, icon: string, targetSkills: TargetSkill[],
    basePrompt: string, sampleBlocks: string[], difficulty: 'easy' | 'medium' | 'hard'
): ClinicalTemplate => ({ id, title, category, description, icon, targetSkills, basePrompt, sampleBlocks, difficulty });

// ============================================================
// DİSLEKSİ PAKETİ (20 Şablon)
// ============================================================
export const DYSLEXIA_TEMPLATES: ClinicalTemplate[] = [
    t('dys-01', 'Harf Ayrıştırma Matrisi', 'dyslexia',
        'b-d, p-q gibi ayna harflerin 8x8 matris içinde ayırt edilmesi.',
        'fa-table-cells', ['visual_discrimination', 'attention_focus'],
        'Bir 8x8 harf matrisi oluştur. Hedef harf "b" olsun. Çeldirici olarak "d", "p", "q" harflerini kullan. Öğrenci sadece hedef harfleri işaretlemeli. Her satırda en az 2 hedef harf bulunsun. Ayna harf hatası (reversal) riskini ölçmeye yönelik olmalı.',
        ['grid', 'text', 'footer_validation'], 'easy'),

    t('dys-02', 'Hece Treni', 'dyslexia',
        'Kelimeleri TDK kurallarına göre hece bloklarına ayırma.',
        'fa-train', ['phonological_awareness', 'reading_fluency'],
        'Tren vagonlarına benzeyen kutucuklarda kelimeleri hecelere ayır. "ka-lem", "a-ra-ba" gibi TDK heceleme kurallarına uy. Her hece ayrı bir vagonda gösterilecek. 15 kelime üret, zorluk artan sırada.',
        ['grid', 'text', 'visual_clue_card'], 'easy'),

    t('dys-03', 'Kelime Gölgeleri', 'dyslexia',
        'Eksik harfi tamamlayarak kelimeyi okuma.',
        'fa-ghost', ['reading_fluency', 'phonological_awareness'],
        'Kelimelerin bazı harflerini sil veya gölgeli yap. Öğrenci eksik harfleri tamamlayarak kelimeyi doğru okuyacak. Fonolojik farkındalığı geliştirmeye yönelik: "k_lem" → "kalem". 20 kelime üret.',
        ['grid', 'text', 'fill_blank'], 'medium'),

    t('dys-04', 'Cümle Takip Şeridi', 'dyslexia',
        'Satır takibi ve sakadik göz hareketi eğitimi.',
        'fa-grip-lines', ['reading_fluency', 'attention_focus'],
        'Uzun cümleleri renkli satır çapalarıyla böl. Her satırın başına ve sonuna farklı renkli geometrik şekiller koy. Öğrenci gözüyle satır sonundan bir sonraki satırın başına hatasız geçecek. 8 cümle üret.',
        ['text', 'neuro_marker', 'visual_clue_card'], 'medium'),

    t('dys-05', 'Anlam Eşleştirme', 'dyslexia',
        'Kelime-resim eşleştirmesi ile semantik işleme.',
        'fa-link', ['reading_fluency', 'working_memory'],
        'Sol sütunda kelimeler, sağ sütunda açıklamaları/eşleri olsun. Öğrenci doğru eşleşmeleri çizgiyle birleştirecek. 10 kelime çifti üret. Çeldiriciler semantik yakınlıkta olsun.',
        ['match_columns', 'text'], 'easy'),

    t('dys-06', 'Fonem Kutusu (Elkonin)', 'dyslexia',
        'Her ses birimi için ayrı kutucuk, seslem analizi.',
        'fa-table-cells', ['phonological_awareness'],
        'Kelimeleri Elkonin kutusu mantığıyla göster. Her harf/ses için ayrı bir ızgara hücresi. Öğrenci sesleri teker teker işaretleyecek. Uzun ünlü/kısa ünlü ayrımını vurgula. 12 kelime üret.',
        ['grid', 'text', 'syllable_box'], 'easy'),

    t('dys-07', 'Sözcük Ailesi Ağacı', 'dyslexia',
        'Aynı kökten türeyen kelimeler, morfem farkındalığı.',
        'fa-tree', ['phonological_awareness', 'reading_fluency'],
        'Bir kök kelimeden (örn: "yaz") türeyen tüm kelimeleri ağaç şeklinde göster: yazı, yazar, yazılı, yazışma. Kök kalın, ekler ince fontla. 8 kök kelime ailesi üret.',
        ['morpheme_tree', 'text', 'grid'], 'medium'),

    t('dys-08', 'Ayna Harf Laboratuvarı', 'dyslexia',
        'b-d, p-q harflerinin yön farkını kavrama.',
        'fa-arrows-left-right', ['visual_discrimination'],
        'Büyük fontla b ve d harflerini yan yana göster. Altına yönsel oklar ekle. Öğrenci her satırda sadece belirtilen harfi yuvarlak içine alacak. Karıştırma oranı artan zorlukta olsun. 10 satır üret.',
        ['grid', 'text', 'visual_clue_card', 'neuro_marker'], 'easy'),

    t('dys-09', 'Hızlı İsimlendirme Kartları', 'dyslexia',
        'RAN (Rapid Automatized Naming) pratiği.',
        'fa-bolt', ['reading_fluency', 'attention_focus'],
        'Renk, nesne, harf ve rakamlardan oluşan 5x10 hızlı isimlendirme matrisi oluştur. Öğrenci soldan sağa, üstten alta hızlıca isimlendirme yapacak. 4 farklı matris üret: renk, nesne, harf, rakam.',
        ['grid', 'text'], 'medium'),

    t('dys-10', 'Sessiz Harf Avı', 'dyslexia',
        'Kelime içinde sessiz/okunmayan harfleri bulma.',
        'fa-magnifying-glass', ['phonological_awareness', 'visual_discrimination'],
        'Metin içinde yumuşak g (ğ), sessiz harfler ve ses düşmesi olan kelimeleri bul ve işaretle. 15 cümle içinde en az 20 hedef kelime olsun.',
        ['text', 'grid', 'footer_validation'], 'hard'),

    t('dys-11', 'Morfem Cerrahi', 'dyslexia',
        'Kök ve ekleri ayırma, yapım/çekim eki ayrıştırma.',
        'fa-scissors', ['phonological_awareness'],
        'Kelimeyi kök ve eklerine böl. Kökü bir renkle, yapım ekini başka renkle, çekim ekini üçüncü renkle göster. 15 kelime üret, karmaşıklık artan sırada.',
        ['table', 'text', 'morpheme_tree'], 'hard'),

    t('dys-12', 'Akıcı Okuma Pisti', 'dyslexia',
        'Zamanlı okuma pratiği, kelime/dakika ölçümü.',
        'fa-stopwatch', ['reading_fluency'],
        '100 kelimelik bir metin üret. Paragrafı 5 bölüme ayır. Her bölüm sonunda kontrol noktası koy. Metin yaşa uygun, anlaşılır ve ilgi çekici olsun.',
        ['text', 'neuro_marker', 'footer_validation'], 'medium'),

    t('dys-13', 'Kelime Hafıza Duvarı', 'dyslexia',
        'Görsel-semantik hafıza ile kelime ezberleme.',
        'fa-note-sticky', ['working_memory', 'reading_fluency'],
        'Post-it benzeri kartlarda kelime-resim-cümle üçlüsü. Öğrenci kelimeleri bağlam içinde hatırlayacak. 12 kelime kartı üret.',
        ['grid', 'text', 'visual_clue_card'], 'easy'),

    t('dys-14', 'Hece Bulmacası', 'dyslexia',
        'Dağınık heceleri birleştirerek anlamlı kelime oluşturma.',
        'fa-puzzle-piece', ['phonological_awareness', 'working_memory'],
        'Karışık hece parçaları ver. Öğrenci doğru sırada birleştirerek kelime oluşturacak. Her kelime 2-4 heceli. 15 kelime üret, çeldirici heceler ekle.',
        ['grid', 'text', 'categorical_sorting'], 'medium'),

    t('dys-15', 'Sesli/Sessiz Sarmalı', 'dyslexia',
        'Ünlü ve ünsüzleri ayırt etme, renklendirme.',
        'fa-palette', ['phonological_awareness', 'visual_discrimination'],
        'Kelimelerdeki ünlü harfleri kırmızı, ünsüz harfleri mavi renkle göster. Öğrenci örüntüyü fark edecek. 20 kelime üret.',
        ['grid', 'text', 'table'], 'easy'),

    t('dys-16', 'Okuduğunu Anlama Piramidi', 'dyslexia',
        'Metinden çıkarım, 5N1K soruları.',
        'fa-triangle-exclamation', ['reading_fluency', 'executive_function'],
        '150 kelimelik kısa bir hikaye üret. Altına 5N1K formatında 8 soru ekle. Sorular: literal, çıkarımsal ve değerlendirme düzeyinde olsun.',
        ['text', 'table', 'footer_validation'], 'hard'),

    t('dys-17', 'Göz Takip Şeridi', 'dyslexia',
        'Sakadik göz hareketi ve satır takibi eğitimi.',
        'fa-eye', ['attention_focus', 'visual_discrimination'],
        'Numaralı satırlarda kelimeler dizili. Her satırın başında ve sonunda renkli takip noktaları var. Öğrenci gözüyle takip edecek. 12 satır üret.',
        ['text', 'neuro_marker'], 'medium'),

    t('dys-18', 'Paragraf Mimari', 'dyslexia',
        'Paragraf yapısı analizi: giriş, gelişme, sonuç.',
        'fa-building', ['reading_fluency', 'executive_function'],
        'Karışık verilmiş cümlelerden paragraf oluştur. Giriş-gelişme-sonuç bölümlerini renklerle ayır. 3 paragraf üret.',
        ['text', 'categorical_sorting', 'visual_clue_card'], 'hard'),

    t('dys-19', 'Kök-Ek Puzzle', 'dyslexia',
        'Kelime kökü ve eklerin puzzle parçası gibi birleştirilmesi.',
        'fa-puzzle-piece', ['phonological_awareness'],
        'Sol sütunda kök kelimeler, sağ sütunda ekler. Öğrenci doğru kök-ek eşleşmesi yapacak. 15 çift üret, çeldirici ekler dahil.',
        ['match_columns', 'text'], 'medium'),

    t('dys-20', 'Dikkat Labirenti', 'dyslexia',
        'Hedef harfi labirent içinde takip ederek çıkışı bulma.',
        'fa-maze', ['attention_focus', 'visual_discrimination'],
        'Grid tabanlı labirent. Sadece "b" harflerini takip ederek çıkışa ulaş. "d", "p", "q" çeldirici. 3 labirent üret, zorluk artan sırada.',
        ['grid', 'text', 'neuro_marker'], 'medium'),
];

// ============================================================
// DİSKALKULİ PAKETİ (15 Şablon)
// ============================================================
export const DYSCALCULIA_TEMPLATES: ClinicalTemplate[] = [
    t('calc-01', 'Sayı Hissi Basamakçısı', 'dyscalculia',
        'Birler, onlar, yüzler basamağını görsel bloklarla kavrama.',
        'fa-cube', ['math_logic', 'visual_discrimination'],
        'Her basamağı farklı renk bloklarla göster: birler sarı, onlar mavi, yüzler kırmızı. Sayıları basamak değerine ayırma. 15 sayı üret.',
        ['grid', 'table', 'visual_clue_card'], 'easy'),

    t('calc-02', 'Toplama Piramidi', 'dyscalculia',
        'Alt kattan üst kata toplama ile ilerleyen piramit.',
        'fa-mountain', ['math_logic'],
        'Piramidin tabanında sayılar var. Yan yana iki sayının toplamı üst bloğa yazılacak. 4 katlı piramit, 5 adet üret.',
        ['grid', 'text'], 'easy'),

    t('calc-03', 'Çarpım Tablosu Matrisi', 'dyscalculia',
        'Görsel ve renkli çarpım tablosu, boşluklu.',
        'fa-table', ['math_logic', 'working_memory'],
        '10x10 çarpım tablosu oluştur. Bazı hücreleri boş bırak. Öğrenci boşlukları dolduracak. Her satırda 3-4 boşluk. Çeldirici olarak yakın sayılar ver.',
        ['table', 'text', 'footer_validation'], 'medium'),

    t('calc-04', 'Geometrik Şekil Tanıma', 'dyscalculia',
        'Temel geometrik şekillerin özelliklerini eşleştirme.',
        'fa-shapes', ['visual_discrimination', 'math_logic'],
        'Sol sütunda şekil adları (kare, üçgen, daire vb.), sağ sütunda özellikleri (4 kenar, 3 köşe vb.). Eşleştirme. 10 şekil.',
        ['match_columns', 'text', 'grid'], 'easy'),

    t('calc-05', 'Saat Okuma Pratiği', 'dyscalculia',
        'Analog saat okuma ve dijital saat eşleştirme.',
        'fa-clock', ['math_logic', 'visual_discrimination'],
        'Analog saat gösterimleri ve dijital karşılıkları. Öğrenci eşleştirecek. Tam, yarım, çeyrek saatler. 12 saat çifti.',
        ['grid', 'match_columns', 'clock_face'], 'easy'),

    t('calc-06', 'Para Sayma Dükkânı', 'dyscalculia',
        'Türk Lirası banknotlarını ve bozuk paraları sayma.',
        'fa-coins', ['math_logic'],
        'Farklı miktarlarda TL banknot ve bozuk para göster. Öğrenci toplam tutarı hesaplayacak. 10 problem üret.',
        ['grid', 'text', 'table'], 'medium'),

    t('calc-07', 'Kesir Pastası', 'dyscalculia',
        'Pasta/pizza dilimi üzerinden kesirleri kavrama.',
        'fa-pie-chart', ['math_logic', 'visual_discrimination'],
        'Dairesel dilimlerle kesirleri göster: 1/2, 1/4, 3/4 gibi. Öğrenci görsel ile kesir ifadesini eşleştirecek. 12 kesir.',
        ['grid', 'match_columns', 'visual_clue_card'], 'easy'),

    t('calc-08', 'Ölçü Birimi Eşleştirme', 'dyscalculia',
        'cm-m, g-kg, ml-L gibi birim dönüşümlerini kavrama.',
        'fa-ruler', ['math_logic'],
        'Sol sütunda ölçüler (100 cm), sağda karşılıkları (1 m). Eşleştirme. 12 çift, çeldirici birimler dahil.',
        ['match_columns', 'text', 'table'], 'medium'),

    t('calc-09', 'Sayı Doğrusu Yolculuğu', 'dyscalculia',
        'Sayı doğrusu üzerinde toplama/çıkarma ve konum bulma.',
        'fa-arrows-left-right', ['math_logic', 'visual_discrimination'],
        'Sayı doğrusu üzerinde bir başlangıç noktası ve yön ok ile ilerle/geri git. Sonucu sayı doğrusunda göster. 10 problem.',
        ['number_line', 'text', 'grid'], 'easy'),

    t('calc-10', 'Problem Çözme Kartı', 'dyscalculia',
        'Sözel matematik problemi, adım adım çözüm rehberi.',
        'fa-lightbulb', ['math_logic', 'executive_function'],
        'Günlük hayattan 4 işlem problemi. Her problemin altında: Verilenler | İstenen | İşlem | Sonuç kutucukları. 8 problem üret.',
        ['text', 'table', 'visual_clue_card'], 'medium'),

    t('calc-11', 'Ondalık-Kesir Köprüsü', 'dyscalculia',
        'Kesir ve ondalık gösterim arasında dönüşüm.',
        'fa-bridge', ['math_logic'],
        'Sol sütunda kesirler (1/2, 1/4, 3/10), sağda ondalık karşılıkları (0.5, 0.25, 0.3). Eşleştirme. 12 çift.',
        ['match_columns', 'table', 'text'], 'hard'),

    t('calc-12', 'Sembol Denklem Makinesi', 'dyscalculia',
        'Basit cebirsel ifadeler: □ + 3 = 7 → □ = ?',
        'fa-square', ['math_logic', 'executive_function'],
        'Boş kutu (□) içeren denklemler. Öğrenci bilinmeyeni bulacak. Toplama ve çıkarma ile başla, çarpma-bölme ekle. 15 denklem.',
        ['text', 'grid', 'fill_blank'], 'medium'),

    t('calc-13', 'Sıralama Takibi', 'dyscalculia',
        'Sayıları küçükten büyüğe / büyükten küçüğe sıralama.',
        'fa-sort', ['math_logic', 'attention_focus'],
        'Karışık verilmiş sayıları sırala. 5 set: küçükten büyüğe, 5 set: büyükten küçüğe. Her sette 6-8 sayı, çeldirici yakın sayılar.',
        ['grid', 'text', 'ordering'], 'easy'),

    t('calc-14', 'Tahmin ve Karşılaştırma', 'dyscalculia',
        'Büyüklük tahmini ve >, <, = sembollerini kullanma.',
        'fa-scale-balanced', ['math_logic', 'visual_discrimination'],
        'İki sayı/miktar arasına >, < veya = sembolü koy. Görsel destekli (blok sayma). 15 karşılaştırma üret.',
        ['grid', 'text', 'comparison'], 'easy'),

    t('calc-15', 'Dört İşlem Puzzle', 'dyscalculia',
        'Bulmaca formatında dört işlem pratikleri.',
        'fa-puzzle-piece', ['math_logic', 'working_memory'],
        '3x3 ızgara. Her satır ve sütun bir denklem oluşturur. Bazı hücreler boş. Öğrenci mantık yürüterek tamamlayacak. 4 puzzle üret.',
        ['grid', 'text', 'logic_card'], 'hard'),
];

// ============================================================
// DEHB PAKETİ (10 Şablon)
// ============================================================
export const ADHD_TEMPLATES: ClinicalTemplate[] = [
    t('adhd-01', 'Odak Matrisi', 'adhd',
        'Hedef nesneyi karmaşık ızgarada hızla bulma.',
        'fa-crosshairs', ['attention_focus', 'visual_discrimination'],
        'Yoğun harf/şekil matrisi. Hedef öğeyi bul ve işaretle. Zaman sınırlı. 3 matris, zorluk artan. Her matris min 8x8.',
        ['grid', 'text', 'neuro_marker'], 'medium'),

    t('adhd-02', 'Sıralı Buyruk Kartı', 'adhd',
        'Çok adımlı yönerge takibi.',
        'fa-list-check', ['executive_function', 'working_memory'],
        '3-5 adımlı yönerge setleri üret. Öğrenci sırayla uygulayacak. "Önce kırmızıyı bul, sonra altını çiz, ardından sayısını yaz." 8 yönerge seti.',
        ['text', 'grid', 'visual_clue_card'], 'medium'),

    t('adhd-03', 'Planlama Adımları', 'adhd',
        'Günlük görevleri sıraya koyma, planlama becerisi.',
        'fa-calendar-check', ['executive_function'],
        'Karışık verilmiş günlük aktiviteleri doğru sıraya koy: "Dişlerini fırçala → Yüzünü yıka → Kahvaltı yap". 8 senaryo üret.',
        ['ordering', 'text', 'table'], 'easy'),

    t('adhd-04', 'Zamanlayıcı Etkinlik', 'adhd',
        'Süre tahmini ve zaman yönetimi pratiği.',
        'fa-hourglass-half', ['executive_function', 'math_logic'],
        'Günlük aktiviteler ve ne kadar sürdükleri. Öğrenci tahmin edecek ve gerçek süreyle karşılaştıracak. 10 aktivite.',
        ['table', 'text', 'comparison'], 'easy'),

    t('adhd-05', 'İşlem Sırası Takibi', 'adhd',
        'Dikkat dağınıklığı altında doğru sıra ile işlem yapma.',
        'fa-arrow-down-1-9', ['attention_focus', 'executive_function'],
        'Sayfa üzerinde dağınık numaralı kutucuklar. Öğrenci 1, 2, 3... sırasıyla takip edecek. Çeldiriciler: farklı boyut, renk, konum. 3 sayfa üret.',
        ['grid', 'neuro_marker', 'text'], 'medium'),

    t('adhd-06', 'Kodlama Şeridi', 'adhd',
        'Sembol-harf/rakam eşleştirmeli şifre çözme.',
        'fa-code', ['attention_focus', 'working_memory'],
        'Üstte bir anahtar tablosu (★=A, ●=B...). Altta sembol dizisi. Öğrenci anahtar ile sembolleri çözerek kelime/cümle oluşturacak. 5 şifre.',
        ['table', 'grid', 'text'], 'medium'),

    t('adhd-07', 'Yönerge Çözümleme', 'adhd',
        'Karmaşık yönergeleri adımlara ayırma.',
        'fa-diagram-project', ['executive_function'],
        'Uzun bir yönerge ver. Öğrenci bunu 3-5 basit adıma ayıracak. Sonra her adımı tek tek uygulayacak. 6 karmaşık yönerge.',
        ['text', 'ordering', 'visual_clue_card'], 'hard'),

    t('adhd-08', 'Güdülenme Çizelgesi', 'adhd',
        'Görev tamamlama takibi ve ödül sistemi.',
        'fa-star', ['executive_function', 'motor_skills'],
        'Haftalık görev tablosu. Her tamamlanan görev için yıldız. Hedef: 5 yıldız = büyük ödül. Vista/chart formatında.',
        ['table', 'grid', 'visual_clue_card'], 'easy'),

    t('adhd-09', 'Hata Avı', 'adhd',
        'Metin içinde kasıtlı hataları bulma, dikkat pratiği.',
        'fa-bug', ['attention_focus'],
        'Yazım ve mantık hataları gizlenmiş bir metin. Öğrenci hataları bulup düzeltecek. 150 kelimelik metin, 10-15 hata.',
        ['text', 'footer_validation', 'neuro_marker'], 'medium'),

    t('adhd-10', 'Seçici Dikkat Matriksi', 'adhd',
        'Renk-şekil-boyut kombinasyonunda hedef bulma.',
        'fa-filter', ['attention_focus', 'visual_discrimination'],
        'Kare, daire, üçgen şekiller 3 renkte (kırmızı, mavi, yeşil). Hedef: "büyük kırmızı daire". Öğrenci sadece hedefi işaretleyecek. 4 matris.',
        ['grid', 'text', 'neuro_marker'], 'hard'),
];

// ============================================================
// GENEL ÖÖG PAKETİ (15 Şablon)
// ============================================================
export const GENERAL_TEMPLATES: ClinicalTemplate[] = [
    t('gen-01', 'Kategorileme Tablosu', 'general',
        'Nesneleri mantıksal kategorilere ayırma.',
        'fa-layer-group', ['executive_function', 'math_logic'],
        '4 kategori: Meyveler, Sebzeler, Hayvanlar, Araçlar. 24 öğeyi doğru kategorilere yerleştir. Çeldirici: "domates" (meyve mi sebze mi?).',
        ['categorical_sorting', 'text', 'table'], 'easy'),

    t('gen-02', 'Sınıflandırma Ağacı', 'general',
        'Hiyerarşik sınıflandırma: canlı-cansız, bitki-hayvan.',
        'fa-sitemap', ['executive_function'],
        'Ağaç yapısında sınıflandırma: Canlılar → Bitkiler/Hayvanlar → Alt türler. 20 öğeyi doğru dallara yerleştir.',
        ['morpheme_tree', 'text', 'table'], 'medium'),

    t('gen-03', 'Benzerlik ve Fark', 'general',
        'İki nesne/kavram arasındaki benzerlik ve farkları bulma.',
        'fa-code-compare', ['executive_function', 'visual_discrimination'],
        'Venn diyagramı mantığında: Köpek vs Kedi, Araba vs Bisiklet gibi çiftler. Ortak ve farklı özellikleri listele. 6 çift.',
        ['table', 'text', 'comparison'], 'easy'),

    t('gen-04', 'Nedensellik Şeması', 'general',
        'Sebep-sonuç ilişkisini kavrama.',
        'fa-arrow-right', ['executive_function'],
        '"Yağmur yağarsa → sokak ıslanır" gibi neden-sonuç çiftleri. Sol sütun sebepler, sağ sütun sonuçlar. 12 çift, karıştırılmış.',
        ['match_columns', 'text'], 'medium'),

    t('gen-05', 'Hikaye Sıralama', 'general',
        'Karışık verilmiş olayları doğru kronolojik sıraya koyma.',
        'fa-timeline', ['executive_function', 'working_memory'],
        '5 cümlelik mini hikayeler. Cümleler karışık sırada. Öğrenci doğru sıraya koyacak. 6 hikaye üret.',
        ['ordering', 'text'], 'easy'),

    t('gen-06', 'Kavram Haritası', 'general',
        'Merkez kavramdan dallanan ilişki ağı.',
        'fa-diagram-project', ['executive_function', 'working_memory'],
        'Merkeze bir kavram koy (örn: "Okul"). Dalları: insanlar, mekanlar, nesneler, aktiviteler. Her dal 3-4 alt öğe. 4 harita.',
        ['morpheme_tree', 'text', 'grid'], 'medium'),

    t('gen-07', 'Duyu Entegrasyonu', 'general',
        '5 duyuya ait kelimeleri sınıflandırma.',
        'fa-hand-sparkles', ['phonological_awareness', 'executive_function'],
        'Görme, duyma, dokunma, tatma, koklama ile ilişkili kelimeleri doğru duyu kategorisine yerleştir. 25 kelime.',
        ['categorical_sorting', 'text', 'table'], 'easy'),

    t('gen-08', 'Psikomotor Takip', 'general',
        'Çizgi takibi, labirent ve el-göz koordinasyonu.',
        'fa-pencil', ['motor_skills', 'attention_focus'],
        'Noktalı çizgilerden oluşan harfler ve şekiller. Öğrenci üzerinden geçecek. Zorluk: düz çizgi → eğri → spiral. 10 şekil.',
        ['grid', 'text', 'neuro_marker'], 'easy'),

    t('gen-09', 'Görsel Hafıza Kartları', 'general',
        'Hafıza/eşleştirme oyunu formatında kartlar.',
        'fa-clone', ['working_memory', 'visual_discrimination'],
        'Çift kartların eşleştirilmesi. Her kartın bir eşi var. 4x4 grid: 8 çift. Konuları: hayvanlar, meyveler, renkler.',
        ['grid', 'text'], 'easy'),

    t('gen-10', 'Kısa Süreli Bellek Testi', 'general',
        'Sayı/harf dizisi ezberleme ve geri çağırma.',
        'fa-brain', ['working_memory'],
        'Artan uzunlukta sayı dizileri göster. Öğrenci geri yazacak. 3 rakamdan 7 rakama kadar. 10 dizi.',
        ['grid', 'text', 'footer_validation'], 'medium'),

    t('gen-11', 'İşitsel Bellek Kartları', 'general',
        'Duyduğunu hatırlama ve yazma pratiği.',
        'fa-ear-listen', ['working_memory', 'phonological_awareness'],
        'Dinlenecek kelime listeleri (5-8 kelime). Öğrenci duyduklarını sırayla yazacak. 6 liste, artan uzunlukta.',
        ['text', 'grid', 'fill_blank'], 'medium'),

    t('gen-12', 'Dikkat Transferi', 'general',
        'İki farklı görev arasında dikkat geçişi.',
        'fa-shuffle', ['attention_focus', 'executive_function'],
        'A görev: rakamları büyükten küçüğe sırala. B görev: harfleri alfabetik sırala. Dönüşümlü yapılacak. 8 set.',
        ['grid', 'text', 'ordering'], 'hard'),

    t('gen-13', 'Hız-Doğruluk Dengesi', 'general',
        'Hızlı cevaplama ile doğruluk arasındaki denge pratiği.',
        'fa-gauge-high', ['attention_focus'],
        'Basit işlemler/eşleşmeler zamanlı olarak verilecek. Hata cezası var. 20 problem, 30 saniye limit.',
        ['grid', 'text', 'footer_validation'], 'medium'),

    t('gen-14', 'Biçim Sabitliği', 'general',
        'Aynı şekli farklı boyut/açıda tanıma.',
        'fa-expand', ['visual_discrimination'],
        'Hedef şekli farklı boyutlarda, döndürülmüş ve ayna pozisyonlarında bul. 4 seri, her seride 6 şekil.',
        ['grid', 'text', 'neuro_marker'], 'medium'),

    t('gen-15', 'Mekansal Konum', 'general',
        'Üst-alt, sağ-sol, ön-arka yön kavramları.',
        'fa-compass', ['visual_discrimination', 'motor_skills'],
        'Nesnenin konumunu tanımla: "Top masanın üstünde", "Kedi kutunun içinde". Görsel + metin eşleşmesi. 12 konum.',
        ['grid', 'match_columns', 'text'], 'easy'),
];

// ============================================================
// TÜM ŞABLONLAR BİRLEŞİK
// ============================================================
export const ALL_CLINICAL_TEMPLATES: ClinicalTemplate[] = [
    ...DYSLEXIA_TEMPLATES,
    ...DYSCALCULIA_TEMPLATES,
    ...ADHD_TEMPLATES,
    ...GENERAL_TEMPLATES
];

// Kategoriye göre filtreleme
export const getTemplatesByCategory = (category: ClinicalTemplateCategory): ClinicalTemplate[] =>
    ALL_CLINICAL_TEMPLATES.filter(t => t.category === category);

// Beceriye göre filtreleme
export const getTemplatesBySkill = (skill: TargetSkill): ClinicalTemplate[] =>
    ALL_CLINICAL_TEMPLATES.filter(t => t.targetSkills.includes(skill));

// Zorluğa göre filtreleme
export const getTemplatesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): ClinicalTemplate[] =>
    ALL_CLINICAL_TEMPLATES.filter(t => t.difficulty === difficulty);
