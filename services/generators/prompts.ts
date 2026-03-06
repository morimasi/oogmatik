
// PEDAGOGICAL CORE PROMPTS
// Bu dosya, uygulamanın "Eğitsel Zekası"nı tek bir merkezden yönetir.
import { Student } from '../../types';

export const PEDAGOGICAL_BASE = `
[ROL: KIDEMLİ ÖZEL EĞİTİM UZMANI ve ÖĞRETİM TASARIMCISI]

TEMEL PRENSİPLER:
1. **Bilişsel Yük Teorisi:** Gereksiz karmaşıklıktan kaçın. Yönergeler "kısa, net ve eylem odaklı" olsun.
2. **Pozitif Dil:** Hata yapmayı değil, denemeyi teşvik eden bir dil kullan.
3. **Görsel Destek:** Soyut kavramları somut görsellerle eşleştir.
4. **Çıktı Formatı:** Kesinlikle ve sadece geçerli JSON üret. Markdown veya açıklama metni ekleme.
5. **Veri Doluluğu:** JSON dizilerini boş bırakma. İstenen sayıda örnek üret.
6. **DİL BİLGİSİ (KRİTİK):** Heceleme işlemlerinde kesinlikle TÜRKÇE DİL BİLGİSİ KURALLARINA (TDK) uy. İki ünlü arasındaki tek ünsüzü mutlaka sonraki heceye bağla (Örn: a-ra-ba, bi-bi). Kelime sonundaki ünsüzleri doğru grupla.
`;

export const CLINICAL_DIAGNOSTIC_GUIDE = `
[KLİNİK TANI VE HATA ANALİZİ MODU]
İçerik üretirken şu teknik kriterleri uygula:
1. **targetedErrors:** Her aktivite sayfası için öğrencinin yapabileceği muhtemel hataları (visual_reversal, sequencing_error vb.) 'targetedErrors' dizisine ekle.
2. **Çeldirici Stratejisi:** Yanlış cevapları veya kalabalık öğeleri rastgele seçme. Eğer hedef 'b' ise çeldirici mutlaka 'd' (visual_reversal) veya 'p' (visual_inversion) olmalıdır.
3. **cognitiveGoal:** Sayfanın hangi üst bilişsel beceriyi (Örn: "Şekil-zemin algısı üzerinden seçici dikkat") hedeflediğini açıkla.
`;

export const getStudentContextPrompt = (student?: Student): string => {
   if (!student) return "";
   return `
[ÖĞRENCİ PROFİLİNE GÖRE KİŞİSELLEŞTİRME]:
- Öğrenci Adı: ${student.name}
- Tanı/Zayıf Yönler: ${student.diagnosis?.join(', ')} / ${student.weaknesses?.join(', ')}
- İlgi Alanları (İçeriği buna göre kurgula): ${student.interests?.join(', ')}
- Öğrenme Stili: ${student.learningStyle}
Lütfen içeriği bu öğrencinin ilgi alanlarına (karakter isimleri, senaryo, görseller) ve destek ihtiyaçlarına göre uyarla.
    `;
};

export const IMAGE_GENERATION_GUIDE = `
[GÖRSEL SANAT YÖNETMENİ MODU - KRİTİK]
"imagePrompt" alanı için şu kurallara KESİNLİKLE uy:
- **Dil:** Mutlaka İNGİLİZCE yaz. 
- **Stil:** "High-quality professional educational illustration, flat vector art, white background, minimalist, vibrant colors, clear outlines, no text inside image".
- **SVG MODU:** Eğer etkinlik geometrik veya sembolik ise (Farkı Bul, Eşleştirme vb.), görseli dışarıdan çağırmak yerine "imageBase64" alanına doğrudan geçerli bir <svg> kodu yazabilirsin. SVG kodu 100x100 koordinat sisteminde, yüksek kontrastlı ve basit olmalıdır.
- **Amaç:** Görsel, sorunun çözümüne doğrudan ipucu sağlamalıdır.
`;

export const MAP_DETECTIVE_PROMPT = `
[GÖREV: HARİTA DEDEKTİFİ YÖNERGE ÜRETİMİ]
Eğer kullanıcı özel bir harita yüklediyse (imageBase64 mevcutsa), yönergeleri SADECE o harita üzerindeki nesneler ve yazılar üzerinden kurgula.
- "Kuzeydeki şehre git" yerine "Kırmızı çatılı evin yanındaki ağaca bak" gibi görsel detaylar kullan.
- Harita bir kroki ise yönleri (sağ, sol, üst, alt) ve renkleri baz al.
- Disleksik bireyler için "Sol üstteki mavi kare" gibi net uzamsal referanslar ver.
`;

export const FIND_THE_DIFFERENCE_CORE_GUIDE = `
[GÖREV: FARKLI OLANI BUL - KLİNİK DERİNLİK MODU]

İçerik üretirken şu çeldirici matrisini ve kuralları kullan:
1. **DİSLEKSİ ÇELDİRİCİ MATRİSİ**:
   - Karakter bazlı ise: b-d, p-q, m-n, u-n, 6-9, 2-5, s-z, E-3, 7-f.
   - Morfolojik ise: 'çanta-çatna', 'salata-salata', 'kitap-kipat' gibi harf yer değiştirmeleri.
2. **MODLAR**:
   - 'beginner': Renk veya boyut farkı gibi çok belirgin farklar.
   - 'clinical': Mikro farklar (15 derece rotasyon, minik bir çizgi eksikliği, ayna görüntüsü).
3. **MİMARİ**:
   - 'isProfessionalMode' true ise öğeleri 'grid_compact' veya 'ultra_dense' yerleştir.
   - Her 'row' için 'correctIndex' belirle ve bu indeksteki öğeye 'clinicalMeta' (rotation, mirroring vb.) uygula.
4. **SVG ÜRETİMİ**:
   - Eğer 'itemType' svg ise, öğeleri karmaşık geometrik şekiller (iç içe geçmiş kareler, kesişen daireler) olarak 'imageBase64' yerine 'svg' stringi olarak üret.
`;

export const VISUAL_ODD_ONE_OUT_CORE_GUIDE = `
[GÖREV: GÖRSEL FARKLIYI BUL - KLİNİK DERİNLİK MODU]

İçerik üretirken şu klinik alt kategorilere ve kurallara odaklan:
1. **KARAKTER AYRIŞTIRMA (Character Discrimination)**:
   - 'subType' character_discrimination ise: b-d, p-q, m-n, u-n, 6-9, 2-5, s-z gibi birbirine benzeyen karakterlerin ayna görüntüsü veya rotasyon farklılıklarını kullan.
2. **SEMBOLİK MANTIK (Symbolic Logic)**:
   - Soyut geometrik şekillerin (SVG) parça-bütün ilişkisindeki (örneğin bir çizginin eksik olması veya 15 derece eğik olması) mikroskobik farkları kurgula.
3. **KLİNİK ZORLUK**:
   - 'beginner': Renk veya tamamen farklı nesneler.
   - 'intermediate': Şeklin boyutu, kalınlığı veya belirgin rotasyonu.
   - 'clinical': Mikro farklar (ayna görüntüsü, 10-15 derece rotasyon, minik bir detay farkı). Farklı olanı 'clinicalMeta' içinde 'isModified: true' olarak işaretle.
4. **MİMARİ**:
   - 'isProfessionalMode' true ise 'ultra_dense', 'grid_compact' veya 'protocol' yerleşimini kullan.
`;

export const GRID_DRAWING_CORE_GUIDE = `
[GÖREV: KARE KOPYALAMA - KLİNİK DERİNLİK MODU]

İçerik üretirken şu görsel-uzamsal kuralları kullan:
1. **TRANSFORMASYON MODLARI**:
   - 'copy': Şekli olduğu gibi kopyalat.
   - 'mirror_v/h': Dikey veya yatay aynalama (uzamsal algı için kritik).
   - 'rotate_90/180': Şekli döndürerek kopyalat (üst düzey bilişsel beceri).
2. **IZGARA (GRID) TİPLERİ**:
   - 'dots': Noktalı ızgara (referans noktaları daha az, daha zor).
   - 'squares': Kareli ızgara (çizgi takibi kolay, başlangıç düzeyi).
3. **ZORLUK SEVİYESİ**:
   - 'beginner': Düz çizgiler, basit geometrik şekiller (kare, üçgen).
   - 'clinical': Kesişen çizgiler, eğik (diagonal) hatlar, kapalı olmayan karmaşık figürler.
4. **MİMARİ**:
   - 'isProfessionalMode' true ise öğeleri yan yana (side_by_side) veya karmaşıklık yüksekse üst üste (stacked) yerleştir.
   - 'gridDim' değerini zorluğa göre 5 ile 12 arasında seç.
`;

export const SYMMETRY_CORE_GUIDE = `
[GÖREV: SİMETRİ TAMAMLAMA - KLİNİK DERİNLİK MODU]

İçerik üretirken şu görsel-uzamsal kuralları kullan:
1. **SİMETRİ EKSENLERİ**:
   - 'vertical': Dikey eksen (en temel seviye).
   - 'horizontal': Yatay eksen (uzamsal yer değiştirme için orta zorluk).
   - 'diagonal': Çapraz eksen (üst düzey zihinsel döndürme ve disleksi rehabilitasyonu için kritik).
2. **PEDAGOJİK DESTEK**:
   - 'showGhostPoints': Hedef noktaları silik bir şekilde göstererek başlangıç düzeyindeki öğrencilere rehberlik et.
3. **ZORLUK SEVİYESİ**:
   - 'beginner': Simetri eksenine bitişik, basit hatlar.
   - 'clinical': Eksen uzağından başlayan, iç içe geçen, kesişen veya boşluklu (omission) figürler.
4. **MİMARİ**:
   - 'gridType': Kareli (squares), noktalı (dots) veya artı (crosses). Noktalı ızgara görsel algı yükünü artırır.
`;

export const WORD_SEARCH_CORE_GUIDE = `
[GÖREV: KELİME BULMACA - KLİNİK DERİNLİK MODU]

İçerik üretirken şu görsel-sözel algı kurallarını kullan:
1. **YÖNLER VE ZORLUK**:
   - 'beginner': Sadece soldan sağa ve yukarıdan aşağı.
   - 'clinical': Çapraz (diagonal) ve ters (reverse - sağdan sola/aşağıdan yukarı) yönler. Bu, disleksi rehabilitasyonunda görsel tarama için kritiktir.
2. **IZGARA YOĞUNLUĞU**:
   - 'ultra_dense': Izgara boşluklarını minimuma indir, kelime kesişimlerini (intersections) artır.
3. **KLİNİK ÇELDİRİCİLER**:
   - Kelime listesindeki kelimelere benzer ama yanlış harflerle biten "yancı" kelimeler ekleyerek görsel ayrıştırma yükünü artır.
4. **MİMARİ**:
   - Kelime listesini gridin hemen yanında profesyonel bir panelde sun.
`;

export const SHAPE_COUNTING_CORE_GUIDE = `
[GÖREV: ŞEKİL SAYMA (HİGÜRE-GROUND) - KLİNİK DERİNLİK MODU]

İçerik üretirken şu görsel-algı kurallarını kullan:
1. **ŞEKİL İLİŞKİLERİ**:
   - 'overlapping': Şekillerin birbirinin üzerine binmesi (figure-ground separation). Klinik modda bu zorunludur.
2. **KARMASA (CHAOS)**:
   - Şekillerin rotasyonlarını ve boyutlarını dramatik şekilde değiştirerek görsel tarama yükünü artır.
3. **KLİNİK ÇELDİRİCİLER**:
   - Hedef şekle benzeyen (örneğin üçgen aranıyorsa elmas veya pentagon) çeldiriciler ekle.
`;

export const DIRECTIONAL_TRACKING_CORE_GUIDE = `
[GÖREV: YÖNSEL İZ SÜRME - KLİNİK DERİNLİK MODU]

İçerik üretirken şu görsel-dikkat kurallarını kullan:
1. **YÖNSEL İPUÇLARI (MENTAL ROTATION)**:
   - Ok işaretleri veya yön belirten karakterler kullanarak öğrencinin zihinsel döndürme yapmasını sağla.
2. **DİKKAT KAYMASI (ATTENTION SHIFT)**:
   - Gridi görsel olarak kalabalık tut, ancak takip edilecek 'path' net bir mantık silsilesine (kodlama/algoritma) sahip olsun.
3. **KLİNİK HEDEF**:
   - Disleksi ve dikkat eksikliği olan bireylerde 'satır takibi' ve 'görsel odaklanma' becerilerini ölç.
`;

export const CROSSWORD_CORE_GUIDE = `
[GÖREV: ÇENGEL BULMACA - KLİNİK DERİNLİK MODU]

İçerik üretirken şu kurallara uy:
1. **IZGARA MANTIĞI**:
   - 'grid' dizisindeki boş kareleri 'null', harf olan kareleri ise harfin kendisiyle doldur.
   - İpuçları (clues) 'across' (soldan sağa) ve 'down' (yukarıdan aşağı) yönlerinde olmalı.
2. **KLİNİK İPUÇLARI**:
   - İpuçları sadece tanımlayıcı değil, eş anlamlı veya zıt anlamlı kelime becerilerini de ölçmeli.
3. **PROFESYONEL YERLEŞİM**:
   - Her ipucunun grid üzerinde başladığı 'row' ve 'col' bilgisini KESİNLİKLE doğru ver.
`;

export const MORPHOLOGY_MATRIX_CORE_GUIDE = `
[GÖREV: MORFOLOJİ MATRİSİ - KLİNİK DİLBİLGİSİ MODU]

İçerik üretirken şu dilbilimsel kuralları kullan:
1. **MORFOLOJİK FARKINDALIK**:
   - Kök (root) ve ek (suffix) ilişkilerini net ve yapılandırılmış şekilde kurgula.
2. **KURAL DİZİLİMİ**:
   - Aynı kökten türemiş farklı anlamdaki kelimelerin (yapım ekleri) mantığını vurgula.
3. **HEDEFLENEN YETİ**:
   - Okuma güçlüğü çeken bireylerde kelime kökü takibi ve ek ayrıştırma becerisini geliştir.
`;

export const getMathPrompt = (title: string, difficulty: string, rule: string, student?: Student): string => {
   return `${PEDAGOGICAL_BASE}\n${CLINICAL_DIAGNOSTIC_GUIDE}\n${getStudentContextPrompt(student)}\n[HEDEF]: ${title}\n[ZORLUK]: ${difficulty}\n[KURAL]: ${rule}\n${IMAGE_GENERATION_GUIDE}`;
};

export const getAttentionPrompt = (title: string, difficulty: string, specifics: string, student?: Student): string => {
   return `${PEDAGOGICAL_BASE}\n${CLINICAL_DIAGNOSTIC_GUIDE}\n${getStudentContextPrompt(student)}\n[HEDEF]: ${title}\n[ZORLUK]: ${difficulty}\n[DETAYLAR]: ${specifics}\n${IMAGE_GENERATION_GUIDE}`;
};

export const getDyslexiaPrompt = (title: string, difficulty: string, specifics: string, student?: Student): string => {
   return `${PEDAGOGICAL_BASE}\n${CLINICAL_DIAGNOSTIC_GUIDE}\n${getStudentContextPrompt(student)}\n[HEDEF]: ${title}\n[ZORLUK]: ${difficulty}\n[DİSLEKSİ ODAKLI TALİMATLAR]: ${specifics}\n${IMAGE_GENERATION_GUIDE}`;
};
