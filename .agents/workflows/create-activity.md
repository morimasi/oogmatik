---
description: Yeni Bir Etkinlik (Activity) Modülü Oluşturma Kuralları
---

# Oogmatik Etkinlik Üretim Workflow Kılavuzu

Bu workflow, kullanıcı "Bana yeni bir X etkinliği ekle" dediğinde tamamen otonom olarak yeni yapının nasıl kurulacağını tanımlar.

## Kural 1: Klasör Yapısı (Modüler Bütünlük)
Her yeni etkinlik, `src/modules/activities/[AktiviteAdı]/` klasörü içerisinde tamamen izole ve kendi kendine yeten yapıda oluşturulmalıdır. Asla `services/offlineGenerators/` içine rastgele yeni bir TS dosyası atmayın. Referans alınacak kalıp: `src/modules/activities/_boilerplate/`.

Gereksinim Duyulan Dosyalar:
1. `types.ts`
2. `generators.ts` (generateFastMode ve generateDeepAIMode ikisi de bulunmalıdır)
3. `ui/WorksheetUI.tsx`
4. `ui/ConfigPanel.tsx`
5. `index.ts`

## Kural 2: Görsel Standart (Ultra Premium A4)
- **WorksheetUI.tsx:** Kullanıcı etkinliğin ne olduğunu anlattıktan sonra, siz 0.5cm marginli, sayfanın tamamını "dolu dolu" (kompakt gridler, matrisler, kolonlar ile) dolduran bir `WorksheetUI` tasarlayacaksınız.
- Tipografi olarak Lexend, bol miktarda flex/grid kullanımı zorunludur. Görsel ipuçları (visualHint) her soruda bulunmalıdır.

## Kural 3: Pedagojik ve Zorluk Ayarları (ConfigPanel)
- **ConfigPanel.tsx:** Her etkinliğin kendine has zorluk dereceleri (Kolay, Orta, Zor) olmalıdır.
- "Dark Glassmorphism" tasarımla, karanlık arka plana sahip, Tailwind CSS kullanarak şık bir konfigürasyon yan paneli çıkartmalısınız.

## İş Akışı (Step-by-Step Execution):
Kullanıcı yeni etkinlik talep ettiğinde şu adımları (soru sormadan) arka planda otomatik yapın:
1. Etkinlik adı belirleyin (Örn: `harf-dedektifi`).
2. `src/modules/activities/[AktiviteAdı]` dizinini oluşturun.
3. `types.ts` dosyasını oluşturarak kullanıcının tarif ettiği iş mantığına uygun veri şeması arayüzünü (interface) yazın.
4. `generators.ts` dosyasında, kullanıcının tarif ettiği etkinliği üretecek rastgele/offline mantığını (`generateFastMode`) ve Gemini AI mantığını (`generateDeepAIMode`) yazın. AI promptunda JSON output'u strict formata zorlayın.
5. Kullanıcıya bu etkinliğin ayarları için `ConfigPanel.tsx` i ve renderlanacağı A4 görünümü için `WorksheetUI.tsx`'i oluşturun.
6. `index.ts` üzerinden export edin.
7. Modülü başarıyla tamamladığınızı kullanıcıya bildirin.

(Bu workflow dosyasındaki kurallar, HER İDE ARACININ HER  CLI'nin doğrudan uygulayacağı kesin talimatlardır.)