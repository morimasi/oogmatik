# Oogmatik Otonom Üretim & IDE Stratejisi (v2 Professional)

Bu belge, Oogmatik platformunun otonom üretim modülünü sanal bir simülasyon katmanından çıkarıp, gerçek dosyalar üreten ve projenin ana omurgasına (Production) entegre olan profesyonel bir IDE aracına dönüştürme planıdır.

## 1. Mimari Vizyon: "Everything is Real"
Otonom üretim terminali artık sadece tarayıcı belleğinde dosya saklamayacak; bir geliştirici IDE'si gibi çalışarak projenin fiziksel dizinlerine müdahale edecektir.

### Veri Akış Şeması
`AI Agent Swarm` -> `VFS Store (Draft)` -> `Admin Deploy API` -> `Physical File System (Disk)` -> `Hot Reload`

---

## 2. Teknik Bileşenler

### A. Fiziksel Yazma Servisi (Physical Sync)
- **Hedef:** `src/components/generators/` ve `src/services/generators/` dizinleri.
- **Mekanizma:** VFS'deki kod blokları `POST /api/admin/save-physical` endpoint'ine gönderilecek. 
- **Güvenlik:** Sadece `admin` yetkisine sahip kullanıcılar ve yerel/staging ortamında çalışacak.

### B. Otonom Registry Yönetimi (Self-Registration)
- **Dosya:** `src/services/generators/registry.ts`
- **İşlem:** Yeni bir `.tsx` üretildiğinde, registry dosyası otomatik olarak taranacak ve yeni modülün `import` ifadesi ile `ACTIVITY_REGISTRY` objesindeki kaydı "Marker-Based Injection" yöntemiyle eklenecek.
- **İşaretleyiciler:**
  ```typescript
  // AUTONOM_IMPORT_START
  import { MyNewActivity } from './MyNewActivity';
  // AUTONOM_IMPORT_END

  export const ACTIVITY_REGISTRY = {
    // AUTONOM_REGISTRY_START
    'my-new-activity': MyNewActivity,
    // AUTONOM_REGISTRY_END
  };
  ```

### C. IDE Seviyesinde Validasyon
- Üretilen kod disk üzerine yazılmadan önce:
  1. **Syntax Check:** `acorn` veya basit bir regex ile temel JS/TS hataları taranacak.
  2. **Structure Check:** `export const Activity` ve `export const Config` varlığı kontrol edilecek.
  3. **Style Check:** Tailwind sınıflarının geçerliliği denetlenecek.

---

## 3. Uygulama Adımları

### Faz 1: API Köprüsü (Temel)
- [ ] `/api/admin/fs-proxy` endpoint'inin oluşturulması.
- [ ] VFS içindeki `save` butonunun fiziksel kaydı tetiklemesi.

### Faz 2: Dosya Sistemi Entegrasyonu (Gelişmiş)
- [ ] `.tsx` uzantılı dosyaların `generators/` klasörüne dinamik yazılması.
- [ ] Mevcut dosyaların otonom olarak düzenlenmesi (Refactoring yeteneği).

### Faz 3: Kayıt Otomasyonu
- [ ] `registry.ts` dosyasının AI tarafından güncellenmesi.
- [ ] Dinamik import (`React.lazy`) altyapısının otonom üretimle senkronize edilmesi.

---

## 4. Kritik Kurallar
1. **Geri Dönülebilirlik:** Fiziksel bir dosya üzerine ilk kez yazılmadan önce `.bak` uzantılı yedeği alınmalı.
2. **Pedagojik Not:** Her fiziksel dosyanın en başında AI tarafından üretilen `pedagogicalNote` yorum satırı olarak yer almalı.
3. **ZPD Uyumu:** Üretilen kod, `AgeGroup` ve `Difficulty` parametrelerine göre dinamik UI yapılarına sahip olmalı.

---

## 5. Hedef Çıktı
Kullanıcı "Bana 2. sınıf seviyesinde bir disleksi destekli toplama oyunu yap" dediğinde;
1. AI kodu yazar.
2. Kullanıcı "Onayla ve Yayınla" der.
3. Arka planda `ToplamaOyunuV2.tsx` oluşur.
4. `registry.ts`'ye eklenir.
5. Sayfa yenilenmeden etkinlik listesinde görünür hale gelir.

**Dosya:** `otocli.md` - Oogmatik Autonomous IDE Blueprint
