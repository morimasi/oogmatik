# 📚 Özel Eğitim Uzmanlık Bilgi Tabanı

> **Tüm Agency-Agents Ajanları İçin Zorunlu Eğitim**
> Bu belge, Oogmatik platformunda çalışacak tüm ajanların disleksi, diskalkuli ve disgrafi hakkında bilmesi gereken temel bilgileri içerir.

---

## 🎯 Kritik Anlayış: Bu Bir EdTech Değil, Bir ÖzelEğitimTech

**UNUTMA**: Oogmatik'te yaptığın her şey **gerçek bir çocuğa** ulaşır.
- Bir UI hatası → öğrenci motivasyonunu kaybeder
- Bir API hatası → öğretmenin ders planı bozulur
- Bir içerik hatası → çocuğun öğrenme anı mahvolur

**Hata toleransı = sıfır.**

---

## 🧠 Disleksi (Dyslexia) — Profesör Seviyesi Bilgi

### 1. Nedir?

**Disleksi**, nörolojik temelli bir **öğrenme güçlüğüdür**, zeka düzeyinden bağımsız olarak okuma, yazma ve heceleme becerilerini etkiler.

**Temel Özellikler**:
- **Fonolojik İşlemleme Zorluğu**: Sesleri ayırt etme, birleştirme, segmente etme güçlüğü
- **Hızlı İsimlendirme Zorluğu**: Harf, sayı, renk, nesne isimlerini hızlıca söyleyememe
- **Çalışma Belleği Sınırlaması**: Kısa süreli bilgi tutma ve işleme güçlüğü
- **Otomatikleşme Problemi**: Okuma akıcılığı kazanamama

**DİSLEKSİ DEĞİLDİR**:
- ❌ Tersten okuma (bu bir mit!)
- ❌ Tembel olmak
- ❌ Zeka eksikliği
- ❌ Görme problemi (her ne kadar bazı görsel algı sorunları eşlik edebilse de)

---

### 2. Disleksi Türleri (3 Ana Tip)

#### A. Fonolojik Disleksi (En yaygın — %70)
**Tanım**: Ses-harf eşleşmesini kurma zorluğu
**Belirtiler**:
- "Araba" kelimesini hecelere ayıramama (a-ra-ba)
- Benzer sesleri karıştırma (p/b, t/d, k/g)
- Yeni kelimeler okuyamama (bilinen kelimeler ezberden okunur)

**Müdahale**:
- Fonolojik farkındalık aktiviteleri (hece ayrıştırma, uyak bulma)
- Multisensory öğretim (Orton-Gillingham, Wilson Reading)
- Heceleme parkurları (heceler renklerle kodlanır)

#### B. Yüzey Disleksisi (Surface Dyslexia)
**Tanım**: Kelime tanıma ve görsel hafıza zorluğu
**Belirtiler**:
- Her kelimeyi harf harf çözmeye çalışma (yavaş okuma)
- Düzensiz kelimelerde hata ("yacht" → "yakt" gibi)
- Aynı kelimeyi farklı şekillerde okuma

**Müdahale**:
- Görsel kelime listesi çalışmaları
- Tekrarlı okuma (repeated reading)
- Whole-word recognition (kelime tanıma egzersizleri)

#### C. Karma Disleksi (Mixed/Deep Dyslexia)
**Tanım**: Hem fonolojik hem görsel zorluklar
**Müdahale**: Her iki yaklaşımın kombinasyonu

---

### 3. Disleksi-Dostu Tasarım Standartları (Oogmatik'te ZORUNLU)

#### A. Tipografi Kuralları
```css
/* ✅ ZORUNLU — Disleksi-dostu font */
font-family: 'Lexend', sans-serif;

/* ✅ Minimum font boyutu */
font-size: 16px; /* Mobil */
font-size: 18px; /* Tablet/Desktop */

/* ✅ Satır aralığı (leading) */
line-height: 1.8; /* Minimum 1.5, ideal 1.8-2.0 */

/* ✅ Karakter aralığı */
letter-spacing: 0.05em;

/* ✅ Paragraf aralığı */
margin-bottom: 2em;

/* ❌ YASAK — Disleksilerde okunamaz */
font-family: 'Times New Roman', serif; /* Serifli fontlar */
font-style: italic; /* Yatık yazı */
text-decoration: underline; /* Altı çizili (vurgu için bold kullan) */
```

#### B. Renk Kontrastı
```css
/* ✅ WCAG AAA uyumlu — En az 7:1 kontrast */
color: #2D3748; /* Koyu gri metin */
background-color: #F7FAFC; /* Hafif krem/bej arka plan */

/* ❌ YASAK */
color: #000000; /* Saf siyah — çok sert */
background-color: #FFFFFF; /* Saf beyaz — parlamaya neden olur */
```

#### C. Metin Yerleşimi
- **Hizalama**: Sol hizalı (sağa yaslı YASAK — düzensiz boşluk oluşturur)
- **Satır uzunluğu**: Max 70-80 karakter (çok uzun satırlar kaybolmaya neden olur)
- **Sütun genişliği**: Tek sütun (çoklu sütunlar dikkat dağınıklığı yaratır)
- **Boşluk kullanımı**: Bol beyaz alan (cramped layout kaygı artırır)

#### D. İçerik Sunumu
- **Kısa cümleler**: Max 15-20 kelime
- **Kısa paragraflar**: Max 3-4 cümle
- **Madde işaretleri**: Karmaşık metinleri yapılandırır
- **Görsel destek**: Her 100 kelimede bir görsel/ikon

---

### 4. Disleksi-Spesifik Aktivite Tasarım Prensipleri

#### Prensip 1: Multisensory Yaklaşım (Görsel + İşitsel + Kinestetik)
**Kötü Örnek**:
```
"Şu kelimeleri okuyun: kedi, köpek, kuş"
```

**İyi Örnek**:
```
🎨 Görsel: Kedi resmini gör
🔊 İşitsel: "Ke-di" sesini duy (hecelenmiş)
✋ Kinestetik: Havada "k-e-d-i" yaz
🌈 Renkli Hece: ke·di (her hece farklı renk)
```

#### Prensip 2: Başarı Odaklı Tasarım (Success-Based Design)
**İlk soru mutlaka kolay olmalı** → Öğrenci güven kazansın

**Kötü Örnek**:
```
Soru 1: "Fotosentez" kelimesini hecele.
Soru 2: ...
```

**İyi Örnek**:
```
Soru 1: "At" kelimesini hecele. (Kolay — başarı garantili)
Soru 2: "Arı" kelimesini hecele. (Biraz daha uzun)
Soru 3: "Araba" kelimesini hecele. (Kademeli zorluk artışı)
```

#### Prensip 3: ZPD (Zone of Proximal Development) Uyumu
**ZPD**: Öğrencinin **yardımla** yapabildiği görevler (çok kolay → sıkıcı, çok zor → kaygı)

**Yaş Grubu × Zorluk Matrisi**:
| Yaş Grubu | Kolay | Orta | Zor |
|-----------|-------|------|-----|
| 5-7 yaş | 1-2 heceli kelimeler | 3 heceli kelimeler | 4+ heceli kelimeler |
| 8-10 yaş | 2-3 heceli kelimeler | 4-5 heceli kelimeler | 6+ heceli + karmaşık yapı |
| 11-13 yaş | 3-4 heceli kelimeler | 5-6 heceli kelimeler | Düzensiz kelimeler |

---

## 🔢 Diskalkuli (Dyscalculia) — Profesör Seviyesi Bilgi

### 1. Nedir?

**Diskalkuli**, sayısal bilgiyi anlama, işleme ve hatırlama konusunda nörolojik temelli bir **öğrenme güçlüğüdür**.

**Temel Özellikler**:
- **Sayı Hissi Eksikliği**: "5" sayısının "1, 2, 3, 4" den büyük olduğunu sezgisel olarak anlamama
- **Sembolik Temsil Zorluğu**: Rakam "3" ile üç nesne arasında bağlantı kuramama
- **İşlem Hatırlama Güçlüğü**: 6+3'ün 9 olduğunu ezberleyememe (her seferinde sayarak buluyor)
- **Zaman ve Ölçü Kavramı Zayıflığı**: Saat okuyamama, para hesabı yapamama

**DİSKALKULİ DEĞİLDİR**:
- ❌ "Matematikte kötü olmak" (bu motivasyon/öğretim sorunudur)
- ❌ Zeka eksikliği
- ❌ Tembel olmak

---

### 2. Diskalkuli Scaffold Seviyeleri (CRA Yaklaşımı)

#### Seviye 1: Concrete (Somut — Fiziksel Nesneler)
**Hedef**: Sayıyı dokunarak, görerek anlamak
**Araçlar**:
- Manipulatifler (bloklar, boncuklar, sayı çubukları)
- Parmak sayma (ilk aşamada doğal bir strateji)
- Gerçek nesnelerle gruplama

**Örnek Aktivite**:
```
"3 elma + 2 elma = ? elma"
🍎🍎🍎 + 🍎🍎 = 🍎🍎🍎🍎🍎
```

#### Seviye 2: Representational (Temsili — Görsel)
**Hedef**: Fiziksel nesnelerden görsel sembollere geçiş
**Araçlar**:
- Sayı çizgisi (number line)
- Tally marks (çizgilerle sayma)
- Resimli problemler

**Örnek Aktivite**:
```
Sayı Çizgisinde Toplama:
0---1---2---3---4---5---6---7---8---9---10
    ^         ^
    3    +2   5
"3'ten başla, 2 adım ilerle"
```

#### Seviye 3: Abstract (Soyut — Rakamlar)
**Hedef**: Sembolik gösterimle işlem yapma
**Araçlar**:
- Rakamlar ve işlem sembolleri
- Zihinsel matematik

**Örnek Aktivite**:
```
3 + 2 = 5 (artık somut destek yok)
```

**KRİTİK**: Diskalkuli olan öğrenciler **Seviye 1 ve 2'yi atlamadan Seviye 3'e geçmemeli**. Geleneksel eğitim bu hatayı yapar.

---

### 3. Diskalkuli-Dostu Aktivite Tasarım Prensipleri

#### Prensip 1: Görsel Destek Her Zaman Mevcut
**Kötü Örnek**:
```
Soru: 7 + 5 = ?
```

**İyi Örnek**:
```
Soru: 7 + 5 = ?

Görsel Destek:
🟦🟦🟦🟦🟦🟦🟦  +  🟨🟨🟨🟨🟨  =  ?

Sayı Çizgisi:
0---1---2---3---4---5---6---7---8---9---10---11---12
                        ^         ^
                        7    +5   12
```

#### Prensip 2: Adım Adım Bölme (Chunking)
Karmaşık problemleri **küçük adımlara** böl.

**Kötü Örnek**:
```
Soru: 45 + 37 = ?
```

**İyi Örnek**:
```
Adım 1: 45'i 40 ve 5'e ayır
Adım 2: 37'yi 30 ve 7'ye ayır
Adım 3: 40 + 30 = 70 (onlar basamağı)
Adım 4: 5 + 7 = 12 (birler basamağı)
Adım 5: 70 + 12 = 82
```

#### Prensip 3: Gerçek Dünya Bağlamı
Soyut sayıları **anlamlı bağlama** yerleştir.

**Kötü Örnek**:
```
Soru: 8 - 3 = ?
```

**İyi Örnek**:
```
Soru: Senin 8 çileğin var. 3 tanesini yedin. Kaç çilek kaldı?
🍓🍓🍓🍓🍓🍓🍓🍓
Yediklerin: 🍓🍓🍓 (çizik atılmış)
Kalanlar: 🍓🍓🍓🍓🍓
```

---

## ✍️ Disgrafi (Dysgraphia) — Profesör Seviyesi Bilgi

### 1. Nedir?

**Disgrafi**, yazma becerisinde nörolojik temelli bir **öğrenme güçlüğüdür**.

**Temel Özellikler**:
- **Motor Koordinasyon Zorluğu**: El yazısı okunamaz, düzensiz harfler
- **Yazım Kurallarında Karmaşa**: Harf/kelime atlama, yanlış yazım
- **Yazma Hızı Yavaşlığı**: Düşündüğünü yazmadan önce unutur
- **El Yorgunluğu**: Kısa sürede ağrı, kramp

**DİSGRAFİ DEĞİLDİR**:
- ❌ "Kötü el yazısı" (bu pratik eksikliğidir)
- ❌ Tembel olmak
- ❌ Dikkat eksikliği (her ne kadar DEHB ile birlikte görülebilse de)

---

### 2. Disgrafi Türleri

#### A. Motor Disgrafi (Fiziksel)
**Tanım**: İnce motor becerilerde zorluk
**Belirtiler**: Düzensiz, okunaksız el yazısı; kalem tutuşu zorluğu

**Müdahale**:
- Kalem gripper kullanımı
- Yazma pratiği (büyük harflerden küçüğe geçiş)
- Klavye kullanımı (dijital yazım)

#### B. Uzamsal Disgrafi (Spatial)
**Tanım**: Kâğıt üzerinde yer algısı zorluğu
**Belirtiler**: Satıra sığdıramama, harf boyutları tutarsız, kelime aralıkları düzensiz

**Müdahale**:
- Kılavuz çizgili kâğıt (highlighted lines)
- Renk kodlu satırlar (farklı yükseklikler farklı renk)

#### C. Dilbilimsel Disgrafi (Linguistic)
**Tanım**: Yazım kurallarını hatırlama zorluğu
**Belirtiler**: Aynı kelimeyi farklı şekillerde yazma, gramer hataları

**Müdahale**:
- Yazım kontrol araçları
- Kelime bankası (sık kullanılan kelimeler görünür)
- Ses temelli yazım egzersizleri

---

### 3. Disgrafi-Dostu Aktivite Tasarım Prensipleri

#### Prensip 1: Yazıyı Minimalize Et
**Kötü Örnek**:
```
Soru: Aşağıdaki paragrafı kendi cümlelerinle yeniden yaz.
(Uzun paragraf)
```

**İyi Örnek**:
```
Soru: Şu kelimeyi seç: ☐ kedi  ☐ köpek  ☐ kuş
(Yazma yok, sadece işaretleme)
```

#### Prensip 2: Alternatif Girdi Yöntemleri
- **Çoktan seçmeli**: Yazma yerine seçme
- **Sürükle-bırak**: Kelimeleri sürükle, cümle oluştur
- **Sesli kayıt**: Mikrofona konuş, metin otomatik oluşsun
- **Resim seçimi**: Yazı yerine görsel seçimi

#### Prensip 3: Kılavuzlu Yazma Desteği
**Eğer yazma zorunluysa**:
- Noktalı çizgi şablonlar (öğrenci üstünden geçer)
- Kelime bankası (sık kullanılan kelimeler listelenir)
- Otomatik tamamlama (ilk 2 harf yazınca kelime önerileri)

---

## 🎯 Tüm Ajanlar İçin: Özel Eğitim Kontrol Listesi

Her kod/aktivite/içerik üretiminde **bu kontrol listesini** uygula:

### ✅ Disleksi Kontrolleri
- [ ] Lexend fontu kullanıldı
- [ ] Satır aralığı min 1.8
- [ ] Kısa cümleler (max 15 kelime)
- [ ] Görsel destek var
- [ ] İlk aktivite kolay (başarı garantili)
- [ ] Renkli hece vurgulama (gerekirse)

### ✅ Diskalkuli Kontrolleri
- [ ] Sayı çizgisi/blok görseli var
- [ ] CRA basamakları takip edildi (Concrete → Representational → Abstract)
- [ ] Adım adım çözüm yolu var
- [ ] Gerçek dünya bağlamı kullanıldı

### ✅ Disgrafi Kontrolleri
- [ ] Yazma gereksinimleri minimize edildi
- [ ] Alternatif girdi yöntemleri var (seçme, sürükleme)
- [ ] Kılavuzlu yazma desteği mevcut (gerekirse)

### ✅ Genel Özel Eğitim Standartları
- [ ] `pedagogicalNote` alanı dolduruldu (öğretmene "neden bu aktivite" açıklaması)
- [ ] `targetSkills` net tanımlandı
- [ ] `ageGroup` ve `difficulty` uyumu doğru
- [ ] KVKK uyumlu (öğrenci adı + tanı + skor birlikte görünmüyor)
- [ ] Tanı koyucu dil yok ("disleksisi var" → "disleksi desteğine ihtiyacı var")

---

## 📖 Kaynaklar ve Derinleşme

### Akademik Kaynaklar
- **Shaywitz, S. (2020)**. "Overcoming Dyslexia" — Fonolojik işlemleme teorisi
- **Butterworth, B. (2019)**. "The Dyscalculia Toolkit" — Sayı hissi ve müdahale
- **IDA (International Dyslexia Association)** — Disleksi standartları
- **MEB Özel Eğitim Yönetmeliği** — Türkiye yasal çerçeve

### Oogmatik'te Uygulamalar
- `services/generators/dyslexiaSupport.ts` — Disleksi aktiviteleri
- `services/generators/dyscalculia.ts` — Diskalkuli aktiviteleri
- `components/MathStudio/` — CRA basamaklı matematik
- `components/ReadingStudio/` — Multisensory okuma

---

**SON NOT**: Bu bilgi tabanını **ezberle**. Her görevde bu prensipleri uygula. Unutma: Her ürettiğin şey bir çocuğa ulaşıyor. Hata toleransı = sıfır.
