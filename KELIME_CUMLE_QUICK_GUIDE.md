# 🎯 KelimeCumleStudio Hızlı Kullanım Kılavuzu

## ✅ Yapılan Düzeltmeler

### 1️⃣ Soru Sayısı Artık Stabil ve Doğru
- ❌ **Eski**: 20 soru isteniyor, sayfalarda 15-5-15 gibi tutarsız dağılım
- ✅ **Yeni**: 20 soru isteniyor → Tam 20 soru üretiliyor ve düzgün sayfalanıyor

### 2️⃣ "Yüklemi Göster" Özelliği Artık Çalışıyor
- ❌ **Eski**: Toggle aktif ama yüklem gösterilmiyor
- ✅ **Yeni**: Toggle aktif → Soruların yanında `→ yüklem` badge'i görünüyor

---

## 🚀 Nasıl Kullanılır?

### Adım 1: Kelime-Cümle Stüdyosunu Açın
```
Sol menü → "Kelime-Cümle" seçeneğine tıklayın
```

### Adım 2: Aktivite Türünü Seçin
Mevcut türler:
- 📝 **Boşluk Doldurma** - Cümledeki eksik kelimeyi tamamla
- 🔘 **Çoktan Seçmeli** - 4 şıklı test soruları
- 🧩 **Kelime Tamamlama** - Eksik harfleri tamamla
- 🔀 **Karışık Cümle** - Kelimeleri doğru sıraya diz
- ↔️ **Zıt Anlam** - Kelimelerin zıt anlamlısını bul

### Adım 3: Soru Sayısını Ayarlayın
1. Sağ panelde **"Görünüm & Sayfa"** bölümünü açın
2. **"Soru Sayısı"** slider'ını istediğiniz adede ayarlayın (5-60 arası)
3. **"Format Yoğunluğu"** ile sayfa başına soru sayısını belirleyin:
   - **Otomatik**: Sistem her tür için optimal sayıyı seçer
   - **Manuel**: 5, 10, 15 veya 20 soruluk sayfalar

### Adım 4: Yüklemi Göster (İsteğe Bağlı)
1. **"Görünüm & Sayfa"** bölümünde
2. **"Yüklemi Göster"** onay kutusunu işaretleyin
3. ✅ **Sonuç**: Her cümlenin yüklemi, soruların yanında mor badge olarak görünür

### Adım 5: İçeriği Oluştur
1. **"✨ Verileri Güncelle"** butonuna tıklayın
2. ✅ Sistem seçtiğiniz adet kadar soru üretecek
3. ✅ Sayfalar otomatik ve dengeli şekilde bölünecek

---

## 📊 Örnek Kullanım Senaryoları

### Senaryo 1: 20 Soruluk Boşluk Doldurma
```
Aktivite: Boşluk Doldurma
Soru Sayısı: 20
Format Yoğunluğu: Otomatik

✅ Sonuç:
- Toplam 20 soru üretildi
- Sayfa başına ~10 soru
- Toplam 2 sayfa
- Her sayfa dengeli dağıtıldı
```

### Senaryo 2: 50 Soruluk Test Sınavı
```
Aktivite: Çoktan Seçmeli
Soru Sayısı: 50
Format Yoğunluğu: Yüksek Yoğunluk (15)

✅ Sonuç:
- Toplam 50 soru üretildi
- Sayfa başına 15 soru
- Toplam 4 sayfa (15 + 15 + 15 + 5)
```

### Senaryo 3: 30 Soruluk Karışık Cümle + Yüklem
```
Aktivite: Karışık Cümle
Soru Sayısı: 30
Yüklemi Göster: ✅ AKTİF

✅ Sonuç:
- Toplam 30 soru üretildi
- Her sorunun yanında yüklemleri gösteriliyor
- Sayfa başına ~8 soru
- Toplam 4 sayfa
```

---

## ⚙️ Otomatik Sayfa Başına Soru Sayıları

Sistem "Otomatik" modda her aktivite için optimal sayıyı seçer:

| Aktivite Türü | Sayfa Başına Soru | Sebep |
|--------------|-------------------|-------|
| Boşluk Doldurma | 10 | Orta uzunlukta cümleler |
| Çoktan Seçmeli | 5 | Şıklar fazla yer kaplar |
| Kelime Tamamlama | 12 | Kısa kelimeler |
| Karışık Cümle | 8 | Kelime dizileri uzun |
| Zıt Anlam | 15 | Kısa kelime çiftleri |

---

## 🎨 Görsel Ayarlar

### Font Boyutu
- **Aralık**: 14pt - 28pt
- **Varsayılan**: 22pt
- Disleksi dostu büyük font önerilir

### Kelime Aralığı
- **Aralık**: 0.5rem - 2.5rem
- **Varsayılan**: 1.5rem
- Harf ve kelime arası boşluğu ayarlar

### Nokta Boyutu
- **Aralık**: 4px - 20px
- **Varsayılan**: 12px
- Boşluk doldurma etkinliklerindeki noktaların boyutu

---

## 🐛 Sorun Giderme

### Problem: İstenilen sayıda soru üretilmiyor
**Çözüm**: Kaynak havuzunda yeterli soru olmayabilir. Konsol mesajını kontrol edin.

### Problem: Yüklemi Göster çalışmıyor
**Çözüm**: 
1. Aktivite türünün "Karışık Cümle" veya "Boşluk Doldurma" olduğundan emin olun
2. Toggle'ın aktif olduğunu kontrol edin
3. Sayfayı yenileyin

### Problem: Sayfalar düzgün bölünmüyor
**Çözüm**: 
1. "Format Yoğunluğu" ayarını "Otomatik" yapın
2. Tarayıcıyı yenileyin (F5)

---

## 💡 İpuçları

1. **Hızlı Mod Kullanın**: AI modu yerine "⚡ Hızlı" modu seçin → Anında sonuç
2. **Cevap Anahtarı**: "Cevap Anahtarını Ekle" ile öğretmen versiyonu oluşturun
3. **Yaş Grubu**: 5-7 yaş için basit, 14+ için karmaşık cümleler
4. **Zorluk Seviyesi**: Başlangıç → Orta → İleri → Uzman (4 seviye)

---

## 📱 Destek

Herhangi bir sorun yaşarsanız:
1. Tarayıcı konsolunu açın (F12)
2. Console sekmesindeki uyarıları kontrol edin
3. `KELIME_CUMLE_FIX_REPORT.md` dosyasını okuyun

---

**Güncelleme Tarihi**: 21 Nisan 2026  
**Versiyon**: 2.0 ✅  
**Durum**: Production Ready
