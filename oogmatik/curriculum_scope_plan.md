# OOGMATIK "PREMIUM STUDIO" MÜFREDAT VE KAPSAM ONTOLOJİSİ

## 1. Vizyon: Neden Standart Bir Müfredat Seçimi Yetersiz?

Yapay zekaya sadece "3. Sınıf Türkçe eş anlamlı kelimeler" komutunu vermek, içerik kalitesini şansa bırakmaktır. "Premium Studio" mimarisinde, müfredat bir "Metin" değil, bir **"Ontoloji (Bilgi Uzayı)"** olarak ele alınır.

Her bir materyal üretimi; MEB kazanımları, bilişsel taksonomi (Bloom) ve nöro-çeşitlilik (Disleksi/DEHB) kısıtlarının kesişim kümesinde **matematiksel bir kesinlikle** hesaplanarak oluşturulur.

---

## 2. Müfredat Motoru Mimarisi (Curriculum Engine)

Kullanıcı arayüzünde seçilen sınıf, ünite ve konu bilgileri, doğrudan AI'a gönderilmez. Arka planda bir **"Pedagojik Prompt Zenginleştirici (Scaffold Builder)"** modülünden geçer.

### A. MEB Kazanım Ontolojisi (Ontological Mapping)

Sistem, sadece konu başlığını değil, konunun alt bilişsel hedeflerini (Sub-skills) haritalandırır.

- **Kullanıcının Seçtiği:** 4. Sınıf -> Türkçe -> Okuma Anlama
- **Sistemin AI'a Gönderdiği Bağlam (Context):**
  - _Kazanım:_ T.4.3.18. Okuduğu metindeki gerçek ve kurgusal ögeleri ayırt eder.
  - _Kelime Dağarcığı:_ 4. Sınıf MEB Tier-2 kelime havuzu.
  - _Bağlam:_ Günlük yaşam becerileri veya somut doğa olayları (Soyut, felsefi konulardan kaçın).

### B. Bilişsel Taksonomi Seviyeleri (Bloom's Taxonomy)

Öğretmen, modül ayarlarında zorluk derecesini seçtiğinde, sistem bunu Bloom Taksonomisine çevirir:

- **Basit (Remember/Understand):** "Metinde ne oldu?", "Eşleştir" (Doğrudan bilgi geri çağırma).
- **Orta (Apply/Analyze):** "Neden oldu?", "Sırala", "Farkı bul" (İlişki kurma).
- **Zor (Evaluate/Create):** "Sence ne yapmalıydı?", "Eksik adımı tamamla" (Üstbilişsel çıkarım).

### C. Klinik ve Pedagojik Kısıtlar (Neuro-Constraints)

Disleksi, Diskalkuli ve DEHB profillerine göre müfredat esnetilir:

- **Sözdizimsel Kısıt:** Cümleler etken çatıda (Active voice) olmalı. Edilgen (Passive) yapı kullanılamaz.
- **Görsel-Kavramsal Kısıt:** "B-D", "P-B", "M-N" harfleri aynı kelime veya cümle içinde yakın konumlandırılmaz (Fonolojik çeldirici yasağı).
- **Uzamsal Kısıt:** Sorular arası geçişlerde "önceki/sonraki" gibi soyut zaman/yön zarfları yerine somut adım numaraları kullanılır.

---

## 3. Dinamik AI Enjeksiyonu (System Prompting)

Müfredat ve kapsam bilgisi, AI modeline (Gemini) dinamik bir JSON-Schema ve "Sistem Yönergesi (System Prompt)" olarak enjekte edilir. AI artık genel bir asistan değil, **"Sınırlandırılmış Pedagojik Bir Mimardır"**.

### Örnek Sistem Enjeksiyon Mimarisi (AI'ın Beyni):

1.  **Rol (Persona):** "Sen Türkiye Cumhuriyeti MEB müfredatına tam hakim, Orton-Gillingham ilkelerini uygulayan Kıdemli bir Özel Eğitim Materyal Uzmanısın."
2.  **Kapsam Sınırı (Boundary):** "Seçilen Sınıf: 3. Ünite: Kesirler. ASLA 4. sınıf seviyesinde bir kelime, işlem veya kavram kullanma."
3.  **Format Sınırı (Component Constraint):** "Kullanıcı senden sadece [Yönlendirmeli Boşluk Doldurma] ve [Görsel Çoktan Seçmeli] modüllerini talep etti. Kendi inisiyatifinle okuma metni veya açık uçlu soru EKLEME."
4.  **Güvenlik (Safety/Validation):** "Ürettiğin içerikte olumsuz emir kipi ('yapmamalıdır') varsa, onu olumluya çevirmeden çıktıyı teslim etme."

---

## 4. Hayata Geçirme Adımları (Roadmap)

1.  **Kazanım Veritabanı (DB):** MEB 1-8. Sınıf Temel Ders (Türkçe, Matematik, Hayat Bilgisi, Fen) kazanımlarının JSON formatında bir veri tabanına (Firestore veya lokal JSON) çıkarılması.
2.  **Kapsam Filtresi (Scope Middleware):** İstek Gemini'ye gitmeden önce kullanıcının profilini, seçilen üniteyi ve zorluğu alıp, yukarıdaki kurallara göre devasa, spesifik bir "Bağlam Metni (Context String)" oluşturan bir Middleware yazılması.
3.  **Model Ayarlaması:** `api/generate.ts` içindeki `SYSTEM_INSTRUCTION` sabitlerinin bu yeni, ultra-premium "Kısıtlayıcı Mimar" rolüne göre güncellenmesi.

**Sonuç:** Bu derinlemesine müfredat kontrolü sayesinde, üretilen hiçbir materyal rastgele olmayacak; öğretmenin ders planındaki spesifik bir kazanıma tam olarak hitap edecektir.
