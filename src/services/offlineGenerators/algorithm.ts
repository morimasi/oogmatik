
import { GeneratorOptions, AlgorithmData, AlgorithmStep } from '../../types';

// ─── Premium Senaryo Havuzu (Kategorilere Göre) ──────────────────────────────

const SCENARIOS: AlgorithmData[] = [

    // ── Günlük Yaşam ──────────────────────────────────────────────────────────

    {
        title: 'Sabah Rutini Algoritması',
        instruction: 'Sabah kalktığında sıralı adımları takip et ve her kutuya onay işareti koy.',
        challenge: 'Her sabah aynı saatte okula yetişmek için en verimli sabah rutinini tasarla.',
        category: 'günlük_yaşam',
        algorithmType: 'dallanmalı',
        totalEstimatedTime: 15,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Sabah rutini gibi somut bir günlük senaryo, DEHB\'li öğrencilerin kendi günlük hayatlarını planlama becerisini destekler. Adım adım yönergeler zihinsel organizasyonu pekiştirir.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'process', label: 'İşlem', color: 'indigo', shape: 'rect' },
            { type: 'decision', label: 'Karar', color: 'amber', shape: 'diamond' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            {
                id: 1, type: 'start', text: 'BAŞLA — Alarm çalar, gözlerini aç.',
                cognitiveLoad: 'low', timeEstimate: 1,
                hint: 'Alarmı kapat, yataktan kalk.',
            },
            {
                id: 2, type: 'process', text: 'Yüzünü yıka ve dişlerini fırçala.',
                cognitiveLoad: 'low', timeEstimate: 5,
                hint: 'En az 2 dakika fırçalamayı unutma!',
                subSteps: ['Soğuk su aç', 'Diş macunu uygula', 'Çevre döngüsüyle fırçala'],
            },
            {
                id: 3, type: 'decision', text: 'Kıyafetlerin önceki gece hazırlandı mı?',
                cognitiveLoad: 'medium', timeEstimate: 1,
                yesPath: 'Giy ve devam et',
                noPath: 'Şimdi seç ve giy',
                hint: 'Önceden hazırlamak zaman kazandırır!',
            },
            {
                id: 4, type: 'process', text: 'Kahvaltını yap ve su iç.',
                cognitiveLoad: 'low', timeEstimate: 10,
                hint: 'Beyin çalışmak için enerjiye ihtiyaç duyar.',
                subSteps: ['Tabağı hazırla', 'Yavaş ye', 'En az 1 bardak su iç'],
            },
            {
                id: 5, type: 'decision', text: 'Çantan eksiksiz mi?',
                cognitiveLoad: 'medium', timeEstimate: 2,
                yesPath: 'Çıkmaya hazırsın!',
                noPath: 'Eksik eşyayı koy',
                hint: 'Kitap, kalem, ödev — hepsini kontrol et.',
            },
            {
                id: 6, type: 'output', text: 'Zamanında çık ve okula yönel.',
                cognitiveLoad: 'low', timeEstimate: 1,
            },
            { id: 7, type: 'end', text: 'BİTİR — Günaydın!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    {
        title: 'Sandviç Yapma Algoritması',
        instruction: 'Adımları sırayla uygula, her malzemeyi doğru sıraya koy.',
        challenge: 'Acıktın ama anneni/babanı rahatsız etmek istemiyorsun. Kendin sandviç yapabilir misin?',
        category: 'günlük_yaşam',
        algorithmType: 'lineer',
        totalEstimatedTime: 8,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Somut mutfak etkinlikleri, öğrencilerin sıralı düşünme becerisini günlük yaşamla ilişkilendirir. Kinestetik öğrenenler için idealdir.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'input', label: 'Girdi', color: 'indigo', shape: 'parallelogram' },
            { type: 'process', label: 'İşlem', color: 'blue', shape: 'rect' },
            { type: 'output', label: 'Çıktı', color: 'violet', shape: 'parallelogram' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — Elleri yıka.', cognitiveLoad: 'low', timeEstimate: 1, hint: 'Temiz eller temiz yiyecek demektir!' },
            { id: 2, type: 'input', text: 'Malzemeleri topla: ekmek, peynir, domates.', cognitiveLoad: 'low', timeEstimate: 2 },
            { id: 3, type: 'process', text: 'Ekmeği kes, bir dilime peynir koy.', cognitiveLoad: 'low', timeEstimate: 2, subSteps: ['Bıçağı dikkatlice kullan', 'Peyniri eşit böl'] },
            { id: 4, type: 'process', text: 'Domatesi dilimlere ayır ve ekle.', cognitiveLoad: 'low', timeEstimate: 2, hint: 'İnce dilimler sandviche daha iyi yayılır.' },
            { id: 5, type: 'process', text: 'İkinci dilimi üstüne kapat.', cognitiveLoad: 'low', timeEstimate: 1 },
            { id: 6, type: 'output', text: 'Sandvicini tabağa koy ve servis yap.', cognitiveLoad: 'low', timeEstimate: 1 },
            { id: 7, type: 'end', text: 'BİTİR — Afiyet olsun!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    {
        title: 'Karşıdan Karşıya Güvenli Geçiş',
        instruction: 'Her adımı gerçek bir kavşakta uygulamadan önce zihninde canlandır.',
        challenge: 'Okul çıkışı kalabalık bir kavşakta güvenli bir şekilde karşıya geçmek için ne yapmalısın?',
        category: 'günlük_yaşam',
        algorithmType: 'dallanmalı',
        totalEstimatedTime: 5,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Trafik güvenliği senaryosu, öğrencilerin karar alma süreçlerini gerçek hayata aktarmalarını sağlar. Disleksi dostu "DUR — BAK — GEÇME" kalıpları kullanılmıştır.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'process', label: 'İşlem', color: 'indigo', shape: 'rect' },
            { type: 'decision', label: 'Karar', color: 'amber', shape: 'diamond' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — Kavşağa yaklaş.', cognitiveLoad: 'low' },
            { id: 2, type: 'process', text: 'DUR! Kaldırım kenarında bekle.', cognitiveLoad: 'low', hint: 'Kaldırımın ucundan en az 1 adım geride dur.', timeEstimate: 1 },
            { id: 3, type: 'decision', text: 'Trafik ışığı var mı?', cognitiveLoad: 'medium', yesPath: 'Yeşil ışığı bekle', noPath: 'Her iki yöne bak' },
            { id: 4, type: 'decision', text: 'Yol tamamen güvenli mi?', cognitiveLoad: 'high', yesPath: 'Geç', noPath: 'Bekle ve tekrar bak', hint: 'Sağ-Sol-Sağ bakışını tekrarla!' },
            { id: 5, type: 'process', text: 'Düz yürü, koşma, yolu tam geç.', cognitiveLoad: 'low', timeEstimate: 1 },
            { id: 6, type: 'end', text: 'BİTİR — Karşıya güvenle geçtin!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    // ── Matematik ─────────────────────────────────────────────────────────────

    {
        title: 'Bölme İşlemi Algoritması',
        instruction: 'Bölme adımlarını takip et ve her kutuyu hesapla.',
        challenge: '36 ÷ 4 işlemini nasıl yaparsın? Adım adım hesapla.',
        category: 'matematik',
        algorithmType: 'döngüsel',
        totalEstimatedTime: 6,
        progressCheckpoints: ['2', '4', '5'],
        pedagogicalNote: 'Bölme algoritması, diskalkülisi olan öğrenciler için somut adımlarla görselleştirilmiştir. Döngüsel yapı, tekrarlayan mantığı kavramaya yardımcı olur.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'input', label: 'Girdi', color: 'sky', shape: 'parallelogram' },
            { type: 'process', label: 'İşlem', color: 'indigo', shape: 'rect' },
            { type: 'loop', label: 'Döngü', color: 'violet', shape: 'rect' },
            { type: 'decision', label: 'Karar', color: 'amber', shape: 'diamond' },
            { type: 'output', label: 'Çıktı', color: 'teal', shape: 'parallelogram' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — Bölüneni (36) ve bölen (4) yaz.', cognitiveLoad: 'low' },
            { id: 2, type: 'input', text: 'Kaç gruba bölüneceğini belirle: 4 grup.', cognitiveLoad: 'low', hint: 'Bölen = kaç eşit grup?' },
            { id: 3, type: 'loop', text: 'Bölen kadar sayı say: 4, 8, 12…', cognitiveLoad: 'medium', hint: 'Döngü bölünene ulaşana kadar devam et.', subSteps: ['4×1=4', '4×2=8', '4×3=12', '4×9=36 ✓'] },
            { id: 4, type: 'decision', text: 'Kalanın sıfıra eşit olduğunu kontrol et.', cognitiveLoad: 'high', yesPath: 'Tam bölünme, sonucu yaz', noPath: 'Kalan var, not et' },
            { id: 5, type: 'output', text: '36 ÷ 4 = 9 sonucunu yaz.', cognitiveLoad: 'low' },
            { id: 6, type: 'end', text: 'BİTİR — Tebrikler, doğru hesapladın!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    {
        title: 'EBOB Bulma Algoritması',
        instruction: 'İki sayının en büyük ortak bölenini Öklid yöntemiyle bul.',
        challenge: '12 ve 8 sayılarının EBOB\'unu nasıl bulursun?',
        category: 'matematik',
        algorithmType: 'döngüsel',
        totalEstimatedTime: 8,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Öklid algoritması soyut matematiği adımlara dönüştürerek somutlaştırır. Diskalkülisi olan öğrenciler için döngü görselleştirmesi kalıcı öğrenmeyi destekler.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'process', label: 'İşlem', color: 'indigo', shape: 'rect' },
            { type: 'loop', label: 'Döngü', color: 'violet', shape: 'rect' },
            { type: 'decision', label: 'Karar', color: 'amber', shape: 'diamond' },
            { type: 'output', label: 'Çıktı', color: 'teal', shape: 'parallelogram' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — İki sayıyı yaz: a=12, b=8.', cognitiveLoad: 'low' },
            { id: 2, type: 'process', text: 'Büyük sayıyı küçüğe böl: 12÷8=1, kalan=4.', cognitiveLoad: 'medium', hint: 'Kalan bulunana kadar devam et.' },
            { id: 3, type: 'loop', text: 'b=4, a=8 yap; tekrar böl: 8÷4=2, kalan=0.', cognitiveLoad: 'high', subSteps: ['a=b=8, b=kalan=4', '8÷4=2, kalan=0'] },
            { id: 4, type: 'decision', text: 'Kalan sıfır mı?', cognitiveLoad: 'medium', yesPath: 'EBOB = b (şu anki bölen)', noPath: 'Yeni b ile devam et' },
            { id: 5, type: 'output', text: 'EBOB(12,8) = 4 — sonucu yaz.', cognitiveLoad: 'low' },
            { id: 6, type: 'end', text: 'BİTİR — EBOB bulundu!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    // ── Fen ───────────────────────────────────────────────────────────────────

    {
        title: 'Fotosentez Algoritması',
        instruction: 'Bitkinin nasıl besin ürettiğini adımlara böl.',
        challenge: 'Bir bitki güneş ışığından nasıl yiyecek yapabilir? Süreci adımlarına ayır.',
        category: 'fen',
        algorithmType: 'lineer',
        totalEstimatedTime: 10,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Fen kavramlarını algoritma adımlarına dönüştürmek, soyut biyoloji bilgisini görsel ve sıralı yapıya kavuşturur. Özellikle disleksi profilli öğrenciler için bellek şeması oluşturur.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'input', label: 'Girdi', color: 'sky', shape: 'parallelogram' },
            { type: 'process', label: 'İşlem', color: 'green', shape: 'rect' },
            { type: 'output', label: 'Çıktı', color: 'teal', shape: 'parallelogram' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — Güneş doğar ve yapraklara çarpar.', cognitiveLoad: 'low', hint: 'Güneş = enerji kaynağı.' },
            { id: 2, type: 'input', text: 'Kökler topraktan su (H₂O) çeker.', cognitiveLoad: 'low', timeEstimate: 2 },
            { id: 3, type: 'input', text: 'Yaprak gözenekleri havadan CO₂ alır.', cognitiveLoad: 'medium', hint: 'CO₂ = karbondioksit (nefes verirken çıkan gaz).' },
            { id: 4, type: 'process', text: 'Klorofil, güneş enerjisini kullanarak CO₂ ve H₂O\'yu birleştirir.', cognitiveLoad: 'high', subSteps: ['6CO₂ + 6H₂O', '→ Şeker + O₂'] },
            { id: 5, type: 'output', text: 'Glikoz (şeker) üretilir ve depolanır.', cognitiveLoad: 'medium' },
            { id: 6, type: 'output', text: 'Oksijen (O₂) havaya salınır.', cognitiveLoad: 'low', hint: 'Soluk aldığın oksijeni bitkiler üretiyor!' },
            { id: 7, type: 'end', text: 'BİTİR — Fotosentez tamamlandı!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    {
        title: 'Su Döngüsü Algoritması',
        instruction: 'Suyun doğadaki yolculuğunu adımlara böl.',
        challenge: 'Bir damla yağmur suyu nereye gider? Tüm döngüyü adımlarla göster.',
        category: 'fen',
        algorithmType: 'döngüsel',
        totalEstimatedTime: 8,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Doğa döngüleri, öğrencilerin döngüsel algoritma yapısını somut bir çevre bilimi bağlamında öğrenmesine olanak tanır.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'process', label: 'İşlem', color: 'sky', shape: 'rect' },
            { type: 'loop', label: 'Döngü', color: 'blue', shape: 'rect' },
            { type: 'output', label: 'Çıktı', color: 'teal', shape: 'parallelogram' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — Okyanus yüzeyinden başla.', cognitiveLoad: 'low' },
            { id: 2, type: 'process', text: 'Güneş, suyu ısıtır → buharlaşma başlar.', cognitiveLoad: 'medium', hint: 'Buhar = görünmez su molekülleri.' },
            { id: 3, type: 'process', text: 'Buhar yükselir, soğur → bulutlar oluşur.', cognitiveLoad: 'medium', timeEstimate: 2 },
            { id: 4, type: 'output', text: 'Bulutlar yağış olarak yağmur/kar bırakır.', cognitiveLoad: 'low' },
            { id: 5, type: 'loop', text: 'Yağış toprağa sızar, nehirlere akar, okyanusa döner. DÖNGÜ DEVAM EDER.', cognitiveLoad: 'high', subSteps: ['Zemine sız', 'Nehirler → göller', 'Okyanus → başa dön'] },
            { id: 6, type: 'end', text: 'BİTİR — Döngü sonsuz tekrar eder!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    // ── Sosyal ────────────────────────────────────────────────────────────────

    {
        title: 'Yeni Arkadaş Edinme Algoritması',
        instruction: 'Tanımadığın biriyle arkadaş olmak için hangi adımları izlersin?',
        challenge: 'Yeni okula başladın ve hiç arkadaşın yok. Ne yaparsın?',
        category: 'sosyal',
        algorithmType: 'dallanmalı',
        totalEstimatedTime: 7,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Sosyal iletişim algoritmaları, sosyal becerilerde güçlük yaşayan DEHB ve disleksi profilli öğrencilere yapılandırılmış sosyal rehberlik sunar.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'process', label: 'İşlem', color: 'pink', shape: 'rect' },
            { type: 'decision', label: 'Karar', color: 'amber', shape: 'diamond' },
            { type: 'output', label: 'Çıktı', color: 'violet', shape: 'parallelogram' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — Teneffüste dışarı çık.', cognitiveLoad: 'low' },
            { id: 2, type: 'process', text: 'Yalnız duran veya gülümseyen birine bak.', cognitiveLoad: 'low', hint: 'Göz teması kurmak ilk adımdır.' },
            { id: 3, type: 'decision', text: 'O kişi sana gülümsedi mi?', cognitiveLoad: 'medium', yesPath: 'Yanına git ve selam ver', noPath: 'Başka birine bak' },
            { id: 4, type: 'process', text: '"Merhaba, ben [adın]. Seninle konuşabilir miyim?" de.', cognitiveLoad: 'medium', subSteps: ['Sakin ol', 'Net konuş', 'Gülümse'] },
            { id: 5, type: 'decision', text: 'Ortak bir ilgi alanı buldun mu?', cognitiveLoad: 'medium', yesPath: 'Konuşmayı sürdür', noPath: 'Kibarca vedalaş' },
            { id: 6, type: 'output', text: 'İletişim bilgilerini paylaş veya yarın da konuş.', cognitiveLoad: 'low' },
            { id: 7, type: 'end', text: 'BİTİR — Yeni bir arkadaşlık başladı!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    // ── Teknoloji ─────────────────────────────────────────────────────────────

    {
        title: 'Dosya Kaydetme Algoritması',
        instruction: 'Bilgisayarda çalışmanı nasıl kaydedersin? Adımları takip et.',
        challenge: 'Ödevini yazdın ama kaydetmezsen kaybolur! Nasıl kaydedersin?',
        category: 'teknoloji',
        algorithmType: 'lineer',
        totalEstimatedTime: 4,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Dijital beceri adımları, teknoloji okuryazarlığını görsel akış şemaları ile destekler. DEHB profilli öğrenciler için net emir cümleleri ve kontrol noktaları kullanılmıştır.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'input', label: 'Girdi', color: 'sky', shape: 'parallelogram' },
            { type: 'process', label: 'İşlem', color: 'blue', shape: 'rect' },
            { type: 'decision', label: 'Karar', color: 'amber', shape: 'diamond' },
            { type: 'output', label: 'Çıktı', color: 'teal', shape: 'parallelogram' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — Belgen açık.', cognitiveLoad: 'low' },
            { id: 2, type: 'input', text: 'Ctrl+S tuşlarına birlikte bas.', cognitiveLoad: 'low', hint: 'S = Save (Kaydet) anlamındadır.' },
            { id: 3, type: 'decision', text: 'Dosya adı soruldu mu?', cognitiveLoad: 'medium', yesPath: 'Anlamlı bir isim yaz', noPath: 'Doğrudan kaydedildi' },
            { id: 4, type: 'process', text: 'Kayıt klasörünü seç (Belgeler önerilir).', cognitiveLoad: 'medium', subSteps: ['Belgeler klasörüne git', 'Ders adına göre klasör seç'] },
            { id: 5, type: 'process', text: '"Kaydet" düğmesine tıkla.', cognitiveLoad: 'low', timeEstimate: 1 },
            { id: 6, type: 'output', text: 'Dosya adı başlık çubuğunda güncellendi.', cognitiveLoad: 'low', hint: 'Başlıkta yıldız (*) yoksa kaydedildi.' },
            { id: 7, type: 'end', text: 'BİTİR — Ödevin güvende!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },

    {
        title: 'İnternet Güvenli Arama Algoritması',
        instruction: 'Ödevine bilgi ararken hangi adımları izlersin?',
        challenge: 'Fen ödevi için bilgi arıyorsun ama hangi siteye güvenirsin?',
        category: 'teknoloji',
        algorithmType: 'dallanmalı',
        totalEstimatedTime: 6,
        progressCheckpoints: ['2', '4', '6'],
        pedagogicalNote: 'Dijital okuryazarlık ve bilgi güvenilirliği değerlendirme, 21. yy becerileri kapsamında kritiktir. Karar ağacı yapısı eleştirel düşünmeyi destekler.',
        legendItems: [
            { type: 'start', label: 'Başlangıç', color: 'emerald', shape: 'oval' },
            { type: 'process', label: 'İşlem', color: 'indigo', shape: 'rect' },
            { type: 'decision', label: 'Karar', color: 'amber', shape: 'diamond' },
            { type: 'output', label: 'Çıktı', color: 'teal', shape: 'parallelogram' },
            { type: 'end', label: 'Bitiş', color: 'rose', shape: 'oval' },
        ],
        steps: [
            { id: 1, type: 'start', text: 'BAŞLA — Tarayıcıyı aç.', cognitiveLoad: 'low' },
            { id: 2, type: 'process', text: 'Anahtar kelimeleri yaz: "fotosentez nedir".', cognitiveLoad: 'low', hint: 'Kısa ve net kelimeler daha iyi sonuç verir.' },
            { id: 3, type: 'process', text: 'İlk 3 sonuca tıkla ve başlıkları oku.', cognitiveLoad: 'medium', timeEstimate: 2 },
            { id: 4, type: 'decision', text: 'Site .gov, .edu veya güvenilir bir kurum mu?', cognitiveLoad: 'high', yesPath: 'Kaynaktan oku', noPath: 'Başka kaynağa geç', hint: 'Wikipedia başlangıç için iyidir ama tek kaynak olmasın.' },
            { id: 5, type: 'process', text: 'Önemli bilgileri not defterine yaz.', cognitiveLoad: 'medium', subSteps: ['Kendi cümlelerinle yaz', 'Kaynağı not al'] },
            { id: 6, type: 'output', text: 'Notları ödevine ekle, kaynakları listele.', cognitiveLoad: 'low' },
            { id: 7, type: 'end', text: 'BİTİR — Güvenilir bilgi toplandı!', cognitiveLoad: 'low' },
        ] as AlgorithmStep[],
    },
];

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────────

function getScenariosByCategory(category?: string): AlgorithmData[] {
    if (!category) return SCENARIOS;
    return SCENARIOS.filter(s => s.category === category);
}

// ─── Ana Offline Generator ───────────────────────────────────────────────────

export const generateOfflineAlgorithmGenerator = async (options: GeneratorOptions): Promise<AlgorithmData[]> => {
    const {
        worksheetCount = 1,
        category,
        algorithmType,
        colorTheme = 'varsayılan',
        showHints = true,
        showTime = false,
        showSubSteps = false,
    } = options as Record<string, unknown>;

    const pool = getScenariosByCategory(category as string | undefined);
    const source = pool.length > 0 ? pool : SCENARIOS;

    return Array.from({ length: worksheetCount as number }, (_, i) => {
        const base = source[i % source.length];

        // algorithmType filtresi yoksa doğrudan kullan
        const scenario: AlgorithmData = {
            ...base,
            colorTheme: colorTheme as AlgorithmData['colorTheme'],
            algorithmType: (algorithmType as AlgorithmData['algorithmType']) ?? base.algorithmType,
            steps: base.steps.map(step => ({
                ...step,
                // showHints=false ise hint'leri temizle
                hint: showHints ? step.hint : undefined,
                // showTime=false ise timeEstimate'i temizle
                timeEstimate: showTime ? step.timeEstimate : undefined,
                // showSubSteps=false ise subSteps'leri temizle
                subSteps: showSubSteps ? step.subSteps : undefined,
            })),
        };

        return scenario;
    });
};
