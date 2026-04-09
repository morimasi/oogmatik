# Modüler Refactor Plan — SheetRenderer ve Orientation

## Notlar

Bu yol, mevcut kullanıcı akışını bozmayacak şekilde kademeli bir yaklaşım sunar.
Orientation hesaplamaları merkezi bir yerde tutulduğundan yeni modüller için adımlar daha hızlı uygulanabilir.

## Gelecek Adımlar (Güncel Plan)

Adım 5: OCR_CONTENT Modülü

- Amaç: OCR içerik rendering’ini bağımsız bir OcrRenderer.tsx bileşenine taşımak, orientationWrapper ile uyumlu çalışmasını sağlamak.
- Yapılacaklar:
  - OCR_CONTENT için yeni modul dosyası: src/components/sheet-renderers/OcrRenderer.tsx oluştur.
  - SheetRenderer.tsx içinde OCR_CONTENT durumunu OcrRenderer’a yönlendirmek.
  - Orientation hesaplamalarını merkezi yapan useOrientationDimensions hook’unu kullanacak şekilde OcrRenderer’ı uyarlamak.
  - Basit Vitest testi eklemek (orientation ile OCR görüntüsünün doğru boyutlandığını doğrulamak).

Adım 6: ExamRenderer (SINAVlar)

- Amaç: SINAV ve MAT_SINAV çıktılarının ortak bir render’e taşınmasıyla kod tekrarı azaltmak.
- Yapılacaklar:
  - src/components/sheet-renderers/ExamRenderer.tsx dosyasını oluştur.
  - SheetRenderer’da ilgili ActivityType bloklarını ExamRenderer’a devretmek.
  - Orientation wrapper ile uyumluluğu korumak için InfoGraphicWrapper ile benzer yaklaşımı kullanmak.
  - Test planına orientation odaklı testler eklemek.

Adım 7: Genel mimari temizliği

- Amaç: SheetRenderer’i daha temiz ve modüler bir orchestrator haline getirmek.
- Yapılacaklar:
  - src/components/sheet-renderers/index.ts oluşturup tüm renderleri dışa aktarım olarak toplamak.
  - SheetRenderer’da renderers map yaklaşımı ile switch’i sadeleştirmek.
  - Gerekirse alt modüller için klasör yapısını ayırmak.

Adım 8: Test kapsamını genişletme

- Amaç: Orientation değişikliklerini güvenli şekilde kapsamak.
- Yapılacaklar:
  - OCR, Infographics, Exam akışlarını test etmek için orientation.test.ts’i genişletmek.
  - Görsel regresyon testlerini opsiyonel olarak eklemek.

Adım 9: PR ve rollout planı

- Amaç: Küçük PR’lar ile adım adım ilerlemek.
- Yapılacaklar:
  - Her adım için bağımsız PR oluşturma ve kod incelemesi süreçlerini belirlemek.
  - CI/QA kontrollerini eksiksiz geçirmek.

## Kabul Kriterleri

- OCR_CONTENT ve SINAV/MAT_SINAV için modüler render’lar tamamlanmalı, orientation wrapper çalışmalı.
- SheetRenderer modülerleştirme ile yeni renderers basitçe eklenebilir olmalı.
- Orientation testleri geçmeli.
- Build sorunsuz çalışmalı ve performans etkisi minimuma indirilmeli.
