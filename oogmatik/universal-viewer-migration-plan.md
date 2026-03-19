# Evrensel Görüntüleyici (UniversalWorksheetViewer) Geçiş Planı ve Derin Analizi

Uygulamadaki tüm "Sol Panel Ayarlar / Sağ Panel Çalışma Kağıdı Önizleme" modüllerinin (örneğin Harf Dedektifi, Farkı Bul, Matematik vb.) yeni ürettiğimiz **`UniversalWorksheetViewer`** legosu ile değiştirilmesine dair kapsamlı mühendislik ve fizibilite analizi.

---

## 1. 🎯 Vizyon ve Hedef

Yeni `UniversalWorksheetViewer` legosu; yükleme animasyonlarına (skeleton), boş durum (empty state) yönetimine ve çökme korumasına (error boundary) sahip, **%100 izole edilmiş, endüstri standartlarında bir çerçevedir.**

Eğer tüm uygulamayı bu yapıya geçirirsek, öğretmenler uygulamanın neresine girerlerse girsinler (İster Türkçe, ister Disleksi Görsel Tarama, ister Harita Dedektifi) karşılarında **birebir aynı kalitede, aynı hızda ve aynı premium hissiyatta** bir arayüz bulacaklardır.

## 2. 🕵️ Derin Analiz: Kar/Zarar ve Risk Muhakemesi

Bu işlemi yapmanın devasa avantajları olduğu gibi, göğüslememiz gereken çok ciddi teknik maliyetleri (riskleri) de vardır:

### ✅ Avantajlar (Neden Yapmalıyız?)

1. **WYSIWYG (Ne Görüyorsan Onu Yazdırırsın):** Eski sistemlerde (HTML/DOM tabanlı önizlemelerde) ekranda görünen tasarım ile `window.print()` veya PDF indirme işlemi sonrasında kağıda basılan tasarım arasında milimetrik kaymalar, font kırılmaları veya sayfa taşmaları yaşanır. Yeni legomuz `@react-pdf/renderer` kullandığı için ekrandaki PDF iframe'i kağıttan çıkacak olanla **%100 aynıdır.** Sıfır kayma garantisi verir.
2. **Merkezi Hata Yönetimi:** Eski sistemde sağ paneldeki bir kod hatası tüm modülü çökertirken, yeni legomuz sayesinde sadece sağ kutu içinde "Hata oluştu" uyarısı verir, kullanıcı sol panelden ayarları değiştirip uygulamayı kurtarabilir.
3. **Kod Tekrarından (Spagetti Kod) Kurtuluş:** Her modül için sağ paneli, üst barı, indirme butonunu baştan tasarlamak yerine sadece tek bir `<UniversalWorksheetViewer />` etiketi ile tüm sistemi ayağa kaldırırız. Bu da geliştirme süresini haftalardan günlere düşürür.

### ⚠️ Zorluklar ve Teknik Riskler (Nelerle Karşılaşacağız?)

1. **Devasa Yeniden Yazım (Rewrite) Maliyeti:** `@react-pdf/renderer` kütüphanesi standart HTML (div, span) veya TailwindCSS (flex, grid) yapısını desteklemez. Kendi özel bileşenlerini (`<View>`, `<Text>`, `<Svg>`) ve kendi StyleSheet altyapısını kullanır. Dolayısıyla `Harf Dedektifi` gibi halihazırda HTML ile çizilmiş tüm etkinlikler, PDF diline tercüme edilip baştan kodlanmak zorundadır.
2. **Performans Darboğazı (Re-render Sorunu):** Öğretmen sol panelden "Soru Sayısı" kaydırıcısını (range slider) kaydırdığında, state saniyede 10 kez güncellenebilir. Normal HTML bunu anında çizerken, PDF motoru her seferinde baştan PDF oluşturmaya çalışırsa uygulama donabilir. Bu nedenle ayar değişikliklerinde **Debounce (Geciktirme)** mantığı uygulamamız gerekecektir.
3. **Etkileşim Kaybı:** PDF önizleme ekranı düz bir resim gibidir. Eski sistemde sağ panelde sürükle-bırak yapılabiliyor veya elemanlar tıklanabiliyorsa, PDF önizleme motoruna geçildiğinde panel tamamen "salt okunur" (read-only) matbaa çıktısına dönüşür. (Zaten çalışma kağıdı üretme amacı güttüğümüz için bu kabul edilebilir bir kayıptır.)

---

## 3. 🧩 Case Study (Vaka Analizi): Harf Dedektifi (Visual Search) Senaryosu

Harf Dedektifi modülünü bu yapıya nasıl geçireceğimizi adım adım düşünelim:

**Mevcut Durum:**
`VisualSearchTest.tsx` adında HTML/CSS ile çizilen, içinde ızgaralar (grid) bulunan bir React DOM bileşeni.

**Gelecek Durum (Universal Entegrasyon):**

1. Sol panelden (Cockpit) öğretmen şu ayarları yapar: _Hedef Harf: B, Çeldiriciler: D, P, Izgara: 10x10._
2. Bu veriler Zustand Store'a (`useVisualStore`) kaydedilir.
3. **Yeni Bileşen:** `HarfDedektifiPdf.tsx` adında sadece `@react-pdf` etiketleri (`<View>`, `<Text>`, `<Svg>`) barındıran yepyeni bir dizgi bileşeni oluşturulur. Bu bileşen verileri Zustand'dan çeker.
4. **Bağlantı:** Ana modül sayfasında şu çağrı yapılır:
   ```tsx
   <UniversalWorksheetViewer
     isReady={store.hedefHarf !== null}
     DocumentComponent={HarfDedektifiPdf}
     emptyStateTitle="Harf Dedektifi Üretimi"
     emptyStateDescription="Sol panelden hedef harf ve ızgara boyutunu seçiniz."
     isLoading={store.isGenerating}
   />
   ```
5. **Sonuç:** Öğretmen ayarı değiştirdiği an, sağ paneldeki PDF motoru şık bir şekilde güncellenir ve A4 çıktı anında hazır olur.

---

## 4. 🚀 Uygulama Planı ve Fazlar (Migration Roadmap)

Bu geçişi tüm sistemi bozmadan, güvenli bir şekilde yapmak için aşağıdaki 4 fazlı plan uygulanmalıdır:

### Faz 1: "UniversalViewer" Yeteneklerinin Artırılması (Altyapı)

- Yeni legonun içerisine sadece `@react-pdf` değil, geçiş sürecinde eski HTML bileşenlerini de gösterebilmesi için `mode="pdf" | "dom"` adında bir prop eklenir. (Hibrit yapı).
- "Debounce" hook'u entegre edilerek slider veya metin değişikliklerinde PDF'in anında kasılmasını engelleyecek performans katmanı yazılır.

### Faz 2: Öncü (Pilot) Modül Dönüşümü

- Tüm modüller aynı anda değiştirilmez. Uygulamadaki en izole ve basit modüllerden biri seçilir (Örn: **Harf Dedektifi** veya **Dikkat ve Hafıza Kağıtları**).
- Bu modülün HTML kodu, PDF koduna (View, Text) çevrilir ve `<UniversalWorksheetViewer>` ile yayına alınır. Performans ve kullanım testleri yapılır.

### Faz 3: Seri Dönüşüm (Mass Rewrite)

- Pilot modül onaylandıktan sonra, Gelişmiş Öğrenci, Görsel Tarama, Kelime Oyunları gibi diğer alt modüller tek tek PDF dizgi bileşenlerine dönüştürülerek yeni lego sistemine aktarılır.
- Bu faz en çok efor ve kodlama gerektiren (amelelik) fazdır. Her HTML bloğunun `@react-pdf` stiline tercüme edilmesi gerekir.

### Faz 4: Eski Altyapının Temizlenmesi (Deprecation)

- Tüm uygulama UniversalViewer altyapısına geçtiğinde, projede yer alan eski, kararsız, her dosyada tekrar eden `div` yığınları ve manuel `window.print()` fonksiyonları silinerek codebase hafifletilir.

---

## 🎯 Sonuç ve Karar

**"Bunu uygulamalı mıyız?"**
Kesinlikle **EVET**. Uygulamanın uzun vadede bakımı, ölçeklenebilirliği ve matbaa kalitesi için bu dönüşüm şarttır.

**"Çok uğraşmak zorunda kalır mıyız?"**
**EVET**. Özellikle mevcut HTML önizlemelerinin PDF diline çevrilmesi (Faz 3) ciddi bir mühendislik mesaisi gerektirecektir.

Ancak bu maliyet, gelecekte her yeni eklenen etkinlikte size haftalarca zaman kazandıracak muazzam bir yatırım (ROI) olacaktır. Sistemi "stabil ve premium" yapmanın tek yolu her yeri standartlaştırmaktır.

Eğer kabul ederseniz, **Faz 1 ve Faz 2 (Harf Dedektifi Pilot Dönüşümü)** kodlamasına başlayabilirim.

# Last Updated: 2026-03-16
