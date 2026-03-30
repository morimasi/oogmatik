# MEB 2024-2025 Matematik Gorsel-Metin Tutarlilik Protokolu

**Hazirlayan**: Dr. Ahmet Kaya (Klinik Direktoru, Ozel Egitim Uzmani)
**Tarih**: 2026-03-30
**Versiyon**: 1.0
**Kapsam**: Super Matematik Sinav Studyosu — 1-8. Sinif

---

## 1. KLINIK GEREKCE: NEDEN GORSEL-METIN TUTARLILIGI KRITIK?

### 1.1 Ozel Ogrenme Guclugu Olan Ogrenciler Icin

| Profil | Gorsel-Metin Uyumsuzlugunun Etkileri | Klinik Kanit |
|--------|---------------------------------------|--------------|
| **Disleksi** | Metin soruyu anlatirken gorsel farkli seyler gosteriyorsa, ogrenci bilissel yuku ikiye katlar. Dekoding ile visual-spatial isleme cakismasi yasanir. | Shaywitz (2003), Wolf & Bowers (1999) |
| **Diskalkuli** | Sayisal ifadeler gorsel ile eslesmezse ogrenci sayi hissini (number sense) gelistiremez. CRA basamaklari cokertilir. | Butterworth (2010), Geary (2004) |
| **DEHB** | Tutarsiz gorseller dikkat dagilmasini arttirir. Irrelevant visual detail = attention hijack. | Barkley (2015), DuPaul & Stoner (2014) |
| **Mixed Profil** | Coklu isleme gereksinimleri arasinda koordinasyon bozulur. Executive function overload. | Pennington (2006) |

### 1.2 MEB Sinav Standartlari

MEB merkezi sinavlarinda (LGS, beceri temelli degerlendir meler) su ilkeler uygulanir:

1. **Gorsel-Metin Butunlugu**: Soru metni ile gorsel birbirini destekler, celismez
2. **Yeterli Bilgi Ilkesi**: Gorsel uzerinde sorunun cozumu icin GEREKLI TUM bilgiler vardir
3. **Gorsel Yeterlilik**: Eksik veya yaniltici gorsel = gecersiz soru
4. **Baglamsallik**: Gorsel gercek yasam senaryosunu yansitir

---

## 2. OGRENME ALANI BAZLI GORSEL GEREKSINIMLERI

### 2.1 VERI ISLEME (1-8. Sinif)

#### Zorunlu Gorsel Tipler ve Kullanim Kurallari

| Sinif | Kazanim Ornegi | Zorunlu Gorsel | Klinik Dikkat Noktalari |
|-------|----------------|----------------|-------------------------|
| 1 | M.1.4.1.1 (basit tablo okuma) | `siklik_tablosu` | Maksimum 2 kategori, buyuk font, acik renkler |
| 2 | M.2.4.1.1 (cetele tablosu) | `cetele_tablosu` | 5'li gruplama net gosterilmeli, sayilar yaninda yazili olmali |
| 2 | M.2.4.1.2 (nesne grafigi) | `siklik_tablosu` veya `sutun_grafigi` | Nesneler figuratif olmali (elma, yildiz vb.) |
| 3-4 | M.3.4.1.1, M.4.4.1.1 (sutun grafigi) | `sutun_grafigi` | Y ekseni isaretli, grid cizgileri gorulmeli |
| 5 | M.5.4.1.3 (aritmetik ortalama) | `sutun_grafigi` + ortalama cizgisi | Ortalama cizgisi farkli renkte, kesikli |
| 6-8 | M.6.4.1.1, M.7.4.1.1 (karsilastirmali grafik) | `cizgi_grafigi` veya `sutun_grafigi` | En az 2 veri serisi, efsane (legend) zorunlu |

#### Veri Isleme Gorsel Kurallari

```
ZORUNLU:
[x] Gorsel baslik = soru baglami ile eslesir
[x] Eksenlerde birimler yazili (ay, kisi sayisi, kg vb.)
[x] Veri degerleri okunabilir (font >= 10px)
[x] Renk paleti colorblind-safe (kirmizi-yesil degil)

YASAK:
[ ] 3D grafikler (derinlik algisi yaniltici)
[ ] Kesik eksenler (baslangic 0 olmali, istisnai durumlarda belirtilmeli)
[ ] Cok fazla kategori (ilkokul max 5, ortaokul max 8)
```

---

### 2.2 GEOMETRI ve OLCME (1-8. Sinif)

#### Sinif Bazli Gorsel Gereksinim Matrisi

| Sinif | Kazanim Turu | Zorunlu Gorsel | Ozellikler |
|-------|--------------|----------------|------------|
| 1 | Geometrik cisim/sekil tanima | `kare`, `dikdortgen`, `ucgen`, `daire` | Etiketler opsiyonel, dolgu renkleri farkli |
| 2 | Kenar/kose sayma | Ayni + `cokgen` | Koseler noktali, kenarlar numarali olabilir |
| 3 | Aci tanima | `aci` | Aci yay isaretli, derece yazili |
| 3 | Cevre hesaplama | `kare`, `dikdortgen`, `ucgen` | TUM kenar uzunluklari yazili |
| 4 | Alan hesaplama | `dikdortgen` | En ve boy etiketli |
| 4 | Aci olcme | `aci` | Iletkiyle uyumlu gosterim |
| 5 | Ucgen/dortgen ic acilar | `ucgen`, `cokgen` | Acilar yay ile gosterilmeli, deger yazili veya ? |
| 5-6 | Dikme/paralel | `dogru_parcasi` | Oklar ve dik aci isareti |
| 6 | Cember/daire | `daire` | Merkez O, yaricap r etiketli |
| 7-8 | Pisagor, benzerlik | `dik_ucgen` | Dik aci isareti, kenarlar a,b,c etiketli |

#### Geometri Gorsel Kurallari

```
ZORUNLU:
[x] Sekil icinde SORUDA VERILEN tum olculer yazili
[x] Bilinmeyen kenar/aci "?" veya "x" ile isaretli
[x] Dik acilar kucuk kare isaretiyle gosterilir
[x] Paralel kenarlar ok isaretleriyle belirtilir
[x] Es kenarlar tikle isaretlenir

ONEMLI - MEB STANDARDI:
[x] "Sekil olcege uygun degildir" uyarisi eklenmeli (eger degilse)
[x] Sekil uzerinde YAZILI olmayan bilgi soruda VERILMEMELİ

YASAK:
[ ] Olculerin gorselde yanlis yerde gosterilmesi
[ ] Birim belirtilmeden uzunluk verilmesi
[ ] Acinin derecesiyle uyumsuz cizim
```

---

### 2.3 SAYILAR ve ISLEMLER (1-8. Sinif)

#### Gorsel Gerektiren ve Gerektirmeyen Durumlar

| Kazanim Turu | Gorsel Gerekli? | Gorsel Tipi | Aciklama |
|--------------|-----------------|-------------|----------|
| Sayi dogrusu gosterimi | EVET | `sayi_dogrusu` | Tam sayilar, kesirler, rasyoneller |
| Kesir modeli | EVET | `kesir_modeli` | Pay/payda gorseli, pasta veya dikdortgen |
| Dort islem problemleri | HAYIR (baglama bagli) | - | Gunluk yasam senaryosu yeterli |
| Basamak degeri | TERCIHI | `siklik_tablosu` (tablo) | Basamak tablosu gosterilebilir |
| Ritmik sayma | TERCIHI | `sayi_dogrusu` | Atlama gosterilebilir |

#### Sayi Dogrusu Kurallari (Kritik)

```
ZORUNLU:
[x] 0 noktasi her zaman gosterilmeli (negatif varsa)
[x] Isaretli noktalar farkli renk ve buyuk daire
[x] Esit araliklar tutarli (scale consistent)
[x] Ok isaretleri iki ucta (sonsuzluk gosterimi)

DISKALKULI UYUMU:
[x] Noktalar aralik cok buyuk olmamali (5 birim max)
[x] Kesirler icin ara bolmeler gosterilmeli
[x] Negatif/pozitif bolge renk farki (isteğe bagli)
```

---

### 2.4 CEBIR (6-8. Sinif)

| Kazanim Turu | Gorsel Tipi | Kullanim |
|--------------|-------------|----------|
| Koordinat sisteminde noktalar | `koordinat_sistemi` | x,y eksenleri, grid |
| Dogrusal fonksiyon grafigi | `koordinat_grafigi` | Dogru cizgisi, en az 2 nokta |
| Esitsizlik gosterimi | `sayi_dogrusu` | Acik/kapali nokta, oklama |

```
ZORUNLU:
[x] Koordinat sisteminde origin (0,0) isaretli
[x] Eksen etiketleri (x, y) yazili
[x] Grid cizgileri acik gri (okunabilirlik)
[x] Noktalar buyuk ve renkli (A, B, C etiketli)
```

---

### 2.5 OLASILIK (8. Sinif)

| Kazanim | Gorsel Tipi | Kurallar |
|---------|-------------|----------|
| Olasilik hesabi | `olaslik_cark` veya `pasta_grafigi` | Dilimler esit/esitsiz oldugu acik |
| Venn diyagrami | `venn_diyagrami` | Kesisim belirgin, elemanlar yazili |

---

## 3. GORSEL-METIN TUTARLILIK KONTROL LISTESI

Her AI uretimi soru icin asagidaki kontrol uygulanmalidir:

### 3.1 Uyumluluk Kontrolu

```
ADIM 1: METIN ANALIZI
[ ] Soruda bahsedilen TUM sayisal degerler listelendi mi?
[ ] Soruda bahsedilen TUM geometrik elemanlar listelendi mi?
[ ] Soruda kullanilan BIRIMLER belirlendi mi?

ADIM 2: GORSEL ANALIZI
[ ] Gorselde gosterilen TUM sayisal degerler listelendi mi?
[ ] Gorselde gosterilen TUM geometrik elemanlar listelendi mi?
[ ] Gorselde kullanilan BIRIMLER belirlendi mi?

ADIM 3: ESLESTIRME
[ ] Metin degerleri = Gorsel degerleri? (ESLESME ZORUNLU)
[ ] Metin birimleri = Gorsel birimleri? (ESLESME ZORUNLU)
[ ] Metin elemanlari = Gorsel elemanlari? (ESLESME ZORUNLU)

ADIM 4: YETERLILIK
[ ] Cozum icin gerekli TUM bilgiler gorselde var mi?
[ ] Gorselde EKSIK bilgi soruyu cozulemez kilar mi?
[ ] Gorselde FAZLA bilgi ogrenciyi yaniltir mi?
```

### 3.2 Uyumsuzluk Tipleri ve Cozumleri

| Uyumsuzluk Tipi | Ornek | Klinik Risk | Cozum |
|-----------------|-------|-------------|-------|
| **Deger Uyumsuzlugu** | Metin: "5 cm", Gorsel: 8 cm yazili | Yuksek — ogrenci hangisine guvenecek? | AI prompt'a siki deger eslestirme talimati |
| **Eksik Bilgi** | Ucgen cevresini sor, 2 kenar gorselde | Orta — ogrenci ustun problem cozme gerektirir | `ozellikler.kenarlar` tamamlanmali |
| **Fazla Bilgi** | 4 kenar gorselde, sadece 2'si lazim | Dusuk — dikkat dagitabilir | Irrelevant bilgiyi cikar |
| **Birim Uyumsuzlugu** | Metin: cm, Gorsel: mm | Yuksek — donusum hatasi | Ayni birim kullan |
| **Baglamsal Uyumsuzluk** | Metin: "Market alisverisi", Gorsel: fabrika | Orta — motivasyon dususu | Baglam uyumlu gorsel |

---

## 4. AI URETIM TALIMAT ENTEGRASYONU

### 4.1 mathSinavGenerator.ts Prompt Eklentisi

Asagidaki talimatlar `buildMathExamPrompt` fonksiyonuna eklenmelidir:

```typescript
const GORSEL_METIN_TUTARLILIK_TALIMATI = `
[GORSEL-METIN TUTARLILIK PROTOKOLU — ZORUNLU]

Her soru icin asagidaki kurallara MUTLAKA uy:

1. DEGER ESLESTIRME
   - Soru metninde gecen BUTUN sayisal degerler gorselde AYNEN yer almali
   - Gorselde gosterilen degerler metinde MUTLAKA bahsedilmeli
   - ORNEK DOGRU: Metin "AB = 5 cm" → Gorsel: AB kenari uzerinde "5 cm" yazili
   - ORNEK YANLIS: Metin "5 cm" → Gorsel: bos veya farkli deger

2. BIRIM TUTARLILIGI
   - Metin ve gorselde AYNI birim kullan (cm/cm, kg/kg)
   - Birim donusumu SORULMADIKCA karistirma

3. GEOMETRI ICIN
   - Soruda "ucgen ABC" diyorsan, gorselde A, B, C koselerini ETIKETLE
   - Kenar uzunlugu soruluyorsa, BILINEN kenarlar gorselde YAZILI olmali
   - Aci soruluyorsa, BILINEN acilar gorselde gosterilmeli

4. VERI ISLEME ICIN
   - Grafik basligi soru baglami ile eslessin
   - Eksen etiketleri ve birimleri yazili olsun
   - Grafik verileri ile soru sayilari ESIT olsun

5. SAYI DOGRUSU ICIN
   - Isaretli noktalar metinde bahsedilen sayilarla eslessin
   - Aralik tutarliligi korunsun

UYARI: Bu kurallara UYMAYAN sorular GECERSIZ sayilir.
`;
```

### 4.2 Schema Validation

`MATH_EXAM_SCHEMA` icine tutarlilik dogrulama alani eklenebilir:

```typescript
gorsel_metin_uyumu: {
    type: 'OBJECT',
    properties: {
        metindeki_degerler: {
            type: 'ARRAY',
            items: { type: 'STRING' }
        },
        gorseldeki_degerler: {
            type: 'ARRAY',
            items: { type: 'STRING' }
        },
        uyumluluk_kontrolu: {
            type: 'BOOLEAN'
        }
    },
    nullable: true
}
```

---

## 5. OZEL OGRENME GUCLUGU PROFIL BAZLI GORSEL ADAPTASYONLARI

### 5.1 Disleksi Uyumu

```
GORSEL TERCIHLERI:
[x] Metinden ziyade gorsel agirlikli sorular
[x] Buyuk, okunakli font (Lexend, min 12pt)
[x] Yuksek kontrast (acik zemin, koyu metin/cizgi)
[x] Grafikler basit, az detay

KACINILACAKLAR:
[ ] Cok fazla metin + kucuk gorsel
[ ] Dusuk kontrastli renkler
[ ] Karisik/dolu gorseller
```

### 5.2 Diskalkuli Uyumu

```
GORSEL TERCIHLERI:
[x] Sayi dogrusu MUTLAKA kullan (sayi hissi destegi)
[x] Kesir modelleri somut (pasta, dikdortgen bolme)
[x] Adim adim gosterim (CRA basamaklari)
[x] Gruplandirma gorselleri (5'li, 10'lu)

KACINILACAKLAR:
[ ] Soyut sayisal ifadeler gorselsiz
[ ] Cok buyuk sayilar olceksiz
[ ] Kesir/ondalik gorselsiz
```

### 5.3 DEHB Uyumu

```
GORSEL TERCIHLERI:
[x] Temiz, minimal gorseller
[x] Tek odak noktasi (tek sekil, tek grafik)
[x] Acik yonlendirmeler (ok, vurgulama)
[x] Kisa gorev suresi ile uyumlu basitlik

KACINILACAKLAR:
[ ] Cogu irrelevant detay
[ ] Cok fazla renk/eleman
[ ] Dikkat dagitan arka plan desenleri
```

---

## 6. SINIF BAZLI GORSEL KARMASIKLIK SEVIYELERI

| Sinif | Maksimum Gorsel Eleman Sayisi | Font Boyutu | Renk Paleti | Not |
|-------|------------------------------|-------------|-------------|-----|
| 1-2 | 3-4 eleman | 14-16pt | 4 renk max | Figuratif gorseller tercih |
| 3-4 | 5-6 eleman | 12-14pt | 5 renk max | Geometrik sekiller net |
| 5-6 | 7-8 eleman | 11-13pt | 6 renk max | Grafik + sekil kombinasyonu |
| 7-8 | 8-10 eleman | 10-12pt | 8 renk max | Koordinat sistemi, karisik grafikler |

---

## 7. DOGRULAMA VE KALITE KONTROL

### 7.1 Otomatik Kontrol (Kod Tabanli)

```typescript
interface GorselMetinUyumKontrolu {
    soruId: string;
    metin: {
        sayisalDegerler: string[];
        birimler: string[];
        elemanlar: string[];
    };
    gorsel: {
        tip: GrafikVeriTipi;
        veriDegerleri: (number | string)[];
        ozellikDegerleri: (number | string)[];
    };
    uyumluluk: {
        degerEslesmesi: boolean;
        birimEslesmesi: boolean;
        elemanEslesmesi: boolean;
        genelSkor: number; // 0-100
    };
}

function kontrolEtGorselMetinUyumu(soru: MatSoru): GorselMetinUyumKontrolu {
    // Implementation...
}
```

### 7.2 Manuel Kontrol (Ogretmen/Admin)

Admin panelinde "Gorsel Dogrulama" adimi:
1. Soru metni ve gorsel yan yana goster
2. "Degerler eslesiyor mu?" checkbox
3. "Gorsel yeterli mi?" checkbox
4. "Ozel ogrenme uyumu" dropdown (disleksi/diskalkuli/DEHB uyumlu mu?)

---

## 8. UYGULAMA YOLU HARITASI

### Faz 1: Prompt Guncelleme (Hemen)
- [x] `GORSEL_METIN_TUTARLILIK_TALIMATI` eklenmesi
- [ ] Test sinavlari ile dogrulama

### Faz 2: Schema Genisletme (1 hafta)
- [ ] `gorsel_metin_uyumu` alani eklenmesi
- [ ] AI'dan tutarlilik meta-verisi isteme

### Faz 3: Otomatik Dogrulama (2 hafta)
- [ ] `kontrolEtGorselMetinUyumu` fonksiyonu
- [ ] Uyumsuz sorulari isaretleme/otomatik duzeltme

### Faz 4: Admin Dogrulama UI (3 hafta)
- [ ] Gorsel-metin karsilastirma paneli
- [ ] Profil-bazli uyumluluk skoru

---

## 9. REFERANSLAR

1. MEB Ozel Egitim Hizmetleri Yonetmeligi (2018, guncelleme 2023)
2. MEB Matematik Dersi Ogretim Programi 2024-2025
3. Shaywitz, S. (2003). Overcoming Dyslexia. Knopf.
4. Butterworth, B. (2010). Foundational numerical capacities. Trends in Cognitive Sciences.
5. Barkley, R.A. (2015). Attention-Deficit Hyperactivity Disorder: A Handbook for Diagnosis and Treatment.
6. LGS Matematik Ornekleme Sinavlari (MEB, 2023-2024)

---

**[KLINIK DIREKTIF - Dr. Ahmet Kaya]**

Bu protokol, Super Matematik Sinav Studyosu icin ZORUNLU uyum standardidir.
Protokole uymayan AI uretim sonuclari klinik onay alamaz.

Iletisim: Klinik degerlendirme sorulari icin `.claude/agents/ozel-egitim-uzmani.md` kullanin.
