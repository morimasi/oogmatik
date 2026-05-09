# Oogmatik: Full-Stack Otonom Etkinlik Geliştirme Sistemi

Bu belge, Oogmatik platformuna yeni bir eğitim etkinliğinin (Activity) hem backend (mantık/veri) hem frontend (UI/A4 Render) katmanlarıyla birlikte **tamamen otonom** bir şekilde eklenmesini sağlayan **ActivityScaffoldEngine** mimarisini tanımlar.

## 1. Mimari Vizyon
Sistem, tek bir **Activity Blueprint (Etkinlik Planı)** tanımından yola çıkarak, platformun 14 farklı noktasındaki kod değişikliklerini ve dosya üretimlerini hatasız gerçekleştirir.

*   **Sıfır Hata Toleransı**: Üretilen her kod parçası `ActivityValidator` tarafından denetlenir.
*   **Çift Motor Desteği**: Her etkinlik hem bir algoritma (Hızlı Mod) hem de AI (Derin Üretim) motoruna sahip olur.
*   **Tam Entegrasyon**: Menüden yazdırma motoruna kadar tüm bağlar otomatik kurulur.

---

## 2. Activity Blueprint Standartı (Beyin)
Her yeni etkinlik aşağıdaki JSON şemasına göre tanımlar:

```typescript
{
  "identity": {
    "key": "LETTER_MAZE",
    "title": "Harf Labirenti",
    "category": "reading-verbal",
    "icon": "fa-solid fa-maze"
  },
  "dataModel": {
    "interfaceName": "LetterMazeData",
    "fields": [
      { "name": "grid", "type": "string[][]", "required": true },
      { "name": "path", "type": "{x:number, y:number}[]" }
    ]
  },
  "logic": {
    "offline": "Algoritmik labirenti oluşturma mantığı",
    "ai": {
      "promptRole": "Okuma Uzmanı",
      "rules": ["Heceler arası bağ kur", "Görsel dikkati koru"]
    }
  },
  "ui": {
    "renderStrategy": "grid",
    "configFields": [
      { "id": "gridSize", "label": "Izgara Boyutu", "type": "range", "min": 3, "max": 10 }
    ]
  }
}
```

---

## 3. Çalışma Prensipleri (Motor)

### A. Kod Üretimi (Generation)
Aşağıdaki dosyalar şablonlar (Templates) kullanılarak sıfırdan oluşturulur:
1.  `src/types/activities/{name}.ts` (Veri Tipleri)
2.  `src/services/generators/{name}.ts` (AI Üretici)
3.  `src/services/offlineGenerators/{name}.ts` (Hızlı Üretici)
4.  `src/components/sheets/{category}/{Name}Sheet.tsx` (A4 Render)
5.  `src/components/activity-configs/{Name}Config.tsx` (Ayar Paneli)

### B. Kod Enjeksiyonu (Injection)
Mevcut büyük dosyalarda "Safe Insertion" (Güvenli Ekleme) yöntemiyle güncellemeler yapılır:
1.  `src/types/activity.ts` -> `ActivityType` Enum genişletme.
2.  `src/constants.ts` -> `ACTIVITIES` ve `CATEGORIES` dizilerine kayıt.
3.  `src/services/generators/registry.ts` -> Jeneratör haritalama.
4.  `src/components/SheetRenderer.tsx` -> Routing logic ekleme (Switch/Case).
5.  `src/components/activity-configs/index.ts` -> Panel kaydı.

---

## 4. Erişim Katmanları

### 🛠️ Geliştirici Katmanı (CLI)
Terminal üzerinden hızlı komutlarla üretim:
`npx oogmatik-scaffold generate --blueprint maze.json`

### 👑 Admin Katmanı (UI)
Admin panelindeki "Etkinlik Tasarımcısı" arayüzü ile:
1.  Form üzerinden özellikler seçilir.
2.  "Otonom Üret" butonuna basılır.
3.  Sistem arka planda dosyaları yazar ve `npm run build` ile doğrular.

---

## 5. Doğrulama ve Test Protokolü (Validation)

Her otonom işlemden sonra `ActivityValidator` şu kontrolleri yapar:
*   [ ] **TS Check**: Üretilen dosyalarda sözdizimi hatası var mı?
*   [ ] **Pedagogical Check**: `pedagogicalNote` alanı eklendi mi?
*   [ ] **Visual Check**: Lexend font ve compact margin kurallarına uyuluyor mu?
*   [ ] **Import Check**: Barrel exportlar (`index.ts`) doğru güncellendi mi?

---

## 6. Uygulama Adımları (Milestones)

1.  **FAZ 1 (Çekirdek)**: `ActivityBlueprint` ve `ActivityScaffoldEngine` geliştirilmesi (Code-Gen ve Injection servisleri).
2.  **FAZ 2 (CLI)**: Terminal aracının yayına alınması.
3.  **FAZ 3 (UI)**: Admin panelindeki görsel sihirbazın kodlanması.
4.  **FAZ 4 (Test)**: İlk prototip etkinliğin otonom olarak sisteme eklenip yayına alınması.
