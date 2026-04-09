Profil Ayarları Modülü — İnceleme ve Geliştirme Planı

Amaç

- Profil ayarları modülünde mevcut veriler doğru şekilde öğrenci görünümüne yansıtılmıyor. Öğrencilerin profille ilgili ayarları doğru şekilde görünür ve yönetilebilir olmalı. Ayrıca ayarlardaki tüm özelleştirilebilir seçenekler için (örn. tema, bildirim tercihi, dil tercihleri vb.) uygun fonksiyonlar veyapremium seviyede gerçek işlevler sağlanmalıdır.

Mevcut Durum (taslak)

- Profil ayarları modülünde bazı işlevler mevcut olsa da, gerçek veriyi sağlamıyor veya öğrenci profilinde görünmüyor.
- Öğrenciler için ilgili ıslev(ler) profil ayarlarında görüntülenemiyor.
- Özelleştirilebilir ayarların bazıları fonksiyon içermiyor; bu nedenle premium seviyede gerçek işlevlerle desteklenmesi gerekiyor.

Hedefler

- Tüm ajanları aktifleştir: Profil modülünün derli toplu incelemesini sağlamak ve gerekli düzeltmeleri koordine etmek.
- Profil Ayarları modülünü derinle incelemek; kullanıcı senaryolarında doğru veriyi gösterdiğini doğrulamak.
- Ayarlardaki tüm özelleştirilebilir ayarların işlevselliğini kontrol etmek. İşlevsüz olanların yerine premium seviyede gerçek işlevler uygulamak (mock/gerçek arayüz ayrımı ile).
- Geliştirme planını oluşturarak profile.md olarak kaydetmek ve ardından pushlamak.

Yaklaşım

- Adım 1: Mevcut kod tabanını tarayıp profil ayarları modulünün dosya ve bileşenlerini tespit etmek.
- Adım 2: Öğrenci profilini etkileyen işlevleri (student profile view) ve ayarları (settings panel) incelemek; eksik/yanıltıcı veriyi belirlemek.
- Adım 3: Özelleştirilebilir ayarlardaki eksik işlevler için premium seviyede gerçek işlevler tasarlamak (ya gerçek API uç noktasıyla çalışabilir bir stub, ya da simule eden mock).
- Adım 4: Tekrar eden hataları ve test kapsamını artırmak için test taslakları yazmak.
- Adım 5: Dokümantasyon olarak profile.md'ye notları ve kararları eklemek, değişiklikleri git ile sürümlemek.
- Adım 6: Değişiklikleri commit etmek ve remote'a push etmek.

Kabul Kriterleri

- Profil ayarları modülü, öğrenci profilinde doğru veriyi gösterir (UI ve data model uyumu).
- Ayarlardaki tüm özelleştirilebilir seçeneklerin işlevleri ya mevcut ya premium seviyede gerçek işlevlerle sağlanır.
- APT testleri (Vitest) eklenir ve geçer.
- Değişiklikler profile.md dosyasında belgelenir ve push edilir.

Geliştirme Planı (Kısa Yol Haritası)

- 1. Keşif: Profil ayarları ile ilgili dosyalar, bileşenler ve data akışını belirlemek.
- 2. Sorunları Belirleme: Hangi ıslevler eksik veya yanlış veriyi gösteriyor? Öğrenci profilinde hangi ayarların görünmediğini tespit etmek.
- 3. Premium Fonksiyonlar: Eksik olan işlevler için premium türevler tasarlamak; api/mock farkları belgelenecek.
- 4. Testler: Yeni/akışlar için vitest testleri eklemek.
- 5. Dokümantasyon ve Kayıt: profile.md'ye planı ve kararları yazmak.
- 6. Entegrasyon ve Push: Değişiklikleri commit etmek ve push etmek.

Notlar

- Bu çalışma üzerinde gerçek veriyi almak için ilgili API uç noktalarının veya mock verilerin entegrasyonu gerekecektir. Premium işlevler için mock/stub yaklaşımı ile başlanabilir.
- PedagogicalNote ve KVKK uyumu gibi Oogmatik kılavuzlarına uymaya devam edilecektir.
