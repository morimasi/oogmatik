---
description: Bir etkinlik modülünde değişiklik yapılırken uyulması ZORUNLU olan tam kapsamlı kontrol listesi
---

# Etkinlik Değişikliği Tam Kapsamlı Kontrol Listesi

> **KURAL**: Bir etkinlik üzerinde herhangi bir değişiklik (yeni oluşturma, silme, yeniden yazma, ayar ekleme vb.) istendiğinde aşağıdaki TÜM noktalar **TEK SEFERDE VE EKSİKSİZ** olarak güncellenmelidir. Parça parça güncelleme YASAKTIR.

## Zorunlu Güncelleme Noktaları (8 Dosya)

Bir etkinlik değişikliğinde aşağıdaki dosyaların **hepsi** tek commit'te güncellenmeli:

### 1. Offline Jeneratör
- **Dosya**: `src/services/offlineGenerators/<etkinlikAdi>.ts`
- **İşlem**: Yeni/güncellenmiş jeneratör fonksiyonunu yaz veya sil

### 2. Offline Generators Barrel Export
- **Dosya**: `src/services/offlineGenerators/index.ts`
- **İşlem**: Yeni fonksiyonu export et, eski export'u kaldır

### 3. Generator Registry (Offline + AI Bağlantısı)
- **Dosya**: `src/services/generators/registry.ts`
- **İşlem**: `ActivityType.XXX` için `offline:` ve `ai:` fonksiyonlarını güncelle

### 4. Sheet Bileşeni (A4 Çalışma Kâğıdı)
- **Dosya**: `src/components/sheets/<kategori>/<EtkinlikAdi>Sheet.tsx`
- **İşlem**: Yeni/güncellenmiş Sheet bileşenini yaz veya sil

### 5. Ana SheetRenderer (ÜST SEVİYE YÖNLENDIRME — KRİTİK!)
- **Dosya**: `src/components/SheetRenderer.tsx`
- **İşlem**: `if (activityType === ActivityType.XXX)` koşulunu ekle/güncelle
- **⚠️ BU ADIM ATLANIRSA EKRANDA HİÇBİR ŞEY GÖRÜNMEZ!**

### 6. LegacyRenderer (Yedek Yönlendirme)
- **Dosya**: `src/components/SheetRenderer/LegacyRenderer.tsx`
- **İşlem**: İlgili `case` bloğunu güncelle/ekle

### 7. Activity Config Paneli
- **Dosya**: `src/components/activity-configs/<EtkinlikAdi>Config.tsx`
- **İşlem**: Yeni/güncellenmiş ayar panelini yaz veya sil

### 8. Activity Config Registry
- **Dosya**: `src/components/activity-configs/index.ts`
- **İşlem**: `ActivityConfigRegistry` nesnesinde yeni config'i bağla, eski import'u kaldır

### 9. Eski Kod Temizliği
- Eski jeneratör fonksiyonları (başka dosyalardaki — ör: `mathLogic.ts`)
- Eski Sheet bileşenleri
- Eski Config bileşenleri
- Tüm ölü import'lar

## Doğrulama Adımları (Her Değişiklik Sonrası)

// turbo-all

1. `npx tsc --noEmit` — Sıfır tip hatası
2. `grep -r "ESKİ_FONKSİYON_ADI" src/` — Ölü referans kalmamalı
3. `git add . && git commit && git push origin main`

## Yasaklar

- ❌ Parça parça güncelleme (birden fazla commit'e bölme)
- ❌ Eski dosyaları silmeden yeni dosya oluşturma
- ❌ SheetRenderer.tsx'i atlamak
- ❌ Registry bağlantısını güncellememek
