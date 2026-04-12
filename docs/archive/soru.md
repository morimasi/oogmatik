# Soru Oluşturma Prompt ve Şema Yapısı

Bu belge, MEB müfredatına uygun matematik soruları oluşturmak için kullanılan yapay zeka (Gemini) istem (prompt) ve JSON şema (schema) yapısını içermektedir. Bu yapıyı kendi projelerinizde birebir kopyalayarak kullanabilirsiniz.

## 1. Ana İstem (Base Prompt)

Yapay zekaya verilen temel görev tanımıdır. Modelin bir öğretmen gibi davranmasını ve MEB standartlarına uymasını sağlar.

```text
Görevin, 2025 yılı itibarıyla yürürlükte olan Türkiye Millî Eğitim Bakanlığı Matematik dersi öğretim programına (müfredata) sadık kalarak, belirtilen sınıf, üniteler ve kazanımlara uygun, {soru_sayisi} adet soru üretmektir. Üreteceğin tüm sorular SADECE aşağıdaki kazanım(lar)ı hedeflemelidir.

Sınıf: {sinif}
Üniteler: {uniteler}
İlgili Kazanımlar:
- {kazanim_kodu}: {kazanim_metni}

Lütfen çıktı olarak sadece soruları içeren bir JSON nesnesi döndür. Her soru aşağıdaki genel kurallara uymalıdır:
1. Soru Kökü: Soru kökü öğrencinin günlük yaşamından bir durum içermeli; soyut, kuramsal ya da üst düzey terimlerden kaçınılmalıdır. Her soru özgün ve çeşitli olmalıdır.
2. Seviye Belirleme: Sorunun zorluk seviyesini ("seviye" alanı) belirtilen kazanım metnine ve MEB yeni nesil soru standartlarına göre ata:
   - Kazanımda "sayar, yazar, tanır" gibi ifadeler varsa seviye "temel" olmalıdır.
   - Kazanımda "ilişkilendirir, model oluşturur, tahmin eder" gibi ifadeler varsa seviye "orta" olmalıdır.
   - Kazanımda "çoklu adımlı problemler, strateji geliştirir, geneller" varsa veya soru karmaşık bir Yeni Nesil mantık sorusu ise seviye "ileri" olmalıdır.
3. Çözüm Anahtarı: "cozum_anahtari" alanı, bir öğretmenin konuyu kısaca açıklayabileceği 1-2 cümlelik net bir açıklama içermelidir.
4. Pedagojik Alanlar: "gercek_yasam_baglantisi": Bu kazanımın günlük yaşamdaki önemini veya kullanımını velilerin de anlayabileceği net, tek cümlelik bir açıklama ile belirt.
5. Dil ve Üslup: Türkçe imla ve noktalama kurallarına uyulmalıdır. Matematiksel semboller doğru kullanılmalıdır (örn: ½ yerine "1/2").
```

## 2. Dinamik Kurallar (İsteğe Bağlı Eklemeler)

Kullanıcının seçtiği ayarlara göre ana istemin sonuna aşağıdaki kurallar eklenir:

### A. Yeni Nesil / LGS Formatı (6. Sınıf ve Üzeri İçin)
```text
ÖZEL SINAV SİSTEMİ KURALI (YENİ NESİL / LGS TARZI):
Günümüz MEB sınav sisteminin (özellikle LGS ve örnek soruların) çıkmış sorularını inceleyerek, soruları "Yeni Nesil Soru" formatında hazırla. 
- Sorular okuduğunu anlama, mantıksal akıl yürütme, tablo/grafik yorumlama ve günlük hayat problemlerini çözme becerilerini ölçmelidir.
- Soru kökleri hikayeleştirilmiş, gerçek yaşam senaryolarına dayanan, analitik düşünmeyi gerektiren yapıda olmalıdır.
- Sadece işlem becerisi değil, aynı zamanda problem kurma ve modelleme becerisi de test edilmelidir.
```

### B. Görsel Veri ve Grafik Kuralı (Detaylı)
```text
ÖNEMLİ GÖRSEL VERİ KURALI (GRAFİK/ŞEKİL):
Eğer bir kazanım görsel bir veri gerektiriyorsa (Veri İşleme ünitelerindeki tablolar/grafikler veya Geometri ünitelerindeki şekiller gibi), soru metnini ("soru_metni" alanı) bu görseli içermeyecek şekilde sade tutmalısın. Bunun yerine, görselin verilerini JSON formatında "grafik_verisi" adlı ayrı bir alana eklemelisin. ASCII-tabanlı, metin formatında görseller KESİNLİKLE OLUŞTURMA.

"grafik_verisi" alanı aşağıdaki yapılardan birinde olmalıdır:

1. VERİ İŞLEME GRAFİKLERİ:
   - "tip": 'siklik_tablosu', 'nesne_grafiği', 'sutun_grafiği'.
   - "baslik": Grafik için kısa bir başlık.
   - "veri": Bir dizi (array) olmalıdır. Her eleman: {"etiket": "Elma", "deger": 8}.
   - "nesne": (Sadece 'nesne_grafiği' için) Veri elemanına eklenecek sembol. örn: "🍎".
   - "not": (İsteğe bağlı) Grafik altında gösterilecek not.

   Örnek Veri Grafiği JSON:
   {
     "tip": "sutun_grafiği", "baslik": "En Sevilen Meyveler",
     "veri": [ { "etiket": "Elma", "deger": 12 }, { "etiket": "Çilek", "deger": 18 } ]
   }

2. GEOMETRİ ŞEKİLLERİ VE KAVRAMLARI:
   - "tip": 'ucgen', 'dikdortgen', 'kare', 'besgen', 'altıgen', 'kup', 'dogru_parcasi', 'isin', 'dogru', 'paralel_dogrular', 'kesisen_dogrular', 'dik_kesisen_doğrular'.
   - "baslik": Şekil/kavram için bir başlık (örn: "ABC Üçgeni").
   - "veri": Bir dizi (array) olmalıdır. Her eleman şeklin bir özelliğini tanımlar.
     **ÖNEMLİ TUTARLILIK KURALI: "soru_metni" içinde bahsedilen harf/isimler (örn: AB doğru parçası) ile "grafik_verisi" içindeki etiketler (örn: "A Köşesi") BİREBİR AYNI OLMALIDIR.**
   - "not": (İsteğe bağlı) Şekille ilgili ek bilgi.

   Örnek Geometri JSON'ları:
   {
     "tip": "ucgen", "baslik": "ABC Dik Üçgeni",
     "veri": [
       { "etiket": "A Köşesi" }, { "etiket": "B Köşesi" }, { "etiket": "C Köşesi" },
       { "etiket": "AB Kenarı", "deger": 8, "birim": "cm" },
       { "etiket": "BC Kenarı", "deger": 6, "birim": "cm" },
       { "etiket": "B Açısı", "deger": 90, "birim": "°" }
     ],
     "not": "Şekildeki verilere göre AC kenarının uzunluğu nedir?"
   }
```

### C. İşlem Sayısı Kısıtlaması
```text
ÖNEMLİ PROBLEM TİPİ KURALI:
Üreteceğin her soru, ilgili kazanımın doğası elverdiği sürece, tam olarak {islem_sayisi} adet matematiksel işlem gerektirmelidir. Bu kural, özellikle problem çözme becerisini ölçen kazanımlar için geçerlidir. Çözüm adımları net ve mantıksal olmalıdır.
```

## 3. Soru Tiplerine Özel İstemler

### Çoktan Seçmeli
```text
**Soru Tipi: Çoktan Seçmeli**
- 1 doğru cevap ve 3 mantıklı yanlış seçenek (çeldirici) olmalıdır. Çeldiriciler öğrencilerin sık yaptığı hataları veya kavram yanılgılarını yansıtmalıdır.
- Doğru cevabın yeri şıklar arasında rastgele dağıtılmalıdır.
- "yanlis_secenek_tipleri": Her bir yanlış seçeneğin hangi bilişsel hatayı hedeflediğini bir dizi (array) içinde belirt.
```

### Boşluk Doldurma
```text
**Soru Tipi: Boşluk Doldurma**
- "soru_metni" içindeki boşluk '___' ile belirtilmelidir.
- "dogru_cevap" alanı, boşluğu dolduracak doğru kelimeyi veya sayıyı içermelidir.
```

### Doğru / Yanlış
```text
**Soru Tipi: Doğru/Yanlış**
- Her soru bir ifade olmalıdır.
- "dogru_cevap" alanı, ifadenin doğruluğunu belirtmek için "Doğru" veya "Yanlış" metnini içermelidir.
```

## 4. JSON Çıktı Şeması (Response Schema)

Yapay zekanın çıktısını her zaman aynı formatta ve parse edilebilir (ayrıştırılabilir) bir JSON olarak vermesini sağlayan şema yapısıdır.

```json
{
  "type": "OBJECT",
  "properties": {
    "questions": {
      "type": "ARRAY",
      "description": "Oluşturulan sınav sorusunun listesi.",
      "items": {
        "type": "OBJECT",
        "properties": {
          "sinif": { "type": "NUMBER", "description": "Sorunun ait olduğu sınıf seviyesi." },
          "unite_adi": { "type": "STRING", "description": "Sorunun ait olduğu ünitenin adı." },
          "kazanim_kodu": { "type": "STRING", "description": "Sorunun ilgili olduğu kazanım kodu." },
          "soru_tipi": { "type": "STRING", "description": "Sorunun tipi (örn: 'coktan_secmeli')." },
          "soru_metni": { "type": "STRING", "description": "Sorunun metni. Grafik veya tablo içermemelidir." },
          "secenekler": {
            "type": "OBJECT",
            "description": "Soru için A, B, C, D şıkları.",
            "properties": {
              "A": { "type": "STRING" },
              "B": { "type": "STRING" },
              "C": { "type": "STRING" },
              "D": { "type": "STRING" }
            },
            "required": ["A", "B", "C", "D"]
          },
          "dogru_cevap": { "type": "STRING", "description": "Doğru olan şık veya cevap." },
          "gercek_yasam_baglantisi": { "type": "STRING", "description": "Kazanımın günlük yaşamla bağlantısı." },
          "seviye": { "type": "STRING", "description": "Sorunun zorluk seviyesi (temel, orta, ileri)." },
          "cozum_anahtari": { "type": "STRING", "description": "Sorunun kısa çözümü veya açıklaması." },
          "grafik_verisi": {
            "type": "OBJECT",
            "description": "Soru bir grafik, tablo veya geometrik şekil gerektiriyorsa, bu alanda yapısal verileri barındırır.",
            "properties": {
              "tip": { "type": "STRING", "description": "Görsel türü: 'siklik_tablosu', 'nesne_grafiği', 'sutun_grafiği', 'ucgen' vb." },
              "baslik": { "type": "STRING", "description": "Görsel için bir başlık." },
              "veri": {
                "type": "ARRAY",
                "items": {
                  "type": "OBJECT",
                  "properties": {
                    "etiket": { "type": "STRING", "description": "Veri noktasının etiketi (örn: 'Elma', 'AB Kenarı')." },
                    "deger": { "type": "NUMBER", "description": "Sayısal değer (örn: 12, 90)." },
                    "nesne": { "type": "STRING", "description": "Nesne grafikleri için sembol (örn: '🍎')." },
                    "birim": { "type": "STRING", "description": "Geometrik veriler için birim (örn: 'cm', '°')." },
                    "x": { "type": "NUMBER", "description": "Etiketin x-koordinatı (sürükle-bırak için)." },
                    "y": { "type": "NUMBER", "description": "Etiketin y-koordinatı (sürükle-bırak için)." }
                  },
                  "required": ["etiket"]
                }
              },
              "not": { "type": "STRING", "description": "Grafik altında gösterilecek ek not." },
              "x": { "type": "NUMBER", "description": "Şeklin x-koordinatı (sürükle-bırak için)." },
              "y": { "type": "NUMBER", "description": "Şeklin y-koordinatı (sürükle-bırak için)." }
            },
            "required": ["tip", "baslik", "veri"]
          }
        },
        "required": [
          "sinif", "unite_adi", "kazanim_kodu", "soru_tipi", 
          "soru_metni", "dogru_cevap", "gercek_yasam_baglantisi", 
          "seviye", "cozum_anahtari"
        ]
      }
    }
  },
  "required": ["questions"]
}
```

## 5. Grafik Verilerinin İşlenmesi ve Konumlandırılması

Yapay zekanın ürettiği `grafik_verisi` JSON objesi, uygulamada (Frontend tarafında) doğrudan metin olarak gösterilmez; dinamik bileşenlere (SVG, HTML Tablo, Grafik) dönüştürülür.

### Konumlandırma Mantığı
Kullanıcı arayüzünde (UI) grafikler genellikle şu sırayla ekrana basılır:
1. **Soru Metni:** Önce `soru_metni` alanı render edilir.
2. **Grafik / Şekil:** Eğer soruda `grafik_verisi` objesi varsa, soru metninin hemen altında (ve seçeneklerden önce) ilgili görsel bileşen çizdirilir.
3. **Ek Not:** Grafiğin altında, varsa `grafik_verisi.not` alanı gösterilir.
4. **Seçenekler:** En altta `secenekler` (A, B, C, D) listelenir.

### İşlenme (Rendering) Süreci
Uygulama, gelen veriyi `grafik_verisi.tip` alanına göre ayrıştırır:
- **Tablolar (`siklik_tablosu`):** HTML `<table>` etiketleri kullanılarak `veri` dizisindeki etiket ve değerler satır/sütun olarak basılır.
- **Grafikler (`sutun_grafiği`, `nesne_grafiği`):** CSS (Flexbox/Grid) veya SVG kullanılarak dinamik sütunlar oluşturulur. `deger` alanı sütun yüksekliğini, `nesne` alanı ise tekrarlanacak emojiyi/ikonu belirler.
- **Geometri Şekilleri (`ucgen`, `kare`, `paralel_dogrular` vb.):** Uygulama içinde önceden tanımlanmış SVG şablonları çağrılır. `veri` dizisindeki kenar uzunlukları, açılar ve köşe isimleri (`etiket`, `deger`, `birim`) bu SVG şablonlarının üzerine dinamik metin (`<text>`) olarak yerleştirilir.

### Etkileşim ve Düzenlenebilirlik
JSON şemasında yer alan `x` ve `y` özellikleri, uygulamanın arayüzünde öğretmenin/kullanıcının şekilleri veya etiketleri **sürükle-bırak (drag-and-drop)** yöntemiyle serbestçe taşıyabilmesine olanak tanır. Böylece yapay zekanın ürettiği varsayılan konumlar, son kullanıcı tarafından manuel olarak ince ayardan geçirilebilir.

## 6. Örnek API Kullanımı (TypeScript / Node.js)

```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function sorulariOlustur(promptMetni, jsonSemasi) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: promptMetni,
    config: {
      responseMimeType: "application/json",
      responseSchema: jsonSemasi,
    },
  });

  const sorular = JSON.parse(response.text);
  return sorular;
}
```
