---
description: Yeni Bir Etkinlik (Activity) Modülü Oluşturma Kuralları
---

# Oogmatik Etkinlik Üretim Workflow Kılavuzu

Bu workflow, kullanıcı "Bana yeni bir X etkinliği ekle" dediğinde tamamen otonom olarak yeni yapının nasıl kurulacağını tanımlar.

## Ön Koşullar
- Referans modül: `src/modules/activities/_boilerplate/`
- Scaffold CLI: `npm run scaffold -- --blueprint <path>`
- 4 Lider Ajan denetimi aktif olmalı

## Kural 1: Klasör Yapısı (Modüler Bütünlük)
Her yeni etkinlik, `src/modules/activities/[aktivite-adi]/` klasörü içerisinde izole yapıda oluşturulmalıdır.

Gereksinim Duyulan Dosyalar:
1. `types.ts` — Veri yapısı arayüzü
2. `generators.ts` — AI (`generateXXXFromAI`) ve offline (`generateOfflineXXX`) üreticiler
3. `offlineGenerators.ts` — Algoritmik hızlı üretici
4. `ui/WorksheetUI.tsx` — A4 render bileşeni
5. `ui/ConfigPanel.tsx` — Dark glassmorphism ayar paneli
6. `index.ts` — Barrel export

## Kural 2: Görsel Standart (Ultra Premium A4)
- **WorksheetUI.tsx:** Lexend font, 0.5cm margin, compact grid/matris yapısı
- Her soruda `visualHint` alanı zorunlu
- `pedagogicalNote` alanı öğretmen için görünür

## Kural 3: Pedagojik ve Zorluk Ayarları (ConfigPanel)
- 3 zorluk seviyesi: Kolay, Orta, Zor
- Dark Glassmorphism tasarım
- `configFields` blueprint'ten otomatik render edilir. **AJANLARA ÖNEMLİ NOT:** Sadece basit inputlar koymayın. Etkinliğe özgü parametreleri (enum seçiciler, boolean switchler vb.) `configFields` içerisine zengin bir şekilde girin ki UI otonom olarak panelde daha işlevsel seçenekler (Örn: Select) oluştursun.

## İş Akışı (Step-by-Step):

// turbo-all

1. Kullanıcının tarif ettiği etkinliği analiz edin ve bir blueprint JSON dosyası oluşturun:
   `docs/superpowers/plans/activity-{name}.json`

2. Blueprint'i doğrulayın:
   ```bash
   npm run scaffold -- --blueprint docs/superpowers/plans/activity-{name}.json --dry-run
   ```

3. Ajan denetim pipeline'ını çalıştırın (scaffold CLI otomatik yapar):
   - Elif Yıldız → Pedagoji / ZPD onayı
   - Dr. Ahmet Kaya → Klinik dil / KVKK onayı
   - Bora Demir → TypeScript / mühendislik onayı
   - Selin Arslan → AI prompt / kalite onayı

4. Üretimi başlatın:
   ```bash
   npm run scaffold -- --blueprint docs/superpowers/plans/activity-{name}.json --verbose
   ```

5. Build doğrulaması (verification-before-completion):
   ```bash
   npx tsc --noEmit && npm run build
   ```

6. Kullanıcıya sonuçları bildirin:
   - Oluşturulan dosya listesi
   - Ajan onay durumları
   - Build durumu

(Bu workflow dosyasındaki kurallar, HER IDE ARACININ HER CLI'nin doğrudan uygulayacağı kesin talimatlardır.)