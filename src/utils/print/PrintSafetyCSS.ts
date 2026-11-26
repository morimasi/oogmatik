/**
 * bdmind Print Engine — Baskı Güvenlik CSS'i
 *
 * Akıllı mizanpaj sayfaları zaten kağıda sığdırır. Bu katman, tarayıcının
 * sonradan yapacağı istenmeyen kırılmaları engeller:
 *  - Başlık/etiket ile içeriğinin ayrılmaması (orphan heading)
 *  - Paragraf sonunda tek satır kalması (widow/orphan)
 *  - Kart, soru, tablo satırı ve SVG'nin ortadan bölünmemesi
 *  - Devam rozetinin doğru basılması
 */
export const PRINT_SAFETY_CSS = `
  /* === Akıllı Mizanpaj Güvenlik Katmanı === */
  @media print {
    p, li, blockquote {
      orphans: 3 !important;
      widows: 3 !important;
    }

    h1, h2, h3, h4, h5, h6 {
      break-after: avoid-page !important;
      page-break-after: avoid !important;
      break-inside: avoid !important;
    }

    li, tr, td, th, figure, figcaption {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    svg, img, canvas, video {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      max-height: 100% !important;
    }

    /* Kart / soru / etkinlik birimleri asla ortadan kesilmez */
    .activity-card,
    .question-container,
    .problem-card,
    .operation-card,
    .logic-card,
    .worksheet-item,
    .math-division-card,
    .block-table-container,
    .block-grid-container,
    .block-match,
    .block-categorical,
    .block-logic-card,
    [data-keep-together="true"] {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* Akıllı mizanpajın ürettiği sayfa parçaları */
    #print-overlay .bdmind-print-wrapper {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
      break-after: page !important;
      page-break-after: always !important;
    }

    #print-overlay .bdmind-print-wrapper:last-child {
      break-after: auto !important;
      page-break-after: avoid !important;
    }

    #print-overlay .bdmind-continuation-chip {
      display: block !important;
      visibility: visible !important;
      color: #64748b !important;
      print-color-adjust: exact !important;
      -webkit-print-color-adjust: exact !important;
    }

    /* === Boşluk Kompaktlaştırma ===
       Ekran için tasarlanmış büyük boşluklar A4'te "devasa boşluk" olarak
       basılıyordu. Baskıda dikey ritim 3–4 mm'ye çekilir, son elemanın alt
       marjı sıfırlanır (fazladan boş sayfa önlemi). */
    .worksheet-page,
    .a4-page,
    .print-page {
      row-gap: 3mm !important;
    }

    .worksheet-page > *:last-child,
    .a4-page > *:last-child,
    .print-page > *:last-child,
    .bdmind-print-wrapper > *:last-child {
      margin-bottom: 0 !important;
    }

    .gap-10, .gap-12, .gap-16, .gap-20, .gap-24,
    .gap-y-10, .gap-y-12, .gap-y-16, .gap-y-20 {
      gap: 4mm !important;
    }

    .space-y-10 > :not([hidden]) ~ :not([hidden]),
    .space-y-12 > :not([hidden]) ~ :not([hidden]),
    .space-y-16 > :not([hidden]) ~ :not([hidden]) {
      margin-top: 3mm !important;
    }

    /* İçi boş sarmalayıcılar sayfa kırılması üretmesin */
    #print-overlay .bdmind-print-wrapper:empty {
      display: none !important;
    }

    /* Yazdırma sırasında gizlenen yardımcı katmanlar */
    #bdmind-export-stage {
      display: none !important;
    }
  }
`;
