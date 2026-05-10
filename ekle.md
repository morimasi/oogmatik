# Oogmatik Otonom Faz 4 (Generative Engine) Eksikler ve Eklenecekler Listesi

`otonom.md` vizyonu doğrultusunda sistemin tam otonom üretim yapabilmesi (Self-Coding Modeli) için şu an projemizde eksik olan ve acilen inşa edilmesi/eklenmesi gereken 6 kritik modül aşağıdaki gibidir. Ajanların eğitimi ve gelecekteki geliştirmelerde bu liste kılavuz alınacaktır:

## 1. Sanal Dosya Sistemi (VFS - Virtual File System) ve Rollback Mekanizması
* **Durum:** Eksik.
* **Ne Gerekiyor:** Yapay zeka kodu yazarken diske (Vite'ın izlediği klasöre) anında yazmamalıdır. `memfs` veya benzeri bir in-memory sanal dosya sistemi kurularak kodlar önce belleğe yazılmalıdır. Kod çalışırsa fiziksel diske pushlanmalı, hata verirse "rollback" ile işlem iptal edilmelidir.

## 2. Sentaktik AST Doğrulayıcı (SyntaxValidator.ts)
* **Durum:** Eksik.
* **Ne Gerekiyor:** AI'ın ürettiği kodun geçerli bir TypeScript/React bileşeni olduğunu doğrulamak için `ts-morph` veya `@babel/parser` kütüphanesi sisteme entegre edilmelidir.
* **Görevi:** Kapanmamış parantezler, kayıp importlar veya hatalı JSX syntax'ını Vite sunucusunu çöktürmeden (*compile-time*) yakalamak.

## 3. Otonom Hata Düzeltme Döngüsü (Auto-Healing Loop)
* **Durum:** Tasarım var, kod eksik.
* **Ne Gerekiyor:** `geminiClient.ts` içerisine `tryGenerateWithCorrection` fonksiyonu eklenmelidir. Bu fonksiyon AST'den dönen parse hatasını veya `tsc` derleyici hatasını string olarak alıp Gemini'ye *"Şu hatayı yaptın: [Hata Kodu]. Bunu fixle ve Component'i tekrar ver"* diyecek bir retry mekanizmasına sahip olmalıdır.

## 4. Dinamik Import / Hot-Reload Entegre Edici (Component Lazy Loader)
* **Durum:** Kısmen var ancak otonom değil.
* **Ne Gerekiyor:** Yeni bir etkinlik üretildiğinde `App.tsx` ve `registry.ts`'in Vite sunucusunu yeniden başlatmaya gerek duymadan (Hot Module Replacement) yeni bileşeni dinamik (lazy) olarak yükleyebileceği bir Dynamic Registry Factory kurulmalıdır.

## 5. UI Guardrails (Stil Korumaları & Lexend Zorunluluğu) Regex Setleri
* **Durum:** Eksik.
* **Ne Gerekiyor:** AI'ın kendi başına farklı fontlar (Roboto, Arial vb.) seçmesini engelleyecek, renk paletini Oogmatik'in Dark Glassmorphism spektrumu dışına çıkarmayacak bir Regex/Linter duvarı (Post-Process Hook) yazılmalıdır.

## 6. AIGeneratorPlugin Sınıfının Kendisi
* **Durum:** Sadece şartnamesi (`otonom.md`) yazıldı, kod dosyası yok.
* **Ne Gerekiyor:** `src/tools/scaffold/plugins/AIGeneratorPlugin.ts` dosyasının fiziksel olarak tasarlanıp, Scaffold motoruna dışarıdan enjekte edilebilir bir modül olarak export edilmesi gerekmektedir.

> **Ajanlara Not:** Yukarıdaki eksik listesi tamamlandığında Oogmatik, "Kullanıcının metin komutundan gerçek zamanlı çalışan, Typescript testlerinden hatasız geçen, izole ve yayına hazır bir React aktivite bileşenini" saniyeler içinde yazacak bir otonom motora dönüşecektir.
